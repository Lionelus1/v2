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
            :disabled="pageReadonly"
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
        <label>{{ $t("contragent.companyCategory") }}</label>
        <Dropdown :disabled="pageReadonly" v-model="org.companyCategory" dataKey="id" :placeholder="$t('common.select')" :options="orgCompanyCategory"
                  :optionLabel="($i18n.locale === 'kz' ? 'name' : $i18n.locale === 'ru' ? 'namerus' : 'nameen')" @change="input"></Dropdown>
<!--        <small class="p-error" v-if="validation.companyCategory">{{$t('common.requiredField')}}</small>-->
      </div>
      <div v-if="!loading" class="field col-12 md:col-6">
        <label>{{ $t("contragent.organizationIndustry") }}</label>
        <MultiSelect maxSelectedLabels="5" class="w-full md:w-50" display="chip" :disabled="pageReadonly" v-model="org.organizationIndustry" :options="organizationIndustry"
                     :optionLabel="($i18n.locale === 'kz' ? 'name_kz' : $i18n.locale === 'ru' ? 'name_ru' : 'name_en')"
                     :placeholder="$t('common.select')"
                     @change="input" />
<!--        <small class="p-error" v-if="validation.organizationIndustry">{{$t('common.requiredField')}}</small>-->
      </div>
      <div v-if="!loading" class="field col-12 md:col-6">
        <label>{{ $t("contragent.otherParameters") }}</label>
        <MultiSelect maxSelectedLabels="5" class="w-full md:w-50" display="chip" :disabled="pageReadonly" v-model="org.otherParameters" :options="workOpportunities"
                     :optionLabel="($i18n.locale === 'kz' ? 'name_kz' : $i18n.locale === 'ru' ? 'name_ru' : 'name_en')"
                     :placeholder="$t('common.select')"
                     @change="input" />
