<template>
  <div style="margin-left: 15px;" v-if="props.courseRequest.doc?.docHistory">
    <p> {{ t('common.state') + ": " }}
      <span :class="'customer-badge status-' + props.courseRequest.doc?.docHistory?.stateEn">
        {{ getDocStatus(props.courseRequest.doc?.docHistory?.stateEn) }}
      </span>
    </p>
    <div
        v-if="props.courseRequest.doc?.docHistory?.stateEn === 'revision' || props.courseRequest.doc?.docHistory?.stateEn === 'rejected' ">
      <label>{{ $t('common.comment') }}:</label>
      <div>
        <Message style="width: 150px;" :closable="false"
                 v-if="props.courseRequest.doc != null && props.courseRequest.doc?.docHistory != null && props.courseRequest.doc?.docHistory != null"
                 severity="warn">
          {{ props.courseRequest.doc?.docHistory?.comment }}
        </Message>
      </div>
    </div>
  </div>

  <BlockUI style="margin-top: 10px"
           v-if="findRole(null, 'student') || props.courseRequest.doc?.newParams?.not_formal_education_ids">
    <div>
      <div class="mb-3"
           style="display: flex; justify-content: space-between; margin-bottom: 20px"
      >
        <div class="buttonLanguag">
          <Button class="toggle-button" @click="toggleRegistration">{{ t('helpDesk.application.chooseDiscipline') }}
          </Button>
        </div>
        <span class="p-input-icon-left mr-2 position-relative" v-if="showRegistration && props.courseRequest ">
    <i class="pi pi-search position-absolute" style="top: 15px"/>
    <InputText
        type="search"
        v-model="searchText"
        :placeholder="t('common.search')"
        @keyup.enter="getCourse"
    />
    <Button
        icon="pi pi-search"
        class="p-ml-1"
        @click="getCourse"
    />
