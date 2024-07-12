<template>
  <Dialog :header="$t('common.addMember')" v-model:visible="showModal" :style="{width: '600px'}" class="p-fluid" @hide="closeBasic">

    <div class="field">
      <label>{{ $t('common.fullNameNote') }}</label>
      <Dropdown v-model="formData.fio" :options="students" optionLabel="fullName" optionValue="userID" :placeholder="$t('common.select')"/>
    </div>
    <div class="field">
      <label>{{ $t('common.organization') }}</label>
      <ContragentSelectV2
          :contragent="selectedOrganiztaion"
          @contragentUpdated="(event) => contragentUpdated(event)"
          :select-person="false"
      />
    </div>
    <div class="field">
      <label>{{ $t('contracts.contract') + ' / ' + $t('contracts.columns.regNumber') }}</label>
      <Dropdown
          v-model="formData.reg_num"
          :loading="tableLoading"
          :options="documents"
          optionLabel= "newParams.contragent.value.data.name"
          optionValue="id"
          class="w-full md:w-[14rem]"
          :placeholder="tableLoading ? $t('hdfs.loading') : $t('common.select')"
      >
        <template #option="slotProps">
          <div class="flex align-items-center">
            <div>{{ slotProps.option.newParams.contragent.value.data.name }} / {{ slotProps.option.number }}</div>
          </div>
        </template>
      </Dropdown>
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
import {computed, onMounted, reactive, ref} from "vue";
import {useToast} from "primevue/usetoast";
import {useI18n} from "vue-i18n";
import ContragentSelectV2 from "@/components/contragent/v2/ContragentSelectV2.vue";
import {DocService} from "@/service/doc.service";
import {useRoute} from "vue-router";

const service = new DocService()
const currentPage = ref(1);
const rows = ref(10);
const documents = ref(null);
const total = ref(0);
const currentDocument = ref(null);
const tableLoading = ref(false);

const route = useRoute();
const work_plan_id = ref(parseInt(route.params.id));

const formData = reactive({
  fio: null,
  organization: 15736,
  reg_num: null,
  work_plan_name: null,
  lang: null,
  plan_type: null,
  params: null
})

const filter = reactive({
  filter: {
    orgId: null,
    name: null,
    status: "status_signed",
    author: null,
    createdFrom: null,
    createdTo: null
  },
  sourceType: 0,
  templateId: 34,
  folderId: null,
  docType: 5,
  page: currentPage.value,
  rows: rows.value,
});

const getContracts = async () => {
  tableLoading.value = true;
  service.getDocumentsV2(filter).then(res => {
    // if(documents.value){
    //   documents.value = [...documents.value, ...res.data.documents];
    // }else{
    //   documents.value = [...res.data.documents];
    // }

    documents.value = res.data.documents
    total.value = res.data.total;
    currentPage.value += 1;
    currentDocument.value = null;
    tableLoading.value = false;
  }).catch(err => {
    documents.value = [];
    total.value = 0;
    currentPage.value = 1;
    currentDocument.value = null;
    tableLoading.value = false;

    // if (err.response && err.response.status === 401) {
    //   store.dispatch("logOut");
    // } else if (err.response && err.response.data && err.response.data.localized) {
    //   showMessage('error', t(err.response.data.localizedPath), null);
    // } else {
    //   console.error(err);
    //   showMessage('error', t('common.message.actionError'), t('common.message.actionErrorContactAdmin'));
    // }
  });
};
const loadLazyTimeout = ref();
const onLazyLoad = (event) => {
  if (loadLazyTimeout.value) {
    clearTimeout(loadLazyTimeout.value);
  }

  const { _, last } = event;
  console.log(event);
  if (last >= (documents.value ? documents.value.length : 0) - 1) {
    // If last visible item is close to the end, fetch more data
    loadLazyTimeout.value = setTimeout(() => {
      getContracts();
    }, Math.random() * 1000 + 250);
  }
};

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



const isDisabled = computed(() => !validate())
const students = ref([])

const planService = new WorkPlanService()
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

const getStudents = () => {
  planService.getStudents(work_plan_id.value).then(res => {
    students.value = res.data
  }).catch(error => {
    toast.add({severity: "error", summary: error, life: 3000});
  })
}

const contragentUpdated = (event) => {
  if (event){
    formData.organization = event["data"]["id"]
    // filter.filter.orgId =  event["data"]["id"]
    //
    // getContracts();
  }
}

onMounted(() => {
  getStudents();
  getContracts();
})
</script>
