<template>
    <h3>{{ $t("postaccmonrep.title") }}</h3>

    <ToolbarMenu :data="menu" @filter="toggle('global-filter', $event)" :filter="true" :filtered="filtered"/>

    <div class="card">
    <BlockUI :blocked="approving" :fullScreen="true"></BlockUI>
    <div>
          <OverlayPanel ref="global-filter">
            <div class="p-fluid">
              <div class="field">
                <label for="status-filter">{{ $t('common.status') }}</label>
                <Dropdown v-model="filters.status.value"
                          :options="statuses"
                          placeholder="Any"
                          class="p-column-filter"
                          :showClear="true"
                >
                  <template #value="slotProps">
                  <span
                      v-if="slotProps.value"
                      :class="'customer-badge status-' + slotProps.value.value"
                  >
                    {{
                      $i18n.locale === 'kz'
                          ? slotProps.value.nameKz
                          : $i18n.locale === 'ru'
                              ? slotProps.value.nameRu
                              : slotProps.value.nameEn
                    }}</span
                  >
                  </template>
                  <template #option="slotProps">
                  <span :class="'customer-badge status-' + slotProps.option.value">{{
                      $i18n.locale === 'kz'
                          ? slotProps.option.nameKz
                          : $i18n.locale === 'ru'
                              ? slotProps.option.nameRu
                              : slotProps.option.nameEn
                    }}</span>
                  </template>
                </Dropdown>
              </div>
              <div class="field">
                <label>{{ $t('faq.createDate') }}</label>
                <Dropdown v-model="filters.createDate.matchMode" :options="numMatches" optionLabel="value"
                          optionValue="value" :placeholder="$t('common.select')">
                  <template #value="slotProps">
                    <span>
                      {{ $t('common.' + slotProps.value) }}
                    </span>
                  </template>
                  <template #option="slotProps">
                    <span>
                      {{ $t('common.' + slotProps.option.value) }}
                    </span>
                  </template>
                </Dropdown>
                <PrimeCalendar
                    class="mt-2"
                    :placeholder="$t('faq.createDate')"
                    v-model="filters.createDate.value"
                    dateFormat="dd.mm.yy"/>
              </div>
              <div class="field">
                <Button :label="$t('common.clear')" @click="clearFilter(true)" class="mb-2 p-button-outlined"/>
                <Button :label="$t('common.search')" @click="getFoldersByGlobalFilter" class="mt-2"/>
              </div>
            </div>
          </OverlayPanel>
          <!--    <Button @click="deleteFile(false)" :disabled="selected===null || file.type !=1" class="p-button-text p-button-info p-1"><i class="fa-solid fa-file-circle-minus fa-xl"></i></Button>
          <Button v-if="!file.hidden" @click="deleteFile(true)" :disabled="selected===null || file.type !=1" class="p-button-text p-button-info p-1"><i class="fa-solid fa-eye-slash fa-xl"></i></Button>
          <Button v-if="file.hidden" @click="showFile()" :disabled="selected===null || file.type !=1" class="p-button-text p-button-info p-1"><i class="fa-solid fa-eye fa-xl"></i></Button>
          <Button @click="downloadFile()" :disabled="selected===null || file.type !=1" class="p-button-text p-button-info p-1"><i class="fa-solid fa-file-arrow-down fa-xl"></i></Button> -->

      <TreeTable ref="edutreetable" :scrollable="true" :scrollHeight="windowHeight + 'px'" class="p-treetable-sm"
                 @node-select="onNodeSelect" :value="catalog" :lazy="true" :loading="loading"
                 @nodeExpand="onExpand($event, true)" selectionMode="single" v-model:selectionKeys="selected">
        <Column field="name" :header="$t('common.name')" :expander="true"  style="min-width: 35rem;">
          <template #body="slotProps">
            <span><i
                :class="'fa-solid fa-' + ((slotProps.node.depType <= 2 || slotProps.node.depType == 10) ? 'folder' : 'file')"></i>&nbsp;{{
                slotProps.node["name" + $i18n.locale]
              }}</span>
            <Button type="button" icon="fa-solid fa-filter" v-if="slotProps.node.depType === 2"
                    @click="onNodeSelect(slotProps.node);toggle('op', $event)" aria:haspopup="true" label=""
                    aria-controls="overlay_panel" class="p-button-link" />
            <OverlayPanel ref="op">
              <div class="p-fluid">
                <div class="field">
                  <label for="search-input">{{ $t('common.name') }}</label>
                  <InputText id="search-input" v-model="filters.name.value" type="search"/>
                </div>
                <div class="field">
                  <label for="status-filter">{{ $t('common.status') }}</label>
                  <Dropdown v-model="filters.status.value" :options="statuses" placeholder="Any" class="p-column-filter" :showClear="true">
                    <template #value="slotProps">
                      <span v-if="slotProps.value" :class="'customer-badge status-' + slotProps.value.value">
                        {{ $i18n.locale === 'kz' ? slotProps.value.nameKz : $i18n.locale === 'ru' ? slotProps.value.nameRu : slotProps.value.nameEn }}
                      </span>
                    </template>
                    <template #option="slotProps">
                      <span :class="'customer-badge status-' + slotProps.option.value">
                        {{ $i18n.locale === 'kz' ? slotProps.option.nameKz : $i18n.locale === 'ru' ? slotProps.option.nameRu : slotProps.option.nameEn }}
                      </span>
                    </template>
                  </Dropdown>
                </div>
                <div class="field">
                  <label>{{ $t('faq.createDate') }}</label>
                  <Dropdown v-model="filters.createDate.matchMode" :options="numMatches" optionLabel="value" optionValue="value" :placeholder="$t('common.select')">
                    <template #value="slotProps">
                      <span>
                        {{ $t('common.' + slotProps.value) }}
                      </span>
                    </template>
                    <template #option="slotProps">
                      <span>
                        {{ $t('common.' + slotProps.option.value) }}
                      </span>
                    </template>
                  </Dropdown>
                  <PrimeCalendar class="mt-2" :placeholder="$t('faq.createDate')" v-model="filters.createDate.value" dateFormat="dd.mm.yy"/>
                </div>
                <div class="field">
                  <Button :label="$t('common.clear')" @click="clearFilter(false)" class="mb-2 p-button-outlined"/>
                  <Button :label="$t('common.search')" @click="getFoldersByFilter" class="mt-2"/>
                </div>
              </div>
            </OverlayPanel>
