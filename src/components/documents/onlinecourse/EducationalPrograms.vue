<template>
  <h3>{{ $t('educationalPrograms.educationalProgramConstructor') }} - {{ $t('educationalPrograms.bachelor') }}</h3>
  <div>
    <div class="card">
      <Button @click="goToAdd()" icon="pi pi-plus-circle" :label="$t('educationalPrograms.createEP')" :title="$t('educationalPrograms.name')"/>
      <Button class="ml-2" icon="pi pi-filter" label="Фильтр"/>
      <DataTable :value="educationalPrograms">
        <Column :field="['name'+locale]" :header="$t('common.speciality') + '/' + $t('educationalPrograms.groupEP')"></Column>
        <Column field="name" :header="$t('educationalPrograms.specialization')">
          <template #body="s">
            <div v-for="i of s.data.eduProg" :key="i">
              {{ i['name_' + locale] }}
            </div>
          </template>
        </Column>
        <Column field="category" :header="$t('educationalPrograms.formStudy')">
          <template #body="s">
            {{ locale === "kz" ? s.data.trainingPeriodKz : locale === "ru" ? s.data.trainingPeriodRu : s.data.trainingPeriodEn }}
          </template>
        </Column>
        <Column field="createdDate" :header="$t('contracts.columns.createDate')">
          <template #body="s">
            {{ moment(new Date(s.data.createdDate)).utc().format("DD.MM.YYYY") }}
          </template>
        </Column>
        <Column field="status" header="">
          <template #body="s">
            <div v-for="i of s.data.status" :key="i">
              {{ i['name' + locale] }}
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<script setup>

import {useRoute, useRouter} from "vue-router";
import {computed, ref} from "vue";
import {OnlineCourseService} from "@/service/onlinecourse.service";
import {useI18n} from "vue-i18n";
import moment from "moment";

const {t, locale} = useI18n()
const router = useRouter()
const route = useRoute()
const educationalPrograms = ref([])
const service = new OnlineCourseService()
const id = computed(()=>{
  let  st = null
  if(route.path === '/educational-programs/bachelor'){
    st = 1
  }
  if(route.path === '/educational-programs/magistr'){
    st = 2
  }
  if(route.path === '/educational-programs/doctoral'){
    st = 3
  }
  return st
})
const getSyllabusByDegree = () => {
  service.getSyllabusByDegree(id.value).then(response => {
    if (response.data) {
      educationalPrograms.value = response.data
    }
  }).catch(_ => {
  });
}
getSyllabusByDegree()
const goToAdd = () => {
  router.push({name: "addEducationalPrograms", params: {degreeID: id.value}})
}
</script>

<style scoped>

</style>