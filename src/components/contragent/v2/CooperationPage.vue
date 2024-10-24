<template>
  <ProgressSpinner v-if="loading" class="progress-spinner" strokeWidth="5"/>
  <TitleBlock :title="t('contracts.cooperationDocument')" :show-back-button="false"></TitleBlock>
  <Menubar :model="menu" class="m-0 pt-0 pb-0"></Menubar>
  <div class="card p-fluid">
    <div class="grid formgrid">
      <div class="field col-12 md:col-6">
        <label>{{ t("contracts.doc_type_kz") }}<span class="p-error">*</span></label>
        <InputText v-model="cooperationDocument.name_kz" :placeholder="t('contracts.doc_type_kz')" required />
        <small class="p-error" v-if="validationErrors.name_kz">{{ t('common.requiredField') }}</small>
      </div>

      <div class="field col-12 md:col-6">
        <label>{{ t("contracts.doc_type_ru") }}<span class="p-error">*</span></label>
        <InputText v-model="cooperationDocument.name_ru" :placeholder="t('contracts.doc_type_ru')" required />
        <small class="p-error" v-if="validationErrors.name_ru">{{ t('common.requiredField') }}</small>
      </div>

      <div class="field col-12 md:col-6">
        <label>{{ t("contracts.doc_type_en") }}<span class="p-error">*</span></label>
        <InputText v-model="cooperationDocument.name_en" :placeholder="t('contracts.doc_type_en')" required />
        <small class="p-error" v-if="validationErrors.name_en">{{ t('common.requiredField') }}</small>
      </div>

      <div class="field col-12 md:col-6">
        <label>{{ t("contracts.doc_number") }}</label>
        <InputText v-model="cooperationDocument.number" :placeholder="t('contracts.doc_number')" />
      </div>

      <div class="field col-12">
        <label>{{ t("contracts.subject_document") }}<span class="p-error">*</span></label>
        <div class="p-formgrid p-grid">
          <div class="field-checkbox" v-for="subject in cooperationSubjects" :key="subject.id">
            <Checkbox :inputId="subject.id" v-model="subject.is_noted" :binary="true" />
            <label :for="subject.id">{{ subject['name_'+locale] }}</label>
          </div>
        </div>
      </div>

      <div class="field col-12 md:col-6">
        <label>{{ t("contracts.date_conclusion") }}<span class="p-error">*</span></label>
        <PrimeCalendar v-model="cooperationDocument.date_signature"
                       :placeholder="t('contracts.date_conclusion')" showIcon dateFormat="dd.mm.yy" />
        <small class="p-error" v-if="validationErrors.signature_date">{{ t('common.requiredField') }}</small>
      </div>

      <div class="field col-12 md:col-6">
        <label>{{ t("common.startDate") }}<span class="p-error">*</span></label>
        <PrimeCalendar v-model="cooperationDocument.start_date" :placeholder="t('common.startDate')" showIcon dateFormat="dd.mm.yy" />
        <small class="p-error" v-if="validationErrors.start_date">{{ t('common.requiredField') }}</small>
      </div>

      <div class="field-checkbox col-12 md:col-6">
        <Checkbox v-model="cooperationDocument.indefinite" inputId="indefinite" :binary="true"/>
        <label for="indefinite">{{ t("contracts.indefinite") }}</label>
      </div>

      <div class="field col-12 md:col-6">
        <label>{{ t("common.endDate") }}<span v-if="!cooperationDocument.indefinite" class="p-error">*</span></label>
        <PrimeCalendar v-model="cooperationDocument.end_date" :disabled="cooperationDocument.indefinite" :placeholder="t('common.endDate')" showIcon dateFormat="dd.mm.yy" />
        <small class="p-error" v-if="validationErrors.end_date">{{ t('common.requiredField') }}</small>
      </div>

      <div class="field-checkbox col-12 md:col-12">
        <Checkbox v-model="cooperationDocument.is_termination_reason" inputId="is_termination_reason" :binary="true"/>
        <label for="is_termination_reason">{{ t("contracts.early_termination") }}</label>
      </div>

      <div v-if="cooperationDocument.is_termination_reason" class="field col-12 md:col-4">
        <label>{{ t("common.reason") }} {{t("common.language.kz")}}<span class="p-error">*</span></label>
        <InputText v-model="cooperationDocument.termination_reason_kz" />
        <small class="p-error" v-if="validationErrors.termination_reason_kz">{{ t('common.requiredField') }}</small>
      </div>

      <div v-if="cooperationDocument.is_termination_reason" class="field col-12 md:col-4">
        <label>{{ t("common.reason") }} {{t("common.language.ru")}}<span class="p-error">*</span></label>
        <InputText v-model="cooperationDocument.termination_reason_ru"/>
        <small class="p-error" v-if="validationErrors.termination_reason_ru">{{ t('common.requiredField') }}</small>
      </div>

      <div v-if="cooperationDocument.is_termination_reason" class="field col-12 md:col-4">
        <label>{{ t("common.reason") }} {{t("common.language.en")}}<span class="p-error">*</span></label>
        <InputText v-model="cooperationDocument.termination_reason_en"/>
        <small class="p-error" v-if="validationErrors.termination_reason_en">{{ t('common.requiredField') }}</small>
      </div>

      <div v-if="cooperationDocument.is_termination_reason" class="field col-12">
        <label>{{ t("common.endDate") }}<span class="p-error">*</span></label>
        <PrimeCalendar v-model="cooperationDocument.termination_reason_date" :disabled="!cooperationDocument.is_termination_reason" :placeholder="t('common.endDate')" showIcon dateFormat="dd.mm.yy" />
        <small class="p-error" v-if="validationErrors.termination_reason_date">{{ t('common.requiredField') }}</small>
      </div>

      <!-- file uploads -->
      <div class="field col-12">
        <label>{{ t("ncasigner.uploadScanDoc") }}</label>
        <FileUpload
            mode="basic"
            accept=".pdf"
            :customUpload="true"
            :auto="true"
            :chooseLabel="t('ncasigner.chooseFile')"
            @uploader="uploadScannedFile"
            ref="scannedFileUploader"
        />
        <!-- <small class="p-error" v-if="validationErrors.filePath">{{ t("common.requiredField") }}</small> -->
      </div>

      <InlineMessage severity="info" class="mt-2" show v-if="tempScannedFileData.scannedfilename">
        {{ t('ncasigner.chosenFile', {fn: tempScannedFileData.scannedfilename ? tempScannedFileData.scannedfilename : ""}) }}
      </InlineMessage>

      <div v-if="cooperationDocument.scanned_file_path" class="field col-12">
        <h6>{{ t('hdfs.fileName') }}</h6>
        <a @click="downloadFile(cooperationDocument.scanned_file_name, cooperationDocument.scanned_file_path)" style="cursor: pointer;">{{ cooperationDocument.scanned_file_name }}</a>
      </div>


      <div class="field col-12">
        <label>{{ t("ncasigner.uploadAdditionalDoc") }}</label>
        <FileUpload
            mode="basic"
            accept=".pdf"
            :customUpload="true"
            :auto="true"
            :chooseLabel="t('ncasigner.chooseFile')"
            @uploader="uploadFile"
            ref="fileUploader"
        />
        <!-- <small class="p-error" v-if="validationErrors.filePath">{{ t("common.requiredField") }}</small> -->
      </div>

      <InlineMessage severity="info" class="mt-2" show v-if="tempFileData.filename">
        {{ t('ncasigner.chosenFile', {fn: tempFileData.filename ? tempFileData.filename : ""}) }}
      </InlineMessage>

      <div v-if="cooperationDocument.file_path" class="field col-12">
        <h6>{{ t('hdfs.fileName') }}</h6>
        <a @click="downloadFile(cooperationDocument.file_name, cooperationDocument.file_path)" style="cursor: pointer;">{{ cooperationDocument.file_name }}</a>
      </div>

    </div>
  </div>

  <Sidebar position="right" class="p-sidebar-lg"
           style="width: 50%;"  v-model:visible="subjectDialog">
    <TitleBlock :title="t('contracts.subject_document')" :show-back-button="false"></TitleBlock>

    <Menubar :model="menu" class="m-0 pt-0 pb-0"></Menubar>
    <div class="card p-fluid">
      <div class="grid formgrid">
      <div class="field col-12 md:col-4">
        <label>{{ t('contracts.subject_document') }} {{t('common.language.kz')}}<span class="p-error">*</span></label>
        <InputText v-model="cooperationSubject.name_kz"  required />
        <small class="p-error" v-if="validationErrors.name_kz">{{ t('common.requiredField') }}</small>
      </div>

      <div class="field col-12 md:col-4">
        <label>{{ t('contracts.subject_document') }} {{t('common.language.ru')}}<span class="p-error">*</span></label>
        <InputText v-model="cooperationSubject.name_ru" required />
        <small class="p-error" v-if="validationErrors.name_ru">{{ t('common.requiredField') }}</small>
      </div>

      <div class="field col-12 md:col-4">
        <label>{{ t('contracts.subject_document') }} {{t('common.language.en')}}<span class="p-error">*</span></label>
        <InputText v-model="cooperationSubject.name_en" required />
        <small class="p-error" v-if="validationErrors.name_en">{{ t('common.requiredField') }}</small>
      </div>
      </div>
    </div>
  </Sidebar>

