<template>
  <div class="col-12">
    <h3>{{ $t("smartenu.newsCategoriesTitle") }}</h3>
    <ToolbarMenu v-if="isAdmin" :data="menu"/>
    <div class="card">
      <DataTable
          :value="categories"
          :paginator="true"
          :rows="10"
          dataKey="id"
          :rowHover="true"
          v-model:selection="selectedCategory"
          :filters="filters"
          :loading="loading"
          responsive-layout="scroll"
      >
        <template #header>
          <div class="table-header flex justify-content-end align-items-center">
            <span class="p-input-icon-left">
            <i class="pi pi-search"/>
            <InputText
                v-model="filters['global'].value"
                v-bind:placeholder="$t('hdfs.search')"
            />
          </span>
          </div>
        </template>
        <template #empty>
          {{ $t("smartenu.categoriesNotFound") }}
        </template>
        <template #loading>
          {{ $t("smartenu.loadingCategories") }}
        </template>
        <!--      <Column selectionMode="multiple" headerStyle="width: 3em"></Column>-->
        <Column
            field="nameKz"
            v-bind:header="$t('common.nameInQazaq')"
            :sortable="true"
        >
          <template #body="slotProps">
            <span>{{ slotProps.data.nameKz }}</span>
          </template>
        </Column>
        <Column
            field="nameRu"
            v-bind:header="$t('common.nameInRussian')"
            :sortable="true"
        >
          <template #body="slotProps">
            <span>{{ slotProps.data.nameRu }}</span>
          </template>
        </Column>
        <Column
            field="nameEn"
            v-bind:header="$t('common.nameInEnglish')"
            :sortable="true"
        >
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
          <template #body="{data}">
            <ActionButton v-if="isAdmin" :show-label="true" :items="actions" @toggle="toggle(data)" />
          </template>
        </Column>
      </DataTable>
    </div>
  </div>

  <Dialog
      v-model:visible="editVisible"
      :closable="false"
      :style="{ width: '450px' }"
      :header="$t('smartenu.createOrEditNewsCategory')"
      :modal="true"
      class="p-fluid"
  >
    <div class="field">
      <label for="kz-title">{{ $t("common.nameInQazaq") }}</label>
      <InputText id="kz-title" v-model="category.nameKz"/>
    </div>
    <div class="field">
      <label for="ru-title">{{ $t("common.nameInRussian") }}</label>
      <InputText id="ru-title" v-model="category.nameRu"/>
    </div>
    <div class="field">
      <label for="en-title">{{ $t("common.nameInEnglish") }}</label>
      <InputText id="en-title" v-model="category.nameEn"/>
    </div>
    <div class="field">
      <label for="cats">{{ $t("smartenu.chooseSuperiorCategory") }}</label>
      <Dropdown
          id="cats"
          v-model="category.parent"
          :options="categories"
          :optionLabel="
            $i18n.locale === 'kz'
              ? 'nameKz'
              : $i18n.locale === 'ru'
              ? 'nameRu'
              : 'nameEn'
          "
          v-bind:placeholder="$t('smartenu.chooseCategory')"
          showClear="true"
          :filter="true"
      >
        <template #value="slotProps">
          <div v-if="slotProps.value">
            <div>
              {{
                $i18n.locale === "kz"
                    ? slotProps.value.nameKz
                    : $i18n.locale === "ru"
                        ? slotProps.value.nameRu
                        : slotProps.value.nameEn
              }}
            </div>
          </div>
          <span v-else>
              {{ slotProps.placeholder }}
            </span>
        </template>
        <template #option="slotProps">
          <div>
            <div>
              {{
                $i18n.locale === "kz"
                    ? slotProps.option.nameKz
                    : $i18n.locale === "ru"
                        ? slotProps.option.nameRu
                        : slotProps.option.nameEn
              }}
            </div>
          </div>
        </template>
      </Dropdown>
    </div>
    <Fieldset :legend="$t('common.style')">
      <div>
        <label class="mr-2">{{ $t('common.bgColor') }}</label>
        <ColorPicker v-model="category.bgColor"/>
      </div>
      <div class="mt-2">
        <label class="mr-2">{{ $t('common.textColor') }}</label>
        <ColorPicker v-model="category.textColor"/>
      </div>
      <div>
        <div class="mt-3" :style="catButtonStyle">{{ category.nameKz }}</div>
      </div>
    </Fieldset>
    <template #footer>
      <Button
          v-bind:label="$t('common.save')"
          icon="pi pi-check"
          class="p-button p-component p-button-success mr-2"
          v-on:click="addCategory"
      />
      <Button
          v-bind:label="$t('common.cancel')"
          icon="pi pi-times"
          class="p-button p-component p-button-danger"
          @click="hideDialog"
      />
    </template>
  </Dialog>
  <Dialog
      v-model:visible="deleteVisible"
      :closable="false"
      header=""
      :style="{ width: '450px' }"
      :modal="true"
  >
    <div class="confirmation-content">
      <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem"/>
      <span v-if="category"
      >{{ $t("common.doYouWantDelete") }}
          <b>{{
              $i18n.locale === "kz"
                  ? category.nameKz
                  : $i18n.locale === "ru"
                      ? category.nameRu
                      : category.nameEn
            }}</b
          >?</span
      >
    </div>
    <template #footer>
      <Button
          :label="$t('common.yes')"
          icon="pi pi-check"
          class="p-button p-component p-button-success mr-2"
          @click="deleteNewsCategory(category.id)"
      />
      <Button
          :label="$t('common.no')"
          icon="pi pi-times"
          class="p-button p-component p-button-danger"
          @click="deleteVisible = false"
      />
    </template>
  </Dialog>
