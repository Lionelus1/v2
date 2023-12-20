<template>
  <TitleBlock :title="$t('educationalPrograms.createEP')" :show-back-button="true"/>

  <div class="grid">
    <div class="col-12 lg:col-3">
      <div class="card p-6">
        <div class="steps flex" v-for="(item,index) of items" :key="item">
          <div class="step">
            <div class="circle" :class="active === index ? 'active' : ''">{{ index + 1 }}</div>
            <div class="connection"></div>
          </div>
          <div class="name font-semibold">
            {{ item.label }}
          </div>
        </div>
      </div>
    </div>
    <div class="col-12 lg:col-9">
      <div class="card">
      <h4>{{ $t('educationalPrograms.formationEP') }} {{ items[label] }}</h4>
      <div class="m-0">
        <Button class="p-button-outlined mr-2" icon="pi pi-fw pi-download" :label="$t('common.save')" @click="save()"/>
        <Button :disabled="disabledSend" class="p-button-outlined mr-2" icon="pi pi-fw pi-send" :label="$t('common.send')" @click="openDialog('sendToApprove')"/>
        <Button :disabled="disabledApproval" class="p-button-outlined" icon="pi pi-fw pi-check-circle" :label="$t('common.approvalList')"/>
      </div>
      <div class="p-fluid">
        <div class="content" v-if="active === 0">
          <div class="field mt-3">
            <label for="course-code">{{ $t("educationalPrograms.codeAndNameGroupEP") }}</label>
            <Dropdown :placeholder="$t('common.select')"/>
            <small class="p-error" v-if="!formData.eduProgGroupId && submitted">{{ $t("common.requiredField") }}</small>
          </div>
          <div class="field mt-3">
            <label for="course-code">{{ $t("educationalPrograms.codeGroupAndEP") }}</label>
            <Dropdown :placeholder="$t('common.select')"/>
            <small class="p-error" v-if="!formData.eduProgId && submitted">{{ $t("common.requiredField") }}</small>
          </div>
