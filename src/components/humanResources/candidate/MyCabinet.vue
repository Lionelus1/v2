<template>
    <div>
        <h3 style="text-align: center">{{ $t('common.personalInfo') }}</h3>
    </div>
    <hr>
    <div>
      <div class="col-12 md:col-12 p-fluid">
        <div class="card">
          <div class="grid formgrid">
            <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
              <label> {{ this.$t('contact.fname') }}: </label>
              <InputText 
              class="mt-2"
              :placeholder="$t('contact.fname')"
              v-model="myAccount.firstName " ></InputText>
              <small
                  class="p-error"
                  v-if="validation.firstName">{{ $t("common.requiredField") }}</small>
            </div>
            <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
              <label> {{ this.$t('contact.lname') }}: </label>
              <InputText
              class="mt-2"
              :placeholder="$t('contact.lname')"
              v-model="myAccount.thirdName"></InputText>
              <small
                    class="p-error"
                    v-if="validation.thirdName">{{ $t("common.requiredField") }}</small>
            </div>
            <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
              <label> {{ this.$t('contact.sname') }}: </label>
              <InputText
              class="mt-2"
              :placeholder="$t('contact.sname')"
              v-model="myAccount.lastName"></InputText>
              <small
                      class="p-error"
                      v-if="validation.lastName">{{ $t("common.requiredField") }}</small>
            </div>
            <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
              <label> {{ this.$t('contact.iin') }}: </label>
              <InputText
              class="mt-2"
              :placeholder="$t('contact.iin')"
              v-model="myAccount.IIN" readonly></InputText>
              <small
                        class="p-error"
                        v-if="validation.iin">{{ $t("common.requiredField") }}</small>
            </div>
            <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
              <label> {{ this.$t('contact.birthday') }}: </label>
              <!-- <InputText v-model="myAccount.birthday"></InputText> -->
              <PrimeCalendar
                :readonly="readonly"             
                class="mt-2"
                v-model="myAccount.birthday"
                :placeholder="$t('contact.birthday')"
                :dateFormat="'mm.dd.yy'"/>
              <small
                class="p-error"
                v-if="validation.birthday">{{ $t("common.requiredField") }}</small>
            </div>
            <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
              <label> {{ this.$t('contact.email') }}: </label>
              <InputText 
              class="mt-2"
              :placeholder="$t('contact.email')"    
              v-model="myAccount.email" readonly></InputText>
              <small
                class="p-error"
                v-if="validation.email">{{ $t("common.requiredField") }}</small>
            </div>
              <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
              <label> {{ this.$t('common.myAddress') }}: </label>
              <InputText 
              class="mt-2"
              :placeholder="$t('common.myAddress')"     
              v-model="myAccount.address"></InputText>
              <small
                  class="p-error"
                  v-if="validation.address">{{ $t("common.requiredField") }}</small>
              </div>
            <Button :label="$t('common.save')" class="p-button-text" :onclick="update"/>
        </div>
    </div>
  </div>
  </div>


  <div>
    <hr>
    <div class="col-12 lg:col-9">
        <p style="text-align: center">
          <b><em>{{ $t('hr.title.id') + ' '}}</em></b>
          <Button v-if="!readonly" icon="pi pi-pencil" class="p-button-rounded p-button-outlined"
                  :onclick="editIdentificationDetail"></Button>
        </p>
        <hr>
        <span v-if="myAccount" style="white-space: pre-line">
           <b>{{ $t('contact.iin') }}:</b> <em>{{ myAccount.IIN + '\n' }}</em>
          <b>{{ $t('common.number') }}:</b> <em>{{ myAccount.idnumber + '\n' }}</em>
          <b>{{ $t('hr.id.startDate') }}:</b> <em>{{ new Date(myAccount.iddate).toLocaleDateString() + '\n' }}</em>
          <b>{{ $t('hr.id.issuedBy') }}:</b> <em>{{ myAccount.idsourceStr + '\n' }}</em> 
          <Button :label="$t('hr.title.id')" style="text-align: left" class="p-button-link" @click="showFile(myAccount.idPathFile)" />
        </span>
        <em v-if="!myAccount">{{ $t('common.noData') }}</em>
      </div>
    <hr>
    <p style="text-align: center">
      <b><em>{{ $t('hr.title.education') + ' ' }} </em></b>
      <Button v-if="!readonly" icon="pi pi-pencil" class="p-button-rounded p-button-outlined"
        @click="createEducationDetail()"></Button>
    </p> 
    <em v-if="educations.length === 0">{{ $t('common.noData') }}</em>
    <span v-if="educations.length !== 0" style="white-space: pre-line">
    <DataTable class="p-datatable-sm" selectionMode="single" v-model="education"
               :lazy="true" :value="educations" :loading="loading" v-model:selection="education">
      <Column field="institution" :header="$t('hr.edu.institution')"></Column>
      <Column field="faculty" :header="$t('common.faculty')"></Column>
      <Column field="institutionAddress" :header="$t('hr.edu.institutionAddress')"></Column>
      <Column field="speciality" :header="$t('common.speciality')"></Column>
      <Column  field="diplomaNumber" :header="$t('common.diplomNumber')"></Column>
      <Column field="expirationDate" :header="$t('hr.edu.receiptDate')">
      </Column>
      <Column field="expirationDate" :header="$t('hr.edu.expirationDate')"></Column>
     

      <Column>
       <template #body="slotProps">
          <Button v-if="!readonly" icon="pi pi-pencil" class="p-button-rounded p-button-outlined"
          @click="education=slotProps.data;editEducationDetail()"></Button>
        </template>
      </Column>

      <Column>
       <template #body="slotProps">
          <Button v-if="!readonly" icon="fa-solid fa-trash" class="p-button-danger"
          @click="education=slotProps.data;deleteEducation()"></Button>
        </template>
      </Column>
    </DataTable>
  </span>
    <hr>
    <p style="text-align: center">
        <b><em>{{ $t('bank.requisite') + ' ' }} </em></b>
        <Button v-if="!readonly" icon="pi pi-pencil" class="p-button-rounded p-button-outlined"
                  :onclick="editRequisiteDetail"></Button>
    </p> 
    <div class="grid formgrid">
           
    <span v-if="bank" style="white-space: pre-line">
      <b>{{ $t('bank.title2') }}:</b> <em>{{ bank.name + '\n' }}</em>
      <b>{{ $t('bank.accnumber') }}:</b> <em>{{ myAccount.bankaccount + '\n' }}</em>
    </span>
  </div>
  </div>
  <Sidebar v-model:visible="exchange.editMode" position="right" class="p-sidebar-lg" style="overflow-y: scroll">
    <MyCabinetEdit :section="exchange.section" :modelValue="exchange.modelValue" :titleValue="exchange.titleValue"/>
  </Sidebar>

  <Dialog v-model:visible="fileView" :style="{ width: '650px' }" :modal="true">
          <div style="padding: 0 100px">
            <img :src="fileData" style="width: 100%; height: 100%"/>
          </div>
          <template #footer>
            <Button
                v-bind:label="$t('common.close')"
                icon="pi pi-times"
                class="p-button p-component p-button-primary"
                @click="fileView = false" />
          </template>
        </Dialog>

