<template>
  <Button label="Добавить план" icon="pi pi-plus" @click="openBasic" class="p-ml-2"/>

  <Dialog header="Добавить план" v-model:visible="showModal" :style="{width: '450px'}" class="p-fluid">
    <div class="p-field">
      <label>Название плана</label>
      <InputText v-model="work_plan_name" @input="input" v-on:keyup.enter="sendDoc"/>
    </div>
    <template #footer>
      <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button-rounded p-button-danger"
              @click="closeBasic"/>
      <Button :label="$t('common.add')" icon="pi pi-check" class="p-button-rounded p-button-success p-mr-2"
              :disabled="isDisabled" @click="sendDoc"/>
    </template>
  </Dialog>

</template>

<script>
import axios from "axios";
import {getHeader, signerApi, smartEnuApi} from "@/config/config";

export default {
  name: 'WorkPlanAdd',
  data() {
    return {
      showModal: false,
      position: 'center',
      work_plan_name: null,
      steps: [
        {
          label: 'Personal',
          to: '/'
        },
        {
          label: 'Seat',
          to: '/seat'
        },
        {
          label: 'Payment',
          to: '/payment'
        },
        {
          label: 'Confirmation',
          to: '/confirmation'
        }],
      documentID: null,
      isDocCreated: false,
      isDisabled: true,
    }
  },
  props: ['isAdded', 'isSub'],
  methods: {
    openBasic() {
      this.showModal = true;
    },
    closeBasic() {
      this.showModal = false;
    },
    createPlan() {
      axios.post(smartEnuApi + `/workPlan/addPlan`, {work_plan_name: this.work_plan_name, doc_id: this.documentID}, {
        headers: getHeader(),
      }).then(res => {
        this.emitter.emit("workPlanIsAdded", true);
        this.$toast.add({severity: 'info', summary: 'Success', detail: 'План успешно создан', life: 3000});
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
      });
    },
    sendDoc() {
      axios.post(signerApi + '/documents', {
        id: null,
        name: this.work_plan_name,
      }, {headers: getHeader()}).then((response) => {
        if (response.data.id !== null || response.data.id !== '') {
          this.documentID = response.data.uuid
          this.setDocHistory(response.data)
        } else {
          this.$toast.add({
            severity: 'error',
            summary: this.$t('ncasigner.failToSendDoc'),
            life: 3000
          });
        }
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
      });
    },
    setDocHistory(document) {
      let loginedUserId = JSON.parse(localStorage.getItem("loginedUser")).userID;
      axios.post(signerApi + '/documents/history', {
        id: null,
        stateId: 1,
        documentUuid: document.uuid,
        setterId: loginedUserId
      }, {headers: getHeader()}).then((response) => {
        if (response.data.id !== null || response.data.id !== '') {
          this.createPlan();
        } else {
          this.$toast.add({
            severity: 'error',
            summary: this.$t('ncasigner.failToSendDoc'),
            life: 3000
          });
        }
      });
    },
    input(event) {
      this.isDisabled = event.target.value.length <= 0;
    }
  }
}
</script>
