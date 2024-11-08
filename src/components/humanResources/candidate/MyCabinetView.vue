<template>

  <div>
    <div v-if="chapter.myAccount == props.customType">
          <h3 style="text-align: center">{{ t('common.personalInfo') }}</h3>
    </div>

    <div class="col-12 md:col-12 p-fluid">
      <div class="card">
        <div class="grid formgrid">
          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ t('contact.fname') }}:</label>
            <InputText class="mt-2" :placeholder="t('contact.fname')" v-model="myAccount.firstName" :readonly="props.readonly"></InputText>
            <small class="p-error" v-if="validation.firstName">{{ t("common.requiredField") }}</small>
          </div>

          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ t('contact.fnameLatin') }}:</label>
            <InputText class="mt-2" :placeholder="t('contact.fnameLatin')" v-model="myAccount.firstnameEn" :readonly="props.readonly"></InputText>
            <small class="p-error" v-if="validation.firstNameEn">{{ t("common.requiredField") }}</small>
          </div>

          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ t('contact.lname') }}:</label>
            <InputText class="mt-2" :placeholder="t('contact.lname')" v-model="myAccount.thirdName" :readonly="props.readonly"></InputText>
            <small class="p-error" v-if="validation.thirdName">{{ t("common.requiredField") }}</small>
          </div>

          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ t('contact.lnameLatin') }}:</label>
            <InputText class="mt-2" :placeholder="t('contact.lnameLatin')" v-model="myAccount.thirdnameEn" :readonly="props.readonly"></InputText>
            <small class="p-error" v-if="validation.thirdNameEn">{{ t("common.requiredField") }}</small>
          </div>

          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ t('contact.sname') }}:</label>
            <InputText class="mt-2" :placeholder="t('contact.sname')" v-model="myAccount.lastName" :readonly="props.readonly"></InputText>
          </div>

          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ t('contact.snameLatin') }}:</label>
            <InputText class="mt-2" :placeholder="t('contact.snameLatin')" v-model="myAccount.lastnameEn" :readonly="props.readonly"></InputText>
          </div>

          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ t('contact.iin') }}:</label>
            <InputText class="mt-2" :placeholder="t('contact.iin')" v-model="myAccount.IIN" readonly></InputText>
            <small class="p-error" v-if="validation.iin">{{ t("common.requiredField") }}</small>
          </div>

          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ t('contact.birthday') }}:</label>
            <PrimeCalendar :readonly="props.readonly" class="mt-2" v-model="myAccount.birthday" :placeholder="t('contact.birthday')" :dateFormat="'mm.dd.yy'"/>
            <small class="p-error" v-if="validation.birthday">{{ t("common.requiredField") }}</small>
          </div>

          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ t('contact.email') }}:</label>
            <InputText class="mt-2" :placeholder="t('contact.email')" v-model="myAccount.email" readonly></InputText>
            <small class="p-error" v-if="validation.email">{{ t("common.requiredField") }}</small>
          </div>

          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ this.t('common.myAddress') }}:</label>
            <InputText class="mt-2" :placeholder="t('common.myAddress')" v-model="myAccount.address" :readonly="props.readonly"></InputText>
            <small class="p-error" v-if="validation.address">{{ t("common.requiredField") }}</small>
          </div>

          <Button v-if="chapter.myAccount == props.customType" :label="t('common.save')" class="p-button-text" :onclick="update"/>
        </div>
      </div>
    </div>

    <div v-if="chapter.scientists == props.customType || findRole(myAccount,'teacher')" customType="myAccount">
      <p style="text-align: center">
        <b><em> {{ t('science.areaScientificInterests') + ' '}}</em></b>
        <Button v-if="!readonly" icon="pi pi-pencil" class="p-button-rounded p-button-outlined" :onclick="editResearchInterestsDetail"></Button>
      </p>

      <div class="mr-2">
        <template v-if="researchInterests && researchInterests.length > 0">
          <div v-for="(interest, index) in researchInterests" :key="index">
            <span style="white-space: pre-line">
              {{ interest['name_kz'] }}
            </span>
          </div>
        </template>
        <em v-else>{{ t('common.noData') }}</em>
      </div>
      <hr>
    </div>

    <div  v-if="chapter.myAccount == props.customType">
        <p style="text-align: center">
          <b><em>{{ t('hr.title.id') + ' '}}</em></b>
          <Button v-if="!readonly" icon="pi pi-pencil" class="p-button-rounded p-button-outlined" :onclick="editIdentificationDetail"></Button>
        </p>
        <hr>
        <span v-if="myAccount" style="white-space: pre-line">
          <b>{{ t('contact.iin') }}:</b> <em>{{ myAccount.IIN + '\n' }}</em>
          <b>{{ t('common.number') }}:</b> <em>{{ myAccount.idnumber + '\n' }}</em>
          <b>{{ t('hr.id.startDate') }}:</b> <em>{{ new Date(myAccount.iddate).toLocaleDateString() + '\n' }}</em>
          <b>{{ t('hr.id.issuedBy') }}:</b> <em>{{ myAccount.idsourceStr + '\n' }}</em> 
          <Button :label="t('hr.title.id')" style="text-align: left" class="p-button-link" @click="showFile(myAccount.idPathFile)" />
        </span>
        <em v-else>{{ t('common.noData') }}</em>
        <hr>
    </div>

    <div>
      <p style="text-align: center">
        <b><em>{{ t('hr.title.education') + ' ' }} </em></b>
        <Button v-if="!readonly" icon="pi pi-pencil" class="p-button-rounded p-button-outlined"
          @click="editEducationDetail()"></Button>
      </p> 
      <em v-if="educations.length === 0">{{ t('common.noData') }}</em>
      <span v-if="educations.length !== 0" style="white-space: pre-line">
        <hr>
        <Timeline style="align-content: flex-start" :value="educations">
          <template #opposite="slotProps">
            <div class="secondary">
              <em>{{ new Date(slotProps.item.receiptDate).getFullYear() }} -
                {{ new Date(slotProps.item.expirationDate).getFullYear() }}</em>
            </div>
          </template>
          <template #content="slotProps">
            <div style="text-align: justify">
              <em>
                  <span style="white-space: pre-line">
                    <b>{{ slotProps.item.institution + ', ' + slotProps.item.institutionAddress + '\n' }}</b>
                    {{
                      slotProps.item.faculty + ', ' +
                      slotProps.item.speciality +
                      ', №' + slotProps.item.diplomaNumber
                    }}
                  </span>
              </em>
              <br>
              <br>
            </div>
          </template>
        </Timeline>
        <hr>
      </span>
    </div>
      
    <div v-if="chapter.scientists == props.customType || findRole(myAccount,'teacher')">
      <p style="text-align: center">
        <b><em>{{ $t('science.laborActivity') + ' '}}</em></b>
        <Button v-if="!readonly" icon="pi pi-pencil" class="p-button-rounded p-button-outlined" :onclick="editLaborActivitsDetail"></Button>
      </p>

      <hr>
      
      <div class="mr-2">
        <em v-if="laborActivities  === null">{{ t('common.noData') }}</em>
      </div>

      <Timeline style="align-content: flex-start" :value="laborActivities">
        
        <template #opposite="slotProps">
          <div class="secondary">
            <em>{{ new Date(slotProps.item.startDate).toLocaleDateString() }} -
              {{ !slotProps.item.isStillWorking ? new Date(slotProps.item.endDate).toLocaleDateString() : $t('hr.we.untilNow') }}</em>
          </div>
        </template>
        
        <template #content="slotProps">
          <div style="text-align: justify">
            <em>
                <span style="white-space: pre-line">
                  <b>{{ slotProps.item.organizationName + ',\n' }}</b>
                  {{
                    slotProps.item.position + ',\n' +
                    slotProps.item.responsibilities
                  }}
                </span>
            </em>
            <br>
            <br>
          </div>
        </template>

      </Timeline>

      <hr>
    
    </div>

    <div v-if="chapter.scientists == props.customType || findRole(myAccount,'teacher')">
      <p style="text-align: center">
        <b><em>{{ $t('science.awardsAndHonors') + ' '}}</em></b>
        <Button v-if="!readonly" icon="pi pi-pencil" class="p-button-rounded p-button-outlined"
                :onclick="editAwardsDetail"></Button>
      </p>

      <hr>
      <Timeline style="align-content: flex-start" :value="awards">
        <template #opposite="slotProps">
          <div class="secondary">
          <em>{{ new Date(slotProps.item.start_time).toLocaleDateString() }}</em>
        </div>
        </template>

        <template #content="slotProps"> 
          <div style="text-align: justify">
            <em>
              <span style="white-space: pre-line">
                <b>{{ slotProps.item.award_type  + '\n' }}</b> 
                {{ slotProps.item.award_name }}
                <Button icon="pi pi-file" style="text-align: left" class="p-button-link" @click="showFile(slotProps.item.upload_path)" />
              </span>
            </em>
          </div>
        </template>
      </Timeline>
      <em v-if="!awards">{{ t('common.noData') }}</em>
      <hr>
    </div>

    <div v-if="chapter.scientists == props.customType || findRole(myAccount,'teacher')">
      <p style="text-align: center">
        <b><em>{{ $t('science.professionalDevelopment') + ' '}}</em></b>
        <Button v-if="!readonly" icon="pi pi-pencil" class="p-button-rounded p-button-outlined" :onclick="editQualificationsDetail"></Button>
      </p>

      <hr>
      <div class="mr-2">
        <em v-if="!qualifications">{{ t('common.noData') }}</em>
      </div>

      <span v-if="qualifications && qualifications.length !== 0" style="white-space: pre-line">
        <DataTable class="p-datatable-sm" selectionMode="single" v-model="qualification"
                  :lazy="true" :value="qualifications" :loading="loading" v-model:selection="qualification">
          <Column field="training_form" :header="$t('science.qualification.trainingForm')"></Column>
          <Column field="country" :header="$t('science.qualification.country')"></Column>
          <Column field="city" :header="$t('science.qualification.city')"></Column>
          <Column field="hours" :header="$t('science.qualification.durationAndScope')"></Column>
          <Column  field="start_date" :header="$t('science.qualification.start')"></Column>
          <Column field="end_date" :header="$t('science.qualification.end')"></Column>
          <Column field="funding_source" :header="$t('science.qualification.fundingSource')"></Column>
          <Column field="proof_document_type" :header="$t('science.qualification.typeSupportingDoc')"></Column>

          <Column>
            <template #body="slotProps">
              <Button icon="pi pi-file" style="text-align: left" class="p-button-link" @click="showFile(slotProps.data.upload_path)" />
            </template>
          </Column>
        </DataTable>
      </span>
      <hr>
      
    </div>

    <div v-if="chapter.myAccount == props.customType" >
      <p style="text-align: center">
          <b><em>{{ t('bank.requisite') + ' ' }} </em></b>
          <Button v-if="!readonly" icon="pi pi-pencil" class="p-button-rounded p-button-outlined" :onclick="editRequisiteDetail"></Button>
      </p> 

      <div class="grid formgrid">
        <span v-if="bank" style="white-space: pre-line">
          <b>{{ t('bank.title2') }}:</b> <em>{{ bank.name + '\n' }}</em>
          <b>{{ t('bank.accnumber') }}:</b> <em>{{ myAccount.bankaccount + '\n' }}</em>
        </span>
      </div>
      
    </div>

  </div>

  <Sidebar v-model:visible="exchange.editMode" position="right" class="p-sidebar-lg" style="overflow-y: scroll">
    <h3>{{exchange.title}}</h3>
    <Menubar :model="menu" :key="active"
             style="height:36px;margin-top:-7px;margin-left:-14px;margin-right:-14px"></Menubar>
    <MyCabinetEdits :section="exchange.section" :modelValue="exchange.modelValue" :user="myAccount" :titleValue="exchange.titleValue"/>
  </Sidebar>

  <Dialog v-model:visible="fileView" :style="{ width: '650px' }" :modal="true">
          <div style="padding: 0 100px">
            <img :src="fileData" style="width: 100%; height: 100%"/>
          </div>
          <template #footer>
            <Button
                v-bind:label="t('common.close')"
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
  import {findRole} from "@/config/config";
  import {ScienceService} from "@/service/science.service";
  import {AccountService} from "@/service/account.service"
  import MyCabinetEdits from "./MyCabinetEdits";
  
  const { t } = useI18n()
  const toast = useToast()
  const accountService = new AccountService()
  const emitter = inject("emitter");
  const myAccount = ref({})
  const educations = ref({})
  const bank = ref({})
  const education = ref(null)
  const fileData = ref(null)
  const fileView = ref(false)
  const scienceService = new ScienceService()
  const researchInterests=ref({})
  const researchInterest = ref(null)
  const loading = ref(false)
  const laborActivities = ref([])
  const awards = ref([])
  const qualifications = ref([])
  const qualification = ref(null)


  const requisiteData = ref(
    {
        userID: null,
        bankaccount: null,
        bank_id: null,
    }
  )

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
      researchInterests: t('science.areaScientificInterests'),
      laborActivity: t('science.laborActivity'),
      awards: t('science.awardsAndHonors'),
      qualifications: t('science.professionalDevelopment')
  }

  const section= {
    education: 'education',
    createEducation: 'createEducation',
    requisite: 'requisite',
    id: 'id',
    researchInterests: 'researchInterests',
    laborActivity: 'laborActivity',
    awards: 'awards',
    qualifications: 'qualifications'
  }

  const props = defineProps({
    id: {
      type: Number,
      default: null,
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

  const chapter = {
    myAccount: 'myAccount',
    scientists: 'scientists',
    viewUser: 'viewUser'
  }

  const validation =  ref({
    firstName: false,
    thirdName: false,
    firstNameEn: false,
    thirdNameEn: false,
    birthday: false,
    email: false,
    address: false
  })

  const editIdentificationDetail = () => {
    exchange.value.title = titles.identificationDetail
    exchange.value.editMode = true
    exchange.value.modelValue = myAccount.value
    exchange.value.section = section.id
  }

  const editEducationDetail = () => {
    exchange.value.editMode = true
    exchange.value.title = titles.education
    exchange.value.modelValue = educations.value
    exchange.value.section = section.education
  }

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

  const editResearchInterestsDetail = () => {
    exchange.value.titleValue = titles.researchInterests
    exchange.value.title = titles.researchInterests

    exchange.value.editMode = true
    exchange.value.modelValue = researchInterests.value
    exchange.value.section = section.researchInterests
  }

  const editLaborActivitsDetail = () => {
    exchange.value.titleValue = titles.laborActivity
    exchange.value.title = titles.laborActivity

    exchange.value.editMode = true
    exchange.value.modelValue = laborActivities.value
    exchange.value.section = section.laborActivity
  }

  const editAwardsDetail= () => {
    exchange.value.titleValue = titles.awards
    exchange.value.title = titles.awards

    exchange.value.editMode = true
    exchange.value.modelValue = awards.value
    exchange.value.section = section.awards
  }

  const editQualificationsDetail = () => {
    exchange.value.titleValue = titles.qualifications
    exchange.value.title = titles.qualifications

    exchange.value.editMode = true
    exchange.value.modelValue = qualifications.value
    exchange.value.section = section.qualifications
  }

  const validateForm = ()=> {
    validation.value.firstName = !myAccount.value.firstName || myAccount.value.firstName == ""
    validation.value.thirdName = !myAccount.value.thirdName || myAccount.value.thirdName == ""
    validation.value.birthday = !myAccount.value.birthday || myAccount.value.birthday == ""
    validation.value.email = !myAccount.value.email || myAccount.value.email == ""
    validation.value.address = !myAccount.value.address || myAccount.value.address == ""
    validation.value.firstNameEn = !myAccount.value.firstnameEn || myAccount.value.firstnameEn == ""
    validation.value.thirdNameEn = !myAccount.value.thirdnameEn || myAccount.value.thirdnameEn == ""
    return (
        !validation.value.firstName &&
        !validation.value.thirdName &&
        !validation.value.iin &&
        !validation.value.birthday &&
        !validation.value.email && 
        !validation.value.address &&
        !validation.value.firstNameEn &&
        !validation.value.thirdNameEn
    )
  }

  const showFile = (data) => {
     if (!data) {
        return
     }
     fileData.value = data
     fileView.value = true
  }

  const getMyAccount= () => {
    const req = {
      id: props.id
    }

    accountService.getMyAccount(req).then(response=>{

      myAccount.value = response.data.user
      educations.value = response.data.educations 
      bank.value =  response.data.user.bank

    }).catch(_ => {
    })
  }

  const update = () => {
    if (!validateForm()) {
      return
    }

    accountService.updateAccount(myAccount.value).then(res  => {
      toast.add({
          severity: "success",
          detail: t('common.dataSavedSuccessfully'),
          life: 3000,
      })

      getMyAccount()
    }).catch(_ => {
      })
  }

  const getScienceInterests = () => {
    const req = {
      id: researchInterest.value ? researchInterest.value.modelValue.userID : null,
      userID: props.id || myAccount.value.userID
    }

    loading.value = true;
    scienceService.getScienceInterests(req).then(res => {
      researchInterests.value = res.data.interests
      loading.value = false
    }).catch(_ => {
      loading.value = false;
    })
  }

  const getLaborActivity=() => {
    const req = {
      userID: props.id || myAccount.value.userID
    }

    loading.value = true
    scienceService.getLaborActivity(req).then(res => {
      laborActivities.value = res.data.laborActivities
      loading.value = false
    }).catch(_ => {
      loading.value=false
    })
  }

  const getScienceAward= () => {
    const req = {
      userID: props.id || myAccount.value.userID
    }
    loading.value = true
    scienceService.getScienceAward(req).then(res => {
        awards.value = res.data.award
        loading.value = false
      }).catch(_ => {
        loading.value=false
      })
  }

  const getQualificationsScience = () => {
    const req = {
      userID: props.id || myAccount.value.userID
    }
    loading.value = true
    scienceService.getQualificationsScience(req).then(res => {
        qualifications.value = res.data.qualifications
        loading.value = false
      }).catch(_ => {
        loading.value=false
      })

  }

  onMounted(() => {
    getMyAccount()
    getScienceInterests()
    getLaborActivity()
    getScienceAward()
    getQualificationsScience()

    emitter.on('educationUpdated', (arg) => {
      exchange.value.editMode = false
      getMyAccount()
      getScienceInterests()
    })

    emitter.on('educationDelete', (data) => {
      getScienceInterests()
    })

    emitter.on('researchInterest', (data) => {
        if (data === true) {
            getScienceInterests()
        }
    })

    emitter.on('educationMyAccount', (data) => {
      if (data === true) {
        getMyAccount()
      }
    });

    emitter.on('experienceScientists', (data) => {
        if (data === true) {
            getLaborActivity();
        }
    });

    emitter.on('award', (data) => {
        if (data === true) {
            getScienceAward()
        }
    });


    emitter.on('qualifications', (data) => {
        if (data === true) {
            getQualificationsScience()
        }
    });
    
    emitter.on('requisite', (data) => {
        if (data === true) {
          getMyAccount()
        }
    });

  })
    
</script>