<!--        <small class="p-error" v-if="validation.otherParameters">{{$t('common.requiredField')}}</small>-->
      </div>
      <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
        <label>{{ this.$t("common.head") }}</label>
        <FindUser userType="3" @input="input" @remove="input" class="mt-2" :disabled="pageReadonly" :editMode="true" v-model="users"  v-model:first="org.chief" :max="1"/>
      </div>
      <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
        <label>{{ this.$t("common.state") }}</label>
        <SelectButton
            :disabled="pageReadonly"
            class="mt-2"
            v-model="org.state"
            :options="states"
            optionValue="id"
            @change="input"
            optionLabel="name"
        />
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
        <Dropdown :disabled="pageReadonly" @change="input" filter v-model="localityId" option-value="id" :placeholder="$t('common.select')" :options="countries" class="w-full"
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
      <AccordionTab v-if="org.id">
        <template #header>
          <div class="uppercase">{{ this.$t("contracts.cooperationDocument") }}</div>
        </template>
        <Menubar :model="menuCooperation" class="m-0 pt-0 pb-0"></Menubar>

        <div class="card">
          <DataTable :value="cooperations" dataKey="id" :rows="cooperationFilter.rows" :totalRecords="cooperationTotal"
                     :paginator="true" :paginatorTemplate="paginatorTemplate" :rowsPerPageOptions="[10, 25, 50]"
                      :lazy="true" :loading="cooperationLoading"
                     scrollable scrollHeight="flex" v-model:selection="cooperation" selectionMode="single"
                     :rowHover="true" stripedRows class="flex-grow-1" @page="onPage">
            <Column :header="$t('contracts.name_doc')" style="min-width: 50px;">
              <template #body="slotProps">
                {{ this.countryLabel(slotProps.data) }}
              </template>
            </Column>
            <Column v-if="!pageReadonly" :header="$t('common.actionTitle')" class="text-right">
              <template #body="slotProps">
                <ActionButton :show-label="true" :items="initItems" @toggle="toggle2(slotProps.data)"/>
              </template>
            </Column>
          </DataTable>
        </div>
      </AccordionTab>

      <AccordionTab v-if="org?.form?.namerus === 'Учреждение высшего образования'">
        <template #header>
          <div class="uppercase">{{ this.$t("contracts.rating") }}</div>
        </template>
          <Menubar :model="menuRating" class="m-0 pt-0 pb-0"></Menubar>

          <DataTable :value="ratings" dataKey="id" :rows="ratingFilter.rows" :totalRecords="ratingTotal"
                     :paginator="true" :paginatorTemplate="paginatorTemplate" :rowsPerPageOptions="[10, 25, 50]"
                     :lazy="true" :loading="cooperationLoading"
                     scrollable scrollHeight="flex" v-model:selection="rating" selectionMode="single"
                     :rowHover="true" stripedRows class="flex-grow-1" @page="onPageRating">
            <Column :header="this.$t('contracts.rating')">
              <template #body="slotProps">
                {{ this.countryLabel(slotProps.data) }}
              </template>
            </Column>
            <Column :header="this.$t('contracts.rating_place')">
              <template #body="slotProps">
                {{slotProps.data.place}}
              </template>
            </Column>
            <Column v-if="!pageReadonly" :header="this.$t('common.actionTitle')">
              <template #body="slotProps">
                <ActionButton :show-label="true" :items="initItemsRiting" @toggle="toggleRating(slotProps.data)"/>
              </template>
            </Column>
          </DataTable>
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
                  :readonly="pageReadonly"
                  class="mt-2"
                  type="text"
                  :placeholder="$t('bank.accnumber')"
                  @input="input"
                  v-model="org.bankaccount"
              ></InputText>
            </div>
            <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
              <label>{{ $t('bank.title2') }}</label>
              <Dropdown  :disabled="pageReadonly" v-model="bank.id" option-value="id" :optionLabel="bankLabel"
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

    <Sidebar position="right" class="p-sidebar-lg"
             style="width: 50%;"  v-model:visible="cooperationDialog">
      <CooperationPage :model-value="cooperation" :org-id="org.id" :on-close="closeSidebar"></CooperationPage>
    </Sidebar>

    <Sidebar position="right" class="p-sidebar-lg"
             style="width: 50%;"  v-model:visible="ratingDialog">
      <TitleBlock :title="this.$t('contracts.rating')" :show-back-button="false"></TitleBlock>

      <Menubar :model="menuRatingSave" class="m-0 pt-0 pb-0"></Menubar>
      <div class="card p-fluid">
        <div class="grid formgrid">
          <div class="field col-12 md:col-4">
            <label>{{ this.$t('contracts.rating') }} {{this.$t('common.language.kz')}}<span class="p-error">*</span></label>
            <InputText v-model="rating.name_kz"  required />
            <small class="p-error" v-if="validationErrors.name_kz">{{ this.$t('common.requiredField') }}</small>
          </div>

          <div class="field col-12 md:col-4">
            <label>{{ this.$t('contracts.rating') }} {{this.$t('common.language.ru')}}<span class="p-error">*</span></label>
            <InputText v-model="rating.name_ru" required />
            <small class="p-error" v-if="validationErrors.place">{{ this.$t('common.requiredField') }}</small>
          </div>

          <div class="field col-12 md:col-4">
            <label>{{ this.$t('contracts.rating') }} {{this.$t('common.language.ru')}}<span class="p-error">*</span></label>
            <InputText v-model="rating.name_en" required />
            <small class="p-error" v-if="validationErrors.place">{{ this.$t('common.requiredField') }}</small>
          </div>
          <div class="field col-12 md:col-12">
            <label>{{ this.$t('contracts.rating_place') }}<span class="p-error">*</span></label>
            <InputText v-model="rating.place" required />
            <small class="p-error" v-if="validationErrors.place">{{ this.$t('common.requiredField') }}</small>
          </div>
        </div>
      </div>
    </Sidebar>
  </BlockUI>
</template>
<script>
import {findRole, getHeader} from "@/config/config";
import Enum from "@/enum/roleControls/index";

