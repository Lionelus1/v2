<template>
  <TitleBlock :title="$t('fieldEducation.addCourse')" :show-back-button="true"/>
<!--  <div class="card m-0">
    <Button class="p-button-outlined mr-2 mb-2 sm:mb-0" icon="pi pi-fw pi-download" :label="$t('common.save')" @click="save()"/>
    <Button class="p-button-outlined mr-2  mb-2 sm:mb-0" icon="pi pi-fw pi-send" :label="$t('common.send')" :disabled="disabledSend" @click="openDialog('sendToApprove')"/>
    <Button class="p-button-outlined" icon="pi pi-fw pi-check-circle" :disabled="disabledApproval" :label="$t('common.approvalList')"/>
  </div>-->
  <ToolbarMenu :items="items"/>
  <div class="grid" v-if="formData">
    <div class="col-12 lg:col-8">
      <div class="card p-fluid mt-3">
        <div class="field mt-3">
          <label for="course-code">{{ $t("fieldEducation.title") }}</label>
          <Dropdown optionValue="id" :placeholder="$t('common.select')" :options="dataFieldEducation" :optionLabel='"name_" + $i18n.locale'
                    v-model="formData.eduFieldsId" disabled/>
          <small class="p-error" v-if="!formData.eduFieldsId && submitted">{{ $t("common.requiredField") }}</small>
        </div>
        <div class="field">
          <label for="author">{{ $t("fieldEducation.courseAuthor") }}</label>
          <InputText disabled v-model="fullName" id="author" rows="3"/>
        </div>
        <div class="field mt-3">
          <label for="course-code">{{ $t("web.degreeLevel") }}</label>
          <Dropdown optionValue="id" :placeholder="$t('common.select')" :options="dataAcademicDegrees" :optionLabel='"name_" + $i18n.locale'
                    v-model="formData.academicDegreeId"/>
