<template>
	<div  id="carddiv" class="grid">
		<div class="col-12">
		<h3>{{(this.$i18n.locale != 'ru' ? '"' + value.organization.name + '" ' + value.organization.form.shortname : value.organization.form.shortnameru + ' "' + value.organization.nameru + '"')}}</h3>
		<TopMenuBar :organization="value.organization" :readonly="readonly"></TopMenuBar>
		</div>
		<div class="col-12 md:col-12 p-fluid">
			<div class="card">
				<div class="grid p-formgrid">
					<div class="col-12 p-mb-2 p-pb-2 lg:col-6 p-mb-lg-0">
						<label >{{this.$t('common.nameInQazaq')}}</label>
            <InputText :readonly="readonly" class="p-mt-2" type="text" :placeholder="$t('common.nameInQazaq')" v-model="value.organization.name" ></InputText>
          </div>
					<div class="col-12 p-mb-2 p-pb-2 lg:col-6 p-mb-lg-0">
						<label>{{this.$t('common.nameInRussian')}}</label>
            <InputText :readonly="readonly"  class="p-mt-2"  type="text" :placeholder="$t('common.nameInRussian')" v-model="value.organization.nameru" ></InputText>
          </div>
					<div class="col-12 p-mb-2  p-pb-2 lg:col-6 p-mb-lg-0">
						<label>{{this.$t('bank.account')}}</label>
            <InputText :readonly="readonly"  class="p-mt-2" type="text" :placeholder="$t('bank.account')" v-model="value.organization.bankaccount" ></InputText>
          </div>
					<div class="col-12 p-mb-2 p-pb-2 lg:col-6 p-mb-lg-0">
						<label>{{this.$t('bank.swift')}} ({{this.$t('bank.account')}})</label>
            <InputText :readonly="readonly"  class="p-mt-2" type="text" :placeholder="$t('bank.swift')" v-model="value.corrswift" ></InputText>
          </div>
					<div class="col-12 p-mb-2 p-pb-2 lg:col-6 p-mb-lg-0">
					<label>{{this.$t('contragent.form')}}</label>
					<Inplace :closable="true" class="p-pt-2" >
						<template #display>
								<InputText :readonly="readonly" style="margin-left:-7px"  v-model="value.organization.form.name" autoFocus />
						</template>
						<template #content>
								<InputText :readonly="readonly" v-model="value.organization.form.name" autoFocus />
						</template>
					</Inplace>
          </div>
					<div class="col-12 p-mb-2 p-pb-2 lg:col-6 p-mb-lg-0">
						<label>{{this.$t('bank.swift')}}</label>
            <InputText :readonly="readonly"  class="p-mt-2" type="text" :placeholder="$t('bank.swift')" v-model="value.swift" ></InputText>
          </div>
					<div class="col-12 p-mb-2 p-pb-2 lg:col-6 p-mb-lg-0">
						<label>{{this.$t('common.state')}}</label>
						<SelectButton :disabled="readonly"  class="p-mt-2" v-model="value.organization.state" :options="states" optionValue="id" optionLabel="name" />
          </div>
					<div class="col-12 p-mb-2 p-pb-2 lg:col-6 p-mb-lg-0">
						<label>&nbsp;</label>
						<SelectButton :disabled="readonly" class="p-mt-2" v-model="value.organization.resident" :options="resident" optionValue="id" optionLabel="name" />
          </div>
				</div>
			</div>
			<div class="card">
				<div class="p-text-uppercase p-mb-2">{{this.$t('contact.title')}}</div>
				<div class="grid p-formgrid">
					<div class="col-12 p-mb-2 p-pb-2 lg:col-6 p-mb-lg-0">
						<label>{{this.$t('contact.bin')}}</label>
            <InputText :readonly="readonly" class="p-mt-2" type="text" :placeholder="$t('contact.bin')" v-model="value.organization.iin" ></InputText>
          </div>
					<div class="col-12 p-mb-2 p-pb-2 lg:col-6 p-mb-lg-0">
						<label>{{this.$t('contact.locality')}}</label>
            <InputText :readonly="readonly" class="p-mt-2" type="text" :placeholder="$t('contact.locality')" v-model="value.organization.locality.name" ></InputText>
          </div>
					<div class="col-12 p-mb-2 p-pb-2 lg:col-6 p-mb-lg-0">
						<label>{{this.$t('contact.address')}} ({{this.$t('common.language.kz')}})</label>
            <InputText :readonly="readonly" class="p-mt-2" type="text" :placeholder="$t('contact.address')" v-model="value.organization.address" ></InputText>
          </div>
					<div class="col-12 p-mb-2 p-pb-2 lg:col-6 p-mb-lg-0">
						<label>{{this.$t('contact.address')}} ({{this.$t('common.language.ru')}})</label>
            <InputText :readonly="readonly" class="p-mt-2" type="text" :placeholder="$t('contact.address')" v-model="value.organization.addressrus" ></InputText>
          </div>
					<div class="col-12 p-mb-2 p-pb-2 lg:col-6 p-mb-lg-0">
						<label>{{this.$t('contact.phone')}}</label>
            <InputText :readonly="readonly" class="p-mt-2" type="text" :placeholder="$t('contact.phone')" v-model="value.organization.phone" ></InputText>
          </div>
					<div class="col-12 p-mb-2  p-pb-2 lg:col-6 p-mb-lg-0">
						<label>{{this.$t('contact.email')}}</label>
            <InputText :readonly="readonly" class="p-mt-2" type="text" :placeholder="$t('contact.email')" v-model="value.organization.email" ></InputText>
          </div>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
import TopMenuBar from './TopMenuBar.vue';
export default {
  components: { TopMenuBar },
	 data() {
		return {
      value:this.modelValue,
			states: [
				{id:1, name: this.$t("contragent.active")},
				{id:-1, name: this.$t("contragent.inactive")}
			],
			resident: [
				{id: 1, name: this.$t("contragent.resident")},
				{id:-1, name: this.$t("contragent.noneresident")}
			],
			active: null,
			menu: [
        {
          label:this.$t('common.save'),
          icon:'pi pi-fw pi-save',
					command: () => {
          	this.$toast.add({severity:'success', summary:'Updated', detail:'Data Updated', life: 3000});
          }
        },
        {
           label: this.$t('contact.mailto'),
           icon:'pi pi-fw pi-envelope',
					 command: () => {
						 window.location.href = "mailto:" + this.modelValue.organization.email;
					 }
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
		placeholder: String,
    readonly: Boolean,
  },
}
</script>
<style>
	#carddiv label {
		position:inherit;
	}

</style>
