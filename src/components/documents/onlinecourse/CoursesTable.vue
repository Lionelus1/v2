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
  </div>
</template>
  
<script>
import axios from 'axios';
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

      axios.post(smartEnuApi + '/onlinecourse/courses', {
        page: this.page,
        rows: this.rows,
        categoryID: this.categoryId,
        lang: this.$i18n.locale,
        searchText: this.searchText,
      }, {
        headers: getHeader()
      }).then(res => {
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

        if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout")
        } else if (err.response && err.response.data && err.response.data.localized) {
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
    }
  }
}
</script>