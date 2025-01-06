<template>
  <div class="report-component">
    <h3 class="title">{{ $t('report.ReportDesigner') }}</h3>

    <!-- Основные фильтры и дополнительные фильтры -->
    <div class="filters-container">
      <!-- Левая часть -->
      <div class="filters-left">
        <!-- Категория -->
        <div class="filter-item">
          <label>{{ $t('report.TypeDocument') }}</label>
          <div class="dropdownFullWidth">
            <Dropdown
                v-if="true"
                v-model="filters.typeReport2"
                :options="typeReports"
                optionLabel="label"
                :placeholder="$t('report.SelectCategory')"
                class="dropdown full-width"
            />
          </div>
        </div>

        <div v-if="filters.typeReport2?.value === 5" class="filter-item" style="width: 115%">
          <label>{{ $t('report.TypeContract') }}</label>
          <CustomMultiSelect
              style="width: 115%"
              class="CustomMultiSelectTypeContract"
              v-model="filters.reportTypes.value"
              :options="reportCategoriesFormatted"
              :placeholder="$t('report.SelectContractTypes')"
              @update:modelValue="updateSelectedTypeContracts"
          />
<!--          <MultiSelect v-model="filters.reportTypes.value" display="chip" :options="reportCategories" optionLabel="label" filter-->
<!--                       placeholder="Выберите тип договоров"-->
<!--                       :maxSelectedLabels="3" class="" style="width: 538px;"   :selectedItemsTemplate="customSelectedTemplate"/>-->
        </div>


        <!-- Период -->
        <div class="filter-item">
          <label>{{ $t('report.period') }}</label>
          <Calendar
              v-model="filters.period_start"
              :placeholder="$t('report.StartDate')"
              :showIcon="true"
              :dateFormat="'dd.mm.yy'"
              class="calendar"
          />
          <Calendar
              v-model="filters.period_end"
              :placeholder="$t('report.EndDate')"
              :showIcon="true"
              :dateFormat="'dd.mm.yy'"
              class="calendar"
          />
        </div>


        <div>
          <h6>Язык:</h6>
          <div class="flex flex-wrap gap-4">
            <div class="flex items-center gap-2">
              <RadioButton v-model="filters.lang" inputId="kz" name="language" value="kz"/>
              <label for="ingredient1">Қазақша</label>
            </div>
            <div class="flex items-center gap-2">
              <RadioButton v-model="filters.lang" inputId="ru" name="language" value="ru"/>
              <label for="ingredient2">Орысша</label>
            </div>
            <div class="flex items-center gap-2">
              <RadioButton v-model="filters.lang" inputId="en" name="language" value="en"/>
              <label for="ingredient3">English</label>
            </div>
          </div>
        </div>
      </div>

      <div v-if="true" class="filters-right">
        <div class="additional-filters">
          <div style="display: grid; gap: 16px">
            <div style="margin: auto">
              <input type="checkbox" id="department" value="filters.department.enabled"
                     v-model="filters.department.enabled" @change="onDepartmentChange"/>
            </div>
            <div style="margin: auto"><input type="checkbox" id="status" value="filters.status.enabled"
                        v-model="filters.status.enabled" @change="onStatusChange"/></div>
            <div style="margin: auto"> <input type="checkbox" id="author" value="filters.author.enabled"
                        v-model="filters.author.enabled" @change="onAuthorChange"/></div>
            <div style="margin: auto"> <input type="checkbox" id="signers" value="filters.signers.enabled"
                         v-model="filters.signers.enabled" @change="onSignersChange"/></div>
            <div style="margin: auto"> <input type="checkbox" id="contragent" value="filters.contragent.enabled"
                         v-model="filters.contragent.enabled" @change="onContragentChange"/></div>
          </div>
          <div style="display: grid; gap: 16px">
            <div style="margin: auto; margin-left: 0;">
              <label>{{ $t('report.department') }}</label>
            </div>
            <div style="margin: auto; margin-left: 0;"><label>{{ $t('report.status') }}</label></div>
            <div style="margin: auto; margin-left: 0;" ><label>{{ $t('report.author') }}</label></div>
            <div style="margin: auto; margin-left: 0;"><label>{{ $t('report.signers') }}</label></div>
            <div style="margin: auto; margin-left: 0;"><label>{{ $t('report.contragents') }}</label></div>
          </div>
          <div style="display: grid; gap: 16px; width: 100%;">
            <div>
                <CustomMultiSelect
                    style="width: 100%"
                    v-model="filters.department.value"
                    :options="departmentsFormatted"
                    :disabled="!filters.department.enabled"
                    :placeholder="$t('report.SelectDepartments')"
                    class="dropdownFullWidth"
                    @update:modelValue="updateSelectedTypeDeps"
                />
            </div>
            <div>
                <CustomMultiSelect
                    style="width: 100%"
                    v-model="filters.status.value"
                    :options="statusesFormatted"
                    :disabled="!filters.status.enabled"
                    :placeholder="$t('report.SelectStatuses')"
                    class="customStatusSelect"
                    @update:modelValue="updateSelectedTypeStatuses"
                />
            </div>
            <div >
                <FindUser
                    :placeholder="$t('common.fullName')"
                    :searchMode="searchMode"
                    v-model="filters.author.value"
                    :user-type="3"
                    :editMode="true"
                    :disabled="!filters.author.enabled"
                    class="w-fullAuthor"
                    @add="addAuthor"
                />
            </div>
            <div >
                <FindUser
                    :placeholder="$t('common.fullName')"
                    :searchMode="searchMode"
                    v-model="filters.signers.value"
                    :user-type="3"
                    :max="4"
                    :editMode="true"
                    :disabled="!filters.signers.enabled"
                    class="w-fullSigners"
                    @add="addSigners"
                />
            </div>
            <div >
                <FindUser
                    :placeholder="$t('common.fullName')"
                    :searchMode="searchModeAll"
                    v-model="filters.contragent.value"
                    :user-type="3"
                    :max="4"
                    :editMode="true"
                    :disabled="!filters.contragent.enabled"
                    class="w-fullContragent"
                    @add="addContragents"
                />
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Кнопки -->
    <div class="buttons">
      <Button
          :label="$t('report.generate')"
          icon="pi pi-file"
          class="p-button-success generate-btn"
          @click="generateReport"
      />
      <Button
          :label="$t('report.reset')"
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
            :first="first"
            @page="onPage"
        >
          <Column :field="'typeReportName' + $i18n.locale" :header="$t('report.TypeReport')"/>
          <Column :field="'period'" :header="$t('report.period')"/>
          <Column :field="'author'" :header="$t('report.author')"/>
          <Column :field="'createdDate'" :header="$t('report.createdDate')"/>
          <Column v-if="false" :field="'doc'" disabled="true" ></Column>
          <Column>
            <template #body="{data}">
              <ActionButton :show-label="true" :items="actions" @toggle="toggle(data)" />
            </template>
          </Column>
        </DataTable>
      </BlockUI>
    </div>
  </div>