<!--          <small class="p-error" v-if="!formData.academicDegreeId && submitted">{{ $t("common.requiredField") }}</small>-->
        </div>
        <div class="field mt-3">
          <label for="course-code">{{ $t("common.learnlang") }}</label>
          <Dropdown @change="changeLang" :placeholder="$t('common.select')" :options="listLang" option-label="lang" optionValue="id"
                    v-model="formData.courceLanguageId"/>
          <small class="p-error" v-if="!formData.courceLanguageId && submitted">{{ $t("common.requiredField") }}</small>
        </div>
        <div class="field mt-3">
          <label for="course-name">{{ $t("fieldEducation.courseName") }}</label>
          <InputText v-if="formData.courceLanguageId === 1" v-model="formData.namekz" />
          <InputText v-if="formData.courceLanguageId === 2" v-model="formData.nameru" />
          <InputText v-if="formData.courceLanguageId === 3" v-model="formData.nameen" />
          <small class="p-error" v-if="formData.courceLanguageId === 1 && !formData.namekz && submitted">{{ $t("common.requiredField") }}</small>
          <small class="p-error" v-if="formData.courceLanguageId === 2 && !formData.nameru && submitted">{{ $t("common.requiredField") }}</small>
          <small class="p-error" v-if="formData.courceLanguageId === 3 && !formData.nameen && submitted">{{ $t("common.requiredField") }}</small>
        </div>
        <div class="field mt-3">
          <label for="course-code">{{ $t("fieldEducation.courseCode") }}</label>
          <InputText id="course-code" v-model="formData.courseCode"/>
          <small class="p-error" v-if="!formData.courseCode && submitted">{{ $t("common.requiredField") }}</small>
        </div>

        <div class="field mt-3">
          <label for="course-code">{{ $t("fieldEducation.purposeCourse") }}</label>
          <Textarea v-if="formData.courceLanguageId === 1" rows="5" v-model="formData.descriptionkz"/>
          <Textarea v-if="formData.courceLanguageId === 2" rows="5" v-model="formData.descriptionru"/>
          <Textarea v-if="formData.courceLanguageId === 3" rows="5" v-model="formData.descriptionen"/>
          <small class="p-error" v-if="formData.courceLanguageId === 1 && !formData.descriptionkz && submitted">{{ $t("common.requiredField") }}</small>
          <small class="p-error" v-if="formData.courceLanguageId === 2 && !formData.descriptionru && submitted">{{ $t("common.requiredField") }}</small>
          <small class="p-error" v-if="formData.courceLanguageId === 3 && !formData.descriptionen && submitted">{{ $t("common.requiredField") }}</small>
        </div>
        <div class="field mt-3">
          <label for="course-code">{{ $t("fieldEducation.briefSummary") }}</label>
          <Textarea v-if="formData.courceLanguageId === 1" rows="3" v-model="formData.annotationKz"/>
          <Textarea v-if="formData.courceLanguageId === 2" rows="3" v-model="formData.annotationRu"/>
          <Textarea v-if="formData.courceLanguageId === 3" rows="3" v-model="formData.annotationEN"/>
          <small class="p-error" v-if="formData.courceLanguageId === 1 && !formData.annotationKz && submitted">{{ $t("common.requiredField") }}</small>
          <small class="p-error" v-if="formData.courceLanguageId === 2 && !formData.annotationRu && submitted">{{ $t("common.requiredField") }}</small>
          <small class="p-error" v-if="formData.courceLanguageId === 3 && !formData.annotationEN && submitted">{{ $t("common.requiredField") }}</small>
        </div>
      </div>
    </div>
    <div class="col-12 lg:col-4">
      <div class="p-fluid mt-3">
        <div class="card field">
          <label for="course-code">{{ $t("fieldEducation.duration") }}</label>
          <InputNumber type="number" v-model="formData.hours"/>
          <small class="p-error" v-if="!formData.hours && submitted">{{ $t("common.requiredField") }}</small>
          <!--          <PrimeCalendar v-model="date" selection-mode="range" :manualInput="true" dateFormat="dd.mm.yy" :showIcon="true"/>-->
        </div>
        <div class="field mt-3">
          <Fieldset :legend="$t('fieldEducation.trainingFormat')">
            <div class="field-radiobutton">
              <RadioButton inputId="radio1" :value="1" v-model="formData.courseType"/>
              <label for="radio1">{{ $t('fieldEducation.online') }}</label>
            </div>
            <div class="field-radiobutton">
              <RadioButton inputId="radio2" :value="2" v-model="formData.courseType"/>
              <label for="radio2">{{ $t('fieldEducation.offline') }}</label>
            </div>
            <div class="field-radiobutton m-0">
              <RadioButton inputId="radio3" :value="3" v-model="formData.courseType"/>
              <label for="radio3">{{ $t('fieldEducation.mixed') }}</label>
            </div>
          </Fieldset>
          <small class="p-error" v-if="!formData.courseType && submitted">{{ $t("common.requiredField") }}</small>
        </div>
        <div class="card field mt-3">
          <label for="course-code">{{ $t("common.image") }}</label>
          <div class="post-select-image-container" v-if="!imagePreviewUrl">
            <div class="btn-select-image">
              <div class="btn-select-image-inner">
                <i class="fa-regular fa-image"></i>
                <CustomFileUpload @upload="handleFileChange($event)" v-model="abstractFile" :button="true" :multiple="false"/>
              </div>
            </div>
          </div>
          <small class="p-error" v-if="(!imagePreviewUrl && !abstractFile && submitted)">{{ $t('common.requiredField')}}</small>
          <div v-if="imagePreviewUrl" class="news-image-container mt-2">
            <img :src="imagePreviewUrl" alt="Preview"/>
            <span class="btn-remove-image p-button p-button-danger p-button-sm" @click="delImg()">
              <i class="fa-solid fa-xmark"></i>
            </span>
          </div>
        </div>
        <div class="card field mt-3">
          <div class="flex align-items-center mb-4">
            <label class="mr-2">{{ $t('course.certificate.certSelect') }}</label>
            <Checkbox v-model="checkedCertificate" :binary="true" />
          </div>
          <Dropdown :disabled="!checkedCertificate" v-model="formData.certificate_template_id" :options="journal" class="mt-2" optionLabel="name" optionValue="id" :placeholder="$t('common.select')"
                    @filter="handleFilter" :filter="true" :showClear="true" dataKey="id" :emptyFilterMessage="$t('roleControl.noResult')"  />
          <small v-if="checkedCertificate && !formData.certificate_template_id && submitted"  class="p-error">{{$t('common.requiredField')}}</small>
        </div>
        <div class="card field mt-3">
          <label for="course-code">{{ $t("fieldEducation.prerequisites") }}</label>
          <Dropdown optionValue="id" :placeholder="$t('common.select')" :options="dataRequisites" :optionLabel='"name" + $i18n.locale'
                    v-model="formData.prerequisitesId"/>
