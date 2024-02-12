<template>
    <div v-if="course">
        <BlockUI :blocked="saving" :fullScreen="true"></BlockUI>
        <TitleBlock class="content_title" :title="$t('Онлайн курс')" :show-back-button="true"/>
        <div class="course_card block sm:flex p-4">
<!--          <img :src="course.logo" alt="">-->
          <div class="text text-white">
            <div class="flex mb-4">
              <h5 class="mb-0 mr-2">{{ course["name" + $i18n.locale] }}</h5>
<!--              <Tag class="ql-size-small" icon="pi pi-star-fill" value="4,9"></Tag>-->
            </div>
            <p class="text-gray-400">{{ $t('fieldEducation.duration') }} : {{course.hours}}</p>
            <p class="text-gray-400">{{ $t('fieldEducation.trainingFormat') }}:
              <span v-if="course.courseType === 1">{{ $t('fieldEducation.online') }}</span>
              <span v-if="course.courseType === 2">{{ $t('fieldEducation.offline') }}</span>
              <span v-if="course.courseType === 3">{{ $t('fieldEducation.mixed') }}</span>
            </p>
          </div>
        </div>
        <TabView>
          <TabPanel :header="$t('fieldEducation.aboutCourse')">
            <div class="content">
              <p class="title font-bold">{{ $t('fieldEducation.purposeCourse') }}</p>
              <p>{{course.descriptionkz}} {{course.descriptionru}} {{course.descriptionen}}</p>
              <p class="title font-bold">{{ $t('fieldEducation.briefSummary') }}</p>
              <p>{{course.annotationKz}} {{course.annotationRu}} {{course.annotationEn}}</p>
            </div>
<!--           <div class="course_footer">
             <div class="footer_title font-bold mb-4">
               {{ $t('fieldEducation.teachers') }}
             </div>
             <div class="content">
                <div class="img_card">
                  <img src="https://edtech4beginnerscom.files.wordpress.com/2021/05/1.png" alt="">
                  <div class="name">Teacher</div>
                </div>
             </div>
           </div>-->
          </TabPanel>
          <TabPanel :header="$t('course.users')">
              <Button v-if="students.length === 0 && dic_course_type == 1" class="btn mb-3" :label="$t('hr.sp.request')"
                      @click="sendRequestToCourse()"/>

            <!-- курсқа қатысушылар -->
              <div v-if="students">
                  <DataTable class="p-datatable-sm" selectionMode="single" v-model:selection="student" :lazy="true"
                             :totalRecords="studentsCount" :value="students"
                             @page="studentTableOnPage($event)" :first="studentLazyParams.first"
                             :paginator="true" :rows="studentLazyParams.rows"
                             dataKey="profile.userID" :rowHover="true" :loading="loading"
                             paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink JumpToPageDropdown CurrentPageReport RowsPerPageDropdown"
                             :rowsPerPageOptions="[10, 25, 50]" :currentPageReportTemplate="$t('common.showingRecordsCount', {
                          first: '{first}',
                          last: '{last}',
                          totalRecords: '{totalRecords}',
                      })" responsiveLayout="stack" breakpoint="480px">

                      <template #header>
                          <div class="table-header flex justify-content-between flex-wrap card-container purple-container">
                              <div class="flex gap-2 flex-column sm:flex-row">
                                  <Button v-if="findRole(null,'online_course_administrator') && dic_course_type === 1"
                                          class="p-button-success mb-2" icon="pi pi-plus" :label="$t('common.add')"
                                          @click="addStudent"/>

                                  <Button v-if="findRole(null,'online_course_administrator') && dic_course_type === 1"
                                          class="p-button-help mb-2" icon="fa-solid fa-certificate"
                                          :label="$t('course.certificate.issue')" @click="openIssueCertificateDialog"/>

                                  <Button v-if="findRole(null,'online_course_administrator') && dic_course_type === 1"
                                          class="p-button-help mb-2" icon="fa-solid fa-file-circle-check"
                                          :label="$t('course.certificate.issueWithApp')"
                                          @click="openIssueCertificateWithDialog"/>

                                <ActionButton v-if="findRole(null,'online_course_administrator') && dic_course_type === 1" :show-label="true" :items="menu" @toggle="toggleAction(data)"></ActionButton>

                              </div>
                              <span v-if="findRole(null,'online_course_administrator')" class="p-input-icon-left">
                                  <i class="pi pi-search"/>
                                  <InputText type="search" v-model="searchText" @keyup.enter="getCourseStudents"  @search="getCourseStudents" :placeholder="$t('common.search')"/>
                              </span>
                          </div>
                      </template>
                      <Column field="profile.fullName" :header="$t('common.fullName')"></Column>

                      <Column
                              :field="'profile.mainPosition.department.name' + ($i18n.locale).charAt(0).toUpperCase() + ($i18n.locale).slice(1)"
                              :header="$t('common.department')"></Column>
                      <Column
                          :field="'state.name' + ($i18n.locale)"
                          :header="$t('common.status')"></Column>
                      <Column header="">
                          <template #body="slotProps">
                            <div class="buttons-container">
                              <div class="buttons-row">
                                <Button v-if="slotProps.data.state.id === 1 && findRole(null,'online_course_administrator')"
                                        class="p-button-success mr-3" icon="fa-solid fa-check"
                                        v-tooltip.bottom="$t('course.addCourse')" label=""
                                        @click="updateUserState(slotProps.data.profile.userID, 2)"/>
                                <Button v-if="slotProps.data.state.id != 1 && dic_course_type == 1" class="p-button-success mr-3"
                                        icon="fa-solid fa-list-check" v-tooltip.bottom="$t('course.journal')" label=""
                                        @click="openJournal(slotProps.data.profile.userID, slotProps.data.state.id)"/>
                                <Button v-if="slotProps.data.certificateUUID" icon="fa-solid fa-award" class="mr-3"
                                        v-tooltip.bottom="$t('course.certificate.view')" label=""
                                        @click="openCertificate(slotProps.data.certificateUUID)"/>
                                <Button v-if="slotProps.data.certificateUUID" icon="pi pi-fw pi-qrcode"
                                        class="p-button-help mr-3" v-tooltip.bottom="$t('course.certificate.getQr')"
                                        label="" @click="getQR(slotProps.data.certificateUUID)"/>
                              </div>

