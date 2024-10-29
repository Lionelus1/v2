<template>
  <div class="col-12">
    <h3>{{ $t("smartenu.mailingTitle") }}</h3>
    <ToolbarMenu :data="menu" />
    <div class="card">
      <TabView>
        <TabPanel :header="$t('smartenu.mailings')">
          <Mailing></Mailing>
        </TabPanel>
        <TabPanel :header="$t('smartenu.drafts')">
          <Drafts></Drafts>
        </TabPanel>
      </TabView>
    </div>
  </div>

  <MailingView v-if="mailingViewVisible" :is-visible="mailingViewVisible" :selected-news="selectedMailing"/>
  <AddEditMailing v-if="editVisible" :is-visible="editVisible" :selected-news="mailingData" />
<!--  :cat-tree="catTree"-->
  <!--  :catTreeList="catTreeElementsList"-->
</template>

<script>
import {FilterMatchMode, FilterOperator} from "primevue/api";
import {smartEnuApi} from "@/config/config";
import {fileRoute, findRole} from "../../config/config";
import {NewsService} from "../../service/news.service";
import {PosterService} from "../../service/poster.service";
import MailingView from "./MailingView";
import AddEditMailing from "./AddEditMailing";
import {formatDate, upFirstLetter} from "@/helpers/HelperUtil";
import ToolbarMenu from "@/components/ToolbarMenu.vue";
import Mailing from "@/components/mailing/Mailing.vue";
import Drafts from "@/components/mailing/Drafts.vue";

export default {
  name: "MailingTable",
  components: {
    Drafts,
    Mailing, ToolbarMenu, AddEditMailing, MailingView},
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
      mailingViewVisible: false,
      submitted: false,
      categories: null,
      newsData: null,
      mailing: null,
      mailingData: null,
      allMailing: [],
      newsCount: 0,
      selectedMailing: false,
      itemsPerPage: 6,
      pageNum: 1,
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
    this.emitter.on('MailingViewModalClose', data => {
      this.mailingViewVisible = data;
    });

    this.emitter.on('addEditMailingDialogHide', data => {
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
      this.getAllMailing();
    },
    onSort(event) {
      this.lazyParams.sortField = event.sortField;
      this.lazyParams.sortOrder = event.sortOrder;
      this.getAllMailing();
    },
    onPage(event) {
      this.lazyParams.page = event.page
      this.lazyParams.rows = event.rows
      this.getAllMailing();
    },

    /**
     *  GET ALL CATEGORIES
     */
    // getCategories() {
    //   this.categories = [];
    //   this.newsService.getCategories().then((response) => {
    //     this.categories = response.data;
    //     this.categories = this.categories.reverse();
    //   }).catch((error) => {
    //     if (error.response.status == 401) {
    //       this.$store.dispatch("logLout");
    //     } else {
    //       this.$toast.add({
    //         severity: "error",
    //         summary: this.$t("smartenu.loadAllCategoriesError") + ":\n" + error,
    //         life: 3000,
    //       });
    //     }
    //   });
    // },

    /**
     *  GET ALL NEWS
     */
    getAllMailing(data) {
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
    getAllNews(data) {
      this.loading = true
      // this.allNews = [];
      this.newsService.getMailing(this.pageNum, this.itemsPerPage).then((response) => {
        if (response.data && response.data) {
          this.allMailing = response.data.general;
          this.allMailing.map(e => {
            e.imageUrl = smartEnuApi + fileRoute + e.image1;
            if (e.poster) {
              e.poster.imageKkUrl = smartEnuApi + fileRoute + e.poster.imageKk;
              e.poster.imageRuUrl = smartEnuApi + fileRoute + e.poster.imageRu;
              e.poster.imageEnUrl = smartEnuApi + fileRoute + e.poster.imageEn;
            }
            e.galleryFiles = e.files ? e.files.find(x => x.is_gallery === true) : null
          });
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
    createMailing() {
      this.mailing = {}
      this.editVisible = true
      this.submitted = false;
      this.mailing.id = null
      this.mailing.eventDate = new Date()
      // this.$router.push({name: "AddEditMailing"})
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
      this.getAllMailing();
      this.editVisible = false;
      this.mailingData = {};
      this.selectedCatTree = null;
    },
    delNews(id) {
      this.mailingData = {};
      this.mailingData = this.allNews.find((x) => x.id === id);
      this.deleteVisible = true;
    },

    /**
     *  NEWS PRE EDITING
     */
    editMailing(data) {
      this.$router.push({name: 'AddEditMailing', params: {id: data.id}})
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
      this.mailingData = {};
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
    MailingView(data) {
      this.selectedMailing = data;
      this.mailingViewVisible = true;
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
    this.getAllMailing();
    // this.getCategories();
    this.getRoles();

  },

  computed: {
    menu () {
      return [
        {
          label: this.$t('common.add'),
          icon: "pi pi-plus",
          // visible: this.isAdmin || this.isModer || this.isEnuWebAdmin || this.isEnuWebFacAdmin,
          command: () => {this.createMailing()},
        },
      ]
    },
    actions () {
      return [
        {
          label: this.$t('common.show'),
          icon: "fa-solid fa-eye",
          command: () => {this.MailingView(this.actionsNode)},
        },
        {
          label: this.$t('common.edit'),
          icon: "fa-solid fa-pencil",
          visible: this.actionsNode?.history.status.id ===this.statuses.created || this.isAdmin || this.isModer || this.isEnuWebAdmin || this.isEnuWebFacAdmin,
          command: () => {this.editMailing(this.actionsNode)},
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
