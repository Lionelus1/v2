<template>
  <div class="col-12">
    <h3>{{ $t('hikvision.employeeEntryExitReport') }}</h3>
    <BlockUI>
      <DataTable selectionMode="single" v-model:selection="selectedReport" :lazy="true" :value="reports"
                   :loading="loading" :paginator="true" :rows="10" :totalRecords="totalRecords"
                   @page="onPageChange" class="p-datatable-sm wider-table">
        <template #header>
          <div class="table-header">
            <Button :label="$t('hikvision.generateReport')" icon="pi pi-plus" class="p-button-success mr-2" @click="showGenerateReport" />
<!--             <Button :label="$t('hikvision.workSchedule')" icon="pi pi-calendar" class="p-button-info" @click="showWorkSchedule" />-->
          </div>
        </template>

        <Column :field="'start_date'" :header="$t('hikvision.dateRange')">
          <template #body="slotProps">
            {{ new Date(slotProps.data.start_date).toLocaleDateString( 'ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              }
          ) + ' - ' + (slotProps.data.end_date ? new Date(slotProps.data.end_date).toLocaleDateString( 'ru-RU', {
               day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              }
          ) : $t('common.untilNow')) }}
          </template>
        </Column>

        <Column :field="'department'" :header="$t('hikvision.department')">
          <template #body="slotProps">
            {{ slotProps.data.department?.name || $t('common.all') }}
          </template>
        </Column>

        <Column :field="'category'" :header="$t('hikvision.category')">
          <template #body="slotProps">
            {{ slotProps.data?.category_id?.map(getCategoryNameById).join(', ') || $t('common.all') }}
          </template>
        </Column>

        <Column :field="'employee'" :header="$t('hikvision.employeeName')">
          <template #body="slotProps">
            {{ slotProps.data.employee?.fullName || $t('common.all') }}
          </template>
        </Column>

        <Column :field="'author'" :header="$t('hikvision.author')">
          <template #body="slotProps">
            {{ slotProps.data.author ? slotProps.data.author.fullName : $t('common.unknown') }}
          </template>
        </Column>
        <Column :field="'creation_date'" :header="$t('hikvision.reportGenerationDate')">
          <template #body="slotProps">
            {{ new Date(slotProps.data.creation_date).toLocaleDateString( 'ru-RU', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
              }
          ) }}
          </template>
        </Column>

        <Column :header="$t('hikvision.actions')">
          <template #body="slotProps">
            <div>
              <Button v-for="item in initItems(slotProps.data)" :key="item.label"
                      :label="item.label"
                      :icon="item.icon"
                      class="p-button-text"
                      :class="item.icon.includes('download') ? 'p-button-success' : 'p-button-danger'"
                      @click="item.command" />
            </div>
          </template>
        </Column>
      </DataTable>
    </BlockUI>
  </div>
  <Dialog
      v-model:visible="showGenerateReportDialog"
      :style="{ width: '650px', maxWidth: '90vw' }"
      :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
      :modal="true"
      class="p-fluid responsive-dialog"
  >
    <GenerateReportDialog @close="showGenerateReportDialog = false" @reportCreated="getReports" />
    <template #footer>
      <Button
          :label="$t('common.cancel')"
          icon="fa-solid fa-times"
          class="p-button-rounded p-button-danger"
          @click="showGenerateReportDialog = false"
      />
    </template>
  </Dialog>
  <Dialog :header="$t('hikvision.workSchedule')" v-model:visible="showWorkScheduleDialog" :style="{ width: '650px' }" class="p-fluid">
    <WorkScheduleDialog @close="showWorkScheduleDialog = false" />
    <template #footer>
      <Button :label="$t('common.cancel')" icon="fa-solid fa-times" class="p-button-rounded p-button-danger" @click="showWorkScheduleDialog = false" />
    </template>
  </Dialog>
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
import { downloadFile } from "@/config/config";
import {useI18n} from "vue-i18n";
import { useConfirm } from "primevue/useconfirm";

