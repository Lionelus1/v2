<template>
  <ProgressSpinner v-if="loading" class="progress-spinner" strokeWidth="5"/>
  <div class="flex flex-row mb-3">
    <div class="arrow-icon" @click="(event) => {$refs.backmenu.toggle(event)}">
      <i class="fas fa-arrow-left"></i>
      <Menu ref="backmenu" :model="backmenu" :popup="true" />
    </div>
    <h4 class="m-0">{{ $t("contracts.menu.relatedDocument") }}</h4>
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
              <span v-if="(sciadvisorRequest && contract.docHistory.stateId == Enum.CREATED.ID)" class="ml-1 customer-badge status-status_inapproval">
                {{ $t('contracts.sciadvisorRequest') }}
              </span>
              <span v-if="execution" class="ml-1 customer-badge status-status_signing">
                {{ $t('contracts.execution') }}
              </span>
              <span v-if="executed" class="ml-1 customer-badge status-status_signed">
                {{ $t('contracts.executed') }}
              </span>
            </p>
          </div>
          <div class="p-fluid md:col-6" v-if="sciadvisorRejection">
            <InlineMessage severity="error">{{ sciadvisorRejection }}</InlineMessage>
          </div>
          <div class="flex-grow-1" style="overflow: scroll; height: 150px;" v-if="contractParams">
            <div v-for="(param, id) in contractParams" :key="param.uuid">
              <div class="p-fluid md:col-6 pb-0">
                <label>{{ $t('contracts.labels.' + param.description) }}</label>
              </div>
              <div class="p-fluid md:col-6" v-if="['text', 'number'].includes(param.name)">
                <InputText v-model="param.value" type="text" @input="input()"
                  :disabled="(sciadvisorRequest && contract.docHistory.stateId === Enum.CREATED.ID) ||
                  contract.docHistory.stateId > Enum.CREATED.ID || (param.properties && param.properties.readonly)"
                  :placeholder="param.properties && param.properties.readonly ? $t('contracts.autogenerate') : ''"></InputText> 
              </div>
              <div class="p-fluid md:col-6" v-if="param.name == 'date'">
                <PrimeCalendar v-model="param.value" dateFormat="dd.mm.yy" :disabled="true"
                 :placeholder="param.properties && param.properties.readonly ? $t('contracts.autogenerate') : ''"></PrimeCalendar>
              </div>
              <div class="p-fluid md:col-6" v-if="param.name === 'person'">
                <ContragentSelectV2 :contragent="param.value" @contragentUpdated="(event) => contragentUpdated(event, param)"
                  :disable="(sciadvisorRequest && contract.docHistory.stateId === Enum.CREATED.ID) ||
                  contract.docHistory.stateId > Enum.CREATED.ID" :scientist="param.description === 'executor'"></ContragentSelectV2>
              </div>
              <div class="col-12" v-if="param.name === 'table'">
                <DataTable :value="param.value" class="p-datatable-small w-full" :editMode="(sciadvisorRequest && 
                  contract.docHistory.stateId === Enum.CREATED.ID) || contract.docHistory.stateId > Enum.CREATED.ID ? '' : 'cell'"
                  :pt="{column: {bodycell: ({ state }) => ({ class: [{ 'pt-0 pb-0': state['d_editing'] }] })}}">
                  <template v-if="contract.docHistory.stateId === Enum.CREATED.ID && !sciadvisorRequest" #footer>
                    <Button :label="$t('contracts.newWork')" @click="newWork(id)" class="p-button-link" style="width: fit-content;" />
                  </template>
                  <Column v-for="col in param.properties.columns" :field="col" 
                    :header="$t('contracts.columns.'+col)" :key="col">
                    <template #body="{ data, field }">
                      {{ data[field] }}
                    </template>
                    <template v-if="col !== 'number' && contract.docHistory.stateId === Enum.CREATED.ID && !sciadvisorRequest" 
                      #editor="{ data, field, index}">
                      <Textarea v-model="data[field]" autofocus autoResize rows="5" class="w-full" 
                        @update:model-value="param.value[index][field]=data[field]; input()"/>
                    </template>
                  </Column>
                </DataTable>
              </div>
              <div class="md:col-6" v-if="param.name === 'attachments'">
                <DataTable :value="param.value" class="p-datatable-small w-full">
                  <template v-if="contract.docHistory.stateId === Enum.CREATED.ID && !sciadvisorRequest" #footer>
                    <FileUpload mode="basic" accept=".pdf" :customUpload="true" @uploader="uploadAttachment($event)"
                      :auto="true" :chooseLabel="$t('ncasigner.chooseFile')" ref="attachmentUploader"/>
                  </template>
                  <Column :header="$t('hdfs.fileName')">
                    <template #body="{data}">
                      <template v-if="!data.filepath">{{ data.filename }}</template>
                      <a v-else style="cursor: pointer;" @click="downloadFile(data.filename, data.filepath)">{{ data.filename }}</a>
                    </template>
                  </Column>
                  <Column :header="$t('hdfs.toastMsg')">
                    <template #body="{data}">
                      <i class="fa-solid fa-check fa-xl" v-if="data.filepath"></i>
                    </template>
                  </Column>
                  <Column>
                    <template #body="{data, index}">
                      <Button v-if="contract.docHistory.stateId === Enum.CREATED.ID && !sciadvisorRequest"
                        @click="param.value.splice(index, 1); removeAttachment(data)" class="p-button-text p-button-danger p-1">
                        <i class="fa-solid fa-trash fa-xl"></i>
                      </Button>
                    </template>
                  </Column>
                </DataTable>
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
  <!-- documentInfoSidebar -->
  <Sidebar v-model:visible="visibility.documentInfoSidebar" position="right" class="p-sidebar-lg" @hide="getContracts">
    <DocSignaturesInfo :docIdParam="contract.uuid"></DocSignaturesInfo>
  </Sidebar>
  <!-- revisionDialog -->
  <Dialog :header="$t('common.revision')" modal="true" v-model:visible="visibility.revisionDialog" style="width: 30vw;">
    <div class="p-fluid col-12">
      <Textarea v-model="revisionText" autoResize rows="5" cols="30" />
    </div>
    <template #footer>
      <Button class="p-button-danger" :disabled="!revisionText" :label="$t('common.revision')" @click="revision()" />
      <Button :label="$t('common.cancel')" @click="close('revisionDialog')" />
    </template>
  </Dialog>
  <!-- sendToApproveDialog -->
  <Dialog :header="$t('common.action.sendToApprove')" v-model:visible="visibility.sendToApproveDialog"
    :style="{width: '50vw'}">
    <div class="p-fluid">
      <ApprovalUsers :approving="loading" v-model="selectedUsers"
        @closed="close('sendToApproveDialog')" @approve="sendToSign($event)" :stages="stages" 
        mode="standard"></ApprovalUsers>
    </div>
  </Dialog>
