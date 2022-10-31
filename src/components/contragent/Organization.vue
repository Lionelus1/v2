<template>
  <div id="carddiv" class="p-grid">
    <div class="p-col-12">
      <h3>
        {{
          this.$i18n.locale != "ru"
            ? '"' + value.name + '" ' + value.form.shortname
            : value.form.shortnameru + ' "' + value.nameru + '"'
        }}
      </h3>
      <TopMenuBar :menu="menu" :readonly="localReadonly"></TopMenuBar>
    </div>
    <div class="p-col-12 p-md-12 p-fluid">
      <div class="card">
        <div class="p-grid p-formgrid">
          <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
            <label for="kazname">{{ this.$t("common.nameInQazaq") }}<span class="p-error" v-if="!readonly">*</span></label>
            <InputText
              id="kazname"
              :readonly="localReadonly"
              class="p-mt-2"
              type="text"
              :placeholder="$t('common.nameInQazaq')"
              v-model="value.name"
              @input="correct"
            ></InputText>
          </div>
          <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
            <label for="rusname">{{ this.$t("common.nameInRussian") }}<span class="p-error" v-if="!readonly">*</span></label>
            <InputText
              id="rusname"
              :readonly="localReadonly"
              class="p-mt-2"
              type="text"
              :placeholder="$t('common.nameInRussian')"
              v-model="value.nameru"
              @input="correct"
            ></InputText>
          </div>
          <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
            <label>{{ this.$t("contragent.form") }}<span class="p-error" v-if="!readonly">*</span></label>
            <Dropdown  @change="correct" class="p-mt-2" :disabled="localReadonly" v-model="value.form" :options="orgforms" :optionLabel="($i18n.locale == 'ru' ? 'namerus' : 'name')" :placeholder="$t('common.select')" />
          </div>

          <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
            <label>{{ this.$t("common.head") }}</label>
            <FindUser @input="correct" @remove="correct" class="p-mt-2" :disabled="localReadonly" :editMode="true" v-model="users"  v-model:first="value.chief" :max="1"/>
          </div>
          
          <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
            <label>{{ this.$t("common.state") }}</label>
            <SelectButton
              :disabled="localReadonly"
              class="p-mt-2"
              v-model="value.state"
              :options="states"
              optionValue="id"
              @change="correct"
              optionLabel="name"
            />
          </div>
          <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
            <label>&nbsp;</label>
            <SelectButton
              :disabled="localReadonly"
              class="p-mt-2"
              v-model="value.resident"
              :options="resident"
              optionValue="id"
              optionLabel="name"
              @change="correct"
            />
          </div>
        </div>
      </div>
      <div class="card">
        <div class="p-text-uppercase p-mb-2">
          {{ this.$t("contact.title") }}
        </div>
        <div class="p-grid p-formgrid">
          <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
            <label>{{ this.$t("contact.bin") }}<span class="p-error" v-if="!readonly">*</span></label>
            <InputText
              :readonly="localReadonly"
              class="p-mt-2"
              type="text"
              :placeholder="$t('contact.bin')"
              v-model="value.iin"
              @input="correct"
            ></InputText>
          </div>
          <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
            <label>{{ this.$t("contact.locality") }}</label>
            <InputText
              :readonly="localReadonly"
              class="p-mt-2"
              type="text"
              :placeholder="$t('contact.locality')"
              v-model="value.locality.name"
              @input="correct"
            ></InputText>
          </div>
          <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
            <label
              >{{ this.$t("contact.address") }} ({{
                this.$t("common.language.kz")
              }})</label
            >
            <InputText
              :readonly="localReadonly"
              class="p-mt-2"
              type="text"
              :placeholder="$t('contact.address')"
              @input="correct"
              v-model="value.address"
            ></InputText>
          </div>
          <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
            <label
              >{{ this.$t("contact.address") }} ({{
                this.$t("common.language.ru")
              }})</label
            >
            <InputText
              :readonly="localReadonly"
              class="p-mt-2"
              type="text"
              :placeholder="$t('contact.address')"
              @input="correct"
              v-model="value.addressrus"
            ></InputText>
          </div>
          <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
            <label>{{ this.$t("contact.phone") }}</label>
            <InputText
              :readonly="localReadonly"
              class="p-mt-2"
              type="text"
              :placeholder="$t('contact.phone')"
              @input="correct"
              v-model="value.phone"
            ></InputText>
          </div>
          <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
            <label>{{ this.$t("contact.email") }}<span class="p-error" v-if="!readonly">*</span></label>
            <InputText
              :readonly="localReadonly"
              class="p-mt-2"
              type="text"
              :placeholder="$t('contact.email')"
              @input="correct"
              v-model="value.email"
            ></InputText>
          </div>
        </div>
      </div>
      <Accordion style="margin-left: -14px; margin-right: -14px">
        <AccordionTab>
          <template #header>
            <div class="p-text-uppercase">{{ this.$t("bank.requisite") }}</div>
          </template>
          <div class="card">
            <div class="p-grid p-formgrid">
              <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
                <label>{{ this.$t("bank.accnumber") }}</label>
                <InputText
                  :readonly="localReadonly"
                  class="p-mt-2"
                  type="text"
                  :placeholder="$t('bank.accnumber')"
                  @input="correct"
                  v-model="value.bankaccount"
                ></InputText>
              </div>
              <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
                <label>{{ this.$t("bank.title2") }}</label>
                <InputText
                  :readonly="localReadonly"
                  class="p-mt-2"
                  type="text"
                  :placeholder="$t('bank.title2')"
                  @input="correct"
                  v-model="value.bank.name"
                ></InputText>
              </div>
            </div>
          </div>
        </AccordionTab>
      </Accordion>
    </div>
  </div>
