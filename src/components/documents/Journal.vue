<template>
  <div>
    <div class="content-section introduction">
			<div class="feature-intro p-ml-3">
				<h4>{{$t("contracts.journal")}}</h4>
			</div>
			<div class="content-section implementation">
        <div class="card">
					<Menubar :model="menu" :key="active" style="height:36px;margin-top:7px;margin-right:-7px;margin-left:-7px;" />
				</div>
			</div>
		</div>
  </div>
</template>
<script>
export default {
	data() {
		return {
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
	}
}
</script>