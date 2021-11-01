<template>
  <div class="card">
    <Button :label="$t('common.add')" icon="pi pi-plus" @click="openBasic"/>
  </div>

  <Dialog header="Добавить план" v-model:visible="showModal" :style="{width: '450px'}" class="p-fluid">
    <div class="p-field">
      <label>Название плана</label>
      <InputText v-model="work_plan_name" />
    </div>
    <template #footer>
      <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button-rounded p-button-danger" @click="closeBasic" />
      <Button :label="$t('common.add')" icon="pi pi-check" class="p-button-rounded p-button-success p-mr-2" @click="createPlan" />
    </template>
  </Dialog>

</template>

<script>
import axios from "axios";
import {getHeader, smartEnuApi} from "@/config/config";

export default {
  name: 'WorkPlanAdd',
  data() {
    return {
      showModal: false,
      position: 'center',
      work_plan_name: null
    }
  },
  props: ['isAdded'],
  methods: {
    openBasic() {
      this.showModal = true;
    },
    closeBasic() {
      this.showModal = false;
    },
    createPlan() {
      axios.post(smartEnuApi + `/workPlan/addPlan`, {work_plan_name: this.work_plan_name}, {
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