</span>

      </div>
      <DataTable v-if="showRegistration && props.courseRequest" :lazy="true" :rowsPerPageOptions="[5, 10, 20, 50]"
                 :value="data" dataKey="id"
                 :rowHover="true" filterDisplay="menu" responsiveLayout="scroll" :paginator="true" stripedRows
                 class="p-datatable-sm" :rows="total >= 10 ? 10 : total" :totalRecords="total" @page="onPage"
                 v-model:selection="currentDocument"
                 scrollable scrollHeight="flex" @lazy="true">
        <template #empty> {{ t('common.noData') }}</template>
        <Column field="checkbox">
          <template #body="{ data }">
            <Checkbox
                :disabled="isDisabled(data) || isAdmin || (props.courseRequest?.doc?.docHistory?.stateId == DocEnum.INAPPROVAL.ID)"
                v-model="data.checked" :binary="true" @change="checkBoxSelect(data)" style="margin-left: 20px;"/>
          </template>
        </Column>

        <!-- :header="dic_course_type === 2 ? t('course.disciplineCode') : t('common.name')" -->
        <Column field="name" :header="t('course.disciplineCode')" style="padding-top: 15px; padding-bottom: 15px;">
          <template #body="{ data }">
            <a href="javascript:void(0)">{{
                $i18n.locale === "kz" ? data.namekz : $i18n.locale === "ru" ? data.nameru :
                    data.category.nameen
              }}</a>
          </template>
        </Column>

        <!-- :header="dic_course_type === 2 ? t('course.disciplineName') : t('common.description')" -->
        <Column field="description" :header="t('course.disciplineName')"
                style="padding-top: 15px; padding-bottom: 15px;">
          <template #body="{ data }">
            <a href="javascript:void(0)">{{
                $i18n.locale === "kz" ? data.descriptionkz : $i18n.locale === "ru" ? data.descriptionru :
                    data.descriptionen
              }}</a>
          </template>
        </Column>

        <Column field="credit" :header="t('helpDesk.application.credits')"
                style="padding-top: 15px; padding-bottom: 15px;">
          <template #body="{ data }">
            <a href="javascript:void(0)">{{ data.hours }}</a>
          </template>
        </Column>

      </DataTable>
    </div>
  </BlockUI>
  <div>
    <div class="field"
         v-if="!findRole(null, 'student') && !props.courseRequest.doc?.newParams?.not_formal_education_ids "
         style="margin-top: 15px;">
      <label>{{ t('helpDesk.application.discipline') }}<span v-if="isCurrentUserSender"
                                                             style="font-size: 20px; color: red;">*</span></label>
      <InputText v-model="userData.discipline" type="text"
                 :disabled="disabledStatus"
                 :placeholder="t('helpDesk.application.discipline')" @input="input"/>
    </div>
    <div class="field">
      <label>{{ t('common.fullName') }}<span v-if="isCurrentUserSender"
                                             style="font-size: 20px; color: red;">*</span></label>
      <!-- :disabled="!!responseUserData.fullName" -->
      <InputText v-model="userData.fullName" type="text"
                 :disabled="disabledStatus" :placeholder="t('common.fullName')"
                 @input="input"/>
    </div>
    <div class="field" style="margin-top: 10px;">
      <label>{{ t('common.speciality') }}<span v-if="isCurrentUserSender" style="font-size: 20px; color: red;">*</span></label>
      <InputText v-model="userData.speciality" type="text"
                 :disabled="disabledStatus"
                 :placeholder="userData.speciality || t('common.speciality')" @input="input"/>
    </div>
    <div class="field" style="margin-top: 10px;">
      <label>{{ t('course.course') }}<span v-if="isCurrentUserSender"
                                           style="font-size: 20px; color: red;">*</span></label>
      <InputNumber v-model="userData.course" :disabled="disabledStatus"
                   :placeholder=" t('course.course')" id="number-input" style="width: 350px;" @input="input"/>
      <!--      <div v-if="props.validationRequest.course" style="color: red; margin-top: 5px">Курс введен неправильно</div>-->
    </div>
    <div class="field" style="margin-top: 10px;">
      <label>{{ t('contracts.cafedraGroup') }}<span v-if="isCurrentUserSender"
                                                    style="font-size: 20px; color: red;">*</span>
      </label>
      <InputText v-model="userData.group" type="text" :disabled="disabledStatus"
                 :placeholder="userData.group || t('contracts.cafedraGroup')" @input="input"/>
    </div>
    <div class="field" style="margin-top: 10px;">
      <label>{{ t('contact.phone') }}<span v-if="isCurrentUserSender"
                                           style="font-size: 20px; color: red;">*</span></label>
      <InputText v-model="userData.phone" class="mt-2" inputId="userDataPhone" :placeholder="t('contact.phone')"
                 style="width: 350px;" @input="input" :disabled="disabledStatus"/>
      <div v-if="props.validationRequest.phone" style="color: red; margin-top: 5px">
        {{ t('helpDesk.application.enteredIncorrectly') }}
      </div>
    </div>
    <div class="field" style="margin-top: 10px;">
      <label>{{ t('contact.email') }}<span v-if="isCurrentUserSender"
                                           style="font-size: 20px; color: red;">*</span></label>
      <InputText v-model="userData.email" type="text" :placeholder="t('contact.email')" @input="input"
                 :disabled="disabledStatus"/>
      <div v-if="props.validationRequest.email" style="color: red; margin-top: 5px">
        {{ t('helpDesk.application.enteredIncorrectly') }}
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted, computed} from 'vue';
import {useI18n} from "vue-i18n";
import axios from 'axios';
import {HelpDeskService} from "../../service/helpdesk.service";
import {getHeader, smartEnuApi, findRole} from "@/config/config";
import {useToast} from "primevue/usetoast";
import {useStore} from "vuex";
import {useRoute} from "vue-router";
import DocEnum from "@/enum/docstates/index";

const service = new HelpDeskService()
const {t, locale} = useI18n()
const store = useStore()
const route = useRoute();
const toast = useToast()
const emit = defineEmits(['onCheckboxChecked', 'childInputData', 'validateInput'])

const props = defineProps({
  courseRequest: {
    type: Object,
    default: Object,
  },
  validationRequest: {
    type: Object,
    default: Object
  }
})

const userData = ref({})

