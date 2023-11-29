<template>
  <ProgressSpinner v-if="loading" class="progress-spinner" strokeWidth="5"/>
  <div class="flex flex-row mb-3">
    <div class="arrow-icon" @click="$router.back()">
      <i class="fas fa-arrow-left"></i>
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
          <Button class="p-button-info align-items-center" style="padding: 0.25rem 1rem;"
            @click="open('newDocumentDialog')">
            <i class="fa-solid fa-file-circle-plus" /> &nbsp;{{ $t("contracts.menu.newDocument") }}</Button>
          <!-- <Button class="p-button-info align-items-center" style="padding: 0.25rem 1rem;"
            @click="sendForExecution" :disabled="!currentDocument">
            <i class="fa-solid fa-envelope-circle-check" /> &nbsp;{{ $t("contracts.menu.sendForExecution") }}</Button> -->
        </div>
      </template>
      <template #end>
        <div class="flex flex-wrap gap-2">
          <Button class="align-items-center" :class="{'p-button-success': filter.applied, 'p-button-info': !filter.applied}"
            style="padding: 0.25rem 1rem;" @click="toggle('filterOverlayPanel', $event)"> 
            <i class="fa-solid fa-filter" /> &nbsp;{{ $t("contracts.filter.button") }}</Button>
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
      <Column :header="$t('contracts.columns.description')" style="min-width: 250px;">
        <template #body="slotProps">
          {{ slotProps.data.template ? getTemplateName(slotProps.data.template) : '' }}
        </template>
      </Column>
      <Column :header="$t('contracts.columns.status')" style="min-width: 150px;">
        <template #body="slotProps">
          <span :class="'customer-badge status-' + slotProps.data.docHistory.code">
            {{ slotProps.data.docHistory[$i18n.locale === 'en' ? 'stateEn' : $i18n.locale === 'ru' ? 'stateRus' : 'stateKaz'] }} 
          </span>
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
            <Button v-if="slotProps.data.docHistory.stateId === Enum.SIGNED.ID"
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
  <OverlayPanel ref="filterOverlayPanel">
    <div class="p-fluid" style="min-width: 320px;">
      <div class="field">
        <label>{{ $t('contracts.filter.author') }}</label>
        <FindUser v-model="tempFilter.author" :max="1" :userType="3"></FindUser>
      </div>
      <div class="field">
        <label>{{ $t('contracts.filter.status') }}</label>
        <Dropdown v-model="tempFilter.status" :options="statuses" optionValue="id"
          class="p-column-filter" :showClear="true">
          <template #value="slotProps">
            <span v-if="slotProps.value" :class="'customer-badge status-' + statuses.find((e) => e.id === slotProps.value).value">
              {{ $i18n.locale === 'kz' ? statuses.find((e) => e.id === slotProps.value).nameKz : $i18n.locale === 'ru'
              ? statuses.find((e) => e.id === slotProps.value).nameRu : statuses.find((e) => e.id === slotProps.value).nameEn }}
            </span>
          </template>
          <template #option="slotProps">
            <span :class="'customer-badge status-' + slotProps.option.value">
              {{ $i18n.locale === 'kz' ? slotProps.option.nameKz : $i18n.locale === 'ru'
              ? slotProps.option.nameRu : slotProps.option.nameEn }}
            </span>
          </template>
        </Dropdown>
      </div>
      <div class="field">
        <label>{{ $t('contracts.filter.templateType') }}</label>
        <Dropdown v-model="tempFilter.template" :options="templates" 
          :optionLabel="templateLabel" :showClear="true" dataKey="id"
          :filter="true" :emptyFilterMessage="$t('common.noResult')"/>
      </div>
      <div class="field">
        <label>{{ $t('contracts.filter.createdFrom') }}</label>
        <PrimeCalendar v-model="tempFilter.createdFrom" dateFormat="dd.mm.yy" showIcon :showButtonBar="true"></PrimeCalendar>
      </div>
      <div class="field">
        <label>{{ $t('contracts.filter.createdTo') }}</label>
        <PrimeCalendar v-model="tempFilter.createdTo" dateFormat="dd.mm.yy" showIcon :showButtonBar="true"></PrimeCalendar>
      </div>
      <div class="field">
        <Button :label="$t('common.clear')" @click="clearFilter();toggle('filterOverlayPanel', $event);getContracts()" class="mb-2 p-button-outlined"/>
        <Button :label="$t('common.search')" @click="saveFilter();toggle('filterOverlayPanel', $event);getContracts()" class="mt-2"/>
      </div>
    </div>
  </OverlayPanel>
  <!-- documentInfoSidebar -->
  <Sidebar v-model:visible="visibility.documentInfoSidebar" position="right" class="p-sidebar-lg" 
    style="overflow-y: scroll" @hide="getRelatedDocuments">
    <DocSignaturesInfo :docIdParam="currentDocument.uuid"></DocSignaturesInfo>
  </Sidebar>
