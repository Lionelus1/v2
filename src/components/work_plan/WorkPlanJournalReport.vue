<template>
  <div class="col-12">
    <TitleBlock :title="$t('workPlan.journalReports')" :show-back-button="true" />
    <div class="card" v-if="dReports && dReports[active].doc_info.docHistory.stateEn === DocState.REVISION.Value">
      <div class="p-fluid">
        <div class="field">
          <label>{{ $t('common.state') }}:</label>
          <div v-if="dReports[active].doc_info.docHistory">
            <span v-if="dReports[active].status" :class="'customer-badge status-' + dReports[active].doc_info.docHistory.stateEn">{{
                $t('common.states.' + dReports[active].doc_info.docHistory.stateEn)
              }}</span>
          </div>
        </div>
        <div class="field" v-if="dReports[active].reject_history && dReports[active].reject_history.user">
          <label>{{ $t('contracts.assigner') }}:</label>
          <div>
            <b>{{ dReports[active].reject_history.user.fullName }}</b>
          </div>
        </div>
        <div class="field" v-if="dReports[active].doc_info.docHistory && dReports[active].doc_info.docHistory.setDate">
          <label>{{ $t('common.date') }}:</label>
          <div>
            <b>{{ formatDateMoment(dReports[active].doc_info.docHistory.setDate, true) }}</b>
          </div>
        </div>
        <div class="field">
          <label>{{ $t('common.comment') }}:</label>
          <div>
            <Message :closable="false" severity="warn"><span v-html="dReports[active].doc_info.docHistory.comment"></span></Message>
          </div>
        </div>
      </div>
    </div>
    <TabView v-model:activeIndex="active" @tab-change="tabChanged">
      <!--дневник-отчет-->
      <TabPanel :header="$t('workPlan.journalReports')" >

        <span v-if="!loading && dReports" :class="'ml-3 customer-badge status-' + dReports[0].doc_info.docHistory.stateEn">
          {{ $t('common.states.' + dReports[0].doc_info.docHistory.stateEn) }}
        </span>
        <div class="card" v-if="!loading && dReports && dReports[0].doc_info && !(dReports[0].doc_info.docHistory.stateId === 1 || dReports[0].doc_info.docHistory.stateId === 4)">
          <Button type="button" icon="pi pi-eye" class="p-button-outlined" :label="$t('educomplex.tooltip.document')" @click="openDoc0"></Button>
        </div>
        <div class="card" v-if="visibleSendToApprove()">
          <Button type="button" icon="pi pi-send" class="p-button-success ml-2" :label="$t('common.toapprove')" @click="openModal"></Button>
          <WorkPlanReportApprove v-if="showModal0" :report-fd="fd" :visible="showModal0" :doc-id="dReports[0].doc_id" :approvalStages="approval_users"
                                 :report="dReports[0]" :plan="plan" @sent-to-approve="getReport(0)" @closed="closeApproveModal" />
        </div>
        {{blobSource}}
        <ToolbarMenu v-if="dReports && checkingSignAllDoc()" :data="toolbarMenus"/>
        <div class="card" v-if="blobSource">
          <embed :src="blobSource" style="width: 100%; height: 1000px" type="application/pdf" />
        </div>
        <Sidebar v-model:visible="showReportDocInfo0" position="right" class="p-sidebar-lg" style="overflow-y: scroll" @hide="closeSideModal0">
          <DocSignaturesInfo :docIdParam="dReports[0].doc_id" :isInsideSidebar="true" @sentToRevision="rejectPlanReport($event, 0)"></DocSignaturesInfo>
        </Sidebar>
      </TabPanel>
      <!--Техника безоп<-->
      <TabPanel :header="$t('workPlan.safetyPrecautions')">
        <span v-if="!loading && dReports" :class="'ml-3 customer-badge status-' + dReports[1].doc_info.docHistory.stateEn">
          {{ $t('common.states.' + dReports[1].doc_info.docHistory.stateEn) }}
        </span>
        <div class="card" v-if="dReports && dReports[1].doc_info && !(dReports[1].doc_info.docHistory.stateId === 1 || dReports[1].doc_info.docHistory.stateId === 4)">
          <Button type="button" icon="pi pi-eye" class="p-button-outlined" :label="$t('educomplex.tooltip.document')" @click="openDoc1"></Button>
        </div>
        <div class="card" v-if="visibleSendToApproveTB()">
          <Button type="button" icon="pi pi-send" class="p-button-success ml-2" :label="$t('common.toapprove')" @click="openModal"></Button>
          <WorkPlanReportApprove v-if="showModal1" :report-fd="fd" :visible="showModal1" :doc-id="dReports[1].doc_id" :approvalStages="approval_users"
                                 :report="dReports[1]" :plan="plan" @sent-to-approve="getReport(1)" @closed="closeApproveModal" />
        </div>

        <Sidebar v-model:visible="showReportDocInfo1" position="right" class="p-sidebar-lg" style="overflow-y: scroll" @hide="closeSideModal1">
          <DocSignaturesInfo :docIdParam="dReports[1].doc_id" :isInsideSidebar="true" @sentToRevision="rejectPlanReport($event, 1)"></DocSignaturesInfo>
        </Sidebar>

        <ToolbarMenu :data="toolbarMenus"/>

        <div class="card" v-if="dReports">
