<template>
  <ProgressSpinner v-if="loading" class="progress-spinner" strokeWidth="5"/>
  <TitleBlock v-if="org" :title="getOrganizationName(org)" :show-back-button="localShowBackButton"></TitleBlock>
  <Menubar :model="menu" class="m-0 pt-0 pb-0"></Menubar>
  <BlockUI v-if="org" class="card p-fluid" :blocked="loading">
    <div class="grid formgrid">
      <div class="field col-12 md:col-6">
        <label>{{ $t("contact.bin") }}<span class="p-error" v-if="!pageReadonly && org.resident !== -1">*</span></label>
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
        <label>{{ $t("common.nameInEnglish") }}<span class="p-error" v-if="!pageReadonly">*</span></label>
        <InputText :readonly="pageReadonly" type="text" :placeholder="$t('common.nameInEnglish')" 
          v-model="org.nameen" @input="input"></InputText>
        <small class="p-error" v-if="validation.nameen">{{$t('common.requiredField')}}</small>
      </div>
      <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
        <label>{{this.$t('common.type')}}<span class="p-error" v-if="!readonly">*</span></label>
        <Dropdown
            @change="input"
            class="mt-2"
            :disabled="localReadonly"
            v-model="org.type"
            :options="orgStatus"
            optionLabel="name"
            optionValue="id"
            :placeholder="$t('common.select')"
        />
        <small class="p-error" v-if="validation.orgForm">{{$t('common.requiredField')}}</small>
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
      <div class="field col-12 md:col-6">
        <label>{{ $t('science.qualification.country') }}<span class="p-error" v-if="!pageReadonly && this.org.resident === -1">*</span></label>
        <Dropdown @change="input" filter v-model="localityId" option-value="id" :placeholder="$t('common.select')" :options="countries" class="w-full"
                  :option-label="countryLabel">
        </Dropdown>
        <small class="p-error" v-if="validation.country">{{$t('common.requiredField')}}</small>
      </div>
      <div class="field col-12 md:col-6">
        <label>{{ $t("web.websiteAddress") }}</label>
        <InputText :readonly="pageReadonly" type="text" :placeholder="$t('web.websiteAddress')"
        v-model="org.site_url" @input="input"></InputText>
      </div>
    </div>
    <Accordion style="margin-left: -14px; margin-right: -14px">
      <AccordionTab>
        <template #header>
          <div class="uppercase">{{ this.$t("contracts.cooperationDocument") }}</div>
        </template>
        <div class="card">
          <table class="table">
            <thead>
            <tr>
              <th>{{ this.$t("contracts.name_doc") }}</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="doc in documents" :key="doc.id">
              <td>
                <a :href="`/documents/${doc.id}`">{{ doc.type }}</a>
              </td>
              <td>{{ doc.action }}</td>
            </tr>
            </tbody>
          </table>
        </div>
      </AccordionTab>
      <AccordionTab>
        <template #header>
          <div class="uppercase">{{ this.$t("bank.requisite") }}<span class="p-error" v-if="!readonly && org.type === 2">*</span></div>
        </template>
        <div class="card">
          <div class="grid formgrid">
            <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
              <label>{{ this.$t("bank.accnumber") }}</label>
              <InputText
                  :readonly="localReadonly"
                  class="mt-2"
                  type="text"
                  :placeholder="$t('bank.accnumber')"
                  @input="input"
                  v-model="org.bankaccount"
              ></InputText>
            </div>
            <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
              <label>{{ $t('bank.title2') }}</label>
              <Dropdown  :disabled="localReadonly" v-model="bank.id" option-value="id" :optionLabel="bankLabel"
                         :options="banks" :placeholder="$t('bank.title2')"
                         class="dropdown w-full mt-2" @change="input"></Dropdown>
            </div>

            <div v-if="org.type === 2" class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
              <label>{{ this.$t("bank.swift") }}<span class="p-error" v-if="!readonly && org.type === 2">*</span></label>
              <InputText
                  :readonly="localReadonly"
                  class="mt-2"
                  type="text"
                  :placeholder='this.$t("bank.swift")'
                  @input="input"
                  v-model="bank.swift"
              ></InputText>
              <small class="p-error" v-if="this.validation.swift">{{$t('common.requiredField')}}</small>
            </div>
            <div v-if="org.type === 2" class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
              <label>{{ this.$t("bank.account") }}</label>
              <InputText
                  :readonly="localReadonly"
                  class="mt-2"
                  type="text"
                  :placeholder='this.$t("bank.account")'
                  @input="input"
                  v-model="bank.corrswift"
              ></InputText>
            </div>
          </div>
        </div>
      </AccordionTab>
    </Accordion>
  </BlockUI>
