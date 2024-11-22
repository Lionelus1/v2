<template>
  <div class="report-component">
    <h3 class="title">{{ $t('report.ReportDesigner') }}</h3>

    <!-- Основные фильтры и дополнительные фильтры -->
    <div class="filters-container">
      <!-- Левая часть -->
      <div class="filters-left">
        <!-- Категория -->
        <div class="filter-item">
          <label>{{ $t('report.TypeReport') }}</label>
          <Dropdown
              v-if="true"
              v-model="filters.category.value"
              :options="reportCategories"
              optionLabel="label"
              placeholder="Выберите категорию"
              class="dropdown"
          />
        </div>

        <!-- Период -->
        <div class="filter-item">
          <label>{{ $t('report.period') }}</label>
          <Calendar
              v-model="filters.dateRange.from"
              placeholder="Дата начала"
              :showIcon="true"
              :dateFormat="'dd.mm.yy'"
              class="calendar"
          />
          <Calendar
              v-model="filters.dateRange.to"
              placeholder="Дата окончания"
              :showIcon="true"
              :dateFormat="'dd.mm.yy'"
              class="calendar"
          />
        </div>
      </div>

      <!-- Правая часть -->
      <div class="filters-right">
        <div class="additional-filters">
          <!-- Департамент/Группа -->
          <div class="filter-item">
            <label>{{ $t('reports.department') }}</label>
            <div class="filter-controls">
              <Checkbox v-model="filters.department.enabled" />
              <Dropdown
                  v-if="filters.department.enabled"
                  v-model="filters.department.value"
                  :options="departments"
                  optionLabel="label"
                  placeholder="Выберите департамент/группу"
                  class="dropdown"
              />
            </div>
          </div>

          <div class="filter-item">
            <label>{{ $t('reports.status') }}</label>
            <div class="filter-controls">
              <Checkbox v-model="filters.status.enabled" />
              <Dropdown
                  v-if="filters.status.enabled"
                  v-model="filters.status.value"
                  :options="statuses"
                  optionLabel="label"
                  placeholder="Выберите статус"
                  class="dropdown"
              />
            </div>
          </div>

          <div class="filter-item">
            <label>{{ $t('reports.author') }}</label>
            <div class="filter-controls">
              <Checkbox v-model="filters.author.enabled" />
              <InputText
                  v-if="filters.author.enabled"
                  v-model="filters.author.value"
                  placeholder="Введите имя автора"
                  class="input"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Кнопки -->
    <div class="buttons">
      <Button
          :label="$t('reports.generate')"
          icon="pi pi-file"
          class="p-button-success generate-btn"
          @click="generateReport"
      />
      <Button
          :label="$t('reports.reset')"
          icon="pi pi-refresh"
          class="p-button-warning reset-btn"
          @click="resetFilters"
      />
    </div>

    <!-- Таблица с результатами -->
    <div class="report-table">
      <BlockUI>
        <DataTable
            :value="reports"
            :lazy="true"
            :loading="loading"
            :paginator="true"
            :rows="10"
            :totalRecords="totalRecords"
            class="p-datatable-sm"
        >
          <Column :field="'category'" :header="$t('reports.category')" />
          <Column :field="'department'" :header="$t('reports.department')" />
          <Column :field="'status'" :header="$t('reports.status')" />
          <Column :field="'author'" :header="$t('reports.author')" />
          <Column :header="$t('reports.actions')">
            <template #body="slotProps">
              <Button
                  label="Excel"
                  icon="pi pi-download"
                  class="p-button-success"
                  @click="exportToExcel(slotProps.data.id)"
              />
            </template>
          </Column>
        </DataTable>
      </BlockUI>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import Checkbox from 'primevue/checkbox';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import BlockUI from 'primevue/blockui';
import { ReportService } from '@/service/report.service';

const toast = useToast();
const { t } = useI18n();
const reportService = new ReportService();

const reportCategories = ref([]);
const departments = ref([]);
const statuses = ref([]);

const filters = ref({
  category: { enabled: false, value: null },
  department: { enabled: false, value: null },
  status: { enabled: false, value: null },
  dateRange: { from: null, to: null },
  author: { enabled: false, value: '' },
});

const reports = ref([]);
const totalRecords = ref(0);
const loading = ref(false);

const fetchCategories = async () => {
  try {
    const response = await reportService.getCategories();
    reportCategories.value = response.data.map((cat) => ({
      label: cat.name,
      value: cat.id,
    }));
  } catch (error) {
    toast.add({ severity: 'error', detail: t('reports.errorFetchingCategories'), life: 3000 });
  }
};

const fetchDepartments = async () => {
  try {
    const response = await reportService.getDepartments();
    departments.value = response.data.map((dept) => ({
      label: dept.name,
      value: dept.id,
    }));
  } catch (error) {
    toast.add({ severity: 'error', detail: t('reports.errorFetchingDepartments'), life: 3000 });
  }
};

const fetchStatuses = async () => {
  try {
    const response = await reportService.getStatuses();
    statuses.value = response.data.map((status) => ({
      label: status.name,
      value: status.id,
    }));
  } catch (error) {
    toast.add({ severity: 'error', detail: t('reports.errorFetchingStatuses'), life: 3000 });
  }
};

const generateReport = async () => {
  const activeFilters = {};

  for (const key in filters.value) {
    const filter = filters.value[key];
    if (filter.enabled || (key === 'dateRange' && (filter.from || filter.to))) {
      activeFilters[key] = filter.value || filter;
    }
  }

  try {
    loading.value = true;
    const response = await reportService.getReports(activeFilters);
    reports.value = response.data.reports || [];
    totalRecords.value = response.data.total || 0;
    toast.add({ severity: 'success', detail: t('reports.generatedSuccess'), life: 3000 });
  } catch (error) {
    toast.add({ severity: 'error', detail: t('reports.errorGeneratingReport'), life: 3000 });
  } finally {
    loading.value = false;
  }
};

const resetFilters = () => {
  for (const key in filters.value) {
    filters.value[key].enabled = false;
    filters.value[key].value = null;
  }
  fetchReports();
};

onMounted(() => {
  fetchCategories();
  fetchDepartments();
  fetchStatuses();
});
</script>

<style scoped>
.report-component {
  padding: 20px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}

.filters-container {
  display: flex;
  gap: 20px;
}

.filters-left,
.filters-right {
  flex: 1;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}
.filter-controls {
  display: flex;
  align-items: center;
  gap: 10px; /* Расстояние между Checkbox и Dropdown */
}

.filter-item label {
  font-size: 14px;
  font-weight: bold;
  color: #555;
}

.buttons {
  margin-top: 20px;
  text-align: right;
}

.buttons .p-button {
  margin-left: 10px;
}

.dropdown {
  width: 100px;
  flex: 1;
}

.input {
  flex: 1;
}

.calendar {
  width: 180px;
}

.additional-filters {
  padding: 15px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

.report-table {
  margin-top: 30px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.generate-btn,
.reset-btn {
  transition: background-color 0.3s ease, transform 0.3s ease;
}

.generate-btn:hover,
.reset-btn:hover {
  transform: translateY(-2px);
}
</style>

