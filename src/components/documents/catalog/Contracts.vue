<template>
  <ProgressBar v-if="loading" mode="indeterminate" class="progress-bar"/>
  <TitleBlock :title="$t('contracts.journal')" :show-back-button="true"/>
  <ToolbarMenu :data="menu" @filter="toggle('filterOverlayPanel', $event)" :filter="true" :filtered="filtered"/>
  <BlockUI :blocked="loading" class="card">
    <DataTable :value="documents" dataKey="id" :rows="rows" :totalRecords="total" :first="first"
               :paginator="true" :paginatorTemplate="paginatorTemplate" :rowsPerPageOptions="[10, 25, 50]"
               :currentPageReportTemplate="currentPageReportTemplate" :lazy="true" :loading="tableLoading"
               scrollable scrollHeight="flex" v-model:selection="currentDocument" selectionMode="single"
               :rowHover="true" stripedRows class="flex-grow-1" @page="onPage">
      <template #empty>
        {{ this.$t("common.recordsNotFound") }}
      </template>
      <Column v-if="findRole(null, 'signer')" header=" ">
        <template #header>
          <Checkbox
              v-model="allChecked"
              @change="selectAllCheckBox"
              :binary="true"
          />
          <span class="ml-2">{{this.$t("common.selectAll")}}</span>
        </template>
        <template #body="slotProps">
          <Checkbox
              v-model="slotProps.data.checked"
              @change="checkBoxSelect(slotProps)"
              :binary="true"
              :disabled="!isSlotEnabled(slotProps) || !(slotProps.data.docHistory.stateId === Enum.SIGNING.ID)"
          />
        </template>
      </Column>
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
      <Column :header="$t('contracts.columns.department')" style="min-width: 200px; word-break: break-word;">
        <template #body="slotProps">
          {{ slotProps.data.author ? getDepartmentName(slotProps.data.author) : slotProps.data.folder ? getFolderName(slotProps.data.folder) : "" }}
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
          {{ slotProps.data.template ? getTemplateName(slotProps.data.template) : getContractName(slotProps.data) }}
        </template>
      </Column>
      <!-- <Column style="min-width: 35px;">
        <template #body="slotProps">
          <div v-if="showMySign(slotProps.data.approvalStages)">
            <i v-if="greenMySign(slotProps.data.approvalStages)" class="fa-solid fa-square-pen fa-xl signed"></i>
            <i v-else class="fa-solid fa-square-pen fa-xl not-signed"></i>
          </div>
        </template>
      </Column> -->
      <Column :header="$t('contracts.columns.status')" style="min-width: 150px;">
        <template #body="slotProps">
          <div class="flex flex-wrap column-gap-1 row-gap-1">
            <span :class="'customer-badge status-' + slotProps.data.docHistory.code">
              {{ slotProps.data.docHistory[$i18n.locale === 'en' ? 'stateEn' : $i18n.locale === 'ru' ? 'stateRus' : 'stateKaz'] }}
            </span>
            <span v-if="haveRequest(slotProps.data) && slotProps.data.docHistory.stateId == Enum.CREATED.ID"
              class="customer-badge status-status_signed" style="width: min-content;">
              {{ $t('contracts.contragentRequest') }}
            </span>
            <span v-if="agreementApprovalExpired(slotProps.data)"
                  class="customer-badge status-status_revision" style="width: min-content">
              {{ $t('contracts.expired') }}
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
  <!-- filterOverlayPanel -->
  <OverlayPanel ref="filterOverlayPanel">
    <div class="p-fluid" style="min-width: 320px;">
      <div class="field" v-if="filterPage === 0">
        <label>{{ $t('contracts.filter.author') }}</label>
        <FindUser v-model="tempFilter.author" :max="1" :userType="3"></FindUser>
      </div>
      <div class="field" v-if="filterPage === 0">
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
      <div class="field" v-if="filterPage === 0">
        <label>{{$t('contracts.filter.documentsNotSigned.label')}}</label>
        <SelectButton v-model="tempFilter.documentsNotSignedType" :options="docSourceType">
          <template #option="slotProps">
            <div v-if="slotProps.option == Enum.DocSourceType.Template">{{$t('contracts.filter.documentsNotSigned.signedByMe')}}</div>
            <div v-else>{{$t('contracts.filter.documentsNotSigned.notSignedByMe')}}</div>
          </template>
        </SelectButton>
      </div>
      <div class="field" v-if="filterPage === 0">
        <label>{{ $t('contracts.filter.contractType.label') }}</label>
        <SelectButton v-model="tempFilter.sourceType" :options="docSourceType">
          <template #option="slotProps">
            <div v-if="slotProps.option == Enum.DocSourceType.Template">{{$t('contracts.filter.contractType.byTemplate')}}</div>
            <div v-else>{{$t('contracts.filter.contractType.fromReadyDoc')}}</div>
          </template>
        </SelectButton>
      </div>
      <div class="field" v-if="filterPage === 0 && tempFilter.sourceType === Enum.DocSourceType.Template">
        <label>{{ $t('contracts.filter.templateType') }}</label>
        <Dropdown v-model="tempFilter.template" :options="templates" 
          :optionLabel="templateLabel" :showClear="true" dataKey="id"
          :filter="true" :emptyFilterMessage="$t('common.noResult')"/>
        <!-- <Dropdown v-model="tempFilter.template" :options="templates" 
          :optionLabel="templateLabel" :filter="true" :showClear="true" 
          dataKey="id" :emptyFilterMessage="$t('common.noResult')"
          @filter="handleTemplateFilter"/> -->
      </div>
      <div class="field" v-if="filterPage === 0 && tempFilter.sourceType === Enum.DocSourceType.FilledDoc">
        <label>{{ $t('contracts.filter.documentName') }}</label>
        <InputText type="text" v-model="tempFilter.name"/>
      </div>
      <div class="field" v-if="filterPage === 0 && tempFilter.sourceType === Enum.DocSourceType.FilledDoc">
        <label>{{ $t('contracts.filter.folder') }}</label>
        <Dropdown v-model="tempFilter.folder" :options="folders" 
          :optionLabel="folderLabel" :showClear="true" dataKey="id"
          :filter="true" :emptyFilterMessage="$t('common.noResult')"/>
      </div>
      <div class="field" v-if="filterPage === 0">
        <label>{{ $t('contracts.filter.createdFrom') }}</label>
        <PrimeCalendar v-model="tempFilter.createdFrom" dateFormat="dd.mm.yy" showIcon :showButtonBar="true"></PrimeCalendar>
      </div>
      <div class="field" v-if="filterPage === 0">
        <label>{{ $t('contracts.filter.createdTo') }}</label>
        <PrimeCalendar v-model="tempFilter.createdTo" dateFormat="dd.mm.yy" showIcon :showButtonBar="true"></PrimeCalendar>
      </div>
      <div class="field" v-if="filterPage === 1">
        <label>{{ $t('contracts.filter.signers') }}</label>
        <FindUser v-model="tempFilter.signer" :max="1" :userType="3"></FindUser>
      </div>
      <div class="field" v-if="filterPage === 1">
        <label>{{ $t('contracts.filter.contragent') }}</label>
        <FindUser v-model="tempFilter.contragent" :max="1" :userType="3"></FindUser>
      </div>
      <div class="field" v-if="filterPage === 1">
        <label>{{ $t('contracts.filter.irn') }}</label>
        <InputText type="text" v-model="tempFilter.irn"/>
      </div>
      <div class="field" v-if="filterPage === 1">
        <label>{{ $t('contracts.filter.theme') }}</label>
        <InputText type="text" v-model="tempFilter.theme"/>
      </div>
      <div class="field" v-if="filterPage === 1">
        <label>{{ $t('contracts.filter.financing_type') }}</label>
        <Dropdown v-model="tempFilter.financingType" :options="financingTypes" class="w-full"
                  :option-label="financingTypesLabel">
        </Dropdown>
      </div>
      <div class="field" v-if="filterPage === 1">
        <label>{{ $t('contracts.filter.priority') }}</label>
        <InputText type="text" v-model="tempFilter.priority"/>
      </div>
      <div class="field" v-if="filterPage === 1">
        <label>{{ $t('contracts.filter.subpriority') }}</label>
        <InputText type="text" v-model="tempFilter.subpriority"/>
      </div>
      <div class="field" v-if="filterPage === 1">
        <label>{{ $t('contracts.filter.mnvo') }}</label>
        <InputText type="text" v-model="tempFilter.mnvo"/>
      </div>
      <div class="field" v-if="filterPage === 1">
        <label>{{ $t('contracts.filter.sciadvisor') }}</label>
        <FindUser v-model="tempFilter.sciadvisor" :max="1" :userType="3"></FindUser>
      </div>
      <div class="field">
        <Paginator v-model:first="filterPage" :rows="1" :totalRecords="2"
          template="PrevPageLink NextPageLink"></Paginator>
        <Button :label="$t('common.clear')" @click="clearFilter();toggle('filterOverlayPanel', $event);getContracts()" class="mb-2 p-button-outlined"/>
        <Button :label="$t('common.search')" @click="saveFilter();toggle('filterOverlayPanel', $event);getContracts()" class="mt-2"/>
      </div>
    </div>
  </OverlayPanel>
  <!-- documentInfoSidebar -->
  <Sidebar v-model:visible="visibility.documentInfoSidebar" position="right" class="p-sidebar-lg" 
    style="overflow-y: scroll" @hide="getContracts">
    <DocSignaturesInfo :docIdParam="currentDocument?.uuid"></DocSignaturesInfo>
  </Sidebar>
