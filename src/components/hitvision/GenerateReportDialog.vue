<template>
  <div class="dialog">
    <h2>{{ $t('hitvision.generateReport') }}</h2>
    <form @submit.prevent="generateReport">
      <div>
        <label>{{ $t('hitvision.dateRange') }}</label>
        <input type="date" v-model="startDate" />
        <input type="date" v-model="endDate" />
      </div>
      <div>
        <label>{{ $t('hitvision.category') }}</label>
        <div>
          <label><input type="checkbox" v-model="categories" value="all" />{{ $t('hitvision.all') }}</label>
          <label><input type="checkbox" v-model="categories" value="pps" />{{ $t('hitvision.pps') }}</label>
          <label><input type="checkbox" v-model="categories" value="aup" />{{ $t('hitvision.aup') }}</label>
          <!-- Добавьте остальные категории -->
        </div>
      </div>
      <div>
        <label>{{ $t('hitvision.department') }}</label>
        <select v-model="department">
          <option value="all">{{ $t('hitvision.all') }}</option>
          <!-- Добавьте остальные подразделения -->
        </select>
      </div>
      <div>
        <label>{{ $t('hitvision.employee') }}</label>
        <select v-model="employee">
          <option value="">{{ $t('hitvision.selectEmployee') }}</option>
          <!-- Добавьте остальных сотрудников -->
        </select>
      </div>
      <button type="submit">{{ $t('hitvision.generate') }}</button>
      <button type="button" @click="$emit('close')">{{ $t('hitvision.cancel') }}</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const startDate = ref('');
const endDate = ref('');
const categories = ref([]);
const department = ref('all');
const employee = ref('');

const generateReport = () => {
  console.log('Generating report with:', {
    startDate: startDate.value,
    endDate: endDate.value,
    categories: categories.value,
    department: department.value,
    employee: employee.value,
  });
  // Добавьте логику для формирования отчета
  $emit('close');
};
</script>