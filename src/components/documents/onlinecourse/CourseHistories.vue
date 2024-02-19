<template>
  <DataTable :value="courseHistories" class="p-datatable-sm"
             :lazy="true" :totalRecords="total"
             @page="onPage($event)" :first="lazyParams.first"
             :paginator="true" :rows="lazyParams.rows" :loading="loading"
             paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink JumpToPageDropdown CurrentPageReport RowsPerPageDropdown"
             :rowsPerPageOptions="[10, 25, 50]"
             :currentPageReportTemplate="t('common.showingRecordsCount', {
          first: '{first}',
          last: '{last}',
          totalRecords: '{totalRecords}',
      })" responsiveLayout="stack" breakpoint="480px">


    <Column :header="t('common.date')" @page="onPage($event)" :first="lazyParams.first">
      <template #body="slotProps">
        {{ formatDate(slotProps.data.startDate) }} - {{ formatDate(slotProps.data.finalDate) }}
      </template>
    </Column>

    <Column field="studentCount" :header="t('course.numberParticipants')"></Column>

    <Column :header="t('contracts.columns.author')">
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

  <!-- КУРС ҚАТЫСУШЫЛАРЫ  -->
  <Sidebar v-model:visible="courseHistoryStudentsVisible"
    position="right" class="p-sidebar-lg"
    style="width: 50%;" @hide="closeCourseHistoryStudents">

    <CourseStudents studentState="certified" :courseHistoryID="courseHistory?.id" courseHistoryState="inactive" :props-course="propsCourse" :get-course="getCourse" @update-course="getCourse" />

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
    courseHistoryID: {
      type: Number,
      default: 0,
    },
    propsCourse: {
      type: Object,
      default: Object,
    },
    studentState: {
      type: String,
      default: null
    },
    courseHistoryState: {
      type: String,
      default: null
    },
    getCourse: {
      type: Function,
      default: () => {},
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
      course_id: props.propsCourse?.id || 0,
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

  const formatDate = (dateString) => {
    const options = { month: 'numeric', day: 'numeric', year: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleString(undefined, options).replace(/\//g, '.');
  };

  const onPage = (event) => {
    lazyParams.value = event
    getCourseHistories()
  }

  onMounted(() => {
    getCourseHistories()
  })

</script>
<style scoped>

</style>