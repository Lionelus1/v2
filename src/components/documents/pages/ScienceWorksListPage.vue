<template>
  <ProgressSpinner v-if="loading" class="progress-spinner" strokeWidth="5"/>
  <div class="flex flex-row mb-3">
    <div class="arrow-icon" @click="$router.back()">
      <i class="fas fa-arrow-left"></i>
    </div>
    <h3 class="m-0">{{ $t("scienceWorks.titleList") }}</h3>
  </div>
  <BlockUI v-if="haveAccess" :blocked="loading" class="card">
    <Menubar :model="menu" class="m-0 pt-0 pb-0"></Menubar>
    <TabView v-model:activeIndex="activeTab" @tab-change="tabChanged" class="flex flex-column flex-grow-1">
      <TabPanel :header="$t('common.params')">
        <div v-if="currentDocument" class="flex flex-column flex-grow-1">
          <div class="lg:col-6 mt-3">
            <p> {{ $t('common.state') + ": " }}
              <span :class="'customer-badge status-' + currentDocument.docHistory.code">
            {{ currentDocument.docHistory[$i18n.locale === 'en' ? 'stateEn' : $i18n.locale === 'ru' ? 'stateRus' : 'stateKaz'] }}</span>
            </p>
          </div>
          <div class="p-fluid md:col-6" v-if="currentDocument.docHistory.stateId === DocEnum.REVISION.ID">
            <InlineMessage severity="error">{{ currentDocument.docHistory.comment }}</InlineMessage>
          </div>
          <div class="flex-grow-1">
            <DataTable :value="scienceWorks.documents" dataKey="id" :rows="scienceWorks.rows" :totalRecords="scienceWorks.total"
                       :paginator="true" :paginatorTemplate="scienceWorks.paginatorTemplate" :rowsPerPageOptions="[10, 25, 50]"
                       :currentPageReportTemplate="scienceWorks.currentPageReportTemplate" :lazy="true" :loading="scienceWorks.tableLoading"
                       scrollable scrollHeight="flex" v-model:selection="scienceWorks.currentDocument" selectionMode="single"
                       :rowHover="true" stripedRows class="flex-grow-1" @page="onPage">
              <template #empty>
                {{ $t("common.recordsNotFound") }}
              </template>
              <template #header v-if="currentDocument.docHistory.stateId === DocEnum.CREATED.ID ||
            currentDocument.docHistory.stateId === DocEnum.REVISION.ID">
                <div class="flex align-items-center">
                  <Checkbox :modelValue="allSelected" :binary="true" @click="allSelected ? ids = [] : ids = Array.from(allIds); input()" />
                  <label class="ml-2"> {{ $t("common.selectAll") }} </label>
                </div>
              </template>
              <Column style="min-width: 15px;" v-if="currentDocument.docHistory.stateId === DocEnum.CREATED.ID ||
            currentDocument.docHistory.stateId === DocEnum.REVISION.ID">
                <template #body="{data}">
                  <Checkbox :model-value="isChecked(data.id)" :binary="true" @click="isChecked(data.id) ? removeItemOnce(data.id) : ids.push(data.id); input()" />
                </template>
              </Column>
              <Column :header="$t('scienceWorks.columns.name')" style="min-width: 250px;">
                <template #body="{data}">
                  {{ getScienceWorkName(data) }}
                </template>
              </Column>
              <Column :header="$t('scienceWorks.columns.type')" style="min-width: 150px;">
                <template #body="{data}">
                  {{ getScienceWorkType(data) }}
                </template>
              </Column>
              <Column :header="$t('scienceWorks.columns.year')" style="min-width: 50px;">
                <template #body="{data}">
                  {{ getYear(data) }}
                </template>
              </Column>
              <Column style="min-width: 50px;">
                <template #body="{data}">
                  <div class="flex flex-wrap column-gap-1 row-gap-1">
                    <Button @click="scienceWorks.currentDocument=data;openSignInfo()"
                            v-if="data.docHistory.stateId >= DocEnum.INAPPROVAL.ID" class="p-button-text p-button-info p-1">
                      <i class="fa-solid fa-eye fa-xl"></i>
                    </Button>
                  </div>
                </template>
              </Column>
            </DataTable>
          </div>
        </div>
      </TabPanel>
      <TabPanel :header="$t('common.show')" :disabled="!currentDocument || !currentDocument.filePath || currentDocument.filePath.length < 1">
        <div class="flex-grow-1 flex flex-row align-items-stretch">
          <embed :src="pdf" style="width: 100%;" v-if="pdf" type="application/pdf"/>
        </div>
      </TabPanel>
    </TabView>
  </BlockUI>
  <div v-else class="card">
    <Access textMode="short" :showLogo="false" returnMode="back"></Access>
  </div>
  <!-- documentInfoSidebar -->
  <Sidebar v-model:visible="visibility.documentInfoSidebar" position="right" class="p-sidebar-lg">
    <DocSignaturesInfo :docIdParam="currentDocument.uuid"></DocSignaturesInfo>
  </Sidebar>
  <!-- sendToApproveDialog -->
  <Dialog :header="$t('common.action.sendToApprove')" v-model:visible="visibility.sendToApproveDialog" :style="{width: '50vw'}">
    <div class="p-fluid">
      <ApprovalUsers :approving="loading" v-model="selectedUsers" @closed="close('sendToApproveDialog')"
                     @approve="sendToApprove($event)" :stages="stages" mode="standard"></ApprovalUsers>
    </div>
  </Dialog>
  <!-- revisionDialog -->
  <Dialog :header="$t('common.revision')" :modal="true" v-model:visible="visibility.revisionDialog" style="width: 30vw;">
    <div class="p-fluid col-12">
      <Textarea v-model="revisionText" autoResize rows="5" cols="30" />
    </div>
    <template #footer>
      <Button class="p-button-danger" :disabled="!revisionText" :label="$t('common.revision')" @click="revision()" />
      <Button :label="$t('common.cancel')" @click="close('revisionDialog')" />
    </template>
  </Dialog>
  <!-- scienceWorksInfoSidebar -->
  <Sidebar v-model:visible="visibility.scienceWorksInfoSidebar" position="right" class="p-sidebar-lg">
    <DocSignaturesInfo :docIdParam="scienceWorks.currentDocument.uuid"></DocSignaturesInfo>
  </Sidebar>
  <!-- scienceWorksPageSidebar -->
  <Sidebar v-model:visible="visibility.scienceWorksPageSidebar" position="right" class="p-sidebar-lg">
    <div class="h-full flex flex-column">
      <ScienceWorksPage :uuid="scienceWorks.currentDocument.uuid"></ScienceWorksPage>
    </div>
  </Sidebar>
