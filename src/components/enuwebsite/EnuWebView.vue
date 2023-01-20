<template>
  <div class="p-col-12">
    <h3>{{ $t("enuNewSite.menuPage") }}</h3>
    <div class="card">
      <Button :label="$t('enuNewSite.addMenu')" icon="pi pi-plus" class="p-ml-2" v-on:click="createMenu"/>
    </div>
    <div class="card">
      <DataTable :value="menus" dataKey="menu_id" :paginator="true" :rows="10" :rowHover="true"
                 :loading="loading" responsiveLayout="scroll">
        <Column field="menu_title_kz" :header="$t('common.nameIn')" :expander="true">
          <template #body="{ data }">
            {{
              $i18n.locale === 'kz' ? data.menu_title_kz : $i18n.locale === 'ru' ? data.menu_title_ru : data.menu_title_en
            }}
          </template>
        </Column>
        <Column field="page" :header="$t('enuNewSite.menuMainPage')">
          <template #body="{ data }">
            <a href="javascript:void(0)" @click="viewPage(data)">{{ showPage(data) }}</a>
          </template>
        </Column>
        <Column field="link" :header="$t('common.link')">
          <template #body="{ data }">
            <a v-if="data.link" :href="data.link" target="_blank">{{ data.link }}</a>
          </template>
        </Column>
<!--        <Column field="order_id" :header="$t('enuNewSite.menuOrder')" :sortable="true">
          <template #body="{ data }">
            {{ data.order_id }}
          </template>
        </Column>
        <Column field="is_main" :header="$t('enuNewSite.isMainMenu')" :sortable="true">
          <template #body="{ data }">
            {{ data.is_main }}
          </template>
        </Column>-->
        <Column field="actions" header="">
          <template #body="slotProps">
            <Button type="button" icon="pi pi-pencil" class="p-button-warning" @click="createMenu($event, slotProps.data)"></Button>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>

  <AddMenu v-if="addMenuVisible" :is-visible="addMenuVisible" :all-pages="pages" :current-menu="selectedMenu"></AddMenu>
  <PageView v-if="viewPageVisible" :is-visible="viewPageVisible" :selectedPage="selectedViewMenu"></PageView>
</template>

<script>
import {EnuWebService} from "@/service/enu.web.service";
import AddMenu from "@/components/enuwebsite/AddMenu.vue";
import PageView from "@/components/enuwebsite/PageView.vue";

export default {
  name: "EnuWebView",
  components: { AddMenu, PageView },
  data() {
    return {
      addMenuVisible: false,
      viewPageVisible: false,
      menus: [],
      pages: [],
      submitted: false,
      selectedMenu: null,
      selectedViewMenu: null,
      enuService: new EnuWebService(),
      loading: false
    };
  },
  created() {
    this.getMenus();
    this.getPages();
  },
  mounted() {
    this.emitter.on('addEditMenuDialogHide', data => {
      if (data) this.hideDialog();
    });
    this.emitter.on('pageViewModalClose', data => {
      this.viewPageVisible = data;
    });
  },
  methods: {
    getMenus() {
      this.loading = true;
      this.enuService.getAllMenus().then(res => {
        if (res.data) {
          this.menus = res.data;
          this.loading = false;
        }
      }).catch(error => {
        this.loading = false;
        this.$toast.add({
          severity: "error",
          summary: error,
          life: 3000,
        });
      });
    },
    getPages() {
      this.pages = [];
      this.enuService.getAllPages().then(res => {
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
    createMenu(event, data) {
      this.selectedMenu = data;
      this.addMenuVisible = true;
    },
    viewPage(data) {
      this.selectedViewMenu = data.page;
      console.log(this.selectedViewMenu)
      this.viewPageVisible = true;
    },
    showPage(data) {
      let title = ""
      if (data && data.page)
        title = this.$i18n.locale === 'kz' ? data.page.title_kz : this.$i18n.locale === 'ru' ? data.page.title_ru : data.page.title_en;
      return title;
    },
    hideDialog() {
      this.getMenus();
      this.addMenuVisible = false;
      this.selectedMenu=null;
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
