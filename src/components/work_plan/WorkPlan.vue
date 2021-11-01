<template>
  <div class="p-col-12">
    <WorkPlanAdd v-model="isAdded" />

    <div class="card">
      <DataTable :lazy="true" :value="data"
                 class="p-datatable-customers" :rows="10" dataKey="id" :rowHover="true" v-model:filters="filters"
                 filterDisplay="menu"
                 :loading="loading" responsiveLayout="scroll"
                 :globalFilterFields="['question','recipient','status', 'sendDate', 'createDate']"
                 @sort="onSort($event)">
        <template #header>
          <div class="p-d-flex p-jc-between p-ai-center">
            <h5 class="p-m-0">Планы</h5>
            <span class="p-input-icon-left">
              <i class="pi pi-search"/>
              <InputText type="search" v-model="searchText" :placeholder="$t('common.search')"/>
              <Button icon="pi pi-search" class="p-ml-1" @click="getData"/>
            </span>
          </div>
        </template>
        <template #empty> {{ $t('common.noData') }}</template>
        <template #loading> {{ $t('common.loading') }}</template>
        <Column field="content" header="Название плана" sortable>
          <template #body="{ data }">
            <router-link :to="{ name: 'WorkPlanEvents', params: { id: data.work_plan_id } }" tag="a">
              {{ data.work_plan_name }}
            </router-link>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<script>
import WorkPlanAdd from "./WorkPlanAdd";
import axios from "axios";
import {getHeader, smartEnuApi} from "@/config/config";
export default {
  components: {WorkPlanAdd},
  data() {
    return {
      data: [],
      searchText: null,
      isAdded: null
    }
  },
  mounted() {
    this.emitter.on('workPlanIsAdded', (data) => {
      if (data === true) {
        this.getPlans();
      }
    });
    console.log(this.selected)
  },
  created() {
    this.getPlans();
  },
  methods: {
    onSort() {

    },
    getPlans() {
      axios.post(smartEnuApi + `/workPlan/getPlans`, {}, {headers: getHeader()})
      .then(res => {
        console.log(res)
        this.data = res.data;
      }).catch(error => {
        console.log(error)
      });
    }
  }
}
</script>