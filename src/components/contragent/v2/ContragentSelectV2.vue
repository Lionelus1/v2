<template>
  <div class="field mb-4" v-if="contr && [0, Enum.ContragentType.Organization, Enum.ContragentType.Bank].includes(contr.type)">
    <IconField iconPosition="right">
      <InputIcon>
        <i v-if="contr.data && contr.data.id > 0" class="pi pi-id-card"
           style="font-size: 1.2rem;padding-right: 10px;" @click="open('organizationCard')"></i>
        <i class="pi pi-ellipsis-h" style="font-size: 1.2rem" @click="open('organizationList')"></i>
      </InputIcon>
      <InputText :disabled="disable" :readonly="true" type="text" v-model="getOrganizationName"></InputText>
    </IconField>
  </div>
  <div class="field mb-0" v-if="selectPerson && ((contr && contr.type === Enum.ContragentType.Person) || contr.data)">
    <IconField iconPosition="right">
      <InputIcon>
        <i v-if="signer && signer.userID > 0" class="pi pi-id-card"
           style="font-size: 1.25rem;padding-right: 10px;" @click="open('signerCard')"
           :style="{'z-index': scientist ? 1 : 0}"></i>
        <i v-if="signer && signer.userID > 0" class="pi pi-cloud-download" @click="open('viewResume')" style="font-size: 1.25rem;padding-right: 10px;"></i>
        <i class="pi pi-ellipsis-h" style="font-size: 1.25rem" @click="open('signerList')"></i>
      </InputIcon>
      <InputText :disabled="disable" :readonly="true" type="text" v-model="getSignerName"></InputText>
    </IconField>
    <small v-if="[0, Enum.ContragentType.Organization, Enum.ContragentType.Bank].includes(contr.type)">{{$t('contracts.signer')}}</small>
  </div>
  <Sidebar v-model:visible="visibility.organizationCard" position="right" class="p-sidebar-lg">
    <OrganizationPage :id="this.contr.data.id" :organization="this.contr.data" :sidebar="true" @organizationUpdated="organizationUpdated"></OrganizationPage>
  </Sidebar>
  <Sidebar v-model:visible="visibility.organizationList" position="right" class="p-sidebar-lg">
    <div class="flex flex-column" style="width: 100%; height: 100%;">
      <OrganizationList :sidebar="true" @organizationSelected="organizationSelected"></OrganizationList>
    </div>
  </Sidebar>
  <Sidebar v-model:visible="visibility.signerCard" position="right" class="p-sidebar-lg">
    <PersonPage :person="signer" :sidebar="true" @organizationUpdated="personUpdated" custom-type="viewUser"></PersonPage>
  </Sidebar>
  <Sidebar v-model:visible="visibility.signerList" position="right" class="p-sidebar-lg">
    <div class="flex flex-column" style="width: 100%; height: 100%;">
      <PersonsList :organization="[0, Enum.ContragentType.Organization, Enum.ContragentType.Bank].includes(contr.type) ? contr.data : null" 
        :signers="[0, Enum.ContragentType.Organization, Enum.ContragentType.Bank].includes(contr.type) ? true : false" :sidebar="true" 
        @personSelected="personSelected"></PersonsList>
    </div>
  </Sidebar>

  <Sidebar v-model:visible="visibility.viewResume" position="right" class="p-sidebar-lg" style="overflow-y: scroll">
      <ResumeView :userID="signer.userID" :readonly="true"/>
    </Sidebar>
</template>
<script>
import Enum from "@/enum/docstates/index";

import OrganizationList from "@/components/contragent/v2/OrganizationList";
import OrganizationPage from "@/components/contragent/v2/OrganizationPage";
import PersonsList from "@/components/contragent/v2/PersonsList";
import PersonPage from "@/components/contragent/v2/PersonPage";
import {UserService} from "@/service/user.service"
import  ResumeView  from "@/components/humanResources/vacancy/ResumeView.vue";

