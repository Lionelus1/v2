<template>
  <div class="p-col-12" v-if="!loading">
    <Message severity="warn" :closable="false" v-if="plan.comment && isRejected && isPlanCreator">{{ plan.comment }}</Message>
    <div class="card" v-if="plan || data">
      <work-plan-event-add v-if="(isCreator || isEventsNull) && !isFinish && isPlanCreator" :isMain="true"></work-plan-event-add>
      <Button v-if="isPlanCreator && !isFinish" :label="$t('common.complete')" icon="pi pi-check" @click="finish"
              class="p-button p-button-danger p-ml-2"/>
      <work-plan-approve v-if="isPlanCreator && !isPlanSentApproval && isFinish" :plan="plan"
                         :events="data"></work-plan-approve>
      <Button v-if="isFinish && (isApproval || isPlanCreator) && isPlanSentApproval" :label="$t('workPlan.viewPlan')"
              icon="pi pi-eye" @click="viewDoc"
              class="p-button p-button-info p-ml-2"/>
      <Button v-if="isFinish && (isApproval || isPlanCreator) && isPlanSentApproval" :label="$t('workPlan.reports')"
              @click="navigateToReports" class="p-button p-button-info p-ml-2"/>
      <!--      <WorkPlanReportModal v-if="isFinish && (isApproval || isPlanCreator) && isPlanSentApproval" :planId="work_plan_id"
                                 :plan="plan"></WorkPlanReportModal>-->
    </div>
    <div class="card">
      <DataTable :value="data" dataKey="work_plan_event_id"
                 v-model:expandedRows="rows" @rowExpand="onRowExpand" @rowCollapse="onRowCollapse"
                 :loading="loading" responsiveLayout="scroll">
        <template #header>
          <div class="p-d-flex p-jc-between p-ai-center">
            <h5 class="p-m-0">{{ $t('workPlan.events') }} |
              <router-link tag="a" to="/work-plan">{{ $t('workPlan.plans') }}</router-link>
            </h5>
            <!--            <span class="p-input-icon-left">
                          <i class="pi pi-search"/>
                          <InputText type="search" v-model="searchText" :placeholder="$t('common.search')"/>
                          <Button icon="pi pi-search" class="p-ml-1" @click="getWorkPlanEvents"/>
                        </span>-->
          </div>
        </template>
        <template #empty> {{ $t('common.noData') }}</template>
        <template #loading> {{ $t('common.loading') }}</template>
        <Column ref="expander" :expander="true" headerStyle="width: 2rem" field="is_expandable">
          <template #body="{ data }">
            <div v-if="data.is_expandable">
              <button v-if="!data.isExpanded" class="p-row-toggler p-link" type="button"
                      @click="expandTable(data)"><span
                  class="p-row-toggler-icon pi pi-chevron-right"></span><span class="p-ink"></span>
              </button>
              <button v-if="data.isExpanded" class="p-row-toggler p-link" type="button"
                      @click="collapseTable(data)"><span
                  class="p-row-toggler-icon pi pi-chevron-down"></span><span class="p-ink"></span>
              </button>
            </div>
          </template>
        </Column>
        <Column field="event_name" :header="$t('workPlan.eventName')">
          <template #body="{ data }">
            {{ data.event_name }}
          </template>
        </Column>
        <Column field="quarter" :header="$t('workPlan.quarter')">
          <template #body="{ data }">
            {{ data.quarter ? initQuarterString(data.quarter.String) : "" }}
          </template>
        </Column>
        <Column field="fullName" :header="$t('workPlan.approvalUsers')">
          <template #body="{ data }">
            <p v-for="item in data.user" :key="item.id">{{ item.fullName }}</p>
          </template>
        </Column>
        <Column field="result" :header="$t('common.result')">
          <template #body="{ data }">
            {{ data.result }}
          </template>
        </Column>
        <Column field="status" :header="$t('common.status')">
          <template #body="slotProps">
            <span
                :class="'customer-badge status-' + slotProps.data.status.work_plan_event_status_id">{{
                $i18n.locale === "kz" ? slotProps.data.status.name_kz : $i18n.locale === "ru" ? slotProps.data.status.name_ru : slotProps.data.status.name_en
              }}</span>
          </template>
        </Column>

        <Column field="actions" header="">
          <template #body="slotProps">
            <div>
              <work-plan-execute
                  v-if="parseInt(slotProps.data.quarter.String) === currentQuarter && isUserApproval(slotProps.data) && isPlanSentApproval"
                  :data="slotProps.data"></work-plan-execute>
              <work-plan-event-result-modal v-if="slotProps.data.event_result"
                                            :event-result="slotProps.data.event_result"></work-plan-event-result-modal>
              <work-plan-event-add v-if="!slotProps.data.is_finish" :data="slotProps.data" :isMain="false"></work-plan-event-add>
              <work-plan-event-edit-modal v-if="isPlanCreator && !isPlanSentApproval && !isFinish"
                                          :event="slotProps.data"></work-plan-event-edit-modal>
              <div>
                <Button v-if="isPlanCreator && !isPlanSentApproval && !isFinish"
                        @click="remove_event(slotProps.data.work_plan_event_id)" icon="pi pi-trash"
                        class="p-button-danger p-ml-1 p-mt-1" label=""></Button>
              </div>
            </div>
          </template>
        </Column>
        <template #expansion="slotProps">
          <WorkPlanEventTree :plan-creator="isPlanCreator" :finish="isFinish" :approval-sent="isPlanSentApproval"
                             :child="slotProps.data.children" v-if="slotProps.data.children"/>
        </template>
      </DataTable>
    </div>
  </div>
