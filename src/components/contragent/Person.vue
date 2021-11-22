<template>
  <div id="carddiv" class="p-grid">
    <div class="p-col-12">
      <h3>{{ value.fullName }}</h3>
      <TopMenuBar :organization="value" :readonly="readonly"></TopMenuBar>
    </div>
    <div class="p-col-12 p-md-12 p-fluid">
      <div class="card">
        <div class="p-grid p-formgrid">
          <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
            <label>{{ this.$t("contact.lname") }}</label>
            <InputText
              :readonly="readonly"
              class="p-mt-2"
              type="text"
              v-model="value.lastName"
            ></InputText>
          </div>
          <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
            <label>{{ this.$t("contact.fname") }}</label>
            <InputText
              :readonly="readonly"
              class="p-mt-2"
              type="text"
              v-model="value.firstName"
            ></InputText>
          </div>
          <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
            <label>{{ this.$t("contact.sname") }}</label>
            <InputText
              :readonly="readonly"
              class="p-mt-2"
              type="text"
              v-model="value.thirdName"
            ></InputText>
          </div>
          <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
            <label>{{ this.$t("contact.birthday") }}</label>
            <PrimeCalendar id="dateformat" v-model="date2"  dateFormat="mm-dd-yy" />
            <PrimeCalendar
                v-model="value.birthday"
                dateFormat="dd.mm.yy"
                placeholder="dd.mm.yyyy"
                :monthNavigator="true"
                :yearNavigator="true"
                yearRange="1900:2030"
              />
          </div>
		  <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
            <label>{{ this.$t("contact.position") }}</label>
            <InputText
              :readonly="readonly"
              class="p-mt-2"
              type="text"
              :v-model="'value.mainPosition.name' + $i18n.locale"
			  :placeholder="$t('contact.position')"
            ></InputText>
          </div>
          <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
            <label>{{ this.$t("contact.gender") }}</label>
            <Dropdown
              :disabled="readonly"
              class="p-mt-2"
              v-model="value.gender"
              :options="gender"
              :optionLabel="$i18n.locale"
              optionValue="id"
              :placeholder="$t('contact.gender')"
            />
          </div>
          <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
            <label>{{ this.$t("common.state") }}</label>
            <SelectButton
              :disabled="readonly"
              class="p-mt-2"
              v-model="value.state"
              :options="states"
              optionValue="id"
              optionLabel="name"
            />
          </div>
          <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
            <label>&nbsp;</label>
            <SelectButton
              :disabled="readonly"
              class="p-mt-2"
              v-model="value.resident"
              :options="resident"
              optionValue="id"
              optionLabel="name"
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
            <label>{{ this.$t("contact.bin") }}</label>
            <InputText
              :readonly="readonly"
              class="p-mt-2"
              type="text"
              :placeholder="$t('contact.bin')"
              v-model="value.iin"
            ></InputText>
          </div>
          <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
            <label>{{ this.$t("contact.locality") }}</label>
            <InputText
              :readonly="readonly"
              class="p-mt-2"
              type="text"
              :placeholder="$t('contact.locality')"
              v-model="value.locality.name"
            ></InputText>
          </div>
          <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
            <label
              >{{ this.$t("contact.address") }} ({{
                this.$t("common.language.kz")
              }})</label
            >
            <InputText
              :readonly="readonly"
              class="p-mt-2"
              type="text"
              :placeholder="$t('contact.address')"
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
              :readonly="readonly"
              class="p-mt-2"
              type="text"
              :placeholder="$t('contact.address')"
              v-model="value.addressrus"
            ></InputText>
          </div>
          <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
            <label>{{ this.$t("contact.phone") }}</label>
            <InputText
              :readonly="readonly"
              class="p-mt-2"
              type="text"
              :placeholder="$t('contact.phone')"
              v-model="value.phone"
            ></InputText>
          </div>
          <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
            <label>{{ this.$t("contact.email") }}</label>
            <InputText
              :readonly="readonly"
              class="p-mt-2"
              type="text"
              :placeholder="$t('contact.email')"
              v-model="value.email"
            ></InputText>
          </div>
        </div>
      </div>
      <Accordion style="margin-left: -14px; margin-right: -14px">
        <AccordionTab>
          <template #header>
            <div class="p-text-uppercase">
              {{ this.$t("contact.idcard.requisite") }}
            </div>
          </template>
          <div class="card">
            <div class="p-grid p-formgrid">
              <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
                <label>{{ this.$t("common.number") }}</label>
                <InputText
                  :readonly="readonly"
                  class="p-mt-2"
                  type="text"
                  :placeholder="$t('common.number')"
                  v-model="value.idnumber"
                ></InputText>
              </div>
              <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
                <label>{{ this.$t("contact.idcard.givenorg") }}</label>
                <Dropdown
                  :disabled="readonly"
                  class="p-mt-2"
                  v-model="value.idsource"
                  :options="givenorg"
                  :optionLabel="$i18n.locale"
                  optionValue="id"
                  :placeholder="$t('contact.idcard.givenorg')"
                />
              </div>
              <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
                <label>{{ this.$t("contact.idcard.givendate") }}</label>
                <PrimeCalendar
                v-model="value.iddate"
                dateFormat="dd.mm.yy"
                placeholder="dd.mm.yyyy"
                :monthNavigator="true"
                :yearNavigator="true"
                yearRange="1990:2050"
              />      
              </div>
              <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
                <label>{{ this.$t("contact.idcard.expire") }}</label>
              <PrimeCalendar
                v-model="value.idexpire"
                dateFormat="dd.mm.yy"
                placeholder="dd.mm.yyyy"
                :monthNavigator="true"
                :yearNavigator="true"
                yearRange="1990:2050"
              />        
              </div>
            </div>
          </div>
        </AccordionTab>
        <AccordionTab>
          <template #header>
            <div class="p-text-uppercase">{{ this.$t("bank.requisite") }}</div>
          </template>
          <div class="card">
            <div class="p-grid p-formgrid">
              <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
                <label>{{ this.$t("bank.accnumber") }}</label>
                <InputText
                  :readonly="readonly"
                  class="p-mt-2"
                  type="text"
                  :placeholder="$t('bank.accnumber')"
                  v-model="value.bankaccount"
                ></InputText>
              </div>
              <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
                <label>{{ this.$t("bank.title2") }}</label>
                <InputText
                  :readonly="readonly"
                  class="p-mt-2"
                  type="text"
                  :placeholder="$t('bank.title2')"
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