const formFields = computed(() => [
  { key: 'fullName', label: t('common.fullName'), model: userData.value.fullName, type: 'text', placeholder: t('common.fullName'),   validation: null,show: true },
  { key: 'speciality', label: t('common.speciality'), model: userData.value.speciality, type: 'text', placeholder: userData.value.speciality || t('common.speciality'),   validation: null, show: true },
  { key: 'course', label: t('course.course'), model: userData.value.course, type: 'number', placeholder: t('course.course'),   validation: null, show: true },
  { key: 'group', label: t('contracts.cafedraGroup'), model: userData.value.group, type: 'text', placeholder: userData.value.group || t('contracts.cafedraGroup'),   validation: null, show: true },
  { key: 'phone', label: t('contact.phone'), model: userData.value.phone, type: 'text', placeholder: t('contact.phone'),   validation: 'phone', show: true},
  { key: 'email', label: t('contact.email'), model: userData.value.email, type: 'text', placeholder: t('contact.email'),   validation: 'email', show:true },
])

if (!findRole(null, 'student') && !props.courseRequest.doc?.newParams?.not_formal_education_ids) {
  formFields.value.unshift({ key: 'discipline', label: t('helpDesk.application.discipline'), model: userData.value.discipline, type: 'text', placeholder: t('helpDesk.application.discipline'), required: true,  validation: null, show: true });
}

