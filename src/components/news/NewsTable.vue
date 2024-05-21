<template>
    <div class="col-12">
        <h3>{{ $t("smartenu.newsTitle") }}</h3>
        <ToolbarMenu :data="menu" @search="getAllNews" :search="true"/>
        <div class="card">
            <DataTable :lazy="true" :value="allNews" @page="onPage($event)" :totalRecords="newsCount" :paginator="true"
                       paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                       :rowsPerPageOptions="[10, 25, 50]"
                       :currentPageReportTemplate="$t('common.showingRecordsCount', {first: '{first}', last: '{last}', totalRecords: '{totalRecords}'})"
                       class="p-datatable-customers" :rows="10" dataKey="id" :rowHover="true" v-model:selection="selectedNews"
                       :filters="filters" filterDisplay="menu" :showFilterMatchModes="false" :loading="loading"
                       responsiveLayout="scroll" @sort="onSort($event)" selectionMode="single">
                <template #empty>{{ $t("smartenu.newsNotFound") }}</template>
                <template #loading>{{ $t("smartenu.loadingNews") }}</template>
                <Column field="titleKz" v-bind:header="$t('common.nameIn')" :sortable="true" style="width: 40%">
                    <template #body="{data}">
                        <span>{{ data['title' + locale] }}</span>
                    </template>
                </Column>
                <Column :field="$i18n.locale === 'kz' ? `history.status.nameKz` : $i18n.locale === 'ru'
        ? `history.status.nameRu` : `history.status.nameEn`" v-bind:header="$t('common.status')" :sortable="true">
                    <template #body="slotProps">
          <span :class="'customer-badge status-' + slotProps.data.history.status.id">
            {{
              $i18n.locale === "kz" ? slotProps.data.history.status.nameKz : $i18n.locale === "ru" ? slotProps.data.history.status.nameRu : slotProps.data.history.status.nameEn
              }}
          </span>
                    </template>
                </Column>
                <Column field="categories" v-bind:header="$t('smartenu.categories')" :sortable="false">
                    <template #body="slotProps">
          <span v-if="slotProps.data.categories">
            {{ slotProps.data.categories.map((cat) => cat.nameKz).toString().replaceAll(",", ", ") }}
          </span>
                    </template>
                </Column>
                <Column field="createdBy" v-bind:header="$t('common.createdBy')" >
                    <template #body="slotProps">
                        {{ slotProps.data.createdBy.fullName }}
                    </template>
                </Column>
              <Column field="history.modify_date" v-bind:header="$t('common.pDate')" sortable>
                <template #body="{data}">
                  {{ formatDate(data?.publish_date) }}
                </template>
              </Column>
              <Column field="history.modify_date" v-bind:header="$t('common.updated')" sortable>
                <template #body="{data}">
                  {{ formatDate(data?.history?.modifyDate) }}
                </template>
              </Column>
                <Column>
                    <template #body="{data}">
                      <ActionButton :show-label="true" :items="actions" @toggle="toggle(data)" />
                    </template>
                </Column>
            </DataTable>
        </div>
    </div>

  <!--    BEGINNING OF REJECT DIALOG-->

    <Dialog v-model:visible="rejectVisible" :style="{ width: '600px' }" :header="$t('smartenu.createOrEditNews')"
            :modal="true" class="p-fluid">
        <div class="card">
            <div class="field mt-3" style="margin-bottom: 1.5rem">
          <span class="p-float-label">
            <InputText id="kz-title" v-model="selectedNews.history.rejectReasonKz" rows="3"/>
            <label for="kz-title">{{ $t("common.nameInQazaq") }}</label>
          </span>
            </div>
            <div class="field mt-3" style="margin-bottom: 1.5rem">
          <span class="p-float-label">
            <InputText id="ru-title" v-model="selectedNews.history.rejectReasonRu" rows="3"/>
            <label for="ru-title">{{ $t("common.nameInRussian") }}</label>
          </span>
            </div>
            <div class="field mt-3">
          <span class="p-float-label">
            <InputText id="en-title" v-model="selectedNews.history.rejectReasonEn" rows="3"/>
            <label for="en-title">{{ $t("common.nameInEnglish") }}</label>
          </span>
            </div>
        </div>
        <template #footer>
            <Button v-bind:label="$t('common.save')" icon="pi pi-check" class="p-button-text" v-on:click="rejectNews"/>
            <Button v-bind:label="$t('common.cancel')" icon="pi pi-times" class="p-button-text"
                    @click="rejectVisible = false"/>
        </template>
    </Dialog>

  <!--    BEGINNING OF DELETE DIALOG-->

    <Dialog v-model:visible="deleteVisible" :style="{ width: '450px' }" :modal="true">
        <div class="confirmation-content">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem"/>
            <span v-if="newsData">{{ $t("common.doYouWantDelete") }}
          <b>
            {{
              $i18n.locale === "kz" ? newsData.titleKz : $i18n.locale === "ru" ? newsData.titleRu : newsData.titleEn
              }}
          </b>?
        </span>
        </div>
        <template #footer>
            <Button :label="$t('common.yes')" icon="pi pi-check" class="p-button p-component p-button-success mr-2"
                    @click="deleteNews(newsData.id)"/>
            <Button :label="$t('common.no')" icon="pi pi-times" class="p-button p-component p-button-danger mr-2"
                    @click="deleteVisible = false"/>
        </template>
    </Dialog>

  <HistoryNews
      v-if="historyNewsVisible"
      :is-visible="historyNewsVisible"
      :selected-news="selectedHistoryNews"
  />
    <NewsView v-if="newsViewVisible" :is-visible="newsViewVisible" :selected-news="selectedNews"/>
    <AddEditNews v-if="editVisible" :is-visible="editVisible" :selected-news="newsData" :cat-tree="catTree"
                 :catTreeList="catTreeElementsList"/>

