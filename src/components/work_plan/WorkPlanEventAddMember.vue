<template>
  <Dialog
      :header="isAddMember ? $t('common.addMember') : ($t('common.selectContr') + ' (' + data.length + ')')"
      v-model:visible="showModal"
      :style="{width: '600px'}"
      class="p-fluid"
      @hide="closeBasic"
  >

    <div class="field" v-if="isAddMember">
      <label>{{ $t('common.fullNameNote') }}</label>
      <FindUser v-model="formData.fio" :user-type="3" :editMode="false"/>
    </div>
    <div class="field">
      <label>{{ $t('common.organization') }}</label>
      <ContragentSelectV2
          :contragent="selectedOrganiztaion"
          @contragentUpdated="contragentUpdated"
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
          class="w-full md:w-[14rem]"
          :placeholder="tableLoading ? $t('hdfs.loading') : $t('common.select')"
      >
        <template #option="slotProps">
          <div class="flex align-items-center">
            <div>{{ slotProps.option.newParams.number.id }} / {{ slotProps.option.newParams.contragent.value.data.name }}</div>
          </div>
        </template>
      </Dropdown>
      <small class="p-error" v-if="submitted && !formData.plan_type">{{ $t('common.requiredField') }}</small>
    </div>
    <template #footer>
      <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button-rounded p-button-danger"
              @click="closeBasic"/>
      <Button :loading="loadMem" :label="$t('common.add')" icon="pi pi-check" class="p-button-rounded p-button-success mr-2"
              :disabled="isDisabled" @click="configContract"/>
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
import FindUser from "../../helpers/FindUser.vue";

const service = new DocService()
const rows = ref(10);
const documents = ref(null);
const total = ref(0);
const currentDocument = ref(null);
const tableLoading = ref(false);

const route = useRoute();
const work_plan_id = ref(parseInt(route.params.id));

const formData = reactive({
  fio: [],
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

const props = defineProps(['visible', 'isAddMember', 'isSub', 'data'])

// Watch for changes in formData.reg_num
watch(() => formData.reg_num, (newVal) => {
  if (newVal) {
    sendData.templateId = newVal.templateID;
    sendData.docType = newVal.docType;
    sendData.parent = newVal.uuid;
  }
});

const sendData = reactive({
  work_plan_id: computed(() => parseInt(route.params.id)),
  templateId:34,
  folderId:null,
  docType:5,
  language:1,
  parent:"",
  user_ids: props.isAddMember ?
      computed(() => formData.fio.map(student => student.userID)) :
      computed(() => props.data.map(student => student.id))
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


const selectedOrganiztaion = ref({
  data: null,
  type: 1,
});

const emit = defineEmits(['hide']);
const toast = useToast()
const {t} = useI18n()

const showModal = ref(props.visible)
const submitted = ref(false)
const loadMem = ref(false);
const isDisabled = computed(() => !validate())
const students = ref([])
const planService = new WorkPlanService()
const documentFiles = ref(null)

const closeBasic = () => {
  emit('hide')
}

const configContract = () => {
  submitted.value = false;
  if (!validate()) return
  loadMem.value = true;

  planService.confContr(sendData).then(res => {
    if (res.status === 201) {
      toast.add({severity: 'success', summary: t('common.success'), life: 3000});
    } else {
      toast.add({severity: "error", summary: "Contract error", life: 3000});
    }
    showModal.value = false;
    submitted.value = false;
    loadMem.value = false;
    closeBasic()
  }).catch(err => {
    if (err.response && err.response.data && err.response.data.localized) {
      toast.add({severity: "error", summary: t(err.response.data.localizedPath), life: 3000});
    } else {
      toast.add({severity: "error", summary: t('common.message.actionError'), life: 3000});
    }
    submitted.value = false;
    showModal.value = false;
    loadMem.value = false;
    closeBasic()
  });
}

const validate = () => {
  if(!props.isAddMember && sendData.parent !== "")
    return true;
  else if(props.isAddMember && sendData.parent !== "" && formData.fio.length > 0)
    return true;
  else
    return false;
}

const contragentUpdated = (event) => {
  if (event){
    formData.organization = event["data"]["id"];
    filter.filter.orgId =  event["data"]["id"];
    sendData.parent =  "";
    getContracts();
  }
}

onMounted(() => {
  getContracts();
})

</script>