</template>
<script>
import { getShortDateString, getLongDateString } from "@/helpers/helper";
import Enum from "@/enum/docstates/index";
import api from "@/service/api";
import { DocService } from "@/service/doc.service";
import DocSignaturesInfo from "@/components/DocSignaturesInfo";
import FindUser from "@/helpers/FindUser";
import {
  getHeader,
  smartEnuApi,
  findRole
} from "@/config/config";
import {
  runNCaLayer,
  makeTimestampForSignature,
} from "@/helpers/SignDocFunctions";
import logger from "quill/core/logger";
import {NCALayerClient} from "ncalayer-js-client";
import {checkIdAvailability, docToByteArray} from "../../../helpers/SignDocFunctions";

export default {
  name: 'Contracts',
  components: {DocSignaturesInfo, FindUser },
  props: { },
  data() {
    return {
      service: new DocService(),
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
      },

      loading: false,
      tableLoading: false,

      documents: [],
      currentDocument: null,
      total: 0,
      first: 0,
      page: 0,
      rows: 10,

      filterPage: 0,
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
        signers: [],
        contragent: [],
        irn: null,
        theme: null,
        priority: null,
        subpriority: null,
        mnvo: null,
        sciadvisor: [],
        financingType: null,
        documentsNotSignedType: null,
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
        signers: [],
        contragent: [],
        irn: null,
        theme: null,
        priority: null,
        subpriority: null,
        mnvo: null,
        sciadvisor: [],
        financingType: null,
        documentsNotSignedType: null,
      },

      statuses: [Enum.StatusesArray.StatusCreated, Enum.StatusesArray.StatusInapproval, Enum.StatusesArray.StatusApproved,
        Enum.StatusesArray.StatusRevision, Enum.StatusesArray.StatusSigning, Enum.StatusesArray.StatusSigned],

      docSourceType: [Enum.DocSourceType.Template, Enum.DocSourceType.FilledDoc],

      templates: [],
      templateSearchText: null,

      folders: [],
      filtered: false,
      actionsNode: {},

      financingTypes: ['government', 'program_targeted', 'grant', 'company'],
      showAnymore: null,
      showCheckbox: false,
      selectedIds: [],
      docInfo: null,
      signerIin: null,
      isTspRequired: false,
      selectAll: false,
      allChecked: false,
      documentsNotSigned: false,
    }
  },
  created() {
    this.loginedUser = JSON.parse(localStorage.getItem("loginedUser"));
  },
  mounted() {
    this.$emit('apply-flex', true);

    let oldPath = this.$router.options.history.state.forward;
    if (oldPath && oldPath.indexOf('/documents/contracts/') === 0) {
      let filter = localStorage.getItem('contractsFilter');
      if (filter) {
        this.filter = JSON.parse(filter);
      }

      let currentPage = localStorage.getItem('contractsCurrentPage');
      if (currentPage) {
        currentPage = JSON.parse(currentPage);
        this.first = currentPage.first;
        this.page = currentPage.page;
        this.rows = currentPage.rows;
      }
    }

    this.getTemplates();
    this.getFolders();
    this.getContracts();
  },
  beforeUnmount() {
    this.$emit('apply-flex', false);

    localStorage.setItem('contractsFilter', JSON.stringify(this.filter))
    localStorage.setItem('contractsCurrentPage', JSON.stringify({first: this.first, page: this.page, rows: this.rows}))
  },
  methods: {
    findRole : findRole,
    getLongDateString: getLongDateString,
    getShortDateString: getShortDateString,
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
    toggleActions(node) {
      this.actionsNode = node
    },
    getFullname(user) {
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
    getFolderName(folder) {
      let name = folder['name' + this.$i18n.locale]

      if (name && name.length > 0) {
        return name
      }

      return ''
    },
    getDepartmentName(department) {
      let name = ''

      if (department.cafedra) {
        name += this.getDepartmentName(department.cafedra) + '/'
      }

      if (this.$i18n.locale === 'kz' && department.nameKz.length > 0) {
        name += department.nameKz
      } else if (this.$i18n.locale === 'ru' && department.nameRu.length > 0) {
        name += department.nameRu
      } else if (this.$i18n.locale === 'en' && department.nameEn.length > 0) {
        name += department.nameEn
      } else {
        name += department.name
      }

      return name
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
    getContractName(contract) {
      let name = contract['name' + this.$i18n.locale]

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
    folderLabel(item) {
      let name = ''

      if (item.namekz && item.namekz.length > 0) {
        name = item.namekz
      } else if (item.nameru && item.nameru.length > 0) {
        name = item.nameru
      } else if (item.nameen && item.nameen.length > 0) {
        name = item.nameen
      } 

      if (this.$i18n.locale === 'ru' && item.nameru && item.nameru.length > 0) {
        name = item.nameru
      } else if (this.$i18n.locale === 'en' && item.nameen && item.nameen.length > 0) {
        name = item.nameen
      } 

      return name
    },
    onPage(event) {
      this.first = event.first;
      this.page = event.page;
      this.rows = event.rows;
      this.getContracts();
    },
    openDocument() {
      if (this.currentDocument) {
        this.$router.push('/documents/contracts/' + this.currentDocument.uuid)
      }
    },  
    getContracts() {
      this.tableLoading = true;

      this.service.getDocumentsV2({
        page: this.page,
        rows: this.rows,
        sourceType: this.filter.sourceType,
        docType: this.Enum.DocType.Contract,
        templateId: this.filter.sourceType === Enum.DocSourceType.Template && this.filter.template ? this.filter.template.id : null,
        folderId: this.filter.sourceType === Enum.DocSourceType.FilledDoc && this.filter.folder ? this.filter.folder.id : null,
        filter: {
          name: this.filter.sourceType === Enum.DocSourceType.FilledDoc && this.filter.name && this.filter.name.length > 0 ? this.filter.name : null,
          status: this.filter.status && this.filter.status.length > 0 ? this.filter.status : null,
          author: this.filter.author.length > 0 && this.filter.author[0] ? this.filter.author[0].userID : null,
          createdFrom: this.filter.createdFrom,
          createdTo: this.filter.createdTo,
          signers: this.filter.signers.length > 0 && this.filter.signers[0] ? this.filter.signers[0].userID : null,
          contragent: this.filter.contragent.length > 0 && this.filter.contragent[0] ? this.filter.contragent[0].userID : null,
          irn: this.filter.irn,
          theme: this.filter.theme,
          priority: this.filter.priority,
          subpriority: this.filter.subpriority,
          mnvo: this.filter.mnvo,
          sciadvisor: this.filter.sciadvisor.length > 0 && this.filter.sciadvisor[0] ? this.filter.sciadvisor[0].userID : null,
          financingType: this.filter.financingType,
          documentsNotSigned: this.filter.documentsNotSignedType,
        },

      }).then(res => {
        this.documents = res.data.documents
        this.total = res.data.total
        this.currentDocument = null
        this.selectedIds = []
        this.tableLoading = false
      }).catch(err => {
        this.documents = []
        this.total = 0
        this.currentDocument = null

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
    showMySign() {

    },
    greenMySign() {

    },
    checkBoxSelect(slotProps){
      if (slotProps.data.checked) {
        this.selectedIds.push(slotProps.data.id);
      } else {
        this.selectedIds = this.selectedIds.filter(item => item !== slotProps.data.id);
      }
    },
    isSlotEnabled(slotProps) {
      const loginedUser = JSON.parse(localStorage.getItem('loginedUser'));
      const loggedInUserId = loginedUser ? loginedUser.userID : null;

      let isEnabled = false;
        if (slotProps.data.signatures) {
          const foundStage = slotProps.data.signatures.find(stage => stage.userId === loggedInUserId);
          if (foundStage && foundStage.signature.length === 0) {
            isEnabled = true;
          }
      }
      return isEnabled;
    },
    multipleSignature() {
      this.showCheckbox = !this.showCheckbox
      this.selectAll = !this.selectAll
      this.filter.status = "status_signing"
      if (this.showCheckbox) {
        this.toggle('filterOverlayPanel', event);
      } else {
        this.filter.status = null;
      }
      this.documentsNotSigned = !this.documentsNotSigned
      this.getContracts()
    },
    haveRequest(contract) {
      if (contract.requests) {
        for (let i = 0; i < contract.requests.length; i++) {
          if (contract.requests[i].type === this.Enum.DocumentRequestType.CounterpartyInfoRequest) {
            return true;
          }
        }
      }

      return false;
    },
    havePracticeLeaderRequest(contract) {
      if (contract.requests) {
        for (let i = 0; i < contract.requests.length; i++) {
          if (contract.requests[i].type === this.Enum.DocumentRequestType.PracticeLeaderRequest &&
              contract.requests[i].status === 0) {
            return true;
          }
        }
      }

      return false;
    },
    agreementApprovalExpired(contract) {
      if (contract.folder && contract.folder.type === Enum.FolderType.Agreement) {
        if (contract.docHistory && contract.docHistory.stateId === Enum.INAPPROVAL.ID &&
            contract.docHistory.setDate) {
            let date = new Date(contract.docHistory.setDate);
            date.setDate(date.getDate() + 3);

            if (date.getTime() < new Date().getTime()) {
              return true
            }
        }
      }

      return false;
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
            this.getContracts();

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
      this.filtered = true;
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
        signers: [],
        contragent: [],
        irn: null,
        theme: null,
        priority: null,
        subpriority: null,
        mnvo: null,
        sciadvisor: [],
        financingType: null,
        documentsNotSignedType: null,
      };
      this.filtered = false;
    },
    handleTemplateFilter(event) {
      if (event.value && event.value.length > 2) {
        this.templateSearchText = event.value;
        this.getTemplates();
      } else if (this.templateSearchText && this.templateSearchText.length > 2) {
        this.templateSearchText = null;
        this.getTemplates();
      }
    },
    getTemplates() {
      this.service.documentTemplatesV2({
        page: 0,
        rows: 50,
        folderType: Enum.FolderType.Journals,
        filter: {
          name: this.templateSearchText,
        },
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
    getFolders() {
      this.service.getFoldersV2({
        page: 0,
        rows: 10,
        folderTypes: [Enum.FolderType.FilledDoc],
      }).then(res => {
        this.folders = res.data.folders
      }).catch(err => {
        this.folders = []

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
    financingTypesLabel(data) {
      return this.$t('contracts.financingTypes.' + data);
    },
    sign() {
      this.loading = true;
      api.post( smartEnuApi + "/document/multipleSignature",
              {
                doc_id: this.selectedIds,
              },
              {
                headers: getHeader(),
              }
          )
          .then((response) => {
              this.docInfo = response.data.maniFestDocumentUuid

            api
                .post(
                    "/downloadFile",
                    {
                      filePath: this.docInfo.filePath,
                    },
                    {
                      headers: getHeader(),
                    }
                )
                .then((response) => {
                  runNCaLayer(
                      this.$t,
                      this.$toast,
                      response.data,
                      "cms",
                      this.signerType,
                      this.isTspRequired,
                      this.$i18n.locale
                  )
                      .then((sign) => {
                        if (sign != undefined) {
                          this.sendRequest(sign);
                        }
                      })
                      .catch((e) => {
                        console.log(e);
                        this.loading = false;
                      });
                })
                .catch((error) => {
                  this.loading = false;
                  if (error.response.status == 401) {
                    this.$store.dispatch("logLout");
                  }
                });
          })
          .catch((error) => {
          this.$toast.add({
          severity: "error",
          summary: error,
          life: 3000,
        });
      });



    },
    sendRequest(signature) {
      var req = {
        docUUID: this.docInfo.uuid,
        sign: signature,
        signerIin: this.signerIin,
        isTspRequired: this.isTspRequired,
      };
      this.loading = true;

      api
          .post("/doc/sign", req, { headers: getHeader() })
          .then((response) => {
            this.loading = false;
            // this.getData();
            this.showMessage(
                "success",
                this.$t("ncasigner.signDocTitle"),
                this.$t("ncasigner.success.signSuccess")
            );
          })
          .catch((error) => {
            this.loading = false;
            if (error.response.status == 405) {
              this.$toast.add({
                severity: "error",
                summary: this.$t(error.response.data),
                life: 3000,
              });
            }
            if (error.response.status == 401) {
              this.$store.dispatch("logLout");
            } else this.loading = false;
          });
    },
    selectAllCheckBox() {
      const loginedUser = JSON.parse(localStorage.getItem('loginedUser'));
      const loggedInUserId = loginedUser ? loginedUser.userID : null;
      this.allChecked = !this.allChecked;
      if (this.allChecked) {
        this.documents.forEach(document => {
          document.checked = false;
        });
        this.selectedIds = [];
      } else {
        this.documents.forEach(document => {
          if (document.signatures) {
            let isChecked = false;

            document.signatures.forEach(signature => {
              console.log(signature)
              if (signature.userId === loggedInUserId && signature.signature.length === 0) {
                isChecked = true;
                this.selectedIds.push(document.id);
              }
            });

            if (isChecked) {
              document.checked = true;
            }
          }
        });
      }

      this.allChecked = !this.allChecked

    },

    selectDocumentsNotSigned() {
        this.documentsNotSigned = !this.documentsNotSigned
    }
  },
  computed: {
    menu() {
      const isSigner = this.findRole(null, 'signer');

      const menuItems = [
        {
          label: this.$t('contracts.card'),
          icon: "fa-regular fa-address-card",
          disabled: !this.currentDocument,
          command: () => {this.openDocument()},
        },
        {
          label: this.$t('contracts.menu.journal'),
          icon: "fa-solid fa-link",
          disabled: !this.currentDocument || this.currentDocument.docHistory.stateId !== Enum.SIGNED.ID ||
              this.currentDocument.sourceType !== Enum.DocSourceType.FilledDoc,
          command: () => {this.$router.push('/documents/contracts/' + this.currentDocument.uuid + '/related')},
        },
        // {
        //   label: this.$t('contracts.menu.multipleSignature'),
        //   icon: "fa-solid fa-link",
        //   // disabled: "",
        //   command: () => {this.multipleSignature()},
        // },
        {
          label: this.$t('ncasigner.sign'),
          disabled: this.selectedIds.length === 0,
          command: () => { this.sign(); },
        },
      ];

      // Удаляем последние два пункта, если роль 'signer'
      if (!isSigner) {
        return menuItems.slice(0, -1);
      }

      return menuItems;
    },

    actions () {
      return [
        {
          label: this.$t('common.show'),
          icon: "fa-solid fa-eye",
          command: () => {this.currentDocument=this.actionsNode;this.open('documentInfoSidebar')},
        },
        {
          label: this.$t('common.delete'),
          icon: "fa-solid fa-trash",
          visible: (this.actionsNode.docHistory && this.actionsNode.docHistory.stateId === Enum.CREATED.ID ||this.actionsNode.docHistory && this.actionsNode.docHistory.stateId === Enum.REVISION.ID) && this.loginedUser.userID === this.actionsNode.creatorID,
          command: () => {this.currentDocument=this.actionsNode;this.deleteFile()},
        }
      ]
    },
  }
}
</script>
<style scoped>
.progress-bar {
  position: absolute;
  height: 0.5rem;
  width: 100%;
  z-index: 1102;
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
.status-status_rejected {
  background: #fdfdfd;
  color: #ff0000;
}
.signed {
  color: #42855B;
}
.not-signed {
  color: #a6a6a6;
}
:deep(.p-datatable.p-datatable-scrollable > .p-datatable-wrapper > .p-datatable-table > .p-datatable-thead) {
  background: transparent;
}
</style>