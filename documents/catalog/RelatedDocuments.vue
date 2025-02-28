<template>
  <ProgressSpinner v-if="loading" class="progress-spinner" strokeWidth="5"/>
  <div class="flex flex-row mb-3">
    <div class="arrow-icon" @click="(event) => {$refs.backmenu.toggle(event)}">
      <i class="fas fa-arrow-left"></i>
      <Menu ref="backmenu" :model="backmenu" :popup="true" />
    </div>
    <h4 class="m-0">{{ $t("contracts.menu.relatedDocument") }}</h4>
  </div>
  <BlockUI :blocked="loading" class="card">
    <Toolbar class="p-1">
      <template #start>
        <div class="flex flex-wrap gap-2">
          <Button class="p-button-info align-items-center" style="padding: 0.25rem 1rem;"
            @click="openDocument" :disabled="!currentDocument">
            <i class="fa-regular fa-address-card" /> &nbsp;{{ $t("contracts.card") }}</Button>
<!--          <Button class="p-button-info align-items-center" style="padding: 0.25rem 1rem;"-->
<!--            @click="createAct" :disabled="true || !templates || templates.length < 1">-->
<!--            <i class="fa-solid fa-file-circle-plus" /> &nbsp;{{ $t("contracts.menu.newDocument") }}</Button>-->
          <Button v-if="this.findRole(null, RolesEnum.roles.ActsToExecution) || this.findRole(null, RolesEnum.roles.MainAdministrator)"
            class="p-button-info align-items-center" style="padding: 0.25rem 1rem;" @click="sendForExecution(currentDocument)" 
            :disabled="!currentDocument || currentDocument.docHistory.stateId !== Enum.APPROVED.ID || executed(currentDocument) || execution(currentDocument)">
            <i class="fa-solid fa-envelope-circle-check" /> &nbsp;{{ $t("contracts.menu.sendForExecution") }}</Button>
        </div>
      </template>
    </Toolbar>
    <DataTable :value="documents" dataKey="id" :rows="rows" :totalRecords="total" :first="first"
      :paginator="true" :paginatorTemplate="paginatorTemplate" :rowsPerPageOptions="[10, 25, 50]"
      :currentPageReportTemplate="currentPageReportTemplate" :lazy="true" :loading="tableLoading" 
      scrollable scrollHeight="flex" v-model:selection="currentDocument" selectionMode="single" 
      :rowHover="true" stripedRows class="flex-grow-1" @page="onPage">
      <template #empty>
        {{ this.$t("common.recordsNotFound") }}
      </template>
      <Column :header="$t('contracts.columns.createDate')" style="min-width: 150px;">
        <template #body="slotProps">
          {{ getLongDateString(slotProps.data.createDate) }}
        </template>
      </Column>
      <Column :header="$t('contracts.columns.author')" style="min-width: 150px;">
        <template #body="slotProps">
          {{ getFullname(slotProps.data.owner) }}
        </template>
      </Column>
      <Column :header="$t('contracts.columns.regNumber')" style="min-width: 100px;">
        <template #body="slotProps">
          {{ slotProps.data.number ? slotProps.data.number : "" }}
        </template>
      </Column>
      <Column :header="$t('contracts.columns.regDate')" style="min-width: 100px;">
        <template #body="slotProps">
          {{ slotProps.data.registerDate ? getShortDateString(slotProps.data.registerDate) : "" }}
        </template>
      </Column>
      <Column :header="$t('contracts.columns.contractNumber')" style="min-width: 100px;">
        <template #body="slotProps">
          {{ getContractNumber(slotProps.data) }}
        </template>
      </Column>
      <Column :header="$t('contracts.columns.contractDate')" style="min-width: 100px;">
        <template #body="slotProps">
          {{ getContractDate(slotProps.data) }}
        </template>
      </Column>
      <!-- <Column :header="$t('contracts.columns.description')" style="min-width: 250px;">
        <template #body="slotProps">
          {{ slotProps.data.template ? getTemplateName(slotProps.data.template) : '' }}
        </template>
      </Column> -->
      <Column :header="$t('contracts.columns.status')" style="min-width: 150px;">
        <template #body="slotProps">
          <div class="flex flex-wrap column-gap-1 row-gap-1">
            <span :class="'customer-badge status-' + slotProps.data.docHistory.code">
              {{ slotProps.data.docHistory[$i18n.locale === 'en' ? 'stateEn' : $i18n.locale === 'ru' ? 'stateRus' : 'stateKaz'] }} 
            </span>
            <span v-if="sciadvisorRequest(slotProps.data)" class="ml-1 customer-badge status-status_inapproval">
              {{ $t('contracts.sciadvisorRequest') }}
            </span>
            <span v-if="sciadvisorRevision(slotProps.data)" class="ml-1 customer-badge status-status_revision">
              {{ $t('common.revision') }}
            </span>
            <span v-if="execution(slotProps.data)" class="ml-1 customer-badge status-status_signing">
              {{ $t('contracts.execution') }}
            </span>
            <span v-if="executed(slotProps.data)" class="ml-1 customer-badge status-status_signed">
              {{ $t('contracts.executed') }}
            </span>
          </div>
        </template>
      </Column>
      <Column style="min-width: 50px;">
        <template #body="slotProps">
          <div class="flex flex-wrap">
            <Button v-if="(slotProps.data.docHistory.stateId === Enum.CREATED.ID || 
              slotProps.data.docHistory.stateId === Enum.REVISION.ID) && loginedUser.userID === slotProps.data.creatorID"
              @click="currentDocument=slotProps.data;openDocument()"
              class="p-button-text p-button-info p-1">
              <i class="fa-solid fa-pen fa-xl"></i>
            </Button>
            <Button v-if="slotProps.data.docHistory.stateId === Enum.APPROVED.ID"
              @click="currentDocument=slotProps.data;download()"
              class="p-button-text p-button-info p-1">
              <i class="fa-solid fa-file-arrow-down fa-xl"></i>
            </Button>
            <Button @click="currentDocument=slotProps.data;open('documentInfoSidebar')"
              class="p-button-text p-button-info p-1">
              <i class="fa-solid fa-eye fa-xl"></i>
            </Button>
            <Button v-if="(slotProps.data.docHistory.stateId === Enum.CREATED.ID || 
              slotProps.data.docHistory.stateId === Enum.REVISION.ID) && loginedUser.userID === slotProps.data.creatorID"
              @click="currentDocument=slotProps.data;deleteFile()" class="p-button-text p-button-danger p-1">
              <i class="fa-solid fa-trash fa-xl"></i>
            </Button>
          </div>
        </template>
      </Column>
    </DataTable>
  </BlockUI>
  <!-- documentInfoSidebar -->
  <Sidebar v-model:visible="visibility.documentInfoSidebar" position="right" class="p-sidebar-lg" 
    style="overflow-y: scroll" @hide="getRelatedDocuments">
    <DocSignaturesInfo :docIdParam="currentDocument.uuid"></DocSignaturesInfo>
  </Sidebar>