<!--          <Button :label="$t('fieldEducation.addPrerequisite')" class="p-button-outlined p-button-sm w-fit mt-2 mb-4" icon="pi pi-plus-circle"/>-->
          <br>
          <label for="course-code">{{ $t("fieldEducation.postrequisites") }}</label>
          <Dropdown optionValue="id" :placeholder="$t('common.select')" :options="dataRequisites" :optionLabel='"name" + $i18n.locale'
                    v-model="formData.postRequisitesId"/>
<!--          <Button :label="$t('fieldEducation.addPostrequisite')" class="p-button-outlined p-button-sm w-fit mt-2" icon="pi pi-plus-circle"/>-->
        </div>
      </div>
    </div>
  </div>
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
import {ref} from "vue";
import {useI18n} from "vue-i18n";
import {useToast} from "primevue/usetoast";
import ApprovalUsers from "@/components/ncasigner/ApprovalUsers/ApprovalUsers.vue";
import {OnlineCourseService} from "@/service/onlinecourse.service";
import CustomFileUpload from "@/components/CustomFileUpload.vue";
import {useRoute, useRouter} from "vue-router";
import {useStore} from "vuex";
import {fileRoute, findRole, smartEnuApi} from "@/config/config";
import ToolbarMenu from "@/components/ToolbarMenu.vue";

const {t, locale} = useI18n()
const route = useRoute()
const router = useRouter()
const store = useStore()
const toast = useToast();
const i18n = useI18n();
const courseId = route.params.courseId ? parseInt(route.params.courseId) : null
const formData = ref({})
formData.value.eduFieldsId = parseInt(route.params.fieldId)
formData.value.courceLanguageId = 1
formData.value.autorId = store.state.loginedUser.userID
const submitted = ref(false)
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
const approveComponentKey = ref(0)
const approving = ref(false)
const stages = ref(null)
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
const service = new OnlineCourseService()
const dataFieldEducation = ref([])
const dataRequisites = ref([])
const dataAcademicDegrees = ref([])
const disabledName = ref(true)
const disabledSend = ref(true)
const disabledApproval = ref(true)
const abstractFile = ref(null)
const imagePreviewUrl = ref(null)
const journal = ref(null)
const listLang = ref([
  {id: 1, lang: 'Қазақша'},
  {id: 2, lang: 'На русском'},
  {id: 3, lang: 'In English'},
])
const lazyParams = {
  page: 0,
  rows: 10,
  searchText: null,
}
const checkedCertificate = ref(false)
const fullName = store.state.loginedUser.thirdName + ' ' + store.state.loginedUser.firstName + ' ' + store.state.loginedUser.lastName
const items = ref([
  {
    label: t("common.save"),
    icon: "pi pi-fw pi-save",
    command: () => {  save()},
  },
  {
    label: t("common.send"),
    icon: "pi pi-fw pi-send",
    disabled: disabledSend,
    command: ()=> { openDialog('sendToApprove') },
  },
  {
    label: t("common.approvalList"),
    icon: "pi pi-fw  pi-check-circle",
    disabled: disabledApproval,
    //command: null,
  },
/*  {
    label: t("Какой то текст"),
    icon: "pi pi-fw  pi-check",
  },
  {
    label: "Тестовый тест",
    icon: "pi pi-fw  pi-cog",
  },*/
])

const handleFileChange = (event) => {
  abstractFile.value = event.files[0];
  const file = event.files[0];
  if (file) {
    previewImage(file);
  }
}
const previewImage = (file) => {
  imagePreviewUrl.value = URL.createObjectURL(file);
}

const delImg = () => {
  imagePreviewUrl.value = URL.revokeObjectURL
  imagePreviewUrl.value = null
}

