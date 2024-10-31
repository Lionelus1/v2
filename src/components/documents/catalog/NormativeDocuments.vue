<template>
  <div class="flex flex-row mb-3">
    <h3 class="m-0">{{ $t("smartenu.catalogNormDoc") }}</h3>
  </div>
  <div class="calendar_buttons flex align-items-center mb-2">
    <Button class="p-button-outlined calendar_btn_left"
            :class="{'active': isGrid}"
            icon="pi pi-th-large"
            @click="getFolders(true)" />
    <Button class="p-button-outlined calendar_btn_right"
            :class="{'active': !isGrid}"
            icon="pi pi-list"
            @click="getFolders(false)" />
  </div>
  <BlockUI :blocked="loading" v-if="!isGrid" class="card">
    <Toolbar class="m-0 p-1">
      <template #start>
        <div v-if="findRole(null, 'normative_docs_admin') || isAdmin">
          <Button @click="open('folderUploadDialog')"
                  :disabled="!tooltip.folder"
                  v-tooltip="$t('educomplex.folder.add')"
                  class="p-button-text p-button-info p-1">
            <i class="fa-solid fa-folder-plus fa-xl" />
          </Button>
          <!-- edit here -->
          <Button @click="open('folderUploadDialog', selectedNode)" :disabled="!selectedNode || selectedNode?.nodeType === 'file' || (!isAdmin && (!tooltip.folder || selectedNode.parentID == null || loginedUser.userID != selectedNode.ownerId))"
                  v-tooltip="$t('educomplex.folder.edit')" class="p-button-text p-button-info p-1">
            <i class="fa-solid fa-square-pen fa-xl" />
          </Button>
          <Button @click="deleteFolder()" :disabled="!selectedNode || selectedNode?.nodeType === 'file' || (!isAdmin && (!tooltip.folder || selectedNode.parentID == null || loginedUser.userID != selectedNode.ownerId))"
                  v-tooltip="$t('educomplex.folder.delete')" class="p-button-text p-button-info p-1">
            <i class="fa-solid fa-folder-minus fa-xl" />
          </Button>
          <Button v-if="tooltip.folder && !selectedNode.hidden && selectedNode.ownerId === loginedUser.userID"
                  @click="hideFolder()" :disabled="!tooltip.folder || selectedNode.parentID == null"
                  v-tooltip="$t('educomplex.folder.hide')" class="p-button-text p-button-info p-1">
            <i class="fa-solid fa-eye-slash fa-xl" />
          </Button>
          <Button v-if="tooltip.folder && selectedNode.hidden && selectedNode.ownerId === loginedUser.userID"
                  @click="showFolder()" :disabled="selectedNode.parentID == null" v-tooltip="$t('educomplex.folder.show')" class="p-button-text p-button-info p-1">
            <i class="fa-solid fa-eye fa-xl" />
          </Button>
          <!-- <Button @click="open('folderMoveDialog')" :disabled="!tooltip.folder || selectedNode.parentID == null
            || loginedUser.userID != selectedNode.ownerId" class="p-button-text p-button-info p-1">
            <i class="fa-solid fa-right-left fa-xl" />
          </Button> -->
        </div>
      </template>
      <template #end>
        <div v-if="findRole(null, 'normative_docs_admin')">
          <Button @click="open('fileUploadDialog')" :disabled="!tooltip.folder"
                  v-tooltip="$t('educomplex.file.add')" class="p-button-text p-button-info p-1">
            <i class="fa-solid fa-file-circle-plus fa-xl"/>
          </Button>
          <Button @click="open('fileUploadDialog', selectedNode)"  :disabled="!tooltip.file || loginedUser.userID != selectedNode.creatorID"
                  v-tooltip="$t('educomplex.file.edit')" class="p-button-text p-button-info p-1">
            <i class="fa-solid fa-file-pen fa-xl" />
          </Button>
          <Button @click="deleteFile()" :disabled="!tooltip.file || loginedUser.userID != selectedNode.creatorID"
                  v-tooltip="$t('educomplex.file.delete')" class="p-button-text p-button-info p-1">
            <i class="fa-solid fa-file-circle-minus fa-xl" />
          </Button>
          <Button v-if="tooltip.file && !selectedNode.isHidden && loginedUser.userID === selectedNode.creatorID"
                  @click="hideFile()" v-tooltip="$t('educomplex.file.hide')" class="p-button-text p-button-info p-1">
            <i class="fa-solid fa-eye-slash fa-xl" />
          </Button>
          <Button v-if="tooltip.file && selectedNode.isHidden && loginedUser.userID === selectedNode.creatorID"
                  @click="showFile()" v-tooltip="$t('educomplex.file.show')" class="p-button-text p-button-info p-1">
            <i class="fa-solid fa-eye fa-xl" />
          </Button>
        </div>
        <div>
          <Button @click="toggle" aria:haspopup="true" aria-controls="overlay_panel" v-tooltip="$t('educomplex.search')" class="p-button-text p-button-info p-1">
            <i class="fa-solid fa-search fa-xl" />
          </Button>
          <Button v-if="selectedNode && !selectedNode.is_view_only" @click="downloadFile()" :disabled="!tooltip.file && !currentDocument" v-tooltip="$t('educomplex.file.download')" class="p-button-text p-button-info p-1">
            <i class="fa-solid fa-file-arrow-down fa-xl" />
          </Button>
          <Button v-if="selectedNode && selectedNode.is_view_only" @click="openSidebar(selectedNode)" :disabled="!tooltip.file && !currentDocument" v-tooltip="$t('educomplex.show')" class="p-button-text p-button-info p-1">
            <i class="fa-solid fa-eye fa-xl"></i>
          </Button>
        </div>
      </template>
    </Toolbar>
    <div class="flex-grow-1" style="height: 300px;">
      <TreeTable
          :value="catalog"
          :loading="loading"
          :expandedKeys="expandedKeys"
          selectionMode="single"
          v-model:selectionKeys="selectedNodeKey"
          :lazy="true"
          scrollable
          scrollHeight="flex"
          class="p-treetable-sm"
          @node-select="onNodeSelect($event)"
          @node-expand="onNodeExpand($event)"
          v-if="!filterApplied"
      >
        <Column :header="$t('common.name')" :expander="true">
          <template #body="slotProps">
      <span v-if="slotProps.node.hidden || slotProps.node.isHidden">
        <i class="fa-solid fa-folder"></i>&nbsp;{{ slotProps.node['name' + $i18n.locale] }}
      </span>
            <span v-else>
        <i :class="getFileIconClass(slotProps.node.name)"
           :title="slotProps.node.newParams?.FileDescription?.value || $t('hdfs.noDescription')"
           class="custom-tooltip-icon"
        ></i>&nbsp;{{ slotProps.node['name' + $i18n.locale] }}
      </span>
          </template>
        </Column>
      </TreeTable>

      <DataTable :value="documents" dataKey="id" :rows="rows" :totalRecords="total" :first="first"
                 :paginator="true" :paginatorTemplate="paginatorTemplate" :rowsPerPageOptions="[10, 25, 50]"
                 :currentPageReportTemplate="currentPageReportTemplate" :lazy="true" :loading="tableLoading"
                 scrollable scrollHeight="flex" v-model:selection="currentDocument" selectionMode="single"
                 :rowHover="true" stripedRows class="flex-grow-1" @page="onPage" v-else>
        <template #empty>
          {{ this.$t("common.recordsNotFound") }}
        </template>
        <Column :header="$t('educomplex.columns.name')" style="min-width: 50px;">
          <template #body="slotProps">
            {{ slotProps.data['name'+$i18n.locale] ? slotProps.data['name'+$i18n.locale] : '' }}
          </template>
        </Column>
        <Column :header="$t('educomplex.columns.author')" style="min-width: 150px;">
          <template #body="slotProps">
            {{ slotProps.data.author ? getDepartmentName(slotProps.data.author) : '' }}
          </template>
        </Column>
        <Column :header="$t('common.approvedBy')" style="min-width: 50px;">
          <template #body="slotProps">
            {{ slotProps.data.approvedBy ? slotProps.data.approvedBy : '' }}
          </template>
        </Column>
        <Column :header="$t('common.approveDate')" style="min-width: 50px;">
          <template #body="slotProps">
            {{ slotProps.data.approveDate ? slotProps.data.approveDate : '' }}
          </template>
        </Column>
      </DataTable>
    </div>
  </BlockUI>

  <BlockUI :blocked="loading" v-if="isGrid" class="card">
    <Toolbar class="m-0 p-1">
      <template #start>
        <Button @click="open('folderUploadDialog')"
                :disabled="selectedNode?.nodeType !== 'folder'"
                v-tooltip="$t('educomplex.folder.add')"
                class="p-button-text p-button-info p-1">
          <i class="fa-solid fa-folder-plus fa-xl" />
        </Button>
        <Button @click="open('folderUploadDialog', selectedNode)" :disabled="!selectedNode || selectedNode?.nodeType === 'file' || (!isAdmin && (!tooltip.folder || selectedNode?.parentID == null || loginedUser.userID != selectedNode?.ownerId))"
                v-tooltip="$t('educomplex.folder.edit')" class="p-button-text p-button-info p-1">
          <i class="fa-solid fa-square-pen fa-xl" />
        </Button>
        <Button @click="deleteFolder()" :disabled="!selectedNode || selectedNode?.nodeType === 'file' || (!isAdmin && (!tooltip.folder || selectedNode?.parentID == null || loginedUser.userID != selectedNode?.ownerId))"
                v-tooltip="$t('educomplex.folder.delete')" class="p-button-text p-button-info p-1">
          <i class="fa-solid fa-folder-minus fa-xl" />
        </Button>
        <Button v-if="tooltip.folder && !selectedNode?.hidden && selectedNode?.ownerId === loginedUser.userID"
                @click="hideFolder()" :disabled="!tooltip.folder || selectedNode.parentID == null"
                v-tooltip="$t('educomplex.folder.hide')" class="p-button-text p-button-info p-1">
          <i class="fa-solid fa-eye-slash fa-xl" />
        </Button>
        <Button v-if="tooltip.folder && selectedNode?.hidden && selectedNode?.ownerId === loginedUser.userID"
                @click="showFolder()" :disabled="selectedNode.parentID == null" v-tooltip="$t('educomplex.folder.show')" class="p-button-text p-button-info p-1">
          <i class="fa-solid fa-eye fa-xl" />
        </Button>
      </template>
      <template #end>
        <div v-if="findRole(null, 'normative_docs_admin')">
          <Button @click="open('fileUploadDialog')" :disabled="selectedNode?.nodeType !== 'folder'"
                  v-tooltip="$t('educomplex.file.add')" class="p-button-text p-button-info p-1">
            <i class="fa-solid fa-file-circle-plus fa-xl"/>
          </Button>
          <Button @click="open('fileUploadDialog', selectedNode)"  :disabled="selectedNode?.nodeType !== 'file' || loginedUser.userID != selectedNode?.creatorID"
                  v-tooltip="$t('educomplex.file.edit')" class="p-button-text p-button-info p-1">
            <i class="fa-solid fa-file-pen fa-xl" />
          </Button>
          <Button @click="deleteFile()" :disabled="selectedNode?.nodeType !== 'file' || loginedUser.userID !== selectedNode?.creatorID"
                  v-tooltip="$t('educomplex.file.delete')" class="p-button-text p-button-info p-1">
            <i class="fa-solid fa-file-circle-minus fa-xl" />
          </Button>
          <Button v-if="tooltip.file && selectedNode?.isHidden === false && loginedUser.userID === selectedNode?.creatorID"
                  @click="hideFile()" v-tooltip="$t('educomplex.file.hide')" class="p-button-text p-button-info p-1">
            <i class="fa-solid fa-eye-slash fa-xl" />
          </Button>
          <Button v-if="tooltip.file && selectedNode?.isHidden === true && loginedUser.userID === selectedNode.creatorID"
                  @click="showFile()" v-tooltip="$t('educomplex.file.show')" class="p-button-text p-button-info p-1">
            <i class="fa-solid fa-eye fa-xl" />
          </Button>
        </div>
        <div>
          <Button @click="toggle" aria:haspopup="true" aria-controls="overlay_panel" v-tooltip="$t('educomplex.search')" class="p-button-text p-button-info p-1">
            <i class="fa-solid fa-search fa-xl" />
          </Button>
          <Button v-if="selectedNode && !selectedNode?.is_view_only" @click="downloadFile()" :disabled="!tooltip.file && !currentDocument" v-tooltip="$t('educomplex.file.download')" class="p-button-text p-button-info p-1">
            <i class="fa-solid fa-file-arrow-down fa-xl" />
          </Button>
          <Button v-if="selectedNode && selectedNode?.is_view_only" @click="openSidebar(selectedNode)" :disabled="!tooltip.file && !currentDocument" v-tooltip="$t('educomplex.show')" class="p-button-text p-button-info p-1">
            <i class="fa-solid fa-eye fa-xl"></i>
          </Button>
        </div>
      </template>
    </Toolbar>
    <div class="grid-container-wrapper flex-grow-1" style="height: 300px;">
      <div class="breadcrumbs">
  <span
      v-for="(folder, index) in folderBreadCrumbs"
      :key="folder.id"
      class="breadcrumb-item"
  >
    <a
        v-if="index !== folderBreadCrumbs.length - 1"
        @click.prevent="navigateToFolder(folder)"
        href="#"
        class="breadcrumb-link"
    >
      {{ folder.namekz }}
    </a>
    <span
        v-else
        class="current-folder breadcrumb-link"
    >
      {{ folder.namekz }}
    </span>
    <span v-if="index !== folderBreadCrumbs.length - 1" class="breadcrumb-separator"> / </span>
  </span>
      </div>

      <GridComponent :folders="folders" :folderHistory="folderHistory" @card-selected="onCardSelected" @open-folder="openFolder" @go-back="goBack" />
    </div>
  </BlockUI>
  <!-- панель для фильтра -->
  <OverlayPanel ref="overlay_panel">
    <div class="p-fluid">
      <div class="field">
        <label> {{ $t('common.name') }} </label>
        <InputText v-model="filesFilter.name.value" type="text" />
      </div>
      <div class="field">
        <label> {{ $t('common.author') }} </label>
        <DepartmentList :orgType="2" :parentID="1" :autoLoad="true"
                        ref="departmentList"  v-model="filesFilter.author.value" :editMode="true">
        </DepartmentList>
      </div>
      <div class="field">
        <label> {{ $t('common.approveDate') }} </label>
        <Dropdown v-model="filesFilter.year.matchMode" :options="matchModes" optionLabel="value"
                  optionValue="value" :placeholder="$t('common.select')">
          <template #value="slotProps">
            <span> {{ $t('common.' + slotProps.value) }} </span>
          </template>
          <template #option="slotProps">
            <span> {{ $t('common.' + slotProps.option.value) }} </span>
          </template>
        </Dropdown>
        <PrimeCalendar class="mt-2" v-model="filesFilter.year.value" view="year" dateFormat="yy" />
      </div>
      <div class="field">
        <Button :label="$t('common.search')" @click="filterApplied = true; getFilesRaw()" class="mt-2" />
        <Button v-if="filterApplied" :label="$t('common.filterReset')" @click="filterApplied = false; currentDocument = null;" class="mt-2 p-button-warning" />
      </div>
    </div>
  </OverlayPanel>
  <!-- folder upload -->
  <Dialog :header="$t('common.newCatalog')" v-model:visible="visibility.folderUploadDialog" :style="{width: '60vw'}" :modal="true">
    <PostFolder :modelValue="newNode" @updated="folderUpdated($event)"></PostFolder>
  </Dialog>
  <!-- file upload -->
  <Dialog :header="$t('hdfs.uploadTitle')" v-model:visible="visibility.fileUploadDialog" :style="{width: '60vw'}" :modal="true">
    <PostFile :approveInfo="true" :fileUpload="fileUpload" :modelValue="newNode" directory="normativeDocs"
              :parentID="selectedNode.id" @updated="fileUpdated($event)" accept=".doc,.docx,.pdf,.zip,.rar,.7z,.gz"></PostFile>
  </Dialog>
  <!-- as -->
  <Dialog :header="$t('common.move')" v-model:visible="visibility.folderMoveDialog"  :style="{width: '75vw'}" :maximizable="true" :modal="true" :contentStyle="{height: '300px'}">
    <TreeTable :scrollable="true" scrollHeight="flex"  class="p-treetable-sm"  @node-select="onMoveNodeSelect($event)" :value="catalog" :lazy="true" :loading="loading"
               @node-expand="onNodeExpand($event)" :totalRecords="totalRecords" selectionMode="single" v-model:selectionKeys="moveto">
      <Column field="name" :header="$t('common.name')" :expander="true">
        <template #body="slotProps">
          <span v-if="slotProps.node.hidden || slotProps.node.isHidden"><i class="fa-solid fa-eye-slash"></i>&nbsp;{{slotProps.node["name"+$i18n.locale]}}</span>
          <span v-else><i :class="'fa-solid fa-' + (slotProps.node.nodeType)"></i>&nbsp;{{ slotProps.node["name"+$i18n.locale] }}</span>
        </template>
      </Column>
    </TreeTable>
    <template #footer>
      <Button label="No" icon="pi pi-times" @click="close('folderMoveDialog')" class="p-button-text" />
      <Button label="Yes" icon="pi pi-check" @click="moveFolder" autofocus />
    </template>
  </Dialog>
  <Dialog v-model:visible="showDoc" class="p-sidebar-lg" style="width: 50%;">
    <ShowDocument :docId="docId"></ShowDocument>
  </Dialog>

