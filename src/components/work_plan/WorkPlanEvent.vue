<template>
  <div class="p-col-12">

    <h3 v-if="plan">{{ plan.work_plan_name }}</h3>
    <div class="card" v-if="plan && plan.reject_history && isRejected && isPlanCreator">
      <div class="p-fluid">
        <div class="p-field">
          <label>{{ $t('common.state') }}:</label>
          <div>
            <span v-if="plan.status" :class="'customer-badge status-' + plan.status.work_plan_status_id">{{
                plan.status.name_ru
              }}</span>
          </div>
        </div>
        <div class="p-field" v-if="plan.reject_history.user">
          <label>{{ $t('contracts.assigner') }}:</label>
          <div>
            <b>{{ plan.reject_history.user.fullName }}</b>
          </div>
        </div>
        <div class="p-field" v-if="plan.reject_history.created_date">
          <label>{{ $t('common.date') }}:</label>
          <div>
            <b>{{ formatDateMoment(plan.reject_history.created_date) }}</b>
          </div>
        </div>
        <div class="p-field">
          <label>{{ $t('common.comment') }}:</label>
          <div>
            <Message :closable="false" severity="warn"><span v-html="plan.reject_history.message"></span>
            </Message>
          </div>
        </div>
      </div>
    </div>

    <div class="card" v-if="plan">
      <work-plan-event-add v-if="(isPlanCreator || isCreator || isEventsNull) && !isFinish" :items="data" :isMain="true" :plan-data="plan"></work-plan-event-add>
      <Button v-if="isPlanCreator && !isFinish" :label="$t('common.complete')" icon="pi pi-check" @click="finish"
              class="p-button p-button-danger p-ml-2"/>
      <work-plan-approve v-if="isPlanCreator && !isPlanSentApproval && isFinish" :plan="plan"
                         :events="data"></work-plan-approve>
      <Button v-if="isFinish && (isApproval || isPlanCreator) && isPlanSentApproval" :label="$t('workPlan.viewPlan')"
              icon="pi pi-eye" @click="viewDoc"
              class="p-button p-button-info p-ml-2"/>
      <Button v-if="isFinish && (isApproval || isPlanCreator) && isPlanApproved" :label="$t('workPlan.reports')"
              @click="navigateToReports" class="p-button p-button-info p-ml-2"/>
    </div>
    <div class="card">

      <TreeTable ref="workplantreetable" class="p-treetable-sm" :value="data" :lazy="true" :loading="loading"
                 @nodeExpand="onExpand" :scrollable="true" scrollHeight="flex" responsiveLayout="scroll">
        <template #header>
          <div class="p-d-flex p-jc-between p-ai-center">
            <h5 class="p-m-0">{{ $t('workPlan.events') }} |
              <router-link tag="a" to="/work-plan">{{ $t('workPlan.plans') }}</router-link>
            </h5>
            <!--<span class="p-input-icon-left">
                  <i class="pi pi-search"/>
                  <InputText type="search" v-model="searchText" :placeholder="$t('common.search')"/>
                  <Button icon="pi pi-search" class="p-ml-1" @click="getWorkPlanEvents"/>
                </span>-->
          </div>
        </template>
        <template #empty> {{ $t('common.noData') }}</template>
        <template #loading> {{ $t('common.loading') }}</template>
        <Column field="event_name" :header="$t('workPlan.eventName')" :expander="true" style="min-width:500px">
          <template #body="{ node }">
            <span><i class="fa-solid fa-folder"></i>&nbsp;{{ node.event_name }}</span>
          </template>
        </Column>
        <Column field="unit" :header="$t('common.unit')" v-if="plan && plan.is_oper">
          <template #body="{ node }">
            {{ node.unit }}
          </template>
        </Column>
        <Column field="plan_number" :header="$t('common.planNumber')" v-if="plan && plan.is_oper" style="max-width:100px">
          <template #body="{ node }">
            {{ node.plan_number }}
          </template>
        </Column>
        <Column field="quarter" :header="$t('workPlan.quarter')">
          <template #body="{ node }">
            {{ initQuarter(node.quarter) }}
          </template>
        </Column>
        <Column field="responsible_executor" :header="$t('workPlan.respExecutor')" v-if="plan && plan.is_oper">
          <template #body="{ node }">
            {{ node.responsible_executor }}
          </template>
        </Column>
        <Column field="fullName" :header="plan && plan.is_oper ? $t('workPlan.summary') : $t('workPlan.approvalUsers')">
          <template #body="{ node }">
            <div v-if="node.user && node.user.length > 2">
              <Button type="button" @click="showRespUsers" class="p-button-rounded" icon="fa-solid fa-eye" label="" />
              <OverlayPanel ref="op">
                <p v-for="item in node.user" :key="item.id">{{ item.fullName }}</p>
              </OverlayPanel>
            </div>
            <div v-else>
              <p v-for="item in node.user" :key="item.id">{{ item.fullName }}</p>
            </div>
          </template>
        </Column>
        <Column field="supporting_docs" v-if="plan && plan.is_oper" :header="$t('common.suppDocs')">
          <template #body="{ node }">
            {{ node.supporting_docs }}
          </template>
        </Column>
        <Column field="result" :header="plan && plan.is_oper ? $t('common.additionalInfo') : $t('common.result')">
          <template #body="{ node }">
            {{ node.result }}
          </template>
        </Column>
        <Column field="status" :header="$t('common.status')">
          <template #body="{node}">
            <span
                :class="'customer-badge status-' + node.status.work_plan_event_status_id">{{
                $i18n.locale === "kz" ? slotProps.node.status.name_kz : $i18n.locale === "ru" ? node.status.name_ru : node.status.name_en
              }}</span>
          </template>
        </Column>

        <Column field="actions" header="">
          <template #body="slotProps">
            <div>
              <!--              (parseInt(slotProps.node.quarter.String) === currentQuarter || parseInt(slotProps.node.quarter.String) === 5)-->
              <work-plan-execute
                  v-if="isUserApproval(slotProps.node) && isPlanApproved && isPlanSentApproval && (slotProps.node.status.work_plan_event_status_id === 1 || slotProps.node.status.work_plan_event_status_id === 4 || slotProps.node.status.work_plan_event_status_id === 6)"
                  :data="slotProps.node" :planData="plan"></work-plan-execute>
              <work-plan-event-result-modal v-if="(slotProps.node.event_result && plan && !plan.is_oper) || slotProps.node.status.work_plan_event_status_id === 5 || slotProps.node.status.work_plan_event_status_id === 2"
                                            :event-result="slotProps.node.event_result"
                                            :eventData="slotProps.node"
                                            :plan-data="plan"></work-plan-event-result-modal>
              <work-plan-event-add v-if="isPlanCreator && !isPlanSentApproval && !isFinish" :data="slotProps.node" :items="slotProps.node.children" :isMain="false" :plan-data="plan"></work-plan-event-add>
              <work-plan-event-edit-modal v-if="isPlanCreator && !isPlanSentApproval && !isFinish"
                                          :planData="plan"
                                          :event="slotProps.node"
              ></work-plan-event-edit-modal>
              <Button v-if="isPlanCreator && !isPlanSentApproval && !isFinish"
                      @click="remove_event(slotProps.node.work_plan_event_id)" icon="pi pi-trash"
                      class="p-button-danger p-ml-1 p-mt-1" label=""></Button>
            </div>
          </template>
        </Column>
      </TreeTable>
    </div>
  </div>
