<template>
  <div id="carddiv" class="p-grid">
    <div class="p-col-12">
      <h3>Создание и редактирование вакансии</h3>
      <div>
        <Menubar :model="menu" :key="active"
                 style="height:36px;margin-top:-7px;margin-left:-14px;margin-right:-14px"></Menubar>
      </div>
    </div>
    <div class="p-col-12 p-md-12 p-fluid">
      <div class="card">
        <div class="p-grid p-formgrid">
          <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
            <label>{{ this.$t("common.organizationNameLabel") }}</label>
            <ContragentSelectOrg v-model="value.organization"/>
          </div>
          <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
            <label>{{ this.$t("common.departmentNameLabel") }}</label>
            <DepartmentList v-model="value.department"></DepartmentList>
          </div>
          <div class="p-field p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
            <label>{{ this.$t("common.headLabel") }}</label>
            <FindUser v-model="head" :max="1" :editMode="false"></FindUser>
          </div>
          <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
            <label>Срок подачи документов</label>
            <PrimeCalendar
                :readonly="readonly"
                class="p-mt-2"
                v-model="value.deadline"
                dateFormat="dd.mm.yy"/>
          </div>
        </div>
        <TabView>
          <TabPanel header="Қазақша">
            <div class="p-field">
              <label for="kazname">Атауы</label>
              <InputText
                  id="kazname"
                  :readonly="readonly"
                  class="p-mt-2"
                  type="text"
                  placeholder="Атауы"
                  v-model="value.nameKz"
              ></InputText>
            </div>
            <div class="p-field">
              <label for="kazname">Функционалдық міндеттері</label>
              <Editor v-model="value.responsibilitiesKz" editorStyle="height: 120px"/>
            </div>
            <div class="p-field">
              <label for="kazname">Білімі</label>
              <Editor v-model="value.educationKz" editorStyle="height: 120px"/>
            </div>
            <div class="p-field">
              <label for="kazname">Мамандығы бойынша біліктілігі</label>
              <Editor v-model="value.qualificationKz" editorStyle="height: 120px"/>
            </div>
            <div class="p-field">
              <label for="kazname">Қажетті кәсіби тәжірибесі</label>
              <Editor v-model="value.experienceKz" editorStyle="height: 120px"/>
            </div>
            <div class="p-field">
              <label for="kazname">Тілдерді меңгеру деңгейі</label>
              <Editor v-model="value.languageLevelKz" editorStyle="height: 120px"/>
            </div>
            <div class="p-field">
              <label for="kazname">Сертификаттардың, дипломдардың болуы</label>
              <Editor v-model="value.certificateRequirementsKz" editorStyle="height: 120px"/>
            </div>
            <div class="p-field">
              <label for="kazname">Жеке қасиеттері</label>
              <Editor v-model="value.personalQualitiesKz" editorStyle="height: 120px"/>
            </div>
          </TabPanel>
          <TabPanel header="Русский">
            <div class="p-field">
              <label for="kazname">Наименование</label>
              <InputText
                  id="kazname"
                  :readonly="readonly"
                  class="p-mt-2"
                  type="text"
                  placeholder="Наименование"
                  v-model="value.nameRu"
              ></InputText>
            </div>
            <div class="p-field">
              <label for="kazname">Функциональные обязанности</label>
              <Editor v-model="value.responsibilitiesRu" editorStyle="height: 120px"/>
            </div>
            <div class="p-field">
              <label for="kazname">Образование</label>
              <Editor v-model="value.educationRu" editorStyle="height: 120px"/>
            </div>
            <div class="p-field">
              <label for="kazname">Квалификация по специальности</label>
              <Editor v-model="value.qualificationRu" editorStyle="height: 120px"/>
            </div>
            <div class="p-field">
              <label for="kazname">Требуемый опыт работы</label>
              <Editor v-model="value.experienceRu" editorStyle="height: 120px"/>
            </div>
            <div class="p-field">
              <label for="kazname">Уровень знания языков</label>
              <Editor v-model="value.languageLevelRu" editorStyle="height: 120px"/>
            </div>
            <div class="p-field">
              <label for="kazname">Наличие сертификатов и дипломов</label>
              <Editor v-model="value.certificateRequirementsRu" editorStyle="height: 120px"/>
            </div>
            <div class="p-field">
              <label for="kazname">Персональные качества</label>
              <Editor v-model="value.personalQualitiesRu" editorStyle="height: 120px"/>
            </div>
          </TabPanel>
          <TabPanel header="English">
            <div class="p-field">
              <label for="kazname">Name</label>
              <InputText
                  id="kazname"
                  :readonly="readonly"
                  class="p-mt-2"
                  type="text"
                  placeholder="Name"
                  v-model="value.nameEn"
              ></InputText>
            </div>
            <div class="p-field">
              <label for="kazname">Functional responsibilities</label>
              <Editor v-model="value.responsibilitiesEn" editorStyle="height: 120px"/>
            </div>
            <div class="p-field">
              <label for="kazname">Education</label>
              <Editor v-model="value.educationEn" editorStyle="height: 120px"/>
            </div>
            <div class="p-field">
              <label for="kazname">Qualification by specialty</label>
              <Editor v-model="value.qualificationEn" editorStyle="height: 120px"/>
            </div>
            <div class="p-field">
              <label for="kazname">Required work experience</label>
              <Editor v-model="value.experienceEn" editorStyle="height: 120px"/>
            </div>
            <div class="p-field">
              <label for="kazname">Language skills</label>
              <Editor v-model="value.languageLevelEn" editorStyle="height: 120px"/>
            </div>
            <div class="p-field">
              <label for="kazname">Availability of certificates and diplomas</label>
              <Editor v-model="value.certificateRequirementsEn" editorStyle="height: 120px"/>
            </div>
            <div class="p-field">
              <label for="kazname">Personal qualities</label>
              <Editor v-model="value.personalQualitiesEn" editorStyle="height: 120px"/>
            </div>
          </TabPanel>
        </TabView>
      </div>
    </div>
  </div>
</template>x
<script>
import ContragentSelectOrg from "../../contragent/ContragentSelectOrg";
import DepartmentList from "../../smartenu/DepartmentList";
import FindUser from "../../../helpers/FindUser";
import axios from "axios";
import {getHeader, smartEnuApi} from "@/config/config";

export default {
  components: {ContragentSelectOrg, DepartmentList, FindUser},
  data() {
    return {
      value: this.modelValue,
      head: null,
      active: null,
      menu: [
        {
          label: this.$t("common.save"),
          icon: "pi pi-fw pi-save",
          command: () => {
            this.vacancyAction()
          },
        },
      ],
    };
  },
  methods: {
    vacancyAction() {
      let path = this.value.id === undefined ? "/vacancy/add" : "/vacancy/update"
      this.value.departmentHead = this.head[0]

      console.log("VACANCY IS", this.value)
      axios
          .post(smartEnuApi + path, this.value, {headers: getHeader(),})
      .then(res => {
        this.emitter.emit("vacancyAdded", true);
        this.$toast.add({severity: 'info', summary: 'Success', detail: 'Вакансия успешно создана/обнавлена', life: 3000});
      }).catch(error => {
        console.log(error)
      });
    }
  },
  props: {
    modelValue: null,
    placeholder: String,
    readonly: Boolean,
  },
  created() {
    this.head = this.modelValue.departmentHead === undefined ? null : [this.modelValue.departmentHead]
  }
};
</script>
<style>
#carddiv label {
  position: inherit;
}
</style>
