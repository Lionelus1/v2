<template>
  <div class="dialog">
    <h2>{{ $t('hikvision.workSchedule') }}</h2>
    <div>
      <h3>{{ $t('hikvision.workScheduleForPPS') }}</h3>
      <div v-for="day in days" :key="day">
        <label>{{ day }}</label>
        <input type="time" v-model="ppsSchedule[day].start" />
        <input type="time" v-model="ppsSchedule[day].end" />
        <input type="time" v-model="ppsSchedule[day].breakStart" />
        <input type="time" v-model="ppsSchedule[day].breakEnd" />
        <label><input type="checkbox" v-model="ppsSchedule[day].isDayOff" />{{ $t('hikvision.dayOff') }}</label>
      </div>
    </div>
    <div>
      <h3>{{ $t('hikvision.workScheduleForEmployees') }}</h3>
      <div v-for="day in days" :key="day">
        <label>{{ day }}</label>
        <input type="time" v-model="employeeSchedule[day].start" />
        <input type="time" v-model="employeeSchedule[day].end" />
        <input type="time" v-model="employeeSchedule[day].breakStart" />
        <input type="time" v-model="employeeSchedule[day].breakEnd" />
        <label><input type="checkbox" v-model="employeeSchedule[day].isDayOff" />{{ $t('hikvision.dayOff') }}</label>
      </div>
    </div>
    <button @click="reset">{{ $t('hikvision.reset') }}</button>
    <button @click="save">{{ $t('hikvision.save') }}</button>
    <button @click="$emit('close')">{{ $t('hikvision.cancel') }}</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const defaultSchedule = {
  start: '09:00',
  end: '18:00',
  breakStart: '13:00',
  breakEnd: '14:00',
  isDayOff: false,
};

const ppsSchedule = ref(days.reduce((acc, day) => {
  acc[day] = { ...defaultSchedule };
  if (day === 'Sunday') acc[day].isDayOff = true;
  return acc;
}, {}));

const employeeSchedule = ref(days.reduce((acc, day) => {
  acc[day] = { ...defaultSchedule };
  if (day === 'Saturday' || day === 'Sunday') acc[day].isDayOff = true;
  return acc;
}, {}));

const reset = () => {
  ppsSchedule.value = days.reduce((acc, day) => {
    acc[day] = { ...defaultSchedule };
    if (day === 'Sunday') acc[day].isDayOff = true;
    return acc;
  }, {});
  employeeSchedule.value = days.reduce((acc, day) => {
    acc[day] = { ...defaultSchedule };
    if (day === 'Saturday' || day === 'Sunday') acc[day].isDayOff = true;
    return acc;
  }, {});
};

const save = () => {
  // Добавьте логику для сохранения расписания
  $emit('close');
};
</script>