<!--          {{ tbDoc.params.filter(item => item.name.includes("content")) }}-->
          <DataTable :loading="tbLoading" size="small" stripedRows showGridlines :value="tbDoc.params[2].value" tableStyle="min-width: 50rem">
            <Column style="width: 10%" field="date" :header="$t('workPlan.monthAndDate')">
              <template #body="{ data }">
                {{ formatDateMoment(data.date) }}
              </template>
            </Column>
            <Column style="width: 80%" field="txt" :header="$t('workPlan.textCS')"></Column>
            <Column style="width: 10%; text-align: center;" field="actions" header="" >
              <template #body="{ data: node, index }">
                <ActionButton :items="actionMenus" :show-label="true" @toggle="actionsToggle(node, index)"/>
              </template>
            </Column>
          </DataTable>
        </div>

      </TabPanel>
      <!--Закл Контр-->
      <TabPanel :header="$t('workPlan.conclusionCounterparty')">
        <vue-element-loading :active="contrConcLoading" color="#FFF" size="80" :text="$t('common.loading')" backgroundColor="rgba(0, 0, 0, 0.4)" />
        <span v-if="!loading && dReports" :class="'ml-3 customer-badge status-' + dReports[2].doc_info.docHistory.stateEn">
          {{ $t('common.states.' + dReports[2].doc_info.docHistory.stateEn) }}
        </span>
        <div class="card" v-if="dReports && dReports[2].doc_info && !(dReports[2].doc_info.docHistory.stateId === 1 || dReports[2].doc_info.docHistory.stateId === 4)">
          <Button type="button" icon="pi pi-eye" class="p-button-outlined" :label="$t('educomplex.tooltip.document')" @click="openDoc2"></Button>
        </div>
        <div class="card" v-if="visibleSendToApproveContrConc()">
          <Button type="button" icon="pi pi-send" class="p-button-success ml-2" :label="$t('common.toapprove')" @click="openModal"></Button>
          <WorkPlanReportApprove v-if="showModal2" :report-fd="fd" :visible="showModal2" :doc-id="dReports[2].doc_id" :approvalStages="approval_users"
                                 :report="dReports[2]" :plan="plan" @sent-to-approve="getReport(2)" @closed="closeApproveModal" />
        </div>
        <Sidebar v-model:visible="showReportDocInfo2" position="right" class="p-sidebar-lg" style="overflow-y: scroll" @hide="closeSideModal2">
          <DocSignaturesInfo :docIdParam="dReports[2].doc_id" :isInsideSidebar="true" @sentToRevision="rejectPlanReport($event, 2)"></DocSignaturesInfo>
        </Sidebar>
        <div class="field">
          <TinyEditor v-model="contrConcModel" :height="300" :style="{ height: '100%', width: '100%' }"/>
        </div>
        <ToolbarMenu :data="toolbarMenus"/>
      </TabPanel>
      <!--Заключение руководителя-->
      <TabPanel :header="$t('workPlan.conclusionHeadDepartment')">
        <vue-element-loading :active="headConcLoading" color="#FFF" size="80" :text="$t('common.loading')" backgroundColor="rgba(0, 0, 0, 0.4)" />
        <span v-if="!loading && dReports" :class="'ml-3 customer-badge status-' + dReports[3].doc_info.docHistory.stateEn">
          {{ $t('common.states.' + dReports[3].doc_info.docHistory.stateEn) }}
        </span>
        <div class="card" v-if="dReports && dReports[3].doc_info && !(dReports[3].doc_info.docHistory.stateId === 1 || dReports[3].doc_info.docHistory.stateId === 4)">
          <Button type="button" icon="pi pi-eye" class="p-button-outlined" :label="$t('educomplex.tooltip.document')" @click="openDoc3"></Button>
        </div>
        <div class="card" v-if="visibleSendToApproveHeadConc()">
          <Button type="button" icon="pi pi-send" class="p-button-success ml-2" :label="$t('common.toapprove')" @click="openModal"></Button>
          <WorkPlanReportApprove v-if="showModal3" :report-fd="fd" :visible="showModal3" :doc-id="dReports[3].doc_id" :approvalStages="approval_users"
                                 :report="dReports[3]" :plan="plan" @sent-to-approve="getReport(3)" @closed="closeApproveModal" />
        </div>
        <Sidebar v-model:visible="showReportDocInfo3" position="right" class="p-sidebar-lg" style="overflow-y: scroll" @hide="closeSideModal3">
          <DocSignaturesInfo :docIdParam="dReports[3].doc_id" :isInsideSidebar="true" @sentToRevision="rejectPlanReport($event, 3)"></DocSignaturesInfo>
        </Sidebar>
        <div class="field">
          <TinyEditor v-model="headConcModel" :height="300" :style="{ height: '100%', width: '100%' }"/>
        </div>
        <ToolbarMenu :data="toolbarMenus"/>
      </TabPanel>
      <!--Оценка практики-->
      <TabPanel :header="$t('workPlan.practiceAssessment')">
        <vue-element-loading :active="assignLoading" color="#FFF" size="80" :text="$t('common.loading')" backgroundColor="rgba(0, 0, 0, 0.4)" />
        <span v-if="!loading && dReports" :class="'ml-3 customer-badge status-' + dReports[4].doc_info.docHistory.stateEn">
          {{ $t('common.states.' + dReports[4].doc_info.docHistory.stateEn) }}
        </span>
        <div class="card" v-if="dReports && dReports[4].doc_info && !(dReports[4].doc_info.docHistory.stateId === 1 || dReports[4].doc_info.docHistory.stateId === 4)">
          <Button type="button" icon="pi pi-eye" class="p-button-outlined" :label="$t('educomplex.tooltip.document')" @click="openDoc4"></Button>
        </div>
        <div class="card" v-if="visibleSendToApproveAssign()">
          <Button type="button" icon="pi pi-send" class="p-button-success ml-2" :label="$t('common.toapprove')" @click="openModal"></Button>
          <WorkPlanReportApprove v-if="showModal4" :report-fd="fd" :visible="showModal4" :doc-id="dReports[4].doc_id" :approvalStages="approval_users"
                                 :report="dReports[4]" :plan="plan" @sent-to-approve="getReport(4)" @closed="closeApproveModal" />
        </div>
        <Sidebar v-model:visible="showReportDocInfo4" position="right" class="p-sidebar-lg" style="overflow-y: scroll" @hide="closeSideModal4">
          <DocSignaturesInfo :docIdParam="dReports[4].doc_id" :isInsideSidebar="true" @sentToRevision="rejectPlanReport($event, 4)"></DocSignaturesInfo>
        </Sidebar>

        <div class="field" >
          <TinyEditor v-model="assignModel" :height="300" :style="{ height: '100%', width: '100%' }"/>
          <ToolbarMenu :data="toolbarMenus"  v-if="loginedUser && (dReports && dReports[4].doc_info && (dReports[4].doc_info.docHistory.stateId === 1 || dReports[4].doc_info.docHistory.stateId === 4))"/>
        </div>
      </TabPanel>
    </TabView>
  </div>
  <div class="flex justify-center">
    <ProgressSpinner v-if="loading" style="width: 50px;" strokeWidth="5" fill="transparent" />
  </div>
  <Dialog modal :header="$t('workPlan.safetyPrecautions')" v-model:visible="AddTechSecDialog" :style="{width: '600px'}" class="p-fluid">
    <div class="field">
      <label>{{ $t('workPlan.textCS') }}</label>
      <Textarea v-model="formDataTS.txt" rows="10" style="resize: vertical" />
    </div>
    <div class="field">
      <label>{{ $t('workPlan.monthAndDate') }}</label>
      <PrimeCalendar v-model="formDataTS.date" dateFormat="dd.mm.yy" showIcon :showButtonBar="true"></PrimeCalendar>
    </div>
    <template #footer>
      <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button-rounded p-button-danger" @click="closeDialog"/>
      <Button :label="tbIsEdit ? $t('common.save') : $t('common.add')" icon="pi pi-check" class="p-button-rounded p-button-success mr-2" @click="createTechSec"/>
    </template>
  </Dialog>
