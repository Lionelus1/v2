<template>
  <ProgressSpinner v-if="loading" class="progress-spinner" strokeWidth="5"/>
  <div class="flex flex-row mb-3">
    <div class="arrow-icon" @click="$router.back()">
      <i class="fas fa-arrow-left"></i>
    </div>
    <h4 class="m-0">{{ $t("contracts.contract") }}</h4>
  </div>
  <BlockUI v-if="haveAccess" :blocked="loading" class="card">
    <Menubar :model="menu" class="m-0 pt-0 pb-0"></Menubar>
    <TabView v-model:activeIndex="activeTab" @tab-change="tabChanged" class="flex flex-column flex-grow-1">
      <TabPanel :header="$t('common.params')">
        <div v-if="contract" class="flex flex-column flex-grow-1">
          <div class="lg:col-6 mt-3">
            <p> {{ $t('common.state') + ": " }}
              <span :class="'customer-badge status-' + contract.docHistory.code">
                {{ contract.docHistory[$i18n.locale === 'en' ? 'stateEn' : $i18n.locale === 'ru' ? 'stateRus' : 'stateKaz'] }}
              </span>
            </p>
          </div>
          <div v-if="contract.sourceType === Enum.DocSourceType.FilledDoc">
            
          </div>
          <div class="flex-grow-1" style="overflow: scroll; height: 150px;" v-if="contractParams">
            <div v-for="param in contractParams" :key="param.id">
              <div class="p-fluid md:col-6 pb-0">
                <label v-if="['number', 'date', 'contragent', 'ourside', 'individualEntrepreneur', 'student', 'period'].includes(param.description) ">{{ $t("doctemplate.editor." + param.name) }}</label>
                <label v-else-if="['практика түрі', 'Вид практики'].includes(param.description)">{{ $t('doctemplate.editor.practiceType') }}</label>
                <label v-else-if="['Білім беру бағдарламасы', 'Образовательные программы'].includes(param.description)">{{ $t('doctemplate.editor.educationProgram') }}</label>
                <label v-else>{{ param.description }}</label>
              </div>
              <div class="p-fluid lg:col-6" v-if="['text', 'number', 'date'].includes(param.name)">
                <InputText v-model="param.value" type="text" @input="input()"
                  :disabled="contract.docHistory.stateId > Enum.CREATED.ID || param.name == 'number' || param.name == 'date'"
                  :placeholder="param.name == 'number' || param.name == 'date' ? $t('contracts.autogenerate') : ''"></InputText> 
              </div>
              <div class="p-fluid lg:col-6" v-if="param.name == 'period'">
                <PrimeCalendar v-model="param.value" dateFormat="dd.mm.yy" showIcon
                  selectionMode="range" :manualInput="false" @update:modelValue="input()" 
                  :disabled="contract.docHistory.stateId > Enum.CREATED.ID"></PrimeCalendar>
              </div>
              <div class="p-fluid lg:col-6" v-if="['contragent', 'ourside', 'individualEntrepreneur'].includes(param.name)">
                <ContragentSelectV2 :contragent="param.value" @contragentUpdated="(event) => contragentUpdated(event, param)"
                  :disable="contract.docHistory.stateId > Enum.CREATED.ID"></ContragentSelectV2>
              </div>
              <div class="p-fluid lg:col-6" v-if="param.name == 'student'">
                <FindUser v-model:first="param.value" searchMode="ldap" :max="1" v-model="notused.users"
                  :disabled="contract.docHistory.stateId > Enum.CREATED.ID"
                  :userType="1" @input="input()" @remove="input()"></FindUser>
              </div>
            </div>
          </div>
        </div>
      </TabPanel>
      <TabPanel :header="$t('common.show')" :disabled="!contract || !contract.filePath || contract.filePath.length < 1">
        <div class="flex-grow-1">
          <embed :src="pdf" style="width: 100%; height: 100%" v-if="pdf" type="application/pdf"/>
        </div>
      </TabPanel>
    </TabView>
  </BlockUI>
  <div v-else class="card">
    <Access textMode="short" :showLogo="false" returnMode="back"></Access>
  </div>
  <!-- documentNumberDialog -->
  <Dialog :header="$t('common.registration')" modal="true" v-model:visible="visibility.documentNumberDialog" style="width: 30vw;">
    <div class="field grid">
      <label class="col-12 mb-2 md:col-2 md:mb-0">{{ $t("contracts.journal") }}</label>
      <div class="col-12 md:col-10">
        <InputText :disabled="true" :modelValue="contract.folder['name'+$i18n.locale]" style="width: 100%;"></InputText>
      </div>
    </div>
    <div class="field grid">
      <label class="col-12 mb-2 md:col-2 md:mb-0">{{ $t("common.date") }}</label>
      <div class="col-12 md:col-10">
        <InputText :disabled="true" :modelValue="contract.registerDate ? getShortDateString(contract.registerDate) : getShortDateString(new Date())" style="width: 100%;"></InputText>
      </div>
    </div>
    <div class="field grid">
      <label class="col-12 mb-2 md:col-2 md:mb-0">{{ $t("contracts.regnum") }}</label>
      <div class="col-8 md:col-6">
        <InputText :disabled="true" :modelValue="reserveNumber" style="width: 100%;"></InputText>
      </div>
      <i class="col-4" v-if="!contract.number">-{{ $t("contracts.preliminary") }}</i>
    </div>
    <template #footer>
      <Button :disabled="contract.number" :label="$t('common.registration')" @click="registerContract()" />
      <Button :label="$t('common.cancel')" @click="close('documentNumberDialog')" />
    </template>
  </Dialog>
  <!-- documentInfoSidebar -->
  <Sidebar v-model:visible="visibility.documentInfoSidebar" position="right" class="p-sidebar-lg" @hide="getContracts">
    <DocSignaturesInfo :docIdParam="contract.uuid"></DocSignaturesInfo>
  </Sidebar>
