<template>
  <Button
    type="button"
    icon="pi pi-document"
    class="p-button p-button-outlined ml-2"
    :label="$t('workPlan.createReport')"
    @click="openModal"
  ></Button>
  <Dialog
    :header="$t('workPlan.reports')"
    v-model:visible="selectQuarterModal"
    :style="{ width: '450px' }"
    class="p-fluid"
  >
    <div class="field">
      <label>{{ $t('workPlan.reportName') }}</label>
      <InputText v-model="report_name" />
    </div>
    <div class="field" v-if="!isMastersPlan && !isDoctorsPlan">
      <label>{{ $t('common.type') }}</label>
      <Dropdown
        v-model="type"
        :options="reportTypes"
        optionLabel="name"
        optionValue="id"
        :placeholder="$t('common.select')"
        @select="selectReportType"
      />
    </div>
    <div class="field" v-if="type === 2">
      <label>{{ $t('workPlan.quarter') }}</label>
      <Dropdown
        v-model="quarter"
        :options="reportQuarters"
        optionLabel="name"
        optionValue="id"
        :placeholder="$t('common.select')"
      />
    </div>
    <div class="field" v-if="type === 3">
      <label>{{ $t('workPlan.reportTypes.halfYear') }}</label>
      <Dropdown
        v-model="selectedHalfYear"
        :options="halfYearTypes"
        optionLabel="name"
        optionValue="id"
        :placeholder="$t('common.select')"
      />
    </div>
    <div class="field" v-if="isOperPlan">
      <label>{{ $t('common.department') }}</label>
      <Dropdown
        v-model="selectedDepartment"
        :options="departments"
        optionLabel="department_name"
        optionValue="department_id"
        :filter="true"
        :show-clear="true"
        :placeholder="$t('common.select')"
      />
    </div>
    <div class="field" v-if="isMastersPlan || isDoctorsPlan">
      <label>{{ $t('workPlan.semester') }}</label>
      <Dropdown
        v-model="quarter"
        :options="semesters"
        optionLabel="name"
        optionValue="id"
        :placeholder="$t('common.select')"
      />
    </div>
    <template #footer>
      <Button
        :label="$t('common.cancel')"
        icon="pi pi-times"
        class="p-button-rounded p-button-danger"
        @click="closeModal"
      />
      <Button
        label="Ок"
        icon="pi pi-check"
        class="p-button-rounded p-button-success mr-2"
        @click="create"
      />
    </template>
  </Dialog>
</template>

<script>
import axios from 'axios';
import { getHeader, smartEnuApi, findRole } from '@/config/config';
import { WorkPlanService } from '@/service/work.plan.service';
import Enum from '@/enum/workplan/index';

export default {
  name: 'WorkPlanReportModal',
  props: ['planId', 'plan'],
  data() {
    return {
      loginedUser: JSON.parse(localStorage.getItem('loginedUser')),
      selectQuarterModal: false,
      quarter: null,
      type: null,
      work_plan_id: this.planId,
      report_name: this.plan.work_plan_name,
      reportTypes: [
        {
          id: 1,
          name: this.$t('workPlan.reportTypes.year'),
        },
        {
          id: 2,
          name: this.$t('workPlan.reportTypes.quarter'),
        },
        {
          id: 3,
          name: this.$t('workPlan.reportTypes.halfYear')
        },
      ],
      reportQuarters: [
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
      ],
      isPdf: false,
      selectedDepartment:
        !this.isPlanCreator && this.loginedUser
          ? this.loginedUser.mainPosition.department.id
          : null,
      selectedHalfYear: null,
      selectedRespUser: null,
      halfYearTypes: [
        {
          id: 1,
          name: 1,
        },
        {
          id: 2,
          name: 2,
        },
      ],
      departments: [],
      respUsers: [],
      planCreator: null,
      isAdmin: false,
      planService: new WorkPlanService(),
      Enum: Enum,
      departmentId: null,
      semesters: [
        {
          id: 1,
          name: 1,
        },
        {
          id: 2,
          name: 2,
        },
        {
          id: 3,
          name: 3,
        },
        {
          id: 4,
          name: 4,
        },
      ],
    };
  },
  mounted() {
    if (this.plan.is_oper) {
      this.reportTypes.push({
        id: 3,
        name: this.$t('workPlan.reportTypes.halfYear'),
      });
      this.getDepartments();
      this.getRespUsers();
    }
    if (this.isDoctorsPlan) {
      this.semesters.push(
        {
          id: 5,
          name: 5,
        },
        {
          id: 6,
          name: 6,
        }
      );
    }
  },
  computed: {
    isOperPlan() {
      return (
        this.plan &&
        ((this.plan.plan_type &&
          this.plan.plan_type.code === Enum.WorkPlanTypes.Oper) ||
          this.plan.is_oper)
      );
    },
    isMastersPlan() {
      return this.plan?.plan_type?.code === Enum.WorkPlanTypes.Masters;
    },
    isDoctorsPlan() {
      return this.plan?.plan_type?.code === Enum.WorkPlanTypes.Doctors;
    },
    showCreateReportButton() {
      return (
        (this.plan && this.plan.user.id === this.loginedUser.userID) ||
        this.getResposiveUser
      );
    },
    isPlanCreator() {
      return (
        this.plan &&
        this.plan.user &&
        this.plan.user.id === this.loginedUser.userID
      );
    },
  },
  created() {
    this.respUsers = this.respUsers || [];
    this.isAdmin = this.findRole(null, 'main_administrator');
    this.getDepartments();
  },
  methods: {
    findRole: findRole,
    selectReportType() {
      /*if (this.type === 1) {

      } else if (this.type === 2) {

      }*/
    },
    getResposiveUser() {
      return this.plan.responsive_users.some(
        (user) => user.id === this.loginedUser.userID
      );
    },
    getDepartments() {
      this.departments = [];
      this.planService
        .getDepartments(parseInt(this.work_plan_id))
        .then((res) => {
          if (res.data) {
            this.departments = res.data;
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
    getRespUsers() {
      this.planService
        .getRespUsers(parseInt(this.work_plan_id))
        .then((res) => {
          if (res.data) {
            this.respUsers = res.data;
            this.planCreator = this.plan.user.id;
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

    create() {
      let data = {
        work_plan_id: parseInt(this.work_plan_id),
        report_name: this.report_name,
        report_type: this.type,
        quarter: this.type === 2 ? this.quarter : null,
        halfYearType: this.type === 3 ? this.selectedHalfYear : null,
        department_id: this.departmentId,
      };
      if (this.plan.plan_type.code === Enum.WorkPlanTypes.Masters ||  Enum.WorkPlanTypes.Doctors) {
        data.report_type = 8;
        data.quarter = this.quarter;
        data.creator_id = this.loginedUser.userID;
      }

      if (this.plan.plan_type.code === Enum.WorkPlanTypes.Oper) {
        this.departmentId = this.selectedDepartment
          ? this.selectedDepartment
          : null;
      }
      this.planService
        .createWorkPlanReport(data)
        .then((res) => {
          this.emitter.emit('isReportCreated', true);
          this.closeModal();
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

    openModal() {
      this.loginedUser = JSON.parse(localStorage.getItem('loginedUser'));
      (this.selectedDepartment = !this.isPlanCreator
        ? this.loginedUser.mainPosition.department.id
        : null),
        (this.selectQuarterModal = true);
    },
    closeModal() {
      this.selectQuarterModal = false;
      this.quarter = null;
      this.type = null;
    },
  },
};
</script>

<style scoped></style>