</template>

<script setup>
import {useRouter} from "vue-router";
import {ref, onMounted, computed, watch} from 'vue';
import {useToast} from 'primevue/usetoast';
import {useI18n} from 'vue-i18n';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import MultiSelect from 'primevue/multiselect';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import BlockUI from 'primevue/blockui';
import {ReportService} from '@/service/report.service';
import {UserService} from "@/service/user.service";
import {DocService} from "@/service/doc.service";
import ActionButton from "@/components/ActionButton.vue";
import {ContragentService} from "@/service/contragent.service";
import {getHeader, smartEnuApi} from "@/config/config";
import {useConfirm} from "primevue/useconfirm";
import CustomMultiSelect from "@/components/custom/CustomMultiSelect.vue";


const toast = useToast();
const {t, locale} = useI18n();
const reportService = new ReportService();
const userService = new UserService();
const docService = new DocService()
const contragentService = new ContragentService();

const reportCategories = ref([]);
const typeReports = ref([]);
const departments = ref([]);
const statuses = ref([]);
const organizations = ref([]);
const contragents = ref([]);
const maxSelectedMax = ref(3)

const reportCategoriesFormatted = computed(() => {
  return reportCategories.value.map((rc) => ({
    name: rc.label, // label -> name
    value: rc.code, // code -> value
  }));
});


