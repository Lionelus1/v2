<template>
  <div class="p-col-12">
    <work-plan-event-add></work-plan-event-add>

    <div class="card">
      <DataTable :lazy="true" :value="data"
                 class="p-datatable-customers" :rows="10" dataKey="id" :rowHover="true" v-model:filters="filters"
                 filterDisplay="menu"
                 :loading="loading" responsiveLayout="scroll">
        <template #header>
          <div class="p-d-flex p-jc-between p-ai-center">
            <h5 class="p-m-0">Мероприятия | <router-link tag="a" to="/work-plan">Планы</router-link></h5>
            <span class="p-input-icon-left">
              <i class="pi pi-search"/>
              <InputText type="search" v-model="searchText" :placeholder="$t('common.search')"/>
              <Button icon="pi pi-search" class="p-ml-1" @click="getWorkPlanEvents"/>
            </span>
          </div>
        </template>
        <template #empty> {{ $t('common.noData') }}</template>
        <template #loading> {{ $t('common.loading') }}</template>
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
            <span :class="'customer-badge status-' + slotProps.data.status.work_plan_event_status_id">{{slotProps.data.status.name_ru}}</span>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<script>
import WorkPlanEventAdd from "@/components/work_plan/WorkPlanEventAdd";
import axios from "axios";
import {getHeader, smartEnuApi} from "@/config/config";
export default {
  components: {WorkPlanEventAdd},
  data() {
    return {
      data: null,
      work_plan_id: null,
      searchText: null
    }
  },
  mounted() {
    this.emitter.on('workPlanEventIsAdded', (data) => {
      if (data === true) {
        this.getWorkPlanEvents();
      }
    });
    console.log(this.selected)
  },
  created() {
    this.work_plan_id = this.$route.params.id
    this.getWorkPlanEvents();
  },
  methods: {
    getWorkPlanEvents() {
      axios.post(smartEnuApi + `/workPlan/getEvents`, {work_plan_id: parseInt(this.work_plan_id)}, {headers: getHeader()})
      .then(res => {
        console.log(res)
        this.data = res.data
      }).catch(error => {
        console.log(error)
      })
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