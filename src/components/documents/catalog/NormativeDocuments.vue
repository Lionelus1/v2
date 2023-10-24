<template>
    <h3>{{ $t("smartenu.catalogNormDoc") }}</h3>
  <div class="card mb-0 flex flex-column" :style="{height: innerHeightInRem.toString()+'rem',
    minHeight: '300px'}">
    <Toolbar class="m-0 p-1">
      <template #start>
        <div v-if="findRole(null, 'normative_docs_admin')">
          <Button @click="open('folderUploadDialog')" :disabled="!tooltip.folder" 
            class="p-button-text p-button-info p-1">
            <i class="fa-solid fa-folder-plus fa-xl" />
          </Button>
          <Button @click="open('folderUploadDialog', selectedNode)" :disabled="!tooltip.folder || selectedNode.parentID == null || loginedUser.userID != selectedNode.ownerId" 
            class="p-button-text p-button-info p-1">
            <i class="fa-solid fa-square-pen fa-xl" />
          </Button>
          <Button @click="deleteFolder()" :disabled="!tooltip.folder || selectedNode.parentID == null || loginedUser.userID != selectedNode.ownerId" 
            class="p-button-text p-button-info p-1">
            <i class="fa-solid fa-folder-minus fa-xl" />
          </Button>
          <Button v-if="tooltip.folder && !selectedNode.hidden && selectedNode.ownerId === loginedUser.userID" 
            @click="hideFolder()" :disabled="!tooltip.folder || selectedNode.parentID == null" 
            class="p-button-text p-button-info p-1">
            <i class="fa-solid fa-eye-slash fa-xl" />
          </Button>
          <Button v-if="tooltip.folder && selectedNode.hidden && selectedNode.ownerId === loginedUser.userID"
            @click="showFolder()" :disabled="selectedNode.parentID == null" class="p-button-text p-button-info p-1">
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
            class="p-button-text p-button-info p-1">
            <i class="fa-solid fa-file-circle-plus fa-xl"/>
          </Button>
          <Button @click="open('fileUploadDialog', selectedNode)"  :disabled="!tooltip.file || loginedUser.userID != selectedNode.creatorID" 
            class="p-button-text p-button-info p-1">
            <i class="fa-solid fa-file-pen fa-xl" />
          </Button>
          <Button @click="deleteFile()" :disabled="!tooltip.file || loginedUser.userID != selectedNode.creatorID" 
            class="p-button-text p-button-info p-1">
            <i class="fa-solid fa-file-circle-minus fa-xl" />
          </Button>
          <Button v-if="tooltip.file && !selectedNode.isHidden && loginedUser.userID === selectedNode.creatorID" 
            @click="hideFile()" class="p-button-text p-button-info p-1">
            <i class="fa-solid fa-eye-slash fa-xl" />
          </Button>
          <Button v-if="tooltip.file && selectedNode.isHidden && loginedUser.userID === selectedNode.creatorID" 
            @click="showFile()" class="p-button-text p-button-info p-1">
            <i class="fa-solid fa-eye fa-xl" />
          </Button>
          <!-- <Button @click="toggle()" aria:haspopup="true" aria-controls="overlay_panel" class="p-button-text p-button-info p-1">
            <i class="fa-solid fa-search fa-xl" />
          </Button> -->
        </div>
        <div>
          <Button @click="downloadFile()" :disabled="!tooltip.file" class="p-button-text p-button-info p-1">
            <i class="fa-solid fa-file-arrow-down fa-xl" />
          </Button>
        </div>
      </template>
    </Toolbar>
    <div class="flex-grow-1" style="height: 300px;">
      <TreeTable :value="catalog" :expandedKeys="expandedKeys" selectionMode="single" v-model:selectionKeys="selectedNodeKey"
      :lazy="true" :loading="loading" scrollable scrollHeight="flex" class="p-treetable-sm"
      @node-select="onNodeSelect($event)" @node-expand="onNodeExpand($event)"  >
        <Column :header="$t('common.name')" :expander="true" :pt="{rowToggler: {style: 'flex-shrink: 0;'}}">
          <template #body="slotProps">
            <span v-if="slotProps.node.hidden || slotProps.node.isHidden"><i class="fa-solid fa-eye-slash"></i>&nbsp;{{slotProps.node["name"+$i18n.locale]}}</span>
            <span v-else><i :class="'fa-solid fa-' + (slotProps.node.nodeType)"></i>&nbsp;{{ slotProps.node["name"+$i18n.locale] }}</span>
          </template>
        </Column>
      </TreeTable>
    </div>
  </div>
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
        <Button :label="$t('common.search')" @click="getFilesByFilter()" class="mt-2" />
        <Button v-if="filterApplied != null" :label="$t('common.filterReset')" @click="getFolders()" class="mt-2 p-button-warning" />
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
  
</template>
<script>

import { FilterMatchMode } from "primevue/api";
import { getHeader, smartEnuApi, findRole } from "@/config/config";
import Enum from "@/enum/docstates/index"

