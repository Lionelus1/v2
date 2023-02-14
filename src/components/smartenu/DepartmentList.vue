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
      <template v-if="orgId !== null" #empty>
        <div class="p-field grid">
          <label for="firstname" class="col-fixed p-mt-2">{{$primevue.config.locale.emptyFilterMessage}}</label>
          <div class="p-col">
            <Button v-if="editMode" :label="$t('common.createNew')" class="p-button-link" @click="openDepartment()"/>
          </div>
        </div>
      </template>
      <template #emptyfilter>
        <div class="p-field grid">
          <label for="firstname" class="col-fixed p-mt-2">{{$primevue.config.locale.emptyFilterMessage}}</label>
          <div class="p-col">
            <Button v-if="editMode" :label="$t('common.createNew')" class="p-button-link"  @click="openDepartment()"/>
          </div>
        </div>
      </template>
    </Dropdown>
    <Sidebar v-model:visible="sidebar" position="right" class="p-sidebar-lg" style="overflow-y:scroll">
      <Department :readonly="false" :orgId="this.orgId" :orgType="orgType" :modelValue="this.value"></Department>
    </Sidebar>
  </div>
</template>

<script>
import { getHeader, smartEnuApi } from "@/config/config";
import axios from 'axios';
import Department from "./Department";

export default {
  components: {Department},
  data() {
    return {
      value: this.modelValue,
      departments:  null,
      orgId: null,
      sidebar: false,
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
  mounted() {
    this.emitter.on('department', (data) => {
      if (data === true) {
        this.getDepartments(this.orgId)
        this.sidebar = false
      }
    })
  },
  created() {
    if (this.autoLoad)
      this.getDepartments();
    this.value = this.modelValue  
  },
  methods: {
    openDepartment() {
      this.sidebar = true
    },
    sayChange(event) {
      this.$emit("changed",event)
      this.updateValue(event);
    },
    getDepartments(parentID) {
      this.departments = null;
      this.value = null;
      this.parentID != undefined ? this.orgId = this.parentID : (parentID != undefined ? this.orgId = parentID : this.orgId = null)
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
