<template>
  <div class="table-container">
    <div class="flex align-items-center mb-3">
      <div v-if="true" @click="onBackButtonClick" class="mr-3">
        <i class="fa-solid fa-arrow-left ml-2" style="font-size: 16px;cursor: pointer"></i>
      </div>
      <h3 class="p-0 m-0">{{ lang.value }}</h3>
      <h3 class="p-0 m-0">{{ lang === "kz" ? 'Есеп' : lang === "ru" ? 'Отчет' : 'Report' }}</h3>
    </div>

    <Dialog
        v-model:visible="showDialog"
        header="Несохраненные изменения"
        :closable="false"
        :draggable="false"
        :modal="true"
        style="width: 400px"
    >
      <p>Выйти без сохранения?</p>
      <div class="p-d-flex p-jc-between p-mt-3">
        <Button label="Остаться на странице" class="p-button-secondary" @click="cancelDialog" />
        <Button label="Выйти без сохранения" class="p-button-danger" @click="confirmLeave" />
      </div>
    </Dialog>

    <table class="table-scrollable">
      <thead>
      <tr>
        <th :rowspan="verticals.length" v-if="deps.length > 0">{{lang === "kz" ? "Құрылымдық бөлімше" : lang === "ru" ? "Структурное подразделение" : "Structural division"}}</th>
        <th :rowspan="verticals.length" v-if="organizations.length > 0">{{ lang === "kz" ? "Ұйымдар" : lang === "ru" ? "Организации" : "Organizations" }}</th>

        <th :rowspan="verticals.length" v-if="authors.length > 0">{{ lang === "kz" ? "Автор" : lang === "ru" ? "Автор" : "Author" }}</th>
        <th :rowspan="verticals.length" v-if="signers.length > 0">{{lang === "kz" ? "Қол қоюшылар" : lang === "ru" ? "Подписанты" : "Signers"}}</th>
        <th :rowspan="verticals.length" v-if="contragents.length > 0">{{ lang === "kz" ? "Контрагенттер" : lang === "ru" ? "Контрагенты" : "Contragents" }}</th>

        <template v-for="month in months" :key="month">
          <template v-if="month !== 'Total' && month !== 'Қорытынды' && month !== 'Итого'">
            <th :colspan="statuses.length">{{ month }}</th>
          </template>
          <template v-else>
            <th :colspan="statuses.length" :rowspan="verticals.length">{{ totalTitle }}</th>
          </template>
        </template>
        <!--        <th :colspan="statuses.length" v-for="month in months" :key="month">{{ month }}</th>-->

      </tr>
      <!-- Строка для статусов каждого месяца -->
      <tr v-if="statuses.length > 0">
        <!--        <th v-if="deps.length > 0 "></th>-->
        <!--        <th v-if="authors.length > 0 || contragents.length > 0 || signers.length > 0"></th>-->
        <template v-for="month in months" :key="month">
          <template v-if="month !== 'Total' && month !== 'Қорытынды' && month !== 'Итого' ">
            <th v-for="status in statuses" :key="status">{{ status }}</th>
          </template>
        </template>
      </tr>
      </thead>
      <tbody>
      <tr v-for="row in tableData.rows" :key="row.department">
        <template v-if="row.department !== 'Итого' && row.department !== 'Қорытынды' && row.department !== 'Total'">
          <td v-if="deps.length > 0 || organizations.length > 0">{{ formatDepartment(row.department) }}</td>
        </template>
        <template v-else>
          <td :colspan="horizantals.length" v-if="deps.length > 0 || organizations.length > 0">{{ formatDepartment(row.department) }}</td>
        </template>

        <!-- Колонка для "Author" -->
        <template v-if="row.department !== 'Итого' && row.department !== 'Қорытынды' && row.department !== 'Total'">
          <td v-if="authors.length > 0 || contragents.length > 0 || signers.length > 0">{{ row.author || 'N/A' }}</td>
        </template>

        <!-- Динамические ячейки для каждого месяца -->
        <template v-for="month in months" :key="month">
          <template v-if="month !== totalTitle">
            <template v-if="statuses.length > 0">
              <td v-for="status in statuses" :key="status">
                {{ getStatusForMonth(row, month, status) }}
              </td>
            </template>
            <template v-else>
              <td>{{ getStatusForMonth(row, month, null) }}</td>
            </template>
          </template>
        </template>

        <td>
          {{ getStatusForMonth(row, totalTitle, null) }}
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import {ref, onMounted} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {useI18n} from "vue-i18n";
import {ReportService} from "@/service/report.service";
import {useToast} from "primevue/usetoast";
import axios from "axios";
import {getHeader, smartEnuApi} from "@/config/config";
import {FileService} from "@/service/file.service";