</template>
<script>
import { b64toBlob, findRole, getHeader, smartEnuApi } from "@/config/config";
import { getShortDateString } from "@/helpers/helper";
import Enum from "@/enum/docstates/index";
import RolesEnum from "@/enum/roleControls/index";

import { DocService } from "@/service/doc.service";
import Access from "@/pages/Access";
import ApprovalUsers from "@/components/ncasigner/ApprovalUsers/ApprovalUsers";
import ContragentSelectV2 from "@/components/contragent/v2/ContragentSelectV2";
import DocSignaturesInfo from "@/components/DocSignaturesInfo";

export default {
  name: 'RelatedDocument',
  components: { Access, ApprovalUsers, ContragentSelectV2, DocSignaturesInfo },
  props: { },
  data() {
    return {
      service: new DocService(),
      Enum: Enum,
      RolesEnum: RolesEnum,
      findRole: findRole,
      getShortDateString: getShortDateString,
      loginedUser: JSON.parse(localStorage.getItem("loginedUser")),

      visibility: {
        documentInfoSidebar: false,
        revisionDialog: false,
        sendToApproveDialog: false,
      },

      loading: false,
      haveAccess: true,
      activeTab: 0,
      changed: false,

      contract: null,
      contractParams: [],
      pdf: null,
      sciadvisorRequest: false,
      sciadvisorRejection: null,
      execution: false,
      executed: false,
      attachments: {},
      revisionText: null,

      selectedUsers: [],
      stages: [],

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
          label: this.$t("common.send"),
          icon: "pi pi-send",
          disabled: () => !this.contract,
          items: [
            {
              label: this.$t("contracts.menu.toSciadvisor"),
              icon: "fa-regular fa-handshake",
              visible: () => this.contract && this.contract.docHistory.stateId === Enum.CREATED.ID && !this.sciadvisorRequest,
              command: () => { this.scienceAdvisorApproval() }
            },
            {
              label: this.$t("common.tosign"),
              icon: "pi pi-user-edit",
              visible: () => this.contract && this.contract.newParams.sciadvisor.value &&
                this.contract.newParams.sciadvisor.value.data && 
                this.contract.newParams.sciadvisor.value.data.userID === this.loginedUser.userID &&
                this.contract.docHistory.stateId === Enum.CREATED.ID,
              command: () => { this.open('sendToApproveDialog') }
            },
            {
              label: this.$t("common.revision"),
              icon: "fa-regular fa-circle-xmark",
              visible: () => this.contract && this.contract.newParams.sciadvisor.value &&
                this.contract.newParams.sciadvisor.value.data && 
                this.contract.newParams.sciadvisor.value.data.userID === this.loginedUser.userID &&
                this.contract.docHistory.stateId === Enum.CREATED.ID && this.sciadvisorRequest,
              command: () => { this.open('revisionDialog') }
            },
            {
              label: this.$t("contracts.menu.sendForExecution"),
              icon: "fa-solid fa-envelope-circle-check",
              visible: () => this.contract && !(this.executed || this.execution) && this.contract.docHistory.stateId === Enum.APPROVED.ID && 
                (this.findRole(null, this.RolesEnum.roles.ActsToExecution) || this.findRole(null, this.RolesEnum.roles.MainAdministrator)),
              command: () => { this.sendForExecution() }
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
        }
      ],

      backmenu: [
        {
          label: this.$t("educomplex.tooltip.previous"),
          icon: "fa-solid fa-arrow-left",
          command: () => { this.$router.back() }
        },
        {
          label: this.$t("contracts.contract"),
          icon: "fa-solid fa-file-contract",
          command: () => { this.$router.push('/documents/contracts/' + this.$route.params.uuid) }
        },
        {
          label: this.$t("contracts.menu.journal"),
          icon: "fa-solid fa-file-invoice",
          command: () => { this.$router.push('/documents/contracts/' + this.$route.params.uuid + '/related') }
        }
      ]
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
        uuid: this.$route.params.relatedUUID
      }).then(res => {
        this.contract = res.data;

        if (this.contract.requests) {
          for (let i = this.contract.requests.length-1; i >= 0; i--) {
            if (this.contract.requests[i].type === this.Enum.DocumentRequestType.ScienceAdvisorApproval) {
              if (this.contract.requests[i].status === 0) {
                this.sciadvisorRequest = true;
              } else if (this.contract.requests[i].status === 2) {
                this.sciadvisorRejection = this.contract.requests[i].commentary;
              }

              break;
            }
          }

          for (let i = this.contract.requests.length-1; i >= 0; i--) {
            if (this.contract.requests[i].type === this.Enum.DocumentRequestType.AccountantsExecutionRequest) {
              if (this.contract.requests[i].status === 1) {
                this.executed = true;
              } else if (this.contract.requests[i].status === 0) {
                this.execution = true;
              }

              break;
            }
          }
        }

        this.getParams();

        this.clearStages();

        this.loading = false;
      }).catch(err => {
        this.loading = false;

        if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout");
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath), null);
          if (err.response.status == 403) {
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
      this.attachments = {};

      let param = this.contract.newParams['registration_number'];
      if (param) {
        param.value = this.contract.number;
        param.uuid = this.generateUUID();
        this.contractParams.push(param);
      }

      param = this.contract.newParams['registration_date'];
      if (param) {
        param.value = this.contract.registerDate;
        param.value = param.value ? new Date(param.value) : null;
        param.uuid = this.generateUUID();
        this.contractParams.push(param);
      }

      param = this.contract.newParams['parent_registration_number'];
      if (param) {
        param.uuid = this.generateUUID();
        this.contractParams.push(param);
      }

      param = this.contract.newParams['parent_registration_date'];
      if (param) {
        param.value = param.value ? new Date(param.value) : null;
        param.uuid = this.generateUUID();
        this.contractParams.push(param);
      }

      param = this.contract.newParams['executor'];
      if (param) {
        param.uuid = this.generateUUID();
        this.contractParams.push(param);
      }

      param = this.contract.newParams['sciadvisor'];
      if (param) {
        param.uuid = this.generateUUID();
        this.contractParams.push(param);
      }

      param = this.contract.newParams['table'];
      if (param) {
        param.uuid = this.generateUUID();
        this.contractParams.push(param);
      }

      param = this.contract.newParams['act_amount'];
      if (param) {
        param.uuid = this.generateUUID();
        this.contractParams.push(param);
      }

      param = this.contract.newParams['act_amount_words'];
      if (param) {
        param.uuid = this.generateUUID();
        this.contractParams.push(param);
      }

      param = this.contract.newParams['justification'];
      if (param) {
        param.uuid = this.generateUUID();
        this.contractParams.push(param);
      }

      param = this.contract.newParams['agreement'];
      if (param) {
        param.uuid = this.generateUUID();
        this.contractParams.push(param);
      }

      param = this.contract.newParams['research_topic'];
      if (param) {
        param.uuid = this.generateUUID();
        this.contractParams.push(param);
      }

      param = this.contract.newParams['act_amount_after'];
      if (param) {
        param.uuid = this.generateUUID();
        this.contractParams.push(param);
      }

      param = this.contract.newParams['act_amount_after_words'];
      if (param) {
        param.uuid = this.generateUUID();
        this.contractParams.push(param);
      }

      param = this.contract.newParams['attachments'];
      if (param) {
        param.uuid = this.generateUUID();
        this.contractParams.push(param);
      }
    },
    generateUUID() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = crypto.getRandomValues(new Uint8Array(1))[0] % 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
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

      let formData = new FormData();
      formData.append("document", JSON.stringify(this.contract));

      for (let temp in this.attachments) {
        formData.append(temp, this.attachments[temp])
      }

      this.loading = true;

      this.service.saveDocumentMultipartV2(formData).then(res => {
        this.contract = res.data;

        this.getParams();

        this.loading = false;
        this.changed = false;
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
    scienceAdvisorApproval() {
      this.loading = true;

      this.service.createNewDocumentRequest({
        requestType: this.Enum.DocumentRequestType.ScienceAdvisorApproval,
        docId: this.contract.id,
      }).then(res => {
        this.loading = false;
        
        this.getContract();
      }).catch(err => {
        this.loading = false;

        if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout");
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath), null);
          if (err.response.status == 403) {
            this.haveAccess = false;
          }
        } else {
          console.log(err)
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
        }
      })
    },
    sendToApprove(approvalUsers) {
      this.loading = true;

      this.service.sendDocumentToApprovalV2({
        uuid: this.contract.uuid,
        approvalStages: approvalUsers,
      }).then(res => {
        this.close("sendToApproveDialog");
        this.loading = false;

        location.reload();
      }).catch(err => {
        this.loading = false;

        if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout");
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath), null);
          if (err.response.status == 403) {
            this.haveAccess = false;
          }
        } else {
          console.log(err)
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
        }
      });
    },
    sendToSign(approvalUsers) {
      this.loading = true;

      let revisionRequest = null;

      for (let i = this.contract.requests.length-1; i >= 0; i--) {
        if (this.contract.requests[i].type === this.Enum.DocumentRequestType.ScienceAdvisorApproval) {
          if (this.contract.requests[i].status === 0) {
            revisionRequest = this.contract.requests[i];
          }

          break;
        }
      }
      
      if (revisionRequest) {
        this.service.updateDocRequestV2({
          requestId: revisionRequest.id,
          status: 1,
        }).then(res => {
          this.sendToApprove(approvalUsers);
        }).catch(err => {
          this.loading = false;

          if (err.response && err.response.status == 401) {
            this.$store.dispatch("logLout");
          } else if (err.response && err.response.data && err.response.data.localized) {
            this.showMessage('error', this.$t(err.response.data.localizedPath), null);
            if (err.response.status == 403) {
              this.haveAccess = false;
            }
          } else {
            console.log(err)
            this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
          }
        });
      } else {
        this.sendToApprove(approvalUsers);
      }
    },
    input() {
      this.changed = true;
    },
    contragentUpdated(contr, param) {
      for (let i = 0; i < this.contractParams.length; i++) {
        if (this.contractParams[i].description === param.description) {
          this.contractParams[i].value = contr;
        }
      }

      this.input();
    },
    validate() {
      for (let prop in this.contract.newParams) {
        if (['text', 'date'].includes(this.contract.newParams[prop].name)) {
          if (['registration_number', 'registration_date'].includes(prop)) {
            continue;
          }

          if (this.isNull(this.contract.newParams[prop].value)) {
            return false;
          }
        } else if (['executor', 'sciadvisor'].includes(prop)) {
          if (this.isNull(this.contract.newParams[prop].value) || this.isNull(this.contract.newParams[prop].value.data)) {
            return false;
          }

          if (this.contract.newParams[prop].value.type === this.Enum.ContragentType.Organization &&
            this.isNull(this.contract.newParams[prop].value.data.signer)) {
              return false;
          }
        } else if (['table', 'attachments'].includes(prop)) {
          if (this.isNull(this.contract.newParams[prop].value) || this.contract.newParams[prop].value.length < 1) {
            return false;
          }
        }
      }
    },
    isNull(param) {
      if (param === null || param === undefined || param === 'null' || param === '') {
        return true;
      }

      return false;
    },
    newWork(id) {
      if (!this.contractParams[id].value) {
        this.contractParams[id].value = [];
      }

      let newWork = {};

      for (let colId in this.contractParams[id].properties.columns) {  
        let prop = this.contractParams[id].properties.columns[colId];

        if (prop === 'number') {
          newWork[prop] = this.contractParams[id].value.length + 1;
        } else {
          newWork[prop] = "null";
        }
      }

      this.contractParams[id].value.push(newWork);

      this.input();
    },
    uploadAttachment(event) {
      let uuid = this.generateUUID();
      this.attachments[uuid] = event.files[0];
      
      for (let i = 0; i < this.contractParams.length; i++) {
        if (this.contractParams[i].description === "attachments") {
          if (!this.contractParams[i].value) {
            this.contractParams[i].value = [];
          }

          this.contractParams[i].value.push({
            filename: event.files[0].name,
            temp: uuid,
          });
        }
      }
    },
    downloadFile(filename, filepath) {
      fetch(`${smartEnuApi}/serve?path=${filepath}`, {
        method: 'GET',
        headers: getHeader(),
      }).then(res => res.blob()).then(blob => {
        this.loading = false;

        var url = window.URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
        a.click();
        a.remove();
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
    removeAttachment(data) {
      if (data.temp) {
        delete this.attachments[data.temp];
      }
    },
    revision() {
      let revisionRequest = null;

      for (let i = this.contract.requests.length-1; i >= 0; i--) {
        if (this.contract.requests[i].type === this.Enum.DocumentRequestType.ScienceAdvisorApproval) {
          if (this.contract.requests[i].status === 0) {
            revisionRequest = this.contract.requests[i];
          }

          break;
        }
      }
      
      if (!revisionRequest) {
        return
      }
      
      this.loading = true;

      this.service.updateDocRequestV2({
        requestId: revisionRequest.id,
        status: 2,
        commentary: this.revisionText,
      }).then(res => {
        this.loading = false;
        this.close("revisionDialog");

        location.reload();
      }).catch(err => {
        this.loading = false;

        if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout");
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath), null);
          if (err.response.status == 403) {
            this.haveAccess = false;
          }
        } else {
          console.log(err)
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
        }
      })
    },
    clearStages() {
      this.selectedUsers = [{
          stage: 1,
          users: [this.contract.newParams.executor.value.data],
          certificate: {
            namekz: "Жеке тұлғаның сертификаты",
            nameru: "Сертификат физического лица",
            nameen: "Certificate of an individual",
            value: "individual"
          }
      }, {
        stage: 2,
          users: [this.contract.newParams.sciadvisor.value.data],
          certificate: {
            namekz: "Жеке тұлғаның сертификаты",
            nameru: "Сертификат физического лица",
            nameen: "Certificate of an individual",
            value: "individual"
          }
      }];

      this.stages = [
        {
          stage: 1,
          users: [this.contract.newParams.executor.value.data],
          titleRu: "Исполнитель",
          titleKz: "Орындаушы",
          titleEn: "Executor",
          certificate: {
            namekz: "Жеке тұлғаның сертификаты",
            nameru: "Сертификат физического лица",
            nameen: "Certificate of an individual",
            value: "individual"
          },
        },
        {
          stage: 2,
          users: [this.contract.newParams.sciadvisor.value.data],
          titleRu: "Научный руководитель",
          titleKz: "Жоба жетекшісі",
          titleEn: "Scientific adviser",
          certificate: {
            namekz: "Жеке тұлғаның сертификаты",
            nameru: "Сертификат физического лица",
            nameen: "Certificate of an individual",
            value: "individual"
          },
        },
        {
          stage: 3,
          users: null,
          titleRu: "Лица, ответственные за заключение договоров и представление актов в сфере сопровождения научных проектов",
          titleKz: "Ғылыми жобаларды қолдау секторынан келісім-шарттар жасасуға және актілер тапсыруға жауаптылар",
          titleEn: "Those responsible for concluding contracts and submitting acts from the sector of scientific project support",
          certificate: {
            namekz: "Ішкі құжат айналымы үшін (ГОСТ)",
            nameru: "Для внутреннего документооборота (ГОСТ)",
            nameen: "For internal document management (GOST)",
            value: "internal"
          },
        },
        {
          stage: 4,
          users: null,
          titleRu: "Бухгалтер",
          titleKz: "Есепші",
          titleEn: "Accountant",
          certificate: {
            namekz: "Ішкі құжат айналымы үшін (ГОСТ)",
            nameru: "Для внутреннего документооборота (ГОСТ)",
            nameen: "For internal document management (GOST)",
            value: "internal"
          },
        },
        {
          stage: 5,
          users: null,
          titleRu: "Заведующий отделом научных проектов и публикаций",
          titleKz: "Ғылыми жобалар және басылымдар бөлімінің меңгерушісі",
          titleEn: "Head of the Department of Scientific Projects and Publications",
          certificate: {
            namekz: "Ішкі құжат айналымы үшін (ГОСТ)",
            nameru: "Для внутреннего документооборота (ГОСТ)",
            nameen: "For internal document management (GOST)",
            value: "internal"
          },
        },
        {
          stage: 6,
          users: null,
          titleRu: "Директор департамента",
          titleKz: "Департамент директоры",
          titleEn: "Department director",
          certificate: {
            namekz: "Ішкі құжат айналымы үшін (ГОСТ)",
            nameru: "Для внутреннего документооборота (ГОСТ)",
            nameen: "For internal document management (GOST)",
            value: "internal"
          },
        }
      ];
    },
    sendForExecution() {
      this.service.createNewDocumentRequest({
        requestType: this.Enum.DocumentRequestType.AccountantsExecutionRequest,
        docId: this.contract.id,
      }).then(res => {
        this.getContract();
      }).catch(err => {
        if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout")
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath), null)
        } else {
          console.log(err)
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
        }
      })
    }
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
:deep(.p-datatable-footer), 
:deep(.p-button-link),
:deep(.p-datatable-thead > tr > th) {
  padding-top: 0rem;
  padding-bottom: 0rem;
}
</style>