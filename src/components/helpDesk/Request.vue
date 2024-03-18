<template>
  <div class="flex flex-row mb-3">
    <div v-if="!uuid" class="arrow-icon" @click="router.back()">
      <i class="fas fa-arrow-left"></i>
    </div>
    <h4 class="m-0">{{ t("helpDesk.application.applicationName") }}</h4>
  </div>
  <!-- @search="search" :search="true" @filter="toggleFilter(event)" :filter="true" :filtered="filtered"  -->
  <ToolbarMenu v-if="request" :data="menu" />
  <TabView v-model:activeIndex="activeTab" @tab-change="tabChanged" class="flex flex-column flex-grow-1">
    <TabPanel :header="selectedDirection['name_' + locale]">
      <BlockUI v-if="haveAccess && selectedDirection && selectedDirection.code !== 'course_application'" :blocked="loading" class="card">
        <div class="">
          <div class="p-fluid md:col-6">
            <label>{{ t('helpDesk.application.categoryApplication') }}</label>
            <InputText type="text" v-model="selectedDirection['name_' + locale]" disabled />
          </div>
          <div v-if="selectedDirection && selectedDirection.code === 'office_booking'">
            <div class="p-fluid md:col-6">
              <label>{{ t('helpDesk.application.choseAudience') }}</label>
              <Dropdown v-model="choseAudience" optionLabel="name" optionValue="id" :placeholder="t('common.select')" />
            </div>
            <div class="p-fluid md:col-6">
              <label>{{ t('helpDesk.application.date') }}</label>
              <PrimeCalendar v-model="request.date_ranges" dateFormat="dd.mm.yy" :placeholder="t('common.select')" :monthNavigator="true"
                :yearNavigator="true" yearRange="1990:2050" />
            </div>
            <div class="p-fluid md:col-6">
              <label>{{ t('helpDesk.application.dateTime') }}</label>
              <PrimeCalendar id="calendar-timeonly" :placeholder="t('common.select')" v-model="request.dateTime" timeOnly />
            </div>
          </div>
          <div v-if="selectedDirection && selectedDirection.code === 'appointment'">
            <div class="p-fluid md:col-6">
              <label>{{ t('helpDesk.application.selectSpecialist') }}</label>
              <Dropdown v-model="specialization" optionLabel="name" optionValue="id" :placeholder="t('common.select')" />
            </div>
            <div class="p-fluid md:col-6">
              <label>{{ t('helpDesk.application.date') }}</label>
              <PrimeCalendar v-model="request.date_ranges" dateFormat="dd.mm.yy" :placeholder="t('common.select')" :monthNavigator="true"
                :yearNavigator="true" yearRange="1990:2050" />
            </div>
            <div class="p-fluid md:col-6">
              <label>{{ t('helpDesk.application.dateTime') }}</label>
              <PrimeCalendar id="calendar-timeonly" :placeholder="t('common.select')" v-model="request.dateTime" timeOnly />
            </div>
          </div>
          <div class="p-fluid md:col-6">
            <label>{{ t('helpDesk.application.description') }}</label>
            <Textarea class="mt-2" v-model="request.description_ru" autoResize rows="5" cols="30" />
          </div>
          <div class="p-fluid md:col-6">
            <label>{{ t('helpDesk.application.contactNumber') }}</label>
            <InputText class="mt-2" v-model="contactNumber" />
          </div>
        </div>
        <template #footer>
          <Button :label="t('common.cancel')" icon="pi pi-times" class="p-button-rounded p-button-danger" @click="closeBasic" />
          <Button :label="t('common.createNew')" icon="pi pi-check" class="p-button-rounded p-button-success mr-2" :disabled="isDisabled && lang"
            @click="createHelpDesk" />
        </template>
      </BlockUI>
      <!-- sendToApproveDialog -->
      <Dialog :header="t('common.action.sendToApprove')" v-model:visible="visibility.sendToApproveDialog" :style="{ width: '50vw' }">
        <div class="p-fluid">
          <ApprovalUsers :approving="approving" v-model="selectedUsers" @closed="close('sendToApproveDialog')" @approve="sendToApprove($event)"
            :stages="stages" mode="standard"></ApprovalUsers>
        </div>
      </Dialog>
      <!-- revisionDialog -->
      <Dialog :header="$t('common.revision')" :modal="true" v-model:visible="visibility.revisionDialog" style="width: 30vw;">
        <div class="p-fluid col-12">
          <Textarea v-model="revisionText" autoResize rows="5" cols="30" />
        </div>
        <template #footer>
          <Button class="p-button-danger" :disabled="!revisionText" :label="t('common.revision')" @click="revision()" />
          <Button :label="t('common.cancel')" @click="close('revisionDialog')" />
        </template>
      </Dialog>

      <Sidebar v-model:visible="visibility.documentInfoSidebar" position="right" class="p-sidebar-lg">
        <DocSignaturesInfo :docIdParam="request.doc.uuid"></DocSignaturesInfo>
      </Sidebar>
      <CourseRegistration :courseRequest="request" @onCheckboxChecked="onChecked" @childInputData="childInput"
        v-if="selectedDirection && selectedDirection.code === 'course_application'" />
    </TabPanel>
    <TabPanel :header="t('common.show')" :disabled="!request || !request.doc || !request.doc.filePath || request.doc.filePath.length < 1">
      <div class="flex-grow-1 flex flex-row align-items-stretch">
        <embed :src="pdf" style="width: 100%; height: 100vh;" v-if="pdf" type="application/pdf" />
      </div>
    </TabPanel>
  </TabView>

