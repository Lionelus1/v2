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
        <h4>{{ items[active].label }}</h4>
        <div class="m-0">
          <Button class="p-button-outlined mr-2" icon="pi pi-fw pi-download" :label="$t('common.save')" @click="save()"/>
          <Button :disabled="disabledSend" class="p-button-outlined mr-2" icon="pi pi-fw pi-send" :label="$t('common.send')"
                  @click="openDialog('sendToApprove')"/>
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
                <Dropdown :placeholder="$t('common.select')" v-model="formStep2.directionOfTrainingId"/>
                <small class="p-error" v-if="!formStep2.directionOfTrainingId && submitted">{{ $t("common.requiredField") }}</small>
              </div>
              <div class="field mt-3">
                <label for="course-code">{{ $t("educationalPrograms.typeEducationalProgram") }}</label>
                <Dropdown :placeholder="$t('common.select')" v-model="formStep2.typeEducationalProgram"/>
              </div>
              <div class="field-checkbox mt-3">
                <Checkbox v-model="formStep2.doubleDegree" inputId="doubleDegree" :binary="true"/>
                <label for="doubleDegree">{{ $t("educationalPrograms.doubleDegreeProgram") }}</label>
              </div>
              <div class="field-checkbox mt-3">
                <Checkbox v-model="formStep2.jointEducational" inputId="jointEducational" :binary="true"/>
                <label for="jointEducational">{{ $t("educationalPrograms.jointEducationalProgram") }}</label>
              </div>
            </div>
          </div>
          <div class="content" v-if="active === 2">
            <div class="field mt-3">
              <label for="course-code">{{ $t("educationalPrograms.generalProfessionalCompetencieskz") }}</label>
              <InputText v-model="formStep3.genProfCompetenciesKz"/>
              <small class="p-error" v-if="!formStep3.genProfCompetenciesKz && submitted">{{ $t("common.requiredField") }}</small>
            </div>
            <div class="field mt-3">
              <label for="course-code">{{ $t("educationalPrograms.generalProfessionalCompetenciesru") }}</label>
              <InputText v-model="formStep3.genProfCompetenciesRu"/>
              <small class="p-error" v-if="!formStep3.genProfCompetenciesRu && submitted">{{ $t("common.requiredField") }}</small>
            </div>
            <div class="field mt-3">
              <label for="course-code">{{ $t("educationalPrograms.generalProfessionalCompetenciesen") }}</label>
              <InputText v-model="formStep3.genProfCompetenciesEn"/>
              <small class="p-error" v-if="!formStep3.genProfCompetenciesEn && submitted">{{ $t("common.requiredField") }}</small>
            </div>
            <div class="field mt-3">
              <label for="course-code">{{ $t("educationalPrograms.professionalPompetencieskz") }}</label>
              <InputText v-model="formStep3.profCompetenciesKz"/>
              <small class="p-error" v-if="!formStep3.profCompetenciesKz && submitted">{{ $t("common.requiredField") }}</small>
            </div>
            <div class="field mt-3">
              <label for="course-code">{{ $t("educationalPrograms.professionalPompetenciesru") }}</label>
              <InputText v-model="formStep3.profCompetenciesRu"/>
              <small class="p-error" v-if="!formStep3.profCompetenciesRu && submitted">{{ $t("common.requiredField") }}</small>
            </div>
            <div class="field mt-3">
              <label>{{ $t("educationalPrograms.professionalPompetenciesen") }}</label>
              <InputText v-model="formStep3.profCompetenciesEn"/>
              <small class="p-error" v-if="!formStep3.profCompetenciesEn && submitted">{{ $t("common.requiredField") }}</small>
            </div>
          </div>
          <div class="content" v-if="active === 3">
            <div class="mt-4 mb-4">
              <table>
                <thead>
                <tr>
                  <td>#</td>
                  <td>Наименование модуля</td>
                  <td>Шифр модуля</td>
                  <td>Наименование курса</td>
                  <td>Код курса</td>
                  <td>Количество академических кредитов</td>
                  <td>Цикл</td>
                  <td>Компоненты курса</td>
                  <td>Язык обучения</td>
                  <td>Курс</td>
                  <td>Семестр</td>
                  <td>Лек/Прак/Лаб</td>
                  <td>ПРП/СРО</td>
                  <td>Форма контроля</td>
                </tr>
                </thead>
                <tbody>
                <tr>
                  <template v-for="(i, index) of modules" :key="i">
                    <td rowspan="3">{{index+1}}</td>
                    <td rowspan="3">{{ i['name' + locale]}}</td>
                    <td rowspan="3">{{ i.code}}</td>
                  </template>
                </tr>
                <template v-for="(i) of modules" :key="i">
                <tr v-for="course of i.moduleCourses" :key="course">
                    <td>
                      {{course['name' + locale]}}
                    </td>
                    <td>{{course.codeCourse}}</td>
                    <td>{{course.creditCount}}</td>
                    <td>{{course.creditCount}}</td>
                    <td>{{course.creditCount}}</td>
                    <td>{{course.language}}</td>
                    <td>{{course.courseId}}</td>
                    <td>{{course.semester}}</td>
                    <td>{{course.Lecture}}/{{course.practice}}/{{course.laboratory}}</td>
                    <td>{{course.prp}}/{{course.IndependentWork}}</td>
                    <td>{{course.formControl}}</td>
                </tr>
                </template>
                </tbody>
              </table>
            </div>

            <br>
            <Button class="p-button-outlined mr-2 w-fit p-button-sm"
                    icon="pi pi-plus-circle" :label="$t('educationalPrograms.addModule')" @click="dialogModule = true"/>
          </div>
        </div>
      </div>
    </div>
  </div>
  <Dialog v-model:visible="dialogModule" :style="{ width: '70%' }" :header="$t('educationalPrograms.addingModule')">
    <div class="grid module_dialog">
      <div class="col-12 lg:col-3">
        <span>{{ $t("Наименование модуля") }}</span>
      </div>
      <div class="col-12 lg:col-9">
        <InputText v-model="formModule.namekz"/>
            <small class="p-error" v-if="!formModule.namekz && submitted">{{ $t("common.requiredField") }}</small>
      </div>
      <div class="col-12 lg:col-3">
        <span>{{ $t("Шифр модуля") }}</span>
      </div>
      <div class="col-12 lg:col-9">
        <InputText class="" v-model="formModule.code"/>
            <small class="p-error" v-if="!formModule.code && submitted">{{ $t("common.requiredField") }}</small>
      </div>
      <div class="col-12 lg:col-3">
        <span>{{ $t("Количество академических кредитов") }}</span>
      </div>
      <div class="col-12 lg:col-9">
        <InputText type="number" v-model="formModule.creditCount"/>
      </div>
      <div class="col-12 lg:col-3">
        <span>{{ $t("Цикл") }}</span>
      </div>
      <div class="col-12 lg:col-9 flex gap-4">
      <div class="w-fit">
        <Checkbox v-model="courseType" :value="1" inputId="courseType1"/>
        <label class="ml-2" for="courseType1">{{ $t("ОКК") }}</label>
      </div>
      <div class="w-fit">
        <Checkbox v-model="courseType" :value="2" inputId="courseType2"/>
        <label class="ml-2" for="courseType2">{{ $t("БК") }}</label>
      </div>
        <div class="w-fit">
          <Checkbox v-model="courseType" :value="3" inputId="courseType3"/>
          <label class="ml-2" for="courseType3">{{ $t("ПК") }}</label>
        </div>
        <small class="p-error" v-if="!formModule.courseType && submitted">{{ $t("common.requiredField") }}</small>
      </div>
      <div class="col-12 lg:col-3">
        <span>{{ $t("Компоненты курса") }}</span>
      </div>
      <div class="col-12 lg:col-9 flex gap-4">
        <div class="w-fit">
          <Checkbox v-model="courseComponentType" :value="1" inputId="courseComponentType1"/>
          <label class="ml-2" for="courseComponentType1">{{ $t("ОК") }}</label>
        </div>
        <div class="w-fit">
          <Checkbox v-model="courseComponentType" :value="2" inputId="courseComponentType2"/>
          <label class="ml-2" for="courseComponentType2">{{ $t("ВК") }}</label>
        </div>
        <div class="w-fit">
          <Checkbox v-model="courseComponentType" :value="3" inputId="courseComponentType3"/>
          <label class="ml-2" for="courseComponentType3">{{ $t("КВ") }}</label>
        </div>
        <small class="p-error" v-if="!formModule.courseComponentType && submitted">{{ $t("common.requiredField") }}</small>
      </div>
      <div class="col-12">
      <h4>{{ $t("Курсы") }}</h4>
      </div>
      <div class="col-12 lg:col-3">
        <span>{{ $t("Наименование курса") }}</span>
      </div>
      <div class="col-12 lg:col-9">
        <Dropdown v-model="formModule.moduleCourseRel[0].id" :options="courses" class="mt-2" :optionLabel="['name' + locale]" optionValue="id" :placeholder="$t('common.select')"
                  @filter="handleFilter" :filter="true" :showClear="true" dataKey="id" :emptyFilterMessage="$t('roleControl.noResult')"  />
        <!--    <small class="p-error">{{ $t("common.requiredField") }}</small>-->
      </div>
      <div class="col-12 lg:col-3">
        <span>{{ $t("fieldEducation.courseCode") }}</span>
      </div>
      <div class="col-12 lg:col-9">
        <InputText v-model="formModule.nameEn"/>
        <!--    <small class="p-error">{{ $t("common.requiredField") }}</small>-->
      </div>
      <div class="col-12 lg:col-3">
        <span>{{ $t("common.learnlang") }}</span>
      </div>
      <div class="col-12 lg:col-9">
        <InputText v-model="formModule.nameEn"/>
        <!--    <small class="p-error">{{ $t("common.requiredField") }}</small>-->
      </div>
      <div class="col-12 lg:col-3">
        <span>{{ $t("Курс") }}</span>
      </div>
      <div class="col-12 lg:col-9 flex gap-4">
        <div class="w-fit">
          <Checkbox v-model="whatCourse" inputId="kurs1" :value="1"/>
          <label class="ml-2" for="kurs1">1</label>
        </div>
        <div class="w-fit">
          <Checkbox v-model="whatCourse" inputId="kurs2" :value="2"/>
          <label class="ml-2" for="kurs2">2</label>
        </div>
        <div class="w-fit">
          <Checkbox v-model="whatCourse" inputId="kurs3" :value="3"/>
          <label class="ml-2" for="kurs3">3</label>
        </div>
        <div class="w-fit">
          <Checkbox v-model="whatCourse" inputId="kurs4" :value="4"/>
          <label class="ml-2" for="kurs4">4</label>
        </div>
        <div class="w-fit">
          <Checkbox v-model="whatCourse" inputId="kurs5" :value="5"/>
          <label class="ml-2" for="kurs5">5</label>
        </div>
      </div>
      <div class="col-12 lg:col-3">
        <span>{{ $t("Семестр") }}</span>
      </div>
      <div class="col-12 lg:col-9">
        <InputText v-model="formModule.moduleCourseRel[0].semester"/>
        <small class="p-error" v-if="!formModule.moduleCourseRel[0].semester && submitted">{{ $t("common.requiredField") }}</small>
      </div>
      <div class="col-3">
        <span>{{ $t("Лекция") }}</span>
      </div>
        <div class="col-3">
        <InputText type="number" v-model="formModule.moduleCourseRel[0].Lecture"/>
        <!--    <small class="p-error">{{ $t("common.requiredField") }}</small>-->
      </div>
      <div class="col-6 flex">
        <span class="mr-4">{{ $t("Практика") }}</span>
        <InputText type="number" v-model="formModule.moduleCourseRel[0].practice"/>
        <!--    <small class="p-error">{{ $t("common.requiredField") }}</small>-->
      </div>
      <div class="col-3">
        <span>{{ $t("Лабораторные работы") }}</span>
      </div>
      <div class="col-3">
        <InputText type="number" v-model="formModule.moduleCourseRel[0].laboratory"/>
        <!--    <small class="p-error">{{ $t("common.requiredField") }}</small>-->
      </div>
      <div class="col-3 flex">
        <span class="mr-4">{{ $t("ПРП") }}</span>
        <InputText type="number" v-model="formModule.moduleCourseRel[0].prp"/>
        <!--    <small class="p-error">{{ $t("common.requiredField") }}</small>-->
      </div>
      <div class="col-3 flex">
        <span class="mr-4">{{ $t("СРО") }}</span>
        <InputText type="number" v-model="formModule.moduleCourseRel[0].IndependentWork"/>
        <!--    <small class="p-error">{{ $t("common.requiredField") }}</small>-->
      </div>
      <div class="col-12 lg:col-3">
        <span>{{ $t("Форма контроля") }}</span>
      </div>
      <div class="col-12 lg:col-9">
        <InputText v-model="formModule.moduleCourseRel[0].formControl"/>
        <!--    <small class="p-error">{{ $t("common.requiredField") }}</small>-->
      </div>
    </div>
    <div class="flex justify-content-between">
      <Button class="p-button-outlined mr-2 w-fit"
              icon="pi pi-plus-circle" :label="$t('Добавить курс')"/>
      <Button class="w-fit"
              icon="pi pi-download" :label="$t('common.add')" @click="addModuleAndCourses()"/>
    </div>
  </Dialog>
