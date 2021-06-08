<template>
  <div class="card">
    <Toolbar class="p-mb-4">
      <template #left>
        <Button :label="$t('common.add')" v-if="isAdmin" icon="pi pi-plus" class="p-button-success p-mr-2"
                v-on:click="createNewsCategory"/>
      </template>
    </Toolbar>
    <DataTable :value="categories" :paginator="true" class="p-datatable-customers" :rows="10" dataKey="id"
               :rowHover="true" v-model:selection="selectedCategory"
               :filters="filters" :loading="loading">
      <template #header>
        <div class="table-header">
          {{ $t('smartenu.newsCategoriesTitle') }}
          <span class="p-input-icon-left">
          <i class="pi pi-search"/>
          <InputText v-model="filters['global']" v-bind:placeholder="$t('hdfs.search')"/>
        </span>
        </div>
      </template>
      <template #empty>
        {{ $t('smartenu.categoriesNotFound') }}
      </template>
      <template #loading>
        {{ $t('smartenu.loadingCategories') }}
      </template>
      <Column selectionMode="multiple" headerStyle="width: 3em"></Column>
      <Column field="nameKz" v-bind:header="$t('common.nameInQazaq')" :sortable="true">
        <template #body="slotProps">
          <span>{{ slotProps.data.nameKz }}</span>
        </template>
      </Column>
      <Column field="nameRu" v-bind:header="$t('common.nameInRussian')" :sortable="true">
        <template #body="slotProps">
          <span>{{ slotProps.data.nameRu }}</span>
        </template>
      </Column>
      <Column field="nameEn" v-bind:header="$t('common.nameInEnglish')" :sortable="true">
        <template #body="slotProps">
          <span>{{ slotProps.data.nameEn }}</span>
        </template>
      </Column>
      <Column v-bind:header="$t('smartenu.parent')">
        <template #body="slotProps">
          {{ getParentName(slotProps.data.parentId) }}
        </template>
      </Column>
      <Column>
        <template #body="slotProps">
          <Button icon="pi pi-pencil" class="p-button-rounded p-button-success p-mr-2" v-if="isAdmin"
                  @click="editNewsCategory(slotProps.data.id)"/>
          <Button icon="pi pi-trash" class="p-button-rounded p-button-warning" v-if="isAdmin" @click="delNewsCategory(slotProps.data.id)"/>
        </template>
      </Column>
    </DataTable>
    <Dialog v-model:visible="editVisible" :closable="false" :style="{width: '450px'}" :header="$t('smartenu.createOrEditNewsCategory')"
            :modal="true" class="p-fluid">
      <div class="p-field" style="margin: 1.5rem 0 1.5rem 0">
      <span class="p-float-label">
        <InputText id="kz-title" v-model="category.nameKz"/>
        <label for="kz-title">{{ $t('common.nameInQazaq') }}</label>
      </span>
      </div>
      <div class="p-field" style="margin-bottom: 1.5rem">
      <span class="p-float-label">
        <InputText id="ru-title" v-model="category.nameRu"/>
        <label for="ru-title">{{ $t('common.nameInRussian') }}</label>
      </span>
      </div>
      <div class="p-field" style="margin-bottom: 1.5rem">
      <span class="p-float-label">
        <InputText id="en-title" v-model="category.nameEn"/>
        <label for="en-title">{{ $t('common.nameInEnglish') }}</label>
      </span>
      </div>
      <div class="p-field">
        <label for="cats">{{ $t('smartenu.chooseSuperiorCategory') }}</label>
        <Dropdown id="cats" v-model="category.parent" :options="categories"
                  :optionLabel="$i18n.locale ==='kz' ? 'nameKz' : $i18n.locale === 'ru' ? 'nameRu' : 'nameEn'"
                  v-bind:placeholder="$t('smartenu.chooseCategory')" showClear="true"
                  :filter="true">
          <template #value="slotProps">
            <div v-if="slotProps.value">
              <div>{{
                  $i18n.locale === 'kz' ? slotProps.value.nameKz : $i18n.locale === 'ru' ? slotProps.value.nameRu : slotProps.value.nameEn
                }}
              </div>
            </div>
            <span v-else>
                    {{ slotProps.placeholder }}
                </span>
          </template>
          <template #option="slotProps">
            <div>
              <div>{{
                  $i18n.locale === 'kz' ? slotProps.option.nameKz : $i18n.locale === 'ru' ? slotProps.option.nameRu : slotProps.option.nameEn
                }}
              </div>
            </div>
          </template>
        </Dropdown>
      </div>
      <template #footer>
        <Button v-bind:label="$t('common.save')" icon="pi pi-check" class="p-button p-component p-button-success p-mr-2" v-on:click="addCategory"/>
        <Button v-bind:label="$t('common.cancel')" icon="pi pi-times" class="p-button p-component p-button-danger" @click="hideDialog"/>
      </template>
    </Dialog>
    <Dialog v-model:visible="deleteVisible" :closable="false" header="" :style="{width: '450px'}" :modal="true">
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle p-mr-3" style="font-size: 2rem" />
        <span v-if="category">{{$t('common.doYouWantDelete') }} <b>{{$i18n.locale === 'kz' ? category.nameKz : $i18n.locale === 'ru' ? category.nameRu : category.nameEn}}</b>?</span>
      </div>
      <template #footer>
        <Button :label="$t('common.yes')" icon="pi pi-check" class="p-button-text" @click="deleteNewsCategory(category.id)" />
        <Button :label="$t('common.no')" icon="pi pi-times" class="p-button-text" @click="deleteVisible = false"/>
      </template>
    </Dialog>
  </div>
