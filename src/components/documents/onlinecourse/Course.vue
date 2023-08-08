<template>
    <div>
    <div v-if="course">
        <BlockUI :blocked="saving" :fullScreen="true"></BlockUI>
        <div class="surface-card p-4">
            <div class=" font-medium text-3xl text-900 mb-3">{{ course["name" + $i18n.locale] }}</div>
            <div class="text-500 mb-5">{{ course["description" + $i18n.locale] }}</div>
        </div>

        <TabView v-model:activeIndex="activeTabIndex">

            <TabPanel :header="$t('course.users')">
                <!-- курсқа қатысушылар -->
                <div v-if="course && course.students">
                    <DataTable selectionMode="single" v-model:selection="student" :lazy="true"
                        :totalRecords="course.studentsCount" :value="course.students" @page="studentTableOnPage($event)"
                        :paginator="true" :first="studentLazyParams.page" :rows="studentLazyParams.rows"
                        dataKey="profile.userID" :rowHover="true" :loading="loading"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink JumpToPageDropdown CurrentPageReport RowsPerPageDropdown"
                        :rowsPerPageOptions="[10, 25, 50]" :currentPageReportTemplate="$t('common.showingRecordsCount', {
                            first: '{first}',
                            last: '{last}',
                            totalRecords: '{totalRecords}',
                        })" responsiveLayout="stack" breakpoint="480px" @sort="onSort($event)"
                        @filter="onFilter($event)">

                        <template #header>
                            <div
                                class="table-header flex justify-content-between flex-wrap card-container purple-container">
                                <div class="flex gap-2">
                                    <Button class="p-button-success" icon="pi pi-plus" :label="$t('common.add')"
                                        @click="addStudent" />
                                    <Button class="p-button-help" icon="fa-solid fa-certificate"
                                        :label="$t('course.certificate.issue')" @click="issueCertificate" />

                                </div>
                                <span class="p-input-icon-left">
                                    <i class="pi pi-search" />
                                    <InputText disabled="true" :placeholder="$t('common.search')" />
                                </span>
                            </div>
                        </template>
                        <Column field="profile.fullName" :header="$t('common.fullName')"></Column>

                        <Column
                            :field="'profile.mainPosition.department.name' + ($i18n.locale).charAt(0).toUpperCase() + ($i18n.locale).slice(1)"
                            :header="$t('common.department')"></Column>
                        <Column header="">
                            <template #body="">
                                <Button icon="fa-solid fa-award" class="mr-3" label="" @click="openCertificate()"/>
                                <Button class="p-button-success mr-3" icon="pi pi-list" label="" @click="openJournal" />
                            </template>
                        </Column>
                    
                        <!-- <Column headerStyle="width:60px;">
                                    <template #body="slotProps">
                                    <Button @click="template=slotProps.data;templateEditorVisilble = true"
                                            type="button"
                                            icon="pi pi-eye" class="p-button-info"></Button>
                                    </template>
                                </Column> -->
                    </DataTable>
          <!-- студент қосу диалогы -->
                    <Dialog v-model:visible="studentDialog" :style="{ width: '450px' }" :header="$t('course.user')"
                        :modal="true" class="p-fluid">
                        <div class="field">
                            <label for="newUsers">{{ $t('common.fullName') }}</label>

                            <!-- <FindUser id="name"  required="true" autofocus :class="{'p-invalid': submitted && !student}" /> -->
                            <FindUser id="newUsers" v-model="newUsers" :userType="2"></FindUser>
                            <small class="p-error" v-if="submitted && !(newUsers && newUsers.length > 0)">{{
                                $t('common.requiredField') }}</small>
                        </div>
                        <template #footer>
                            <div class="flex flex-wrap row-gap-1">
                                <Button :label="$t('common.save')" @click="addStudentsToCourse"
                                    class="w-full p-button-primary" />
                                <Button :label="$t('common.cancel')" @click="closeStudentDialog"
                                    class="w-full p-button-secondary p-button-outlined" />
                            </div>

                        </template>
                    </Dialog>
         
                </div>
            </TabPanel>

         <!-- module қосу table -->
            <TabPanel :header="$t('course.modules')">
                <DataTable :value="moduleData">
                    <template #header>
                        <div
                            class="table-header flex justify-content-between flex-wrap card-container purple-container">
                            <div class="flex gap-2">
                                <Button class="p-button-success" icon="pi pi-plus" :label="$t('common.add')" @click="addModule" />
                            </div>
                        </div>
                    </template>
                    <Column field="name" :header="$t('common.name')"></Column>
                    <Column field="hours" :header="$t('course.moduleHours')"></Column>
                    <Column field="description" :header="$t('common.description')"></Column>
                </DataTable>
            </TabPanel>
        </TabView>

    </div>

    <!-- module қосу диалогы -->
    <Dialog v-model:visible="moduleDialog" :style="{ width: '450px' }" :header="$t('course.module')" :modal="true"
        class="p-fluid">
        <div class="field">
            <!-- new module қосу -->
            <label for="newModules">{{ $t('course.moduleName') }}</label>
            <InputText type="text" id="newModules" v-model="newModules" :userType="2"></InputText>
            <small class="p-error" v-if="submitted && !(newModules && newModules.length > 0)">{{
                    $t('common.requiredField') }}</small>
        </div>
        <div class="field">
            <!-- new period қосу  -->
            <label for="newPeriod">{{ $t('course.modulePeriod') }}</label>
            <InputText type="text" id="newPeriod" v-model="newPeriod" :userType="2"></InputText>
            <small class="p-error" v-if="submitted && !(newPeriod && newPeriod.length > 0)">{{
                $t('common.requiredField') }}</small>
        </div>
        <div class="field">
            <!-- new period қосу  -->
            <label for="newPeriod">{{ $t('common.description') }}</label>
            <InputText type="text" id="newPeriod" v-model="newPeriod" :userType="2"></InputText>
            <small class="p-error" v-if="submitted && !(newPeriod && newPeriod.length > 0)">{{
                    $t('common.requiredField') }}</small>
        </div>
        <template #footer>
            <div class="flex flex-wrap row-gap-1">
                <Button :label="$t('common.save')" @click="addModulesToCourse" class="w-full p-button-primary" />
                <Button :label="$t('common.cancel')" @click="closeModuleDialog" class="w-full p-button-secondary p-button-outlined" />
            </div>
        </template>
    </Dialog>

    <Sidebar
      v-model:visible="journalVisible"
      position="right"
      class="p-sidebar-lg"
      style="overflow-y: scroll; width: 50%;"
      @hide="closeJournal"
  >
        <div class="card">
            <DataTable :value="moduleData">
                <Column field="name" :header="$t('common.name')"></Column>
                <Column field="hours" :header="$t('course.moduleGrade')">
                    <template #body="slotProps">
                    <InputNumber v-model="slotProps.data.hours"/>
                    </template>
                </Column>
                <Column field="description" :header="$t('common.description')"></Column>
            </DataTable>
        </div>
  <Button :label="$t('common.save')" icon="pi pi-check" class="p-button p-component p-button-success mr-2"
                @click="openGradeSidebar()" />
  </Sidebar>

  <Sidebar
      v-model:visible="gradeVisible"
      position="right"
      class="p-sidebar-lg"
      style="overflow-y: scroll; width: 30%;"
  >
    
  </Sidebar>
    </div>
