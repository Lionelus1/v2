<template>
  <div class="field">
    <label>{{ $t('educationalPrograms.semester') }}</label>
    <Dropdown v-model="semester" :options="semesters" optionLabel="name" optionValue="id"
      :placeholder="$t('educationalPrograms.semester')" />
    <small class="p-error" v-if="submitted && formValid.semester">{{
      $t('workPlan.errors.pleaseChoose')
      }}</small>
  </div>
  <div class="field" v-if="plan?.plan_type?.code === Enum.WorkPlanTypes.Doctors">
    <label>{{ $t('workPlan.approvalUsers') }}</label>
    <FindUser v-model="selectedUsers" :editMode="true" :user-type="3"></FindUser>
    <small class="p-error" v-if="submitted && formValid.users">{{
      $t('workPlan.errors.approvalUserError')
      }}</small>
  </div>
  <div class="field">
    <label>{{ $t('workPlan.content') }}</label>
    <Textarea v-model="event_name" rows="3" style="resize: vertical" />
  </div>
  <div class="field">
    <label>{{ $t('common.startDate') }}</label>
    <PrimeCalendar v-model="start_date" dateFormat="dd.mm.yy" showIcon :showButtonBar="true"></PrimeCalendar>
  </div>
  <div class="field">
    <label>{{ $t('common.endDate') }}</label>
    <PrimeCalendar v-model="end_date" dateFormat="dd.mm.yy" showIcon :showButtonBar="true"></PrimeCalendar>
  </div>
  <div class="field">
    <label>{{ $t('workPlan.expectingResults') }}</label>
    <Textarea v-model="result" rows="3" style="resize: vertical" />
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import Enum from '@/enum/workplan/index';

const props = defineProps(['plan']);
const emit = defineEmits('updateData');

const semester = ref(1);
const start_date = ref(new Date());
const end_date = ref(new Date());
const event_name = ref(null);
const result = ref(null);

watch([semester, start_date, end_date, result, event_name], () => {
  let data = {
    event_name,
    result,
    start_date,
    end_date,
    semester,
  };
  emit('updateData', data);
});

const semesters = [
  {
    id: 1,
    name: '1',
  },
  {
    id: 2,
    name: '2',
  },
  {
    id: 3,
    name: '3',
  },
  {
    id: 4,
    name: '4',
  },
];

onMounted(() => {
  if (props.plan?.plan_type?.code === Enum.WorkPlanTypes.Doctors) {
    semesters.push(
      ...[
        {
          id: 5,
          name: '5',
        },
        {
          id: 6,
          name: '6',
        },
      ]
    );
  }
});
</script>
