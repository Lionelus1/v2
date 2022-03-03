<template>
  <div>
    <Button
        type="button"
        icon="pi pi-eye"
        class="p-button p-button-info p-ml-2"
        label=""
        @click="openModal"
    ></Button>
  </div>

  <Dialog :header="$t('workPlan.executionResult')" v-model:visible="eventResultModal" :style="{width: '450px'}"
          class="p-fluid">
    <div class="p-field" v-if="data.event_result">
      <label>{{ $t('common.result') }}</label>
      <Textarea v-model="data.event_result" disabled style="resize: vertical"></textarea>
    </div>
    <div class="p-field" v-if="data.event_result_file">
      <label>{{ $t('workPlan.attachments') }}</label>
      <div>
        <Button
            icon="pi pi-download"
            class="p-button-rounded p-button-success p-mr-2"
            @click="downloadFile"
        />
      </div>
    </div>
    <template #footer>
      <Button :label="$t('common.cancel')" class="p-button-rounded p-button-danger"
              @click="closeModal"/>
    </template>
  </Dialog>
</template>

<script>
import axios from "axios";
import {getHeader, smartEnuApi} from "@/config/config";

export default {
  name: "WorkPlanEventResultModal",
  props: ['eventResult'],
  data() {
    return {
      eventResultModal: false,
      data: this.eventResult
    }
  },
  methods: {
    openModal() {
      this.eventResultModal = true;
    },
    closeModal() {
      this.eventResultModal = false;
    },
    downloadFile() {
      axios.post(smartEnuApi + `/workPlan/getWorkPlanResultFile`,
          {file_path: this.data.event_result_file},{headers: getHeader()}).then(res => {
        const link = document.createElement("a");
        link.href = "data:application/octet-stream;base64," + res.data;
        link.setAttribute("download", this.data.event_result_file);
        link.download = this.data.event_result_file;
        link.click();
        URL.revokeObjectURL(link.href);
      }).catch((error) => {
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
    }
  }
}
</script>

<style scoped>

</style>