</template>
<script>
import { b64toBlob, findRole } from "@/config/config";
import { getShortDateString } from "@/helpers/helper";
import Enum from "@/enum/docstates/index";

import { DocService } from "@/service/doc.service";
import Access from "@/pages/Access";
import ContragentSelectV2 from "@/components/contragent/v2/ContragentSelectV2";
import DocSignaturesInfo from "@/components/DocSignaturesInfo";
import FindUser from "@/helpers/FindUser";

export default {
  name: 'ContractV2',
  components: { Access, ContragentSelectV2, DocSignaturesInfo, FindUser },
  props: { },
  data() {
    return {
      users:[],
      service: new DocService(),
      Enum: Enum,
      findRole: findRole,
      getShortDateString: getShortDateString,

      visibility: {
        documentNumberDialog: false,
        documentInfoSidebar: false,
        newDocumentDialog: false,
      },

      loading: false,
      haveAccess: true,
      activeTab: 0,
      changed: false,

      contract: null,
      contractParams: [],
      pdf: null,
      reserveNumber: null,

      menu: [
        {
          label: this.$t("common.save"),
          icon: "pi pi-fw pi-save",
          disabled: () => this.contract && this.contract.docHistory.stateId > Enum.CREATED.ID || !this.changed,
          command: () => { this.saveDocument() }
        },
        {
          label: this.$t("common.download"),
          icon: "pi pi-fw pi-download",
          disabled: () => !this.contract || !this.contract.filePath || this.contract.filePath.length < 1,
          command: () => {
            this.downloadContract(true);
          },
        },
        {
          label: this.$t("common.registration"),
          icon: "pi pi-fw pi-paperclip",
          items: [
            {
              label: this.$t("contracts.setnumber"),
              icon: "pi pi-fw pi-list",
              command: () => {
                this.open("documentNumberDialog");
              },
            }
          ]
        },
        {
          label: this.$t("common.send"),
          icon: "pi pi-send",
          disabled: () => this.contract && (this.contract.docHistory.stateId === Enum.INAPPROVAL.ID
            || this.contract.docHistory.stateId === Enum.SIGNING.ID),
          items: [
            {
              label: this.$t("common.toapprove"),
              icon: "fa-regular fa-handshake",
              visible: () => this.contract && (this.contract.sourceType === Enum.DocSourceType.FilledDoc || 
                (this.contract.template && this.contract.template.needApproval)) && 
                this.contract.docHistory.stateId === Enum.CREATED.ID,
                command: () => { this.sendToApprove() }
            },
            {
              label: this.$t("common.tosign"),
              icon: "pi pi-user-edit",
              visible: () => this.contract && ((this.contract.sourceType === Enum.DocSourceType.Template && 
                !this.contract.template.needApproval && this.contract.docHistory.stateId === Enum.CREATED.ID) || 
                this.contract.docHistory.stateId === Enum.APPROVED.ID),
                command: () => { this.sendToSign() }
            }
          ]
        },
        {
          label: this.$t('common.approvalList'),
          icon: "pi pi-user-edit",
          disabled: () => !this.contract || !this.contract.docHistory || this.contract.docHistory.stateId < this.Enum.INAPPROVAL.ID,
          command: () => {
            this.open('documentInfoSidebar')
          }
        },
        {
          label: this.$t('contracts.menu.relatedDocument'),
          icon: "fa-solid fa-folder-tree",
          disabled: () => this.contract && this.contract.docHistory.stateId !== this.Enum.SIGNED.ID,
          visible: () => this.contract && this.contract.sourceType === this.Enum.DocSourceType.FilledDoc,
          items: [
            {
              label: this.$t('contracts.menu.newDocument'),
              command: () => { this.open('newDocumentDialog') }
            },
            {
              label: this.$t('contracts.menu.journal'),
              command: () => { this.$router.push('/documents/contracts/' + this.contract.uuid + '/related') }
            }
          ]
        }
      ],

      notused: {
        users: [],
      }
    }
  },
  mounted() {
    this.$emit('apply-flex', true);

    this.getContract();
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
      if (name === 'documentNumberDialog' && !this.reserveNumber) {
        this.registerContract(true);
      }

      this.visibility[name] = true;
    },
    close(name) {
      this.visibility[name] = false
    },
    tabChanged() {
      if (this.activeTab === 1) {
        if (!this.contract || !this.contract.filePath || this.contract.filePath.length < 1) return;

        this.downloadContract(false);
      }
    },
    getContract() {
      this.loading = true;

      this.service.getDocumentV2({
        uuid: this.$route.params.uuid
      }).then(res => {
        this.contract = res.data;
        
        if (this.contract.number) {
          this.reserveNumber = this.contract.number;
        }

        this.getParams();

        this.loading = false;
      }).catch(err => {
        this.loading = false;

        if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout");
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath), null);
          if (err.response.status == 401) {
            this.haveAccess = false;
          }
        } else {
          console.log(err)
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
        }
      })
    },
    getParams() {
      this.contractParams = [];

      let param = this.contract.newParams['number'];
      if (param) {
        param.value = this.contract.number;
        this.contractParams.push(param);
      }

      param = this.contract.newParams['практика түрі'];
      if (param) this.contractParams.push(param);

      param = this.contract.newParams['Вид практики'];
      if (param) this.contractParams.push(param);

      param = this.contract.newParams['date'];
      if (param) {
        param.value = this.contract.registerDate;
        param.value = param.value ? this.getShortDateString(param.value) : null;
        this.contractParams.push(param);
      }
      
      param = this.contract.newParams['ourside'];
      if (param) this.contractParams.push(param);

      param = this.contract.newParams['contragent'];
      if (param) this.contractParams.push(param);

      param = this.contract.newParams['individualEntrepreneur'];
      if (param) this.contractParams.push(param);

      param = this.contract.newParams['student'];
      if (param) {
        if (param.value && param.value.userID < 1) {
          param.value = null;
        }

        if ((!param.value || !param.value.userID) && this.findRole(null, 'student')) {
          param.value = this.$store.state.loginedUser;
        }

        this.contractParams.push(param);
      }

      param = this.contract.newParams['Білім беру бағдарламасы'];
      if (param) this.contractParams.push(param);

      param = this.contract.newParams['Образовательные программы'];
      if (param) this.contractParams.push(param);

      param = this.contract.newParams['period'];
      if (param) {
        if (param.value) 
          for (let i = 0; i < param.value.length; i++) {
            param.value[i] = param.value[i] ? new Date(param.value[i]) : null;
          }
        this.contractParams.push(param);
      }
    },
    downloadContract(saveFile) {
      if (!this.contract || !this.contract.filePath || this.contract.filePath.length < 1) return;

      if (this.pdf) {
        if (saveFile) this.saveFile();
          
        return;
      }

      this.loading = true;

      this.service.downloadDocumentV2({
        uuid: this.contract.uuid
      }).then(res => {
        this.pdf = b64toBlob(res.data);

        this.loading = false;

        if (saveFile) this.saveFile();
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
    saveFile() {
      var link = document.createElement("a");
      link.innerHTML = "Download PDF file";
      link.download = this.contract.id + ".pdf";
      link.href =  this.pdf;
      link.click();
    },
    saveDocument() {
      for (let i = 0; i < this.contractParams.length; i++) {
        this.contract.newParams[this.contractParams[i].description] = this.contractParams[i];
      }

      console.log(this.contract.newParams)
    },
    registerContract(anticipatorily) {
      if (!this.contract) return;

      this.loading = true;

      this.service.registerDocumentV2({
        uuid: this.contract.uuid,
        anticipatorily: anticipatorily, //предварительно
      }).then(res => {
        this.reserveNumber = res.data;
        
        if (!anticipatorily) {
          this.contract.number = res.data;
          this.showMessage("success", this.$t("common.save"), this.$t("common.message.succesRegistered"));
        }

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
    sendToApprove() {
      
    },
    sendToSign() {

    },
    input() {
      this.changed = true;
    },
    contragentUpdated(contr, param) {
      this.input();
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
.arrow-icon {
  cursor: pointer;
  font-size: 1.25rem;
  margin-right: 1rem;
  display: flex;
  align-items: center; 
}
.card {
  flex-grow: 1;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  margin-bottom: 0px;
}
.status-status_created {
  background: #6c757d;
  color: #fff;
}
.status-status_signing {
  background: #17a2b8;
  color: #fff;
}
.status-status_signed {
  background: #28a745;
  color: #fff;
}
.status-status_inapproval {
  background: #9317b8;
  color: #ffffff;
}
.status-status_approved {
  background: #007bff;
  color: #ffffff;
}
.status-status_revision {
  background: #ffcdd2;
  color: #c63737;
}
:deep(.p-tabview-panels) {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  padding: 0rem;
}

:deep(.p-tabview-panel) {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}
</style>