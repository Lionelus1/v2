<template>
  <h1>Потоки</h1>

  <DataTable :value="courseHistories">
    <Column field="name_kz" :header="$t('common.date')"></Column>
    <Column field="name_kz" :header="$t('common.name')"></Column>
    <Column field="name_kz" :header="$t('common.name')"></Column>
    <Column field="name_kz" :header="$t('common.name')"></Column>
  </DataTable>

</template>
<script setup>
  import {computed, onMounted, ref, defineProps, inject} from "vue";
  import {useI18n} from "vue-i18n";
  import {useToast} from "primevue/usetoast";
  import {OnlineCourseService} from "@/service/onlinecourse.service";

  const emitter = inject("emitter");
  const {t, locale} = useI18n()
  const toast = useToast()
  const loading = ref(false)
  const onlineCourseService = new OnlineCourseService
  const props = defineProps({
    courseID: {
      type: Number,
      default: 0,
    }
  })

  const courseHistories = ref([])
  const courseHistory = ref(null)
  const total = ref(0)
  const lazyParams = ref({
    page: 0,
    rows: 10,
  })

  const getCourseHistories = () => {
    const req = {
      course_id: props.courseID,
      page: lazyParams.value.page,
      rows: lazyParams.value.rows
    }

    loading.value = true

    onlineCourseService.getCourseHistories(req).then(res => {
      courseHistories.value = res.data.course_histories
      total.value = res.data.total
      loading.value = false
    }).catch(err => {
      loading.value=false
      toast.add({severity: 'error', summary: t('common.error'), life: 3000})
    })

  }

  onMounted(() => {
    getCourseHistories()
  })

</script>
<style scoped>

</style>