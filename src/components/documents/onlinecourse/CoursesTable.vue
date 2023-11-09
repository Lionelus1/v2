<template>
  <TitleBlock :title="$t('course.courses')" />
  <div class="surface-card p-4 shadow-2 border-round">
    <TabPanel>
      <DataTable :value="courses" dataKey="id" :rows="rows" :totalRecords="total" :paginator="true"
        :paginatorTemplate="paginatorTemplate" :rowsPerPageOptions="[10, 25, 50]"
        :currentPageReportTemplate="currentPageReportTemplate" :lazy="true" :loading="tableLoading" scrollable
        scrollHeight="flex" v-model:selection="selectedCourse" selectionMode="single" :rowHover="true" stripedRows
        @page="onPage">
        <template #header>
          <div class="sm:flex block justify-content-between">
            <Button v-if="findRole(null,'online_course_administrator') && dic_course_type == 1"
                    class="p-button-success mb-2" icon="pi pi-plus" :label="$t('common.add')"
                    @click="addCourse"/>
            <Button class="mr-2" v-if="findRole(null, 'online_course_administrator') && dic_course_type == 2" :label="$t('common.updateGES')" @click="getOod()" />
        <div>
          <span  v-if="findRole(null,'online_course_administrator')" class="p-input-icon-left mr-2">
              <i class="pi pi-search"/>
              <InputText type="search" v-model="searchText" @keyup.enter="getCourseStudents"  @search="getCourses" :placeholder="$t('common.search')"/>
          </span>
            <Button class="mt-2" v-if="findRole(null, 'online_course_administrator') && dic_course_type == 2" :label="$t('common.save')"
            @click="updateCourseGiveCertificates()" />
        </div>
          </div>
        </template>

        <Column :header="$t('common.name')">
          <template #body="body">
            {{ body.data['name' + $i18n.locale] }}
          </template>
        </Column>
        <Column :header="$t('common.description')">
          <template #body="body">
            {{ body.data['description' + $i18n.locale] }}
          </template>
        </Column>
        <Column v-if="findRole(null, 'online_course_administrator') && dic_course_type == 2">
          <template #body="body">
            <Checkbox v-model="body.data.give_certificate" @change="pushAndDeleteGiveCertificates(body.data)"
              :binary="true" />
          </template>
          <template #header>
            <Checkbox inputId="selectAll"  class="mr-2" v-model="selectAllChecked" @input="checkboxSelectAll" :binary="true"  />
            <label for="selectAll">{{$t('common.addCertificate')}}</label>
        </template>
        </Column>
        <Column>
          <template #body="body">
            <Button :label="$t('common.goToTheCourse')" v-model="body.Button" class="p-button-info mb-2"
              @click="selectCourse(body.data)" />
          </template>
        </Column>
        
      </DataTable>
    </TabPanel>
    <Dialog v-model:visible="courseDialog" :style="{ width: '600px' }" :header="$t('course.course')" :modal="true" class="p-fluid">
      <div class="col-12 md:col-12 p-fluid">
        <div class="card">
          <div class="grid formgrid">
              <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
                  <label>{{ $t('common.nameInQazaq') }}</label>
                  <InputText v-model="courseRequest.namekz" class="mt-2" type="text"></InputText>
                  <small v-if="courseValidate.namekz" class="p-error">{{$t('common.requiredField')}}</small>
              </div>
              <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
                  <label>{{ $t('common.descriptionKz') }}</label>
                  <InputText v-model="courseRequest.descriptionkz" class="mt-2" type="text"></InputText>
                  <small v-if="courseValidate.descriptionkz" class="p-error">{{$t('common.requiredField')}}</small>
              </div>
              <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
                  <label>{{ $t('common.nameInRussian') }}</label>
                  <InputText v-model="courseRequest.nameru" class="mt-2" type="text"></InputText>
                  <small v-if="courseValidate.nameru" class="p-error">{{$t('common.requiredField')}}</small>
              </div>
              <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
                  <label>{{ $t('common.descriptionRu') }}</label>
                  <InputText v-model="courseRequest.descriptionru" class="mt-2" type="text"></InputText>
                  <small v-if="courseValidate.descriptionru" class="p-error">{{$t('common.requiredField')}}</small>
              </div>
              <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
                <label>{{ $t('common.nameInEnglish') }}</label>
                <InputText v-model="courseRequest.nameen" class="mt-2" type="text"></InputText>
                <small v-if="courseValidate.nameen" class="p-error">{{$t('common.requiredField')}}</small>
              </div>
              <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
                <label>{{ $t('common.descriptionEn') }}</label>
                <InputText v-model="courseRequest.descriptionen" class="mt-2" type="text"></InputText>
                <small v-if="courseValidate.descriptionen" class="p-error">{{$t('common.requiredField')}}</small>
              </div>
              <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
                <label>{{ $t('course.startDate') }}</label>
                <PrimeCalendar v-model="courseRequest.start_time" :readonly="readonly"  class="mt-2" :placeholder="$t('hr.id.startDate')" dateFormat="dd.mm.yy"/>
                <small v-if="courseValidate.start_time" class="p-error">{{ $t("common.requiredField") }}</small>
              </div>
              <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
                <label>{{ $t('course.completionDate') }}</label>
                <PrimeCalendar v-model="courseRequest.final_date" :readonly="readonly"  class="mt-2" :placeholder="$t('hr.id.startDate')" dateFormat="dd.mm.yy"/>
                <small v-if="courseValidate.final_date" class="p-error">{{ $t("common.requiredField") }}</small>
              </div>
              <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
                  <label>{{ $t('course.moduleHours') }}</label>
                  <InputNumber v-model="courseRequest.hours" class="mt-2"></InputNumber>
                  <small v-if="courseValidate.hours" class="p-error">{{$t('common.requiredField')}}</small>
              </div>
              <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
                    <label class="mr-2">{{ $t('course.certificate.certSelect') }}</label>
                    <Checkbox v-model="checkedCertificate" :binary="true" />
                  <Dropdown :disabled="!checkedCertificate" v-model="courseRequest.certificate_template_id" :options="journal" class="mt-2" :optionLabel="itemLabel" optionValue="id" :placeholder="$t('common.select')"
                  @filter="handleFilter" :filter="true" :showClear="true" dataKey="id" :emptyFilterMessage="$t('roleControl.noResult')"  />
                  <small v-if="courseValidate.certificate_template_id"  class="p-error">{{$t('common.requiredField')}}</small>
              </div>
          </div>
        </div>
      </div>
        <template #footer>
            <div class="flex flex-wrap row-gap-1">
                <Button :label="$t('common.save')" @click="createCourse" class="w-full p-button-primary"/>
                <Button :label="$t('common.cancel')" @click="closeCourse" class="w-full p-button-secondary p-button-outlined"/>
            </div>
        </template>

    </Dialog>

  </div>
