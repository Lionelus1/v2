<template>
  <ProgressSpinner v-if="loading" class="progress-spinner" strokeWidth="5"/>
  <h3>{{ getOrganizationName(org) }}</h3>
  <Menubar :model="menu" class="m-0 pt-0 pb-0"></Menubar>
  <BlockUI class="card p-fluid" :blocked="loading">
    <div class="grid formgrid">
      <div class="field col-12 md:col-6">
        <label>{{ $t("contact.bin") }}<span class="p-error" v-if="!pageReadonly">*</span></label>
        <InputMask :readonly="pageReadonly" type="text" :placeholder="$t('contact.bin')" 
          v-model="org.iin" @update:modelValue="input" mask="999999999999"></InputMask>
        <small class="p-error" v-if="validation.bin">{{$t('common.requiredField')}}</small>
      </div>
      <div class="field col-12 md:col-6">
        <label>{{ $t("common.nameInQazaq") }}<span class="p-error" v-if="!pageReadonly">*</span></label>
        <InputText :readonly="pageReadonly" type="text" :placeholder="$t('common.nameInQazaq')" 
          v-model="org.name" @input="input"></InputText>
        <small class="p-error" v-if="validation.namekz">{{$t('common.requiredField')}}</small>
      </div>
      <div class="field col-12 md:col-6">
        <label>{{ $t("common.nameInRussian") }}<span class="p-error" v-if="!pageReadonly">*</span></label>
        <InputText :readonly="pageReadonly" type="text" :placeholder="$t('common.nameInRussian')" 
          v-model="org.nameru" @input="input"></InputText>
        <small class="p-error" v-if="validation.nameru">{{$t('common.requiredField')}}</small>
      </div>
      <div class="field col-12 md:col-6">
        <label>{{ $t("common.nameInEnglish") }}</label>
        <InputText :readonly="pageReadonly" type="text" :placeholder="$t('common.nameInEnglish')" 
          v-model="org.nameen" @input="input"></InputText>
      </div>
      <div class="field col-12 md:col-6">
        <label>{{ $t("contragent.form") }}<span class="p-error" v-if="!pageReadonly">*</span></label>
        <Dropdown :disabled="pageReadonly" v-model="org.form" dataKey="id" :placeholder="$t('common.select')" :options="orgforms" 
          :optionLabel="($i18n.locale === 'kz' ? 'name' : $i18n.locale === 'ru' ? 'namerus' : 'nameen')" @change="input"></Dropdown>
        <small class="p-error" v-if="validation.form">{{$t('common.requiredField')}}</small>
      </div>
      <div class="field col-12 md:col-6">
        <label>&nbsp;</label>
        <SelectButton :disabled="pageReadonly"  v-model="org.resident" :options="resident" optionValue="id"
          optionLabel="name" @change="input" :unselectable="false"></SelectButton>
      </div>
    </div>
    <div class="grid formgrid mt-4">
      <div class="field col-12 uppercase">
        {{ this.$t("contact.title") }}
      </div>
      <div class="field col-12 md:col-6">
        <label>{{ $t("contact.email") }}<span class="p-error" v-if="!pageReadonly">*</span></label>
        <InputText :readonly="pageReadonly" type="text" :placeholder="$t('contact.email')" 
          v-model="org.email" @input="input"></InputText>
        <small class="p-error" v-if="validation.email">{{$t('common.requiredField')}}</small>
      </div>
      <div class="field col-12 md:col-6">
        <label>{{ $t("contact.phone") }}</label>
        <InputText :readonly="pageReadonly" type="text" :placeholder="$t('contact.phone')" 
          v-model="org.phone" @input="input"></InputText>
      </div>
      <div class="field col-12 md:col-6">
        <label>{{$t("contact.address")}} ({{$t("common.language.kz")}})</label>
        <InputText :readonly="pageReadonly" type="text" :placeholder="$t('contact.address')" 
          v-model="org.address" @input="input"></InputText>
      </div>
      <div class="field col-12 md:col-6">
        <label>{{$t("contact.address")}} ({{$t("common.language.ru")}})</label>
        <InputText :readonly="pageReadonly" type="text" :placeholder="$t('contact.address')" 
          v-model="org.addressru" @input="input"></InputText>
      </div>
    </div>
  </BlockUI>
