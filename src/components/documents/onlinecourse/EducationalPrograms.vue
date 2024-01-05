<template>
  <h3>{{ $t('educationalPrograms.educationalProgramConstructor') }} - {{ $t('educationalPrograms.bachelor') }}</h3>
  <div>
    <div class="card">
      <Button @click="goToAdd()" icon="pi pi-plus-circle" :label="$t('educationalPrograms.createEP')" :title="$t('educationalPrograms.name')"/>
      <Button class="ml-2" icon="pi pi-filter" label="Фильтр"/>
      <DataTable class="mt-4" :value="educationalPrograms" responsiveLayout="scroll" :resizableColumns="true" show-gridlines columnResizeMode="fit">
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
            <div class="flex align-items-center">
              <div v-for="i of s.data.status" :key="i">
                {{ i['name' + locale] }}
              </div>
              <i v-if="isAdmin" class="pi pi-trash text-red-500 cursor-pointer ml-4" @click="deleteEP(s.data.id)"></i>
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<script setup>

import {useRoute, useRouter} from "vue-router";
import {computed, onMounted, ref, watch} from "vue";
import {OnlineCourseService} from "@/service/onlinecourse.service";
import {useI18n} from "vue-i18n";
import moment from "moment";
import {useToast} from "primevue/usetoast";
import {useConfirm} from "primevue/useconfirm";
import {findRole} from "@/config/config";

const {t, locale} = useI18n()
const router = useRouter()
const route = useRoute()
const educationalPrograms = ref([])
const service = new OnlineCourseService()
const toast = useToast();
const confirm = useConfirm();
const authUser = computed(() => JSON.parse(localStorage.getItem("loginedUser")))
const isAdmin = computed(() => findRole(authUser.value, "online_course_administrator"))
const id = computed(()=>{
  let  st = 2
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

const goToAdd = () => {
  router.push({name: "addEducationalPrograms", params: {degreeID: id.value}})
}
const deleteEP = (id) => {
  confirm.require({
    message: t('common.doYouWantDelete'),
    header: t('common.delete'),
    icon: 'pi pi-info-circle',
    acceptClass: 'p-button-rounded p-button-success',
    rejectClass: 'p-button-rounded p-button-danger',
    accept: () => {
      remove(id)
    },
  });
}
const remove = (id) =>{
  console.log(id)
  /*service.deleteCourse(id).then(response => {
    toast.add({ severity: 'success', summary: this.$t('common.success'), life: 3000 });
    getSyllabusByDegree()
  }).catch(error => {
    toast.add({
      severity: "error",
      summary: error,
      life: 3000,
    });
  });*/
}

watch(() => route.params.slug, (old, newVal) => {
    if(newVal === 'bachelor'){
      id.value = 1
    }
    if(newVal === 'magistr'){
      id.value = 2
    }
    if(newVal === 'doctoral'){
      id.value = 3
    }

    getSyllabusByDegree()
})

onMounted(() => {
  getSyllabusByDegree()
})

</script>

<style scoped>

</style>