</template>


<script setup>
import ToolbarMenu from "@/components/ToolbarMenu.vue";
import { HelpDeskService } from "../../service/helpdesk.service";
import ApprovalUsers from "@/components/ncasigner/ApprovalUsers/ApprovalUsers";
import { ref, computed, onMounted } from 'vue';
import { useI18n } from "vue-i18n";
import { useToast } from "primevue/usetoast";
import { useStore } from "vuex";
import { useRouter, useRoute } from "vue-router";
import CourseRegistration from "./CourseRegistration.vue";
import { b64toBlob } from "@/config/config";
import { downloadFile, findRole } from "../../config/config";
import { DocService } from "@/service/doc.service";
import DocSignaturesInfo from "@/components/DocSignaturesInfo.vue";
import DocEnum from "@/enum/docstates/index";


const { t, locale } = useI18n()
const store = useStore()
const toast = useToast()
const router = useRouter();
const route = useRoute();
const service = new HelpDeskService()
const docService = new DocService()
const showMessage = (severity, detail, life) => {
  toast.add({
    severity: severity,
    detail: detail,
    life: life || 3000,
  });
};
const isSaved = ref(false)
const revisionText = ref(null)
const stages = ref([]);
const description = ref(null)
const changed = ref(false)
const selectedCourses = ref(null)
const isSend = ref(false)
const choseAudience = ref(null);
const specialization = ref(null);
const contactNumber = ref(null);
const category = ref(null);
const directions = ref(null);
const selectedCell = ref(null);
const selectedDateTime = ref(null);
const selectedDirection = ref({
  name_ru: null,
  name_kz: null,
  name_en: null,
});
const lang = ref(null)
const userData = ref({})
const approving = ref(false)
const loading = ref(false)
const haveAccess = ref(true);
const selectResponse = ref(null);
const visibility = ref({
  documentInfoSidebar: false,
  revisionDialog: false,
  sendToApproveDialog: false,
});
const docStatus = ref([
  { name_kz: "құрылды", name_en: "created", name_ru: "создан", code: "created" },
  { name_kz: "келісуде", name_en: "inapproval", name_ru: "на согласовании", code: "inapproval" },
  { name_kz: "келісілді", name_en: "approved", name_ru: "согласован", code: "approved" },
  { name_kz: "түзетуге", name_en: "revision", name_ru: "на доработку", code: "revision" },
  { name_kz: "қайтарылды", name_en: "rejected", name_ru: "отклонен", code: "rejected" },
  { name_kz: "қол қоюда", name_en: "signing", name_ru: "на подписи", code: "signing" },
  { name_kz: "қол қойылды", name_en: "signed", name_ru: "подписан", code: "signed" },
  { name_kz: "қайта бекітуге жіберілді", name_en: "sent for re-approval", name_ru: "отправлен на переутверждение", code: "sent for re-approval" },
  { name_kz: "жаңартылды", name_en: "updated", name_ru: "обновлен", code: "updated" },
  { name_kz: "берілді", name_en: "issued", name_ru: "выдан", code: "issued" },
]);
const codesToExclude = ["inapproval", "approved", "rejected", "signing", "signed", "sent for re-approval", "updated", "issued"];
const sort = ref(null);
const selectedUsers = ref([]);
const request = ref({
  id: route.params.id,
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
  doc: null
});
const pdf = ref(null)
const activeTab = ref(0)

