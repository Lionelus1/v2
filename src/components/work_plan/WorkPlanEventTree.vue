<template>
  <DataTable :lazy="true" :value="data" dataKey="work_plan_event_id"
             v-model:expandedRows="rows" @rowExpand="onRowExpand" @rowCollapse="onRowCollapse"
             class="p-datatable-customers" :rows="10" responsiveLayout="scroll">
    <template #empty> {{ $t('common.noData') }}</template>
    <template #loading> {{ $t('common.loading') }}</template>
    <Column :expander="true" headerStyle="width: 2rem" field="is_expandable">
      <template #body="{ data }">
        <div v-if="data.is_expandable">
          <button v-if="!data.isExpanded" class="p-row-toggler p-link" type="button" @click="expandTable(data)"><span
              class="p-row-toggler-icon pi pi-chevron-right"></span><span class="p-ink"
                                                                          style="height: 28px; width: 28px; top: 0.5px; left: 7px;"></span>
          </button>
          <button v-if="data.isExpanded" class="p-row-toggler p-link" type="button" @click="collapseTable(data)"><span
              class="p-row-toggler-icon pi pi-chevron-down"></span><span class="p-ink"
                                                                         style="height: 28px; width: 28px; top: 9.67188px; left: 5px;"></span>
          </button>
        </div>
      </template>
    </Column>
    <Column field="event_name" :header="$t('workPlan.eventName')" />
    <Column field="unit" :header="$t('common.unit')" v-if="plan && plan.is_oper">
      <template #body="{ data }">
        {{ data.unit }}
      </template>
    </Column>
    <Column field="plan_number" :header="$t('common.planNumber')" v-if="plan && plan.is_oper">
      <template #body="{ data }">
        {{ data.plan_number }}
      </template>
    </Column>
    <Column field="quarter" :header="$t('workPlan.quarter')">
      <template #body="{ data }">
        {{ data.quarter ? initQuarterString(data.quarter.String) : "" }}
      </template>
    </Column>
    <Column field="responsible_executor" :header="$t('workPlan.respExecutor')" v-if="plan && plan.is_oper">
      <template #body="{ data }">
        {{ data.responsible_executor }}
      </template>
    </Column>
    <Column field="fullName" :header="plan && plan.is_oper ? 'Свод/Подтверждение' : $t('workPlan.approvalUsers')">
      <template #body="{ data }">
        <p v-for="item in data.user" :key="item.id">{{ item.fullName }}</p>
      </template>
    </Column>
    <Column field="supporting_docs" v-if="plan && plan.is_oper" :header="$t('common.suppDocs')">
      <template #body="{ data }">
        {{ data.supporting_docs }}
      </template>
    </Column>
    <Column field="result" :header="plan && plan.is_oper ? $t('common.additionalInfo') : $t('common.result')">
      <template #body="{ data }">
        {{ data.result }}
      </template>
    </Column>
    <Column field="status" :header="$t('common.status')">
      <template #body="slotProps">
            <span
                :class="'customer-badge status-' + slotProps.data.status.work_plan_event_status_id">{{ $i18n.locale === "kz" ? slotProps.data.status.name_kz : $i18n.locale === "ru" ? slotProps.data.status.name_ru : slotProps.data.status.name_en }}</span>
      </template>
    </Column>
    <Column field="actions" header="">
      <template #body="slotProps">
        <work-plan-execute
            :data="slotProps.data"
            :planData="plan"
            v-if="isUserApproval(slotProps.data) && isPlanSentApproval && (slotProps.data.status.work_plan_event_status_id === 1 || slotProps.data.status.work_plan_event_status_id === 4 || slotProps.data.status.work_plan_event_status_id === 6)"></work-plan-execute>
        <work-plan-event-result-modal v-if="(slotProps.data.event_result && (plan && !plan.is_oper)) || slotProps.data.status.work_plan_event_status_id === 5 || slotProps.data.status.work_plan_event_status_id === 2"
                                      :event-result="slotProps.data.event_result"
                                      :eventData="slotProps.data"
                                      :plan-data="plan"></work-plan-event-result-modal>
        <work-plan-event-add v-if="!isPlanSentApproval && !slotProps.data.is_finish" :data="slotProps.data" :items="data" :plan-data="plan"></work-plan-event-add>
        <work-plan-event-edit-modal v-if="(slotProps.data.creator_id === loginedUserId || isPlanCreator) && !isPlanSentApproval && !slotProps.data.is_finish" :planData="plan" :event="slotProps.data"></work-plan-event-edit-modal>
        <div>
          <Button v-if="(slotProps.data.creator_id === loginedUserId || isPlanCreator) && !isPlanSentApproval && !slotProps.data.is_finish" @click="remove_event(slotProps.data.work_plan_event_id)" icon="pi pi-trash" class="p-button-danger p-ml-1 p-mt-1"></Button>
        </div>
      </template>
    </Column>
    <template #expansion="slotProps">
      <WorkPlanEventTree :plan-creator="isPlanCreator" :finish="isFinish" :approval-sent="isPlanSentApproval"
                         :child="slotProps.data.children" :plan="plan" v-if="slotProps.data.children" :expanded="slotProps.data.is_expanded"/>
    </template>
  </DataTable>
