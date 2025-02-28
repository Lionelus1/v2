<template>
  
  <div class="col-12">
    <h3>{{ t('common.creationAndEditing') }}</h3>
    <div>
      <Menubar :model="menu" :key="active" style="height:36px;margin-top:-7px;margin-left:-14px;margin-right:-14px"></Menubar>
    </div>
  </div>

  <div class="col-12 md:col-12 p-fluid">
    <div class="card">
      <div class="grid formgrid">
          
        <div class="col-12 mb-2 pb-2 lg:col-4 mb-lg-0">
            <label>{{ t('common.nameInQazaq') }}</label>
            <InputText v-model="payload.name_kz" :placeholder="t('common.nameInQazaq')" class="mb-2" id="name_kz" />
            <small class="p-error" v-if="validation.name_kz">{{ $t("common.requiredField") }}</small>
        </div>
        
        <div class="col-12 mb-2 pb-2 lg:col-4 mb-lg-0">
            <label>{{ t('common.nameInRussian') }}</label>
            <InputText v-model="payload.name_ru" :placeholder="t('common.nameInRussian')" class="mb-2" id="name_ru" />
            <small class="p-error" v-if="validation.name_ru">{{ $t("common.requiredField") }}</small>
        </div>

        <div class="col-12 mb-2 pb-2 lg:col-4 mb-lg-0">
            <label for="name_en">{{ $t('common.nameInEnglish') }}</label>
            <InputText v-model="payload.name_en" :placeholder="t('common.nameInEnglish')" class="mb-2" id="name_en" />
            <small class="p-error" v-if="validation.name_en">{{ $t("common.requiredField") }}</small>
        </div>

      </div>
    </div>
  </div>

</template>

<script setup>
  import {computed, onMounted, ref, defineProps, inject} from "vue";
  import {useI18n} from "vue-i18n";
  import {useToast} from "primevue/usetoast";
  import {ScienceService} from "@/service/science.service";

  const {t, locale} = useI18n()
  const toast = useToast()
  const areaOfInterest = ref(null)
  const loading = ref(false)
  const scienceService = new ScienceService()

  const emitter = inject("emitter");
  const props = defineProps({
      modelValue: {
          type:  Object,
          default: () => ({ 
              id: null, 
              userID: null, 
              name_kz: '',
              name_ru: '',
              name_en: ''
          })
      },
      userID: {
          type: null,
          default: null
      }
  })

  const payload = ref({
      id: props.modelValue ? props.modelValue.id : null, 
      userID: props.userID ? props.userID : null, 
      name_kz: props.modelValue ? props.modelValue.name_kz : '',
      name_ru: props.modelValue ? props.modelValue.name_ru : '',
      name_en: props.modelValue ? props.modelValue.name_en : ''
  })

  const menu= ref([
      {
        label: t("common.save"),
        icon: "pi pi-fw pi-save",
        command: () => {
          createOrUpdateScienceInterests()
        },
        disabled: () => (!payload.value.name_kz || payload.value.name_kz == "")
        || (!payload.value.name_ru || payload.value.name_ru == "")
        || (!payload.value.name_en || payload.value.name_en == "")
      },
    ])
    
  const validation = ref({
      name_kz: false,
      name_ru: false,
      name_en: false
  })   

  const validateForm = () => {
      validation.value.name_kz = !payload.value.name_kz || payload.value.name_kz == ""
      validation.value.name_ru = !payload.value.name_ru || payload.value.name_ru == ""
      validation.value.name_en = !payload.value.name_en || payload.value.name_en == ""
      return (
          !validation.value.name_kz  &&
          !validation.value.name_ru  &&
          !validation.value.name_en
      )
  }

  const getScienceInterests = () => {
    const req = {
      id: payload.value.id,
      userID: payload.value.userID
    }
    loading.value = true;
    scienceService.getScienceInterests(payload.value).then(res => {
      areaOfInterest.value = res.data.interests
      loading.value = false
    }).catch(_ => {
      loading.value = false;
    })
  }

  const createOrUpdateScienceInterests = () => {
    if (!validateForm()) {
      return
    }

    loading.value = true;
    scienceService.createOrUpdateScienceInterests(payload.value).then(res => {
        loading.value = false
        toast.add({severity: "success", summary: t('common.success'), life: 3000});
        emitter.emit('researchInterest', true)
    }).catch(_ => {
      loading.value = false;
    })
  }

  onMounted(() => {
      getScienceInterests()   
  })

</script>