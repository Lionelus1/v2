<template>
  <div v-if="loading">
    
    <div class="flex flex-col items-center justify-center">
      <!-- ФОТО -->
      <div>
        <img class="round mr-2 card_img" v-if="user.photo != null && user.photo !=''" :src="'data:image/jpeg;base64,' + user.photo" />
        <img class="round" v-else src="assets/layout/images/default-user.jpg" />
      </div>
  
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
    
        <!-- ЭЛ ПОЧТА -->
        <div class="col-12 mb-2 mt-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ t('contact.email') }}<span class="p-error" v-if="!readonly">*</span></label>
            <InputText class="mt-2" :placeholder="t('contact.email')" v-model="user.email" :readonly="customType != 'createUser'" @input="updateUserData"></InputText>
            <small class="p-error" v-if="validation.email">{{ t("common.requiredField") }}</small>
        </div>
  
        <!-- Пароль -->
        <div v-if="customType == 'viewUser' || customType == 'createUser'" class="col-12 mb-2 mt-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ t("common.password") }}<span class="p-error" v-if="customType == 'createUser'">*</span></label>
            <span class="p-input-icon-right mt-2">
              <Password
                @input="updateUserData"
                :readonly="readonly"
                type="text"
                v-model="user.password"
              ></Password>
              <i class="pi pi-key" style="cursor: pointer;" @click="generatePassword" />
            </span>
        </div>

        <!-- Текущая должность -->
        <!-- <div class="col-12 mb-2 mt-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ t('science.currentPosition') }}</label>
            <InputText class="mt-2 gray-background" :placeholder="t('science.currentPosition')" :value="user && getPosition(user.mainPosition)" :readonly="true" @input="updateUserData"></InputText>
        </div>
   -->
        <div class="col-12 mb-2 mt-2 pb-2 lg:col-6 mb-lg-0">
            <label
              >{{ t("contact.position")
              }}</label
            >
            <PositionsList 
              class="mt-2"
              :readonly="!findRole(currentUser, 'main_administrator')"
              v-model="user.mainPosition"
            ></PositionsList>
          </div>

        <div v-if="(user && user.academicDegree || user.academicTitle) || customType === 'scientists'" class="col-12 mb-2 mt-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ t('science.academicDegAndAcademicTit')}}</label>
            <InputText class="mt-2 gray-background" :placeholder="t('science.academicDegAndAcademicTit')" :value="getCombinedDegreeAndTitle()" :readonly="true" @input="updateUserData"></InputText>
        </div>


        <div v-if="customType === 'myAccount' || customType === 'viewUser' || customType === 'createUser'" class="col-12 mb-2 mt-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ t("common.workPlace")}}</label>
            <span class="p-input-icon-right mt-2"> 
              <i class="pi pi-id-card" v-if="user.mainPosition && user.mainPosition.organization && user.mainPosition.organization.id > 0" 
                style="right: 2.5rem;" @click="openorganizationCard"></i>
              <i class="pi pi-ellipsis-h" v-if="findRole(currentUser, 'main_administrator')" style="right: 1;" @click="openorganizationList"></i>
              <InputText :readonly="true" type="text" :value="getOrganizationName()"></InputText>
            </span> 
        </div>
        <!-- {{ user.mainPosition.organization }} -->
        <!-- ДАТА РОЖДЕНИЯ -->
        <div class="col-12 mb-2 mt-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ t('contact.birthday') }}</label>
            <PrimeCalendar :readonly="props.readonly" class="mt-2" v-model="user.birthday" :placeholder="t('contact.birthday')" :dateFormat="'mm.dd.yy'" @input="updateUserData"/>
        </div>
  
        <!-- АДРЕС -->
        <div class="col-12 mb-2 mt-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ t('common.myAddress') }}</label>
            <InputText class="mt-2" :placeholder="t('common.myAddress')" v-model="user.address" :readonly="props.readonly" @input="updateUserData"></InputText>
            <small class="p-error" v-if="validation.address">{{ t("common.requiredField") }}</small>
        </div>
  
        <!-- ТЕЛЕФОН НОМЕР -->
        <div v-if="customType === 'myAccount' || customType === 'viewUser' || customType === 'createUser'" class="col-12 mb-2 mt-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ t('contact.phone') }}</label>
            <InputText class="mt-2" :placeholder="t('common.myAddress')" v-model="user.phoneNumber" :readonly="props.readonly" @input="updateUserData"></InputText>
            <small class="p-error" v-if="validation.address">{{ t("common.requiredField") }}</small>
        </div>
        
          <!-- Пол -->
           <div v-if="customType === 'myAccount' || customType === 'viewUser' || customType === 'createUser'" class="col-12 mb-2 mt-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ t("contact.gender") }}</label>
            <Dropdown
              class="mt-2"
              v-model="user.gender"
              :options="gender"
              :optionLabel="locale"
              optionValue="id"
              :placeholder="t('contact.gender')"
              :disabled="readonly"
              @input="updateUserData"
            />
        </div>
  
      </div>
    </div>
    <Sidebar v-model:visible="organizationCard" position="right" class="p-sidebar-lg">
      <OrganizationPage :organization="user?.mainPosition?.organization" :sidebar="true"/>
    </Sidebar>

    <Sidebar v-model:visible="organizationList" position="right" class="p-sidebar-lg">
    <div class="flex flex-column" style="width: 100%; height: 100%;">
      <OrganizationList :sidebar="true" @organizationSelected="organizationSelected"></OrganizationList>
    </div>
  </Sidebar>
  </div>

