<template>
  <div class="flex flex-row mb-3">
    <div v-if="!uuid" class="arrow-icon" @click="router.back()">
      <i class="fas fa-arrow-left"></i>
    </div>
    <h4 class="m-0">{{ t("helpDesk.application.applicationName") }}</h4>
  </div>
  <ToolbarMenu v-if="request" :data="menu" />
  <TabView v-model:activeIndex="activeTab" @tab-change="tabChanged" class="flex flex-column flex-grow-1">
    <TabPanel :header="selectedDirection['name_' + locale]">
      <BlockUI v-if="haveAccess && selectedDirection
      //&& selectedDirection.code !== 'course_application'
      " :blocked="loading" class="card">
        <div class="" style="padding: 10px">
          <div style="margin-bottom: 10px; width: 100px" v-if="status != undefined" :class="'mb-10 customer-badge status-' + (status ?? 'created')">
            {{ getDocStatus(status ?? "created") }}
          </div>
          <CamundaComponent :components="components" :disabled="status != undefined && isFormDisabled()" style="margin-top: 10px">
          </CamundaComponent>
        </div>

        <template #footer>
          <Button :label="t('common.cancel')" icon="pi pi-times" class="p-button-rounded p-button-danger" @click="closeBasic" />
          <Button :label="t('common.createNew')" icon="pi pi-check" class="p-button-rounded p-button-success mr-2" :disabled="isDisabled && lang" @click="createHelpDesk" />
        </template>
      </BlockUI>
      <!-- sendToApproveDialog -->
      <Dialog :header="t('common.action.sendToApprove')" v-model:visible="visibility.sendToApproveDialog" :style="{ width: '50vw' }">
        <div class="p-fluid">
          <CamundaComponent :components="senderComponents" @addStagestoValue="addStagestoValue" @finishStep="finishSenderStep" @closeDialog="close('sendToApproveDialog')">
          </CamundaComponent>
        </div>
      </Dialog>
      <!-- revisionDialog -->
      <Dialog :header="t('common.revision')" :modal="true" v-model:visible="visibility.revisionDialog" style="width: 30vw">
        <div class="p-fluid col-12">
          <Textarea v-model="revisionText" autoResize rows="5" cols="30" />
        </div>
        <template #footer>
          <Button class="p-button-danger" :disabled="!revisionText" :label="t('common.revision')" @click="revision()" />
          <Button :label="t('common.cancel')" @click="close('revisionDialog')" />
        </template>
      </Dialog>

      <Sidebar v-model:visible="visibility.documentInfoSidebar" position="right" class="p-sidebar-lg">
        <DocSignaturesInfo :docIdParam="camundaServiceInstance.docUUID"></DocSignaturesInfo>
      </Sidebar>
      <!-- <CourseRegistration
        :courseRequest="request"
        @onCheckboxChecked="onChecked"
        @childInputData="childInput"
        v-if="
          selectedDirection && selectedDirection.code === 'course_application'
        "
      /> -->
    </TabPanel>
    <TabPanel :header="t('common.show')" :disabled="!status || status == `created` || loading">
      <div class="flex-grow-1 flex flex-row align-items-stretch">
        <embed :src="pdf" style="width: 100%; height: 100vh" v-if="pdf" type="application/pdf" />
      </div>
    </TabPanel>
  </TabView>
</template>

<script setup>
import ToolbarMenu from "@/components/ToolbarMenu.vue";
import {
  CamundaService,
  HelpDeskService,
} from "../../../service/helpdesk.service";