<!--            <Button type="button" v-if="slotProps.node.depType === 1 || slotProps.node.depType === 2"
                    @click="onNodeSelect(slotProps.node);toggle('deanOverlay', $event)" :label="slotProps.node.depType === 1 ? 'Декан' : 'Заведующий кафедры'"
                    aria-haspopup="true" aria-controls="overlay_panel_dean" class="p-button-link" />
            <OverlayPanel ref="deanOverlay" id="overlay_panel_dean">
              <div class="p-fluid">
                <div class="field" v-if="parent.depType === 1">
                  <label>Декан</label>
                  {{ parent.dean }}
                  <Dropdown :options="parent.dean" optionLabel="fullName" optionValue="id" :placeholder="$t('common.select')" />
                </div>
                <div class="field" v-if="parent.depType === 2">
                  <label>Заведующий кафедры</label>
                  {{ parent.umr }}
                  <Dropdown :options="parent.umr" optionLabel="fullName" optionValue="id" :placeholder="$t('common.select')" />
                </div>
                <div class="field">
                  <Button :label="$t('common.choose')" class="mt-2"/>
                </div>
              </div>
            </OverlayPanel>-->
          </template>
        </Column>
        <Column field="creator" :header="$t('common.author')">
          <template #body="slotProps">
            <span v-if="slotProps.node.creator">&nbsp;{{ slotProps.node.creator.fullName }}</span>
          </template>
        </Column>
        <Column field="isapproved" header="">
          <template #body="slotProps">
            <i v-if="(slotProps.node.isApproved !== null && slotProps.node.isApproved === 1) || slotProps.node.stateID === 7"
               class="fa-solid fa-square-pen fa-xl approved"></i>
            <i v-if="slotProps.node.isApproved !== null && slotProps.node.isApproved === 0 && slotProps.node.stateID === 2"
               class="fa-solid fa-square-pen fa-xl not-approved"></i>
          </template>
        </Column>
        <Column field="state" :header="$t('common.state')">
          <template #body="slotProps">
            <span
                :class="'customer-badge status-' + slotProps.node.stateen">{{
                slotProps.node.stateen ? $t('common.states.'+slotProps.node.stateen) : ''
              }}</span>
          </template>
        </Column>
        <Column field="path">
          <template #body="slotProps">
            <ActionButton v-if="slotProps.node.path != null" :show-label="true" :items="actions" @toggle="toggleActions(slotProps.node)" />
          </template>
        </Column>

      </TreeTable>
    </div>


    <Dialog :header="$t('hdfs.uploadTitle')" v-model:visible="dialogOpenState.fileUpload" :style="{width: '60vw'}"
            :modal="true">
      <PostFile :fileUpload="true" :modelValue="file" directory="eduMetComplex" :parentID="parent.id"
                @updated="fileUpdated" accept=".pdf"></PostFile>
    </Dialog>
    <Sidebar v-model:visible="dialogOpenState.signerInfo" position="right" class="p-sidebar-lg"
             style="overflow-y: scroll" @hide="getFolders(parentNode)">
      <DocSignaturesInfo :docIdParam="file.key" @signed="signed"></DocSignaturesInfo>
    </Sidebar>
    <Sidebar v-model:visible="dialogOpenState.docInfo" position="right" class="p-sidebar-lg" style="overflow-y: scroll">
      <DocInfo :ID="file.id"></DocInfo>
    </Sidebar>
    <Dialog :header="$t('common.action.sendToApprove')" v-model:visible="dialogOpenState.sendToApprove"
            :style="{width: '50vw'}" class="p-fluid">
      <ProgressBar v-if="approving" mode="indeterminate" style="height: .5em"/>
      <div class="field">
        <ApprovalUsers mode="standard" :key="approveComponentKey" :approving="approving" v-model="selectedUsers"
                       @closed="closeDialog('sendToApprove')"
                       @approve="approve($event)" :stages="stages"></ApprovalUsers>
      </div>
    </Dialog>
    <Dialog :modal="true" v-bind:header="$t('common.revision')" v-model:visible="dialogOpenState.revision"
            :style="{width: '50vw'}">
      <div class="p-fluid">
        <div class="field">
          <label for="dialognote">{{ $t('common.comment') }}</label>
          <InputText id="dialognote" class="mb-2" v-bind:placeholder="$t('common.comment')" v-model="revisionComment"
                     type="text"/>
        </div>
      </div>
      <template #footer>
        <Button v-bind:label="$t('common.no')" icon="pi pi-times" @click="closeDialog('toApproval')"
                class="p-button-text"/>
        <Button v-bind:label="$t('common.yes')" icon="pi pi-check" @click="toRevision" autofocus/>
      </template>
    </Dialog>
  </div>