</template>

<script setup>

  import { useI18n } from "vue-i18n";
  import { useToast } from "primevue/usetoast";
  import { inject, ref, onMounted } from "vue";
  import ResumeService from "./ResumeService";
  import MyCabinetEdit from "./MyCabinetEdit";
  import {getHeader, smartEnuApi} from "@/config/config";
  import axios from "axios";
  import { format } from 'date-fns';

  const { t } = useI18n()
  const toast = useToast()
  const resumeService = new ResumeService()
  const emitter = inject("emitter");
  // const myCabinetEdit = new MyCabinetEdit()

  const myAccount = ref({})
  const educations = ref({})
  const bank = ref({})
  const education = ref(null)
  const fileData = ref(null)
  const fileView = ref(false)
  const validation =  ref({
        firstName: false,
        thirdName: false,
        lastName: false,
        birthday: false,
        email: false,
        address: false
  })
  

  const exchange = ref({
    editMode: false,
    title: null,
    section: null,
    modelValue: null,
    titleValue: null,
  })  

  const  titles = {
      education: t('hr.title.education'),
      identificationDetail: t('hr.title.id'),
      equisiteDetail: t('bank.requisite'),
    }

  const identificationDetail = ref(null)

  const check = (data) => {
      console.log(data, 'data')
  }

  const section= {
    education: 'education',
    createEducation: 'createEducation',
    requisite: 'requisite',
    id: 'id',
  }

  const getMyAccount= () => {
    axios.get(
          smartEnuApi + "/account/getMyAccount",
          {headers: getHeader()}
    ).then(response=>{
      myAccount.value = response.data.user
      educations.value = response.data.educations 
      bank.value =  response.data.user.bank
    }).catch(error => {
      toast.add({
        severity: "error",
        summary: error,
        life: 3000,
      })
    })
  }

  const editIdentificationDetail = () => {
    exchange.value.title = titles.identificationDetail
    exchange.value.editMode = true
    exchange.value.modelValue = myAccount.value
    exchange.value.section = section.id
  }

  const editEducationDetail = () => {
    exchange.value.editMode = true
    exchange.value.title = titles.education
    exchange.value.modelValue = education.value
    exchange.value.section = section.education
  }

  const createEducationDetail = () => {
    exchange.value.editMode = true
    exchange.value.title = titles.education
    exchange.value.modelValue = {}
    exchange.value.section = section.createEducation
  }

  const requisiteData = ref(
    {
        userID: null,
        bankaccount: null,
        bank_id: null,
    }
  )

  const editRequisiteDetail = () => {
    exchange.value.editMode = true
    exchange.value.title = titles.equisiteDetail
    requisiteData.value.userID = myAccount.value.userID
    requisiteData.value.bank_id = bank.value.id
    requisiteData.value.bankaccount = myAccount.value.bankaccount
    requisiteData.value.name = bank.value.name

    exchange.value.modelValue = requisiteData.value
    exchange.value.section = section.requisite
  }


  const formatDate = (dateString) => {
    if (!dateString) return '';
  
    const dateObject = new Date(dateString);
    
    return dateObject.toLocaleDateString();
  };

  const deleteEducation = () => {
    const data = {
      id: Number(education.value.id),
      userId: Number(myAccount.value.userID)
    }
    axios.post(smartEnuApi + "/account/education/delete/id", data, {headers: getHeader()}).then(res  => {
      getMyAccount()
    }).catch(err => {
        this.$toast.add({
        severity: "error",
        summary: err,
        life: 3000,
    })
    })
  }

  const validateForm = ()=> {
      validation.value.firstName = !myAccount.value.firstName || myAccount.value.firstName == ""
      validation.value.thirdName = !myAccount.value.thirdName || myAccount.value.thirdName == ""
      validation.value.lastName = !myAccount.value.lastName || myAccount.value.lastName == ""
      validation.value.birthday = !myAccount.value.birthday || myAccount.value.birthday == ""
      validation.value.email = !myAccount.value.email || myAccount.value.email == ""
      validation.value.address = !myAccount.value.address || myAccount.value.address == ""
      return (
          !validation.value.firstName &&
          !validation.value.thirdName &&
          !validation.value.lastName &&
          !validation.value.iin &&
          !validation.value.birthday &&
          !validation.value.email && 
          !validation.value.address
      )
    }

  const update = () => {
    if (!validateForm()) {
      return
    }

    axios.post(smartEnuApi + "/account/info/update", myAccount.value, {headers: getHeader()}).then(res  => {
      getMyAccount()
    }).catch(err => {
      console.log(err)
    })
  }

  const showFile = (data) => {
     if (!data) {
        return
     }
     fileData.value = data
     fileView.value = true
  }

  onMounted(() => {
    getMyAccount()

    emitter.on('educationUpdated', (arg) => {
      exchange.value.editMode = false
      getMyAccount()
    })
  })
    
</script>