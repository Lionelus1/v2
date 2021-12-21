<template>
  <div>
    <Dropdown @change="updateValue" v-model="value" :options="roles" :optionLabel="($i18n.locale == 'kz'? 'kz' : $i18n.locale == 'en' ? 'en': 'ru')" :placeholder="$t('common.select')" />
  </div>
</template>

<script>
import { getHeader, smartEnuApi } from "@/config/config";
import axios from 'axios';

export default {
   data() {
    return {
      value: this.modelValue,
      roles:  null,
      
    }
  },
  
  props: {
    modelValue: null,
    roleGroupName: null,
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
    this.getRoles();
  },
  methods: {
    getRoles() {
      //this.lazyParams.countMode = null;
      axios
        .post(smartEnuApi + "/getrolesbyname", {name: this.roleGroupName},  {
          headers: getHeader(),
        })
        .then((response) => {
          
          this.roles = response.data;
        })
        .catch((error) => {
          if (error.response.status == 401) {
            this.$store.dispatch("logLout");
          }
        });
      },
      
      updateModel(event) {
        this.$emit('update:modelValue', this.value);
        
      },
      
  }
}

</script>