//computed(() =>[
const menu = computed(() => [
  {
    label: t("common.save"),
    icon: "pi pi-fw pi-save",
    disabled: !isUserDataVaild() || (request.value.doc?.docHistory?.stateId != DocEnum.CREATED.ID &&
      request.value.doc?.docHistory?.stateId != DocEnum.REVISION.ID && request.value.doc?.docHistory?.stateId != null),
    command: saveDocument
  },

  {
    label: t("common.send"),
    icon: "pi pi-fw pi-send",
    disabled: !request.value,
    items: [
      {
        label: t("common.tosign"),
        icon: "pi pi-user-edit",
        visible: request.value && (request.value.doc?.docHistory?.stateId === DocEnum.CREATED.ID ||
          request.value.doc?.docHistory?.stateId === DocEnum.REVISION.ID),
        command: () => open('sendToApproveDialog')
      },
      {
        label: t("common.revision"),
        icon: "fa-regular fa-circle-xmark",
        visible: request.value && request.value.doc?.docHistory?.stateId === DocEnum.INAPPROVAL.ID &&
          needMySign(),
        command: () => open('revisionDialog')
      },
    ]
  },
  {
    label: t('common.approvalList'),
    icon: "pi pi-user-edit",
    disabled: !request.value.doc || !request.value.doc.docHistory || request.value.doc.docHistory?.stateId < DocEnum.INAPPROVAL.ID,
    command: () => open('documentInfoSidebar')
  }
]);