</template>
<script>
import {findRole, getHeader} from "@/config/config";
import Enum from "@/enum/roleControls/index";

import { ContragentService } from "@/service/contragent.service";
import Dropdown from "primevue/dropdown";
import api from "@/service/api";

export default {
  name: 'OrganizationPage',
  components: {Dropdown},
  props: {
    organization: null,
    readonly: {
      type: Boolean,
      default: false
    },
    showBackButton: {
      type: Boolean,
      default: false
    },
    id: {
      type:Number,
      default: null,
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

      org: null,
      orgforms: [],
      validation: {
        bin: false,
        namekz: false,
        nameru: false,
        nameen: false,
        form: false,
        email: false,
        country: false,
        swift: false,
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
      localReadonly: this.readonly,
      localShowBackButton: this.$route?.query?.showBackButton === 'true',
      org_id: this.id || this.$route.params.id || null,
      orgStatus: [
        {id: 1, name: this.$t("common.organization")},
        {id: 2, name: this.$t("bank.title2")}
      ],
      countries: [],
      countryTotal: 0,
      banks: [],
      bank: {
        id: null,
        swift: null,
        corrswift: null,
        name: null,
        namerus: null,
        type: null
      },
      localityId: null,
    }
  },
  computed: {
    bankDetailsbankDetails() {
      return this.org.bank || { corrswift: '' } || {swift: ''} || {id: null};
    }
  },
  created() {
    this.loginedUser = JSON.parse(localStorage.getItem("loginedUser"));
    this.getOrganizationForms();
    this.getBanks()
    this.getCountries()
    if (this.org_id) {
      this.getOrganizations();
    } else {
      this.org = this.createEmptyOrganization()
    }
  },
  mounted() {
    this.pageReadonly = true;

    if (!this.readonly && (this.findRole(this.loginedUser, this.enum.roles.MainAdministrator) || (this.org && this.loginedUser?.mainPosition?.organization?.id === this.org.id &&
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
      this.org.bank = this.bank

      if (this.localityId > 0) {
        this.org.locality = {
          id: this.localityId
        }
      }

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
      if (this.org.resident === -1) {
        this.validation.bin = false
        this.validation.country = !localityId || !localityId < 0;
      } else {
        this.validation.bin = !this.org.iin || this.org.iin.length != 12;
        this.validation.country = false
      }
      this.validation.namekz = !this.org.name || this.org.name.length < 1;
      this.validation.nameru =  !this.org.nameru || this.org.nameru.length < 1;
      this.validation.nameen =  !this.org.nameen || this.org.nameen.length < 1;
      this.validation.form = !this.org.form || this.org.form.id < 1;
      this.validation.email = !this.org.email || this.org.email.length < 1;

      if (this.org.type === 2) {
        this.validation.swift = !this.bank.swift || this.bank.swift.length < 1;
      } else {
        this.validation.swift = false
      }

      return (this.validation.bin || this.validation.namekz || this.validation.nameru ||
        this.validation.form || this.validation.email || this.validation.country || this.validation.swift);
    },
    createEmptyOrganization() {
      return {
        iin: '',
        name: '',
        nameru: '',
        nameen: '',
        form: null,
        resident: 1,
        email: '',
        phone: '',
        address: '',
        addressru: '',
      };
    },
    getOrganizations() {
      this.service.getOrganizations({
        filter: {
          id: Number(this.org_id)
        }
      }).then(res => {
        if (res.data.organizations.length === 1) {
          this.org = res.data.organizations[0];

          if (this.org.bank) {
            this.bank = this.org.bank
          }

          if (this.org.locality){
            this.localityId = this.org.locality.id
          }
        }
      }).catch(err => {
        if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout");
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath), null);
        } else {
          console.log(err);
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'));
        }

      });
    },
    getCountries() {
      const req = {
        searchText: null,
      }
      this.service.getLocality(req).then(res => {
        this.countries = res.data.locality;
        this.countryTotal = res.data.total;
      }).catch(err => {
        this.countries = [];
        this.countryTotal = 0;

        if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout");
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath), null);
        } else {
          console.log(err);
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'));
        }
      });

    },
    countryLabel(data) {
      if (data === undefined || data === null) {
        return ''
      }
      return data['name_'+this.$i18n.locale]
    },
    bankLabel(item)  {
      if (item != null) {
        return item.organization.name
      }
    },
    getBanks() {
      var req = {"id" : 0, "count": 0};
      api.post('/contragent/banks', req, {headers: getHeader()}).then(res  => {
        this.banks = res.data;
      }).catch(err => {
        if (err?.response?.status !== 404) {
          this.$toast.add({severity: 'error', summary: t('common.error'), life: 3000})
        }
      })
    }
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