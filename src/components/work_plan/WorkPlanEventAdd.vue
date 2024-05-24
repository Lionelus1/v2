<template>
  <Dialog :header="$t('workPlan.addEvent')" v-model:visible="showWorkPlanEventModal" :style="{width: '600px'}" @hide="closeBasic" :close-on-escape="true">
    <div class="p-fluid">
      <div class="field">
        <label>{{ plan && plan.plan_type.code === Enum.WorkPlanTypes.Oper ? $t('workPlan.resultIndicator') : $t('workPlan.eventName') }}</label>
        <InputText v-model="event_name" />
        <small class="p-error" v-if="submitted && formValid.event_name">{{ $t('workPlan.errors.eventNameError') }}</small>
      </div>
      <div class="field" v-if="plan && plan.plan_type.code === Enum.WorkPlanTypes.Science">
        <label>{{ $t('common.startDate') }}</label>
        <PrimeCalendar v-model="start_date" dateFormat="dd.mm.yy" showIcon :showButtonBar="true"></PrimeCalendar>
      </div>
      <div class="field" v-if="plan && plan.plan_type.code === Enum.WorkPlanTypes.Science">
        <label>{{ $t('common.endDate') }}</label>
        <PrimeCalendar v-model="end_date" dateFormat="dd.mm.yy" showIcon :showButtonBar="true"></PrimeCalendar>
      </div>
      <div class="field" v-if="plan && plan.plan_type.code === Enum.WorkPlanTypes.Oper">
        <label>{{ $t('common.unit') }}</label>
        <InputText v-model="unit" />
      </div>
      <div class="field" v-if="plan && plan.plan_type.code === Enum.WorkPlanTypes.Oper">
        <label>{{ $t('common.planNumber') }}</label>
        <InputText v-model="plan_number" />
      </div>
      <div class="field" v-if="plan && plan.plan_type.code === Enum.WorkPlanTypes.Oper">
        <label>{{ $t('workPlan.approvalUsers') }}</label>
        <InputText v-model="responsible_executor" />
      </div>
      <div class="field" v-if="plan && plan.plan_type.code === Enum.WorkPlanTypes.Oper">
        <label>{{ $t('workPlan.summaryDepartment') }}</label>
        <FindUser v-model="summaryDepartment" :max="1" :user-type="3" editMode="true"/>
        <!-- <small class="p-error" v-if="submitted && formValid.summaryUser">{{ $t("common.requiredField") }}</small> -->
        <small class="p-error" v-if="submitted && formValid.summaryUser">{{ $t('workPlan.errors.approvalUserError') }}</small>
      </div>
      <div class="field" v-if="plan && plan.plan_type && plan.plan_type.code !== Enum.WorkPlanTypes.Science">
        <label>{{ plan && plan.plan_type.code === Enum.WorkPlanTypes.Oper ? $t('workPlan.summary') : $t('workPlan.approvalUsers') }}</label>
        <FindUser v-model="selectedUsers" :editMode="true" :user-type="3"></FindUser>
        <small class="p-error" v-if="submitted && formValid.users">{{ $t('workPlan.errors.approvalUserError') }}</small>
      </div>
      <template v-if="plan && plan.plan_type && plan.plan_type.code === Enum.WorkPlanTypes.Science">
        <div v-for="(inputSet, index) in inputSets" :key="index">
          <div class="field">
            <label>{{ $t('workPlan.scienceParticipants') }}</label>
            <FindUser v-model="inputSet.selectedUsers" :editMode="true" :user-type="3"></FindUser>
            <small class="p-error" v-if="submitted && formValid.users">{{ $t('workPlan.errors.approvalUserError') }}</small>
          </div>
          <div class="field">
            <label for="name">{{ $t('common.role') }}</label>
            <RolesByName v-model="inputSet.selectedRole" roleGroupName="workplan_science"></RolesByName>
          </div>
          <p style="text-align: right;" class="mb-3">
            <Button v-if="inputSets && inputSets.length > 1 && index > 0" icon="pi pi-times" class="p-button-danger p-button-sm p-button-outlined"  @click="removeInputSet(index)" outlined />
          </p>
        </div>
      </template>
    </div>
    <div class="field" v-if="plan && plan.plan_type && plan.plan_type.code === Enum.WorkPlanTypes.Science">
      <Button :label="$t('common.add')" icon="fa-solid fa-add" class="p-button-sm p-button-outlined px-5" @click="addNewUser" />
    </div>
    <div class="p-fluid">
      <div class="field" v-if="plan && plan.plan_type.code !== Enum.WorkPlanTypes.Science && !parentData || (parentData && parentData.quarter === 5)">
        <label>{{ $t('workPlan.quarter') }}</label>
        <Dropdown v-model="quarter" :options="quarters" optionLabel="name" optionValue="id" :placeholder="$t('common.select')" />
        <small class="p-error" v-if="submitted && formValid.quarter">{{ $t('workPlan.errors.quarterError') }}</small>
      </div>
      <div class="field" v-if="isOperPlan">
        <label>{{ $t('common.suppDocs') }}</label>
        <Textarea v-model="supporting_docs" rows="3" style="resize: vertical" />
      </div>
      <div class="field">
        <label>{{ isOperPlan ? $t('common.additionalInfo') : $t('common.result') }}</label>
        <Textarea v-model="result" rows="3" style="resize: vertical"/>
      </div>
    </div>
    <template #footer>
      <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button-rounded p-button-danger"
              @click="closeBasic"/>
      <Button :label="$t('common.add')" icon="pi pi-check" class="p-button-rounded p-button-success mr-2"
              @click="createEvent"/>
    </template>
  </Dialog>