</template>

<script>
import WorkPlanEventAdd from "@/components/work_plan/WorkPlanEventAdd";
import axios from "axios";
import {getHeader, smartEnuApi} from "@/config/config";
import WorkPlanApprove from "@/components/work_plan/WorkPlanApprove";
import WorkPlanExecute from "@/components/work_plan/WorkPlanExecute";
import WorkPlanEventResultModal from "@/components/work_plan/WorkPlanEventResultModal";
import WorkPlanEventEditModal from "@/components/work_plan/WorkPlanEventEditModal";
import moment from "moment";

export default {
  name: "WorkPlanEvent",
  components: {
    WorkPlanEventEditModal,
    WorkPlanApprove,
    WorkPlanEventAdd,
    WorkPlanExecute,
    WorkPlanEventResultModal
  },
  data() {
    return {
      data: [],
      work_plan_id: null,
      searchText: null,
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
      loading: false,
      parent: null,
      parentNode: null,
      plan: null,
      approval_users: null,
      loginedUserId: JSON.parse(localStorage.getItem("loginedUser")).userID,
      windowHeight: window.innerHeight - 270,
      lazyParams: {
        parent_id: null,
        work_plan_id: -1,
        quarter: null,
      },
      isRejected: false,
      isFinish: false,
      isPlanCreator: false,
      isCreator: false,
      isApproval: false,
      isPlanSentApproval: false,
      isPlanApproved: false,
      isEventsNull: false,
    }
  },
  created() {
    this.work_plan_id = this.$route.params.id
    this.getPlan();
    this.getEventsTree(null);
  },
  mounted() {
    this.emitter.on('workPlanEventIsAdded', (data) => {
      if (data === true) {
        this.getEventsTree(this.parentNode);
      }
    });
    this.emitter.on('planRejected', (data) => {
      if (data === true) {
        this.getPlan();
        this.getEventsTree(this.parentNode);
      }
    });
    this.emitter.on('planSentToApprove', (data) => {
      if (data) {
        this.getPlan();
        this.getEventsTree(this.parentNode);
      }
    })
    this.emitter.on('workPlanEventIsCompleted', (data) => {
      if (data) {
        this.getPlan();
        this.getEventsTree(this.parentNode);
      }
    })
    this.emitter.on('workPlanChildEventIsDeleted', (data) => {
      if (data) {
        this.getPlan();
        this.getEventsTree(this.parentNode);
      }
    });
    this.emitter.on('planEventChanged', (data) => {
      if (data) {
        this.getPlan();
        this.getEventsTree(this.parentNode);
      }
    });
    this.emitter.on('workPlanResultSentToVerify', (data) => {
      if (data) {
        this.getPlan();
        this.getEventsTree(this.parentNode);
      }
    });
    this.emitter.on('workPlanResultVerified', (data) => {
      if (data) {
        this.getPlan();
        this.getEventsTree(this.parentNode);
      }
    });
  },
  methods: {
    onExpand(node) {
      this.lazyParams.parent_id = Number(node.work_plan_event_id)
      this.parentNode = node
      this.getEventsTree(node)
    },
    getEventsTree(parent) {
      this.loading = true;
      this.lazyParams.work_plan_id = Number(this.work_plan_id)
      this.lazyParams.quarter = this.quarter
      if (parent == null) {
        this.lazyParams.parent_id = null;
      }

      axios.post(smartEnuApi + `/workPlan/getEventsTree`, this.lazyParams, {headers: getHeader()})
          .then(res => {
            if (parent == null) {
              this.data = res.data;
            } else {
              parent.children = res.data;
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
    onResize() {
      this.windowHeight = window.innerHeight - 270
    },
    getWorkPlanApprovalUsers() {
      axios.get(smartEnuApi + `/workPlan/getApprovalUsers/${parseInt(this.work_plan_id)}`)
          .then(res => {
            if (res.data) {
              this.approval_users = res.data;
              this.isPlanApproved = res.data.some(x => x.is_success);
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
    finish() {
      axios.post(smartEnuApi + '/workPlan/finishEvent',
          {work_plan_id: parseInt(this.work_plan_id)},
          {headers: getHeader()}
      ).then(res => {
        if (res.data.is_success) {
          this.isCreator = false;
          this.isFinish = true;
          this.getPlan();
          this.getEventsTree(null);
          this.$toast.add({
            severity: "success",
            summary: this.$t('common.success'),
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
      })
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
          this.getPlan();
          this.getEventsTree(this.parentNode);
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
    viewDoc() {
      this.$router.push({name: 'WorkPlanView', params: {id: this.work_plan_id}})
    },
    navigateToReports() {
      this.$router.push({name: 'WorkPlanReport', params: {id: this.work_plan_id}});
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
    showRespUsers(event) {
      this.$refs.op.toggle(event);
    },
    formatDateMoment(date) {
      return moment(new Date(date)).utc().format("DD.MM.YYYY HH:mm:ss")
    },
    toggle(ref, event) {
      this.$refs[ref].toggle(event);
    },
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
