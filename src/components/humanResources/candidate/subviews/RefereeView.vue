<template>
  <div class="card def-border">
    <p><b>{{ $t('common.fullName') }}:</b> <em>{{ value.fullName }}</em></p>
    <p><b>{{ $t('contact.position') }}:</b> <em>{{ value.position }}</em></p>
    <p><b>{{  $t('contact.phone') }}:</b> <em>{{ value.phoneNumber }}</em></p>
    <Button :label="$t('common.edit')" class="p-button-text" :onclick="update"/>
    <Button :label="$t('common.delete')" class="p-button-secondary p-button-text" :onclick="deleteValue"/>
  </div>
</template>

<script>
import axios from "axios";
import {getHeader, smartEnuApi} from "@/config/config";

export default {
  name: "RefereeView",
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
          .post(smartEnuApi + "/candidate/referee/delete", {id: this.value.id}, {headers: getHeader(),})
          .then(res => {
            this.emitter.emit("referee", true);
          }).catch(error => {
        this.$toast.add({
          severity: "error",
          summary: error,
          life: 3000,
        });
      });
    },
    update() {
      this.emitter.emit("refereeUpdate", this.value);
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