</template>
<script>
import { b64toBlob } from "@/config/config";
import { getShortDateString, getLongDateString } from "@/helpers/helper";
import Enum from "@/enum/docstates/index";

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

      filter: {
        applied: false,
        status: null,
        author: [],
        createdFrom: null,
        createdTo: null,
        sourceType: null,
        template: null,
        name: null,
        folder: null,
      },

      tempFilter: {
        applied: false,
        status: null,
        author: [],
        createdFrom: null,
        createdTo: null,
        sourceType: null,
        template: null,
        name: null,
        folder: null,
      },

      statuses: [
        {
          id: 'status_created',
          nameRu: "Создан",
          nameKz: "Құрылды",
          nameEn: "Created",
          value: "created"
        },
        {
          id: 'status_inapproval',
          nameRu: "На согласовании",
          nameKz: "Келісуде",
          nameEn: "In approval",
          value: "inapproval"
        },
        {
          id: 'status_approved',
          nameRu: "Согласован",
          nameKz: "Келісілді",
          nameEn: "Approved",
          value: "approved"
        },
        {
          id: 'status_revision',
          nameRu: "На доработке",
          nameKz: "Түзетуде",
          nameEn: "Revision",
          value: "revision"
        },
        {
          id: 'status_signing',
          nameKz: "Қол қоюда",
          nameRu: "На подписи",
          nameEn: "Signing",
          value: "signing"
        },
        {
          id: 'status_signed',
          nameRu: "Подписан",
          nameKz: "Қол қойылды",
          nameEn: "Signed",
          value: "signed"
        },
      ],

      templates: [],
      templateSearchText: null,
    }
  },
  created() {
    this.loginedUser = JSON.parse(localStorage.getItem("loginedUser"));
  },
  mounted() {
    this.$emit('apply-flex', true);

    this.parentUUID = this.$route.params.uuid;

    this.getTemplates();
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
      this.visibility[name] = true
    },
    close(name) {
      this.visibility[name] = false
    },
    toggle(ref, event) {
      if (ref === 'filterOverlayPanel') {
        this.tempFilter = JSON.parse(JSON.stringify(this.filter));
        this.tempFilter.createdFrom = this.tempFilter.createdFrom ? new Date(this.tempFilter.createdFrom) : null;
        this.tempFilter.createdTo = this.tempFilter.createdTo ? new Date(this.tempFilter.createdTo) : null;
      }

      this.$refs[ref].toggle(event);
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
    templateLabel(item) {
      let name = ''

      if (item.descriptionKaz && item.descriptionKaz.length > 0) {
        name = item.descriptionKaz
      } else if (item.descriptionRus && item.descriptionRus.length > 0) {
        name = item.descriptionRus
      } else if (item.descriptionEng && item.descriptionEng.length > 0) {
        name = item.descriptionEng
      } 

      if (this.$i18n.locale === 'ru' && item.descriptionRus && item.descriptionRus.length > 0) {
        name = item.descriptionRus
      } else if (this.$i18n.locale === 'en' && item.descriptionEng && item.descriptionEng.length > 0) {
        name = item.descriptionEng
      } 

      return name
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
        docType: this.Enum.DocType.RelatedDoc,
        relatedTo: this.parentUUID,
        templateId: this.filter.template ? this.filter.template.id : null,
        filter: {
          status: this.filter.status && this.filter.status.length > 0 ? this.filter.status : null,
          author: this.filter.author.length > 0 && this.filter.author[0] ? this.filter.author[0].userID : null,
          createdFrom: this.filter.createdFrom,
          createdTo: this.filter.createdTo,
        },
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
              console.log(err)
              this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
            }

            this.loading = false;
          })
        },
      });
    },
    saveFilter() {
      this.filter = JSON.parse(JSON.stringify(this.tempFilter));
      this.filter.applied = true;
    },
    clearFilter() {
      this.filter = {
        applied: false,
        status: null,
        author: [],
        createdFrom: null,
        createdTo: null,
        sourceType: null,
        template: null,
        name: null,
        folder: null,
      };
    },
    getTemplates() {
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
          console.log(err)
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
        }
      })
    },
    download() {
      if (!this.currentDocument || !this.currentDocument.filePath || this.currentDocument.filePath.length < 1) return;

      this.loading = true;

      this.service.downloadDocumentV2({
        uuid: this.contract.uuid
      }).then(res => {
        this.pdf = b64toBlob(res.data);

        this.loading = false;

        this.saveFile();
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