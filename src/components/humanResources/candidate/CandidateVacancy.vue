<template>
  <DataTable :lazy="true"
             :value="vacancies"
             @page="onPage($event)"
             :totalRecords="count"
             :paginator="true"
             paginatorTemplate="FirstPageLink
                                  PrevPageLink
                                  PageLinks
                                  NextPageLink
                                  LastPageLink
                                  CurrentPageReport
                                  RowsPerPageDropdown"
             :rowsPerPageOptions="[10, 25, 50]"
             :currentPageReportTemplate="$t('common.showingRecordsCount',
                                                   { first: '{first}',
                                                     last: '{last}',
                                                     totalRecords: '{totalRecords}'
                                                   })"
             class="p-datatable-customers"
             :rows="10"
             dataKey="id"
             :rowHover="true"
             v-model:selection="vacancy"
             selection-mode="single"
             @row-select="select"
             :filters="filters"
             filterDisplay="menu"
             :showFilterMatchModes="false"
             :loading="visible.loading"
             responsiveLayout="scroll"
             @sort="onSort($event)">
    <!--  HEADER -->
    <template #header>
      <div class="table-header p-d-flex p-flex-column p-flex-md-row p-jc-md-between">
        <h4 class="p-mb-2 p-m-md-0 p-as-md-center">{{ $t("hr.vacancies") }}</h4>
        <span class="p-input-icon-left">
            <i class="pi pi-search"/>
            <InputText type="search"
                       v-model="lazyParams.searchText"
                       :placeholder="$t('common.search')"
                       @keyup.enter="getVacancies"
                       @click="clearData"/>
              <Button icon="pi pi-search" class="p-ml-1" @click="getVacancies"/>
          </span>
      </div>
    </template>
    <!-- EMPTY -->
    <template #empty> {{ $t('common.noData') }}</template>
    <!-- ON LOADING -->
    <template #loading> {{ $t('common.loading') }}</template>
    <!-- NAME COLUMN -->
    <Column :field="'name' + ($i18n.locale).charAt(0).toUpperCase() + ($i18n.locale).slice(1)"
            v-bind:header="$t('common.nameIn')"
            :sortable="true">
      <template #body="slotProps">
          <span>
            {{
              $i18n.locale === "kz" ? slotProps.data.nameKz : $i18n.locale === "ru"
                  ? slotProps.data.nameRu : slotProps.data.nameEn
            }}
          </span>
      </template>
    </Column>
    <Column field="org"
            v-bind:header="$t('common.organizationName')"
            :sortable="false">
      <template #body="slotProps">
          <span>
            {{
              $i18n.locale === "kz" ? slotProps.data.organization.name : $i18n.locale === "ru"
                  ? slotProps.data.organization.nameru : slotProps.data.organization.name
            }}
          </span>
      </template>
    </Column>
    <Column field="stp"
            v-bind:header="$t('common.departmentNameLabel')"
            :sortable="false">
      <template #body="slotProps">
          <span>
            {{
              $i18n.locale === "kz" ? slotProps.data.department.nameKz : $i18n.locale === "ru"
                  ? slotProps.data.department.name : slotProps.data.department.nameEn
            }}
          </span>
      </template>
    </Column>
    <Column field="status" v-bind:header="$t('common.status')" :sortable="false">
      <template #body="slotProps">
          <span :class="'customer-badge status-' + slotProps.data.candidateRelation[0].history.status.id">
            {{
              $i18n.locale === "kz"
                  ? slotProps.data.candidateRelation[0].history.status.nameKz
                  : $i18n.locale === "ru"
                      ? slotProps.data.candidateRelation[0].history.status.nameRu
                      : slotProps.data.candidateRelation[0].history.status.nameEn
            }}
          </span>
      </template>
    </Column>
    <!-- DATE COLUMN -->
    <Column field="date"
            v-bind:header="$t('common.deadlineDate')"
            :sortable="false">
      <template #body="slotProps">
          <span>
            {{
              new Date(slotProps.data.deadline).toLocaleDateString()
            }}
          </span>
      </template>
    </Column>
  </DataTable>
  <!-- Просмотр резюме -->
  <Dialog v-model:visible="visible.view" :style="{ width: '800px' }" :modal="true">

    <template #header>
      <h5 style="padding-left: 15px">
        <b>{{ $i18n.locale === "kz" ? vacancy.nameKz : $i18n.locale === "ru" ? vacancy.nameRu : vacancy.nameEn }}</b>
      </h5>
    </template>
    <Card style="box-shadow: none">
      <template #header>
        <div style="padding-left: 15px">
          <Message severity="info" :closable="false"> {{ $t('common.status') }}: {{
              $i18n.locale === "kz"
                  ? vacancy.candidateRelation[0].history.status.nameKz
                  : $i18n.locale === "ru"
                      ? vacancy.candidateRelation[0].history.status.nameRu
                      : vacancy.candidateRelation[0].history.status.nameEn
            }}
          </Message>
        </div>
      </template>

      <template #subtitle>
        {{ $t('common.publishDate') }} {{
          new Date(vacancy.history.modifyDate).toLocaleDateString() + ' ' +
          new Date(vacancy.history.modifyDate).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
        }}
      </template>

      <template #content>

        <p><b>{{ $t('common.organizationNameLabel') }}</b></p>
        <p style="padding-left: 20px"><i>{{
            $i18n.locale === "kz" ? vacancy.organization.name :
                $i18n.locale === "ru" ? vacancy.organization.nameru : vacancy.organization.name
          }}</i>
        </p>

        <p><b>{{ $t('common.deadlineDate') }}</b></p>
        <p style="padding-left: 20px"><i>{{ new Date(vacancy.deadline).toLocaleDateString() }}</i>
        </p>

        <p><b>{{ $t('common.departmentNameLabel') }}</b></p>
        <p style="padding-left: 20px"><i>{{
            $i18n.locale === "kz" ? vacancy.department.nameKz :
                $i18n.locale === "ru" ? vacancy.department.name : vacancy.department.nameEn
          }}</i><br>
          <i><b style="font-weight: 600">{{ $t('common.headLabel') }}</b> {{ vacancy.departmentHead.fullName }}</i>
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
          @click="visible.view = false"
      />
    </template>

  </Dialog>