</template>
<script>
import { b64toBlob, findRole } from "@/config/config";
import { getShortDateString, getLongDateString } from "@/helpers/helper";
import Enum from "@/enum/docstates/index";
import RolesEnum from "@/enum/roleControls/index";

import { DocService } from "@/service/doc.service";
import DocSignaturesInfo from "@/components/DocSignaturesInfo";

export default {
  name: 'RelatedDocuments',
  components: { DocSignaturesInfo },
  props: { },
  data() {
    return {
      service: new DocService(),
      b64toBlob: b64toBlob,
      getShortDateString: getShortDateString,
      getLongDateString: getLongDateString,
      Enum: Enum,
      RolesEnum: RolesEnum,
      findRole: findRole,
      loginedUser: null,
      paginatorTemplate: "FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink JumpToPageDropdown CurrentPageReport RowsPerPageDropdown",
      currentPageReportTemplate: this.$t('common.showingRecordsCount', {
          first: '{first}',
          last: '{last}',
          totalRecords: '{totalRecords}',
        }),

      visibility: {
        documentInfoSidebar: false,
        newDocumentDialog: false,
      },

      loading: false,
      tableLoading: false,

      parentUUID: null,

      documents: [],
      currentDocument: null,
      total: 0,
      first: 0,
      page: 0,
      rows: 10,

      templates: [],
      templateSearchText: null,

      backmenu: [
        {
          label: this.$t("educomplex.tooltip.previous"),
          icon: "fa-solid fa-arrow-left",
          command: () => { this.$router.back() }
        },
        {
          label: this.$t("contracts.contract"),
          icon: "fa-solid fa-file-contract",
          command: () => { this.$router.push('/documents/contracts/' + this.parentUUID) }
        }
      ]
    }
  },
  created() {
    this.loginedUser = JSON.parse(localStorage.getItem("loginedUser"));
  },
  async mounted() {
    this.$emit('apply-flex', true);

    this.parentUUID = this.$route.params.uuid;

    await this.getTemplates();
    this.getRelatedDocuments();
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
    getFullname(user) {
      if (!user) {
        return '';
      }
      
      let name = '';

      if (this.$i18n.locale === 'en' && this.validString(user.thirdnameEn) && this.validString(user.firstnameEn)) {
        name = user.thirdnameEn + ' ' + user.firstnameEn

        if (this.validString(user.lastnameEn)) {
          name += ' ' + user.lastnameEn
        }

        return name
      }

      name = user.thirdName + ' ' + user.firstName 
      
      if (this.validString(user.lastName)) {
        name += ' ' + user.lastName
      }

      return name
    },
    validString(str) {
      if (str && str.length > 0) {
        return true;
      }

      return false;
    },
    getTemplateName(template) {
      let name = ''
      if (this.$i18n.locale === 'en') {
        name = template.descriptionEng
      } else if (this.$i18n.locale === 'ru') {
        name = template.descriptionRus
      } else  {
        name = template.descriptionKaz
      }

      if (name && name.length > 0) {
        return name
      }

      return ''
    },
    onPage(event) {
      this.first = event.first;
      this.page = event.page;
      this.rows = event.rows;
      this.getRelatedDocuments();
    },
    openDocument() {
      if (this.currentDocument) {
        this.$router.push('/documents/contracts/' + this.parentUUID + '/related/' + this.currentDocument.uuid)
      }
    },
    getRelatedDocuments() {
      this.tableLoading = true;

      this.service.getDocumentsV2({
        page: this.page,
        rows: this.rows,
        docType: this.Enum.DocType.ActCompletedWorks,
        relatedTo: this.parentUUID,
      }).then(res => {
        this.documents = res.data.documents;
        this.total = res.data.total;
        this.currentDocument = null;

        this.tableLoading = false;
      }).catch(err => {
        this.documents = [];
        this.total = 0;
        this.currentDocument = null;

        if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout")
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath), null)
        } else {
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
        }

        this.tableLoading = false
      });
    },
    deleteFile() {
      this.$confirm.require({
        message: this.$t("common.doYouWantDelete"),
        header: this.$t("common.confirm"),
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button p-button-success',
        rejectClass: 'p-button p-button-danger',
        accept: () => {
          this.loading = true;
          
          this.service.documentDeleteV2({
            uuid: this.currentDocument.uuid,
          }).then(res => {
            this.showMessage('success', this.$t('common.success'), this.$t('common.message.successCompleted'));
            this.getRelatedDocuments();

            this.loading = false;
          }).catch(err => {
            if (err.response && err.response.status == 401) {
              this.$store.dispatch("logLout")
            } else if (err.response && err.response.data && err.response.data.localized) {
              this.showMessage('error', this.$t(err.response.data.localizedPath), null)
            } else {
              this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
            }

            this.loading = false;
          })
        },
      });
    },
    async getTemplates() {
      this.service.documentTemplatesV2({
        page: 0,
        rows: 50,
        folderType: this.Enum.FolderType.RelatedDocumentTemplates,
      }).then(res => {
        this.templates = res.data.doctemplates
      }).catch(err => {
        this.templates = []

        if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout")
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath), null)
        } else {
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
        }
      })
    },
    download() {
      if (!this.currentDocument || !this.currentDocument.filePath || this.currentDocument.filePath.length < 1) return;

      this.loading = true;

      this.service.downloadDocumentV2({
        uuid: this.currentDocument.uuid
      }).then(res => {
        let pdf = b64toBlob(res.data);

        var link = document.createElement("a");
        link.innerHTML = "Download PDF file";
        link.download = "act.pdf";
        link.href =  pdf;
        link.click();

        this.loading = false;
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
    createAct() {
      this.loading = true;

      this.service.createDocumentV2({
        templateId: this.templates[0].id,
        docType: this.Enum.DocType.RelatedDoc,
        parent: this.parentUUID,
      }).then(res => {
        this.loading = false;

        this.showMessage('success', this.$t('contracts.title'), this.$t('contracts.message.created'));

        this.$router.push('/documents/contracts/' + this.parentUUID + '/related/' + res.data.uuid);
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
    sciadvisorRequest(data) {
      if (data.docHistory.stateId !== this.Enum.CREATED.ID) {
        return false;
      }

      if (data.requests) {
        for (let i = data.requests.length-1; i >= 0; i--) {
          if (data.requests[i].type === this.Enum.DocumentRequestType.ScienceAdvisorApproval) {
            if (data.requests[i].status === 0) {
              return true;
            }

            break;
          }
        }
      }

      return false;
    },
    sciadvisorRevision(data) {
      if (data.docHistory.stateId !== this.Enum.CREATED.ID) {
        return false;
      }

      if (data.requests) {
        for (let i = data.requests.length-1; i >= 0; i--) {
          if (data.requests[i].type === this.Enum.DocumentRequestType.ScienceAdvisorApproval) {
            if (data.requests[i].status === 2) {
              return true;
            }

            break;
          }
        }
      }

      return false;
    },
    executed(data) {
      if (data.docHistory.stateId !== this.Enum.APPROVED.ID) {
        return false;
      }

      if (data.requests) {
        for (let i = data.requests.length-1; i >= 0; i--) {
          if (data.requests[i].type === this.Enum.DocumentRequestType.AccountantsExecutionRequest) {
            if (data.requests[i].status === 1) {
              return true;
            }
            
            break;
          }
        }
      }

      return false;
    },
    execution(data) {
      if (data.docHistory.stateId !== this.Enum.APPROVED.ID) {
        return false;
      }

      if (data.requests) {
        for (let i = data.requests.length-1; i >= 0; i--) {
          if (data.requests[i].type === this.Enum.DocumentRequestType.AccountantsExecutionRequest) {
            if (data.requests[i].status === 0) {
              return true;
            }
            
            break;
          }
        }
      }

      return false;
    },
    sendForExecution(contract) {
      this.service.createNewDocumentRequest({
        requestType: this.Enum.DocumentRequestType.AccountantsExecutionRequest,
        docId: contract.id,
      }).then(res => {
        this.getRelatedDocuments();
      }).catch(err => {
        if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout")
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath), null)
        } else {
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
        }
      })
    },
    getContractNumber(contract) {
      if (contract.newParams && contract.newParams.mnvo_agreement
          && contract.newParams.mnvo_agreement.value) {
        return contract.newParams.mnvo_agreement.value;
      }

      return "";
    },
    getContractDate(contract) {
      if (contract.newParams && contract.newParams.mnvo
          && contract.newParams.mnvo.value) {
        return getShortDateString(contract.newParams.mnvo.value);
      }

      return "";
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
:deep(.p-datatable.p-datatable-scrollable > .p-datatable-wrapper > .p-datatable-table > .p-datatable-thead) {
  background: transparent;
}
</style>
