<template>
  <div class="card">
    <BlockUI :blocked="approving" :fullScreen="true"></BlockUI>
    <div>
      <h4 class="p-ml-3">{{ $t("educomplex.title") }}</h4>
      <Toolbar class="p-m-0 p-p-1" style="position:relative;">

        <template #start>
          <Button :disabled="selected===null || file.depType !=2" @click="resetFileInfo();openDialog('fileUpload')"
                  class="p-button-info p-p-1 p-mr-2"><i
              class="fa-solid fa-file-circle-plus fa-xl"></i>&nbsp;{{ $t('common.add') }}
          </Button>
          <Button v-if="loginedUser != null && loginedUser.userID == file.ownerId && file.stateID == 1"
                  :disabled="selected===null || file.depType !=3" @click="openDialog('sendToApprove')"
                  class=" p-button-info p-p-1 p-mr-2"><i
              class="fa-solid fa-file-contract fa-xl"></i>&nbsp;{{ $t('common.toapprove') }}
          </Button>
          <Button v-if="loginedUser != null && loginedUser.userID != file.ownerId && file.stateID == 2"
                  :disabled="selected===null || file.depType !=3" @click="openDialog('revision')"
                  class=" p-button-warning p-p-1 p-mr-2"><i class="fa-solid fa-file-circle-exclamation fa-xl"></i>&nbsp;{{ $t('common.revision') }}
          </Button>
          <Button v-if="loginedUser != null && loginedUser.userID == file.ownerId && file.stateID == 4"
                  @click="openDialog('fileUpload')" :disabled="selected===null || file.depType !=3"
                  class="p-button-help p-p-1 p-mr-2"><i
              class="fa-solid fa-file-pen fa-xl"></i>&nbsp;{{ $t('common.edit') }}
          </Button>
          <!--    <Button @click="deleteFile(false)" :disabled="selected===null || file.type !=1" class="p-button-text p-button-info p-p-1"><i class="fa-solid fa-file-circle-minus fa-xl"></i></Button>
          <Button v-if="!file.hidden" @click="deleteFile(true)" :disabled="selected===null || file.type !=1" class="p-button-text p-button-info p-p-1"><i class="fa-solid fa-eye-slash fa-xl"></i></Button>
          <Button v-if="file.hidden" @click="showFile()" :disabled="selected===null || file.type !=1" class="p-button-text p-button-info p-p-1"><i class="fa-solid fa-eye fa-xl"></i></Button>
          <Button @click="downloadFile()" :disabled="selected===null || file.type !=1" class="p-button-text p-button-info p-p-1"><i class="fa-solid fa-file-arrow-down fa-xl"></i></Button> -->
        </template>
      </Toolbar>
      <TreeTable :scrollable="true" :scrollHeight="windowHeight + 'px'" class="p-treetable-sm"
                 @node-select="onNodeSelect" :value="catalog" :lazy="true" :loading="loading"
                 @nodeExpand="onExpand($event, true)" selectionMode="single" v-model:selectionKeys="selected">
        <Column field="name" :header="$t('common.name')" :expander="true">
          <template #body="slotProps">
            <span><i
                :class="'fa-solid fa-' + (slotProps.node.depType <= 2 ? 'folder' : 'file')"></i>&nbsp;{{ slotProps.node["name" + $i18n.locale] }}</span>
          </template>
        </Column>
        <Column field="creator" :header="$t('common.author')">
          <template #body="slotProps">
            <span v-if="slotProps.node.creator">&nbsp;{{ slotProps.node.creator.fullName }}</span>
          </template>
        </Column>
        <Column field="state" :header="$t('common.state')">
          <template #body="slotProps">
            <span
                :class="'customer-badge status-' + slotProps.node.stateen">{{ slotProps.node["state" + $i18n.locale] }}</span>
          </template>
        </Column>
        <Column field="path">
          <template #body="slotProps">
            <Button v-if="slotProps.node.path != null" @click="downloadFile(slotProps.node.path)"
                    class="p-button-text p-button-info p-p-1"><i class="fa-solid fa-file-arrow-down fa-xl"></i></Button>
            <Button v-if="slotProps.node.key != null && slotProps.node.depType ===3 && slotProps.node.stateID !==4"
                    @click="onNodeSelect(slotProps.node);openDialog('signerInfo')"
                    class="p-button-text p-button-info p-p-1"><i class="fa-solid fa-eye fa-xl"></i></Button>
            <Button v-if="slotProps.node.key != null && slotProps.node.depType ===3 &&  slotProps.node.stateID ===4"
                    @click="onNodeSelect(slotProps.node);openDialog('docInfo')"
                    class="p-button-text p-button-info p-p-1"><i class="fa-solid fa-eye fa-xl"></i></Button>
            <Button v-if="slotProps.node.key != null && slotProps.node.depType ===3 && (slotProps.node.stateID === 1 || slotProps.node.stateID === 2) && loginedUser.userID === slotProps.node.ownerId"
                    @click="onNodeSelect(slotProps.node);deleteFile(false)" class="p-button-text p-button-danger p-p-1">
              <i class="fa-solid fa-trash fa-xl"></i></Button>
          </template>
        </Column>

      </TreeTable>
    </div>


    <Dialog :header="$t('hdfs.uploadTitle')" v-model:visible="dialogOpenState.fileUpload" :style="{width: '60vw'}" :modal="true">
      <PostFile  :fileUpload="true" :modelValue="file" directory="eduMetComplex" :parentID="parent.id" @updated="fileUpdated" accept=".pdf"></PostFile>
    </Dialog>
    <Sidebar v-model:visible="dialogOpenState.signerInfo" position="right" class="p-sidebar-lg"
             style="overflow-y: scroll">
      <DocSignaturesInfo :docIdParam="file.key" @signed="signed"></DocSignaturesInfo>
    </Sidebar>
    <Sidebar v-model:visible="dialogOpenState.docInfo" position="right" class="p-sidebar-lg" style="overflow-y: scroll">
      <DocInfo :ID="file.id"></DocInfo>
    </Sidebar>
    <Dialog :header="$t('common.action.sendToApprove')" v-model:visible="dialogOpenState.sendToApprove"
            :style="{width: '60vw'}" class="p-fluid">
      <ProgressBar v-if="approving" mode="indeterminate" style="height: .5em"/>
      <div class="p-field">
        <ApprovalUsers :approving="approving" v-model="selectedUsers" @closed="closeDialog('sendToApprove')"
                       @approve="approve($event)"></ApprovalUsers>
      </div>
    </Dialog>
    <Dialog :modal="true" v-bind:header="$t('common.revision')" v-model:visible="dialogOpenState.revision"
            :style="{width: '50vw'}">
      <div class="p-fluid">
        <div class="p-field">
          <label for="dialognote">{{ $t('common.comment') }}</label>
          <InputText id="dialognote" class="p-mb-2" v-bind:placeholder="$t('common.comment')" v-model="revisionComment"
                     type="text"/>
        </div>
      </div>
      <template #footer>
        <Button v-bind:label="$t('common.no')" icon="pi pi-times" @click="closeDialog('toApproval')"
                class="p-button-text"/>
        <Button v-bind:label="$t('common.yes')" icon="pi pi-check" @click="toRevision" autofocus/>
      </template>
    </Dialog>
    <!-- <Dialog :modal="true" v-bind:header="$t('hdfs.umktitle')" v-model:visible="dialogOpenState.umkParams" :style="{width: '60vw'}" class="p-fluid">
    <div class="p-fluid">
        <div class="p-field">
            <label for="module">{{$t('hdfs.modulname')}}</label>
            <InputText id="module" class="p-mb-2" v-bind:placeholder="$t('hdfs.modulname')" v-model="revisionComment" type="text" />
        </div>
        <div class="p-field">
            <label for="eduprogram">{{$t('hdfs.eduprogram')}}</label>
            <InputText id="eduprogram" class="p-mb-2" v-bind:placeholder="$t('hdfs.eduprogram')" v-model="revisionComment" type="text" />
        </div>
        <div class="p-field">
            <label for="discipline">{{$t('hdfs.discipline')}}</label>
            <InputText id="discipline" class="p-mb-2" v-bind:placeholder="$t('hdfs.discipline')" v-model="revisionComment" type="text" />
        </div>
        </div>
        <template #footer>
        <Button v-bind:label="$t('common.no')" icon="pi pi-times" @click="closeDialog('toApproval')" class="p-button-text"/>
        <Button v-bind:label="$t('common.yes')" icon="pi pi-check" @click="toRevision" autofocus />
        </template>
    </Dialog> -->
  </div>