import { ref, computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "primevue/usetoast";
import { useStore } from "vuex";
import { useRouter, useRoute } from "vue-router";
// import CourseRegistration from "./CourseRegistration.vue";
import { b64toBlob } from "@/config/config";
import { downloadFile, findRole } from "../../../config/config";
import { DocService } from "@/service/doc.service";
import DocSignaturesInfo from "@/components/DocSignaturesInfo.vue";
import DocEnum from "@/enum/docstates/index";
import camundaServiceInstance from "../../../service/helpdesk.service";
// import { init } from "express/lib/application";
// import { ContragentService } from "@/service/contragent.service";
// import ConsultationManager from "./ConsultationManager.vue";

import CamundaComponent from "./CamundaComponent.vue";
const { t, locale } = useI18n();
const components = ref([]);
const toast = useToast();
const router = useRouter();
const route = useRoute();
const store = useStore();
const service = new HelpDeskService();
const docService = new DocService();
const showMessage = (severity, detail, life) => {
  toast.add({
    severity: severity,
    detail: detail,
    life: life || 3000,
  });
};
function updateQueryStatus(newStatus) {
  // Get the current query parameters
  const currentQuery = { ...router.query };

  // Update the "status" query parameter
  currentQuery.status = newStatus;

  // Replace the route with the updated query parameters
  router.replace({
    name: "Request",
    params: { uuid: uuid.value },
    query: currentQuery,
  });
}
const getDocStatus = (code) => {
  const foundStatus = docStatus.value.find((status) => status.code === code);
  if (foundStatus) {
    switch (locale.value) {
      case "kz":
        return foundStatus.name_kz;
      case "ru":
        return foundStatus.name_ru;
      case "en":
        return foundStatus.name_en;
      default:
        return null;
    }
  } else {
    return null;
  }
};
const selectedPosition = computed(() => store.state.selectedPosition);
const isSaved = ref(false);
const products = [
  {
    name: "Bamboo Watch",
    code: "f230fh0g3",
    quantity: "Accessories",
    category: 24,
  },
];

const addStagestoValue = (stages) => {
  senderComponents.value[0].value = stages;
};

const revisionText = ref(null);
const stages = ref([]);
const description = ref(null);
const changed = ref(false);
const selectedCourses = ref(null);
const isSend = ref(false);
const choseAudience = ref(null);
const specialization = ref(null);
const contactNumber = ref(null);
const category = ref(null);
const directions = ref(null);
const selectedCell = ref(null);
const selectedDateTime = ref(null);
const selectedDirection = ref({
  name_ru: "Заявка на курс",
  name_kz: "Курсқа өтінім",
  name_en: "Application for the course",
});

const lang = ref(null);
const userData = ref({});
// const approving = ref(false);
const loading = ref(false);
const haveAccess = ref(true);
const selectResponse = ref(null);
const visibility = ref({
  documentInfoSidebar: false,
  revisionDialog: false,
  sendToApproveDialog: false,
});
const temp = (columns) => {
  return columns;
};
const docStatus = ref([
  {
    name_kz: "құрылды",
    name_en: "created",
    name_ru: "создан",
    code: "created",
  },
  {
    name_kz: "келісуде",
    name_en: "inapproval",
    name_ru: "на согласовании",
    code: "inapproval",
  },
  {
    name_kz: "келісілді",
    name_en: "approved",
    name_ru: "согласован",
    code: "approved",
  },
  {
    name_kz: "түзетуге",
    name_en: "revision",
    name_ru: "на доработку",
    code: "revision",
  },
  {
    name_kz: "қайтарылды",
    name_en: "rejected",
    name_ru: "отклонен",
    code: "rejected",
  },
  {
    name_kz: "қол қоюда",
    name_en: "signing",
    name_ru: "на подписи",
    code: "signing",
  },
  {
    name_kz: "қол қойылды",
    name_en: "signed",
    name_ru: "подписан",
    code: "signed",
  },
  {
    name_kz: "қайта бекітуге жіберілді",
    name_en: "sent for re-approval",
    name_ru: "отправлен на переутверждение",
    code: "sent for re-approval",
  },
  {
    name_kz: "жаңартылды",
    name_en: "updated",
    name_ru: "обновлен",
    code: "updated",
  },
  { name_kz: "берілді", name_en: "issued", name_ru: "выдан", code: "issued" },
]);
const codesToExclude = [
  "inapproval",
  "approved",
  "rejected",
  "signing",
  "signed",
  "sent for re-approval",
  "updated",
  "issued",
];
const sort = ref(null);
const selectedUsers = ref([]);
const request = ref({
  id: route.params.id,
  status: route.params.status,
  sender_Id: null,
  name_kz: "",
  name_ru: "",
  name_en: "",
  description_kz: description.value,
  description_ru: description.value,
  description_en: description.value,
  doc_id: null,
  category: null,
  uuid: route.params.uuid,
  is_saved: route.params.isCreated,
  local: null,
  date_ranges: null,
  dateTime: null,
  filtered: false,
  doc: null,
});
const isDocSaved = ref(false);
const currentUser = computed(() =>
  JSON.parse(localStorage.getItem("loginedUser"))
);
const finishSenderStep = (approval) => {
  loadingFinish(approval);
  status.value = "inapproval";
  // updateQueryStatus(status.value);
  close("sendToApproveDialog");
};
const loadingFinish = async (approval) => {
  loading.value = true;
  await camundaSenderInstance.finishStep(approval);
  await initTicketInfo(uuid.value)
  loading.value = false;
};
// const selectedPosition = ref(route.params.selectedPosition)
const pdf = ref(null);
const activeTab = ref(0);
// watch(activeTab, (newValue, oldValue) => {
//   if(newValue == 1)
// });
const isAdmin = ref(false);
const saveDoc = async () => {
  // isDataValid();
  var isValid = true;
  for (
    var i = 0;
    i < camundaServiceInstance.currentSchema.components.length;
    i++
  ) {
    if (camundaServiceInstance.currentSchema.components[i].properties && 'selects' in camundaServiceInstance.currentSchema.components[i].properties && !("key" in camundaServiceInstance.currentSchema.components[i])) {
      camundaServiceInstance.currentSchema.components[i].key = camundaServiceInstance.currentSchema.components[i].properties.selects
    }
    if (camundaServiceInstance.currentSchema.components[i].properties && `validate` in camundaServiceInstance.currentSchema.components[i].properties && camundaServiceInstance.currentSchema.components[i].properties.validate) {
      camundaServiceInstance.currentSchema.components[i].validate = { required: true }
    }
    // if(`validate` in camundaServiceInstance.currentSchema.components[i])
    if (
      (`validate` in camundaServiceInstance.currentSchema.components[i] &&
        // camundaServiceInstance.currentSchema.components[i].validate &&
        camundaServiceInstance.currentSchema.components[i].validate &&
        !camundaServiceInstance.currentSchema.components[i].value[
        camundaServiceInstance.currentSchema.components[i].key
        ]) ||
      (camundaServiceInstance.currentSchema.components[i].validate &&
        camundaServiceInstance.currentSchema.components[i].validate.pattern &&
        !validate(
          camundaServiceInstance.currentSchema.components[i].validate.pattern,
          camundaServiceInstance.currentSchema.components[i].value[
          camundaServiceInstance.currentSchema.components[i].key
          ]
        ))
    ) {
      // const regex = '/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/';
      camundaServiceInstance.currentSchema.components[i].incorrect.value = true;
      isValid = false;
      return;
    } else {
      camundaServiceInstance.currentSchema.components[
        i
      ].incorrect.value = false;
    }
  }

  if (isValid) {

    const variables = {};
    for (
      i = 0;
      i < camundaServiceInstance.currentSchema.components.length;
      i++
    ) {
      if (camundaServiceInstance.currentSchema.components[i].type == "table") {
        variables[
          camundaServiceInstance.currentSchema.components[i].properties.selects
        ] =
          camundaServiceInstance.currentSchema.components[i].value[
          camundaServiceInstance.currentSchema.components[
            i
          ].properties.selects
          ];
        continue;
      }
      variables[camundaServiceInstance.currentSchema.components[i].key] =
        camundaServiceInstance.currentSchema.components[i].value[
        camundaServiceInstance.currentSchema.components[i].key
        ];
    }
    loading.value = true;
    await camundaServiceInstance.finishStep(variables);
    loading.value = false;
    isDocSaved.value = true;
    status.value = "created";
    updateQueryStatus("created");
  }
};
// const loading = ref();
const senderComponents = ref([]);
//computed(() =>[
const menu = computed(() => [
  {
    label: t("common.save"),
    icon: "pi pi-fw pi-save",
    disabled: isFormDisabled() || loading.value,
    // disabled: isAdmin.value
    //   ? true
    //   : !isUserDataVaild() ||
    //     (request.value.doc?.docHistory?.stateId != DocEnum.CREATED.ID &&
    //       request.value.doc?.docHistory?.stateId != DocEnum.REVISION.ID &&
    //       request.value.doc?.docHistory?.stateId != null),
    // command: saveDocument,
    command: saveDoc,
  },

  {
    label: t("common.send"),
    icon: "pi pi-fw pi-send",
    disabled: status.value == "inapproval" || loading.value,
    items: [
      {
        label: t("common.tosign"),
        icon: "pi pi-user-edit",
        visible: isDocSaved.value,
        // visible:
        //   !isAdmin.value &&
        //   request.value &&
        //   (request.value.doc?.docHistory?.stateId === DocEnum.CREATED.ID ||
        //     request.value.doc?.docHistory?.stateId === DocEnum.REVISION.ID),
        // command: () => open("sendToApproveDialog"),
        command: () => startSender(),
      },
      {
        label: t("common.revision"),
        icon: "fa-regular fa-circle-xmark",
        visible:
          request.value &&
          request.value.doc?.docHistory?.stateId === DocEnum.INAPPROVAL.ID &&
          needMySign(),
        command: () => open("revisionDialog"),
      },
    ],
  },
  {
    label: t("common.approvalList"),
    icon: "pi pi-user-edit",
    disabled: !status.value || status.value == `created` || loading.value,
    //   !request.value.doc ||
    //   !request.value.doc.docHistory ||
    //   request.value.doc.docHistory?.stateId < DocEnum.INAPPROVAL.ID,
    command: async () => {
      await initTicketInfo(uuid.value)
      open("documentInfoSidebar")
    },
  },
]);

const isFormDisabled = () => {
  return ["inapproval", "approved"].includes(status.value);
}

const revision = () => {
  loading.value = true;
  const req = {
    ticket: request.value,
    comment: revisionText.value,
    approvalStages: request.value.doc.approvalStages,
  };
  service
    .helpDeskDocumentRevision(req)
    .then((res) => {
      loading.value = false;
      close("revisionDialog");

      location.reload();
    })
    .catch((err) => {
      loading.value = false;

      if (err.response && err.response.status == 401) {
        store.dispatch("logLout");
      } else if (
        err.response &&
        err.response.data &&
        err.response.data.localized
      ) {
        showMessage("error", t(err.response.data.localizedPath), null);
        if (err.response.status == 403) {
          haveAccess.value = false;
        }
      } else {
        showMessage(
          "error",
          t("common.message.actionError"),
          t("common.message.actionErrorContactAdmin")
        );
      }
    });
};
const validate = (pattern, str) => {
  if (!pattern && str) {
    return true;
  }
  console.log("str:", str);
  console.log(pattern);



  // Convert the string into a regular expression
  let regex = new RegExp(pattern);

  // Now you can use this regex with test(), match(), etc.
  return regex.test(str);
};
const needMySign = () => {
  if (
    !request.value.doc ||
    !request.value.doc.approvalStages ||
    request.value.doc.approvalStages.length < 1
  ) {
    return false;
  }

  let loginedUser = JSON.parse(localStorage.getItem("loginedUser"));
  let stages = request.value.doc.approvalStages;
  let need = false;

  for (let i = 0; i < stages.length; i++) {
    let nextStage = true;

    for (let j = 0; j < stages[i].users.length; j++) {
      if (
        stages[i].users[j].userID === loginedUser.userID &&
        stages[i].usersApproved[j] === 0
      ) {
        need = true;
        break;
      }

      if (stages[i].usersApproved[j] === 0) {
        nextStage = false;
      }
    }

    if (!nextStage) {
      break;
    }
  }
  return need;
};

const open = (name) => {
  visibility.value[name] = true;
};
const close = (name) => {
  visibility.value[name] = false;
};

lang.value = localStorage.getItem("lang");

const childConsultationInput = (data) => {
  userData.value = data;
};
const validationConsultation = (data) => {
  validation.value = data;
};

const childInput = (data) => {
  userData.value = data;
};
const validateInput = (data) => {
  validation.value = data;
};

const onChecked = (data) => {
  selectedCourses.value = data;
};
const sendToApprove = (approvalUsers) => {
  if (changed.value) {
    showMessage("warn", t("common.tosign"), t("common.message.saveChanges"));
    return;
  }
  loading.value = true;
  const req = {
    ticket: request.value,
    approvalStages: approvalUsers,
  };
  service
    .helpDeskDocApproval(req)
    .then((res) => {
      close("sendToApproveDialog");
      loading.value = false;
      location.reload();
    })
    .catch((err) => {
      loading.value = false;
      if (err.response && err.response.status == 401) {
        store.dispatch("logLout");
      } else if (
        err.response &&
        err.response.data &&
        err.response.data.localized
      ) {
        showMessage("error", t(err.response.data.localizedPath), null);
      }
    });
};

const isDataValid = () => {
  if (camundaServiceInstance.currentSchema.components) {
    return true;
  }
  return false;
};

const isUserDataVaild = () => {
  if (findRole(null, "student")) {
    if (
      userData.value !== null &&
      userData.value.fullName &&
      userData.value.speciality &&
      userData.value.course &&
      userData.value.email &&
      userData.value.phone &&
      selectedCourses.value &&
      selectedCourses.value.length > 0
    ) {
      return true;
    } else {
      return false;
    }
  } else {
    if (
      userData.value !== null &&
      userData.value.discipline &&
      userData.value.fullName &&
      userData.value.speciality &&
      userData.value.course &&
      userData.value.email &&
      userData.value.phone
    ) {
      return true;
    } else {
      return false;
    }
  }
};

const saveDocument = () => {
  loading.value = true;
  let student = null;

  if (request.value.doc.newParams) {
    if (findRole(null, "student")) {
      request.value.doc.newParams.not_formal_education_ids.value =
        selectedCourses.value;
    }

    request.value.doc.newParams.not_formal_student_info.value = userData.value;
    request.value.doc.newParams.lang.value = lang.value;
    request.value.doc.newParams.selectedPosition = selectedPosition.value;
    request.value.is_saved = 1;
    service
      .helpDeskTicketCreate(request.value)
      .then((res) => {
        isSaved.value = true;
        changed.value = false;
        request.value = res.data;
      })
      .catch((err) => {
        loading.value = false;
        if (err.response && err.response.status == 401) {
          store.dispatch("logLout");
        } else if (
          err.response &&
          err.response.data &&
          err.response.data.localized
        ) {
          showMessage("error", t(err.response.data.localizedPath), null);
        }
      });
    isSend.value = true;
  } else {
    request.value.doc.newParams = {};
    if (findRole(null, "student")) {
      let param = {
        value: selectedCourses.value,
        name: "not_formal_education_ids",
      };
      request.value.doc.newParams["not_formal_education_ids"] = param;
    }

    let paramInfo = {
      value: userData.value,
      name: "not_formal_student_info",
    };

    let paramLang = {
      value: lang.value,
      name: "lang",
    };

    request.value.doc.newParams["selectedPosition"] = {
      value: selectedPosition.value,
      name: "selectedPosition",
    };
    request.value.doc.newParams["lang"] = paramLang;
    request.value.doc.newParams["not_formal_student_info"] = paramInfo;

    request.value.is_saved = 1;
    service
      .helpDeskTicketCreate(request.value)
      .then((res) => {
        isSaved.value = true;
        changed.value = false;
        request.value = res.data;
      })
      .catch((err) => {
        loading.value = false;
        if (err.response && err.response.status == 401) {
          store.dispatch("logLout");
        } else if (
          err.response &&
          err.response.data &&
          err.response.data.localized
        ) {
          showMessage("error", t(err.response.data.localizedPath), null);
        }
      });
    isSend.value = true;
  }
};

const search = (data) => {
  alert(data);
};

const toggleFilter = (event) => {
  sort.value = event;
};

const clearStages = () => {
  const users = [];
  if (findRole(null, "student")) {
    stages.value = [
      {
        stage: 1,
        users: null,
        titleRu: "Декан",
        titleKz: "Декан",
        titleEn: "Декан",
        certificate: {
          namekz: "Ішкі құжат айналымы үшін (ГОСТ)",
          nameru: "Для внутреннего документооборота (ГОСТ)",
          nameen: "For internal document management (GOST)",
          value: "internal",
        },
      },
      {
        stage: 2,
        users: null,
        titleRu: "Офис регистратор",
        titleKz: "Кеңсе тіркеушісі",
        titleEn: "Office registrar",
        certificate: {
          namekz: "Ішкі құжат айналымы үшін (ГОСТ)",
          nameru: "Для внутреннего документооборота (ГОСТ)",
          nameen: "For internal document management (GOST)",
          value: "internal",
        },
      },
    ];
  } else {
    stages.value = [
      {
        stage: 1,
        users: selectedUsers,
        titleRu: "Институт непрерывного образования",
        titleKz: "Үздіксіз білім беру институты",
        titleEn: "Institute of Continuing Education",
        certificate: {
          namekz: "Ішкі құжат айналымы үшін (ГОСТ)",
          nameru: "Для внутреннего документооборота (ГОСТ)",
          nameen: "For internal document management (GOST)",
          value: "internal",
        },
      },
    ];
  }
};

const isFilled = Object.values(userData.value).every((value) => value !== null);
const status = ref(null);
const uuid = ref(null);
onMounted(async () => {
  uuid.value = route.params.uuid;
  await initTicketInfo(uuid.value)
  if (!ticketInfo.value.ticket[0].doc.docHistory) {
    status.value = null
  } else {
    status.value = ticketInfo.value.ticket[0].doc.docHistory.stateEn;
  }
  if (status.value == "created") isDocSaved.value = true;

  // Update the requestId reactive variable

  if (
    camundaServiceInstance.processDefinitionKey == "" &&
    camundaServiceInstance.processInstanceKey == ""
  ) {
    camundaServiceInstance.isEdit = true;
    camundaServiceInstance.uuid = uuid.value;
    await camundaServiceInstance.initBasics();
  }
  initForm(camundaServiceInstance, components, 0);
  switch (locale) {
    case "kz":
      request.value.local = 1;
      break;
    case "ru":
      request.value.local = 2;
      break;
    case "en":
      request.value.local = 3;
      break;
    default:
      request.value.local = 1;
      break;
  }
  isAdmin.value =
    findRole(null, "main_administrator") ||
    findRole(null, "career_administrator");
  clearStages();
  // helpDeskTicketGet();
});
let camundaSenderInstance;
const startSender = async () => {
  camundaSenderInstance = new CamundaService();
  camundaSenderInstance.processInstanceKey =
    camundaServiceInstance.processInstanceKey;
  camundaSenderInstance.processDefinitionKey =
    camundaServiceInstance.processDefinitionKey;

  await initForm(camundaSenderInstance, senderComponents);
  open("sendToApproveDialog");
};
const ticketInfo = ref(null)
const initTicketInfo = async (uuid) => {
  const response = await service.helpDeskTicketGet({
    uuid,
    Rows: 10,
    Page: 0
  })
  ticketInfo.value = response.data
  camundaServiceInstance.docUUID = ticketInfo.value.ticket[0].doc.uuid
}
const initForm = async (
  camundaServiceInstance,
  components,
  forceGet = null
) => {
  await camundaServiceInstance.initCurrentForm(forceGet);
  await camundaServiceInstance.setCurrentSchema();
  await camundaServiceInstance.initProperties();
  components.value = camundaServiceInstance.currentSchema.components;
  if (!camundaServiceInstance.isEdit) return;
  const variables = await camundaServiceInstance.getProcessVariable();
  if (variables == undefined) return;
  for (var i = 0; i < components.value.length; i++) {
    if (components.value[i].type == "datetime") {
      components.value[i].value[components.value[i].key] = new Date(variables[components.value[i].key])
      continue;
    }
    components.value[i].value[components.value[i].key] =
      variables[components.value[i].key];
  }
};
const tabChanged = () => {
  if (activeTab.value === 1) {
    // if (
    // !request.value ||
    // !request.value.doc ||
    // request.value.doc.filePath.length < 1
    !isDocSaved.value;
    // )
    //   return;
    downloadContract();
  }
};

const downloadContract = async () => {
  camundaServiceInstance.docUUID = ""
  loading.value = true;
  // if (
  //     !request.value ||
  //     !request.value.doc ||
  //     request.value.doc.filePath.length < 1
  // )
  //     return;

  // if (pdf.value) {
  //   return;
  // }
  // await camundaServiceInstance.setDocUUID();
  if (!ticketInfo.value.ticket[0].doc.uuid) return;
  camundaServiceInstance.docUUID = ticketInfo.value.ticket[0].doc.uuid
  docService
    .downloadDocumentV2({
      // uuid: uuid.value,
      uuid: ticketInfo.value.ticket[0].doc.uuid,
    })
    .then((res) => {
      pdf.value = b64toBlob(res.data);

      loading.value = false;
    })
    .catch((err) => {
      loading.value = false;

      if (err.response && err.response.data && err.response.data.localized) {
        showMessage("error", t(err.response.data.localizedPath), null);
      } else {
        showMessage(
          "error",
          t("common.message.actionError"),
          t("common.message.actionErrorContactAdmin")
        );
      }
    });
};

const userDataDisabled = computed(() => {
  return !userData.value;
});

const isSaveItemsRequest = computed(() => {
  return (
    choseAudience.value !== null ||
    specialization.value !== null ||
    description.value !== null ||
    contactNumber.value !== null
  );
});
</script>

<style scoped>
.progress-spinner {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
  z-index: 1102;
}

.arrow-icon {
  cursor: pointer;
  font-size: 1.25rem;
  margin-right: 1rem;
  display: flex;
  align-items: center;
}

.card {
  flex-grow: 1;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  margin-bottom: 0px;
}

.status-status_created {
  background: #6c757d;
  color: #fff;
}

.status-status_signing {
  background: #17a2b8;
  color: #fff;
}

.status-status_signed {
  background: #28a745;
  color: #fff;
}

.status-status_inapproval {
  background: #9317b8;
  color: #ffffff;
}

.status-status_approved {
  background: #007bff;
  color: #ffffff;
}

.status-status_revision {
  background: #ffcdd2;
  color: #c63737;
}

:deep(.p-datatable-footer),
:deep(.p-button-link),
:deep(.p-datatable-thead > tr > th) {
  padding-top: 0rem;
  padding-bottom: 0rem;
}
</style>