<!--          <div class="field mt-3">
            <label for="course-code">{{ $t("educationalPrograms.directionTraining") }}</label>
            <Dropdown :placeholder="$t('common.select')"/>
          </div>-->
          <div class="field mt-3">
            <label for="course-code">{{ $t("educationalPrograms.fieldEducation") }}</label>
            <Dropdown optionValue="id" :placeholder="$t('common.select')" :options="dataFieldEducation" :optionLabel='"codeAndName_" + $i18n.locale'
                      v-model="formData.eduFieldsId"/>
            <small class="p-error" v-if="!formData.eduFieldsId && submitted">{{ $t("common.requiredField") }}</small>
          </div>
          <div class="field mt-3">
            <label for="course-code">{{ $t("educationalPrograms.nameGroupEPKZ") }}</label>
            <InputText v-model="formData.nameKz"/>
            <small class="p-error" v-if="!formData.nameKz && submitted">{{ $t("common.requiredField") }}</small>
          </div>
          <div class="field mt-3">
            <label for="course-code">{{ $t("educationalPrograms.nameGroupEPRU") }}</label>
            <InputText v-model="formData.nameRu"/>
            <small class="p-error" v-if="!formData.nameRu && submitted">{{ $t("common.requiredField") }}</small>
          </div>
          <div class="field mt-3">
            <label for="course-code">{{ $t("educationalPrograms.nameGroupEPEN") }}</label>
            <InputText v-model="formData.nameEn"/>
            <small class="p-error" v-if="!formData.nameEn && submitted">{{ $t("common.requiredField") }}</small>
          </div>
          <div class="field mt-3">
            <label for="course-code">{{ $t("educationalPrograms.descriptionGroupEPKZ") }}</label>
            <InputText v-model="formData.descriptionKz"/>
            <small class="p-error" v-if="!formData.descriptionKz && submitted">{{ $t("common.requiredField") }}</small>
          </div>
          <div class="field mt-3">
            <label for="course-code">{{ $t("educationalPrograms.descriptionGroupEPRU") }}</label>
            <InputText v-model="formData.descriptionRu"/>
            <small class="p-error" v-if="!formData.descriptionRu && submitted">{{ $t("common.requiredField") }}</small>
          </div>
          <div class="field mt-3">
            <label>{{ $t("educationalPrograms.descriptionGroupEPEN") }}</label>
            <InputText v-model="formData.descriptionEn"/>
            <small class="p-error" v-if="!formData.descriptionEn && submitted">{{ $t("common.requiredField") }}</small>
          </div>
        </div>
        <div class="content" v-if="active === 1">
          <div class="field mt-3">

            <TabView>
              <TabPanel header="Қазақша">
                <div class="field mt-3">
                  <label for="course-code">{{ $t("educationalPrograms.purposeEPkz") }}</label>
                  <InputText v-model="formStep2.targetKz"/>
                  <small class="p-error" v-if="!formStep2.targetKz && submitted">{{ $t("common.requiredField") }}</small>
                </div>
                <div class="field mt-3">
                  <label for="course-code">{{ $t("educationalPrograms.assignmentQualificationskz") }}</label>
                  <InputText v-model="formStep2.qualificationKz"/>
                  <small class="p-error" v-if="!formStep2.qualificationKz && submitted">{{ $t("common.requiredField") }}</small>
                </div>
                <div class="field mt-3">
                  <label for="course-code">{{ $t("educationalPrograms.trainingPeriodkz") }}</label>
                  <InputText v-model="formStep2.trainingPeriodKz"/>
                  <small class="p-error" v-if="!formStep2.trainingPeriodKz && submitted">{{ $t("common.requiredField") }}</small>
                </div>
                <div class="field mt-3">
                  <label for="course-code">{{ $t("educationalPrograms.degreeAwardedkz") }}</label>
                  <InputText v-model="formStep2.degreeAwardedKz"/>
                  <small class="p-error" v-if="!formStep2.degreeAwardedKz && submitted">{{ $t("common.requiredField") }}</small>
                </div>
              </TabPanel>
              <TabPanel header="Русский">
                <div class="field mt-3">
                  <label for="course-code">{{ $t("educationalPrograms.purposeEPru") }}</label>
                  <InputText v-model="formStep2.targetRu"/>
                  <small class="p-error" v-if="!formStep2.targetRu && submitted">{{ $t("common.requiredField") }}</small>
                </div>
                <div class="field mt-3">
                  <label for="course-code">{{ $t("educationalPrograms.assignmentQualificationsru") }}</label>
                  <InputText v-model="formStep2.qualificationRu"/>
                  <small class="p-error" v-if="!formStep2.qualificationRu && submitted">{{ $t("common.requiredField") }}</small>
                </div>
                <div class="field mt-3">
                  <label for="course-code">{{ $t("educationalPrograms.trainingPeriodru") }}</label>
                  <InputText v-model="formStep2.trainingPeriodRu"/>
                  <small class="p-error" v-if="!formStep2.trainingPeriodRu && submitted">{{ $t("common.requiredField") }}</small>
                </div>
                <div class="field mt-3">
                  <label for="course-code">{{ $t("educationalPrograms.degreeAwardedru") }}</label>
                  <InputText v-model="formStep2.degreeAwardedRu"/>
                  <small class="p-error" v-if="!formStep2.degreeAwardedRu && submitted">{{ $t("common.requiredField") }}</small>
                </div>
              </TabPanel>
              <TabPanel header="English">
                <div class="field mt-3">
                  <label for="course-code">{{ $t("educationalPrograms.purposeEPen") }}</label>
                  <InputText v-model="formStep2.targetEn"/>
                  <small class="p-error" v-if="!formStep2.targetEn && submitted">{{ $t("common.requiredField") }}</small>
                </div>
                <div class="field mt-3">
                  <label for="course-code">{{ $t("educationalPrograms.assignmentQualificationsen") }}</label>
                  <InputText v-model="formStep2.qualificationEn"/>
                  <small class="p-error" v-if="!formStep2.qualificationEn && submitted">{{ $t("common.requiredField") }}</small>
                </div>
                <div class="field mt-3">
                  <label for="course-code">{{ $t("educationalPrograms.trainingPerioden") }}</label>
                  <InputText v-model="formStep2.trainingPeriodEn"/>
                  <small class="p-error" v-if="!formStep2.trainingPeriodEn && submitted">{{ $t("common.requiredField") }}</small>
                </div>
                <div class="field mt-3">
                  <label for="course-code">{{ $t("educationalPrograms.degreeAwardeden") }}</label>
                  <InputText v-model="formStep2.degreeAwardedEn"/>
                  <small class="p-error" v-if="!formStep2.degreeAwardedEn && submitted">{{ $t("common.requiredField") }}</small>
                </div>
              </TabPanel>
            </TabView>
            <div class="field mt-3">
              <label for="course-code">{{ $t("educationalPrograms.directionTraining") }}</label>
              <Dropdown :placeholder="$t('common.select')"/>
            </div>
            <div class="field mt-3">
              <label for="course-code">{{ $t("educationalPrograms.typeEducationalProgram") }}</label>
              <InputText/>
            </div>
            <div class="field-checkbox mt-3">
                <Checkbox id="landing" name="landing"/>
                <label for="landing">{{ $t("educationalPrograms.doubleDegreeProgram") }}</label>
            </div>
            <div class="field-checkbox mt-3">
              <Checkbox name="landing" :binary="true"/>
              <label>{{ $t("educationalPrograms.jointEducationalProgram") }}</label>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup>
import {ref} from "vue";
import {useI18n} from "vue-i18n";
import {useRoute, useRouter} from "vue-router";
import {useStore} from "vuex";
import {useToast} from "primevue/usetoast";
import {OnlineCourseService} from "@/service/onlinecourse.service";

