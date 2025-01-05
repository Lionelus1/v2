<template>
  <div class="field">
    <label style="text-transform: capitalize">{{ $t('workPlan.week') }}</label>
    <InputNumber v-model="quarter"/>
  </div>
  <div class="field">
    <label>{{ $t('common.startDate') }}</label>
    <PrimeCalendar
        v-model="start_date"
        dateFormat="dd.mm.yy"
        showIcon
        :showButtonBar="true"
    ></PrimeCalendar>
  </div>
  <div class="field">
    <label>{{ $t('common.endDate') }}</label>
    <PrimeCalendar
        v-model="end_date"
        dateFormat="dd.mm.yy"
        showIcon
        :showButtonBar="true"
    ></PrimeCalendar>
  </div>
  <div class="field">
    <label>{{ $t('workPlan.contentsOfPlannedWork') }}</label>
    <Textarea v-model="event_name" rows="3" style="resize: vertical"/>
  </div>
  <div class="field">
    <label>{{ $t('workPlan.approvalUsers') }}</label>
    <FindUser v-model="resp_person" :editMode="true" :user-type="3" :max="1"></FindUser>
    <small class="p-error" v-if="formValid?.users">{{
        $t('workPlan.errors.approvalUserError')
      }}</small>
  </div>
  <div class="field">
    <label>{{ $t('web.note') }}</label>
    <Textarea v-model="result" rows="3" style="resize: vertical"/>
  </div>
</template>

<script setup>
import {onMounted, ref, watch} from 'vue';
import Enum from '@/enum/workplan/index';

const props = defineProps(['plan', 'formValid']);
const emit = defineEmits('updateData');

const quarter = ref(null);
const start_date = ref(new Date());
const end_date = ref(new Date());
const event_name = ref(null);
const result = ref(null);
const resp_person = ref([JSON.parse(localStorage.getItem('loginedUser'))]);
const resp_person_id = ref(
    JSON.parse(localStorage.getItem('loginedUser')).userID
);

watch(
    [
      quarter,
      start_date,
      end_date,
      event_name,
      result,
      resp_person_id,
      resp_person,
    ],
    () => {
      if (resp_person.value?.length > 0) {
        resp_person_id.value = resp_person.value[0].userID;
      } else {
        resp_person_id.value = null
      }
      let data = {
        event_name,
        start_date,
        end_date,
        resp_person_id,
        quarter,
        result
      };
      emit('updateData', data);
    }
);


onMounted(() => {
  if (resp_person.value?.length > 0) {
    resp_person_id.value = resp_person.value[0].userID;
  } else {
    resp_person_id.value = null
  }
  let data = {
    event_name,
    start_date,
    end_date,
    resp_person_id,
    quarter,
    result
  };
  emit('updateData', data);
});
</script>