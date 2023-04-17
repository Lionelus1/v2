<template>
    <Dialog v-model:visible="showModal" :style="{ width: '1000px' }" :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
      :header="currentData ? $t('common.edit') : $t('common.add')" :modal="true" class="p-fluid" @hide="hideDialog">
      
      <div class="field">
        <label>{{ $t("web.chooseTest") }}</label>
        <Dropdown v-model="selectedExam" :options="exams" @change="selectExam" :optionLabel="'name_' + $i18n.locale"
          :placeholder="$t('common.select')" />
      </div>
     
        <div class="field">
          <label>{{ $t("web.year") }}</label>
          <Dropdown v-model="formData.year" :options="years" :placeholder="$t('common.select')" />
        </div>
        <div class="field">
          <label>{{ $t("web.passingScore") }}</label>
          <InputNumber v-model="formData.score" />
        </div>
        
  
      <template #footer>
        <Button v-if="currentData" :label="$t('common.save')" icon="pi pi-check"
          class="p-button p-component p-button-success mr-2" @click="save" />
        <Button v-if="!currentData" :label="$t('common.add')" icon="pi pi-check"
          class="p-button p-component p-button-success mr-2" @click="add" />
        <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button p-component p-button-danger"
          @click="hideDialog" />
      </template>
    </Dialog>
  </template>
  
  <script setup>
  import { inject, onUnmounted, ref, unref, defineProps } from "vue";
  import { useToast } from "primevue/usetoast";
  import { useI18n } from "vue-i18n";
  import { AdmissionInfoService } from "@/service/admission.info.service";
  import { EnuWebService } from "@/service/enu.web.service";
  import RichEditor from "@/components/documents/editor/RichEditor.vue";
  
  import { generateYears } from "@/helpers/HelperUtil";
  import { EduScoreService } from "@/service/edu.score.service";
  import { EduDoctoralScoreService } from "@/service/edu.doctoral.score.service";
  import { EduService } from "@/service/edu.service";
  import { useRoute } from "vue-router";
  
  const props = defineProps(["isShow", "selectedData"]);
  
  const emitter = inject("emitter");
  const toast = useToast();
  const i18n = useI18n();
  const formData = ref(props.selectedData ? props.selectedData : {});
  const showModal = ref(props.isShow);
  const submitted = ref(false);
  const eduScoreService = new EduScoreService();
  const eduDoctoralScoreService = new EduDoctoralScoreService()
  const eduService = new EduService();
  const currentData = ref(props.selectedData ? props.selectedData : null);
  const years = ref(generateYears());
  const eduFields = ref();
  const eduDirections = ref();
  const selectedDegree = ref();
  const exams = ref();
  const currentExam = ref(props.selectedExam ? props.selectedExam : null);
  const selectedExam = ref();
  const directions = ref();
  const fields = ref();
  const route = useRoute();
  const programs = ref();
  


  const getDoctoralExams = () => {
    eduDoctoralScoreService.getDoctoralExams().then((res) => {
      if (res.data) exams.value = res.data;
      selectedExam.value = currentExam.value
        ? filter(exams.value, currentExam.value.id)
        : null;
    })
    .catch((error) => {
        toast.add({ severity: "error", summary: error, life: 3000 });
      });
  }
  getDoctoralExams();
  console.log(selectedExam);
  const add = () => {
    submitted.value = true;
    formData.value.score_category_id = parseInt(route.params.id);
    formData.value.exam_id = selectedExam.value.id
    if (!isValid()) return;
    eduScoreService
      .addScore(formData.value)
      .then((res) => {
        if (res.data && res.data.is_success) {
          toast.add({
            severity: "success",
            summary: i18n.t("common.success"),
            life: 3000,
          });
        }
        submitted.value = false;
        hideDialog();
      })
      .catch((error) => {
        hideDialog();
        submitted.value = false;
        toast.add({ severity: "error", summary: error, life: 3000 });
      });
  };
  
  const save = () => {
    submitted.value = true;
    if (!isValid()) {
      return;
    }
  
    eduScoreService
      .editScore(unref(formData))
      .then((res) => {
        if (res.data && res.data.is_success) {
          toast.add({
            severity: "success",
            summary: i18n.t("common.success"),
            life: 3000,
          });
        }
        submitted.value = false;
        hideDialog();
      })
      .catch((error) => {
        submitted.value = false;
        toast.add({ severity: "error", summary: error, life: 3000 });
      });
  };
  
  const hideDialog = () => {
    formData.value = {};
    currentData.value = null;
    emitter.emit("showEduDoctoralScoreAddDialog", false);
  };
  
  const isValid = () => {
    let errors = [];
  
    // if (!formData.value.edu_field_id) errors.push(1);
    // if (!formData.value.edu_direction_id) errors.push(1);
    // if (!formData.value.program_id) errors.push(1);
    if (!formData.value.year) errors.push(1);
    //if (!formData.value.kz_group_score) errors.push(1);
    return errors.length === 0;
  };
  
  const selectExam = (event) => {
    let exam = event.value;
    fields.value = exam.options;
  };
  
  const filter = (array, value) => {
    let res = array.find((e) => {
      return e.options.find((x) => x.id === value);
    });
    fields.value = res.options || null;
    return res;
  };
  </script>
  
  <style scoped></style>
  