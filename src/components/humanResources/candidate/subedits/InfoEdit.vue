<template>
  <div id="carddiv" class="grid">
    <div class="col-12">
      <h3>{{ $t('hr.title.info') }}</h3>
      <div>
        <Menubar :model="menu" :key="active"
                 style="height:36px;margin-top:-7px;margin-left:-14px;margin-right:-14px"></Menubar>
      </div>
    </div>
    <div class="mb-2">
      <Textarea v-model="value.info"
                class="mt-2"
                :class="{'p-invalid': validation}"
                :readonly="readonly"
                :autoResize="true"
                type="text"
                rows="10" cols="107"/>
      <small
          class="p-error"
          v-if="validation"
      >{{ $t("common.requiredField") }}</small>
    </div>
  </div>
</template>

<script>
import {getHeader, smartEnuApi} from "@/config/config";
import {CandidateService} from "@/service/candidate.service"

export default {
  name: "InfoEdit",
  data() {
    return {
      value: this.modelValue,
      active: null,
      menu: [
        {
          label: this.$t("common.save"),
          icon: "pi pi-fw pi-save",
          command: () => {
            this.action()
          },
        },
      ],
      validation: false,
      candidateService: new CandidateService()
    }
  },
  props: {
    modelValue: null,
    candidateId: null,
    readonly: Boolean,
  },
  methods: {
    validateForm() {
      this.validation = !this.value.info || this.value.info == ""
      return !this.validation
    },
    action() {

      if (this.validateForm()) {
        this.candidateService.infoUpdate(this.value).then(res => {
              this.emitter.emit("info", true);
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
}
</script>

<style scoped>

</style>