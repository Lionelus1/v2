<template>

  <ProgressBar v-if="loading" mode="indeterminate" class="progress-bar"/>
  <div v-if="docType == eduComplexDocType">
    <h3 v-if="screen.isLarge">{{ $t("educomplex.title") }}</h3>
    <h3 v-else>{{ $t("educomplex.title") }}</h3>
  </div>
  <div v-if="docType == attestationDocReportType">
    <TitleBlock :title="$t('common.sacReportMenuTitle')" :show-back-button="true"/>
  </div>

  <BlockUI :blocked="loading" class="card">
    <div ref="outerDiv" class="flex flex-grow-1" :class="{ 'flex-column': !screen.isLarge }">
      <div :class="'flex flex-column' + getDepFlexGrow()">
        <Toolbar class="p-1">
          <template #start>
            <div v-if="!screen.departments.minimized" class="flex flex-wrap">
              <Button icon="fa-solid fa-home" class="menubar-icons"
                      v-tooltip="$t('educomplex.tooltip.home')"
                      @click="home" :disabled="!faculty"></Button>
              <Button icon="fa-regular fa-folder" class="menubar-icons"
                      v-tooltip="$t('educomplex.tooltip.into')"
                      @click="into" :disabled="faculty || !currentDepartment"></Button>
            </div>
            <p v-if="screen.departments.minimized && !screen.isLarge && currentDepartment">{{ getDepartmentName(currentDepartment) }}</p>
          </template>
          <template #end>
            <div class="flex flex-wrap">
              <Button icon="fa-solid fa-minimize" class="menubar-icons"
                      v-tooltip="$t('educomplex.tooltip.minimize')"
                      v-if="screen.departments.maximized"
                      @click="minimize('departments')"></Button>
              <Button icon="fa-solid fa-maximize" class="menubar-icons"
                      v-tooltip="$t('educomplex.tooltip.maximize')"
                      v-if="!screen.departments.maximized"
                      @click="maximize('departments')"></Button>
              <Button :icon="'fa-solid fa-angle-' + (screen.isLarge ? 'left' : 'up')"
                      class="menubar-icons"
                      v-tooltip="$t('educomplex.tooltip.cover')"
                      v-if="!screen.departments.minimized"
                      @click="cover('departments')"></Button>
              <Button :icon="'fa-solid fa-angle-' + (screen.isLarge ? 'right' : 'down')"
                      class="menubar-icons"
                      v-tooltip="$t('educomplex.tooltip.uncover')"
                      v-if="screen.departments.minimized"
                      @click="uncover('departments')"></Button>
            </div>
          </template>
        </Toolbar>
        <DataTable @row-click="rowClickHandler" v-if="!screen.departments.minimized" :value="departments" dataKey="id" :rows="departmentRows" :totalRecords="totalDepartments"
                   :class="{'p-datatable-sm': !screen.isLarge}" :paginator="true" :paginatorTemplate="paginatorTemplate" :rowsPerPageOptions="[10, 25, 50]"
                   :currentPageReportTemplate="currentPageReportTemplate" :lazy="true" :loading="departmentTableLoading" scrollable scrollHeight="flex"
                   v-model:selection="currentDepartment" selectionMode="single" :rowHover="true" stripedRows class="flex-grow-1"
                   @page="onPageDepartment" @row-dblclick="doubleClickDepartment" @update:selection="onSelectionDepartment">
          <Column :header="faculty ? $t('educomplex.columns.cafedras', {'faculty': getDepartmentName(faculty)}) : 
            $t('educomplex.columns.faculties')" style="min-width: 250px;">
            <template #body="slotProps">
              {{ getDepartmentName(slotProps.data) }}
            </template>
          </Column>
          <Column style="min-width: 20px;justify-content: end">
            <template #header="">
              <Button @click="home" icon="fa-solid fa-arrow-left" class="menubar-icons" v-if="faculty"/>
            </template>
            <template #body="slotProps" v-if="!faculty">
              <div style="width: 100%; display: flex; justify-content: flex-end;">
                <Button @click="currentDepartment=slotProps.data;into()"
                        class="p-button-text p-button-info p-1" v-tooltip="$t('educomplex.tooltip.into')">
                  <i class="fa-solid fa-arrow-right-to-bracket menubar-icons"></i>
                </Button>
              </div>
            </template>
          </Column>
        </DataTable>
      </div>
      <div class="flex flex-column" :class="{ 'flex-grow-1': !screen.files.minimized }" :style="getFilesWidth()">
        <Toolbar class="p-1">
          <template #start>
            <div class="flex flex-wrap">
              <Button icon="fa-solid fa-minimize" class="menubar-icons"
                      v-tooltip="$t('educomplex.tooltip.minimize')"
                      v-if="screen.files.maximized"
                      @click="minimize('files')"></Button>
              <Button icon="fa-solid fa-maximize" class="menubar-icons"
                      v-tooltip="$t('educomplex.tooltip.maximize')"
                      v-if="!screen.files.maximized"
                      @click="maximize('files')"></Button>
              <Button :icon="'fa-solid fa-angle-' + (screen.isLarge ? 'right' : 'down')"
                      class="menubar-icons"
                      v-tooltip="$t('educomplex.tooltip.cover')"
                      v-if="!screen.files.minimized"
                      @click="cover('files')"></Button>
              <Button :icon="'fa-solid fa-angle-' + (screen.isLarge ? 'left' : 'up')"
                      class="menubar-icons"
                      v-tooltip="$t('educomplex.tooltip.uncover')"
                      v-if="screen.files.minimized"
                      @click="uncover('files')"></Button>
            </div>
          </template>
          <template v-if="!screen.files.minimized" #end>
            <div v-if="screen.isLarge" class="flex flex-wrap gap-2">
              <Button class="p-button-info align-items-center" style="padding: 0.25rem 1rem;"
                      @click="clearNewFile();open('addDocumentDialog')" :disabled="!faculty || !currentDepartment">
                <i class="fa-solid fa-file-circle-plus"/>
                &nbsp;{{ $t("educomplex.add") }}
              </Button>
              <Button v-if="currentFile && currentFile.docHistory.stateId === Enum.CREATED.ID"
                      class="p-button-info align-items-center" style="padding: 0.25rem 1rem;"
                      @click="clearStages();open('sendToApproveDialog')"
                      :disabled="loginedUser.userID !== currentFile.creatorID">
                <i class="fa-solid fa-file-contract"/>
                &nbsp;{{ $t("educomplex.toapprove") }}
              </Button>
              <Button v-if="currentFile && currentFile.docHistory.stateId === Enum.INAPPROVAL.ID"
                      class="p-button-warning align-items-center" style="padding: 0.25rem 1rem;"
                      @click="revisionComment=null;open('sendToRevisionDialog')"
                      :disabled="disableRevisionButton">
                <i class="fa-solid fa-file-circle-exclamation"/>
                &nbsp;{{ $t("common.revision") }}
              </Button>
              <Button v-if="currentFile && currentFile.docHistory.stateId === Enum.REVISION.ID"
                      class="p-button-help align-items-center" style="padding: 0.25rem 1rem;"
                      @click="clearNewFile(currentFile);open('addDocumentDialog')"
                      :disabled="loginedUser.userID !== currentFile.creatorID">
                <i class="fa-solid fa-file-pen"/>
                &nbsp;{{ $t('common.edit') }}
              </Button>
              <Button class="align-items-center" :class="{'p-button-success': filter.global, 'p-button-info': !filter.global}"
                      style="padding: 0.25rem 1rem;" @click="toggle('filterOverlayPanel', $event)">
                <i class="fa-solid fa-filter"/> &nbsp;{{ $t("educomplex.filter") }}
              </Button>
            </div>
            <div v-else class="flex flex-wrap">
              <Button icon="fa-solid fa-file-circle-plus" class="menubar-icons"
                      v-tooltip="$t('educomplex.add')" :disabled="!faculty || !currentDepartment"
                      @click="clearNewFile();open('addDocumentDialog')"></Button>
              <Button v-if="currentFile && currentFile.docHistory.stateId === Enum.CREATED.ID"
                      icon="fa-solid fa-file-contract" class="menubar-icons"
                      v-tooltip="$t('educomplex.toapprove')"
                      :disabled="loginedUser.userID !== currentFile.creatorID"
                      @click="clearStages();open('sendToApproveDialog')"></Button>
              <Button v-if="currentFile && currentFile.docHistory.stateId === Enum.INAPPROVAL.ID"
                      icon="fa-solid fa-file-circle-exclamation" class="menubar-icons"
                      v-tooltip="$t('common.revision')" :disabled="disableRevisionButton"
                      @click="revisionComment=null;open('sendToRevisionDialog')"></Button>
              <Button v-if="currentFile && currentFile.docHistory.stateId === Enum.REVISION.ID"
                      icon="fa-solid fa-file-pen" class="menubar-icons"
                      v-tooltip="$t('common.edit')" :disabled="loginedUser.userID !== currentFile.creatorID"
                      @click="clearNewFile(currentFile);open('addDocumentDialog')"></Button>
              <Button icon="fa-solid fa-filter" class="menubar-icons"
                      v-tooltip="$t('educomplex.filter')"
                      @click="toggle('filterOverlayPanel', $event)"></Button>
            </div>
          </template>
        </Toolbar>
        <DataTable v-if="!screen.files.minimized" :value="files" dataKey="id" :rows="fileRows" :totalRecords="totalFiles"
                   :class="{'p-datatable-sm': !screen.isLarge}" :paginator="true" :paginatorTemplate="paginatorTemplate" :rowsPerPageOptions="[10, 25, 50]"
                   :currentPageReportTemplate="currentPageReportTemplate" :lazy="true" :loading="fileTableLoading" scrollable scrollHeight="flex"
                   v-model:selection="currentFile" selectionMode="single" :rowHover="true" stripedRows class="flex-grow-1"
                   @page="onPageFile">
          <Column :header="$t('educomplex.columns.name')" style="min-width: 150px;">
            <template #body="slotProps">
              {{ slotProps.data['name' + $i18n.locale] }}
            </template>
          </Column>
          <Column :header="$t('educomplex.columns.author')" style="min-width: 150px;">
            <template #body="slotProps">
              {{ getFullname(slotProps.data.owner) }}
            </template>
          </Column>
          <Column :header="$t('educomplex.columns.year')" style="min-width: 50px;">
            <template #body="slotProps">
              {{ slotProps.data.createDate ? (new Date(slotProps.data.createDate)).getFullYear() : '-' }}
            </template>
          </Column>
          <Column style="min-width: 35px;">
            <template #body="slotProps">
              <div v-if="showMySign(slotProps.data.approvalStages)">
                <i v-if="greenMySign(slotProps.data.approvalStages)" class="fa-solid fa-square-pen fa-xl approved"></i>
                <i v-else class="fa-solid fa-square-pen fa-xl not-approved"></i>
              </div>
            </template>
          </Column>
          <Column :header="statusColumnHeader" style="min-width: 150px;">
            <template #body="slotProps">
              <span :class="'customer-badge status-' + slotProps.data.docHistory.code">
                {{ slotProps.data.docHistory[$i18n.locale === 'en' ? 'stateEn' : $i18n.locale === 'ru' ? 'stateRus' : 'stateKaz'] }} 
              </span>
            </template>
          </Column>
          <Column style="min-width: 50px;">
            <template #body="slotProps">
              <ActionButton :items="initItems(slotProps.data)" :showTooltip="true" @toggle="showActions(slotProps.data)"/>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
  </BlockUI>
  <!-- addDocumentDialog -->
  <Dialog :header="$t('hdfs.uploadTitle')" :docType="docType" v-model:visible="visibility.addDocumentDialog"
          :style="{width: '60vw'}" :modal="true">
    <PostFile :fileUpload="true" :modelValue="newFile" directory="eduMetComplex"
              @updated="close('addDocumentDialog');getFiles()" accept=".pdf" :docType="docType"></PostFile>
  </Dialog>
  <!-- documentInfoSidebar -->
  <Sidebar v-model:visible="visibility.documentInfoSidebar" position="right" class="p-sidebar-lg"
           style="overflow-y: scroll" @hide="getFiles">
    <DocSignaturesInfo :docIdParam="currentFile.uuid"></DocSignaturesInfo>
  </Sidebar>
  <!-- revisionInfoSidebar -->
  <Sidebar v-model:visible="visibility.revisionInfoSidebar" position="right" class="p-sidebar-lg"
           style="overflow-y: scroll">
    <DocInfo :ID="currentFile.id"></DocInfo>
  </Sidebar>
  <!-- sendToApproveDialog -->
  <Dialog :header="$t('common.action.sendToApprove')" v-model:visible="visibility.sendToApproveDialog"
          :style="{width: '50vw'}">
    <div class="p-fluid">
      <ApprovalUsers :approving="loading" v-model="selectedUsers"
                     @closed="close('sendToApproveDialog')" @approve="approve($event)" :stages="stages"
                     :mode="'standard'"></ApprovalUsers>
    </div>
  </Dialog>
  <!-- sendToRevisionDialog -->
  <Dialog :header="$t('common.revision')" v-model:visible="visibility.sendToRevisionDialog"
          :style="{width: '50vw'}" :modal="true">
    <div class="p-fluid">
      <div class="field">
        <label for="dialognote"> {{ $t('common.comment') }} </label>
        <InputText id="dialognote" class="mb-2" v-bind:placeholder="$t('common.comment')"
                   v-model="revisionComment" type="text"/>
      </div>
    </div>
    <template #footer>
      <Button :label="$t('common.no')" icon="pi pi-times"
              @click="close('sendToRevisionDialog')" class="p-button-text"/>
      <Button :label="$t('common.yes')" icon="pi pi-check"
              @click="revision" autofocus/>
    </template>
  </Dialog>
  <!-- filterOverlayPanel -->
  <OverlayPanel ref="filterOverlayPanel" @hide="onHideFilterOverlayPanel">
    <div class="p-fluid">
      <div class="field">
        <label>{{ $t('contracts.filter.author') }}</label>
        <FindUser v-model="filter.author" @update:modelValue="onUpdateTextProfile" :max="1" :userType="3"></FindUser>
      </div>
      <div class="field">
        <label>{{ $t('common.name') }}</label>
        <InputText type="text" v-model="filter.name" @update:modelValue="onUpdateText"/>
      </div>
      <div class="field">
        <label>{{ $t('common.status') }}</label>
        <Dropdown v-model="filter.status" :options="statuses" optionValue="id"
                  class="p-column-filter" :showClear="true">
          <template #value="slotProps">
            <span v-if="slotProps.value" :class="'customer-badge status-' + statuses.find((e) => e.id === slotProps.value).value">
              {{
                $i18n.locale === 'kz' ? statuses.find((e) => e.id === slotProps.value).nameKz : $i18n.locale === 'ru'
                    ? statuses.find((e) => e.id === slotProps.value).nameRu : statuses.find((e) => e.id === slotProps.value).nameEn
              }}
            </span>
          </template>
          <template #option="slotProps">
            <span :class="'customer-badge status-' + slotProps.option.value">
              {{
                $i18n.locale === 'kz' ? slotProps.option.nameKz : $i18n.locale === 'ru'
                    ? slotProps.option.nameRu : slotProps.option.nameEn
              }}
            </span>
          </template>
        </Dropdown>
      </div>
      <div class="field" v-if="docType == eduComplexDocType">
        <label>{{ $t('educomplex.years') }}</label>
        <PrimeCalendar v-model="filter.years" dateFormat="yy"
                       selectionMode="multiple" view="year" :minDate="new Date(2020, 0)"
                       :maxDate="new Date(new Date().getFullYear() + 5, 0)"/>
      </div>
      <div class="field" v-if="docType == attestationDocReportType">
        <label>{{ $t('educomplex.years') }}</label>
        <PrimeCalendar v-model="filter.years" dateFormat="yy" selectionMode="range" view="year"/>
      </div>
      <div class="field">
        <div class="flex align-items-center">
          <Checkbox v-model="filter.global" :binary="true"/>
          <label class="ml-2"> {{ $t('educomplex.globalFilter') }} </label>
        </div>
      </div>
      <div class="field">
        <Button :label="$t('common.clear')" @click="filter.applied = false;clearFilter();
          clearDocFilter();getFiles()" class="mb-2 p-button-outlined"/>
        <Button :label="$t('common.search')" @click="filter.applied = true;setDocFilter();getFiles()" class="mt-2"/>
      </div>
    </div>
  </OverlayPanel>
