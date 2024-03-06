<template>
  <BlockUI class="card" v-if="findRole(null, 'student')">
    <DataTable :lazy="true" :rowsPerPageOptions="[5, 10, 20, 50]" :value="data" dataKey="id" :rowHover="true" v-model:filters="filters"
      filterDisplay="menu" :loading="loading" responsiveLayout="scroll" :paginator="true" stripedRows class="p-datatable-sm" :rows="10"
      :totalRecords="total" @page="onPage" v-model:selection="currentDocument" :first="first" scrollable scrollHeight="flex" @lazy="true">
      <template #empty> {{ t('common.noData') }}</template>
      <template #loading> {{ t('common.loading') }}</template>

      <Column field="checkbox">
        <template #body="{ data }">
          <Checkbox :disabled="isDisabled(data)" v-model="data.checked" :binary="true" @change="checkBoxSelect(data)" style="margin-left: 20px;" />
        </template>
      </Column>

      <!-- :header="dic_course_type === 2 ? t('course.disciplineCode') : t('common.name')" -->
      <Column field="name" :header="t('common.name')" style="padding-top: 15px; padding-bottom: 15px;">
        <template #body="{ data }">
          <a href="javascript:void(0)">{{ $i18n.locale === "kz" ? data.namekz : $i18n.locale === "ru" ? data.nameru :
            data.category.nameen }}</a>
        </template>
      </Column>

      <!-- :header="dic_course_type === 2 ? t('course.disciplineName') : t('common.description')" -->
      <Column field="description" :header="t('common.description')" style="padding-top: 15px; padding-bottom: 15px;">
        <template #body="{ data }">
          <a href="javascript:void(0)">{{ $i18n.locale === "kz" ? data.descriptionkz : $i18n.locale === "ru" ? data.descriptionru :
            data.descriptionen }}</a>
        </template>
      </Column>

    </DataTable>
  </BlockUI>
  <BlocUI class="card" v-if="!findRole(null, 'student')" :style="{  height: '35vw' }">
    <div class="field" style="margin-top: 10px;">
      <label>{{ t('common.fullName') }}</label>
      <InputText v-model="userData.fullName" type="text" :placeholder="$t('common.fullName')"  />
    </div>
    <div class="field" style="margin-top: 10px;">
      <label>{{ t('common.speciality') }}</label>
      <InputText v-model="userData.speciality" type="text" :placeholder="$t('common.speciality')" />
    </div>
    <div class="field" style="margin-top: 10px;">
      <label>{{ t('course.course') }}</label>
      <InputNumber v-model="userData.course" type="number" :placeholder="$t('course.course')" style="width: 350px;"/>
    </div>
    <div class="field" style="margin-top: 10px;">
      <label>{{ t('contracts.cafedraGroup') }}</label>
      <InputText v-model="userData.group" type="text" :placeholder="$t('contracts.cafedraGroup')" />
    </div>
    <div class="field" style="margin-top: 10px;">
      <label>{{ t('contact.phone') }}</label>
      <InputText v-model="userData.phone" class="mt-2" type="text" :placeholder="$t('contact.phone')" />
    </div>
    <div class="field" style="margin-top: 10px;">
      <label>{{ t('contact.email') }}</label>
      <InputText v-model="userData.email" type="text" :placeholder="$t('contact.email')"/>
    </div>
  </BlocUI>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import {useI18n} from "vue-i18n";
import axios from 'axios';
import { HelpDeskService } from '../../service/helpdesk.service';
import { getHeader, smartEnuApi, findRole } from "@/config/config";
import {useToast} from "primevue/usetoast";
import {useStore} from "vuex";
import {useRoute} from "vue-router";


const {t, locale} = useI18n()
const store = useStore()
const route = useRoute();
const toast = useToast()
const service = new HelpDeskService()
const emit = defineEmits(['onCheckboxChecked'])

const props = defineProps({
  courseRequest: {
      type: Object,
      default: Object,
    }
  })

const userData = ref({
  fullName: null,
  speciality: null,
  group:null,
  course:null,
  phone:null,
  email:null
})
const data = ref(null);
const selectedIds = ref([]);