</template>
  
<script>
import Checkbox from '@/main';
import { OnlineCourseService } from "@/service/onlinecourse.service";
import { getHeader, smartEnuApi, findRole } from "@/config/config";
import {TitleBlock} from "@/components/TitleBlock"

export default {
  name: 'CoursesTable',
  components: {},
  props: {},
  emits: [],
  data() {
    return {
      paginatorTemplate: "FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink JumpToPageDropdown CurrentPageReport RowsPerPageDropdown",
      currentPageReportTemplate: this.$t('common.showingRecordsCount', {
        first: '{first}',
        last: '{last}',
        totalRecords: '{totalRecords}',
      }),
      tableLoading: false,
      categoryId: null,
      courses: [],
      selectedCourse: null,
      total: 0,
      page: 0,
      rows: 10,
      checked: false,
      course: null,
      service: new OnlineCourseService(),
      give_certificates: [],
      selectAllChecked: true,
      dic_course_type: null,
      searchText: null,
      courseDialog: false,
      courseRequest: {
        namekz: '',
        nameru: '',
        nameen: '',
        descriptionkz: '',
        descriptionru: '',
        descriptionen: '',
        hours: 0,
        certificate_template_id: null,
        start_time: null,
        final_date: null,
        category_id: null
      },
      courseValidate: {
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
      },
      lazyParams : {
        page: 0,
        rows: 10,
        searchText: null,
      },
      journal: null,
      loading: true,
      count: 0,
      checkedCertificate: false,
    }
  },
  created() {
    this.categoryId = parseInt(this.$route.params.categoryID)
  },
  mounted() {
    this.getCourses();
  },
  methods: {
    check(arg) {
      console.log(arg)
    },
    findRole: findRole,
    showMessage(msgtype, message, content) {
      this.$toast.add({
        severity: msgtype,
        summary: message,
        detail: content,
        life: 3000
      });
    },
    checkboxSelectAll() {
      if (this.selectAllChecked) {
        this.selectAllChecked = true;
        this.courses.forEach((course) => {
          course.give_certificate = true;
          this.pushAndDeleteGiveCertificates(course);
        });
      } else {
        this.selectAllChecked = false;
        this.courses.forEach((course) => {
          course.give_certificate = false;
          this.pushAndDeleteGiveCertificates(course);
        });
      }
    },

    pushAndDeleteGiveCertificates(course) {
      const newCertificate = {
        courseID: course.id,
        give_certificate: course.give_certificate,
      };

      let index = this.give_certificates.findIndex(x => x.courseID === course.id)

      if (index === -1) {
        this.give_certificates.push(newCertificate)
      } else {
        this.give_certificates[index].give_certificate = course.give_certificate
      }
    },
    updateCourseGiveCertificates() {
      this.loading = true
      const request = {
        give_certificates: this.give_certificates
      }
      this.service.updateCourseGiveCertificates(request).then(_ => {
        this.loading = false
      }).catch(_ => {
        this.loading = false
      })

      this.give_certificates = []

      this.onPage
    },
    onPage(event) {
      this.page = event.page;
      this.rows = event.rows;
      this.getCourses();
    },
    getCourses() {
      this.tableLoading = true
      const req = {
        page: this.page,
        rows: this.rows,
        categoryID: this.categoryId,
        lang: this.$i18n.locale,
        searchText: this.searchText,
      }
      this.service.getCourses(req).then(res => {
        let counter = 0
        this.courses = res.data.courses
        this.courses.map((e) => {
          e.give_certificate = e.give_certificate === 1
          if (e.give_certificate === false) {
            counter++
          }
          if (counter !== 0) {
            this.selectAllChecked = false
          } else {
            this.selectAllChecked = true
          }
        })
        this.dic_course_type = res.data.dic_course_type
        this.total = res.data.total
        this.selectedCourse = null

        this.tableLoading = false
      }).catch(err => {
        this.courses = []
        this.total = 0
        this.selectedCourse = null
        if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath), null)
        } else {
          console.log(err)
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
        }

        this.tableLoading = false
      });
    },
    selectCourse(course) {
      this.$router.push('/course/' + course.id)
    },
    getOod() {
      this.tableLoading = true
      this.service.getOod().then(_ => {

      }).catch(error => {
        console.log(error)
      })
        .finally(() => {
          this.getCourses()
          this.tableLoading = false
        })
    },
    addCourse() {
      this.courseDialog = true;
      this.lazyParams.searchText = null
      this.getJournal()
    },
    closeCourse() {
      this.courseDialog = false
      this.courseRequest = {}
    },
    createCourse() {
      if (!this.validateCourse()) {
        return
      }
      this.loading = true
      this.courseRequest.category_id = parseInt(this.$route.params.categoryID)
      this.service.createCourse(this.courseRequest).then(_ => {
        this.getCourses()
        this.loading = false
      }).catch(_=> {
        this.loading = false;
      }).finally(() => {
        this.closeCourse()
      })
    },

    validateCourse() {
      this.courseValidate.namekz = this.courseRequest.namekz === ''
      this.courseValidate.nameru = this.courseRequest.nameru === ''
      this.courseValidate.nameen = this.courseRequest.nameen === ''
      this.courseValidate.descriptionkz = this.courseRequest.descriptionkz === ''
      this.courseValidate.descriptionru = this.courseRequest.descriptionru === ''
      this.courseValidate.descriptionen = this.courseRequest.descriptionen === ''
      this.courseValidate.start_time = this.courseRequest.start_time === null
      this.courseValidate.final_date = this.courseRequest.final_date === null
      this.courseValidate.hours = this.courseRequest.hours <= 0
      if (this.checkedCertificate) {
        this.courseValidate.certificate_template_id = this.courseRequest.certificate_template_id === null
      } else {
        this.courseValidate.certificate_template_id = false
        this.courseRequest.certificate_template_id = null
      }

      return !this.courseValidate.namekz &&
             !this.courseValidate.nameru &&
             !this.courseValidate.nameen &&
             !this.courseValidate.descriptionkz &&
             !this.courseValidate.descriptionru &&
             !this.courseValidate.descriptionen &&
             !this.courseValidate.start_time &&
             !this.courseValidate.final_date &&
             !this.courseValidate.hours  &&
             !this.courseValidate.certificate_template_id
    },
    getJournal() {
      this.loading = true;
      this.lazyParams.docType = 7
      this.service.getCertificateTemplateJournal(this.lazyParams).then(response =>{
        this.journal = response.data.templates;
        this.count = response.data.count;
      }).catch(_=> {
      }).finally(() => {
        this.loading = false;
      })
    },
    handleSelectionChange() {
      if (this.lazyParams.searchText) {
        console.log(this.lazyParams.searchText)
      }
    },
    itemLabel(item) {
      return item['name']
    },
    handleFilter(event) {
      if (event.value && event.value.length > 3) {
        this.lazyParams.searchText = event.value
        this.getJournal()
      } else if (this.lazyParams.searchText.length > 3) {
        this.lazyParams.searchText = null
        this.getJournal()
      }
    }
  }
}
</script>