</template>

<script setup>
import {computed, onMounted, reactive, ref} from "vue";
import {useToast} from "primevue/usetoast";
import {useRoute} from "vue-router";
import {WorkPlanService} from "@/service/work.plan.service";
import {ContragentService} from "@/service/contragent.service";
import ToolbarMenu from "@/components/ToolbarMenu.vue";
import {useI18n} from "vue-i18n";
import WorkPlanReportApprove from "@/components/work_plan/WorkPlanReportApprove.vue";
import DocSignaturesInfo from "@/components/DocSignaturesInfo.vue";
import {DocService} from "@/service/doc.service";
import DocState from "@/enum/docstates/index";
import moment from "moment/moment";
import JSZip, {forEach} from "jszip";
import { saveAs } from 'file-saver';

const {t, locale} = useI18n()

const formDataTS = ref({
  date: null,
  txt: null
});

const formatDateMoment = (date) => {
  return moment(new Date(date)).utc().format("DD.MM.YYYY")
}

const toolbarMenus = computed(() => {
  return [
    // {
    //   label: t('workPlan.viewDoc'),
    //   icon: 'pi pi-eye',
    //   visible: active.value === 0,
    //   command: () => {
    //   }
    // },
    // {
    //   label: t('common.action.sendToApprove'),
    //   icon: 'pi pi-send',
    //   visible: active.value === 0,
    //   // color: 'blue',
    //   command: () => {
    //     // command logic here
    //   },
    // },
    {
      label: t('common.downloadAllDocument'),
      icon: 'pi pi-download',
      visible: active.value === 0,
      // color: 'blue',
      command: () => {
        downloadDiaryRep();
      },
    },
    {
      label: t('common.add'),
      icon: 'pi pi-plus',
      color: 'blue',
      visible: active.value === 1,
      command: () => {
        AddTechSecDialog.value = true
      },
    },
    {
      label: t('common.save'),
      icon: 'pi pi-save',
      // disabled: true,
      color: 'blue',
      visible: active.value === 2 || active.value === 3 || active.value === 4,
      command: () => {
        if (active.value === 2) {
          saveContrConc()
        }else if (active.value === 3){
          saveHeadConc()
        }else if (active.value === 4){
          saveAssign()
        }
      },
    },
  ];
});

