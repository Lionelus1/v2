<template>
  <ActionButton v-if="findRole(null,'online_course_administrator')" :show-label="true" :items="menu" @toggle="toggleAction(data)">
  </ActionButton>
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


    <Column :header="t('common.date')" >
      <template #body="slotProps">
        {{ formatDate(slotProps.data.startDate) }} - {{ formatDate(slotProps.data.finalDate) }}
      </template>
    </Column>
    <!-- v-if="findRole(null, 'online_course_administrator')" -->
    <Column  field="studentCount" :header="t('course.numberParticipants')"></Column>

    <Column field="state.namekz" header="Статус"></Column>

    <Column :header="t('contracts.columns.author')">
      <template #body="slotProps">
        {{ slotProps.data.setter.fullName }}
      </template>
    </Column>

    <Column>
      <template #body="slotProps">
        <ActionButton :show-label="true" :items="initItems(slotProps).value" @toggle="toggle2(slotProps)"/>
        <!-- <Button class="p-button-text p-1 mr-2"  @click="courseHistory=slotProps.data;openCourseHistoryStudentsDialog()">
              <i class="fa-solid fa-eye fa-xl"></i>
            </Button> -->
      </template>
    </Column>

  </DataTable>

  <!-- КУРС ҚАТЫСУШЫЛАРЫ  -->
  <Sidebar v-model:visible="courseHistoryStudentsVisible"
    position="right" class="p-sidebar-lg"
    style="width: 50%;" @hide="closeCourseHistoryStudents">

    <CourseStudents :courseHistory="courseHistory" :courseHistoryID="courseHistory?.id" :props-course="propsCourse" :get-course="getCourse" @update-course="getCourse" />

  </Sidebar>

  <Sidebar position="right" class="p-sidebar-lg"
           style="width: 50%;"  v-model:visible="courseDialog">
    <NewCourseFlow :courseState="7" :propsCourse="propsCourse" :closeSideBar="closeCourseDialog"/>
  </Sidebar>

</template>
<script setup>
  import {computed, onMounted, ref, defineProps, inject} from "vue";
  import {useI18n} from "vue-i18n";
  import {useToast} from "primevue/usetoast";
  import {OnlineCourseService} from "@/service/onlinecourse.service";
  import CourseStudents from "./CourseStudents.vue";
  import {findRole} from "@/config/config";
  import ActionButton from "@/components/ActionButton.vue";
  import NewCourseFlow from "./NewCourseFlow.vue"
  import {useRoute, useRouter} from "vue-router";
  import {useConfirm} from "primevue/useconfirm";

  const emitter = inject("emitter");
  const {t, locale} = useI18n()
  const toast = useToast()
  const confirm = useConfirm()
  const loading = ref(false)
  const onlineCourseService = new OnlineCourseService
  const props = defineProps({
    courseHistoryID: {
      type: Number,
      default: 0,
    },
    courseID: {
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
  const menu =  ref([
    {
      label: t("course.openNewThread"),
      icon: 'fa-solid fa-stream',
      command: () => openCourseDialog()
    },
  ])

  const initItems = (slotProps) => computed(() => {
    return [
      {
        label: t('common.show'),
        icon: 'fa-solid fa-eye',
        command: () => {
          courseHistory.value = slotProps.data;
          openCourseHistoryStudentsDialog();
        }
      },
      {
        label: t('common.delete'),
        icon: 'fa-solid fa-trash',
        visible: slotProps.data.state.code === "inactive" && slotProps.data.studentCount === 0,
        command: () => {
          deleteConfirm(slotProps.data.id)
        }
      },
    ];
  })

  const courseDialog = ref(false)
  const actionsNode = ref(null)
  const router = useRouter()
  const route = useRoute()

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
    // eslint-disable-next-line no-undef
    router.push({ name: 'CourseStudents', params: { id: props.propsCourse.id, history_id: courseHistory.value.id } });
    // courseHistoryStudentsVisible.value = true
  }
  const closeCourseHistoryStudents = () => {
  }

  const formatDate = (dateString) => {
    const options = {  day: 'numeric', month: 'numeric', year: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleString(undefined, options).replace(/\//g, '.');
  };

  const onPage = (event) => {
    lazyParams.value = event
    getCourseHistories()
  }

  const openCourseDialog = () => {
    courseDialog.value = true
  }

  const toggleAction = (node) =>  {
    actionsNode.value = node
  }

  const toggle2 = (node) => {
    actionsNode.value = node
  }

  const closeCourseDialog = () => {
    courseDialog.value = false
    getCourseHistories()
  }

  const deleteConfirm = (courseHistoryId) => {
    confirm.require({
      message: t('common.doYouWantDelete'),
      header: t('common.delete'),
      icon: 'pi pi-info-circle',
      acceptClass: 'p-button-rounded p-button-success',
      rejectClass: 'p-button-rounded p-button-danger',
      accept: () => {
        const params = {
        course_history_id: courseHistoryId,
        course_id: props.propsCourse?.id || 0,
        page: lazyParams.value.page,
        rows: lazyParams.value.rows
      }
        deleteCourseHistory(params)
      },
    });
  }

  const deleteCourseHistory = (params) => {
    loading.value = true
    onlineCourseService.deleteCourseHistory(params).then(res => {
      if (res.data) {
      toast.add({severity: "success", summary: t('common.success'), life: 3000});
      } else {
        toast.add({severity: "warn", summary: t('common.message.title.saveError'), life: 3000});
        loading.value = false
      }
      getCourseHistories();
    }).catch(error => {
      loading.value = false
      toast.add({severity: "error", summary: error, life: 3000});

    });
  }

  onMounted(() => {
    getCourseHistories()
  })

</script>
<style scoped>

</style>