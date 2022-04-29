<template>
  <Button v-if="isMain" :label="$t('workPlan.addEvent')" class="p-button-info p-ml-1" icon="pi pi-plus" @click="openBasic"/>
  <div v-else>
    <Button label="" class="p-button-info p-ml-1" icon="pi pi-plus" @click="openBasic"/>
  </div>

  <Dialog :header="$t('workPlan.addEvent')" v-model:visible="showWorkPlanEventModal"
          class="p-fluid">
    <div class="p-field">
      <label>{{ $t('workPlan.eventName') }}</label>
      <InputText v-model="event_name" />
      <small class="p-error" v-if="submitted && formValid.event_name">{{ $t('workPlan.errors.eventNameError') }}</small>
    </div>
    <div class="p-field">
      <label>{{ plan && plan.is_oper ? 'Свод' : $t('workPlan.approvalUsers') }}</label>
      <FindUser v-model="selectedUsers" :editMode="true"></FindUser>
      <small class="p-error" v-if="submitted && formValid.users">{{ $t('workPlan.errors.approvalUserError') }}</small>
    </div>
    <div class="p-field">
      <label>{{ $t('workPlan.quarter') }}</label>
      <Dropdown v-model="quarter" :options="quarters" optionLabel="name" optionValue="id" :placeholder="$t('common.select')" />
      <small class="p-error" v-if="submitted && formValid.quarter">{{ $t('workPlan.errors.quarterError') }}</small>
    </div>
    <div class="p-field" v-if="plan && plan.is_oper">
      <label>Показатель прямых результатов </label>
      <InputText v-model="direct_result" />
    </div>
    <div class="p-field" v-if="plan && plan.is_oper">
      <label>Единица измерения</label>
      <InputText v-model="unit" />
    </div>
    <div class="p-field" v-if="plan && plan.is_oper">
      <label>План </label>
      <InputText v-model="plan_number" />
    </div>
    <div class="p-field" v-if="plan && plan.is_oper">
      <label>Подтверждающие документы</label>
      <InputText v-model="supporting_docs" />
    </div>
    <div class="p-field" v-if="plan && plan.is_oper">
      <label>{{ $t('workPlan.approvalUsers') }}</label>
    </div>
    <div class="p-field">
      <label>{{ $t('common.result') }}</label>
      <Textarea v-model="result" rows="3" style="resize: vertical"/>
    </div>
    <template #footer>
      <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button-rounded p-button-danger"
              @click="closeBasic"/>
      <Button :label="$t('common.add')" icon="pi pi-check" class="p-button-rounded p-button-success p-mr-2"
              @click="createEvent"/>
    </template>
  </Dialog>
</template>

<script>
import FindUser from "@/helpers/FindUser";
import axios from "axios";
import {getHeader, smartEnuApi} from "@/config/config";

export default {
  name: 'WorkPlanEventAdd',
  components: {FindUser},
  props: ['data', 'isMain', 'items', 'planData'],
  data() {
    return {
      showWorkPlanEventModal: false,
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
      formValid: {
        event_name: false,
        users: false,
        quarter: false
      },
      submitted: false,
      newQuarters: [],
      loginedUserId: JSON.parse(localStorage.getItem("loginedUser")).userID,
      respUsers: [],
      direct_result: null,
      unit: null,
      plan_number: null,
      supporting_docs: null,
    }
  },
  mounted() {
    if (this.data)
      this.parentData = this.data;
    if (this.parentData) {
      this.quarters.length = this.quarters.findIndex(x => x.id === parseInt(this.parentData.quarter.String)) + 1;
      /*let ind = this.quarters.findIndex(x => x.id === parseInt(this.parentData.quarter.String));
      console.log(ind)
      this.quarters = this.quarters.slice(0, ind);*/
    }
  },
  created() {
    this.work_plan_id = parseInt(this.$route.params.id);
  },
  methods: {
    openBasic() {
      this.showWorkPlanEventModal = true;
      console.log("CREATE EVENT PLAN DATA = ", this.plan)
    },
    closeBasic() {
      this.showWorkPlanEventModal = false;
    },
    createEvent() {
      this.submitted = true;
      if (!this.validateForm()) {
        return;
      }
      let userIds = [];
      this.respUsers = [];
      this.selectedUsers.forEach(e => {
        userIds.push(e.userID);
        this.respUsers.push({id: e.userID, fullName: e.fullName});
      });
      if (this.parentData) {
        this.parentId = parseInt(this.parentData.work_plan_event_id);
      }
      axios.post(smartEnuApi + `/workPlan/addEvent`, {
        work_plan_id: this.work_plan_id,
        event_name: this.event_name,
        parent_id: this.parentId,
        quarter: this.quarter,
        result: this.result,
        resp_person_ids: userIds
      }, {headers: getHeader()}).then(res => {
        this.emitter.emit("workPlanEventIsAdded", true);
        this.$toast.add({severity: 'success', detail: this.$t('workPlan.message.eventCreated'), life: 3000});
        this.showWorkPlanEventModal = false;
        this.clearModel();
        //this.addToArray(res.data);
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
      this.formValid.users = this.selectedUsers.length === 0;
      this.formValid.quarter = !this.quarter;

      return this.parentData ? !this.formValid.event_name && !this.formValid.users : !this.formValid.event_name && !this.formValid.users && !this.formValid.quarter;
    },
    clearModel() {
      this.event_name = null;
      this.parentId = null;
      this.quarter = null;
      this.result = null;
      this.selectedUsers = [];
    }
  },
}
</script>
