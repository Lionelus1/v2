<template>
  <div class="col-12">
    <h3>{{ $t('hikvision.employeeEntryExitReport') }}</h3>
    <BlockUI class="card">
      <Dialog :header="$t('hikvision.generateReport')" v-model:visible="showGenerateReportDialog" :style="{ width: '650px' }" class="p-fluid">
        <GenerateReportDialog @close="showGenerateReportDialog = false" @reportCreated="getReports" />
        <template #footer>
          <Button :label="$t('common.cancel')" icon="fa-solid fa-times" class="p-button-rounded p-button-danger" @click="showGenerateReportDialog = false" />
        </template>
      </Dialog>

      <Dialog :header="$t('hikvision.workSchedule')" v-model:visible="showWorkScheduleDialog" :style="{ width: '650px' }" class="p-fluid">
        <WorkScheduleDialog @close="showWorkScheduleDialog = false" />
        <template #footer>
          <Button :label="$t('common.cancel')" icon="fa-solid fa-times" class="p-button-rounded p-button-danger" @click="showWorkScheduleDialog = false" />
        </template>
      </Dialog>

      <DataTable selectionMode="single" v-model:selection="selectedReport" :lazy="true" :value="reports"
                 :loading="loading" :paginator="true" :rows="10" :totalRecords="totalRecords"
                 @page="onPageChange" class="p-datatable-sm wider-table">
        <template #header>
          <div class="table-header">
            <Button :label="$t('hikvision.generateReport')" icon="pi pi-plus" class="p-button-success mr-2" @click="showGenerateReport" />
            <Button :label="$t('hikvision.workSchedule')" icon="pi pi-calendar" class="p-button-info" @click="showWorkSchedule" />
          </div>
        </template>

        <Column :field="'start_date'" :header="$t('hikvision.dateRange')">
          <template #body="slotProps">
            {{ new Date(slotProps.data.start_date).toLocaleDateString() + ' - ' + (slotProps.data.end_date ? new Date(slotProps.data.end_date).toLocaleDateString() : $t('common.untilNow')) }}
          </template>
        </Column>

        <Column :field="'department'" :header="$t('hikvision.department')">
          <template #body="slotProps">
            {{ slotProps.data.department.name }}
          </template>
        </Column>

        <Column :field="'employee'" :header="$t('hikvision.employeeName')">
          <template #body="slotProps">
            {{ slotProps.data.employee ? slotProps.data.employee.fullName : $t('common.unknown') }}
          </template>
        </Column>

        <Column :field="'author'" :header="$t('hikvision.author')">
          <template #body="slotProps">
            {{ slotProps.data.author ? slotProps.data.author.fullName : $t('common.unknown') }}
          </template>
        </Column>

        <Column :field="'creation_date'" :header="$t('hikvision.reportGenerationDate')">
          <template #body="slotProps">
            {{ new Date(slotProps.data.creation_date).toLocaleDateString() }}
          </template>
        </Column>

        <Column :header="$t('hikvision.actions')">
          <template #body="slotProps">
            <Button icon="pi pi-eye" class="p-button-text p-button-info" @click="viewReport(slotProps.data.id)" />
            <Button icon="pi pi-download" class="p-button-text p-button-success" @click="downloadReport(slotProps.data.id)" />
            <Button icon="pi pi-times" class="p-button-text p-button-danger" @click="deleteReport(slotProps.data.id)" />
          </template>
        </Column>
      </DataTable>
    </BlockUI>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import BlockUI from 'primevue/blockui';
import Dialog from 'primevue/dialog';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import WorkScheduleDialog from '@/components/hikvision/WorkScheduleDialog.vue';
import GenerateReportDialog from "@/components/hikvision/GenerateReportDialog.vue";
import { ReportService } from "@/service/report.service";

const showGenerateReportDialog = ref(false);
const showWorkScheduleDialog = ref(false);
const reports = ref([]);
const selectedReport = ref(null);
const loading = ref(false);
const totalRecords = ref(0);
const toast = useToast();
const reportService = new ReportService();
const lazyParams = ref({ page: 0 });

const showError = (message) => {
  toast.add({ severity: 'error', summary: 'Ошибка', detail: message, life: 3000 });
};

const getReports = async () => {
  loading.value = true;
  try {
    const response = await reportService.getReports({ page: lazyParams.value.page });
    if (response.data && response.data.reports) {
      reports.value = response.data.reports;
      totalRecords.value = response.data.total;
    } else {
      showError('Данные отчетов недоступны');
    }
  } catch (error) {
    console.error('Не удалось получить отчеты:', error);
    showError('Не удалось получить отчеты');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  getReports();
});

const showGenerateReport = () => {
  showGenerateReportDialog.value = true;
};

const showWorkSchedule = () => {
  showWorkScheduleDialog.value = true;
};

const viewReport = async (id) => {
  try {
    const response = await reportService.getReportById(id);
    console.log('Просмотр отчета:', response.data);
  } catch (error) {
    console.error('Не удалось просмотреть отчет:', error);
    showError('Не удалось просмотреть отчет');
  }
};

const downloadReport = async (id) => {
  try {
    const response = await reportService.downloadReport(id);
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `report_${id}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    console.log('Скачивание отчета:', id);
  } catch (error) {
    console.error('Не удалось скачать отчет:', error);
    showError('Не удалось скачать отчет');
  }
};

// const deleteReport = async (id) => {
//   try {
//     await reportService.deleteReport(id);
//     reports.value = reports.value.filter(report => report.id !== id);
//     console.log('Удаление отчета:', id);
//   } catch (error) {
//     console.error('Не удалось удалить отчет:', error);
//     showError('Не удалось удалить отчет');
//   }
// };

const onPageChange = (event) => {
  lazyParams.value.page = event.page;
  getReports();
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

.wider-table {
  width: 100%;
}

.dialog {
  width: 600px;
}
</style>