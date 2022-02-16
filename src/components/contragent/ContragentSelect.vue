<template>
  <div class="p-field p-grid">
    <div class="p-col-12 p-md-10 p-mb-2">
      <span class="p-float-label p-ibutoon-right">
        <i v-if="value" class="pi pi-id-card ibutton" style="margin-right:35px;height:30px;margin-top: 2px;" @click="showcard()"/>
        <i class="pi pi-ellipsis-h ibutton" style="height:30px;margin-top: 2px;margin-right: 2px;" @click="showside()"/>
        <InputText id="inputtext-right" readonly="true" type="text" v-model="selectedContragentName"/>
        <Sidebar @hide="updateValue(value)" v-model:visible="contragentVisible" position="right" class="p-sidebar-lg p-m-0 p-p-0 p-pt-7" style="overflow-y:scroll">
          <Contragents v-model="value" v-model:windowOpened="contragentVisible"></Contragents>
        </Sidebar>
        <Sidebar v-model:visible="cardVisible" position="right" class="p-sidebar-lg" style="overflow-y:scroll">
          <Organization v-if="value.type == ContragentType.Organization" :readonly="true" :modelValue="value"></Organization>
          <Person v-if="value.type == ContragentType.Person" :modelValue="value" :readonly="true"></Person>
          <Bank v-if="value.type == ContragentType.Bank" :modelValue="value" :readonly="true"></Bank>
        </Sidebar>
      </span>
    </div>


    <label v-if="value && value.type != ContragentType.Person" class="p-col-12 p-md-2">{{$t('contracts.signer')}}</label>
    <div v-if="value && value.type != ContragentType.Person" class="p-col-12 p-md-10">
      <span class="p-float-label p-ibutoon-right">
        <i v-if="value && value.signer" class="pi pi-id-card ibutton" style="margin-right:35px;height:30px;margin-top: 2px;" @click="showcard('person')"/>
        <i v-if="value" class="pi pi-ellipsis-h ibutton" style="height:30px;margin-top: 2px;margin-right: 2px;" @click="showside('person')"/>
        <InputText id="inputtext-right" readonly="true" type="text" v-model="selectedPersonName"/>
        <Sidebar v-model:visible="personsVisible" position="right" class="p-sidebar-lg" style="overflow-y:scroll">
        <br/>
          <Persons v-model="value.signer" style="padding:-1em" v-model:orgID="value.id" v-model:signRight="signRight" v-model:windowOpened="personsVisible"></Persons>
        </Sidebar>
        <Sidebar v-model:visible="personVisible" position="right" class="p-sidebar-lg" style="overflow-y:scroll;">
          <Person :modelValue="value.signer" class="p-mt-10" style="padding:-1rem" :readonly="true"></Person>
        </Sidebar>
      </span>
    </div>
  </div>
</template>

<script>

import Contragents from './Contragents.vue';
import Organization from './Organization.vue';
import Person from './Person.vue'
import Persons from './Persons.vue'
import Bank from './Bank.vue'
import Enum from "@/enum/docstates/index"
export default {
  components : { Contragents, Organization, Person, Persons, Bank },
  data() {
    return {
      value: this.modelValue,
      contragentVisible : false,
      signRight : 1,
      personsVisible: false,
      cardVisible: false,
      personVisible: false,
      ContragentType : Enum.ContragentType,
    }
  },
  computed: {
    selectedContragentName() {
      console.log(this.value)
      if (!this.value)
        return "";
      switch(this.value.type) {
        case Enum.ContragentType.Organization:
          return this.$i18n.locale != 'ru' ? '"' + this.value.name + '" ' + this.value.form.shortname : this.value.form.shortnameru + ' "' + this.value.nameru + '"';
        case Enum.ContragentType.Person:
          return this.value.lname + ' ' + this.value.fname + ' ' + (this.value.sname ?? '');
        case Enum.ContragentType.Bank:
          return this.$i18n.locale != 'ru' ? '"' + this.value.organization.name + '" ' + this.value.organization.form.shortname : this.value.organization.form.shortnameru + ' "' + this.value.organization.nameru + '"'
      }
      return  ""
    },
    selectedPersonName() {
      if (!this.value || !this.value.signer)
        return "";
      let name = ""
      if (this.value.signer.thirdName)
        name = this.value.signer.thirdName
      if (this.value.signer.firstName)
        name +=' ' + this.value.signer.firstName
     if (this.value.signer.lastName)
        name +=' ' + this.value.signer.lastName     
      return name
    }
  },
  methods: {
    showside(sidename) {
      if (sidename == 'person')
        this.personsVisible = true;
      else
        this.contragentVisible = true;
    },
    showcard(cardname) {
      if (cardname == 'person')
        this.personVisible = true;
      else
        this.cardVisible = true;
    },
  },
  props: {
    modelValue: null,
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