import { ContragentService } from "@/service/contragent.service";
import Dropdown from "primevue/dropdown";
import api from "@/service/api";
import ActionButton from "@/components/ActionButton.vue";
import CooperationPage from "@/components/contragent/v2/CooperationPage.vue";

export default {
  name: 'OrganizationPage',
  components: {CooperationPage, ActionButton, Dropdown},
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
      paginatorTemplate: "FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink JumpToPageDropdown CurrentPageReport RowsPerPageDropdown",
      currentPageReportTemplate: this.$t('common.showingRecordsCount', {
        first: '{first}',
        last: '{last}',
        totalRecords: '{totalRecords}',
      }),
      service: new ContragentService(),
      loginedUser: null,
      findRole: findRole,
      enum: Enum,

      loading: false,
      changed: false,
      pageReadonly: false,

      org: null,
      orgCompanyCategory: [
        {
          id: 0,
          name: "Крупный бизнес",
          namerus: "Крупный бизнес",
          nameen: "Large Business"
        },
        {
          id: 1,
          name: "Средний бизнес",
          namerus: "Средний бизнес",
          nameen: "Medium Business"
        },
        {
          id: 2,
          name: "Малый бизнес",
          namerus: "Малый бизнес",
          nameen: "Small Business"
        }
      ],
      workOpportunities: null,
      organizationIndustry: [],
      otherParameters:null,
      validation: {
        bin: false,
        namekz: false,
        nameru: false,
        nameen: false,
        form: false,
        email: false,
        country: false,
        swift: false,
        companyCategory: false,
        organizationIndustry: false,
        otherParameters: false,
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
      org_id: Number(this.id) || Number(this.$route.params.id) || null,
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
      cooperationFilter: {
        id: null,
        org_id: Number(this.id) || Number(this.$route.params.id) || null,
        page: 0,
        rows: 10,
      },
      cooperations: [],
      cooperation: null,
      cooperationTotal: 0,
      cooperationLoading: false,
      menuCooperation: [
        {
          label: this.$t("common.add"),
          icon: "fa-solid fa-plus",
          disabled: () => this.pageReadonly, // TODO here need check role
          command: () => { this.createCooperation() },
        }
      ],
      cooperationDialog: false,
      actionsNode: null,
      ratingDialog: false,
      menuRating: [
        {
          label: this.$t("common.add"),
          icon: "fa-solid fa-plus",
          disabled: () => this.pageReadonly, // TODO here need check role
          command: () => { this.createRating() },
        },
      ],
      menuRatingSave: [
        {
          label: this.$t("common.save"),
          icon: "pi pi-fw pi-save",
          disabled: () => this.pageReadonly,
          command: () => { this.saveRating() },
        }
      ],
      rating: {
        id: null,
        name_kz: '',
        name_en: '',
        name_ru: '',
        place: '',
        org_id: null
      },
      ratings: [],
      ratingTotal: 0,
      ratingFilter: {
        id: null,
        org_id: Number(this.id) || Number(this.$route.params.id) || null,
        page: 0,
        rows: 10,
      },
      validationErrors:{},
      actionsNodeRating: null,
      users: [],
      states: [
        { id: 1, name: this.$t("contragent.active") },
        { id: -1, name: this.$t("contragent.inactive") },
      ],
    }
  },
  computed: {
    initItems() {
      return [
        {
          label: this.$t('common.edit'),
          icon: 'fa-solid fa-pen',
          disabled: this.pageReadonly,
          command: () => {
            this.editCoolection(this.actionsNode)
          }
        },
        {
          label: this.$t('common.delete'),
          icon: 'fa-solid fa-trash',
          disabled: this.pageReadonly,
          command: () => {
            this.deleteCoolection(this.actionsNode)
          }
        },
      ];
    },
    initItemsRiting() {
      return [
        {
          label: this.$t('common.edit'),
          icon: 'fa-solid fa-pen',
          disabled: this.pageReadonly,
          command: () => {
            this.editRating(this.actionsNodeRating)
          }
        },
        {
          label: this.$t('common.delete'),
          icon: 'fa-solid fa-trash',
          disabled: this.pageReadonly,
          command: () => {
            this.deleteRating(this.actionsNodeRating)
          }
        },
      ];
    }
  },
  created() {
    this.loginedUser = JSON.parse(localStorage.getItem("loginedUser"));
    this.getOrganizationForms();
    this.getBanks()
    this.getCountries()
    if (this.org_id) {
      this.getOrganizations();
      this.getCooperations(this.org_id)
    } else {
      this.org = this.createEmptyOrganization()
      this.getOrganizationIndustries()
      this.getAdditionalParameters()
    }
  },
  mounted() {
    this.pageReadonly = true;

    if (!this.readonly && (this.findRole(this.loginedUser, this.enum.roles.OrganizationManager) || this.findRole(this.loginedUser, this.enum.roles.MainAdministrator) || (this.org && this.loginedUser?.mainPosition?.organization?.id === this.org.id &&
      (this.findRole(this.loginedUser, this.enum.roles.Signer) || this.findRole(this.loginedUser, this.enum.roles.HeadOfCompany))))) {
        this.pageReadonly = false;
    }
  },
  methods: {
    toggle2(node) {
      this.actionsNode = node
    },
    toggleRating(node) {
      this.actionsNodeRating = node
    },
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

      if (this.org.organizationIndustry && this.org.otherParameters) {

        this.org.industrySubject = [
          ...this.org.organizationIndustry.map(item => ({
            id: item?.id || null,
            name_kz: item?.name_kz || '',
            name_ru: item?.name_ru || '',
            name_en: item?.name || '',
            is_noted: true,
            type: 1
          })),
          ...this.org.otherParameters.map(item => ({
            id: item?.id || null,
            name_kz: item?.name_kz || '',
            name_ru: item?.name_ru || '',
            name_en: item?.name || '',
            is_noted: true,
            type: 2
          }))
        ];
      }

      this.org.enterprise_category_id = this.org.companyCategory?.id || null;


      if (this.localityId > 0) {
        this.org.locality = {
          id: this.localityId
        }
      }

      this.service.updateOrganization(this.org).then(res => {
        this.loading = false;
        if (this.org.id === null || this.org.id === undefined) {
          this.$router.push({ name: 'OrganizationList' });
          return
        }

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
    getOrganizationIndustries() {
      this.loading = true;
      const req = {
        org_organization_id: this.org_id,
        industry_type: 1,
      }
      this.service.getOrganizationIndustries(req).then(res => {
        if (res.data && res.data.length > 0) {
          this.org.organizationIndustry = []
          this.organizationIndustry = res.data;
          this.org.organizationIndustry = this.organizationIndustry.filter(item => item.is_noted === true);
          console.log("Filtered organizationIndustry:", this.org.organizationIndustry); // Логируйте результат
        } else {
          console.error("Данные не загружены или пусты", res.data);
        }
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
    getAdditionalParameters() {
      this.loading = true;
      const req = {
        org_organization_id: this.org_id,
        industry_type: 2,
      }
      this.service.getOrganizationIndustries(req).then(res => {
        this.workOpportunities = res.data;
        this.org.otherParameters = res.data.filter(item => item.is_noted === true);
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
        this.validation.country = !this.localityId || !this.localityId < 0;
      } else {
        this.validation.bin = !this.org.iin || this.org.iin.length != 12;
        this.validation.country = false
      }
      this.validation.namekz = !this.org.name || this.org.name.length < 1;
      this.validation.nameru =  !this.org.nameru || this.org.nameru.length < 1;
      this.validation.nameen =  !this.org.nameen || this.org.nameen.length < 1;
      this.validation.form = !this.org.form || this.org.form.id < 1;
      this.validation.email = !this.org.email || this.org.email.length < 1;
      // this.validation.companyCategory = !this.org.companyCategory || this.org.companyCategory.length < 1;
      // this.validation.organizationIndustry = !this.org.organizationIndustry || this.org.organizationIndustry.length < 1;
      // this.validation.otherParameters = !this.org.otherParameters || this.org.otherParameters.length < 1;
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
            this.bank = this.org.banks
          }

          if (this.org.locality){
            this.localityId = this.org.locality.id
          }
          if (this.org.form.namerus === "Учреждение высшего образования") {
            this.getRatings()
          }

          if (this.org.enterprise_category_id) {
            const category = this.orgCompanyCategory.find(c => c.id === this.org.enterprise_category_id);
            if (category) {
              this.org.companyCategory = category;
            }
          }

          this.getOrganizationIndustries()
          this.getAdditionalParameters()
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
          this.$toast.add({severity: 'error', summary: this.$t('common.error'), life: 3000})
        }
      })
    },
    getCooperations(orgId) {
      this.cooperationFilter.org_id = Number(orgId)

      this.service.getCooperations(this.cooperationFilter).then(res => {
        this.cooperations = res.data.cooperations;
        this.cooperationTotal = res.data.total;
      }).catch(err => {
        this.cooperations = [];
        this.cooperationTotal = 0;

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
    onPage(event) {
      this.cooperationFilter.page = event.page;
      this.cooperationFilter.rows = event.rows;
      this.getCooperations(this.org_id);
    },
    editCoolection(actionsNode) {
      console.log('test: ', actionsNode)
      this.cooperation = actionsNode
      this.cooperationDialog = true
    },
    createCooperation() {
      this.cooperation = null
      this.cooperationDialog = true
    },
    closeSidebar() {
     this.cooperationDialog = false;
     this.getCooperations(this.org_id)
    },
    deleteCoolection(actionNode) {
      this.$confirm.require({
        message: this.$t("common.doYouWantDelete"),
        header: this.$t("common.confirm"),
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button p-button-success',
        rejectClass: 'p-button p-button-danger',
        accept: () => {
          const req = {
            id: actionNode.id
          }

          this.service.deleteCooperation(req).then(res => {
            this.showMessage('success', this.$t('common.message.successCompleted'), null);
            this.getCooperations(this.org_id);
          }).catch(err => {
            console.log(err);
          })
        }
      })
    },
    createRating() {
      this.rating = {
        id: null,
        name: '',
        place: ''
      }
      this.ratingDialog = true
    },
    getRatings(){
      this.service.getRatings(this.ratingFilter).then(res => {
        this.ratings = res.data.ratings
        this.ratingTotal = res.data.total
      }).catch(err => {
        console.log(err);
      })
    },
    saveRating() {
      if (!this.validateFormRating()) {
        this.showMessage('warn', this.$t('common.message.fillError'), null);
        return
      }

      this.rating.org_id = this.org.id

      this.service.updateRating(this.rating).then(res => {
        this.getRatings()
        this.ratingDialog = false
      }).catch(err => {
        console.log(err)
      })

    },
    validateFormRating() {
      this.validationErrors = {}

      if (!this.rating.name_kz) this.validationErrors.name_kz = true;
      if (!this.rating.name_ru) this.validationErrors.name_ru = true;
      if (!this.rating.name_en) this.validationErrors.name_en = true;
      if (!this.rating.place) this.validationErrors.place = true;

      return Object.keys(this.validationErrors).length === 0
    },
    onPageRating(event) {
      this.ratingFilter.page = event.page;
      this.ratingFilter.rows = event.rows;
      this.getRatings();
    },
    editRating(actionsNode) {
      this.rating = actionsNode
      this.ratingDialog = true
    },
    deleteRating(actionNode) {
      this.$confirm.require({
        message: this.$t("common.doYouWantDelete"),
        header: this.$t("common.confirm"),
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button p-button-success',
        rejectClass: 'p-button p-button-danger',
        accept: () => {
          const req = {
            id: actionNode.id
          }

          this.service.deleteRating(req).then(res => {
            this.showMessage('success', this.$t('common.message.successCompleted'), null);
            this.getRatings();
          }).catch(err => {
            console.log(err);
          })
        }
      })
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