<template>

  <Button v-if="courseHistoryState !== 'inactive' && course && course.history && course.history[0] && course.history[0].stateID === 7 && (!students || students.length === 0) && dic_course_type === 1"
        class="btn mb-3" :label="t('hr.sp.request')" @click="sendRequestToCourse()"/>

  <DataTable class="p-datatable-sm" selectionMode="single" v-model:selection="student" :lazy="true"
    :totalRecords="total" :value="students"
    @page="onPage($event)" :first="lazyParams.first"
    :paginator="true" :rows="lazyParams.rows"
    dataKey="profile.userID" :rowHover="true" :loading="loading"
    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink JumpToPageDropdown CurrentPageReport RowsPerPageDropdown"
    :rowsPerPageOptions="[10, 25, 50]" :currentPageReportTemplate="t('common.showingRecordsCount', {
          first: '{first}',
          last: '{last}',
          totalRecords: '{totalRecords}',
      })" responsiveLayout="stack" breakpoint="480px">

    <template #header>
      <div class="table-header flex justify-content-between flex-wrap card-container purple-container">
          
        <div class="flex gap-2 flex-column sm:flex-row">
          <Button v-if="course && course.history && course.history[0] && course.history[0].stateID === 7 && courseHistoryState !== 'inactive' && findRole(null,'online_course_administrator') && dic_course_type === 1"
                  class="p-button-success mb-2" icon="pi pi-plus" :label="t('common.add')"
                  @click="addStudent"/>

          <Button v-if="course && course.history && course.history[0] && course.history[0].stateID === 7 && courseHistoryState !== 'inactive' && findRole(null,'online_course_administrator') && dic_course_type === 1"
                  class="p-button-help mb-2" icon="fa-solid fa-certificate"
                  :label="t('course.certificate.issue')" @click="openIssueCertificateDialog"/>

          <Button v-if="course && course.history && course.history[0] && course.history[0].stateID === 7 && courseHistoryState !== 'inactive' && findRole(null,'online_course_administrator') && dic_course_type === 1"
                  class="p-button-help mb-2" icon="fa-solid fa-file-circle-check"
                  :label="t('course.certificate.issueWithApp')"
                  @click="openIssueCertificateWithDialog"/>


                      
          <ActionButton v-if="courseHistoryState !== 'inactive' && findRole(null,'online_course_administrator') &&
          dic_course_type === 1" :show-label="true" :items="menu" @toggle="toggleAction(data)"></ActionButton>
        
      </div>
      <span v-if="findRole(null,'online_course_administrator')" class="p-input-icon-left">
          <i class="pi pi-search"/>
          <InputText type="search" v-model="searchText" @keyup.enter="getCourseHistoryStudents"  @search="getCourseHistoryStudents" :placeholder="t('common.search')"/>
      </span>

      </div>
    </template>
      
    <Column field="profile.fullName" :header="t('common.fullName')"></Column>
    
    <Column :field="'profile.mainPosition.department.name' + ($i18n.locale).charAt(0).toUpperCase() + ($i18n.locale).slice(1)" :header="t('common.department')"></Column>
    
    <Column :field="'state.name' + ($i18n.locale)" :header="t('common.status')"></Column>

    <Column header="">
          <template #body="slotProps">
            <div class="buttons-container">
              <div class="buttons-row">
                <Button v-if="courseHistoryState !== 'inactive' && slotProps.data.state.id === 1 && findRole(null,'online_course_administrator')"
                        class="p-button-success mr-3" icon="fa-solid fa-check"
                        v-tooltip.bottom="t('course.addCourse')" label=""
                        @click="updateUserState(slotProps.data.profile.userID, 2)"/>
                <Button v-if="slotProps.data.state.id !== 1 && dic_course_type === 1" class="p-button-success mr-3"
                        icon="fa-solid fa-list-check" v-tooltip.bottom="t('course.journal')" label=""
                        @click="userID=slotProps.data.profile.userID;openJournal(slotProps.data.profile.userID, slotProps.data.state.id)"/>
                <Button v-if="slotProps.data.certificateUUID" icon="fa-solid fa-award" class="mr-3"
                        v-tooltip.bottom="t('course.certificate.view')" label=""
                        @click="openCertificate(slotProps.data.certificateUUID)"/>
                <Button v-if="slotProps.data.certificateUUID" icon="pi pi-fw pi-qrcode"
                        class="p-button-help mr-3" v-tooltip.bottom="t('course.certificate.getQr')"
                        label="" @click="getQR(slotProps.data.certificateUUID)"/>
              </div>

              <div class="delete-button">
                <Button v-if="courseHistoryState !== 'inactive' && findRole(null,'online_course_administrator')" @click="deleteStudentConfirmationDialog(slotProps.data)" class="p-button-text p-button-danger p-1 trash-button" icon="fa-solid fa-trash-can fa-xl"/>
              </div>
            </div>
          </template>
    </Column>

  </DataTable>

  <!-- КУРС ҚАТЫСУШЫЛАР БАҒАСЫН ҚАРАУ -->
  <Sidebar
    v-model:visible="journalVisible"
    position="right"
    class="p-sidebar-lg"
    style="width: 50%;"
    @hide="closeJournal">
    <Card class="mt-3 mb-3">
        <template #content>
            <DataTable :value="journal">
                <Column field="name" :header="t('common.name')">
                    <template #body="slotProps">
                        {{ slotProps.data.module["name_" + $i18n.locale] }}
                    </template>
                </Column>
                <Column field="grade" :header="t('course.moduleGrade')">
                    <template #body="slotProps">
                        <InputNumber :disabled="!findRole(null,'online_course_administrator')" v-model="slotProps.data.grade"/>
                    </template>
                </Column>
                <Column field="hours" :header="t('course.moduleHours')">
                    <template #body="slotProps">
                        {{slotProps.data.module.hours}}
                    </template>
                </Column>
                <Column field="description" :header="t('common.description')">
                    <template #body="slotProps">
                        {{ slotProps.data.module["description_" + $i18n.locale] }}
                    </template>
                </Column>
            </DataTable>
        </template>
    </Card>
    <Button v-if="courseHistoryState !== 'inactive' && findRole(null,'online_course_administrator')" :label="t('common.save')" icon="pi pi-check" class="p-button p-component p-button-success mr-2"
            @click="updateJournal()"/>
    <Button v-if="courseHistoryState !== 'inactive' && findRole(null,'online_course_administrator') && stateID !== 5" :label="t('course.completedTraining')" icon="pi pi-check" class="p-button p-component mr-2"
            @click="updateUserState(userID, 4)" :disabled="!isGrade"/>
  </Sidebar>

  <!-- QR CODE ҚАРАУ -->
  <Sidebar v-model:visible="qrVisible"
             position="right"
             class="p-sidebar-lg">
        <QrGenerator :data="qrUrl" :showBackButton="false"/>
  </Sidebar>

  <!-- КУРС ҚАТЫСУШЫЛЫАРЫН ҚОСУ -->
  <Dialog v-model:visible="addStudentDialog" :style="{ width: '450px' }" :header="t('course.user')"
        :modal="true" class="p-fluid">
    <div class="field">
        <label for="newUsers">{{ t('common.fullName') }}</label>

        <FindUser id="newUsers" v-model="newUsers" userType="3"></FindUser>
        <small class="p-error" v-if="submitted && !(newUsers && newUsers.length > 0)">{{
            t('common.requiredField')
            }}</small>
    </div>
    <template #footer>
        <div class="flex flex-wrap row-gap-1">
            <Button :label="t('common.save')" @click="addStudentsToCourse(2)"
                    class="w-full p-button-primary"/>
            <Button :label="t('common.cancel')" @click="closeStudentDialog"
                    class="w-full p-button-secondary p-button-outlined"/>
        </div>

    </template>
  </Dialog>
  
  <!-- КУРСТЫ ЖАҢАРТУ  -->
  <Dialog v-if="course" v-model:visible="courseDialog" :style="{ width: '600px' }" :header="t('course.course')" :modal="true" class="p-fluid">
    <div class="col-12 md:col-12 p-fluid">
    <div class="card">
      <div class="grid formgrid">
        <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
          <label>{{ t('common.nameInQazaq') }}</label>
          <InputText v-model="course.namekz" class="mt-2" type="text"></InputText>
          <small v-if="courseValidate.namekz" class="p-error">{{t('common.requiredField')}}</small>
        </div>
        <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
          <label>{{ t('common.descriptionKz') }}</label>
          <InputText v-model="course.descriptionkz" class="mt-2" type="text"></InputText>
          <small v-if="courseValidate.descriptionkz" class="p-error">{{t('common.requiredField')}}</small>
        </div>
        <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
          <label>{{ t('common.nameInRussian') }}</label>
          <InputText v-model="course.nameru" class="mt-2" type="text"></InputText>
          <small v-if="courseValidate.nameru" class="p-error">{{t('common.requiredField')}}</small>
        </div>
        <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
          <label>{{ t('common.descriptionRu') }}</label>
          <InputText v-model="course.descriptionru" class="mt-2" type="text"></InputText>
          <small v-if="courseValidate.descriptionru" class="p-error">{{t('common.requiredField')}}</small>
        </div>
        <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
          <label>{{ t('common.nameInEnglish') }}</label>
          <InputText v-model="course.nameen" class="mt-2" type="text"></InputText>
          <small v-if="courseValidate.nameen" class="p-error">{{t('common.requiredField')}}</small>
        </div>
        <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
          <label>{{ t('common.descriptionEn') }}</label>
          <InputText v-model="course.descriptionen" class="mt-2" type="text"></InputText>
          <small v-if="courseValidate.descriptionen" class="p-error">{{t('common.requiredField')}}</small>
        </div>
        <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
          <label>{{ t('course.startDate') }}</label>
          <PrimeCalendar v-model="course.history[0].startDate"  class="mt-2" :placeholder="t('hr.id.startDate')" dateFormat="dd.mm.yy"/>
          <small v-if="courseValidate.start_time" class="p-error">{{ t("common.requiredField") }}</small>
        </div>
        <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
          <label>{{ t('course.completionDate') }}</label>
          <PrimeCalendar v-model="course.history[0].finalDate"  class="mt-2" :placeholder="t('hr.id.startDate')" dateFormat="dd.mm.yy"/>
          <small v-if="courseValidate.final_date" class="p-error">{{ t("common.requiredField") }}</small>
        </div>
        <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
          <label class="mr-2">{{ t('course.moduleHours') }}</label>
          <Checkbox v-model="checkedHours" :binary="true" />
          <InputNumber :disabled="!checkedHours" v-model="course.hours" class="mt-2"></InputNumber>
          <small v-if="courseValidate.hours" class="p-error">{{t('common.requiredField')}}</small>
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
    <template #footer>
    <div class="flex flex-wrap row-gap-1">
      <Button :label="t('common.save')" @click="updateCourseState(7)" class="w-full p-button-primary"/>
      <Button :label="t('common.cancel')" @click="closeCourseDialog" class="w-full p-button-secondary p-button-outlined"/>
    </div>
  </template>

  </Dialog>

  <!-- ҚАТЫСУШЫЛАРҒА СЕРТИФИКАТ БЕРУ -->
  <!-- ЕГЕР issueCertificateWithDialog true болатын болса онда қосымша мен беріледі -->
  <!-- ЕГЕР issueCertificateWithDialog false болатын болса онда қосымшасыз беріледі-->
  <Dialog v-model:visible="openIssueCertificate" :style="{ width: '500px' }">
    <template #header>
      <div>
        <i class="pi pi-exclamation-triangle mr-2"></i>
        {{ issueCertificateWithDialog ? t('course.certificate.confirm2') : t('course.certificate.confirm') }}
      </div>
    </template>

    <label>{{ t('common.nextIssue') }}</label>
    <template #footer>
      <div class="flex justify-content-between">
        <InputText v-if="organizer && organizer.lastNumber" type="text" v-model="organizer.lastNumber"></InputText>
        <div>
          <Button v-if="findRole(null,'online_course_administrator')"
                  :label="t('common.yes')" @click="issueCertificate(issueCertificateWithDialog ? 1 : 0)"/>
          <Button :label="t('common.no')" @click="closeIssueCertificateDialog"
                  class="p-button-outlined"/>
        </div>
      </div>
    </template>
  </Dialog>

