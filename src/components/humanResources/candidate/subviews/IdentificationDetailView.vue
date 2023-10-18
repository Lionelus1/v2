<template>
  <div class="card def-border">
    <p><b>{{ $t('common.number') }}:</b> <em>{{ value.number }}</em></p>
    <p><b>{{ $t('hr.id.startDate') }}:</b> <em>{{ new Date(value.startDate).toLocaleDateString() }}</em></p>
    <p><b>{{ $t('hr.id.issuedBy') }}:</b> <em>{{ value.issuedBy }}</em></p>
    <p><b>{{ $t('contact.iin') }}:</b> <em>{{ value.iin }}</em></p>
    <Button :label="$t('common.edit')" class="p-button-text" :onclick="update"/>
    <Button :label="$t('common.delete')" class="p-button-secondary p-button-text" :onclick="deleteValue"/>
  </div>
</template>

<script>
import {getHeader, smartEnuApi} from "@/config/config";
import {CandidateService} from "@/service/candidate.service"
export default {
  name: "IdentificationDetailView",
  props: {
    modelValue: null,

  },
  data() {
    return {
      value: this.modelValue,
      candidateService: new CandidateService()
    }
  },
  methods: {
    deleteValue() {
      const req = {
        id: this.value.id
      }
      this.candidateService.idDelete(req).then(res => {
            this.emitter.emit("id", true);
          }).catch(error => {
        this.$toast.add({
          severity: "error",
          summary: error,
          life: 3000,
        });
      });
    },
    update() {
      this.emitter.emit("idUpdate", this.value);
    }
  }
}
</script>

<style scoped>
.def-border {
  border: 1px solid #dee2e6;

  border-radius: 0;
}
</style>