const currentUser = ref({});
const confirm = useConfirm()
const showGenerateReportDialog = ref(false);
const showWorkScheduleDialog = ref(false);
const reports = ref([]);
const selectedReport = ref(null);
const loading = ref(false);
const totalRecords = ref(0);
const toast = useToast();
const reportService = new ReportService();
const lazyParams = ref({ page: 0, rows: 10, first: 0 });
const { t, locale } = useI18n();

const showError = (message) => {
  toast.add({ severity: 'error', summary: 'Ошибка', detail: message, life: 3000 });
};
const showSuccess = (message) => {
  toast.add({ severity: 'success', summary: 'Успешно', detail: message, life: 3000 });
};
const categoriesV2 = ref([
  { id: 1, name_kz: '', name_ru: '', name_en: '', code: t('hikvision.aup'), is_noted: false },
  { id: 2, name_kz: '', name_ru: '', name_en: '', code: t('hikvision.ahp'), is_noted: false },
  { id: 3, name_kz: '', name_ru: '', name_en: '', code: t('hikvision.uvp'), is_noted: false },
  { id: 4, name_kz: '', name_ru: '', name_en: '', code: t('hikvision.nii'), is_noted: false },
  { id: 5, name_kz: '', name_ru: '', name_en: '', code: t('hikvision.pps'), is_noted: false },
  { id: 6, name_kz: '', name_ru: '', name_en: '', code: t('hikvision.op'), is_noted: false },
]);
const getCategoryNameById = (id) => {
  const category = categoriesV2.value.find(cat => cat.id === id);
  return category ? category.code : 'Неизвестная категория';
};

const getReports = async () => {
  loading.value = true;
  try {
    const response = await reportService.getReports({
      page: lazyParams.value.page,
      rows: lazyParams.value.rows,
      author_id: currentUser.value.id
    });
    console.log('Полученные данные:', response.data);

    if (response.data && response.data.reports) {
      reports.value = response.data.reports;
      totalRecords.value = response.data.total;
    }
  } catch (error) {
    console.error('Не удалось получить отчеты:', error);
    showError('Не удалось получить отчеты');
  } finally {
    loading.value = false;
  }
};
const initItems = (data) => [
  {
    icon: 'fa-solid fa-download',
    command: () => downloadFile('',data.doc.id),
  },
  {
    icon: 'fa-solid fa-trash',
    command: () => deleteReport(data.id),
  },
];
const onPageChange = (event) => {
  console.log('Page change event:', event);
  lazyParams.value.page = event.page;
  lazyParams.value.rows = event.rows;
  lazyParams.value.first = event.first;
  console.log('Updated lazyParams:', lazyParams.value);
  getReports();
};

onMounted(() => {
  getReports();
});

const showGenerateReport = () => {
  showGenerateReportDialog.value = true;
};

// const showWorkSchedule = () => {
//   showWorkScheduleDialog.value = true;
// };

const viewReport = async (id) => {
  try {
    const response = await reportService.getReportById(id);
    console.log('Просмотр отчета:', response.data);
  } catch (error) {
    console.error('Не удалось просмотреть отчет:', error);
    showError('Не удалось просмотреть отчет');
  }
};

const deleteReport = (id) => {
  confirm.require({
    message: t('common.doYouWantDelete'),
    header: t('common.confirm'),
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button p-button-success',
    rejectClass: 'p-button p-button-danger',
    accept: async () => {
      try {
        await reportService.deleteReport({ id });
        reports.value = reports.value.filter(report => report.id !== id);
        showSuccess('Отчет успешно удален');
        getReports();
      } catch (error) {
        showError('Не удалось удалить отчет');
      }
    },
  });
};
</script>

<style scoped lang="scss">
.table-header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 1rem;
  margin-left: -1rem;
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


.p-button-blue {
  background-color: #007bff !important;
  border-color: #007bff !important;
  color: #fff !important;
}

.responsive-dialog {
  max-width: 100%;
  margin: 0 auto;
}

@media (max-width: 960px) {
  .responsive-dialog {
    width: 75vw;
  }
}

@media (max-width: 640px) {
  .responsive-dialog {
    width: 90vw;
  }
}

</style>