</template>
<script>
import api from '@/service/api';

import {getHeader, smartEnuApi} from "@/config/config";
import Enum from "@/enum/docstates/index";

import ApprovalUsers from "@/components/ncasigner/ApprovalUsers/ApprovalUsers";
import DocSignaturesInfo from "@/components/DocSignaturesInfo";
import DocInfo from "@/components/documents/DocInfo";
import PostFile from "@/components/documents/PostFile.vue"
import ActionButton from "@/components/ActionButton.vue";
import FindUser from "@/helpers/FindUser";

export default {
  name: 'DisciplineEduMetComplex',
  components: {ActionButton, ApprovalUsers, DocSignaturesInfo, DocInfo, PostFile, FindUser},
  props: {},
  emits: [],
  data() {
    return {
      Enum: Enum,
      loginedUser: null,
      paginatorTemplate: "",
      currentPageReportTemplate: "",

      screen: {
        isLarge: false,
        departments: {
          minimized: false,
          maximized: false,
        },
        files: {
          minimized: false,
          maximized: false,
        },
      },

      visibility: {
        addDocumentDialog: false,
        documentInfoSidebar: false,
        revisionInfoSidebar: false,
        sendToApproveDialog: false,
        sendToRevisionDialog: false,
      },

      loading: false,
      departmentTableLoading: false,
      fileTableLoading: false,

      filter: {
        global: true,
        author: [],
        name: null,
        status: null,
        years: [],
      },

      departments: [],
      faculty: null,
      currentDepartment: null,
      totalDepartments: 0,

      files: [],
      currentFile: null,
      totalFiles: 0,
      docFilter: {
        name: null,
        status: null,
        years: [],
        author: null,
      },

      departmentPage: 0,
      departmentRows: 25,
      filePage: 0,
      fileRows: 10,

      selectedUsers: [],
      stages: [],
      revisionComment: null,
      newFile: null,
      actionsNode: null,
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
        }
      ],
      docType: parseInt(this.$route.params.docType),
      eduComplexDocType: parseInt(Enum.DocType.EduComplex),
      attestationDocReportType: parseInt(Enum.DocType.StateAttestationCommission)
    }
  },
  computed: {
    disableRevisionButton() {
      let approve = this.needToApproveByMe()
      return !approve
    },
    initItems() {
      return (data) => {
        return [
          {
            label: this.$t('educomplex.tooltip.download'),
            icon: 'fa-solid fa-file-arrow-down',
            visible: data && data.filePath != null && data.uuid != null,
            command: () => {
              this.downloadFile(data.uuid, data.filePath)
            }
          },
          {
            label: this.$t('educomplex.tooltip.document'),
            icon: 'fa-solid fa-eye',
            visible: data && data.docHistory.stateId !== Enum.REVISION.ID,
            command: () => {
              this.currentFile = this.actionsNode;
              this.open('documentInfoSidebar')
            }
          },
          {
            label: this.$t('educomplex.tooltip.revision'),
            icon: 'fa-solid fa-file-circle-exclamation',
            visible: data && data.docHistory.stateId === Enum.REVISION.ID,
            command: () => {
              this.currentFile = this.actionsNode;
              this.open('revisionInfoSidebar')

            }
          },
          {
            label: this.$t('educomplex.tooltip.delete'),
            icon: 'fa-solid fa-trash',
            visible: data && (data.docHistory.stateId === Enum.CREATED.ID ||
                data.docHistory.stateId === Enum.REVISION.ID) && this.loginedUser.userID === data.creatorID,
            command: () => {
              this.currentFile = data;
              this.deleteFile(false)
            }
          },

        ];
      }
    },
    statusColumnHeader() {
      if (this.docType === this.eduComplexDocType) {
        return this.$t('educomplex.columns.state');
      } else if (this.docType === this.attestationDocReportType) {
        return this.$t('scienceWorks.columns.status');
      }
      return this.$t('educomplex.columns.state');

    }
  },
  created() {
    this.loginedUser = JSON.parse(localStorage.getItem("loginedUser"))
  },
  mounted() {
    this.$emit('apply-flex', true)
    this.checkScreenSize();
    window.addEventListener('resize', this.checkScreenSize);
    this.getDepartments();
  },
  beforeUnmount() {
    this.$emit('apply-flex', false)
    window.removeEventListener('resize', this.checkScreenSize);
  },
  watch: {
    '$route.params.docType'(newDocType) {
      this.docType = newDocType;
      this.reloadPage()
    },
  },
  methods: {
    reloadPage() {
      if (this.$route.params.docType === undefined) {
        this.docType = 2
      }
      this.getFiles()
    },
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
    rowClickHandler(event) {
      this.filter.global = false;
    },
    close(name) {
      this.visibility[name] = false
    },
    toggle(ref, event) {
      this.$refs[ref].toggle(event);
    },
    showActions(node) {
      this.actionsNode = node;
    },
    checkScreenSize() {
      this.screen.isLarge = window.innerWidth >= 640;

      if (this.screen.isLarge) {
        this.paginatorTemplate = "FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink JumpToPageDropdown CurrentPageReport RowsPerPageDropdown";
        this.currentPageReportTemplate = this.$t('common.showingRecordsCount', {
          first: '{first}',
          last: '{last}',
          totalRecords: '{totalRecords}',
        });
      } else {
        this.paginatorTemplate = "PrevPageLink CurrentPageReport NextPageLink JumpToPageDropdown";
        this.currentPageReportTemplate = this.$t('common.showingRecordsCountShort', {
          first: '{first}',
          last: '{last}',
          totalRecords: '{totalRecords}',
        });
      }
    },
    getDepFlexGrow() {
      if (this.screen.departments.maximized) {
        return ' flex-grow-1'
      }

      if (!this.screen.departments.minimized) {
        if (this.screen.isLarge) {
          return ' flex-grow-2'
        } else {
          return ' flex-grow-1'
        }
      }

      return ''
    },
    getFilesWidth() {
      if (!this.screen.isLarge) {
        return 'max-width: 100%'
      }

      if (this.screen.files.minimized) {
        return ''
      }

      if (this.screen.files.maximized) {
        if (this.$refs.outerDiv) {
          return 'max-width: ' + (this.$refs.outerDiv.clientWidth - 42) + 'px'
        }

        return 'max-width: 90%'
      }

      return 'max-width: 66.66%'
    },
    getDepartmentName(department) {
      if (this.$i18n.locale === 'kz') {
        return department.nameKz
      } else if (this.$i18n.locale === 'ru') {
        return department.nameRu
      } else if (this.$i18n.locale === 'en') {
        return department.nameEn
      } else {
        return department.name
      }
    },
    getFullname(user) {
      if (!user) {
        return ''
      }

      let fullname = ''
      if (this.$i18n.locale === 'en') {
        if (user.lastnameEn) {
          fullname += user.lastnameEn + ' '
        }

        if (user.firstnameEn) {
          fullname += user.firstnameEn + ' '
        }

        if (user.thirdnameEn) {
          fullname += user.thirdnameEn + ' '
        }
      } else {
        if (user.thirdName) {
          fullname += user.thirdName + ' '
        }

        if (user.firstName) {
          fullname += user.firstName + ' '
        }

        if (user.lastName) {
          fullname += user.lastName + ' '
        }
      }

      return fullname
    },
    neutral() {
      this.screen.departments.minimized = false
      this.screen.departments.maximized = false
      this.screen.files.minimized = false
      this.screen.files.maximized = false
    },
    minimize(element) {
      let verse = 'departments'
      if (element === 'departments') {
        verse = 'files'
      }

      this.screen[element].minimized = true
      this.screen[element].maximized = false
      this.screen[verse].minimized = false
      this.screen[verse].maximized = true
    },
    maximize(element) {
      let verse = 'departments'
      if (element === 'departments') {
        verse = 'files'
      }

      this.minimize(verse)
    },
    uncover(element) {
      this.neutral()
    },
    isTest(element) {
    },
    cover(element) {
      if (this.screen[element].maximized) {
        this.neutral()
      } else {
        this.minimize(element)
      }
    },
    clearStages() {
      this.selectedUsers = [{
        stage: 1,
        users: [this.loginedUser],
        certificate: {
          namekz: "Жеке тұлғаның сертификаты",
          nameru: "Сертификат физического лица",
          nameen: "Certificate of an individual",
          value: "individual"
        }
      }];

      if (this.docType && this.docType == this.Enum.DocType.EduComplex) {
        this.stages = [
          {
            stage: 1,
            users: [this.loginedUser],
            titleRu: "Преподаватель",
            titleKz: "Оқытушы",
            titleEn: "Teacher",
            certificate: {
              namekz: "Жеке тұлғаның сертификаты",
              nameru: "Сертификат физического лица",
              nameen: "Certificate of an individual",
              value: "individual"
            },
          },
          {
            stage: 2,
            users: null,
            titleRu: "Заведующий кафедры",
            titleKz: "Кафедра меңгерушісі",
            titleEn: "Head of Department",
            certificate: {
              namekz: "Ішкі құжат айналымы үшін (ГОСТ)",
              nameru: "Для внутреннего документооборота (ГОСТ)",
              nameen: "For internal document management (GOST)",
              value: "internal"
            },
          },
          {
            stage: 3,
            users: null,
            titleRu: "Председатель УМК",
            titleKz: "ОӘК төрағасы",
            titleEn: "Chairman of the EMC",
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
            titleRu: "Директор научной библиотеки",
            titleKz: "Ғылыми кітапхана директоры",
            titleEn: "Director of the Scientific Library",
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
            titleRu: "Декан",
            titleKz: "Декан",
            titleEn: "Dean",
            certificate: {
              namekz: "Ішкі құжат айналымы үшін (ГОСТ)",
              nameru: "Для внутреннего документооборота (ГОСТ)",
              nameen: "For internal document management (GOST)",
              value: "internal"
            },
          }
        ];
      }
      if (this.docType && this.docType == this.Enum.DocType.StateAttestationCommission) {
        this.stages = [
          {
            stage: 1,
            users: null,
            titleRu: "Председатель",
            titleKz: "Төраға",
            titleEn: "Chairman",
            certificate: {
              namekz: "Жеке тұлғаның сертификаты",
              nameru: "Сертификат физического лица",
              nameen: "Certificate of an individual",
              value: "individual"
            },
          },
          {
            stage: 2,
            users: null,
            titleRu: "Декан",
            titleKz: "Декан",
            titleEn: "Dean",
            certificate: {
              namekz: "Ішкі құжат айналымы үшін (ГОСТ)",
              nameru: "Для внутреннего документооборота (ГОСТ)",
              nameen: "For internal document management (GOST)",
              value: "internal"
            },
          }
        ];
      }


    },
    clearNewFile(file) {
      if (file) {
        this.newFile = file

        this.newFile.lang = file.lang === 2 ? {name: "en", value: 2} : file.lang === 1 ? {name: "ru", value: 1} : {name: "kz", value: 0};
        this.newFile.params = []

        for (let i in file.newParams) {
          this.newFile.params.push(file.newParams[i])
        }

        return
      }
      if (this.docType && this.docType == this.Enum.DocType.StateAttestationCommission) {
        this.newFile = {
          id: null,
          namekz: "",
          nameru: "",
          nameen: "",
          lang: {name: "kz", value: 0},
          docType: this.Enum.DocType.StateAttestationCommission,
          departmentID: this.currentDepartment.id,
          params: [
            {
              name: "saceduprogram",
              value: null,
              description: "saceduprogram",
            },
            {
              name: "academicyear",
              value: null,
              description: "academicyear",
            },
          ],
        }

      }
      if (this.docType && this.docType == this.Enum.DocType.EduComplex) {
        this.newFile = {
          id: null,
          namekz: "",
          nameru: "",
          nameen: "",
          lang: {name: "kz", value: 0},
          docType: this.Enum.DocType.EduComplex,
          departmentID: this.currentDepartment.id,
          params: [
            {
              name: "modulname",
              value: null,
              description: "модуль атауы",
            },
            {
              name: "eduprogram",
              value: null,
              description: "білім беру бағдарламасы атауы",
            },
            {
              name: "discipline",
              value: null,
              description: "discipline",
            },
          ],


        }
      }


    },
    setDocFilter() {
      this.docFilter = {
        name: this.filter.name,
        status: this.filter.status,
        years: this.filter.years,
        author: this.filter.author?.length > 0 && this.filter.author[0] ? this.filter.author[0].userID : null,
      };
    },
    clearDocFilter() {
      this.docFilter = {
        author: null,
        name: null,
        status: null,
        years: [],
      };
    },
    clearFilter() {
      this.filter = {
        author: null,
        global: false,
        name: null,
        status: null,
        years: [],
      };
    },
    onPageDepartment(event) {
      this.departmentPage = event.page;
      this.departmentRows = event.rows;
      this.getDepartments();
    },
    doubleClickDepartment(event) {
      if (this.faculty) {
        return
      }

      this.faculty = JSON.parse(JSON.stringify(event.data));
      this.getDepartments();
    },
    onSelectionDepartment(event) {
      this.getFiles();
    },
    home() {
      this.faculty = null;
      this.getDepartments();
    },
    into() {
      if (this.faculty) {
        return
      }

      this.faculty = JSON.parse(JSON.stringify(this.currentDepartment));
      this.getDepartments();
    },
    getDepartments() {
      this.departmentTableLoading = true

      api.post('/departments', {
        orgId: 1,
        parentId: this.faculty ? this.faculty.id : null,
        isFaculty: this.faculty ? false : true,
        hasManager: this.faculty ? true : false,
        page: this.departmentPage,
        rows: this.departmentRows,
      }, {
        headers: getHeader()
      }).then(res => {
        this.departments = res.data.departments;
        this.totalDepartments = res.data.total;
        this.currentDepartment = null;

        this.departmentTableLoading = false;
        this.filePage = 0;
        this.getFiles();
      }).catch(err => {
        this.departments = []
        this.totalDepartments = 0
        this.currentDepartment = null

        if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout")
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath), null)
        } else {
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
        }

        this.departmentTableLoading = false;
        this.filePage = 0;
        this.getFiles();
      });
    },
    onPageFile(event) {
      this.filePage = event.page;
      this.fileRows = event.rows
      this.getFiles();
    },
    getFiles() {
      if (!this.currentDepartment && !this.filter.global) {
        this.files = []
        this.totalFiles = 0
        this.currentFile = null

        return
      }
      this.loading = true
      this.fileTableLoading = true

      api.post('/documents', {
        page: this.filePage,
        rows: this.fileRows,
        docType: parseInt(this.docType, 10),
        departmentId: this.filter.global ? null : this.currentDepartment.id,
        filter: this.docFilter,
      }, {
        headers: getHeader()
      }).then(res => {
        this.files = res.data.documents
        this.totalFiles = res.data.total
        this.currentFile = null

        this.fileTableLoading = false
        this.loading = false
      }).catch(err => {
        this.files = []
        this.totalFiles = 0
        this.currentFile = null

        if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout")
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath), null)
        } else {
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
        }

        this.fileTableLoading = false
        this.loading = false
      })
    },
    downloadFile(uuid, filepath) {
      if (!uuid || !filepath) {
        return
      }

      this.loading = true

      api.post('/document/download', {
        uuid: uuid,
      }, {
        headers: getHeader()
      }).then(res => {
        const link = document.createElement("a");
        link.href = "data:application/octet-stream;base64," + res.data;
        link.setAttribute("download", filepath);
        link.download = filepath;
        link.click();
        URL.revokeObjectURL(link.href);

        this.loading = false
      }).catch(err => {
        if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout")
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath), null)
        } else {
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
        }

        this.loading = false
      })
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

          api.post('/document/delete', {
            uuid: this.currentFile.uuid,
          }, {
            headers: getHeader()
          }).then(res => {
            this.showMessage('success', this.$t('common.success'), this.$t('common.message.successCompleted'));
            this.getFiles();

            this.loading = false
          }).catch(err => {
            if (err.response && err.response.status == 401) {
              this.$store.dispatch("logLout")
            } else if (err.response && err.response.data && err.response.data.localized) {
              this.showMessage('error', this.$t(err.response.data.localizedPath), null)
            } else {
              this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
            }

            this.loading = false
          })
        },
      });
    },
    approve(event) {
      this.loading = true;

      api.post("/doc/sendtoapprovebystage", {
        id: this.currentFile.id,
        appUsers: event
      }, {
        headers: getHeader()
      }).then(res => {
        this.showMessage('success', this.$t('common.success'), this.$t('common.message.succesSendToApproval'));

        this.close("sendToApproveDialog");
        this.getFiles();

        this.loading = false;
      }).catch(err => {
        if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout")
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath), null)
        } else {
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
        }

        this.loading = false
      });
    },
    revision() {
      this.loading = true

      api.post('/document/revision', {
        uuid: this.currentFile.uuid,
        comment: this.revisionComment,
      }, {
        headers: getHeader()
      }).then(res => {
        this.close('sendToRevisionDialog')
        this.getFiles();

        this.loading = false
      }).catch(err => {
        if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout")
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath), null)
        } else {
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
        }

        this.loading = false
      })
    },
    needToApproveByMe() {
      if (!this.currentFile || !this.currentFile.approvalStages) {
        return false
      }

      try {
        for (let i in this.currentFile.approvalStages) {
          let stage = this.currentFile.approvalStages[i]
          let stagePassed = true

          for (let j = 0; j < stage.users.length; j++) {
            if (stage.usersApproved[j] < 1) {
              stagePassed = false
            }

            if (stage.users[j].userID === this.loginedUser.userID && stage.usersApproved[j] < 1) {
              return true
            }
          }

          if (!stagePassed) {
            break
          }
        }
      } catch (e) {
        return false
      }

      return false
    },
    showMySign(approvalStages) {
      try {
        for (let i in approvalStages) {
          let stage = approvalStages[i]
          let stagePassed = true

          for (let j = 0; j < stage.users.length; j++) {
            if (stage.usersApproved[j] < 1) {
              stagePassed = false
            }

            if (stage.users[j].userID === this.loginedUser.userID) {
              return true
            }
          }

          if (!stagePassed) {
            break
          }
        }
      } catch (e) {
        return false
      }

      return false
    },
    greenMySign(approvalStages) {
      let signed = true

      try {
        for (let i in approvalStages) {
          let stage = approvalStages[i]
          let stagePassed = true

          for (let j = 0; j < stage.users.length; j++) {
            if (stage.usersApproved[j] < 1) {
              stagePassed = false
            }

            if (stage.users[j].userID === this.loginedUser.userID && stage.usersApproved[j] < 1) {
              signed = false
            }
          }

          if (!stagePassed) {
            break
          }
        }
      } catch (e) {
        return signed
      }

      return signed
    },
    onHideFilterOverlayPanel() {
      if (!this.filter.applied) this.clearFilter()
    },
    onUpdateText() {
      if (this.filter.name.length < 1) {
        this.filter.name = null
      }
    },
    onUpdateTextProfile() {
      if (this.filter.author.length < 1) {
        this.filter.author = null
      }
    }
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

.menubar-icons {
  background-color: transparent;
  border: transparent;
  color: #5fc9f3;
}

.menubar-icons:hover {
  background-color: transparent;
  border: transparent;
  color: #2e79ba;
}

.menubar-icons:focus {
  background-color: transparent;
  border: transparent;
  box-shadow: 0 0 0 0.2rem #5fc9f3;
  color: #2e79ba;
}

.approved {
  color: #42855B;
}

.not-approved {
  color: #a6a6a6;
}

@media (max-width: 1550px) {
  .customer-badge {
    font-size: 10px;
  }
}

@media (max-width: 640px) {
  .menubar-icons {
    padding: 0.25rem;
  }

  :deep(.p-paginator.p-component) {
    padding: 0rem;
  }

}

@media (min-width: 640px) {
  .menubar-icons {
    padding: 0.5rem;
  }
}

:deep(.p-datatable.p-datatable-scrollable > .p-datatable-wrapper > .p-datatable-table > .p-datatable-thead) {
  background: transparent;
}
</style>
