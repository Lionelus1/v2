<template>
  <div>
    <Dropdown :class="{'p-invalid': validation}"
     @change="sayChange($event)" v-model="value" :options="departments" :optionLabel="($i18n.locale == 'kz'? 'nameKz' : $i18n.locale == 'en' ? 'nameEn': 'name')" :filter="true" :placeholder="(placeHolder != undefined ? placeHolder: $t('common.select'))">
      <template #value="slotProps">
        <span v-if="slotProps.value">
          {{$i18n.locale == 'kz'? slotProps.value.nameKz : $i18n.locale == 'en' ? slotProps.value.nameEn: slotProps.value.name}}
        </span>
        <span v-else>
          {{slotProps.placeholder}}
        </span>
      </template>
      <template #emptyfilter>
        <div class="p-field p-grid">
          <label for="firstname" class="p-col-fixed p-mt-2">{{$primevue.config.locale.emptyFilterMessage}}</label>
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
    orgType: Number,
    parentID: Number,
    editMode: Boolean,
    placeHolder: Text,
    autoLoad: Boolean,
    validation: Boolean,
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
      this.getDepartments();
  },
  methods: {
    sayChange(event) {
      this.$emit("changed",event)
      this.updateValue(event);
    },
    getDepartments(parentID) {
      this.departments = null;
      this.value = null;
      axios.post(smartEnuApi+"/getdepartments", {
        orgType: this.orgType,
        parentID: this.parentID != undefined ? this.parentID : (parentID != undefined ? parentID: undefined)
        
        } ,{headers: getHeader()})
        .then(response=>{
          this.departments = response.data;
         
        })
        .catch((error) => {
           if (error.response.status == 401) {
            this.$store.dispatch("logLout");
          }
          this.$toast.add({
          severity: "error",
          summary: "getDepartments:\n" + error,
          life: 3000,
        });
       
        if (error.response.status === 404) {
          this.departments = null;
        }
        });
      },
      
      updateModel(event) {
        this.$emit('update:modelValue', this.value);
        
      },
      
  }
}

</script>
