<template>
  <Button
      type="button"
      icon="pi pi-send"
      class="p-button-success p-ml-2"
      label="На согласование"
      @click="openModal"
  ></Button>

  <Dialog header="Отправить на согласование" v-model:visible="showModal" :style="{width: '450px'}" class="p-fluid">
    <div class="p-field">
      <label>Выберите</label>
      <ApproveComponent @change="approveChange" v-model="approval_users"></ApproveComponent>
    </div>
    <template #footer>
      <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button-rounded p-button-danger"
              @click="closeModal"/>
      <Button label="Отправить" icon="pi pi-check" class="p-button-rounded p-button-success p-mr-2" @click="approve"/>
    </template>
  </Dialog>
</template>

<script>
import axios from "axios";
import {getHeader, smartEnuApi} from "@/config/config";
import ApproveComponent from "@/components/work_plan/ApproveComponent";

export default {
  name: "WorkPlanApprove",
  components: {ApproveComponent},
  props: {
    data: {
      type: Array,
      default: null,
    }
  },
  data() {
    return {
      showModal: false,
      selectedUsers: null,
      steps: 3,
      step: 1,
      items: [{
        label: 'Personal',
        to: '/steps'
      },
        {
          label: 'Seat',
          to: '/steps/seat'
        },
        {
          label: 'Payment',
          to: '/steps/payment'
        },
        {
          label: 'Confirmation',
          to: '/steps/confirmation'
        }],
      approval_users: {
        stage: null,
        users: null
      }
    }
  },
  methods: {
    openModal() {
      console.log(this.data)
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
    },
    approve() {
      let userIds = [];
      let values = this.data;
      console.log(values)
      this.selectedUsers.forEach(e => {
        userIds.push(e.userID);
      });
      axios.post(smartEnuApi + `/workPlan/addApprove`, {
        work_plan_id: values.work_plan_id,
        user_ids: userIds
      }, {headers: getHeader()}).then(res => {
        if (res.data.is_success) {
          this.$toast.add({
            severity: "success",
            summary: "План успешно отправлен на согласование",
            life: 3000,
          });
        }
        this.showModal = false;
      }).catch(error => {
        if (error.response.status === 401) {
          this.$store.dispatch("logLout");
        } else {
          this.$toast.add({
            severity: "error",
            summary: error,
            life: 3000,
          });
        }
      })
    },
    approveChange() {
      console.log(this.approval_users)
    }
  }
}
</script>

<style scoped>

</style>