</template>

<script>
import api from "@/service/api";
import {authHeader, findRole, getHeader, smartEnuApi} from "@/config/config";
import {FilterMatchMode, FilterOperator} from "primevue/api";
import ToolbarMenu from "@/components/ToolbarMenu.vue";
import ActionButton from "@/components/ActionButton.vue";

export default {
  name: "CategoriesTable",
  components: {ActionButton, ToolbarMenu},
  data() {
    return {
      findRole: findRole,
      editVisible: false,
      deleteVisible: false,
      submitted: false,
      category: null,
      categories: [],
      selectedCategory: null,
      filters: {
        global: {
          value: null,
          matchMode: FilterMatchMode.CONTAINS,
        },
        name: {
          value: null,
          matchMode: FilterMatchMode.STARTS_WITH,
        },
        "country.name": {
          value: null,
          matchMode: FilterMatchMode.STARTS_WITH,
        },
        representative: {
          value: null,
          matchMode: FilterMatchMode.IN,
        },
        status: {
          value: null,
          matchMode: FilterMatchMode.EQUALS,
        },
        verified: {
          value: null,
          matchMode: FilterMatchMode.EQUALS,
        },
      },
      loading: true,
      roles: {
        isAdmin: false,
        isModer: false,
        isPublisher: false,
        isUser: true,
        isStudent: false,
      },
      bgColor: '0062ff',
      textColor: 'ffffff',
      actionsNode: null
    };
  },
  methods: {
    getCategories() {
      this.categories = [];
      api.get("/allCategories", {headers: getHeader()}).then((response) => {
        this.categories = response.data;
        this.categories = this.categories.reverse();
        this.loading = false;
      }).catch((error) => {
        this.$toast.add({
          severity: "error",
          summary: this.$t("smartenu.loadAllCategoriesError") + ":\n" + error,
          life: 3000,
        });
        if (error.response.status == 401) {
          this.$store.dispatch("logLout");
        }
      });
    },
    deleteNewsCategory(id) {
      api.post("/delNewsCat", {id: id}, {headers: getHeader()}).then((response) => {
        if (response.status === 200) {
          this.getCategories();
        }
      }).catch((error) => {
        this.$toast.add({
          severity: "error",
          summary: this.$t("smartenu.delNewsCategoryError") + ":\n" + error,
          life: 3000,
        });
      });
      this.deleteVisible = false;
      this.category = {};
    },
    addCategory() {
      this.submitted = true;
      if (!this.category.bgColor)
        this.category.bgColor = this.bgColor;
      if (!this.category.textColor)
        this.category.textColor = this.textColor;
        api.post("/categories", this.category, {headers: getHeader()})
          .then((response) => {
            if (response.data !== null) {
              this.$toast.add({
                severity: "success",
                summary: this.$t("smartenu.saveSuccess"),
                life: 3000,
              });
              this.getCategories();
            }
          }).catch((error) => {
        alert(JSON.stringify(error));
        this.$toast.add({
          severity: "error",
          summary: this.$t("smartenu.saveCategoryError") + ":\n" + error,
          life: 3000,
        });
      });
      this.editVisible = false;
      this.category = {};
    },

    getParentName(id) {
      if (id) {
        let category = this.categories.find((x) => x.id === id);
        return this.$i18n.locale === "kz"
            ? category.nameKz
            : this.$i18n.locale === "ru"
                ? category.nameRu
                : category.nameEn;
      } else {
        return null;
      }
    },

    createNewsCategory() {
      this.category = {};
      this.editVisible = true;
      this.submitted = false;
      this.category.id = null;
    },

    delNewsCategory(id) {
      this.category = {};
      this.category = this.categories.find((x) => x.id === id);
      this.deleteVisible = true;
    },

    editNewsCategory(id) {
      this.category = {};
      this.editVisible = true;
      this.submitted = false;
      let category = this.categories.find((x) => x.id === id);
      this.category.id = category.id;
      this.category.nameKz = category.nameKz;
      this.category.nameRu = category.nameRu;
      this.category.nameEn = category.nameEn;
      this.category.bgColor = category.bgColor;
      this.category.textColor = category.textColor;
      this.category.parent = this.categories.find(
          (x) => x.id === category.parentId
      );
    },

    hideDialog() {
      this.category = {};
      this.editVisible = false;
      this.submitted = false;
    },
    getRoles() {
      this.roles.isAdmin = this.findRole(null, "news_administrator");
      this.roles.isPublisher = this.findRole(null, "news_publisher");
      this.roles.isStudent = this.findRole(null, "student");
      this.roles.isModer = this.findRole(null, "news_moderator");
    },
    toggle(node) {
      this.actionsNode = node
    },
  },
  created() {
    this.getCategories();
    this.getRoles();
  },
  computed: {
    menu () {
      return [
        {
          label: this.$t('common.add'),
          icon: "pi pi-plus",
          visible: this.isAdmin,
          command: () => {this.createNewsCategory()},
        }
      ]
    },
    actions () {
      return [
        {
          label: this.$t('common.edit'),
          icon: "pi pi-pencil",
          command: () => {this.editNewsCategory(this.actionsNode.id)},
        },
        {
          label: this.$t('common.delete'),
          icon: "pi pi-trash",
          command: () => {this.delNewsCategory(this.actionsNode.id)},
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
    catButtonStyle() {
      return `background: #${this.category.bgColor ? this.category.bgColor : this.bgColor};color:#${this.category.textColor ? this.category.textColor : this.textColor};padding: 8px;width:fit-content;`
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

.customer-badge {
  border-radius: 2px;
  padding: 0.25em 0.5rem;
  text-transform: uppercase;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.3px;

  &.status-qualified {
    background: #c8e6c9;
    color: #256029;
  }

  &.status-unqualified {
    background: #ffcdd2;
    color: #c63737;
  }

  &.status-negotiation {
    background: #feedaf;
    color: #8a5340;
  }

  &.status-new {
    background: #b3e5fc;
    color: #23547b;
  }

  &.status-renewal {
    background: #eccfff;
    color: #694382;
  }

  &.status-proposal {
    background: #ffd8b2;
    color: #805b36;
  }
}

.p-progressbar-value.ui-widget-header {
  background: #607d8b;
}

@media (max-width: 640px) {
  .p-progressbar {
    margin-top: 0.5rem;
  }
}

.product-image {
  width: 100px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
}

.orders-subtable {
  padding: 1rem;
}

.product-badge {
  border-radius: 2px;
  padding: 0.25em 0.5rem;
  text-transform: uppercase;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.3px;

  &.status-instock {
    background: #c8e6c9;
    color: #256029;
  }

  &.status-outofstock {
    background: #ffcdd2;
    color: #c63737;
  }

  &.status-lowstock {
    background: #feedaf;
    color: #8a5340;
  }
}

.order-badge {
  border-radius: 2px;
  padding: 0.25em 0.5rem;
  text-transform: uppercase;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.3px;

  &.order-delivered {
    background: #c8e6c9;
    color: #256029;
  }

  &.order-cancelled {
    background: #ffcdd2;
    color: #c63737;
  }

  &.order-pending {
    background: #feedaf;
    color: #8a5340;
  }

  &.order-returned {
    background: #eccfff;
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
            padding: 0.4rem;
            min-width: 30%;
            display: inline-block;
            margin: -0.4rem 1rem -0.4rem -0.4rem;
            font-weight: bold;
          }

          .p-progressbar {
            margin-top: 0.5rem;
          }
        }
      }
    }
  }
}
</style>
