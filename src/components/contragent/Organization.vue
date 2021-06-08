<template>
	<div id="carddiv" class="p-grid">
		<div class="p-col-12">
		<h3>{{(this.$i18n.locale != 'ru' ? '"' + value.name + '" ' + value.form.shortname : value.form.shortnamerus + ' "' + value.namerus + '"')}}</h3>
		<TopMenuBar :organization="value" :readonly="readonly"></TopMenuBar>
		</div>
		<div class="p-col-12 p-md-12 p-fluid">
			<div class="card">
				<div class="p-grid p-formgrid">
					<div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
						<label for="kazname">{{this.$t('common.nameInQazaq')}}</label>
            <InputText id="kazname" :readonly="readonly" class="p-mt-2" type="text" :placeholder="$t('common.nameInQazaq')" v-model="value.name" ></InputText>
          </div>
					<div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
						<label for="rusname">{{this.$t('common.nameInRussian')}}</label>
            <InputText id="rusname" :readonly="readonly"  class="p-mt-2"  type="text" :placeholder="$t('common.nameInRussian')" v-model="value.namerus" ></InputText>
          </div>
					<div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
					<label>{{this.$t('contragent.form')}}</label>
					<Inplace :closable="true" class="p-pt-2" >
						<template #display>
								<InputText :readonly="readonly" style="margin-left:-7px"  v-model="value.form.name" autoFocus />
						</template>
						<template #content>
								<InputText :readonly="readonly" v-model="value.form.name" autoFocus />
						</template>
					</Inplace>
          </div>
					<div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
						<label>{{this.$t('common.state')}}</label>
						<SelectButton :disabled="readonly"  class="p-mt-2" v-model="value.state" :options="states" optionValue="id" optionLabel="name" />
          </div>
					<div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
						<label>&nbsp;</label>
						<SelectButton :disabled="readonly" class="p-mt-2" v-model="value.resident" :options="resident" optionValue="id" optionLabel="name" />
          </div>
				</div>
			</div>
			<div class="card">
				<div class="p-text-uppercase p-mb-2">{{this.$t('contact.title')}}</div>
				<div class="p-grid p-formgrid">
					<div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
						<label>{{this.$t('contact.bin')}}</label>
            <InputText :readonly="readonly" class="p-mt-2" type="text" :placeholder="$t('contact.bin')" v-model="value.iin" ></InputText>
          </div>
					<div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
						<label>{{this.$t('contact.locality')}}</label>
            <InputText :readonly="readonly" class="p-mt-2" type="text" :placeholder="$t('contact.locality')" v-model="value.locality.name" ></InputText>
          </div>
					<div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
						<label>{{this.$t('contact.address')}} ({{this.$t('common.language.kz')}})</label>
            <InputText :readonly="readonly" class="p-mt-2" type="text" :placeholder="$t('contact.address')" v-model="value.address" ></InputText>
          </div>
					<div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
						<label>{{this.$t('contact.address')}} ({{this.$t('common.language.ru')}})</label>
            <InputText :readonly="readonly" class="p-mt-2" type="text" :placeholder="$t('contact.address')" v-model="value.addressrus" ></InputText>
          </div>
					<div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
						<label>{{this.$t('contact.phone')}}</label>
            <InputText :readonly="readonly" class="p-mt-2" type="text" :placeholder="$t('contact.phone')" v-model="value.phone" ></InputText>
          </div>
					<div class="p-col-12 p-mb-2  p-pb-2 p-lg-6 p-mb-lg-0">
						<label>{{this.$t('contact.email')}}</label>
            <InputText :readonly="readonly" class="p-mt-2" type="text" :placeholder="$t('contact.email')" v-model="value.email" ></InputText>
          </div>
				</div>
			</div>
			<Accordion style="margin-left:-14px;margin-right:-14px">
				<AccordionTab >
					<template #header>
						<div class="p-text-uppercase">{{this.$t('bank.requisite')}}</div>
					</template>
					<div class="card">
						<div class="p-grid p-formgrid">
							<div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
								<label>{{this.$t('bank.accnumber')}}</label>
								<InputText :readonly="readonly" class="p-mt-2" type="text" :placeholder="$t('bank.accnumber')" v-model="value.bankaccount" ></InputText>
							</div>
							<div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
								<label>{{this.$t('bank.title2')}}</label>
								<InputText :readonly="readonly" class="p-mt-2" type="text" :placeholder="$t('bank.title2')" v-model="value.bank.name" ></InputText>
							</div>
						</div>
					</div>
				</AccordionTab>
			</Accordion>
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
						 window.location.href = "mailto:" + this.modelValue.value.email;
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
	.p-accordion .p-accordion-header .p-accordion-header-link {
		border:0px;
		height: 25px;
		background-color: #ffffff;

	}
	.p-accordion .p-accordion-content {
		border:0px;
	}
	.p-accordion .p-accordion-header:not(.p-disabled).p-highlight .p-accordion-header-link {
    background-color: #ffffff;
	}
</style>
