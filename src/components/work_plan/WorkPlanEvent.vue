<template>
  <div class="col-12">
    <TitleBlock :title="plan?.work_plan_name" :show-back-button="true" />
    <div class="card" v-if="plan && planDoc && isRejected">
      <div class="p-fluid">
        <div class="field">
          <label>{{ $t('common.state') }}:</label>
          <div v-if="plan.doc_info.docHistory">
            <span
              v-if="plan.status"
              :class="
                'customer-badge status-' + plan.doc_info.docHistory.stateEn
              "
              >{{
                $t('common.states.' + plan.doc_info.docHistory.stateEn)
              }}</span
            >
          </div>
        </div>
        <div class="field" v-if="plan.reject_history.user">
          <label>{{ $t('contracts.assigner') }}:</label>
          <div>
            <b>{{ plan.reject_history.user.fullName }}</b>
          </div>
        </div>
        <div class="field" v-if="planDoc.docHistory.setDate">
          <label>{{ $t('common.date') }}:</label>
          <div>
            <b>{{ formatDateMoment(planDoc.docHistory.setDate, true) }}</b>
          </div>
        </div>
        <div class="field">
          <label>{{ $t('common.comment') }}:</label>
          <div>
            <Message :closable="false" severity="warn"
              ><span v-html="planDoc.docHistory.comment"></span
            ></Message>
          </div>
        </div>
      </div>
    </div>
    <ToolbarMenu
      v-if="plan && planDoc"
      :data="toolbarMenus"
      @filter="toggle('global-filter', $event)"
      :filter="true"
      :filtered="filtered"
    />

    <DoctorsMastersTable
      v-if="plan && planDoc && (isMastersPlan || isDoctorsPlan)"
      :data="data"
      :items="initItems"
      @onPage="onPage"
      @onExpand="onExpand"
      @onToggle="actionsToggle"
      :total="total"
      :loading="loading"
    />
  </div>

  <Sidebar
    v-model:visible="dialog.planView.state"
    position="right"
    class="w-6"
    style="overflow-y: scroll"
    @hide="hideDialog(dialog.planView)"
  >
    <DocSignaturesInfo
      :docIdParam="plan.doc_id"
      :isInsideSidebar="true"
    ></DocSignaturesInfo>
  </Sidebar>

  <Sidebar
    v-model:visible="isShowPlanExecute"
    position="right"
    style="overflow-y: scroll; width: 50%"
    @hide="closePlanExecuteSidebar"
  >
    <WorkPlanEventResult
      v-if="isShowPlanExecute && selectedEvent"
      :result-id="selectedEvent.work_plan_event_id"
    />
  </Sidebar>

  <Dialog
    v-if="dialog.uploadAdditionalFile.state"
    v-model:visible="dialog.uploadAdditionalFile.state"
    :style="{ width: '450px' }"
    :header="$t('common.additionalInfo')"
    :modal="true"
    class="p-fluid"
  >
    <div class="field">
      <label>{{ $t('common.doc') }}</label>
      <CustomFileUpload
        @upload="uploadFile($event, 'documentFiles')"
        v-model="documentFiles"
        :multiple="false"
        :button="true"
      />
    </div>
    <template #footer>
      <Button
        :label="$t('common.cancel')"
        icon="pi pi-times"
        class="p-button-text"
        @click="hideDialog(dialog.uploadAdditionalFile)"
      />
      <Button
        :label="$t('common.save')"
        icon="pi pi-check"
        class="p-button-text"
        @click="uploadRelatedDocs"
      />
    </template>
  </Dialog>

  <OverlayPanel ref="global-filter">
    <div class="p-fluid">
      <div class="field">
        <label>{{ $t('workPlan.eventName') }}</label>
        <InputText
          class="mt-2"
          type="text"
          :placeholder="$t('workPlan.eventName')"
          v-model="filters.name.value"
        />
      </div>
      <div class="field">
        <label for="status-filter">{{ $t('common.status') }}</label>
        <Dropdown
          v-model="filters.status.value"
          optionValue=""
          :options="statuses"
          :placeholder="$t('common.select')"
          class="p-column-filter"
          :showClear="true"
        >
          <template #value="slotProps">
            <span
              v-if="slotProps.value"
              :class="'customer-badge status-' + slotProps.value.id"
            >
              {{
                $i18n.locale === 'kz'
                  ? slotProps.value.nameKz
                  : $i18n.locale === 'ru'
                  ? slotProps.value.nameRu
                  : slotProps.value.nameEn
              }}
            </span>
          </template>
          <template #option="slotProps">
            <span :class="'customer-badge status-' + slotProps.option.id">
              {{
                $i18n.locale === 'kz'
                  ? slotProps.option.nameKz
                  : $i18n.locale === 'ru'
                  ? slotProps.option.nameRu
                  : slotProps.option.nameEn
              }}
            </span>
          </template>
        </Dropdown>
      </div>
      <div class="field">
        <label>{{ $t('cafedra.responsible') }}</label>
        <FindUser
          v-model="filters.author.value"
          :max="1"
          :editMode="false"
          :user-type="3"
        />
      </div>
      <div class="field">
        <Button
          :label="$t('common.clear')"
          @click="clearFilter"
          class="mb-2 p-button-outlined"
        />
        <Button :label="$t('common.search')" @click="initFilter" class="mt-2" />
      </div>
    </div>
  </OverlayPanel>

  <add-info
    v-if="dialog.info.state"
    :visible="dialog.info.state"
    @hide="hideDialog(dialog.info)"
    :plan="plan"
  />
  <work-plan-event-add
    v-if="dialog.add.state"
    :visible="dialog.add.state"
    :data="selectedEvent"
    :items="selectedEvent ? selectedEvent.children : null"
    :isMain="!!selectedEvent"
    :plan-data="plan"
    @hide="hideDialog(dialog.add)"
  />
  <work-plan-event-edit-modal
    v-if="dialog.edit.state"
    :visible="dialog.edit.state"
    :planData="plan"
    :event="selectedEvent"
    @hide="hideDialog(dialog.edit)"
  />
  <WorkPlanReportApprove
    v-if="showReportModal && scienceReport && plan"
    :approval-stages="approval_users"
    :visible="showReportModal && scienceReport"
    :doc-id="scienceReport.doc_id"
    :report="scienceReport"
    :plan="plan"
    @sentToApprove="hideDialog(dialog.reportApprove)"
  />
  <work-plan-approve
    v-if="dialog.planApprove.state"
    :visible="dialog.planApprove.state"
    :approval-stages="planApprovalStage"
    :plan="plan"
    :events="data"
    @hide="hideDialog(dialog.planApprove)"
    @isSent="planSentToApprove"
  ></work-plan-approve>
