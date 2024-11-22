<template>
  <div>
    <form>
      <label>Тип отчета:</label>
      <select v-model="selectedType">
        <option value="">Все</option>
      </select>
    </form>

    <table class="table">
      <thead>
      <tr>
        <th>Тип</th>
        <th>Дата создания</th>
        <th>Автор</th>
        <th>Статус</th>
        <th>Действия</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="report in filteredReports" :key="report.id">
        <td>{{ report.type }}</td>
        <td>{{ report.createdAt }}</td>
        <td>{{ report.author }}</td>
        <td>{{ report.status }}</td>
        <td>
          <button @click="viewReport(report)">Просмотр</button>
          <button @click="editReport(report)">Редактирование</button>
          <button @click="deleteReport(report)">Удаление</button>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import api from "@/service/api";
import {smartEnuApi} from "@/config/config";

export default {
  data() {
    return {
      reports: [], // Данные отчетов, полученные с сервера
      selectedType: '',
      filteredReports: [],
    };
  },
  mounted() {
    this.fetchReports();
  },
  methods: {
    fetchReports() {
      // Запрос на получение отчетов с сервера
      // api.get(smartEnuApi('/api/reports')
      //     .then(response => {
      //       this.reports = response.data;
      //       this.filteredReports = this.reports;
      //     })
      //     .catch(error => {
      //       console.error(error);
      //     });
    },
    filterReports() {
      // Фильтрация отчетов по выбранным критериям
      this.filteredReports = this.reports.filter(report => {
        // Логика фильтрации
        return report.type === this.selectedType;
      });
    },
    viewReport(report) {
      // Логика просмотра отчета (например, открытие модального окна)
    },
    editReport(report) {
      // Логика редактирования отчета
    },
    deleteReport(report) {
      // Логика удаления отчета
    },
  },
  watch: {
    selectedType() {
      this.filterReports();
    },
  },
};
</script>