export default {
  name: 'ContragentSelectV2',
  components: { OrganizationList, OrganizationPage, PersonsList,  PersonPage, ResumeView },
  props: { 
    contragent: null,
    disable: {
      type: Boolean,
      default: false
    },
    scientist: {
      type: Boolean,
      default: false
    },
    selectPerson: {
      type: Boolean,
      default: true
    }
  },
  emits: ['contragentUpdated'],
  data() {
    return {
      Enum: Enum,

      contr: JSON.parse(JSON.stringify(this.contragent)),
      signer: null,

      visibility: {
        organizationCard: false,
        organizationList: false,
        signerCard: false,
        signerList: false,
        viewResume: false
      },
      userService: new UserService()
    }
  },
  computed: {
    getOrganizationName() {
      if (!this.contr || !this.contr.data) {
        return '';
      }

      let name = '';

      if (this.$i18n.locale === 'kz' && this.contr.data.name && this.contr.data.name.length > 0) {
        if (this.contr.data.form) {
          name = '"' + this.contr.data.name + '" ' + this.contr.data.form.shortname;
        } else {
          name = this.contr.data.name;
        }
      } else if (this.$i18n.locale === 'ru' && this.contr.data.nameru && this.contr.data.nameru.length > 0) {
        if (this.contr.data.form) {
          name = this.contr.data.form.shortnameru + ' "' + this.contr.data.nameru + '"';
        } else {
          name = this.contr.data.nameru;
        }
      } else if (this.$i18n.locale === 'en' && this.contr.data.nameen && this.contr.data.nameen.length > 0) {
        if (this.contr.data.form && this.contr.data.form.shortnameen) {
          name = this.contr.data.form.shortnameen + ' "' + this.contr.data.nameen + '"';
        } else {
          name = this.contr.data.nameen;
        }
      } else if (this.contr.data.name) {
        name = this.contr.data.name;
      }

      return name;
    },
    getSignerName() {
      if (!this.signer) {
        return ''
      }

      let fullname = ''
      if (this.$i18n.locale === 'en') {
        fullname += this.signer.lastnameEn + ' ' + this.signer.firstnameEn

        if (this.signer.thirdnameEn) {
          fullname += ' ' + this.signer.thirdnameEn
        }
      } 
      
      if (fullname.length > 0) {
        return fullname
      }
      
      fullname += this.signer.thirdName + ' ' + this.signer.firstName 

      if (this.signer.lastName) {
        fullname += ' ' + this.signer.lastName 
      }

      return fullname
    },
  },
  mounted() {
    if (this.contr && this.contr.type === this.Enum.ContragentType.Person) {
      this.signer = this.contr.data;
    } else if (this.contr && this.contr.data && [this.Enum.ContragentType.Organization, this.Enum.ContragentType.Bank].includes(this.contr.type)) {
      this.signer = this.contr.data.signer;
    }
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
    open(name) {
      this.visibility[name] = true;
    },
    close(name) {
      this.visibility[name] = false
    },
    organizationUpdated(event) {
      this.close('organizationCard');

      let org = JSON.parse(JSON.stringify(event))
      org.signer = JSON.parse(JSON.stringify(this.signer));
      this.contr.data = JSON.parse(JSON.stringify(org));

      this.$emit('contragentUpdated', this.contr);
    },
    organizationSelected(event) {
      this.close('organizationList');

      this.contr.data = JSON.parse(JSON.stringify(event));
      this.signer = null;

      this.$emit('contragentUpdated', this.contr);
    },
    personUpdated(event) {
      this.close('personCard');

      if (this.contr.type === this.Enum.ContragentType.Person) {
        this.contr.data = JSON.parse(JSON.stringify(event));
      } else {
        this.contr.data.signer = JSON.parse(JSON.stringify(event));
      }
      this.signer = JSON.parse(JSON.stringify(event));

      this.$emit('contragentUpdated', this.contr);
    },
    personSelected(event) {
      this.close('signerList');

      if (this.contr.type === this.Enum.ContragentType.Person) {
        this.contr.data = JSON.parse(JSON.stringify(event));
      } else {
        this.contr.data.signer = JSON.parse(JSON.stringify(event));
      }
      this.signer = JSON.parse(JSON.stringify(event));

      this.getUserAccount(this.signer.userID)

      this.$emit('contragentUpdated', this.contr);
    },
    getUserAccount(userID) {
      const req = {
        userID: userID
      }

      this.userService.getUserAccount(req).then(response=>{
  
        this.signer = response.data.user
      }).catch(err => {
        this.loading = false;

        if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout");
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath), null);
        } else {
          console.log(err);
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'));
        }
      })
    }
  }
}
</script>
<style scoped>
.p-input-icon-right > i {
  font-size: large;
  top: 0.5rem;
  height: 100%;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  display: flex;
  align-items: center;
}
.p-input-icon-right > .p-inputtext {
  padding-right: 5rem;
}
.p-input-icon-right > i:hover {
  background-color: #edf0f5;
}
</style>