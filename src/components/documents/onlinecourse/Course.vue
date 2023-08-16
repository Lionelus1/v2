<template>
    <div v-if="course">
        <BlockUI :blocked="saving" :fullScreen="true"></BlockUI>
        <div class="surface-card p-4">
            <h3 class="mb-3">{{ course["name" + $i18n.locale] }}</h3>
            <div class="text-500 mb-5">{{ course["description" + $i18n.locale] }}</div>
        </div>
        <TabView>
            <TabPanel :header="$t('course.users')">
                <Button v-if="course && course.students===null" class="btn mb-3" :label="$t('hr.sp.request')"
                        @click="sendRequestToCourse()"/>
                <!--                <h4 class="status text-green-400" v-if="course && course.students===null">Өтінім қаралымда</h4>-->
                <!-- курсқа қатысушылар -->
                <div v-if="course && course.students">
                    <DataTable selectionMode="single" v-model:selection="student" :lazy="true"
                               :totalRecords="course.studentsCount" :value="course.students"
                               @page="studentTableOnPage($event)"
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
                            <div class="table-header flex justify-content-between flex-wrap card-container purple-container">
                                <div class="flex gap-2">
                                    <Button class="p-button-success mb-2" icon="pi pi-plus" :label="$t('common.add')"
                                            @click="addStudent"/>
                                    <Button class="p-button-help mb-2" icon="fa-solid fa-certificate"
                                            :label="$t('course.certificate.issue')" @click="issueCertificate(0)"/>

                                    <Button class="p-button-help mb-2" icon="fa-solid fa-certificate"
                                            :label="$t('course.certificate.issueWithApp')"
                                            @click="issueCertificate(1)"/>
                                    <!--appliction with certif adding-->
                                    <!-- <TabPanel :header="$t('course.modules')">
                                                    <DataTable :value="module">
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
                                            </TabView> -->


                                </div>
                                <span class="p-input-icon-left">
                                    <i class="pi pi-search"/>
                                    <InputText disabled="true" :placeholder="$t('common.search')"/>
                                </span>
                            </div>
                        </template>
                        <Column field="profile.fullName" :header="$t('common.fullName')"></Column>

                        <Column
                                :field="'profile.mainPosition.department.name' + ($i18n.locale).charAt(0).toUpperCase() + ($i18n.locale).slice(1)"
                                :header="$t('common.department')"></Column>
                        <Column header="">
                            <template #body="slotProps">
                                <Button v-if="slotProps.data.state.id === 1" class="p-button-success mr-3"
                                        icon="fa-solid fa-check" label=""
                                        @click="updateUserState(slotProps.data.profile.userID, 4)"/>
                                <Button v-if="slotProps.data.state.id != 1" class="p-button-success mr-3"
                                        icon="fa-solid fa-list-check" label=""
                                        @click="openJournal(slotProps.data.profile.userID)"/>
                                <Button v-if="slotProps.data.certificateUUID" icon="fa-solid fa-award" class="mr-3"
                                        label="" @click="openCertificate(slotProps.data.certificateUUID)"/>
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
                                $t('common.requiredField')
                                }}</small>
                        </div>
                        <template #footer>
                            <div class="flex flex-wrap row-gap-1">
                                <Button :label="$t('common.save')" @click="addStudentsToCourse(4)"
                                        class="w-full p-button-primary"/>
                                <Button :label="$t('common.cancel')" @click="closeStudentDialog"
                                        class="w-full p-button-secondary p-button-outlined"/>
                            </div>

                        </template>
                    </Dialog>

                </div>
            </TabPanel>

            <!-- module қосу table -->
            <TabPanel :header="$t('course.modules')">
                <DataTable :value="module">
                    <template #header>
                        <div
                                class="table-header flex justify-content-between flex-wrap card-container purple-container">
                            <div class="flex gap-2">
                                <Button class="p-button-success" icon="pi pi-plus" :label="$t('common.add')"
                                        @click="addModule"/>
                            </div>
                        </div>
                    </template>
                    <Column :field="'name_' + $i18n.locale" :header="$t('common.name')"></Column>
                    <Column field="hours" :header="$t('course.moduleHours')"></Column>
                    <Column :field="'description_'+ $i18n.locale" :header="$t('common.description')"></Column>
                </DataTable>

            </TabPanel>
        </TabView>
    </div>

  <!-- module қосу диалогы -->
    <Dialog v-model:visible="moduleDialog" :style="{ width: '450px' }" :header="$t('course.module')" :modal="true"
            class="p-fluid">
        <div class="field">
            <label>{{ $t('common.nameInQazaq') }}</label>
            <InputText type="text" v-model="formData.name_kz"></InputText>
            <small class="p-error" v-if="!formData.name_kz && submitted">{{
                $t('common.requiredField')
                }}</small>
        </div>
        <div class="field">
            <label>{{ $t('common.nameInRussian') }}</label>
            <InputText type="text" v-model="formData.name_ru"></InputText>
            <small class="p-error" v-if="!formData.name_ru && submitted">{{
                $t('common.requiredField')
                }}</small>
        </div>
        <div class="field">
            <label>{{ $t('common.nameInEnglish') }}</label>
            <InputText type="text" v-model="formData.name_en"></InputText>
            <small class="p-error" v-if="!formData.name_en && submitted">{{
                $t('common.requiredField')
                }}</small>
        </div>
        <div class="field">
            <label>{{ $t('course.moduleHours') }}</label>
            <InputNumber v-model="formData.hours"></InputNumber>
            <small class="p-error" v-if="!formData.hours && submitted">{{
                $t('common.requiredField')
                }}</small>
        </div>
        <div class="field">
            <label>{{ $t('common.descriptionKz') }}</label>
            <InputText type="text" v-model="formData.description_kz"></InputText>
            <small class="p-error" v-if="!formData.description_kz && submitted">{{
                $t('common.requiredField')
                }}</small>
        </div>
        <div class="field">
            <label>{{ $t('common.descriptionRu') }}</label>
            <InputText type="text" v-model="formData.description_ru"></InputText>
            <small class="p-error" v-if="!formData.description_ru && submitted">{{
                $t('common.requiredField')
                }}</small>
        </div>
        <div class="field">
            <label>{{ $t('common.descriptionEn') }}</label>
            <InputText type="text" v-model="formData.description_en"></InputText>
            <small class="p-error" v-if="!formData.description_en && submitted">{{
                $t('common.requiredField')
                }}</small>
        </div>
        <template #footer>
            <div class="flex flex-wrap row-gap-1">
                <Button :label="$t('common.save')" @click="addModulesToCourse" class="w-full p-button-primary"/>
                <Button :label="$t('common.cancel')" @click="closeModuleDialog"
                        class="w-full p-button-secondary p-button-outlined"/>
            </div>
        </template>
    </Dialog>

    <Sidebar
            v-model:visible="journalVisible"
            position="right"
            class="p-sidebar-lg"
            style="width: 50%;"
            @hide="closeJournal"
    >
        <Card class="mt-3 mb-3">
            <template #content>
                <DataTable :value="journal">
                    <Column :field="'name_' + $i18n.locale" :header="$t('common.name')">
                        <template #body="slotProps">
                            {{ slotProps.data.module["name_" + $i18n.locale] }}
                        </template>
                    </Column>
                    <Column field="grade" :header="$t('course.moduleGrade')">
                        <template #body="slotProps">
                            <InputNumber v-model="slotProps.data.grade"/>
                        </template>
                    </Column>
                    <Column :field="'description_' + $i18n.locale" :header="$t('common.description')">
                        <template #body="slotProps">
                            {{ slotProps.data.module["description_" + $i18n.locale] }}
                        </template>
                    </Column>
                </DataTable>
            </template>
        </Card>
        <Button :label="$t('common.save')" icon="pi pi-check" class="p-button p-component p-button-success mr-2"
                @click="updateJournal()"/>
    </Sidebar>
