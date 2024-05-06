<template>
  <Dialog :header="$t('workPlan.addPlan')" v-model:visible="showModal" :style="{width: '450px'}" class="p-fluid" @hide="closeBasic">
    <div class="field">
      <label>{{ $t('workPlan.planName') }}</label>
      <InputText v-model="formData.work_plan_name" v-on:keyup.enter="createPlan"/>
    </div>
    <div class="field">
      <label>{{ $t('common.lang') }}</label>
      <Dropdown v-model="formData.lang" :options="languages" optionLabel="name" optionValue="id" :placeholder="$t('common.select')"/>
      <small class="p-error" v-if="submitted && !formData.lang">{{ $t('workPlan.errors.langError') }}</small>
    </div>
    <div class="field">
      <label>{{ $t('workPlan.planType') }}</label>
      <Dropdown v-model="formData.plan_type" :options="types" :optionLabel="'name_' + $i18n.locale" optionValue="id" :placeholder="$t('common.select')"/>
      <small class="p-error" v-if="submitted && !formData.plan_type">{{ $t('common.requiredField') }}</small>
    </div>
    <template v-if="formData.plan_type === 3">
      <div class="field" v-for="(param, index) of params" :key="index">
        <template v-if="param.type === 'text'">
          <label>{{ $t('workPlan.' + param.name) }}</label>
          <InputText v-model="param.value"/>
        </template>
        <template v-if="param.type === 'date'">
          <label>{{ $t('workPlan.' + param.name) }}</label>
          <PrimeCalendar v-model="param.value" dateFormat="dd.mm.yy" showIcon :showButtonBar="true"></PrimeCalendar>
        </template>
        <small class="p-error" v-if="submitted && !param.value">{{ $t('common.requiredField') }}</small>
      </div>
      <div class="field">
        <label>{{ $t('contracts.contract') }}</label>
        <CustomFileUpload @upload="uploadFile($event, 'contractFiles')" v-model="contractFiles" :multiple="false" :button="true"/>
        <small class="p-error" v-if="submitted && !contractFiles">{{ $t('common.requiredField') }}</small>
      </div>
      <div class="field">
        <label>{{ $t('common.doc') }}</label>
        <CustomFileUpload @upload="uploadFile($event, 'documentFiles')" v-model="documentFiles" :multiple="false" :button="true"/>
        <small class="p-error" v-if="submitted && !documentFiles">{{ $t('common.requiredField') }}</small>
      </div>
    </template>
    <template #footer>
      <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button-rounded p-button-danger"
              @click="closeBasic"/>
      <Button :label="$t('common.add')" icon="pi pi-check" class="p-button-rounded p-button-success mr-2"
              :disabled="isDisabled" @click="createPlan"/>
    </template>
  </Dialog>

</template>

<script setup>
import {WorkPlanService} from "@/service/work.plan.service";
import CustomFileUpload from "@/components/CustomFileUpload.vue";
import {computed, onMounted, reactive, ref} from "vue";
import {useToast} from "primevue/usetoast";
import {useI18n} from "vue-i18n";

const props = defineProps(['visible', 'isAdded', 'isSub'])
const emit = defineEmits(['hide']);
const toast = useToast()
const {t} = useI18n()

const showModal = ref(props.visible)
const submitted = ref(false)

const formData = reactive({
  work_plan_name: null,
  lang: null,
  plan_type: null,
  science_params: null
})

const languages = ref([
  {
    id: 1,
    name: 'Қазақ'
  },
  {
    id: 2,
    name: 'Русский'
  },
  {
    id: 3,
    name: 'English'
  }
])
const isDisabled = computed(() => !validate())

const planService = new WorkPlanService()
const types = ref([])
const contractFiles = ref(null)
const documentFiles = ref(null)
const params = ref([
  {
    name: "plancontractname",
    value: null,
    description: "Contract name",
    type: "text"
  },
  {
    name: "plancontractnumber",
    value: null,
    description: "Contract number",
    type: "text"
  },
  {
    name: "plancontractdate",
    value: null,
    description: "Contract date",
    type: "date"
  },
  {
    name: "plancontractprioruty",
    value: null,
    description: "Contract priority",
    type: "text"
  },
  {
    name: "plancontracttopic",
    value: null,
    description: "Contract topic",
    type: "text"
  },
])

const closeBasic = () => {
  emit('hide')
}

const createPlan = () => {
  submitted.value = true;
  if (!validate()) return

  const fd = new FormData()
  formData.science_params = formData.plan_type === 3 ? params.value : null
  fd.append("workplan", JSON.stringify(formData))
  if (contractFiles?.value?.length > 0) {
    for (let file of contractFiles.value) {
      fd.append("contract_files[]", file)
    }
  }

  if (documentFiles?.value?.length > 0) {
    for (let file of documentFiles.value) {
      fd.append("document_files[]", file)
    }
  }
  planService.createPlan(fd).then(res => {
    if (res.data.is_success) {
      toast.add({severity: 'success', summary: t('common.success'), detail: t('workPlan.message.planCreated'), life: 3000});
    } else {
      toast.add({severity: "error", summary: "Create plan error", life: 3000});
    }
    showModal.value = false;
    submitted.value = false;
    closeBasic()
  }).catch(error => {
    toast.add({severity: "error", summary: error, life: 3000});
    submitted.value = false;
  });
}

const uploadFile = (event, name) => {
  switch (name) {
    case 'contractFiles':
      contractFiles.value = event.files;
      break;
    case 'documentFiles':
      documentFiles.value = event.files;
      break;
    default:
      break;
  }
}

const validate = () => {
  let paramValidation = false
  let filesValidation = false
  if (formData.plan_type === 3) {
    params?.value?.forEach(param => {
      if (param.value === null || param.value === '') {
        paramValidation = true
      }
    })

    filesValidation = !((contractFiles.value && contractFiles.value.length !== 0) && (documentFiles.value && documentFiles.value.length !== 0))
  }

  return formData.work_plan_name && formData.lang && formData.plan_type && !paramValidation && !filesValidation;
}

const getWorkPlanTypes = () => {
  planService.getWorkPlanTypes().then(res => {
    types.value = res.data
  }).catch(error => {
    toast.add({severity: "error", summary: error, life: 3000});
  })
}

onMounted(() => {
  getWorkPlanTypes();
})
</script>
