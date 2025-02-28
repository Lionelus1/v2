<template>
  <div>
    <Dropdown
      @change="updateValue"
      v-model="value"
      :disabled="readonly"
      :options="positions"
      :filter="true"
      :showClear="true"
      :optionLabel="'name' + $i18n.locale"
      :placeholder="$t('common.select')"
    >
      <template #value="slotProps">
        <div class="country-item country-item-value" v-if="slotProps.value">
          <div>{{ slotProps.value["name" + $i18n.locale] != null ? slotProps.value["name" + $i18n.locale] : $t('common.select') }}</div>
        </div>
        <span v-else>
          {{ $t('common.select') }}
        </span>
      </template>
      <template #option="slotProps">
        <div class="country-item">
          <div>{{ slotProps.option["name" + $i18n.locale] }}</div>
        </div>
      </template>
    </Dropdown>
  </div>
</template>
<script>
import { getHeader, smartEnuApi } from "@/config/config";
import api from "@/service/api";
export default {
  data() {
    return {
      positions: [],
      value: null,
    };
  },
  props: {
    modelValue: null,
    readonly: null,
  },
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
    this.getPositions();
    this.value = this.modelValue;
  },
  methods: {
    getPositions() {
      api
        .get("/getpositions", { headers: getHeader() })
        .then((response) => {
          this.positions = response.data;
        })
        .catch((error) => {
          if (error.response.status == 401) {
            this.$store.dispatch("logLout");
          }
          this.$toast.add({
            severity: "error",
            summary: "getDepattments:\n" + error,
            life: 3000,
          });

          if (error.response.status === 404) {
            this.positions = null;
          }
        });
    },

    updateModel(event) {
      this.$emit("update:modelValue", this.selectedPositiob);
    },
  },
};
</script>
