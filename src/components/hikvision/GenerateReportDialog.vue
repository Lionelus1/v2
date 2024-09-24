<template>
  <div class="dialog">
    <h2>{{ $t('hikvision.generateReport') }}</h2>
    <form @submit.prevent="createReports">
      <div class="form-group">
        <label>{{ $t('hikvision.dateRange') }}</label>
        <div class="calendar-group">
          <PrimeCalendar v-model="startDate" dateFormat="dd/mm/yy" />
          <PrimeCalendar v-model="endDate" dateFormat="dd/mm/yy"  />
        </div>
      </div>

      <div class="field col-12" :binary="true" v-if="FindRole(null,'hikvision')">
        <label>{{ $t('hikvision.category') }}</label>
        <div class="checkbox-group">
          <div class="field-checkbox" v-for="subject in categoriesV2" :key="subject.id">
            <Checkbox :inputId="subject.id" v-model="subject.is_noted" :binary="true" />
            <label :for="subject.id">{{ subject.code }}</label>
          </div>
        </div>
      </div>

      <div class="p-field pb-3" v-if="FindRole(null,'hikvision')">
        <label>{{ $t('hikvision.department') }}</label>
        <Dropdown
            class="dropdown"
            v-model="department"
            :options="departments"
            :optionLabel="localizeDepartment"
            :placeholder="$t('roleControl.selectDepartment')"
            :filter="true"
            :showClear="true"
            dataKey="id"
            :emptyFilterMessage="$t('roleControl.noResult')"
            @filter="handleFilterDepartment"
        />
      </div>

      <div class="form-group" v-if="FindRole(null,'hikvision')">
        <label>{{ $t('hikvision.employee') }}</label>
        <FindUser
            :placeholder="$t('hikvision.all')"
            :userType="2"
            v-model="employee"
            :max="1"
            style="width: 100%"
        />
      </div>

      <div class="button-group">
        <Button class="btn btn-close small-button"  rounded @click="emit('close')">{{ $t('hikvision.cancel') }}</Button>
        <Button type="submit" class="btn btn-primary small-button" rounded>{{ $t('common.generate') }}</Button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, defineEmits, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import PrimeCalendar from 'primevue/calendar';
import Dropdown from 'primevue/dropdown';
import Checkbox from 'primevue/checkbox';
import { ReportService } from '@/service/report.service';
import { ContragentService } from '@/service/contragent.service';
import {findRole} from "@/config/config";
import {useToast} from "primevue/usetoast";

const { t, locale } = useI18n();
const emit = defineEmits(['reportCreated', 'close']);
const toast = useToast();

const startDate = ref('');
const endDate = ref('');
const categories = ref([]);
const department = ref(null);
const employee = ref(null);
const departments = ref([]);
const searchText = ref('');
const lang = locale.value;

const showError = (message) => {
  toast.add({ severity: 'error', detail: message, life: 3000 });
};
const showSuccess = (message) => {
  toast.add({ severity: 'success', detail: message, life: 3000 });
};

const categoriesV2 = ref([
  { id: 1, name_kz: '', name_ru: '', name_en: '', code: t('hikvision.aup'), is_noted: false },
  { id: 2, name_kz: '', name_ru: '', name_en: '', code: t('hikvision.ahp'), is_noted: false },
  { id: 3, name_kz: '', name_ru: '', name_en: '', code: t('hikvision.uvp'), is_noted: false },
  { id: 4, name_kz: '', name_ru: '', name_en: '', code: t('hikvision.nii'), is_noted: false },
  { id: 5, name_kz: '', name_ru: '', name_en: '', code: t('hikvision.pps'), is_noted: false },
  { id: 6, name_kz: '', name_ru: '', name_en: '', code: t('hikvision.op'), is_noted: false },
]);
const FindRole = findRole
watch(
    categoriesV2,
    (newCategories) => {
      categories.value = newCategories.filter(cat => cat.is_noted).map(cat => cat.id);
    },
    { deep: true }
);

const reportService = new ReportService();
const contragentService = new ContragentService();

const capitalize = (str) => {
  if (typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const localizeDepartment = (department) => {
  const localizedText = t(department['name' + capitalize(locale.value)]);
  return localizedText;
};

const handleFilterDepartment = (event) => {
  if (event.value && event.value.length > 1) {
    searchText.value = event.value;
    getDepartments();
  }
};

const getDepartments = async () => {
  const orgId = 1;

  try {
    const response = await contragentService.getDepartments({
      orgId: orgId,
      searchText: searchText.value,
    });

    if (response.data && response.data.departments && Array.isArray(response.data.departments)) {
      departments.value = response.data.departments;
    } else {
      departments.value = [];
    }
  } catch (error) {
    console.error('Failed to load departments:', error);
    toast.add({
      severity: 'error',
      detail: t('common.message.loadError'),
      life: 3000,
    });
  }
};

const createReports = async () => {
    if (!startDate.value || !endDate.value) {
      showError(t('hikvision.dateRequiredError'));
      return;
    }

  const categoryIds = categories.value.length > 0
      ? categories.value
      : categoriesV2.value.filter(cat => cat.is_noted && cat.id != null).map(cat => cat.id);


  const data = {
    lang: lang,
    start_date: startDate.value,
    end_date: endDate.value,
    category_ids: categoryIds,
    department_id: department.value ? department.value.id : null,
    employee_id: employee.value && Array.isArray(employee.value) && employee.value.length > 0
        ? employee.value[0].userID
        : null,
  };

  try {
    const response = await reportService.createReport(data);
    console.log('Report created:', response);
    showSuccess(t('hikvision.notification'))
    emit('reportCreated', response);
    emit('close');
  } catch (error) {
    console.error('Error creating report:', error);
  }
};

onMounted(() => {
  getDepartments();
});
</script>

<style scoped>
.dialog {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: none;
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

.button-group {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  gap: 10px;
}

.btn {
  padding: 10px 20px;
  font-size: 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.btn-close {
  background-color: #dc3545;
  color: #fff;
}

.btn-primary {
  background-color: #007bff;
  color: #fff;
}

.small-button {
  padding: 8px 16px;
  font-size: 14px;
  width: auto;
  min-width: 100px;
}

.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

input[type="checkbox"] {
  vertical-align: middle;
  margin: 0;
}
label {
  line-height: 1.5;
}


.field-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-right: 15px;
}

.field-checkbox label {
  line-height: 1.2;
  margin: 0;
}

.calendar-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 10px;
}

@media (max-width: 768px) {
  .dialog {
    padding: 15px;
  }

  .button-group {
    flex-direction: column;
    align-items: center;
  }

  .btn {
    width: 100%;
    margin-bottom: 10px;
  }

  .calendar-group {
    flex-direction: column;
  }

}
</style>