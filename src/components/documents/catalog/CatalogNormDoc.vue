<template>
    <div class="card">
        <div>
            <h4 class="ml-3">{{ $t("smartenu.catalogNormDoc") }}</h4>
            
            <Toolbar class="m-0 p-1" style="position:relative;">
                <template #start>
                    <div v-if="findRole(null, 'normative_docs_admin')">
                    <Button @click="resetForm();openDialog('addFolder')" :disabled="selected==null || folder.type !=0" class="p-button-text p-button-info p-1"><i class="fa-solid fa-folder-plus fa-xl"></i></Button>
                    <Button @click="openDialog('addFolder')" :disabled="(selected===null|| folder.parentID == null || folder.type !=0) ||  loginedUser.userID !== folder.ownerId" class="p-button-text p-button-info p-1"><i class="fa-solid fa-square-pen fa-xl"></i></Button>
                    <Button @click="deleteFolder(false)" :disabled="(selected===null|| folder.parentID == null)  || loginedUser.userID !== folder.ownerId" class="p-button-text p-button-info p-1"><i class="fa-solid fa-folder-minus fa-xl"></i></Button>
                    <Button v-if="!folder.hidden && folder.ownerId === loginedUser.userID" @click="deleteFolder(true)" :disabled="selected===null|| folder.parentID == null" class="p-button-text p-button-info p-1"><i class="fa-solid fa-eye-slash fa-xl"></i></Button>
                    <Button v-if="folder.hidden && folder.ownerId === loginedUser.userID" @click="showFolder()" :disabled="selected===null || folder.parentID == null" class="p-button-text p-button-info p-1"><i class="fa-solid fa-eye fa-xl"></i></Button>
                    <Button @click="openDialog('moveFolder')" :disabled="(selected===null|| folder.parentID == null)  || loginedUser.userID !== folder.ownerId" class="p-button-text p-button-info p-1"><i class="fa-solid fa-right-left fa-xl"></i></Button>
                    </div>
                </template>
                <template #end>
                    <Button v-if="findRole(null, 'normative_docs_admin')" :disabled="selected===null || file.type !=0" @click="resetFileInfo();openDialog('fileUpload')" class="p-button-text p-button-info p-1"><i class="fa-solid fa-file-circle-plus fa-xl"></i></Button>
                    <Button v-if="findRole(null, 'normative_docs_admin')" @click="disableFileUpload();openDialog('fileUpload')" :disabled="(selected===null || file.type !=1) || loginedUser.userID !== file.ownerId" class="p-button-text p-button-info p-1"><i class="fa-solid fa-file-pen fa-xl"></i></Button>
                    <Button v-if="findRole(null, 'normative_docs_admin')" @click="deleteFile(false)" :disabled="(selected===null || file.type !=1) || loginedUser.userID !== file.ownerId" class="p-button-text p-button-info p-1"><i class="fa-solid fa-file-circle-minus fa-xl"></i></Button>
                    <Button v-if="!file.hidden && findRole(null, 'normative_docs_admin') && loginedUser.userID === file.ownerId" @click="deleteFile(true)" :disabled="selected===null || file.type !=1" class="p-button-text p-button-info p-1"><i class="fa-solid fa-eye-slash fa-xl"></i></Button>
                    <Button v-if="file.hidden && findRole(null, 'normative_docs_admin') && loginedUser.userID === file.ownerId" @click="showFile()" :disabled="selected===null || file.type !=1" class="p-button-text p-button-info p-1"><i class="fa-solid fa-eye fa-xl"></i></Button>
                    <Button type="button" icon="pi pi-search" :label="$t('common.search')" @click="toggle" aria:haspopup="true" aria-controls="overlay_panel" class="p-button-text p-button-info p-1"><i class="fa-solid fa-search fa-xl"></i></Button>
                    <OverlayPanel ref="op">
                        <div class="p-fluid">
                            <div class="field">
                                <label for="filename" >{{$t('common.name')}}</label>
                                <InputText id="fodernameru" v-model="filters.name.value" type="text" />
                            </div>
                            <div class="field">
                                <label for="filename" >{{$t('common.author')}}</label>
                                <DepartmentList :orgType="2" :parentID="1" :autoLoad="true" class="pt-1" ref="departmentList"  v-model="filters.author.value"  :editMode="true" ></DepartmentList>
                            </div>
                            <div class="field">
                                <label for="filename" >{{$t('common.approveDate')}}</label>
                                <Dropdown v-model="filters.year.matchMode" :options="numMatches" optionLabel="value" optionValue="value"  :placeholder="$t('common.select')">
                                    <template #value="slotProps">
                                        <span>
                                            {{$t('common.' +slotProps.value)}}
                                        </span>
                                    </template>
                                    <template #option="slotProps">
                                        <span>
                                            {{$t('common.' +slotProps.option.value)}}
                                        </span>
                                    </template>
                                </Dropdown>
                                <PrimeCalendar
                                    class="mt-2"
                                    v-model="filters.year.value"
                                    view="year" dateFormat="yy"
                                />
                            </div>
                            <div class="field">
                                <Button :label="$t('common.search')" @click="getFoldersByFilter" class="mt-2" />
                                <Button v-if="lazyParams.filters != null" :label="$t('common.filterReset')" @click="lazyParams.parentID = null,lazyParams.filters = null;getFolders(null);" class="mt-2 p-button-warning" />
                            </div>
                        </div>
                    </OverlayPanel>
                    <Button @click="downloadFile()" :disabled="selected===null || file.type !=1" class="p-button-text p-button-info p-1"><i class="fa-solid fa-file-arrow-down fa-xl"></i></Button>
                </template>
            </Toolbar>
    <TreeTable  :scrollable="true" :expandedKeys="expandedKeys" :scrollHeight="windowHeight + 'px'" class="p-treetable-sm" @node-select="onNodeSelect" :value="catalog" :lazy="true" :loading="loading"
      @nodeExpand="onExpand($event, true)"  selectionMode="single" v-model:selectionKeys="selected">
      <Column field="name" :header="$t('common.name')" :expander="true">
        <template #body="slotProps">
            <span v-if="slotProps.node.hidden"><i class="fa-solid fa-eye-slash"></i>&nbsp;{{slotProps.node["name"+$i18n.locale]}}</span>
            <span v-else><i :class="'fa-solid fa-' + (slotProps.node.type === 0 ? 'folder' : 'file')"></i>&nbsp;{{slotProps.node["name"+$i18n.locale]}}</span>
        </template>
      </Column>
    </TreeTable>
    </div>
    <Dialog :header="$t('common.newCatalog')" v-model:visible="dialogOpenState.addFolder" :style="{width: '60vw'}" :modal="true">
      <PostFolder :modelValue="folder" @updated="folderUpdated"></PostFolder>
    </Dialog>
    <Dialog :header="$t('common.move')" v-model:visible="dialogOpenState.moveFolder"  :style="{width: '75vw'}" :maximizable="true" :modal="true" :contentStyle="{height: '300px'}"> 
      <TreeTable :scrollable="true" scrollHeight="flex"  class="p-treetable-sm"  @node-select="onMoveNodeSelect" :value="catalog" :lazy="true" :loading="loading"
        @nodeExpand="onExpand($event)" :totalRecords="totalRecords" selectionMode="single" v-model:selectionKeys="moveto">
        <Column field="name" :header="$t('common.name')" :expander="true">
