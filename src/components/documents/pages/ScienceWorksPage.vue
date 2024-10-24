<template>
  <ProgressSpinner v-if="loading" class="progress-spinner" strokeWidth="5"/>
  <div class="flex flex-row mb-3">
    <div v-if="!uuid" class="arrow-icon" @click="$router.back()">
      <i class="fas fa-arrow-left"></i>
    </div>
    <h4 class="m-0">{{ $t("scienceWorks.types." + getScienceWorkType()) }}</h4>
  </div>
  <BlockUI v-if="haveAccess" :blocked="loading" class="card">
    <Menubar :model="menu" class="m-0 pt-0 pb-0"></Menubar>
    <div v-if="scienceWork" class="flex flex-column flex-grow-1">
      <div class="lg:col-6 mt-3">
        <p> {{ $t('common.state') + ": " }}
          <span v-if="getScienceWorkType() !== DocEnum.ScienceWorkType.ScopusArticle" :class="'customer-badge status-' + scienceWork.docHistory.code">
                {{ scienceWork.docHistory[$i18n.locale === 'en' ? 'stateEn' : $i18n.locale === 'ru' ? 'stateRus' : 'stateKaz'] }}</span>
          <span v-if="getScienceWorkType() === DocEnum.ScienceWorkType.ScopusArticle" class="customer-badge status-status_signed">Scopus</span>
          <span v-if="isFromPlatonus()" class="customer-badge status-status_signing">Platonus</span>
        </p>
      </div>
      <div class="p-fluid md:col-6" v-if="scienceWork.docHistory.stateId === DocEnum.REVISION.ID">
        <InlineMessage severity="error">{{ scienceWork.docHistory.comment }}</InlineMessage>
      </div>
      <div class="flex-grow-1" style="overflow: scroll; height: 150px;" v-if="contractParams">
        <div v-for="param in contractParams" :key="param.uuid">
          <div class="p-fluid md:col-6 pb-0">
            <label>{{ $t('scienceWorks.labels.' + param.description) }}</label>
          </div>

          <div class="p-fluid md:col-6" v-if="'text' === param.name">

            <template v-if="'publicationCategory' === param.description">
              <Dropdown v-model="param.value" :options="publicationCategories" class="w-full" @change="input"
                        :option-label="publicationCategoriesLabel" :option-value="publicationCategoriesValue"
                        :disabled="this.needMySign() || (scienceWork.docHistory.stateId !== DocEnum.CREATED.ID && scienceWork.docHistory.stateId !== DocEnum.REVISION.ID)">
              </Dropdown>
            </template>
            <div v-else-if="scienceWork.docHistory.stateId !== DocEnum.CREATED.ID && !this.changed && param.value && param.description === 'link'" class="p-inputgroup p-input-filled">
              <Share  @click="input" :data="param.value" :disabled="this.needMySign() || (scienceWork.docHistory.stateId !== DocEnum.CREATED.ID &&
                scienceWork.docHistory.stateId !== DocEnum.REVISION.ID)" :param="param.value && param.description === 'link'" :label="$t('ncasigner.copy')" @copy="onCopy()"/>
            </div>
            <div v-else class="p-inputgroup p-input-filled">
              <InputText @click="input" v-model="param.value" type="text" :disabled="this.needMySign() || (scienceWork.docHistory.stateId !== DocEnum.CREATED.ID &&
                scienceWork.docHistory.stateId !== DocEnum.REVISION.ID)" :label="$t('ncasigner.copy')" @copy="onCopy()"/>
            </div>
          </div>
          <div class="p-fluid md:col-6" v-if="'number' === param.name">
            <InputNumber @change="input" v-model="param.value"  :minFractionDigits="0" :maxFractionDigits="2" :disabled="this.needMySign() || (scienceWork.docHistory.stateId !== DocEnum.CREATED.ID &&
              scienceWork.docHistory.stateId !== DocEnum.REVISION.ID)" @input="input"/>
          </div>
          <div class="p-fluid md:col-6" v-if="'date' === param.name">
            <PrimeCalendar @change="input" v-model="param.value" dateFormat="yy" view="year" :disabled="this.needMySign() || (scienceWork.docHistory.stateId !== DocEnum.CREATED.ID &&
              scienceWork.docHistory.stateId !== DocEnum.REVISION.ID)" @dateSelect="input"></PrimeCalendar>
          </div>
          <div class="p-fluid md:col-6" v-if="'persons' === param.name">
            <FindUser @change="input" searchMode="ldap" v-model="param.value" :disabled="this.needMySign() || (scienceWork.docHistory.stateId !== DocEnum.CREATED.ID &&
              scienceWork.docHistory.stateId !== DocEnum.REVISION.ID)" :userType="0" @input="input()" @remove="input()"></FindUser>
          </div>
          <div class="md:col-6" v-if="'options' === param.name">
            <template v-if="'editionType' === param.description">
              <SelectButton  v-model="param.value" :options="editionTypes" :allowEmpty="false" :unselectable="false" @change="input"
                :disabled="this.needMySign() || (scienceWork.docHistory.stateId !== DocEnum.CREATED.ID && scienceWork.docHistory.stateId !== DocEnum.REVISION.ID)">
                <template #option="slotProps">
                  {{ $t('scienceWorks.editionTypes.' + slotProps.option) }}
                </template>
              </SelectButton>
            </template>
          </div>
          <div class="md:col-6" v-if="'koksnvo' === param.name">
            <Dropdown v-model="param.value" :options="koksnvoEditions" class="w-full" optionValue="id" :optionLabel="'name_' + $i18n.locale" @change="input"
                      :disabled="this.needMySign() || (scienceWork.docHistory.stateId !== DocEnum.CREATED.ID && scienceWork.docHistory.stateId !== DocEnum.REVISION.ID)"></Dropdown>
          </div>
          <div class="md:col-6" v-if="'attachments' === param.name">
            <DataTable :value="param.value" class="p-datatable-small w-full">
              <template v-if="scienceWork.docHistory.stateId === DocEnum.CREATED.ID || scienceWork.docHistory.stateId === DocEnum.REVISION.ID" #footer>
                <FileUpload :disabled="this.needMySign()" mode="basic" accept=".pdf" :customUpload="true" @uploader="uploadAttachment($event)"
                            :auto="true" :chooseLabel="$t('ncasigner.chooseFile')" ref="attachmentUploader"/>
                <small class="p-error" v-if="validation.filePath">{{ $t("common.requiredField") }}</small>
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
              <Column v-if="!this.needMySign()">
                <template #body="{data, index}">
                  <Button :disabled="this.needMySign()" v-if="scienceWork.docHistory.stateId === DocEnum.CREATED.ID || scienceWork.docHistory.stateId === DocEnum.REVISION.ID"
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
  </BlockUI>
  <div v-else class="card">
    <Access textMode="short" :showLogo="false" returnMode="back"></Access>
  </div>
  <!-- documentInfoSidebar -->
  <Sidebar v-model:visible="visibility.documentInfoSidebar" position="right" class="p-sidebar-lg">
    <DocSignaturesInfo :docIdParam="scienceWork.uuid"></DocSignaturesInfo>
  </Sidebar>
  <!-- sendToApproveDialog -->
  <Dialog :header="$t('common.action.sendToApprove')" v-model:visible="visibility.sendToApproveDialog"
          :style="{width: '50vw'}">
    <div class="p-fluid">
      <ApprovalUsers :approving="loading" v-model="selectedUsers" @closed="close('sendToApproveDialog')"
                     @approve="sendToApprove($event)" :stages="stages" mode="standard"></ApprovalUsers>
    </div>
  </Dialog>
  <!-- revisionDialog -->
  <Dialog :header="$t('common.revision')" :modal="true" v-model:visible="visibility.revisionDialog" style="width: 30vw;">
    <div class="p-fluid col-12">
      <Textarea v-model="revisionText" autoResize rows="5" cols="30" />
    </div>
    <template #footer>
      <Button class="p-button-danger" :disabled="!revisionText" :label="$t('common.revision')" @click="revision()" />
      <Button :label="$t('common.cancel')" @click="close('revisionDialog')" />
    </template>
  </Dialog>