</template>
<script>
import TopMenuBar from "./TopMenuBar.vue";
import { getHeader, smartEnuApi,findRole } from "@/config/config";

import axios from "axios";

export default {
  components: { TopMenuBar },
  data() {
    return {
      value: JSON.parse(JSON.stringify(this.modelValue)),
      users: [],
      orgforms: [],
      isAdmin: false,
      localReadonly: false,
      states: [
        { id: 1, name: this.$t("contragent.active") },
        { id: -1, name: this.$t("contragent.inactive") },
      ],
      resident: [
        { id: 1, name: this.$t("contragent.resident") },
        { id: -1, name: this.$t("contragent.noneresident") },
      ],
      active: null,
      menu: [
        {
          label: this.$t("common.save"),
          icon: "pi pi-fw pi-save",
          disabled: true,
          command: () => {
            this.saveOrganization()
          
          },
        },
        {
          label: this.$t("contact.mailto"),
          icon: "pi pi-fw pi-envelope",
          command: () => {
            window.location.href = "mailto:" + this.value.email;
          },
        },
        {
          label: this.$t("common.contacts"),
          icon: "pi pi-fw pi-user",
        },
      ],
     validationErrors: {
        nameInQazaq: false,
        nameInRus: false,
        orgForm: false,
        email: false,
        bin: false,
      },
    };
  },
  created() {
    this.getOrgForms();
    this.isAdmin = this.findRole(null, 'main_administrator') || this.findRole(null, "career_administrator")
    this.localReadonly =  this.readonly && !this.isAdmin
  },
  methods: {
    findRole: findRole,
    correct() {
      this.menu[0].disabled = false
    },
    getOrgForms() {
      axios.get(smartEnuApi+"/contragent/orgforms", {headers: getHeader()})
      .then(response=>{
        this.orgforms = response.data;
      })
      .catch((error) => {
        if (error.response.status == 401) {
          this.$store.dispatch("logLout");
        }
        this.$toast.add({
          severity: "error",
          summary: "getOrgForms:\n" + error,
          life: 3000,
        });
      });
    },
    validateAddForm() {
      this.validationErrors.nameInQazaq =
        !this.value.name || this.value.name == "";
      this.validationErrors.nameInRus =
        !this.value.nameru || this.value.nameru == "";
      this.validationErrors.orgForm = this.value.form.name == "" ;
      this.validationErrors.bin = !this.value.iin || this.value.iin == "";
      this.validationErrors.email = !this.value.email || this.value.email == "";
      console.log(this.value.form.name )
      return (
        !this.validationErrors.nameInQazaq &&
        !this.validationErrors.nameInRus &&
        !this.validationErrors.orgForm &&
        !this.validationErrors.email &&
        !this.validationErrors.bin
      );
    },
    saveOrganization() {
      if (!this.validateAddForm()) {
        this.$toast.add({
                severity: "error",
                summary:  this.$t('common.message.fillError'),
                life: 3000,
              });
        return
      }
      
      axios.post(smartEnuApi+"/contragent/updateorg", this.value, {headers: getHeader()})
      .then(response=> {
        this.menu[0].disabled = true
        if (this.value.id == null) { 
          this.value.id = response.data
          this.$emit('inserted', {
              value: this.value
          });
        }
        this.$toast.add({
              severity: "success",
              summary:  this.$t('common.successDone'),
              life: 3000,
            });
      })
      .catch((error) => {
        if (error.response.status == 401) {
          this.$store.dispatch("logLout");
        }
        this.$toast.add({
          severity: "error",
          summary: "updateOrg:\n" + error,
          life: 3000,
        });
      });

    }
  },
  props: {
    modelValue: null,
    placeholder: String,
    readonly: Boolean,
  },
};
</script>
<style>
#carddiv label {
  position: inherit;
}
.p-accordion .p-accordion-header .p-accordion-header-link {
  border: 0px;
  height: 25px;
  background-color: #ffffff;
}
.p-accordion .p-accordion-content {
  border: 0px;
}
.p-accordion
  .p-accordion-header:not(.p-disabled).p-highlight
  .p-accordion-header-link {
  background-color: #ffffff;
}
</style>
