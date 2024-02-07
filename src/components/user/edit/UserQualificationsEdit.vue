<template>
    <div v-if="!loading" id="carddiv" class="grid">
      <div class="col-12">
        <h3>{{ t('science.professionalDevelopment') }}</h3>
        <div>
          <Menubar :model="menu" :key="active"
          style="height:36px;margin-top:-7px;margin-left:-14px;margin-right:-14px"></Menubar>
        </div>
      </div>
        
      <div class="col-12 md:col-12 p-fluid">
          <div class="card">
            <div class="grid formgrid">
                
              <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
                  <label>{{ t('science.qualification.trainingForm') }}</label>
                  <Dropdown class="mt-2" :options="trainingForm" v-model="payload.training_form" :option-label="'name_' + locale" :placeholder="t('science.qualification.trainingForm')" @change="selectTrainingForm" />                       
                  <small class="p-error" v-if="validation.training_form">{{ $t("common.requiredField") }}</small>
              </div>

              <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
                  <label>{{ t('science.qualification.country') }}</label>
                  <InputText  :readonly="readonly"  class="mt-2"  type="text" :placeholder="t('science.qualification.country')" v-model="payload.country"></InputText>
                  <small class="p-error" v-if="validation.country">{{ $t("common.requiredField") }}</small>
              </div>

              <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
                  <label>{{ t('science.qualification.city') }}</label>
                  <InputText  :readonly="readonly"  class="mt-2"  type="text" :placeholder="t('science.qualification.city')" v-model="payload.city"></InputText>
                  <small class="p-error" v-if="validation.city">{{ $t("common.requiredField")}}</small>
              </div>

              <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
                  <label>{{ t('science.qualification.durationAndScope') }}</label>
                  <InputText  :readonly="readonly"  class="mt-2" :min="0"  type="number" :placeholder="t('science.qualification.durationAndScope')" v-model="payload.hours"></InputText>
                  <small class="p-error" v-if="validation.hours">{{ $t("common.requiredField")}}</small>
              </div>

              <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
                  <label>{{ t('science.qualification.start') }}</label>
                  <PrimeCalendar class="mt-2" :class="{'p-invalid': payload.start_date}" :placeholder="$t('hr.id.startDate')" v-model="payload.start_date" dateFormat="dd.mm.yy"/>
                  <small class="p-error" v-if="validation.start_date">{{ $t("common.requiredField")}}</small>
              </div>
              

              <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
                <label>{{ t('science.qualification.end') }}</label>
                <PrimeCalendar class="mt-2" :class="{'p-invalid': payload.end_date}" :placeholder="$t('common.endDate')" v-model="payload.end_date" dateFormat="dd.mm.yy"/>
                <small class="p-error" v-if="validation.end_date">{{ $t("common.requiredField")}}</small>
              </div>

              <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
                <label>{{ t('science.qualification.fundingSource') }}</label>
                <Dropdown :options="fundingSource" v-model="payload.funding_source" :option-label="'name_' + locale" :placeholder="t('science.qualification.fundingSource')" @change="selectFundingSource" />                       
                <small class="p-error" v-if="validation.funding_source">{{ $t("common.requiredField")}}</small>
              </div>
              
              <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
                  <label>{{ t('science.qualification.typeSupportingDoc') }}</label>
                  <Dropdown :options="proofDocumentType" v-model="payload.proof_document_type" :option-label="'name_' + locale" :placeholder="t('science.qualification.typeSupportingDoc')" @change="selectProfDocumentType" />                       

                  <small class="p-error" v-if="validation.proof_document_type">{{ $t("common.requiredField")}}</small>
              </div>

              <div class="p-field">
                  <label for="uploadIcon">{{ $t('ncasigner.chooseFile') }}</label>
                  <FileUpload ref="form" :placeholder="t('ncasigner.chooseFile')" :customUpload="true" mode="basic" accept="image/*"  @uploader="onIconUpload($event)" :auto="true"  v-bind:chooseLabel="$t('ncasigner.chooseFile')"/>
                  <InlineMessage severity="info" class="mt-2" show v-if="file">
                      {{ $t('ncasigner.chosenFile', {fn: file ? file.name : ""}) }}
                  </InlineMessage>
                  <small class="p-error" v-if="validation.upload_path">{{ $t("common.requiredField") }}</small>
              </div>

            </div>
          </div>
      </div>
  
    </div>
    
