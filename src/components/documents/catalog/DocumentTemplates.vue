<template>
  <ProgressSpinner v-if="loading" class="progress-spinner" strokeWidth="5"/>
  <TitleBlock :title="$t('doctemplate.title')"/>
  <BlockUI :blocked="loading" class="card">
    <TabView v-model:activeIndex="activeTab" class="p-0">
      <TabPanel :header="$t('doctemplate.templates')" class="p-0">
        <TreeTable :loading="tableLoading" :value="tableTree" class="p-treetable-responsive p-treetable-sm"
                   v-model:selectionKeys="selectedNodeKey" :lazy="true" selectionMode="single"
                   @node-select="onNodeSelect($event)" @node-expand="onNodeExpand($event)">
          <Column :expander="true" :pt="{rowToggler: {style: 'flex-shrink: 0;'}}" :header="$t('common.name')">
            <template #body="slotProps">
              <span v-if="slotProps.node.nodeType === 'folder'"><i class="pi pi-folder pr-1"></i>{{ folderLabel(slotProps.node.data) }} </span>
              <Button v-else-if="mode === 'selection' && slotProps.node.nodeType === 'file'"
                      class="p-button-link" style="text-align:left"  @click="selected(slotProps.node.data)"
                      v-tooltip.bottom="$t('common.choose')">
                <i class="pi pi-file pr-1"></i> {{ templateLabel(slotProps.node.data) }} </Button>
              <span v-else><i class="pi pi-file pr-1"></i> {{ templateLabel(slotProps.node.data) }} </span>
            </template>
          </Column>
          <Column :header="$t('common.code')">
            <template #body="slotProps">
              <span v-if="slotProps.node.nodeType === 'folder'"> {{ slotProps.node.data.code }} </span>
            </template>
          </Column>
          <Column v-if="mode === 'default'" :header="$t('common.created')">
            <template #body="slotProps">
              {{ slotProps.node.data.createDate ? getLongDateString(slotProps.node.data.createDate) : ''}}
            </template>
          </Column>
          <Column v-if="mode === 'default'" :header="$t('common.state')">
            <template #body="slotProps">
              <div class="flex flex-wrap column-gap-1 row-gap-1" v-if="slotProps.node.nodeType === 'file' &&
                slotProps.node.data.History">
                <span :class="'customer-badge status-' + slotProps.node.data.History[0].stateCode">
                  {{ slotProps.node.data.History[0][$i18n.locale === 'en' ? 'stateEn' : $i18n.locale === 'ru' ? 'stateRus' : 'stateKaz'] }}
                </span>
              </div>
            </template>
          </Column>
          <Column style="min-width: 50px;">
            <template #body="slotProps">
              <div class="flex flex-wrap gap-2">
                <Button v-if="slotProps.node.nodeType === 'folder' && mode === 'default' &&
                        (slotProps.node.data.needJournal && findRole(null, RolesEnum.roles.TemplateManager) ||
                         !slotProps.node.data.needJournal && isEnuWorker())"
                        icon="pi pi-plus" @click="clearNewDocumentTemplate(); folder=slotProps.node.data; open('newDocumentTemplateDialog');"
                        class="p-button-success" v-tooltip.bottom="$t('doctemplate.newTemplate')"></Button>
                <Button v-if="slotProps.node.nodeType === 'file'" icon="pi pi-search"
                        @click="onNodeSelect(slotProps.node); activeTab=1;" class="p-button-warning"
                        v-tooltip.bottom="$t('common.show')"></Button>
                <Button v-if="slotProps.node.nodeType === 'file' && mode === 'default' &&
                          (slotProps.node.data.History[0].stateId === DocEnum.CREATED.ID ||
                          slotProps.node.data.History[0].stateId === DocEnum.REVISION.ID) &&
                          slotProps.node.data.creatorId === loginedUser.userID"
                        icon="fa-solid fa-trash" @click="onNodeSelect(slotProps.node); deleteFile();"
                        class="p-button-danger" v-tooltip.bottom="$t('common.delete')"></Button>
                <Button v-if="slotProps.node.nodeType === 'file' && mode === 'selection'"
                        icon="pi pi-check-circle" @click="selected(slotProps.node.data)"
                        class="p-button-success" v-tooltip.bottom="$t('common.choose')"></Button>
              </div>
            </template>
          </Column>
        </TreeTable>
      </TabPanel>
      <TabPanel :header="$t('doctemplate.selected')" :disabled="selectedNode === null">
        <Menubar :model="menu" class="m-0 pt-0 pb-0"></Menubar>
        <div class="p-fluid" v-if="selectedNode && selectedNode.data.History[0].stateId === DocEnum.REVISION.ID">
          <Message class="mb-0" severity="warn" :closable="false">{{ selectedNode.data.History[0].comment }}</Message>
        </div>
        <Accordion v-if="selectedNode && selectedNode.data.needApproval" class="mt-2">
          <AccordionTab :header="$t('doctemplate.approvalUsers')">
            <ApprovalUsers :mode="'doc_template_creating'" v-model="selectedNode.data.approvalStages"
                           :readonly="mode === 'selection' || (selectedNode.data.History[0].stateId !== DocEnum.CREATED.ID &&
                            selectedNode.data.History[0].stateId !== DocEnum.REVISION.ID) || selectedNode.data.creatorId !==
                            loginedUser.userID"></ApprovalUsers>
          </AccordionTab>
        </Accordion>
        <SelectButton v-if="mode === 'default'" v-model="language" :options="['kz', 'ru']" class="mt-2">
          <template #option="slotProps">
            <div v-if="slotProps.option === 'kz'">{{$t('common.language.kz')}}</div>
            <div v-else-if="slotProps.option === 'ru'">{{$t('common.language.ru')}}</div>
            <div v-else>{{$t('common.language.en')}}</div>
          </template>
        </SelectButton>
        <div v-if="activeTab === 1" class="mt-2">
          <div v-if="language === 'kz'">
            <TinyEditor v-model="selectedNode.data.mainTextKaz" :readonly="mode === 'selection' ||
                        (selectedNode.data.History[0].stateId !== DocEnum.CREATED.ID &&
                        selectedNode.data.History[0].stateId !== DocEnum.REVISION.ID) ||
                        selectedNode.data.creatorId !== loginedUser.userID"
                        :contract-elements="true" :wordformat="true" :height="800"/>
          </div>
          <div v-else>
            <TinyEditor v-model="selectedNode.data.mainTextRus" :readonly="mode === 'selection' ||
                        (selectedNode.data.History[0].stateId !== DocEnum.CREATED.ID &&
                        selectedNode.data.History[0].stateId !== DocEnum.REVISION.ID) ||
                        selectedNode.data.creatorId !== loginedUser.userID"
                        :contract-elements="true" :wordformat="true" :height="800"/>
          </div>
        </div>
      </TabPanel>
    </TabView>
  </BlockUI>
  <!-- newDocumentTemplateDialog -->
  <Dialog :modal="true" :header="$t('doctemplate.newTemplate')" :style="{width: '50vw'}"
          v-model:visible="visibility.newDocumentTemplateDialog">
    <div class="p-fluid">
      <div class="field">
        <label>{{$t('doctemplate.description')}} ({{$t('common.language.kz')}})</label>
        <InputText class="mb-2" :placeholder="$t('common.description')" v-model="newDocumentTemplate.descriptionKaz" type="text" />
        <label>{{$t('doctemplate.description')}}  ({{$t('common.language.ru')}})</label>
        <InputText class="mb-2" :placeholder="$t('common.description')" v-model="newDocumentTemplate.descriptionRus" type="text" />
        <div v-if="folder.needJournal" class="field-checkbox">
          <Checkbox class="mr-2" v-model="newDocumentTemplate.needApproval" :binary="true"/>
          <label>{{$t('doctemplate.needsApproval')}}</label>
        </div>