import DepartmentList from "@/components/smartenu/DepartmentList.vue"
import PostFolder from "@/components/documents/PostFolder.vue"
import PostFile from "@/components/documents/PostFile.vue"
import { DocService } from '../../../service/doc.service';
import {FileService} from "@/service/file.service"
export default {
  name: 'NormativeDocuments',
  components: { PostFolder, PostFile, DepartmentList },
  props: {

  },
  emits: [],
  data() {
    return {
      innerHeightInRem: 0,
      loading: false,
      fileUpload: false,

      visibility: {
        folderUploadDialog: false,
        folderMoveDialog: false,
        fileUploadDialog: false,
      },

      tooltip: {
        folder: false,
        file: false,
      },

      loginedUser: {},
      catalog: [],
      expandedKeys: {},
      selectedNode: null,
      selectedNodeKey: null,
      selectedMoveNode: null,
      newNode: null,

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
      docService: new DocService(),
      fileService: new FileService()
    }
  },
  mounted() { 
    this.loginedUser = JSON.parse(window.localStorage.getItem("loginedUser"));
    this.getFolders();

    this.onResize();
    window.addEventListener('resize', this.onResize);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.onResize);
  },
  methods: {
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
    onResize() {
      this.innerHeightInRem = (window.innerHeight - 50 - 45) / parseFloat(getComputedStyle(document.documentElement).fontSize);
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
          parentID: this.selectedNode.id
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
      this.getFolders(node)
    },
    getFolders(parent = null) {
      this.loading = true;

      if (parent === null) {
        this.expandedKeys = {}
      }
      const req = {
        folderType: Enum.FolderType.NormativeDocuments,
        page: null,
        rows: null,
        parentId: parent !== null ? parent.id : null,
      }
      this.docService.getFolders(req).then(res => {
        let data = res.data.folders

        if (!data) {
          this.getFiles(parent)
          this.loading = false
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
        } else {
          parent.children = data
          this.getFiles(parent)
        }

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
    getFiles(parent) {
      this.loading = true;
      const req = {
        sourceType: null,
        docType: Enum.DocType.NormativeDoc,
        lang: null,
        templateId: null,
        folderId: parent.id,
        departmentId: null,
        page: null,
        rows: null,
      }
      this.docService.getDocuments(req).then(res => {
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
        if (err.response && err.response.data && err.response.data.localized) {
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
        })
      } else {
        this.selectedNode.lang = event.lang
        this.selectedNode.namekz = event.namekz
        this.selectedNode.nameru = event.nameru
        this.selectedNode.nameen = event.nameen
        this.selectedNode.author = event.author
        this.selectedNode.approvedBy = event.approvedBy
        this.selectedNode.approveDate = new Date(event.approveDate)
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
        })
      } else {
        this.selectedNode.namekz = event.namekz
        this.selectedNode.nameru = event.nameru
        this.selectedNode.nameen = event.nameen
        this.selectedNode.code = event.code
        this.selectedNode.groups = event.groups
      }
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
          const req = {
            id: this.selectedNode.id,
            hide: false,
          }
          this.docService.docDeleteFolder(req).then(res => {
            this.showMessage('success', this.$t('common.success'), this.$t('common.message.successCompleted'));
            this.deleteNode(this.catalog[0], this.selectedNode.key)

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
          const req = {
            id: this.selectedNode.id,
            hide: true,
          }
          this.docService.docDeleteFolder(req).then(res => {
            this.showMessage('success', this.$t('common.success'), this.$t('common.message.successCompleted'));
            this.selectedNode.hidden = true

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
        }
      })
    },
    showFolder() {
      if (!this.selectedNode || this.selectedNode.nodeType !== 'folder') {
        return
      }

      this.loading = true
      const req = {
        id: this.selectedNode.id
      }
      this.docService.showFolder(req).then(res => {
        this.showMessage('success', this.$t('common.success'), this.$t('common.message.successCompleted'));

        this.selectedNode.hidden = false
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
      if (!this.selectedNode || this.selectedNode.nodeType !== 'file') {
        return
      }

      this.$confirm.require({
        message: this.$t("common.confirmation"),
        header: this.$t("common.confirm"),
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.loading = true
          const req = {
            id: this.selectedNode.id,
            hide: false,
          }
          this.docService.docDeleteFile(req).then(res => {
            this.showMessage('success', this.$t('common.success'), this.$t('common.message.successCompleted'));
            this.deleteNode(this.catalog[0], this.selectedNode.key)

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
          const req = {
            id: this.selectedNode.id,
            hide: true,
          }
          this.docService.docDeleteFile(req).then(res => {
            this.showMessage('success', this.$t('common.success'), this.$t('common.message.successCompleted'));
            this.selectedNode.isHidden = true

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
        }
      })
    },
    showFile() {
      if (!this.selectedNode || this.selectedNode.nodeType !== 'file') {
        return
      }

      this.loading = true
      const req = {
        id: this.selectedNode.id
      }
      this.docService.showFile(req).then(res => {
        this.showMessage('success', this.$t('common.success'), this.$t('common.message.successCompleted'));

        this.selectedNode.isHidden = false
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
    deleteNode(nodes, key) {
      if (!nodes || !nodes.children) {
        return
      }

      for (let i = 0; i < nodes.children.length; i++) {
        if (nodes.children[i].key === key) {
          nodes.children.splice(i, 1)
          return
        } else if (key.startsWith(nodes.children[i].key)) {
          this.deleteNode(nodes.children[i], key)
          return
        }
      }
    },
    downloadFile() {
      if (!this.selectedNode || this.selectedNode.nodeType !== 'file') {
        return
      }

      this.loading = true
      const req = {
        filePath: this.selectedNode.filePath
      }
      this.fileService.downloadFile(req).then(res => {
        let link = document.createElement("a");
        link.href = "data:application/octet-stream;base64," + res.data;
        link.setAttribute("download", this.selectedNode.name);
        link.download = this.selectedNode.name;
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
  }
}
</script>
<style scoped >
:deep(.p-treetable-toggler) {
  flex-shrink: 0;
}
</style>