</template>

<script setup>
  import {useI18n} from "vue-i18n";
  import { useToast } from "primevue/usetoast";
  import { inject, ref, onMounted, toHandlers } from "vue";
  import {UserService} from "@/service/user.service"
  import ContragentSelectOrg from "@/components/contragent/ContragentSelectOrg.vue"
  import OrganizationPage from "@/components/contragent/v2/OrganizationPage"
  import ContragentSelectV2 from "../../contragent/v2/ContragentSelectV2.vue";
  import OrganizationList from "../../contragent/v2/OrganizationList"
  import { findRole } from "@/config/config";
  import PositionsList from "../../smartenu/PositionsList.vue";

  const {t, locale} = useI18n()
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
  const loading = ref(false)
  
  const validation =  ref({
    firstName: false,
    thirdName: false,
    firstNameEn: false,
    thirdNameEn: false,
    birthday: false,
    email: false,
    address: false
  })
  const gender = [
    { id: 1, kz: "еркек", ru: "мужчина", en: "Male" },
    { id: 2, kz: "әйел", ru: "женщина", en: "Female" },
  ]
  const organizationCard = ref(false)
  const organizationList = ref(false)
  const currentUser = ref(null)



  const getUserAccount= () => {
    // loading.value = true
    if (props.modelValue !== null) {
      user.value = props.modelValue
      user.value.password = ''
      if (user.value.birthday) {
        const dateObject = new Date(user.value.birthday);
        
        const formattedBirthday = `${(dateObject.getMonth() + 1).toString().padStart(2, '0')}.${dateObject.getDate().toString().padStart(2, '0')}.${dateObject.getFullYear().toString().padStart(4, '0')}`;

        user.value.birthday = formattedBirthday;
      }

      if (user.value.mainPosition == undefined) {
        user.value.mainPosition = {}
        user.value.mainPosition.organization = {}
      }

      loading.value = true
      return
    }
    const req = {
      userID: userID.value
    }

    userService.getUserAccount(req).then(response=>{
      user.value = response.data.user
      if (user.value.birthday) {
        const dateObject = new Date(user.value.birthday);

        // Format the birthday in "mm.dd.yyyy" format
        const formattedBirthday = `${(dateObject.getMonth() + 1).toString().padStart(2, '0')}.${dateObject.getDate().toString().padStart(2, '0')}.${dateObject.getFullYear().toString().padStart(4, '0')}`;

        user.value.birthday = formattedBirthday;
      }
      user.value.password = ''
      if (user.value.mainPosition == undefined) {
        user.value.mainPosition = null
        user.value.mainPosition.organization = null
      }
      loading.value = true
    }).catch(error => {
      loading.value = true
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
  
  const formatBirthday = (userBirthday) => {
    if (userBirthday) {
        const dateObject = new Date(userBirthday);
        
        const formattedDate = dateObject.toLocaleDateString();
        
        return formattedDate;
    } else {
        return;
    }
  }

  const getPosition = (position) => {

    if (position) {
      if (position.namekz) {
        const propertyName = 'name' + locale.value;
        const capitalizedPropertyName = capitalize(t(position[propertyName]))
      
  
        return capitalizedPropertyName
      } else if (position.name) {
        return capitalize(position.name)
      } else {
        return ''
      }
    } else {
      return '';
    }
  }

  const capitalize = (str) => {
    if (typeof str !== 'string') return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const getCombinedDegreeAndTitle = () => {
      const degree = (user.value && user.value.academicDegree) ? capitalize(t(user.value.academicDegree['name'+locale.value])) : '';
      const title = (user.value && user.value.academicTitle) ? capitalize(t(user.value.academicTitle['name'+locale.value])) : '';

      if (degree && title) {
      return `${degree}, ${title}`.trim();
      } else if (degree) {
          return degree.trim();
      } else if (title) {
          return title.trim();
      } else {
          return ''; 
      }

  }

  const generatePassword = () => {
      var generator = require("generate-password");
      user.value.password = generator.generate({
        length: 10,
        numbers: true,
        symbols: true,
      });
  }

  const openorganizationCard = () => {
    organizationCard.value = true
  } 

  const openorganizationList = () => {
    organizationList.value = true
  } 

  const closeorganizationList = () => {
    organizationList.value = false
  } 

  const organizationSelected = (event) => {
    user.value.mainPosition.organization = JSON.parse(JSON.stringify(event));
    closeorganizationList();
  }

    const getOrganizationName = () => {
      if (!user.value || !user.value || !user.value.mainPosition || !user.value.mainPosition.organization) {
          return null;
      }

      const organization = user.value.mainPosition.organization;
      const form = organization.form;

      let name = '';

      switch (locale.value) {
          case 'kz':
              name = localizedOrganizationName(organization.name, form?.shortname);
              break;
          case 'ru':
              name = localizedOrganizationName(organization.nameru, form?.shortnameru);
              break;
          case 'en':
              name = localizedOrganizationName(organization.name, form?.shortname);
              break;
          default:
              name = organization.name || '';
              break;
      }

      return name;
  };

  const localizedOrganizationName = (name, shortname) => {
      return name && name.length > 0 ? (shortname ? `"${shortname}" ${name}` : name) : '';
  };

  onMounted(() => {
    currentUser.value = JSON.parse(localStorage.getItem("loginedUser"));
    getUserAccount()
  })
</script>

<style scoped>
  .card_img{
    width: 200px;
    max-height: 200px;
    height: auto;
  }
  :deep(.p-dataview .p-dataview-content){
    background: transparent;
  }
  .p-input-icon-right > i {
  font-size: large;
  top: 0.5rem;
  height: 100%;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  display: flex;
  align-items: center;
}
.p-input-icon-right > .p-inputtext {
  padding-right: 5rem;
}
.p-input-icon-right > i:hover {
  background-color: #edf0f5;
}


  @media only screen and (min-width: 320px) and (max-width: 600px) {
    .grid.formgrid {
      grid-template-columns: repeat(1, 1fr);
    }

    .col-12 {
      width: 100%;
    }

    .flex.flex-col {
      flex-direction: column;
      align-items: center;
    }

    .card_img {
      order: -1;
      margin-bottom: 1rem; 
    }
  }

  

</style>