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
              <Dropdown v-model="formData.eduProgId" optionValue="id" :placeholder="$t('common.select')" :options="codeAndNameGroup"
                        :optionLabel='"codeAndName_" + $i18n.locale'
                        @filter="filterCodeAndNameGroup" :filter="true" :showClear="true" dataKey="id"
                        :emptyFilterMessage="$t('roleControl.noResult')"/>
              <small class="p-error" v-if="!formData.eduProgId && submitted">{{ $t("common.requiredField") }}</small>
            </div>
            <div class="field mt-3">
              <label for="course-code">{{ $t("educationalPrograms.codeGroupAndEP") }}</label>
              <Dropdown v-model="formData.eduProgGroupId" optionValue="id" :placeholder="$t('common.select')" :options="codeGroup"
                        :optionLabel='"codeAndName_" + $i18n.locale'
                        @filter="filterCodeGroup" :filter="true" :showClear="true" dataKey="id" :emptyFilterMessage="$t('roleControl.noResult')"/>
              <small class="p-error" v-if="!formData.eduProgGroupId && submitted">{{ $t("common.requiredField") }}</small>
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
                <Dropdown v-model="formStep2.directionOfTrainingId" optionValue="id" :placeholder="$t('common.select')" :options="trainingDirections"
                          :optionLabel='"codeAndName_" + $i18n.locale'
                          @filter="filterTrainingDirections" :filter="true" :showClear="true" dataKey="id"
                          :emptyFilterMessage="$t('roleControl.noResult')"/>
                <small class="p-error" v-if="!formStep2.directionOfTrainingId && submitted">{{ $t("common.requiredField") }}</small>
              </div>
              <div class="field mt-3">
                <label for="course-code">{{ $t("educationalPrograms.typeEducationalProgram") }}</label>
                <Dropdown :placeholder="$t('common.select')" v-model="formStep2.typeEducationalProgram"/>
              </div>
              <div class="field-checkbox mt-3">
                <Checkbox v-model="checkedDouble" @change="onDoubleChange(1)" inputId="doubleDegree" :binary="true"/>
                <label for="doubleDegree">{{ $t("educationalPrograms.doubleDegreeProgram") }}</label>
              </div>
              <div class="field-checkbox mt-3">
                <Checkbox v-model="checkedJointEducational" @change="onDoubleChange(2)" inputId="jointEducational" :binary="true"/>
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
                  <td>№</td>
                  <td>{{ $t("educationalPrograms.moduleName") }}</td>
                  <td>{{ $t("educationalPrograms.moduleCode") }}</td>
                  <td>{{ $t("educationalPrograms.academicCredits") }}</td>
                  <td>{{ $t("educationalPrograms.cycle") }}</td>
                  <td>{{ $t("educationalPrograms.courseComponents") }}</td>
                  <td>{{ $t("educationalPrograms.courseName") }}</td>
                  <td>{{ $t("fieldEducation.courseCode") }}</td>
                  <td>{{ $t("common.learnlang") }}</td>
                  <td>{{ $t("course.course") }}</td>
                  <td>{{ $t("educationalPrograms.semester") }}</td>
                  <td>{{ $t("educationalPrograms.lecture") }}/{{ $t("educationalPrograms.practice") }}/{{
                      $t("educationalPrograms.laboratoryWork")
                    }}
                  </td>
                  <td><span :title="$t('educationalPrograms.preGraduatePractice')">{{ $t("educationalPrograms.prp") }}</span>/
                    <span :title="$t('educationalPrograms.independentWorkStudent')">{{ $t("educationalPrograms.sro") }}</span></td>
                  <td>{{ $t("educationalPrograms.formControl") }}</td>
                </tr>
                </thead>
                <tbody>
                <template v-for="(i, index) in modules" :key="i">
                  <tr v-if="!i.moduleCourseRel || i.moduleCourseRel.length === 0">
                    <td>{{ index + 1 }}</td>
                    <td>{{ i['name' + locale] }}</td>
                    <td>{{ i.code }}</td>
                  </tr>
                  <template v-else>
                    <tr>
                      <td :rowspan="i.moduleCourseRel.length + 1">{{ index + 1 }}</td>
                      <td :rowspan="i.moduleCourseRel.length + 1">{{ i['name' + locale] }}</td>
                      <td :rowspan="i.moduleCourseRel.length + 1">{{ i.code }}</td>
                      <td :rowspan="i.moduleCourseRel.length + 1">{{ i.creditCount }}</td>
                      <td :rowspan="i.moduleCourseRel.length + 1">
                        <template v-if="i.courseType === 1">
                          <span :title="$t('educationalPrograms.generalEducationCourses')">{{ $t("educationalPrograms.ook") }}</span>
                        </template>
                        <template v-if="i.courseType === 2">
                          <span :title="$t('educationalPrograms.basicCourses')">{{ $t("educationalPrograms.bc") }}</span>
                        </template>
                        <template v-if="i.courseType === 3">
                          <span :title="$t('educationalPrograms.profileCourses')">{{ $t("educationalPrograms.pc") }}</span>
                        </template>
                      </td>
                      <td :rowspan="i.moduleCourseRel.length + 1">
                        <template v-if="i.courseComponentType === 1">
                          <span :title="$t('educationalPrograms.requiredComponent')">{{ $t("educationalPrograms.rc") }}</span>
                        </template>
                        <template v-if="i.courseComponentType === 2">
                          <span :title="$t('educationalPrograms.universityComponent')">{{ $t("educationalPrograms.uk") }}</span>
                        </template>
                        <template v-if="i.courseComponentType === 3">
                          <span :title="$t('educationalPrograms.optionalCourse')">{{ $t("educationalPrograms.oc") }}</span>
                        </template>
                      </td>
                    </tr>
                    <tr v-for="(course, moduleIndex) in i.moduleCourseRel" :key="'module-' + moduleIndex">
                      <td>
                        {{ course['name' + locale] }}
                      </td>
                      <td>{{ course.codeCourse }}</td>
                      <td>{{ course.language === 1 ? 'Қазақша' : course.language === 2 ? 'На русском' : course.language === 3 ? 'In English' : '' }}
                      </td>
                      <td>{{ course.whatCourse }}</td>
                      <td>{{ course.semester }}</td>
                      <td>{{ course.Lecture }}/{{ course.practice }}/{{ course.laboratory }}</td>
                      <td>{{ course.prp }}/{{ course.IndependentWork }}</td>
                      <td>{{ course.formControl }}</td>
                    </tr>
                  </template>
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
        <span>{{ $t("educationalPrograms.moduleName") }}</span>
      </div>
      <div class="col-12 lg:col-9">
        <InputText v-model="formModule.namekz"/>
        <small class="p-error" v-if="!formModule.namekz && submitted">{{ $t("common.requiredField") }}</small>
      </div>
      <div class="col-12 lg:col-3">
        <span>{{ $t("educationalPrograms.moduleCode") }}</span>
      </div>
      <div class="col-12 lg:col-9">
        <InputText class="" v-model="formModule.code"/>
        <small class="p-error" v-if="!formModule.code && submitted">{{ $t("common.requiredField") }}</small>
      </div>
      <div class="col-12 lg:col-3">
        <span>{{ $t("educationalPrograms.academicCredits") }}</span>
      </div>
      <div class="col-12 lg:col-9">
        <InputText type="number" v-model="formModule.creditCount"/>
      </div>
      <div class="col-12 lg:col-3">
        <span>{{ $t("educationalPrograms.cycle") }}</span>
      </div>
      <div class="col-12 lg:col-9 flex gap-4">
        <div class="w-fit">
          <Checkbox v-model="courseType" :value="1" inputId="courseType1"/>
          <label class="ml-2" for="courseType1" :title="$t('educationalPrograms.generalEducationCourses')">{{ $t("educationalPrograms.ook") }}</label>
        </div>
        <div class="w-fit">
          <Checkbox v-model="courseType" :value="2" inputId="courseType2"/>
          <label class="ml-2" for="courseType2" :title="$t('educationalPrograms.basicCourses')">{{ $t("educationalPrograms.bc") }}</label>
        </div>
        <div class="w-fit">
          <Checkbox v-model="courseType" :value="3" inputId="courseType3"/>
          <label class="ml-2" for="courseType3" :title="$t('educationalPrograms.profileCourses')">{{ $t("educationalPrograms.pc") }}</label>
        </div>
        <small class="p-error" v-if="!formModule.courseType && submitted">{{ $t("common.requiredField") }}</small>
      </div>
      <div class="col-12 lg:col-3">
        <span>{{ $t("educationalPrograms.courseComponents") }}</span>
      </div>
      <div class="col-12 lg:col-9 flex gap-4">
        <div class="w-fit">
          <Checkbox v-model="courseComponentType" :value="1" inputId="courseComponentType1"/>
          <label class="ml-2" for="courseComponentType1" :title="$t('educationalPrograms.requiredComponent')">{{
              $t("educationalPrograms.rc")
            }}</label>
        </div>
        <div class="w-fit">
          <Checkbox v-model="courseComponentType" :value="2" inputId="courseComponentType2"/>
          <label class="ml-2" for="courseComponentType2" :title="$t('educationalPrograms.universityComponent')">{{
              $t("educationalPrograms.uk")
            }}</label>
        </div>
        <div class="w-fit">
          <Checkbox v-model="courseComponentType" :value="3" inputId="courseComponentType3"/>
          <label class="ml-2" for="courseComponentType3" :title="$t('educationalPrograms.optionalCourse')">{{ $t("educationalPrograms.oc") }}</label>
        </div>
        <small class="p-error" v-if="!formModule.courseComponentType && submitted">{{ $t("common.requiredField") }}</small>
      </div>
      <div class="col-12">
        <hr>
        <h5 class="font-semibold">{{ $t("course.courses") }}</h5>
      </div>
      <div class="col-12 lg:col-3">
        <span>{{ $t("educationalPrograms.courseName") }}</span>
      </div>
      <div class="col-12 lg:col-9">
        <Dropdown v-model="selectedCourse" @change="selectCourse($event)" :options="courses" class="mt-2" :optionLabel="['name' + locale]"
                  :placeholder="$t('common.select')"
                  @filter="handleFilter" :filter="true" :showClear="true" dataKey="id" :emptyFilterMessage="$t('roleControl.noResult')"/>
        <!--    <small class="p-error">{{ $t("common.requiredField") }}</small>-->
      </div>
      <div class="col-12 lg:col-3">
        <span>{{ $t("fieldEducation.courseCode") }}</span>
      </div>
      <div class="col-12 lg:col-9">
        <InputText v-model="formModule.moduleCourseRel[0].codeCourse"/>
        <!--    <small class="p-error">{{ $t("common.requiredField") }}</small>-->
      </div>
      <div class="col-12 lg:col-3">
        <span>{{ $t("common.learnlang") }}</span>
      </div>
      <div class="col-12 lg:col-9">
        <Dropdown :placeholder="$t('common.select')" :options="listLang" option-label="lang" optionValue="id"
                  v-model="formModule.moduleCourseRel[0].language"/>
        <!--    <small class="p-error">{{ $t("common.requiredField") }}</small>-->
      </div>
      <div class="col-12 lg:col-3">
        <span>{{ $t("course.course") }}</span>
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
        <span>{{ $t("educationalPrograms.semester") }}</span>
      </div>
      <div class="col-12 lg:col-9">
        <InputText v-model="formModule.moduleCourseRel[0].semester"/>
        <small class="p-error" v-if="!formModule.moduleCourseRel[0].semester && submitted">{{ $t("common.requiredField") }}</small>
      </div>
      <div class="col-3">
        <span>{{ $t("educationalPrograms.lecture") }}</span>
      </div>
      <div class="col-3">
        <InputNumber v-model="formModule.moduleCourseRel[0].Lecture"/>
        <!--    <small class="p-error">{{ $t("common.requiredField") }}</small>-->
      </div>
      <div class="col-6 flex">
        <span class="mr-4">{{ $t("educationalPrograms.practice") }}</span>
        <InputNumber v-model="formModule.moduleCourseRel[0].practice"/>
        <!--    <small class="p-error">{{ $t("common.requiredField") }}</small>-->
      </div>
      <div class="col-3">
        <span>{{ $t("educationalPrograms.laboratoryWork") }}</span>
      </div>
      <div class="col-3">
        <InputNumber v-model="formModule.moduleCourseRel[0].laboratory"/>
        <!--    <small class="p-error">{{ $t("common.requiredField") }}</small>-->
      </div>
      <div class="col-3 flex">
        <span class="mr-4" :title="$t('educationalPrograms.preGraduatePractice')">{{ $t("educationalPrograms.prp") }}</span>
        <InputNumber v-model="formModule.moduleCourseRel[0].prp"/>
        <!--    <small class="p-error">{{ $t("common.requiredField") }}</small>-->
      </div>
      <div class="col-3 flex">
        <span class="mr-4" :title="$t('educationalPrograms.independentWorkStudent')">{{ $t("educationalPrograms.sro") }}</span>
        <InputNumber v-model="formModule.moduleCourseRel[0].IndependentWork"/>
        <!--    <small class="p-error">{{ $t("common.requiredField") }}</small>-->
      </div>
      <div class="col-12 lg:col-3">
        <span>{{ $t("educationalPrograms.formControl") }}</span>
      </div>
      <div class="col-12 lg:col-9">
        <InputText v-model="formModule.moduleCourseRel[0].formControl"/>
        <!--    <small class="p-error">{{ $t("common.requiredField") }}</small>-->
      </div>
    </div>
    <div class="flex justify-content-between">
      <Button class="p-button-outlined mr-2 w-fit"
              icon="pi pi-plus-circle" :label="$t('educationalPrograms.addCourse')"/>
      <Button class="w-fit"
              icon="pi pi-download" :label="$t('common.add')" @click="addModuleAndCourses()"/>
    </div>
  </Dialog>
  <Dialog :header="$t('common.action.sendToApprove')" v-model:visible="dialogOpenState.sendToApprove"
          :style="{width: '50vw'}" class="p-fluid">
    <ProgressBar v-if="approving" mode="indeterminate" style="height: .5em"/>
    <div class="field">
      <ApprovalUsers :key="approveComponentKey" :approving="approving" v-model="selectedUsers"
                     @closed="closeDialog('sendToApprove')"
                     @approve="approve($event)" :stages="stages" :mode="'standard'"></ApprovalUsers>
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
import ApprovalUsers from "@/components/ncasigner/ApprovalUsers/ApprovalUsers.vue";

