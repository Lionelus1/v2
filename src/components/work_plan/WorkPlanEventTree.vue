<template>
  <DataTable :lazy="true" :value="data" dataKey="work_plan_event_id"
             v-model:expandedRows="rows" @rowExpand="onRowExpand" @rowCollapse="onRowCollapse"
             class="p-datatable-customers" :rows="10" responsiveLayout="scroll">
    <template #empty> {{ $t('common.noData') }}</template>
    <template #loading> {{ $t('common.loading') }}</template>
    <Column :expander="true" headerStyle="width: 2rem" field="is_expandable">
      <template #body="{ data }">
        <div v-if="data.is_expandable">
          <button v-if="!isExpanded" class="p-row-toggler p-link" type="button" @click="expandTable(data)"><span
              class="p-row-toggler-icon pi pi-chevron-right"></span><span class="p-ink"
                                                                          style="height: 28px; width: 28px; top: 0.5px; left: 7px;"></span>
          </button>
          <button v-if="isExpanded" class="p-row-toggler p-link" type="button" @click="collapseTable(data)"><span
              class="p-row-toggler-icon pi pi-chevron-down"></span><span class="p-ink"
                                                                         style="height: 28px; width: 28px; top: 9.67188px; left: 5px;"></span>
          </button>
        </div>
      </template>
    </Column>
    <Column field="event_name" header="Название мероприятия" />
    <Column field="quarter" header="Квартал">
      <template #body="{ data }">
        {{ data.quarter ? initQuarterString(data.quarter.String) : "" }}
      </template>
    </Column>
    <Column field="fullName" header="Ответственные лица">
      <template #body="{ data }">
        <p v-for="item in data.user" :key="item.id">{{ item.fullName }}</p>
      </template>
    </Column>
    <Column field="result" header="Результат" />
    <Column field="status" header="Статус">
      <template #body="slotProps">
            <span
                :class="'customer-badge status-' + slotProps.data.status.work_plan_event_status_id">{{ slotProps.data.status.name_ru }}</span>
      </template>
    </Column>
    <Column field="actions" header="Действия">
      <template #body="slotProps">
        <work-plan-execute :data="slotProps.data" v-if="parseInt(slotProps.data.quarter.String) === currentQuarter && isUserApproval(slotProps.data)"></work-plan-execute>
        <work-plan-event-result-modal v-if="slotProps.data.event_result" :event-result="slotProps.data.event_result"></work-plan-event-result-modal>
        <work-plan-event-add v-if="!slotProps.data.is_finish" :data="slotProps.data"></work-plan-event-add>
        <work-plan-event-edit-modal v-if="isPlanCreator && !isPlanSentApproval && !isFinish" :event="slotProps.data"></work-plan-event-edit-modal>
        <div>
          <Button v-if="isPlanCreator && !isPlanSentApproval && !isFinish" @click="remove_event(slotProps.data.work_plan_event_id)" icon="pi pi-trash" class="p-button-danger p-ml-1 p-mt-1"></Button>
        </div>
      </template>
    </Column>
    <template #expansion="slotProps">
      <WorkPlanEventTree :child="slotProps.data.children" />
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
  props: ['child', 'planCreator', 'finish', 'approvalSent'],
  data() {
    return {
      data: null,
      rows: [],
      isExpanded: false,
      currentQuarter: null,
      loginedUserId: 0,
      isPlanCreator: this.planCreator,
      isFinish: this.isFinish,
      isPlanSentApproval: this.approvalSent
    }
  },
  created() {
    if (this.child)
      this.data = this.child;
    this.initQuarter();
    this.loginedUserId = JSON.parse(localStorage.getItem("loginedUser")).userID;
  },
  mounted() {
    if (this.child)
      this.data = this.child;
  },
  methods: {
    onRowExpand(event) {
      this.$toast.add({severity: 'info', summary: 'Row Expanded', detail: event.data.event_name, life: 3000});
    },
    onRowCollapse(event) {
      this.$toast.add({severity: 'success', summary: 'Row Collapsed', detail: event.data.event_name, life: 3000});
    },
    expandTable(event) {
      this.isExpanded = true;
      this.rows = this.data.filter(x => x.work_plan_event_id === event.work_plan_event_id)
    },
    collapseTable(event) {
      this.isExpanded = false;
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
      return userApproval && data.is_finish && !data.event_result;
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
          res = 'Весь год';
          break;
      }
      return res;
    },
    remove_event(event_id) {
      this.$confirm.require({
        message: 'Вы точно хотите удалить?',
        header: 'Удаление',
        icon: 'pi pi-info-circle',
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
          this.$toast.add({severity: 'success', summary: 'Успешно', life: 3000});
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
