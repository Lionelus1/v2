<template>
  <ProgressSpinner v-if="loading" class="progress-spinner" strokeWidth="5"/>
  <BlockUI v-if="contragentRequested" :blocked="loading" class="card">
    <div>
      <div class="p-fluid pb-0" v-if="!contragent">
        <Message severity="warn" :closable="false">{{ $t('contracts.contragentAsEnt') }}</Message>
      </div>
      <div class="p-fluid md:col-6 pb-0">
        <label>{{ $t('contracts.contragentSigner') }}</label>
      </div>
      <div class="p-fluid md:col-6">
        <div class="field mb-4" v-if="contragent">
          <IconField iconPosition="right">
            <InputIcon>
              <i v-if="contragent" class="pi pi-id-card" style="font-size: 1.2rem" @click="open('organizationCard')"></i>
            </InputIcon>
            <InputText :readonly="true" type="text" v-model="getOrganizationName"></InputText>
          </IconField>
        </div>
        <div class="field mb-0" v-if="signer">
          <IconField iconPosition="right">
            <InputIcon>
              <i v-if="signer && signer.userID > 0"
                 class="pi pi-id-card" style="font-size: 1.25rem;padding-right: 10px;" @click="open('signerCard')"></i>
              <i class="pi pi-ellipsis-h" style="font-size: 1.25rem" @click="open('signerList')"></i>
            </InputIcon>
            <InputText :readonly="true" type="text" v-model="getSignerName"></InputText>
          </IconField>
          <label v-if="contragent">{{$t('contracts.signer')}}</label>
        </div>
      </div>
      <div class="md:col-6">
        <Button :label="$t('contracts.agreeAndSign')" class="p-button-success" @click="contragentAccept"></Button>
      </div>
    </div>
    <div class="flex flex-column flex-grow-1 mt-1">
      <embed v-if="pdf" :src="pdf" class="flex-grow-1" type="application/pdf"/>
      <Skeleton v-else class="flex-grow-1"></Skeleton>
    </div>
  </BlockUI>
  <div v-else class="card">
    <Message severity="warn" :closable="false">{{ $t('contracts.contragentWarning') }}</Message>
  </div>
  <Sidebar v-model:visible="visibility.organizationCard" position="right" class="p-sidebar-lg">
    <OrganizationPage :id="contragent.id" :organization="contragent" :sidebar="true" @organizationUpdated="organizationUpdated"></OrganizationPage>
  </Sidebar>
  <Sidebar v-model:visible="visibility.signerCard" position="right" class="p-sidebar-lg">
    <PersonPage :person="signer" :sidebar="true" @organizationUpdated="personUpdated" custom-type="viewUser"></PersonPage>
  </Sidebar>
  <Sidebar v-model:visible="visibility.signerList" position="right" class="p-sidebar-lg">
    <div class="flex flex-column" style="width: 100%; height: 100%;">
      <PersonsList :organization="contragent ? contragent : null" :signers="contragent ? true : false" 
        :sidebar="true" @personSelected="personSelected"></PersonsList>
    </div>
  </Sidebar>
</template>
<script>
import { b64toBlob, findRole } from "@/config/config";
import DocEnum from "@/enum/docstates/index";
import RolesEnum from "@/enum/roleControls/index";

import { DocService } from "@/service/doc.service";
import OrganizationPage from "@/components/contragent/v2/OrganizationPage";
import PersonsList from "@/components/contragent/v2/PersonsList";
import PersonPage from "@/components/contragent/v2/PersonPage";

