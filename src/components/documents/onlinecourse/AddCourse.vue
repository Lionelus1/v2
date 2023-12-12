<template>
  <TitleBlock :title="$t('Курсты құру')" :show-back-button="true"/>
<div class="card m-0">
  <Button class="p-button-outlined mr-2" icon="pi pi-fw pi-download" :label="$t('common.save')" @click="save()"/>
  <Button class="p-button-outlined mr-2" icon="pi pi-fw pi-send" :label="$t('common.send')" @click="openDialog('sendToApprove')"/>
  <Button class="p-button-outlined" icon="pi pi-fw pi-check-circle" :label="$t('common.approvalList')"/>
</div>
  <div class="grid" v-if="formData">
    <div class="col-12 lg:col-8">
      <div class="card p-fluid mt-3">
        <div class="field mt-3">
          <label for="course-code">{{ $t("fieldEducation.title") }}</label>
          <Dropdown optionValue="id" placeholder="таңдаңыз" :options="dataFieldEducation" :optionLabel='"name_" + $i18n.locale'/>
        </div>
        <div class="field mt-3">
          <label for="course-code">{{ $t("web.degreeLevel") }}</label>
          <Dropdown optionValue="id" placeholder="таңдаңыз" :options="dataAcademicDegrees" :optionLabel='"name_" + $i18n.locale'/>
        </div>
        <div class="field">
          <label for="author">{{ $t("fieldEducation.courseAuthor") }}</label>
          <InputText disabled v-model="$store.state.loginedUser.fullName" id="author" rows="3"/>
        </div>
        <div class="field mt-3">
          <label for="course-code">{{ $t("common.learnlang") }}</label>
          <Dropdown @change="changeLang" placeholder="таңдаңыз" :options="listLang" option-label="lang" optionValue="id" v-model="formData.courceLanguageId"/>
          <small class="p-error" v-if="!formData.courceLanguageId && submitted">{{ $t("common.requiredField") }}</small>
        </div>
        <div class="field mt-3" v-if="!boolNameRu && !boolNameEn">
          <label for="course-name">{{ $t("fieldEducation.courseName") }}</label>
          <InputText id="course-name" v-model="formData.namekz" :disabled="disabledName"/>
          <small class="p-error" v-if="!formData.namekz && submitted">{{ $t("common.requiredField") }}</small>
        </div>
        <div class="field mt-3" v-if="boolNameRu">
          <label for="course-name">ru</label>
          <InputText id="course-name" v-model="formData.nameru" :disabled="disabledName"/>
          <small class="p-error" v-if="!formData.nameru && submitted">{{ $t("common.requiredField") }}</small>
        </div>
        <div class="field mt-3" v-if="boolNameEn">
          <label for="course-name">en</label>
          <InputText id="course-name" v-model="formData.nameen" :disabled="disabledName"/>
          <small class="p-error" v-if="!formData.nameen && submitted">{{ $t("common.requiredField") }}</small>
        </div>
        <div class="field mt-3">
          <label for="course-code">{{ $t("fieldEducation.courseCode") }}</label>
          <InputText id="course-code" v-model="formData.courseCode"/>
          <small class="p-error" v-if="!formData.courseCode && submitted">{{ $t("common.requiredField") }}</small>
        </div>

        <div class="field mt-3">
          <label for="course-code">{{ $t("fieldEducation.purposeCourse") }}</label>
          <Textarea id="course-code" rows="5"/>
        </div>
        <div class="field mt-3">
          <label for="course-code">{{ $t("fieldEducation.briefSummary") }}</label>
          <Textarea id="course-code" rows="3"/>
        </div>

      </div>
    </div>
    <div class="col-12 lg:col-4">
      <div class="p-fluid mt-3">
        <div class="card field">
          <label for="course-code">{{ $t("fieldEducation.duration") }}</label>
          <InputText id="course-code"/>