</template>

<script>
import axios from "axios";
import PostFile from "../PostFile.vue"
import DocInfo from "../DocInfo.vue"
import {smartEnuApi, getHeader, findRole} from "@/config/config";
import DocSignaturesInfo from "@/components/DocSignaturesInfo";
import ApprovalUsers from "@/components/ncasigner/ApprovalUsers/ApprovalUsers";
import DocState from "@/enum/docstates/index"

export default {
  components: {ApprovalUsers, DocInfo, DocSignaturesInfo, PostFile},
  data() {
    return {
      catalog: [],
      windowHeight: window.innerHeight - 270,
      lazyParams: {
        page: 0,
        rows: 10,
        parentID: null,
        ownerID: -1,
        type: 2,
        showDocs: false,
        userFilter: true,
      },

      DocState: DocState,
      revisionComment: "",
      approving: false,
      loginedUser: null,
      selectedUsers: [
        {
          stage: 1,
          users: [this.$store.state.loginedUser],
          sertificate: {
            namekz: "Жеке тұлғаның сертификаты",
            nameru: "Сертификат физического лица",
            nameen: "Certificate of an individual",
            value: "individual"
          }
        }
      ],
      loading: false,
      parent: null,
      selected: null,
      dir: "normativedocs",
      language: ['kz', 'ru', 'en'],

      file: {
        namekz: '',
        nameru: '',
        nameen: '',
        code: '',
        id: -1,
        createdDate: null,
        updatedDate: null,
        leaf: null,
        type: 2,
        parentId: null,
        depType: 2,
        departmentID: null,
        docType: 2,
        lang: null,
        params: [
          {
            id: 1,
            name: "modulname",
            value: null,
            description: "модуль атауы",
          },
          {
            id: 2,
            name: "eduprogram",
            value: null,
            description: "білім беру баағдарламасы атауы",
          },
          {
            id: 3,
            name: "discipline",
            value: null,
            description: "discipline",
          },
        ],
      },
      totalRecords: 10,
      dialogOpenState: {
        addFolder: false,
        moveFolder: false,
        fileUpload: false,
        signerInfo: false,
        sendToApprove: false,
        revision: false,
        docInfo: false,
        umkParams: false
      },
      parentNode: null
    }
  },
  created() {
    this.loginedUser = this.$store.state.loginedUser;

  },
  mounted() {
    this.getFolders(null);
    window.addEventListener('resize', this.onResize);

  },
  beforeUnmount() {
    window.removeEventListener('resize', this.onResize);
  },
  methods: {
    signed(event) {
      this.file.stateID = 7,
          this.file.stateen = "signed"
      this.file.stateru = "подписан"
      this.file.statekz = "қол қойылды"
    },
    approve(event) {
      this.approving = true;
      axios.post(smartEnuApi + "/doc/sendtoapprovebystage", {
        id: this.file.id,
        appUsers: event
      }, {headers: getHeader()}).then(res => {
        this.$toast.add({
          severity: "success",
          summary: this.$t('common.message.succesSendToApproval'),
          life: 3000,
        });

        this.closeDialog("sendToApprove");
        this.file.stateID = 2
        this.file.stateen = "inapproval"
        this.file.statekz = "келісуде"
        this.file.stateru = "на согласовании"
        this.approving = false;

      }).catch(error => {
        this.approving = false;
        if (error.response && error.response.status === 401) {
          this.$store.dispatch("logLout");
        } else {
          this.$toast.add({
            severity: "error",
            summary: error,
            life: 3000,
          });
        }
      });
    },
    onResize() {
      this.windowHeight = window.innerHeight - 270
    },

    findRole: findRole,
    showMessage(msgtype, message, content) {
      this.$toast.add({severity: msgtype, summary: message, detail: content, life: 3000});
    },
    getFolders(parent) {
      this.loading = true;
      let url = "/doc/getFoldersByType";
      if (parent != null)
        this.lazyParams.depType = parent.depType
      else {
        this.lazyParams.parentID = null
        this.lazyParams.depType = 0
      }
      axios.post(smartEnuApi + url, this.lazyParams, {headers: getHeader()})
          .then(response => {
            if (parent == null) {
              this.catalog = response.data;
              this.catalog.map(e => {
                e.namekz = e.namekz + ' факультеті';
                e.nameru = e.nameru + ' факультет';
                e.nameen = 'Faculty of ' + e.nameen
              });
            } else {
              parent.children = response.data
              if (parent.children && parent.children.length > 0) {
                parent.children.map(e => {
                  if (e.depType === 2) {
                    e.namekz = e.namekz + ' кафедрасы';
                    e.nameru = 'Кафедра ' + e.nameru;
                    e.nameen = 'Department of ' + e.nameen
                  }
                });
              }
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
    resetFileInfo() {
      this.file = {
        namekz: "",
        nameru: "",
        nameen: "",
        id: null,
        key: null,
        createdDate: null,
        updatedDate: null,
        depType: 2,
        type: 2,
        docType: 2,
        departmentID: this.file.id,
        lang: null,
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
    onExpand(node, showDocs = false) {
      this.lazyParams.parentID = Number(node.key)
      this.lazyParams.showDocs = showDocs
      this.selected = node
      this.parentNode = node
      this.onNodeSelect(node)
      this.getFolders(node)
    },
    setz(name, index) {
      this.$refs[name].style.zIndex = index
    },
    openDialog(dialog) {
      this.dialogOpenState[dialog] = true;
    },

    fileUpdated(event) {
      this.closeDialog('fileUpload');
      if (this.parent.leaf) {
        return
      }

      if (this.parent.children == null) {
        this.parent.children = []
      }
      event.depType = 3
      event.ownerId = this.loginedUser.userID
      event.stateID = 1
      event.statekz = "құрылды"
      event.stateru = "создан"
      event.stateen = "created"
      event.leaf = null

      if (this.parent.key !== event.key) {
        this.parent.children.push(event)
      } else {
        this.file = event
      }

    },

    closeDialog(dialog) {
      this.dialogOpenState[dialog] = false;

    },
    onNodeSelect(node) {
      this.parent = node;
      this.file = node;
    },
    deleteFile(hide) {
      this.$confirm.require({
        message: this.$t("common.doYouWantDelete"),
        header: this.$t("common.confirm"),
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button p-button-success',
        rejectClass: 'p-button p-button-danger',
        accept: () => {
          let url = "/doc/removeFile";
          axios.post(smartEnuApi + url, {id: this.file.id, hide: hide}, {headers: getHeader()})
              .then(_ => {
                    this.showMessage('success', this.$t('common.success'), this.$t('common.message.successCompleted'));
                    this.getFolders(this.parentNode)
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

    showFile() {
      let url = "/doc/showFile";
      axios.post(smartEnuApi + url, {id: this.file.id}, {headers: getHeader()})
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
    downloadFile(path = null) {
      if (this.file || path) {
        axios.post(
            smartEnuApi + "/downloadFile", {
              filePath: path != null ? path : this.file.path
            }, {
              headers: getHeader()
            }
        )
            .then(response => {
              const link = document.createElement("a");
              link.href = "data:application/octet-stream;base64," + response.data;
              link.setAttribute("download", path);
              link.download = path;
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
    toRevision() {
      let url = "/doc/changestate"
      var req = {
        docID: this.file.id,
        state: this.DocState.REVISION.ID,
        comment: this.revisionComment,
      }
      this.approving = true
      axios.post(smartEnuApi + url, req, {headers: getHeader()}).then(() => {
        this.file.stateID = this.DocState.REVISION.ID;
        this.file.statekz = "түзетуге";
        this.file.stateкг = "на доработку";
        this.file.stateen = "revision";

        this.file.revision = false;
        this.approving = false
      })
          .catch(error => {
            this.approving = false
            if (error.response && error.response.status == 401) {
              this.$store.dispatch("logLout");
            } else
              console.log(error);
          })

      this.dialogOpenState.revision = false;
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

