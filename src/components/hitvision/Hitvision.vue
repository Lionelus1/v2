<template>
  <div class="col-12">
    <h3>{{ $t('hikvision.employeeEntryExitReport') }}</h3>
    <ToolbarMenu :data="mainMenu">
      <template #end>
        <Button class="align-items-center p-button-secondary p-button-text" @click="toggle('filterOverlayPanel', $event)">
          <i class="fa-solid fa-filter"/> &nbsp;{{ $t("scienceWorks.buttons.filter") }}
        </Button>
      </template>
    </ToolbarMenu>
    <BlockUI class="card">
      <Dialog :header="$t('hikvision.generateReport')" v-model:visible="showGenerateReportDialog" :style="{ width: '450px' }" class="p-fluid">
        <!-- Content for GenerateReportDialog -->
        <template #footer>
          <Button :label="$t('common.cancel')" icon="fa-solid fa-times" class="p-button-rounded p-button-danger" @click="showGenerateReportDialog = false"/>
        </template>
      </Dialog>
      <Dialog :header="$t('hikvision.workSchedule')" v-model:visible="showWorkScheduleDialog" :style="{ width: '450px' }" class="p-fluid">
        <!-- Content for WorkScheduleDialog -->
        <template #footer>
          <Button :label="$t('common.cancel')" icon="fa-solid fa-times" class="p-button-rounded p-button-danger" @click="showWorkScheduleDialog = false"/>
        </template>
      </Dialog>
      <div>
        <DataTable :value="reports" :rows="10" responsiveLayout="scroll" class="p-datatable-sm">
          <template #header>
            <div class="table-header">
              <Button :label="$t('hikvision.generateReport')" icon="pi pi-plus" class="p-button-success mr-2" @click="showGenerateReport"/>
              <Button :label="$t('hikvision.workSchedule')" icon="pi pi-calendar" class="p-button-info" @click="showWorkSchedule"/>
            </div>
          </template>
          <Column field="dateRange" :header="$t('hikvision.dateRange')"/>
          <Column field="category" :header="$t('hikvision.category')"/>
          <Column field="department" :header="$t('hikvision.department')"/>
          <Column field="employee" :header="$t('hikvision.employee')"/>
          <Column field="author" :header="$t('hikvision.author')"/>
          <Column field="creationDate" :header="$t('hikvision.reportGenerationDate')"/>
          <Column :header="$t('hikvision.actions')">
            <template #body="slotProps">
              <Button icon="pi pi-eye" class="p-button-text p-button-info" @click="viewReport(slotProps.data.id)"/>
              <Button icon="pi pi-download" class="p-button-text p-button-success" @click="downloadReport(slotProps.data.id)"/>
              <Button icon="pi pi-times" class="p-button-text p-button-danger" @click="deleteReport(slotProps.data.id)"/>
            </template>
          </Column>
        </DataTable>
      </div>
    </BlockUI>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import ToolbarMenu from '@/components/ToolbarMenu.vue';
import BlockUI from 'primevue/blockui';
import Dialog from 'primevue/dialog';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';

const showGenerateReportDialog = ref(false);
const showWorkScheduleDialog = ref(false);

const reports = ref([
  {
    id: 1,
    dateRange: '2024-01-01 - 2024-01-31',
    category: 'ППС',
    department: 'Факультет Информатики',
    employee: 'Иванов Иван',
    author: 'Петров Петр',
    creationDate: '2024-02-01',
  },
]);

const mainMenu = computed(() => [
  {
    label: 'Main',
    icon: 'pi pi-fw pi-home',
    command: () => console.log('Main'),
  },
]);

const showGenerateReport = () => {
  showGenerateReportDialog.value = true;
};

const showWorkSchedule = () => {
  showWorkScheduleDialog.value = true;
};

const viewReport = (id) => {
  console.log('View report:', id);
};

const downloadReport = (id) => {
  console.log('Download report:', id);
};

const deleteReport = (id) => {
  console.log('Delete report:', id);
};
</script>

<style scoped lang="scss">
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
}

.p-datatable-sm .p-datatable-thead > tr > th,
.p-datatable-sm .p-datatable-tbody > tr > td {
  padding: 0.5rem;
}

.p-datatable-sm .p-datatable-tbody > tr > td .p-button-text {
  margin: 0.25rem;
}
</style>