export default {
  components: { TopMenuBar },
  name: "Person",
  data() {
    return {
      value: this.modelValue,
      states: [
        { id: 1, name: this.$t("contragent.active") },
        { id: -1, name: this.$t("contragent.inactive") },
      ],
      resident: [
        { id: 1, name: this.$t("contragent.resident") },
        { id: -1, name: this.$t("contragent.noneresident") },
      ],
      givenorg: [
        { id: 1, kz: "ҚР ІІМ", ru: "МВД РК", en: "MIA RK" },
        { id: 2, kz: "ҚР ӘМ", ru: "МЮ РК", en: "MJ RK" },
      ],
      gender: [
        { id: 1, kz: "еркек", ru: "мужчина", en: "Male" },
        { id: 2, kz: "әйел", ru: "женщина", en: "Female" },
      ],
      active: null,
      menu: [
        {
          label: this.$t("common.save"),
          icon: "pi pi-fw pi-save",
          command: () => {
            this.$toast.add({
              severity: "success",
              summary: "Updated",
              detail: "Data Updated",
              life: 3000,
            });
          },
        },
        {
          label: this.$t("contact.mailto"),
          icon: "pi pi-fw pi-envelope",
          command: () => {
            window.location.href = "mailto:" + this.modelValue.value.email;
          },
        },
        {
          label: this.$t("common.contacts"),
          icon: "pi pi-fw pi-user",
        },
      ],
    };
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

.border-indigo-300 {
  --border-opacity: 1;
  border-color: #a3bffa;
  border-color: rgba(163, 191, 250, var(--border-opacity));
}
.px-2 {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}
.py-1 {
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
}
.border {
  border-width: 1px;
}
.rounded {
  border-radius: 0.25rem;
}
.focus\:outline-none:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
}
.focus\:border-indigo-300:focus {
  --border-opacity: 1;
  border-color: #a3bffa;
  border-color: rgba(163, 191, 250, var(--border-opacity));
}
.w-4 {
  width: 1rem;
}
.h-4 {
  height: 1rem;
}
.mx-2 {
  margin-left: 0.5rem;
  margin-right: 0.5rem;
}
.embed-cover {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  margin-right: 20px;
}

.wrapper {
  position: relative;
  overflow: hidden;
}

/* Not Important*/
img {
  width: 300px;
}
</style>