</template>

<script>
import WorkPlanEventAdd from '@/components/work_plan/WorkPlanEventAdd';
import { fileRoute, findRole, smartEnuApi } from '@/config/config';
import WorkPlanApprove from '@/components/work_plan/WorkPlanApprove';
import WorkPlanEventEditModal from '@/components/work_plan/WorkPlanEventEditModal';
import moment from 'moment';
import { FilterMatchMode } from 'primevue/api';
import { WorkPlanService } from '@/service/work.plan.service';
import DocSignaturesInfo from '@/components/DocSignaturesInfo';
import WorkPlanEventResult from '@/components/work_plan/WorkPlanEventResult.vue';
import Enum from '@/enum/workplan/index';
import DocEnum from '@/enum/docstates/index';
import WorkPlanReportApprove from '@/components/work_plan/WorkPlanReportApprove.vue';
import { DocService } from '@/service/doc.service';
import CustomFileUpload from '@/components/CustomFileUpload.vue';
import DocState from '@/enum/docstates/index';
import ToolbarMenu from '@/components/ToolbarMenu.vue';
import DoctorsMastersTable from './table/DoctorsMastersTable.vue';

export default {
  name: 'WorkPlanEvent',
  components: {
    ToolbarMenu,
    CustomFileUpload,
    WorkPlanReportApprove,
    WorkPlanEventResult,
    WorkPlanEventEditModal,
    WorkPlanApprove,
    WorkPlanEventAdd,
    // WorkPlanEventResultModal,
    DocSignaturesInfo,
    DoctorsMastersTable,
  },
  data() {
    return {
      data: [],
      Enum: Enum,
      DocEnum: DocEnum,
      work_plan_id: parseInt(this.$route.params.id),
      searchText: null,
      lastEvent: null,
      quarters: [
        {
          id: 1,
          name: 'I',
        },
        {
          id: 2,
          name: 'II',
        },
        {
          id: 3,
          name: 'III',
        },
        {
          id: 4,
          name: 'IV',
        },
        {
          id: 5,
          name: 'Весь квартал',
        },
      ],
      total: 0,
      quarter: null,
      loading: false,
      showReportModal: false,
      parent: null,
      parentNode: null,
      plan: null,
      planDoc: null,
      approval_users: null,
      loginedUserId: JSON.parse(localStorage.getItem('loginedUser')).userID,
      windowHeight: window.innerHeight - 270,
      lazyParams: {
        page: 0,
        rows: 10,
        parent_id: null,
        work_plan_id: -1,
        quarter: null,
      },
      isRejected: false,
      isFinish: false,
      isPlanCreator: false,
      isAdmin: false,
      isCreator: false,
      isApproval: false,
      isEventsNull: false,
      isShowPlanExecute: false,
      showReportDoc: false,
      filters: {
        name: { value: null, matchMode: FilterMatchMode.CONTAINS },
        status: { value: null, matchMode: FilterMatchMode.EQUALS },
        author: { value: null, matchMode: FilterMatchMode.EQUALS },
      },
      statuses: [
        {
          id: 1,
          nameRu: 'Жоспарланды',
          nameKz: 'Запланировано',
          nameEn: 'Planned',
          value: 'planned',
        },
        {
          id: 2,
          nameRu: 'Орындалды',
          nameKz: 'Выполнено',
          nameEn: 'Done',
          value: 'done',
        },
        {
          id: 4,
          nameRu: 'Жартылай орындалды',
          nameKz: 'Частично выполнено',
          nameEn: 'Partially completed',
          value: 'partially',
        },
        {
          id: 5,
          nameRu: 'Тексерілуде',
          nameKz: 'На проверке',
          nameEn: 'On inspection',
          value: 'inspection',
        },
        {
          id: 6,
          nameRu: 'Түзетуде',
          nameKz: 'На доработке',
          nameEn: 'Under revision',
          value: 'revision',
        },
      ],
      numMatches: [{ value: 'lt' }, { value: 'gt' }, { value: 'equals' }],
      planService: new WorkPlanService(),
      selectedEvent: null,
      scienceReport: null,
      docService: new DocService(),
      scienceDocs: null,
      docEnum: DocEnum,
      dialog: {
        add: {
          state: false,
        },
        edit: {
          state: false,
        },
        remove: {
          state: false,
        },
        planApprove: {
          state: false,
        },
        reportApprove: {
          state: false,
        },
        planView: {
          state: false,
        },
        uploadAdditionalFile: {
          state: false,
        },
        showMastersEventType: {
          state: false,
        },
        info: {
          state: false,
        },
      },
      planApprovalStage: null,
      oldPlan: false,
      documentFiles: null,
      service: new DocService(),
      DocState: DocState,
      filtered: false,
      stages: [],
    };
  },
  created() {
    this.isAdmin = this.findRole(null, 'main_administrator');
    this.getPlan();
    this.getEventsTree(null);
    this.getWorkPlanApprovalUsers(this.work_plan_id);
  },
  mounted() {
    this.emitter.on('workPlanEventIsAdded', (data) => {
      if (data.is_success && !data.is_main) {
        this.getEventsTree(this.parentNode);
      } else if (data.is_success && data.is_main) {
        this.getEventsTree(null);
      }
    });
    this.emitter.on('planRejected', (data) => {
      if (data === true) {
        this.getPlan();
        this.getEventsTree(this.parentNode);
      }
    });
    this.emitter.on('planSentToApprove', (data) => {
      if (data) {
        this.getPlan();
        this.getEventsTree(this.parentNode);
      }
    });
    this.emitter.on('workPlanEventIsCompleted', (data) => {
      if (data) {
        this.getPlan();
        this.getEventsTree(this.parentNode);
      }
    });
    this.emitter.on('workPlanChildEventIsDeleted', (data) => {
      if (data) {
        this.getPlan();
        this.getEventsTree(this.parentNode);
      }
    });
    this.emitter.on('workPlanResultSentToVerify', (data) => {
      if (data) {
        this.getPlan();
        this.getEventsTree(this.parentNode);
      }
    });
    this.emitter.on('workPlanResultVerified', (data) => {
      if (data) {
        this.getPlan();
        this.getEventsTree(this.parentNode);
      }
    });
    this.emitter.on('workPlanSideBarClosed', (data) => {
      if (data) {
        this.getPlan();
        this.getEventsTree(this.parentNode);
      }
    });
    this.emitter.on('workPlanEventSideBarClosed', (data) => {
      if (data) {
        this.getPlan();
        this.getEventsTree(this.parentNode);
      }
    });
  },
  methods: {
    findRole: findRole,
    signView(node) {
      this.showReportDoc = true;
    },
    toggle2(node) {
      this.actionsNode = node;
    },
    onExpand(node) {
      this.lazyParams.parent_id = Number(node.work_plan_event_id);
      this.lazyParams.rows = 0;
      this.parentNode = node;
      this.getEventsTree(node);
    },
    initFilter() {
      let filter = JSON.parse(JSON.stringify(this.filters));
      this.lazyParams.filters = filter;
      if (this.lazyParams.filters.status.value) {
        this.lazyParams.filters.status.value = filter.status.value.id;
      }
      if (this.lazyParams.filters.author.value) {
        this.lazyParams.filters.author.value = filter.author.value[0].userID;
      }
      this.getEventsTree(null);
    },
    getEventsTree(parent) {
      this.loading = true;
      this.lazyParams.work_plan_id = Number(this.work_plan_id);
      this.lazyParams.quarter = this.quarter;
      if (parent == null) {
        this.lazyParams.parent_id = null;
      }

      this.planService
        .getEventsTree(this.lazyParams)
        .then((res) => {
          if (parent == null) {
            if (res.data?.items) {
              res.data.items.sort(function (a, b) {
                return a.semester - b.semester;
              });
            }
            this.data = res.data.items;
            this.total = res.data.total;
            if (this.data) {
              this.data.map((e) => {
                if (
                  e.creator_id === this.loginedUserId &&
                  e.parent_id == null
                ) {
                  this.isCreator = true;
                }
                if (e.result && e.result.length > 100) {
                  e.result_short = `${e.result.substring(0, 100)}...`;
                }
              });
            }
          } else {
            parent.children = res.data.items;
            if (parent.children) {
              parent.children.map((e) => {
                if (e.creator_id === this.loginedUserId) {
                  this.isCreator = true;
                }
                if (e.result && e.result.length > 100) {
                  e.result_short = `${e.result.substring(0, 100)}...`;
                }
              });
            }
            this.total = 0;
          }
          this.loading = false;
        })
        .catch((error) => {
          if (error.response && error.response.status === 401) {
            this.$store.dispatch('logLout');
          } else {
            this.$toast.add({
              severity: 'error',
              summary: error,
              life: 3000,
            });
          }
          this.loading = false;
        });
    },
    onResize() {
      this.windowHeight = window.innerHeight - 270;
    },
    getWorkPlanApprovalUsers() {
      this.planService
        .getWorkPlanApprovalUsers(parseInt(this.work_plan_id))
        .then((res) => {
          if (res.data) {
            res?.data?.forEach((e) => {
              if (this.loginedUserId === e.id) {
                this.isApproval = true;
              }
            });
          } else {
            this.isApproval = false;
          }
        })
        .catch((error) => {
          if (error.response && error.response.status === 401) {
            this.$store.dispatch('logLout');
          } else {
            this.$toast.add({
              severity: 'error',
              summary: error,
              life: 3000,
            });
          }
        });
    },
    getPlan() {
      this.planService
        .getPlanById(this.work_plan_id)
        .then((res) => {
          this.plan = res.data;
          this.planDoc = res.data.doc_info;
          this.oldPlan =
            new Date(this.plan.create_date).getFullYear() <
            new Date().getFullYear();
          this.isFinish = this.plan.is_finish != null;
          if (this.planDoc && this.planDoc.docHistory) {
            this.isRejected =
              this.planDoc.docHistory.stateEn === this.DocState.REVISION.Value;
          }
          this.isPlanCreator = !!(
            this.plan && this.plan.user.id === this.loginedUserId
          );

          if (this.isSciencePlan) {
            this.planApprovalStage = [
              {
                stage: 1,
                users: [],
                titleRu: 'Научный руководитель проекта',
                titleKz: 'Жобаның ғылыми жетекшісі',
                titleEn: 'Project Scientific Director',
                certificate: {
                  namekz: 'Жеке тұлғаның сертификаты',
                  nameru: 'Сертификат физического лица',
                  nameen: 'Certificate of an individual',
                  value: 'individual',
                },
              },
              {
                stage: 2,
                users: [],
                titleRu: 'Ответственные от управления научных проектов',
                titleKz: 'Ғылыми жобалар басқармасынан жауапты тұлға',
                titleEn: 'Employee of Scientific Projects Management',
                certificate: {
                  namekz: 'Ішкі құжат айналымы үшін (ГОСТ)',
                  nameru: 'Для внутреннего документооборота (ГОСТ)',
                  nameen: 'For internal document management (GOST)',
                  value: 'internal',
                },
              },
              {
                stage: 3,
                users: [],
                titleRu: 'Заместитель директора департамента науки',
                titleKz: 'Ғылым департаменті директорының орынбасары',
                titleEn: 'Deputy Director of the Department of Science',
                certificate: {
                  namekz: 'Ішкі құжат айналымы үшін (ГОСТ)',
                  nameru: 'Для внутреннего документооборота (ГОСТ)',
                  nameen: 'For internal document management (GOST)',
                  value: 'internal',
                },
              },
              {
                stage: 4,
                users: [],
                titleRu: 'И.о. директора департамента науки',
                titleKz: 'Ғылым департаменті директорының м.а',
                titleEn: 'Acting Director of the Department of Science',
                certificate: {
                  namekz: 'Ішкі құжат айналымы үшін (ГОСТ)',
                  nameru: 'Для внутреннего документооборота (ГОСТ)',
                  nameen: 'For internal document management (GOST)',
                  value: 'internal',
                },
              },
            ];
            this.getRelatedFiles();
            this.getWorkPlanApprovalUsers(this.work_plan_id);
          }
          if (this.plan?.plan_type?.code === Enum.WorkPlanTypes.Masters) {
            this.planApprovalStage = [
              {
                stage: 1,
                users: null,
                certificate: {
                  namekz: 'Жеке тұлғаның сертификаты',
                  nameru: 'Сертификат физического лица',
                  nameen: 'Certificate of an individual',
                  value: 'individual',
                },
                titleRu: 'Cтудент',
                titleKz: 'Cтудент',
                titleEn: 'Student',
              },
              {
                stage: 2,
                users: null,
                titleRu: 'Научный руководитель',
                titleKz: 'Ғылыми жетекші',
                titleEn: 'Scientific adviser',
                certificate: {
                  namekz: 'Жеке тұлғаның сертификаты',
                  nameru: 'Сертификат физического лица',
                  nameen: 'Certificate of an individual',
                  value: 'individual',
                },
              },
              {
                stage: 3,
                users: null,
                titleRu: 'Заведующий кафедры',
                titleKz: 'Кафедра меңгерушісі',
                titleEn: 'Head of Department',
                certificate: {
                  namekz: 'Ішкі құжат айналымы үшін (ГОСТ)',
                  nameru: 'Для внутреннего документооборота (ГОСТ)',
                  nameen: 'For internal document management (GOST)',
                  value: 'internal',
                },
              },
              {
                stage: 4,
                users: null,
                titleRu: 'Декан факультета',
                titleKz: 'Факультет деканы',
                titleEn: 'Dean of the Faculty',
                certificate: {
                  namekz: 'Ішкі құжат айналымы үшін (ГОСТ)',
                  nameru: 'Для внутреннего документооборота (ГОСТ)',
                  nameen: 'For internal document management (GOST)',
                  value: 'internal',
                },
              },
            ];
          }
        })
        .catch((error) => {
          if (error.response && error.response.status === 401) {
            this.$store.dispatch('logLout');
          } else {
            this.$toast.add({
              severity: 'error',
              summary: error,
              life: 3000,
            });
          }
        });
    },
    getRelatedFiles() {
      this.docService
        .getRelatedDocs({ fileID: this.plan.doc_info.id, uuid: null })
        .then((response) => {
          this.scienceDocs = response.data;
        })
        .catch((_) => {
          this.uploading = false;
        });
    },
    confirmFinish() {
      this.$confirm.require({
        message: this.$t('common.confirmation'),
        header: this.$t('common.confirm'),
        icon: 'pi pi-info-circle',
        acceptClass: 'p-button-rounded p-button-success',
        rejectClass: 'p-button-rounded p-button-danger',
        accept: () => {
          this.finish();
        },
      });
    },
    finish() {
      this.planService
        .finishEvent(this.work_plan_id)
        .then((res) => {
          if (res.data.is_success) {
            this.isCreator = false;
            this.isFinish = true;
            this.getPlan();
            this.getEventsTree(null);
            this.$toast.add({
              severity: 'success',
              summary: this.$t('common.success'),
              life: 3000,
            });
          }
        })
        .catch((error) => {
          if (error.response && error.response.status === 401) {
            this.$store.dispatch('logLout');
          } else {
            this.$toast.add({
              severity: 'error',
              summary: error,
              life: 3000,
            });
          }
        });
    },
    remove_event() {
      this.$confirm.require({
        message: this.$t('common.doYouWantDelete'),
        header: this.$t('common.delete'),
        icon: 'pi pi-info-circle',
        acceptClass: 'p-button-rounded p-button-success',
        rejectClass: 'p-button-rounded p-button-danger',
        accept: () => {
          this.remove(this.selectedEvent.work_plan_event_id);
        },
      });
    },
    remove(event_id) {
      this.planService
        .removeEvent(event_id)
        .then((res) => {
          if (res.data.is_success) {
            this.$toast.add({
              severity: 'success',
              summary: this.$t('common.success'),
              life: 3000,
            });
            this.getPlan();
            this.getEventsTree(this.parentNode);
          }
        })
        .catch((error) => {
          if (error.response && error.response.status === 401) {
            this.$store.dispatch('logLout');
          } else {
            this.$toast.add({
              severity: 'error',
              summary: error,
              life: 3000,
            });
          }
        });
    },
    isUserResp(data) {
      if (!Array.isArray(data)) return false;
      return data.some((e) => {
        return e.id === this.loginedUserId;
      });
    },
    viewDoc() {
      this.$router.push({
        name: 'WorkPlanView',
        params: { id: this.work_plan_id },
      });
    },
    navigateToReports() {
      this.$router.push({
        name: 'WorkPlanReport',
        params: { id: this.work_plan_id },
      });
    },
    isUserApproval(data) {
      let userApproval = false;
      data.user.forEach((e) => {
        if (e.id === this.loginedUserId) {
          userApproval = true;
          return;
        }
      });
      return userApproval && data.is_finish;
    },
    initQuarter(quarter) {
      let res = '';
      switch (quarter) {
        case 1:
          res = 'I';
          break;
        case 2:
          res = 'II';
          break;
        case 3:
          res = 'III';
          break;
        case 4:
          res = 'IV';
          break;
        case 5:
          res = this.$t('workPlan.quarterYear');
          break;
      }
      return res;
    },
    showRespUsers(event, node) {
      if (node) {
        this.selectedEvent = node;
      }
      this.$refs.op.toggle(event);
    },
    closeOverlay() {
      this.selectedEvent = null;
    },
    formatDateMoment(date, showHour) {
      if (showHour)
        return moment(new Date(date)).utc().format('DD.MM.YYYY HH:mm:ss');
      return moment(new Date(date)).utc().format('DD.MM.YYYY');
    },
    toggle(ref, event, node) {
      if (node) {
        this.selectedEvent = node;
      }
      this.$refs[ref].toggle(event);
    },
    clearFilter() {
      this.filters.name.value = null;
      this.filters.status.value = null;
      this.filters.author.value = null;
      delete this.lazyParams.filters;
      this.getEventsTree();
    },
    onPage(event) {
      this.lazyParams.page = event.page;
      this.lazyParams.rows = event.rows;
      this.getEventsTree();
    },
    planSentToApprove(data) {
      this.getPlan();
      this.getEventsTree(null);
    },
    showEventResultModal(node) {
      return (
        (this.isPlanCreator &&
          !this.isUserResp(node.user) &&
          !(
            node.status.work_plan_event_status_id === 4 ||
            node.status.work_plan_event_status_id === 6
          )) ||
        node.status.work_plan_event_status_id === 5 ||
        node.status.work_plan_event_status_id === 2
      );
    },
    openPlanExecuteSidebar() {
      this.isShowPlanExecute = true;
    },
    closePlanExecuteSidebar() {
      this.selectedEvent = null;
      this.isShowPlanExecute = false;
      this.getEventsTree(this.parentNode);
      this.getPlan();
    },
    updateEventStatus(eventId) {
      this.planService
        .updateEventStatus({ event_id: eventId, status_code: 2 })
        .then((res) => {
          if (res.data.is_success) {
            this.$toast.add({
              severity: 'success',
              summary: this.$t('common.success'),
              life: 3000,
            });
            this.getPlan();
            this.getEventsTree(this.parentNode);
          }
        })
        .catch((error) => {
          if (error.response && error.response.status === 401) {
            this.$store.dispatch('logLout');
          } else {
            this.$toast.add({
              severity: 'error',
              summary: error,
              life: 3000,
            });
          }
        });
    },
    updateConfirmEvent(eventId) {
      this.$confirm.require({
        message: this.$t('common.confirmation'),
        header: this.$t('common.confirm'),
        icon: 'pi pi-info-circle',
        acceptClass: 'p-button-rounded p-button-success',
        rejectClass: 'p-button-rounded p-button-danger',
        accept: () => {
          this.updateEventStatus(eventId);
        },
      });
    },
    confirmGenerateScienceReport() {
      this.$confirm.require({
        message: this.$t('common.confirmation'),
        header: this.$t('common.confirm'),
        icon: 'pi pi-info-circle',
        acceptClass: 'p-button-rounded p-button-success',
        rejectClass: 'p-button-rounded p-button-danger',
        accept: () => {
          this.generateScienceReport();
        },
      });
    },
    generateScienceReport() {
      let data = {
        work_plan_id: parseInt(this.work_plan_id),
        report_name: null,
        report_type: null,
        quarter: null,
        halfYearType: null,
        department_id: null,
      };
      this.planService
        .createWorkPlanReport(data)
        .then((res) => {
          this.scienceReport = res.data;
          this.approval_users = [
            {
              stage: 1,
              users: [],
              titleRu: 'Участники проекта',
              titleKz: 'Жоба қатысушылары',
              titleEn: 'Project participants',
              certificate: {
                namekz: 'Жеке тұлғаның сертификаты',
                nameru: 'Сертификат физического лица',
                nameen: 'Certificate of an individual',
                value: 'individual',
              },
            },
            {
              stage: 2,
              users: [],
              titleRu: 'Научный руководитель проекта',
              titleKz: 'Жобаның ғылыми жетекшісі',
              titleEn: 'Project Scientific Director',
              certificate: {
                namekz: 'Жеке тұлғаның сертификаты',
                nameru: 'Сертификат физического лица',
                nameen: 'Certificate of an individual',
                value: 'individual',
              },
            },
            {
              stage: 3,
              users: [],
              titleRu: 'Ответственные от управления научных проектов',
              titleKz: 'Ғылыми жобалар басқармасынан жауапты тұлға',
              titleEn: 'Employee of Scientific Projects Management',
              certificate: {
                namekz: 'Ішкі құжат айналымы үшін (ГОСТ)',
                nameru: 'Для внутреннего документооборота (ГОСТ)',
                nameen: 'For internal document management (GOST)',
                value: 'internal',
              },
            },
            {
              stage: 3,
              users: [],
              titleRu: 'Заместитель директора департамента науки',
              titleKz: 'Ғылым департаменті директорының орынбасары',
              titleEn: 'Deputy Director of the Department of Science',
              certificate: {
                namekz: 'Ішкі құжат айналымы үшін (ГОСТ)',
                nameru: 'Для внутреннего документооборота (ГОСТ)',
                nameen: 'For internal document management (GOST)',
                value: 'internal',
              },
            },
            {
              stage: 4,
              users: [],
              titleRu: 'И.о. директора департамента науки',
              titleKz: 'Ғылым департаменті директорының м.а',
              titleEn: 'Acting Director of the Department of Science',
              certificate: {
                namekz: 'Ішкі құжат айналымы үшін (ГОСТ)',
                nameru: 'Для внутреннего документооборота (ГОСТ)',
                nameen: 'For internal document management (GOST)',
                value: 'internal',
              },
            },
          ];
          this.showReportModal = true;
        })
        .catch((error) => {
          if (error.response && error.response.status === 401) {
            this.$store.dispatch('logLout');
          } else {
            this.$toast.add({
              severity: 'error',
              summary: error,
              life: 3000,
            });
          }
        });
    },
    rejectPlan(comment) {
      this.loading = true;
      let data = {
        comment: comment,
        work_plan_id: parseInt(this.work_plan_id),
        doc_id: this.plan.doc_id,
        work_plan_name: this.plan.work_plan_name,
      };
      this.planService
        .rejectPlan(data)
        .then((_) => {
          this.loading = false;
          this.hideDialog(this.dialog.planView);
          this.getPlan();
          this.getEventsTree(null);
        })
        .catch((error) => {
          this.$toast.add({ severity: 'error', summary: error, life: 3000 });
          this.loading = false;
        });
    },
    downloadContract(type) {
      let url = '';
      if (this.scienceDocs) {
        this.scienceDocs.forEach((e) => {
          if (
            type === 'contract' &&
            e.docType === this.docEnum.DocType.Contract
          ) {
            url = e.filePath;
            return;
          }

          if (
            type === 'additional' &&
            e.docType === this.docEnum.DocType.RelatedDoc
          ) {
            url = e.filePath;
            return;
          }
        });
      }

      if (!url) {
        this.$toast.add({
          severity: 'info',
          summary: this.$t('common.noData'),
          life: 3000,
        });
        return;
      }

      url = smartEnuApi + fileRoute + url;

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', url);
      link.setAttribute('target', '_blank');
      link.download = url;
      link.click();
      URL.revokeObjectURL(link.href);
    },
    actionsToggle(node) {
      this.isCreator = node.creator_id === this.loginedUserId;
      this.selectedEvent = node;
    },
    showDialog(dialog) {
      dialog.state = true;
    },
    hideDialog(dialog) {
      this.selectedEvent = null;
      dialog.state = false;
      this.showReportModal = false;
      this.getPlan();
      this.getEventsTree(this.parentNode);
    },
    canExecuteEvent() {
      const isStatusValid = [1, 4, 5, 6, 8].includes(
        this.selectedEvent.status.work_plan_event_status_id
      );
      console.log('Hello this is execute event!');
      return (
        (this.isPlanCreator || this.isUserApproval(this.selectedEvent)) &&
        isStatusValid
      );
    },
    uploadFile(event, name) {
      this[name] = event.files;
    },
    uploadRelatedDocs() {
      const fd = new FormData();
      if (this.documentFiles) {
        for (let file of this.documentFiles) {
          fd.append('document_files[]', file);
        }
      }
      fd.append('workPlanId', this.plan.work_plan_id);
      this.planService
        .updatePlanAttachments(fd)
        .then((_) => {
          this.hideDialog(this.dialog.uploadAdditionalFile);
          this.getPlan();
          this.getEventsTree(null);
        })
        .catch((_) => {
          this.$toast.add({
            severity: 'error',
            summary: this.$t('common.message.uploadError'),
            life: 3000,
          });
        });
    },
    initSearch(searchText) {
      this.filters.name.value = searchText;
      this.getEventsTree(null);
    },
    respUserExists(id) {
      return this.plan.responsive_users.some((user) => user.id === id);
    },
    showMySign(approvalStages) {
      try {
        for (let i in approvalStages) {
          let stage = approvalStages[i];
          let stagePassed = true;

          for (let j = 0; j < stage.users.length; j++) {
            if (stage.usersApproved[j] < 1) {
              stagePassed = false;
            }

            if (stage.users[j].userID === this.loginedUserId) {
              return true;
            }
          }

          if (!stagePassed) {
            break;
          }
        }
      } catch (e) {
        console.log(e);
        return false;
      }

      return false;
    },
    greenMySign(approvalStages) {
      let signed = true;

      try {
        for (let i in approvalStages) {
          let stage = approvalStages[i];
          let stagePassed = true;

          for (let j = 0; j < stage.users.length; j++) {
            if (stage.usersApproved[j] < 1) {
              stagePassed = false;
            }

            if (
              stage.users[j].userID === this.loginedUserId &&
              stage.usersApproved[j] < 1
            ) {
              signed = false;
            }
          }

          if (!stagePassed) {
            break;
          }
        }
      } catch (e) {
        console.log(e);
        return signed;
      }

      return signed;
    },
  },
  /*unmounted() {
    localStorage.removeItem("workPlan");
  }*/
  computed: {
    initItems() {
      return [
        {
          label: this.$t('common.show'),
          icon: 'fa-solid fa-eye',
          disabled: !(this.isPlanApproved && this.canExecuteEvent),
          visible: this.isFinish,
          command: () => {
            this.openPlanExecuteSidebar();
          },
        },
        {
          label: this.$t('common.add'),
          icon: 'fa-solid fa-plus',
          disabled: !(
            this.isPlanCreator ||
            this.isCreator ||
            (this.isUserResp(this.selectedEvent?.user) && !this.isFinish)
          ),
          visible: !this.isFinish,
          command: () => {
            this.showDialog(this.dialog.add);
          },
        },
        {
          label: this.$t('common.edit'),
          icon: 'fa-solid fa-pen',
          disabled: !((this.isPlanCreator || this.isCreator) && !this.isFinish),
          visible: !this.isFinish,
          command: () => {
            this.showDialog(this.dialog.edit);
          },
        },
        {
          label: this.$t('common.delete'),
          icon: 'fa-solid fa-trash',
          disabled: !((this.isPlanCreator || this.isCreator) && !this.isFinish),
          visible: !this.isFinish,
          command: () => {
            this.remove_event();
          },
        },
      ];
    },
    isSciencePlan() {
      return (
        this.plan &&
        this.plan.plan_type &&
        this.plan.plan_type.code === Enum.WorkPlanTypes.Science
      );
    },
    isOperPlan() {
      return (
        this.plan &&
        ((this.plan.plan_type &&
          this.plan.plan_type.code === Enum.WorkPlanTypes.Oper) ||
          this.plan.is_oper)
      );
    },
    isEventListEmpty() {
      return this.data && this.data.length === 0;
    },
    isCreatedPlan() {
      return (
        this.planDoc &&
        this.planDoc.docHistory?.stateEn === this.DocState.CREATED.Value
      );
    },
    isPlanApproved() {
      return (
        this.planDoc &&
        this.planDoc.docHistory?.stateEn === this.DocState.APPROVED.Value
      );
    },
    isPlanUnderRevision() {
      return (
        this.planDoc &&
        this.planDoc.docHistory?.stateEn === this.DocState.REVISION.Value
      );
    },
    isMastersPlan() {
      return (
        this.plan &&
        this.plan.plan_type &&
        this.plan.plan_type.code === Enum.WorkPlanTypes.Masters
      );
    },
    isDoctorsPlan() {
      return (
        this.plan &&
        this.plan.plan_type &&
        this.plan.plan_type.code === Enum.WorkPlanTypes.Doctors
      );
    },
    // isGenerateActVisible(){
    //   const currentMonth = new Date().getMonth() + 1;
    //   let receivedDate = null;

    //   if (this.planDoc && this.planDoc.docHistory) {
    //     receivedDate = this.planDoc.docHistory?.setDate;
    //   }
    //   const newDate = receivedDate ? new Date(receivedDate) : null;
    //   const receivedMonth = newDate ? newDate.getMonth() + 1 : null;
    //   const isVisible = receivedMonth < currentMonth;

    //   return (
    //     this.planDoc &&
    //     this.planDoc.docHistory &&
    //     this.planDoc.docHistory.stateEn === this.DocState.REVISION.Value &&
    //     isVisible
    //   );
    // },
    toolbarMenus() {
      return [
        {
          label: this.$t('common.add'),
          icon: 'pi pi-plus',
          visible: (this.isPlanCreator || this.isEventsNull) && !this.isFinish,
          color: 'blue',
          command: () => {
            this.showDialog(this.dialog.add);
          },
        },
        {
          label: this.$t('common.action.sendToApprove'),
          icon: 'pi pi-send',
          visible:
            this.plan &&
            this.planDoc &&
            (this.isCreatedPlan || this.isPlanUnderRevision) &&
            this.isPlanCreator &&
            this.isFinish,
          command: () => {
            this.showDialog(this.dialog.planApprove);
          },
        },
        {
          label: this.$t('common.complete'),
          icon: 'pi pi-check',
          disabled: !this.data || this.data.length === 0,
          visible: this.plan && this.isPlanCreator && !this.isFinish,
          color: 'yellow',
          command: () => {
            this.confirmFinish();
          },
        },
        {
          label: this.$t('workPlan.viewPlan'),
          icon: 'pi pi-eye',
          color: this.isFinish ? '' : 'green',
          visible:
            ((this.isMastersPlan || this.isDoctorsPlan) &&
              (!this.isFinish || this.isApproval)) ||
            (this.isFinish &&
              this.planDoc &&
              !(this.isCreatedPlan || this.isPlanUnderRevision)),
          command: () => {
            if (this.isFinish) {
              this.showDialog(this.dialog.planView);
            } else {
              this.viewDoc();
            }
          },
        },
        {
          label: this.$t('contracts.menu.actsJournal'),
          visible:
            this.isFinish &&
            this.isSciencePlan &&
            this.planDoc.docHistory?.stateEn === this.DocState.APPROVED.Value,
          command: () => {
            this.$router.push({ path: '/documents/catalog/acts' });
          },
        },
        {
          label: this.$t('workPlan.reports'),
          visible:
            this.isFinish &&
            !this.isSciencePlan &&
            (this.isApproval || this.isPlanCreator || this.isAdmin) &&
            (!(this.isMastersPlan || this.isDoctorsPlan) ||
              this.isPlanApproved),
          command: () => {
            this.navigateToReports();
          },
        },
        {
          label: this.$t('workPlan.generateAct'),
          visible:
            this.isFinish &&
            this.isPlanCreator &&
            this.isPlanApproved &&
            this.isSciencePlan,
          command: () => {
            this.confirmGenerateScienceReport();
          },
        },
        {
          label: this.$t('contracts.contract'),
          visible:
            this.isSciencePlan &&
            this.scienceDocs &&
            this.scienceDocs.some(
              (e) => e.docType === this.docEnum.DocType.Contract
            ),
          icon: 'fa-solid fa-download',
          command: () => {
            this.downloadContract('contract');
          },
        },
        {
          label: this.$t('common.additionalInfo'),
          visible:
            this.isSciencePlan &&
            this.scienceDocs &&
            this.scienceDocs.some(
              (e) => e.docType === this.docEnum.DocType.RelatedDoc
            ),
          icon: 'fa-solid fa-download',
          command: () => {
            this.downloadContract('additional');
          },
        },
        {
          label: this.$t('common.additionalInfo'),
          visible:
            this.isSciencePlan &&
            this.scienceDocs &&
            !this.scienceDocs.some(
              (e) => e.docType === this.docEnum.DocType.RelatedDoc
            ),
          icon: 'fa-solid fa-eye',
          command: () => {
            this.showDialog(this.dialog.uploadAdditionalFile);
          },
        },
        {
          label: this.$t(
            this.isMastersPlan
              ? 'workPlan.mastersThesisInfo'
              : 'workPlan.doctorsThesisInfo'
          ),
          icon: 'pi pi-file',
          visible:
            this.isPlanCreator &&
            !this.isFinish &&
            (this.isMastersPlan || this.isDoctorsPlan),
          color: 'grey',
          command: () => {
            this.showDialog(this.dialog.info);
          },
        },
      ];
    },
    isFinshButtonDisabled() {
      return this.data && this.data.length > 0;
    },
    isRespUser() {
      return this.plan && this.respUserExists(this.loginedUserId);
    },
  },
};
</script>

<style scoped lang="scss">
.customer-badge {
  border-radius: 2px;
  padding: 0.25em 0.5rem;
  text-transform: uppercase;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.3px;
  display: inline-block;
  text-align: center;

  &.status-8 {
    background: #66cd5e;
    color: #faf8f8;
  }

  &.status-6 {
    background: #ffcdd2;
    color: #c63737;
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
    background: #ffcdd2;
    color: #c63737;
  }

  &.status-2 {
    background: #c8e6c9;
    color: #256029;
  }
}
</style>
