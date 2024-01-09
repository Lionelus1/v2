<template>
  <h3>{{ $t('educationalPrograms.educationalProgramConstructor') }} - {{ $t('educationalPrograms.bachelor') }}</h3>
  <div>
    <div class="card">
      <Button @click="goToAdd()" icon="pi pi-plus-circle" :label="$t('common.add')"/>
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
        <Column field="status" :header="$t('common.status')">
          <template #body="s">
              <div v-for="i of s.data.status" :key="i">
                <span :class="'mr-2 customer-badge status-' + i.code">{{ i['name' + locale] }}</span>
              </div>
          </template>
        </Column>
        <Column field="status">
          <template #body="s">
              <ActionButton :show-label="true" :items="initItems" @toggle="toggle(s.data.id)" />
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
import ActionButton from "@/components/ActionButton.vue";

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
  if(route.path === '/educational-programs/master'){
    st = 2
  }
  if(route.path === '/educational-programs/doctoral'){
    st = 3
  }
  return st
})
const initItems = computed(() =>
    {
      return [
        {
          label: t('common.edit'),
          icon: 'fa-solid fa-pen',
          command: () => {
            //openEdit(actionsNode.value)
          }
        },
        {
          label: t('common.delete'),
          icon: 'fa-solid fa-trash',
          command: () => {
            deleteEP(actionsNode.value)
          }
        },

      ];
    }
)
const actionsNode = ref(null)
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
  service.deleteSyllabus(id).then(response => {
    toast.add({ severity: 'success', summary: t('common.success'), life: 3000 });
    getSyllabusByDegree()
  }).catch(error => {
    toast.add({
      severity: "error",
      summary: error,
      life: 3000,
    });
  });
}

watch(() => route.params.slug, (old, newVal) => {
    if(newVal === 'bachelor'){
      id.value = 1
    }
    if(newVal === 'master'){
      id.value = 2
    }
    if(newVal === 'doctoral'){
      id.value = 3
    }

    getSyllabusByDegree()
})

const toggle = (node) => {
  actionsNode.value = node
}

onMounted(() => {
  getSyllabusByDegree()
})

</script>

<style scoped>

</style>