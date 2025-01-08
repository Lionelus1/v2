<template>
  <div class="card container-for-table">
    <div class="flex justify-center">
      <!--      <ProgressSpinner v-if="!data" style="width: 50px;" strokeWidth="5" fill="transparent"/>-->
    </div>
    <table class="tablews">
      <thead>
      <tr>
        <th class="capitalize">{{ $t("workPlan.week") }}</th>
        <th>{{ $t("common.startDate") }}</th>
        <th>{{ $t("common.endDate") }}</th>
        <th>{{ $t("workPlan.contentsOfPlannedWork") }}</th>
        <th>{{ $t("web.note") }}</th>
        <th>{{ $t("workPlan.respExecutor") }}</th>
        <th>{{ $t("common.status") }}</th>
        <th></th>
      </tr>
      </thead>
      <tbody>
      <!-- Example row; you can add more rows as needed -->
      <tr v-for="item in [...section1, ...section2,...section3,...section4]" :key="item.quarter">
        <td v-if="item.section" colspan="8">
          <div class="flex justify-content-between">
            <span class="font-bold">{{ $t(item.section) }}</span>
            <span v-if="!isFinsih"><Button :label="$t('common.add')" class="button-blue" icon="fa-solid fa-plus"
                                           @click="emit('showDialog', {dialog: dialog.add, section: item.id})"/></span>
          </div>
        </td>
        <template v-else>
          <td>{{ item.quarter }}</td>
          <td>{{ formatDateMoment(item.start_date) }}</td>
          <td>{{ formatDateMoment(item.end_date) }}</td>
          <td>{{ item.event_name }}</td>
          <td>{{ item.result }}</td>
          <td>{{ item.responsible_executor }}</td>
          <td> <span :class="'customer-badge status-' + item.status.work_plan_event_status_id">{{
              $i18n.locale === "kz" ? item.status.name_kz : $i18n.locale === "ru" ? item.status.name_ru :
                  item.status.name_en
            }}</span></td>
          <td>
            <ActionButton :items="items(item)" :show-label="true" @toggle="emit('onToggle', item)" style="width: 100%"/>
          </td>
        </template>
      </tr>
      <!-- Add more rows here -->
      </tbody>
    </table>
  </div>

</template>

<script setup>
import ActionButton from "@/components/ActionButton.vue";
import moment from "moment";
import {watch, ref, onMounted} from 'vue'

const props = defineProps(['data', 'items', 'total', 'loading', "dialog", "isFinsih"])
const emit = defineEmits('onToggle', 'onPage', 'onExpand', 'showDialog')
const section1 = ref([{section: "workPlan.academiCWork", id: 1}])
const section2 = ref([{section: "workPlan.participationInSeminars", id: 2}])
const section3 = ref([{section: "workPlan.additionalTypesOfWork", id: 3}])
const section4 = ref([{section: "workPlan.feedbackFromDoctorsStudent", id: 4}])

function formatDateMoment(date, showHour) {
  if (showHour) return moment(new Date(date)).utc().format("DD.MM.YYYY HH:mm:ss")
  return moment(new Date(date)).utc().format("DD.MM.YYYY")
}

watch(
    () => props.data,
    (newData) => {
      section1.value = section1.value.slice(0, 1)
      section2.value = section2.value.slice(0, 1)
      section3.value = section3.value.slice(0, 1)
      section4.value = section4.value.slice(0, 1)
      if (newData?.length > 0) {
        newData.forEach((item) => {
          switch (item.semester) {
            case 1:
              section1.value.push(item)
              break
            case 2:
              section2.value.push(item)
              break
            case 3:
              section3.value.push(item)
              break
            case 4:
              section4.value.push(item)
              break
          }
        })
      }
    },
    {immediate: true}
);


</script>

<style>
.container-for-table {
  width: 100%;
  overflow-x: auto;
}

.tablews {
  width: 100%;
  border: 1px solid #e0e3ea;
}

.tablews th {
  padding: 8px;
  border: 1px solid #e0e3ea;
}

.tablews td {
  border: 1px solid #e0e3ea;
  padding: 8px;
}

.button-blue {
  color: #0d89ec !important;
  background: rgba(13, 137, 236, 0.15);
  border: none;
}

.button-blue:hover {
  background: rgba(13, 137, 236, 0.3) !important;
}
</style>