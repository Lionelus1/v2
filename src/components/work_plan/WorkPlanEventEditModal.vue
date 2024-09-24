<template>
  <Dialog :header="$t('workPlan.editEvent')" v-model:visible="showWorkPlanEventEditModal" :style="{ width: '450px' }" class="p-fluid" @hide="closeBasic">
    <div v-if="plan?.plan_type?.code !== Enum.WorkPlanTypes.Masters && plan?.plan_type?.code !==  Enum.WorkPlanTypes.Doctors">
        <div class="field">
        <label>{{ plan && plan.is_oper ? $t('workPlan.resultIndicator') : $t('workPlan.eventName') }}</label>
        <InputText v-model="editData.event_name" />
        <small class="p-error" v-if="submitted && formValid.event_name">{{ $t('workPlan.errors.eventNameError') }}</small>
      </div>
      <div class="field" v-if="plan && plan.plan_type.code === Enum.WorkPlanTypes.Science">
        <label>{{ $t('common.startDate') }}</label>
        <PrimeCalendar v-model="editData.start_date" dateFormat="dd.mm.yy" showIcon :showButtonBar="true"></PrimeCalendar>
      </div>
      <div class="field" v-if="plan && plan.plan_type.code === Enum.WorkPlanTypes.Science">
        <label>{{ $t('common.endDate') }}</label>
        <PrimeCalendar v-model="editData.end_date" dateFormat="dd.mm.yy" showIcon :showButtonBar="true"></PrimeCalendar>
      </div>
      <div class="field" v-if="plan && plan.plan_type.code === Enum.WorkPlanTypes.Oper">
        <label>{{ $t('common.unit') }}</label>
        <InputText v-model="editData.unit" />
      </div>
      <div class="field" v-if="plan && plan.plan_type.code === Enum.WorkPlanTypes.Oper">
        <label>{{ $t('common.planNumber') }}</label>
        <InputText v-model="editData.plan_number" />
      </div>
      <div class="field" v-if="plan && plan.plan_type.code === Enum.WorkPlanTypes.Oper">
        <label>{{ $t('workPlan.approvalUsers') }}</label>
        <InputText v-model="editData.responsible_executor" />
      </div>
      <div class="field" v-if="plan && plan.plan_type.code === Enum.WorkPlanTypes.Oper">
          <label>{{ $t('workPlan.summaryDepartment') }}</label>
          <FindUser v-model="resp_person" :max="1" editMode="true" :user-type="3"/>
      </div>
      <div class="field" v-if="plan && plan.plan_type && plan.plan_type.code !== Enum.WorkPlanTypes.Science">
        <label>{{ plan && (plan.is_oper || plan.plan_type.code === Enum.WorkPlanTypes.Oper) ? $t('workPlan.summary') : $t('workPlan.approvalUsers') }}</label>
        <FindUser v-model="selectedUsers" :editMode="true" :user-type="3"></FindUser>
        <small class="p-error" v-if="submitted && formValid.users">{{ $t('workPlan.errors.approvalUserError') }}</small>
      </div>
      <template v-if="plan && plan.plan_type && plan.plan_type.code === Enum.WorkPlanTypes.Science && inputSets">
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
      <div class="field" v-if="plan && plan.plan_type && plan.plan_type.code === Enum.WorkPlanTypes.Science">
        <Button :label="$t('common.add')" icon="fa-solid fa-add" class="p-button-sm p-button-outlined px-5" @click="addNewUser" />
      </div>
      <div class="field"
        v-if="(plan && plan.plan_type.code !== Enum.WorkPlanTypes.Science) && ((editData && parentData && parentData.quarter === 5) || !parentData)">
        <label>{{ $t('workPlan.quarter') }}</label>
        <Dropdown v-model="editData.quarter" :options="quarters" optionLabel="name" optionValue="id" :placeholder="$t('common.select')" />
        <small class="p-error" v-if="submitted && formValid.quarter">{{ $t('workPlan.errors.quarterError') }}</small>
      </div>
      <div class="field" v-if="plan && plan.plan_type.code === Enum.WorkPlanTypes.Oper">
        <label>{{ $t('common.suppDocs') }}</label>
        <Textarea v-model="editData.supporting_docs" rows="3" style="resize: vertical" />
      </div>
      <div class="field">
        <label>{{ plan && plan.plan_type.code === Enum.WorkPlanTypes.Oper ? $t('common.additionalInfo') : $t('common.result') }}</label>
        <Textarea v-model="editData.result" rows="3" style="resize: vertical" />
      </div>
    </div>
    <div v-if="plan?.plan_type?.code === Enum.WorkPlanTypes.Masters || Enum.WorkPlanTypes.Doctors">
      <div class="field">
        <label>{{$t("educationalPrograms.semester")}}</label>
        <Dropdown v-model="editData.semester" :options="semesters" optionLabel="name" optionValue="id" :placeholder="$t('educationalPrograms.semester')" />
      </div>
      <div class="field">
        <label>{{ $t('workPlan.approvalUsers') }}</label>
        <FindUser v-model="resp_person" :editMode="true" :user-type="3"></FindUser>
        <small class="p-error" v-if="submitted && formValid.users">{{ $t('workPlan.errors.approvalUserError') }}</small>
      </div>
      <div class="field" >
        <label>{{$t("workPlan.content")}}</label>
        <Textarea v-model="editData.event_name" rows="3" style="resize: vertical"/>
      </div>
      <div class="field">
        <label>{{ $t('common.startDate') }}</label>
        <PrimeCalendar v-model="editData.start_date" dateFormat="dd.mm.yy" showIcon :showButtonBar="true"></PrimeCalendar>
      </div>
      <div class="field">
        <label>{{ $t('common.endDate') }}</label>
        <PrimeCalendar v-model="editData.end_date" dateFormat="dd.mm.yy" showIcon :showButtonBar="true"></PrimeCalendar>
      </div>
      <div class="field" >
        <label>{{$t("workPlan.expectingResults")}}</label>
        <Textarea v-model="editData.result" rows="3" style="resize: vertical"/>
      </div>
    </div>
    <template #footer>
      <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button-rounded p-button-danger" @click="closeBasic" />
      <Button :label="$t('common.save')" icon="pi pi-check" class="p-button-rounded p-button-success mr-2" @click="edit" />
    </template>
  </Dialog>
