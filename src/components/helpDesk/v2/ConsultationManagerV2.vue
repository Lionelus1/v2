<template>
  <div v-for="(item, index) in formFields" :key="index" class="p-fluid md:col-6 mt-2" style="padding-right: 250px">
    <label>{{ item.label }}</label>
    <template v-if="item.type === 'text' || item.type === 'textarea'">
      <InputText v-if="item.type === 'text'" :placeholder="item.placeholder" type="text" @input="input" class="mt-2" v-model="userData[item.model]" :disabled="disabledStatus"/>
      <Textarea v-if="item.type === 'textarea'" :placeholder="item.placeholder" class="mt-2" @input="input" v-model="userData[item.model]" autoResize rows="5" cols="30"/>
    </template>
    <PrimeCalendar v-if="item.type === 'calendar'" class="mt-2" v-model="userData[item.model]" :id="item.id" showTime :hourFormat="item.hourFormat" :placeholder="item.placeholder"/>
    <div v-if="item.validationRequest" style="color: red; margin-top: 5px">
      {{ item.validationMessage }}
    </div>
  </div>
</template>

<script setup>
import {useI18n} from "vue-i18n";
import {ref, computed, onMounted} from 'vue';
import DocEnum from "@/enum/docstates/index";
import {getHeader, smartEnuApi, findRole} from "@/config/config";

const {t, locale} = useI18n()
const currentUser = ref(JSON.parse(localStorage.getItem("loginedUser")))
const emit = defineEmits(['childConsultationInput', 'validationConsultation'])
const isAdmin = ref((findRole(null, 'main_administrator') || findRole(null, "career_administrator")))
const userData = ref({
  specialization: null,
  dateTime: null,
  description: null,
  fullName: null,
  speciality: null,
  group: null,
  course: null,
  phone: null,
  email: null,
})

const props = defineProps({
  validationRequest: {
    type: Object,
    default: Object
  }
})

const formFields = ref([
  { label: t('helpDesk.application.selectSpecialist'), placeholder: t('helpDesk.application.selectSpecialist'), type: 'text', model: 'userData.specialization' },
  { label: t('helpDesk.application.date'), placeholder: t('common.select'), type: 'calendar', model: userData.value.dateTime, id: 'calendar-24h', showTime: true, hourFormat: '24' },
  { label: t('helpDesk.application.description'), type: 'textarea', model: userData.value.description },
  { label: t('common.fullName'), model: userData.value.fullName, type: 'text', placeholder: t('common.fullName'),   validation: null,show: true },
  { label: t('contracts.cafedraGroup'), model: userData.value.group, type: 'text', placeholder: userData.value.group || t('contracts.cafedraGroup'),   validation: null, show: true },
  { label: t('contact.phone'), model: userData.value.phone, type: 'text', placeholder: t('contact.phone'),   validation: 'phone', show: true},
  { label: t('contact.email'), model: userData.value.email, type: 'text', placeholder: t('contact.email'),   validation: 'email', show:true },
])

const disabledStatus = isAdmin.value || props.courseRequest?.doc?.docHistory?.stateId == DocEnum.INAPPROVAL.ID || props.courseRequest?.doc?.docHistory?.stateId == DocEnum.REJECTED.ID
const validatePhoneNumber = (phoneNumber) => {

  const phoneRegex = /^(8|\+7)?\(\d{3}\)\d{7}$|^(8|\+7)?\d{10}$/;

  return phoneRegex.test(phoneNumber);
}

const input = () => {
  emit('childConsultationInput', userData.value)
  emit('validationConsultation', {
    phone: userData.value.phone === null || !validatePhoneNumber(userData.value.phone),
  });
}

emit('childInputData', userData.value)
emit('validationConsultation', {
  phone: userData.value.phone === null || !validatePhoneNumber(userData.value.phone),
});


</script>

<style>

</style>