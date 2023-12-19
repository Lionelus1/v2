<template>
  <ProgressBar v-if="loading" mode="indeterminate" class="progress-bar"/>
    <h3 v-if="screen.isLarge">{{ $t("educomplex.title") }}</h3>
    <h3 v-else>{{ $t("educomplex.title") }}</h3>
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
        <DataTable v-if="!screen.departments.minimized" :value="departments" dataKey="id" :rows="departmentRows" :totalRecords="totalDepartments"
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
                  <Button @click="home" icon="fa-solid fa-arrow-left" class="menubar-icons" v-if="faculty" />
              </template>
            <template #body="slotProps" v-if="!faculty">
              <div style="width: 100%; display: flex; justify-content: flex-end;">
                <Button @click="currentDepartment=slotProps.data;into()"
                  class="p-button-text p-button-info p-1" v-tooltip="$t('educomplex.tooltip.into')">
                  <i class="fa-regular fa-folder"></i>
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
                <i class="fa-solid fa-file-circle-plus" />
                &nbsp;{{ $t("educomplex.add") }} </Button>
              <Button v-if="currentFile && currentFile.docHistory.stateId === Enum.CREATED.ID"
                class="p-button-info align-items-center" style="padding: 0.25rem 1rem;"
                @click="clearStages();open('sendToApproveDialog')" 
                :disabled="loginedUser.userID !== currentFile.creatorID">
                <i class="fa-solid fa-file-contract" />
                &nbsp;{{ $t("educomplex.toapprove") }} </Button>
              <Button v-if="currentFile && currentFile.docHistory.stateId === Enum.INAPPROVAL.ID"
                class="p-button-warning align-items-center" style="padding: 0.25rem 1rem;"
                @click="revisionComment=null;open('sendToRevisionDialog')"
                :disabled="disableRevisionButton">
                <i class="fa-solid fa-file-circle-exclamation" />
                &nbsp;{{ $t("common.revision") }} </Button>
              <Button v-if="currentFile && currentFile.docHistory.stateId === Enum.REVISION.ID"
                class="p-button-help align-items-center" style="padding: 0.25rem 1rem;"
                @click="clearNewFile(currentFile);open('addDocumentDialog')" 
                :disabled="loginedUser.userID !== currentFile.creatorID">
                <i class="fa-solid fa-file-pen" />
                &nbsp;{{ $t('common.edit') }} </Button>
              <Button class="align-items-center" :class="{'p-button-success': filter.global, 'p-button-info': !filter.global}" 
                style="padding: 0.25rem 1rem;" @click="toggle('filterOverlayPanel', $event)">
                <i class="fa-solid fa-filter" /> &nbsp;{{ $t("educomplex.filter") }} </Button>
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
          <Column :header="$t('educomplex.columns.state')" style="min-width: 150px;">
            <template #body="slotProps">
              <span :class="'customer-badge status-' + slotProps.data.docHistory.code">
                {{ slotProps.data.docHistory[$i18n.locale === 'en' ? 'stateEn' : $i18n.locale === 'ru' ? 'stateRus' : 'stateKaz'] }} 
              </span>
            </template>
          </Column>
          <Column style="min-width: 50px;">
            <template #body="slotProps">
                <ActionButton :items="initItems" :showTooltip="true" @toggle="showActions(slotProps.data)" />
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
  </BlockUI>
  <!-- addDocumentDialog -->
  <Dialog :header="$t('hdfs.uploadTitle')" v-model:visible="visibility.addDocumentDialog" 
    :style="{width: '60vw'}" :modal="true">
    <PostFile :fileUpload="true" :modelValue="newFile" directory="eduMetComplex"
      @updated="close('addDocumentDialog');getFiles()" accept=".pdf"></PostFile>
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
    :style="{width: '50vw'}" :modal="true" >
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
        <label>{{ $t('common.name') }}</label>
        <InputText type="text" v-model="filter.name" @update:modelValue="onUpdateText"/>
      </div>
      <div class="field">
        <label>{{ $t('common.status') }}</label>
        <Dropdown v-model="filter.status" :options="statuses" optionValue="id"
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
        <label>{{ $t('educomplex.years') }}</label>
        <PrimeCalendar v-model="filter.years" dateFormat="yy"
          selectionMode="multiple" view="year" :minDate="new Date(2020, 0)" 
          :maxDate="new Date(new Date().getFullYear() + 5, 0)"/>
      </div>
      <div class="field">
        <div class="flex align-items-center">
          <Checkbox v-model="filter.global" :binary="true" />
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

