<template>
  <ConfirmPopup group="deleteResult"></ConfirmPopup>
  <vue-element-loading :active="isBlockUI" is-full-screen color="#FFF" size="80" :text="$t('common.loading')" backgroundColor="rgba(0, 0, 0, 0.4)"/>
  <div class="col-12" v-if="plan && event">
    <div>
      <div v-if="!resultId" @click="navigateToBack" class="inline-block"><i class="fa-solid fa-arrow-left mr-3" style="font-size: 16px;cursor: pointer"></i>
      </div>
      <div class="mb-0 mt-0 inline-block" style="font-size: 24px"> {{ $t('common.result') }}</div>
    </div>
    <div v-if="resultData && resultData[0].plan_event_result_history[0].state_id === 6">
      <div v-if="resultData && event && resultData[0].reject_history">
        <div class="p-fluid">
          <br/>
          <div class="field">
            <label>{{ $t('common.state') }}:</label>
            <div>
            <span v-if="event" :class="'customer-badge status-' + event.status.work_plan_event_status_id">
            {{
                $i18n.locale === "kz" ? event.status.name_kz : $i18n.locale === "ru" ? event.status.name_ru :
                    event.status.name_en
              }}
          </span>

            </div>
          </div>
          <div class="field" v-if="resultData[0].reject_history.user">
            <label>{{ $t('contracts.assigner') }}:</label>
            <div>
              <b>{{ resultData[0].reject_history.user.fullName }}</b>
            </div>
          </div>
          <div class="field" v-if="resultData[0].reject_history.created_date">
            <label>{{ $t('common.date') }}:</label>
            <div>
              <b>{{ formatDateMoment(resultData[0].reject_history.created_date) }}</b>
            </div>
          </div>
          <div class="field">
            <label>{{ $t('common.comment') }}:</label>
            <div>
              <Message :closable="false" severity="warn"><span v-html="resultData[0].reject_history.message"></span>
              </Message>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div>
      <TabView v-model:activeIndex="activeIndex" @tab-change="changeTab">
        <TabPanel :header="$t('common.properties')">
          <div
              v-if="event &&
              (isCurrentUserApproval && (event.status.work_plan_event_status_id === 1 || event.status.work_plan_event_status_id === 4 || event.status.work_plan_event_status_id === 6))">
            <Menubar :model="userMenuItems" :key="active" style="height: 36px;margin-top: -7px;margin-left: -14px;margin-right: -14px;"></Menubar>
          </div>
          <div v-if="isPlanCreator && event && event.status.work_plan_event_status_id === 5">
            <Menubar :model="verifyMenu" :key="active" style="height: 36px;margin-top: -7px;margin-left: -14px;margin-right: -14px;"></Menubar>
          </div>
          <div class="grid mt-3" v-if="plan && resultData && (new Date(plan.create_date).getFullYear() < new Date().getFullYear())">
            <div class="p-sm-12 md:col-12 lg:col-12 p-xl-6">
              <div class="field" v-if="event && isOperPlan">
                <label class="bold">{{ $t('common.fact') }}: </label>
                <div>{{ event.fact }}</div>
              </div>
              <div class="field" v-if="plan && resultData && !isSciencePlan">
                <label class="bold">{{ $t('common.result') }}</label>
                <div v-if="resultData[0].event_result" class="mb-2">
                  <Divider align="left">
                    <i class="fa-solid fa-user mr-1"></i><b>{{ item.user.fullName }}</b>
                  </Divider>
                  <p v-html="resultData[0].event_result"></p>
                </div>
                <div v-else v-for="(item, index) of resultData[0].result_text" :key="index" class="mb-2">
                  <Divider align="left">
                    <i class="fa-solid fa-user mr-1"></i><b>{{ item.user.fullName }}</b>
                  </Divider>
                  <p v-html="item.text"></p>
                </div>
              </div>
              <div class="field" v-if="resultData && resultData[0].result_files">
                <label class="bold">{{ $t('workPlan.attachments') }}</label>
                <div ref="content" class="p-fileupload-content">
                  <div class="p-fileupload-files">
                    <div class="p-fileupload-row" v-for="(file, index) of resultData[0].result_files" :key="index">
                      <span class="mr-3" style="cursor: pointer;" @click="downloadFile(file)"><i
                          class="fa-solid fa-file-arrow-down fa-2x color-success"></i></span>
                      <span @click="downloadFile(file)"
                            style="cursor: pointer;">{{
                          file.file_name ? file.file_name : file.event_result_file
                        }}</span>
                      <span class="ml-5" v-if="file.user_id && file.user_id === loginedUserId"><Button
                          icon="pi pi-times" class="p-button-rounded p-button-text"
                          v-if="event && (event.status.work_plan_event_status_id !== 5 && event.status.work_plan_event_status_id !== 2)"
                          @click="deleteFileConfirm($event, file.id)"/></span>
                    </div>
                  </div>
                  <div class="p-fileupload-empty" v-if="files.length === 0">
                    <slot name="empty"></slot>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="grid mt-3" v-else>
            <!-- p-sm-12 md:col-12 lg:col-6 p-xl-6 -->
            <div class="p-fluid" v-if="(!isPlanCreator && (isPlanCreatorApproval || !isPlanCreator) &&
              event.status.work_plan_event_status_id !== 5 &&
              event.status.work_plan_event_status_id !== 2 && event.status.work_plan_event_status_id !== 6) || (isRespUser && isPlanCreator && (isPlanCreatorApproval || !isPlanCreator) &&
              event.status.work_plan_event_status_id !== 5 &&
              event.status.work_plan_event_status_id !== 2 && event.status.work_plan_event_status_id !== 6)">

              <div class="field">
                <label>{{ $t('workPlan.eventName') }}</label>
                <InputText v-model="event.event_name" disabled/>
              </div>
              <div class="field" v-if="plan && plan.is_oper && !authUser.mainPosition.department.isFaculty">
                <label>{{ $t('common.fact') }}</label>
                <InputText v-model="fact" @input="factChange"/>
              </div>
              <div class="field" v-if="!hasResultToApprove">
                <label>{{ $t('common.result') }}</label>
                <TinyEditor v-if="plan && isRespUserForWrite && !isOperPlan" v-model="result" :min-word="wordLimit" @wordCount="initWordCount" :height="300"
                            :style="{ height: '100%', width: '100%' }"
                            @selectionChange="editorChange"/>
                <TinyEditor v-if="plan && isRespUserForWrite && !isSciencePlan && isOperPlan" v-model="newResult" :height="300" @selectionChange="editorChange"/>
                <small v-if="isSciencePlan && submitted && (wordCount < wordLimit)" class="p-error">{{ $t('workPlan.minWordCount') }}</small>
              </div>
              <!-- <div class="field" v-if="!hasResultToApprove && plan && isRespUserForWrite">
                <label>{{ $t('common.result') }}</label>

                <TinyEditor
                  :v-model="newResult || result"
                  :min-word="wordLimit"
                  @wordCount="initWordCount"
                  :height="300"
                  :style="{ height: '100%', width: '100%' }"
                  @selectionChange="editorChange"
                />

                <small v-if="isSciencePlan && submitted && (inputWordCount < wordLimit)" class="p-error">{{$t('workPlan.minWordCount')}}</small>
              </div> -->
              <div class="field" v-if="plan && isRespUserForWrite">
                <FileUpload ref="form" mode="basic" :customUpload="true" @uploader="uploadFile($event)" :auto="true" :multiple="true"
                            :chooseLabel="$t('smartenu.chooseAdditionalFile')"></FileUpload>
              </div>
              <div class="field">
                <div ref="content" class="p-fileupload-content">
                  <div class="p-fileupload-files">
                    <div class="p-fileupload-row" v-for="(file, index) of files" :key="index">
                      <span class="mr-3"><i class="pi pi-paperclip"></i></span>
                      <span>{{ file.name }}</span>
                      <span class="ml-5">
                        <Button icon="pi pi-times" class="p-button-rounded p-button-text" @click="removeFile(index)"/>
                      </span>
                    </div>
                  </div>
                  <div class="p-fileupload-empty" v-if="files.length === 0">
                    <slot name="empty"></slot>
                  </div>
                </div>
              </div>
            </div>
            <div class="p-sm-12 md:col-12 lg:col-12 p-xl-6">
              <div class="field" v-if="event && plan && plan.is_oper && !authUser.mainPosition.department.isFaculty">
                <label class="bold">{{ $t('common.fact') }}: </label>
                <div>{{ event.fact }}</div>
              </div>
              <!-- Start Editing -->
              <div class="field" v-if="plan && resultData">
                <!-- <label class="bold">{{ $t('common.result') }}</label> -->
                <!-- {{ resultData[0] }} -->

                <div v-for="(item, index) of resultData" :key="index" class="mb-2">
                  <Divider align="left">
                    <div class="flex justify-content-center align-items-center">
                      <div class="flex flex-column justify-content-center align-items-start">
                        <span class="pb-2"><i class="fa-solid fa-user mr-1"></i><b>{{ item.user.fullName }}</b></span>
                        <span class="pb-2">{{ formatDateMoment(item.plan_event_result_history[0].create_date) }}</span>
                      </div>
                      <div class="ml-3">
                        <span :class="'customer-badge status-' + item.plan_event_result_history[0].state_id">{{
                            getResultStatus(item.plan_event_result_history[0].state_id)
                          }}</span>
                      </div>
                    </div>

                  </Divider>
                  <Inplace v-if="(item.result_text && (loginedUserId === item.result_text[0].user.userID) && event &&
                    (item.plan_event_result_history && item.plan_event_result_history[0].state_id === 6)) || (item.result_text && isPlanCreator && event &&
                    (item.plan_event_result_history && item.plan_event_result_history[0].state_id === 5) && isSciencePlan)" :active="item.isActive" @open="openInplace(item)">
                    <template #display>
                      <div>
                        <span class="mr-1" style="float:left;"><i class="fa-solid fa-pen color-success"></i></span>
                        <p class="p-0 m-0" v-html="item.result_text[0].text"></p>
                      </div>

                    </template>
                    <template #content>
                      <div class="py-2"
                           v-if="((item.plan_event_result_history[0].state_id === 6) && (loginedUserId === item.result_text[0].user.userID)) || (isPlanCreator && isSciencePlan && (item.plan_event_result_history[0].state_id === 5))">
                        <Button :label="$t('common.save')" icon="pi pi-check" class="p-button p-button-success" @click="saveEditResult(item)"
                                :loading="loading"/>
                        <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button ml-1" @click="cancelEdit(item)"/>
                        <!--                        <Button :label="$t('common.delete')" icon="pi pi-trash" class="p-button p-button-danger ml-1" @click="deleteConfirmItem($event, item)" />-->
                      </div>
                      <div class="field">
                        <TinyEditor v-model="item.result_text[0].text" :height="300" :style="{ height: '100%', width: '100%' }"/>
                      </div>
                      <!--Edit jaslaganda-->
                      <div class="field">
                        <FileUpload ref="form" mode="basic" :customUpload="true" @uploader="uploadFile($event)" :auto="true" :multiple="true"
                                    :chooseLabel="$t('smartenu.chooseAdditionalFile')"></FileUpload>
                      </div>
                      <div class="field">
                        <div ref="content" class="p-fileupload-content">
                          <div class="p-fileupload-files">
                            <div class="p-fileupload-row" v-for="(file, index) of files" :key="index">
                              <span class="mr-3"><i class="pi pi-paperclip"></i></span>
                              <span>{{ file.name }}</span>
                              <span class="ml-5">
                                <Button icon="pi pi-times" class="p-button-rounded p-button-text" @click="removeFile(index)"/>
                              </span>
                            </div>
                          </div>
                          <div class="p-fileupload-empty" v-if="files.length === 0">
                            <slot name="empty"></slot>
                          </div>
                        </div>
                      </div>
                      <div class="p-fileupload-files">
                        <div class="p-fileupload-row" v-for="(file, index) of item.result_files" :key="index">
                          <span class="mr-3" style="cursor: pointer;" @click="downloadFile(file)">
                            <i class="fa-solid fa-file-arrow-down fa-lg color-success"></i></span>
                          <span @click="downloadFile(file)" style="cursor: pointer;">{{
                              file.file_name ? file.file_name : file.event_result_file
                            }}</span>
                          <span class="ml-5" v-if="file.user_id && file.user_id === loginedUserId"><Button icon="pi pi-times"
                                                                                                           class="p-button-rounded p-button-text"
                                                                                                           v-if="event && item.plan_event_result_history[0].state_id === 6"
                                                                                                           @click="deleteFileConfirm($event, file.id)"/></span>
                        </div>
                      </div>
                      <div class="p-fileupload-empty" v-if="files.length === 0">
                        <slot name="empty"></slot>
                      </div>
                      <!--End Edit jaslaganda-->
                    </template>
                  </Inplace>
                  <div v-else class="p-0">
                    <p v-html="item.result_text[0].text"></p>
                  </div>
                  <br/>
                  <div class="" v-if="resultData && item.result_files">
                    <label class="bold"><strong>{{ $t('workPlan.attachments') }}</strong></label>
                    <div ref="content" class="p-fileupload-content" style="padding-top: 7px;">

                      <div class="p-fileupload-files">
                        <div class="p-fileupload-row" v-for="(file, index) of item.result_files" :key="index">
                          <span class="mr-3" style="cursor: pointer;" @click="downloadFile(file)">
                            <i class="fa-solid fa-file-arrow-down fa-lg color-success"></i></span>
                          <span @click="downloadFile(file)" style="cursor: pointer;">{{
                              file.file_name ? file.file_name : file.event_result_file
                            }}</span>

                        </div>
                      </div>
                      <div class="p-fileupload-empty" v-if="files.length === 0">
                        <slot name="empty"></slot>
                      </div>
                    </div>
                  </div>
                  <div style="margin-left: -12px;" v-if="isPlanCreator">
                    <!-- {{ item.result_text }} -->
                    <Button v-if="(item.plan_event_result_history[0].state_id === 5)" icon="pi pi-fw pi-check" class="p-button-rounded p-button-text"
                            @click="confirmToInspected(isInspected, item.user.userID, item.event_result_id)" :label="$t('common.action.accept')"></Button>
                    <Button v-if="(item.plan_event_result_history[0].state_id === 5)" icon="pi pi-fw pi-times" class="p-button-rounded p-button-text"
                            @click="showToCorrectSidebarNew(item.user.userID, item.event_result_id)" :label="$t('workPlan.toCorrect')"></Button>
                    <br/><br/>
                    <!-- <hr style="border-top: 1px dotted #999;"/> -->
                  </div>
                  <div v-else class="p-0">
                    <span style="float:right;margin-top: -7px;" v-if="isPlanCreator">
                      <Button icon="pi pi-fw pi-check" class="p-button-rounded p-button-text" @click="verify(true)" :label="$t('common.action.accept')"></Button>
                      <Button icon="pi pi-fw pi-times" class="p-button-rounded p-button-text" @click="showToCorrectSidebar()"
                              :label="$t('workPlan.toCorrect')"></Button>
                    </span>
                  </div>

                </div>
              </div>
              <div v-else>
                {{ $t('common.noData') }}
              </div>
              <!-- End Editing -->
              <div class="field" v-if="resultData && resultData.result_files">
                <label class="bold">{{ $t('workPlan.attachments') }}</label>
                <div ref="content" class="p-fileupload-content">
                  <div class="p-fileupload-files">
                    <div class="p-fileupload-row" v-for="(file, index) of resultData.result_files" :key="index">
                      <span class="mr-3" style="cursor: pointer;" @click="downloadFile(file)">
                        <i class="fa-solid fa-file-arrow-down fa-2x color-success"></i></span>
                      <span @click="downloadFile(file)" style="cursor: pointer;">{{
                          file.file_name ? file.file_name : file.event_result_file
                        }}</span>
                      <span class="ml-5" v-if="file.user_id && file.user_id === loginedUserId"><Button icon="pi pi-times" class="p-button-rounded p-button-text"
                                                                                                       v-if="event && (event.status.work_plan_event_status_id !== 5 && event.status.work_plan_event_status_id !== 2)"
                                                                                                       @click="deleteFileConfirm($event, file.id)"/></span>
                    </div>
                  </div>
                  <div class="p-fileupload-empty" v-if="files.length === 0">
                    <slot name="empty"></slot>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabPanel>
        <TabPanel :header="$t('common.history')">
          <!-- <table>
            <thead>
            <tr style="font-weight: bolder;">
              <td>ID</td>
              <td>{{ $t('common.date') }}</td>
              <td>{{ $t('common.user') }}</td>
              <td>{{ $t('common.actionTitle') }}</td>
            </tr>
            </thead>
            <tbody>
            <template v-for="event in history" :key="event.event_result_id">
              <template v-if="event.plan_event_result_history">
                <tr v-for="historyItem in event.plan_event_result_history" :key="historyItem.id">
                  <td>{{ historyItem.id }}</td>
                  <td>{{ formatDateMoment(historyItem.modi_date) }}</td>
                  <td>{{ historyItem.modi_user.fullName }}</td>
                  <td>{{ getHistoryStatus(historyItem.state_id) }}</td>
                </tr>
              </template>
            </template>
            </tbody>
          </table> -->
          <DataTable :value="history" class="p-datatable-sm" responsiveLayout="scroll">
            <Column field="id" header="ID"></Column>
            <Column :header="$t('common.date')">
              <template #body="{ data }">
                {{ formatDateMoment(data.modi_date) }}
              </template>
            </Column>
            <Column field="user" :header="$t('common.user')">
              <template #body="{ data }">
                {{ data.modi_user.fullName }}
              </template>
            </Column>
            <Column field="state" :header="$t('common.actionTitle')">
              <template #body="{ data }">
                {{ data.state ? $t(`common.states.${data.state}`) : "" }}
              </template>
            </Column>
          </DataTable>
        </TabPanel>
      </TabView>
    </div>
  </div>

  <Sidebar v-model:visible="toCorrectSidebar" position="right" class="p-sidebar-lg " style="overflow-y: scroll">
    <h3>{{ $t('workPlan.toCorrect') }}</h3>
    <div class="field">
      <div>
        <Button icon="pi pi-fw pi-check" class="p-button-outlined" @click="confirmToRevision()" :label="$t('common.send')"></Button>
      </div>
    </div>
    <div class="p-col p-fluid">
      <div class="field">
        <label>{{ $t('common.comment') }}</label>
        <TinyEditor v-model="rejectComment" :height="500"></TinyEditor>
      </div>
    </div>
  </Sidebar>
