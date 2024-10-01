<template>
  <ProgressSpinner v-if="loading" class="progress-spinner" strokeWidth="3"/>
  <div class="flex flex-row mb-3">
    <h3 class="m-0">{{ $t("smartenu.catalogNormDoc") }}</h3>
  </div>
  <BlockUI :blocked="loading" class="card">
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
<!--    v-if="!filterApplied"-->
    <div class="flex-grow-1" style="height: 300px;">
      <TreeTable
          :value="catalog"
          :expandedKeys="expandedKeys"
          selectionMode="single"
          v-model:selectionKeys="selectedNodeKey"
          :lazy="true"
          scrollable
          scrollHeight="flex"
          class="p-treetable-sm"
          @node-select="onNodeSelect($event)"
          @node-expand="onNodeExpand($event)"
          @node-collapse="onNodeCollapse($event)"
          v-if="!filterApplied"
      >
        <Column :header="$t('common.name')" :expander="true">
          <template #body="slotProps">
      <span v-if="slotProps.node.hidden || slotProps.node.isHidden">
        <i class="fa-solid fa-eye-slash"></i>&nbsp;{{ slotProps.node['name' + $i18n.locale] }}
      </span>
            <span v-else>
        <i :class="getFileIconClass(slotProps.node.name)"></i>&nbsp;{{ slotProps.node['name' + $i18n.locale] }}
      </span>

            <!-- Toggle Button Logic -->
            <button
                type="button"
                class="p-treetable-toggler p-link"
                :style="{ visibility: slotProps.node.expanded ? 'visible' : 'hidden' }"
                @click="toggleNodeState(slotProps.node)">
              <svg
                  v-if="isNodeExpanded(slotProps.node)"
                  width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"
                  class="p-icon p-tree-toggler-icon" aria-hidden="true">
                <!-- Expanded icon path -->
                <path d="M7.01744 10.398C6.91269 10.3985 6.8089 10.378 6.71215 10.3379C6.61541 10.2977 6.52766 10.2386 6.45405 10.1641L1.13907 4.84913C1.03306 4.69404 0.985221 4.5065 1.00399 4.31958C1.02276 4.13266 1.10693 3.95838 1.24166 3.82747C1.37639 3.69655 1.55301 3.61742 1.74039 3.60402C1.92777 3.59062 2.11386 3.64382 2.26584 3.75424L7.01744 8.47394L11.769 3.75424C11.9189 3.65709 12.097 3.61306 12.2748 3.62921C12.4527 3.64535 12.6199 3.72073 12.7498 3.84328C12.8797 3.96582 12.9647 4.12842 12.9912 4.30502C13.0177 4.48162 12.9841 4.662 12.8958 4.81724L7.58083 10.1322C7.50996 10.2125 7.42344 10.2775 7.32656 10.3232C7.22968 10.3689 7.12449 10.3944 7.01744 10.398Z" fill="currentColor"></path>
              </svg>
              <svg
                  v-else
                  width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"
                  class="p-icon p-tree-toggler-icon" aria-hidden="true">
                <!-- Collapsed icon path -->
                <path d="M4.38708 13C4.28408 13.0005 4.18203 12.9804 4.08691 12.9409C3.99178 12.9014 3.9055 12.8433 3.83313 12.7701C3.68634 12.6231 3.60388 12.4238 3.60388 12.2161C3.60388 12.0084 3.68634 11.8091 3.83313 11.6622L8.50507 6.99022L3.83313 2.31827C3.69467 2.16968 3.61928 1.97313 3.62287 1.77005C3.62645 1.56698 3.70872 1.37322 3.85234 1.22959C3.99596 1.08597 4.18972 1.00371 4.3928 1.00012C4.59588 0.996539 4.79242 1.07192 4.94102 1.21039L10.1669 6.43628C10.3137 6.58325 10.3962 6.78249 10.3962 6.99022C10.3962 7.19795 10.3137 7.39718 10.1669 7.54416L4.94102 12.7701C4.86865 12.8433 4.78237 12.9014 4.68724 12.9409C4.59212 12.9804 4.49007 13.0005 4.38708 13Z" fill="currentColor"></path>
              </svg>
            </button>
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

import { FilterMatchMode } from "primevue/api";
import { getHeader, smartEnuApi, findRole } from "@/config/config";
import Enum from "@/enum/docstates/index"

import DepartmentList from "@/components/smartenu/DepartmentList.vue"
import PostFolder from "@/components/documents/PostFolder.vue"
import PostFile from "@/components/documents/PostFile.vue"
import {DocService} from "@/service/doc.service";
import {getLongDateString, getShortDateString} from "@/helpers/helper";
import ShowDocument from "@/components/documents/ShowDocument.vue";

export default {
  name: 'NormativeDocuments',
  components: {ShowDocument, PostFolder, PostFile, DepartmentList},
  props: {},
  emits: [],
  data() {
    return {
      service: new DocService(),
      Enum: Enum,
      loginedUser: {},
      paginatorTemplate: "FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink JumpToPageDropdown CurrentPageReport RowsPerPageDropdown",
      currentPageReportTemplate: this.$t('common.showingRecordsCount', {
        first: '{first}',
        last: '{last}',
        totalRecords: '{totalRecords}',
      }),

      fileUpload: false,
      loading: false,
      tableLoading: false,

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
    openSidebar(selectedNode) {
      this.docId = selectedNode.id
      this.showDoc = true
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
          approveDate: null,
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
      if (!node || !node.key) {
        console.warn('Node or node key is undefined on expand');
        return;  // Prevent the function from running if node or key is undefined
      }
      // Your existing logic for expanding the node
      this.getFolders(node);
    },
    isNodeExpanded(node) {
      if (!node || !node.key) {
        return false;  // Prevents the error if node or node.key is undefined
      }
      return this.expandedKeys[node.key];
    },
    toggleNodeState(node) {
      if (!node || !node.key) {
        console.warn('Node or node key is undefined');
        return;  // Exits early if node or node.key is undefined
      }

      if (this.isNodeExpanded(node)) {
        // Collapse the node
        this.$delete(this.expandedKeys, node.key);
      } else {
        // Expand the node
        this.$set(this.expandedKeys, node.key, true);
        this.onNodeExpand(node);
      }
    },
    onNodeCollapse(event) {
      if (!event.node || !event.node.key) {
        console.warn('Node or node key is undefined on collapse');
        return;
      }
      this.$delete(this.expandedKeys, event.node.key);
      this.removeChildrenKeys(event.node);
    },
    removeChildrenKeys(node) {
      // Your existing logic to recursively remove children
      if (node.children) {
        node.children.forEach(child => {
          this.$delete(this.expandedKeys, child.key);
          if (child.children) {
            this.removeChildrenKeys(child);
          }
        });
      }
    },
    getFolders(parent = null) {
      this.loading = true;

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

        if (!data) {
          parent.children = null
          this.getFiles(parent)
          return
        }

        for (let i = 0; i < data.length; i++) {
          data[i].nodeType = 'folder'
          data[i].key = parent !== null ? parent.key + '-' + i.toString() : i.toString()
          data[i].leaf = false

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
          console.log(err)
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
          return 'fa-solid fa-file-pdf';
        case 'doc':
        case 'docx':
          return 'fa-solid fa-file-word';
        case 'xls':
        case 'xlsx':
          return 'fa-solid fa-file-excel';
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
              console.log(err)
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
              console.log(err)
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
          console.log(err)
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
              console.log(err)
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
              console.log(err)
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
          console.log(err)
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
          console.log(err)
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
          console.log(err)
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
</style>