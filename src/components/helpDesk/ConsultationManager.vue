<template>
  <div>
    <div class="p-fluid md:col-6" style="padding-right: 250px">
      <label>{{ t('helpDesk.application.selectSpecialist') }}</label>
      <InputText :placeholder="t('helpDesk.application.selectSpecialist')" type="text" @input="input" class="mt-2"
                 v-model="userData.specialization" :disabled="disabledStatus"/>
    </div>
    <div class="p-fluid md:col-6 mt-2" style="padding-right: 250px">
      <label>{{ t('helpDesk.application.date') }}</label>
      <PrimeCalendar class="mt-2" v-model="userData.dateTime" id="calendar-24h" showTime hourFormat="24"
                     :placeholder="t('common.select')"/>
    </div>
  </div>
  <div class="p-fluid md:col-6 mt-2" style="padding-right: 250px">
    <label>{{ t('helpDesk.application.description') }}</label>
    <Textarea class="mt-2" @input="input" v-model="userData.description" autoResize rows="5" cols="30"/>
  </div>
  <div class="p-fluid md:col-6 mt-2" style="padding-right: 250px">
    <label>{{ t('contact.phone') }}</label>
    <InputText :placeholder="t('contact.phone')" @input="input" class="mt-2" v-model="userData.phone"
               :disabled="disabledStatus"/>
    <div v-if="props.validationRequest.phone" style="color: red; margin-top: 5px">
      {{ t('helpDesk.application.enteredIncorrectly') }}
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
  phone: currentUser.value.phoneNumber || null
})

const props = defineProps({
  validationRequest: {
    type: Object,
    default: Object
  }
})
const disabledStatus = isAdmin.value || props.courseRequest?.doc?.docHistory?.stateId == DocEnum.INAPPROVAL.ID || props.courseRequest?.doc?.docHistory?.stateId == DocEnum.REJECTED.ID
const validatePhoneNumber = (phoneNumber) => {

  const phoneRegex = /^(8|\+7)?\(\d{3}\)\d{7}$|^(8|\+7)?\d{10}$/;

  return phoneRegex.test(phoneNumber);
}

console.log(props.validationRequest)

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