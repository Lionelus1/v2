<template>
  <div class="card">
    <!-- ОСНОВНАЯ ТАБЛИЦА ДАННЫХ -->
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
               :loading="loading"
               filterDisplay="menu"
               :showFilterMatchModes="false"
               responsiveLayout="scroll"
               @sort="onSort($event)">
      <!--  HEADER -->
      <template #header>
        <div class="table-header flex flex-column md:flex-row justify-content-between">
          <h4 class="mb-2 md:m-0 p-as-md-center">{{ $t("hr.vacancies") }}</h4>
          <span class="p-input-icon-left">
            <InputText type="search"
                       v-model="lazyParams.searchText"
                       :placeholder="$t('common.search')"
                       @keyup.enter="getVacancies"
                       @click="clearData"/>
              <Button icon="pi pi-search" class="ml-1" @click="getVacancies"/>
          </span>
        </div>
      </template>
      <!-- EMPTY -->
      <template #empty> {{ $t('common.noData') }}</template>
      <!-- ON LOADING -->
      <template #loading> {{ $t('common.loading') }}</template>
      <Column>
        <template #body="slotProps">
          <Button icon="pi pi-users"
                  class="p-button-info"
                  v-if="slotProps.data.candidateRelation && view.modifier"
                  @click="apply(slotProps.data)"/>
        </template>
      </Column>
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
      <Column field="date"
              v-bind:header="$t('common.date')"
              :sortable="false">
        <template #body="slotProps">
          <span>
            {{
              new Date(slotProps.data.history.modifyDate).toLocaleDateString()
            }}
          </span>
        </template>
      </Column>
      <!-- BUTTON COLUMN -->
      <Column>
        <template #body="slotProps">
          <Button v-if="view.modifier"
                  icon="pi pi-times"
                  class="p-button-danger"
                  @click="openDelete(slotProps.data)"/>
        </template>
      </Column>
    </DataTable>
    <!--  БОКОВАЯ ПАНЕЛЬ ДОБАВЛЕНИЯ И РЕДАКТИРОВАНИЯ ДАННЫХ  -->
    <Sidebar v-model:visible="isView"
             position="right"
             class="p-sidebar-lg"
             style="overflow-y: scroll">
      <AddVacancy :model-value=vacancy :readonly="readonly"/>
    </Sidebar>
    <!--  ПРОСМОТР КАНДИДАТОВ  -->
    <Sidebar v-model:visible="view.candidates"
             position="right"
             class="p-sidebar-lg"
             style="overflow-y: scroll">
      <VacancyCandidateView :candidates="vacancy.candidateRelation" :vacancy="vacancy"/>
    </Sidebar>
    <!--  ДИАЛОГОВОК ОКНО ДЛЯ УДАЛЕНИЯ ЗАПИСИ В ТАБЛИЦЕ  -->
    <Dialog
        v-model:visible="view.delete"
        :style="{ width: '450px' }"
        :modal="true"
        :closable="false"
    >
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem"/>
        <span v-if="vacancy"
        >{{ $t("common.doYouWantDelete") }}?
        </span>
      </div>
      <template #footer>
        <Button
            :label="$t('common.yes')"
            icon="pi pi-check"
            class="p-button p-component p-button-success mr-2"
            @click="deleteVacancy(vacancy.id)"
        />
        <Button
            :label="$t('common.no')"
            icon="pi pi-times"
            class="p-button p-component p-button-danger mr-2"
            @click="closeDelete"
        />
      </template>
    </Dialog>
  </div>
</template>

<script>

