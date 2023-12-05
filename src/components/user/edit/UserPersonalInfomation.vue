<template>

    <div class="card">
      <div class="grid formgrid">
          <!-- ИМЯ -->
        <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ t('contact.fname') }}<span class="p-error" v-if="!readonly">*</span></label>
            <InputText class="mt-2" :placeholder="t('contact.fname')" v-model="user.firstName" :readonly="props.readonly" @input="updateUserData"></InputText>
            <small class="p-error" v-if="validation.firstName">{{ t("common.requiredField") }}</small>
        </div>

        <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ t('contact.fnameLatin') }}<span class="p-error" v-if="!readonly">*</span></label>
            <InputText class="mt-2" :placeholder="t('contact.fnameLatin')" v-model="user.firstnameEn" :readonly="props.readonly" @input="updateUserData"></InputText>
            <small class="p-error" v-if="validation.firstNameEn">{{ t("common.requiredField") }}</small>
        </div>

        <!-- ФАМИЛИЯ -->
        <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ t('contact.lname') }}<span class="p-error" v-if="!readonly">*</span></label>
            <InputText class="mt-2" :placeholder="t('contact.lname')" v-model="user.thirdName" :readonly="props.readonly" @input="updateUserData"></InputText>
            <small class="p-error" v-if="validation.thirdName">{{ t("common.requiredField") }}</small>
        </div>

        <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ t('contact.lnameLatin') }}<span class="p-error" v-if="!readonly">*</span></label>
            <InputText class="mt-2" :placeholder="t('contact.lnameLatin')" v-model="user.thirdnameEn" :readonly="props.readonly" @input="updateUserData"></InputText>
            <small class="p-error" v-if="validation.thirdNameEn">{{ t("common.requiredField") }}</small>
        </div>

        <!-- ОТЧЕСТВО -->
        <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ t('contact.sname') }}</label>
            <InputText class="mt-2" :placeholder="t('contact.sname')" v-model="user.lastName" :readonly="props.readonly" @input="updateUserData"></InputText>
        </div>

        <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ t('contact.snameLatin') }}</label>
            <InputText class="mt-2" :placeholder="t('contact.snameLatin')" v-model="user.lastnameEn" :readonly="props.readonly" @input="updateUserData"></InputText>
        </div>

        <!-- ДАТА РОЖДЕНИЯ -->
        <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ t('contact.birthday') }}<span class="p-error" v-if="!readonly">*</span></label>
            <PrimeCalendar :readonly="props.readonly" class="mt-2" v-model="user.birthday" :placeholder="t('contact.birthday')" :dateFormat="'mm.dd.yy'" @input="updateUserData"/>
            <small class="p-error" v-if="validation.birthday">{{ t("common.requiredField") }}</small>
        </div>

        <!-- ЭЛ ПОЧТА -->
        <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ t('contact.email') }}<span class="p-error" v-if="!readonly">*</span></label>
            <InputText class="mt-2" :placeholder="t('contact.email')" v-model="user.email" readonly @input="updateUserData"></InputText>
            <small class="p-error" v-if="validation.email">{{ t("common.requiredField") }}</small>
        </div>

        <!-- АДРЕС -->
        <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ this.t('common.myAddress') }}</label>
            <InputText class="mt-2" :placeholder="t('common.myAddress')" v-model="user.address" :readonly="props.readonly" @input="updateUserData"></InputText>
            <small class="p-error" v-if="validation.address">{{ t("common.requiredField") }}</small>
        </div>

      </div>
    </div>

</template>

<script setup>
  import { useI18n } from "vue-i18n";
  import { useToast } from "primevue/usetoast";
  import { inject, ref, onMounted } from "vue";
  import {UserService} from "@/service/user.service"

  const { t } = useI18n()
  const toast = useToast()
  const user = ref({})
  const emitPersonalInformationUpdate = defineEmits(["personal-information-updated"]);
  const userService = new UserService
  const props = defineProps({
    userID: {
      type: Number,
      default: null,
    },
    modelValue: {
      type: null,
      default: null
    },
    readonly: {
      type: Boolean,
      default: true,
    },
    customType: {
      type: String,
      default: ''
    }
  });
  
  const userID = ref(props.userID)
  
  
  const validation =  ref({
    firstName: false,
    thirdName: false,
    firstNameEn: false,
    thirdNameEn: false,
    birthday: false,
    email: false,
    address: false
  })

  const getUserAccount= () => {
    if (props.modelValue !== null) {
      user.value = props.modelValue
      return
    }
    const req = {
      userID: userID.value
    }
    
    userService.getUserAccount(req).then(response=>{
      user.value = response.data.user
    }).catch(error => {
      toast.add({
        severity: "error",
        summary: t('message.actionError'),
        life: 3000,
      })
    })
  }
  
  const updateUserData = () => {
    emitPersonalInformationUpdate("personal-information-updated", user.value);
  };
  
  onMounted(() => {
    getUserAccount()
  })
</script>