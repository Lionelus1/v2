<template>
  <div class="col-12">
    <h3>{{ $t("web.pageLink") }}</h3>
    <div class="card">
      <Button :label="$t('web.addPage')" icon="pi pi-plus" class="ml-2" @click="createPage"/>
    </div>

    <div class="card" v-if="pages">
      <DataTable :value="pages" responsiveLayout="scroll" :lazy="true" dataKey="enu_page_id" :loading="loading" :rows="10" :rowHover="true"
                 :paginator="true" :totalRecords="total" @page="onPage" @sort="onSort">
        <template #header>
          <div class="text-right">
            <div class="p-input-icon-left">
              <i class="pi pi-search"/>
              <InputText type="search" v-model="lazyParams.searchText" :placeholder="$t('common.search')"
                         @search="getPages"/>
              <Button icon="pi pi-search" class="ml-1" @click="getPages"/>
            </div>
          </div>
        </template>
        <template #empty>{{this.$t("common.recordsNotFound") }}</template>
        <template #loading>{{this.$t("common.recordsLoading") }}</template>
        <Column :field="'title_' + $i18n.locale" :header="$t('common.nameIn')" sortable>
          <template #body="{ data }">
            {{ $i18n.locale === 'kz' ? data.title_kz : $i18n.locale === 'ru' ? data.title_ru : data.title_en }}
          </template>
        </Column>
        <Column field="is_landing" header="Landing page" sortable>
          <template #body="{ data }">
            {{ data.is_landing ? 'Landing page' : '' }}
          </template>
        </Column>
        <Column field="create_date" :header="$t('faq.createDate')" sortable>
          <template #body="{ data }">
            {{ formatDate(data.create_date) }}
          </template>
        </Column>
        <Column header="" style="text-align: right;">
          <template #body="{ data }">
            <Button type="button" icon="fa-solid fa-eye" class="mr-2" @click="onView(data)"></Button>
            <Button type="button" icon="fa-solid fa-pen" class="mr-2" @click="onEditPage(data)"></Button>
            <Button type="button" icon="fa-solid fa-trash" class="p-button-danger" @click="delPage(data)"></Button>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
  <Dialog v-model:visible="display" :style="{ width: '1000px' }" :breakpoints="{'960px': '75vw', '640px': '90vw'}"
          :header="$t('web.addEditPageTitle')"
          :modal="true" class="p-fluid">
    <div class="field-checkbox mt-3">
      <Checkbox id="landing" name="landing" v-model="formData.is_landing" :binary="true"/>
      <label for="landing">Landing page</label>
    </div>

    <div v-if="formData.is_landing">
      <div class="field">
        <label>{{ $t('common.nameInQazaq') }}</label>
        <InputText type="text" v-model="formData.title_kz"  />
        <small class="p-error" v-if="!formData.title_kz && submitted">{{ $t("common.requiredField") }}</small>
      </div>
      <div class="field">
        <label>{{ $t('common.nameInRussian')}}</label>
        <InputText type="text" v-model="formData.title_ru"  />
        <small class="p-error" v-if="!formData.title_ru && submitted">{{ $t("common.requiredField") }}</small>
      </div>
      <div class="field">
        <label>{{ $t('common.nameInEnglish') }}</label>
        <InputText type="text" v-model="formData.title_en"  />
        <small class="p-error" v-if="!formData.title_en && submitted">{{ $t("common.requiredField") }}</small>
      </div>
    </div>

    <TabView v-if="!formData.is_landing">
      <TabPanel header="Қазақша">
        <div class="field mt-3">
          <label for="kz-title">{{ $t("common.nameInQazaq") }}</label>
          <InputText id="title_kz" v-model="formData.title_kz" rows="3"/>
          <small v-show="!formData.title_kz && submitted" class="p-error">{{ $t("smartenu.titleKzInvalid") }}</small>
        </div>
        <div class="field">
          <label for="kz-content">{{ $t("common.contentInQazaq") }}</label>
          <RichEditor id="content_kz" v-model="formData.content_kz" editorStyle="height: 320px"/>
          <small v-show="!formData.content_kz && submitted" class="p-error">{{ $t("smartenu.contentKzInvalid") }}</small>
        </div>
      </TabPanel>
      <TabPanel header="Русский">
        <div class="field mt-3">
          <label for="ru-title">{{ $t("common.nameInRussian") }}</label>
          <InputText id="title_ru" v-model="formData.title_ru" rows="3"/>
          <small v-show="!formData.title_ru && submitted" class="p-error">{{ $t("smartenu.titleRuInvalid") }}</small>
        </div>
        <div class="field">
          <label for="kz-content">{{ $t("common.contentInRussian") }}</label>
          <RichEditor id="content_ru" v-model="formData.content_ru" editorStyle="height: 320px"/>
          <small v-show="!formData.content_ru && submitted" class="p-error">{{ $t("smartenu.contentKzInvalid") }}</small>
        </div>
      </TabPanel>
      <TabPanel header="English">
        <div class="field mt-3">
          <label for="en-title">{{ $t("common.nameInEnglish") }}</label>
          <InputText id="title_en" v-model="formData.title_en" rows="3"/>
          <small v-show="!formData.title_en && submitted" class="p-error">{{ $t("smartenu.titleEnInvalid") }}</small>
        </div>
        <div class="field">
          <label for="kz-content">{{ $t("common.contentInEnglish") }}</label>
          <RichEditor id="content_en" v-model="formData.content_en" editorStyle="height: 320px"/>
          <small v-show="!formData.content_en && submitted" class="p-error">{{ $t("smartenu.contentKzInvalid") }}</small>
        </div>
      </TabPanel>
    </TabView>
    <template #footer>
      <Button v-bind:label="$t('common.save')" icon="pi pi-check"
          class="p-button p-component p-button-success mr-2" v-on:click="addButtonName"/>
      <Button v-bind:label="$t('common.cancel')" icon="pi pi-times"
          class="p-button p-component p-button-danger" @click="hideDialog"/>
    </template>
  </Dialog>

  <PageView v-if="pageView" :is-visible="pageView" :selectedPage="selectedPage"></PageView>
