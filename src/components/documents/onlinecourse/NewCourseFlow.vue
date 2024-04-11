
<template>
  <div class="col-12">
    <h3 v-if="course && course.id !== null && course.id > 0">Создать новый поток</h3>
    <h3 v-else>Создать новый курс и новый поток</h3>
    <div>
      <Menubar :model="menu" :key="active" style="height:36px;margin-top:-7px;margin-left:-14px;margin-right:-14px"></Menubar>
    </div>
  </div>

  <div class="col-12 md:col-12 p-fluid">
    <div class="card">
      <div class="grid formgrid">
        <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
          <label>{{ t('common.nameInQazaq') }}</label>
          <InputText :placeholder="t('common.nameInQazaq')" v-model="course.namekz" class="mt-2" type="text"></InputText>
          <small v-if="courseValidate.namekz" class="p-error">{{t('common.requiredField')}}</small>
        </div>
        <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
          <label>{{ t('common.descriptionKz') }}</label>
          <InputText :placeholder="t('common.descriptionKz')" v-model="course.descriptionkz" class="mt-2" type="text"></InputText>
          <small v-if="courseValidate.descriptionkz" class="p-error">{{t('common.requiredField')}}</small>
        </div>
        <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
          <label>{{ t('common.nameInRussian') }}</label>
          <InputText :placeholder="t('common.nameInRussian')" v-model="course.nameru" class="mt-2" type="text"></InputText>
          <small v-if="courseValidate.nameru" class="p-error">{{t('common.requiredField')}}</small>
        </div>
        <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
          <label>{{ t('common.descriptionRu') }}</label>
          <InputText :placeholder="t('common.descriptionRu')" v-model="course.descriptionru" class="mt-2" type="text"></InputText>
          <small v-if="courseValidate.descriptionru" class="p-error">{{t('common.requiredField')}}</small>
        </div>
        <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
          <label>{{ t('common.nameInEnglish') }}</label>
          <InputText :placeholder="t('common.nameInEnglish')" v-model="course.nameen" class="mt-2" type="text"></InputText>
          <small v-if="courseValidate.nameen" class="p-error">{{t('common.requiredField')}}</small>
        </div>
        <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
          <label>{{ t('common.descriptionEn') }}</label>
          <InputText :placeholder="t('common.descriptionEn')" v-model="course.descriptionen" class="mt-2" type="text"></InputText>
          <small v-if="courseValidate.descriptionen" class="p-error">{{t('common.requiredField')}}</small>
        </div>
        <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
          <label>{{ t('course.startDate') }}</label>
          <PrimeCalendar v-model="course.history[0].startDate"  class="mt-2" :placeholder="t('course.startDate')" dateFormat="dd.mm.yy"/>
          <small v-if="courseValidate.start_time" class="p-error">{{ t("common.requiredField") }}</small>
        </div>
        <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
          <label>{{ t('course.completionDate') }}</label>
          <PrimeCalendar v-model="course.history[0].finalDate"  class="mt-2" :placeholder="t('course.completionDate')" dateFormat="dd.mm.yy"/>
          <small v-if="courseValidate.final_date" class="p-error">{{ t("common.requiredField") }}</small>
        </div>
        <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
          <label class="mr-2">{{ t('Тип модуля') }}</label>
          <Checkbox v-model="checkedHours" :binary="true" />
          <Dropdown :disabled="!checkedHours" v-model="course.duration_type" :options="durationTypeOptions" :placeholder="t('common.select')" class="mt-2" :optionLabel="['name_'+locale]" />
          <InputNumber :placeholder="course.duration_type.name && course.duration_type.name === 'hours' ? t('course.moduleHours') : t('course.moduleCredits')" :disabled="!checkedHours" v-model="course.hours" class="mt-2"></InputNumber>
          <small v-if="courseValidate.hours" class="p-error">{{ t('common.requiredField') }}</small>
        </div>
        <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
          <label class="mr-2">{{ t('course.certificate.certSelect') }}</label>
          <Checkbox v-model="checkedCertificate" :binary="true" />
          <Dropdown :disabled="!checkedCertificate" v-model="course.organizer.certificateTemplateID" :options="certificates" class="mt-2" :optionLabel="itemLabel" optionValue="id" :placeholder="t('common.select')"
                    @filter="handleFilter" :filter="true" :showClear="true" dataKey="id" :emptyFilterMessage="t('roleControl.noResult')"  />
          <small v-if="courseValidate.certificate_template_id"  class="p-error">{{t('common.requiredField')}}</small>
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
    const onlineCourseService = new OnlineCourseService
    const props = defineProps({
      propsCourse: {
        type: Object,
        default: Object,
      },
      getCourse: {
        type: Function,
        default: () => {},
      },
      closeSideBar: {
        type: Function,
        default: () => {}
      },
      courseState: {
        type: Number,
        default: null
      },
      propsCategoryID: {
        type: Number,
        default: null
      }
    })
    const students = ref([])
    const student = ref(null)
    const total = ref(0)
    const course = ref(props.propsCourse)
    const searchText = ref(null)
    const selectedDurationType = ref(null)
    const dic_course_type = ref(0)
    const certificateLazyParams = ref(
    {
      page: 0,
      rows: 50,
      searchText: null,
      docType: 7
    })
    const addStudentDialog = ref(false)
    const organizer = ref(null)
    const issueCertificateWithDialog = ref(false)
    const journal = ref(null)
    const journalVisible = ref(false)
    const userID = ref(0)
    const qrUrl = ref(null)
    const qrVisible = ref(false)
    const student_registered_count = ref(0)
    const student_completed_count = ref(0)
    const grade_count = ref(0)
    const actionsNode = ref(null)
    const newUsers = ref([])
    const submitted = ref(false)
    const courseValidate = ref({
      namekz: false,
      nameru: false,
      nameen: false,
      descriptionkz: false,
      descriptionru: false,
      descriptionen: false,
      hours: false,
      certificate_template_id: false,
      start_time: false,
      final_date: false,
      category_id: false
    })
    const checkedCertificate = ref(false)
    const checkedHours =  ref(false)
    const courseDialog = ref(false)
    const openIssueCertificate = ref(false)
    const isGrade = ref(false)
    const courseType = {
      common: "common",
      ged: "ged",
      educational: "educational",
      not_formal_education: "not_formal_education"
    }
    const menu= ref([
      {
        label: t("common.save"),
        icon: "pi pi-fw pi-save",
        command: () => {
          updateCourseState(props.courseState)
        },
        disabled: () => !(course.value.namekz) || !(course.value.nameru) || !(course.value.nameen) ||
            !(course.value.descriptionen) || !(course.value.descriptionru) || !(course.value.descriptionkz) ||
            !(course.value.history && course.value.history[0].startDate) || !(course.value.history && course.value.history[0].finalDate) ||
            (checkedHours.value && course.value.hours <= 0) || (checkedCertificate.value && course.value.organizer.certificateTemplateID === null) ||
            !(course.value.duration_type)
      },
    ])
    const certificates = ref([])

    const durationTypeOptions = [
      {
        id: 1, name: "hours", name_kz: "сағат", name_ru: "часы", name_en: "hours"
      },
      {
        id:2, name:"credits", name_kz: "кредиты", name_ru:"кредиты", name_en:"credits"
      }
    ] 


    const showMessage = (msgtype, message, content, life) => {
      toast.add({
      severity: msgtype,
      summary: message,
      detail: content,
      life: life
      })
    }

    const updateCourseState = (stateID) => {
      console.log(course.value.duration_type.id)
      if (course.value.duration_type.id > 0) {
        const selectedOption = durationTypeOptions.find(option => option.id === course.value.duration_type.id);

        if (selectedOption) {
          course.value.duration_type = selectedOption;
        }
      }
      const req = {
        course: course.value,
        stateID: stateID,
        category_id: props.propsCategoryID
      }

      if(!validateCourse() && stateID !== 8) {
        return
      }

      loading.value = true
      onlineCourseService.createCourse(req).then(_ => {

        loading.value = false
      }).catch(_=> {
        loading.value = false;
        showMessage('error', t('common.message.actionError'), t('common.message.actionErrorContactAdmin'), 3000)
      }).finally(() => {
        props.closeSideBar()
      })
    }


    const validateCourse = () => {
      courseValidate.value.namekz = course.value.namekz === ''
      courseValidate.value.nameru = course.value.nameru === ''
      courseValidate.value.nameen = course.value.nameen === ''
      courseValidate.value.descriptionkz = course.value.descriptionkz === ''
      courseValidate.value.descriptionru = course.value.descriptionru === ''
      courseValidate.value.descriptionen = course.value.descriptionen === ''
      courseValidate.value.start_time = course.value && course.value.history && course.value.history[0].startDate === null
      courseValidate.value.final_date = course.value && course.value.history && course.value.history[0].finalDate === null
      courseValidate.value.hours = (course.value.hours <= 0 && checkedHours.value)
      if (checkedCertificate.value) {
      courseValidate.value.certificate_template_id = course.value.organizer.certificateTemplateID === null
      } else {
      courseValidate.value.certificate_template_id = false
      course.value.certificate_template_id = null
      }

      return !courseValidate.value.namekz &&
      !courseValidate.value.nameru &&
      !courseValidate.value.nameen &&
      !courseValidate.value.descriptionkz &&
      !courseValidate.value.descriptionru &&
      !courseValidate.value.descriptionen &&
      !courseValidate.value.start_time &&
      !courseValidate.value.final_date &&
      !courseValidate.value.hours  &&
      !courseValidate.value.certificate_template_id
    }

    const   itemLabel = (item) =>{
      return item['name']
    }

    const getCertificateTemplateJournal = () => {
      loading.value = true;
      certificateLazyParams.value.docType = 7
      onlineCourseService.getCertificateTemplateJournal(certificateLazyParams.value).then(response =>{
        certificates.value = response.data.templates;
        total.value = response.data.count;
      }).catch(_=> {
      }).finally(() => {
        loading.value = false;
      })
    }

    const handleFilter = (event) => {
      if (event.value && event.value.length > 0) {
        certificateLazyParams.value.searchText = event.value
        getCertificateTemplateJournal()
      } else  {
        certificateLazyParams.value.searchText = null
        getCertificateTemplateJournal()
      }
    }

    const initializeCourseHistory = () => {
      if (course.value) {
        if (course.value.history && course.value.history.length > 0) {
          console.log('test - 1');
          course.value.history[0].startDate = null;
          course.value.history[0].finalDate = null;
        } else {
          console.log('test - 2');
          course.value.history = [{
            startDate: null,
            finalDate: null,
          }];
        }
      }
  
    };

    watch(selectedDurationType, (newVal) => {

      selectedDurationType.value = newVal !== 'credits';
    });

  onMounted( () => {
    initializeCourseHistory();
    getCertificateTemplateJournal()
  })
</script>

<style lang="scss">
.course_card{
  background: #293042;
  img{
    margin-right: 20px;
    width: 240px;
    height: 160px;
    object-fit: cover;
  }
}

@media (max-width: 500px) {
  .course_card{
    img{
      width: 100%;
    }
  }
}

.buttons-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.buttons-row {
  display: flex;
}

.delete-button {
  margin-left: auto;
}

</style>