</template>

<script>
import {findRole, getHeader, smartEnuApi} from "@/config/config";
import moment from "moment";
import {WorkPlanService} from '../../service/work.plan.service'
import Enum from "@/enum/workplan/index"

export default {
  name: "WorkPlanEventResult",
  props: ['resultId'],
  data() {
    return {
      event: null,
      plan: null,
      result: null,
      file: null,
      isDisabled: true,
      active: null,
      menu: null,
      resultData: null,
      files: [],
      newResult: null,
      fact: null,
      event_id: this.resultId,
      user_id: JSON.parse(localStorage.getItem("loginedUser")).userID,
      isAdmin: false,
      activeIndex: 0,
      history: null,
      toCorrectSidebar: false,
      rejectComment: null,
      loginedUserId: JSON.parse(localStorage.getItem("loginedUser")).userID,
      itemActive: false,
      isFactChanged: false,
      loading: false,
      uploadPercent: 0,
      isBlockUI: false,
      authUser: JSON.parse(localStorage.getItem("loginedUser")),
      quill: null,
      isPlanCreator: false,
      isPlanCreatorApproval: false,
      isCurrentUserApproval: false,
      planService: new WorkPlanService(),
      resultStatus: [
        {name_kz: "Тексерілуде", name_ru: "На проверке", name_en: "On inspection", id: 5},
        {name_kz: "Түзетуде", name_ru: "На доработке", name_en: "Under revision", id: 6},
        {name_kz: "Тексерілді", name_ru: "Проверено", name_en: "Inspected", id: 7},

      ],
      historyStatus: [
        {name_kz: "Жоспарланды", name_ru: "Запланировано", name_en: "Planned", id: 1},
        {name_kz: "Орындалды", name_ru: "Выполнено", name_en: "Done", id: 2},
        {name_kz: "Орындалмады", name_ru: "Не выполнено", name_en: "Not done", id: 3},
        {name_kz: "Жартылай орындалды", name_ru: "Частично выполнено", name_en: "Partially completed", id: 4},
        {name_kz: "Тексерілуде", name_ru: "На проверке", name_en: "On inspection", id: 5},
        {name_kz: "Түзетуде", name_ru: "На доработке", name_en: "Under revision", id: 6},
        {name_kz: "Тексерілді", name_ru: "Проверено", name_en: "Inspected", id: 7},

      ],
      isInspected: true,
      submitted: false,
      resultUserId: null,
      eventResultId: null,
      Enum: Enum,
      wordLimit: 50,
      wordMaxLimit: 250,
      wordCounter: 0,
      hasResultToApprove: false
    }
  },

  computed: {
    wordCount() {
      if (!this.result) return 0;
      return this.result.trim().split(/\s+/).length;
    },
    userMenuItems() {
      return this.initMenu();
    },
    verifyMenu() {
      return [
        {
          label: this.$t('common.action.accept'),
          icon: "pi pi-fw pi-check",
          visible: this.plan && this.plan.is_oper === true,
          command: () => {
            this.verify(true);
          },
        },
        {
          label: this.$t('workPlan.toCorrect'),
          icon: "pi pi-fw pi-times",
          command: () => {
            this.showToCorrectSidebar();
          },
        },
      ];
    },
    rejectMenu() {
      return [
        {
          label: this.$t('common.save'),
          icon: "pi pi-fw pi-check",
          command: () => {
            this.verify(false);
          },
        }
      ];
    },
    isSciencePlan() {
      return this.plan && this.plan.plan_type && this.plan.plan_type.code === Enum.WorkPlanTypes.Science
    },
    isOperPlan() {
      return this.plan && ((this.plan.plan_type && this.plan.plan_type.code === Enum.WorkPlanTypes.Oper) || this.plan.is_oper)
    },
    isRespUser() {
      return this.event && this.respUserExists(this.loginedUserId) && this.plan.plan_type_id === 3
    },
    isRespUserForWrite() {
      return this.respUserExists(this.loginedUserId)
    }
  },
  watch: {
    result(newValue) {
      this.wordCounter = this.wordCount;
    },
  },
  mounted() {
    this.isAdmin = this.findRole(null, 'main_administrator')
    if (!this.event_id) {
      this.event_id = this.$route.params.id;
    }
    this.getEvent();


  },
  methods: {
    findRole: findRole,
    initWordCount(count) {
      this.inputWordCount = count
    },
    respUserExists(id) {
      return this.event.user.some(user => user.id === id)
    },
    getEvent() {
      this.planService.getEventById(this.event_id).then(res => {
        if (res.data) {
          this.event = res.data.event;
          this.plan = res.data.plan;
          if (this.plan && this.plan.user.id === this.loginedUserId) {
            this.isPlanCreator = true;
          } else {
            this.isPlanCreator = false;
            //this.$router.push('/work-plan')
          }
          if (this.event && this.event.user) {
            this.isPlanCreatorApproval = this.event.user.find(e => e.id === this.loginedUserId) !== null && this.isPlanCreator;
            this.isCurrentUserApproval = this.event.user.find(e => e.id === this.loginedUserId);
          }
          this.getData();
        }
      }).catch(error => {
        if (error.response && error.response.status === 401) {
          this.$store.dispatch("logLout");
        } else {
          this.$toast.add({
            severity: "error",
            summary: error,
            life: 3000,
          });
        }
      });
    },
    getData() {
      this.planService.getEventResult(this.event.work_plan_event_id).then(res => {
        if (res.data) {
          this.resultData = res.data;

          if (this.resultData.result_text != null) {
            this.resultData.result_text.map(e => {
              e.isActive = false;
            });
          }
          this.fact = this.resultData.fact;
          this.resultData.forEach(e => {
            if (e.plan_event_result_history && e.plan_event_result_history.some(x => (x.state_id === 5 || x.state_id === 6))) {
              this.hasResultToApprove = !this.isPlanCreator && e.plan_event_result_history.some(x => (x.state_id === 5 || x.state_id === 6))
            }
          })
        }
      }).catch(error => {
        if (error.response && error.response.status === 401) {
          this.$store.dispatch("logLout");
        } else {
          this.$toast.add({
            severity: "error",
            summary: error,
            life: 3000,
          });
        }
      });

    },
    initMenu() {
      return [
        {
          label: "",
          icon: "pi pi-fw pi-refresh",
          command: () => {
            this.getEvent();
            this.$toast.add({severity: 'success', detail: this.$t('common.success'), life: 3000});
          },
        },
        {
          label: this.$t("common.save"),
          icon: "pi pi-fw pi-save",
          disabled: this.isDisabled,
          command: () => {
            this.saveResult();
          },
        },
        // {
        //   label: this.$t('common.toCorrect'),
        //   icon: "pi pi-fw pi-send",
        //   disabled: !this.resultData,
        //   visible: !this.authUser.mainPosition.department.isFaculty,
        //   command: () => {
        //     this.sendResultForVerification();
        //   },
        // },
      ];
    },
    saveResult() {
      this.submitted = true
      this.isBlockUI = true;
      const fd = new FormData();

      if ((this.isSciencePlan && this.wordCount > this.wordMaxLimit) || (this.isSciencePlan && this.wordCount < this.wordLimit)) {
        this.$toast.add({severity: 'warn', detail: this.$t('workPlan.maxWordCount', this.wordMaxLimit), life: 3000})
        this.isBlockUI = false;
        return;
      }

      fd.append('work_plan_event_id', this.event.work_plan_event_id);
      fd.append('result', this.isOperPlan ? this.newResult ? this.newResult : "" : this.result);
      if (this.plan && this.isOperPlan) {
        fd.append("is_partially", true);
      }

      if (this.authUser?.mainPosition?.department && !this.authUser.mainPosition.department.isFaculty && this.isOperPlan){
        fd.append("fact", this.fact);
      }
        

      if (this.plan && this.isOperPlan && this.resultData)
        fd.append("result_id", this.resultData.event_result_id);
      if (this.files.length > 0) {
        let fullName = this.authUser.thirdName + ' ' + this.authUser.firstName

        if (this.authUser.lastName && this.authUser.lastName.length > 0) {
          fullName += ' ' + this.authUser.lastName
        }

        for (let file of this.files) {
          fd.append('files', file, fullName.replace(/ /g, '_') + "_" + file.name)
        }
      }
      this.planService.saveEventResult(fd).then(res => {
        if (res.data.is_success || res.data.is_fact_success) {
          //this.getData();
          this.getEvent();
          this.clearModel();
          this.isBlockUI = false;
        }
        this.files = [];
        this.submitted = false
        this.$toast.add({severity: 'success', detail: this.$t('common.done'), life: 3000});
      }).catch(error => {
        this.isBlockUI = false;
        this.submitted = false
        this.$toast.add({severity: "error", summary: error, life: 3000});
      });
    },
    sendResultForVerification() {
      let data = {
        event_id: parseInt(this.event.work_plan_event_id),
        result_id: parseInt(this.resultData.event_result_id)
      }
      this.planService.sendResultToVerify(data).then(res => {
        if (res.data.is_success) {
          this.$toast.add({severity: 'success', detail: this.$t('common.done'), life: 3000});
          this.getEvent();
        }
      }).catch(error => {
        if (error.response && error.response.status === 401) {
          this.$store.dispatch("logLout");
        } else {
          this.$toast.add({
            severity: "error",
            summary: error,
            life: 3000,
          });
        }
      });
    },
    getResultHistory() {
      //this.history = this.resultData
      this.planService.getEventResultHistory(this.resultData[0].event_result_id).then(res => {
        if (res.data) {
          console.log(res.data);
          this.history = res.data;
        }
      }).catch(error => {
        if (error.response && error.response.status === 401) {
          this.$store.dispatch("logLout");
        } else {
          this.$toast.add({
            severity: "error",
            summary: error,
            life: 3000,
          });
        }
      });
    },
    showToCorrectSidebar() {
      this.toCorrectSidebar = true;
    },
    showToCorrectSidebarNew(resultUserID, resultID) {
      this.toCorrectSidebar = true;
      // this.rejectResultId = parseInt(resultID);
      // this.resultUserId = parseInt(resultUserID)
      this.isInspected = false;
      this.resultUserId = parseInt(resultUserID)
      this.eventResultId = parseInt(resultID)
    },
    verify(status) {
      const data = {};
      data.is_success = status;
      data.event_id = this.event.work_plan_event_id;
      if (!status) {
        data.comment = this.rejectComment;
        data.result_id = this.resultData.event_result_id;
      }

      this.planService.verifyEventResult(data).then(res => {
        //console.log(res);
        if (res.data && res.data.is_success) {
          this.toCorrectSidebar = false;
          this.$toast.add({
            severity: 'success',
            summary: this.$t('common.success'),
            life: 3000,
          });
          this.getEvent();
          //this.$router.push({name: 'WorkPlanEvent', params: {id: this.event.work_plan_id}});
        }
      }).catch(error => {
        if (error.response && error.response.status === 401) {
          this.$store.dispatch("logLout");
        } else {
          this.$toast.add({
            severity: "error",
            summary: error,
            life: 3000,
          });
        }
      });
    },
    verifyHistory(isInspected, userId, resultId) {
      // const data = {};
      // data.is_success = status;
      // data.event_id = this.event.work_plan_event_id;
      // if (!status) {
      //   data.comment = this.rejectComment;
      //   data.result_id = this.resultData.event_result_id;
      // }

      let comment = "";
      comment = this.rejectComment

      this.planService.verifyEventResultHistory(this.isInspected, comment, this.resultUserId, this.user_id, this.eventResultId).then(res => {
        if (res.data) {
          //this.toCorrectSidebar = false;
          this.$toast.add({
            severity: 'success',
            summary: this.$t('common.success'),
            life: 3000,
          });
          this.getEvent();
          //this.$router.push({name: 'WorkPlanEvent', params: {id: this.event.work_plan_id}});
        }
      }).catch(error => {
        if (error.response && error.response.status === 401) {
          this.$store.dispatch("logLout");
        } else {
          this.$toast.add({
            severity: "error",
            summary: error,
            life: 3000,
          });
        }
      });
    },
    confirmToInspected(isInspected, userId, resultId) {
      this.isInspected = true;
      this.resultUserId = userId;
      this.eventResultId = resultId;
      this.$confirm.require({
        target: event.currentTarget,
        message: this.$t('common.confirmation'),
        header: this.$t('common.confirm'),
        group: 'deleteResult',
        icon: 'pi pi-info-circle',
        acceptClass: 'p-button-rounded p-button-success',
        rejectClass: 'p-button-rounded p-button-danger',
        accept: () => {
          this.verifyHistory(this.isInspected, null, this.resultUserId, this.user_id, this.eventResultId);
        }
      });
    },
    confirmToRevision() {
      this.isInspected = false;

      // this.resultUserId = userId;
      // this.eventResultId = resultId;
      this.$confirm.require({
        target: event.currentTarget,
        message: this.$t('common.confirmation'),
        header: this.$t('common.confirm'),
        group: 'deleteResult',
        icon: 'pi pi-info-circle',
        acceptClass: 'p-button-rounded p-button-success',
        rejectClass: 'p-button-rounded p-button-danger',
        accept: () => {
          this.verifyHistory(this.isInspected, null, this.resultUserId, this.user_id, this.eventResultId);
          this.toCorrectSidebar = false;
        }
      });

    },
    changeTab() {
      if (this.activeIndex === 1) {
        this.getResultHistory();
      }
    },
    resultChange() {
      console.log(this.result)
    },
    editorChange(event) {
      if ((this.result != null && this.result.length > 0) || (this.newResult != null && this.newResult.length > 0)) {
        this.isDisabled = false;
      } else {
        this.isDisabled = true;
      }
    },
    resultInput(e) {
      if (e.target.value.length > 0) {
        this.initMenu()[1].disabled = false;
      } else {
        this.initMenu()[1].disabled = true;
      }
      this.resizeArea();
    },
    clearModel() {
      this.event_name = null;
      this.parentId = null;
      this.quarter = null;
      this.result = null;
      this.newResult = null;
      this.selectedUsers = null;
    },
    navigateToBack() {
      this.$router.push({name: 'WorkPlanEvent', params: {id: this.plan.work_plan_id}});
    },
    uploadFile(event) {
      /*this.file = event.files[0];*/
      if (event.files.length > 10) {
        this.$toast.add({
          severity: "info",
          summary: this.$t('workPlan.message.maxFileUploadSize'),
          life: 3000,
        });
        this.clearFiles();
        return;
      }
      // this.files = [];
      // let files = event.files;
      // for (let file of files) {
      //   this.files.push(file);
      // }
      // this.clearFiles();

      // this.files = [];
      // let files = event.files;
      for (let file of event.files) {
        this.files.push(file);
      }
      this.clearFiles();
      this.isDisabled = false;

    },
    resizeArea() {
      this.$nextTick(() => {
        const textarea = this.$refs.resultContainer.$el;
        textarea.style.height = textarea.scrollHeight + 'px';
      });
    },
    factChange(event) {
      this.isDisabled = false;
      this.isFactChanged = true;
    },
    removeFile(index) {
      let removedFile = this.files.splice(index, 1)[0];
      this.files = [...this.files];
      this.$emit('remove', {
        file: removedFile,
        files: this.files
      });

    },
    openInplace(item) {
      item.isActive = true;
    },
    saveEditResult(item) {
      this.loading = true;
      const fd = new FormData();
      fd.append("result_id", item.event_result_id)
      fd.append("result_text_id", item.result_text[0].id)
      fd.append("work_plan_event_id", item.work_plan_event_id)
      if (this.isFactChanged)
        fd.append("fact", this.fact)
      fd.append("text", item.result_text[0].text)
      if (this.files.length > 0) {
        for (let file of this.files) {
          fd.append('files', file, this.authUser.fullName.replace(/ /g, '_') + "_" + file.name)
        }
      }
      this.planService.editEventResult(fd).then(res => {
        if (res.data.is_success) {
          this.getEvent();
          this.files = [];
          this.$toast.add({severity: 'success', detail: this.$t('common.done'), life: 3000});
          item.isActive = false;
          this.loading = false;
        }
      }).catch((error) => {
        this.loading = false;
        if (error.response && error.response.status === 401) {
          this.$store.dispatch("logLout");
        } else {
          this.$toast.add({
            severity: "error",
            summary: error,
            life: 3000,
          });
        }
      });
    },
    cancelEdit(item) {
      item.isActive = false;
    },
    deleteConfirmItem(event, item) {
      this.$confirm.require({
        target: event.currentTarget,
        group: 'deleteResult',
        message: this.$t('common.confirmation'),
        header: this.$t('common.confirm'),
        icon: 'pi pi-info-circle',
        acceptClass: 'p-button-rounded p-button-success',
        rejectClass: 'p-button-rounded p-button-danger',
        accept: () => {
          this.deleteItem(item.event_result_id);
        }
      });
    },
    deleteItem(id) {
      this.planService.deleteEventResult(id).then(res => {
        if (res.data.is_success) {
          this.getEvent();
          this.$toast.add({severity: 'success', detail: this.$t('common.done'), life: 3000});
        }
      }).catch((error) => {
        if (error.response && error.response.status === 401) {
          this.$store.dispatch("logLout");
        } else {
          this.$toast.add({
            severity: "error",
            summary: error,
            life: 3000,
          });
        }
      });
    },
    deleteFileConfirm(event, id) {
      this.$confirm.require({
        target: event.currentTarget,
        message: this.$t('common.confirmation'),
        header: this.$t('common.confirm'),
        group: 'deleteResult',
        icon: 'pi pi-info-circle',
        acceptClass: 'p-button-rounded p-button-success',
        rejectClass: 'p-button-rounded p-button-danger',
        accept: () => {
          this.deleteFile(id);
        }
      });
    },

    deleteFile(id) {
      this.planService.deleteResultFile(id).then(res => {
        if (res.data.is_success) {
          this.getEvent();
          this.$toast.add({severity: 'success', detail: this.$t('common.done'), life: 3000});
        }
      }).catch((error) => {
        if (error.response && error.response.status === 401) {
          this.$store.dispatch("logLout");
        } else {
          this.$toast.add({
            severity: "error",
            summary: error,
            life: 3000,
          });
        }
      });
    },
    formatDateMoment(date) {
      return moment(new Date(date)).utc().format("DD.MM.YYYY HH:mm:ss")
    },
    formatDate(value) {
      let result = "";
      if (value == null) {
        return result;
      }
      let date = new Date(value);
      result = date.toLocaleDateString("kk-KZ", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      return result == "Invalid Date" ? "" : result;
    },
    clearFiles() {
      this.$refs.form.clear();
      this.$refs.form.uploadedFileCount = 0;
    },
    downloadFile(file) {
      this.isBlockUI = true;
      let url = `${smartEnuApi}/serve?path=${file.event_result_file}`
      fetch(url, {
        method: 'GET',
        headers: getHeader()
      })
          .then(response => response.blob())
          .then(blob => {
            var url = window.URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = file.file_name;
            document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
            a.click();
            a.remove();
            this.isBlockUI = false;
          }).catch(error => {
        if (error.response && error.response.status === 401) {
          this.$store.dispatch("logLout");
        } else {
          this.$toast.add({
            severity: "error",
            summary: error,
            life: 3000,
          });
        }
        this.isBlockUI = false;
      });
    },
    getResultStatus(code) {
      const foundStatus = this.resultStatus.find(status => status.id === code);

      if (foundStatus) {
        switch (this.$i18n.locale) {
          case "kz":
            return foundStatus.name_kz;
          case "ru":
            return foundStatus.name_ru;
          case "en":
            return foundStatus.name_en;
          default:
            return null;
        }
      } else {
        return null;
      }
    },
    getHistoryStatus(code) {
      const foundStatus = this.historyStatus.find(status => status.id === code);

      if (foundStatus) {
        switch (this.$i18n.locale) {
          case "kz":
            return foundStatus.name_kz;
          case "ru":
            return foundStatus.name_ru;
          case "en":
            return foundStatus.name_en;
          default:
            return null;
        }
      } else {
        return null;
      }
    },
  }
}
</script>

<style scoped lang="scss">
.p-fileupload-content {
  position: relative;
}

.p-fileupload-row {
  display: flex;
  align-items: center;
  padding: 5px;
}

.p-fileupload-row > div {
  flex: 1 1 auto;
  width: 25%;
}

.p-fileupload-row > div:last-child {
  text-align: right;
}

.p-fileupload-content .p-progressbar {
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.p-button.p-fileupload-choose input[type=file] {
  display: none;
}

.p-fileupload-choose.p-fileupload-choose-selected input[type=file] {
  display: none;
}

.p-fileupload-filename {
  word-break: break-all;
}

.p-fluid .p-fileupload .p-button {
  width: auto;
}

.color-success {
  color: #689F38;
}

.customer-badge {
  border-radius: 2px;
  padding: .25em .5rem;
  text-transform: uppercase;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: .3px;
  display: inline-block;
  text-align: center;

  &.status-7 {
    background: #10b981;
    color: #fff;
  }

  &.status-6 {
    background: #FFCDD2;
    color: #C63737;
  }

  &.status-5 {
    background: #f1c21b;
    color: #fff;
  }

  &.status-4 {
    background: #d9873e;
    color: #ffffff;
  }

  &.status-3 {
    background: #FFCDD2;
    color: #C63737;
  }

  &.status-2 {
    background: #C8E6C9;
    color: #256029;
  }
}

::v-deep(.p-inplace-display) {
  padding: 0;
}

::v-deep(.velmld-overlay) {
  background-color: rgba(0, 0, 0, 0.4) !important;
}

::v-deep(.p-divider-solid.p-divider-horizontal:before) {
  border-top-style: solid !important;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  border-bottom: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}
</style>