<!--                              <div class="delete-button">-->
<!--                                <Button class="p-button-text p-button-danger p-1 trash-button" icon="fa-solid fa-trash-can fa-xl"/>-->
<!--                              </div>-->
                            </div>
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

                          <FindUser id="newUsers" v-model="newUsers" userType="3"></FindUser>
                          <small class="p-error" v-if="submitted && !(newUsers && newUsers.length > 0)">{{
                              $t('common.requiredField')
                              }}</small>
                      </div>
                      <template #footer>
                          <div class="flex flex-wrap row-gap-1">
                              <Button :label="$t('common.save')" @click="addStudentsToCourse(2)"
                                      class="w-full p-button-primary"/>
                              <Button :label="$t('common.cancel')" @click="closeStudentDialog"
                                      class="w-full p-button-secondary p-button-outlined"/>
                          </div>

                      </template>
                  </Dialog>

                  <Dialog v-model:visible="issueCertificateDialog" :style="{ width: '500px' }">
                      <template #header>
                          <div>
                              <i class="pi pi-exclamation-triangle mr-2"></i>
                              {{ $t('course.certificate.confirm') }}
                          </div>
                      </template>
                      <label>{{ $t('common.nextIssue') }}</label>
                      <template #footer>
                          <div class="flex justify-content-between">
                                  <InputText type="text" v-model="organizer.lastNumber"></InputText>
                                  <div>
                                      <Button v-if="findRole(null,'online_course_administrator')"
                                          :label="$t('common.yes')" @click="issueCertificate(0)"/>

                                      <Button :label="$t('common.no')" @click="closeIssueCertificateDialog"
                                      class="p-button-outlined"/>
                                  </div>
                          </div>

                      </template>

                  </Dialog>

                  <Dialog v-model:visible="issueCertificateWithDialog" :style="{ width: '500px' }">
                      <template #header>
                          <div>
                              <i class="pi pi-exclamation-triangle mr-2"></i>
                              {{ $t('course.certificate.confirm2') }}
                          </div>
                      </template>

                      <label>{{ $t('common.nextIssue') }}</label>
                      <template #footer>
                          <div class="flex justify-content-between">
                              <InputText type="text" v-model="organizer.lastNumber"></InputText>
                              <div>
                                  <Button v-if="findRole(null,'online_course_administrator')"
                                          :label="$t('common.yes')"
                                          @click="issueCertificate(1)"/>
                                  <Button :label="$t('common.no')" @click="closeIssueCertificateWithDialog"
                                          class="p-button-secondary p-button-outlined"/>
                              </div>

                          </div>
                      </template>

                  </Dialog>

              </div>
          </TabPanel>
          <!-- module қосу table -->
          <TabPanel :header="$t('course.modules')" v-if="dic_course_type == 1">
              <div class="module_grid">
                <div class="module_card" v-for="item of module" :key="item">
                  <div class="content">
                    <img src="https://www.mooc.org/hubfs/are-free-online-courses-worth-it.jpg" alt="">
                    <p>{{ item['name_' + $i18n.locale] }}</p>
                  </div>
                  <div class="footer">
                    <hr>
                    <i class="pi pi-list" @click="toggle"></i>
                  </div>
                </div>
              </div>
              <OverlayPanel ref="op">
                <Button class="p-button-raised" icon="pi pi-fw pi-desktop" :label="$t('Презентация')"/>
                <br>
                <Button class="p-button-outlined w-full" icon="pi pi-fw pi-desktop" :label="$t('Тест')"/>
              </OverlayPanel>
                <DataTable :value="module">
                    <template #header>
                        <div
                                class="table-header flex justify-content-between flex-wrap card-container purple-container">
                            <div class="flex gap-2">
                                <Button v-if="findRole(null,'online_course_administrator')" class="p-button-success"
                                        icon="pi pi-plus" :label="$t('common.add')" @click="addModule"/>
                            </div>
                        </div>
                    </template>
                    <Column field="name_kz" :header="$t('common.name')"></Column>
                    <Column field="hours" :header="$t('course.moduleHours')"></Column>
                    <Column :field="'description_' + $i18n.locale" :header="$t('common.description')"></Column>
                    <Column field="">
                        <template #body="{data}">
                            <Button v-if="findRole(null, 'online_course_administrator')" class="p-button-warning mb-2 mr-2"
                                icon="pi pi-pencil" label="" @click="updateModule(data)"/>

                            <Button v-if="findRole(null,'online_course_administrator')" class="p-button-danger mb-2 mr-2"
                                    icon="fa-solid fa-trash" label="" @click="deleteModule(data.id)"/>
                        </template>
                    </Column>
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
            <div class="flex flex-wrap row-gap-1" v-if="!formData.id" >
                <Button :label="$t('common.save')" @click="addModulesToCourse" class="w-full p-button-primary"/>
                <Button :label="$t('common.cancel')" @click="closeModuleDialog"
                        class="w-full p-button-secondary p-button-outlined"/>
            </div>
            <div class="flex flex-wrap row-gap-1" v-if="formData.id">
                <Button :label="$t('common.save')" @click="updateModuleOfCourse" class="w-full p-button-primary"/>
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
                    <Column field="name" :header="$t('common.name')">
                        <template #body="slotProps">
                            {{ slotProps.data.module["name_" + $i18n.locale] }}
                        </template>
                    </Column>
                    <Column field="grade" :header="$t('course.moduleGrade')">
                        <template #body="slotProps">
                            <InputNumber :disabled="!findRole(null,'online_course_administrator')" v-model="slotProps.data.grade"/>
                        </template>
                    </Column>
                    <Column field="hours" :header="$t('course.moduleHours')">
                        <template #body="slotProps">
                            {{slotProps.data.module.hours}}
                        </template>
                    </Column>
                    <Column field="description" :header="$t('common.description')">
                        <template #body="slotProps">
                            {{ slotProps.data.module["description_" + $i18n.locale] }}
                        </template>
                    </Column>
                </DataTable>
            </template>
        </Card>
        <Button v-if="findRole(null,'online_course_administrator')" :label="$t('common.save')" icon="pi pi-check" class="p-button p-component p-button-success mr-2"
                @click="updateJournal()"/>
        <Button v-if="findRole(null,'online_course_administrator') && stateID !== 5" :label="$t('course.completedTraining')" icon="pi pi-check" class="p-button p-component mr-2"
                @click="updateUserState(userID, 4)" :disabled="!isButtonDisabled"/>
    </Sidebar>

    <Sidebar v-model:visible="qrVisible"
             position="right"
             class="p-sidebar-lg">
        <QrGenerator :data="this.qrUrl" :showBackButton="false"/>
    </Sidebar>
