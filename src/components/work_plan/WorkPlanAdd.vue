<template>
  <Dialog :header="$t('workPlan.addPlan')" v-model:visible="showModal" :style="{width: '450px'}" class="p-fluid"
          @hide="closeBasic">
    <div class="field">
      <label>{{ $t('workPlan.planName') }}</label>
      <InputText v-model="formData.work_plan_name" v-on:keyup.enter="createPlan"/>
    </div>
    <div class="field">
      <label>{{ $t('common.lang') }}</label>
      <Dropdown v-model="formData.lang" :options="languages" optionLabel="name" optionValue="id"
                :placeholder="$t('common.select')"/>
      <small class="p-error" v-if="submitted && !formData.lang">{{ $t('workPlan.errors.langError') }}</small>
    </div>
    <div class="field">
      <label>{{ $t('workPlan.planType') }}</label>
      <Dropdown v-model="formData.plan_type" :options="types" :optionLabel="'name_' + $i18n.locale" optionValue="id"
                :placeholder="$t('common.select')"/>
      <small class="p-error" v-if="submitted && !formData.plan_type">{{ $t('common.requiredField') }}</small>
    </div>

    <DocParams :params="params"></DocParams>

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
import {DocService} from "@/service/doc.service";
import DocParams from "@/components/DocParams.vue";
import {computed, onMounted, reactive, ref, watch} from "vue";
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
const docService = new DocService()
const types = ref([])
const params = ref(null)

const closeBasic = () => {
  emit('hide')
}

const createPlan = () => {
  submitted.value = true;
  if (!validate()) return

  const fd = new FormData()
  formData.science_params = params.value?.filter(param => param.component != "file")
  fd.append("workplan", JSON.stringify(formData))

  params.value?.forEach((param) => {
    if (param.component == "file" && param.value?.length > 0) {
      for (let file of param.value) {
        fd.append(`${param.name}[]`, file)
      }
    }
  })

  planService.createPlan(fd).then(res => {
    if (res.data.is_success) {
      toast.add({
        severity: 'success',
        summary: t('common.success'),
        detail: t('workPlan.message.planCreated'),
        life: 3000
      });
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

const validate = () => {
  let paramValidation = false
  if (params.value != null) {
    params?.value?.forEach(param => {
      if ((param.value === null || param.value === '') || (param.component == "file" && param.value?.length == 0)) {
        paramValidation = true
      }
    })
  }
  return formData.work_plan_name && formData.lang && formData.plan_type && !paramValidation;
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

watch(() => formData.plan_type, () => {
  const id = types.value[formData.plan_type - 1].dic_document_types
  if (id == null) {
    params.value = null
    return
  }
  docService.getDocParams(id).then(res => {
    params.value = JSON.parse(res.data)
  }).catch(error => {
    toast.add({severity: "error", summary: error, life: 3000});
  })

})
</script>