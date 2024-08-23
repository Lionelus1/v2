<template>
  <div class="dialog">
    <h2>{{ $t('hikvision.generateReport') }}</h2>
    <form @submit.prevent="createReports">
      <!-- Выбор диапазона дат -->
      <div class="form-group">
        <label>{{ $t('hikvision.dateRange') }}</label>
        <input type="date" v-model="startDate" class="form-control" />
        <input type="date" v-model="endDate" class="form-control" />
      </div>

      <!-- Выбор категории -->
      <div class="form-group">
        <label>{{ $t('hikvision.category') }}</label>
        <div class="checkbox-group">
          <label><input type="checkbox" v-model="categories" value="all" /> {{ $t('hikvision.all') }}</label>
          <label><input type="checkbox" v-model="categories" value="pps" /> {{ $t('hikvision.pps') }}</label>
          <label><input type="checkbox" v-model="categories" value="aup" /> {{ $t('hikvision.aup') }}</label>
          <label><input type="checkbox" v-model="categories" value="op" /> {{ $t('hikvision.op') }}</label>
          <label><input type="checkbox" v-model="categories" value="ahp" /> {{ $t('hikvision.ahp') }}</label>
          <label><input type="checkbox" v-model="categories" value="uvp" /> {{ $t('hikvision.uvp') }}</label>
          <label><input type="checkbox" v-model="categories" value="nii" /> {{ $t('hikvision.nii') }}</label>
        </div>
      </div>

      <!-- Выбор отдела -->
      <div class="form-group">
        <label>{{ $t('hikvision.department') }}</label>
        <select v-model="department" class="form-control">
          <option value="all">{{ $t('hikvision.all') }}</option>
          <!-- Добавьте опции для департаментов -->
        </select>
      </div>

      <!-- Выбор сотрудника -->
      <div class="form-group">
        <label>{{ $t('hikvision.employee') }}</label>
        <select v-model="employee" class="form-control">
          <option value="">{{ $t('hikvision.selectEmployee') }}</option>
          <!-- Добавьте опции для сотрудников -->
        </select>
      </div>

      <!-- Кнопки действий -->
      <div class="button-group">
        <button type="submit" class="btn btn-primary">{{ $t('hikvision.generate') }}</button>
        <button type="button" class="btn btn-secondary" @click="$emit('close')">{{ $t('hikvision.cancel') }}</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { ReportService } from '@/service/report.service'; // Путь к вашему файлу с ReportService

const { t } = useI18n();
const startDate = ref('');
const endDate = ref('');
const categories = ref([]);
const department = ref('all');
const employee = ref('');
const reportService = new ReportService(); // Создание экземпляра ReportService

const createReports = async () => {
  try {
    const data = {
      startDate: startDate.value,
      endDate: endDate.value,
      categories: categories.value,
      department: department.value === "all" ? null : parseInt(department.value, 10),
      employee: employee.value,

    };
    const response = await reportService.createReport(data); // Вызов правильного метода
    console.log('Report created:', response);
    $emit('reportCreated', response);
    $emit('close');
  } catch (error) {
    console.error('Error creating report:', error);
  }
};

</script>

<style scoped>
.dialog {
  width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
}

.form-control {
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
}

.checkbox-group {
  display: flex;
  flex-wrap: wrap;
}

.button-group {
  display: flex;
  justify-content: space-between;
}
</style>