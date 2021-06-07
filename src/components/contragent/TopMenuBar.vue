<template>
  <div>
    <Menubar :model="menu" :key="active" style="height:36px;margin-top:-7px;margin-left:-14px;margin-right:-14px"></Menubar>
  </div>
</template>
<script>
export default {
	 data() {
		return {
            active: null,
			menu: [
        {
          label:this.$t('common.save'),
          icon:'pi pi-fw pi-save',
          disabled: this.readonly,
					command: () => {
          	this.$toast.add({severity:'success', summary:'Updated', detail:'Data Updated', life: 3000});
          }
        },
        {
           label: this.$t('contact.mailto'),
           icon:'pi pi-fw pi-envelope',
					 command: () => {
						 window.location.href = "mailto:" + this.organization.email;
					 }
        },
        {
           label: this.$t('contragent.dossier'),
           icon:'pi pi-fw pi-copy',
        },
        {
           label:this.$t('common.contacts'),
           icon:'pi pi-fw pi-user',
        },
      ]
    }
   },
    props: {
      organization: null,
      readonly: Boolean,
  },
}

</script>