</template>

<script setup>
import {computed, ref} from "vue";
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
const items = computed(() => {
  return [
    {
      label: t('educationalPrograms.formationEP'),
    },
    {
      label: t('educationalPrograms.goalsEP'),
    },
    {
      label: t('educationalPrograms.competencyMapReference'),
    },
    {
      label: t('educationalPrograms.creationCurriculum'),
    }
  ];
})

const formData = ref(
    {
      nameKz: 'test kz',
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
      //targetKz: 'test',
      targetRu: 'test ru',
      targetEn: 'test en',
      qualificationKz: 'test Kz',
      qualificationRu: 'test Ru',
      qualificationEn: 'test en',
      trainingPeriodKz: 'test kz',
      trainingPeriodRu: 'test ru',
      trainingPeriodEn: 'test en',
      degreeAwardedKz: 'test Kz',
      degreeAwardedRu: 'test Ru',
      degreeAwardedEn: 'test en',
      directionOfTrainingId: 2,
      typeEducationalProgram: 3,
      doubleDegree: 4,
      jointEducational: 5,
    }
)
const formStep3 = ref(
    {
      //genProfCompetenciesKz: 'test kz',
      genProfCompetenciesRu: 'test ru',
      genProfCompetenciesEn: 'test en',
      profCompetenciesKz: 'test kz',
      profCompetenciesRu: 'test ru',
      profCompetenciesEn: 'test en',
    }
)
const courseType = ref([3])
const courseComponentType = ref([1])
const whatCourse = ref([4])
const formModule = ref(
    {
      //namekz: 'test kz',
      nameru: 'test ru',
      nameen: 'test en',
      code: 'test kz',
      creditCount: 2,
      courseType: courseType.value[0],
      courseComponentType: courseComponentType.value[0],
      syllabusId: 3,
      moduleCourseRel: [
        {
          whatCourse: whatCourse.value[0],
          semester: 2,
          Lecture: 70,
          practice: 75,
          laboratory: 80,
          prp: 50,
          IndependentWork: 72,
          formControl: "test",
        }
      ]
    }
)
const submitted = ref(false)
const service = new OnlineCourseService()
const dataFieldEducation = ref([])
const modules = ref([])
const courses = ref([])
const dialogModule = ref(true)
const lazyParams = {
  page: 0,
  rows: 561,
  searchText: null,
}
const getCourses = () => {
  service.getCourses(lazyParams).then(response => {
    courses.value = response.data.courses
  }).catch(_ => {
  });
}
getCourses()
const handleFilter = (event) => {
  if (event.value && event.value.length > 3) {
    lazyParams.searchText = event.value
    getCourses()
  } else if (lazyParams.searchText.length > 3) {
    lazyParams.searchText = null
    getCourses()
  }
}
const getFieldEducation = () => {
  service.getFieldEducation().then(response => {
    if (response.data) {
      dataFieldEducation.value = response.data
      dataFieldEducation.value.map(e => {
        e.codeAndName_kz = e.code + ' ' + e.name_kz
        e.codeAndName_ru = e.code + ' ' + e.name_ru
        e.codeAndName_en = e.code + ' ' + e.name_en
      })
    }
  }).catch(_ => {
  });
}
getFieldEducation()
const getModuleBySyllasbusId= () => {
  service.getModuleBySyllasbusId(2).then(response => {
    if (response.data) {
      modules.value = response.data
    }
  }).catch(_ => {
  });
}
getModuleBySyllasbusId()
const save = () => {
  if (active.value === 0) {
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
  if (active.value === 1) {
    submitted.value = true
    if (!isValidStep2()) return;
    toast.add({
      severity: "success",
      summary: i18n.t("common.success"),
      life: 3000,
    });
    active.value = 2
  }
  if (active.value === 2) {
    submitted.value = true
    if (!isValidStep3()) return;
    toast.add({
      severity: "success",
      summary: i18n.t("common.success"),
      life: 3000,
    });
    active.value = 3
  }
}
const addModuleAndCourses = () => {
  submitted.value = true
  if (!isValidModule()) return;
  console.log(formModule.value)
  toast.add({
    severity: "success",
    summary: i18n.t("common.success"),
    life: 3000,
  });
 /* service.addModuleAndCourses().then(response => {
  }).catch(_ => {
  });*/
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
const isValidStep2 = () => {
  let errors = [];
  if (!formStep2.value.targetKz) {
    errors.push(1);
  }
  if (!formStep2.value.targetRu) {
    errors.push(1);
  }
  if (!formStep2.value.targetEn) {
    errors.push(1);
  }
  if (!formStep2.value.qualificationKz) {
    errors.push(1);
  }
  if (!formStep2.value.qualificationRu) {
    errors.push(1);
  }
  if (!formStep2.value.qualificationEn) {
    errors.push(1);
  }
  if (!formStep2.value.trainingPeriodKz) {
    errors.push(1);
  }
  if (!formStep2.value.trainingPeriodRu) {
    errors.push(1);
  }
  if (!formStep2.value.trainingPeriodEn) {
    errors.push(1);
  }
  if (!formStep2.value.degreeAwardedKz) {
    errors.push(1);
  }
  if (!formStep2.value.degreeAwardedRu) {
    errors.push(1);
  }
  if (!formStep2.value.degreeAwardedEn) {
    errors.push(1);
  }
  if (!formStep2.value.directionOfTrainingId) {
    errors.push(1);
  }
  if (!formStep2.value.typeEducationalProgram) {
    errors.push(1);
  }
  if (!formStep2.value.doubleDegree) {
    errors.push(1);
  }
  if (!formStep2.value.jointEducational) {
    errors.push(1);
  }
  return errors.length === 0;
}
const isValidStep3 = () => {
  let errors = [];
  if (!formStep3.value.genProfCompetenciesKz) {
    errors.push(1);
  }
  if (!formStep3.value.genProfCompetenciesRu) {
    errors.push(1);
  }
  if (!formStep3.value.genProfCompetenciesEn) {
    errors.push(1);
  }
  if (!formStep3.value.profCompetenciesKz) {
    errors.push(1);
  }
  if (!formStep3.value.profCompetenciesRu) {
    errors.push(1);
  }
  if (!formStep3.value.profCompetenciesEn) {
    errors.push(1);
  }
  return errors.length === 0;
}
const isValidModule = () => {
  let errors = [];
  if (!formModule.value.namekz) {
    errors.push(1);
  }
  if (!formModule.value.nameru) {
    errors.push(1);
  }
  if (!formModule.value.nameen) {
    errors.push(1);
  }
  if (!formModule.value.code) {
    errors.push(1);
  }
  if (!formModule.value.creditCount) {
    errors.push(1);
  }
  if (!formModule.value.courseType) {
    errors.push(1);
  }
  if (!formModule.value.courseComponentType) {
    errors.push(1);
  }
  if (!formModule.value.moduleCourseRel[0].semester) {
    errors.push(1);
  }
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

:deep(.p-tabview .p-tabview-panels) {
  padding: 0;
}
.module_dialog{
  width: 80%;
  .p-inputtext, .p-dropdown{
    width: 100%;
  }
}
table {
  border-collapse: collapse;
  td{
    text-align: center;
    padding: 5px;
  }
}
table, th, td {
  border: 1px solid #BDBBBB;
}
</style>