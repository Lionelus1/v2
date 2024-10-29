<template>
  <div id="carddiv" class="grid">
    <div class="col-12">
      <h3>{{ this.$t("common.departmentNameLabel")}}</h3>
      <div>
        <Menubar :model="menu" :key="active" style="height:36px;margin-top:-7px;margin-left:-14px;margin-right:-14px"></Menubar>
      </div>
    </div>
    <div class="col-12 md:col-12 p-fluid">
      <div class="card">
        <div class="grid formgrid">
          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ this.$t("common.organizationNameLabel") }}</label>
            <ContragentSelectOrg
              ref = "contragent"
              v-model="value.organization"
              class="mt-2"
              @selected="getDepartments($event, $refs.departmentList)"
            ></ContragentSelectOrg>
            <small
                class="p-error"
                v-if="validation.organization"
            >{{ $t("common.requiredField") }}</small>
          </div>
          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ this.$t("common.departmentNameLabel") }}</label>
            <DepartmentList :readonly="readonly" class="mt-2"
                            :autoLoad="false"
                            :editMode="true"
                            ref="departmentList"
                            :orgType="2"
                            :parentID="value?.organization?.id || undefined"
                            :validation="validation.department"
                            v-model="value.department"/>
            <small
                class="p-error"
                v-if="validation.department"
            >{{ $t("common.requiredField") }}</small>
          </div>
          <div class="field col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ this.$t("common.headLabel") }}</label>
            <FindUser v-model="head"
                      :max="1"
                      :class="{'p-invalid': validation.head}"
                      :editMode="false"
                      :readonly="readonly" :user-type="3"/>
            <small
                class="p-error"
                v-if="validation.head"
            >{{ $t("common.requiredField") }}</small>
          </div>
          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ this.$t("common.deadlineDate") }}</label>
            <PrimeCalendar
                :readonly="readonly"
                class="mt-2"
                :class="{'p-invalid': validation.deadline}"
                v-model="value.deadline"
                dateFormat="dd.mm.yy"/>
            <small
                class="p-error"
                v-if="validation.organization"
            >{{ $t("common.requiredField") }}</small>
          </div>
          <div class="field-checkbox" style="margin-left: 15px">
            <Checkbox id="binary" v-model="value.isAccessibleVacancies" :binary="true"/>
            <label for="binary" style="font-size: 15px; text-align: justify">
              <b>
                Данная вакансия подходит для людей с особыми потребностями
              </b>
            </label>
          </div>
        </div>
        <TabView>
          <TabPanel header="Қазақша">
            <div class="field">
              <label for="kazname">Атауы</label>
              <InputText
                  id="kazname"
                  :readonly="readonly"
                  class="mt-2"
                  :class="{'p-invalid': validation.nameKz}"
                  type="text"
                  placeholder="Атауы"
                  v-model="value.nameKz"
              ></InputText>
              <small
                  class="p-error"
                  v-if="validation.nameKz"
              >{{ $t("common.requiredField") }}</small>
            </div>
            <div class="field">
              <label for="kazname">Функционалдық міндеттері</label>
              <Editor v-model="value.responsibilitiesKz"
                      class="p-invalid"
                      :readonly="readonly"
                      editorStyle="height: 120px">
                <template v-slot:toolbar>
                <span class="ql-formats">
                    <button class="ql-bold" v-tooltip.bottom="'Bold'"></button>
                    <button class="ql-italic" v-tooltip.bottom="'Italic'"></button>
                    <button class="ql-underline" v-tooltip.bottom="'Underline'"></button>
                  <select class="ql-align">
                    <option defaultValue></option>ß
                    <option value="center"></option>
                    <option value="right"></option>
                    <option value="justify"></option>
                  </select>
                </span>
                </template>
              </Editor>
              <small
                  class="p-error"
                  v-if="validation.responsibilitiesKz"
              >{{ $t("common.requiredField") }}</small>
            </div>
            <div class="field">
              <label for="kazname">Білімі</label>
              <Editor v-model="value.educationKz"
                      :readonly="readonly"
                      :class="{'p-invalid': validation.educationKz}"
                      editorStyle="height: 120px">
                <template v-slot:toolbar>
                <span class="ql-formats">
                    <button class="ql-bold" v-tooltip.bottom="'Bold'"></button>
                    <button class="ql-italic" v-tooltip.bottom="'Italic'"></button>
                    <button class="ql-underline" v-tooltip.bottom="'Underline'"></button>
                  <select class="ql-align">
                    <option defaultValue></option>ß
                    <option value="center"></option>
                    <option value="right"></option>
                    <option value="justify"></option>
                  </select>
                </span>
                </template>
              </Editor>
              <small
                  class="p-error"
                  v-if="validation.educationKz"
              >{{ $t("common.requiredField") }}</small>
            </div>
            <div class="field">
              <label for="kazname">Мамандығы бойынша біліктілігі</label>
              <Editor v-model="value.qualificationKz"
                      :readonly="readonly"
                      :class="{'p-invalid': validation.qualificationKz}"
                      editorStyle="height: 120px">
                <template v-slot:toolbar>
                <span class="ql-formats">
                    <button class="ql-bold" v-tooltip.bottom="'Bold'"></button>
                    <button class="ql-italic" v-tooltip.bottom="'Italic'"></button>
                    <button class="ql-underline" v-tooltip.bottom="'Underline'"></button>
                  <select class="ql-align">
                    <option defaultValue></option>ß
                    <option value="center"></option>
                    <option value="right"></option>
                    <option value="justify"></option>
                  </select>
                </span>
                </template>
              </Editor>
              <small
                  class="p-error"
                  v-if="validation.qualificationKz"
              >{{ $t("common.requiredField") }}</small>
            </div>
            <div class="field">
              <label for="kazname">Қажетті кәсіби тәжірибесі</label>
              <Editor v-model="value.experienceKz"
                      :readonly="readonly"
                      :class="{'p-invalid': validation.experienceKz}"
                      editorStyle="height: 120px">
                <template v-slot:toolbar>
                <span class="ql-formats">
                    <button class="ql-bold" v-tooltip.bottom="'Bold'"></button>
                    <button class="ql-italic" v-tooltip.bottom="'Italic'"></button>
                    <button class="ql-underline" v-tooltip.bottom="'Underline'"></button>
                  <select class="ql-align">
                    <option defaultValue></option>ß
                    <option value="center"></option>
                    <option value="right"></option>
                    <option value="justify"></option>
                  </select>
                </span>
                </template>
              </Editor>
              <small
                  class="p-error"
                  v-if="validation.experienceKz"
              >{{ $t("common.requiredField") }}</small>
            </div>
            <div class="field">
              <label for="kazname">Тілдерді меңгеру деңгейі</label>
              <Editor v-model="value.languageLevelKz"
                      :readonly="readonly"
                      :class="{'p-invalid': validation.languageLevelKz}"
                      editorStyle="height: 120px">
                <template v-slot:toolbar>
                <span class="ql-formats">
                    <button class="ql-bold" v-tooltip.bottom="'Bold'"></button>
                    <button class="ql-italic" v-tooltip.bottom="'Italic'"></button>
                    <button class="ql-underline" v-tooltip.bottom="'Underline'"></button>
                  <select class="ql-align">
                    <option defaultValue></option>ß
                    <option value="center"></option>
                    <option value="right"></option>
                    <option value="justify"></option>
                  </select>
                </span>
                </template>
              </Editor>
              <small
                  class="p-error"
                  v-if="validation.languageLevelKz"
              >{{ $t("common.requiredField") }}</small>
            </div>
            <div class="field">
              <label for="kazname">Сертификаттардың, дипломдардың болуы</label>
              <Editor v-model="value.certificateRequirementsKz"
                      :readonly="readonly"
                      :class="{'p-invalid': validation.certificateRequirementsKz}"
                      editorStyle="height: 120px">
                <template v-slot:toolbar>
                <span class="ql-formats">
                    <button class="ql-bold" v-tooltip.bottom="'Bold'"></button>
                    <button class="ql-italic" v-tooltip.bottom="'Italic'"></button>
                    <button class="ql-underline" v-tooltip.bottom="'Underline'"></button>
                  <select class="ql-align">
                    <option defaultValue></option>ß
                    <option value="center"></option>
                    <option value="right"></option>
                    <option value="justify"></option>
                  </select>
                </span>
                </template>
              </Editor>
              <small
                  class="p-error"
                  v-if="validation.certificateRequirementsKz"
              >{{ $t("common.requiredField") }}</small>
            </div>
            <div class="field">
              <label for="kazname">Жеке қасиеттері</label>
              <Editor v-model="value.personalQualitiesKz"
                      :readonly="readonly"
                      :class="{'p-invalid': validation.personalQualitiesKz}"
                      editorStyle="height: 120px">
                <template v-slot:toolbar>
                <span class="ql-formats">
                    <button class="ql-bold" v-tooltip.bottom="'Bold'"></button>
                    <button class="ql-italic" v-tooltip.bottom="'Italic'"></button>
                    <button class="ql-underline" v-tooltip.bottom="'Underline'"></button>
                  <select class="ql-align">
                    <option defaultValue></option>ß
                    <option value="center"></option>
                    <option value="right"></option>
                    <option value="justify"></option>
                  </select>
                </span>
                </template>
              </Editor>
              <small
                  class="p-error"
                  v-if="validation.personalQualitiesKz"
              >{{ $t("common.requiredField") }}</small>
            </div>
            <div class="field">
              <label for="kazname">Жұмыс шарты</label>
              <Editor v-model="value.workConditionKz"
                      :readonly="readonly"
                      :class="{'p-invalid': validation.workConditionKz}"
                      editorStyle="height: 120px">
                <template v-slot:toolbar>
                <span class="ql-formats">
                    <button class="ql-bold" v-tooltip.bottom="'Bold'"></button>
                    <button class="ql-italic" v-tooltip.bottom="'Italic'"></button>
                    <button class="ql-underline" v-tooltip.bottom="'Underline'"></button>
                  <select class="ql-align">
                    <option defaultValue></option>ß
                    <option value="center"></option>
                    <option value="right"></option>
                    <option value="justify"></option>
                  </select>
                </span>
                </template>
              </Editor>
              <small
                  class="p-error"
                  v-if="validation.workConditionKz"
              >{{ $t("common.requiredField") }}</small>
            </div>
          </TabPanel>
          <TabPanel header="Русский">
            <div class="field">
              <label for="kazname">Наименование</label>
              <InputText
                  id="kazname"
                  :readonly="readonly"
                  class="mt-2"
                  :class="{'p-invalid': validation.nameRu}"
                  type="text"
                  placeholder="Наименование"
                  v-model="value.nameRu"
              ></InputText>
              <small
                  class="p-error"
                  v-if="validation.nameRu"
              >{{ $t("common.requiredField") }}</small>
            </div>
            <div class="field">
              <label for="kazname">Функциональные обязанности</label>
              <Editor v-model="value.responsibilitiesRu"
                      :readonly="readonly"
                      :class="{'p-invalid': validation.responsibilitiesRu}"
                      editorStyle="height: 120px">
                <template v-slot:toolbar>
                <span class="ql-formats">
                    <button class="ql-bold" v-tooltip.bottom="'Bold'"></button>
                    <button class="ql-italic" v-tooltip.bottom="'Italic'"></button>
                    <button class="ql-underline" v-tooltip.bottom="'Underline'"></button>
                  <select class="ql-align">
                    <option defaultValue></option>ß
                    <option value="center"></option>
                    <option value="right"></option>
                    <option value="justify"></option>
                  </select>
                </span>
                </template>
              </Editor>
              <small
                  class="p-error"
                  v-if="validation.responsibilitiesRu"
              >{{ $t("common.requiredField") }}</small>
            </div>
            <div class="field">
              <label for="kazname">Образование</label>
              <Editor v-model="value.educationRu"
                      :readonly="readonly"
                      :class="{'p-invalid': validation.experienceRu}"
                      editorStyle="height: 120px">
                <template v-slot:toolbar>
                <span class="ql-formats">
                    <button class="ql-bold" v-tooltip.bottom="'Bold'"></button>
                    <button class="ql-italic" v-tooltip.bottom="'Italic'"></button>
                    <button class="ql-underline" v-tooltip.bottom="'Underline'"></button>
                  <select class="ql-align">
                    <option defaultValue></option>ß
                    <option value="center"></option>
                    <option value="right"></option>
                    <option value="justify"></option>
                  </select>
                </span>
                </template>
              </Editor>
              <small
                  class="p-error"
                  v-if="validation.experienceRu"
              >{{ $t("common.requiredField") }}</small>
            </div>
            <div class="field">
              <label for="kazname">Квалификация по специальности</label>
              <Editor v-model="value.qualificationRu"
                      :readonly="readonly"
                      :class="{'p-invalid': validation.qualificationRu}"
                      editorStyle="height: 120px">
                <template v-slot:toolbar>
                <span class="ql-formats">
                    <button class="ql-bold" v-tooltip.bottom="'Bold'"></button>
                    <button class="ql-italic" v-tooltip.bottom="'Italic'"></button>
                    <button class="ql-underline" v-tooltip.bottom="'Underline'"></button>
                  <select class="ql-align">
                    <option defaultValue></option>ß
                    <option value="center"></option>
                    <option value="right"></option>
                    <option value="justify"></option>
                  </select>
                </span>
                </template>
              </Editor>
              <small
                  class="p-error"
                  v-if="validation.qualificationRu"
              >{{ $t("common.requiredField") }}</small>
            </div>
            <div class="field">
              <label for="kazname">Требуемый опыт работы</label>
              <Editor v-model="value.experienceRu"
                      :readonly="readonly"
                      :class="{'p-invalid': validation.experienceRu}"
                      editorStyle="height: 120px">
                <template v-slot:toolbar>
                <span class="ql-formats">
                    <button class="ql-bold" v-tooltip.bottom="'Bold'"></button>
                    <button class="ql-italic" v-tooltip.bottom="'Italic'"></button>
                    <button class="ql-underline" v-tooltip.bottom="'Underline'"></button>
                  <select class="ql-align">
                    <option defaultValue></option>ß
                    <option value="center"></option>
                    <option value="right"></option>
                    <option value="justify"></option>
                  </select>
                </span>
                </template>
              </Editor>
              <small
                  class="p-error"
                  v-if="validation.experienceRu"
              >{{ $t("common.requiredField") }}</small>
            </div>
            <div class="field">
              <label for="kazname">Уровень знания языков</label>
              <Editor v-model="value.languageLevelRu"
                      :readonly="readonly"
                      :class="{'p-invalid': validation.languageLevelRu}"
                      editorStyle="height: 120px">
                <template v-slot:toolbar>
                <span class="ql-formats">
                    <button class="ql-bold" v-tooltip.bottom="'Bold'"></button>
                    <button class="ql-italic" v-tooltip.bottom="'Italic'"></button>
                    <button class="ql-underline" v-tooltip.bottom="'Underline'"></button>
                  <select class="ql-align">
                    <option defaultValue></option>ß
                    <option value="center"></option>
                    <option value="right"></option>
                    <option value="justify"></option>
                  </select>
                </span>
                </template>
              </Editor>
              <small
                  class="p-error"
                  v-if="validation.languageLevelRu"
              >{{ $t("common.requiredField") }}</small>
            </div>
            <div class="field">
              <label for="kazname">Наличие сертификатов и дипломов</label>
              <Editor v-model="value.certificateRequirementsRu"
                      :readonly="readonly"
                      :class="{'p-invalid': validation.certificateRequirementsRu}"
                      editorStyle="height: 120px">
                <template v-slot:toolbar>
                <span class="ql-formats">
                    <button class="ql-bold" v-tooltip.bottom="'Bold'"></button>
                    <button class="ql-italic" v-tooltip.bottom="'Italic'"></button>
                    <button class="ql-underline" v-tooltip.bottom="'Underline'"></button>
                  <select class="ql-align">
                    <option defaultValue></option>ß
                    <option value="center"></option>
                    <option value="right"></option>
                    <option value="justify"></option>
                  </select>
                </span>
                </template>
              </Editor>
              <small
                  class="p-error"
                  v-if="validation.certificateRequirementsRu"
              >{{ $t("common.requiredField") }}</small>
            </div>
            <div class="field">
              <label for="kazname">Персональные качества</label>
              <Editor v-model="value.personalQualitiesRu"
                      :readonly="readonly"
                      :class="{'p-invalid': validation.personalQualitiesRu}"
                      editorStyle="height: 120px">
                <template v-slot:toolbar>
                <span class="ql-formats">
                    <button class="ql-bold" v-tooltip.bottom="'Bold'"></button>
                    <button class="ql-italic" v-tooltip.bottom="'Italic'"></button>
                    <button class="ql-underline" v-tooltip.bottom="'Underline'"></button>
                  <select class="ql-align">
                    <option defaultValue></option>ß
                    <option value="center"></option>
                    <option value="right"></option>
                    <option value="justify"></option>
                  </select>
                </span>
                </template>
              </Editor>
              <small
                  class="p-error"
                  v-if="validation.personalQualitiesRu"
              >{{ $t("common.requiredField") }}</small>
            </div>
            <div class="field">
              <label for="kazname">Условия работы</label>
              <Editor v-model="value.workConditionRu"
                      :readonly="readonly"
                      :class="{'p-invalid': validation.workConditionRu}"
                      editorStyle="height: 120px">
                <template v-slot:toolbar>
                <span class="ql-formats">
                    <button class="ql-bold" v-tooltip.bottom="'Bold'"></button>
                    <button class="ql-italic" v-tooltip.bottom="'Italic'"></button>
                    <button class="ql-underline" v-tooltip.bottom="'Underline'"></button>
                  <select class="ql-align">
                    <option defaultValue></option>ß
                    <option value="center"></option>
                    <option value="right"></option>
                    <option value="justify"></option>
                  </select>
                </span>
                </template>
              </Editor>
              <small
                  class="p-error"
                  v-if="validation.workConditionRu"
              >{{ $t("common.requiredField") }}</small>
            </div>
          </TabPanel>
          <TabPanel header="English">
            <div class="field">
              <label for="kazname">Name</label>
              <InputText
                  id="kazname"
                  :readonly="readonly"
                  class="mt-2"
                  :class="{'p-invalid': validation.nameEn}"
                  type="text"
                  placeholder="Name"
                  v-model="value.nameEn"
              ></InputText>
              <small
                  class="p-error"
                  v-if="validation.nameEn"
              >{{ $t("common.requiredField") }}</small>
            </div>
            <div class="field">
              <label for="kazname">Functional responsibilities</label>
              <Editor v-model="value.responsibilitiesEn"
                      :class="{'p-invalid': validation.responsibilitiesEn}"
                      editorStyle="height: 120px">
                <template v-slot:toolbar>
                <span class="ql-formats">
                    <button class="ql-bold" v-tooltip.bottom="'Bold'"></button>
                    <button class="ql-italic" v-tooltip.bottom="'Italic'"></button>
                    <button class="ql-underline" v-tooltip.bottom="'Underline'"></button>
                  <select class="ql-align">
                    <option defaultValue></option>ß
                    <option value="center"></option>
                    <option value="right"></option>
                    <option value="justify"></option>
                  </select>
                </span>
                </template>
              </Editor>
              <small
                  class="p-error"
                  v-if="validation.responsibilitiesEn"
              >{{ $t("common.requiredField") }}</small>
            </div>
            <div class="field">
              <label for="kazname">Education</label>
              <Editor v-model="value.educationEn"
                      :class="{'p-invalid': validation.educationEn}"
                      editorStyle="height: 120px">
                <template v-slot:toolbar>
                <span class="ql-formats">
                    <button class="ql-bold" v-tooltip.bottom="'Bold'"></button>
                    <button class="ql-italic" v-tooltip.bottom="'Italic'"></button>
                    <button class="ql-underline" v-tooltip.bottom="'Underline'"></button>
                  <select class="ql-align">
                    <option defaultValue></option>ß
                    <option value="center"></option>
                    <option value="right"></option>
                    <option value="justify"></option>
                  </select>
                </span>
                </template>
              </Editor>
              <small
                  class="p-error"
                  v-if="validation.educationEn"
              >{{ $t("common.requiredField") }}</small>
            </div>
            <div class="field">
              <label for="kazname">Qualification by specialty</label>
              <Editor v-model="value.qualificationEn"
                      :class="{'p-invalid': validation.qualificationEn}"
                      editorStyle="height: 120px">
                <template v-slot:toolbar>
                <span class="ql-formats">
                    <button class="ql-bold" v-tooltip.bottom="'Bold'"></button>
                    <button class="ql-italic" v-tooltip.bottom="'Italic'"></button>
                    <button class="ql-underline" v-tooltip.bottom="'Underline'"></button>
                  <select class="ql-align">
                    <option defaultValue></option>ß
                    <option value="center"></option>
                    <option value="right"></option>
                    <option value="justify"></option>
                  </select>
                </span>
                </template>
              </Editor>
              <small
                  class="p-error"
                  v-if="validation.qualificationEn"
              >{{ $t("common.requiredField") }}</small>
            </div>
            <div class="field">
              <label for="kazname">Required work experience</label>
              <Editor v-model="value.experienceEn"
                      :class="{'p-invalid': validation.experienceEn}"
                      editorStyle="height: 120px">
                <template v-slot:toolbar>
                <span class="ql-formats">
                    <button class="ql-bold" v-tooltip.bottom="'Bold'"></button>
                    <button class="ql-italic" v-tooltip.bottom="'Italic'"></button>
                    <button class="ql-underline" v-tooltip.bottom="'Underline'"></button>
                  <select class="ql-align">
                    <option defaultValue></option>ß
                    <option value="center"></option>
                    <option value="right"></option>
                    <option value="justify"></option>
                  </select>
                </span>
                </template>
              </Editor>
              <small
                  class="p-error"
                  v-if="validation.experienceEn"
              >{{ $t("common.requiredField") }}</small>
            </div>
            <div class="field">
              <label for="kazname">Language skills</label>
              <Editor v-model="value.languageLevelEn"
                      :class="{'p-invalid': validation.languageLevelEn}"
                      editorStyle="height: 120px">
                <template v-slot:toolbar>
                <span class="ql-formats">
                    <button class="ql-bold" v-tooltip.bottom="'Bold'"></button>
                    <button class="ql-italic" v-tooltip.bottom="'Italic'"></button>
                    <button class="ql-underline" v-tooltip.bottom="'Underline'"></button>
                  <select class="ql-align">
                    <option defaultValue></option>ß
                    <option value="center"></option>
                    <option value="right"></option>
                    <option value="justify"></option>
                  </select>
                </span>
                </template>
              </Editor>
              <small
                  class="p-error"
                  v-if="validation.languageLevelEn"
              >{{ $t("common.requiredField") }}</small>
            </div>
            <div class="field">
              <label for="kazname">Availability of certificates and diplomas</label>
              <Editor v-model="value.certificateRequirementsEn"
                      :class="{'p-invalid': validation.certificateRequirementsEn}"
                      editorStyle="height: 120px">
                <template v-slot:toolbar>
                <span class="ql-formats">
                    <button class="ql-bold" v-tooltip.bottom="'Bold'"></button>
                    <button class="ql-italic" v-tooltip.bottom="'Italic'"></button>
                    <button class="ql-underline" v-tooltip.bottom="'Underline'"></button>
                  <select class="ql-align">
                    <option defaultValue></option>ß
                    <option value="center"></option>
                    <option value="right"></option>
                    <option value="justify"></option>
                  </select>
                </span>
                </template>
              </Editor>
              <small
                  class="p-error"
                  v-if="validation.certificateRequirementsEn"
              >{{ $t("common.requiredField") }}</small>
            </div>
            <div class="field">
              <label for="kazname">Personal qualities</label>
              <Editor v-model="value.personalQualitiesEn"
                      :class="{'p-invalid': validation.personalQualitiesEn}"
                      editorStyle="height: 120px">
                <template v-slot:toolbar>
                <span class="ql-formats">
                    <button class="ql-bold" v-tooltip.bottom="'Bold'"></button>
                    <button class="ql-italic" v-tooltip.bottom="'Italic'"></button>
                    <button class="ql-underline" v-tooltip.bottom="'Underline'"></button>
                  <select class="ql-align">
                    <option defaultValue></option>ß
                    <option value="center"></option>
                    <option value="right"></option>
                    <option value="justify"></option>
                  </select>
                </span>
                </template>
              </Editor>
              <small
                  class="p-error"
                  v-if="validation.personalQualitiesEn"
              >{{ $t("common.requiredField") }}</small>
            </div>
            <div class="field">
              <label for="kazname">Working conditions</label>
              <Editor v-model="value.workConditionEn"
                      :class="{'p-invalid': validation.workConditionEn}"
                      editorStyle="height: 120px">
                <template v-slot:toolbar>
                <span class="ql-formats">
                    <button class="ql-bold" v-tooltip.bottom="'Bold'"></button>
                    <button class="ql-italic" v-tooltip.bottom="'Italic'"></button>
                    <button class="ql-underline" v-tooltip.bottom="'Underline'"></button>
                  <select class="ql-align">
                    <option defaultValue></option>ß
                    <option value="center"></option>
                    <option value="right"></option>
                    <option value="justify"></option>
                  </select>
                </span>
                </template>
              </Editor>
              <small
                  class="p-error"
                  v-if="validation.workConditionEn"
              >{{ $t("common.requiredField") }}</small>
            </div>
          </TabPanel>
        </TabView>
      </div>
    </div>
  </div>