const loading = ref(false);
const router = useRouter();
const route = useRoute();
const active = ref(null);
const {t, locale} = useI18n()
const isDirty = ref(true);
const showDialog = ref(false);
const reportService = new ReportService();
const fileService = new FileService();

// Для хранения данных таблицы
const tableData = ref({
  headers: [],
  rows: [],
});

const onBackButtonClick = () => {
    goBack();
}

const cancelDialog = () => {
  showDialog.value = false;
}

const confirmLeave = () => {
  showDialog.value = false;
  goBack();
}

const goBack = () => {
  router.push({"path": "/reports"});
}

const menu = ref([
  {
    label: t("common.save"),
    icon: "pi pi-fw pi-save",
    visible: true,
    command: () => {
      saveReport()
    },
  },
  {
    label: t("common.download"),
    icon: "pi pi-fw pi-download",
    visible: true,
    command: () => {
      downloadReport()
    },
  }
]);

const toolbarCommand = () => {
  alert('good')
}

const statusNames = {
  status_created: {kz: 'құрылды', ru: 'создан', en: 'created'},
  status_inapproval: {kz: 'келісуде', ru: 'на согласовании', en: 'inapproval'},
  status_approved: {kz: 'келісілді', ru: 'согласован', en: 'approved'},
  status_revision: {kz: 'түзетуге', ru: 'на доработку', en: 'revision'},
  status_rejected: {kz: 'қайтарылды', ru: 'отклонен', en: 'rejected'},
  status_signing: {kz: 'қол қоюда', ru: 'на подписи', en: 'signing'},
  status_signed: {kz: 'қол қойылды', ru: 'подписан', en: 'signed'},
  status_reapproval: {kz: 'қайта бекітуге жіберілді', ru: 'отправлен на переутверждение', en: 'sent for re-approval'},
  status_issued: {kz: 'берілді', ru: 'выдан', en: 'issued'},
};

// Для вычисления месяцев
const months = ref([]);
let totalTitle = ''
// Для статусов
const contragents = ref([]);
const organizations = ref([]);
const statuses = ref([]); // Будет хранить статусы из фильтра
const authors = ref([]); // Будет хранить статусы из фильтра
const signers = ref([]);
const deps = ref([]); // Будет хранить статусы из фильтра
const verticals = ref([]); // Будет хранить статусы из фильтра
const horizantals = ref([]); // Будет хранить статусы из фильтра
let filePath = ref(null); // Будет хранить статусы из фильтра

const toast = useToast()
let lang = ''; // Будет хранить статусы из фильтра

// Даты периода
let periodStart = '';
let periodEnd = '';

// Инициализация при монтировании компонента
onMounted(() => {
  loadReportData();
  extractFiltersFromUrl();
  generateMonths();
});

async function saveReport() {
  try {
    let filters = route.query.filters ? JSON.parse(route.query.filters) : {};
    filters.filters.tableData = tableData.value
    loading.value = true;

    // if (filters.filters.period_start) {
    //   filters.filters.period_start = filters.filters.period_start.split('T')[0]; // Отрезаем время
    // }
    //
    // if (filters.filters.period_end) {
    //   filters.filters.period_end = filters.filters.period_end.split('T')[0]; // Отрезаем время
    // }

    const response = await reportService.saveReport(filters);
    await router.push({"path": "/reports"});
  } catch (error) {
    console.error("Error generating report: ", error);
    toast.add({severity: 'error', detail: t('reports.errorGeneratingReport'), life: 3000});
  } finally {
    loading.value = false;
  }
}