const revision = () => {
  loading.value = true;
  const req = {
    ticket: request.value,
    comment: revisionText.value,
    approvalStages: request.value.doc.approvalStages
  }
  service.helpDeskDocumentRevision(req).then(res => {
    loading.value = false;
    close("revisionDialog");

    location.reload();
  }).catch(err => {
    loading.value = false;

    if (err.response && err.response.status == 401) {
      store.dispatch("logLout");
    } else if (err.response && err.response.data && err.response.data.localized) {
      showMessage('error', t(err.response.data.localizedPath), null);
      if (err.response.status == 403) {
        haveAccess.value = false;
      }
    } else {
      console.log(err)
      showMessage('error', t('common.message.actionError'), t('common.message.actionErrorContactAdmin'))
    }
  })
}
const needMySign = () => {
  if (!request.value.doc || !request.value.doc.approvalStages || request.value.doc.approvalStages.length < 1) {
    return false;
  }

  let loginedUser = JSON.parse(localStorage.getItem("loginedUser"));
  let stages = request.value.doc.approvalStages;
  let need = false;

  for (let i = 0; i < stages.length; i++) {
    let nextStage = true;

    for (let j = 0; j < stages[i].users.length; j++) {
      if (stages[i].users[j].userID === loginedUser.userID && stages[i].usersApproved[j] === 0) {
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
  console.log(need)
  return need;
}



const open = (name) => {
  visibility.value[name] = true;
};
const close = (name) => {
  visibility.value[name] = false;
};

lang.value = localStorage.getItem("lang")

const childInput = (data) => {
  userData.value = data
}

const onChecked = (data) => {
  selectedCourses.value = data
}
const sendToApprove = (approvalUsers) => {
  if (changed.value) {
    showMessage("warn", t("common.tosign"), t("common.message.saveChanges"));
    return;
  }
  loading.value = true
  const req = {
    ticket: request.value,
    approvalStages: approvalUsers,
  }
  service.helpDeskDocApproval(req).then(res => {
    close("sendToApproveDialog");
    loading.value = false
    location.reload();
  }).catch(err => {
    loading.value = false
    if (err.response && err.response.status == 401) {
      store.dispatch("logLout")
    } else if (err.response && err.response.data && err.response.data.localized) {
      showMessage('error', t(err.response.data.localizedPath), null)
    } else {
      console.log(err)
    }
  });
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

}


const saveDocument = () => {
  loading.value = true;
  let student = null


  request.value.doc.newParams = {}
  if (findRole(null, "student")) {
    let param = {
      value: selectedCourses.value,
      name: "not_formal_education_ids"
    }
    request.value.doc.newParams['not_formal_education_ids'] = param
  }
  let paramInfo = {
    value: userData.value,
    name: "not_formal_student_info"
  }
  let paramLang = {
    value: lang.value,
    name: "lang"
  }

  request.value.doc.newParams['lang'] = paramLang
  request.value.doc.newParams['not_formal_student_info'] = paramInfo

  request.value.is_saved = 1
  console.log(request.value)
  service.helpDeskTicketCreate(request.value)
    .then(res => {
      isSaved.value = true
      changed.value = false;
      request.value = res.data
    }).catch(err => {
      loading.value = false
      if (err.response && err.response.status == 401) {
        store.dispatch("logLout")
      } else if (err.response && err.response.data && err.response.data.localized) {
        showMessage('error', t(err.response.data.localizedPath), null)
      } else {
        console.log(err)
      }
    });
  isSend.value = true;

};

const search = (data) => {
  alert(data);
};

const toggleFilter = (event) => {
  sort.value = event;
};

const clearStages = () => {
  selectedUsers.value = [];
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
        value: "internal"
      },
    }
  ];
  stages.value.push(
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
        value: "internal"
      },
    },
  );
};


const isFilled = Object.values(userData.value).every(value => value !== null);

onMounted(() => {
  switch (locale) {
    case 'kz':
      request.value.local = 1;
      break;
    case 'ru':
      request.value.local = 2;
      break;
    case 'en':
      request.value.local = 3;
      break;
    default:
      request.value.local = 1;
      break;
  }
  clearStages()
  helpDeskTicketGet()
})

const helpDeskTicketGet = () => {
  loading.value = true
  service.helpDeskTicketGet({
    ID: null,
    SearchText: null,
    Page: 0,
    Rows: 10,
    uuid: route.params.uuid,
  })
    .then((res) => {
      request.value = res.data.ticket[0]
      selectedDirection.value = res.data.ticket[0].category;
      loading.value = false
    })
    .catch((err) => {
      loading.value = false
      if (err.response.status == 401) {
        store.dispatch('logLout');
      }
      toast.add({
        severity: 'error',
        detail: t('common.message.saveError'),
        life: 3000,
      });
    });
}
const tabChanged = () => {
  if (activeTab.value === 1) {
    if (!request.value || !request.value.doc || request.value.doc.filePath.length < 1) return;

    downloadContract();
  }
}

const downloadContract = () => {
  loading.value = true
  if (!request.value || !request.value.doc || request.value.doc.filePath.length < 1) return;

  if (pdf.value) {
    return;
  }

  docService.downloadDocumentV2({
    uuid: request.value.doc.uuid
  }).then(res => {
    pdf.value = b64toBlob(res.data);

    loading.value = false;
  }).catch(err => {
    loading.value = false;

    if (err.response && err.response.data && err.response.data.localized) {
      showMessage('error', t(err.response.data.localizedPath), null)
    } else {
      console.log(err)
      showMessage('error', t('common.message.actionError'), t('common.message.actionErrorContactAdmin'))
    }
  })
}

const userDataDisabled = computed(() => {
  return !userData.value
})

const isSaveItemsRequest = computed(() => {
  return choseAudience.value !== null || specialization.value !== null || description.value !== null || contactNumber.value !== null;
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