<!--        <Dropdown v-if="folder.needJournal" v-model="newDocumentTemplate.journalId"-->
<!--                  :options="journals" :optionLabel="'name' + $i18n.locale"-->
<!--                  optionValue="id" :placeholder="$t('doctemplate.journal')"/>-->
      </div>
    </div>
    <template #footer>
      <Button class="p-button-text" :label="$t('common.no')" icon="pi pi-times" @click="close('newDocumentTemplateDialog')"></Button>
      <Button :label="$t('common.yes')" icon="pi pi-check" @click="createNew" autofocus />
    </template>
  </Dialog>
  <!-- toApprovalDialog -->
  <Dialog :header="$t('common.action.sendToApprove')" v-model:visible="visibility.toApprovalDialog"
          :style="{width: '50vw'}">
    <div class="p-fluid">
      <ApprovalUsers v-model="selectedUsers" @closed="close('toApprovalDialog')"
                     @approve="toApprove($event)" :stages="stages" :mode="'standard'"></ApprovalUsers>
    </div>
  </Dialog>
  <!-- documentInfoSidebar -->
  <Sidebar v-model:visible="visibility.documentInfoSidebar" position="right" class="p-sidebar-lg">
    <DocSignaturesInfo v-if="selectedNode.data.docID" :docIdParam="selectedNode.data.docID"></DocSignaturesInfo>
  </Sidebar>