const selectedItems = ref([]);
const items = ref([
  { name: 'Опция 1', value: '1' },
  { name: 'Опция 2', value: '2' },
  { name: 'Опция 3', value: '3' },
]);

const selectedCodes = ref([]);

const updateSelectedTypeContracts = (selectedValues) => {
  filters.value.reportTypes.value = selectedValues.map((value) => {
    return value;
  });
};

const updateSelectedTypeDeps = (selectedValues) => {
  filters.value.department.value = selectedValues.map((value) => {
    return value;
  });

};

const updateSelectedTypeStatuses = (selectedValues) => {
  filters.value.status.value = selectedValues.map((value) => {
    return value;
  });
};

const customDep = ref([{
  label:"all",
  // name_en:"all",
  // name_ru:"all",
}])
const searchMode = {
  type: String,
  default: 'ldap'
};

const searchModeAll = {
  type: String,
  default: 'ldap'
};

const filters = ref({
  category: {enabled: false, value: []},
  department: {enabled: false, value: []}, // Массив для множественного выбора
  contragent: {enabled: false, value: []},
  signers: {enabled: false, value: []},
  individuals: {enabled: false, value: []},
  noAuth: {enabled: false, value: []},
  organizations: {enabled: false, value: []},
  status: {enabled: false, value: []}, // Массив для множественного выбора
  period_start: null,
  period_end: null,
  lang: null,
  author: {enabled: false, value: []},
  reportTypes: {value: []},
  typeReport2: null,
});

const ListCategories = [
  {
    nameKz: "Үш жақты келісім-шарт",
    nameRu: "Трехсторонний договор",
    nameEn: "Report Category 1",
    code: 5,
    id: 32,
  },
  {
    nameKz: "Екі жақты келісім-шарт",
    nameRu: "Двухсторонний договор",
    nameEn: "Report Category 2",
    code: 5,
    id: 34  ,
  },
  {
    nameKz: "Студенттік үйде төсек-орын беру шарты",
    nameRu: "Договор на предоставление койко-места в Студенческом доме",
    nameEn: "Agreement for the Provision of a Bed Space in the Student Dormitory",
    code: 5,
    id: 134,
  },
];

const ListTypeReports = [
  {
    nameKz: "Келісім-шарт",
    nameRu: "Договор",
    nameEn: "Contract",
    id:  5,
  },
];

const dataTypeReports = ListTypeReports.map((typeReport) => {
  const label = locale.value === "kz"
      ? typeReport.nameKz
      : locale.value === "ru"
          ? typeReport.nameRu
          : typeReport.nameEn;

  return {
    label,
    value: typeReport.id,
  };
});
// const categories = ref([]);
const categories = ListCategories.map((cat) => {
  const label = locale.value === "kz"
      ? cat.nameKz
      : locale.value === "ru"
          ? cat.nameRu
          : cat.nameEn;

  return {
    label,
    code: cat.id,
    id: cat.id,
  };
});

const onSignersChange = () => {
  if (filters.value.signers.enabled) {
    filters.value.department.enabled = false;
    filters.value.author.enabled = false;
    filters.value.contragent.enabled = false;
  } else if (!filters.value.author.enabled) {
    filters.value.signers.value = [];
  }
};

const onContragentChange = () => {
  if (filters.value.contragent.enabled) {
    filters.value.department.enabled = false;
    filters.value.author.enabled = false;
    filters.value.signers.enabled = false;
  } else if (!filters.value.author.enabled) {
    filters.value.contragent.value = [];
  }
};

