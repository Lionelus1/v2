<template>
  <Button label="Добавить план" icon="pi pi-plus" @click="openBasic" class="p-ml-2"/>

  <Dialog header="Добавить план" v-model:visible="showModal" :style="{width: '450px'}" class="p-fluid">
    <div class="p-field">
      <label>Название плана</label>
      <InputText v-model="work_plan_name"/>
    </div>
    <div class="p-field">
      <label>Ответственные лица</label>
      <FindUser v-model="selectedUsers"></FindUser>
    </div>
    <template #footer>
      <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button-rounded p-button-danger"
              @click="closeBasic"/>
      <Button :label="$t('common.add')" icon="pi pi-check" class="p-button-rounded p-button-success p-mr-2"
              @click="createPlan"/>
    </template>
  </Dialog>

</template>

<script>
import axios from "axios";
import {getHeader, smartEnuApi} from "@/config/config";
import FindUser from "@/helpers/FindUser";

export default {
  components: {FindUser},
  name: 'WorkPlanAdd',
  data() {
    return {
      showModal: false,
      position: 'center',
      work_plan_name: null,
      selectedUsers: null,
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
      let userIds = [];
      this.selectedUsers.forEach(e => {
        userIds.push(e.userID)
      });
      axios.post(smartEnuApi + `/workPlan/addPlan`, {work_plan_name: this.work_plan_name, resp_person_ids: userIds}, {
        headers: getHeader(),
      }).then(res => {
        this.emitter.emit("workPlanIsAdded", true);
        this.$toast.add({severity: 'info', summary: 'Success', detail: 'План успешно создан', life: 3000});
        this.showModal = false;
      }).catch(error => {
        console.log(error)
      });
    }
  }
}
</script>