const actionMenus = computed((node) => {
  return [
    {
      label: t('common.edit'),
      icon: 'fa-solid fa-pen',
      command: () => {
        AddTechSecDialog.value = true;
        tbIsEdit.value = true;

      }
    },
    {
      label: t('common.delete'),
      icon: 'fa-solid fa-trash',
      command: () => {
        tbLoading.value = true;
        tbDoc.value.params[2].value.splice(tbIndex.value, 1);

        docService.saveDocumentV2(tbDoc.value).then(res => {
          tbDoc.value = res.data
          toast.add({severity: "success", summary: t('common.success'), life: 3000});
          tbLoading.value = false;
        }).catch(error => {
          toast.add({ severity: 'error', summary: error.message, life: 3000 });
          tbLoading.value = false;
        });
      }
    },
  ];
});

const actionsToggle = (node, index) => {
  tbIndex.value = index;
  formDataTS.value.date = node.date;
  formDataTS.value.txt = node.txt;
}
const contrConcModel = ref(null);
const headConcModel = ref(null);
const assignModel = ref(null);
const tbIndex = ref(null);
const fd = ref(new FormData());
const active = ref(0);
const route = useRoute();
const workPlanId = ref(parseInt(route.params.id));
const student_id = ref(parseInt(route.params.userId));

const planService = new WorkPlanService()
const contragentService = new ContragentService()
const docService = new DocService()

const loginedUserId = JSON.parse(localStorage.getItem("loginedUser")).userID;
const loginedUser = JSON.parse(localStorage.getItem("loginedUser"));