<template #body="slotProps">
    <span v-if="slotProps.node.hidden"><i class="fa-solid fa-eye-slash"></i>&nbsp;{{slotProps.node["name"+$i18n.locale]}}</span>
    <span v-else><i :class="'fa-solid fa-' + (slotProps.node.type === 0 ? 'folder' : 'file')"></i>&nbsp;{{slotProps.node["name"+$i18n.locale]}}</span>
</template>
        </Column>
      </TreeTable>
<template #footer>
    <Button label="No" icon="pi pi-times" @click="closeDialog('moveFolder')" class="p-button-text" />
    <Button label="Yes" icon="pi pi-check" @click="moveFolder" autofocus />
</template>
    </Dialog>
    <Dialog :header="$t('hdfs.uploadTitle')" v-model:visible="dialogOpenState.fileUpload" :style="{width: '60vw'}" :modal="true"> 
      <PostFile :approveInfo="true" :fileUpload="fileUpload" :modelValue="file" directory="normativeDocs" :parentID="folder.id" @updated="fileUpdated"></PostFile>
    </Dialog>

    <PostFolder style="display:none" ref="postFolder" :modelValue="folder" @updated="folderMoved"></PostFolder>
    
  </div>
</template>

<script>
import axios from "axios";
import PostFolder from "../PostFolder.vue"
import PostFile from "../PostFile.vue"
import { smartEnuApi, getHeader, findRole } from "@/config/config";
import { FilterMatchMode, FilterOperator } from "primevue/api";