</template>

<script>
import WorkPlanEventAdd from "@/components/work_plan/WorkPlanEventAdd";
import WorkPlanExecute from "@/components/work_plan/WorkPlanExecute";
import WorkPlanEventResultModal from "@/components/work_plan/WorkPlanEventResultModal";
import axios from "axios";
import {getHeader, smartEnuApi} from "@/config/config";
import WorkPlanEventEditModal from "@/components/work_plan/WorkPlanEventEditModal";

export default {
  name: "WorkPlanEventTree",
  components: {WorkPlanEventResultModal, WorkPlanEventAdd, WorkPlanExecute, WorkPlanEventEditModal},
  props: ['child', 'planCreator', 'finish', 'approvalSent', 'plan', 'expanded'],
  data() {
    return {
      data: null,
      rows: [],
      currentQuarter: null,
      loginedUserId: JSON.parse(localStorage.getItem("loginedUser")).userID,
      isPlanCreator: this.planCreator,
      isFinish: false,
      isPlanSentApproval: this.approvalSent
    }
  },
  created() {
    if (this.child)
      this.data = this.child;
    this.isFinish = this.data.is_finish ?? this.data.is_finish;
    this.initQuarter();
  },
  mounted() {
    if (this.child)
      this.data = this.child;
    this.data.map(e => {
      e.isExpanded = false;
    });
  },
  methods: {
    onRowExpand(event) {
      this.$toast.add({severity: 'info', summary: 'Row Expanded', detail: event.data.event_name, life: 3000});
    },
    onRowCollapse(event) {
      this.$toast.add({severity: 'success', summary: 'Row Collapsed', detail: event.data.event_name, life: 3000});
    },
    expandTable(event) {
      if (this.rows && Array.isArray(this.rows)) {
        this.rows.map(e => {
          e.isExpanded = false;
        });
      }
      this.rows = this.data.filter(x => x.work_plan_event_id === event.work_plan_event_id)
      event.isExpanded = true;
    },
    collapseTable(event) {
      event.isExpanded = false;
      this.rows = null;
    },
    initQuarter() {
      let currentDate = new Date();
      let currentMonth = currentDate.getMonth() + 1;
      this.currentQuarter = Math.ceil(currentMonth / 3);
    },
    isUserApproval(data) {
      let userApproval = false;
      data.user.forEach(e => {
        if (e.id === this.loginedUserId) {
          userApproval = true;
        }
      });
      return this.plan && this.plan.is_oper ? userApproval && data.is_finish : userApproval && data.is_finish && !data.event_result;
    },
    initQuarterString(quarter) {
      let res = '';
      switch (quarter) {
        case "1":
          res = 'I';
          break;
        case "2":
          res = 'II';
          break;
        case "3":
          res = 'III';
          break;
        case "4":
          res = 'IV';
          break;
        case "5":
          res = this.$t('workPlan.quarterYear');
          break;
      }
      return res;
    },
    remove_event(event_id) {
      this.$confirm.require({
        message: this.$t('common.doYouWantDelete'),
        header: this.$t('common.delete'),
        icon: 'pi pi-info-circle',
        acceptClass: 'p-button-rounded p-button-success',
        rejectClass: 'p-button-rounded p-button-danger',
        accept: () => {
          this.remove(event_id);
        },
        reject: () => {
          //callback to execute when user rejects the action
        }
      });
    },
    remove(event_id) {
      axios.post(smartEnuApi + `/workPlan/removeEvent/${event_id}`, {}, {headers: getHeader()}).then(res => {
        if (res.data.is_success) {
          this.$toast.add({severity: 'success', summary: this.$t('common.success'), life: 3000});
          this.emitter.emit("workPlanChildEventIsDeleted", true);
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
    }
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
  display: inline-block;
  text-align: center;

  &.status-6 {
    background: #FFCDD2;
    color: #C63737;
  }

  &.status-5 {
    background: #f1c21b;
    color: #fff;
  }

  &.status-4 {
    background: #d9873e;
    color: #ffffff;
  }

  &.status-3 {
    background: #FFCDD2;
    color: #C63737;
  }

  &.status-2 {
    background: #C8E6C9;
    color: #256029;
  }

  &.status-1 {
    background: #B3E5FC;
    color: #23547B;
  }
}
</style>
