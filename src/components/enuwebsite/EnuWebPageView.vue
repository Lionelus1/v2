<template>
  <div class="p-col-12">
    <h3>{{ $t("enuNewSite.pageLink") }}</h3>
    <div class="card">
      <Button :label="$t('enuNewSite.addPage')" icon="pi pi-plus" class="p-ml-2" @click="createPage"/>
    </div>

    <div class="card">
      <DataTable :value="pages" responsiveLayout="scroll" dataKey="enu_page_id" :paginator="true" :rows="10" sortMode="single" :rowHover="true">
        <Column field="title_kz" :header="$t('common.nameInQazaq')">
          <template #body="{ data }">
            {{ $i18n.locale === 'kz' ? data.title_kz : $i18n.locale === 'ru' ? data.title_ru : data.title_en }}
          </template>
        </Column>
        <Column header="" style="text-align: right;">
          <template #body="{ data }">
            <Button type="button" icon="pi pi-eye" class="p-mr-2" @click="onView(data)"></Button>
            <Button type="button" icon="pi pi-pencil" class="p-mr-2" @click="onEditPage(data)"></Button>
            <Button type="button" icon="pi pi-trash" class="p-button-danger" @click="delPage(data.enu_page_id)"></Button>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
  <Dialog v-model:visible="display" :style="{ width: '1000px' }" :breakpoints="{'960px': '75vw', '640px': '90vw'}"
          :header="$t('enuNewSite.addEditPageTitle')"
          :modal="true" class="p-fluid">
    <TabView>
      <TabPanel header="Қазақша">
        <div class="p-field p-mt-3">
          <label for="kz-title">{{ $t("common.nameInQazaq") }}</label>
          <InputText id="title_kz" v-model="formData.title_kz" rows="3"/>
          <small v-show="!formData.title_kz && submitted" class="p-error">{{ $t("smartenu.titleKzInvalid") }}</small>
        </div>
        <div class="p-field">
          <label for="kz-content">{{ $t("common.contentInQazaq") }}</label>
          <Editor id="content_kz" v-model="formData.content_kz" editorStyle="height: 320px"/>
          <small v-show="!formData.content_kz && submitted" class="p-error">{{ $t("smartenu.contentKzInvalid") }}</small>
        </div>
      </TabPanel>
      <TabPanel header="Русский">
        <div class="p-field p-mt-3">
          <label for="ru-title">{{ $t("common.nameInRussian") }}</label>
          <InputText id="title_ru" v-model="formData.title_ru" rows="3"/>
          <small v-show="!formData.title_ru && submitted" class="p-error">{{ $t("smartenu.titleRuInvalid") }}</small>
        </div>
        <div class="p-field">
          <label for="kz-content">{{ $t("common.contentInRussian") }}</label>
          <Editor id="content_ru" v-model="formData.content_ru" editorStyle="height: 320px"/>
          <small v-show="!formData.content_ru && submitted" class="p-error">{{ $t("smartenu.contentKzInvalid") }}</small>
        </div>
      </TabPanel>
      <TabPanel header="English">
        <div class="p-field p-mt-3">
          <label for="en-title">{{ $t("common.nameInEnglish") }}</label>
          <InputText id="title_en" v-model="formData.title_en" rows="3"/>
          <small v-show="!formData.title_en && submitted" class="p-error">{{ $t("smartenu.titleEnInvalid") }}</small>
        </div>
        <div class="p-field">
          <label for="kz-content">{{ $t("common.contentInEnglish") }}</label>
          <Editor id="content_en" v-model="formData.content_en" editorStyle="height: 320px"/>
          <small v-show="!formData.content_en && submitted" class="p-error">{{ $t("smartenu.contentKzInvalid") }}</small>
        </div>
      </TabPanel>
    </TabView>
    <template #footer>
      <Button v-bind:label="$t('common.save')" icon="pi pi-check"
          class="p-button p-component p-button-success p-mr-2" v-on:click="addButtonName"/>
      <Button v-bind:label="$t('common.cancel')" icon="pi pi-times"
          class="p-button p-component p-button-danger" @click="hideDialog"/>
    </template>
  </Dialog>

  <PageView v-if="pageView" :is-visible="pageView" :selectedPage="selectedPage"></PageView>