import Enum from "@/enum/docstates/index"

import DepartmentList from "@/components/smartenu/DepartmentList.vue"

export default {
    components: { PostFolder, PostFile, DepartmentList },
    data() {
        return {
            catalog: [],
            expandedKeys: {},
            windowHeight: window.innerHeight - 270,
            lazyParams: {
                page: 0,
                rows: 10,
                parentID: null,
                ownerID: -1,
                type: 0,
                showDocs: false,
            },
            loginedUser:{},
            filters: {
                name: { value: null, matchMode: FilterMatchMode.CONTAINS },
                author: { value: null, matchMode: FilterMatchMode.EQUALS },
                year: {value: null, matchMode: FilterMatchMode.EQUALS}
            },
            numMatches: [
                {value: 'lt'},
                {value: 'gt'},
                {value: 'equals'}
            ],
            fileUpload : false,
            loading: false,
            parent: null,
            selected: null,
            moveto: null,
            moveNode: null,
            groupsData: [
                { namekz: 'білім алушы', nameru: 'обучающиеся', nameen: 'students', id: 0 },
                { namekz: 'профессор-оқытушылар құрамы', nameru: 'профессорско-преподавательский состав', nameen: 'teaching staff', id: 1 },
                { namekz: 'қызметкерлер', nameru: 'сотрудники', nameen: 'staff', id: 2 },
            ],
            dir: "normativedocs",
            language: ['kz', 'ru', 'en'],
            folder: {
                groups: null,
                namekz: '',
                nameru: '',
                nameen: '',
                code: '',
                id: -1,
                createdDate: null,
                updatedDate: null,
                leaf: false,
                type: Enum.FolderType.NormativeDocuments,
                parentId: null,
            },
            file: {
                namekz: '',
                nameru: '',
                nameen: '',
                code: '',
                id: -1,
                createdDate: null,
                updatedDate: null,
                leaf: null,
                type: 1,
                parentId: null,
                approvedBy: null,
                approveDate : null,
                author: null,
                docType: 6,
            },
            totalRecords: 10,
            dialogOpenState: {
                addFolder: false,
                moveFolder: false,
                fileUpload: false,
            },


            folderItems: [{
                    label: 'Add',
                    icon: 'pi pi-plus',
                    command: () => {
                        this.$toast.add({ severity: 'info', summary: 'Add', detail: 'Data Added' });
                    }
                },
                {
                    label: 'Edit',
                    icon: 'pi pi-pencil',
                    command: () => {
                        this.$toast.add({ severity: 'info', summary: 'Add', detail: 'Data Added' });
                    }
                },
                {
                    label: 'Delete',
                    icon: 'pi pi-trash',
                    command: () => {
                        this.$toast.add({ severity: 'info', summary: 'Add', detail: 'Data Added' });
                    }
                },
                {
                    label: 'Delete',
                    icon: 'pi pi-table',
                    command: () => {
                        this.$toast.add({ severity: 'info', summary: 'Add', detail: 'Data Added' });
                    }
                },
            ],
        }
    },
    mounted() {
        this.getFolders(null);
        this.loginedUser = this.$store.state.loginedUser;
        window.addEventListener('resize', this.onResize);

    },
    beforeUnmount() {
        window.removeEventListener('resize', this.onResize);
    },
    methods: {
        onResize() {
            this.windowHeight = window.innerHeight - 350
        },
        toggle(event) {
            this.$refs.op.toggle(event);
        },
        findRole: findRole,
        showMessage(msgtype, message, content) {
            this.$toast.add({ severity: msgtype, summary: message, detail: content, life: 3000 });
        },
        getFoldersByFilter() {
            this.expandedKeys = {}
            if (!(this.filters.name.value === null && this.filters.year.value === null && this.filters.author.value === null))
                this.lazyParams.filters = this.filters;
            this.getFolders(parent)
        },
        getFolders(parent) {

            this.loading = true;
            if (parent == null) {
                this.expandedKeys = {}
            }
            let url = "/doc/getFoldersByType";
            axios.post(smartEnuApi + url, this.lazyParams, { headers: getHeader() })
                .then(response => {
                    if (parent == null || this.lazyParams.filters != null)  {
                        this.catalog = response.data
                    } else {
                        parent.children = response.data
                    }
                    this.loading = false
                  
                })
                .catch(error => {
                    console.log(error)
                    if (error.response.status == 401) {
                        this.$store.dispatch("logLout");
                    } else
                        console.error(error)
                })
        },

        resetForm() {
            this.folder = {
                groups: this.folder.groups,
                namekz: '',
                nameru: '',
                nameen: '',
                code: '',
                id: null,
                key: null,
                createdDate: null,
                updatedDate: null,
                leaf: false,
                type: Enum.FolderType.NormativeDocuments,
                parentID: Number(this.folder.key)
            }
        },
        resetFileInfo() {
            this.fileUpload = true;
            this.file = {
                namekz: "",
                nameru: "",
                nameen: "",
                id: null,
                key: null,
                docType: 6,
                createdDate: null,
                updatedDate: null,
                approvedBy: null,
                approveDate : null,
                author: null,
            }
        },
        disableFileUpload() {
            this.fileUpload = false;
        },
        onExpand(node, showDocs = false) {
            this.filters.name.value = null
            this.filters.author.value = null
            this.filters.year.value = null
            this.lazyParams.filters = null
            this.lazyParams.parentID = Number(node.key)
            this.lazyParams.showDocs = showDocs
            this.getFolders(node)
        },
        setz(name, index) {
            this.$refs[name].style.zIndex = index
        },
        openDialog(dialog) {
            this.dialogOpenState[dialog] = true;
        },
        folderUpdated(event) {
            this.closeDialog('addFolder');
            if (this.folder.key !== this.parent.key) {
                this.folder.ownerId = this.loginedUser.userID
                if (this.parent.leaf) {
                    return
                }
                if (this.parent.children == null) {
                    this.parent.children = []
                }
                this.parent.children.push(event)

            } else {
                this.folder = event
                this.folder.leaf = false
            }
        },
        fileUpdated(event) {
            this.closeDialog('fileUpload');
            if (this.file.key !== this.parent.key) {
                if (this.parent.leaf) {
                    return
                }
                if (this.parent.children == null) {
                    this.parent.children = []
                }
                event.ownerId = this.loginedUser.userID
                event.hidden = 0
                event.type = 1
                this.parent.children.push(event)

            } else {
                this.file = event
            }
        },
        folderMoved(event) {
            this.closeDialog('moveFolder');
            this.deleteChild(this.catalog[0])
            this.moveNode.children.push(event)

        },
        closeDialog(dialog) {
            this.dialogOpenState[dialog] = false;

        },
        onNodeSelect(node) {
            this.parent = node;
            this.folder = node; //JSON.parse(JSON.stringify(node));
            this.file = node;
        },
        onMoveNodeSelect(node) {
            this.moveNode = node;
        },
        deleteFolder(hide) {
            this.$confirm.require({
                message: this.$t("common.confirmation"),
                header: this.$t("common.confirm"),
                icon: 'pi pi-exclamation-triangle',
                accept: () => {
                    let url = "/doc/deleteFolder";
                    axios.post(smartEnuApi + url, { id: this.folder.id, hide: hide }, { headers: getHeader() })
                        .then(_ => {
                                this.showMessage('success', this.$t('common.success'), this.$t('common.message.successCompleted'));
                                this.folder.hidden = hide
                                if (!hide) {
                                    this.deleteChild(this.catalog[0])
                                }
                            },
                            error => {
                                console.log(error);
                            });
                },
            });
        },
        deleteFile(hide) {
            this.$confirm.require({
                message: this.$t("common.confirmation"),
                header: this.$t("common.confirm"),
                icon: 'pi pi-exclamation-triangle',
                accept: () => {
                    let url = "/doc/deleteFile";
                    axios.post(smartEnuApi + url, { id: this.file.id, hide: hide }, { headers: getHeader() })
                        .then(_ => {
                                this.showMessage('success', this.$t('common.success'), this.$t('common.message.successCompleted'));
                                this.file.hidden = hide
                                if (!hide) {
                                    this.deleteChild(this.catalog[0])
                                }
                            },
                            error => {
                                console.log(error);
                            });
                },
            });
        },
        moveFolder() {
            if (this.folder.key === this.moveNode.key || this.folder.parentID === this.moveNode.key) {
                this.showMessage('warn', this.$t('common.move'), this.$t('common.message.impossible'))
                return
            }

            this.folder.parentID = Number(this.moveNode.key);
            this.folder.groups = this.moveNode.groups;
            this.$refs.postFolder.moveFolder(this.folder);
        },
        deleteChild(node) {
            if (!(node.children && node.children.length)) {
                return
            }
            for (let i = 0; i < node.children.length; i++) {
                if (node.children[i].key == this.folder.key) {
                    node.children.splice(i, 1);
                    return
                }
                this.deleteChild(node.children[i])
            }
        },
        showFolder() {
            let url = "/doc/showFolder";
            axios.post(smartEnuApi + url, { id: this.folder.id }, { headers: getHeader() })
                .then(_ => {
                    this.showMessage('success', this.$t('common.success'), this.$t('common.message.successCompleted'));
                    this.folder.hidden = false
                    this.selected.hidden = false

                })
                .catch(error => {
                    console.log(error)
                    if (error.response.status == 401) {
                        this.$store.dispatch("logLout");
                    } else
                        console.error(error)
                })
        },
        showFile() {
            let url = "/doc/showFile";
            axios.post(smartEnuApi + url, { id: this.file.id }, { headers: getHeader() })
                .then(_ => {
                    this.showMessage('success', this.$t('common.success'), this.$t('common.message.successCompleted'));
                    this.file.hidden = false
                    this.selected.hidden = false

                })
                .catch(error => {
                    console.log(error)
                    if (error.response.status == 401) {
                        this.$store.dispatch("logLout");
                    } else
                        console.error(error)
                })
        },
        downloadFile() {
            if (this.file) {
                axios.post(
                        smartEnuApi + "/downloadFile", {
                            filePath: this.file.path
                        }, {
                            headers: getHeader()
                        }
                    )
                    .then(response => {
                        const link = document.createElement("a");
                        link.href = "data:application/octet-stream;base64," + response.data;
                        link.setAttribute("download", this.file.name);
                        link.download = this.file.name;
                        link.click();
                        URL.revokeObjectURL(link.href);
                    })
                    .catch((error) => {
                        this.$toast.add({
                            severity: "error",
                            summary: "downloadFileError:\n" + error,
                            life: 3000,
                        });
                    });
            }
        },
        
    }
}
</script>

<style>
.w2 {
    width: 1.8rem !important;
    height: 1.8rem !important;
    top: 7px;
}
</style>

