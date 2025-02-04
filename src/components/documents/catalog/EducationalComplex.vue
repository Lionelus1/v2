<template>
  <div class="card">
    <BlockUI :blocked="approving" :fullScreen="true"></BlockUI>

    <div>
      <h4 class="ml-3">{{ $t("educomplex.title") }}</h4>
      <Toolbar class="m-0 p-1" style="position:relative;">

        <template #start>
          <Button :disabled="selected===null || file.depType !=2" @click="resetFileInfo();openDialog('fileUpload')"
                  class="p-button-info p-1 mr-2"><i
              class="fa-solid fa-file-circle-plus fa-xl"></i>&nbsp;{{ $t('common.add') }}
          </Button>
          <Button v-if="loginedUser != null && loginedUser.userID == file.ownerId && file.stateID == 1"
                  :disabled="selected===null || file.depType !=3" @click="openDialog('sendToApprove')"
                  class=" p-button-info p-1 mr-2"><i
              class="fa-solid fa-file-contract fa-xl"></i>&nbsp;{{ $t('common.toapprove') }}
          </Button>
          <Button v-if="loginedUser != null && loginedUser.userID != file.ownerId && file.stateID == 2 && file.needApproveByMe"
                  :disabled="selected===null || file.depType !=3" @click="openDialog('revision')"
                  class=" p-button-warning p-1 mr-2"><i class="fa-solid fa-file-circle-exclamation fa-xl"></i>&nbsp;{{
              $t('common.revision')
            }}
          </Button>
          <Button v-if="loginedUser != null && loginedUser.userID == file.ownerId && file.stateID == 4"
                  @click="openDialog('fileUpload')" :disabled="selected===null || file.depType !=3"
                  class="p-button-help p-1 mr-2"><i
              class="fa-solid fa-file-pen fa-xl"></i>&nbsp;{{ $t('common.edit') }}
          </Button>
          <Button type="button" icon="pi pi-search"
                  :label="$t('common.search')" @click="toggle('global-filter', $event)" aria:haspopup="true"
                  aria-controls="overlay_panel" class="p-button-info p-1"><i class="fa-solid fa-filter fa-xl"></i>&nbsp;{{
              $t('common.filter')
            }}
          </Button>
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
        </template>
      </Toolbar>
      <TreeTable ref="edutreetable" :scrollable="true" :scrollHeight="windowHeight + 'px'" class="p-treetable-sm"
                 @node-select="onNodeSelect" :value="catalog" :lazy="true" :loading="loading"
                 @nodeExpand="onExpand($event, true)" selectionMode="single" v-model:selectionKeys="selected">
        <Column field="name" :header="$t('common.name')" :expander="true"  style="min-width: 10rem;">
          <template #body="slotProps">
            <span><i
                :class="'fa-solid fa-' + (slotProps.node.depType <= 2 ? 'folder' : 'file')"></i>&nbsp;{{
                slotProps.node["name" + $i18n.locale]
              }}</span>
            <Button type="button" icon="fa-solid fa-filter fa-xl" v-if="slotProps.node.depType === 2"
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
                slotProps.node["state" + $i18n.locale]
              }}</span>
          </template>
        </Column>
        <Column field="path">
          <template #body="slotProps">
            <Button v-if="slotProps.node.path != null" @click="downloadFile(slotProps.node.path)"
                    class="p-button-text p-button-info p-1"><i class="fa-solid fa-file-arrow-down fa-xl"></i></Button>
            <Button v-if="slotProps.node.key != null && slotProps.node.depType ===3 && slotProps.node.stateID !==4"
                    @click="onNodeSelect(slotProps.node);openDialog('signerInfo')"
                    class="p-button-text p-button-info p-1"><i class="fa-solid fa-eye fa-xl"></i></Button>
            <Button v-if="slotProps.node.key != null && slotProps.node.depType ===3 &&  slotProps.node.stateID ===4"
                    @click="onNodeSelect(slotProps.node);openDialog('docInfo')"
                    class="p-button-text p-button-info p-1"><i class="fa-solid fa-eye fa-xl"></i></Button>
            <Button
                v-if="slotProps.node.key != null && slotProps.node.depType ===3 && slotProps.node.stateID !== 7 && loginedUser.userID === slotProps.node.ownerId"
                @click="onNodeSelect(slotProps.node);deleteFile(false)" class="p-button-text p-button-danger p-1">
              <i class="fa-solid fa-trash fa-xl"></i></Button>
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
      <DocSignaturesInfo :docIdParam="file.key" @signed="signed" :isInsideSidebar="true"></DocSignaturesInfo>
    </Sidebar>
    <Sidebar v-model:visible="dialogOpenState.docInfo" position="right" class="p-sidebar-lg" style="overflow-y: scroll">
      <DocInfo :ID="file.id"></DocInfo>
    </Sidebar>
    <Dialog :header="$t('common.action.sendToApprove')" v-model:visible="dialogOpenState.sendToApprove"
            :style="{width: '50vw'}" class="p-fluid">
      <ProgressBar v-if="approving" mode="indeterminate" style="height: .5em"/>
      <div class="field">
        <ApprovalUsers :key="approveComponentKey" :approving="approving" v-model="selectedUsers"
                       @closed="closeDialog('sendToApprove')"
                       @approve="approve($event)" :stages="stages" :mode="'standard'"></ApprovalUsers>
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
    <!-- <Dialog :modal="true" v-bind:header="$t('hdfs.umktitle')" v-model:visible="dialogOpenState.umkParams" :style="{width: '60vw'}" class="p-fluid">
    <div class="p-fluid">
        <div class="field">
            <label for="module">{{$t('hdfs.modulname')}}</label>
            <InputText id="module" class="mb-2" v-bind:placeholder="$t('hdfs.modulname')" v-model="revisionComment" type="text" />
        </div>
        <div class="field">
            <label for="eduprogram">{{$t('hdfs.eduprogram')}}</label>
            <InputText id="eduprogram" class="mb-2" v-bind:placeholder="$t('hdfs.eduprogram')" v-model="revisionComment" type="text" />
        </div>
        <div class="field">
            <label for="discipline">{{$t('hdfs.discipline')}}</label>
            <InputText id="discipline" class="mb-2" v-bind:placeholder="$t('hdfs.discipline')" v-model="revisionComment" type="text" />
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
import PostFile from "../PostFile.vue"
import DocInfo from "../DocInfo.vue"
import {smartEnuApi, getHeader, findRole} from "@/config/config";
import DocSignaturesInfo from "@/components/DocSignaturesInfo";
import ApprovalUsers from "@/components/ncasigner/ApprovalUsers/ApprovalUsers";
import Enum from "@/enum/docstates/index"
import {FilterMatchMode} from "primevue/api";
import { DocService } from "../../../service/doc.service";
import {FileService} from "@/service/file.service"

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

      Enum: Enum,
      revisionComment: "",
      approving: false,
      loginedUser: null,
      selectedUsers: [
        {
          stage: 1,
          users: [this.$store.state.loginedUser],
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
        docType: Enum.DocType.EduComplex,
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
          id: 3,
          nameRu: "Согласован",
          nameKz: "Келісілді",
          nameEn: "Approved",
          value: "approved"
        },
        {
          id: 4,
          nameRu: "На доработке",
          nameKz: "Түзетуде",
          nameEn: "Revision",
          value: "revision"
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
          users: [this.$store.state.loginedUser],
          certificate: {
            namekz: "Жеке тұлғаның сертификаты",
            nameru: "Сертификат физического лица",
            nameen: "Certificate of an individual",
            value: "individual"
          },
          titleRu: "Преподаватель",
          titleKz: "Оқытушы",
          titleEn: "Teacher",
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
      ],
      approveComponentKey: 0,
      isGlobalFilter: false,
      docService: new DocService(),
      fileService: new FileService()
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
    toggle(ref, event) {
      this.$refs[ref].toggle(event);
    },
    clearFilter(isGlobal) {
      this.filters.name.value = null
      this.filters.status.value = null
      this.filters.createDate.value = null
      this.lazyParams.filters = null
      this.isGlobalFilter = false;
      this.lazyParams.depType = 0
      this.getFolders(isGlobal ? null : this.parent);
    },
    signed(event) {
      this.file.isApproved = 1
      this.file.stateID = 3
      this.file.stateen = "approved"
      this.file.stateru = "согласован"
      this.file.statekz = "келісілді"
    },
    approve(event) {
      this.approving = true;
      const req = {
        id: this.file.id,
        appUsers: event
      }
      this.docService.sendtoapprovebystage(req).then(res => {
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
          this.$toast.add({
            severity: "error",
            summary: error,
            life: 3000,
          });
      });
    },
    onResize() {
      this.windowHeight = window.innerHeight - 270
    },

    findRole: findRole,
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
      if (parent != null) {
        this.lazyParams.depType = parent.depType
      } else if (this.isGlobalFilter) {
        this.lazyParams.parentID = null
        this.lazyParams.depType = 3;
      } else {
        this.lazyParams.parentID = null
        this.lazyParams.depType = 0
      }
      this.docService.getFoldersByType(this.lazyParams).then(response => {
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
          .catch(_ => {
            this.loading = false
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
          const req = {
            id: this.file.id, hide: hide
          }
          this.docService.docRemoveFile(req).then(_ => {
              this.showMessage('success', this.$t('common.success'), this.$t('common.message.successCompleted'));
              this.getFolders(this.parentNode)
              this.file.hidden = hide
              if (!hide) {
                this.deleteChild(this.catalog[0])
              }
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
      const req = {
        id: this.file.id
      }
      this.docService.showFile(req).then(_ => {
            this.showMessage('success', this.$t('common.success'), this.$t('common.message.successCompleted'));
            this.file.hidden = false
            this.selected.hidden = false

          });
    },
    downloadFile(path = null) {
      if (this.file || path) {
        const req = {
          filePath: path != null ? path : this.file.path
        }
        this.fileService.downloadFile(req).then(response => {
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
      this.docService.docSendTorevision(req).then(() => {
        this.file.stateID = this.Enum.REVISION.ID;
        this.file.statekz = "түзетуге";
        this.file.stateru = "на доработку";
        this.file.stateen = "revision";

        this.file.revision = false;
        this.approving = false
      })
          .catch(_ => {
            this.approving = false
          })

      this.dialogOpenState.revision = false;
    },
  }
}
</script>

<style lang="scss">
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

