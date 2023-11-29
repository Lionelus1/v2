<template>
  <ProgressSpinner v-if="loading" class="progress-spinner" strokeWidth="5"/>
  <Menubar :model="menu" class="m-0 pt-0 pb-0"></Menubar>
  <BlockUI class="card p-fluid" :blocked="loading">
    <div class="grid formgrid">
      <div class="field col-12 md:col-6">
        <label>{{ $t("contact.iin") }}<span class="p-error" v-if="!pageReadonly">*</span></label>
        <InputMask :readonly="pageReadonly" type="text" :placeholder="$t('contact.iin')" 
          v-model="per.IIN" @update:modelValue="input" mask="999999999999"></InputMask>
        <small class="p-error" v-if="validation.iin">{{$t('common.requiredField')}}</small>
      </div>
      <div class="field col-12 md:col-6">
        <label>{{ $t("contact.lname") }}<span class="p-error" v-if="!pageReadonly">*</span></label>
        <InputText :readonly="pageReadonly" type="text" :placeholder="$t('contact.lname')" 
          v-model="per.thirdName" @update:modelValue="input"></InputText>
        <small class="p-error" v-if="validation.lastname">{{$t('common.requiredField')}}</small>
      </div>
      <div class="field col-12 md:col-6">
        <label>{{ $t("contact.fname") }}<span class="p-error" v-if="!pageReadonly">*</span></label>
        <InputText :readonly="pageReadonly" type="text" :placeholder="$t('contact.fname')" 
          v-model="per.firstName" @update:modelValue="input"></InputText>
        <small class="p-error" v-if="validation.firstname">{{$t('common.requiredField')}}</small>
      </div>
      <div class="field col-12 md:col-6">
        <label>{{ $t("contact.sname") }}</label>
        <InputText :readonly="pageReadonly" type="text" :placeholder="$t('contact.sname')" 
          v-model="per.lastName" @update:modelValue="input"></InputText>
      </div>
      <div class="field col-12 md:col-6">
        <label>{{ $t("contact.birthday") }}<span class="p-error" v-if="!pageReadonly">*</span></label>
        <PrimeCalendar :readonly="pageReadonly" dateFormat="dd.mm.yy" :placeholder="$t('contact.birthday')" 
          v-model="per.birthday" @date-select="input"></PrimeCalendar>
        <small class="p-error" v-if="validation.birthday">{{$t('common.requiredField')}}</small>
      </div>
      <div class="field col-12 md:col-6"></div>
      <div class="field col-12">
        <Accordion>
          <AccordionTab :header="$t('contact.nameInLatin')">
            <div class="field col-12 md:col-6">
              <label>{{ $t("contact.lname") }}</label>
              <InputText :readonly="pageReadonly" type="text" :placeholder="$t('contact.lname')" 
                v-model="per.thirdnameEn" @update:modelValue="input"></InputText>
            </div>
            <div class="field col-12 md:col-6">
              <label>{{ $t("contact.fname") }}</label>
              <InputText :readonly="pageReadonly" type="text" :placeholder="$t('contact.fname')" 
                v-model="per.firstnameEn" @update:modelValue="input"></InputText>
            </div>
            <div class="field col-12 md:col-6">
              <label>{{ $t("contact.sname") }}</label>
              <InputText :readonly="pageReadonly" type="text" :placeholder="$t('contact.sname')" 
                v-model="per.lastnameEn" @update:modelValue="input"></InputText>
            </div>
            <div class="field col-12 md:col-6"></div>
          </AccordionTab>
        </Accordion>
      </div>
    </div>
  </BlockUI>
</template>
<script>
import { findRole } from "@/config/config";
import Enum from "@/enum/roleControls/index";

import { ContragentService } from "@/service/contragent.service";

export default {
  name: 'PersonPage',
  props: {
    person: null,
    readonly: {
      type: Boolean,
      default: false
    }
  },
  emits: ['personUpdated'],
  data() {
    return {
      service: new ContragentService(),
      loginedUser: null,
      findRole: findRole,
      enum: Enum,

      loading: false,
      changed: false,
      pageReadonly: false,

      per: JSON.parse(JSON.stringify(this.person)),
      validation: {
        iin: false,
        firstname: false,
        lastname: false, 
        birthday: false,
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
    }
  },
  created() {
    this.loginedUser = JSON.parse(localStorage.getItem("loginedUser"));
  },
  mounted() {
    this.pageReadonly = true;

    if (!this.readonly && (this.findRole(this.loginedUser, this.enum.roles.MainAdministrator) || this.loginedUser.userID === this.per.userID)) {
        this.pageReadonly = false;
    }

    this.per.birthday = this.per.birthday ? new Date(this.per.birthday) : this.per.birthday;
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
    save() {
      if (this.validate()) {
        this.showMessage("error", this.$t('common.message.fillError'));
        return
      }

      this.loading = true;

      this.service.updateUser(this.per).then(res => {
        this.loading = false;

        this.$emit('personUpdated', this.per)
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
    validate() {
      this.validation.iin = !this.per.IIN || this.per.IIN.length != 12;
      this.validation.firstname = !this.per.firstName || this.per.firstName.length < 1;
      this.validation.lastname =  !this.per.thirdName || this.per.thirdName.length < 1;
      this.validation.birthday = !this.per.birthday || this.per.birthday.id < 1;
      this.validation.email = !this.per.email || this.per.email.length < 1;

      return (this.validation.iin || this.validation.firstname || this.validation.lastname ||
        this.validation.birthday || this.validation.email);
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