import { getHeader, smartEnuApi } from "@/config/config";
import Enum from "@/enum/docstates/index";

import ApprovalUsers from "@/components/ncasigner/ApprovalUsers/ApprovalUsers";
import DocSignaturesInfo from "@/components/DocSignaturesInfo";
import DocInfo from "@/components/documents/DocInfo";
import PostFile from "@/components/documents/PostFile.vue"
import { DocService } from "@/service/doc.service";
import { OrganizationService } from "@/service/organization.service";

import ActionButton from "@/components/ActionButton.vue";

export default {
  name: 'DisciplineEduMetComplex',
  components: {ActionButton, ApprovalUsers, DocSignaturesInfo, DocInfo, PostFile },
  props: { },
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
        global: false,
        name: null,
        status: null,
        years: [new Date(new Date().getFullYear(), 0)],
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
        years: [new Date(new Date().getFullYear(), 0)],
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
      docService: new DocService(),
      organizationService: new OrganizationService()
    }
  },
  computed: {
    disableRevisionButton() {
      let approve = this.needToApproveByMe()
      return !approve
    },
      initItems() {
          return [
              {
                  label: this.$t('educomplex.tooltip.download'),
                  icon: 'fa-solid fa-file-arrow-down',
                  visible: this.actionsNode && this.actionsNode.filePath != null && this.actionsNode.uuid != null,
                  command: () => {
                      this.downloadFile(this.actionsNode.uuid, this.actionsNode.filePath)
                  }
              },
              {
                  label: this.$t('educomplex.tooltip.document'),
                  icon: 'fa-solid fa-eye',
                  visible: this.actionsNode && this.actionsNode.docHistory.stateId !== Enum.REVISION.ID,
                  command: () => {
                      this.currentFile = this.actionsNode;
                      this.open('documentInfoSidebar')
                  }
              },
              {
                  label: this.$t('educomplex.tooltip.revision'),
                  icon: 'fa-solid fa-file-circle-exclamation',
                  visible: this.actionsNode && this.actionsNode.docHistory.stateId === Enum.REVISION.ID,
                  command: () => {
                      this.currentFile = this.actionsNode;
                      this.open('revisionInfoSidebar')

                  }
              },
              {
                  label: this.$t('educomplex.tooltip.delete'),
                  icon: 'fa-solid fa-trash',
                  visible:this.actionsNode && (this.actionsNode.docHistory.stateId === Enum.CREATED.ID ||
                      this.actionsNode.docHistory.stateId === Enum.REVISION.ID) && this.loginedUser.userID === this.actionsNode.creatorID,
                  command: () => {
                      console.log(this.actionsNode)
                      this.currentFile = this.actionsNode;
                      this.deleteFile(false)
                  }
              },

          ];
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
      console.log(element)
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
    },
    clearNewFile(file) {
      if (file) {
        this.newFile = file

        this.newFile.lang = file.lang === 2 ? {name:"en", value:2} : file.lang === 1 ? {name:"ru", value:1} : {name:"kz", value: 0};
        this.newFile.params = []

        for (let i in file.newParams) {
          this.newFile.params.push(file.newParams[i])
        }

        return
      }

      this.newFile = {
        id: null,
        namekz: "",
        nameru: "",
        nameen: "",
        lang: {name:"kz", value: 0},
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
            description: "білім беру баағдарламасы атауы",
          },
          {
            name: "discipline",
            value: null,
            description: "discipline",
          },
        ],
      }
    },
    setDocFilter() {
      this.docFilter = {
        name: this.filter.name,
        status: this.filter.status,
        years: this.filter.years,
      };
    },
    clearDocFilter() {
      this.docFilter = {
        name: null,
        status: null,
        years: [new Date(new Date().getFullYear(), 0)],
      };
    },
    clearFilter() {
      this.filter = {
        global: false,
        name: null,
        status: null,
        years: [new Date(new Date().getFullYear(), 0)],
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
      const req = {
        orgId: 1,
        parentId: this.faculty ? this.faculty.id : null,
        isFaculty: this.faculty ? false : true,
        hasManager: this.faculty ? true : false,
        page: this.departmentPage,
        rows: this.departmentRows,
      }
      this.organizationService.departments(req).then(res => {
        this.departments = res.data.departments
        this.totalDepartments = res.data.total
        this.currentDepartment = null

        this.departmentTableLoading = false;
        this.filePage = 0;
        this.getFiles();
      }).catch(err => {
        this.departments = []
        this.totalDepartments = 0
        this.currentDepartment = null

        if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath), null)
        } else {
          console.log(err)
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

      this.fileTableLoading = true
      const req = {
        page: this.filePage,
        rows: this.fileRows,
        docType: this.Enum.DocType.EduComplex,
        departmentId: this.filter.global ? null : this.currentDepartment.id,
        filter: this.docFilter,
      }
      this.docService.documents(req).then(res => {
        this.files = res.data.documents
        this.totalFiles = res.data.total
        this.currentFile = null

        this.fileTableLoading = false
      }).catch(err => {
        this.files = []
        this.totalFiles = 0
        this.currentFile = null

        if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath), null)
        } else {
          console.log(err)
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
        }

        this.fileTableLoading = false
      })
    },
    downloadFile(uuid, filepath) {
      if (!uuid || !filepath) {
        return
      }

      this.loading = true
      const req = {
        uuid: uuid,
      }
      this.docService.documentDownload(req).then(res => {
        const link = document.createElement("a");
        link.href = "data:application/octet-stream;base64," + res.data;
        link.setAttribute("download", filepath);
        link.download = filepath;
        link.click();
        URL.revokeObjectURL(link.href);

        this.loading = false
      }).catch(err => {
       if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath), null)
        } else {
          console.log(err)
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
          const req = {
            uuid: this.currentFile.uuid,
          }
          this.docService.documentDelete(req).then(res => {
            this.showMessage('success', this.$t('common.success'), this.$t('common.message.successCompleted'));
            this.getFiles();

            this.loading = false
          }).catch(err => {
            if (err.response && err.response.data && err.response.data.localized) {
              this.showMessage('error', this.$t(err.response.data.localizedPath), null)
            } else {
              console.log(err)
              this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
            }

            this.loading = false
          })
        },
      });
    },
    approve(event) {
      this.loading = true;
      const req = {     id: this.currentFile.id,
        appUsers: event
      }
      this.docService.sendtoapprovebystage(req).then(res => {
        this.showMessage('success', this.$t('common.success'), this.$t('common.message.succesSendToApproval'));

        this.close("sendToApproveDialog");
        this.getFiles();

        this.loading = false;
      }).catch(err => {
       if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath), null)
        } else {
          console.log(err)
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
        }

        this.loading = false
      });
    },
    revision() {
      this.loading = true
      const req = {
        uuid: this.currentFile.uuid,
        comment: this.revisionComment
      }
      this.docService.documentRevision(req).then(res => {
        this.close('sendToRevisionDialog')
        this.getFiles();

        this.loading = false
      }).catch(err => {
        if (err.response && err.response.data && err.response.data.localized) {
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
        console.log(e)
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
        console.log(e)
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
        console.log(e)
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
  .customer-badge{
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