import {FilterMatchMode, FilterOperator} from "primevue/api";
import api from "@/service/api";
import {getHeader, smartEnuApi} from "@/config/config";
import AddVacancy from "./AddVacancy";
import VacancyCandidateView from "./VacancyCandidateView";
import VacancyService, {RIGHTS} from "./VacancyService";

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
        sortOrder: 0,
        right: null,
        isDeleted: true,
      },
      view: {
        candidates: false,
        delete: false,
        modifier: false,
      },
      vacancies: [],
      vacancy: null,
      readonly: false,
      head: [],
      isView: false,
      count: 200,
      loading: false,
      isCareerAdmin: false,
      report: {
        startDate: null,
        endDate: null,
      },
      reportValidation: {
        startDate: false,
        endDate: false,
      },
      reportResponse: null
    }
  },
  mounted() {
    this.emitter.on('vacancyAdded', (data) => {
      if (data === true) {
        this.isView = false
        this.getVacancies();
      }
    });
    this.emitter.on('updateForm', (data) => {
      if (data === true) {
        this.view.candidates = false
        this.getVacancies();
      }
    });
  },
  methods: {
    toggle(event) {
      this.$refs.op.toggle(event);
    },
    openDelete(data) {
      this.vacancy = data
      this.view.delete = true
    },
    closeDelete() {
      this.vacancy = null
      this.view.delete = false
    },
    deleteVacancy(id) {
      this.vacancyService.deleteVacancy(id).then(response => {
        this.view.delete = false
        this.vacancy = null
        this.getVacancies()
      }).catch(error => {
        this.$toast.add({
          severity: "error",
          summary: error,
          life: 3000,
        });
      });
    },
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
      this.vacancy = {}
      this.vacancy = event.data
      this.readonly = this.vacancy.history.status.id !== 1
      this.isView = true
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
      this.vacancyService.getVacancies(this.lazyParams).then((response) => {
        this.vacancies = response.data.vacancies;
        this.count = response.data.total;
        this.loading = false;
        console.log(response.data)
      }).catch((error) => {
        if (error.response.status == 401) {
          this.$store.dispatch("logLout");
        }
        this.$toast.add({
          severity: "error",
          summary: error,
          life: 3000,
        });
        this.loading = false;
      });
    },

    /**
     * rights validation
     */

    rightsValidation() {
      this.vacancyService.rightsValidity().then((response) => {
        if (response.data === RIGHTS.MAIN_ADMINISTRATOR) {
          this.lazyParams.right = RIGHTS.MAIN_ADMINISTRATOR
          this.isCareerAdmin = true
          this.getVacancies()
          this.view.modifier = true
        } else if (response.data === RIGHTS.HR_ADMINISTRATOR) {
          this.lazyParams.right = RIGHTS.HR_ADMINISTRATOR
          this.getVacancies()
          this.view.modifier = true
        } else if (response.data === RIGHTS.HR_MODERATOR) {
          this.lazyParams.right = RIGHTS.HR_MODERATOR
          this.getVacancies()
          this.view.modifier = true
        } else if (response.data === RIGHTS.CAREER_ADMINISTRATOR) {
          this.lazyParams.right = RIGHTS.CAREER_ADMINISTRATOR
          this.isCareerAdmin = true
          this.getVacancies()
          this.view.modifier = true
        } else if (response.data === RIGHTS.CAREER_MODERATOR) {
          this.lazyParams.right = RIGHTS.CAREER_MODERATOR
          this.getVacancies()
          this.view.modifier = true
        } else if (response.data === RIGHTS.INITIAL_APPROVE) {
          this.lazyParams.right = RIGHTS.INITIAL_APPROVE
          this.getVacancies()
        } else if (response.data === RIGHTS.FINAL_APPROVE) {
          this.lazyParams.right = RIGHTS.FINAL_APPROVE
          this.getVacancies()
        } else {
          this.loading = false
        }
      }).catch((error) => {
        if (error.response.status == 401) {
          this.$store.dispatch("logLout");
        }
        this.$toast.add({
          severity: "error",
          summary: error,
          life: 3000,
        });
      });
    },

    /**
     * ***********************
     */
    apply(vacancy) {
      this.vacancy = vacancy
      this.view.candidates = true
    },
    generateReport() {
      if (this.validateReport()) {
        api.post(
            '/vacancy/report',
            this.report,
            {responseType: "blob", headers: getHeader()},
        ).then(response => {
          console.log(response)
          this.reportResponse = response
        }).catch(error => {
          this.$toast.add({
            severity: "error",
            summary: error,
            life: 3000,
          });
        })
      }

    },
    downloadReport() {
      var blob = new Blob([this.reportResponse.data]);
      var downloadElement = document.createElement("a");
      var href = window.URL.createObjectURL(blob)
      downloadElement.href = href;
      downloadElement.download = "Report_between_" +
          new Date(this.report.startDate).toLocaleDateString() +
          "_and_" + new Date(this.report.endDate).toLocaleDateString() + ".xlsx"
      document.body.appendChild(downloadElement)
      downloadElement.click()
      document.body.removeChild(downloadElement)
      window.URL.revokeObjectURL(href);
      this.reportResponse = null
      this.report.startDate = null
      this.report.endDate = null
      this.$refs.op.hide();
    },
    validateReport() {
      this.reportValidation.startDate = !this.report.startDate || this.report.startDate === ""
      this.reportValidation.endDate = !this.report.endDate || this.report.endDate === ""
      return (!this.reportValidation.startDate && !this.reportValidation.endDate)
    }
  },
  created() {
    this.vacancyService = new VacancyService()
    this.rightsValidation()
  },
}
</script>

<style lang="scss" scoped>
.customer-badge {
  &.status-3 {
    background: #feedaf;
    color: #8a5340;
  }

  &.status-5 {
    background: #ffd8b2;
    color: #805b36;
  }

}
</style>
