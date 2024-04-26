<template>
  <div v-if="isLargeScreen" class="p-inputgroup flex-1">
    <span class="p-inputgroup-addon"> {{ $t('ref.currentFolder') }} </span>
    <InputText :disabled="true" v-model="parentFolderName"></InputText>
  </div>
  <div class="flex gap-2 outer-div">
    <div class="flex flex-column inner-div">
      <div v-if="!isLargeScreen" class="p-inputgroup flex-1">
        <span class="p-inputgroup-addon text-sm"> {{ $t('ref.currentFolder') }} </span>
        <InputText :disabled="true" class="p-inputtext-sm" v-model="parentFolderName"></InputText>
      </div>
      <Toolbar class="p-1">
        <template #start>
            <Button icon="fa-solid fa-home" class="menubar-icons p-1"
              @click="homeFolder()" :disabled="!parentFolder"></Button>
        </template>
        <template #end>
          <Button icon="fa-solid fa-arrow-left" class="menubar-icons p-1"
                  @click="returnFolder()" :disabled="!parentFolder"></Button>
        </template>
      </Toolbar>
      <DataTable :value="folders" dataKey="id" :rows="folderRows" :totalRecords="totalFolders" :class="[{'p-datatable-sm': !isLargeScreen}]"
        :paginator="true" :paginatorTemplate="paginatorTemplate" :rowsPerPageOptions="[10, 25, 50]"
        :currentPageReportTemplate="currentPageReportTemplate" :lazy="true" :loading="folderTableLoading" scrollable scrollHeight="flex"
        v-model:selection="currentFolder" selectionMode="single" :rowHover="true"
        @page="onPageFolder($event)" @row-dblclick="doubleClickFolder($event)" stripedRows>
        <Column :header="$t('ref.folderName')">
          <template #body="slotProps">
            <div class="flex justify-content-between w-full">
            {{ slotProps.data['name' + $i18n.locale] }}
              <Button @click="currentFolder=slotProps.data;intoFolder()"
                      class="p-button-text p-button-info p-1" v-tooltip="$t('educomplex.tooltip.into')">
                <i class="fa-solid fa-arrow-right-to-bracket menubar-icons"></i>
              </Button>
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
    <div class="flex flex-column inner-div">
      <div v-if="!isLargeScreen" class="p-inputgroup flex-1">
        <span class="p-inputgroup-addon text-sm"> {{ $t('ref.currentFolder') }} </span>
        <InputText :disabled="true" class="p-inputtext-sm" v-model="parentFolderName"></InputText>
      </div>
      <Toolbar class="p-1">
        <template #start>
          <div class="flex flex-wrap gap-2">
            <Button icon="fa-solid fa-circle-check" class="menubar-icons p-1"
              @click="selectFile()" :disabled="!currentFile"></Button>
          </div>
        </template>
      </Toolbar>
      <DataTable :value="files" dataKey="id" :rows="fileRows" :totalRecords="totalFiles" :class="[{'p-datatable-sm': !isLargeScreen}]"
        :paginator="true" :paginatorTemplate="paginatorTemplate" :rowsPerPageOptions="[10, 25, 50]"
        :currentPageReportTemplate="currentPageReportTemplate" :lazy="true" :loading="fileTableLoading" scrollable scrollHeight="flex"
        v-model:selection="currentFile" selectionMode="single" :rowHover="true"
        @page="onPageFile($event)" @row-dblclick="doubleClickFile($event)"
        @update:selection="$emit('chosen', currentFile)" stripedRows>
        <Column :header="$t('ref.fileName')">
          <template #body="slotProps">
            {{ $i18n.locale === 'kz' ? slotProps.data.descriptionKaz : $i18n.locale === 'ru' ? slotProps.data.descriptionRus : slotProps.data.descriptionEng }}
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>
<script>
import api from '@/service/api';

import { getHeader, smartEnuApi } from "@/config/config";
import Enum from "@/enum/docstates/index";