</template>
<script>
import ContragentSelectOrg from "../../contragent/ContragentSelectOrg";
import DepartmentList from "../../smartenu/DepartmentList";
import VacancyService from "./VacancyService";
import api from '@/service/api';
import {smartEnuApi, getHeader } from "@/config/config";
export default {
  components: {DepartmentList, ContragentSelectOrg},
  props: {
    modelValue: null,
    placeholder: String,
    readonly: Boolean,
  },
  data() {
    return {
      value: this.modelValue,
      head: null,
      active: null,
      action: null,
      actionReject: null,
      validation: {
        organization: false,
        department: false,
        head: false,
        deadline: false,
        nameKz: false,
        responsibilitiesKz: false,
        educationKz: false,
        qualificationKz: false,
        experienceKz: false,
        languageLevelKz: false,
        certificateRequirementsKz: false,
        personalQualitiesKz: false,
        workConditionKz: false,
        nameRu: false,
        responsibilitiesRu: false,
        educationRu: false,
        qualificationRu: false,
        experienceRu: false,
        languageLevelRu: false,
        certificateRequirementsRu: false,
        personalQualitiesRu: false,
        workConditionRu: false,
        nameEn: false,
        responsibilitiesEn: false,
        educationEn: false,
        qualificationEn: false,
        experienceEn: false,
        languageLevelEn: false,
        certificateRequirementsEn: false,
        personalQualitiesEn: false,
        workConditionEn: false,
        accessibleVacancies: false,
      },
      menu: [
        {
          label: this.$t("common.save"),
          icon: "pi pi-fw pi-save",
          visible: true,
          command: () => {
            this.save()
          },
        },
        {
          label: 'action',
          icon: "pi pi-fw pi-caret-up",
          visible: false,
          command: () => {
            this.vacancyAction(this.value.id, this.action.alias)
          },
        },
        {
          label: 'action',
          icon: "pi pi-fw pi-caret-up",
          visible: false,
          command: () => {
            this.vacancyAction(this.value.id, this.actionReject.alias)
          },
        },
      ],
    };
  },
  methods: {
    getDepartments(event, departmentList) {
      if (event.value.chief)
      {
        this.head = []
        this.head.push(event.value.chief)
      }
      departmentList.getDepartments(event.value.id);

    },
    save() {
      let path = this.value.id === undefined ? "/vacancy/add" : "/vacancy/update"
      this.value.departmentHead = this.head !== null ? this.head[0]  : null
      if (this.validationForm()) {
        this.vacancyService.createOrUpdateVacancy(this.value, path).then(result => {
          this.emitter.emit("vacancyAdded", true);
        }).catch(error => {
          this.$toast.add({
            severity: "error",
            summary: error,
            life: 3000,
          });
        });
      }
    },

    vacancyAction(id, action) {
      this.vacancyService.vacancyAction(id, action).then(response => {
        this.emitter.emit("vacancyAdded", true);
      }).catch(error => {
        this.$toast.add({
          severity: "error",
          summary: + error,
          life: 3000,
        });
      })
    },

    checkAction() {
      this.menu[0].visible = !this.readonly
      if (this.value.history !== undefined) {
        this.vacancyService.checkAction(this.value.history.status.id, this.value).then(response => {
          if (response.data === 'acceptance') {
            this.action = this.vacancyService.actions.find(action => action.alias === 'accept')
            this.menu[1].label = this.$t(this.action.label)
            this.menu[1].visible = this.action.visible
            this.actionReject = this.vacancyService.actions.find(action => action.alias === 'not-accept')
            this.menu[2].label = this.$t(this.actionReject.label)
            this.menu[2].visible = this.actionReject.visible
          } else if (response.data) {
            this.action = this.vacancyService.actions.find(action => action.alias === response.data)
            this.menu[1].label = this.$t(this.action.label)
            this.menu[1].visible = this.action.visible
            this.menu[2].visible = false
          }
        }).catch(error => {
          this.$toast.add({
            severity: "error",
            summary: error,
            life: 3000,
          });
        })
      }
    },

    validationForm() {
      this.validation.organization = !this.value.organization || this.value.organization === ""
      this.validation.department = !this.value.department || this.value.department === ""
      this.validation.head = !this.value.departmentHead || this.value.departmentHead === ""
      this.validation.deadline = !this.value.deadline || this.value.deadline === ""

      this.validation.nameKz = !this.value.nameKz || this.value.nameKz === ""
      this.validation.responsibilitiesKz = !this.value.responsibilitiesKz || this.value.responsibilitiesKz === ""
      this.validation.educationKz = !this.value.educationKz || this.value.educationKz === ""
      this.validation.qualificationKz = !this.value.qualificationKz || this.value.qualificationKz === ""
      this.validation.experienceKz = !this.value.experienceKz || this.value.experienceKz === ""
      this.validation.languageLevelKz = !this.value.languageLevelKz || this.value.languageLevelKz === ""
      this.validation.certificateRequirementsKz = !this.value.certificateRequirementsKz || this.value.certificateRequirementsKz === ""
      this.validation.personalQualitiesKz = !this.value.personalQualitiesKz || this.value.personalQualitiesKz === ""
      this.validation.workConditionKz = !this.value.workConditionKz || this.value.workConditionKz === ""


      this.validation.nameRu = !this.value.nameRu || this.value.nameRu === ""
      this.validation.responsibilitiesRu = !this.value.responsibilitiesRu || this.value.responsibilitiesRu === ""
      this.validation.educationRu = !this.value.educationRu || this.value.educationRu === ""
      this.validation.qualificationRu = !this.value.qualificationRu || this.value.qualificationRu === ""
      this.validation.experienceRu = !this.value.experienceRu || this.value.experienceRu === ""
      this.validation.languageLevelRu = !this.value.languageLevelRu || this.value.languageLevelRu === ""
      this.validation.certificateRequirementsRu = !this.value.certificateRequirementsRu || this.value.certificateRequirementsRu === ""
      this.validation.personalQualitiesRu = !this.value.personalQualitiesRu || this.value.personalQualitiesRu === ""
      this.validation.workConditionRu = !this.value.workConditionRu || this.value.workConditionRu === ""


      this.validation.nameEn = !this.value.nameEn || this.value.nameEn === ""
      this.validation.responsibilitiesEn = !this.value.responsibilitiesEn || this.value.responsibilitiesEn === ""
      this.validation.educationEn = !this.value.educationEn || this.value.educationEn === ""
      this.validation.qualificationEn = !this.value.qualificationEn || this.value.qualificationEn === ""
      this.validation.experienceEn = !this.value.experienceEn || this.value.experienceEn === ""
      this.validation.languageLevelEn = !this.value.languageLevelEn || this.value.languageLevelEn === ""
      this.validation.certificateRequirementsEn = !this.value.certificateRequirementsEn || this.value.certificateRequirementsEn === ""
      this.validation.personalQualitiesEn = !this.value.personalQualitiesEn || this.value.personalQualitiesEn === ""
      this.validation.workConditionEn = !this.value.workConditionEn || this.value.workConditionEn === ""


      return (
          !this.validation.organization && !this.validation.department &&
          !this.validation.head && !this.validation.deadline &&
          !this.validation.nameKz && !this.validation.responsibilitiesKz &&
          !this.validation.educationKz && !this.validation.qualificationKz &&
          !this.validation.experienceKz && !this.validation.languageLevelKz &&
          !this.validation.certificateRequirementsKz && !this.validation.personalQualitiesKz &&
          !this.validation.workConditionKz &&
          !this.validation.nameRu && !this.validation.responsibilitiesRu &&
          !this.validation.educationRu && !this.validation.qualificationRu &&
          !this.validation.experienceRu && !this.validation.languageLevelRu &&
          !this.validation.certificateRequirementsRu && !this.validation.personalQualitiesRu &&
          !this.validation.workConditionRu &&
          !this.validation.nameEn && !this.validation.responsibilitiesEn &&
          !this.validation.educationEn && !this.validation.qualificationEn &&
          !this.validation.experienceEn && !this.validation.languageLevelEn &&
          !this.validation.certificateRequirementsEn && !this.validation.personalQualitiesEn &&
          !this.validation.workConditionEn
      )
    },

  },
  created() {
    this.vacancyService = new VacancyService()
    this.head = this.modelValue.departmentHead === undefined ? null : [this.modelValue.departmentHead]
    this.checkAction()
    this.loginedUser = this.$store.state.loginedUser;
    var request = {
      page: 0,
      rows: 1,
      sortLang: this.$i18n.locale,
      orgID: this.loginedUser.mainPosition.organization.id
    }
    if (this.modelValue.organization === undefined) {
      api
          .post("/contragent/organizations", request, {headers: getHeader()})
          .then((res) => {
            if (res.data.organizations && res.data.organizations.length > 0) {
              this.$refs.contragent.setValue(res.data.organizations[0])
              if (res.data.organizations[0].chief) {
                this.head = []
                this.head.push(res.data.organizations[0].chief)
                this.$refs.departmentList.getDepartments(res.data.organizations[0].id);

              }
            }

          });
    }
  },
  mounted() {
    this.emitter.on('changeOrg', (data) => {
      this.getDepartments(data, this.$refs.departmentList);

    });
  }
};
</script>

<style>
#carddiv label {
  position: inherit;
}
</style>
