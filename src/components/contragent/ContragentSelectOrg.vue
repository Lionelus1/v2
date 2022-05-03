<template>
  <div class="p-field p-grid">
    <div class="p-col-12 p-md-12 p-mb-2">
      <span class="p-float-label p-ibutoon-right">
        <i v-if="value && !readonly" class="pi pi-id-card ibutton" :style="(!editVisible ? 'height:30px;margin-top: 2px;margin-right: 2px;' : 'margin-right:35px;height:30px;margin-top: 2px;')" @click="showcard()"/>
        <i v-if="editVisible && !readonly" class="pi pi-ellipsis-h ibutton" style="height:30px;margin-top: 2px;margin-right: 2px;" @click="showside()"/>
        <InputText id="inputtext-right" :placeholder="$t('common.select')" readonly="true" type="text" v-model="selectedContragentName"/>
        <Sidebar @hide="updateValue(value)" @selected="selected" v-model:visible="contragentVisible" position="right" class="p-sidebar-lg p-m-0 p-p-0 p-pt-7" style="overflow-y:scroll">
          <Organizations id="contragentSelectOrgOrgs" v-model="value" v-model:windowOpened="contragentVisible" :selectedMode="true" @selected="selected"></Organizations>
        </Sidebar>
        
        <Sidebar v-model:visible="cardVisible" position="right" class="p-sidebar-lg" style="overflow-y:scroll">
          <Organization id="contragentSelectOrgOrg" :readonly="true" :modelValue="value"></Organization>
        </Sidebar>
      </span>
    </div>
  </div>
</template>

<script>

import Organizations from './Organizations.vue';
import Enum from "@/enum/docstates/index"
export default {
  components : { Organizations },
  data() {
    return {
      value: this.modelValue,
      contragentVisible : false,
      signRight : 1,
      personsVisible: false,
      cardVisible: false,
      personVisible: false,
      ContragentType : Enum.ContragentType,
      editVisible: !this.disabled
    }
  },
  computed: {
    selectedContragentName() {

      if (!this.value)
        return "";
      //return this.value
      return this.$i18n.locale != 'ru' ? '"' + this.value.name + '" ' + this.value.form.shortname : this.value.form.shortnameru + ' "' + this.value.nameru + '"';
    },
    selectedPersonName() {
      if (!this.value || !this.value.data || !this.value.data.signer)
        return "";

      return this.value.data.signer.lname + ' ' + this.value.data.signer.fname + ' ' + (this.value.data.signer.sname ?? '');
    }
  },
  methods: {
    showside(sidename) {
      if (sidename == 'person')
        this.personsVisible = true;
      else
        this.contragentVisible = true;
    },
    selected(event) {
      this.$emit("selected", event)
    },
    showcard(cardname) {
      if (cardname == 'person')
        this.personVisible = true;
      else
        this.cardVisible = true;
    },
    setValue(val) {
      this.value = val
      this.$emit("update:modelValue", val);
    }
  },
  props: {
    modelValue: null,
    disabled: {
      typeof: Boolean,
      default: false
    },
    readonly: {
      typeof: Boolean,
      default: false
    },
  },
  setup(props, context) {
			function updateValue(value) {
        if (value) {
				  context.emit("update:modelValue", value);
        }
			}
			return {
				updateValue,
			};
	  },

}
</script>

<style>
  .ibutton {
    background-color: #ffffff;

  }
  .sidep {
    padding: 0em;
  }
  .ibutton:hover {
    background-color: #edf0f5;
  }

  .p-ibutoon-left,
  .p-ibutoon-right {
	position: relative;

	display: inline-block
  }

  .p-ibutoon-left>i,
  .p-ibutoon-right>i {
	position: absolute;
  font-size: large;
  height: 100%;
  font-size: large;
  padding-top: 8px;
  padding-right: 0.5rem;
  padding-left: 0.5rem;
  border-bottom-right-radius: 3px;
  border-bottom-left-radius: 3px;
  top:0;
  right:0;
  margin-top: 0;

  }
  .p-ibutoon-left,
  .p-ibutoon-right {
	display: block;
	width: 100%
  }
</style>