<template>
  <div class="card">

    <!-- BEGINNING OF TABLE -->

    <Toolbar class="p-mb-4">
      <template #left>
        <Button :label="$t('common.add')" icon="pi pi-plus" class="p-button-success p-mr-2"
                v-on:click="createNews"/>
        <Button :label="$t('common.send')" v-if="selectedNews && selectedNews.history.status.id === statuses.created && (!isModer || !isPublisher || !isAdmin)"
                icon="pi pi-send"
                class="p-mr-2"
                v-on:click="sendNews"/>
        <Button :label="$t('common.publish')" v-if="selectedNews && (selectedNews.history.status.id === statuses.sent || selectedNews.history.status.id === statuses.created) && (isModer || isPublisher || isAdmin)"
                icon="pi pi-check" class="p-button-help p-mr-2"
                v-on:click="publishNews"/>
        <Button :label="$t('common.reject')" v-if="selectedNews && selectedNews.history.status.id === statuses.sent && (isModer || isPublisher || isAdmin)"
                icon="pi pi-check" class="p-button-danger p-mr-2"
                v-on:click="rejectReason"/>
        <Button :label="$t('common.show')" v-if="selectedNews" icon="pi pi-eye" class="p-button-secondary p-mr-2"
                v-on:click="newsView"/>
      </template>
    </Toolbar>

    <!-- BEGINNING OF TABLE -->

    <DataTable :value="allNews"
               :paginator="true" class="p-datatable-customers"
               :rows="10" dataKey="id"
               :rowHover="true"
               v-model:selection="selectedNews"
               :filters="filters"
               :loading="loading">
      <template #header>
        <div class="table-header">
          {{ $t('smartenu.newsTitle') }}
          <span class="p-input-icon-left">
            <i class="pi pi-search"/>
            <InputText v-model="filters['global']" v-bind:placeholder="$t('hdfs.search')"/>
          </span>
        </div>
      </template>
      <template #empty>
        {{ $t('smartenu.newsNotFound') }}
      </template>
      <template #loading>
        {{ $t('smartenu.loadingNews') }}
      </template>
      <Column selectionMode="single" headerStyle="width: 3em"></Column>
      <Column :field="$i18n.locale === 'kz' ? `titleKz` : $i18n.locale === 'ru' ? `titleRu` : `titleEn`" v-bind:header="$t('common.nameIn')" :sortable="true">
        <template #body="slotProps">
          <span>
            {{
              $i18n.locale === 'kz' ? slotProps.data.titleKz : $i18n.locale === 'ru' ? slotProps.data.titleRu : slotProps.data.titleEn
            }}
          </span>
        </template>
      </Column>
      <Column :field="$i18n.locale === 'kz' ? `history.status.nameKz` : $i18n.locale === 'ru' ? `history.status.nameRu` : `history.status.nameEn`" v-bind:header="$t('common.status')" :sortable="true">
        <template #body="slotProps">
          <span :class="'customer-badge status-' + slotProps.data.history.status.id">
            {{
              $i18n.locale === 'kz' ? slotProps.data.history.status.nameKz : $i18n.locale === 'ru' ? slotProps.data.history.status.nameRu : slotProps.data.history.status.nameEn
            }}
          </span>
        </template>
      </Column>
      <Column field="categories" v-bind:header="$t('smartenu.categories')" :sortable="true">
        <template #body="slotProps">
          <span>
            {{ slotProps.data.categories.map(cat => cat.nameKz).toString().replaceAll(',', ', ') }}
          </span>
        </template>
      </Column>
      <Column field="createdBy" v-bind:header="$t('common.createdBy')" :sortable="true">
        <template #body="slotProps">
          <span>
            {{ slotProps.data.createdBy.name }}
          </span>
        </template>
      </Column>
      <Column>
        <template #body="slotProps">
          <Button icon="pi pi-pencil" class="p-button-rounded p-button-success p-mr-2"
                  @click="editNews(slotProps.data.id)"
                  v-if="slotProps.data.history.status.id === statuses.created  || (isAdmin || isModer)"/>
          <Button icon="pi pi-trash" class="p-button-rounded p-button-warning" v-if="slotProps.data.history.status.id === statuses.created || (isAdmin)" @click="delNews(slotProps.data.id)"/>
        </template>
      </Column>
    </DataTable>

    <!--    BEGINNING OF ADD/EDIT DIALOG-->

    <Dialog v-model:visible="editVisible" :style="{width: '1000px'}" :header="$t('smartenu.createOrEditNews')"
            :modal="true" class="p-fluid">
      <div class="card">
        <label for="cat-tree">{{ $t('smartenu.selectCategories') }}</label>
        <Tree :value="catTree.root" selectionMode="checkbox" v-model:selectionKeys="selectedCatTree"
              style="margin-bottom: 1.5rem"/>
        <div class="p-field" style="margin-bottom: 1.5rem">
          <span class="p-float-label">
            <InputText id="kz-title" v-model="newsData.titleKz" rows="3"/>
            <label for="kz-title">{{ $t('common.nameInQazaq') }}</label>
          </span>
        </div>
        <div class="p-field" style="margin-bottom: 1.5rem">
          <span class="p-float-label">
            <InputText id="ru-title" v-model="newsData.titleRu" rows="3"/>
            <label for="ru-title">{{ $t('common.nameInRussian') }}</label>
          </span>
        </div>
        <div class="p-field" style="margin-bottom: 1.5rem">
          <span class="p-float-label">
            <InputText id="en-title" v-model="newsData.titleEn" rows="3"/>
            <label for="en-title">{{ $t('common.nameInEnglish') }}</label>
          </span>
        </div>
        <div class="p-field">
          <div class="p-grid">
            <div class="p-col-12 p-md-3">
              <FileUpload ref="form" mode="basic"
                          :customUpload="true"
                          @uploader="uploadImage1($event)" :auto="true"
                          v-bind:chooseLabel="$t('smartenu.chooseImage1')"></FileUpload>
            </div>
          </div>
          <div v-if="newsData.image1">
            <img :src="newsData.image1" style="width: 50%; height: 50%;"/>
          </div>
        </div>
        <div class="p-field">
          <div class="p-grid">
            <div class="p-col-12 p-md-3">
              <FileUpload ref="form" mode="basic"
                          :customUpload="true"
                          @uploader="uploadImage2($event)" :auto="true"
                          v-bind:chooseLabel="$t('smartenu.chooseImage2')"></FileUpload>
            </div>
          </div>
          <div v-if="newsData.image2">
            <img :src="newsData.image2" style="width: 50%; height: 50%;"/>
          </div>
        </div>
        <div class="p-field">
          <label for="kz-content">{{ $t('common.contentInQazaq') }}</label>
          <Editor id="kz-content" v-model="newsData.contentKz" editorStyle="height: 320px"/>
        </div>
        <div class="p-field">
          <label for="ru-content">{{ $t('common.contentInRussian') }}</label>
          <Editor id="ru-content" v-model="newsData.contentRu" editorStyle="height: 320px"/>
        </div>
        <div class="p-field">
          <label for="en-content">{{ $t('common.contentInEnglish') }}</label>
          <Editor id="en-content" v-model="newsData.contentEn" editorStyle="height: 320px"/>
        </div>
      </div>
      <template #footer>
        <Button v-bind:label="$t('common.save')" icon="pi pi-check" class="p-button-text" v-on:click="addNews"/>
        <Button v-bind:label="$t('common.cancel')" icon="pi pi-times" class="p-button-text" @click="hideDialog"/>
      </template>
    </Dialog>

    <!--    BEGINNING OF REJECT DIALOG-->

    <Dialog v-model:visible="rejectVisible" :style="{width: '600px'}" :header="$t('smartenu.createOrEditNews')"
            :modal="true" class="p-fluid">
      <div class="card">
        <div class="p-field" style="margin-bottom: 1.5rem">
          <span class="p-float-label">
            <InputText id="kz-title" v-model="selectedNews.history.rejectReasonKz" rows="3"/>
            <label for="kz-title">{{ $t('common.nameInQazaq') }}</label>
          </span>
        </div>
        <div class="p-field" style="margin-bottom: 1.5rem">
          <span class="p-float-label">
            <InputText id="ru-title" v-model="selectedNews.history.rejectReasonRu" rows="3"/>
            <label for="ru-title">{{ $t('common.nameInRussian') }}</label>
          </span>
        </div>
        <div class="p-field">
          <span class="p-float-label">
            <InputText id="en-title" v-model="selectedNews.history.rejectReasonEn" rows="3"/>
            <label for="en-title">{{ $t('common.nameInEnglish') }}</label>
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

    <Dialog v-model:visible="deleteVisible" :style="{width: '450px'}" :modal="true">
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle p-mr-3" style="font-size: 2rem"/>
        <span v-if="newsData">{{ $t('common.doYouWantDelete') }}
          <b>{{
              $i18n.locale === 'kz' ? newsData.titleKz : $i18n.locale === 'ru' ? newsData.titleRu : newsData.titleEn
            }}</b>?
        </span>
      </div>
      <template #footer>
        <Button :label="$t('common.yes')" icon="pi pi-check" class="p-button-text" @click="deleteNews(newsData.id)"/>
        <Button :label="$t('common.no')" icon="pi pi-times" class="p-button-text" @click="deleteVisible = false"/>
      </template>
    </Dialog>

    <!--    BEGINNING OF VIEW DIALOG-->

    <Dialog v-model:visible="newsViewVisible" :style="{width: '1000px'}" :modal="true" class="p-fluid">
      <Card style="box-shadow: none">
        <template #header>
          <InlineMessage severity="error" show v-if="selectedNews.history.status.id === statuses.rejected" style="margin-bottom: 1.5rem">
            {{ $t('smartenu.rejectReason', {fn: $i18n.locale === 'kz' ? selectedNews.history.rejectReasonKz : $i18n.locale === 'ru' ? selectedNews.history.rejectReasonRu : selectedNews.history.rejectReasonEn}) }}
          </InlineMessage>
          <div style="padding:0 100px">
            <img :src="selectedNews.image1" style="width: 100%; height: 100%;"/>
          </div>
        </template>
        <template #title>
          {{
            $i18n.locale === 'kz' ? selectedNews.titleKz : $i18n.locale === 'ru' ? selectedNews.titleRu : selectedNews.titleEn
          }}
        </template>
        <template #subtitle>
          {{ new Date(selectedNews.history.modifyDate).toLocaleString() }}
        </template>
        <template #content>
          <div
              v-html="$i18n.locale === 'kz' ? selectedNews.contentKz : $i18n.locale === 'ru' ? selectedNews.contentRu : selectedNews.contentEn">
          </div>
        </template>
        <template #footer>
          <div style="padding: 0 100px">
            <img :src="selectedNews.image2" style="width: 100%; height: 100%;"/>
          </div>
        </template>
      </Card>
      <template #footer>
        <Button v-bind:label="$t('common.close')" icon="pi pi-times" class="p-button-text"
                @click="newsViewVisible = false"/>
      </template>
    </Dialog>
  </div>
