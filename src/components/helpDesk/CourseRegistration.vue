<template>
  <div style="margin-left: 15px;" v-if="props.courseRequest.doc?.docHistory">
    <p> {{ t('common.state') + ": " }}
      <span :class="'customer-badge status-' + props.courseRequest.doc?.docHistory?.stateEn">
        {{ getDocStatus(props.courseRequest.doc?.docHistory?.stateEn) }}
      </span>
    </p>
   <div v-if="props.courseRequest.doc?.docHistory?.stateEn === 'revision'">
    <label>{{ $t('common.comment') }}:</label>
    <div>
      <Message style="width: 150px;" :closable="false"
        v-if="props.courseRequest.doc != null && props.courseRequest.doc?.docHistory != null && props.courseRequest.doc?.docHistory != null"
        severity="warn">
        {{ props.courseRequest.doc?.docHistory?.comment }}</Message>
    </div>
   </div>
  </div>
  <BlockUI class="card" v-if="findRole(null, 'student') || findRole(null, 'main_administrator')">
    <div >
      <div class="buttonLanguag">
        <Button class="toggle-button" @click="toggleRegistration">Выберите дисциплину</Button>
      </div>
      <DataTable v-if="showRegistration && props.courseRequest && data" :lazy="true" :rowsPerPageOptions="[5, 10, 20, 50]" :value="data" dataKey="id"
        :rowHover="true" v-model:filters="filters" filterDisplay="menu" :loading="loading" responsiveLayout="scroll" :paginator="true" stripedRows
        class="p-datatable-sm" :rows="total >= 10 ? 10 : total" :totalRecords="total" @page="onPage" v-model:selection="currentDocument"
        :first="first" scrollable scrollHeight="flex" @lazy="true">

        <Column field="checkbox">
          <template #body="{ data }">
            <Checkbox :disabled="isDisabled(data) || isAdmin" v-model="data.checked" :binary="true" @change="checkBoxSelect(data)"
              style="margin-left: 20px;" />
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
    </div>
  </BlockUI>
  <div>
    <div class="field">
      <label>{{ t('common.fullName') }}</label>
      <!-- :disabled="!!responseUserData.fullName" -->
      <InputText v-model="userData.fullName" type="text" :disabled="isAdmin && (props.courseRequest.doc?.docHistory?.stateId !== DocEnum.CREATED.ID &&
              props.courseRequest.doc?.docHistory?.stateId !== DocEnum.REVISION.ID)" :placeholder="t('common.fullName')" @input="input" />
    </div>
    <div class="field" style="margin-top: 10px;">
      <label>{{ t('common.speciality') }}</label>
      <InputText v-model="userData.speciality" type="text" :disabled="isAdmin" :placeholder="userData.speciality || t('common.speciality')"
        @input="input" />
    </div>
    <div class="field" style="margin-top: 10px;">
      <label>{{ t('course.course') }}</label>
      <InputNumber v-model="userData.course" :placeholder="userData.course || t('course.course')" style="width: 350px;" @input="input"
        :disabled="isAdmin" />
    </div>
    <div class="field" style="margin-top: 10px;">
      <label>{{ t('contracts.cafedraGroup') }}</label>
      <InputText v-model="userData.group" type="text" :placeholder="userData.group || t('contracts.cafedraGroup')" @input="input"
        :disabled="isAdmin" />
    </div>
    <div class="field" style="margin-top: 10px;">
      <label>{{ t('contact.phone') }}</label>
      <InputNumber v-model="userData.phone" class="mt-2" inputId="userDataPhone" :useGrouping="false" :placeholder="t('contact.phone')"
        style="width: 350px;" @input="input" :disabled="isAdmin" />
    </div>
    <div class="field" style="margin-top: 10px;">
      <label>{{ t('contact.email') }}</label>
      <InputText v-model="userData.email" type="text" :placeholder="t('contact.email')" @input="input" :disabled="isAdmin" />
    </div>
  </div>
  <!-- <BlocUI class="card" v-if="!findRole(null, 'student')" :style="{ height: '35vw' }">
    <div class="field" style="margin-top: 10px;">
      <label>{{ t('helpDesk.application.discipline') }}</label>
      <InputText v-model="userData.discipline" type="text" :placeholder="t('helpDesk.application.discipline')" />
    </div>
    <div class="field" style="margin-top: 10px;">
      <label>{{ t('common.fullName') }}</label>
      <InputText v-model="userData.fullName" type="text" :placeholder="t('common.fullName')" />
    </div>
    <div class="field" style="margin-top: 10px;">
      <label>{{ t('common.speciality') }}</label>
      <InputText v-model="userData.speciality" type="text" :placeholder="t('common.speciality')" />
    </div>
    <div class="field" style="margin-top: 10px;">
      <label>{{ t('course.course') }}</label>
      <InputNumber v-model="userData.course" :useGrouping="false" :placeholder="t('course.course')" style="width: 350px;" />
    </div>
    <div class="field" style="margin-top: 10px;">
      <label>{{ t('contracts.cafedraGroup') }}</label>
      <InputText v-model="userData.group" type="text" :placeholder="t('contracts.cafedraGroup')" />
    </div>
    <div class="field" style="margin-top: 10px;">
      <label>{{ t('contact.phone') }}</label>
      <InputNumber v-model="userData.phone" class="mt-2" inputId="userDataPhone" :useGrouping="false" :placeholder="t('contact.phone')" style="width: 350px;" />
    </div>
    <div class="field" style="margin-top: 10px;">
      <label>{{ t('contact.email') }}</label>
      <InputText v-model="userData.email" type="text" :placeholder="t('contact.email')" />
    </div>
  </BlocUI> -->
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from "vue-i18n";
import axios from 'axios';
import { HelpDeskService } from "../../service/helpdesk.service";
import { getHeader, smartEnuApi, findRole } from "@/config/config";
import { useToast } from "primevue/usetoast";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import DocEnum from "@/enum/docstates/index";

