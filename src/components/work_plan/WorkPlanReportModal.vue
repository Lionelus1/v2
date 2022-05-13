<template>
  <Button
      type="button"
      icon="pi pi-document"
      class="p-button p-button-info p-ml-2"
      :label="$t('workPlan.createReport')"
      @click="openModal"
  ></Button>

  <Dialog :header="$t('workPlan.reports')" v-model:visible="selectQuarterModal" :style="{width: '450px'}"
          class="p-fluid">
    <div class="p-field">
      <label>{{ $t('workPlan.reportName') }}</label>
      <InputText v-model="report_name" />
    </div>
    <div class="p-field">
      <label>{{ $t('common.type') }}</label>
      <Dropdown v-model="type" :options="reportTypes" optionLabel="name" optionValue="id" :placeholder="$t('common.select')"
                @select="selectReportType"/>
    </div>
    <div class="p-field" v-if="type === 2">
      <label>{{ $t('workPlan.quarter') }}</label>
      <Dropdown v-model="quarter" :options="reportQuarters" optionLabel="name" optionValue="id" :placeholder="$t('common.select')" />
    </div>
    <div class="p-field" v-if="type === 3">
      <label>{{ $t('workPlan.reportTypes.halfYear') }}</label>
      <Dropdown v-model="selectedHalfYear" :options="halfYearTypes" optionLabel="name" optionValue="id" :placeholder="$t('common.select')" />
    </div>
    <div class="p-field" v-if="plan && plan.is_oper">
      <label>Департамент</label>
      <Dropdown v-model="selectedDepartment" :options="departments" optionLabel="department_name" optionValue="department_id" :placeholder="$t('common.select')" />
    </div>
    <template #footer>
      <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button-rounded p-button-danger"
              @click="closeModal"/>
      <Button label="Ок" icon="pi pi-check" class="p-button-rounded p-button-success p-mr-2"
              @click="create"/>
    </template>
  </Dialog>
</template>

<script>
import axios from "axios";
import {getHeader, smartEnuApi} from "@/config/config";

export default {
  name: "WorkPlanReportModal",
  props: ['planId', 'plan'],
  data() {
    return {
      selectQuarterModal: false,
      quarter: null,
      type: null,
      work_plan_id: this.planId,
      report_name: this.plan.work_plan_name,
      reportTypes: [
        {
          id: 1,
          name: this.$t('workPlan.reportTypes.year')
        },
        {
          id: 2,
          name: this.$t('workPlan.reportTypes.quarter')
        },
      ],
      reportQuarters: [
        {
          id: 1,
          name: 'I'
        },
        {
          id: 2,
          name: 'II'
        },
        {
          id: 3,
          name: 'III'
        },
        {
          id: 4,
          name: 'IV'
        }
      ],
      isPdf: false,
      selectedDepartment: null,
      selectedHalfYear: null,
      halfYearTypes: [
        {
          id: 1,
          name: 1
        },
        {
          id: 2,
          name: 2
        }
      ],
      departments: []
    }
  },
  mounted() {
    if (this.plan.is_oper) {
      this.reportTypes.push({
        id: 3,
        name: this.$t('workPlan.reportTypes.halfYear')
      });
      this.getDepartments();
    }
  },
  methods: {
    selectReportType() {
      /*if (this.type === 1) {

      } else if (this.type === 2) {

      }*/
    },
    getDepartments() {
      this.departments = [];
      axios.post(smartEnuApi + `/workPlan/getDepartments`, {work_plan_id: parseInt(this.work_plan_id)}, {headers: getHeader()})
      .then(res => {
        if (res.data) {
          this.departments = res.data
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
    create() {
      //this.$router.push({ name: 'WorkPlanReportView', params: { id: this.work_plan_id, type: this.type, name: this.report_name, quarter: this.quarter }})
      axios.post(smartEnuApi + `/workPlan/createReport`, {
        work_plan_id: parseInt(this.work_plan_id),
        report_name: this.report_name,
        report_type: this.type,
        quarter: this.type === 2 ? this.quarter : null,
        halfYearType: this.type === 3 ? this.selectedHalfYear : null,
        department_id: this.selectedDepartment ? this.selectedDepartment : null
      }, {headers: getHeader()}).then(res => {
        this.emitter.emit("isReportCreated", true);
        this.closeModal();
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
      })
    },
    openModal() {
      this.selectQuarterModal = true;
    },
    closeModal() {
      this.selectQuarterModal = false;
      this.quarter = null;
      this.type = null;
    }
  }
}
</script>

<style scoped>

</style>