// console.log(student_id.value, loginedUser, loginedUserId)
const plan = ref(null);
const planDoc = ref(null);
const report = ref(null);
const dReports = ref(null);
let blobSource = ref(null);
const respUsers = ref(null);
let studentInfo = ref(null);
const isPlanCreator = ref(false);
const approval_users = ref(null);

const tbIsRejected = ref(false);
const tbLoading = ref(false);
const contrConcLoading = ref(false);
const headConcLoading = ref(false);
const assignLoading = ref(false);
const tbIsEdit = ref(false);
const loading = ref(false);
const showModal0 = ref(false);
const showModal1 = ref(false);
const showModal2 = ref(false);
const showModal3 = ref(false);
const showModal4 = ref(false);
const showReportDocInfo0 = ref(false);
const showReportDocInfo1 = ref(false);
const showReportDocInfo2 = ref(false);
const showReportDocInfo3 = ref(false);
const showReportDocInfo4 = ref(false);
const showRejectPlan = ref(false);
const AddTechSecDialog = ref(false);
const tbDoc = computed(() =>{
  return dReports.value[1].doc_info
})

const contrConcDoc = computed(() =>{
  return dReports.value[2].doc_info
})

const headConcDoc = computed(() =>{
  return dReports.value[3].doc_info
})

const assignDoc = computed(() =>{
  return dReports.value[4].doc_info
})


const toast = useToast()
const reject = {
  report_id: 0,
  doc_id: null,
  comment: null,
  report_name: null
};

const closeDialog = () => {
  AddTechSecDialog.value = false;
  formDataTS.value.date = null;
  formDataTS.value.txt = null;
}
const createTechSec = () => {
  //валидация
  if(!formDataTS.value.txt || !formDataTS.value.date){
    toast.add({ severity: 'warn', summary: t('common.message.fillError'), life: 3000 });
    return;
  }

  tbLoading.value = true;

  if(tbIsEdit.value){
    const newFormData = { ...formDataTS.value };
    tbDoc.value.params[2].value.splice(tbIndex.value, 1, newFormData);
    tbIsEdit.value = false;
  }else{
    tbDoc.value.params?.forEach((param) => {
      if(param.name === "content") {
        if (!param.value) param.value = [];
        param.value.push({...formDataTS.value})
      }
    })
  }

  docService.saveDocumentV2(tbDoc.value).then(res => {
    tbDoc.value = res.data
    toast.add({severity: "success", summary: t('common.success'), life: 3000});
    tbLoading.value = false;
  }).catch(error => {
    toast.add({ severity: 'error', summary: error.message, life: 3000 });
    tbLoading.value = false;
  });
  closeDialog();
}

const saveContrConc = () => {
  contrConcLoading.value = true;
  contrConcDoc.value.params?.forEach((param) => {
    if(param.name === "content") {
      if (!param.value) param.value = "";
      param.value = contrConcModel.value;
      console.log(contrConcModel.value)
      console.log(param.value)
    }
  })
  docService.saveDocumentV2(contrConcDoc.value).then(res => {
    contrConcDoc.value = res.data
    toast.add({severity: "success", summary: t('common.success'), life: 3000});
    contrConcLoading.value = false;
  }).catch(error => {
    toast.add({ severity: 'error', summary: error.message, life: 3000 });
    contrConcLoading.value = false;
  });
}

const saveHeadConc = () => {
  headConcLoading.value = true;
  headConcDoc.value.params?.forEach((param) => {
    if(param.name === "content") {
      if (!param.value) param.value = "";
      param.value = headConcModel.value;
      console.log(headConcModel.value)
      console.log(param.value)
    }
  })
  docService.saveDocumentV2(headConcDoc.value).then(res => {
    headConcDoc.value = res.data
    toast.add({severity: "success", summary: t('common.success'), life: 3000});
    headConcLoading.value = false;
  }).catch(error => {
    toast.add({ severity: 'error', summary: error.message, life: 3000 });
    headConcLoading.value = false;
  });
}

const saveAssign = () => {
  assignLoading.value = true;
  assignDoc.value.params?.forEach((param) => {
    if(param.name === "content") {
      if (!param.value) param.value = "";
      param.value = assignModel.value;
    }
  })
  docService.saveDocumentV2(assignDoc.value).then(res => {
    assignDoc.value = res.data
    toast.add({severity: "success", summary: t('common.success'), life: 3000});
    assignLoading.value = false;
  }).catch(error => {
    toast.add({ severity: 'error', summary: error.message, life: 3000 });
    assignLoading.value = false;
  });
}

