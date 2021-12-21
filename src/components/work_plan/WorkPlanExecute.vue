<template>
  <Button label="Выполнить" icon="pi pi-check" @click="openBasic" class="p-mr-2"/>

  <Dialog header="Выполнить мероприятие" v-model:visible="showWorkPlanExecuteModal" :style="{width: '450px'}"
          class="p-fluid">
    <div class="p-field">
      <label>Название мероприятия</label>
      <InputText v-model="plan.event_name" disabled/>
    </div>
    <div class="p-field">
      <label>Результат</label>
      <Textarea v-model="result" rows="3" style="resize: vertical"/>
    </div>
    <div class="p-field">
      <FileUpload
          ref="form"
          mode="basic"
          :customUpload="true"
          @uploader="uploadFile($event)"
          :auto="true"
          chooseLabel="Загрузить файл"
      ></FileUpload>
    </div>
    <template #footer>
      <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button-rounded p-button-danger"
              @click="closeBasic"/>
      <Button :label="$t('common.save')" icon="pi pi-check" class="p-button-rounded p-button-success p-mr-2"
              @click="saveResult"/>
    </template>
  </Dialog>
</template>

<script>
import axios from "axios";
import {getHeader, smartEnuApi} from "@/config/config";

export default {
  name: "WorkPlanExecute",
  props: ['data'],
  data() {
    return {
      showWorkPlanExecuteModal: false,
      plan: this.data,
      result: null,
      file: null,
    }
  },
  created() {
  },
  methods: {
    openBasic() {
      this.showWorkPlanExecuteModal = true;
    },
    closeBasic() {
      this.showWorkPlanExecuteModal = false;
    },
    saveResult() {
      const fd = new FormData();
      fd.append('work_plan_id', this.plan.work_plan_id);
      fd.append('result', this.result);
      if (this.file) {
        fd.append('file', this.file)
      }
      axios.post(smartEnuApi + `/workPlan/saveResult`, fd, {headers: getHeader()}).then(res => {
        this.emitter.emit("workPlanEventIsAdded", true);
        this.$toast.add({severity: 'info', summary: 'Success', detail: 'Мероприятие успешно создан', life: 3000});
        this.showWorkPlanExecuteModal = false;
        this.clearModel();
      }).catch(error => {
        console.log(error)
      });
    },
    clearModel() {
      this.event_name = null;
      this.parentId = null;
      this.quarter = null;
      this.result = null;
      this.selectedUsers = null;
    },
    uploadFile(event) {
      this.file = event.files[0];
    },
  }
}
</script>

<style scoped>

</style>