<template>
  <div>
    <Dropdown
        @change="sayChange($event)" v-model="value" :options="specialities" :optionLabel="($i18n.locale == 'kz'? 'nameKz' : $i18n.locale == 'en' ? 'nameEn': 'name')" :filter="true" :placeholder="(placeHolder != undefined ? placeHolder: $t('common.select'))">
      <template #value="slotProps">
        <span v-if="slotProps.value">
          {{$i18n.locale == 'kz'? slotProps.value.nameKz : $i18n.locale == 'en' ? slotProps.value.nameEn: slotProps.value.name}}
        </span>
        <span v-else>
          {{slotProps.placeholder}}
        </span>
      </template>
      <template #emptyfilter>
        <div class="fieldgrid">
          <label class="col-fixed mt-2">{{$primevue.config.locale.emptyFilterMessage}}</label>
          <div class="p-col">
            <Button v-if="editMode" :label="$t('common.createNew')" class="p-button-link" />
          </div>
        </div>
      </template>
    </Dropdown>
  </div>
</template>

<script>
import { getHeader, smartEnuApi } from "@/config/config";
import axios from "axios";
export default {
  name: "DicSpeciality",
  data() {
    return {
      value: this.modelValue,
      specialities:  null,
    }
  },
  props: {
    modelValue: null,
    editMode: Boolean,
    placeHolder: Text,
    autoLoad: Boolean,
  },
  emits: ['changed'],
  setup(props, context) {
    function updateValue(e) {
      if (e.value) {
        context.emit("update:modelValue", e.value);
      }
    }
    return {
      updateValue,
    };
  },
  created() {
    if (this.autoLoad)
      this.getSpecialities();
  },
  methods: {
    sayChange(event) {
      this.$emit("changed",event)
      this.updateValue(event);
    },
    getSpecialities() {
      this.specialities = null
      this.value = null
      axios.get(smartEnuApi + '/specialities')
          .then(response=>{
            this.specialities = response.data;
            console.log(response.data)
          })
          .catch((error) => {
            if (error.response.status == 401) {
              this.$store.dispatch("logLout");
            }
            this.$toast.add({
              severity: "error",
              summary: "getInstitutions:\n" + error,
              life: 3000,
            });

            if (error.response.status === 404) {
              this.specialities = null;
            }
          })
    },
    updateModel(event) {
      this.$emit('update:modelValue', this.value);
    },
  }
}
</script>

<style scoped>

</style>