</template>
<script>
import {getHeader, smartEnuApi} from "@/config/config";
import DocEnum from "@/enum/docstates/index";
import {DocService} from "@/service/doc.service";
import Access from "@/pages/Access.vue";
import ApprovalUsers from "@/components/ncasigner/ApprovalUsers/ApprovalUsers";
import DocSignaturesInfo from "@/components/DocSignaturesInfo.vue";
import FindUser from "@/helpers/FindUser";
import {ScienceService} from "@/service/science.service";
import Share from "@/components/Share.vue";

export default {
  name: 'ScienceWorksPage',
  components: {Share, Access, ApprovalUsers, DocSignaturesInfo, FindUser},
  props: {
    uuid: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      service: new DocService(),
      scienceService: new ScienceService(),
      DocEnum: DocEnum,

      visibility: {
        documentInfoSidebar: false,
        revisionDialog: false,
        sendToApproveDialog: false,
      },

      loading: false,
      haveAccess: true,
      changed: false,

      scienceWork: null,
      contractParams: [],
      attachments: {},
      revisionText: null,

      selectedUsers: [],
      stages: [],

      menu: [
        {
          label: this.$t("common.save"),
          icon: "pi pi-fw pi-save",
          disabled: () => !this.scienceWork || (this.scienceWork.docHistory.stateId != DocEnum.CREATED.ID &&
              this.scienceWork.docHistory.stateId != DocEnum.REVISION.ID) || !this.changed,
          command: () => { this.saveDocument() }
        },
        {
          label: this.$t("common.send"),
          icon: "pi pi-send",
          disabled: () => !this.scienceWork,
          items: [
            {
              label: this.$t("common.tosign"),
              icon: "pi pi-user-edit",
              visible: () => this.scienceWork && (this.scienceWork.docHistory.stateId === DocEnum.CREATED.ID ||
                  this.scienceWork.docHistory.stateId === DocEnum.REVISION.ID),
              command: () => { this.open('sendToApproveDialog') }
            },
            {
              label: this.$t("common.revision"),
              icon: "fa-regular fa-circle-xmark",
              visible: () => this.scienceWork && this.scienceWork.docHistory.stateId === DocEnum.INAPPROVAL.ID &&
                  this.needMySign(),
              command: () => { this.open('revisionDialog') }
            },
          ]
        },
        {
          label: this.$t('common.approvalList'),
          icon: "pi pi-user-edit",
          disabled: () => !this.scienceWork || !this.scienceWork.docHistory || this.scienceWork.docHistory.stateId < DocEnum.INAPPROVAL.ID,
          command: () => { this.open('documentInfoSidebar') }
        },
      ],

      editionTypes: ['digital', 'printed'],
      koksnvoEditions: [],
      publicationCategories: ['beforeMastersThesis', 'afterMastersThesis', 'beforeDoctoralDissertation', 'afterDoctoralDissertation', 'others'],
      validation: {
        filePath: false,
      }
    }
  },
  mounted() {
    this.$emit('apply-flex', true);

    this.getScienceWork();
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
    onCopy() {
      this.showMessage("success", this.$t('ncasigner.successCopy'));
    },
    getScienceWork() {
      this.loading = true;

      this.service.getDocumentV2({
        uuid: this.uuid ? this.uuid : this.$route.params.uuid
      }).then(res => {
        this.scienceWork = res.data;

        this.getParams();

        this.clearStages();

        for (let desc in this.scienceWork.newParams) {
          if (this.scienceWork.newParams[desc].name === 'koksnvo') {
            this.getKoksnvoEditions();
          }
        }

        this.loading = false;
      }).catch(err => {
        this.loading = false;

        if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout");
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath));
          if (err.response.status == 403) {
            this.haveAccess = false;
          }
        } else {
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
        }
      });
    },
    getKoksnvoEditions() {
      this.scienceService.getScienceEditions({
        id: null,
        page: 0,
        rows: 25,
      }).then(res => {
        this.koksnvoEditions = res.data.editions;
      }).catch(err => {
        if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout")
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath), null)
        } else {
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
        }
      });
    },
    sendToApprove(approvalUsers) {
      if (this.changed) {
        this.showMessage("warn", this.$t("common.tosign"), this.$t("common.message.saveChanges"));
        return;
      }

      this.loading = true;

      this.service.sendDocumentToApprovalV2({
        uuid: this.scienceWork.uuid,
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
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
        }
      });
    },
    getScienceWorkType() {
      if (!this.scienceWork || !this.scienceWork.newParams || !this.scienceWork.newParams.scienceWorkType) {
        return '';
      }

      return this.scienceWork.newParams.scienceWorkType.value;
    },
    isFromPlatonus() {
      if (this.scienceWork && this.scienceWork.newParams && this.scienceWork.newParams.pub_platonus_id) {
        return true;
      }

      return false;
    },
    revision() {
      this.loading = true;

      this.service.documentRevisionV2({
        uuid: this.scienceWork.uuid,
        comment: this.revisionText,
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
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
        }
      })
    },
    needMySign() {
      if (!this.scienceWork || !this.scienceWork.approvalStages || this.scienceWork.approvalStages.length < 1) {
        return false;
      }

      let loginedUser = JSON.parse(localStorage.getItem("loginedUser"));
      let stages = this.scienceWork.approvalStages;
      let need = false;

      for (let i = 0; i < stages.length; i++) {
        let nextStage = true;

        for (let j = 0; j < stages[i].users.length; j++) {
          if (stages[i].users[j].userID === loginedUser.userID && stages[i].usersApproved[j] === 0) {
            need = true;
            break;
          }

          if (stages[i].usersApproved[j] === 0) {
            nextStage = false;
          }
        }

        if (!nextStage) {
          break;
        }
      }

      return need;
    },
    input() {
      this.changed = true;
    },
    saveDocument() {
      if (!this.attachments || Object.keys(this.attachments).length === 0) {
        const hasNotAttachmentsParam = this.contractParams.some(param => {
          if (param.name === 'attachments') {
            if (param.value === null) {
              return true;
            }

            if (param.value.length === 0) {
              return true;
            }

            return false
          }
        });

        if (hasNotAttachmentsParam) {
          this.validation.filePath = true;
          this.showMessage("warn", this.$t('common.message.fillError'));
          return;
        }
      }

      this.validation.filePath = false;

      for (let i = 0; i < this.contractParams.length; i++) {
        this.scienceWork.newParams[this.contractParams[i].description] = this.contractParams[i];
      }

      let formData = new FormData();
      formData.append("document", JSON.stringify(this.scienceWork));

      for (let temp in this.attachments) {
        formData.append(temp, this.attachments[temp])
      }

      this.loading = true;

      this.service.saveDocumentMultipartV2(formData).then(res => {
        this.scienceWork = res.data;

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
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
        }
      })
    },
    getParams() {
      this.contractParams = [];
      this.attachments = {};

      let paramsName = ["publicationType", "publicationCategory", "publicationName", "publicationDate",
        "editionType", "editionFullName",  "editionName", "editionNumber", "editionPages", "subtypeDescription",
        "issn", "isbn", "koksnvo", "link", "printedPages", "participationInGroup", "recommendedBy",
        "coauthorsInternal", "coauthorsExternal", "attachments",];

      for (let name of paramsName) {
        let param = this.scienceWork.newParams[name];
        if (param) {
          if (param.name === 'date') {
            param.value = param.value ? new Date(param.value) : null;
          }

          param.uuid = this.generateUUID();
          this.contractParams.push(param);
        }
      }
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

          this.input();
        }
      }
    },
    downloadFile(filename, filepath) {
      this.loading = true;

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
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
        }
      })
    },
    removeAttachment(data) {
      if (data.temp) {
        delete this.attachments[data.temp];

        this.input();
      }
    },
    generateUUID() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = crypto.getRandomValues(new Uint8Array(1))[0] % 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    },
    clearStages() {
      this.selectedUsers = [];
      this.stages = [
        {
          stage: 1,
          users: null,
          titleRu: "Соискатель",
          titleKz: "Өтініш беруші",
          titleEn: "Applicant",
          certificate: DocEnum.CertificatesArray.Individual,
        }
      ];

      if ([DocEnum.ScienceWorkType.ScopusArticle, DocEnum.ScienceWorkType.PublicationKOKSNVO].includes(this.getScienceWorkType())) {
        this.stages.push(
            {
              stage: 2,
              users: null,
              titleRu: "Начальник Управление научных изданий и наукометрических ресурсов",
              titleKz: "Ғылыми басылымдар және ғылымометриялық ресурстар басқармасының бастығы",
              titleEn: "Head of the Department of Scientific Publications and Scientometric Resources",
              certificate: DocEnum.CertificatesArray.Internal,
            },
            {
              stage: 3,
              users: null,
              titleRu: "Директор Департамента науки",
              titleKz: "Ғылым департаментінің директоры",
              titleEn: "Директор Департамента науки",
              certificate: DocEnum.CertificatesArray.Internal,
            },
        );
      } else {
        this.stages.push(
          {
            stage: 2,
            users: null,
            titleRu: "Заведующий кафедры",
            titleKz: "Кафедра меңгерушісі",
            titleEn: "Head of Department",
            certificate: DocEnum.CertificatesArray.Internal,
          },
          {
            stage: 3,
            users: null,
            titleRu: "Секретарь Правления - Ученый секретарь",
            titleKz: "Кеңес хатшысы – Ғылыми хатшы",
            titleEn: "Secretary of the Board - Scientific Secretary",
            certificate: DocEnum.CertificatesArray.Internal,
          },
        );
      }
    },
    publicationCategoriesLabel(data) {
      return this.$t('scienceWorks.publicationCategories.' + data);
    },
    publicationCategoriesValue(data) {
      return data;
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
:deep(.p-datatable-footer),
:deep(.p-button-link),
:deep(.p-datatable-thead > tr > th) {
  padding-top: 0rem;
  padding-bottom: 0rem;
}
</style>