const downloadReport = () => {
  const req = {
    filePath: filePath
  }

  fileService.downloadFile(req).then(response => {
    const link = document.createElement("a");
    link.href = "data:application/octet-stream;base64," + response.data;
    link.setAttribute("download", "this.file.name");
    link.download = "Report";
    link.click();
    URL.revokeObjectURL(link.href);
  })
      .catch((error) => {
        toast.add({
          severity: "error",
          summary: "downloadFileError:\n" + error,
          life: 3000,
        });
      });
};

// Извлечение фильтров из URL
function extractFiltersFromUrl() {
  const storedFilters = localStorage.getItem("filter");
  const parsedData = JSON.parse(storedFilters);
  const filters = parsedData || {};

  // const filters = route.query.filters ? JSON.parse(route.query.filters) : {};

  if (filters.filters) {
    lang = filters.filters.lang || 'en'; // Язык по умолчанию — английский
    statuses.value = (filters.filters.statuses || []).map(status => {
      return statusNames[status] ? statusNames[status][lang] : status;
    });

    authors.value = filters.filters.authors || [];
    contragents.value = filters.filters.contragents || [];
    organizations.value = filters.filters.organizations || [];
    verticals.value = filters.vertical_filters || []
    horizantals.value = filters.horizontal_filters || []
    deps.value = filters.filters.departments || [];
    signers.value = filters.filters.signers || [];
    periodStart = filters.filters.period_start || '';
    periodEnd = filters.filters.period_end || '';
    filePath = filters.file_path || ''

    if (lang === "kz") {
      totalTitle = 'Қорытынды'
    } else if (lang === "ru") {
      totalTitle = 'Итого'
    } else {
      totalTitle = 'Total'
    }
  }

}

// Загрузка данных отчета из localStorage
function loadReportData() {
  const storedData = localStorage.getItem("docReports");
  if (storedData) {
    const parsedData = JSON.parse(storedData);
    tableData.value = parsedData || {headers: [], rows: []};
  } else {
    router.push({name: "GenerateReport"});
  }
}

// Генерация списка месяцев между периодами
function generateMonths() {
  if (!periodStart || !periodEnd) return;

  const start = new Date(periodStart);
  const end = new Date(periodEnd);

  const monthList = [];
  let currentDate = start;

  while (currentDate <= end) {
    // Форматирование месяца в "YYYY-MM"
    const month = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    monthList.push(month);
    currentDate.setMonth(currentDate.getMonth() + 1); // Переход к следующему месяцу
  }

  monthList.push(totalTitle)
  months.value = monthList;
}

// Получение статуса для каждого месяца и статуса
function getStatusForMonth(row, month, status) {
  const monthIndex = months.value.indexOf(month);
  if (monthIndex === -1) return 'N/A';

  let statusKey
  if (status != null) {
    statusKey = `${month}-${status}`;
  } else {
    statusKey = `${month}`;
  }


  // Возвращаем значение, если оно существует, иначе '0'
  const statusValue = row.data[statusKey];
  return statusValue !== undefined ? statusValue : '0';
}

// Форматирование заголовков
function formatHeader(header) {
  return header
      .replace(/_/g, " ")
      .replace(/status_/g, "Status ")
      .replace(/-/g, " ");
}

// Форматирование департамента
function formatDepartment(department) {
  return department.replace(/Department_/g, "");
}

</script>

<style scoped>
.table-container {
  padding: 1rem;
}

h1 {
  text-align: center;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  font-size: 0.9rem;
  overflow: scroll;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}

th {
  background-color: #f4f4f4;
  font-weight: bold;
}

tr:nth-child(even) {
  background-color: #f9f9f9;
}

tr:hover {
  background-color: #f1f1f1;
}

.table-scrollable {
  display: block;
  max-height: 800px; /* Задайте подходящую высоту */
  overflow: scroll;
  overflow-y: auto; /* Включает вертикальный скроллинг */
  border: 1px solid #ddd; /* Рамка вокруг области таблицы */
}

.back-button {
  display: inline-block;
  padding: 0.5rem 1rem;
  margin-bottom: 1rem;
  color: #fff;
  background-color: #007bff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  text-align: center;
}

.back-button:hover {
  background-color: #0056b3;
}
</style>