const customSelectedTemplate = () => {
  if (filters.value.reportTypes.value.length === reportCategories.value.length) {
    return "Все";
  }
  return filters.value.reportTypes.value
      .map((id) => reportCategories.value.find((item) => item.value === id)?.label)
      .join(", ");
};

const onAuthorChange = () => {
  if (filters.value.author.enabled) {
    filters.value.contragent.enabled = false;
    filters.value.signers.enabled = false;
  } else if (!filters.value.author.enabled) {
    filters.value.author.value = [];
  }
};

const onDepartmentChange = () => {
  if (filters.value.department.enabled) {
    filters.value.contragent.enabled = false;
    filters.value.signers.enabled = false;
  } else if (!filters.value.department.enabled) {
    filters.value.department.value = [];
  }
};

const onStatusChange = () => {
   if (!filters.value.status.enabled) {
    filters.value.status.value = [];
  }
};

const reports = ref([]);
const totalRecords = ref(0);
const loading = ref(false);
const first = ref(0);
const rows = 10; // Количество записей на странице
const categoryID = 7; // Категория всегда 7
const router = useRouter()

const actionsNode = ref(null)
const toggle = (node) => {
  actionsNode.value = node
}

const actions = computed(() => {
  return [
    {
      label: t('common.show'),
      icon: "fa-solid fa-eye",
      command: () => {
        showReport(actionsNode.value.doc)
      },
    },
    {
      label: t('common.delete'),
      icon: "fa-solid fa-trash-can",
      command: () => {
        deleteReportBefore(actionsNode.value.id)
      },
    },
    {
      label: t("common.download"),
      icon: "pi pi-fw pi-download",
      command: () => {
        downloadReportFile(actionsNode.value.type, actionsNode.value.doc.newParams.request.value.file_path)
      },
    },
  ]
})


const showReport = (doc) => {

  localStorage.setItem('docReports', JSON.stringify(doc.newParams.tableData.value));
  localStorage.setItem('filter', JSON.stringify(doc.newParams.request.value));

  router.push({
    name: 'ReportView',
    params: { report: doc }
  });
}

const downloadReportFile = (type, filePath) => {
  loading.value = true;

  let nameFile = (locale.value === "kz" ? type.name_kz : locale.value === "ru" ? type.name_ru : type.name_en) + ".xlsx";

  fetch(`${smartEnuApi}/serve?path=${encodeURIComponent(filePath)}`, {
    method: 'GET',
    headers: getHeader(),
  })
      .then((response) => {
        if (!response.ok) {
          throw response;
        }
        return response.blob();
      })
      .then((blob) => {
        loading.value = false;

        // Create a URL for the blob object
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download =
            (locale.value === "kz" ? type.name_kz : locale.value === "ru" ? type.name_ru : type.name_en) + ".xlsx";
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);  // Clean up the URL object
      })
      .catch((error) => {
        loading.value = false;

        if (error.status === 401) {
          store.dispatch("logOut");
        } else if (error.json) {
          error.json().then((errData) => {
            if (errData.localized) {
              showMessage('error', t(errData.localizedPath), null);
            } else {
              showMessage('error', t('common.message.actionError'), t('common.message.actionErrorContactAdmin'));
            }
          }).catch(() => {
            showMessage('error', t('common.message.actionError'), t('common.message.actionErrorContactAdmin'));
          });
        } else {
          showMessage('error', t('common.message.actionError'), t('common.message.actionErrorContactAdmin'));
        }
      });
}

function showMessage(msgtype, message, content) {
  toast.add({
    severity: msgtype,
    summary: message,
    detail: content,
    life: 3000
  });
}
const confirm = useConfirm();