</template>
<script>
import Access from "@/pages/Access.vue";
import DocSignaturesInfo from "@/components/DocSignaturesInfo.vue";
import ApprovalUsers from "@/components/ncasigner/ApprovalUsers/ApprovalUsers.vue";
import DocEnum from "@/enum/docstates/index";
import {DocService} from "@/service/doc.service";
import ScienceWorksPage from "@/components/documents/pages/ScienceWorksPage.vue";
import {b64toBlob} from "@/config/config";

export default {
  name: "ScienceWorksListPage",
  components: {ScienceWorksPage, ApprovalUsers, DocSignaturesInfo, Access},
  data() {
    return {
      service: new DocService(),
      DocEnum: DocEnum,
      loginedUser: null,

      visibility: {
        documentInfoSidebar: false,
        revisionDialog: false,
        sendToApproveDialog: false,
        scienceWorksInfoSidebar: false,
        scienceWorksPageSidebar: false,
      },

      loading: false,
      haveAccess: true,
      changed: false,

      currentDocument: null,
      pdf: null,
      revisionText: null,
      allIds: [],
      ids: [],
      allSelected: false,
      activeTab: 0,

      selectedUsers: [],
      stages: [],

      menu: [
        {
          label: this.$t("common.save"),
          icon: "pi pi-fw pi-save",
          disabled: () => !this.currentDocument || (this.currentDocument.docHistory.stateId != DocEnum.CREATED.ID &&
              this.currentDocument.docHistory.stateId != DocEnum.REVISION.ID) || !this.changed,
          command: () => { this.saveDocument() }
        },
        {
          label: this.$t("common.send"),
          icon: "pi pi-send",
          disabled: () => !this.currentDocument,
          items: [
            {
              label: this.$t("common.tosign"),
              icon: "pi pi-user-edit",
              visible: () => this.currentDocument && (!this.changed && this.ids.length > 0 && this.currentDocument.docHistory.stateId === DocEnum.CREATED.ID ||
                  this.currentDocument.docHistory.stateId === DocEnum.REVISION.ID),
              command: () => { this.open('sendToApproveDialog') }
            },
            {
              label: this.$t("common.revision"),
              icon: "fa-regular fa-circle-xmark",
              visible: () => this.currentDocument && this.currentDocument.docHistory.stateId === DocEnum.INAPPROVAL.ID &&
                  this.needMySign(),
              command: () => { this.open('revisionDialog') }
            },
          ]
        },
        {
          label: this.$t('common.approvalList'),
          icon: "pi pi-user-edit",
          disabled: () => !this.currentDocument || this.currentDocument.docHistory.stateId < DocEnum.INAPPROVAL.ID,
          command: () => { this.open('documentInfoSidebar') }
        },
      ],

      scienceWorks: {
        paginatorTemplate: "FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink JumpToPageDropdown CurrentPageReport RowsPerPageDropdown",
        currentPageReportTemplate: this.$t('common.showingRecordsCount', {
          first: '{first}',
          last: '{last}',
          totalRecords: '{totalRecords}',
        }),

        tableLoading: false,

        documents: [],
        currentDocument: null,
        total: 0,
        page: 0,
        rows: 10,
      }
    }
  },
  created() {
    this.loginedUser = JSON.parse(localStorage.getItem("loginedUser"));
  },
  mounted() {
    this.$emit('apply-flex', true);

    this.getDocument();
  },
  beforeUnmount() {
    this.$emit('apply-flex', false);
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
      this.visibility[name] = true;
    },
    close(name) {
      this.visibility[name] = false
    },
    getDocument() {
      this.loading = true;

      this.service.getDocumentV2({
        uuid: this.$route.params.uuid
      }).then(res => {
        this.currentDocument = res.data;

        this.clearStages();
        this.getScienceWorks();

        if (this.currentDocument.docHistory.stateId === DocEnum.CREATED.ID ||
            this.currentDocument.docHistory.stateId === DocEnum.REVISION.ID) {
          this.getScienceWorksIds();
        }

        this.loading = false;
      }).catch(err => {
        this.loading = false;

        if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout");
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath));
          if (err.response.status == 403) {
            this.haveAccess = false;
          }
        } else {
          console.log(err)
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
        }
      });
    },
    clearStages() {
      this.selectedUsers = [];

      this.stages = [
        {
          stage: 1,
          users: null,
          titleRu: "Соискатель",
          titleKz: "Соискатель",
          titleEn: "Соискатель",
          certificate: DocEnum.CertificatesArray.Individual,
        },
        {
          stage: 2,
          users: null,
          titleRu: "Заведующий кафедры",
          titleKz: "Кафедра меңгерушісі",
          titleEn: "Head of Department",
          certificate: DocEnum.CertificatesArray.Internal,
        },
        {
          stage: 3,
          users: null,
          titleRu: "Секретарь Правления - Ученый секретарь",
          titleKz: "Кеңес хатшысы – Ғылыми хатшы",
          titleEn: "Secretary of the Board - Scientific Secretary",
          certificate: DocEnum.CertificatesArray.Internal,
        },
      ];
    },
    needMySign() {
      if (!this.currentDocument || !this.currentDocument.approvalStages || this.currentDocument.approvalStages.length < 1) {
        return false;
      }

      let stages = this.currentDocument.approvalStages;
      let need = false;

      for (let i = 0; i < stages.length; i++) {
        let nextStage = true;

        for (let j = 0; j < stages[i].users.length; j++) {
          if (stages[i].users[j].userID === this.loginedUser.userID && stages[i].usersApproved[j] === 0) {
            need = true;
            break;
          }

          if (stages[i].usersApproved[j] === 0) {
            nextStage = false;
          }
        }

        if (!nextStage) {
          break;
        }
      }

      return need;
    },
    saveDocument() {
      this.loading = true;

      let formData = new FormData();
      formData.append("document", JSON.stringify(this.currentDocument));

      formData.append("relatedDocIds", JSON.stringify(this.ids));

      this.service.saveDocumentMultipartV2(formData).then(res => {
        this.currentDocument = res.data;

        this.loading = false;
        this.changed = false;
      }).catch(err => {
        this.loading = false;

        if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout")
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath), null)
        } else {
          console.log(err)
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
        }
      })
    },
    sendToApprove(approvalUsers) {
      if (this.changed) {
        this.close("sendToApproveDialog");
        this.showMessage("warn", this.$t("common.tosign"), this.$t("common.message.saveChanges"));
        return;
      }

      if (this.ids.length < 1) {
        this.close("sendToApproveDialog");
        this.showMessage("warn", this.$t("common.tosign"), this.$t("ncasigner.chooseDocument"));
        return;
      }

      this.loading = true;

      this.service.sendDocumentToApprovalV2({
        uuid: this.currentDocument.uuid,
        approvalStages: approvalUsers,
      }).then(res => {
        this.close("sendToApproveDialog");
        this.loading = false;

        location.reload();
      }).catch(err => {
        this.loading = false;

        if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout");
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath), null);
          if (err.response.status == 403) {
            this.haveAccess = false;
          }
        } else {
          console.log(err)
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
        }
      });
    },
    revision() {
      this.loading = true;

      this.service.documentRevisionV2({
        uuid: this.currentDocument.uuid,
        comment: this.revisionText,
      }).then(res => {
        this.loading = false;
        this.close("revisionDialog");

        location.reload();
      }).catch(err => {
        this.loading = false;

        if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout");
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath), null);
          if (err.response.status == 403) {
            this.haveAccess = false;
          }
        } else {
          console.log(err)
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
        }
      })
    },
    getScienceWorkName(doc) {
      if (!doc.newParams || !doc.newParams.publicationName ||
          !this.validString(doc.newParams.publicationName.value)) {
        return '';
      }

      return doc.newParams.publicationName.value;
    },
    getScienceWorkType(doc) {
      if (!doc.newParams || !doc.newParams.scienceWorkType ||
          !this.validString(doc.newParams.scienceWorkType.value)) {
        return '';
      }

      if (doc.newParams.scienceWorkType.value === DocEnum.ScienceWorkType.Free) {
        return doc.newParams.publicationType.value ? doc.newParams.publicationType.value : this.$t('scienceWorks.types.' + doc.newParams.scienceWorkType.value);
      }

      return this.$t('scienceWorks.types.' + doc.newParams.scienceWorkType.value);
    },
    getScienceWorkTypeRaw(doc) {
      if (!doc.newParams || !doc.newParams.scienceWorkType ||
          !this.validString(doc.newParams.scienceWorkType.value)) {
        return '';
      }

      return doc.newParams.scienceWorkType.value;
    },
    getYear(doc) {
      if (!doc.newParams || !doc.newParams.publicationDate ||
          !doc.newParams.publicationDate.value) {
        return '';
      }

      return new Date(doc.newParams.publicationDate.value).getFullYear();
    },
    validString(str) {
      if (str && str.length > 0) {
        return true;
      }

      return false;
    },
    openSignInfo() {
      if (this.getScienceWorkTypeRaw(this.scienceWorks.currentDocument) === DocEnum.ScienceWorkType.ScopusArticle) {
        this.open('scienceWorksPageSidebar');
      } else {
        this.open('scienceWorksInfoSidebar');
      }
    },
    onPage(event) {
      this.scienceWorks.page = event.page;
      this.scienceWorks.rows = event.rows;
      this.getScienceWorks();
    },
    getScienceWorks() {
      this.scienceWorks.tableLoading = true;

      let data = {
        page: this.scienceWorks.page,
        rows: this.scienceWorks.rows,
        docType: DocEnum.DocType.ScienceWorks,
      };

      if (this.currentDocument.docHistory.stateId === DocEnum.CREATED.ID ||
          this.currentDocument.docHistory.stateId === DocEnum.REVISION.ID) {
        data['filter'] = {
          status: DocEnum.StatusesArray.StatusApproved.id,
          author: this.currentDocument.creatorID,
        };
      } else {
        data['relatedTo'] = this.currentDocument.uuid;
      }

        this.service.getDocumentsV2(data).then(res => {
        this.scienceWorks.documents = res.data.documents;
        this.scienceWorks.total = res.data.total;
        this.scienceWorks.currentDocument = null;

        this.scienceWorks.tableLoading = false;
      }).catch(err => {
        this.scienceWorks.documents = [];
        this.scienceWorks.total = 0;
        this.scienceWorks.currentDocument = null;

        if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout")
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath), null)
        } else {
          console.log(err)
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
        }

        this.scienceWorks.tableLoading = false;
      });
    },
    getScienceWorksIds() {
      this.scienceWorks.tableLoading = true;
      this.ids = [];
      this.allIds = [];

      this.service.getDocumentsIdsV2({
        page: 0,
        rows: 1,
        docType: DocEnum.DocType.ScienceWorks,
        filter: {
          status: DocEnum.StatusesArray.StatusApproved.id,
          author: this.currentDocument.creatorID,
        },
      }).then(res => {
        let page = 0;

        while (page*50 < res.data.total) {
          this.service.getDocumentsIdsV2({
            page: page,
            rows: 50,
            docType: DocEnum.DocType.ScienceWorks,
            filter: {
              status: DocEnum.StatusesArray.StatusApproved.id,
              author: this.currentDocument.creatorID,
            },
          }).then(res => {
            for (let element of res.data.ids) {
              this.allIds.push(element);
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
          });

          page += 1;
        }

        if (this.currentDocument.docHistory.stateId === DocEnum.CREATED.ID ||
            this.currentDocument.docHistory.stateId === DocEnum.REVISION.ID) {
          this.service.getDocumentsIdsV2({
            page: 0,
            rows: 1,
            docType: DocEnum.DocType.ScienceWorks,
            relatedTo:  this.currentDocument.uuid,
          }).then(res => {
            let page = 0;

            while (page*50 < res.data.total) {
              this.service.getDocumentsIdsV2({
                page: page,
                rows: 50,
                docType: DocEnum.DocType.ScienceWorks,
                relatedTo: this.currentDocument.uuid,
              }).then(res => {
                for (let element of res.data.ids) {
                  this.ids.push(element);
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
              });

              page += 1;
            }

            this.allSelected = this.allIds.every(element => this.ids.includes(element));

            this.scienceWorks.tableLoading = false;
          }).catch(err => {
            if (err.response && err.response.status == 401) {
              this.$store.dispatch("logLout")
            } else if (err.response && err.response.data && err.response.data.localized) {
              this.showMessage('error', this.$t(err.response.data.localizedPath), null)
            } else {
              console.log(err)
              this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
            }

            this.scienceWorks.tableLoading = false;
          });
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

        this.scienceWorks.tableLoading = false
      });
    },
    isChecked(id) {
      return this.ids.includes(id);
    },
    removeItemOnce(id) {
      let index = this.ids.indexOf(id);

      if (index > -1) {
        this.ids.splice(index, 1);
      }
    },
    input() {
      this.changed = true;

      this.allSelected = this.allIds.every(element => this.ids.includes(element));
    },
    tabChanged() {
      if (this.activeTab === 1) {
        if (!this.currentDocument || !this.currentDocument.filePath || this.currentDocument.filePath.length < 1) return;

        this.downloadContract();
      }
    },
    downloadContract() {
      if (!this.currentDocument || !this.currentDocument.filePath || this.currentDocument.filePath.length < 1) return;

      if (this.pdf) {
        return;
      }

      this.loading = true;

      this.service.downloadDocumentV2({
        uuid: this.currentDocument.uuid
      }).then(res => {
        this.pdf = b64toBlob(res.data);

        this.loading = false;
      }).catch(err => {
        this.loading = false;

        if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout")
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath), null)
        } else {
          console.log(err)
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
        }
      })
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
.arrow-icon {
  cursor: pointer;
  font-size: 1.25rem;
  margin-right: 1rem;
  display: flex;
  align-items: center;
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
:deep(.p-tabview-panels) {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  padding: 0rem;
}
:deep(.p-tabview-panel) {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}
</style>