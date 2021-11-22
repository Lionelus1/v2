<template>
  <div class="p-col-12">
    <div class="card">
      <work-plan-event-add v-if="isCreator"></work-plan-event-add>
      <Button v-if="isCreator" label="Завершить" icon="pi pi-check" @click="finish"
              class="p-button p-button-danger p-ml-2"/>
      <work-plan-approve v-if="isPlanCreator && !isCreator"></work-plan-approve>
    </div>
    <div class="card">
      <DataTable :value="data" dataKey="work_plan_event_id"
                 v-model:expandedRows="rows" @rowExpand="onRowExpand" @rowCollapse="onRowCollapse"
                 :loading="loading" responsiveLayout="scroll">
        <template #header>
          <div class="p-d-flex p-jc-between p-ai-center">
            <h5 class="p-m-0">Мероприятия |
              <router-link tag="a" to="/work-plan">Планы</router-link>
            </h5>
            <span class="p-input-icon-left">
              <i class="pi pi-search"/>
              <InputText type="search" v-model="searchText" :placeholder="$t('common.search')"/>
              <Button icon="pi pi-search" class="p-ml-1" @click="getWorkPlanEvents"/>
            </span>
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
        <Column field="event_name" header="Название мероприятия" sortable>
          <template #body="{ data }">
            {{ data.event_name }}
          </template>
        </Column>
        <Column field="quarter" header="Квартал" sortable>
          <template #body="{ data }">
            {{ data.quarter }}
          </template>
        </Column>
        <Column field="fullName" header="Ответственные лица" sortable>
          <template #body="{ data }">
            <p v-for="item in data.user" :key="item.id">{{ item.fullName }}</p>
          </template>
        </Column>
        <Column field="result" header="Результат" sortable>
          <template #body="{ data }">
            {{ data.result }}
          </template>
        </Column>
        <Column field="status" header="Статус">
          <template #body="slotProps">
            <span
                :class="'customer-badge status-' + slotProps.data.status.work_plan_event_status_id">{{
                slotProps.data.status.name_ru
              }}</span>
          </template>
        </Column>
        <Column field="actions" header="Действия">
          <template #body="slotProps">
            <work-plan-event-add v-if="isCreator" :data="slotProps.data"></work-plan-event-add>
          </template>
        </Column>
        <template #expansion="slotProps">
          <WorkPlanEventTree :child="slotProps.data.children" v-if="slotProps.data.children"/>
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

export default {
  components: {WorkPlanApprove, WorkPlanEventTree, WorkPlanEventAdd},
  data() {
    return {
      data: null,
      work_plan_id: null,
      searchText: null,
      rows: [],
      lastEvent: null,
      quarters: [
        {
          id: 0,
          name: 'I'
        },
        {
          id: 1,
          name: 'II'
        },
        {
          id: 2,
          name: 'III'
        },
        {
          id: 3,
          name: 'IV'
        }
      ],
      loading: false,
      isCreator: false,
      isPlanCreator: false,
      plan: null,
      loginedUserId: 0
    }
  },
  mounted() {
    this.emitter.on('workPlanEventIsAdded', (data) => {
      if (data === true) {
        this.getWorkPlanEvents();
      }
    });
  },
  created() {
    this.work_plan_id = this.$route.params.id
    this.loginedUserId = JSON.parse(localStorage.getItem("loginedUser")).userID;
    this.getWorkPlanEvents();
    this.plan = JSON.parse(localStorage.getItem("workPlan"));
    console.log(this.plan)
    if (this.plan && this.plan.user.id === this.loginedUserId) {
      this.isPlanCreator = true;
    } else {
      this.isPlanCreator = false;
      this.$router.push('/work-plan')
    }
  },
  methods: {
    getWorkPlanEvents() {
      this.loading = true;
      axios.post(smartEnuApi + `/workPlan/getEvents`, {work_plan_id: parseInt(this.work_plan_id)}, {headers: getHeader()})
          .then(res => {
            this.data = res.data
            if (this.data) {
              this.data.map(e => {
                if (e.creator_id === this.loginedUserId && e.parent_id == null && !e.is_finish) {
                  this.isCreator = true;
                }
              });
            }
            console.log(this.data)
            this.loading = false;
          }).catch(error => {
        if (error.response.status === 401) {
          this.$store.dispatch("logLout");
        } else {
          this.$toast.add({
            severity: "error",
            summary: this.$t("smartenu.saveNewsError") + ":\n" + error,
            life: 3000,
          });
        }
        this.loading = false;
      })
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
          this.$toast.add({
            severity: "success",
            summary: 'Успешно!',
            life: 3000,
          });
        }
      }).catch(error => {
        if (error.response.status === 401) {
          this.$store.dispatch("logLout");
        } else {
          this.$toast.add({
            severity: "error",
            summary: this.$t("smartenu.saveNewsError") + ":\n" + error,
            life: 3000,
          });
        }
        this.loading = false;
      })
    },
    onRowExpand(event) {
      console.log(event)
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
    }
  },
  unmounted() {
    localStorage.removeItem("workPlan");
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