const isCurrentUserSender = computed(() => {
  return ((currentUser.value?.userID == props.courseRequest.sender_id && (props.courseRequest.doc.docHistory == null)) || props.courseRequest?.doc?.docHistory?.stateId == DocEnum.REVISION.ID)
})
const responseUserData = ref({
  fullName: null,
  speciality: null,
  group: null,
  course: null,
  phone: null,
  email: null
})
const searchText = ref(null)
const data = ref(null);
const selectedIds = ref(props.courseRequest.doc.newParams && props.courseRequest.doc.newParams.not_formal_education_ids ? props.courseRequest.doc.newParams.not_formal_education_ids.value : []);
const docStatus = ref([
  { name_kz: "құрылды", name_en: "created", name_ru: "создан", code: "created" },
  { name_kz: "келісуде", name_en: "inapproval", name_ru: "на согласовании", code: "inapproval" },
  { name_kz: "келісілді", name_en: "approved", name_ru: "согласован", code: "approved" },
  { name_kz: "түзетуге", name_en: "revision", name_ru: "на доработку", code: "revision" },
  { name_kz: "қабылданбады", name_en: "rejected", name_ru: "отклонен", code: "rejected" },
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
const currentUser = ref(JSON.parse(localStorage.getItem("loginedUser")));
const subject = ref(null);
const selectedDirection = ref({
  name_ru: null,
  name_kz: null,
  name_en: null,
});
const showRegistration = ref(false);
currentUser.value = JSON.parse(localStorage.getItem("loginedUser"));
const disabledStatus = computed(() => {
 return !(currentUser.value?.userID == props.courseRequest.sender_id) || props.courseRequest?.doc?.docHistory?.stateId == DocEnum.INAPPROVAL.ID || props.courseRequest?.doc?.docHistory?.stateId == DocEnum.REJECTED.ID
})
const toggleRegistration = () => {
  showRegistration.value = !showRegistration.value;
};

const clearData = () => {
  if (!searchText.value) {
    return;
  }
  searchText.value = null;
}

const showMessage = (msgtype, message, content) => {
  toast.add({
    severity: msgtype,
    summary: message,
    detail: content,
    life: 3000
  });
};
const validateCourse = (course) => {
  return course >= 1 && course <= 5
}
const validatePhoneNumber = (phoneNumber) => {
  const phoneRegex = /^(8|\+7)?\(\d{3}\)\d{7}$|^(8|\+7)?\d{10}$/;

  return phoneRegex.test(phoneNumber);
}
emit('onCheckboxChecked', selectedIds.value)
emit('childInputData', userData.value)
emit('validateInput', {
  course: !validateCourse(userData.value.course),
  email: !(userData.value.email === null || /\S+@\S+\.\S+/.test(userData.value.email)),
  phone: userData.value.phone === null || !validatePhoneNumber(userData.value.phone),
});


// const isValidCourse = computed(() => {
//   const course = parseInt(userData.course)
//   return !isNaN(course) && course >= 1 && course <= 1
// })
const onPage = (event) => {
  lazyParams.value.page = event.page;
  lazyParams.value.rows = event.rows;
  getCourse();
};

const getCourse = () => {
  if (findRole(null, "student") || props.courseRequest.doc?.newParams?.not_formal_education_ids) {
    const userId = props.courseRequest?.doc?.newParams?.student_id?.value

    let courseId = props.courseRequest?.doc?.newParams?.not_formal_education_ids.value ? props.courseRequest?.doc?.newParams?.not_formal_education_ids.value : null
    if ((props.courseRequest?.doc?.docHistory?.stateId === DocEnum.CREATED.ID || props.courseRequest?.doc?.docHistory?.stateId === DocEnum.REVISION.ID) && !isAdmin.value) {
      courseId = null
    }
    axios.post(smartEnuApi + "/onlinecourse/courses",
        {
          user_id: userId,
          page: lazyParams.value.page,
          rows: lazyParams.value.rows,
          searchText: searchText.value,
          dic_course_type: "not_formal_education",
          courses_ids: courseId
        }, {headers: getHeader()})
        .then((res) => {
          data.value = res.data.courses;
          if (data.value) {
            if (props.courseRequest.doc.newParams) {
              data.value.map(e => {
                e.checked = props.courseRequest.doc.newParams.not_formal_education_ids.value.some(x => x === e.subject_id)
              })
            } else {
              data.value.map(e => {
                e.checked = selectedIds.value.some(x => x === e.subject_id)
              })
            }
          }
          total.value = res.data.total;
        })
  }
}
const getStudentInfo = () => {
  const userId = props.courseRequest?.doc?.newParams?.student_id?.value

  service.helpDeskStudentInfo({user_id: userId}).then(res => {
    responseUserData.value.speciality = locale.value === "kz" ? res.data.studen_info.specialty_kz : res.data.studen_info.specialty_ru
    responseUserData.value.course = res.data.studen_info.course_number
    responseUserData.value.group = res.data.studen_info.group
    responseUserData.value.fullName = res.data.studen_info.full_name
    responseUserData.value.phone = res.data.studen_info.phone
    responseUserData.value.email = res.data.studen_info.email

    userData.value = {
      discipline: props.courseRequest.doc?.newParams?.not_formal_student_info?.value.discipline,
      fullName: props.courseRequest.doc?.newParams?.not_formal_student_info?.value.fullName || responseUserData.value.fullName,
      speciality: props.courseRequest.doc?.newParams?.not_formal_student_info?.value.speciality || responseUserData.value.speciality,
      group: props.courseRequest.doc?.newParams?.not_formal_student_info?.value.group || responseUserData.value.group,
      course: (props.courseRequest.doc?.newParams?.not_formal_student_info?.value.course > 0 ? props.courseRequest.doc?.newParams?.not_formal_student_info?.value.course : null) || (responseUserData.value.course > 0 ? responseUserData.value.course : null),
      phone: (props.courseRequest.doc?.newParams?.not_formal_student_info?.value.phone > 0
          ? props.courseRequest.doc.newParams.not_formal_student_info.value.phone
          : '') || (responseUserData.value.phone > 0 ? responseUserData.value.phone : null),
      email: props.courseRequest.doc?.newParams?.not_formal_student_info?.value.email || responseUserData.value.email,
    }
    emit('childInputData', userData.value)

  }).catch(err => {

    if (err.response && err.response.status == 401) {
      store.dispatch("logLout")
    } else if (err.response && err.response.data && err.response.data.localized) {
      showMessage('error', t(err.response.data.localizedPath), null)
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
        return null;
    }
  } else {
    return null;
  }

};

const input = () => {
  changed.value = true;
  emit('childInputData', userData.value)
  emit('validateInput', {
    course: !validateCourse(userData.value.course),
    email: !(userData.value.email === null || /\S+@\S+\.\S+/.test(userData.value.email)),
    phone: userData.value.phone === null || !validatePhoneNumber(userData.value.phone),
  });
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
  isAdmin.value = (findRole(null, 'main_administrator') || findRole(null, "career_administrator"))
  currentUser.value = JSON.parse(localStorage.getItem("loginedUser"));
  getStudentInfo()
  getCourse();
});
// codesToExclude.includes(props.courseRequest.doc?.docHistory?.stateEn) &&

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

.status-rejected {
  background: red;
  color: #fff;
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