</template>

<script setup>
import { onMounted, ref, defineProps } from "vue";
import {useI18n} from "vue-i18n";
import {useToast} from "primevue/usetoast";
import { ContragentService } from "@/service/contragent.service";
import {getHeader, smartEnuApi} from "@/config/config";

const {t, locale} = useI18n()
const toast = useToast()
const areaOfInterest = ref(null)
const loading = ref(false)
const service = new ContragentService
const changed = ref(false)
const subjectDialog = ref(false)
// const countries = ref([])
const countryTotal = ref(0)

const props = defineProps({
  orgId: {
    type: Number,
    default: null
  },
  modelValue: {
    type: null,
    default: null
  },
  onClose: Function
})

const menu =  ref([
  {
    label: t("common.save"),
    icon: "pi pi-fw pi-save",
    // disabled: !changed.value,
    command: () => {
      if (!subjectDialog.value){
        saveCooperationDocument()
      } else {
        createNewSubject()
      }
    },
  },
  {
    label: t("common.add") + ' ' + t('contracts.subject_document').toLowerCase(),
    icon: "fa-solid fa-plus",
    visible: () => !subjectDialog.value,
    command: () => { openNewSubject() },
  },
])


const cooperationSubjects = ref([])

const cooperationDocument = ref(props.modelValue || {
  id: null,
  org_id: props.orgId || null,
  // locality: null,
  indefinite: false,
  date_signature: null,
  start_date: null,
  end_date: null,
  number: '',
  name_kz: '',
  name_ru: '',
  name_en: '',
  subjects: [],
  created_at: null,
  updated_at: null,
  is_termination_reason: false,
  termination_reason_kz: null,
  termination_reason_ru: null,
  termination_reason_en: null,
  termination_reason_date: null,
});

