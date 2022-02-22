<template>
  <div class="p-col-12">
    <div class="card" v-if="isPlanCreator">
      <WorkPlanReportModal :plan-id="this.work_plan_id" :plan="plan"></WorkPlanReportModal>
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
        <Column field="status" header="Статус">
          <template #body="slotProps">
            <span
                :class="'customer-badge status-' + slotProps.data.status.work_plan_status_id">{{
                slotProps.data.status.name_ru
              }}</span>
          </template>
        </Column>
        <Column header="Тип">
          <template #body="{ data }">
            {{ initReportType(data.report_type) }}
          </template>
        </Column>
        <Column header="Квартал">
          <template #body="{ data }">
            {{ initQuarter(data.quarter) }}
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
      plan: null,
      isPlanCreator: false,
      loginedUserId: 0
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
    this.loginedUserId = JSON.parse(localStorage.getItem("loginedUser")).userID;
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
      this.loading = true;
      axios.get(smartEnuApi + `/workPlan/getWorkPlanById/${this.work_plan_id}`, {headers: getHeader()})
          .then(res => {
            if (res.data) {
              this.plan = res.data;
              if (res.data.user.id === this.loginedUserId) {
                this.isPlanCreator = true;
              }
            }
            this.loading = false;
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
      console.log(data)
      this.$router.push({
        name: 'WorkPlanReportView',
        params: {
          id: data.id,
          type: data.report_type,
          name: data.report_name,
          quarter: data.quarter,
          work_plan_id: data.work_plan_id,
          doc_id: data.doc_id
        }
      });
      //this.$router.push({name: 'WorkPlanReportView', params: {id: data.id}});
    },
    initReportType(type) {
      let result = "";
      switch (type) {
        case 1:
          result = "Годовой"
          break;
        case 2:
          result = "Квартальный"
          break;
      }
      return result;
    },
    initQuarter(quarter) {
      let res = '';
      switch (quarter) {
        case 1:
          res = 'I';
          break;
        case 2:
          res = 'II';
          break;
        case 3:
          res = 'III';
          break;
        case 4:
          res = 'IV';
          break;
        case 5:
          res = 'Весь год';
          break;
      }
      return res;
    },
  }
}
</script>

<style scoped lang="scss">
.customer-badge {
  border-radius: 2px;
  padding: .25em .5rem;
  text-transform: uppercase;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: .3px;

  &.status-3 {
    background: #C8E6C9;
    color: #256029;
  }

  &.status-2 {
    background: #FFCDD2;
    color: #C63737;
  }

  &.status-4 {
    background: #FEEDAF;
    color: #8A5340;
  }

  &.status-1 {
    background: #B3E5FC;
    color: #23547B;
  }
}
</style>