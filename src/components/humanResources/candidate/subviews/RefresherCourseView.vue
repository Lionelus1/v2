<template>
  <div class="card def-border">
    <p><b>{{ $t('common.startDate') }}:</b> <em>{{ new Date(value.startDate).toLocaleDateString() }}</em></p>
    <p><b>{{ $t('common.endDate') }}:</b> <em>{{ new Date(value.endDate).toLocaleDateString() }}</em></p>
    <p><b>{{ $t('hr.edu.institution') }}:</b> <em>{{ value.institution }}</em></p>
    <p><b>{{ $t('hr.rc.title') }}:</b> <em>{{ value.title }}</em></p>
    <Button :label="$t('common.edit')" class="p-button-text" :onclick="update"/>
    <Button :label="$t('common.delete')" class="p-button-secondary p-button-text" :onclick="deleteValue"/>
  </div>
</template>

<script>
import axios from "axios";
import {getHeader, smartEnuApi} from "@/config/config";

export default {
  name: "RefresherCourseView",
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
      axios
          .post(smartEnuApi + "/candidate/refresher-course/delete", {id: this.value.id}, {headers: getHeader(),})
          .then(res => {
            this.emitter.emit("refresherCourse", true);
          }).catch(error => {
        this.$toast.add({
          severity: "error",
          summary: error,
          life: 3000,
        });
      });
    },
    update() {
      this.emitter.emit("refresherCourseUpdate", this.value);
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