</template>

<script setup>
  import {computed, onMounted, ref, defineProps, inject, watchEffect, watch, toRefs} from "vue";
  import {useI18n} from "vue-i18n";
  import {useToast} from "primevue/usetoast";
  import {OnlineCourseService} from "@/service/onlinecourse.service";
  import {smartEnuApi, findRole} from "@/config/config";
  import QrGenerator from "@/components/QrGenerator.vue";
  import ActionButton from "@/components/ActionButton.vue";
  import {useConfirm} from "primevue/useconfirm";

  const confirm = useConfirm()
  const emitter = inject("emitter");
  const {t, locale} = useI18n()
  const toast = useToast()
  const loading = ref(false)
  const onlineCourseService = new OnlineCourseService
  const props = defineProps({
    courseHistoryID: {
      type: Number,
      default: 0,
    },
    propsCourse: {
        type: Object, 
        default: Object,
    },
    studentState: {
        type: String,
        default: null
    },
    courseHistoryState: {
      type: String,
      default: null
    },
    getCourse: {
      type: Function,
      default: () => {},
    }
  })
  const  getCourse  = toRefs(props);
  const students = ref([])
  const student = ref(null)
  const total = ref(0)
  const course = ref(props.propsCourse)
  const searchText = ref(null)
  const isModule = ref(false)
  const dic_course_type = ref(0)
  const lazyParams = ref(
    {
        page: 0,
        rows: 10
    }
  )
  const addStudentDialog = ref(false)
  const organizer = ref(null)  
  const issueCertificateWithDialog = ref(false)
  const journal = ref(null)
  const journalVisible = ref(false)
  const stateID = ref(0)
  const userID = ref(0)
  const qrUrl = ref(null)
  const qrVisible = ref(false)
  const student_registered_count = ref(0)
  const student_completed_count = ref(0)
  const grade_count = ref(0)
  const actionsNode = ref(null)
  const newUsers = ref([])
  const menu =  ref([
      {
        label: t("course.сompleteTheCourse"),
        icon: 'fa-solid fa-lock',
        command: () => {
            closeCourse()
        },

        disabled: () => course.value.history[0].stateID === 8
      },
      {
        label: t("course.openNewThread"),
        icon: 'fa-solid fa-stream',
        command: () => openCourseDialog(),
        disabled: () => course.value.history[0].stateID === 7
      },
  ])
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
  const certificates = ref([])
  const certificate = ref(null)
  const certificateLazyParams = ref({
      page: 0,
      rows: 50,
      searchText: null,
  })

  const getCourseHistoryStudents = () => {
    loading.value = true
    const req = {
      courseID: props.propsCourse?.id || 0,
      page: lazyParams.value.page,
      rows: lazyParams.value.rows,
      searchText: searchText.value,
      isModule: isModule.value,
      courseHistoryID: props.courseHistoryID,
      studentState: props.studentState,
      courseHistoryState: props.courseHistoryState,
    }

    onlineCourseService.getCourseStudents(req).then(response => {
        students.value = response.data.students

        total.value = response.data.total
        dic_course_type.value = response.data.dic_course_type
        loading.value = false
    }).catch(_ => {
        loading.value = false
    });
  }

  const onPage = (event) => {
    lazyParams.value = event
    getCourseHistoryStudents()
  }

  const addStudent = () => {
    newUsers.value = []
    addStudentDialog.value = true
  }

  const openIssueCertificateDialog = () => {
    getCourseOrganizerByCourseID()
    issueCertificateWithDialog.value = false
    openIssueCertificate.value = true
  }

  const openIssueCertificateWithDialog = () => {
    getCourseOrganizerByCourseID()
    openIssueCertificate.value = true
    issueCertificateWithDialog.value = true
  }

  const getCourseOrganizerByCourseID = () => {
      loading.value = true

      onlineCourseService.getCourseOrganizerByCourseID(props.propsCourse?.id).then(response => {
          organizer.value = response.data.organizer
          organizer.value.lastNumber++
          loading.value = false
      }).catch(_ => {
          loading.value = false
      });
  }

  const sendRequestToCourse = () => {
    confirm.require({
      message: t('common.confirmation'),
      header: t('common.confirm'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
         newUsers.value = []
         addStudentsToCourse(1);
        toast.add({ severity: 'success', summary: t("common.message.successCompleted"), life: 3000 });
      }
    });
  };

  const addStudentsToCourse = (state) => {
    loading.value = true
    submitted.value = true

    if (newUsers.value.length <= 0 && state !== 1) {
        loading.value = false
        return
    }
    
    if (!course.value.history || course.value.history.length <= 0) {
      loading.value = false
      return
    }

    onlineCourseService.addStudentsToCourse({
        users: newUsers.value,
        courseHistoryID: course.value.history[0].id,
        comment: "",
        state: state,
    }).then(_ => {
        loading.value = false;
        submitted.value = false
        closeStudentDialog()
        getCourseHistoryStudents()

    }).catch(_ => {
      submitted.value = false
      loading.value = false
    })
  }

  const closeStudentDialog = () => {
    addStudentDialog.value = false;
  }

  const updateUserState = (userID, state) => {
      loading.value = true;
      if (journal.value != null) {
        updateJournal();
      }
      onlineCourseService.updateUserState(course?.value.history[0].id, userID, state).then(response => {
          loading.value = false

          getCourseHistoryStudents();
          journalVisible.value = false
      }).catch(_ => {
          loading.value = false
      });
  }

  const updateJournal = () => {
    if (journal.value == null) {
          return
      }
    let journals = journal.value.map(e => {
        const newObjs = {
            id: e.id,
            course_history_student_rel_id: e.course_history_student_rel_id,
            grade: e.grade
        };
        newObjs.module = {id: e.module.id}
        return newObjs
    })
    const dataSend = {journals: journals}
    onlineCourseService.updateJournal(dataSend).then(_ => {
        toast.add({
            severity: "success",
            summary: t("common.message.succesSaved"),
            life: 3000,
        });
        journalVisible.value = false
    }).catch(_ => {
        toast.add({
            severity: "error",
            summary: t("common.message.saveError"),
            life: 3000,
        });
    })
  }

  const openJournal = (studentID,stateID) => {
    let courseHistoryID = 0
    if (course.value === null) {
      courseHistoryID = props.courseHistoryID
    } else {
      courseHistoryID = course.value.history[0].id
    }

    getJournal(courseHistoryID, studentID)
    journalVisible.value = true;
  }

  const getJournal = (courseHistoryID, userID) => {
    loading.value = true
    onlineCourseService.getJournal(courseHistoryID, userID).then(response => {
        journal.value = response.data;
        loading.value = false;
    }).catch(_ => {
        loading.value = false
    });
  }
  
  const closeJournal = () => {
      journalVisible.value = false;
  }

  const openCertificate = (uuid) => {
      let url = smartEnuApi + "/document?qrcode=" + uuid;
      window.open(url, '_blank');
  }

  const getQR = (uuid) => {
    qrUrl.value = smartEnuApi + "/document?qrcode=" + uuid;

    qrVisible.value = true;
  }

  const toggleAction = (node) =>  {
    const req = {
      courseID: props.propsCourse?.id || 0
    }
    onlineCourseService.getCourseModuleAndStudentCounts(req).then(res => {
      student_completed_count.value = res.data.student_completed_count
      student_registered_count.value = res.data.student_registered_count
      grade_count.value = res.data.grade_count
      actionsNode.value = node
    }).catch(error => {
      toast.add({severity: "error", summary: t("common.message.saveError"), life: 3000});
    })
  }

  const showConfirmationDialog = (message, header, icon, acceptCallback, rejectCallback) => {
    confirm.require({
      message: message,
      header: header,
      icon: icon,
      acceptClass: 'p-button-rounded p-button-success',
      rejectClass: 'p-button-rounded p-button-danger',
      accept: acceptCallback,
      reject: rejectCallback,
    });
  };

  const closeCourse = () => {
    if (grade_count.value > 0) {
      showMessage('warn', t("course.warning"), t("course.noGrades"), 6500);
      getCourseStudentsFilter(true, 0);
    } else if (student_registered_count.value > 0) {
      showConfirmationDialog(
        t("course.noBeenTrained"),
        t("course.confirmation"),
        'pi pi-info-circle',
        () => updateUserState(null, 4),
        () => showConfirmationDialog(
          t("course.confirmCloseCourse"),
          t("course.confirmation"),
          'pi pi-info-circle',
          () => updateCourseState(8),
          false
        )
      );
    } else if (student_completed_count.value > 0 && grade_count.value === 0 && student_registered_count.value === 0) {
      showMessage('warn', t("course.warning"), t("course.noIssuedCertificates"), 6500);
    } else {
      showConfirmationDialog(
        t("course.completeCourse"),
        t("course.confirmation"),
        'pi pi-info-circle',
        () => updateCourseState(8),
        null
      );
    }
  };

  const showMessage = (msgtype, message, content, life) => {
    toast.add({
      severity: msgtype,
      summary: message,
      detail: content,
      life: life
    })
  }

  const openCourseDialog = () => {
    getCertificateTemplate()
    course.value.history[0].startDate = null
    course.value.history[0].finalDate = null
    courseDialog.value = true
  }

  const getCourseStudentsFilter = (isModule, state) => {
    if (isModule) {
      isModule.value = true
      getCourseHistoryStudents()
    }
  }

  const updateCourseState = (stateID) => {
    const req = {
        course: course.value,
        stateID: stateID
    }

    if(!validateCourse() && stateID !== 8) {
      return
    }

    loading.value = true
    onlineCourseService.createCourse(req).then(_ => {
      
      loading.value = false
      props.getCourse()
      getCourseHistoryStudents()
    }).catch(_=> {
      loading.value = false;
      showMessage('error', t('common.message.actionError'), t('common.message.actionErrorContactAdmin'), 3000)
    }).finally(() => {
      closeCourseDialog()
    })
  }

  const validateCourse = () => {
      courseValidate.value.namekz = course.value.namekz === ''
      courseValidate.value.nameru = course.value.nameru === ''
      courseValidate.value.nameen = course.value.nameen === ''
      courseValidate.value.descriptionkz = course.value.descriptionkz === ''
      courseValidate.value.descriptionru = course.value.descriptionru === ''
      courseValidate.value.descriptionen = course.value.descriptionen === ''
      courseValidate.value.start_time = course.value.history[0].startDate === null
      courseValidate.value.final_date = course.value.history[0].finalDate === null
      courseValidate.value.hours = (course.value.hours <= 0 && checkedHours.value)
      if (checkedCertificate.value) {
        courseValidate.value.certificate_template_id = course.organizer.certificateTemplateID === null
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

  const closeCourseDialog = () => {
      courseDialog.value = false
  }

  const issueCertificate = (withApplication) => {
      loading.value = true
      onlineCourseService.issueCertificate({
          courseID: course.value.id,
          comment: "",
          withApplication: withApplication,
          lastNumber: parseInt(organizer.value.lastNumber-1)
      }).then(_ => {
          loading.value = true
          toast.add({
              severity: "success",
              summary: t('common.successDone'),
              life: 3000,
          });
          getCourseHistoryStudents()

      }).catch(_ => {
      })
      .finally(() => {
          loading.value = true
          issueCertificateWithDialog.value = false
          openIssueCertificate.value = false
      })
  }

  const deleteStudentConfirmationDialog = (student) => {
    const confirmationMessage = student.certificateUUID === null
        ? t('course.deleteStudent')
        : t('course.deleteCertificate');

    const req = {
      registerID: student.registerID,
      certificateUUID: student.certificateUUID
    };

    showConfirmationDialog(t('common.doYouWantDelete'),
        confirmationMessage, 'pi pi-info-circle', () => deleteStudent(req), null)
  }

  const deleteStudent = (req) => {
    onlineCourseService.deleteCertificateOrStudent(req).then(res => {
      getCourseHistoryStudents();
      toast.add({severity: "success", summary: t("common.success"), life: 3000});
    }).catch(error => {
      toast.add({severity: "error", summary: t("common.message.saveError"), life: 3000});
    })
  }

  const isButtonDisabled = () => {
    if (journal.value === null) {
      isGrade.value = true
      return
    }

    isGrade.value = journal.value.every(item => item.grade !== null)
  }

  const itemLabel = (item) => {
    return item['name']
  }

  const getCertificateTemplate = () => {
    loading.value = true;
    certificateLazyParams.value.docType = 7
    onlineCourseService.getCertificateTemplateJournal(certificateLazyParams.value).then(response =>{
      certificates.value = response.data.templates;
    }).catch(_=> {
    }).finally(() => {
      loading.value = false;
    })
  }

  const handleFilter = (event) => {
    if (event.value && event.value.length > 0) {
      certificateLazyParams.value.searchText = event.value
      getCertificateTemplate()
    } else {
      certificateLazyParams.value.searchText = null
      getCertificateTemplate()
    }
  }

  watchEffect(() => {
    isButtonDisabled()
  })

  watch(() => props.propsCourse, (newCourse, oldCourse) => {
    course.value = newCourse
  });

  onMounted(() => {
    getCourseHistoryStudents()
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