</template>

<script>
import {EnuWebService} from "@/service/enu.web.service";
import {throwStatement} from "@babel/types";
import AddMenu from "@/components/enuwebsite/AddMenu.vue";
import AddPage from "@/components/enuwebsite/AddPage.vue";
import PageView from "@/components/enuwebsite/PageView.vue";

export default {
  name: "EnuWebPageView",
  components: {PageView},
  data() {
    return {
      pages: [],
      editPage: [],
      enuPageID: null,
      pageTitle: "",
      display: false,
      pageView: false,
      deleteVisible: false,
      allPage: [],
      pageData: null,
      addButtonName: this.addPage,
      submitted: false,
      enuService: new EnuWebService(),
      formValid: [],
      formData: {
        enu_page_id: null,
        title_kz: null,
        title_ru: null,
        title_en: null,
        content_kz: null,
        content_ru: null,
        content_en: null,

      },
      selectedPage: {
        enu_page_id: null,
        title_kz: null,
        title_ru: null,
        title_en: null,
        content_kz: null,
        content_ru: null,
        content_en: null,
      },

    };
  },
  created() {
    this.getPages();
  },
  mounted() {
    this.emitter.on('pageViewModalClose', data => {
      this.pageView = data;
    });
  },
  methods: {
    getPages() {
      this.enuService.getAllPages().then(res => {
        if (res.data) {
          this.pages = res.data;
          this.allPage = res.data;
        }
      }).catch(error => {
        this.$toast.add({severity: "error", summary: error, life: 3000});
      });
    },
    createPage() {
      this.display = true;
    },
    hideDialog() {
      this.display = false;
      this.formData = {};
      this.addButtonName = this.addPage;
    },
    isDelete() {
      if (this.isDeletable === false) {
        this.isDeletable = true;
      } else {
        this.isDeletable = false;
      }
    },
    delPage(id) {
      this.$confirm.require({
        message: this.$t('common.doYouWantDelete'),
        header: this.$t('common.delete'),
        icon: 'pi pi-info-circle',
        acceptClass: 'p-button-rounded p-button-success',
        rejectClass: 'p-button-rounded p-button-danger',
        accept: () => {
          this.onDeletePage(id);
        },
      });
    },
    addPage() {
      this.submitted = true;
      if (this.validatePage().length > 0) {
        return;
      }
      this.enuService.addPage(this.formData).then(res => {
        if (res.data !== null) {
          this.$toast.add({severity: "success", summary: this.$t("enuNewSite.createdPageSuccessMsg"), life: 3000});
        }
      }).catch(error => {
        this.$toast.add({severity: "error", summary: error, life: 3000});
      });
      this.display = false;
    },
    validatePage() {
      this.formValid = [];
      if (!this.formData.title_kz) {
        this.formValid.push({title_kz: true});
      }
      if (!this.formData.title_ru) {
        this.formValid.push({title_ru: true});
      }
      if (!this.formData.title_en) {
        this.formValid.push({title_en: true});
      }
      if (!this.formData.content_kz) {
        this.formValid.push({content_kz: true});
      }
      if (!this.formData.content_ru) {
        this.formValid.push({content_ru: true});
      }
      if (!this.formData.content_en) {
        this.formValid.push({content_en: true});
      }
      return this.formValid;
    },
    onDeletePage(id) {
      this.enuService.deletePage(id).then(res => {
        if (res.data !== null) {
          this.$toast.add({
            severity: "success",
            summary: "Successfully deleted",
            life: 3000,
          });
        }
      }).catch(error => {
        this.$toast.add({severity: "error", summary: error, life: 3000});
      });
      this.deleteVisible = false;

    },
    onView(data) {
      this.selectedPage = data;
      this.pageView = true;
    },
    onEditPage(data) {
      this.addButtonName = this.onSavePage;
      this.display = true;
      this.formData = data;
    },
    onSavePage() {
      this.enuService.editPage(this.formData).then(res => {
        if (res.data !== null) {
          this.$toast.add({severity: "success", summary: this.$t("enuNewSite.createdPageSuccessMsg"), life: 3000});
        }
      }).catch(error => {
        this.$toast.add({severity: "error", summary: error, life: 3000});
      });
      this.display = false;
    }
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