</template>
<script>
import { findRole } from "@/config/config";
import Enum from "@/enum/roleControls/index";

import { ContragentService } from "@/service/contragent.service";

export default {
  name: 'OrganizationPage',
  props: {
    organization: null,
    readonly: {
      type: Boolean,
      default: false
    }
  },
  emits: ['organizationUpdated'],
  data() {
    return {
      service: new ContragentService(),
      loginedUser: null,
      findRole: findRole,
      enum: Enum,

      loading: false,
      changed: false,
      pageReadonly: false,

      org: JSON.parse(JSON.stringify(this.organization)),
      orgforms: [],
      validation: {
        bin: false,
        namekz: false,
        nameru: false, 
        form: false,
        email: false,
      },

      menu: [
        {
          label: this.$t("common.save"),
          icon: "pi pi-fw pi-save",
          disabled: () => !this.changed,
          command: () => { this.save() },
        }
      ],

      resident: [
        { id: 1, name: this.$t("contragent.resident") },
        { id: -1, name: this.$t("contragent.noneresident") },
      ],
    }
  },
  created() {
    this.loginedUser = JSON.parse(localStorage.getItem("loginedUser"));
    this.getOrganizationForms();
  },
  mounted() {
    this.pageReadonly = true;

    if (!this.readonly && (this.findRole(this.loginedUser, this.enum.roles.MainAdministrator) || (this.org && this.loginedUser.mainPosition.organization.id === this.org.id &&
      (this.findRole(this.loginedUser, this.enum.roles.Signer) || this.findRole(this.loginedUser, this.enum.roles.HeadOfCompany))))) {
        this.pageReadonly = false;
    }
  },
  methods: {
    showMessage(msgtype, message, content) {
      this.$toast.add({
        severity: msgtype,
        summary: message,
        detail: content,
        life: 3000
      });
    },
    getOrganizationName(org) {
      let name = '';

      if (this.$i18n.locale === 'kz' && org.name && org.name.length > 0) {
        if (org.form) {
          name = '"' + org.name + '" ' + org.form.shortname;
        } else {
          name = org.name;
        }
      } else if (this.$i18n.locale === 'ru' && org.nameru && org.nameru.length > 0) {
        if (org.form) {
          name = org.form.shortnameru + ' "' + org.nameru + '"';
        } else {
          name = org.nameru;
        }
      } else if (this.$i18n.locale === 'en' && org.nameen && org.nameen.length > 0) {
        if (org.form && org.form.shortnameen) {
          name = org.form.shortnameen + ' "' + org.nameen + '"';
        } else {
          name = org.nameen;
        }
      } else if (org.name) {
        name = org.name;
      }

      return name;
    },
    save() {
      if (this.validate()) {
        this.showMessage("error", this.$t('common.message.fillError'));
        return
      }

      this.loading = true;

      this.service.updateOrganization(this.org).then(res => {
        this.loading = false;

        this.$emit('organizationUpdated', this.org)
      }).catch(err => {
        this.loading = false;

        if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout");
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath), null);
        } else {
          console.log(err);
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'));
        }
      })
    },
    input() {
      this.changed = true;
    },
    getOrganizationForms() {
      this.loading = true;

      this.service.getOrganizationForms().then(res => {
        this.orgforms = res.data;
        this.loading = false;
      }).catch(err => {
        this.loading = false;

        if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout");
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath), null);
        } else {
          console.log(err);
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'));
        }
      })
    },
    validate() {
      this.validation.bin = !this.org.iin || this.org.iin.length != 12;
      this.validation.namekz = !this.org.name || this.org.name.length < 1;
      this.validation.nameru =  !this.org.nameru || this.org.nameru.length < 1;
      this.validation.form = !this.org.form || this.org.form.id < 1;
      this.validation.email = !this.org.email || this.org.email.length < 1;

      return (this.validation.bin || this.validation.namekz || this.validation.nameru ||
        this.validation.form || this.validation.email);
    },
  }
}
</script>
<style scoped>
.progress-spinner {
  position: absolute;
  top: 0; bottom: 0; left: 0; right: 0;
  margin: auto;
  z-index: 1102;
}
</style>