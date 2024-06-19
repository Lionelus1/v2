<template>
  <div class="flex justify-content-center">
    <div class="card calendar_days">
      <div class="flex flex-column gap-3">
        <span class="title">{{ $t('queue.workingDays') }}</span>
        <PrimeCalendar class="" :manualInput="true" v-model="workDays.date" dateFormat="dd.mm.yy"
                       :invalid="!workDays.date && submitted" showIcon iconDisplay="input" selectionMode="range">
        </PrimeCalendar>
        <span class="title">{{ $t('queue.workingHours') }}</span>
        <div class="flex">
          <div>
            <PrimeCalendar v-model="workDays.start_time" timeOnly dateFormat="HH:mm"/>
          </div>
          <div>
            <PrimeCalendar v-model="workDays.end_time" timeOnly/>
          </div>
        </div>
        <span class="title">{{ $t('queue.lunch') }}</span>
        <div class="flex">
          <div>
            <PrimeCalendar v-model="workDays.lunch_start_time" timeOnly/>
          </div>
          <div>
            <PrimeCalendar v-model="workDays.lunch_final_time" timeOnly/>
          </div>
        </div>
        <span class="title">{{ $t('queue.interval') }}</span>
        <Dropdown v-model="workDays.appointment_duration" :options="intervals" :placeholder="$t('common.select')"/>
        <Button :label="$t('common.edit')" @click="workDaysFunc()"></Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref} from "vue";
import api from "@/service/api";
import {getHeader} from "@/config/config";
import {useRoute} from "vue-router";
import {useToast} from "primevue/usetoast";
import {useI18n} from "vue-i18n";

const route = useRoute()
const parentID = parseInt(route.params.id)
const {t, locale} = useI18n()
const toast = useToast()
const intervals = ref([10, 15, 20, 30])
const startTime = new Date();
startTime.setHours(9, 0, 0, 0);
const endTime = new Date();
endTime.setHours(18, 0, 0, 0);
const lunchStartTime = new Date();
lunchStartTime.setHours(13, 0, 0, 0);
const lunchEndTime = new Date();
lunchEndTime.setHours(14, 0, 0, 0);
const workDays = ref({
  date: null,
  appointment_duration: 20,
  start_time: startTime,
  end_time: endTime,
  lunch_start_time: lunchStartTime,
  lunch_final_time: lunchEndTime,
})
const submitted = ref(false)

const workDaysFunc = () => {
  workDays.value.queue_id = parentID
  submitted.value = true
  if (!validateFields()) {
    return;
  }
  workDays.value.start_date = workDays.value.date[0]
  workDays.value.end_date = workDays.value.date[1]
  api
      .post("/queue/updateAvailability", workDays.value, {
        headers: getHeader(),
      })
      .then((response) => {
        if (response.status === 200) {
          toast.add({severity: 'success', summary: t('common.success'), life: 3000});
        }
      })
      .catch((error) => {
        toast.add({severity: 'error', summary: t('common.error'), life: 3000});
      });
}
const validateFields = () => {
  let errors = [];
  if (!workDays.value.date) {
    errors.push(1)
  }
  return errors.length === 0;
}
</script>

<style scoped>

</style>