const disabledSend = ref(true)
const disabledApproval = ref(true)
const {t, locale} = useI18n()
const route = useRoute()
const router = useRouter()
const store = useStore()
const toast = useToast();
const i18n = useI18n();
const active = ref(0);
const items = ref([
  {
    label: 'Формирование ОП'
  },
  {
    label: 'Цели ОП'
  },
  {
    label: 'Справочник карта компетенции'
  },
  {
    label: 'Добавление курса'
  }
]);
const formData = ref(
    {
      nameKz: 'test',
      nameRu: 'test ru',
      nameEn: 'test en',
      descriptionKz: 'description Kz',
      descriptionRu: 'description Ru',
      descriptionEn: 'description en',
      code: 'test',
      eduProgGroupId: 5,
      eduProgId: 1,
      eduFieldsId: 1,
    })
const formStep2 = ref(
    {
    }
)
const submitted = ref(false)
const submittedStep2 = ref(false)
const service = new OnlineCourseService()
const dataFieldEducation = ref([])

const getFieldEducation = () => {
  service.getFieldEducation().then(response => {
    if(response.data){
      dataFieldEducation.value = response.data
      dataFieldEducation.value.map(e=>{
        e.codeAndName_kz = e.code + ' ' + e.name_kz
        e.codeAndName_ru = e.code + ' ' + e.name_ru
        e.codeAndName_en = e.code + ' ' + e.name_en
      })
    }
  }).catch(_ => {
  });
}
getFieldEducation()
const save = () => {
  if(active.value === 0){
    submitted.value = true
    if (!isValid()) return;
    toast.add({
      severity: "success",
      summary: i18n.t("common.success"),
      life: 3000,
    });
    active.value = 1
    /*  service.addEducationalProgram(formData.value).then(res => {
        //router.back()
        toast.add({
          severity: "success",
          summary: i18n.t("common.success"),
          life: 3000,
        });
        formData.value = null
      }).catch(error => {
        toast.add({severity: "error", summary: error, life: 3000});
      });*/
  }
  if(active.value === 1){
    submitted.value = true
    if (!isValidStep2()) return;
    toast.add({
      severity: "success",
      summary: i18n.t("common.success"),
      life: 3000,
    });
    active.value = 2
  }
}

const isValid = () => {
  let errors = [];
  if (!formData.value.nameKz) {
    errors.push(1);
  }
  if (!formData.value.nameRu) {
    errors.push(1);
  }
  if (!formData.value.nameEn) {
    errors.push(1);
  }
  if (!formData.value.descriptionKz) {
    errors.push(1);
  }
  if (!formData.value.descriptionRu) {
    errors.push(1);
  }
  if (!formData.value.descriptionEn) {
    errors.push(1);
  }
  if (!formData.value.eduProgGroupId) {
    errors.push(1);
  }
  if (!formData.value.eduProgId) {
    errors.push(1);
  }
  if (!formData.value.code) {
    errors.push(1);
  }
  if (!formData.value.eduFieldsId) {
    errors.push(1);
  }
  return errors.length === 0;
}
const isValidStep2 =() => {
  let errors = [];
/*  if (!formStep2.value.directionOfTrainingId) {
    errors.push(1);
  }*/
  if (!formStep2.value.targetKz) {
    errors.push(1);
  }
  if (!formStep2.value.targetRu) {
    errors.push(1);
  }
  if (!formStep2.value.targetEn) {
    errors.push(1);
  }
/*  if (!formData.value.qualificationKz) {
    errors.push(1);
  }
  if (!formData.value.qualificationRu) {
    errors.push(1);
  }
  if (!formData.value.qualificationEn) {
    errors.push(1);
  }
  if (!formData.value.trainingPeriodKz) {
    errors.push(1);
  }
  if (!formData.value.trainingPeriodRu) {
    errors.push(1);
  }
  if (!formData.value.trainingPeriodEn) {
    errors.push(1);
  }
  if (!formData.value.degreeAwardedKz) {
    errors.push(1);
  }
  if (!formData.value.degreeAwardedRu) {
    errors.push(1);
  }
  if (!formData.value.degreeAwardedEn) {
    errors.push(1);
  }
  if (!formData.value.typeEducationalProgram) {
    errors.push(1);
  }
  if (!formData.value.doubleDegree) {
    errors.push(1);
  }
  if (!formData.value.jointEducational) {
    errors.push(1);
  }*/
  return errors.length === 0;
}
</script>

<style lang="scss" scoped>
.steps {
  min-height: 80px;

  .step {
    display: flex;
    align-items: center;
    flex: 0;
    flex-direction: column;

    .circle {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 40px;
      height: 40px;
      border: 1px solid #ccc;
      padding: 5px;
      border-radius: 50%;
    }

    .circle.active {
      background: #2196f3;
      color: #fff;
    }

    .connection {
      width: 1px;
      background-color: #ccc;
      flex-grow: 1;
    }
  }

  .name {
    margin-left: 20px;
    margin-top: 10px;
  }
}

.steps:last-child {
  min-height: 0;
}
</style>