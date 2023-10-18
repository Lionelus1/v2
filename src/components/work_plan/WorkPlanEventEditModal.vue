<template>
  <Button label="" icon="pi pi-pencil" class="p-button-info ml-1 mt-1" @click="openBasic"/>

  <Dialog :header="$t('workPlan.editEvent')" v-model:visible="showWorkPlanEventEditModal" :style="{width: '450px'}"
          class="p-fluid">
    <div class="field">
      <label>{{ plan && plan.is_oper ? $t('workPlan.resultIndicator') : $t('workPlan.eventName') }}</label>
      <InputText v-model="editData.event_name"/>
      <small class="p-error" v-if="submitted && formValid.event_name">{{ $t('workPlan.errors.eventNameError') }}</small>
    </div>
    <div class="field" v-if="plan && plan.is_oper">
      <label>{{ $t('common.unit') }}</label>
      <InputText v-model="editData.unit" />
    </div>
    <div class="field" v-if="plan && plan.is_oper">
      <label>{{ $t('common.planNumber') }}</label>
      <InputText v-model="editData.plan_number" />
    </div>
    <div class="field" v-if="plan && plan.is_oper">
      <label>{{ $t('workPlan.approvalUsers') }}</label>
      <InputText v-model="editData.responsible_executor" />
    </div>
    <div class="field">
      <label>{{ plan && plan.is_oper ? $t('workPlan.summary') : $t('workPlan.approvalUsers') }}</label>
      <FindUser v-model="selectedUsers" :editMode="true"></FindUser>
      <small class="p-error" v-if="submitted && formValid.users">{{ $t('workPlan.errors.approvalUserError') }}</small>
    </div>
    <div class="field" v-if="(editData != null && parentData != null && parentData.quarter === 5) || !parentData">
      <label>{{ $t('workPlan.quarter') }}</label>
      <Dropdown v-model="editData.quarter" :options="quarters" optionLabel="name" optionValue="id"
                :placeholder="$t('common.select')"/>
      <small class="p-error" v-if="submitted && formValid.quarter">{{ $t('workPlan.errors.quarterError') }}</small>
    </div>
    <div class="field" v-if="plan && plan.is_oper">
      <label>{{ $t('common.suppDocs') }}</label>
      <Textarea v-model="editData.supporting_docs" rows="3" style="resize: vertical" />
    </div>
    <div class="field">
      <label>{{ plan && plan.is_oper ? $t('common.additionalInfo') : $t('common.result') }}</label>
      <Textarea v-model="editData.result" rows="3" style="resize: vertical"/>
    </div>
    <template #footer>
      <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button-rounded p-button-danger"
              @click="closeBasic"/>
      <Button :label="$t('common.save')" icon="pi pi-check" class="p-button-rounded p-button-success mr-2"
              @click="edit"/>
    </template>
  </Dialog>
</template>

<script>
import {getHeader, smartEnuApi} from "@/config/config";
import {WorkPlanService} from "@/service/work.plan.service";

export default {
  name: "WorkPlanEventEditModal",
  props: ['event', 'planData', 'parent'],
  data() {
    return {
      showWorkPlanEventEditModal: false,
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
      selectedUsers: [],
      formValid: {
        event_name: false,
        users: false,
        quarter: false
      },
      submitted: false,
      planService: new WorkPlanService()
    }
  },
  created() {
    //console.log(this.editData)
  },
  mounted() {

  },
  unmounted() {
  },
  methods: {
    openBasic() {
      this.showWorkPlanEventEditModal = true;
      if (this.editData !== null) {
        this.selectedUsers = [];
        this.editData.quarter = parseInt(this.editData.quarter);
        this.editData.user.forEach(e => {
          e.userID = e.id;
          this.selectedUsers.push(e);
        });
        this.selectedUsers = this.editData.user;
      }
    },
    closeBasic() {
      this.showWorkPlanEventEditModal = false;
    },
    edit() {
      this.submitted = true;
      if (this.notValid()) {
        return;
      }
      let userIds = [];
      this.selectedUsers.forEach(e => {
        userIds.push(e.userID)
      });
      this.editData.resp_person_ids = userIds;
      this.planService.editEvent(this.editData).then(res => {
        if (res.data.is_success) {
          this.$toast.add({
            severity: "success",
            summary: this.$t('workPlan.message.eventChanged'),
            life: 3000,
          });
          this.emitter.emit("planEventChanged", true)
          this.closeBasic();
          this.submitted = false;
        }
      }).catch(error => {
        this.submitted = false;
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
    notValid() {
      this.formValid.event_name = this.editData.event_name === null || this.editData.event_name === '';
      this.formValid.users = this.selectedUsers.length === 0;
      this.formValid.quarter = this.editData.quarter === null;

      let validation = this.formValid;
      let errors = [];
      Object.keys(this.formValid).forEach(function(k)
      {
        if (validation[k] === true) errors.push(validation[k])
      });
      return errors.length > 0
    },
  }
}
</script>

<style scoped>

</style>