</template>

<script>
import {FilterMatchMode, FilterOperator} from "primevue/api";
import {smartEnuApi} from "@/config/config";
import {fileRoute, findRole} from "../../config/config";
import {NewsService} from "../../service/news.service";
import {PosterService} from "../../service/poster.service";
import NewsView from "./NewsView";
import AddEditNews from "./AddEditNews";
import {formatDate, upFirstLetter} from "@/helpers/HelperUtil";
import ToolbarMenu from "@/components/ToolbarMenu.vue";
import ActionButton from "@/components/ActionButton.vue";
import HistoryNews from "@/components/news/HistoryNews.vue";

export default {
    name: "NewsTable",
    components: {HistoryNews, ActionButton, ToolbarMenu, AddEditNews, NewsView},
    data() {
        return {
            lazyParams: {
                page: 0,
                rows: 10,
                searchText: null,
                sortField: "",
                sortOrder: 0
            },
            mainImage: null,
            statuses: {
                created: 1,
                sent: 2,
                published: 3,
                rejected: 4,
            },
            editVisible: false,
            deleteVisible: false,
            rejectVisible: false,
            newsViewVisible: false,
            historyNewsVisible: false,
            submitted: false,
            categories: null,
            newsData: null,
            allNews: [],
            newsCount: 0,
            selectedNews: false,
            selectedHistoryNews: [],
            filters: {
                'global': {value: null, matchMode: FilterMatchMode.CONTAINS},
                'question': {value: null, matchMode: FilterMatchMode.CONTAINS},
                'recipient': {value: null, matchMode: FilterMatchMode.CONTAINS},
                'status': {value: null, matchMode: FilterMatchMode.EQUALS},
                'sendDate': {operator: FilterOperator.AND, constraints: [{value: null, matchMode: FilterMatchMode.DATE_IS}]},
                'createDate': {operator: FilterOperator.AND, constraints: [{value: null, matchMode: FilterMatchMode.DATE_IS}]}
            },
            loading: true,
            catTree: {
                root: [],
            },
            catTreeElementsList: [],
            selectedCatTree: null,
            contentImage1: null,
            contentImage2: null,
            userRoles: null,
            roles: {
                isAdmin: false,
                isModer: false,
                isPublisher: false,
                isUser: true,
                isStudent: false,
                isEnuWebAdmin: false,
                isEnuWebFacAdmin: true,
            },
            formValid: [],
            isPoster: false,
            poster: {
                link: "",
                imageKk: null,
                imageRu: null,
                imageEn: null,
            },
            imageFileMain: null,
            imageFileAdd: null,
            newsService: new NewsService(),
            posterService: new PosterService(),
            actionsNode: null
        }
    },
    mounted() {
        this.emitter.on('newsViewModalClose', data => {
            this.newsViewVisible = data;
        });

        this.emitter.on('historyNewsModalClose', data => {
          this.historyNewsVisible = data
          this.selectedHistoryNews = []
        });

        this.emitter.on('addEditNewsDialogHide', data => {
            if (data)
                this.hideDialog();
        });
        this.emitter.on('newsCreated', data => {
            if (data) {
                this.newsCreated();
            }
        });
    },
    methods: {
      formatDate,
        findRole: findRole,
        clearData() {
            if (!this.lazyParams.searchText) {
                return;
            }
            this.lazyParams.searchText = "";
            this.getAllNews();
        },
        onSort(event) {
            this.lazyParams.sortField = event.sortField;
            this.lazyParams.sortOrder = event.sortOrder;
            this.getAllNews();
        },
        onPage(event) {
            this.lazyParams.page = event.page
            this.lazyParams.rows = event.rows
            this.getAllNews();
        },

        /**
         *  GET ALL CATEGORIES
         */
        getCategories() {
            this.categories = [];
            this.newsService.getCategories().then((response) => {
                this.categories = response.data;
                this.categories = this.categories.reverse();
            }).catch((error) => {
                if (error.response.status == 401) {
                    this.$store.dispatch("logLout");
                } else {
                    this.$toast.add({
                        severity: "error",
                        summary: this.$t("smartenu.loadAllCategoriesError") + ":\n" + error,
                        life: 3000,
                    });
                }
            });
        },

        /**
         *  GET ALL NEWS
         */
        getAllNews(data) {
            this.loading = true
            // this.allNews = [];
            this.lazyParams.searchText = data;
            this.lazyParams.countMode = null;
            this.newsService.getNews(this.lazyParams).then((response) => {
                if (response.data && response.data.news) {
                    this.allNews = response.data.news;
                    this.allNews.map(e => {
                        e.imageUrl = smartEnuApi + fileRoute + e.image1;
                        if (e.poster) {
                            e.poster.imageKkUrl = smartEnuApi + fileRoute + e.poster.imageKk;
                            e.poster.imageRuUrl = smartEnuApi + fileRoute + e.poster.imageRu;
                            e.poster.imageEnUrl = smartEnuApi + fileRoute + e.poster.imageEn;
                        }
                        e.galleryFiles = e.files ? e.files.find(x => x.is_gallery === true) : null
                    });
                    this.newsCount = response.data.total;
                }
                this.loading = false;
            }).catch((error) => {
                this.loading = false;
                if (error && error.response.status == 401) {
                    this.$store.dispatch("logLout");
                } else {
                    this.$toast.add({
                        severity: "error",
                        summary: this.$t("smartenu.loadAllNewsError") + ":\n" + error,
                        life: 3000,
                    });
                }
            });
        },

        /**
         *  DELETE NEWS
         */
        deleteNews(id) {
            this.newsService.deleteNews(id).then((response) => {
                if (response.status === 200) {
                    this.getAllNews();
                }
            }).catch((error) => {
                if (error.response.status == 401) {
                    this.$store.dispatch("logLout");
                } else {
                    this.$toast.add({
                        severity: "error",
                        summary: this.$t("smartenu.delNewsError") + ":\n" + error,
                        life: 3000,
                    });
                }
            });
            this.deleteVisible = false;
            this.newsData = {};
        },
        /**
         *  CREATE NEWS
         */
        createNews() {
          this.$router.push({name: "AddNews"})
            /*this.catTreeElementsList = [];
            this.catTree.root = this.createCatTree(null, null);
            this.newsData = {};
            this.editVisible = true;
            this.submitted = false;
            this.newsData.id = null;
            this.newsData.contentCategoryRelations = [];
            this.selectedCatTree = [];*/
        },
        newsCreated() {
            this.$toast.add({
                severity: "success",
                summary: this.$t("smartenu.saveSuccess"),
                life: 3000,
            });
            this.getAllNews();
            this.editVisible = false;
            this.newsData = {};
            this.selectedCatTree = null;
        },
        /**
         *  NEWS PRE DELETE
         */
        delNews(id) {
            this.newsData = {};
            this.newsData = this.allNews.find((x) => x.id === id);
            this.deleteVisible = true;
        },

        /**
         *  NEWS PRE EDITING
         */
        editNews(data) {
          this.$router.push({name: 'EditNews', params: {id: data.id}})
            /*this.catTreeElementsList = [];
            this.catTree.root = this.createCatTree(null, null);
            this.newsData = {};
            this.submitted = false;
            this.newsData = data;
            this.selectedCatTree = [];
            for (let key in this.catTreeElementsList) {
                for (let ixd in data.contentCategoryRelations) {
                    if (this.catTreeElementsList[key].data.id === data.contentCategoryRelations[ixd].categoryId) {
                        this.selectedCatTree[this.catTreeElementsList[key].key] = {
                            checked: data.contentCategoryRelations[ixd].checked,
                            partialChecked: data.contentCategoryRelations[ixd].partialChecked
                        }
                    }
                }
            }
            this.editVisible = true;*/
        },

        /**
         * HIDE ADD EDIT DIALOG
         */
        hideDialog() {
            this.newsData = {};
            this.editVisible = false;
            this.submitted = false;
            this.catTree.root = [];
            this.catTreeElementsList = [];
            this.selectedCatTree = null;
        },

        /**
         * ADD REJECT REASON VISIBILITY
         */
        rejectReason() {
            this.rejectVisible = true;
        },

        /**
         * VIEW NEWS DIALOG VISIBILITY
         */
        newsView(data) {
            this.selectedNews = data;
            this.newsViewVisible = true;
        },

        historyNews(data) {
          this.newsService.getHistoryNews(data.id).then(res => {
            this.selectedHistoryNews = res.data
            console.log(this.selectedHistoryNews)
          }).catch(error => {
            console.log("zdes")
            console.log(error)
            this.$toast.add({
              severity: "error",
              summary: error,
              life: 3000,
            });
          })
          this.historyNewsVisible = true;
        },

        /**
         * SEND NEWS TO MODERATOR ACTION
         */
        sendNews() {
            this.newsService.sendNews(this.selectedNews.id, this.selectedNews.history.userId).then((response) => {
                if (response.data !== null) {
                    this.$toast.add({
                        severity: "success",
                        summary: this.$t("smartenu.saveSuccess"),
                        life: 3000,
                    });
                    this.selectedNews = false;
                    this.getAllNews();
                }
            }).catch((error) => {
                if (error.response.status == 401) {
                    this.$store.dispatch("logLout");
                } else {
                    this.$toast.add({
                        severity: "error",
                        summary: this.$t("smartenu.saveNewsError") + ":\n" + error,
                        life: 3000,
                    });
                }
            });
        },

        /**
         * PUBLSIH NEWS ACTION
         */
        publishNews() {
            this.newsService.publishNews(this.selectedNews.id, this.selectedNews.history.userId).then((response) => {
                if (response.data !== null) {
                    this.$toast.add({
                        severity: "success",
                        summary: this.$t("smartenu.saveSuccess"),
                        life: 3000,
                    });
                    this.selectedNews = false;
                    this.getAllNews();
                }
            }).catch((error) => {
                if (error.response.status == 401) {
                    this.$store.dispatch("logLout");
                } else {
                    this.$toast.add({
                        severity: "error",
                        summary: this.$t("smartenu.saveNewsError") + ":\n" + error,
                        life: 3000,
                    });
                }
            });
        },

        /**
         * REJECT NEWS ACTION
         */
        rejectNews() {
            let data = {
                id: this.selectedNews.id,
                userId: this.selectedNews.history.userId,
                rejectReasonKz: this.selectedNews.history.rejectReasonKz,
                rejectReasonRu: this.selectedNews.history.rejectReasonRu,
                rejectReasonEn: this.selectedNews.history.rejectReasonEn,
            }
            this.newsService.rejectNews(data).then((response) => {
                if (response.data !== null) {
                    this.$toast.add({
                        severity: "success",
                        summary: this.$t("smartenu.saveSuccess"),
                        life: 3000,
                    });
                    this.rejectVisible = false;
                    this.getAllNews();
                }
            }).catch((error) => {
                if (error.response.status == 401) {
                    this.$store.dispatch("logLout");
                } else {
                    this.$toast.add({
                        severity: "error",
                        summary: this.$t("smartenu.saveNewsError") + ":\n" + error,
                        life: 3000,
                    });
                }
            });
        },

        /**
         * CREATE CATEGORIES TREE RECURSION FUNCTION
         * @param id
         * @param key
         * @returns {[]}
         */
        createCatTree: function (id, key) {
            let array = [];
            let grandparents = this.categories.filter(
                (category) => category.parentId === id
            );
            for (let i = 0; i < grandparents.length; i++) {
                this.catTreeElementsList.push({
                    key: key + i,
                    data: grandparents[i],
                });
                array.push({
                    key: key + i,
                    label:
                        this.$i18n.locale === "kz"
                            ? grandparents[i].nameKz
                            : this.$i18n.locale === "ru"
                                ? grandparents[i].nameRu
                                : grandparents[i].nameEn,
                    data: grandparents[i],
                    children: this.createCatTree(grandparents[i].id, key + i + "-"),
                });
            }
            return array;
        },
        getRoles() {
            this.roles.isAdmin = this.findRole(null, "news_administrator");
            this.roles.isPublisher = this.findRole(null, "news_publisher");
            this.roles.isStudent = this.findRole(null, "student");
            this.roles.isModer = this.findRole(null, "news_moderator");
            this.roles.isEnuWebAdmin = this.findRole(null, "enu_web_admin");
            this.roles.isEnuWebFacAdmin = this.findRole(null, "enu_web_fac_admin");
        },
      toggle(node) {
        this.actionsNode = node
      },
    },

    created() {
        this.getAllNews();
        this.getCategories();
        this.getRoles();

    },

    computed: {
      menu () {
        return [
          {
            label: this.$t('common.add'),
            icon: "pi pi-plus",
            command: () => {this.createNews()},
          },
          {
            label: this.$t('common.send'),
            icon: "pi pi-send",
            color: "blue",
            visible: this.selectedNews && this.selectedNews.history.status.id === this.statuses.created && (!this.isModer ||
                !this.isPublisher || !this.isAdmin || !this.isEnuWebAdmin || !this.isEnuWebFacAdmin),
            command: () => {this.sendNews()},
          },
          {
            label: this.$t('common.publish'),
            icon: "pi pi-check",
            color: "purple",
            visible: this.selectedNews && (this.selectedNews.history.status.id === this.statuses.sent || this.selectedNews.history.status.id === this.statuses.created) &&
                (this.isModer || this.isPublisher || this.isAdmin || this.isEnuWebAdmin || this.isEnuWebFacAdmin),
            command: () => {this.publishNews()},
          },
          {
            label: this.$t('common.reject'),
            icon: "pi pi-times",
            color: "red",
            visible: this.selectedNews && this.selectedNews.history.status.id === this.statuses.sent && (this.isModer || this.isPublisher || this.isAdmin),
            command: () => {this.rejectReason()},
          }
        ]
      },
      actions () {
        return [
          {
            label: this.$t('common.show'),
            icon: "fa-solid fa-eye",
            command: () => {this.newsView(this.actionsNode)},
          },
          {
            label: this.$t('common.history'),
            icon: "fa-solid fa-eye",
            command: () => {this.historyNews(this.actionsNode); },
          },
          {
            label: this.$t('common.edit'),
            icon: "fa-solid fa-pencil",
            visible: this.actionsNode?.history.status.id ===this.statuses.created || this.isAdmin || this.isModer || this.isEnuWebAdmin || this.isEnuWebFacAdmin,
            command: () => {this.editNews(this.actionsNode)},
          },
          {
            label: this.$t('common.delete'),
            icon: "fa-solid fa-trash-can",
            visible: this.actionsNode?.history.status.id ===this.statuses.created || this.isAdmin|| this.isEnuWebAdmin || this.isEnuWebFacAdmin,
            command: () => {this.delNews(this.actionsNode.id)},
          },
        ]
      },
        isAdmin: function () {
            return this.roles.isAdmin;
        },
        isModer: function () {
            return this.roles.isModer;
        },
        isPublisher: function () {
            return this.roles.isPublisher;
        },
        isStudent: function () {
            return this.roles.isStudent;
        },
        isEnuWebAdmin: function() {
            return this.roles.isEnuWebAdmin
        },
        isEnuWebFacAdmin: function() {
            return this.roles.isEnuWebFacAdmin
        },
        locale: function () {
            return upFirstLetter(this.$i18n.locale);
        }
    },
};
</script>

<style lang="scss" scoped>
::v-deep(.p-progressbar) {
  height: 0.5rem;
  background-color: #d8dadc;

  .p-progressbar-value {
    background-color: #607d8b;
  }
}

.p-datatable .p-column-filter {
  display: none;
}

.table-header {
  display: flex;
  flex-order-: space-between;
}

::v-deep(.p-datatable.p-datatable-customers) {
  .p-datatable-header {
    padding: 1rem;
    text-align: left;
    font-size: 1.5rem;
  }

  .p-paginator {
    padding: 1rem;
  }

  .p-datatable-thead > tr > th {
    text-align: left;
  }

  .p-datatable-tbody > tr > td {
    cursor: auto;
  }

  .p-dropdown-label:not(.p-placeholder) {
    text-transform: uppercase;
  }
}

/* Responsive */
.p-datatable-customers .p-datatable-tbody > tr > td .p-column-title {
  display: none;
}
</style>