</template>

<script>
import axios from "axios";
import {authHeader, getHeader, smartEnuApi} from "@/config/config";


export default {
  name: "CategoriesTable",
  data() {
    return {
      editVisible: false,
      deleteVisible: false,
      submitted: false,
      category: null,
      categories: [],
      selectedCategory: null,
      filters: {},
      loading: true,
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
    deleteNewsCategory(id) {
      axios.post(smartEnuApi + '/delNewsCat', {id: id}, {headers:getHeader()}).then((response) => {
        if (response.status === 200) {
          this.getCategories()
        }
      }).catch((error) => {
        this.$toast.add({
          severity: 'error',
          summary: this.$t('smartenu.delNewsCategoryError') + ":\n" + error,
          life: 3000
        });
      })
      this.deleteVisible = false;
      this.category = {};
    },
    addCategory() {
      this.submitted = true
      axios.post(smartEnuApi + '/categories',
          this.category, {headers:getHeader()})
      .then((response) => {
        if (response.data !== null) {
          this.$toast.add({
            severity: 'success',
            summary: this.$t('smartenu.saveSuccess'),
            life: 3000
          });
          this.getCategories()
        }
      }).catch((error) => {
        alert(JSON.stringify(error));
        this.$toast.add({
          severity: 'error',
          summary: this.$t('smartenu.saveCategoryError') + ":\n" + error,
          life: 3000
        });
      });
      this.editVisible = false;
      this.category = {};
    },

    getParentName(id) {
      if (id) {
        let category = this.categories.find(x => x.id === id)
        return this.$i18n.locale === 'kz' ? category.nameKz : this.$i18n.locale === 'ru' ? category.nameRu : category.nameEn
      } else {
        return null
      }
    },

    createNewsCategory() {
      this.category = {}
      this.editVisible = true
      this.submitted = false;
      this.category.id = null
    },

    delNewsCategory(id) {
      this.category = {}
      this.category = this.categories.find(x => x.id === id)
      this.deleteVisible = true
    },

    editNewsCategory(id) {
      this.category = {}
      this.editVisible = true
      this.submitted = false;
      let category = this.categories.find(x => x.id === id)
      this.category.id = category.id
      this.category.nameKz = category.nameKz
      this.category.nameRu = category.nameRu
      this.category.nameEn = category.nameEn
      this.category.parent = this.categories.find(x => x.id === category.parentId)
    },

    hideDialog() {
      this.category = {}
      this.editVisible = false;
      this.submitted = false;
    },
    getRoles() {
      this.userRoles = []
      axios.get(smartEnuApi + '/getroles', {headers:getHeader()}).then((response) => {
        this.userRoles = response.data
        this.roles.isAdmin = this.findRole(this.userRoles, 'ADMINISTRATOR')
        this.roles.isPublisher = this.findRole(this.userRoles, 'PUBLISHER')
        this.roles.isStudent = this.findRole(this.userRoles, 'STUDENT')
        this.roles.isModer = this.findRole(this.userRoles, 'MODERATOR')
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
        if(roles[i].roleCode === code) {
          return true
        }
      }
      return false;
    }
  },
  created() {
    this.getCategories()
    this.getRoles()
  },
  computed : {
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

  &.status-qualified {
    background: #C8E6C9;
    color: #256029;
  }

  &.status-unqualified {
    background: #FFCDD2;
    color: #C63737;
  }

  &.status-negotiation {
    background: #FEEDAF;
    color: #8A5340;
  }

  &.status-new {
    background: #B3E5FC;
    color: #23547B;
  }

  &.status-renewal {
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