</template>

<script>
import {EnuWebService} from "@/service/enu.web.service";
import PageView from "@/components/enuwebsite/PageView.vue";
import RichEditor from "@/components/documents/editor/RichEditor.vue";
import {formatDate} from "@/helpers/HelperUtil";

export default {
  name: "EnuPagesList",
  components: {PageView, RichEditor},
  data() {
    return {
      pages: [],
      editPage: [],
      enuPageID: null,
      pageTitle: "",
      display: false,
      pageView: false,
      deleteVisible: false,
      pageData: null,
      addButtonName: this.addPage,
      submitted: false,
      loading: false,
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
      lazyParams: {
        page: 0,
        rows: 10,
        searchText: null,
        sortField: null,
        sortOrder: 0
      },
      total: 0
    }
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
    formatDate,
    getPages() {
      this.loading = true;
      this.enuService.getAllPages(this.lazyParams).then(res => {
        if (res.data) {
          this.pages = res.data.pages;
          this.total = res.data.total;
        }
        this.loading = false;
      }).catch(error => {
        this.loading = false;
        this.$toast.add({severity: "error", summary: error, life: 3000});
      });
    },
    onPage(event) {
      this.lazyParams.page = event.page
      this.lazyParams.rows = event.rows
      this.getPages();
    },
    onSort(event) {
      this.lazyParams.sortField = event.sortField;
      this.lazyParams.sortOrder = event.sortOrder;
      this.getPages();
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
    delPage(data) {
      this.$confirm.require({
        message: this.$t('common.doYouWantDelete'),
        header: this.$t('common.delete'),
        icon: 'pi pi-info-circle',
        acceptClass: 'p-button-rounded p-button-success',
        rejectClass: 'p-button-rounded p-button-danger',
        accept: () => {
          this.onDeletePage(data.enu_page_id);
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
          this.$toast.add({severity: "success", summary: this.$t("web.createdPageSuccessMsg"), life: 3000});
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
      if (!this.formData.is_landing && !this.formData.content_kz) {
        this.formValid.push({content_kz: true});
      }
      if (!this.formData.is_landing && !this.formData.content_ru) {
        this.formValid.push({content_ru: true});
      }
      if (!this.formData.is_landing && !this.formData.content_en) {
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
        this.getPages();
      }).catch(error => {
        this.$toast.add({severity: "error", summary: error, life: 3000});
      });
      this.deleteVisible = false;

    },
    onView(data) {
      if (data.is_landing) {
        this.$router.push({name: 'LandingPageView', params: {id: data.enu_page_id}})
      } else {
        this.selectedPage = data;
        this.pageView = true;
      }
    },
    onEditPage(data) {
      this.addButtonName = this.onSavePage;
      this.display = true;
      this.formData = data;
    },
    onSavePage() {
      this.enuService.editPage(this.formData).then(res => {
        if (res.data !== null) {
          this.$toast.add({severity: "success", summary: this.$t("web.createdPageSuccessMsg"), life: 3000});
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

::v-deep(.ck-editor__editable) {
  height: 320px;
}

</style>