</template>
<script>

import { OnlineCourseService } from "@/service/onlinecourse.service";
export default ({
    data() {
        return {
            loading: false,
            service: new OnlineCourseService(),
            course: null,
            saving: false,
            student: null,
            modules: [],
            studentsCount: 10,
            studentLazyParams: {
                page: 0, rows: 10
            },
            submitted: false,
            studentDialog: false,
            newUsers: [],

            // damir
            moduleDialog: false,
            moduleData: [],
            newModules: [],
            newPeriod:[],
            user: null,
            journalVisible: false,
            gradeVisible: false,
        }
    },
    created() {
        this.getCourse();
        this.getModule();

    },
    methods: {
        //-------------------------------------------Module
        getUser() {
            this.moduleDialog = true;
        },
        getModule() {
            this.loading = true
                this.service.getAllModule().then(response => {
                    //this.course = response.data;
                    this.moduleData = response.data;
                    console.log("module data: ", this.moduleData)
                    this.loading = false
                }).catch(_ => {
                    this.loading = false
                });
        },

        addModule() {
            this.moduleDialog = true;
        },
        closeModuleDialog() {
            this.moduleDialog = false;
            this.newModules = []
        },
        addModulesToCourse() {
            this.submitted = true;
            if (this.newModules.length <= 0) {
                return
            }
            if (!this.course.history || this.course.history.length <= 0) {
                return
            }
            this.saving = true
            this.service.addModulesToCourse({
                users: this.newModules,
                courseHistoryID: this.course.history[0].id,
                comment: ""
            }).then(_ => {
                this.saving = false;
                this.submitted = false;
                this.newModules = []
                this.closeModuleDialog()
                // this.getCourseStudents() //??????

            }).catch(_ => {
                this.saving = false;
                this.submitted = false;
            })
        },
        openCertificate() {
            //let url = this.smartEnuApi +"/document?qrcode="+uuid;
            window.open('_blank');
        },

        //---------------------------------------------------

        addStudent() {
            this.studentDialog = true;
        },
        issueCertificate() {
            this.saving = true
            this.service.issueCertificate({
                users: null,
                courseID: this.course.id,
                comment: ""
            }).then(_ => {
                this.saving = false;
                this.submitted = false;
                this.$toast.add({
                    severity: "success",
                    summary: this.$t('common.successDone'),
                    life: 3000,
                });
                this.getCourseStudents()


            }).catch(_ => {
                this.saving = false;
                this.submitted = false;
            })
        },
        closeStudentDialog() {
            this.studentDialog = false;
            this.newUsers = []
        },

        getCourse() {
            this.loading = true
                this.service.getCourse(this.$route.params.id).then(response => {
                    this.course = response.data
                    this.loading = false
                }).catch(_ => {
                    this.loading = false
                });
        },
        getCourseStudents() {
            this.loading = true
                this.service.getCourseStudents(this.$route.params.id, this.studentLazyParams.page, this.studentLazyParams.rows).then(response => {
                    this.course.students = response.data.students
                    this.course.studentsCount = response.data.total
                    this.loading = false
                }).catch(_ => {
                    this.loading = false
                });
        },
        studentTableOnPage(event) {
            this.studentLazyParams = event;
            this.getCourseStudents();
        },
        addStudentsToCourse() {
            this.submitted = true;
            if (this.newUsers.length <= 0) {
                return
            }
            if (!this.course.history || this.course.history.length <= 0) {
                return
            }
            this.saving = true
            this.service.addStudentsToCourse({
                users: this.newUsers,
                courseHistoryID: this.course.history[0].id,
                comment: ""
            }).then(_ => {
                this.saving = false;
                this.submitted = false;
                this.newUsers = []
                this.closeStudentDialog()
                this.getCourseStudents()

            }).catch(_ => {
                this.saving = false;
                this.submitted = false;
            })
        },
        openJournal() {
            this.journalVisible = true;
        },
        closeJournal() {
            this.journalVisible = false;
        },
        openGradeSidebar() {
            this.$toast.add({
                severity: "success",
                summary: this.$t("common.message.succesSaved"),
                life: 3000,
            });
        }

    }
});
</script>
<style></style>