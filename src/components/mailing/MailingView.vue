<template>
  <Dialog
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

      <div v-if="categoryExists(83)">
      <h5 >{{ $t("mailing.emails") }}</h5>
      <p>{{ selectedMailing?.mailing?.emails.join(', ') || '-' }}</p>
      </div>

      <h5>{{ $t("mailing.sender") }}</h5>
      <p>{{ getFullName }}</p>

      <h5>{{ $t("mailing.template") }}</h5>
      <p>{{ selectedMailing?.template?.template_name || '-' }}</p>

      <h5>{{ $t("mailing.status") }}</h5>
      <p>{{ statusText }}</p>
    </div>
  </Dialog>
</template>


<script setup>
import {inject, computed, ref} from "vue";
import { useI18n } from "vue-i18n";

const emitter = inject('emitter');
const props = defineProps(['mailingViewVisible', 'selectedMailing'])
const isVisible = ref(props.mailingViewVisible ?? false)

const emit = defineEmits(['close']);

const { locale } = useI18n();

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

const categoryExists = (id) => {
  const categories = props.selectedMailing?.categories || [];
  return categories.some(category => category.id === id);
}

const closeModal = () => {
  emitter.emit("modalClose", false);
}

</script>