</template>
<script>
import {OnlineCourseService} from "@/service/onlinecourse.service";
import {smartEnuApi} from "@/config/config";

export default {
    data() {
        return {
            course_id: parseInt(this.$route.params.id),
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
            updateGrades: [],
            // damir
            moduleDialog: false,
            module: null,
            newModules: [],
            newPeriod: [],
            user: null,
            journalVisible: false,
            gradeVisible: false,
            journal: [],
            smartEnuApi: smartEnuApi,
            formData: {},
        }
    },
    created() {
        this.getCourse();
        this.getModuleByCourseID();
    },
    methods: {
        //-------------------------------------------Module
        //ToDo -> Dimash
        sendRequestToCourse() {
            this.newUsers = [];
            this.addStudentsToCourse(1)
        },
        //ToDo -> Dimash check parameters, change alert and student state
        updateUserState(userID, state) {
            this.loading = true;
            this.service.updateUserState(this.course.history[0].id, userID, state).then(response => {
                this.loading = false
                this.$toast.add({
                    severity: "success",
                    summary: this.$t('common.successDone'),
                    life: 3000,
                });
            }).catch(_ => {
                this.loading = false
            });
        },
        getUser() {
            this.moduleDialog = true;
        },
        getModuleByCourseID() {
            this.loading = true
            this.service.getModulesByCourseID(this.$route.params.id).then(response => {
                this.module = response.data;
                this.loading = false
            }).catch(_ => {
                this.loading = false
            });
        },
        getJournal(courseHistoryID, userID) {
            this.loading = true
            this.service.getJournal(courseHistoryID, userID).then(response => {
                this.journal = response.data;
                this.loading = false;
            }).catch(_ => {
                this.loading = false
            });
        },

        addModule() {
            this.moduleDialog = true;
        },
        closeModuleDialog() {
            this.moduleDialog = false;
            this.formData = {};
        },
        addModulesToCourse() {
            this.formData.course_id = parseInt(this.course_id);
            this.submitted = true;
            if (!this.isValid()) {
                return;
            }
            this.saving = true
            this.service.addModulesToCourse(this.formData).then(_ => {
                this.saving = false;
                this.submitted = false;
                this.closeModuleDialog()
                this.getModuleByCourseID();
            }).catch(_ => {
                this.saving = false;
                this.submitted = false;
            })
        },
        isValid() {
            let errors = [];
            if (!this.formData.name_kz)
                errors.push(1);
            if (!this.formData.name_ru)
                errors.push(1);
            if (!this.formData.name_en)
                errors.push(1);
            if (!this.formData.hours)
                errors.push(1);
            if (!this.formData.description_kz)
                errors.push(1);
            if (!this.formData.description_ru)
                errors.push(1);
            if (!this.formData.description_en)
                errors.push(1);

            return errors.length === 0
        },
        openCertificate(uuid) {
            let url = this.smartEnuApi + "/document?qrcode=" + uuid;
            window.open(url, '_blank');
        },

        addStudent() {
            this.studentDialog = true;
        },
        issueCertificate(withApplication) {
            this.saving = true
            this.service.issueCertificate({
                users: null,
                courseID: this.course.id,
                comment: "",
                withApplication: withApplication
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
            this.service.getCourse(this.course_id).then(response => {
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
        addStudentsToCourse(state) {
            this.submitted = true;
            if (this.newUsers.length <= 0 && state != 1) {
                return
            }
            if (!this.course.history || this.course.history.length <= 0) {
                return
            }
            this.saving = true
            this.service.addStudentsToCourse({
                users: this.newUsers,
                courseHistoryID: this.course.history[0].id,
                comment: "",
                state: state,
            }).then(_ => {
                this.saving = false;
                this.submitted = false;
                this.newUsers = []
                this.closeStudentDialog()
                this.getCourseStudents()
                if (state === 1) {
                    this.$toast.add({
                        severity: "success",
                        summary: this.$t("common.message.successCompleted"),
                        life: 3000,
                    });
                }
            }).catch(_ => {
                this.saving = false;
                this.submitted = false;
            })
        },
        openJournal(studentID) {
            this.getJournal(this.course.history[0].id, studentID)
            this.journalVisible = true;
        },
        closeJournal() {
            this.journalVisible = false;
        },
        updateJournal() {
            let journals = this.journal.map(e => {
                const newObjs = {id: e.id, course_history_id: e.course_history_id, grade: e.grade};
                newObjs.module = {id: e.module.id}
                return newObjs
            })
            const dataSend = {journals: journals}
            this.service.updateJournal(dataSend).then(_ => {
                this.$toast.add({
                    severity: "success",
                    summary: this.$t("common.message.succesSaved"),
                    life: 3000,
                });
                this.journalVisible = false

            }).catch(_ => {
                this.$toast.add({
                    severity: "error",
                    summary: this.$t("common.message.saveError"),
                    life: 3000,
                });
            })
        },
        confirm1() {
            this.$confirm.require({
                message: this.$t('common.confirmation'),
                header: this.$t('common.confirm'),
                icon: 'pi pi-exclamation-triangle',
                accept: () => {
                    this.$toast.add({
                        severity: 'success',
                        summary: this.$t("common.message.successCompleted"),
                        life: 3000
                    });
                }
            });
        },
    }
}
</script>
<style></style>