</template>

<script>
import axios from "axios";
import {getHeader, header, smartEnuApi} from "@/config/config";

export default {
  name: "NewsTable",
  data() {
    return {
      statuses: {
        created: 1,
        sent: 2,
        published: 3,
        rejected: 4
      },
      editVisible: false,
      deleteVisible: false,
      rejectVisible: false,
      newsViewVisible: false,
      submitted: false,

      categories: null,
      newsData: null,
      allNews: [],
      selectedNews: null,
      filters: {},
      loading: true,
      catTree: {
        root: []
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
      }
    }
  },
  methods: {
    /**
     *  UPLOAD IMAGE1
     */
    uploadImage1(event) {
      const file = event.files[0]
      try {
        this.convertBase64(file).then(r => {
          this.newsData.image1 = r;
        })
      } catch (err) {
        console.log(err)
      }
    },

    /**
     *  UPLOAD IMAGE2
     */
    uploadImage2(event) {
      const file = event.files[0]
      try {
        this.convertBase64(file).then(r => {
          this.newsData.image2 = r;
        })
      } catch (err) {
        console.log(err)
      }
    },

    /**
     *  CONVERT IMAGE TO BASE64
     */
    async convertBase64(document) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(document);
        reader.onload = () => {
          resolve(reader.result);
        }
        reader.onerror = error => reject(error);
      });
    },

    /**
     *  GET ALL CATEGORIES
     */
    getCategories() {
      this.categories = []
      axios.get(smartEnuApi + '/allCategories', {headers:getHeader()}).then((response) => {
        this.categories = response.data
        this.categories = this.categories.reverse()
        this.loading = false
      }).catch((error) => {
        this.$toast.add({
          severity: 'error',
          summary: this.$t('smartenu.loadAllCategoriesError') + ":\n" + error,
          life: 3000
        });
      });
    },

    /**
     *  GET ALL NEWS
     */
    getAllNews() {
      this.allNews = []
      axios.get(smartEnuApi + '/allNews', {headers:getHeader()}).then((response) => {
        this.allNews = response.data
        this.allNews = this.allNews.reverse()
        this.loading = false
        console.log(this.allNews)
      }).catch((error) => {
        this.$toast.add({
          severity: 'error',
          summary: this.$t('smartenu.loadAllNewsError') + ":\n" + error,
          life: 3000
        });
      });
    },

    /**
     *  DELETE NEWS
     */
    deleteNews(id) {
      axios.post(smartEnuApi + '/delNews', {id: id}, {headers:getHeader()}).then((response) => {
        if (response.status === 200) {
          this.getAllNews()
        }
      }).catch((error) => {
        this.$toast.add({
          severity: 'error',
          summary: this.$t('smartenu.delNewsError') + ":\n" + error,
          life: 3000
        });
      })
      this.deleteVisible = false;
      this.newsData = {};
    },

    /**
     *  ADD NEWS
     */
    addNews() {
      console.log(this.newsData.contentCategoryRelations)
      this.submitted = true
      for (let key in this.catTreeElementsList) {
        for (let ixd in this.selectedCatTree) {
          if (this.catTreeElementsList[key].key.toString() === ixd) {
            this.newsData.contentCategoryRelations.push({
              id: 0,
              contentId: 0,
              categoryId: this.catTreeElementsList[key].data.id,
              checked: this.selectedCatTree[ixd].checked,
              partialChecked: this.selectedCatTree[ixd].partialChecked
            })
          }
        }
      }
      console.log("DAATTAAA",this.newsData)
      axios.post(smartEnuApi + '/addNews', this.newsData, {headers:getHeader()}).then((response) => {
        if (response.data !== null) {
          this.$toast.add({
            severity: 'success',
            summary: this.$t('smartenu.saveSuccess'),
            life: 3000
          });
          this.getAllNews()
          this.editVisible = false;
          this.newsData = {};
          this.selectedCatTree = null;
        }
      }).catch((error) => {
        this.$toast.add({
          severity: 'error',
          summary: this.$t('smartenu.saveNewsError') + ":\n" + error,
          life: 3000
        });
      });
    },

    /**
     *  CREATE NEWS
     */
    createNews() {
      this.catTreeElementsList = []
      this.catTree.root = this.createCatTree(null, null);
      this.newsData = {}
      this.editVisible = true
      this.submitted = false;
      this.newsData.id = null
      this.newsData.contentCategoryRelations = []
      this.selectedCatTree = []
    },

    /**
     *  NEWS PRE DELETE
     */
    delNews(id) {
      this.newsData = {}
      this.newsData = this.allNews.find(x => x.id === id)
      this.deleteVisible = true
    },

    /**
     *  NEWS PRE EDITING
     */
    editNews(id) {
      this.catTreeElementsList = []
      this.catTree.root = this.createCatTree(null, null);
      this.newsData = {}
      this.editVisible = true
      this.submitted = false;
      let newsData = this.allNews.find(x => x.id === id)
      this.newsData.id = newsData.id
      this.newsData.titleKz = newsData.titleKz
      this.newsData.titleRu = newsData.titleRu
      this.newsData.titleEn = newsData.titleEn
      this.newsData.image1 = newsData.image1
      this.newsData.image2 = newsData.image2
      this.newsData.contentKz = newsData.contentKz
      this.newsData.contentRu = newsData.contentRu
      this.newsData.contentEn = newsData.contentEn
      this.newsData.history = newsData.history
      this.newsData.createdBy = newsData.createdBy
      this.selectedCatTree = []
      this.newsData.contentCategoryRelations = []
      for (let key in this.catTreeElementsList) {
        for (let ixd in newsData.contentCategoryRelations) {
          if (this.catTreeElementsList[key].data.id === newsData.contentCategoryRelations[ixd].categoryId) {
            this.selectedCatTree[this.catTreeElementsList[key].key] = {
              checked: newsData.contentCategoryRelations[ixd].checked,
              partialChecked: newsData.contentCategoryRelations[ixd].partialChecked
            }
          }
        }
      }
    },

    /**
     * HIDE ADD EDIT DIALOG
     */
    hideDialog() {
      this.newsData = {}
      this.editVisible = false;
      this.submitted = false;
      this.catTree.root = []
      this.catTreeElementsList = []
      this.selectedCatTree = null
    },

    /**
     * ADD REJECT REASON VISIBILITY
     */
    rejectReason() {
      this.rejectVisible = true
    },

    /**
     * VIEW NEWS DIALOG VISIBILITY
     */
    newsView() {
      this.newsViewVisible = true
    },

    /**
     * SEND NEWS TO MODERATOR ACTION
     */
    sendNews() {
      axios.post(smartEnuApi + '/send',  {
        id: this.selectedNews.id,
        userId: this.selectedNews.history.userId
      }, {headers:getHeader()}).then((response) => {
        if (response.data !== null) {
          this.$toast.add({
            severity: 'success',
            summary: this.$t('smartenu.saveSuccess'),
            life: 3000
          });
          this.getAllNews()
        }
      }).catch((error) => {
        this.$toast.add({
          severity: 'error',
          summary: this.$t('smartenu.saveNewsError') + ":\n" + error,
          life: 3000
        });
      });
    },

    /**
     * PUBLSIH NEWS ACTION
     */
    publishNews() {
      axios.post(smartEnuApi + '/publish', {
        id: this.selectedNews.id,
        userId: this.selectedNews.history.userId
      }, {headers:getHeader()}).then((response) => {
        if (response.data !== null) {
          this.$toast.add({
            severity: 'success',
            summary: this.$t('smartenu.saveSuccess'),
            life: 3000
          });
          this.getAllNews()
        }
      }).catch((error) => {
        this.$toast.add({
          severity: 'error',
          summary: this.$t('smartenu.saveNewsError') + ":\n" + error,
          life: 3000
        });
      });
    },

    /**
     * REJECT NEWS ACTION
     */
    rejectNews() {
      axios.post(smartEnuApi + '/reject', {
        id: this.selectedNews.id,
        userId: this.selectedNews.history.userId,
        rejectReasonKz: this.selectedNews.history.rejectReasonKz,
        rejectReasonRu: this.selectedNews.history.rejectReasonRu,
        rejectReasonEn: this.selectedNews.history.rejectReasonEn
      }, {headers:getHeader()}).then((response) => {
        if (response.data !== null) {
          this.$toast.add({
            severity: 'success',
            summary: this.$t('smartenu.saveSuccess'),
            life: 3000
          });
          this.rejectVisible = false
          this.getAllNews()
        }
      }).catch((error) => {
        this.$toast.add({
          severity: 'error',
          summary: this.$t('smartenu.saveNewsError') + ":\n" + error,
          life: 3000
        });
      });
    },

    /**
     * CREATE CATEGORIES TREE RECURSION FUNCTION
     * @param id
     * @param key
     * @returns {[]}
     */
    createCatTree: function (id, key) {
      let array = []
      let grandparents = this.categories.filter(category => category.parentId === id);
      for (let i = 0; i < grandparents.length; i++) {
        this.catTreeElementsList.push({
          key: key + i,
          data: grandparents[i],
        })
        array.push({
          key: key + i,
          label: this.$i18n.locale === 'kz' ? grandparents[i].nameKz : this.$i18n.locale === 'ru' ? grandparents[i].nameRu : grandparents[i].nameEn,
          data: grandparents[i],
          children: this.createCatTree(grandparents[i].id, key + i + '-')
        })
      }
      return array
    },
    getRoles() {
      this.userRoles = []
      axios.get(smartEnuApi + '/getroles', {headers:getHeader()}).then((response) => {
        this.userRoles = response.data
        this.roles.isAdmin = this.findRole(this.userRoles, 'ADMINISTRATOR')
        this.roles.isPublisher = this.findRole(this.userRoles, 'PUBLISHER')
        this.roles.isStudent = this.findRole(this.userRoles, 'STUDENT')
        this.roles.isModer = this.findRole(this.userRoles, 'MODERATOR')
        console.log(this.userRoles)
      }).catch((error) => {
        this.$toast.add({
          severity: 'error',
          summary: this.$t('smartenu.loadAllEventsError') + ":\n" + error,
          life: 3000
        });
      });
    },
    findRole(roles, code) {
      for (let i = 0; i < roles.length; i++) {
        console.log(roles[i])
        if(roles[i].roleCode === code) {
          return true
        }
      }
      return false;
    }
  },

  created() {
    this.getAllNews()
    this.getCategories()
    this.getRoles()
  },

  computed: {
    isAdmin : function () {
      return this.roles.isAdmin
    },
    isModer : function () {
      return this.roles.isModer
    },
    isPublisher: function () {
      return this.roles.isPublisher
    },
    isStudent: function () {
      return this.roles.isStudent
    }
  }
}
</script>

