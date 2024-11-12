<template>
  <div class="module_grid">
    <div class="module_card" v-for="item in modules" :key="item.id">
      <div class="content">
        <img src="https://www.mooc.org/hubfs/are-free-online-courses-worth-it.jpg" alt="">
        <p>{{ item['name_' + $i18n.locale] }}</p>
      </div>
      <div class="footer">
        <hr>
        <i class="pi pi-list" @click="toggle"></i>
      </div>
    </div>
  </div>

  <OverlayPanel ref="op">
    <Button class="p-button-raised" icon="pi pi-fw pi-desktop" :label="t('Презентация')"/>
    <br>
    <Button class="p-button-outlined w-full" icon="pi pi-fw pi-desktop" :label="t('Тест')"/>
  </OverlayPanel>

  <DataTable selectionMode="single" v-model:selection="module"
             :lazy="true" :value="modules">
    <template #header>
      <div class="table-header flex justify-content-between flex-wrap card-container purple-container">
        <div class="flex gap-2">
          <Button v-if="findRole(null,'online_course_administrator')" class="p-button-success"
                  icon="pi pi-plus" :label="t('common.add')" @click="addModule"/>
        </div>
      </div>
    </template>

    <Column field="name_kz" :header="t('common.name')"></Column>
    <Column field="hours" :header="t('course.moduleHours')"></Column>
    <Column :field="'description_' + $i18n.locale" :header="t('common.description')"></Column>
    <Column field="">
      <template #body="{data}">
        <Button v-if="findRole(null, 'online_course_administrator')" class="p-button-warning mb-2 mr-2"
                icon="pi pi-pencil" label="" @click="updateModule(data)"/>

        <Button v-if="findRole(null,'online_course_administrator')" class="p-button-danger mb-2 mr-2"
                icon="fa-solid fa-trash" label="" @click="deleteModule(data.id)"/>
      </template>
    </Column>
  </DataTable>


  <Sidebar position="right" class="p-sidebar-lg"
           style="width: 50%;"  v-model:visible="moduleDialog">
    <CourseModuleAdd :module="formData" :course-i-d="props.courseID" :close-module-dialog="closeModuleDialog"></CourseModuleAdd>

  </Sidebar>
</template>

<script setup>
import {computed, onMounted, ref, defineProps, inject, watchEffect, watch, toRefs} from "vue";
import {useI18n} from "vue-i18n";
import {useToast} from "primevue/usetoast";
import {OnlineCourseService} from "@/service/onlinecourse.service";
import {smartEnuApi, fileRoute, findRole} from "@/config/config";
import {useConfirm} from "primevue/useconfirm";
import CourseModuleAdd from "@/components/documents/onlinecourse/CourseModuleAdd.vue";

const confirm = useConfirm()
const emitter = inject("emitter");
const {t, locale} = useI18n()
const toast = useToast()
const loading = ref(false)
const onlineCourseService = new OnlineCourseService

const service = new OnlineCourseService();
const course = ref(null);
const modules = ref([]);
const moduleDialog = ref(false);
const module = ref(null);
const submitted = ref(false);
const formData = ref({
  id: null,
  course_id: 0,
  hours: null,
  name_kz: null,
  name_ru: null,
  name_en: null,
  description_kz: null,
  description_ru: null,
  description_en: null,
  duration_type: {
    id: 1,
    name: "hours",
    name_kz: "сағат",
    name_en: "hours",
    name_ru: "часы"
  }
});
const props = defineProps ({
  courseID: {
    type: Number,
    default: null
  }
})
const course_id = ref(props.courseID);



const getModuleByCourseID = async () => {
  loading.value = true;
  try {
    const response = await service.getModulesByCourseID(course_id.value);
    modules.value = response.data;
  } finally {
    loading.value = false;
  }
};

const addModule = () => {
  formData.value = {
    id: null,
    course_id: 0,
    hours: null,
    name_kz: null,
    name_ru: null,
    name_en: null,
    description_kz: null,
    description_ru: null,
    description_en: null,
    duration_type: {
      id: 1,
      name: 'hours',
      name_kz: "сағат",
      name_ru: "часы",
      name_en: "hours"
    }
  };
  moduleDialog.value = true;
};

const closeModuleDialog = () => {
  moduleDialog.value = false;
  formData.value = {};
  getModuleByCourseID()
};

const addModulesToCourse = async () => {
  formData.value.course_id = props.courseID;
  submitted.value = true;

  if (!isValid()) {
    return;
  }

  loading.value = true;

  try {
    await service.addModulesToCourse(formData);
    closeModuleDialog();
    getModuleByCourseID();
  } catch (error) {
    showMessage('error', t('common.error'), '', 3000);
  } finally {
    loading.value = false;
    submitted.value = false;
  }
};

const isValid = () => {
  let errors = [];
  if (!formData.value.name_kz) errors.push(1);
  if (!formData.value.name_ru) errors.push(1);
  if (!formData.value.name_en) errors.push(1);
  if (!formData.value.hours) errors.push(1);
  if (!formData.value.description_kz) errors.push(1);
  if (!formData.value.description_ru) errors.push(1);
  if (!formData.value.description_en) errors.push(1);

  return errors.length === 0;
};

const getCourse = async () => {
  loading.value = true;

  try {
    const response = await service.getCourse(course_id.value);
    course.value = response.data;
    course.value.logo = smartEnuApi + fileRoute + course.value.logo;
  } catch (error) {
    showMessage('error', t('common.error'), '', 3000);
  } finally {
    loading.value = false;
  }
};

const deleteModule = (id) => {
  confirm.require({
    message: t('common.doYouWantDelete'),
    header: t('common.delete'),
    icon: 'pi pi-info-circle',
    accept: () => {
      service.deleteModule(id)
          .then(() => {
            getModuleByCourseID();
            showMessage('success', t('common.success'), '', 3000);
          })
    },
  });
};


const updateModule = (data) => {
  formData.value = data;
  if (!formData.value.duration_type) {
    formData.value.duration_type = {
      id: 1,
      name: 'hours',
      name_kz: "Сағат",
      name_ru: "Часы",
      name_en: "Hours"
    }
  }
  moduleDialog.value = true;
};

const updateModuleOfCourse = async () => {
  formData.value.course_id = props.courseID;
  submitted.value = true;

  if (!isValid()) {
    loading.value = false;
    return;
  }

  loading.value = true;

  try {
    await service.updateModuleOfCourse(formData);
    closeModuleDialog();
  } catch (error) {
    showMessage('error', t('common.error'), '', 3000);
  } finally {
    submitted.value = false;
    loading.value = false;
  }
};

const showMessage = (msgtype, message, content, life) => {
  toast.add({
    severity: msgtype,
    summary: message,
    detail: content,
    life: life
  });
};

onMounted( () => {
  getModuleByCourseID()
})

</script>

<style lang="scss">
/* Остальной стилевой код остается неизменным */
</style>
