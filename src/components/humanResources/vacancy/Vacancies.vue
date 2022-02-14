<template>
  <div class="card">
    <Toolbar class="p-mb-4">
      <template #start>
        <Button
            :label="$t('common.add')"
            icon="pi pi-plus"
            class="p-button-success p-mr-2"
            v-on:click="add"
        />
      </template>
    </Toolbar>
    <!-- DataTable -->
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
               @row-select="select($event)"
               :filters="filters"
               filterDisplay="menu"
               :showFilterMatchModes="false"
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
              :sortable="true" style="width: 50%">
        <template #body="slotProps">
          <span>
            {{
              $i18n.locale === "kz" ? slotProps.data.nameKz : $i18n.locale === "ru"
                  ? slotProps.data.nameRu : slotProps.data.nameEn
            }}
          </span>
        </template>
      </Column>
      <!-- STATUS COLUMN -->
      <Column :field=" $i18n.locale === 'kz' ? `history.status.nameKz` :
                       $i18n.locale === 'ru' ? `history.status.nameRu` : `history.status.nameEn`"
              v-bind:header="$t('common.status')"
      >
        <template #body="slotProps">
          <span :class="'customer-badge status-' + slotProps.data.history.status.id">
            {{
              $i18n.locale === "kz"
                  ? slotProps.data.history.status.nameKz
                  : $i18n.locale === "ru"
                      ? slotProps.data.history.status.nameRu
                      : slotProps.data.history.status.nameEn
            }}
          </span>
        </template>
      </Column>
      <!-- BUTTON COLUMN -->
      <Column>
        <template #body="slotProps">
          <Button icon="pi pi-user" class="p-button-info" v-if="slotProps.data.candidateRelation" @click="apply(slotProps.data)"/>
        </template>
      </Column>
    </DataTable>
    <!--  ADD VACANCY SIDEBAR  -->
    <Sidebar v-model:visible="isView"
             position="right"
             class="p-sidebar-lg"
             style="overflow-y: scroll">
      <AddVacancy :model-value=vacancy :readonly="readonly"/>
    </Sidebar>
    <!--   VACANCY CANDIDATES VIEW SIDEBAR  -->
    <Sidebar v-model:visible="view.candidates"
             position="right"
             class="p-sidebar-lg"
             style="overflow-y: scroll">
      <VacancyCandidateView :candidates="vacancy.candidateRelation"/>
    </Sidebar>
  </div>
</template>

<script>

import {FilterMatchMode, FilterOperator} from "primevue/api";
import axios from "axios";
import {getHeader, smartEnuApi} from "@/config/config";
import AddVacancy from "./AddVacancy";
import VacancyCandidateView from "./VacancyCandidateView";

export default {
  name: "Vacancies",
  components: {VacancyCandidateView, AddVacancy},
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
      view: {
        candidates: false,
      },
      vacancies: [],
      vacancy: null,
      readonly: false,
      head: [],
      isView: false,
      count: 200,
      loading: false,
    }
  },
  mounted() {
    this.emitter.on('vacancyAdded', (data) => {
      if (data === true) {
        this.getVacancies();
      }
    });
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
      this.readonly = this.vacancy.history.status.id !== 1
      this.isView = true
      // this.$toast.add({severity: 'info', summary: 'Product Selected', detail: 'ID: ' + event.data.id, life: 3000});
    },
    add() {
      this.vacancy = {}
      this.readonly = false
      this.isView = true
    },
    /**
     * ***********************
     */
    getVacancies() {
      this.loading = true
      this.lazyParams.countMode = null;
      axios
          .post(smartEnuApi + "/vacancy/all", this.lazyParams, {
            headers: getHeader(),
          }).then((response) => {
        this.vacancies = response.data.vacancies;
        this.count = response.data.total;
        this.loading = false;
        console.log(this.vacancies)
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
     */
    apply(vacancy) {
      this.vacancy = vacancy
      this.view.candidates = true
    },
  },
  created() {
    this.getVacancies();
  },
}
</script>

<style lang="scss" scoped>
.customer-badge {
  border-radius: 2px;
  padding: 0.25em 0.5rem;
  text-transform: uppercase;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.3px;

  &.status-1 {
    background: #b3e5fc;
    color: #23547b;
  }

  &.status-2 {
    background: #eccfff;
    color: #694382;
  }

  &.status-3 {
    background: #feedaf;
    color: #8a5340;
  }

  &
  .status-4 {
    background: #ffcdd2;
    color: #c63737;
  }

  &.status-5 {
    background: #ffd8b2;
    color: #805b36;
  }

  &.status-6 {
    background: #feedaf;
    color: #8a5340;
  }

  &.status-7 {
    background: #c8e6c9;
    color: #256029;
  }


}
</style>