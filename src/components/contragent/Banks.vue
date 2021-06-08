<template>
<div>
  <div class="content-section introduction">
	<div class="feature-intro p-ml-3" >
    <h4 style="display:inline">{{$t('bank.title')}}</h4>
		<label style="color:grey">&nbsp;{{this.$t('common.records')}}: {{this.count}}</label>
	</div>
	</div>
	<div class="content-section implementation">
	<div class="card p-p-0">
	 	<div class="p-col">
			<Menubar :model="menu" :key="active" style="height:36px;margin-top:-7px; margin-right: -7px;margin-left: -7px;">
				<template #end>
					<span class="p-input-icon-left">
            <i class="pi pi-search" />
            <InputText style="height:30px" v-model="filters['global']" :placeholder="$t('common.search')" />
          </span>
				</template>
			</Menubar>
      <div class="box">
				<DataTable class="p-datatable-sm" v-model:selection="selectedBanks" selectionMode="single" dataKey="id" :value="banks" :paginator="true" :rowHover="true" :rows="bankShowCount" :filters="filters"
				:loading="loading">
					<template #empty>
						Бірде бір банк табылмады
					</template>
					<template #loading>
						Банк тізімі жүктелуде. Сәл күте тұрыңыз ...
					</template>
					<Column selectionMode="multiple" headerStyle="width: 3em"></Column>
					<Column field="organization.name" :header="$t('common.name')" :sortable="true">
						<template #body="slotProps">
            	<Button class="p-button-link" @click="toggle($event,slotProps.data)">{{(this.$i18n.locale != 'ru' ? '"' + slotProps.data.organization.name + '" ' + slotProps.data.organization.form.shortname : slotProps.data.organization.form.shortnamerus + ' "' + slotProps.data.organization.namerus + '"')}}</Button>
        		</template>
					</Column>
					<Column field="swift" :header="$t('bank.swift')" :sortable="true"></Column>
					<Column field="organization.locality.name" :header="$t('contact.locality')" :sortable="true"></Column>
					<Column field="organization.phone" :header="$t('contact.phone')" :sortable="true"></Column>
				</DataTable>
				<Sidebar v-model:visible="sideVisible" position="right" class="p-sidebar-lg" style="overflow-y:scroll">
					<Bank :modelValue="currentBank" :readonly="true"></Bank>
				</Sidebar>


			</div>
		</div>
	</div>
	</div>
</div>
</template>
<script>
	import {apiDomain} from "@/config/config";
  import axios from 'axios';
	import Bank from './Bank.vue';

	export default {
  components: { Bank },
    data() {
        return {
						active: null,
						banks: null,
						count:0,
						selectedBanks: null,
						currentBank: {},
						bankShowCount : 15,
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
		methods: {
			initApiCall(){
        let url = "/contragent/banks";
				var req = {"id" : 0, "count": this.bankShowCount};
        axios.post(apiDomain+url, req)
        .then(res=>{

          this.banks =  res.data
        })
        .catch(error => {
            console.error(error)
        })
      },
			toggle(event, data) {
						this.currentBank = data;
						this.selectedBanks = data;
						this.sideVisible = true;
      },
    },
		mounted() {
      this.initApiCall();
			this.loading = false
    },
	}
</script>