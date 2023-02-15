<template>
  <Dialog v-model:visible="editMenuVisible" :style="{ width: '1000px' }" :breakpoints="{'960px': '75vw', '640px': '90vw'}"
          :header="currentMenu ? $t('enuNewSite.editMenu') : $t('enuNewSite.addMenu') " :modal="true" class="p-fluid" @hide="hideDialog">
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
    <div class="p-field" v-if="menuType === 1">
      <label for="choose-page">{{ $t("enuNewSite.selectMainPage") }}
        <a href="javascript:void(0)" @click="showAddPage" class="p-ml-2 text-underline">{{ $t('common.createNew') }}</a>
      </label>
      <Dropdown v-model="this.formData.page_id" optionDisabled="true" :options="pages" optionLabel="title_kz" optionValue="enu_page_id"
                :filter="true" :showClear="true" :placeholder="$t('enuNewSite.selectPage')" />
    </div>
    <div class="p-field" v-if="menuType === 2">
      <label>{{ $t('common.link') }}</label>
      <InputText id="en-title" v-model="formData.link" :placeholder="$t('common.link')" />
    </div>
    <div class="p-field">
      <label>На главной</label>
      <div>
        <Checkbox inputId="is_main" v-model="formData.is_main" :binary="true" />
        <label class="p-ml-2" for="is_main">Да</label>
      </div>
    </div>
    <template #footer>
      <Button v-if="currentMenu" :label="$t('common.save')" icon="pi pi-check" class="p-button p-component p-button-success p-mr-2" @click="editMenu"/>
      <Button v-if="!currentMenu" :label="$t('common.add')" icon="pi pi-check" class="p-button p-component p-button-success p-mr-2" @click="addMenu"/>
      <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button p-component p-button-danger"
          @click="hideDialog"/>
    </template>
  </Dialog>

  <Sidebar v-model:visible="addPageVisible" position="right" class="p-sidebar-lg " style="overflow-y: scroll">
    <AddPage></AddPage>
  </Sidebar>
</template>

<script>
import {EnuWebService} from "@/service/enu.web.service";
import AddPage from "@/components/enuwebsite/AddPage.vue";

export default {
  name: "AddMenu",
  props: ['isVisible', 'allPages', 'menu_id', 'currentMenu', 'allMenus'],
  components: {AddPage},
  data(){
    return {
      editMenuVisible: this.isVisible ?? false,
      addPageVisible: false,
      menus: this.allMenus,
      pages: this.allPages ? this.allPages : [],
      menu:[],
      menuTitle: "",
      submitted: false,
      selectMenuVisible: true,
      selectPageVisible: true,
      customMenuLink: false,
      selectedPage: null,
      selectedMenu: this.currentMenu,
      enuService: new EnuWebService(),
      formData: this.currentMenu ? this.currentMenu : {
        menu_title_kz: null,
        menu_title_ru: null,
        menu_title_en: null,
        parent_id: this.menu_id ? this.menu_id : null,
        page_id: null,
        link: null,
        is_header: false,
        is_middle: false,
        icon: ""
      },
      formValid: [],
      menuType: !this.currentMenu ? 1 : this.currentMenu && this.currentMenu.page_id ? 1 : 2,
      checked: this.is_main ? this.is_main : null,
    };
  },
  mounted() {
    this.emitter.on('pageCreated', data => {
      if (data) {
        this.getPages(data);
      }
    });
  },
  methods: {
    addMenu() {
      this.submitted = true;
      if (!this.validateMenus()) {
        return;
      }

      this.enuService.addMenu(this.formData).then(res => {
        if (res.data.is_success) {
          this.formData = {};
          this.hideDialog();
          this.$toast.add({
            severity: "success",
            summary: this.$t("enuNewSite.createdMenuSuccessMsg"),
            life: 3000,
          });
        }
      }).catch(error => {
        this.$toast.add({
          severity: "error",
          summary: error,
          life: 3000,
        });
      });
    },
    editMenu() {
      this.submitted = true;
      if (!this.validateMenus()) {
        return;
      }

      this.enuService.editMenu(this.formData).then(res => {
        if (res.data.is_success) {
          this.formData = {};
          this.hideDialog();
          this.$toast.add({
            severity: "success",
            summary: this.$t("common.success"),
            life: 3000,
          });
        }
      }).catch(error => {
        this.$toast.add({
          severity: "error",
          summary: error,
          life: 3000,
        });
      });
    },
    getPages(data) {
      this.enuService.getAllPages().then(res => {
        this.pages = res.data;
        this.formData.page_id = data.enu_page_id;
        this.addPageVisible = false;
      }).catch(error => {
        this.$toast.add({
          severity: "error",
          summary: error,
          life: 3000,
        });
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
    },
    validateMenus() {
      let errors = [];
      if (!this.formData.menu_title_kz) {
        errors.push(1)
      }
      if (!this.formData.menu_title_ru) {
        errors.push(1)
      }
      if (!this.formData.menu_title_en) {
        errors.push(1)
      }
      if (this.menuType === 1 && !this.formData.page_id) {
        errors.push(1)
      }
      if (this.menuType === 2 && !this.formData.link) {
        errors.push(1)
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
      return errors.length === 0;
    },
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