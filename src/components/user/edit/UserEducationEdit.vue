<template>
  <div id="carddiv" class="grid">
    <div class="col-12">
    <h3>{{ $t('hr.crAndUpdEdu') }}</h3>
      <div>
        <Menubar :model="menu" :key="active" style="height:36px;margin-top:-7px;margin-left:-14px;margin-right:-14px"></Menubar>
      </div>
    </div>
    <div class="col-12 md:col-12 p-fluid">
      <div class="card">
        <div class="grid formgrid">

          <!-- Учебное заведение -->
          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ $t('hr.edu.institution') }}<span class="p-error" v-if="!readonly">*</span></label>
            <InputText :readonly="readonly" class="mt-2" type="text" :placeholder="$t('hr.edu.institution')" v-model="academicDegree.institution_name"></InputText>
            <small class="p-error" v-if="validation.institution">{{ $t("common.requiredField") }}</small>
          </div>

          <!-- Адрес учебного заведения -->
          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ $t('hr.edu.institutionAddress') }}<span class="p-error" v-if="!readonly">*</span></label>
            <InputText :readonly="readonly" class="mt-2" type="text" :placeholder="$t('hr.edu.institutionAddress')" v-model="academicDegree.location"></InputText>
            <small class="p-error" v-if="validation.institutionAddress">{{ $t("common.requiredField") }}</small>
          </div>

          <!-- Факультет -->
          <!-- <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ $t('common.faculty') }}</label>
            <InputText :readonly="readonly" class="mt-2" type="text" :placeholder="$t('common.faculty')" v-model="academicDegree.faculty"></InputText>
            <small class="p-error" v-if="validation.faculty">{{ $t("common.requiredField") }}</small>
          </div> -->

          <!-- Специальность -->
          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ $t('common.speciality') }}<span class="p-error" v-if="!readonly">*</span></label>
            <InputText :readonly="readonly" class="mt-2" type="text" :placeholder="$t('common.speciality')" v-model="academicDegree.speciality"></InputText>
            <small class="p-error" v-if="validation.speciality">{{ $t("common.requiredField") }}</small>
          </div>
          
          <!-- Номер диплома -->
          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ $t('hr.ad.diplomaNumber') }}<span class="p-error" v-if="!readonly">*</span></label>
            <InputText :readonly="readonly" class="mt-2" type="text" :placeholder="$t('hr.ad.diplomaNumber')" v-model="academicDegree.diplom_number"></InputText>
            <small class="p-error" v-if="validation.diplomaNumber">{{ $t("common.requiredField") }}</small>
          </div>

          <!-- Год поступления -->
          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ $t('common.startDate') }}<span class="p-error" v-if="!readonly">*</span></label>
            <PrimeCalendar :readonly="readonly" class="mt-2" v-model="academicDegree.start_date" :placeholder="$t('hr.edu.receiptDate')" :dateFormat="'mm.dd.yy'"/>
            <small class="p-error" v-if="validation.receiptDate">{{ $t("common.requiredField") }}</small>
          </div>

          <!-- Год окончания -->
          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{$t('common.endDate')}}</label>
            <PrimeCalendar :readonly="readonly" class="mt-2" v-model="academicDegree.final_date" :placeholder="$t('hr.edu.expirationDate')" :dateFormat="'mm.dd.yy'"/>
            <!-- <small class="p-error" v-if="validation.expirationDate">{{ $t("common.requiredField") }}</small> -->
          </div>

        </div>

        <!-- ФОТО ЗАГРУЗИТЬ-->
        <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
          <FileUpload ref="form" mode="basic" class="mt-2" :customUpload="true" accept="image/*" :class="{'p-invalid': validation.file}" @uploader="upload($event)" :auto="true" v-bind:chooseLabel="$t('ncasigner.chooseFile')"/>
          <InlineMessage severity="info" class="mt-2" show v-if="file">
              {{ $t('ncasigner.chosenFile', {fn: file ? file.name : ""}) }}
          </InlineMessage>
          <small class="p-error"  v-if="validation.file" >{{ $t("common.requiredField") }}</small>
        </div>

      </div>
    </div>
  </div>
</template>
<script setup>

  import api from "@/service/api";
  import {getHeader, smartEnuApi} from "@/config/config";
  import { inject, defineProps, ref } from 'vue';
  import {useI18n} from "vue-i18n";
  import {UserService} from "@/service/user.service"
  import { useToast } from "primevue/usetoast";
  const {t, locale} = useI18n()
  const toast = useToast()
  
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

  const academicDegree = ref(props.modelValue)
  const file = ref(null)
  const userService = new UserService

  const create = () => {
    if (validateForm()) {
      const fd = new FormData();
      fd.append("id", JSON.stringify(academicDegree.value))
      if (file.value !== null) {
        fd.append("idImage", file.value);
      }

      userService.createOrUpdateUserAcademicDegree(fd).then(res  => {
        toast.add({severity: 'success', summary: t('common.success'), life: 3000})
        emitter.emit('academicDegree', true)
      }).catch(err => {
        toast.add({
          summary: t('message.actionError'),
          life: 3000,
          severity: "error",
        })
      })
    }
  };
  
  const upload = (event) =>  {
      file.value = event.files[0];
  }

  const validateForm = ()=> {
    validation.value.institution = !academicDegree.value.institution_name || academicDegree.value.institution_name == ""
    validation.value.institutionAddress = !academicDegree.value.location || academicDegree.value.location == ""
    // validation.value.faculty = !academicDegree.value.faculty || academicDegree.value.faculty == ""
    validation.value.speciality = !academicDegree.value.speciality || academicDegree.value.speciality == ""
    validation.value.receiptDate = !academicDegree.value.start_date || academicDegree.value.start_date == ""
    // validation.value.expirationDate = !academicDegree.value.final_date || academicDegree.value.final_date == ""
    validation.value.diplomaNumber = !academicDegree.value.diplom_number || academicDegree.value.diplom_number == ""
    return (
        !validation.value.institution &&
        !validation.value.institutionAddress &&
        // !validation.value.faculty &&
        !validation.value.speciality &&
        // !validation.value.receiptDate &&
        !validation.value.expirationDate
    )
  }

  const menu= ref([
    {
      label: t("common.save"),
      icon: "pi pi-fw pi-save",
      command: () => {
        create()
      },
    },
  ])
    
</script>
<style>
#carddiv label {
  position: inherit;
}
</style>
