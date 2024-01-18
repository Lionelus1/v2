<template>
  <div class="card def-border">
    <p style="text-align: justify"><em>{{ value.detailValue }}</em></p>
    <Button :label="$t('common.edit')" class="p-button-text" :onclick="update"/>
    <Button :label="$t('common.delete')" class="p-button-secondary p-button-text" :onclick="deleteValue"/>
  </div>
</template>

<script>
import api from "@/service/api";
import {getHeader, smartEnuApi} from "@/config/config";

export default {
  name: "AcademicDetailView",
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
      api
          .post("/candidate/academic-detail/delete", {id: this.value.id}, {headers: getHeader(),})
          .then(res => {
            this.emitter.emit("academicDetail", true);
          }).catch(error => {
        this.$toast.add({
          severity: "error",
          summary: error,
          life: 3000,
        });
      });
    },
    update() {
      this.emitter.emit("academicDetailUpdate", this.value);
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