const service = new HelpDeskService()
const { t, locale } = useI18n()
const store = useStore()
const route = useRoute();
const toast = useToast()
const emit = defineEmits(['onCheckboxChecked', 'childInputData'])
const loginedUser = ref(JSON.parse(localStorage.getItem("loginedUser")))

const props = defineProps({
  courseRequest: {
    type: Object,
    default: Object,
  }
})

const userData = ref({
  fullName: null,
  speciality: null,
  group: null,
  course: null,
  phone: '',
  email: null,
  discipline: null
})

const responseUserData = ref({
  fullName: null,
  speciality: null,
  group: null,
  course: null,
  phone: '',
  email: null
})
const data = ref(null);
const selectedIds = ref(props.courseRequest.doc.newParams && props.courseRequest.doc.newParams.not_formal_education_ids ? props.courseRequest.doc.newParams.not_formal_education_ids.value : []);
const docStatus = ref([
  { name_kz: "құрылды", name_en: "created", name_ru: "создан", code: "created" },
  { name_kz: "келісуде", name_en: "inapproval", name_ru: "на согласовании", code: "inapproval" },
  { name_kz: "келісілді", name_en: "approved", name_ru: "согласован", code: "approved" },
  { name_kz: "түзетуге", name_en: "revision", name_ru: "на доработку", code: "revision" },
  { name_kz: "қайтарылды", name_en: "rejected", name_ru: "отклонен", code: "rejected" },
  { name_kz: "қол қоюда", name_en: "signing", name_ru: "на подписи", code: "signing" },
  { name_kz: "қол қойылды", name_en: "signed", name_ru: "подписан", code: "signed" },
  { name_kz: "қайта бекітуге жіберілді", name_en: "sent for re-approval", name_ru: "отправлен на переутверждение", code: "sent for re-approval" },
  { name_kz: "жаңартылды", name_en: "updated", name_ru: "обновлен", code: "updated" },
  { name_kz: "берілді", name_en: "issued", name_ru: "выдан", code: "issued" },
]);
const codesToExclude = ["inapproval", "approved", "rejected", "signing", "signed", "sent for re-approval", "updated", "issued"];
const isAdmin = ref(false)
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
const changed = ref(false)
const currentUser = ref(null);
const subject = ref(null);
const selectedDirection = ref({
  name_ru: null,
  name_kz: null,
  name_en: null,
});
const showRegistration = ref(false);

const toggleRegistration = () => {
  showRegistration.value = !showRegistration.value;
};

// const savedData = JSON.parse(localStorage.getItem('userData'));
// if (savedData) {
//   Object.assign(userData.value, savedData)
// }

