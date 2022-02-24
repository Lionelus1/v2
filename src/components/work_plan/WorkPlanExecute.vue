<template>
  <div>
    <Button label="Выполнить" icon="pi pi-check" @click="openBasic" class="p-mr-2"/>
  </div>

  <Dialog header="Выполнить мероприятие" v-model:visible="showWorkPlanExecuteModal" :style="{width: '450px'}"
          class="p-fluid">
    <div class="p-field">
      <label>Название мероприятия</label>
      <InputText v-model="event.event_name" disabled/>
    </div>
    <div class="p-field">
      <label>Результат</label>
      <Textarea v-model="result" @input="resultInput" rows="3" style="resize: vertical"/>
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
              :disabled="isDisabled" @click="saveResult"/>
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
      event: this.data,
      result: null,
      file: null,
      isDisabled: true,
    }
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
      fd.append('work_plan_event_id', this.event.work_plan_event_id);
      fd.append('result', this.result);
      if (this.file) {
        fd.append('file', this.file)
        fd.append('fname', this.file.name.replace(" ", "_"))
      }
      axios.post(smartEnuApi + `/workPlan/saveResult`, fd, {headers: getHeader()}).then(res => {
        this.emitter.emit("workPlanEventIsCompleted", true);
        this.$toast.add({severity: 'success', detail: 'Выполнено', life: 3000});
        this.showWorkPlanExecuteModal = false;
        this.clearModel();
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
    resultInput(e) {
      if (e.target.value.length > 0) {
        this.isDisabled = false;
      } else {
        this.isDisabled = true;
      }
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
      this.isDisabled = false;
    },
  }
}
</script>

<style scoped>

</style>