const deleteReportBefore = (reportID) => {
  confirm.require({
    message: t('common.doYouWantDelete'),
    header: t('common.delete'),
    icon: 'pi pi-info-circle',
    acceptClass: 'p-button-rounded p-button-success',
    rejectClass: 'p-button-rounded p-button-danger',
    accept: () => {
      deleteReport(reportID)
    },
  });
}
const deleteReport = (reportID) => {
  const response = reportService.deleteReport({id: reportID})
  if (response) {
    loadReports()
  }
}

const loadReports = async (page = 0) => {
  loading.value = true;
  try {
    const response = await reportService.getReportsByCatID({
      category_id: categoryID,
      page,
      rows,
    });
    // Преобразуем данные для таблицы
    const {reports: fetchedReports, totalRecords: total} = response.data;

    reports.value = fetchedReports.map((report) => ({
      id: report.id,
      typeReport: report.type?.['name_' + locale.value] || "-",
      typeReportNamekz: report.type?.['name_kz'] || "-",
      typeReportNameru: report.type?.['name_ru'] || "-",
      typeReportNameen: report.type?.['name_en'] || "-",
      period: `${formatDate(report.start_date)} - ${formatDate(report.end_date)}`,
      author: report.author?.fullName || "-",
      createdDate: formatDate(report.creation_date),
      doc: report.doc || null,
      type: report.type || null
    }));

    totalRecords.value = total;
  } catch (error) {
    console.error("Ошибка загрузки отчетов:", error);
  } finally {
    loading.value = false;
  }
};

const onPage = (event) => {
  first.value = event.first;
  const page = Math.floor(event.first / rows);
  loadReports(page);
};

// Форматирование даты
const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString(getCurrentLang());
};

// Получение текущего языка интерфейса
const getCurrentLang = () => {
  // Получаем текущий язык (например, из Vue i18n)
  return "kz"; // Или "ru", "en" в зависимости от локали
};

const fetchCategories = async () => {
  try {
    const response = await docService.getStates();
    reportCategories.value = categories;
  } catch (error) {
    toast.add({severity: 'error', detail: t('reports.errorFetchingCategories'), life: 3000});
  }
};

const fetchReportTypes = async () => {
  try {
    typeReports.value = dataTypeReports;
  } catch (error) {
    toast.add({severity: 'error', detail: t('reports.errorFetchingCategories'), life: 3000});
  }
};

const addAuthor = (selectedUser) => {
  if (!filters.value.author.value.some(author => author.id === selectedUser.id)) {
    filters.value.author.value.push({id: selectedUser.id, label: selectedUser.label});
    }
};

const addSigners = (selectedUser) => {
  if (!filters.value.signers.value.some(signers => signers.id === selectedUser.id)) {
    filters.value.signers.value.push({id: selectedUser.id, label: selectedUser.label});
  }
}

const addContragents = (selectedUser) => {
  if (!filters.value.contragent.value.some(contr => contr.id === selectedUser.id)) {
    filters.value.contragent.value.push({id: selectedUser.id, label: selectedUser.label});
  }
}


const fetchDepartments = async () => {
  try {
    const filters1 = {
      orgId: 1,
      isFaculty: false,
      cafedraId: null,
      isCafedra: false,
      HasManager: false
    };

    const filters2 = {
      orgId: 1,
      isFaculty: true,
      cafedraId: null,
      isCafedra: false,
      HasManager: false
    };

    const response1 = await userService.departments(filters1);
    const response2 = await userService.departments(filters2);

    departments.value = [
      ...response1.data.departments.map((dept) => ({
        label: locale.value === "kz" ? dept.nameKz : locale.value === "ru" ? dept.nameRu : dept.nameEn,
        code: dept.id,
      })),
      ...response2.data.departments.map((dept) => ({
        label: locale.value === "kz" ? dept.nameKz : locale.value === "ru" ? dept.nameRu : dept.nameEn,
        code: dept.id,
      }))
    ];

  } catch (error) {
    toast.add({severity: 'error', detail: t('reports.errorFetchingDepartments'), life: 3000});
  }
};



