  <template>
    <div id="carddiv" class="grid">
      <div class="col-12">
        <h3>{{ $t('hr.crAndUpdEdu') }}</h3>
        <div>
          <Menubar :model="menu" :key="active" style="height:36px;margin-top:-7px;margin-left:-14px;margin-right:-14px">
          </Menubar>
        </div>
      </div>
      <div class="col-12 md:col-12 p-fluid">
        <div class="card">
          <div class="grid formgrid">
            <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
              <label>{{ $t('hr.edu.institution') }}</label>
              <InputText
                  :readonly="readonly"
                  class="mt-2"
                  type="text"
                  :placeholder="$t('hr.edu.institution')"
                  v-model="payload.institution"
              ></InputText>
              <small
                  class="p-error"
                  v-if="validation.institution"
              >{{ $t("common.requiredField") }}</small>
            </div>
            <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
              <label>{{ $t('hr.edu.institutionAddress') }}</label>
              <InputText
                  :readonly="readonly"
                  class="mt-2"
                  type="text"
                  :placeholder="$t('hr.edu.institutionAddress')"
                  v-model="payload.institutionAddress"
              ></InputText>
              <small
                  class="p-error"
                  v-if="validation.institutionAddress"
              >{{ $t("common.requiredField") }}</small>
            </div>
            <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
              <label>{{ $t('common.faculty') }}</label>
              <InputText
                  :readonly="readonly"
                  class="mt-2"
                  type="text"
                  :placeholder="$t('common.faculty')"
                  v-model="payload.faculty"
              ></InputText>
              <small
                  class="p-error"
                  v-if="validation.faculty"
              >{{ $t("common.requiredField") }}</small>
            </div>
            <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
              <label>{{ $t('common.speciality') }}</label>
              <InputText
                  :readonly="readonly"
                  class="mt-2"
                  type="text"
                  :placeholder="$t('common.speciality')"
                  v-model="payload.speciality"
              ></InputText>
              <small
                  class="p-error"
                  v-if="validation.speciality"
              >{{ $t("common.requiredField") }}</small>
            </div>
            <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
              <label>{{ $t('hr.ad.diplomaNumber') }}</label>
              <InputText
                  :readonly="readonly"
                  class="mt-2"
                  type="text"
                  :placeholder="$t('hr.ad.diplomaNumber')"
                  v-model="payload.diplomaNumber"
              ></InputText>
              <small
                  class="p-error"
                  v-if="validation.diplomaNumber"
              >{{ $t("common.requiredField") }}</small>
            </div>
            <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
              <label>{{ $t('hr.edu.receiptDate') }}</label>
              <PrimeCalendar
                  :readonly="readonly"             
                  class="mt-2"
                  v-model="payload.receiptDate"
                  :placeholder="$t('hr.edu.receiptDate')"
                  :dateFormat="'mm.dd.yy'"/>
              <small
                  class="p-error"
                  v-if="validation.receiptDate"
              >{{ $t("common.requiredField") }}</small>
            </div>
            <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
              <label>{{$t('hr.edu.expirationDate')}}</label>
              <PrimeCalendar
                  :readonly="readonly"             
                  class="mt-2"
                  v-model="payload.expirationDate"
                  :placeholder="$t('hr.edu.expirationDate')"
                  :dateFormat="'mm.dd.yy'"/>
              <small
                  class="p-error"
                  v-if="validation.expirationDate"
              >{{ $t("common.requiredField") }}</small>
            </div>
            <Button :label="$t('common.save')" class="p-button-text" :onclick="create"/>
          </div>
        </div>
      </div>
    </div>
  </template>
  <script setup>
  
  import api from "@/service/api";
  import {getHeader, smartEnuApi} from "@/config/config";
  import { inject, defineProps, ref } from 'vue';

  const props = defineProps({
    modelValue: {
      type: Object,
      default: () => ({
        id: 0,
        institution: null,
        institutionAddress: null,
        faculty: null,
        speciality: null,
        diplomaNumber: null,
        receiptDate: null,
        expirationDate: null
      })
    }
  }) 
  
  const emitter = inject("emitter");
  const validation =  ref({
        institution: false,
        institutionAddress: false,
        faculty: false,
        speciality: false,
        receiptDate: false,
        expirationDate: false,
        diplomaNumber: false
  })

  const payload = ref({
        id: props.modelValue.id,
        userId: props.modelValue.userId,
        institution: props.modelValue.institution,
        speciality: props.modelValue.speciality,
        faculty: props.modelValue.faculty,
        diplomaNumber: props.modelValue.diplomaNumber,
        institutionAddress: props.modelValue.institutionAddress,
        receiptDate: props.modelValue.receiptDate,
        expirationDate: props.modelValue.expirationDate,
    });

  const create = () => {
      // console.log(payload, 'test')
      if (validateForm()) {
        let api = '/account/education/create'
        if (payload.value.id !== 0 && payload.value.id !== undefined)  {
          api = '/account/education/update'
        } 

        api.post(api, payload.value, {headers: getHeader()}).then(res  => {
          emitter.emit('educationUpdated', true)
        }).catch(err => {
          console.log(err)
        })
      }
    };


  const validateForm = ()=> {
      validation.value.institution = !payload.value.institution || payload.value.institution == ""
      validation.value.institutionAddress = !payload.value.institutionAddress || payload.value.institutionAddress == ""
      validation.value.faculty = !payload.value.faculty || payload.value.faculty == ""
      validation.value.speciality = !payload.value.speciality || payload.value.speciality == ""
      validation.value.receiptDate = !payload.value.receiptDate || payload.value.receiptDate == ""
      validation.value.expirationDate = !payload.value.expirationDate || payload.value.expirationDate == ""
      validation.value.diplomaNumber = !payload.value.diplomaNumber || payload.value.diplomaNumber == ""
      return (
          !validation.value.institution &&
          !validation.value.institutionAddress &&
          !validation.value.faculty &&
          !validation.value.speciality &&
          !validation.value.receiptDate &&
          !validation.value.expirationDate
      )
    }

    const formatDate = (dateString) => {
    if (!dateString) return '';
  
    const dateObject = new Date(dateString);
    
    return dateObject.toLocaleDateString();
  };

  </script>
  <style>
  #carddiv label {
    position: inherit;
  }
  </style>
  