const disabledSend = ref(true)
const disabledApproval = ref(true)
const {t, locale} = useI18n()
const route = useRoute()
const router = useRouter()
const store = useStore()
const toast = useToast();
const i18n = useI18n();
const active = ref(3);
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
const checkedDouble = ref(false)
const checkedJointEducational = ref(false)
const stepID = ref()
const formData = ref(
    {
      id: 0,
      //nameKz: 'test kz',
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
      doubleDegree: checkedDouble.value ? 1:0,
      jointEducational: checkedJointEducational.value ? 1:0,
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
const selectedCourse = ref()
const formModule = ref(
    {
      //namekz: 'test kz',
      id: 0,
      syllabusId: 16,
      nameru: 'test ru',
      nameen: 'test en',
      code: 'test kz',
      creditCount: '2',
      courseType: courseType.value[0],
      courseComponentType: courseComponentType.value[0],
      moduleCourseRel: [
        {
          syllabusModuleId: 0,
          courseId: 10,
          whatCourse: whatCourse.value[0],
          semester: 2,
          Lecture: 80,
          practice: 85,
          laboratory: 88,
          prp: 87,
          IndependentWork: 90,
          formControl: "test форм",
        }
      ]
    }
)

const approveComponentKey = ref(0)
const approving = ref(false)
const stages = ref(null)
const selectedUsers = ref([
  {
    stage: 1,
    users: 'ss',
    certificate: {
      namekz: "Жеке тұлғаның сертификаты",
      nameru: "Сертификат физического лица",
      nameen: "Certificate of an individual",
      value: "individual"
    }
  }
])
const approvalStages = ref([
  {
    stage: 1,
    users: 's',
    certificate: {
      namekz: "Жеке тұлғаның сертификаты",
      nameru: "Сертификат физического лица",
      nameen: "Certificate of an individual",
      value: "individual"
    },
    titleRu: "Преподаватель",
    titleKz: "Оқытушы",
    titleEn: "Teacher",
  },
  {
    stage: 2,
    users: null,
    titleRu: "Заведующий кафедры",
    titleKz: "Кафедра меңгерушісі",
    titleEn: "Head of Department",
    certificate: {
      namekz: "Ішкі құжат айналымы үшін (ГОСТ)",
      nameru: "Для внутреннего документооборота (ГОСТ)",
      nameen: "For internal document management (GOST)",
      value: "internal"
    },
  }
])
const dialogOpenState = ref({
  addFolder: false,
  moveFolder: false,
  fileUpload: false,
  signerInfo: false,
  sendToApprove: false,
  revision: false,
  docInfo: false,
  umkParams: false
})
const submitted = ref(false)
const service = new OnlineCourseService()
const dataFieldEducation = ref([])
const codeAndNameGroup = ref([])
const codeGroup = ref([])
const modules = ref([])
const courses = ref([])
const trainingDirections = ref([])
const dialogModule = ref(false)
const lazyParams = {
  page: 0,
  rows: 1000,
  searchText: '',
}
const listLang = ref([
  {id: 1, lang: 'Қазақша'},
  {id: 2, lang: 'На русском'},
  {id: 3, lang: 'In English'},
])

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
    lazyParams.searchText = ''
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

const getEduPrograms = () => {
  service.getEduPrograms(lazyParams).then(response => {
    if (response.data) {
      codeAndNameGroup.value = response.data
      codeAndNameGroup.value.map(e => {
        e.codeAndName_kz = e.code + ' ' + e.name_kz
        e.codeAndName_ru = e.code + ' ' + e.name_ru
        e.codeAndName_en = e.code + ' ' + e.name_en
      })
    }
  }).catch(_ => {
  });
}
getEduPrograms()

const onDoubleChange = (data) => {
  if(data === 1){
    formStep2.value.doubleDegree = checkedDouble.value ? 1 : 0
  }
  if(data === 2){
    formStep2.value.jointEducational = checkedJointEducational.value ? 1 : 0
  }
}

const filterCodeAndNameGroup = (event) => {
  if (event.value && event.value.length > 3) {
    lazyParams.searchText = event.value
    getEduPrograms()
  } else if (lazyParams.searchText.length > 3) {
    lazyParams.searchText = ''
    getEduPrograms()
  }
}

const getEduProgGroups = () => {
  service.getEduProgGroups(lazyParams).then(response => {
    if (response.data) {
      codeGroup.value = response.data
      codeGroup.value.map(e => {
        e.codeAndName_kz = e.code + ' ' + e.name_kz
        e.codeAndName_ru = e.code + ' ' + e.name_ru
        e.codeAndName_en = e.code + ' ' + e.name_en
      })
    }
  }).catch(_ => {
  });
}
getEduProgGroups()

const filterCodeGroup = (event) => {
  if (event.value && event.value.length > 3) {
    lazyParams.searchText = event.value
    getEduProgGroups()
  } else if (lazyParams.searchText.length > 3) {
    lazyParams.searchText = ''
    getEduProgGroups()
  }
}

const getTrainingDirections= () => {
  service.getTrainingDirections(lazyParams).then(response => {
    if (response) {
      trainingDirections.value = response.data
      trainingDirections.value.map(e => {
        e.codeAndName_kz = e.code + ' ' + e.name_kz
        e.codeAndName_ru = e.code + ' ' + e.name_ru
        e.codeAndName_en = e.code + ' ' + e.name_en
      })
    }
  }).catch(_ => {
  });
}
getTrainingDirections()

const filterTrainingDirections = (event) => {
  if (event.value && event.value.length > 3) {
    lazyParams.searchText = event.value
    getTrainingDirections()
  } else if (lazyParams.searchText.length > 3) {
    lazyParams.searchText = ''
    getTrainingDirections()
  }
}
const getModuleBySyllasbusId = () => {
  service.getModuleBySyllasbusId(16).then(response => {
    if (response.data) {
      modules.value = response.data
    }
  }).catch(_ => {
  });
}
getModuleBySyllasbusId()

const approve = (event) => {
  approving.value = true;
  toast.add({
    severity: "success",
    summary: this.$t('common.message.succesSendToApproval'),
    life: 3000,
  });
  closeDialog("sendToApprove");
  this.approving = false;
}

const openDialog = (dialog) => {
  if (dialog === "sendToApprove") {
    approveComponentKey.value++;
    stages.value = JSON.parse(JSON.stringify(approvalStages.value));
  }

  dialogOpenState.value[dialog] = true;
}
const closeDialog = (dialog) => {
  dialogOpenState[dialog] = false;

}
const save = () => {
  if (active.value === 0) {
    submitted.value = true
    if (!isValid()) return;
    formData.value.eduDegree = parseInt(route.params.degreeID)
    service.addEducationalProgram(formData.value).then(res => {
      stepID.value = res
      toast.add({
        severity: "success",
        summary: i18n.t("common.success"),
        life: 3000,
      });
      formData.value = null
      active.value = 1
    }).catch(error => {
      toast.add({severity: "error", summary: error, life: 3000});
    });
  }
  if (active.value === 1) {
    submitted.value = true
    if (!isValidStep2()) return;
    formStep2.value.id = stepID.value.data
    console.log(formStep2.value)
    service.addEduProgramTarget(formStep2.value).then(res => {
      toast.add({
        severity: "success",
        summary: i18n.t("common.success"),
        life: 3000,
      });
      formStep2.value = null
      active.value = 2
    }).catch(error => {
      toast.add({severity: "error", summary: error, life: 3000});
    });
  }
  if (active.value === 2) {
    submitted.value = true
    if (!isValidStep3()) return;
    formStep3.value.id = stepID.value.data
    console.log(formStep3.value)
    service.addEduProgramDirectory(formStep3.value).then(res => {
      toast.add({
        severity: "success",
        summary: i18n.t("common.success"),
        life: 3000,
      });
      formStep2.value = null
      active.value = 3
    }).catch(error => {
      toast.add({severity: "error", summary: error, life: 3000});
    });
  }
}
const selectCourse = (data) => {
  formModule.value.moduleCourseRel[0].language = data.value.courceLanguageId
  formModule.value.moduleCourseRel[0].codeCourse = parseInt(data.value.courseCode)
  formModule.value.moduleCourseRel[0].courseId = data.value.id
  formModule.value.moduleCourseRel[0].id = 0
  console.log(data.value)
}
const addModuleAndCourses = () => {
  submitted.value = true
  if (!isValidModule()) return;
  console.log(formModule.value)
  service.addModuleAndCourses(formModule.value).then(response => {
    toast.add({
      severity: "success",
      summary: i18n.t("common.success"),
      life: 3000,
    });
    dialogModule.value = false
    getModuleBySyllasbusId()
  }).catch(_ => {
  });
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

.module_dialog {
  width: 80%;

  .p-inputtext, .p-dropdown {
    width: 100%;
  }
}

table {
  border-collapse: collapse;

  thead {
    font-weight: 500;
  }

  td {
    text-align: center;
    padding: 5px;
  }
}

table, th, td {
  border: 1px solid #BDBBBB;
}
</style>