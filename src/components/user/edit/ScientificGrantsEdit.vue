<template>
  <div id="carddiv" class="grid">
    <div class="col-12">
      <h3>{{ t('science.scientific_grants') }}</h3>
      <div>
        <Menubar :model="menu"  style="height:36px;margin-top:-7px;margin-left:-14px;margin-right:-14px"></Menubar>
      </div>
    </div>
    <div class="col-12 md:col-12 p-fluid">
        <div class="grid formgrid">
          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ t('common.startDate') }}</label>
            <PrimeCalendar
                class="mt-2"
                :readonly="readonly"
                :class="{'p-invalid': validation.start_date}"
                v-model="payload.start_date"
                :placeholder="t('common.startDate')"
                dateFormat="dd.mm.yy"/>
            <small
                class="p-error"
                v-if="validation.start_date"
            >{{ t("common.requiredField") }}</small>

          </div>

          <div class="col-12 mb-50 pb-2 lg:col-6 mb-lg-0">
            <label>{{ t('common.endDate') }}</label>
            <PrimeCalendar
                class="mt-2"
                :readonly="readonly"
                :class="{'p-invalid': validation.finish_date}"
                v-model="payload.finish_date"
                :placeholder="t('common.endDate')"
                dateFormat="dd.mm.yy"/>
            <small
                class="p-error"
                v-if="validation.finish_date"
            >{{ t("common.requiredField") }}</small>
          </div>

          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>Сумма договора</label>
            <InputNumber
                :readonly="readonly"
                class="mt-2"
                type="text"
                placeholder="Сумма договора"
                v-model="payload.contract_sum"
            ></InputNumber>
          </div>

          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{t('science.project_position')}}</label>
            <Dropdown class="mt-2" :placeholder="t('common.select')" :options="positions" v-model="payload.position" :option-label="'name_' + locale" id="awardType"></Dropdown>
            <small class="p-error" v-if="validation.position">{{ t("common.requiredField") }}</small>
          </div>

          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{t('science.nameTopicInQazaq')}}</label>
            <InputText
                :readonly="readonly"
                class="mt-2"
                :class="{'p-invalid': validation.name_kz}"
                type="text"
                :placeholder="t('science.nameTopicInQazaq')"
                v-model="payload.name_kz"
            ></InputText>
            <small
                class="p-error"
                v-if="validation.name_kz"
            >{{ t("common.requiredField") }}</small>
          </div>

          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{t('science.customerAndSourceInKazakh')}}</label>
            <InputText
                :readonly="readonly"
                class="mt-2"
                :class="{'p-invalid': validation.customer_and_sourse_kz}"
                type="text"
                :placeholder="t('science.customerAndSourceInKazakh')"
                v-model="payload.customer_and_sourse_kz"
            ></InputText>
            <small
                class="p-error"
                v-if="validation.customer_and_sourse_kz"
            >{{ t("common.requiredField") }}</small>
          </div>

          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{t('science.nameTopicInRussian')}}</label>
            <InputText
                :readonly="readonly"
                class="mt-2"
                :class="{'p-invalid': validation.name_ru}"
                type="text"
                :placeholder="t('science.nameTopicInRussian')"
                v-model="payload.name_ru"
            ></InputText>
            <small
                class="p-error"
                v-if="validation.name_ru"
            >{{ t("common.requiredField") }}</small>
          </div>

          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{t('science.customerAndSourceInRussia')}}</label>
            <InputText
                :readonly="readonly"
                class="mt-2"
                :class="{'p-invalid': validation.customer_and_sourse_ru}"
                type="text"
                :placeholder="t('science.customerAndSourceInRussia')"
                v-model="payload.customer_and_sourse_ru"
            ></InputText>
            <small
                class="p-error"
                v-if="validation.customer_and_sourse_ru"
            >{{ t("common.requiredField") }}</small>
          </div>

          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{t('science.nameTopicInEnglish')}}</label>
            <InputText
                :readonly="readonly"
                class="mt-2"
                :class="{'p-invalid': validation.name_en}"
                type="text"
                :placeholder="t('science.nameTopicInEnglish')"
                v-model="payload.name_en"
            ></InputText>
            <small
                class="p-error"
                v-if="validation.name_en"
            >{{ t("common.requiredField") }}</small>
          </div>

          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{t('science.customerAndSourceInEnglish')}}</label>
            <InputText
                :readonly="readonly"
                class="mt-2"
                :class="{'p-invalid': validation.customer_and_sourse_en}"
                type="text"
                :placeholder="t('science.customerAndSourceInEnglish')"
                v-model="payload.customer_and_sourse_en"
            ></InputText>
            <small
                class="p-error"
                v-if="validation.customer_and_sourse_en"
            >{{ t("common.requiredField") }}</small>
          </div>
      </div>

    </div>
  </div>

