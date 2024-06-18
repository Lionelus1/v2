<template>
  <Dialog :header="$t('common.addMember')" v-model:visible="showModal" :style="{width: '600px'}" class="p-fluid" @hide="closeBasic">
    {{formData}}
    <div class="field">
      <label>{{ $t('common.fullNameNote') }}</label>
      <Dropdown v-model="formData.fio" :options="students" optionLabel="fullName" optionValue="userID" :placeholder="$t('common.select')"/>
    </div>
    <div class="field">
      <label>{{ $t('common.organization') }}</label>
      <ContragentSelectV2 :contragent="selectedOrganiztaion" @contragentUpdated="(event) => contragentUpdated(event)" :select-person="false"></ContragentSelectV2>
    </div>
    <div class="field">
      <label>{{ $t('contracts.contract') + '/' + $t('contracts.columns.regNumber') }}</label>
      <Dropdown
          v-model="formData.reg_num"
          :loading="tableLoading"
          :options="documents"
          :optionLabel= "'id'"
          optionValue="id"
          filter
          showClear
          class="w-full md:w-[14rem]"
          :placeholder="tableLoading ? $t('hdfs.loading') : $t('common.select')"
          :virtualScrollerOptions="{
            // numToleratedItems: 5,
            appendOnly: true,
            lazy: false,
            onLazyLoad: onLazyLoad,
            itemSize: 38,
            showLoader: true,
            loading: tableLoading,
            delay: 250
          }"
      />
      <small class="p-error" v-if="submitted && !formData.plan_type">{{ $t('common.requiredField') }}</small>
    </div>

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
import ContragentSelectV2 from "@/components/contragent/v2/ContragentSelectV2.vue";
import {DocService} from "@/service/doc.service";
import Enum from "@/enum/docstates/index";



const service = new DocService()
const loading = ref(false);

const page = ref(1);
const first = ref(1);
const rows = ref(10);
const filter = reactive({
  sourceType: null,
  template: null,
  folder: null,
  name: '',
  status: [],
  author: [],
  createdFrom: null,
  createdTo: null,
});

const documents = ref(null);
const total = ref(0);
const currentDocument = ref(null);
const tableLoading = ref(false);

const getContracts = () => {
  tableLoading.value = true;

  service.getDocumentsV2({
    page: page.value,
    rows: rows.value,
    sourceType: filter.sourceType,
    docType: Enum.DocType.Contract,
    templateId: filter.sourceType === Enum.DocSourceType.Template && filter.template ? filter.template.id : null,
    folderId: filter.sourceType === Enum.DocSourceType.FilledDoc && filter.folder ? filter.folder.id : null,
    filter: {
      name: filter.sourceType === Enum.DocSourceType.FilledDoc && filter.name && filter.name.length > 0 ? filter.name : null,
      status: filter.status && filter.status.length > 0 ? filter.status : null,
      author: filter.author.length > 0 && filter.author[0] ? filter.author[0].userID : null,
      createdFrom: filter.createdFrom,
      createdTo: filter.createdTo,
    },
  }).then(res => {
    documents.value = [...res.data.documents];
    total.value = res.data.total;

    currentDocument.value = null;
    tableLoading.value = false;
  }).catch(err => {
    documents.value = [];
    total.value = 0;
    currentDocument.value = null;

    if (err.response && err.response.status === 401) {
      store.dispatch("logOut");
    } else if (err.response && err.response.data && err.response.data.localized) {
      showMessage('error', t(err.response.data.localizedPath), null);
    } else {
      console.error(err);
      showMessage('error', t('common.message.actionError'), t('common.message.actionErrorContactAdmin'));
    }

    tableLoading.value = false;
  });
};


const loadLazyTimeout = ref();
const onLazyLoad = (event) => {
  loading.value = true;

  if (loadLazyTimeout.value) {
    clearTimeout(loadLazyTimeout.value);
  }

  //imitate delay of a backend call
  loadLazyTimeout.value = setTimeout(() => {

    console.log(event)
    // page = event.page;
    // rows = event.rows;
    page.value = event.first;
    rows.value = event.last;
    getContracts();
    loading.value = false;
  }, Math.random() * 1000 + 250);
}


const props = defineProps(['visible', 'isAdded', 'isSub'])
const selectedOrganiztaion = ref({
  data: null,
  type: 1,
});


const emit = defineEmits(['hide']);
const toast = useToast()
const {t} = useI18n()

const showModal = ref(props.visible)
const submitted = ref(false)

const formData = reactive({
  fio: null,
  organization: null,
  reg_num: null,
  work_plan_name: null,
  lang: null,
  plan_type: null,
  params: null
})

const isDisabled = computed(() => !validate())
const students = ref([])

const planService = new WorkPlanService()
const types = ref([])
const practiceType = ref([])
const eduProgByManagerId = ref([])
const contractFiles = ref(null)
const documentFiles = ref(null)

const closeBasic = () => {
  emit('hide')
}

const createPlan = () => {
  submitted.value = true;
  if (!validate()) return

  const fd = new FormData()
  if(formData.plan_type === 3){
    formData.params = params.value
  } else if(formData.plan_type === 4){
    formData.params = paramsWork.value
  } else {
    formData.params = null
  }

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
  if (formData.plan_type === 4) {
    paramsWork?.value?.forEach(param => {
      if (param.value === null || param.value === '') {
        paramValidation = true
      }
    })
  }

  return formData.work_plan_name && formData.lang && formData.plan_type && !paramValidation && !filesValidation;
}

const getWorkPlanTypes = () => {
  planService.getWorkPlanTypes().then(r => {
    types.value = r.data
  }).catch(error => {
    toast.add({severity: "error", summary: error, life: 3000});
  })
}

const getStudents = () => {
  planService.getStudents().then(res => {
    students.value = res.data
  }).catch(error => {
    toast.add({severity: "error", summary: error, life: 3000});
  })
}

const contragentUpdated = (event) => {
  if (event){
    formData.organization = event["data"]["id"]
  }
}

const getPracticeTypes = () => {
  planService.getPracticeTypes().then(res => {
    practiceType.value = res.data
  }).catch(error => {
    toast.add({severity: "error", summary: error, life: 3000});
  })
}

const getEduProgByManagerId = () => {
  planService.getEduProgByManagerId().then(res => {
    eduProgByManagerId.value = res.data
  }).catch(error => {
    toast.add({severity: "error", summary: error, life: 3000});
  })
}

onMounted(() => {
  getWorkPlanTypes();

  getContracts();


  getStudents();

  getPracticeTypes();
  getEduProgByManagerId();
})
</script>
