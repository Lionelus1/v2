<template>
  <div class="fieldgrid">
    <div class="col-12 md:col-10 mb-2">
      <span class="p-float-label p-ibutoon-right">
        <i v-if="value" class="pi pi-id-card ibutton" style="margin-right:35px;height:30px;margin-top: 2px;" @click="showcard()"/>
        <i class="pi pi-ellipsis-h ibutton" style="height:30px;margin-top: 2px;margin-right: 2px;" @click="showside()"/>
        <InputText ref="input"  id="inputtext-right" readonly="true" type="text" v-model="selectedContragentName"/>
        <Sidebar @hide="updateValue(value)" v-model:visible="contragentVisible" position="right" class="p-sidebar-lg m-0 p-0 pt-7" style="overflow-y:scroll">
          <Organizations @selected="updated" @changed="changed" v-model="value" :selectedMode="true" v-model:windowOpened="contragentVisible"></Organizations>
        </Sidebar>
        <Sidebar v-model:visible="cardVisible" position="right"  @hide="message=null" class="p-sidebar-lg" style="overflow-y:scroll">
          <Organization ref="orgSide" @inserted="orgupdated" v-model:message="message" v-if="value.type == ContragentType.Organization" :readonly="true" :modelValue="value"></Organization>
          <Person v-if="value.type == ContragentType.Person" :modelValue="value" :readonly="true"></Person>
          <Bank v-if="value.type == ContragentType.Bank" :modelValue="value" :readonly="true"></Bank>
        </Sidebar>
      </span>
    </div>


    <div v-if="value && value.type != ContragentType.Person" class="col-12 md:col-10">
      <span class="p-float-label p-ibutoon-right">
        <i v-if="value && value.signer" class="pi pi-id-card ibutton" style="margin-right:35px;height:30px;margin-top: 2px;" @click="showcard('person')"/>
        <i v-if="value" class="pi pi-ellipsis-h ibutton" style="height:30px;margin-top: 2px;margin-right: 2px;" @click="showside('person')"/>
        <InputText id="inputtext-right" readonly="true" type="text" v-model="selectedPersonName"/>
        <Sidebar v-model:visible="personsVisible" position="right" class="p-sidebar-lg" style="overflow-y:scroll">
        <br/>
          <Persons :shortMode="true" @userCreated="userCreated" @updated="updated($event)" v-model="value.signer" style="padding:-1em"  v-model:orgID="value.id" :organization="value" v-model:signRight="signRight" :insertMode="true" v-model:windowOpened="personsVisible"></Persons>
        </Sidebar>
        <Sidebar v-model:visible="personVisible" position="right" class="p-sidebar-lg" style="overflow-y:scroll;">
          <Person :modelValue="value.signer" :organization="JSON.parse(JSON.stringify(value))" class="mt-10" style="padding:-1rem" :readonly="true"></Person>
        </Sidebar>
      </span>
    </div>
    <label v-if="value && value.type != ContragentType.Person">{{$t('contracts.signer')}}</label>

  </div>
</template>

<script>

import Organizations from './Organizations.vue';
import Persons from './Persons.vue'
import Bank from './Bank.vue'
import Enum from "@/enum/docstates/index"
export default {
  components : { Organizations, Persons, Bank },
  data() {
    return {
      value: this.modelValue,
      contragentVisible : false,
      signRight : 1,
      personsVisible: false,
      cardVisible: false,
      personVisible: false,
      ContragentType : Enum.ContragentType,
      message:null,
    }
  },
  computed: {
    selectedContragentName() {
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
    orgupdated(org) {
      this.value = org.value
    },
    updated(event) {
      if (this.value.iin == null || this.value.address == null || 
      this.value.addressru == null || this.value.email == null ||
      this.value.name == null || this.value.nameru == null || this.value.form == null) {
        this.cardVisible = true
        this.message = this.$t("contragent.missingDetails")
        
      }
      this.$emit("updated",event);
    },
    changed(event) {
      this.value = event.value
      this.contragentVisible = false;
    },
    userCreated(user) {
      this.value.signer = user;
      this.personsVisible = false;
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