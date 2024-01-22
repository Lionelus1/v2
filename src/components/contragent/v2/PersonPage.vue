<template>
    <ProgressSpinner v-if="loading" class="progress-spinner" strokeWidth="5"/>
    
    <Menubar :model="items" class="m-0 pt-0 pb-0"></Menubar>
    <BlockUI v-if="!loading" class="p-fluid" :blocked="loading">
      <TabView class="custom-tabview">
        
        <TabPanel :header="$t('personalData')">
          <template v-if="per && per.userID">
            <UserPersonalInfomation @personal-information-updated="handlePersonalInformationUpdate" :model-value="per" :custom-type="customType" :userID="per.userID" :readonly="pageReadonly"/>
          </template>
        </TabPanel>

        <TabPanel v-if="customType===chapter.myAccount || customType=== chapter.viewUser"  :header="$t('hr.title.id')">
          <UserIDCard @personal-information-updated="handlePersonalInformationUpdate" :model-value="per" :userID="per.userID" :readonly="pageReadonly"/>
        </TabPanel>

        <TabPanel :header="$t('hr.educationLabel')">
          <UserEducationView  :model-value="per" :userID="per.userID" :readonly="pageReadonly"/>
        </TabPanel>
        
        <TabPanel v-if="customType===chapter.myAccount || customType=== chapter.viewUser" :header="$t('bank.requisite')">
          <UserRequisite @personal-information-updated="handlePersonalInformationUpdate" :model-value="per" :userID="per.userID" :readonly="pageReadonly"/>
        </TabPanel>
        
        <TabPanel v-if="customType != chapter.viewUser && (customType===chapter.scientists || findRole(null, 'teacher') || findRole(null, 'personal'))" :header="$t('science.areaScientificInterests')">
          <UserResearchInterestsView :model-value="per" :userID="per.userID" :readonly="pageReadonly"/>
        </TabPanel>

        <TabPanel v-if="customType != chapter.viewUser && (customType===chapter.scientists || findRole(null, 'teacher') || findRole(null, 'personal'))" :header="$t('science.laborActivity')">
          <WorkExperienceView :model-value="per" :userID="per.userID" :readonly="pageReadonly"/>
        </TabPanel>

        <TabPanel v-if="customType != chapter.viewUser && (customType===chapter.scientists || findRole(null, 'teacher') || findRole(null, 'personal'))" :header="$t('science.awardsAndHonors')">
          <UserAwardView :model-value="per" :userID="per.userID" :readonly="pageReadonly"/>
        </TabPanel>

        <TabPanel v-if="customType != chapter.viewUser && (customType===chapter.scientists || findRole(null, 'teacher') || findRole(null, 'personal'))" :header="$t('science.professionalDevelopment')">
          <UserQualificationsView :model-value="per" :userID="per.userID" :readonly="pageReadonly"/>
        </TabPanel>

      </TabView>
    </BlockUI>

    <Sidebar v-model:visible="viewResume" position="right" class="p-sidebar-lg" style="overflow-y: scroll">
      <ResumeView :userID="per.userID" :readonly="true"/>
    </Sidebar>

  <Sidebar v-model:visible="showScientificWorks" position="right" class="p-sidebar-lg">
    <ScienceWorks :scientist="per" :openCardInSidebar="true" />
  </Sidebar>
</template>


<script>
import { findRole } from "@/config/config";
import Enum from "@/enum/roleControls/index";

import { ContragentService } from "@/service/contragent.service";
import UserPersonalInfomation from '@/components/user/edit/UserPersonalInfomation'
import UserIDCard from '@/components/user/edit/UserIDCard'
import UserEducationEdit from '@/components/user/edit/UserEducationEdit'
import UserEducationView from '@/components/user/view/UserEducationView'
import UserRequisite from '@/components/user/edit/UserRequisite'
import {UserService} from "@/service/user.service"
import UserResearchInterestsView from "@/components/user/view/UserResearchInterestsView"
import WorkExperienceView from "@/components/user/view/WorkExperienceView"
import UserAwardView from "@/components/user/view/UserAwardView"
import UserQualificationsView from "@/components/user/view/UserQualificationsView"
import  ResumeView  from "@/components/humanResources/vacancy/ResumeView.vue";
import ScienceWorks from "@/components/documents/catalog/ScienceWorks.vue"
import ToolbarMenu from "@/components/ToolbarMenu.vue";

export default {
  name: 'PersonPage',
  components: {
    UserPersonalInfomation, UserIDCard, UserEducationView, UserRequisite, UserResearchInterestsView, WorkExperienceView, UserAwardView, UserQualificationsView, ResumeView, ScienceWorks },
  props: {
    person: null,
    userID: null,
    readonly: {
      type: Boolean,
      default: false
    },
    customType: {
      type: String,
      default: ''
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
        },
        {
            label: this.$t("science.profileLink"),
            icon: "pi pi-fw pi-user",
            disabled: () => !this.per || !this.per.profile_links || this.per.profile_links.length < 1 ||
              this.per.profile_links[0].length < 1,
            command: () => {
              this.redirectToProfile();
            },
            visible: this.customType != 'viewUser' && (this.customType === 'scientists' || (findRole(null, 'teacher') || findRole(null, 'personal')))
        },
        {
          label: this.$t("dissertation.swList"),
          icon: "pi pi-fw pi-search",
          command: () => {
            this.openScientificWorksList();
          },
          visible: this.customType != 'viewUser' && (this.customType === 'scientists' || (findRole(null, 'teacher') || findRole(null, 'personal')))
        },
      ],
      user: {},
      userService: new UserService(),
      file: null,
      fileBankRequisite: null,
      chapter: {
        myAccount: 'myAccount',
        scientists: 'scientists',
        viewUser: 'viewUser'
      },
      viewResume: false,
      showScientificWorks: false
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
    
    this.emitter.on('bankrequisite', (data) => {
      if (data !== true) {
        this.fileBankRequisite = data
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
      if (this.fileBankRequisite !== null) {
        fd.append("bankRequisiteImage", this.fileBankRequisite)
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
      this.loading = true
      this.userService.getUserAccount(req).then(response=>{
  
        this.per = response.data.user
        this.$emit("update:modelValue", this.per);
        this.$emit("update:person", this.per);
        this.loading = false
      }).catch(err => {

        this.this.loading = false
        if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout");
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath), null);
        } else {
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'));
        }
      })
    },
    openScientificWorksList() {
        this.showScientificWorks = true
    },
    redirectToProfile() {
      if (this.per.profile_links != null) {
        const firstLink = this.per.profile_links[0]; 

        if (firstLink) {
          window.open(firstLink, '_blank'); 
        } 
      } else {
          console.error("Ссылка на профиль отсутствует");
      } 
    },
    onMenuItemClick() {
      this.$emit('someEvent')
    },
    openResume() {
      this.viewResume = true
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

  .custom-tabview .p-tabview-nav {
    display: flex;
    flex-wrap: wrap; 
    gap: 8px;
  }

  .custom-tabview .p-tabview-nav .p-tabview-nav-link {
    min-width: 120px; 
    white-space: nowrap; 
  }

</style>