// watchEffect(() => {
//   localStorage.setItem('userData', JSON.stringify(userData.value))
// })


const showMessage = (msgtype, message, content) => {
  toast.add({
    severity: msgtype,
    summary: message,
    detail: content,
    life: 3000
  });
};
emit('onCheckboxChecked', selectedIds.value)
emit('childInputData', userData.value)

const onPage = (event) => {
  lazyParams.value.page = event.page;
  lazyParams.value.rows = event.rows;
  getCourse();
};

const getCourse = () => {
  console.log(props.courseRequest)
  const userId = props.courseRequest?.doc?.newParams?.student_id?.value
  const courseId = props.courseRequest?.doc?.newParams?.not_formal_education_ids.value
  axios.post(smartEnuApi + "/onlinecourse/courses",
    {
      user_id: userId,
      page: lazyParams.value.page,
      rows: lazyParams.value.rows,
      searchText: null,
      dic_course_type: "not_formal_education",
      courses_ids: courseId

    }, { headers: getHeader() })
    .then((res) => {
      console.log(res.data)
      data.value = res.data.courses;
      if (props.courseRequest.doc.newParams) {

        data.value.map(e => {
          e.checked = props.courseRequest.doc.newParams.not_formal_education_ids.value.some(x => x === e.subject_id)
        })
      }
      total.value = res.data.total;
    })
    .catch((err) => {
      showMessage("error", t("common.message.saveError"), null);
    });
};


const getStudentInfo = () => {
  const userId = props.courseRequest?.doc?.newParams?.student_id?.value
  console.log('asd')

  if (!findRole(null, 'student') && (userId === null && userId <= 0)) {
    return
  }
  service.helpDeskStudentInfo({ user_id: userId }).then(res => {
    responseUserData.value.speciality = locale === "kz" ? res.data.studen_info.specialty_kz : res.data.studen_info.specialty_ru
    responseUserData.value.course = res.data.studen_info.course_number
    responseUserData.value.group = res.data.studen_info.group
    responseUserData.value.fullName = res.data.studen_info.full_name
    responseUserData.value.phone = res.data.studen_info.phone
    responseUserData.value.email = res.data.studen_info.email

    console.log(responseUserData.value)
    userData.value = {
      fullName: props.courseRequest.doc?.newParams?.not_formal_student_info?.value.fullName || responseUserData.value.fullName,
      speciality: props.courseRequest.doc?.newParams?.not_formal_student_info?.value.speciality || responseUserData.value.speciality,
      group: props.courseRequest.doc?.newParams?.not_formal_student_info?.value.group || responseUserData.value.group,
      course: props.courseRequest.doc?.newParams?.not_formal_student_info?.value.course || responseUserData.value.course,
      phone: props.courseRequest.doc?.newParams?.not_formal_student_info?.value.phone || responseUserData.value.phone,
      email: props.courseRequest.doc?.newParams?.not_formal_student_info?.value.email || responseUserData.value.email,
    }
    emit('childInputData', userData.value)

  }).catch(err => {
    loading.value = false
    if (err.response && err.response.status == 401) {
      store.dispatch("logLout")
    } else if (err.response && err.response.data && err.response.data.localized) {
      showMessage('error', t(err.response.data.localizedPath), null)
    } else {
      console.log(err)
    }
  })
}

const getDocStatus = (code) => {
  const foundStatus = docStatus.value.find(status => status.code === code);
  if (foundStatus) {
    switch (locale.value) {
      case "kz":
        return foundStatus.name_kz;
      case "ru":
        return foundStatus.name_ru;
      case "en":
        return foundStatus.name_en;
      default:
        console.log("Default")
        return null;
    }
  } else {
    return null;
  }

};

const input = () => {
  changed.value = true;
  emit('childInputData', userData.value)
}

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

  emit('onCheckboxChecked', selectedIds.value)
  if (selectedIds.value.length === 0) {
    isSend.value = false;
  }

};
onMounted(() => {
  isAdmin.value = codesToExclude.includes(props.courseRequest.doc?.docHistory?.stateEn) && (findRole(null, 'main_administrator') || findRole(null, "career_administrator"))
  currentUser.value = JSON.parse(localStorage.getItem("loginedUser"));
  getStudentInfo()
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
}

.lang {
  margin-left: 20px;
}

.buttonLanguag {
  margin-bottom: 20px;
}
</style>