const tabChanged = () => {
  if (active.value === 0) {
    console.log("tabChanged 1");
  }
}

const openDoc0 = () => {
  showReportDocInfo0.value = true;
}
const openDoc1 = () => {
  showReportDocInfo1.value = true;
}
const openDoc2 = () => {
  showReportDocInfo2.value = true;
}
const openDoc3 = () => {
  showReportDocInfo3.value = true;
}
const openDoc4 = () => {
  showReportDocInfo4.value = true;
}

const closeSideModal0 = () => {
  showReportDocInfo0.value = false;
}
const closeSideModal1 = () => {
  showReportDocInfo1.value = false;
}
const closeSideModal2 = () => {
  showReportDocInfo2.value = false;
}
const closeSideModal3 = () => {
  showReportDocInfo3.value = false;
}
const closeSideModal4 = () => {
  showReportDocInfo4.value = false;
}

const getRespUsers = async () => {
  planService.getRespUsers(workPlanId.value).then(res => {
    respUsers.value = res.data
  }).catch(error => {
    toast.add({ severity: 'error', summary: error.message, life: 3000 });
  });
}

const visibleSendToApprove = () => {
  return !loading.value && loginedUser && (dReports.value && dReports.value[0].doc_info && (dReports.value[0].doc_info.docHistory.stateId === 1 || dReports.value[0].doc_info.docHistory.stateId === 4));
}

const visibleSendToApproveTB = () => {
  return !loading.value && loginedUser && (dReports.value && dReports.value[1].doc_info && (dReports.value[1].doc_info.docHistory.stateId === 1 || dReports.value[1].doc_info.docHistory.stateId === 4));
}

const visibleSendToApproveContrConc = () => {
  return !loading.value && loginedUser && (dReports.value && dReports.value[2].doc_info && (dReports.value[2].doc_info.docHistory.stateId === 1 || dReports.value[2].doc_info.docHistory.stateId === 4));
}

const visibleSendToApproveHeadConc = () => {
  return !loading.value && loginedUser && (dReports.value && dReports.value[3].doc_info && (dReports.value[3].doc_info.docHistory.stateId === 1 || dReports.value[3].doc_info.docHistory.stateId === 4));
}

const visibleSendToApproveAssign = () => {
  return !loading.value && loginedUser && (dReports.value && dReports.value[4].doc_info && (dReports.value[4].doc_info.docHistory.stateId === 1 || dReports.value[4].doc_info.docHistory.stateId === 4));
}
// проверка подписания всех документов
const checkingSignAllDoc = () => {
  for (const report of dReports.value) {
    if(report.doc_info){
      if(report.doc_info.docHistory.stateId !== DocState.APPROVED.ID){
        return false;
      }
    }
  }
  return true;
}

const getPlan = async () => {
  try {
    const res = await planService.getPlanById(workPlanId.value);
    if (res.data) {
      plan.value = res.data;
      planDoc.value = res.data.doc_info
      if (planDoc.value && planDoc.value.docHistory) {
        tbIsRejected.value = planDoc.value.docHistory.stateEn === DocState.REVISION.Value
      }
      if (res.data.user.id === loginedUserId.value) {
        isPlanCreator.value = true;
      }
    }
  } catch (error) {
    toast.add({ severity: 'error', summary: error.message, life: 3000 });
  }
}

