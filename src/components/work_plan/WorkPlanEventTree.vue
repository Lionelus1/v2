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
    <Column field="quarter" header="Квартал" />
    <Column field="fullName" header="Ответственные лица">
      <template #body="{ data }">
        <p v-for="item in data.user" :key="item.id">{{ item.fullName }}</p>
      </template>
    </Column>
    <Column field="result" header="Результат" />
    <Column field="status" header="Статус">
      <template #body="slotProps">
            <span
                :class="'customer-badge status-' + slotProps.data.status.work_plan_event_status_id">{{ slotProps.data.status.work_plan_event_status_id }}</span>
      </template>
    </Column>
    <Column field="actions" header="Действия">
      <template #body="slotProps">
        <work-plan-event-add v-if="slotProps.data.is_finish" :data="slotProps.data"></work-plan-event-add>
      </template>
    </Column>
    <template #expansion="slotProps">
      <WorkPlanEventTree :child="slotProps.data.children" />
    </template>
  </DataTable>
</template>

<script>
import WorkPlanEventAdd from "@/components/work_plan/WorkPlanEventAdd";

export default {
  name: "WorkPlanEventTree",
  components: {WorkPlanEventAdd},
  props: ['child'],
  data() {
    return {
      data: null,
      rows: [],
      isExpanded: false
    }
  },
  created() {
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