const cooperationSubject = ref({
  name_kz: "",
  name_ru: "",
  name_en: "",
  org_id: props.orgId,
})

const validationErrors = ref({});

const fileData = ref({
  filename: null,
  filepath: null,
})

const tempFileData = ref({
  filename: null,
  filepath: null,
})

const tempScannedFileData = ref({
  scannedfilename: null,
  scannedfilepath: null,
})

function saveCooperationDocument() {
  if (!validateForm()) {
    showMessage('warn', t('common.message.fillError'), null);
    return;
  }

  cooperationDocument.value.subjects = cooperationSubjects.value

  const fd = new FormData();

  fd.append("cooperation", JSON.stringify(cooperationDocument.value))
  
  if (tempFileData.value.filepath) {
    fd.append("file", tempFileData.value.filepath);
  }

  if (tempScannedFileData.value.scannedfilepath) {
    fd.append("scanfile", tempScannedFileData.value.scannedfilepath);
  }

  service.updateCooperation(fd)
      .then((response) => {

        showMessage('success', t('common.message.succesSaved'), null);
        handleClose()
      })
      .catch((error) => {
        console.error('Failed to save document:', error);
      });
}


function openNewSubject() {
  cooperationSubject.value = {
    name_kz: "",
    name_ru: "",
    name_en: "",
    org_id: cooperationDocument.value.org_id,
  }

  subjectDialog.value = true
}

function createNewSubject() {
  if (!validateSubject()) {
    showMessage('warn', t('common.message.fillError'), null);
    return;
  }
 
  service.createCooperationSubject(cooperationSubject.value)
    .then((response) => {
      showMessage('success', t('common.message.successSaved'), null);
      subjectDialog.value = false
      getCoopertationSubjects()
    })
    .catch((error) => {
      console.error('Failed to save document:', error);
      showMessage('error', t('common.message.errorSaving'), null);
    });

}

function validateSubject() {
  validationErrors.value = {};
  if (!cooperationSubject.value.name_kz) validationErrors.value.name_kz = true;
  if (!cooperationSubject.value.name_ru) validationErrors.value.name_ru = true;
  if (!cooperationSubject.value.name_en) validationErrors.value.name_en = true;

  return Object.keys(validationErrors.value).length === 0;
}


