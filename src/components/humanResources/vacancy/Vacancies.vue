<template>
  <div class="card">
    <Toolbar class="mb-4">
      <template #start>
        <Button
            v-if="view.modifier"
            :label="$t('common.add')"
            icon="pi pi-plus"
            class="p-button-success mr-2"
            v-on:click="add"
        />
      </template>
      <template #end>
        <Button
            v-if="view.modifier && isCareerAdmin"
            :label="$t('hr.report.title')"
            icon="pi pi-list"
            class="p-button-secondary mr-2"
            @click="toggle"
            aria:haspopup="true" aria-controls="overlay_panel"
        />
        <OverlayPanel ref="op" appendTo="body"
                      :showCloseIcon="true"
                      id="overlay_panel"
                      style="width: 450px"
                      :breakpoints="{'960px': '75vw'}">
          <div class="col-12 md:col-12 p-fluid">
            <div class="card">
              <div class="field">
                <label>{{ $t('common.startDate') }}</label>
                <PrimeCalendar
                    class="mt-2"
                    :class="{'p-invalid': reportValidation.startDate}"
                    v-model="report.startDate"
                    :placeholder="$t('common.startDate')"
                    dateFormat="dd.mm.yy"/>
              </div>
              <div class="field">
                <label>{{ $t('common.endDate') }}</label>
                <PrimeCalendar
                    class="mt-2"
                    :class="{'p-invalid': reportValidation.endDate}"
                    v-model="report.endDate"
                    :placeholder="$t('common.endDate')"
                    dateFormat="dd.mm.yy"/>
              </div>
              <div class="field">
                <div v-if="reportResponse" class="field">
                  <Message :closable="false" severity="success">{{ $t('hr.report.success') }}</Message>
                </div>
              </div>
              <div class="field">
                <Button :label="$t('common.createReport')"
                        icon="pi pi-history"
                        :onclick="generateReport"/>
              </div>
              <div class="field">
                <Button :label="$t('common.download')"
                        :disabled="!reportResponse"
                        icon="pi pi-history"
                        class="p-button-warning"
                        :onclick="downloadReport"/>
              </div>
            </div>
          </div>
        </OverlayPanel>
      </template>
    </Toolbar>
    <TabView>
      <TabPanel :header="$t('hr.vacancies')">
        <ActualVacancies @select="select"/>
      </TabPanel>
      <TabPanel :header="$t('hr.archiveVacancies')">
        <ArchiveVacancies @select="select"/>
      </TabPanel>
    </TabView>

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
import ActualVacancies from "@/components/humanResources/vacancy/ActualVacancies.vue";
import ArchiveVacancies from "@/components/humanResources/vacancy/ArchiveVacancies.vue";

export default {
  name: "Vacancies",
  components: {
    ActualVacancies,
    ArchiveVacancies,
    AddVacancy},
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
        right: null
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
      }).catch(_ => {
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
      }).catch(() => {
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
      }).catch((_) => {
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
          this.reportResponse = response
        });
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

  &.status-4 {
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