</template>
<script>
import api from '@/service/api';
import Tooltip from 'primevue/tooltip';
import { FilterMatchMode } from "primevue/api";
import { getHeader, smartEnuApi, findRole } from "@/config/config";
import Enum from "@/enum/docstates/index"

import DepartmentList from "@/components/smartenu/DepartmentList.vue"
import PostFolder from "@/components/documents/PostFolder.vue"
import PostFile from "@/components/documents/PostFile.vue"
import {DocService} from "@/service/doc.service";
import {getLongDateString, getShortDateString} from "@/helpers/helper";
import ShowDocument from "@/components/documents/ShowDocument.vue";
import GridComponent from "@/components/documents/catalog/GridComponent.vue";

export default {
  name: 'NormativeDocuments',
  components: {GridComponent, ShowDocument, PostFolder, PostFile, DepartmentList },
  emits: [],
  data() {
    return {
      service: new DocService(),
      isGrid: true,
      Enum: Enum,
      loginedUser: {},
      paginatorTemplate: "FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink JumpToPageDropdown CurrentPageReport RowsPerPageDropdown",
      currentPageReportTemplate: this.$t('common.showingRecordsCount', {
        first: '{first}',
        last: '{last}',
        totalRecords: '{totalRecords}',
      }),
      folders: [],
      folderStack: [],
      folderHistory: [],
      folderBreadCrumbs: [],
      fileUpload: false,
      loading: false,
      tableLoading: false,
      selectedFolder: null,

      visibility: {
        folderUploadDialog: false,
        folderMoveDialog: false,
        fileUploadDialog: false,
      },

      tooltip: {
        folder: false,
        file: false,
      },

      catalog: [],
      expandedKeys: {},
      selectedNode: null,
      selectedNodeKey: null,
      selectedMoveNode: null,
      newNode: null,

      documents: [],
      currentDocument: null,
      total: 0,
      first: 0,
      page: 0,
      rows: 10,

      filterApplied: false,
      filesFilter: {
        name: {
          value: null,
          matchMode: FilterMatchMode.CONTAINS,
        },
        author: {
          value: null,
          matchMode: FilterMatchMode.EQUALS,
        },
        year: {
          value: null,
          matchMode: FilterMatchMode.EQUALS,
        },
      },

      matchModes: [
        {value: 'lt'},
        {value: 'gt'},
        {value: 'equals'}
      ],
      docId: null,
      showDoc: false,
      isAdmin: false
    }
  },
  mounted() {
    this.$emit('apply-flex', true);

    this.loginedUser = JSON.parse(window.localStorage.getItem("loginedUser"));
    this.getFolders();
  },
  beforeUnmount() {
    this.$emit('apply-flex', false);
  },
  created() {
    this.isAdmin = this.findRole(null, 'main_administrator')
  },
  methods: {
    openSidebar(selectedNode){
      this.docId = selectedNode.id
      this.showDoc = true
    },
    onCardSelected(folder) {
      this.selectedNode = folder;
      if (folder.nodeType === 'file') {
        this.tooltip.file = true
      } else {
        this.tooltip.folder = true
      }
    },
    openFolder(folder) {
      this.selectedFolder = folder;
      if (!this.isGrid) {
        this.getFolders(this.isGrid, folder);
      } else {
        this.folderHistory.push(this.folders);
        if (folder !== this.folderBreadCrumbs[this.folderBreadCrumbs.length - 1]) {
          this.folderBreadCrumbs.push(folder);
        }

        this.folderStack.push(this.folders);
        this.getFolders(true, folder);
      }
    },
    goBack() {
      if (this.folderHistory.length > 0) {
        this.folders = this.folderHistory.pop(); // Возвращаемся к предыдущим папкам
      }
    },
    navigateToFolder(folder) {
      const folderIndex = this.folderBreadCrumbs.findIndex(item => item && item.id === folder.id);

      if (folderIndex !== -1) {
        this.folderHistory = this.folderHistory.slice(0, folderIndex + 1);
        this.folderBreadCrumbs = this.folderBreadCrumbs.slice(0, folderIndex + 1);
      } else {
        this.folderBreadCrumbs.pop();
      }

      this.openFolder(folder);
    },
    getLongDateString: getLongDateString,
    getShortDateString: getShortDateString,
    findRole: findRole,
    showMessage(msgtype, message, content) {
      this.$toast.add({
        severity: msgtype,
        summary: message,
        detail: content,
        life: 3000
      });
    },
    toggle(event) {
      this.$refs.overlay_panel.toggle(event);
    },
    open(name, node = null) {
      if (node) {
        this.fileUpload = false
        this.newNode = JSON.parse(JSON.stringify(node))
      } else if (name === 'folderUploadDialog') {
        this.resetNewNode(1)
      } else if (name === 'fileUploadDialog') {
        this.fileUpload = true
        this.resetNewNode(2)
      }

      this.visibility[name] = true
    },
    isDisabled() {
       return ((this.selectedNode == null || this.selectedNode.file !== 'file') || this.selectedNode && this.loginedUser.userID !== this.selectedNode.creatorID);

    },
    resetNewNode(type) {
      if (type === 1) {
        this.newNode = {
          groups: this.selectedNode.groups,
          namekz: '',
          nameru: '',
          nameen: '',
          code: '',
          id: null,
          key: null,
          createdDate: null,
          updatedDate: null,
          type: Enum.FolderType.NormativeDocuments,
          parentID: this.selectedNode.id,
          is_view_only: false,
        }
      } else {
        this.newNode = {
          namekz: '',
          nameru: '',
          nameen: '',
          id: null,
          key: null,
          docType: Enum.DocType.NormativeDoc,
          createdDate: null,
          updatedDate: null,
          approvedBy: null,
          approveDate : null,
          author: null,
        }
      }
    },
    close(name) {
      this.visibility[name] = false
    },
    onNodeSelect(node) {
      this.selectedNode = node

      this.tooltip = {
        file: false,
        folder: false
      }

      if (node.nodeType === 'file') {
        this.tooltip.file = true
      } else {
        this.tooltip.folder = true
      }
    },
    onMoveNodeSelect(node) {
      this.selectedMoveNode = node
    },
    onNodeExpand(node) {
      this.getFolders(null, node)
    },
    getFolders(isGrid, parent = null) {
      this.loading = true;

      this.isGrid = isGrid;
      if (isGrid) {
        this.fetchFolders(parent);
      } else {
        this.fetchTreeTable(parent);
      }
    },
    fetchFolders(parent = null) {
      if (parent === null) {
        this.expandedKeys = {}
      }

      api.post('/folders', {
        folderTypes: [Enum.FolderType.NormativeDocuments],
        page: null,
        rows: null,
        parentId: parent !== null ? parent.id : null,
      }, {
        headers: getHeader()
      }).then(res => {
        let data = res.data.folders
        this.folders = res.data.folders;
        if (!data) {
          parent.children = null
          this.getFiles(parent)
          return
        }

        for (let i = 0; i < data.length; i++) {
          data[i].nodeType = 'folder'
          data[i].key = parent !== null ? parent.key + '-' + i.toString() : i.toString()

          if (!data[i].groups) {
            continue
          }

          for (let j = 0; j < data[i].groups.length; j++) {
            delete data[i].groups[j].users
          }
        }

        if (parent === null) {
          this.catalog = data
          this.loading = false
        } else {
          parent.children = data
          this.getFiles(parent)
        }


      }).catch(err => {
        if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout")
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath), null)
        } else {
          console.log(err)
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
        }

        this.loading = false
      })
    },
    fetchTreeTable(parent = null) {
      if (parent === null) {
        this.expandedKeys = {}
      }

      api.post('/folders', {
        folderTypes: [Enum.FolderType.NormativeDocuments],
        page: null,
        rows: null,
        parentId: parent !== null ? parent.id : null,
      }, {
        headers: getHeader()
      }).then(res => {
        let data = res.data.folders
        this.folders = res.data.folders;
        if (!data) {
          parent.children = null
          this.getFiles(parent)
          return
        }

        for (let i = 0; i < data.length; i++) {
          data[i].nodeType = 'folder'
          data[i].key = parent !== null ? parent.key + '-' + i.toString() : i.toString()

          if (!data[i].groups) {
            continue
          }

          for (let j = 0; j < data[i].groups.length; j++) {
            delete data[i].groups[j].users
          }
        }

        if (parent === null) {
          this.catalog = data
          this.loading = false
        } else {
          parent.children = data
          this.getFiles(parent)
        }


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
    getFiles(parent) {
      this.loading = true;

      api.post('/documents', {
        sourceType: null,
        docType: Enum.DocType.NormativeDoc,
        folderId: parent.id,
        page: null,
        rows: null,
      }, {
        headers: getHeader()
      }).then(res => {
        let data = res.data.documents

        if (!data) {
          this.loading = false
          return
        }

        if (!parent.children) {
          parent.children = []
        }

        for (let i = 0; i < data.length; i++) {
          data[i].nodeType = 'file'
          data[i].key = parent.key + '-' + parent.children.length.toString()
          data[i].lang = this.getLang(data[i].lang)
          parent.children.push(data[i])
        }

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
    getLang(lang) {
      if (lang === 0) {
        return {
          name: "kz",
          value: 0
        }
      } else if (lang === 1) {
        return {
          name: "ru",
          value: 1
        }
      } else {
        return {
          name: "en",
          value: 2
        }
      }
    },
    moveFolder() {

    },
    fileUpdated(event) {
      this.close('fileUploadDialog')

      if (this.newNode.id !== this.selectedNode.id) {
        if (!this.selectedNode.children) {
          this.selectedNode.children = []
        }

        this.selectedNode.children.push({
          namekz: event.namekz,
          nameru: event.nameru,
          nameen: event.nameen,
          id: event.id,
          key: this.selectedNode.key + '-' + this.selectedNode.children.length,
          nodeType: 'file',
          createdDate: event.createdDate,
          updatedDate: event.updatedDate,
          docType: Enum.DocType.NormativeDoc,
          approvedBy: event.approvedBy,
          approveDate: new Date(event.approveDate),
          author: event.author,
          creatorID: this.loginedUser.userID,
          isHidden: false,
          lang: event.lang,
          is_view_only: event.is_view_only
        })
      } else {
        this.selectedNode.lang = event.lang
        this.selectedNode.namekz = event.namekz
        this.selectedNode.nameru = event.nameru
        this.selectedNode.nameen = event.nameen
        this.selectedNode.author = event.author
        this.selectedNode.approvedBy = event.approvedBy
        this.selectedNode.approveDate = new Date(event.approveDate)
        this.selectedNode.is_view_only = event.is_view_only
      }

    },
    getFileIconClass(fileName) {

      if (!fileName || typeof fileName !== 'string') {
        return 'fa-solid fa-folder';
      }

      const extension = fileName.split('.').pop().toLowerCase();

      switch (extension) {
        case 'pdf':
          return 'fa-regular fa-file-pdf pdf-icon';
        case 'doc':
          return 'fa-solid fa-file-word word-icon';
        case 'docx':
          return 'fa-solid fa-file-word word-icon';
        case 'xls':
          return 'fa-solid fa-file-excel excel-icon';
        case 'xlsx':
          return 'fa-solid fa-file-excel excel-icon';
        case 'zip':
          return 'fa-solid fa-file-zipper zip-icon';
        case 'mp4':
          return 'fa-solid fa-file-video video-icon';
        case 'MP4':
          return 'fa-solid fa-file-video video-icon';
        case 'pptx':
          return 'fa-solid fa-file-powerpoint powerpoint-icon';
        default:
          return 'fa-solid fa-file';
      }
    },
    folderUpdated(event) {
      this.close('folderUploadDialog')

      if (this.newNode.id !== this.selectedNode.id) {
        if (!this.selectedNode.children) {
          this.selectedNode.children = []
        }

        this.selectedNode.children.push({
          groups: event.groups,
          namekz: event.namekz,
          nameru: event.nameru,
          nameen: event.nameen,
          code: event.code,
          id: event.id,
          key: this.selectedNode.key + '-' + this.selectedNode.children.length,
          leaf: false,
          nodeType: 'folder',
          createdDate: event.createdDate,
          updatedDate: event.updatedDate,
          type: Enum.FolderType.NormativeDocuments,
          parentID: this.selectedNode.id,
          ownerId: this.loginedUser.userID,
          is_view_only: this.selectedNode.is_view_only
        })

      } else {
        this.selectedNode.namekz = event.namekz
        this.selectedNode.nameru = event.nameru
        this.selectedNode.nameen = event.nameen
        this.selectedNode.code = event.code
        this.selectedNode.groups = event.groups
      }
      this.getFolders();
    },
    deleteFolder() {
      if (!this.selectedNode || this.selectedNode.nodeType !== 'folder') {
        return
      }

      this.$confirm.require({
        message: this.$t("common.confirmation"),
        header: this.$t("common.confirm"),
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.loading = true

          api.post('/doc/deleteFolder', {
            id: this.selectedNode.id,
            hide: false,
          }, {
            headers: getHeader()
          }).then(res => {
            this.showMessage('success', this.$t('common.success'), this.$t('common.message.successCompleted'));
            this.deleteNode(this.catalog[0], this.selectedNode.key)

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
        }
      })
    },
    hideFolder() {
      if (!this.selectedNode || this.selectedNode.nodeType !== 'folder') {
        return
      }

      this.$confirm.require({
        message: this.$t("common.confirmation"),
        header: this.$t("common.confirm"),
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.loading = true

          api.post('/doc/deleteFolder', {
            id: this.selectedNode.id,
            hide: true,
          }, {
            headers: getHeader()
          }).then(res => {
            this.showMessage('success', this.$t('common.success'), this.$t('common.message.successCompleted'));
            this.selectedNode.hidden = true

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
        }
      })
    },
    showFolder() {
      if (!this.selectedNode || this.selectedNode.nodeType !== 'folder') {
        return
      }

      this.loading = true

      api.post('/doc/showFolder', {
        id: this.selectedNode.id
      }, {
        headers: getHeader()
      }).then(res => {
        this.showMessage('success', this.$t('common.success'), this.$t('common.message.successCompleted'));

        this.selectedNode.hidden = false
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
      if (!this.selectedNode || this.selectedNode.nodeType !== 'file') {
        return
      }

      this.$confirm.require({
        message: this.$t("common.confirmation"),
        header: this.$t("common.confirm"),
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.loading = true

          api.post('/doc/deleteFile', {
            id: this.selectedNode.id,
            hide: false,
          }, {
            headers: getHeader()
          }).then(res => {
            this.showMessage('success', this.$t('common.success'), this.$t('common.message.successCompleted'));
            this.deleteNode(this.catalog[0], this.selectedNode.key)

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
        }
      })
    },
    hideFile() {
      if (!this.selectedNode || this.selectedNode.nodeType !== 'file') {
        return
      }

      this.$confirm.require({
        message: this.$t("common.confirmation"),
        header: this.$t("common.confirm"),
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.loading = true

          api.post('/doc/deleteFile', {
            id: this.selectedNode.id,
            hide: true,
          }, {
            headers: getHeader()
          }).then(res => {
            this.showMessage('success', this.$t('common.success'), this.$t('common.message.successCompleted'));
            this.selectedNode.isHidden = true

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
        }
      })
    },
    showFile() {
      if (!this.selectedNode || this.selectedNode.nodeType !== 'file') {
        return
      }

      this.loading = true

      api.post('/doc/showFile', {
        id: this.selectedNode.id
      }, {
        headers: getHeader()
      }).then(res => {
        this.showMessage('success', this.$t('common.success'), this.$t('common.message.successCompleted'));

        this.selectedNode.isHidden = false
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
    deleteNode(nodes, key) {
      if (!nodes || !nodes.children) {
        return
      }

      for (let i = 0; i < nodes.children.length; i++) {

        if (nodes.children[i].key === key) {
          nodes.children.splice(i, 1);
          return;
        }

        if (key.startsWith(nodes.children[i].key)) {
          this.deleteNode(nodes.children[i], key);
        }
      }
    },
    downloadFile() {
      if (!this.selectedNode || this.selectedNode.nodeType !== 'file') {
        if (!this.currentDocument) {
          return
        }
      }

      this.loading = true

      api.post('/downloadFile', {
        filePath: this.selectedNode ? this.selectedNode.filePath : this.currentDocument.filePath,
      }, {
        headers: getHeader()
      }).then(res => {
        let link = document.createElement("a");
        link.href = "data:application/octet-stream;base64," + res.data.file;
        link.setAttribute("download", this.selectedNode ? this.selectedNode.name : this.currentDocument.name);
        link.download = this.selectedNode ? this.selectedNode.name : this.currentDocument.name;
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
    getFilesRaw() {
      this.tableLoading = true;

      this.selectedNode = null;
      this.tooltip = {
        file: false,
        folder: false
      }

      this.service.getDocumentsV2({
        page: this.page,
        rows: this.rows,
        docType: this.Enum.DocType.NormativeDoc,
        departmentId: this.filterApplied && this.filesFilter.author.value ? this.filesFilter.author.value.id : null,
        filter: {
          name: this.filterApplied ? this.filesFilter.name.value : null,
          approvedDate: this.filterApplied ? this.filesFilter.year : null,
        },
      }).then(res => {
        this.documents = res.data.documents
        this.total = res.data.total
        this.currentDocument = null

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
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
        }

        this.tableLoading = false
      });
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
    onPage(event) {
      this.first = event.first;
      this.page = event.page;
      this.rows = event.rows;
      this.getFilesRaw();
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
:deep(.p-treetable-toggler) {
  flex-shrink: 0;
}

.pdf-icon {
  color: #ef3131;
  font-size: 1.3em;
}

.word-icon {
  color: #3c68c6;
  font-size: 1.4em;
}

.excel-icon {
  color: #149c49;
  font-size: 1.4em;
}

.zip-icon {
  color: #805b36;
  font-size: 1.4em;
}

.powerpoint-icon {
  color: #ff6900;
  font-size: 1.4em;
}

.video-icon {
  color: #805b36;
  font-size: 1.4em;
}


/* Стили для иконки */
.custom-tooltip-icon {
  cursor: pointer;
}

/* Стили для всплывающей подсказки */
.p-tooltip {
  background-color: #333;   /* Темный фон */
  color: white;             /* Белый текст */
  border-radius: 5px;       /* Скругленные углы */
  padding: 10px;            /* Внутренние отступы */
  font-size: 14px;          /* Размер текста */
  max-width: 250px;         /* Ограничение ширины */
  word-wrap: break-word;    /* Перенос текста */
}

.p-tooltip-arrow {
  border-top-color: #333;   /* Цвет стрелки */
}

.calendar_buttons {
  display: flex;
  justify-content: flex-end; /* Выравнивание кнопок по правому краю */
  gap: 0; /* Расстояние между кнопками */
  align-items: center; /* Выравнивание кнопок по вертикали */
}

.calendar_buttons button {
  border-radius: 10px;
  padding: 7px 20px;
}

.calendar_buttons .calendar_btn_left {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.calendar_buttons .calendar_btn_right {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.calendar_buttons button.active {
  background: #007be5;
  color: #fff;
  border: 1px solid #007be5;
}


.left-btn {
  flex-grow: 1; /* Заставляет левую кнопку занимать всё пространство слева */
}

.right-btns {
  display: flex;
  gap: 10px; /* Отступ между кнопками */
}

.active {
  background-color: #007ad9;
  color: white;
}

.grid-container-wrapper {
  flex-grow: 1;
  overflow-y: auto; /* Enable vertical scroll */
  padding: 10px;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); /* Flexible grid */
  gap: 20px;
  justify-items: center; /* Center cards in grid */
  max-height: 100%; /* Ensure the grid fills available height */
}

.breadcrumbs {
  display: inline-flex;
  align-items: center;
  gap: 8px; /* Увеличенные отступы */
  font-size: 1.1em; /* Увеличенный размер шрифта */
}

.breadcrumb-item {
  display: inline-flex;
  align-items: center;
  max-width: 140px; /* Увеличенная ширина */
  margin: 8px 0; /* Больший отступ сверху и снизу */
}

.breadcrumb-link {
  display: inline-block;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #555; /* Более мягкий цвет */
  text-decoration: none;
  transition: color 0.3s ease; /* Плавный переход цвета при наведении */
}

.breadcrumb-link:hover {
  color: #0066cc; /* Цвет текста при наведении */
}

.current-folder {
  color: #333; /* Убрал жирность, сделал цвет менее заметным */
}

.breadcrumb-separator {
  color: #aaa; /* Более мягкий цвет для разделителя */
  margin: 0 8px; /* Увеличенные отступы */
  font-size: 1.2em; /* Небольшое увеличение размера разделителя */
}



</style>