function validateForm() {
  validationErrors.value = {};
  if (!cooperationDocument.value.name_kz) validationErrors.value.name_kz = true;
  if (!cooperationDocument.value.name_ru) validationErrors.value.name_ru = true;
  if (!cooperationDocument.value.name_en) validationErrors.value.name_en = true;
  if (!cooperationDocument.value.date_signature) validationErrors.value.signature_date = true;

  if (cooperationDocument.value.indefinite) {
    if (!cooperationDocument.value.start_date) validationErrors.value.start_date = true;
  } else {
    if (!cooperationDocument.value.start_date) validationErrors.value.start_date = true;
    if (!cooperationDocument.value.end_date) validationErrors.value.end_date = true;
  }

  if (cooperationDocument.value.is_termination_reason) {
    if (!cooperationDocument.value.termination_reason_kz) validationErrors.value.termination_reason_kz = true;
    if (!cooperationDocument.value.termination_reason_ru) validationErrors.value.termination_reason_ru = true;
    if (!cooperationDocument.value.termination_reason_en) validationErrors.value.termination_reason_en = true;
    if (!cooperationDocument.value.termination_reason_date) validationErrors.value.termination_reason_date = true;
  }

  return Object.keys(validationErrors.value).length === 0;
}

function cancel() {
  // Implement cancel logic here
}

function showMessage(msgtype, message, content) {
  toast.add({
    severity: msgtype,
    summary: message,
    detail: content,
    life: 3000
  });
}

function getCoopertationSubjects() {
  const data = {
    org_id: cooperationDocument.value.org_id,
    id: cooperationDocument.value.id,
  };

  service.getCooperationSubjects(data)
      .then((response) => {
        cooperationSubjects.value = response.data.subjects;
      })
      .catch((error) => {
        toast.add({severity: "error", summary: t('common.getDataError'), life: 3000});
      });
}

function handleClose() {
  if (props.onClose) {
    props.onClose();
  }
}

function onUpload(event) {
  const file = event.files[0];
  cooperationDocument.value.file = file;
  showMessage('success', t('common.message.fileUploaded'), null);
}

function downloadFile(filename, filepath) {
  loading.value = true;

  fetch(`${smartEnuApi}/serve?path=${encodeURIComponent(filepath)}`, {
    method: 'GET',
    headers: getHeader(),
  })
      .then((response) => {
        if (!response.ok) {
          throw response;
        }
        return response.blob();
      })
      .then((blob) => {
        loading.value = false;

        // Create a URL for the blob object
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);  // Clean up the URL object
      })
      .catch((error) => {
        loading.value = false;

        if (error.status === 401) {
          store.dispatch("logOut");
        } else if (error.json) {
          error.json().then((errData) => {
            if (errData.localized) {
              showMessage('error', t(errData.localizedPath), null);
            } else {
              showMessage('error', t('common.message.actionError'), t('common.message.actionErrorContactAdmin'));
            }
          }).catch(() => {
            showMessage('error', t('common.message.actionError'), t('common.message.actionErrorContactAdmin'));
          });
        } else {
          showMessage('error', t('common.message.actionError'), t('common.message.actionErrorContactAdmin'));
        }
      });
}


function uploadFile(event) {
  if (event && event.files && event.files.length > 0) {
    tempFileData.value.filename = event.files[0].name;

    tempFileData.value.filepath = event.files[0];
  } else {
    tempFileData.value.filename = null;
    tempFileData.value.filepath = null;
  }
}

function uploadScannedFile(event) {
  if (event && event.files && event.files.length > 0) {
    tempScannedFileData.value.scannedfilename = event.files[0].name;
    tempScannedFileData.value.scannedfilepath = event.files[0];
  } else {
    tempScannedFileData.value.scannedfilename = null;
    tempScannedFileData.value.scannedfilepath = null;
  }
}

function countryLabel(data) {
  if (data === undefined || data === null) {
    return ''
  }
  return data['name_'+locale.value]
}

// function getCountries() {
//   const req = {
//     searchText: null,
//   }
//   service.getLocality(req).then(res => {
//     countries.value = res.data.locality;
//     countryTotal.value = res.data.total;
//   }).catch(err => {
//     countries.value = [];
//     countryTotal.value = 0;

//     if (err.response && err.response.status == 401) {
//       store.dispatch("logLout");
//     } else if (err.response && err.response.data && err.response.data.localized) {
//       showMessage('error', t(err.response.data.localizedPath), null);
//     } else {
//       showMessage('error', t('common.message.actionError'), t('common.message.actionErrorContactAdmin'));
//     }
//   });
// }

onMounted(() => {
  getCoopertationSubjects();
  // getCountries()
});

</script>



<style scoped>
.p-fluid .p-field {
  margin-bottom: 1.5rem;
}

.p-dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