const departmentsFormatted = computed(() => {
  return departments.value.map((dept) => ({
    name: dept.label, // label -> name
    value: dept.code, // code -> value
  }));
});



const fetchOrganizations = async () => {
  try {
    const activeFilters = {
      filter: {
        address: null,
        country_id: null,
        form_id: null,
        name: "",
        organization_industry_id: null,
        other_parameters_id: null,
        resident: 1,
      }
    }
    const response = await contragentService.getOrganizations(activeFilters);
    organizations.value = response.data.organizations.map((organization) => ({
      label: locale.value === "kz" ? organization.name : locale.value === "ru"
          ? organization.nameru : organization.nameen,
      value: organization.id,
    }));
  } catch (error) {
    toast.add({severity: 'error', detail: t('reports.errorFetchingStatuses2'), life: 3000});
  }
};

const page = ref(0);

const fetchStatuses = async () => {
  try {
    const response = await docService.getStates();
    statuses.value = response.data.map((status) => ({
      label: locale.value === "kz" ? status.nameKz : locale.value === "ru"
          ? status.nameRu : status.nameEn,
      code: status.code,
    }));
  } catch (error) {
    toast.add({severity: 'error', detail: t('report.errorFetchingStatuses3'), life: 3000});
  }
};

const statusesFormatted = computed(() => {
  return statuses.value.map((status) => ({
    name: status.label,
    value: status.code,
  }));
});

const validateReportFields = (filters) => {
  // const { document_type, reportTypes, lang, author, department, status, signers, contragent } = filters.value;

  if (!filters.document_type) {
    showMessage('error', t('report.validation.reportTypesRequired'), t('report.validation.reportTypesRequired'));
    return false;
  }

  if (!filters.report_types.length) {
    showMessage('error', t('report.validation.ContractRequired'), t('report.validation.ContractRequired'));
    return false;
  }

  if (!filters.lang) {
    showMessage('error', t('report.validation.languageRequired'), t('report.validation.languageRequired'));
    return false;
  }

  if (!filters.period_start) {
    showMessage('error', t('report.validation.PeriodRequired'), t('report.validation.PeriodRequired'));
    return false;
  }

  if (!filters.period_end) {
    showMessage('error', t('report.validation.PeriodRequired'), t('report.validation.PeriodRequired'));
    return false;
  }

  if (
      !filters.authors.length && !filters.departments.length &&
      !filters.signers.length &&
      !filters.contragents.length
  ) {
    showMessage(
        'error',
        t('report.validation.recipientRequired'),
        t('report.validation.recipientRequired')
    );
    return false;
  }

  return true;
};


const generateReport = async () => {

  const activeFilters = {
    filters: {
      authors: filters.value.author.value.map(author => author.userID),
      // authors: [180433, 180434, 156581, 142675],
      // authors: [],
      departments: filters.value.department.value,
      statuses: filters.value.status.value,
      period_start: filters.value.period_start,
      period_end: filters.value.period_end,
      lang: filters.value.lang,
      // report_type: 1,
      // departments: [18594, 18595],
      // departments: [],
      // signers: [156581],
      // signers: [],
      signers: filters.value.signers.value.map(signer => signer.value),
      contragents: filters.value.contragent.value.map(contr => contr.value),
      // contragents: [170572],
      // organizations: [13723],
      // contragents: [],
      // statuses: ['status_created', 'status_approved', 'status_signing'],
      // statuses: [],
      // period_start: '2022-11-07T20:00:00.000Z',
      // period_end: '2024-11-27T20:00:00.000Z',
      // lang: 'kz',
      document_type: filters.value.typeReport2?.value,
      report_types: filters.value.reportTypes.value,
      // report_type: filters.value.category.value.value,
      file_path: '',
    },
    vertical_filters: [],
    horizontal_filters: [],
    // vertical_filters: ['period', 'status'],
    // horizontal_filters: ['author', 'department'],
  };


  if (!validateReportFields(activeFilters.filters)) {
    return; // Stop execution if validation fails
  }

  if (activeFilters.filters.statuses?.length) {
    activeFilters.vertical_filters.push('status');
  }
  activeFilters.vertical_filters.push('period');

  if (activeFilters.filters.authors?.length || activeFilters.filters.departments?.length) {
    if (activeFilters.filters.authors?.length) {
      activeFilters.horizontal_filters.push('author');
    }
    if (activeFilters.filters.departments?.length) {
      activeFilters.horizontal_filters.push('department');
    }
  }

  try {
    loading.value = true;
    const response = await reportService.getReportData(activeFilters);
    activeFilters.file_path = response.data.filePath

    localStorage.setItem('docReports', JSON.stringify(response.data));

    router.push({
      name: "ReportPreview",
      query: {filters: JSON.stringify(activeFilters)}
    });

  } catch (error) {
    console.error("Error generating report: ", error);
    toast.add({severity: 'error', detail: t('reports.errorGeneratingReport'), life: 3000});
  } finally {
    loading.value = false;
  }
};