</template>

<script>
import {FilterMatchMode, FilterOperator} from "primevue/api";
import axios from "axios";
import {getHeader, smartEnuApi} from "@/config/config";

export default {
  name: "CandidateVacancy",
  data() {
    return {
      count: 200,
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
        sortOrder: 0,
      },
      visible: {
        loading: false,
        view: false
      },
      vacancies: null,
      vacancy: null,
    }
  },
  methods: {
    /**
     * *********************** ПОЛУЧЕНИЕ ВАКАНСИЙ ПОЛЬЗОВАТЕЛЯ
     */
    getVacancies() {
      this.loading = true
      this.lazyParams.countMode = null;
      axios.post(smartEnuApi + "/vacancy/user",
          this.lazyParams, {headers: getHeader()}).then((response) => {
        console.log(response.data)
        this.vacancies = response.data.vacancies;
        this.count = response.data.total;
        this.loading = false;
      }).catch((error) => {
        if (error.response.status == 401) {
          this.$store.dispatch("logLout");
        } else {
          this.$toast.add({
            severity: "error",
            summary: 'Не удалось загрузить вакансии' + ":\n" + error,
            life: 3000,
          });
        }
      });
    },
    /**
     * *********************** СОРТИРОВКА
     * @param event
     */
    onSort(event) {
      this.lazyParams.sortField = event.sortField;
      this.lazyParams.sortOrder = event.sortOrder;
      this.getVacancies();
    },

    /**
     * *********************** ПАГИНАЦИЯ
     * @param event
     */
    onPage(event) {
      this.lazyParams.page = event.page
      this.lazyParams.rows = event.rows
      this.getVacancies();
    },

    /**
     * *********************** ВЫБОР ЭЛЕМЕНТА ТАБЛИЦЫ
     * @param event
     */
    select(event) {
      this.vacancy = event.data
      this.visible.view = true
    },

    clearData() {
      if (!this.lazyParams.searchText) {
        return;
      }
      this.lazyParams.searchText = "";
      this.getVacancies();
    },
  },
  created() {
    this.getVacancies();
  },
}
</script>

<style lang="scss" scoped>
.def-padding {
  padding-left: 20px;
  text-align: justify;
}
.customer-badge {
  border-radius: 2px;
  padding: 0.25em 0.5rem;
  text-transform: uppercase;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.3px;

  &.status-8 {
    background: #b3e5fc;
    color: #23547b;
  }

  &.status-9 {
    background: #eccfff;
    color: #694382;
  }

  &.status-10 {
    background: #c8e6c9;
    color: #256029;
  }

  &.status-11 {
    background: #ffcdd2;
    color: #c63737;
  }

  &.status-12 {
    background: #ffd8b2;
    color: #805b36;
  }
}
</style>