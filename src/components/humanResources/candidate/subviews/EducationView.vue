<template>
  <div class="card def-border">
    <p><b>{{ $t('hr.edu.institution') }}:</b> <em>{{ value.institution }}</em></p>
    <p><b>{{ $t('hr.edu.institutionAddress') }}:</b> <em>{{ value.institutionAddress }}</em></p>
    <p><b>{{$t('common.faculty')}}:</b> <em>{{ value.faculty }}</em></p>
    <p><b>{{ $t('common.speciality') }}:</b> <em>{{ value.speciality }}</em></p>
    <p><b>{{ $t('hr.ad.diplomaNumber') }}:</b> <em>{{ value.diplomaNumber }}</em></p>
    <p><b>{{ $t('hr.edu.receiptDate') }}:</b> <em>{{ new Date(value.receiptDate).getFullYear() }}</em></p>
    <p><b>{{ $t('hr.edu.expirationDate') }}:</b> <em>{{ new Date(value.expirationDate).getFullYear() }}</em></p>
    <hr>
    <Button :label="$t('common.edit')" class="p-button-text" :onclick="update"/>
    <Button :label="$t('common.delete')" class="p-button-secondary p-button-text" :onclick="deleteValue"/>
  </div>
</template>

<script>
import axios from "axios";
import {getHeader, smartEnuApi} from "@/config/config";

export default {
  name: "EducationView",
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
          .post(smartEnuApi + "/candidate/education/delete", {id: this.value.id}, {headers: getHeader(),})
          .then(res => {
            this.emitter.emit("education", true);
          }).catch(error => {
        this.$toast.add({
          severity: "error",
          summary: error,
          life: 3000,
        });
      });
    },
    update() {
      this.emitter.emit("educationUpdate", this.value);
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