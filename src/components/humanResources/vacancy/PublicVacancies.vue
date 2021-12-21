<template>
  <div class="card">
    <DataTable
        :lazy="true" :value="vacancies" @page="onPage($event)" :totalRecords="count" :paginator="true"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink
                         LastPageLink CurrentPageReport RowsPerPageDropdown" :rowsPerPageOptions="[10, 25, 50]"
        :currentPageReportTemplate="$t('common.showingRecordsCount',
      { first: '{first}', last: '{last}', totalRecords: '{totalRecords}'})"
        class="p-datatable-customers" :rows="10" dataKey="id" :rowHover="true" v-model:selection="vacancy"
        selection-mode="single" @row-select="select"
        :filters="filters" filterDisplay="menu" :showFilterMatchModes="false" :loading="loading"
        responsiveLayout="scroll" @sort="onSort($event)">
      <template #header>
        <div class="table-header p-d-flex p-flex-column p-flex-md-row p-jc-md-between">
          <h4 class="p-mb-2 p-m-md-0 p-as-md-center">{{ $t("hr.vacancies") }}</h4>
          <span class="p-input-icon-left">
            <i class="pi pi-search"/>
            <InputText type="search" v-model="lazyParams.searchText" :placeholder="$t('common.search')"
                       @keyup.enter="getVacancies" @click="clearData"/>
              <Button icon="pi pi-search" class="p-ml-1" @click="getVacancies"/>
          </span>
        </div>
      </template>
      <template #empty> {{ $t('common.noData') }}</template>
      <template #loading> {{ $t('common.loading') }}</template>
      <Column :field="$i18n.locale === 'kz' ? `nameKz` : $i18n.locale === 'ru' ? `nameRu` : `nameEn`"
              v-bind:header="$t('common.nameIn')" :sortable="true" style="width: 80%">
        <template #body="slotProps">
          <span>
            {{
              $i18n.locale === "kz" ? slotProps.data.nameKz : $i18n.locale === "ru"
                  ? slotProps.data.nameRu : slotProps.data.nameEn
            }}
          </span>
        </template>
      </Column>
      <Column>
        <template #body="slotProps">
          <Button icon="pi pi-star" class="p-button-success" label="Откликнуться"
                  @click="apply(slotProps.data.id)"/>
        </template>
      </Column>
    </DataTable>

    <Dialog v-model:visible="isView" :style="{ width: '1000px' }" :modal="true">
      <template #header>
        <h5 style="padding-left: 15px">
          <b>{{ $i18n.locale === "kz" ? vacancy.nameKz : $i18n.locale === "ru" ? vacancy.nameRu : vacancy.nameEn }}</b>
        </h5>
      </template>
      <Card style="box-shadow: none">
        <template #header>
          <div style="padding-left: 15px">
            <Button icon="pi pi-star" class="p-button-success" label="Откликнуться"
                    @click="apply(vacancy.id)"/>
          </div>
        </template>
        <template #subtitle>
          {{ $t('common.publishDate') }} {{ new Date(vacancy.history.modifyDate).toLocaleString() }}
        </template>
        <template #content>
          <p><b>{{ $t('common.organizationNameLabel') }}</b></p>
          <p style="padding-left: 20px"><i>{{
              $i18n.locale === "kz" ? vacancy.organization.name :
                  $i18n.locale === "ru" ? vacancy.organization.nameRu : vacancy.organization.name
            }}</i>
          </p>
          <p><b>{{ $t('common.deadlineDate') }}</b></p>
          <p style="padding-left: 20px"><i>{{ new Date(vacancy.deadline).toLocaleString() }}</i>
          </p>
          <p><b>{{ $t('common.departmentNameLabel') }}</b></p>
          <p style="padding-left: 20px"><i>{{
              $i18n.locale === "kz" ? vacancy.department.name :
                  $i18n.locale === "ru" ? vacancy.organization.name : vacancy.organization.nameEn
            }}</i><br>
            <i><b style="font-weight: 600">{{ $t('common.headLabel') }}</b> {{vacancy.departmentHead.fullName}}</i>
          </p>
          <p><b>{{ $t('hr.responsibilitiesLabel') }}</b></p>
          <div class="p-field def-padding"
            v-html='
              $i18n.locale === "kz" ? vacancy.responsibilitiesKz :
                  $i18n.locale === "ru" ? vacancy.responsibilitiesRu : vacancy.responsibilitiesEn'
            />
          <p><b>{{ $t('hr.educationLabel') }}</b></p>
          <div class="p-field def-padding"
               v-html='$i18n.locale === "kz" ? vacancy.educationKz :
                  $i18n.locale === "ru" ? vacancy.educationRu : vacancy.educationEn'
          />
          <p><b>{{ $t('hr.qualificationLabel') }}</b></p>
          <div class="p-field def-padding"
               v-html='$i18n.locale === "kz" ? vacancy.qualificationKz :
                  $i18n.locale === "ru" ? vacancy.qualificationRu : vacancy.qualificationEn'
          />
          <p style="padding-left: 20px"><i>{{

            }}</i></p>
          <p><b>{{ $t('hr.experienceLabel') }}</b></p>
          <div class="p-field def-padding"
               v-html='$i18n.locale === "kz" ? vacancy.experienceKz :
                  $i18n.locale === "ru" ? vacancy.experienceRu : vacancy.experienceEn'
          />
          <p><b>{{ $t('hr.languageLevelLabel') }}</b></p>
          <div class="p-field def-padding"
               v-html='$i18n.locale === "kz" ? vacancy.languageLevelKz :
                  $i18n.locale === "ru" ? vacancy.languageLevelRu : vacancy.languageLevelEn'
          />
          <p><b>{{ $t('hr.certificateRequirementsLabel') }}</b></p>
          <div class="p-field def-padding"
               v-html='$i18n.locale === "kz" ? vacancy.certificateRequirementsKz :
                  $i18n.locale === "ru" ? vacancy.certificateRequirementsRu : vacancy.certificateRequirementsEn'
          />
          <p><b>{{ $t('hr.personalQualitiesLabel') }}</b></p>
          <div class="p-field def-padding"
               v-html='$i18n.locale === "kz" ? vacancy.personalQualitiesKz :
                  $i18n.locale === "ru" ? vacancy.personalQualitiesRu : vacancy.personalQualitiesEn'
          />
        </template>
      </Card>
      <template #footer>
        <Button
            v-bind:label="$t('common.close')"
            icon="pi pi-times"
            class="p-button p-component p-button-primary"
            @click="isView=false"
        />
      </template>
    </Dialog>

  </div>
