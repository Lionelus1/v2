<template>
  <div class="card def-border">
    <p style="text-align: justify"><em>{{ value.info }}</em></p>
    <Button :label="$t('common.edit')" class="p-button-text" :onclick="update"/>
    <Button :label="$t('common.delete')" class="p-button-secondary p-button-text" :onclick="deleteValue"/>
  </div>
</template>

<script>
import axios from "axios";
import {getHeader, smartEnuApi} from "@/config/config";

export default {
  name: "InfoView",
  props: {
    modelValue: null,

  },
  data() {
    return {
      value: this.modelValue,
    }
  },
  methods: {
    deleteValue() {
      this.value.info = null
      axios
          .post(smartEnuApi + "/candidate/info/update", this.value, {headers: getHeader(),})
          .then(res => {
            this.emitter.emit("info", true);
          }).catch(error => {
        this.$toast.add({
          severity: "error",
          summary: error,
          life: 3000,
        });
      });
    },
    update() {
      this.emitter.emit("infoUpdate", this.value);
    }
  }
}
</script>

<style>
.def-border {
  border: 1px solid #dee2e6;

  border-radius: 0;
}
</style>