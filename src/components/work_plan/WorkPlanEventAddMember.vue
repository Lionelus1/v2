<template>
  <Dialog
      :header="isAddMember ? $t('common.addMember') : ($t('common.selectContr') + ' (' + data.length + ')')"
      v-model:visible="showModal"
      :style="{width: '600px'}"
      class="p-fluid"
      @hide="closeBasic"
  >
    {{isAddMember}}
    <div class="field" v-if="isAddMember">
      <label>{{ $t('common.fullNameNote') }}</label>
      <Dropdown v-model="formData.fio" :options="students" optionLabel="fullName" optionValue="userID" :placeholder="$t('common.select')"/>
    </div>

    {{filter}}

    <div class="field">
      <label>{{ $t('common.organization') }}</label>
      <ContragentSelectV2
          :contragent="selectedOrganiztaion"
          @contragentUpdated="contragentUpdated"
          :select-person="false"
      />
    </div>
    {{sendData}}
    <div class="field">
      <label>{{ $t('contracts.contract') + ' / ' + $t('contracts.columns.regNumber') }}</label>
      <Dropdown
          v-model="formData.reg_num"
          :loading="tableLoading"
          :options="documents"
          optionLabel= "newParams.contragent.value.data.name"
          class="w-full md:w-[14rem]"
          :placeholder="tableLoading ? $t('hdfs.loading') : $t('common.select')"
      >
        <template #option="slotProps">
          <div class="flex align-items-center">
            <div>{{ slotProps.option.newParams.number.id }} / {{ slotProps.option.newParams.contragent.value.data.name }}</div>
          </div>
        </template>
      </Dropdown>

      <div class="card flex justify-content-center">
        <Dropdown v-model="sendData.folderId" :options="documents" optionValue="id" class="w-full md:w-14rem" />
      </div>

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
import {computed, onMounted, reactive, ref, watch} from "vue";
import {useToast} from "primevue/usetoast";
import {useI18n} from "vue-i18n";
import ContragentSelectV2 from "@/components/contragent/v2/ContragentSelectV2.vue";
import {DocService} from "@/service/doc.service";
import {useRoute} from "vue-router";

const service = new DocService()
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
    isPracticeManager: true,
    orgId: null,
    name: null,
    status: "status_signed",
    author: null,
    createdFrom: null,
    createdTo: null,
  },
  sourceType: 0,
  templateId: 34,
  folderId: null,
  docType: 5,
  page: 0,
  rows: 5,
  // page: currentPage.value,
  // rows: rows.value,
});

// Watch for changes in formData.reg_num
watch(() => formData.reg_num, (newVal) => {
  if (newVal) {
    sendData.templateId = newVal.templateId;
    sendData.docType = newVal.docType;
    sendData.parent = newVal.uuid;
  }
});

const sendData = reactive({
  templateId:34,
  folderId:null,
  docType:5,
  language:1,
  parent:"",
  user_ids: computed(() => props.data.map(student => student.id))
});

const getContracts = async () => {
  tableLoading.value = true;
  service.getDocumentsV2(filter).then(res => {
    documents.value = res.data.documents
    total.value = res.data.total;
    currentDocument.value = null;
    tableLoading.value = false;
  }).catch(err => {
    documents.value = [];
    total.value = 0;
    currentDocument.value = null;
    tableLoading.value = false;
  });
};

const props = defineProps(['visible', 'isAddMember', 'isSub', 'data'])
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

const configContract = () => {
  if (!validate()) return

  planService.confContr(sendData).then(res => {
    if (res.data.is_success) {
      toast.add({severity: 'success', summary: t('common.success'), life: 3000});
    } else {
      toast.add({severity: "error", summary: "Contract error", life: 3000});
    }
    closeBasic()
  }).catch(error => {
    toast.add({severity: "error", summary: error, life: 3000});
    submitted.value = false;
  });


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
  if(!props.isAddMember && sendData.parent !== "")
    return true;
  else
    return false;
}

const contragentUpdated = (event) => {
  if (event){
    formData.organization = event["data"]["id"];
    filter.filter.orgId =  event["data"]["id"];
    console.log(event)
    getContracts();
  }
}

onMounted(() => {
  getContracts();
})

</script>