</template>

<script>
import {FilterMatchMode, FilterOperator} from "primevue/api";
import axios from "axios";
import {getHeader, header, smartEnuApi} from "@/config/config";

export default {
  name: "PublicVacancies",
  data() {
    return {
      filters: {
        'global': {value: null, matchMode: FilterMatchMode.CONTAINS},
        'question': {value: null, matchMode: FilterMatchMode.CONTAINS},
        'recipient': {value: null, matchMode: FilterMatchMode.CONTAINS},
        'status': {value: null, matchMode: FilterMatchMode.EQUALS},
        'sendDate': {operator: FilterOperator.AND, constraints: [{value: null, matchMode: FilterMatchMode.DATE_IS}]},
        'createDate': {operator: FilterOperator.AND, constraints: [{value: null, matchMode: FilterMatchMode.DATE_IS}]}
      },
      lazyParams: {
        page: 0,
        rows: 10,
        searchText: null,
        sortField: "",
        sortOrder: 0
      },
      vacancies: [],
      vacancy: null,
      isView: false,
      count: 200,
      loading: false,
    }
  },
  methods: {
    clearData() {
      if (!this.lazyParams.searchText) {
        return;
      }
      this.lazyParams.searchText = "";
      this.getVacancies();
    },

    /**
     * ***********************
     * @param event
     */
    onSort(event) {
      this.lazyParams.sortField = event.sortField;
      this.lazyParams.sortOrder = event.sortOrder;
      this.getVacancies();
    },

    /**
     * ***********************
     * @param event
     */
    onPage(event) {
      this.lazyParams.page = event.page
      this.lazyParams.rows = event.rows
      this.getVacancies();
    },

    /**
     * ***********************
     * @param event
     */
    select(event) {
      this.vacancy = event.data
      this.isView = true
      // this.$toast.add({severity: 'info', summary: 'Product Selected', detail: 'ID: ' + event.data.id, life: 3000});
    },

    /**
     * ***********************
     */
    getVacancies() {
      this.loading = true
      this.lazyParams.countMode = null;
      axios
          .post(smartEnuApi + "/vacancy/public", this.lazyParams, {
            headers: getHeader(),
          }).then((response) => {
        this.vacancies = response.data.vacancies;
        this.count = response.data.total;
        this.loading = false;
        console.log("VACANCIES IS", this.vacancies)
      }).catch((error) => {
        if (error.response.status == 401) {
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
     * ***********************
     * @param id
     */
    apply(id) {

    },
  },
  created() {
    this.getVacancies();
  },
}
</script>

<style scoped>
  .def-padding {
    padding-left: 20px;
  }

</style>