const loading = ref(false);
const lazyParams = ref({
  page: 0,
  rows: 10,
});
const total = ref(0);
const currentDocument = ref(null);
const checked = ref(null);
const maxChecked = 25;
const filter = ref({
  applied: false,
  name: null,
  author: [],
  status: null,
  years: [],
});
const visibility = ref({
  documentInfoSidebar: false,
  revisionDialog: false,
  sendToApproveDialog: false,
});
const selectedUsers = ref([]);

const isSend = ref(false);

const currentUser = ref(null);
const subject = ref(null);
const selectedDirection = ref({
  name_ru: null,
  name_kz: null,
  name_en: null,
});





// const findRole = computed(() => findRole ) 
const showMessage = (msgtype, message, content) => {
  toast.add({
    severity: msgtype,
    summary: message,
    detail: content,
    life: 3000
  });
};


const onPage = (event) => {
  lazyParams.value.page = event.page;
  lazyParams.value.rows = event.rows;
  getCourse();
};

const getCourse = () => {
  axios.post(smartEnuApi + "/onlinecourse/courses",
    {
      page: lazyParams.value.page,
      rows: lazyParams.value.rows,
      searchText: null,
      dic_course_type: "not_formal_education"
    }, { headers: getHeader() })
    .then((res) => {

      data.value = res.data.courses;
      total.value = res.data.total;
      for (let i = 1; i <= 8; i++) {
        data.value.push({ name: "Item " + i, checked: false });
      }
    })
    .catch((err) => {

      showMessage("error", t("common.message.saveError"), null);
    });
};
const isDisabled = (rowData) => {
  let totalHours = data.value.reduce((total, item) => total + (item.checked ? item.hours : 0), 0);
  return totalHours + rowData.hours > maxChecked && !rowData.checked;
};
const checkBoxSelect = (course) => {
  if (course.checked) {
    selectedIds.value.push(course.subject_id);
  } else {
    selectedIds.value = selectedIds.value.filter(item => item !== course.subject_id);
  }
  emit('onCheckboxChecked', selectedIds.value, userData.value)
  if (selectedIds.value.length === 0) {
    isSend.value = false;
  }

};
onMounted(() => {


  currentUser.value = JSON.parse(localStorage.getItem("loginedUser"));
  getCourse();
});


</script>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
}

.field input {
  width: 350px;
}

.field label {
  margin-bottom: 5px;
  /* Расстояние между меткой и полем ввода */
}

.progress-spinner {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
  z-index: 1102;
}

.arrow-icon {
  cursor: pointer;
  font-size: 1.25rem;
  margin-right: 1rem;
  display: flex;
  align-items: center;
}

.card {
  flex-grow: 1;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  margin-bottom: 0px;
}

.status-status_created {
  background: #6c757d;
  color: #fff;
}

.status-status_signing {
  background: #17a2b8;
  color: #fff;
}

.status-status_signed {
  background: #28a745;
  color: #fff;
}

.status-status_inapproval {
  background: #9317b8;
  color: #ffffff;
}

.status-status_approved {
  background: #007bff;
  color: #ffffff;
}

.status-status_revision {
  background: #ffcdd2;
  color: #c63737;
}

.commonColum {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.customer-badge {
  border-radius: 2px;
  padding: .25em .5rem;
  text-transform: uppercase;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: .3px;
}

.customer-badge.status-5 {
  background: #B48B7D;
  color: #fff;
}

.customer-badge.status-4 {
  background: #C8E6C9;
  color: #256029;
}

.customer-badge.status-3 {
  background: #FFCDD2;
  color: #C63737;
}

.customer-badge.status-2 {
  background: #FEEDAF;
  color: #8A5340;
}

.customer-badge.operational-plan {
  background-color: #3B82F6;
  color: #ffffff;
  font-weight: 500;
  border-radius: 3px;
}

.customer-badge.simple-plan {
  background-color: #10b981;
  color: #ffffff;
  font-weight: 500;
  border-radius: 3px;
}

.commonColum {
  display: flex;
  align-items: center;
  justify-content: space-between;
}</style>

