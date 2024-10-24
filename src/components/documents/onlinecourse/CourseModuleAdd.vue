
<template>

  <div class="col-12">
    <h3 v-if="formData && formData.id !== null && formData.id > 0">Создать новый модуль</h3>
    <h3 v-else>Модуль обновления</h3>
    <div>
      <Menubar :model="menu" style="height:36px;margin-top:-7px;margin-left:-14px;margin-right:-14px"></Menubar>
    </div>
  </div>

  <div class="col-12 md:col-12 p-fluid">
    <div class="card">
      <div class="grid formgrid">
        <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
          <label>{{ t('common.nameInQazaq') }}</label>
          <InputText :placeholder="t('common.nameInQazaq')" type="text" v-model="formData.name_kz"></InputText>
          <small class="p-error" v-if="!formData.name_kz && submitted">{{
              t('common.requiredField')
            }}</small>
        </div>
        <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
          <label>{{ t('common.descriptionKz') }}</label>
          <InputText :placeholder="t('common.descriptionKz')" type="text" v-model="formData.description_kz"></InputText>
          <small class="p-error" v-if="!formData.description_kz && submitted">{{
              t('common.requiredField')
            }}</small>
        </div>
        <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
          <label>{{ t('common.nameInRussian') }}</label>
          <InputText :placeholder="t('common.nameInRussian')" type="text" v-model="formData.name_ru"></InputText>
          <small class="p-error" v-if="!formData.name_ru && submitted">{{
              t('common.requiredField')
            }}</small>
        </div>
        <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
          <label>{{ t('common.descriptionRu') }}</label>
          <InputText :placeholder="t('common.descriptionRu')" type="text" v-model="formData.description_ru"></InputText>
          <small class="p-error" v-if="!formData.description_ru && submitted">{{
              t('common.requiredField')
            }}</small>
        </div>
        <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
        <label>{{ t('common.nameInEnglish') }}</label>
        <InputText :placeholder="t('common.nameInEnglish')" type="text" v-model="formData.name_en"></InputText>
        <small class="p-error" v-if="!formData.name_en && submitted">{{
            t('common.requiredField')
          }}</small>
        </div>
        <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
          <label>{{ t('common.descriptionEn') }}</label>
          <InputText :placeholder="t('common.descriptionEn')" type="text" v-model="formData.description_en"></InputText>
          <small class="p-error" v-if="!formData.description_en && submitted">{{
              t('common.requiredField')
            }}</small>
        </div>
        <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
        <label>{{ t('course.moduleHours') }}</label>
        <Dropdown
                  v-model="formData.duration_type" :options="durationTypeOptions"
                  :placeholder="t('common.select')" class="mt-2"
                  :optionLabel="['name_'+locale]" />
        <InputNumber class="mt-2" :placeholder="formData.duration_type.name &&
        formData.duration_type.name === 'hours' ?
        t('course.moduleHours') : t('course.moduleCredits')"
                     v-model="formData.hours"></InputNumber>
        <small class="p-error" v-if="!formData.hours && submitted">{{
            t('common.requiredField')
          }}</small>
        </div>
        </div>
    </div>
  </div>


</template>

<script setup>
  import {computed, onMounted, ref, defineProps, inject, watchEffect, watch, toRefs} from "vue";
  import {useI18n} from "vue-i18n";
  import {useToast} from "primevue/usetoast";
  import {OnlineCourseService} from "@/service/onlinecourse.service";
  import {smartEnuApi} from "@/config/config";
  import {useConfirm} from "primevue/useconfirm";

  const confirm = useConfirm()
  const emitter = inject("emitter");
  const {t, locale} = useI18n()
  const toast = useToast()
  const loading = ref(false)
  const service = new OnlineCourseService();
  const menu= ref([
    {
      label: t("common.save"),
      icon: "pi pi-fw pi-save",
      command: () => {
        updateModuleOfCourse()
      },
      disabled: () => !(formData.value.name_kz) || !(formData.value.description_kz) || !(formData.value.name_ru) ||
          !(formData.value.description_ru) || !(formData.value.name_en) || !(formData.value.description_en) ||
          !(formData.value.hours) || !(formData.value.duration_type)},
  ])
  const submitted = ref(false);
  const props = defineProps ({
    courseID: {
      type: Number,
      default: null
    },
    closeModuleDialog: {
      type: Function,
      default: () => {}
    },
    module: {
      type: Object,
      default: Object
    }
  })
  const formData = ref(props.module);
  const durationTypeOptions = [
    {
      id: 1, name: "hours", name_kz: "сағат", name_ru: "часы", name_en: "hours"
    },
    {
      id:2, name:"credits", name_kz: "кредиты", name_ru:"кредиты", name_en:"credits"
    }
  ]

  const addModulesToCourse = async () => {
    formData.value.course_id = props.courseID;
    submitted.value = true;

    if (!isValid()) {
      return;
    }

    loading.value = true;

    try {
      await service.addModulesToCourse(formData.value);
      props.closeModuleDialog();
    } catch (error) {
      console.error(error);
    } finally {
      loading.value = false;
      submitted.value = false;
    }
  };


  const updateModuleOfCourse = async () => {
    if (formData.value.id === undefined || formData.value.id <= 0) {
      await addModulesToCourse()
      return
    }
    formData.value.course_id = props.courseID;
    submitted.value = true;

    if (!isValid()) {
      loading.value = false;
      return;
    }

    loading.value = true;

    try {
      await service.updateModuleOfCourse(formData.value);
      props.closeModuleDialog();
    } catch (error) {
      console.error(error);
    } finally {
      submitted.value = false;
      loading.value = false;
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


</script>

<style scoped>


</style>