<style scoped lang="scss">
::v-deep(.p-progressbar) {
  height: .5rem;
  background-color: #D8DADC;

  .p-progressbar-value {
    background-color: #607D8B;
  }
}

.p-datatable .p-column-filter {
  display: none;
}

.table-header {
  display: flex;
  justify-content: space-between;
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

.customer-badge {
  border-radius: 2px;
  padding: .25em .5rem;
  text-transform: uppercase;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: .3px;

  &.status-3 {
    background: #C8E6C9;
    color: #256029;
  }

  &.status-4 {
    background: #FFCDD2;
    color: #C63737;
  }

  &.status-negotiation {
    background: #FEEDAF;
    color: #8A5340;
  }

  &.status-1 {
    background: #B3E5FC;
    color: #23547B;
  }

  &.status-2 {
    background: #ECCFFF;
    color: #694382;
  }

  &.status-proposal {
    background: #FFD8B2;
    color: #805B36;
  }
}

.p-progressbar-value.ui-widget-header {
  background: #607d8b;
}

@media (max-width: 640px) {
  .p-progressbar {
    margin-top: .5rem;
  }
}

.product-image {
  width: 100px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)
}

.orders-subtable {
  padding: 1rem;
}

.product-badge {
  border-radius: 2px;
  padding: .25em .5rem;
  text-transform: uppercase;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: .3px;

  &.status-instock {
    background: #C8E6C9;
    color: #256029;
  }

  &.status-outofstock {
    background: #FFCDD2;
    color: #C63737;
  }

  &.status-lowstock {
    background: #FEEDAF;
    color: #8A5340;
  }
}

.order-badge {
  border-radius: 2px;
  padding: .25em .5rem;
  text-transform: uppercase;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: .3px;

  &.order-delivered {
    background: #C8E6C9;
    color: #256029;
  }

  &.order-cancelled {
    background: #FFCDD2;
    color: #C63737;
  }

  &.order-pending {
    background: #FEEDAF;
    color: #8A5340;
  }

  &.order-returned {
    background: #ECCFFF;
    color: #694382;
  }
}

@media screen and (max-width: 960px) {
  ::v-deep(.p-datatable) {
    &.p-datatable-customers {
      .p-datatable-thead > tr > th,
      .p-datatable-tfoot > tr > td {
        display: none !important;
      }

      .p-datatable-tbody > tr {
        > td {
          text-align: left;
          display: block;
          border: 0 none !important;
          width: 100% !important;
          float: left;
          clear: left;
          border: 0 none;

          .p-column-title {
            padding: .4rem;
            min-width: 30%;
            display: inline-block;
            margin: -.4rem 1rem -.4rem -.4rem;
            font-weight: bold;
          }

          .p-progressbar {
            margin-top: .5rem;
          }
        }
      }
    }
  }
}
</style>