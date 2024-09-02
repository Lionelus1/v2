<template>
  <Dialog
      header="Mailing Details"
      v-model:visible="isVisible"
      :style="{ width: '1000px' }"
      :modal="true"
      class="p-fluid"
      :closable="true"
      :breakpoints="{'960px': '75vw', '640px': '90vw'}"
      :close-on-escape="true"
      @hide="closeModal">
    <div>
      <h3>{{ $t("mailing.categories") }}</h3>
      <p>{{getCategories}}</p>

      <h3>{{ $t("mailing.description") }}</h3>
      <div v-html="selectedMailing?.mailing?.description"></div>

      <h3>{{ $t("mailing.emails") }}</h3>
      <p>{{ selectedMailing?.mailing?.emails.join(', ') || '-' }}</p>

      <h3>{{ $t("mailing.sender") }}</h3>
      <p>{{ getFullName }}</p>

      <h3>{{ $t("mailing.template") }}</h3>
      <p>{{ selectedMailing?.template?.template_name || '-' }}</p>

      <h3>{{ $t("mailing.status") }}</h3>
      <p>{{ statusText }}</p>
    </div>
  </Dialog>
</template>


<script setup>
import {inject, computed, ref} from "vue";
import { useI18n } from "vue-i18n";

const emitter = inject('emitter');
// Props
const props = defineProps(['mailingViewVisible', 'selectedMailing'])
const isVisible = ref(props.mailingViewVisible ?? false)
// Emits
const emit = defineEmits(['close']);

// Localization
const { locale } = useI18n();

// Computed properties
const statusText = computed(() => {
  const statusId = props.selectedMailing?.mailing?.statusId;
  if (!statusId) return 'unknown';

  const statusMap = {
    1: { kz: "Сақталды", ru: "Сохранен", en: "saved" },
    2: { kz: "Қаралды", ru: "Черновик", en: "draft" },
    3: { kz: "Жіберілді", ru: "Отправлено", en: "sent" },
  };

  return statusMap[statusId][locale.value] || 'unknown';
});

const getFullName = computed(() => {
  const senderString = props.selectedMailing?.mailing?.senderJSON;
  if (!senderString) return "Full name is incomplete";

  try {
    const { lastName = "", firstName = "", thirdName = "" } = JSON.parse(senderString);
    return `${lastName} ${firstName} ${thirdName}`.trim();
  } catch (e) {
    console.error("Failed to parse senderJSON:", e);
    return "Invalid sender data";
  }
});

const getCategories = computed(() => {
  const categories = props.selectedMailing?.categories
  return locale.value === "kz"
      ? categories?.map(category => category.kz || '-').join(', ')
      : locale.value === "ru"
          ? categories?.map(category => category.ru || '-').join(', ')
          : categories?.map(category => category.en || '-').join(', ')
});

// Methods
const closeModal = () => {
  emitter.emit("modalClose", false);
}

</script>