</template>

<script>
import WorkPlanEventAdd from "@/components/work_plan/WorkPlanEventAdd";
import axios from "axios";
import {getHeader, smartEnuApi} from "@/config/config";
import WorkPlanEventTree from "@/components/work_plan/WorkPlanEventTree";
import WorkPlanApprove from "@/components/work_plan/WorkPlanApprove";
import WorkPlanExecute from "@/components/work_plan/WorkPlanExecute";
import WorkPlanReportModal from "@/components/work_plan/WorkPlanReportModal";
import WorkPlanEventResultModal from "@/components/work_plan/WorkPlanEventResultModal";
import WorkPlanEventEditModal from "@/components/work_plan/WorkPlanEventEditModal";

export default {
  components: {
    WorkPlanEventEditModal,
    WorkPlanApprove,
    WorkPlanEventTree,
    WorkPlanEventAdd,
    WorkPlanExecute,
    WorkPlanEventResultModal
  },
  data() {
    return {
      data: null,
      work_plan_id: null,
      searchText: null,
      rows: [],
      lastEvent: null,
      quarters: [
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
        },
        {
          id: 5,
          name: 'Весь квартал'
        }
      ],
      quarter: null,
      loading: true,
      isCreator: false,
      isPlanCreator: false,
      plan: null,
      loginedUserId: 0,
      rejectComment: "",
      showRejectPlan: false,
      approval_users: null,
      isApproval: false,
      isPlanSentApproval: false,
      isRejected: false,
      isFinish: false,
      isEventsNull: false,
      currentQuarter: null,
    }
  },
  mounted() {
    this.emitter.on('workPlanEventIsAdded', (data) => {
      if (data === true) {
        this.getWorkPlanEvents();
      }
    });
    this.emitter.on('planRejected', (data) => {
      if (data === true) {
        this.getPlan();
        this.getWorkPlanEvents();
      }
    });
    this.emitter.on('planSentToApprove', (data) => {
      if (data) {
        this.getPlan();
        this.getWorkPlanEvents();
      }
    })
    this.emitter.on('workPlanEventIsCompleted', (data) => {
      if (data) {
        this.getPlan();
        this.getWorkPlanEvents();
      }
    })
    this.emitter.on('workPlanChildEventIsDeleted', (data) => {
      if (data) {
        this.getPlan();
        this.initQuarter();
        this.getWorkPlanEvents();
      }
    });
    this.emitter.on('planEventChanged', (data) => {
      if (data) {
        this.getPlan();
        this.initQuarter();
        this.getWorkPlanEvents();
      }
    });
  },
  created() {
    this.work_plan_id = this.$route.params.id
    this.loginedUserId = JSON.parse(localStorage.getItem("loginedUser")).userID;
    this.getPlan();
    this.initQuarter();
    this.getWorkPlanEvents();
  },
  methods: {
    getWorkPlanEvents() {
      this.loading = true;
      axios.post(smartEnuApi + `/workPlan/getEvents`, {work_plan_id: parseInt(this.work_plan_id)}, {headers: getHeader()})
          .then(res => {
            this.data = res.data;
            if (this.data) {
              this.data.map(e => {
                if (e.creator_id === this.loginedUserId && e.parent_id == null) {
                  this.isCreator = true;
                }
              });
            } else {
              this.isEventsNull = true
            }
            this.getWorkPlanApprovalUsers();
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
      })
    },
    getWorkPlanApprovalUsers() {
      axios.get(smartEnuApi + `/workPlan/getApprovalUsers/${parseInt(this.work_plan_id)}`)
          .then(res => {
            if (res.data) {
              this.approval_users = res.data;
              this.isPlanSentApproval = true;
              this.approval_users.forEach(e => {
                if (this.loginedUserId === e.user.id) {
                  this.isApproval = true;
                }
              });
            } else {
              this.isApproval = false;
              this.isPlanSentApproval = false;
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
    getPlan() {
      this.loading = true;
      axios.get(smartEnuApi + `/workPlan/getWorkPlanById/${this.work_plan_id}`, {headers: getHeader()})
          .then(res => {
            this.plan = res.data;
            if (this.plan && this.plan.is_finish) {
              this.isFinish = this.plan.is_finish;
            }
            this.isRejected = this.plan.is_reject;
            if (this.plan && this.plan.user.id === this.loginedUserId) {
              this.isPlanCreator = true;
            } else {
              this.isPlanCreator = false;
              //this.$router.push('/work-plan')
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
    finish() {
      this.loading = true;
      axios.post(smartEnuApi + '/workPlan/finishEvent',
          {work_plan_id: parseInt(this.work_plan_id)},
          {headers: getHeader()}
      ).then(res => {
        if (res.data.is_success) {
          this.isCreator = false;
          this.loading = false;
          this.isFinish = true;
          this.getPlan();
          this.getWorkPlanEvents();
          this.$toast.add({
            severity: "success",
            summary: 'Успешно!',
            life: 3000,
          });
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
        this.loading = false;
      })
    },
    initReport(isQuarter) {
      if (isQuarter) {
        this.$router.push({name: 'WorkPlanReportView', params: {id: this.work_plan_id, quarter: this.quarter}})
      } else {
        this.$router.push({name: 'WorkPlanReportView', params: {id: this.work_plan_id}})
      }
    },
    onRowExpand(event) {
      this.$toast.add({severity: 'info', summary: 'Row Expanded', detail: event.data.event_name, life: 3000});
    },
    onRowCollapse(event) {
      this.$toast.add({severity: 'success', summary: 'Row Collapsed', detail: event.data.event_name, life: 3000});
    },
    expandTable(event) {
      this.data.map(e => {
        e.isExpanded = false;
      });
      event.isExpanded = true;
      this.rows = this.data.filter(x => x.work_plan_event_id === event.work_plan_event_id)
    },
    collapseTable(event) {
      event.isExpanded = false;
      this.rows = null;
    },
    approvePlan() {

    },
    viewDoc() {
      this.$router.push({name: 'WorkPlanView', params: {id: this.work_plan_id}})
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
    initQuarter() {
      let currentDate = new Date();
      let currentMonth = currentDate.getMonth() + 1;
      this.currentQuarter = Math.ceil(currentMonth / 3);
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
        message: this.$t('common.doYouWantDelete'),
        header: this.$t('common.delete'),
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
          this.$toast.add({severity: 'success', summary: this.$t('common.success'), life: 3000});
          this.getPlan();
          this.initQuarter();
          this.getWorkPlanEvents();
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
    navigateToReports() {
      this.$router.push({name: 'WorkPlanReport', params: {id: this.work_plan_id}});
    }
  },
  /*unmounted() {
    localStorage.removeItem("workPlan");
  }*/
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
