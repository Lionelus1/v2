<template>
  <Dialog v-model:visible="editMenuVisible" :style="{ width: '1000px' }" :breakpoints="{'960px': '75vw', '640px': '90vw'}"
          :header="$t('enuNewSite.addEditMenuPageTitle')" :modal="true" class="p-fluid" @hide="hideDialog">
    <div class="p-field">
      <label>{{ $t("common.nameInQazaq") }}</label>
      <InputText v-model="formData.menu_title_kz" rows="3" :class="{ 'p-invalid': !formData.menu_title_kz && submitted }" />
      <small v-show="!formData.menu_title_kz && submitted" class="p-error">{{ $t("smartenu.titleKzInvalid") }}</small>
    </div>
    <div class="p-field">
      <label>{{ $t("common.nameInRussian") }}</label>
      <InputText v-model="formData.menu_title_ru" rows="3" :class="{ 'p-invalid': !formData.menu_title_ru && submitted }" />
      <small v-show="!formData.menu_title_ru && submitted" class="p-error">{{ $t("smartenu.titleRuInvalid") }}</small>
    </div>
    <div class="p-field">
      <label>{{ $t("common.nameInEnglish") }}</label>
      <InputText v-model="formData.menu_title_en" rows="3" :class="{ 'p-invalid': !formData.menu_title_en && submitted }" />
      <small v-show="!formData.menu_title_en && submitted" class="p-error">{{ $t("smartenu.titleEnInvalid") }}</small>
    </div>
    <div class="p-field">
      <label>Тип меню</label>
      <div class="field-radiobutton">
        <RadioButton inputId="menuType1" name="menuType" :value="1" v-model="menuType" />
        <label for="menuType1">Страница</label>
      </div>
      <div class="field-radiobutton">
        <RadioButton inputId="menuType2" name="menuType" :value="2" v-model="menuType" />
        <label for="menuType2">Ссылка</label>
      </div>
    </div>
<!--    <div class="p-field">
      <label>{{ $t('enuNewSite.selectParentMenu') }}</label>
      <Dropdown v-model="selectedMenu" optionDisabled="true" :options="menus" optionLabel="menu_title_kz" optionValue="menu_id" :placeholder="$t('enuNewSite.selectMenu')" />
    </div>-->
    <div class="p-field" v-if="menuType === 1">
      <label for="choose-page">{{ $t("enuNewSite.selectMainPage") }}
        <a href="javascript:void(0)" @click="showAddPage" class="p-ml-2 text-underline">{{ $t('common.createNew') }}</a>
      </label>
      {{ selectedPage  }}
      <Dropdown v-model="selectedPage" optionDisabled="true" :options="pages" optionLabel="title_kz" optionValue="enu_page_id"
                :filter="true" :showClear="true" :placeholder="$t('enuNewSite.selectPage')" />
    </div>
    <div class="p-field" v-if="menuType === 2">
      <label>{{ $t('common.link') }}</label>
      {{ selectedMenu  }}
      <InputText id="en-title" v-model="formData.link" :placeholder="$t('common.link')" />
    </div>
    <template #footer>
      <Button v-bind:label="$t('common.save')" icon="pi pi-check" class="p-button p-component p-button-success p-mr-2"
          v-on:click="addMenu"/>
      <Button v-bind:label="$t('common.cancel')" icon="pi pi-times" class="p-button p-component p-button-danger"
          @click="hideDialog"/>
    </template>
  </Dialog>

  <Sidebar
      v-model:visible="addPageVisible"
      position="right"
      class="p-sidebar-lg "
      style="overflow-y: scroll"
  >
    <AddPage></AddPage>
  </Sidebar>
</template>

<script>
import {EnuWebService} from "@/service/enu.web.service";
import AddPage from "@/components/enuwebsite/AddPage.vue";

export default {
  name: "AddMenu",
  props: ['isVisible', 'allPages'],
  components: {AddPage},
  data(){
    return {
      editMenuVisible: this.isVisible ?? false,
      addPageVisible: false,
      menus: [],
      pages: this.allPages ? this.allPages : [],
      menu:[],
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
      formValid: [],
      menuType: 1,
      checked: this.is_main ? this.is_main : null,
    };
  },
  methods: {
    hideSelectMenus() {

      if (this.selectMenuVisible == true && this.selectPageVisible == true && this.customMenuLink == false) {
        this.selectMenuVisible = false;
        this.selectPageVisible = false;
        this.customMenuLink = true;
        this.selectedMenu = null;
        this.selectedPage = null;

      } else {
        this.selectMenuVisible = true;
        this.selectPageVisible = true;
        this.customMenuLink = false;
        this.selectedMenu = null;
        this.selectedPage = null;
      }
    },
    addMenu() {
      this.submitted = true;
      if (this.validateMenus().length > 0) {
        return;
      }
      if (this.selectedPage != null) {
        this.formData.page_id = this.selectedPage;
      }

      if (this.selectedMenu != null) {
        this.formData.parent_id = this.selectedMenu;
      }

      this.menuService.addMenu(this.formData).then(res => {
        if (res.data.is_success) {
          this.$toast.add({
            severity: "success",
            summary: this.$t("enuNewSite.createdMenuSuccessMsg"),
            life: 3000,
          });
          this.formData.menu_title_kz = "";
          this.formData.menu_title_en = null;
          this.formData.menu_title_ru = null;
          this.formData.is_main = null;
          this.checked = null;
          this.hideDialog();
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
    hideDialog() {
      this.emitter.emit('addEditMenuDialogHide', true);
      this.selectedMenu=null;
      this.selectedPage=null;
      this.submitted = false;
      this.formData.menu_title_kz = null;
      this.formData.menu_title_ru = null;
      this.formData.menu_title_en = null;
      this.formData.direction_id = null;
      this.formData.is_main = null;
      this.formData.order_id = null;
      this.formData.parent_id = null;
    },
    showAddPage() {
      this.addPageVisible = true;
    }
  }
}
</script>

<style lang="scss" scoped>
.field-radiobutton {
  align-items: center;
  display: flex;
  margin-bottom: 1rem;

  label {
    line-height: 1;
    margin-left: 0.5rem;
  }
}
.text-underline {
  text-decoration: underline;
}
</style>