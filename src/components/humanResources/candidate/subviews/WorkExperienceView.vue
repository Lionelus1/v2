<template>
  <div class="card def-border">
    <p><b>{{ $t('common.startDate') }}:</b> <em>{{ new Date(value.startDate).toLocaleDateString() }}</em></p>
    <p><b>{{ $t('common.endDate') }}:</b> <em>{{!value.isStillWorking ? new Date(value.endDate).toLocaleDateString() : $t('hr.we.untilNow') }}</em></p>
    <p><b>{{ $t('common.organizationName') }}:</b> <em>{{ value.organizationName }}</em></p>
    <p><b>{{ $t('contact.position') }}:</b> <em>{{ value.position }}</em></p>
    <p style="text-align: justify"><b>{{ $t('hr.we.responsibilities') }}:</b> <em>{{ value.responsibilities }}</em></p>
    <hr>
    <Button :label="$t('common.edit')" class="p-button-text" :onclick="update"/>
    <Button :label="$t('common.delete')" class="p-button-secondary p-button-text" :onclick="deleteValue"/>
  </div>
</template>

<script>
  import axios from "axios";
  import {getHeader, smartEnuApi} from "@/config/config";
  import {ScienceService} from "@/service/science.service";
  export default {
    name: "WorkExperienceView",
    props: {
      modelValue: null,
      typeCustom: null
    },
    data() {
      return {
        value: this.modelValue,
        customType: this.typeCustom,
        scienceService: new ScienceService
      }
    },
    methods: {
      deleteValue() {
        if (this.customType == "scientists") {
          this.deleteScientists()
        } else {
          this.deleteCandidate()
        }
      },
      update() {
        if (this.customType == "scientists") {
          this.emitter.emit("experienceUpdateScientists", this.value);
        } else {
          this.emitter.emit("experienceUpdate", this.value);
        }
      },
      deleteCandidate() {
        axios.post(smartEnuApi + "/candidate/experience/delete", {id: this.value.id}, {headers: getHeader(),}).then(res => {
              this.emitter.emit("experience", true);
            }).catch(error => {
          this.$toast.add({
            severity: "error",
            summary: error,
            life: 3000,
          });
        });
      },
      deleteScientists() {
        this.scienceService.deleteLaborActivity({id: this.value.id}).then(res => {
              this.emitter.emit("experienceScientists", true);
            }).catch(error => {
          this.$toast.add({
            severity: "error",
            summary: error,
            life: 3000,
          });
        });
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