const downloadDiaryRep = async () => {
  try {
    loading.value = true;
    const zip = new JSZip();

    // Функция для получения файла по URL
    const fetchFile = async (url) => {
      const response = await fetch('http://smart.enu.kz:8090/serve?path=' + url);
      if (!response.ok) throw new Error('Failed to fetch the file');
      return await response.blob();  // Или response.arrayBuffer() если необходимо
    };

    for (const report of dReports.value) {
      if(report.doc_info){
        const fileBlob = await fetchFile(report.doc_info.filePath);
        zip.file(report.report_name.replace('.', '_') + '.pdf', fileBlob);  // Добавляем файл в архив с его именем
      }
    }
    // Генерируем ZIP и инициируем его загрузку
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "diaryReport.zip");

    // Сообщаем об успешной операции
    toast.add({ severity: "success", summary: t('common.success'), life: 3000 });
    loading.value = false;
    // const zip = new JSZip();
    //
    // // Fetch the remote file
    // const fetchFile = async (url) => {
    //   const response = await fetch(url);
    //   if (!response.ok) throw new Error('Failed to fetch the file');
    //   return await response.blob();  // Or use response.arrayBuffer() if needed
    // };
    //
    // // Add files to the zip
    // const pdfBlob = await fetchFile('http://smart.enu.kz:8090/serve?path=work_plan/report/42613653-59a3-4d3b-8ee3-783ca65795f0.pdf');
    // zip.file('report.pdf', pdfBlob);  // Add the fetched PDF as 'report.pdf' in the zip
    //
    // // Generate the zip and trigger the download
    // const content = await zip.generateAsync({ type: "blob" });
    // saveAs(content, "resumes.zip");
  } catch (error) {
    loading.value = false;
    toast.add({ severity: 'error', summary: error.message, life: 3000 });
  }
}

const rejectPlanReport = (comment, index) => {
  reject.comment = comment;
  reject.doc_id = report.value.doc_id;
  reject.report_id = dReports.value[index].id;
  reject.report_name = report.value.report_name;
  planService.rejectReport(reject).then(res => {
    if (res.data.is_success) {
      showRejectPlan.value = false;
      router.push({ name: 'WorkPlanReport', params: { id: workPlanId.value } });
    }
    getReport(index)
  }).catch(error => {
    toast.add({ severity: 'error', summary: error.message, life: 3000 });
  })
}

const calcCC = () => {
  if (dReports.value || dReports.value[2] || dReports.value[2].doc_info || dReports.value[2].doc_info.params) {
    const temp = dReports.value[2].doc_info.params.filter(item => item.name.includes("content"));
    if (temp.length <= 1) {
      contrConcModel.value = temp[0].value;
    }
  }

  if (dReports.value || dReports.value[3] || dReports.value[3].doc_info || dReports.value[3].doc_info.params) {
    const temp = dReports.value[3].doc_info.params.filter(item => item.name.includes("content"));
    if (temp.length <= 1) {
      headConcModel.value = temp[0].value;
    }
  }

  if (dReports.value || dReports.value[4] || dReports.value[4].doc_info || dReports.value[4].doc_info.params) {
    const temp = dReports.value[4].doc_info.params.filter(item => item.name.includes("content"));
    if (temp.length <= 1) {
      assignModel.value = temp[0].value;
    }
  }
}

const getDiaryReports = async () => {
  async function createDiaryReports(wpId, name, type) {
    let data = {
      work_plan_id: wpId,
      report_name: name,
      report_type: type,
      quarter: null,
      halfYearType: null,
      department_id: null,
    };
    try {
      await planService.createWorkPlanReport(data);
    } catch (error) {
      toast.add({ severity: 'error', summary: `Failed to create report: ${name}`, detail: error.message, life: 3000 });
    }
  }

  try {
    loading.value = true;
    const dRes = await planService.getWorkPlanDiaryReports(workPlanId.value);
    if (dRes && dRes.data && dRes.data.length > 0) {
      dReports.value = dRes.data;
      calcCC(); //для заключения контрагента
      await getFile(0);
      // await getRespUsers();
      // loading.value = false;
    } else {
      await createDiaryReports(workPlanId.value, "workPlan.journalReports", 3);
      await createDiaryReports(workPlanId.value, "workPlan.safetyPrecautions", 4);
      await createDiaryReports(workPlanId.value, "workPlan.conclusionCounterparty", 5);
      await createDiaryReports(workPlanId.value, "workPlan.conclusionHeadDepartment", 6);
      await createDiaryReports(workPlanId.value, "workPlan.practiceAssessment", 7);

      // Call getDiaryReports again to fetch the newly created reports
      await getDiaryReports();
      // loading.value = false;
    }
  } catch (error) {
    loading.value = false;
    toast.add({ severity: 'error', summary: error.message, life: 3000 });
  }
};

