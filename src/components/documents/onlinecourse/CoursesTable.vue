<template>
    <div class="surface-card p-4 shadow-2 border-round">
        <TabPanel :header="$t('course.courses')">
            <DataTable :value="courses" dataKey="id" :rows="rows" :totalRecords="total"
                :paginator="true" :paginatorTemplate="paginatorTemplate" :rowsPerPageOptions="[10, 25, 50]"
                :currentPageReportTemplate="currentPageReportTemplate" :lazy="true" :loading="tableLoading" scrollable scrollHeight="flex"
                v-model:selection="selectedCourse" selectionMode="single" :rowHover="true" stripedRows
                @page="onPage">
                <template #header>
                    <h4 class="mb-3">{{ $t('course.courses') }}</h4>
                </template>
                <Column :header="$t('common.name')">
                    <template #body="body">
                        {{ body.data['name' + $i18n.locale] }}
                    </template>
                </Column>
                <Column :header="$t('common.description')">
                    <template #body="body">
                        {{ body.data['description' +  $i18n.locale] }}
                    </template>
                </Column>
                <Column :header="$t('common.goToTheCourse')">
                    <template #body="body">
                        <Button v-model="body.Button" class="p-button-info mb-2" />
                    </template>
                </Column>

                <Column :header="$t('common.addCertificate')">
                    <template #body="body">
                        <Checkbox v-model="body.data.checked" :binary="true" />
                    </template> 
                </Column> 

            </DataTable>
        </TabPanel>
    </div>
</template>
  
<script>    
import axios  from 'axios';
import Checkbox from '@/main';

import { getHeader, smartEnuApi } from "@/config/config";

export default {
  name: 'CoursesTable',
  components: { },
  props: { },
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
        checked: true,
    }
  },
  created() {
    this.categoryId = parseInt(this.$route.params.categoryID)
  },
  mounted() {
    this.getCourses();
  },
  methods: {
    showMessage(msgtype, message, content) {
      this.$toast.add({
        severity: msgtype,
        summary: message,
        detail: content,
        life: 3000
      });
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
      }, { 
        headers: getHeader() 
      }).then(res => {
        this.courses = res.data.courses
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
  }
}
</script>