</template>

<script setup>
import { useI18n } from "vue-i18n";
import { useToast } from "primevue/usetoast";
import { inject, ref, onMounted } from "vue";
import {ScienceService} from "@/service/science.service";

const { t, locale } = useI18n();
const toast = useToast()
const menu= ref([
  {
    label: t('common.save'),
    icon: "pi pi-fw pi-save",
    disabled: () => (payload.value.customer_and_sourse_kz == null ||
        payload.value.customer_and_sourse_en == null || payload.value.name_kz == null ||
        payload.value.name_ru == null || payload.value.name_en == null ||
        payload.value.customer_and_sourse_ru == null || payload.value.start_date == null ||
        payload.value.finish_date == null || payload.value.position == null),
    command: () => {
      create()
    },
  },
])
const validation =ref({
  name_kz: false,
  name_ru: false,
  name_en: false,
  customer_and_sourse_kz: false,
  customer_and_sourse_ru: false,
  customer_and_sourse_en: false,
  start_date: false,
  finish_date: false,
  position: false,
})
const emitter = inject("emitter");

const props = defineProps({
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
const positions = ref([])
const position = ref(null)
const loading =ref(false)
const scienceService = new ScienceService()

const payload = ref({
  id: props.modelValue ? props.modelValue.id : null,
  user_id: props.modelValue ? props.modelValue.user_id  : null,
  name_kz: props.modelValue ? props.modelValue.name_kz : '',
  name_ru: props.modelValue ? props.modelValue.name_ru : '',
  name_en: props.modelValue ? props.modelValue.name_en : '',
  customer_and_sourse_kz: props.modelValue ? props.modelValue.customer_and_sourse_kz : '',
  customer_and_sourse_ru: props.modelValue ? props.modelValue.customer_and_sourse_ru : '',
  customer_and_sourse_en: props.modelValue ? props.modelValue.customer_and_sourse_en : '',
  start_date: props.modelValue ? props.modelValue.start_date : null,
  finish_date: props.modelValue ? props.modelValue.finish_date : null,
  contract_sum: props.modelValue ? props.modelValue.contract_sum : 0,
  position: props.modelValue ? props.modelValue.position : null,
})

const create = () => {
  if (!validateForm()) {
    return
  }

  loading.value = true;
  scienceService.updateScientificGrant(payload.value).then(res => {
    loading.value = false
    toast.add({severity: "success", summary: t('common.success'), life: 3000});
    emitter.emit('scienceSchool', true)
  }).catch(error => {
    // toast.add({severity: 'error', summary: t('common.error'), life: 3000})
    loading.value = false;
  })
}

  const getPositions = () => {
    const req = {}
    scienceService.getScientificGrantPositions(req).then(res => {
      positions.value = res.data.positions
    }).catch(error => {
      loading.value = false;
    })
}

const validateForm = () => {
  validation.value.name_kz = !payload.value.name_kz || payload.value.name_kz == ""
  validation.value.name_ru = !payload.value.name_ru || payload.value.name_ru == ""
  validation.value.name_en = !payload.value.name_en || payload.value.name_en == ""
  validation.value.customer_and_sourse_kz = !payload.value.customer_and_sourse_kz || payload.value.customer_and_sourse_kz == ""
  validation.value.customer_and_sourse_ru = !payload.value.customer_and_sourse_ru || payload.value.customer_and_sourse_ru == ""
  validation.value.customer_and_sourse_en = !payload.value.customer_and_sourse_en || payload.value.customer_and_sourse_en == ""
  validation.value.start_date = !payload.value.start_date || payload.value.start_date == ""
  validation.value.finish_date = !payload.value.finish_date || payload.value.finish_date == ""
  validation.value.position = !payload.value.position || payload.value.position == ""

  return (
      !validation.value.name_kz  &&
      !validation.value.name_ru  &&
      !validation.value.name_en &&
      !validation.value.customer_and_sourse_kz &&
      !validation.value.customer_and_sourse_ru &&
      !validation.value.customer_and_sourse_en &&
      !validation.value.start_date &&
      !validation.value.finish_date &&
      !validation.value.position

  )
}

onMounted(() => {
  getPositions()
})
</script>