</template>

<script>
import {getHeader, smartEnuApi} from "@/config/config";
import {WorkPlanService} from "@/service/work.plan.service";
import Enum from "@/enum/workplan/index";
import RolesByName from "@/components/smartenu/RolesByName.vue";

export default {
  name: 'WorkPlanEventAdd',
  props: ['visible', 'data', 'isMain', 'items', 'planData'],
  components: {RolesByName},
  emits: ['hide'],
  data() {
    return {
      formData: {},
      showWorkPlanEventModal: this.visible,
      work_plan_id: null,
      event_name: null,
      resp_person_id: null,
      quarter: null,
      result: null,
      comment: null,
      parentItems: this.items,
      plan: this.planData,
      quarters: [
        {
          id: 1,
          name: 'I'
        },
        {
          id: 2,
          name: 'II'
        },
        {
          id: 3,
          name: 'III'
        },
        {
          id: 4,
          name: 'IV'
        },
        {
          id: 5,
          name: this.$t('workPlan.quarterYear')
        }
      ],
      selectedUsers: [],
      parentData: null,
      parentId: null,
      summaryDepartment: [],
      formValid: {
        event_name: false,
        summaryUser: false,
        users: false,
        quarter: false,
      },
      submitted: false,
      newQuarters: [],
      loginedUserId: JSON.parse(localStorage.getItem("loginedUser")).userID,
      respUsers: [],
      unit: null,
      plan_number: null,
      supporting_docs: null,
      responsible_executor: null,
      planService: new WorkPlanService(),
      Enum: Enum,
      inputSets: [{ selectedUsers: '', selectedRole: '' }],
      start_date: new Date,
      end_date: new Date(),
      
    }
  },
  mounted() {
    if (this.data)
      this.parentData = this.data;
    if (this.parentData) {
      this.quarters.length = this.quarters.findIndex(x => x.id === this.parentData.quarter) + 1;
      this.quarter = parseInt(this.parentData.quarter);
      /*let ind = this.quarters.findIndex(x => x.id === parseInt(this.parentData.quarter.String));
      console.log(ind)
      this.quarters = this.quarters.slice(0, ind);*/
    }
    if (this.summaryDepartment && this.summaryDepartment.length === 0) {
      if (this.selectedUsers.length > 0) {
        this.selectedUsers.shift();
      }
    }
   
  },
  watch: {
    summaryDepartment: {
      handler(newVal) {
        if (newVal.length === 0) {
        this.selectedUsers.shift();
        } else {
          this.selectedUsers.unshift(...newVal);
        }
      },
      deep: true,
    },
  },
  created() {
    this.work_plan_id = parseInt(this.$route.params.id);
    
   

  },
  computed: {
    isSciencePlan() {
      return this.plan && this.plan.plan_type && this.plan.plan_type.code === Enum.WorkPlanTypes.Science
    },
    isOperPlan() {
      return this.plan && ((this.plan.plan_type && this.plan.plan_type.code === Enum.WorkPlanTypes.Oper) || this.plan.is_oper)
    }
  },
  methods: {
    getFullname(user) {
      if (!user) {
        return ''
      }

      let fullname = ''
      if (this.$i18n.locale === 'en') {
        fullname += user.lastnameEn + ' ' + user.firstnameEn

        if (user.thirdnameEn) {
          fullname += ' ' + user.thirdnameEn
        }
      }

      if (fullname.length > 0) {
        return fullname
      }

      fullname += user.thirdName + ' ' + user.firstName

      if (user.lastName) {
        fullname += ' ' + user.lastName
      }

      return fullname
    },
    createEvent() {
      this.submitted = true;

      if (!this.validateForm()) {
        return;
      }
      let userIds = [];
      this.respUsers = [];

      if (this.plan && this.plan.plan_type && this.plan.plan_type.code === this.Enum.WorkPlanTypes.Science) {
        userIds = this.inputSets.reduce((acc, inputSet) => {
          inputSet.selectedUsers.forEach(user => {
            acc.push({
              user: user,
              role: inputSet.selectedRole,
            });
          });
          return acc;
        }, []);
      } else {
        this.selectedUsers.forEach(e => {
          userIds.push({user: e, role: null});
            this.respUsers.push({id: e.userID, fullName: e.fullName});
          
          
        });
      }

      if (this.parentData) {
        this.parentId = parseInt(this.parentData.work_plan_event_id);
      }
      let resp_person_id;
      if (this.summaryDepartment && this.summaryDepartment[0]?.userID) {
          resp_person_id = this.summaryDepartment[0].userID;
      } else {
          resp_person_id = null;
      }
      let data = {
        work_plan_id: this.work_plan_id,
        event_name: this.event_name,
        parent_id: this.parentId,
        resp_person_id: resp_person_id,
        quarter: this.quarter,
        result: this.result,
        resp_person_ids: userIds
      };
      if (this.plan && this.plan.plan_type && this.plan.plan_type.code === this.Enum.WorkPlanTypes.Oper) {
        data.unit = this.unit;
        data.plan_number = this.plan_number;
        data.responsible_executor = this.responsible_executor;
        data.supporting_docs = this.supporting_docs;
      }

      if (this.plan && this.plan.plan_type && this.plan.plan_type.code === this.Enum.WorkPlanTypes.Science) {
        data.start_date = this.start_date
        data.end_date = this.end_date
      }

      this.planService.createEvent(data).then(res => {
        this.emitter.emit("workPlanEventIsAdded", {is_success: true, is_main: this.isMain});
        this.$toast.add({severity: 'success', detail: this.$t('workPlan.message.eventCreated'), life: 3000});
        this.showWorkPlanEventModal = false;
        this.clearModel();
        //this.addToArray(res.data);
      }).catch(error => {
        if (error && error.error === 'summaryuseradded') {
          this.$toast.add({ severity: "warn", summary: this.$t('workPlan.warnAddingSummaryUser'), life: 4000 });
        }
      });
    },
    addToArray(data) {
      data.user = this.respUsers;
      data.quarter = { String: JSON.stringify(this.quarter), Valid: true }
      data.status = {
        work_plan_event_status_id: 1,
            name_ru: "Запланировано",
            name_kz: "Жоспарланды",
            name_en: "Planned"
      }
      this.parentItems.push(data);
    },
    validateForm() {
      this.formValid.event_name = !this.event_name;
      this.formValid.summaryUser = !this.summaryDepartment.length === 0;
      // this.formValid.users = this.selectedUsers.length === 0;
      // this.formValid.quarter = !this.quarter;

      return this.parentData ? !this.formValid.event_name && !this.formValid.users && !this.formValid.summaryUser : !this.formValid.event_name && !this.formValid.users && !this.formValid.quarter && !this.formValid.summaryUser;
    },
    clearModel() {
      this.event_name = null;
      this.parentId = null;
      this.quarter = null;
      this.result = null;
      this.unit = null;
      this.plan_number = null;
      this.responsible_executor = null;
      this.supporting_docs = null;
      this.selectedUsers = [];
      this.inputSets = [{ selectedUsers: '', selectedRole: '' }]
      this.start_date = new Date()
      this.end_date = new Date()
      this.closeBasic()
    },
    closeBasic() {
      this.$emit('hide')
    },
    addNewUser() {
      this.inputSets.push({ selectedUsers: null, selectedRole: null })
    },
    removeInputSet(index) {
      this.inputSets.splice(index, 1);
    }
  },
}
</script>