</template>

<script>
import api from "@/service/api";
import PostFile from "../PostFile.vue"
import DocInfo from "../DocInfo.vue"
import {smartEnuApi, getHeader, findRole} from "@/config/config";
import DocSignaturesInfo from "@/components/DocSignaturesInfo";
import ApprovalUsers from "@/components/ncasigner/ApprovalUsers/ApprovalUsers";
import DocState from "@/enum/docstates/index"
import {FilterMatchMode} from "primevue/api";
import ToolbarMenu from "@/components/ToolbarMenu.vue";
import ActionButton from "@/components/ActionButton.vue";

export default {
  components: {ActionButton, ToolbarMenu, ApprovalUsers, DocInfo, DocSignaturesInfo, PostFile},
  data() {
    return {
      catalog: [],
      windowHeight: window.innerHeight - 270,
      lazyParams: {
        page: 0,
        rows: 10,
        parentID: null,
        ownerID: -1,
        type: 10,
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
          users:[],
          certificate: {
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
        docType: 10,
        lang: null,
        params: [
          {
            id: 1,
            name: "logo",
            uuid: "POSTACCMONREPORT",
            value: null,
            description: "img",
            dialog: false,
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
      parentNode: null,
      filters: {
        name: {value: null, matchMode: FilterMatchMode.CONTAINS},
        status: {value: null, matchMode: FilterMatchMode.EQUALS},
        createDate: {value: null, matchMode: FilterMatchMode.EQUALS}
      },
      statuses: [
        {
          id: 1,
          nameRu: "Создан",
          nameKz: "Құрылды",
          nameEn: "Created",
          value: "created"
        },
        {
          id: 2,
          nameRu: "На согласовании",
          nameKz: "Келісуде",
          nameEn: "In approval",
          value: "inapproval"
        },
        {
          id: 4,
          nameRu: "На доработке",
          nameKz: "Түзетуде",
          nameEn: "Revision",
          value: "revision"
        },
        {
          id: 7,
          nameRu: "Подписан",
          nameKz: "Қол қойылды",
          nameEn: "Signed",
          value: "signed"
        }
      ],
      numMatches: [
        {value: 'lt'},
        {value: 'gt'},
        {value: 'equals'}
      ],
      stages: null,
      approvalStages: [
        {
          stage: 1,
          users: null,
          certificate: {
            namekz: "Ішкі құжат айналымы үшін (ГОСТ)",
            nameru: "Для внутреннего документооборота (ГОСТ)",
            nameen: "For internal document management (GOST)",
            value: "internal"
          },
          titleRu: "Рабочая группа",
          titleKz: "Жұмыс тобы",
          titleEn: "Working group",
        },
        {
          stage: 2,
          users: null,
          titleRu: "Состав Рабочей группы",
          titleKz: "Жұмыс тобының Құрамы",
          titleEn: "Composition of the working group",
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
          titleRu: "Состав Руководящего комитета",
          titleKz: "Басқарушы комитеттің Құрамы",
          titleEn: "Composition of the Steering Committee",
          certificate: {
            namekz: "Ішкі құжат айналымы үшін (ГОСТ)",
            nameru: "Для внутреннего документооборота (ГОСТ)",
            nameen: "For internal document management (GOST)",
            value: "internal"
          },
        },
      ],
      approveComponentKey: 0,
      isGlobalFilter: false,
      filtered: false,
      actionsNode: {},
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
    findRole: findRole,
    toggle(ref, event) {
      this.$refs[ref].toggle(event);
    },
    toggleActions(node) {
      this.actionsNode = node
    },
    clearFilter(isGlobal) {
      this.filters.name.value = null
      this.filters.status.value = null
      this.filters.createDate.value = null
      this.lazyParams.filters = null
      this.isGlobalFilter = false;
      this.lazyParams.depType = 0
      this.getFolders(isGlobal ? null : this.parent);
      this.filtered = false;
      this.selected = null;
    },
    signed(event) {
      this.file.isApproved = 1
      this.file.stateID = 7
      this.file.stateen = "signed"
      this.file.stateru = "подписан"
      this.file.statekz = "қол қойылды"
    },
    approve(event) {
      this.approving = true;
      api.post("/doc/sendtoapprovebystage", {
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
        this.file.isApproved = 0;
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

    showMessage(msgtype, message, content) {
      this.$toast.add({severity: msgtype, summary: message, detail: content, life: 3000});
    },
    getFoldersByGlobalFilter() {
      this.selected = null;
      if (!(this.filters.status.value === null && this.filters.createDate.value === null)) {
        let filter = JSON.parse(JSON.stringify(this.filters));
        this.lazyParams.filters = filter;
        if (this.lazyParams.filters.status.value) {
          this.lazyParams.filters.status.value = filter.status.value.id;
        }
      }
      this.isGlobalFilter = true;
      this.getFolders(null)
      this.filtered = true;
    },
    getFoldersByFilter() {
      if (!(this.filters.name.value === null && this.filters.status.value === null && this.filters.createDate.value === null)) {
        let filter = JSON.parse(JSON.stringify(this.filters));
        this.lazyParams.filters = filter;
        if (this.lazyParams.filters.status.value)
          this.lazyParams.filters.status.value = filter.status.value.id;
      }
      this.getFolders(this.parent)
    },
    getFolders(parent) {
      this.loading = true;
      let url = "/doc/getFoldersByType";
      if (parent != null) {
        this.lazyParams.depType = parent.depType
      } else if (this.isGlobalFilter) {
        this.lazyParams.parentID = null
        this.lazyParams.depType = 3;
      } else {
        this.lazyParams.parentID = null
        this.lazyParams.depType = 0
      }
      api.post(url, this.lazyParams, {headers: getHeader()})
          .then(response => {
            if (this.isGlobalFilter) {
              this.catalog = response.data;
            } else if (parent == null) {
              this.catalog = response.data;
              this.catalog.map(e => {
                if (e.depType === 1) {
                  e.namekz = e.namekz + ' факультеті';
                  e.nameru = e.nameru + ' факультет';
                  e.nameen = 'Faculty of ' + e.nameen
                }
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
        docType: 10,
        departmentID: this.file.id,
        lang: null,
        params: [
          {
            id: 1,
            name: "logo",
            uuid: "POSTACCMONREPORT",
            value: null,
            description: "img",
            dialog: false
          },
          // {
          //   name: "eduprogram",
          //   value: null,
          //   description: "білім беру баағдарламасы атауы",
          // },
          // {
          //   name: "discipline",
          //   value: null,
          //   description: "discipline",
          // },
        ],

      }
    },
    onExpand(node, showDocs = false) {
      this.filters.name.value = null
      this.filters.status.value = null
      this.filters.createDate.value = null
      this.lazyParams.filters = null
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
      if (dialog === "sendToApprove") {
        this.approveComponentKey++;
        this.stages = JSON.parse(JSON.stringify(this.approvalStages));
      }

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
          api.post(url, {id: this.file.id, hide: hide}, {headers: getHeader()})
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
      api.post(url, {id: this.file.id}, {headers: getHeader()})
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
        api.post(
            "/downloadFile", {
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
      let url = "/doc/sendtorevision"
      var req = {
        docID: this.file.id,
        comment: this.revisionComment,
      }
      this.approving = true
      api.post(url, req, {headers: getHeader()}).then(() => {
        this.file.stateID = this.DocState.REVISION.ID;
        this.file.statekz = "түзетуге";
        this.file.stateru = "на доработку";
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
  },
  computed: {
    menu () {
      return [
        {
          label: this.$t('common.add'),
          icon: "fa-solid fa-file-circle-plus",
          visible: this.findRole(null,'accreditation_rating_sector_employee'),
          disabled: this.selected===null || (this.file.depType !=2 && this.file.depType != 10),
          command: () => {this.resetFileInfo();this.openDialog('fileUpload')},
        },
        {
          label: this.$t('common.toapprove'),
          icon: "fa-solid fa-file-contract",
          visible: this.loginedUser != null && this.loginedUser.userID == this.file.ownerId && this.file.stateID == 1,
          disabled: this.selected===null || this.file.depType != 3,
          command: () => {this.openDialog('sendToApprove')},
        },
        {
          label: this.$t('common.revision'),
          icon: "fa-solid fa-file-circle-exclamation",
          visible: this.loginedUser != null && this.loginedUser.userID != this.file.ownerId && this.file.stateID === 2,
          disabled: this.selected===null || this.file.depType != 3,
          color: 'yellow',
          command: () => {this.openDialog('revision')},
        },
        {
          label: this.$t('common.edit'),
          icon: "fa-solid fa-file-pen",
          visible: this.loginedUser != null && this.loginedUser.userID === this.file.ownerId && this.file.stateID === 4,
          disabled: this.selected===null || this.file.depType != 3,
          color: 'purple',
          command: () => {this.openDialog('fileUpload')},
        }
      ]
    },
    actions () {
      return [
        {
          label: this.$t('common.download'),
          icon: "fa-solid fa-file-arrow-down",
          visible: this.actionsNode.path != null,
          command: () => {this.downloadFile(this.actionsNode.path)},
        },
        {
          label: this.$t('common.show'),
          icon: "fa-solid fa-eye",
          visible: this.actionsNode.key != null && this.actionsNode.depType ===3 && this.actionsNode.stateID !==4,
          command: () => {this.onNodeSelect(this.actionsNode);this.openDialog('signerInfo')},
        },
        {
          label: this.$t('common.show'),
          icon: "fa-solid fa-eye",
          visible: this.actionsNode.key != null && this.actionsNode.depType ===3 && this.actionsNode.stateID === 4,
          command: () => {this.onNodeSelect(this.actionsNode);this.openDialog('docInfo')},
        },
        {
          label: this.$t('common.delete'),
          icon: "fa-solid fa-trash",
          visible: this.actionsNode.key != null && this.actionsNode.depType === 3 && this.actionsNode.stateID !==7 && this.loginedUser.userID === this.actionsNode.ownerId,
          command: () => {this.onNodeSelect(this.actionsNode);this.deleteFile(false)},
        }

      ]
    },
  }
}
</script>

<style lang="scss" scoped>
:deep(.p-treetable-scrollable .p-treetable-thead > tr){
  background: white;
}
.w2 {
  width: 1.8rem !important;
  height: 1.8rem !important;
  top: 7px;
}

.approved {
  color: #42855B;
}

.not-approved {
  color: #a6a6a6;
}
</style>