const resetFilters = () => {
  for (const key in filters.value) {
    const filter = filters.value[key];
    if (filter && typeof filter === 'object' && 'enabled' in filter && 'value' in filter || key === "reportTypes") {
      filter.enabled = false;
      filter.value = Array.isArray(filter.value) ? [] : null;
    } else {
      filters.value[key] = key === 'typeReport2' ? null : null;
    }
  }

};


onMounted(() => {
  fetchCategories();
  fetchDepartments();
  fetchStatuses();
  loadReports();
  fetchOrganizations();
  fetchReportTypes();
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

.filters-controls {
  flex: 2;
}

.filter-controls label {
  min-width: 150px; /* Фиксированная ширина для всех меток */
  text-align: left; /* Текст всегда выравнивается влево */
}

.filters-labels {
  flex: 1;
}

.filters-labels label {
  display: block;
  font-size: 14px;
  font-weight: bold;
  color: #555;
  margin-bottom: 16px;
  min-width: 150px;
}

.filters-controls .filter-item {
  margin-bottom: 16px;
}

.filters-controls .filter-controls {
  display: flex;
  align-items: center;
  gap: 10px;
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
  display: flex;
  gap: 20px;
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

.filter-item {
  display: flex;
  flex-direction: column;
}

.dropdown.full-width {
  width: 60%; /* Растягивает Dropdown на всю ширину родительского контейнера */
  box-sizing: border-box; /* Учитывает padding и border в ширине */
}

.filter-contragent .contr {
  display: flex;
  gap: 32px; /* Расстояние между колонками */
  align-items: flex-start;
  margin-bottom: -7px
}

.filter-contragent .contr > div {
  display: flex;
  flex-direction: column; /* Чекбокс сверху, MultiSelect снизу */
  gap: 12px; /* Расстояние между чекбоксом и MultiSelect */
}

.filter-contragent .contr label {
  font-weight: bold;
}

.filter-contragent .contr input[type="checkbox"] {
  margin-right: 8px;
}

.contr {
  margin-top: 2%;
}

.text-contr {
  margin-left: 1.5%;
}
.w-fullStatus {
  margin-left: 5%;
  width: 30%;
}

.w-fullDepartment {
  width: 60%;
}

.CustomMultiSelectDepartment,
.dropdownFullWidth,
.customStatusSelect,
.w-fullAuthor,
.w-fullSigners,
.w-fullContragent {
  width: 300px;
  max-width: 100%;
}

.dropdownFullWidth {
  width: 300px; /* Устанавливаем фиксированную ширину */
  max-width: 100%; /* Для адаптивности */
  display: inline-block; /* Гарантирует, что div не изменяет свои размеры */
}

.dropdownFullWidth .dropdown {
  width: 100%; /* Делаем dropdown адаптивным */
}

.CustomMultiSelectTypeContract {
  max-width: 34.3%;
}

</style>

