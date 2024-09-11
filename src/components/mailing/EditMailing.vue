<script setup>
import {ref, onMounted, computed} from "vue";
import ToolbarMenu from "@/components/ToolbarMenu.vue";
import TinyEditor from "@/components/TinyEditor.vue"; // Assuming you have a TinyEditor component
import {fileRoute, getHeader, smartEnuApi} from "@/config/config";
import {useI18n} from "vue-i18n";
import {useToast} from "primevue/usetoast";
import {useRoute, useRouter} from "vue-router";
import {MailingService} from "@/service/mailing.service";
import api from "@/service/api";
import {FileService} from "@/service/file.service";
const {t} = useI18n()

// const menu = ref([]);
const route = useRoute()
const router = useRouter()
const additionalFileName = ref('');
const additionalFileId = ref(null);
const additional_file_path = ref('');
const description = ref("");
const toast = useToast();
const mailingService = new MailingService()
let selectedCategories = ref()
let emails = ref()
let templateId = ref()
const mailingId = ref(route.params.id)
onMounted(async () => {
  try {
    const response = await mailingService.getMailingByID(parseInt(route.params.id, 10));
    if (response.status !== 200) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    console.log("response: ", response.data);
    selectedCategories.value = Array.isArray(response.data.mailing.categoryIds) ? response.data.mailing.categoryIds : [];
    emails.value = response.data.mailing.emails || [];
    description.value = response.data.mailing.description;
    templateId.value = response.data.mailing.templateId;
    additional_file_path.value = response.data.mailing.AdditionalFilePath;
    additionalFileName.value = response.data.mailing.AdditionalFileName

    if (additional_file_path.value) {
      additionalFileName.value = response.data.mailing.AdditionalFileName;
    }
  } catch (error) {
    console.error("Failed to fetch mailing data:", error);
  }
});

const categories = [
  { id: 86, nameen: 'counterparty', namekz: 'Контрагенттер', nameru: 'Контрагенты' },
  { id: 19, nameen: 'personal', namekz: 'Қызметкерлер', nameru: 'Сотрудники' },
  { id: 57, nameen: 'individual_entrepreneur', namekz: 'Жеке тұлға', nameru: 'Частные лица' },
  { id: 20, nameen: 'student', namekz: 'Білім алушы', nameru: 'Обучающиеся' },
  { id: 83, nameen: 'others', namekz: 'Басқа', nameru: 'Другое' },
  { id: 85, nameen: 'graduate', namekz: 'Түлектер', nameru: 'Выпускники' },
];

const menu = computed(() => {
    return [
      {
        label: t("common.save"),
        icon: "pi pi-fw pi-save",
        disabled: false,
        command: () => {
          sendMailing(2);
        },
      },
      {
        label: t("common.sendMailing"),
        icon: "pi pi-fw pi-send",
        disabled: false,
        command: () => {
          sendMailing(3);
        },
      },
    ];
  }
)

const sendMailing = (statusID) => {
  toast.add({
    severity: "success",
    detail: t('common.dataSavedSuccessfully'),
    life: 3000,
  });

  const roles = selectedCategories.value.map(id => {
    const category = categories.find(cat => cat.id === id);
    return category ? category.nameen : null;
  }).filter(role => role !== null);

  const processedEmails = emails.value.map(email => email.trim());

  const mailingData = {
    mailingID: parseInt(route.params.id, 10),
    filters: {
      roles: roles,
    },
    userID: null,
    docTemplateID: parseInt(templateId.value, 10),
    description: description.value,
    emails: processedEmails,
    filePath: null,
    statusID: statusID,
    AdditionalFilePath: additional_file_path.value,
    AdditionalFileName: additionalFileName.value,
  };

  mailingService.mailing(mailingData)
      .then(response => {
        if (!response.status === 200) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        router.push('/mailing');
      })
      .then(text => {
        try {
          const data = JSON.parse(text);
          console.log('Success:', data);
          router.push('/mailing');
        } catch (error) {
          console.error('Error parsing JSON:', error);
          toast.add({
            severity: "error",
            detail: t('common.errorParsingResponse'),
            life: 3000,
          });
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        toast.add({
          severity: "error",
          detail: t('common.requestFailed'),
          life: 3000,
        });
      });
}

const uploadFile = (event) => {
  const fd = new FormData();
  fd.append("files[]", event.files[0]);
  const fileService = new FileService();
  fileService.uploadFile(fd).then(res => {
    if (res.data) {
      const file = res.data[0];
      additionalFileId.value = file.id;
      additionalFileName.value = file.filename;
      additional_file_path.value = smartEnuApi + fileRoute + file.filepath;
    }
  }).catch(error => {
    this.$toast.add({severity: "error", summary: error, life: 3000});
  });
};

const deleteFile = async () => {
  try {
    if (additional_file_path.value) {
      await deleteAddFilePath(parseInt(mailingId.value))
      additionalFileId.value = null;
      additionalFileName.value = '';
      additional_file_path.value = '';
      toast.add({
        severity: 'success',
        detail: t('mailing.deletedSuccessfully'),
        life: 3000,
      });
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    toast.add({
      severity: 'error',
      detail: t('common.fileDeleteFailed'),
      life: 3000,
    });
  }
};

const deleteAddFilePath = (mailingId) => {
  api
      .post("/mailing/deleteAddFilePath", { mailingId: mailingId }, {
        headers: getHeader(),
      })
      .then((res) => {
        if (res.data === 'success') { /* empty */ } else {
          toast.add({
            severity: "error",
            detail: t("mailing.deleteFailed"),
            life: 3000,
          });
        }
      })
      .catch((err) => {
        console.error(err);
        toast.add({
          severity: "error",
          detail: t("mailing.deleteFailed"),
          life: 3000,
        });
      });
};
</script>

<template>
  <div class="template-editor-container">
    <ToolbarMenu :data="menu" />
    <div class="editor-body">
      <div class="rich-text-editor">
        <TinyEditor v-model="description" :height="700" />
      </div>
    </div>
    <div class="field">
      <div class="grid align-items-center">
        <div class="col-12 md:col-3" style="display: flex; align-items: center; width: auto;">
          <FileUpload ref="form" mode="basic" :customUpload="true" @uploader="uploadFile($event)" :auto="true"
                      v-bind:chooseLabel="this.$t('smartenu.chooseAdditionalFile')"/>
          <InlineMessage :href="additional_file_path" severity="info" show v-if="additionalFileName" style="margin-left: 10px;">
            <a :href="additional_file_path" download="true">
              {{ additionalFileName }}
            </a>
          </InlineMessage>
          <span v-if="additional_file_path" class="icon is-right" @click="deleteFile">
              <i class="fa-solid fa-trash"></i>
            </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.icon {
  margin-left: 10px;
}
</style>
