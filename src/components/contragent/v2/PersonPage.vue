<template>
  <div>
    <ProgressSpinner v-if="loading" class="progress-spinner" strokeWidth="5"/>
    
    <Menubar :model="items" class="m-0 pt-0 pb-0"></Menubar>
    
    <BlockUI class="card p-fluid" :blocked="loading">
      <TabView>
        <TabPanel header="Личные данные">
          <UserPersonalInfomation @personal-information-updated="handlePersonalInformationUpdate" :model-value="per" :userID="per.userID" :readonly="pageReadonly"/>
        </TabPanel>
        <TabPanel header="Удостоверение личности">
          <UserIDCard @personal-information-updated="handlePersonalInformationUpdate" :model-value="per" :userID="per.userID" :readonly="pageReadonly"/>
        </TabPanel>
        <TabPanel header="Образование">
          <UserEducationView  :model-value="per" :userID="per.userID" :readonly="pageReadonly"/>
        </TabPanel>
        <TabPanel header="Банковские реквизиты">
          <UserRequisite @personal-information-updated="handlePersonalInformationUpdate" :model-value="per" :userID="per.userID" :readonly="pageReadonly"/>
        </TabPanel>
      </TabView>
    </BlockUI>
  </div>
</template>

<script>
import { findRole } from "@/config/config";
import Enum from "@/enum/roleControls/index";

import { ContragentService } from "@/service/contragent.service";
import UserPersonalInfomation from '@/components/user/UserPersonalInfomation'
import UserIDCard from '@/components/user/UserIDCard'
import UserEducationEdit from '@/components/user/UserEducationEdit'
import UserEducationView from '@/components/user/UserEducationView'
import UserRequisite from '@/components/user/UserRequisite'
import {UserService} from "@/service/user.service"


export default {
  name: 'PersonPage',
  components: {UserPersonalInfomation, UserIDCard, UserEducationView, UserRequisite },
  props: {
    person: null,
    userID: null,
    readonly: {
      type: Boolean,
      default: false
    }
  },
  emits: ['personUpdated',],
  data() {
    return {
      service: new ContragentService(),
      loginedUser: null,
      findRole: findRole,
      enum: Enum,

      loading: false,
      changed: true,
      pageReadonly: false,

      per: JSON.parse(JSON.stringify(this.person)) || null,
      validation: {
        iin: false,
        firstname: false,
        firstnameEn: false,
        lastname: false, 
        lastnameEn: false, 
        birthday: false,
        email: false,
        idnumber: false,
        iddate: false,
        idcardgivenorg: false,
        bankaccount: false,
        bank_id: false,
      },

      items: [
        {
          label: this.$t("common.save"),
          icon: "pi pi-fw pi-save",
          disabled: () => !this.changed,
          command: () => { this.save() },
        }
      ],
      user: {},
      userService: new UserService(),
      file: null
    }
  },
  created() {
    this.loginedUser = JSON.parse(localStorage.getItem("loginedUser"));
  },
  mounted() {
    this.getUserAccount()
    this.pageReadonly = true;

    if (!this.readonly && (this.findRole(this.loginedUser, this.enum.roles.MainAdministrator) || this.loginedUser.userID === this.per.userID)) {
        this.pageReadonly = false;
    } else {
      this.changed = false
    }

    this.emitter.on('idcardpath', (data) => {
      if (data !== true) {
        this.file = data
        this.changed = true;
      } 
    });

  },
  methods: {
    showMessage(msgtype, message, content) {
      this.$toast.add({
        severity: msgtype,
        summary: message,
        detail: content,
        life: 3000
      });
    },
    save() {
      if (this.validate()) {
        this.showMessage("error", this.$t('common.message.fillError'));
        return
      }

      this.loading = true;

      const fd = new FormData();
      fd.append("id", JSON.stringify(this.per))
      if (this.file !== null) {
        fd.append("idImage", this.file);
      }


      this.userService.updateUserAccountHandler(fd).then(res => {
        this.file = null
        this.$emit('personUpdated', this.per)
        this.getUserAccount()
        this.showMessage('success', this.$t('common.success'));

        this.loading = false;
      }).catch(err => {
        this.loading = false;
        this.file = null
        if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout");
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath), null);
        } else {
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'));
        }
      })
    },
    input() {
      this.changed = true;
    },
    handleModelUpdate(newValue) {
      console.log('Новое значение model-value:', newValue);

    },
    validate() {
      this.validation.iin = !this.per.IIN || this.per.IIN.length != 12;
      this.validation.firstname = !this.per.firstName || this.per.firstName.length < 1;
      this.validation.firstnameEn = !this.per.firstnameEn || this.per.firstnameEn.length < 1;
      this.validation.lastname =  !this.per.thirdName || this.per.thirdName.length < 1;
      this.validation.lastnameEn =  !this.per.thirdnameEn || this.per.thirdnameEn.length < 1;
      this.validation.birthday = !this.per.birthday || this.per.birthday.id < 1;
      this.validation.email = !this.per.email || this.per.email.length < 1;
      console.log(this.validation)
      return (this.validation.iin || this.validation.firstname || this.validation.lastname ||
        this.validation.birthday || this.validation.email || this.validation.firstnameEn ||
        this.validation.lastnameEn);
    },
    handlePersonalInformationUpdate(updatedData) {
      if (updatedData != null) {
        this.per = updatedData;
        console.log(updatedData)
        this.$emit("update:modelValue", this.per);
      }
    },
    getUserAccount() {
      const req = {
        userID: null
      }
      if (this.userID != null) {
        req.userID = this.userID
      } else {
        req.userID = this.per.userID
      }

      this.userService.getUserAccount(req).then(response=>{
  
        this.per = response.data.user
        this.$emit("update:modelValue", this.per);
        this.$emit("update:person", this.per);

      }).catch(err => {

        if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout");
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath), null);
        } else {
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'));
        }
      })
    },
    onMenuItemClick() {
      this.$emit('someEvent')
    },

  }
}
</script>

<style scoped>

.custom-dropdown {
  margin-top: 8px;
}
.progress-spinner {
  position: absolute;
  top: 0; bottom: 0; left: 0; right: 0;
  margin: auto;
  z-index: 1102;
}
</style>