const getFile = async (index) => {
  await planService.getPlanReportFile(dReports.value[index].doc_id).then(async res => {
    if (res.data && dReports.value && dReports.value[index].doc_info.docHistory.stateId !== 4) {
      //kelisimge jiberilger bolsa daiyn filedi alam
      blobSource.value = URL.createObjectURL(await b64toBlob(res.data));
      console.log("asnclmc norm")

      loading.value = false;
    } else {
      await getData(index);
    }
  }).catch(error => {
    loading.value = false;
    toast.add({ severity: 'error', summary: error.message, life: 3000 });
  });
}
const getData = async (index) => {
  let data = {
    work_plan_id: workPlanId.value,
    eventUserId: student_id.value,
    halfYearType: null,
    department_id: null,
    report_id: dReports.value[index].id
  };
  planService.getWorkPlanData(data).then(async res => {
    loading.value = false;
    blobSource.value = URL.createObjectURL(await b64toBlob(res.data));
  }).catch(error => {
    loading.value = false;
    toast.add({ severity: 'error', summary: error.message, life: 3000 });
  });
}
const b64toBlob = async (b64Data, sliceSize = 512) => {
  const byteCharacters = window.atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  return new Blob(byteArrays, {type: "application/pdf"});
}

const closeApproveModal = async () => {
  if(active.value === 0){
    showModal0.value = false;
  }else if(active.value === 1){
    showModal1.value = false;
  } else if(active.value === 2){
    showModal2.value = false;
  } else if(active.value === 3){
    showModal3.value = false;
  } else if(active.value === 4){
    showModal4.value = false;
  }
}

const openModal = async () => {
  approval_users.value = [
    {
      stage: 1,
      users: [],
      titleRu: "Руководитель практики от организации",
      titleKz: "Ұйымнан тәжірибе жетекшісі",
      titleEn: "Head of practice from the organization",
      certificate: {
        namekz: "Жеке тұлғаның сертификаты",
        nameru: "Сертификат физического лица",
        nameen: "Certificate of an individual",
        value: "individual"
      }
    }
  ]

  if(active.value === 0) {
    showModal0.value = true;
  }
  else if(active.value === 1) {
    showModal1.value = true;
  }
  else if(active.value === 2) {
    showModal2.value = true;
  }
  else if(active.value === 3){
    showModal3.value = true;
    approval_users.value = [
      {
        stage: 1,
        users: [],
        titleRu: "Руководитель практики на кафедре",
        titleKz: "Кафедрада практика жетекшісі",
        titleEn: "Head of practice at the department",
        certificate: {
          namekz: "Жеке тұлғаның сертификаты",
          nameru: "Сертификат физического лица",
          nameen: "Certificate of an individual",
          value: "individual"
        }
      }
    ]
  }
  else if(active.value === 4){
    showModal4.value = true;
    approval_users.value = [
      {
        stage: 1,
        users: [],
        titleRu: "Члены комиссии",
        titleKz: "Комиссия мүшелері",
        titleEn: "Commission members",
        certificate: {
          namekz: "Жеке тұлғаның сертификаты",
          nameru: "Сертификат физического лица",
          nameen: "Certificate of an individual",
          value: "individual"
        }
      },
      {
        stage: 2,
        users: [],
        titleRu: "Члены комиссии",
        titleKz: "Комиссия мүшелері",
        titleEn: "Commission members",
        certificate: {
          namekz: "Жеке тұлғаның сертификаты",
          nameru: "Сертификат физического лица",
          nameen: "Certificate of an individual",
          value: "individual"
        }
      },
      {
        stage: 3,
        users: [],
        titleRu: "Члены комиссии",
        titleKz: "Комиссия мүшелері",
        titleEn: "Commission members",
        certificate: {
          namekz: "Жеке тұлғаның сертификаты",
          nameru: "Сертификат физического лица",
          nameen: "Certificate of an individual",
          value: "individual"
        }
      }
    ]
  }
}

const getReport = async (repIndex) => {
  planService.getPlanReportById(dReports.value[repIndex].id).then(res => {
    report.value = res.data;
    getPlan();
    getFile(repIndex);
    // this.getReportApprovalUsers();
    getRespUsers()
    getDiaryReports();
  }).catch(error => {
    toast.add({ severity: 'error', summary: error.message, life: 3000 });
  });
}

const getSt = async () => {
  try {
    contragentService.getPersons(student_id).then(res => {
      studentInfo = res.data
    })
  } catch (error) {
    toast.add({ severity: 'error', summary: error.message, life: 3000 });
  }
};

onMounted(() => {
  getPlan();
  getDiaryReports();
  // getSt();
})

</script>