</template>
<script>
import {DocService} from "@/service/doc.service";
import Enum from "@/enum/docstates";
import RolesEnum from "@/enum/roleControls";
import {getLongDateString} from "@/helpers/helper";
import {findRole} from "@/config/config";
import DocEnum from "@/enum/docstates";
import TinyEditor from "@/components/TinyEditor.vue";
import DocSignaturesInfo from "@/components/DocSignaturesInfo.vue";
import ApprovalUsers from "@/components/ncasigner/ApprovalUsers/ApprovalUsers.vue";

export default {
  name: 'DocumentTemplates',
  components: {ApprovalUsers, DocSignaturesInfo, TinyEditor},
  props: {
    mode: {
      type: String,
      default: 'default'
    }
  },
  emits: ['onselect'],
  data() {
    return {
      service: new DocService(),
      loginedUser: null,
      findRole: findRole,
      DocEnum: Enum,
      RolesEnum: RolesEnum,

      visibility: {
        newDocumentTemplateDialog: false,
        toApprovalDialog: false,
        documentInfoSidebar: false,
      },

      loading: false,
      tableLoading: false,

      activeTab: 0,
      tableTree: [],
      selectedNode: null,
      selectedNodeKey: null,
      language: 'kz',

      folder: null,
      journals: [],
      newDocumentTemplate: {
        descriptionKaz: null,
        descriptionRus: null,
        folderID: null,
        needApproval: null,
        journalId: null,
      },

      selectedUsers: [],
      stages: [],

      menu: [
        {
          label: this.$t("common.save"),
          icon: "pi pi-fw pi-save",
          disabled: () => !this.selectedNode,
          visible: () => this.mode === 'default' && this.selectedNode && (this.selectedNode.data.History[0].stateId ===
              this.DocEnum.CREATED.ID || this.selectedNode.data.History[0].stateId === this.DocEnum.REVISION.ID),
          command: () => { this.saveDocument() }
        },
        {
          label: this.$t("common.toapprove"),
          icon: "pi pi-send",
          visible: () => this.mode === 'default' && this.selectedNode && this.selectedNode.data.creatorId ===
              this.loginedUser.userID && (this.selectedNode.data.History[0].stateId === this.DocEnum.CREATED.ID ||
              this.selectedNode.data.History[0].stateId === this.DocEnum.REVISION.ID),
          command: () => { this.sendToApprove() },
        },
        {
          label: this.$t("common.approvalList"),
          icon: "pi pi-user-edit",
          command: () => { this.open('documentInfoSidebar') }
        },
        {
          label: this.$t("common.choose"),
          icon: "pi pi-check-circle",
          visible: () => this.mode === 'selection',
          command: () => { this.selected(this.selectedNode.data) }
        }
      ],
    }
  },
  created() {
    this.loginedUser = JSON.parse(localStorage.getItem("loginedUser"));
  },
  mounted() {
    this.$emit('apply-flex', true);

    // this.getJournals();
    this.getDocumentFolders();
  },
  beforeUnmount() {
    this.$emit('apply-flex', false);
  },
  methods: {
    getLongDateString: getLongDateString,
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
    isEnuWorker() {
      if (!this.loginedUser || !this.loginedUser.roles || !this.loginedUser.mainPosition ||
          this.loginedUser.mainPosition.organization.id !== 1) {
        return false;
      }

      for (let i = 0; i < this.loginedUser.roles.length; i++) {
        if (this.loginedUser.roles[i].name === 'student') {
          return false;
        }
      }

      return true;
    },
    onNodeSelect(node) {
      if (node.nodeType === 'file') {
        this.selectedNode = node;
      }
    },
    onNodeExpand(node) {
      this.getDocumentTemplates(node);
    },
    templateLabel(item) {
      let name = ''

      if (item.descriptionKaz && item.descriptionKaz.length > 0) {
        name = item.descriptionKaz
      } else if (item.descriptionRus && item.descriptionRus.length > 0) {
        name = item.descriptionRus
      } else if (item.descriptionEng && item.descriptionEng.length > 0) {
        name = item.descriptionEng
      }

      if (this.$i18n.locale === 'ru' && item.descriptionRus && item.descriptionRus.length > 0) {
        name = item.descriptionRus
      } else if (this.$i18n.locale === 'en' && item.descriptionEng && item.descriptionEng.length > 0) {
        name = item.descriptionEng
      }

      return name
    },
    folderLabel(item) {
      let name = ''

      if (item.namekz && item.namekz.length > 0) {
        name = item.namekz
      } else if (item.nameru && item.nameru.length > 0) {
        name = item.nameru
      } else if (item.nameen && item.nameen.length > 0) {
        name = item.nameen
      }

      if (this.$i18n.locale === 'ru' && item.nameru && item.nameru.length > 0) {
        name = item.nameru
      } else if (this.$i18n.locale === 'en' && item.nameen && item.nameen.length > 0) {
        name = item.nameen
      }

      return name
    },
    getDocumentFolders() {
      this.tableLoading = true;

      this.service.getFoldersV2({
        page: 0,
        rows: 10,
        folderTypes: [Enum.FolderType.Journals, Enum.FolderType.Agreement],
      }).then(res => {
        this.tableTree = [];
        res.data.folders.forEach(folder => {
          if (folder.namekz	 !== "Студент үйінде орын беру туралы келісімшарт") {
            console.log(folder.nameru)
            let node = {
              key: folder.id,
              nodeType: 'folder',
              data: folder,
              leaf: false,
            };

            this.tableTree.push(node);
          }
        });

        this.tableLoading = false;
      }).catch(err => {
        this.tableLoading = false;
        this.tableTree = [];

        if (err.response && err.response.status === 401) {
          this.$store.dispatch("logLout");
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath));
        } else {
          console.log(err)
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
        }
      });
    },
    getJournals() {
      this.loading = true;

      this.service.getFoldersV2({
        page: 0,
        rows: 10,
        folderTypes: [Enum.FolderType.FilledDoc],
      }).then(res => {
        this.journals = res.data.folders;

        this.loading = false;
      }).catch(err => {
        this.loading = false;

        if (err.response && err.response.status === 401) {
          this.$store.dispatch("logLout");
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath));
        } else {
          console.log(err)
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
        }
      });
    },
    getDocumentTemplates(folder) {
      this.tableLoading = true;

      this.service.documentTemplatesV2({
        page: 0,
        rows: 50,
        folderId: folder.data.id,
        filter: {
          status: this.mode === 'selection' ? 'status_approved' : null,
        },
      }).then(res => {
        folder.children = [];
        res.data.doctemplates.forEach(templ => {
          let node = {
            key: folder.key + '_' + templ.id,
            nodeType: 'file',
            data: templ,
            leaf: true,
          };

          folder.children.push(node);
        })

        this.tableLoading = false;
      }).catch(err => {
        this.tableLoading = false;
        this.tableTree = [];

        if (err.response && err.response.status === 401) {
          this.$store.dispatch("logLout");
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath));
        } else {
          console.log(err)
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
        }
      });
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

          this.service.documentTemplateDelete(this.selectedNode.data).then(res => {
            this.showMessage('success', this.$t('common.success'), this.$t('common.message.successCompleted'));
            let keys = this.selectedNode.key.split('_');
            for (let i = 0; i < this.tableTree.length; i++) {
              if (this.tableTree[i].key != keys[0]) {
                continue
              }

              for (let j = 0; j < this.tableTree[i].children.length; j++) {
                if (this.tableTree[i].children[j].key === this.selectedNode.key) {
                  this.tableTree[i].children.splice(j, 1)
                  break
                }
              }
            }

            this.selectedNode = null;

            this.loading = false;
          }).catch(err => {
            if (err.response && err.response.status == 401) {
              this.$store.dispatch("logLout")
            } else if (err.response && err.response.data && err.response.data.localized) {
              this.showMessage('error', this.$t(err.response.data.localizedPath), null)
            } else {
              console.log(err)
              this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
            }

            this.loading = false;
          })
        },
      });
    },
    createNew() {
      if (this.newDocumentTemplate.descriptionKaz.length < 1 || this.newDocumentTemplate.descriptionRus.length < 1) {
          // || this.folder.needJournal && this.newDocumentTemplate.journalId === null) {
        this.showMessage('error',this.$t('doctemplate.newTemplate'), this.$t('doctemplate.message.descriptionNotFilled'));
        return
      }

      this.loading = true;
      this.newDocumentTemplate.folderID = this.folder.id;

      this.service.documentTemplateCreate(this.newDocumentTemplate).then((res) => {
        this.loading = false;
        this.close('newDocumentTemplateDialog');
        this.selectedNode = {
          key: this.newDocumentTemplate.folderID + '_' + res.data.id,
          nodeType: 'file',
          data: res.data,
          leaf: true,
        };

        for (let i = 0; i < this.tableTree.length; i++) {
          if (this.tableTree[i].key != this.newDocumentTemplate.folderID) {
            continue
          }

          if (this.tableTree[i].children) {
            this.tableTree[i].children.push(this.selectedNode);
          }
          break
        }

        this.activeTab = 1;
        this.showMessage('success', this.$t('doctemplate.newTemplate'), this.$t('doctemplate.message.succesFilled'));
      }).catch(err => {
        this.loading = false;

        if (err.response && err.response.status === 401) {
          this.$store.dispatch("logLout");
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath));
        } else {
          console.log(err)
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
        }
      })
    },
    clearNewDocumentTemplate() {
      this.folder=null;
      this.newDocumentTemplate = {
        descriptionKaz: null,
            descriptionRus: null,
            folderID: null,
            needApproval: null,
            journalId: null,
      }
    },
    saveDocument() {
      this.loading = true;

      this.service.documentTemplateSave(this.selectedNode.data).then((res) => {
        this.loading = false;
      }).catch(err => {
        this.loading = false;

        if (err.response && err.response.status === 401) {
          this.$store.dispatch("logLout");
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath));
        } else {
          console.log(err)
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
        }
      })
    },
    clearStages() {
      this.selectedUsers = [];

      this.stages = [
        {
          stage: 1,
          users: null,
          titleRu: "Менеджер шаблона",
          titleKz: "Үлгі менеджері",
          titleEn: "Template manager",
          certificate: {
            namekz: "Жеке тұлғаның сертификаты",
            nameru: "Сертификат физического лица",
            nameen: "Certificate of an individual",
            value: "individual"
          },
        }
      ];
    },
    toApprove(event) {
      this.loading = true;

      this.service.sendDocumentTemplateToApproval({
        docTemplateID: this.selectedNode.data.id,
        approvalStages: event,
      }).then(res => {
        this.showMessage('success', this.$t('common.success'), this.$t('common.message.succesSendToApproval'));
        this.close("sendToApproveDialog");

        this.loading = false;
        location.reload();
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
      });
    },
    changeLanguage(lang) {
      this.language = lang;
    },
    selected(docTemplate) {
      this.$emit('onselect', docTemplate);
    },
    sendToApprove() {
      if (this.selectedNode.data.mainTextKaz === null || this.selectedNode.data.mainTextKaz === undefined ||
          this.selectedNode.data.mainTextRus === null || this.selectedNode.data.mainTextRus === undefined ||
          this.selectedNode.data.mainTextKaz.length < 1 || this.selectedNode.data.mainTextRus.length < 1) {
        this.showMessage('warn', this.$t('doctemplate.message.textNotFilledBoth'));
        return
      }

      this.clearStages()
      this.open('toApprovalDialog')
    }
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
  padding: 0rem;
  margin-bottom: 0px;
}
:deep(.p-tabview-panels) {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  padding: 1rem;
}
:deep(.p-tabview-panel) {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
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
</style>