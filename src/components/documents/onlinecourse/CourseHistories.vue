<template>
  <h1>Потоки</h1>
  {{ courseHistoryStudentsVisible }}
  <DataTable :value="courseHistories">
    <Column :header="$t('common.date')">
      <template #body="slotProps">
        {{ slotProps.data.startDate }} - {{ slotProps.data.startDate }}
      </template>
    </Column>
    
    <Column field="studentCount" header="Количество студентов"></Column>
    
    <Column :header="$t('contracts.columns.author')">
      <template #body="slotProps">
        {{ slotProps.data.setter.fullName }}
      </template>
    </Column>

    <Column>
      <template #body="slotProps">
        <Button class="p-button-text p-1 mr-2"  @click="courseHistory=slotProps.data;openCourseHistoryStudentsDialog()">
              <i class="fa-solid fa-eye fa-xl"></i>
            </Button>
      </template>
    </Column>

  </DataTable>

  <Sidebar v-model:visible="courseHistoryStudentsVisible"
    position="right" class="p-sidebar-lg"
    style="width: 50%;" @hide="closeCourseHistoryStudents">
    <CourseStudents :courseHistoryID="courseHistory?.id"
     studentState="certified" courseHistoryState="inactive"/>
    </Sidebar>
</template>
<script setup>
  import {computed, onMounted, ref, defineProps, inject} from "vue";
  import {useI18n} from "vue-i18n";
  import {useToast} from "primevue/usetoast";
  import {OnlineCourseService} from "@/service/onlinecourse.service";
  import CourseStudents from "./ CourseStudents.vue";

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
  const courseHistoryStudentsVisible = ref(false)

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

  const openCourseHistoryStudentsDialog = () => {
    courseHistoryStudentsVisible.value = true
  }

  const closeCourseHistoryStudents = () => {
    
  }

  onMounted(() => {
    getCourseHistories()
  })

</script>
<style scoped>

</style>