</template>

<script>
import { WorkPlanService } from "@/service/work.plan.service";
import Enum from "@/enum/workplan/index"
import RolesByName from "@/components/smartenu/RolesByName.vue";
import { ContragentService } from "@/service/contragent.service";
import axios from 'axios';

export default {
  name: "WorkPlanEventEditModal", 
  components: { RolesByName }, 
  props: ['visible', 'event', 'planData', 'parent'],
  emits: ['hide'],
  data() {
    return {
      service: new ContragentService(),
      showWorkPlanEventEditModal: this.visible,
      editData: JSON.parse(JSON.stringify(this.event)),
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
      parentData: this.parent != null ? JSON.parse(JSON.stringify(this.parent)) : null,
      selectedUsers: null,
      summaryDepartment:[],
      formValid: {
        event_name: false,
        users: false,
        quarter: false,
      },
      submitted: false,
      planService: new WorkPlanService(),
      Enum: Enum,
      inputSets: null,
      semesters: [
        { 
          id: 1,
          name: '1'
        },
        {
          id: 2,
          name: '2'
        },
        {
          id: 3,
          name: '3'
        },
        {
          id: 4,
          name: '4'
        },
      ],
      resp_person: []
    }
  },
  mounted() {
    if (this.editData !== null) {
      this.editData.start_date = this.editData.start_date ? new Date(this.editData.start_date) : null
      this.editData.end_date = this.editData.end_date ? new Date(this.editData.end_date) : null
      this.selectedUsers = [];
      this.editData.quarter = parseInt(this.editData.quarter);
      
      this.editData?.user?.forEach(e => {
        this.selectedUsers.push(e.user);
        if(e.is_summary_department){
            this.summaryDepartment.push(e.user);
            this.selectedUsers.pop(e.user);
        }
        
      });
      if (this.plan && this.plan.plan_type.code === this.Enum.WorkPlanTypes.Science && this.editData.user) {
        const roleMap = new Map();

        this.editData.user.forEach(item => {
          if (item.role && item.user) {
            const { role, user } = item;
            if (roleMap.has(role.id)) {
              roleMap.get(role.id).selectedUsers.push(user);
            } else {
              roleMap.set(role.id, { selectedRole: role, selectedUsers: [user] });
            }
          }
        });
        this.inputSets = Array.from(roleMap.values());
      }
    }
    if (this.plan?.plan_type?.code === Enum.WorkPlanTypes.Doctors) {
      this.semesters.push(
        ...[
          {
            id: 5,
            name: '5',
          },
          {
            id: 6,
            name: '6',
          },
        ]
      );
    }
    this.service.getPersons({
        "filter": {
          "userIds": [this.editData?.summary_department_id],
        },
        "searchMode": this.userType == 1 ? "student" : this.userType == 2 ? "staff" : "all",
        "ldap": this.searchMode == 'ldap' ? true : false,
        "page": 0,
        "rows": 15
      }).then(
        response => {
          if (response.data.foundUsers[0]) {
            this.resp_person.push(response.data.foundUsers[0])
          }
        },
      ).catch(
        (error) => {
          console.log(error)
        }
    );
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
  unmounted() {
    this.showWorkPlanEventEditModal = false
  },
  methods: {
    closeBasic() {
      this.$emit('hide')
    },
    edit() {
      this.submitted = true;
      if (this.notValid()) {
        return;
      }
      let userIds = [];

      if (this.plan?.plan_type?.code === this.Enum.WorkPlanTypes.Science) {
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
        userIds = [];
        this.selectedUsers.forEach(e => {
          userIds.push({ user: e, role: null })
        });
      }
      let resp_person_id;
      if (this.summaryDepartment && this.summaryDepartment[0]?.userID) {
          resp_person_id = this.summaryDepartment[0].userID;
      } else {
          resp_person_id = null;
      }
      this.editData.resp_person_id = resp_person_id;

      if(this.plan?.plan_type?.code === this.Enum.WorkPlanTypes.Masters || this.Enum.WorkPlanTypes.Doctors){
        if (this.resp_person.length !== 0) {
          this.editData.resp_person_id = this.resp_person[0].userID
          this.editData.responsible_executor = this.resp_person[0].fullName
        }
      }


      this.editData.resp_person_ids = userIds;
      this.planService.editEvent(this.editData).then(res => {
        if (res.data.is_success) {
          this.$toast.add({
            severity: "success",
            summary: this.$t('workPlan.message.eventChanged'),
            life: 3000,
          });
          this.closeBasic();
          this.submitted = false;
        }
      }).catch(error => {
        this.submitted = false;
        if (error && error.error === 'summaryDepartmentadded') {
          this.$toast.add({ severity: "warn", summary: this.$t('workPlan.warnAddingsummaryDepartment'), life: 4000 });
        }
        
      });
    },
    notValid() {
      let validation = this.formValid;
      let errors = [];
      if (this.plan?.plan_type?.code === this.Enum.WorkPlanTypes.Masters || Enum.WorkPlanTypes.Doctors) {
        this.formValid.users = this.resp_person.length === 0;
        Object.keys(this.formValid).forEach(function (k) {
          if (validation[k] === true) errors.push(validation[k])
        });
        return errors.length > 0
      }
      this.formValid.event_name = this.editData.event_name === null || this.editData.event_name === '';
      this.formValid.users = this.selectedUsers.length === 0;
      this.formValid.quarter = this.editData.quarter === null;


      Object.keys(this.formValid).forEach(function (k) {
        if (validation[k] === true) errors.push(validation[k])
      });
      return errors.length > 0
    },
    addNewUser() {
      this.inputSets.push({ selectedUsers: null, selectedRole: null })
    },
    removeInputSet(index) {
      this.inputSets.splice(index, 1);
    }
  }
}
</script>

<style scoped></style>
