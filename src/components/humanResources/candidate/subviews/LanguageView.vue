<template>
  <div class="card def-border">
    <p><b>{{ $t('common.lang') }}:</b> <em>{{ value.language['name' + ($i18n.locale).charAt(0).toUpperCase() + ($i18n.locale).slice(1)] }}</em></p>
    <p><b>{{ $t('hr.lang.pl') }}:</b> <em>{{ value.isNative ? $t('hr.lang.native') : $t('hr.lang.notNative')}}</em></p>
    <p><b>{{ $t('hr.lang.rl') }}:</b> <em>{{ value.readingLevel.value }}</em></p>
    <p><b>{{ $t('hr.lang.sl') }}:</b> <em>{{ value.speakingLevel.value }}</em></p>
    <p><b>{{ $t('hr.lang.wl') }}:</b> <em>{{ value.writingLevel.value }}</em></p>
    <p><b>{{ $t('hr.lang.c') }}:</b> <em>{{ value.certificate }}</em></p>
    <Button :label="$t('common.edit')" class="p-button-text" :onclick="update"/>
    <Button :label="$t('common.delete')" class="p-button-secondary p-button-text" :onclick="deleteValue"/>
  </div>
</template>

<script>
import axios from "axios";
import {getHeader, smartEnuApi} from "@/config/config";

export default {
  name: "LanguageView",
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
          .post(smartEnuApi + "/candidate/language/delete", {id: this.value.id}, {headers: getHeader(),})
          .then(res => {
            this.emitter.emit("language", true);
          }).catch(error => {
        this.$toast.add({
          severity: "error",
          summary: error,
          life: 3000,
        });
      });
    },
    update() {
      this.emitter.emit("languageUpdate", this.value);
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