<template>
<div :style="(orgID ? 'margin:-1em; margin-top:0': '')">
  <div class="content-section introduction" :style="(orgID ? 'margin-top:-1.5em; margin-bottom:1.5em': '')">
		<div class="feature-intro p-ml-3" >
			<h4 style="display:inline">{{(personType === PersonType.IndividualEntrepreneur ? $t('common.person') : $t('common.personal'))}}</h4>
			<label style="color:grey">&nbsp;{{this.$t('common.records')}}: {{this.count}}</label>
		</div>
	</div>
	<div class="content-section implementation">
	<div class="card p-p-0">
	 	<div class="p-col">
			<Menubar :model="menu" :key="active" style="height:36px;margin-top:-7px; margin-right: -7px;margin-left: -7px;" >
				<template #end>
					<span class="p-input-icon-left">
            <i class="pi pi-search" />
            <InputText style="height:30px" v-model="filters['global']" placeholder="іздеу" />
          </span>
				</template>
			</Menubar>
      <div class="box">
				<DataTable class="p-datatable-sm" v-model:selection="selectedPersons" selectionMode="single" :dataKey="(personType == PersonType.IndividualEntrepreneur ? 'id' : 'role.urID')" :value="persons" :paginator="true" :rowHover="true" :rows="orgShowCount" :filters="filters"
				:loading="loading">
					<template #empty>
						{{this.$t('common.recordsNotFound')}}
					</template>
					<template #loading>
						{{this.$t('common.recordsLoading')}}
					</template>
					<Column selectionMode="multiple" headerStyle="width: 3em"></Column>
					<Column field="name" :header="$t('common.name')" :sortable="true">
						<template #body="slotProps">
            	<Button class="p-button-link p-text-left" @click="toggle($event,slotProps.data)">{{slotProps.data.lname + ' ' + slotProps.data.fname + ' ' + (slotProps.data.sname ?? '')}}</Button>
        		</template>
					</Column>

					<Column :header="$t('common.organization')" :headerClass="staffDisplay" :bodyClass="staffDisplay">
							<template v-if="personType != PersonType.IndividualEntrepreneur" #body="slotProps">
								{{(this.$i18n.locale != 'ru' ? '"' + slotProps.data.organization.name + '" ' + slotProps.data.organization.form.shortname : slotProps.data.organization.form.shortnamerus + ' "' + slotProps.data.organization.namerus + '"')}}
							</template>
					</Column>
					<Column :header="$t('contact.position')" :headerClass="staffDisplay" :bodyClass="staffDisplay">
							<template v-if="personType != PersonType.IndividualEntrepreneur" #body="slotProps">
								{{ slotProps.data.role[this.$i18n.locale]}}
							</template>
					</Column>

					<Column field="iin" :header="$t('contact.iin')" :sortable="true"></Column>
					<Column field="email" :header="$t('contact.email')" :sortable="true"></Column>
					<Column field="phone" :header="$t('contact.phone')" :sortable="true"></Column>
				</DataTable>
				<Sidebar v-model:visible="sideVisible" position="right" class="p-sidebar-lg" style="overflow-y:scroll">
					<Person :modelValue="currentPerson" :readonly="true"></Person>
				</Sidebar>
				{{ orgType }}


			</div>
		</div>
	</div>
	</div>
</div>
</template>
<script>
	import {templateApi} from "@/config/config";
  import axios from 'axios';
	import Person from './Person.vue';
	import Enum from "@/enum/docstates/index"


	export default {
  components: { Person },
    data() {
        return {
						active: null,
						persons: null,
						personType: Number(this.$route.params.type),
						PersonType: Enum.PersonType,
						staffDisplay: this.personType === Enum.PersonType.IndividualEntrepreneur ? 'dnone' :'',
						count:0,
						selectedPersons: null,
						currentPerson: {},
						orgShowCount : 15,
						loading: true,
						sideVisible : false,
						filters: {},
            menu: [
                {
                  label:'',
                  icon:'pi pi-fw pi-refresh',
									command: () => {
                  	this.$toast.add({severity:'success', summary:'Updated', detail:'Data Updated', life: 3000});
                  }
                },
                {
                   label: this.$t('bank.card'),
                   icon:'pi pi-fw pi-id-card',
                },
                {
                   label:this.$t('common.contacts'),
                   icon:'pi pi-fw pi-user',
                },
             ]
        }
    },
		props: {
    	modelValue: null,
			orgID : Number,
			signRight: Number,
			windowOpened: Boolean,
		},
		setup(props, context) {
			function updateValue(currentPerson) {
				context.emit("update:modelValue", currentPerson);
				context.emit("update:windowOpened", false);
			}
			return {
				updateValue,
			};
	  },
		watch: {
    	'$route.params.type': function (id) {
				this.personType = Number(this.$route.params.type);
				this.initApiCall();
    	}
		},
		methods: {
			initApiCall(){
        let url = "/contragent/persons";
				this.personType = Number(this.$route.params.type)
				this.staffDisplay = this.personType === Enum.PersonType.IndividualEntrepreneur ? "dnone" :"";
				var req = {"id" : 0, "count": this.orgShowCount, "persontype" : this.personType, "orgID" : this.orgID ? this.orgID : -1, "signRight" : this.signRight ? this.signRight: -1 };
				this.persons = null,
        axios.post(templateApi+url, req)
        .then(res=>{
          this.persons =  res.data
        })
        .catch(error => {
            console.error(error)
        })
      },
			toggle(event, data) {

						this.currentPerson = data;
						this.selectedPersons = data;
						if (this.orgID)
							this.updateValue(data);
						else
							this.sideVisible = true;
      },
    },

		mounted() {
      this.initApiCall();
			this.loading = false
    },
	}
</script>
<style>
	.dnone {
		display: none;
	}
</style>