</template>
<script setup>

  import {computed, onMounted, ref, defineProps, inject, popScopeId} from "vue";
  import {useI18n} from "vue-i18n";
  import {useToast} from "primevue/usetoast";
  import {useRouter} from "vue-router";
  import {useConfirm} from "primevue/useconfirm";
  import {ScienceService} from "@/service/science.service";

  const {t, locale} = useI18n()
  const toast = useToast()
  const router = useRouter()
  const confirm = useConfirm()
  const loading = ref(false)
  const scienceService = new ScienceService()
  const file = ref(null)
  const emitter = inject("emitter");
  const fundingSource = ref([])
  const trainingForm = ref([])
  const proofDocumentType = ref([])

  const props = defineProps({
    modelValue: {
      type: Object,
      default: () => ({
        id: null,
        userID:null,
        training_form: {},
        country: null,
        city: null,
        start_date: null,
        end_date: null,
        hours: 0,
        funding_source: {},
        proof_document_type: {},
        upload_path: null
      })
      }
  })

  const payload = ref({
      id: props.modelValue.id,
      userID:props.modelValue.userID,
      training_form: props.modelValue.training_form,
      country: props.modelValue.country,
      city: props.modelValue.city,
      start_date: props.modelValue.start_date,
      end_date: props.modelValue.end_date,
      hours: props.modelValue.hours,
      funding_source: props.modelValue.funding_source,
      proof_document_type: props.modelValue.proof_document_type,
      upload_path: props.modelValue.upload_path
  })

  const validation = ref({
      id: false,
      userID:false,
      training_form: false,
      country: false,
      city: false,
      start_date: false,
      end_date: false,
      hours: false,
      funding_source: false,
      proof_document_type: false,
      upload_path: false
  })  

  const validateForm = () => {
    validation.value.training_form = !payload.value.training_form || payload.value.training_form == ""
    validation.value.country = !payload.value.country || payload.value.country == "" 
    validation.value.city = !payload.value.city || payload.value.city == ""
    validation.value.start_date = !payload.value.start_date || payload.value.start_date == ""
    validation.value.end_date = !payload.value.end_date || payload.value.end_date == ""
    validation.value.hours = !payload.value.hours || payload.value.hours == 0
    validation.value.funding_source = !payload.value.funding_source || payload.value.funding_source == ""
    validation.value.proof_document_type = !payload.value.proof_document_type || payload.value.proof_document_type == ""
    validation.value.upload_path = !file.value || file.value == ""
    return (
      !validation.value.training_form &&
      !validation.value.country && 
      !validation.value.city &&
      !validation.value.start_date &&
      !validation.value.end_date &&
      !validation.value.hours &&
      !validation.value.funding_source &&
      !validation.value.proof_document_type &&
      !validation.value.upload_path 
    )
  }

  const menu= ref([{
      label: t("common.save"),
      icon: "pi pi-fw pi-save",
      command: () => {
        create()
      },
      disabled: () => (!payload.value.training_form || payload.value.training_form == "")
      || (!payload.value.country || payload.value.country == "")
      || (!payload.value.city || payload.value.city == "")
      || (!payload.value.start_date || payload.value.start_date == "")
      || (!payload.value.end_date || payload.value.end_date == "")
      || (!payload.value.hours || payload.value.hours == 0)
      || (!payload.value.funding_source || payload.value.funding_source == "")
      || (!payload.value.proof_document_type || payload.value.proof_document_type == "")
      || (!file.value || file.value == "")
    },
  ])

  const create = () => {
    if (!validateForm()) {
        return
    }
    loading.value = true;
    const fd = new FormData();
    payload.value.hours = parseInt(payload.value.hours, 10)
    fd.append("id", JSON.stringify(payload.value))
    fd.append("idImage", file.value);  

    scienceService.createOrUpdateQualificationsScience(fd).then(res  => {
        toast.add({severity: "success", summary: t('common.success'), life: 3000});
        emitter.emit('qualifications', true)
      }).catch(err => {
        toast.add({severity: 'error', summary: t('common.error'), life: 3000})
      })
    
  }

  const getSourceOfFinance = () => {
    loading.value = true;

    scienceService.getSourceOfFinance().then(res => {
      fundingSource.value = res.data.funding_source;

        if (payload.value.funding_source) {
            selectFundingSource(); 
        }else {
            payload.value.funding_source = {}
        }

        loading.value = false;
      }).catch(err => {
          loading.value = false;
          toast.add({ severity: 'error', summary: t('common.error'), life: 3000 });
      });
  }

  const getQualificationForms = () => {
    loading.value = true;
    scienceService.getQualificationForms().then(res => {
      trainingForm.value = res.data.training_form;

        if (payload.value.training_form) {
          selectTrainingForm(); 
        }else {
            payload.value.training_form = {}
        }

        loading.value = false;
      }).catch(err => {
          loading.value = false;
          toast.add({ severity: 'error', summary: t('common.error'), life: 3000 });
      });
  }

  const getProfDocumentType = () => {
    loading.value = true;
    scienceService.getProfDocumentType().then(res => {
      proofDocumentType.value = res.data.proof_document_type;

        if (payload.value.proof_document_type) {
          selectProfDocumentType(); 
        }else {
            payload.value.proof_document_type = {}
        }

        loading.value = false;
      }).catch(err => {
          loading.value = false;
          toast.add({ severity: 'error', summary: t('common.error'), life: 3000 });
      });
  }

  const selectFundingSource = () => {
    if (payload.value.funding_source && fundingSource) {
      const selectedFundingSource = fundingSource.value.find(type => type.id === payload.value.funding_source.id)

      if (selectedFundingSource) {
          payload.value.funding_source = selectedFundingSource;
      } else {
          console.error("Selected award type not found in awardTypes array");
      }
    }
  }

  const selectTrainingForm = () => {
    if (payload.value.training_form) {
      const selectedtrainingForm = trainingForm.value.find(type => type.id === payload.value.training_form.id)

      if (selectedtrainingForm) {
          payload.value.training_form = selectedtrainingForm;
      } else {
          console.error("Selected award type not found in awardTypes array");
      }
    }
  } 

  const selectProfDocumentType = () => {
    if (payload.value.proof_document_type) {
      const selectedproofDocumentType = proofDocumentType.value.find(type => type.id === payload.value.proof_document_type.id)

      if (selectedproofDocumentType) {
          payload.value.proof_document_type = selectedproofDocumentType;
      } else {
          console.error("Selected award type not found in awardTypes array");
      }
    }
  }

  const onIconUpload = (event) => {
      console.log(event)
      file.value = event.files[0];
  };

  onMounted(() => {
    getQualificationForms()
    getSourceOfFinance()
    getProfDocumentType()

  })


</script>