</template>
<script>
import {OnlineCourseService} from "@/service/onlinecourse.service";
import {smartEnuApi, getHeader, findRole, fileRoute} from "@/config/config";
import api from "@/service/api";
import QrGenerator from "@/components/QrGenerator.vue";
import {ref} from "vue";
import ActionButton from "@/components/ActionButton.vue";

export default {
    components: {ActionButton, QrGenerator},
    data() {
        return {
            qrVisible: false,
            qrUrl: null,
            course_id: parseInt(this.$route.params.id),
            loading: false,
            service: new OnlineCourseService(),
            course: null,
            organizer: {},
            students: [],
            saving: false,
            student: null,
            modules: [],
            studentsCount: 10,
            studentLazyParams: {
                page: 0,
                rows: 10,
            },
            submitted: false,
            studentDialog: false,
            issueCertificateDialog: false,
            issueCertificateWithDialog: false,
            newUsers: [],
            updateGrades: [],

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
            reqBtn: true,
            statusText: false,
            userID: null,
            stateID: null,
            searchText: '',
            searchData: {},
            dic_course_type: null,
            op: ref(),
            menu: [
              {
                label: this.$t("course.completedTraining"),
                icon: 'fa-solid fa-check',
                command: () => {this.updateUserState(null, 4)}
              },
            ],
            actionsNode: null

        }
    },
    created() {
        /*let oldPath = this.$router.options.history.state.forward;
        if (oldPath && oldPath.indexOf('/qr?url') !== -1) {
            this.studentLazyParams = JSON.parse(localStorage.getItem("course_page"))
            this.studentLazyParams.first =  this.studentLazyParams.rows * this.studentLazyParams.page
        }*/
        this.getCourse();
        this.getCourseStudents();
        this.getModuleByCourseID();
    },
    methods: {
        check(dic_course_type) {
            console.log(dic_course_type)
        },
        findRole: findRole,
        sendRequestToCourse() {
            this.$confirm.require({
                message: this.$t('common.confirmation'),
                header: this.$t('common.confirm'),
                icon: 'pi pi-exclamation-triangle',
                accept: () => {
                    this.newUsers = [];
                    this.addStudentsToCourse(1)
                    //this.$toast.add({ severity: 'success', summary: this.$t("common.message.successCompleted"), life: 3000 });
                    this.reqBtn = false
                    this.statusText = true
                }
            });

        },

        updateUserState(userID, state) {
            this.loading = true;
            if (this.journal != null)
                this.updateJournal();
            this.service.updateUserState(this.course.history[0].id, userID, state).then(response => {
                this.loading = false
                this.$toast.add({
                    severity: "success",
                    summary: this.$t('common.successDone'),
                    life: 3000,
                });
                this.getCourseStudents();
                this.journalVisible = false
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
            this.formData = {};
        },
        closeModuleDialog() {
            this.moduleDialog = false;
            this.formData = {};
        },
        addModulesToCourse() {
            console.log('rrrrrr:  ', this.formData)
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
                this.getModuleByCourseID()
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
        getQR(uuid) {
            this.qrUrl = this.smartEnuApi + "/document?qrcode=" + uuid;
            // if (url) {
            //     this.$router.push({path: "/qr", query: {url}})
            // }

            this.qrVisible = true;
        },

        addStudent() {
            this.studentDialog = true;
        },
        openIssueCertificateDialog() {
            this.issueCertificateWithDialog = false;
            this.issueCertificateDialog = true;
            this.getCourseOrganizerByCourseID()
        },

        openIssueCertificateWithDialog() {
            this.issueCertificateDialog = false;
            this.issueCertificateWithDialog = true;
            this.getCourseOrganizerByCourseID()
        },

        issueCertificate(withApplication) {
            this.saving = true
            this.service.issueCertificate({
                users: null,
                courseID: this.course.id,
                comment: "",
                withApplication: withApplication,
                lastNumber: parseInt(this.organizer.lastNumber-1)
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
            })
            .finally(() => {
                this.saving = false;
                this.submitted = false;
                this.issueCertificateWithDialog = false
                this.issueCertificateDialog = false
            })
        },
        getCourseOrganizerByCourseID() {
            this.loading = true

            this.service.getCourseOrganizerByCourseID(this.course_id).then(response => {
                this.organizer = response.data.organizer
                this.organizer.lastNumber++
                this.loading = false
            }).catch(_ => {
                this.loading = false
            });
        },
        closeStudentDialog() {
            this.studentDialog = false;
            this.newUsers = []
        },

        closeIssueCertificateDialog() {
            this.issueCertificateDialog = false;
        },

        closeIssueCertificateWithDialog() {
            this.issueCertificateWithDialog = false;
        },

        getCourse() {
            this.loading = true
            this.service.getCourse(this.course_id).then(response => {
              console.log(response)
                this.course = response.data
                this.course.logo = smartEnuApi + fileRoute + this.course.logo
                /*if (this.course.students) {
                    this.course.students = response.data.students
                } else {
                        this.statusText = true
                        this.reqBtn = false
                    }*/
                this.loading = false
            }).catch(_ => {
                this.loading = false
            });
        },
        studentTableOnPage(event) {
            this.studentLazyParams = event;
            this.getCourseStudents();
        },
        getCourseStudents() {
            this.loading = true
            const requestData = {
                courseID: this.course_id,
                page: this.studentLazyParams.page,
                rows: this.studentLazyParams.rows,
                searchText: this.searchText,
            };

            //localStorage.setItem("course_page", JSON.stringify(this.studentLazyParams));
            this.service.getCourseStudents(requestData).then(response => {
                if (response.data.students) {
                    this.students = response.data.students
                }
                this.studentsCount = response.data.total
                this.dic_course_type = response.data.dic_course_type
                this.loading = false
            }).catch(_ => {
                this.loading = false
            });
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

            }).catch(_ => {
                this.saving = false;
                this.submitted = false;
            })
        },
        openJournal(studentID,stateID) {
            this.userID = studentID
            this.stateID = stateID
            this.getJournal(this.course.history[0].id, studentID)
            this.journalVisible = true;
        },
        closeJournal() {
            this.journalVisible = false;
        },
        updateJournal() {
            if (this.journal == null) {
                return
            }
            let journals = this.journal.map(e => {
                const newObjs = {
                    id: e.id,
                    course_history_student_rel_id: e.course_history_student_rel_id,
                    grade: e.grade
                };
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
        deleteModule(id) {
            this.$confirm.require({
                message: this.$t('common.doYouWantDelete'),
                header: this.$t('common.delete'),
                icon: 'pi pi-info-circle',
                acceptClass: 'p-button-rounded p-button-success',
                rejectClass: 'p-button-rounded p-button-danger',
                accept: () => {
                    this.service.deleteModule(id).then(res => {
                        this.getModuleByCourseID();
                        this.$toast.add({severity: "success", summary: this.$t("common.success"), life: 3000});
                    }).catch(error => {
                        console.log(error);
                        this.$toast.add({severity: "error", summary: this.$t("common.message.saveError"), life: 3000});
                    })
                }
            });
        },
        updateModule(data) {
            this.moduleDialog = true;

            this.formData = data;
        },

        updateModuleOfCourse() {
            this.formData.course_id = parseInt(this.course_id);
            this.submitted = true;
            if (!this.isValid()) {
                return;
            }

            this.saving = true;
            this.service.updateModuleOfCourse(this.formData).then(_ => {
                this.saving = false;
                this.submitted = false;
                this.closeModuleDialog();
            }).catch(_ => {
                this.saving = false;
                this.submitted = false;
            });
        },
        toggle (event) {
          this.$refs.op.toggle(event);
        },
        toggleAction (node)  {
          this.actionsNode = node
        }
    },
    computed: {
        isButtonDisabled() {
            return this.journal.every(item => item.grade !== null);
        }
    },
}
</script>
<style lang="scss">
.course_card{
  background: #293042;
  img{
    margin-right: 20px;
    width: 240px;
    height: 160px;
    object-fit: cover;
    //object-position: bottom;
  }
}
.course_footer{
  margin-top: 40px;
  .content{
    padding: 40px;
    background: #293042;
    .img_card{
      width: 100px;
      height: 100px;
      color: #fff;
      border-radius: 50%;
      text-align: center;
      img{
        width: 100%;
        height: 100%;
        border-radius: inherit;
        object-fit: cover;
      }
    }
  }
}
.module_grid{
  width: fit-content;
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(4, 1fr);
}
.module_card{
  display: flex;
  flex-direction: column;
  width: 240px;
  border: 1px solid #ccc;
  border-radius: 3px;
  padding: 10px;
  .content{
    flex: 1;
  }
  img {
    width: 100%;
  }
  i{
    text-align: right;
  }
}
.content_title{
  h3{
    font-size: 20px;
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

.custom-action-button {
  height: 34px;
}
</style>
