<template>
  <div>
    
    <Dropdown @change="updateValue" v-model="value" :options="departments" :optionLabel="($i18n.locale == 'kz'? 'nameKz' : $i18n.locale == 'en' ? 'nameEn': 'name')" :placeholder="$t('smartenu.selectFaculty')" />
  </div>
</template>

<script>
import { getHeader, smartEnuApi } from "@/config/config";
import axios from 'axios';

export default {
   data() {
    return {
      value: this.modelValue,
      departments:  null,
      
    }
  },
  
  props: {
    modelValue: null,
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
    this.getDepartments();
  },
  methods: {
    getDepartments() {
      axios.get(smartEnuApi+"/getdepartments", {headers: getHeader()})
        .then(response=>{
          this.departments = response.data;
         
        })
        .catch((error) => {
          this.$toast.add({
          severity: "error",
          summary: "getDepattments:\n" + error,
          life: 3000,
        });
        if (error.response.status === 404) {
          this.departments = null;
        }
        });
      },
      
      updateModel(event) {
        this.$emit('update:modelValue', this.selectedDepartment);
        
      },
      
  }
}

</script>