<!--          <PrimeCalendar v-model="date" selection-mode="range" :manualInput="true" dateFormat="dd.mm.yy" :showIcon="true"/>-->
        </div>
        <div class="field mt-3">
          <Fieldset :legend="$t('fieldEducation.trainingFormat')">
              <div class="field-radiobutton">
                <RadioButton inputId="blockType1" name="blockType"/>
                <label for="blockType1">{{ $t('Онлайн') }}</label>
              </div>
              <div class="field-radiobutton">
                <RadioButton inputId="blockType2"/>
                <label for="blockType2">{{ $t('Оффлайн') }}</label>
              </div>
            <div class="field-radiobutton m-0">
              <RadioButton inputId="blockType2"/>
              <label for="blockType2">{{ $t('Смешанный') }}</label>
            </div>
          </Fieldset>
        </div>
        <div class="card field mt-3">
          <label for="course-code">{{ $t("common.image") }}</label>
          <div class="post-select-image-container">
            <div class="btn-select-image" >
              <div class="btn-select-image-inner">
                <i class="fa-regular fa-image"></i>
                <FileUpload ref="form" mode="basic" :customUpload="true"
                            :auto="true" v-bind:chooseLabel="$t('common.choose')" accept="image/*"
                            class="p-button-outlined" />
              </div>
            </div>
          </div>
        </div>

        <div class="card field mt-3">
          <label for="course-code">{{ $t("fieldEducation.prerequisites") }}</label>
          <Dropdown placeholder="таңдаңыз" />
          <Button :label="$t('fieldEducation.addPrerequisite')" class="p-button-outlined p-button-sm w-fit mt-2 mb-4" icon="pi pi-plus-circle"/>
          <br>
          <label for="course-code">{{ $t("fieldEducation.postrequisites") }}</label>
          <Dropdown placeholder="таңдаңыз" />
          <Button :label="$t('fieldEducation.addPostrequisite')" class="p-button-outlined p-button-sm w-fit mt-2" icon="pi pi-plus-circle"/>
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
const {t, locale} = useI18n()

const date = ref();
const toast = useToast();
const i18n = useI18n();
const formData = ref({})
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
const approveComponentKey =  ref(0)
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
const dataAcademicDegrees = ref([])
const disabledName = ref(true)
const boolNameRu = ref(false)
const boolNameEn = ref(false)
const listLang = ref([
  {id:1, lang: 'kz'},
  {id:2, lang: 'ru'},
  {id:3, lang: 'en'},
])

const getFieldEducation = () => {
      service.getFieldEducation().then(response => {
        dataFieldEducation.value = response.data
        //this.total = response.data.total
        //this.loading = false
      }).catch(_=> {
        //this.loading = false
      });
}
getFieldEducation()

const getEduAcademicDegrees = () => {
  service.getEduAcademicDegrees().then(response => {
    dataAcademicDegrees.value = response.data
    //this.total = response.data.total
    //this.loading = false
  }).catch(_=> {
    //this.loading = false
  });
}
getEduAcademicDegrees()
const save = () => {
  submitted.value = true
  if (!isValid()) return;
  toast.add({
    severity: "success",
    summary: i18n.t("common.success"),
    life: 3000,
  });
}

const isValid = () => {
  let errors = [];
  if (!formData.value.namekz || !formData.value.nameru || !formData.value.nameen) {
    errors.push(1);
  }
  if (!formData.value.courseCode) {
    errors.push(1);
  }
  if (!formData.value.courceLanguageId) {
    errors.push(1);
  }
  return errors.length === 0;
}
const changeLang = (event) => {
  if(event.value=== 2){
    boolNameRu.value = true
  }
  if(event.value=== 3){
    boolNameEn.value = true
  }
  disabledName.value = false
}
const approve = (event)=> {
  approving.value = true;
    toast.add({
      severity: "success",
      summary: this.$t('common.message.succesSendToApproval'),
      life: 3000,
    });
    closeDialog("sendToApprove");
    this.approving = false;
}

const openDialog = (dialog)=> {
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
}
</style>