const getCourseById = () => {
  if (courseId){
    service.getCourseById(courseId).then(response => {
      formData.value = response.data[0]
      formData.value.eduFieldsId = parseInt(route.params.fieldId)
      formData.value.autorId = response.data.autorId
      imagePreviewUrl.value = smartEnuApi + fileRoute + response.data[0].logo
      //formData.value.courceLanguageId = 1
    }).catch(_ => {
    });
  }
}
getCourseById()
const getRequisites = () => {
  const req = {
    page: 0,
    rows: 10,
  }
  service.getCourses(req).then(response => {
    dataRequisites.value = response.data.courses
  }).catch(_ => {
  });
}
getRequisites()
const getFieldEducation = () => {
  service.getFieldEducation().then(response => {
    dataFieldEducation.value = response.data
  }).catch(_ => {
  });
}
getFieldEducation()

const getEduAcademicDegrees = () => {
  service.getEduAcademicDegrees().then(response => {
    dataAcademicDegrees.value = response.data
  }).catch(_ => {
  });
}
getEduAcademicDegrees()
const save = () => {
  submitted.value = true
  /*if(courseId) {
    abstractFile.value = imagePreviewUrl.value
  }*/
  if (!isValid()) return;
  formData.value.id = courseId? courseId : 0
  formData.value.categoryId = 1
  formData.value.start_time = new Date().toISOString()
  formData.value.final_date = new Date().toISOString()
  let data = new FormData()
  if (abstractFile.value) {
    data.append("abstractFile", abstractFile.value);
  }
  data.append("course", JSON.stringify(formData.value));
  service.createCourse(data).then(res => {
    router.back()
    toast.add({
      severity: "success",
      summary: i18n.t("common.success"),
      life: 3000,
    });
    imagePreviewUrl.value = URL.revokeObjectURL
    formData.value = null
  }).catch(error => {
    toast.add({severity: "error", summary: error, life: 3000});
  });
}

const isValid = () => {
  let langId = formData.value.courceLanguageId
  let lang = langId === 1 ? "kz" : langId === 2 ? "ru" : "en"
  let errors = [];
  if (!formData.value['name' + lang]) {
    errors.push(1);
  }
  if (!courseId && !abstractFile.value) {
    errors.push(1);
  }
  if (!formData.value.courseCode) {
    errors.push(1);
  }
  if (!formData.value.courceLanguageId) {
    errors.push(1);
  }
  if (!formData.value['description' + lang]) {
    errors.push(1);
  }
  if ((!formData.value.annotationKz && langId ===1) || (!formData.value.annotationRu && langId ===2) || (!formData.value.annotationEN && langId ===3)  ) {
    errors.push(1);
  }
  if (!formData.value.hours) {
    errors.push(1);
  }
  if(checkedCertificate.value && !formData.value.certificate_template_id){
    errors.push(1);
  }
  return errors.length === 0;
}
const getJournal = () => {
  lazyParams.docType = 7
  service.getCertificateTemplateJournal(lazyParams).then(response =>{
    journal.value = response.data.templates;
  }).catch(_=> {
  }).finally(() => {
  })
}
getJournal()

const handleFilter = (event) => {
  if (event.value && event.value.length > 3) {
    lazyParams.searchText = event.value
    getJournal()
  } else if (lazyParams.searchText.length > 3) {
    lazyParams.searchText = null
    getJournal()
  }
}
const changeLang = (event) => {
  disabledName.value = false
}
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
</script>


<style lang="scss" scoped>

.post-select-image-container {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  margin-bottom: 15px;
  border-radius: 2px;
}

.btn-select-image {
  position: relative;
  display: block;
  overflow: hidden;
  text-align: center;
  background: #f8f9fb;
  border: 2px dashed #e4e5e7;
  border-radius: 3px;
  cursor: pointer;
}

.post-select-image-container .btn-select-image {
  width: 100%;
  height: 200px;
}

.btn-select-image .btn-select-image-inner {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  flex-direction: column;
}

.btn-select-image svg {
  display: block;
  font-size: 48px;
  line-height: 48px;
  color: #dadbdd;
  margin-bottom: 15px;
}

.news-image-container {
  position: relative;
  width: 100%;
  max-width: 280px;
  overflow: hidden;
  margin-bottom: 15px;
  border-radius: 2px;
}

.news-image-container img {
  display: block;
  height: auto;
  width: 280px;
  min-width: 100%;
}

.btn-remove-image {
  font-size: 12px;
  position: absolute;
  right: 0;
  top: 0;
  color: #fff;
  cursor: pointer;
  width: fit-content;
}
</style>