<template>
  <div class="col-12">
    <h3 v-if="plan"><TitleBlock :title="plan.work_plan_name" :show-back-button="true" /></h3>
    <div class="card" v-if="isPlanCreator">
      <WorkPlanReportModal :plan-id="this.work_plan_id" :plan="plan"></WorkPlanReportModal>
    </div>
    <div class="card">
      <DataTable :lazy="true" :loading="loading" :value="data" :rows="10" dataKey="id" :rowHover="true" responsiveLayout="scroll">
        <template #header>
          <div class="flex justify-content-between align-items-center">
            <h5 class="m-0">{{ $t('workPlan.reports') }}</h5>
          </div>
        </template>
        <template #empty> {{ $t('common.noData') }}</template>
        <Column field="content" :header="$t('workPlan.reportName')">
          <template #body="{ data }">
            <a href="javascript:void(0)" @click="navigate(data)">{{ data.report_name }}</a>
          </template>
        </Column>
        <Column field="department" :header="$t('common.department')">
          <template #body="{ data }">
            <span v-if="data.department"> {{
                $i18n.locale === "kz" ? data.department.nameKz : $i18n.locale === "ru" ? data.department.nameRu : data.department.nameEn
              }} </span>
          </template>
        </Column>
        <Column field="status" :header="$t('common.status')">
          <template #body="slotProps">
            <span
                :class="'customer-badge status-' + slotProps.data.status.work_plan_status_id">
              {{
                $i18n.locale === "kz" ? slotProps.data.status.name_kk : $i18n.locale === "ru" ? slotProps.data.status.name_ru : slotProps.data.status.name_en
              }}</span>
          </template>
        </Column>
        <Column :header="$t('common.type')">
          <template #body="{ data }">
            {{ initReportType(data.report_type, data.halfYearType) }}
          </template>
        </Column>
        <Column :header="$t('workPlan.quarter')">
          <template #body="{ data }">
            {{ initQuarter(data.quarter) }}
          </template>
        </Column>
        <Column :header="$t('common.comment')">
          <template #body="{ data }">
            <p v-if="data.reject_history"> {{ data.reject_history.message }} </p>
          </template>
        </Column>
        <Column :header="$t('faq.createDate')">
          <template #body="{ data }">
            <p v-if="data.created_date"> {{ formatDateMoment(data.created_date) }} </p>
          </template>
        </Column>
        <Column>
          <template #body="{ data }">
            <Button type="button" v-if="data.creator_id === loginedUserId && data.status.work_plan_status_id === 1"
                    icon="pi pi-trash" class="p-button-danger mr-2"
                    label="" @click="deleteConfirm(data)"></Button>
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
import moment from "moment/moment";
import {WorkPlanService} from "@/service/work.plan.service";

export default {
  name: "WorkPlanReport",
  components: {WorkPlanReportModal},
  data() {
    return {
      data: null,
      work_plan_id: null,
      plan: null,
      isPlanCreator: false,
      loginedUserId: JSON.parse(localStorage.getItem("loginedUser")).userID,
      loading: false,
      planService: new WorkPlanService()
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
      this.loading = true;
      this.planService.getWorkPlanReports(this.work_plan_id).then(res => {
        this.data = res.data
        this.loading = false;
      }).catch(error => {
        this.loading = false;
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
      this.planService.getPlanById(this.work_plan_id).then(res => {
        if (res.data) {
          this.plan = res.data;
          if (res.data.user.id === this.loginedUserId) {
            this.isPlanCreator = true;
          }
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
    navigate(data) {
      this.$router.push({
        name: 'WorkPlanReportView',
        params: {
          id: data.id,
          type: data.report_type,
          name: data.report_name,
          quarter: data.quarter,
          work_plan_id: data.work_plan_id,
          doc_id: data.doc_id,
          halfYearType: data.halfYearType,
          department_id: data.department_id,
          respUserId: data.respUserId
        }
      });
      //this.$router.push({name: 'WorkPlanReportView', params: {id: data.id}});
    },
    deleteConfirm(event) {
      this.$confirm.require({
        message: this.$t('common.doYouWantDelete'),
        header: this.$t('common.delete'),
        icon: 'pi pi-info-circle',
        acceptClass: 'p-button-rounded p-button-success',
        rejectClass: 'p-button-rounded p-button-danger',
        accept: () => {
          this.delete(event);
        },
      });
    },
    delete(event) {
      //console.log(event)
      this.planService.deletePlanReport(event.id).then(response => {
        if (response.data.is_success) {
          this.$toast.add({
            severity: "success",
            summary: this.$t('common.success'),
            life: 3000,
          });
          this.getReports();
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
    formatDateMoment(date) {
      return moment(new Date(date)).utc().format("DD.MM.YYYY HH:mm:ss")
    },
    initReportType(type, halfYearType) {
      let result = "";
      switch (type) {
        case 1:
          result = this.$t('workPlan.reportTypes.year');
          break;
        case 2:
          result = this.$t('workPlan.reportTypes.quarter');
          break;
        case 3:
          result = `${halfYearType} ${this.$t('workPlan.halfYear')}`;
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
          res = this.$t('workPlan.quarterYear');
          break;
      }
      return res;
    },
  }
}
</script>

<style scoped lang="scss">
</style>