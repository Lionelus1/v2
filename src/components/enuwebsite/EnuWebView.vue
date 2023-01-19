<template>
  <div class="p-col-12">
    <h3>{{ $t("enuNewSite.menuPage") }}</h3>
    <div class="card">
      <Button :label="$t('enuNewSite.addMenu')" icon="pi pi-plus" class="p-ml-2" v-on:click="createMenu"/>
    </div>
    <div class="card">
      <DataTable :value="menus" dataKey="menu_id" :paginator="true" :rows="10" sortMode="single" :rowHover="true">
        <Column field="menu_title_kz" :header="$t('common.nameIn')" :expander="true" :sortable="true">
          <template #body="{ data }">
            {{
              $i18n.locale === 'kz' ? data.menu_title_kz : $i18n.locale === 'ru' ? data.menu_title_ru : data.menu_title_en
            }}
          </template>
        </Column>
        <Column field="order_id" :header="$t('enuNewSite.menuOrder')" :sortable="true">
          <template #body="{ data }">
            {{ data.order_id }}
          </template>
        </Column>
        <Column field="is_main" :header="$t('enuNewSite.isMainMenu')" :sortable="true">
          <template #body="{ data }">
            {{ data.is_main }}
          </template>
        </Column>
        <Column>
          <template #body="">
            <Button type="button" icon="pi pi-pencil" class="p-button-warning"></Button>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>

  <AddMenu v-if="addMenuVisible" :is-visible="addMenuVisible" :all-pages="pages"></AddMenu>
</template>

<script>
import {EnuWebService} from "@/service/enu.web.service";
import AddMenu from "@/components/enuwebsite/AddMenu.vue";

export default {
  name: "EnuWebView",
  props: ['parentId'],
  components: { AddMenu },
  data() {
    return {
      addMenuVisible: false,
      menus: [],
      pages: [],
      menu: [],
      menuTitle: "",
      submitted: false,
      selectMenuVisible: true,
      selectPageVisible: true,
      customMenuLink: false,
      selectedPage: null,
      selectedMenu: null,
      menuService: new EnuWebService(),
      pageService: new EnuWebService(),
      formData: {
        menu_title_kz: null,
        menu_title_ru: null,
        menu_title_en: null,
        parent_id: this.menu_id ? this.menu_id : null,
        page_id: null,
        link: null,
        is_main: null,
        order_id: null,
        direction_id: null
      },
      formValid: []
    };
  },
  async created() {
    await this.getMenus();
    await this.getPages();
  },
  mounted() {
    this.emitter.on('addEditMenuDialogHide', data => {
      if (data) this.hideDialog();
    });
  },
  methods: {
    async getMenus() {
      this.menuService.getAllMenus().then(res => {
        if (res.data) {
          this.menus = res.data;
        }
      }).catch(error => {
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
    async getPages() {
      this.pages = [];
      this.pageService.getAllPages().then(res => {
        if (res.data) {
          this.pages = res.data;
        }
      }).catch(error => {
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
    createMenu() {
      this.addMenuVisible = true;
    },
    validateMenus() {
      this.formValid = [];
      if (!this.formData.menu_title_kz) {
        this.formValid.push({menu_title_kz: true})
      }
      if (!this.formData.menu_title_ru) {
        this.formValid.push({menu_title_ru: true})
      }
      if (!this.formData.menu_title_en) {
        this.formValid.push({menu_title_en: true})
      }
      // if(!this.formData.parent_id){
      //     this.formValid.push({parent_id: true})
      // }
      // if(!this.formData.page_id){
      //     this.formValid.push({page_id: true})
      // }
      // if(!this.formData.link){
      //     this.formValid.push({link: true})
      // }
      // if(!this.formData.is_main){
      //     this.formValid.push({is_main: true})
      // }
      // if(!this.formData.order_id){
      //     this.formValid.push({order_id: true})
      // }
      // if(!this.formData.direction_id){
      //     this.formValid.push({direction_id: true})

      // }
      return this.formValid;
    },
    setMainMenu() {
      if (this.formData.is_main === null) {
        this.formData.is_main = true;
      } else {
        this.formData.is_main = null;
      }
    },
    hideDialog() {
      this.addMenuVisible = false;
      this.selectedMenu=null;
      this.selectedPage=null;
    },

  }
}
</script>

<style lang="scss" scoped>
.dialog_img {
  padding: 0 100px;
}

@media (max-width: 780px) {
  .dialog_img {
    padding: 0;
  }
}

</style>
