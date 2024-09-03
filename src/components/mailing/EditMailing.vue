<script setup>
import {ref, onMounted, computed} from "vue";
import ToolbarMenu from "@/components/ToolbarMenu.vue";
import TinyEditor from "@/components/TinyEditor.vue"; // Assuming you have a TinyEditor component
import axios from "axios";
import { smartEnuApi } from "@/config/config";
import {useI18n} from "vue-i18n";
import {useToast} from "primevue/usetoast";
import {useRoute, useRouter} from "vue-router";
import {MailingService} from "@/service/mailing.service";
const {t, locale} = useI18n()

// const menu = ref([]);
const route = useRoute()
const router = useRouter()
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
    selectedCategories.value = Array.isArray(response.data.mailing.categoryIds) ? response.data.mailing.categoryIds : [];
    emails.value = response.data.mailing.emails || [];
    description.value = response.data.mailing.description;
    templateId.value = response.data.mailing.templateId;
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
    statusID: statusID
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
</script>

<template>
  <div class="template-editor-container">
    <ToolbarMenu :data="menu" />
    <div class="editor-body">
      <div class="rich-text-editor">
        <TinyEditor v-model="description" :height="700" />
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
