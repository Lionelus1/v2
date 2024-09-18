<template>
  <Dialog :header="$t('workPlan.editEvent')" v-model:visible="showWorkPlanEventEditModal" :style="{ width: '450px' }" class="p-fluid" @hide="closeBasic">
    <!-- remove this text -->
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
        <FindUser v-model="summaryDepartment" :max="1" editMode="true" :user-type="3"/>
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
    <div class="field">
      <label>{{ plan && plan.plan_type.code === Enum.WorkPlanTypes.Oper ? $t('common.comment') : $t('common.comment') }}</label>
      <Textarea v-model="editorComment" rows="3" style="resize: vertical" />
      <small class="p-error" v-if="submitted && !editorComment?.length > 0">{{ $t('common.requiredField') }}</small>
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

export default {
  name: "WorkPlanEventEditModal", 
  components: { RolesByName }, 
  props: ['visible', 'event', 'copiedEvent', 'planData', 'parent'],
  emits: ['hide'],
  data() {
    return {
      showWorkPlanEventEditModal: this.visible,
      editData: JSON.parse(JSON.stringify(this.event)),
      copyedEvent: this.copiedEvent ? JSON.parse(JSON.stringify(this.copiedEvent)) : {},
      copyedEventUser: this.copiedEvent && this.copiedEvent.user ? JSON.parse(JSON.stringify(this.copiedEvent.user)) : {},
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
        quarter: false
      },
      submitted: false,
      planService: new WorkPlanService(),
      Enum: Enum,
      inputSets: null,
      editorComment: null,
      addedRespUser: [],
      removedRespUser: [],
      removedUserNames: "",
      addedUserNames: "",
      copiedEventRespUserNames: "",
      selectedEventRespUserNames: ""

    }
  },
  mounted() {
    if (this.editData !== null) {
      this.editData.start_date = this.editData.start_date ? new Date(this.editData.start_date) : null
      this.editData.end_date = this.editData.end_date ? new Date(this.editData.end_date) : null
      this.selectedUsers = [];
      this.editData.quarter = parseInt(this.editData.quarter);
      this.editData.user.forEach(e => {
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

      this.editData.resp_person_ids = userIds;

      //resp person history change
      let commentData = "";
      let copySummaryDepUser = this.copyedEvent?.user[0]?.user;
      let currentSummaryDepUser;
      if (Array.isArray(this.summaryDepartment) && this.summaryDepartment.length > 0) {
          currentSummaryDepUser = this.summaryDepartment[0];
      }
      this.copiedEventRespUserNames = this.copyedEventUser.map(item => {
                      const user = item.user || {};
                      const lastName = user.lastName ? user.lastName : '';
                      const fullName = `${user.thirdName || ''} ${user.firstName || ''} ${lastName}`.trim();
                      return fullName;
                    }).filter(name => name).join(', ');
      
      
      

    

      if((this.editorComment && this.editorComment.length > 0)|| (copySummaryDepUser !== null && currentSummaryDepUser !== null) || (this.addedRespUser?.length > 0 || this.removedRespUser?.length > 0)){
            commentData += "{";
            let currentDepUserFullName;
            let copyDepUserFullName;
          if(this.plan && this.plan.plan_type && this.plan.plan_type.code === this.Enum.WorkPlanTypes.Oper){
            if (copySummaryDepUser !== null && currentSummaryDepUser !== null){
              if (copySummaryDepUser?.userID !== currentSummaryDepUser?.userID){
                let currentLastName = '';
                if(currentSummaryDepUser && currentSummaryDepUser?.lastName !== null){
                  currentLastName += currentSummaryDepUser.lastName;
                }
                currentDepUserFullName = currentSummaryDepUser.thirdName + ' ' + currentSummaryDepUser.firstName + ' ' + currentLastName;
                let copyLastName = '';
                if(copySummaryDepUser && copySummaryDepUser?.lastName !== null){
                  copyLastName += copySummaryDepUser.lastName;
                }
                copyDepUserFullName = copySummaryDepUser.thirdName + ' ' + copySummaryDepUser.firstName + ' ' + copyLastName;
                commentData += '"summary_department": {'
                commentData += '"modified":['

                //before
                commentData += '{'
                commentData += '"status":'
                commentData += '{'
                commentData += '"kz":{'
                commentData += '"before":'
                commentData += '"Бұрын",'
                commentData += '"user":' + '"' + copyDepUserFullName + '"'
                commentData += '},'
                commentData += '"ru":{'
                commentData += '"before":'
                commentData += '"До",'
                commentData += '"user":' + '"' + copyDepUserFullName + '"'
                commentData += '},'
                commentData += '"en":{'
                commentData += '"before":'
                commentData += '"Before",'
                commentData += '"user":' + '"' + copyDepUserFullName + '"'
                commentData += '}'
                commentData += '}'
                commentData += '},'
                //----

                //after
                commentData += '{'
                commentData += '"status":'
                commentData += '{'
                commentData += '"kz":{'
                commentData += '"after":'
                commentData += '"Кейін",'
                commentData += '"user":' + '"' + currentDepUserFullName + '"'
                commentData += '},'
                commentData += '"ru":{'
                commentData += '"after":'
                commentData += '"После",'
                commentData += '"user":' + '"' + currentDepUserFullName + '"'
                commentData += '},'
                commentData += '"en":{'
                commentData += '"after":'
                commentData += '"After",'
                commentData += '"user":' + '"' + currentDepUserFullName + '"'
                commentData += '}'
                commentData += '}'
                commentData += '}'
                //----
                commentData += ']}'
              }
            }
            
          }

          this.compareRespUsers();
          if(this.addedRespUser?.length > 0 || this.removedRespUser?.length > 0){
            if(currentDepUserFullName?.length > 0 || copyDepUserFullName?.length > 0){
              commentData += ',"responsive_users": {'
            }else{
              commentData += '"responsive_users": {'
            }
            
            commentData += '"modified":['
            //before
            commentData += '{'
                commentData += '"status":'
                commentData += '{'
                commentData += '"kz":{'
                commentData += '"before":'
                commentData += '"Бұрын",'
                commentData += '"users":' + '"' + this.copiedEventRespUserNames + '"'
                commentData += '},'
                commentData += '"ru":{'
                commentData += '"before":'
                commentData += '"До",'
                commentData += '"users":' + '"' + this.copiedEventRespUserNames + '"'
                commentData += '},'
                commentData += '"en":{'
                commentData += '"before":'
                commentData += '"Before",'
                commentData += '"users":' + '"' + this.copiedEventRespUserNames + '"'
                commentData += '}'
                commentData += '}'
                commentData += '},'
                //----
                
                if(this.plan && this.plan.plan_type && this.plan.plan_type.code === this.Enum.WorkPlanTypes.Science){
                  this.selectedEventRespUserNames = this.inputSets.flatMap(inputSet => 
                    inputSet.selectedUsers.map(user => {
                      const thirdName = user.thirdName || '';
                      const firstName = user.firstName || '';
                      const lastName = user.lastName || ''; 
                      const fullName = `${thirdName} ${firstName} ${lastName}`.trim();
                      return fullName;
                    })
                  ).filter(name => name).join(', ');
                }else{
                  this.selectedEventRespUserNames = this.selectedUsers.map(item => {
                  const user = item || {};
                  const thirdName = user.thirdName || '';
                  const firstName = user.firstName || '';
                  const lastName = user.lastName || ''; 
                  const fullName = `${thirdName} ${firstName} ${lastName}`.trim();
                  return fullName;
                }).filter(name => name).join(', ');
                }
                
                //after
                commentData += '{'
                commentData += '"status":'
                commentData += '{'
                commentData += '"kz":{'
                commentData += '"after":'
                commentData += '"Кейін",'
                commentData += '"users":' + '"' + this.selectedEventRespUserNames + '"'
                commentData += '},'
                commentData += '"ru":{'
                commentData += '"after":'
                commentData += '"После",'
                commentData += '"users":' + '"' + this.selectedEventRespUserNames + '"'
                commentData += '},'
                commentData += '"en":{'
                commentData += '"after":'
                commentData += '"After",'
                commentData += '"users":' + '"' + this.selectedEventRespUserNames + '"'
                commentData += '}'
                commentData += '}'
                commentData += '},'

                //added
                this.addedUserNames = this.addedRespUser.map(item => {
                      const user = item || {};
                      const lastName = user.lastName ? user.lastName : '';
                      const fullName = `${user.thirdName || ''} ${user.firstName || ''} ${lastName}`.trim();
                      return fullName;
                    }).filter(name => name).join(', ');
                
                commentData += '{'
                commentData += '"status":'
                commentData += '{'
                commentData += '"kz":{'
                commentData += '"added":'
                commentData += '"Қосылды",'
                commentData += '"users":' + '"' + this.addedUserNames + '"'
                commentData += '},'
                commentData += '"ru":{'
                commentData += '"added":'
                commentData += '"Добавлен",'
                commentData += '"users":' + '"' + this.addedUserNames + '"'
                commentData += '},'
                commentData += '"en":{'
                commentData += '"added":'
                commentData += '"Added",'
                commentData += '"users":' + '"' + this.addedUserNames + '"'
                commentData += '}'
                commentData += '}'
                commentData += '},'

                //removed
                commentData += '{'
                commentData += '"status":'
                commentData += '{'
                commentData += '"kz":{'
                commentData += '"removed":'
                commentData += '"Алынды",'

                this.removedUserNames = this.removedRespUser.map(item => {
                      const user = item.user || {};
                      const lastName = user.lastName ? user.lastName : '';
                      const fullName = `${user.thirdName || ''} ${user.firstName || ''} ${lastName}`.trim();
                      return fullName;
                    }).filter(name => name).join(', ');
              
                commentData += '"users":' + '"' + this.removedUserNames + '"'
                commentData += '},'
                commentData += '"ru":{'
                commentData += '"removed":'
                commentData += '"Исключен",'
                commentData += '"users":' + '"' + this.removedUserNames + '"'
                commentData += '},'
                commentData += '"en":{'
                commentData += '"removed":'
                commentData += '"Removed",'
                commentData += '"users":' + '"' + this.removedUserNames + '"'
                commentData += '}'
                commentData += '}'
                commentData += '}'
        
            commentData += ']'
            commentData += '},'
                  
            if(this.editorComment?.length > 0){  
              commentData += '"comment":"' + this.editorComment + '"';
            }else{
              commentData += '"comment":"' + '' + '"';
            }
          }
          
          commentData += '}'
      }
      if (commentData && commentData.length > 0 && commentData !== "{}" ){
        this.editData.resp_person_edit_comment = commentData
      }
      
      const noComment = !this.editorComment || this.editorComment.length <= 0;
      const noChangesInRespUser = this.removedRespUser?.length <= 0 && this.addedRespUser?.length <= 0;
      const changesInSummaryDepUser = this.copySummaryDepUser?.userID !== this.currentSummaryDepUser?.userID;
      const isOperPlan = this.plan && this.plan.plan_type && this.plan.plan_type.code === this.Enum.WorkPlanTypes.Oper

      if (noComment && noChangesInRespUser) {
        this.$toast.add({ severity: "warn", summary: this.$t('workPlan.message.noChanges'), life: 4000 });
        return false;
      }

      if (!noComment && noChangesInRespUser) {
        this.$toast.add({ severity: "warn", summary: this.$t('workPlan.message.noRespPersonChanged'), life: 4000 });
        return false;
      }

      if (noComment && !noChangesInRespUser) {
        this.$toast.add({ severity: "warn", summary: this.$t('common.noComment'), life: 4000 });
        return false;
      }
      if (isOperPlan && noComment && changesInSummaryDepUser) {
        this.$toast.add({ severity: "warn", summary: this.$t('workPlan.message.noChanges'), life: 4000 });
        return false;
      }
      
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
    compareRespUsers(){
      const copiedRespUsersSet = new Set(this.copyedEvent?.user.map(item => item?.user?.userID));
      let selectedUsersSet;
      let allSelectedUsers;

      if (this.plan && this.plan.plan_type && this.plan.plan_type.code === this.Enum.WorkPlanTypes.Science) {
        allSelectedUsers = this.inputSets.flatMap(inputSet => inputSet?.selectedUsers || []);
        selectedUsersSet = new Set(allSelectedUsers.map(user => user?.userID));
      } else {
        allSelectedUsers = this.selectedUsers;
        selectedUsersSet = new Set(this.selectedUsers.map(item => item?.userID));
      }

      this.addedRespUser = allSelectedUsers.filter(item => !copiedRespUsersSet.has(item.userID));
      this.removedRespUser = this.copyedEvent?.user.filter(item => !selectedUsersSet.has(item.user.userID)) || [];
      
    },
  
    notValid() {
      this.formValid.event_name = this.editData.event_name === null || this.editData.event_name === '';
      this.formValid.users = this.selectedUsers.length === 0;
      this.formValid.quarter = this.editData.quarter === null;

      let validation = this.formValid;
      let errors = [];
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