export default {
  name: 'ReferenceFolderFile',
  components: {},
  props: {
    
  },
  emits: ['chosen', 'selected'],
  data() {
    return {
      Enum: Enum,

      isLargeScreen: false,
      paginatorTemplate: "",
      currentPageReportTemplate: "",

      folderTableLoading: false,
      fileTableLoading: false,

      folders: [],
      parentFolder: null,
      currentFolder: null,
      totalFolders: 0,

      files: [],
      currentFile: null,
      totalFiles: 0,

      folderPage: 0,
      folderRows: 10,
      filePage: 0,
      fileRows: 10,
    }
  },
  computed: {
    parentFolderName() {
      return this.parentFolder ? this.parentFolder['name' + this.$i18n.locale] : ""
    }
  },
  mounted() {
    this.checkScreenSize();
    window.addEventListener('resize', this.checkScreenSize);

    this.getFolders();
    this.getFiles();
  },
  beforeUnmount() {
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
    checkScreenSize() {
      this.isLargeScreen = window.innerWidth >= 640;

      if (this.isLargeScreen) {
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
    onPageFolder(event) {
      this.folderPage = event.page;
      this.folderRows = event.rows;
      this.getFolders();
    },
    doubleClickFolder(event) {
      event.data.parent = JSON.parse(JSON.stringify(this.parentFolder));
      this.parentFolder = JSON.parse(JSON.stringify(event.data));
      this.getFolders();
      this.getFiles();
    },
    homeFolder() {
      this.parentFolder = null;
      this.getFolders();
      this.getFiles();
    },
    returnFolder() {
      this.parentFolder = JSON.parse(JSON.stringify(this.parentFolder.parent));
      this.getFolders();
      this.getFiles();
    },
    intoFolder() {
      this.currentFolder.parent = JSON.parse(JSON.stringify(this.parentFolder));
      this.parentFolder = JSON.parse(JSON.stringify(this.currentFolder));
      this.getFolders();
      this.getFiles();
    },
    getFolders() {
      this.folderTableLoading = true

      api.post('/folders', {
        folderType: Enum.FolderType.References,
        page: this.folderPage,
        rows: this.folderRows,
        parentId: this.parentFolder ? this.parentFolder.id : null,
      }, { 
        headers: getHeader() 
      }).then(res => {
        this.folders = res.data.folders
        this.totalFolders = res.data.total
        this.currentFolder = null

        this.folderTableLoading = false
      }).catch(err => {
        this.folders = []
        this.totalFolders = 0
        this.currentFolder = null

        if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout")
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath), null)
        } else {
          console.log(err)
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
        }

        this.folderTableLoading = false
      })
    },
    onPageFile(event) {
      this.filePage = event.page;
      this.fileRows = event.rows;
      this.getFiles();
    },
    doubleClickFile(event) {
      this.selectFile()
    },
    selectFile() {
      this.$emit('selected', this.currentFile)
    },
    getFiles() {
      if (!this.parentFolder) {
        this.files = []
        this.totalFiles = 0
        this.currentFile = null

        return
      }

      this.fileTableLoading = true

      api.post('/document/templates', {
        page: this.filePage,
        rows: this.fileRows,
        folderId: this.parentFolder.id,
      }, { 
        headers: getHeader() 
      }).then(res => {
        this.files = res.data.doctemplates
        this.totalFiles = res.data.total
        this.currentFile = null

        this.fileTableLoading = false
      }).catch(err => {
        this.files = []
        this.totalFiles = 0
        this.currentFile = null

        if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout")
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath), null)
        } else {
          console.log(err)
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
        }

        this.fileTableLoading = false
      })
    },
  }
}
</script>
<style scoped>
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

@media (max-width: 640px) {
  .outer-div {
    flex-direction: column;
  }

  :deep(.p-paginator) {
    padding: 0;
    flex-wrap: nowrap;
  }
}

@media (min-width: 640px) {
  .inner-div {
   width: 50%; 
  }
}
</style>