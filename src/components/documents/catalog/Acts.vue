<template>
  <ProgressSpinner v-if="loading" class="progress-spinner" strokeWidth="5"/>
  <TitleBlock :title="$t('contracts.menu.actsJournal')" :show-back-button="true"/>
  <ToolbarMenu v-if="this.findRole(null, RolesEnum.roles.MainAdministrator)" :data="menu"/>
  <BlockUI :blocked="loading" class="card">
<!--          <Button class="p-button-info align-items-center" style="padding: 0.25rem 1rem;"-->
<!--            @click="openDocument" :disabled="!currentDocument">-->
<!--            <i class="fa-regular fa-address-card" /> &nbsp;{{ $t("contracts.card") }}</Button>-->
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
      <Column :header="$t('contracts.columns.status')" style="min-width: 150px;">
        <template #body="slotProps">
          <div class="flex flex-wrap column-gap-1 row-gap-1">
            <span :class="'customer-badge status-' + slotProps.data.docHistory.code">
              {{ slotProps.data.docHistory[$i18n.locale === 'en' ? 'stateEn' : $i18n.locale === 'ru' ? 'stateRus' : 'stateKaz'] }} 
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
            <ActionButton :show-label="true" :items="actions" @toggle="toggleActions(slotProps.data)" />
          </div>
        </template>
      </Column>
    </DataTable>
  </BlockUI>
  <!-- documentInfoSidebar -->
  <Sidebar v-model:visible="visibility.documentInfoSidebar" position="right" class="p-sidebar-lg" 
    style="overflow-y: scroll" @hide="getActs">
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
  name: 'Acts',
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
      },

      loading: false,
      tableLoading: false,

      documents: [],
      currentDocument: null,
      total: 0,
      first: 0,
      page: 0,
      rows: 10,
      actionsNode: {},
    }
  },
  created() {
    this.loginedUser = JSON.parse(localStorage.getItem("loginedUser"));
  },
  mounted() {
    this.$emit('apply-flex', true);

    this.getActs();
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
    onPage(event) {
      this.first = event.first;
      this.page = event.page;
      this.rows = event.rows;
      this.getActs();
    },
    openDocument() {
      /*if (this.currentDocument && this.currentDocument.parent) {
        this.$router.push('/documents/contracts/' + this.currentDocument.parent.uuid + '/related/' + this.currentDocument.uuid)
      }*/
    },
    getActs() {
      this.tableLoading = true;

      this.service.getDocumentsV2({
        page: this.page,
        rows: this.rows,
        docType: this.Enum.DocType.ActCompletedWorks,
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
          console.log(err)
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
        }

        this.tableLoading = false
      });
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
          console.log(err)
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
        }
      })
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
        this.getActs();
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
    },
    execute(contract) {
      let req = null;

      if (contract.requests) {
        for (let i = contract.requests.length-1; i >= 0; i--) {
          if (contract.requests[i].type === this.Enum.DocumentRequestType.AccountantsExecutionRequest) {
            if (contract.requests[i].status === 0) {
              req = contract.requests[i];
            }

            break;
          }
        }
      }

      if (!req) {
        return;
      }

      this.service.updateDocRequestV2({
        requestId: req.id,
        status: 1,
      }).then(res => {
        this.getActs();
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
    },
    toggleActions(node) {
      this.actionsNode = node
    },
  },
  computed: {
    menu () {
      return [
        {
          label: this.$t('contracts.menu.sendForExecution'),
          icon: "fa-solid fa-circle-check",
          disabled: !this.currentDocument || this.currentDocument.docHistory.stateId !== Enum.APPROVED.ID || this.executed(this.currentDocument) || this.execution(this.currentDocument),
          visible: this.findRole(null, RolesEnum.roles.ActsToExecution) || this.findRole(null, RolesEnum.roles.MainAdministrator),
          command: () => {this.sendForExecution(this.currentDocument)},
        },
        {
          label: this.$t('contracts.executed'),
          icon: "fa-solid fa-envelope-circle-check",
          disabled: !this.currentDocument || this.currentDocument.docHistory.stateId !== Enum.APPROVED.ID || this.executed(this.currentDocument) || !this.execution(this.currentDocument),
          visible: this.findRole(null, RolesEnum.roles.Accountant) || this.findRole(null, RolesEnum.roles.MainAdministrator),
          command: () => {this.execute(this.currentDocument)},
        },
      ]
    },
    actions () {
      return [
        {
          label: this.$t('common.show'),
          icon: "fa-solid fa-eye",
          command: () => {this.currentDocument = this.actionsNode; this.open('documentInfoSidebar')},
        },
        {
          label: this.$t('common.download'),
          icon: "fa-solid fa-file-arrow-down",
          visible: this.actionsNode.docHistory && this.actionsNode.docHistory.stateId === Enum.APPROVED.ID,
          command: () => {this.currentDocument = this.actionsNode; this.download()},
        },
      ]
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
  //flex-grow: 1;
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