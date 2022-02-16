<template>
  <div class="p-col-12">
    <div class="card">
      <WorkPlanReportModal v-if="plan" :plan-id="this.work_plan_id" :plan="plan"></WorkPlanReportModal>
    </div>
    <div class="card">
      <DataTable :lazy="true" :value="data" :rows="10" dataKey="id" :rowHover="true" responsiveLayout="scroll">
        <template #header>
          <div class="p-d-flex p-jc-between p-ai-center">
            <h5 class="p-m-0">Отчеты</h5>
          </div>
        </template>
        <template #empty> {{ $t('common.noData') }}</template>
        <Column field="content" header="Название отчета">
          <template #body="{ data }">
            <a href="javascript:void(0)" @click="navigate(data)">{{ data.report_name }}</a>
          </template>
        </Column>
        <Column field="content" header="Тип">
          <template #body="{ data }">
            {{ data.report_type }}
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<script>
import WorkPlanReportModal from "@/components/work_plan/WorkPlanReportModal";
import axios from "axios";
import {getHeader, smartEnuApi} from "@/config/config";
export default {
  name: "WorkPlanReport",
  components: {WorkPlanReportModal},
  data() {
    return {
      data: null,
      work_plan_id: null,
      plan: null
    }
  },
  mounted() {
    this.emitter.on("isReportCreated", (data) => {
      if (data) {
        // get all reports
        this.getReports();
      }
    });
  },
  created() {
    this.work_plan_id = this.$route.params.id;
    this.getPlan();
    this.getReports();
  },
  methods: {
    getReports() {
      axios.get(smartEnuApi + `/workPlan/getWorkPlanReports/${this.work_plan_id}`, {headers: getHeader()})
      .then(res => {
        this.data = res.data
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
    getPlan() {
      axios.get(smartEnuApi + `/workPlan/getWorkPlanById/${this.work_plan_id}`, {headers: getHeader()})
          .then(res => {
            this.plan = res.data;
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
        this.loading = false;
      });
    },
    navigate(data) {
      this.$router.push({ name: 'WorkPlanReportView',
        params: {
          id: data.id,
          type: data.report_type,
          name: data.report_name,
          quarter: data.quarter,
          work_plan_id: data.work_plan_id,
          doc_id: data.doc_id
      }});
      //this.$router.push({name: 'WorkPlanReportView', params: {id: data.id}});
    }
  }
}
</script>

<style scoped>

</style>