export default {
  name: 'ContractRequest',
  components: { OrganizationPage, PersonsList,  PersonPage },
  data() {
    return {
      service: new DocService(),
      DocEnum: DocEnum,
      RolesEnum: RolesEnum,
      findRole: findRole,

      visibility: {
        organizationCard: false,
        signerCard: false,
        signerList: false,
      },

      loading: false,
      contragentRequested: false,
      request: null,
      contragent: null,
      signer: null,

      contract: null,
      pdf: null,
    }
  },
  computed: {
    getOrganizationName() {
      if (!this.contragent) {
        return '';
      }

      let name = '';

      if (this.$i18n.locale === 'kz' && this.contragent.name && this.contragent.name.length > 0) {
        if (this.contragent.form) {
          name = '"' + this.contragent.name + '" ' + this.contragent.form.shortname;
        } else {
          name = this.contragent.name;
        }
      } else if (this.$i18n.locale === 'ru' && this.contragent.nameru && this.contragent.nameru.length > 0) {
        if (this.contragent.form) {
          name = this.contragent.form.shortnameru + ' "' + this.contragent.nameru + '"';
        } else {
          name = this.contragent.nameru;
        }
      } else if (this.$i18n.locale === 'en' && this.contragent.nameen && this.contragent.nameen.length > 0) {
        if (this.contragent.form && this.contragent.form.shortnameen) {
          name = this.contragent.form.shortnameen + ' "' + this.contragent.nameen + '"';
        } else {
          name = this.contragent.nameen;
        }
      } else if (this.contragent.name) {
        name = this.contragent.name;
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
  async mounted() {
    this.$emit('apply-flex', true);

    if (this.findRole(null, this.RolesEnum.roles.Student)) {
      return;
    } else {
      await this.getContragent();
      this.getContract();
    }
  },
  beforeUnmount() {
    this.$emit('apply-flex', false);
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
    async getContragent() {
      let loginedUser = JSON.parse(localStorage.getItem("loginedUser"));

      if (loginedUser.mainPosition && loginedUser.mainPosition.id > 0) {
        this.contragent = loginedUser.mainPosition.organization;

        if (this.findRole(null, this.RolesEnum.roles.Signer)) {
          this.signer = loginedUser;
        }
      } else {
        this.signer = loginedUser;
      }
    },
    getContract() {
      this.loading = true;

      this.service.getDocumentV2({
        uuid: this.$route.params.uuid
      }).then(res => {
        this.contract = res.data;

        this.loading = false;

        if (this.contract.docHistory.stateId > this.DocEnum.CREATED.ID) {
          this.$router.push('/sign/' + this.contract.uuid);
          return;
        }
        
        if (this.contract.requests) {
          for (let i = 0; i < this.contract.requests.length; i++) {
            if (this.contract.requests[i].type === this.DocEnum.DocumentRequestType.CounterpartyInfoRequest
              && this.contract.requests[i].status === 0) {
              this.contragentRequested = true;
              this.request = this.contract.requests[i];
              break;
            }
          }
        }

        this.downloadContract();
      }).catch(err => {
        this.loading = false;

        if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout");
        } else if (err.response && err.response.data && err.response.data.localized) {
          if (err.response.status != 403) {
            this.showMessage('error', this.$t(err.response.data.localizedPath), null);
          }
        } else {
          console.log(err)
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
        }
      })
    },
    downloadContract() {
      this.loading = true;

      this.service.downloadDocumentV2({
        uuid: this.contract.uuid,
        preview: true,
        organization: this.contragent,
        signer: this.signer,
      }).then(res => {
        this.pdf = b64toBlob(res.data);
        this.loading = false;
      }).catch(err => {
        this.loading = false;

        if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout")
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath), null)
        } else {
          console.log(err)
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
        }
      })
    },
    organizationUpdated(event) {
      this.close('organizationCard');

      this.contragent = JSON.parse(JSON.stringify(event));
      this.downloadContract();
    },
    personUpdated(event) {
      this.close('signerCard');

      this.signer = JSON.parse(JSON.stringify(event));
      this.downloadContract();
    },
    personSelected(event) {
      this.close('signerList');

      this.signer = JSON.parse(JSON.stringify(event));
      this.downloadContract();
    },
    contragentAccept() {
      if (!this.signer || this.signer.userID < 1) {
        this.showMessage("error", this.$t("common.tosign"), this.$t("common.message.fillError"));
        return;
      }

      this.loading = true;

      this.service.updateDocRequestV2({
        requestId: this.request.id,
        status: 1,
        organizarion: this.contragent,
        signer: this.signer,
      }).then(res => {
        this.loading = false;

        this.$router.push('/sign/' + this.contract.uuid);
      }).catch(err => {
        this.loading = false;

        if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout");
        } else if (err.response && err.response.data && err.response.data.localized) {
          if (err.response.status != 403) {
            this.showMessage('error', this.$t(err.response.data.localizedPath), null);
          }
        } else {
          console.log(err)
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
        }
      })
    },
  }
}
</script>
<style scoped>
.progress-spinner {
  position: absolute;
  top: 0; bottom: 0; left: 0; right: 0;
  margin: auto;
  z-index: 1102;
}
.card {
  flex-grow: 1;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  margin-bottom: 0px;
}

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