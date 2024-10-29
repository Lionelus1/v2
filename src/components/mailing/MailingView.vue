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
    <div class="dialog-content">
      <div class="field">
        <label class="bold">{{ $t("mailing.time") }}</label>
        <span class="value">{{ moment(new Date(selectedMailing?.mailing?.createdDate)).utc().format("DD.MM.YYYY HH:mm:ss") }}</span>
      </div>

      <div class="field">
        <label class="bold">{{ $t("mailing.categories") }}</label>
        <span class="value">{{ getCategories }}</span>
      </div>

      <div v-if="categoryExists(83)" class="field">
        <label class="bold">{{ $t("mailing.emails") }}</label>
        <span class="value">{{ selectedMailing?.mailing?.emails.join(', ') || '-' }}</span>
      </div>

      <div class="field">
        <label class="bold">{{ $t("mailing.text") }}</label>
        <div v-html="selectedMailing?.mailing?.description"></div>
      </div>

      <div class="field">
        <label class="bold">{{ $t("mailing.sender") }}</label>
        <span class="value">{{ getFullName }}</span>
      </div>

      <div v-if="props.selectedMailing?.mailing?.AdditionalFilePath" class="field">
        <label class="fileTitle">{{ $t("mailing.fileTitle") }}: </label>
        <a
            :href="props.selectedMailing?.mailing?.AdditionalFilePath"
            download = "true"
        >
          {{ props.selectedMailing?.mailing?.AdditionalFileName }}
        </a>
      </div>
    </div>
  </Dialog>
</template>


<script setup>
import {inject, computed, ref} from "vue";
import { useI18n } from "vue-i18n";
import moment from "moment";

const emitter = inject('emitter');
const props = defineProps(['mailingViewVisible', 'selectedMailing'])
const isVisible = ref(props.mailingViewVisible ?? false)

const emit = defineEmits(['close']);

const { locale } = useI18n();

const getFullName = computed(() => {
  const senderString = props.selectedMailing?.mailing?.senderJSON;
  if (!senderString) return "Full name is incomplete";

  try {
    const { lastName = "", firstName = "", thirdName = "" } = JSON.parse(senderString);
    return `${thirdName} ${firstName} ${lastName}`.trim();
  } catch (e) {
    return "Invalid sender data";
  }
});

const getCategories = computed(() => {
  const categories = props.selectedMailing?.categories
  return locale.value === "kz"
      ? categories?.map(category => category.name_kz || '-').join(', ')
      : locale.value === "ru"
          ? categories?.map(category => category.name_ru || '-').join(', ')
          : categories?.map(category => category.name_en || '-').join(', ')
});

const categoryExists = (id) => {
  const categories = props.selectedMailing?.categories || [];
  return categories.some(category => category.id === id);
}

const closeModal = () => {
  emitter.emit("modalClose", false);
}

const getImageUrl = (data) => {
  if (data && data.main_image_file) {
    return  smartEnuApi + fileRoute + data.main_image_file?.filepath
  } else if (data && data?.image1) {
    return  smartEnuApi + fileRoute + data.image1
  }
}
</script>

<style>
.dialog-content {
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 8px;
}
.bold {
  font-weight: bold;
  color: #333;
}

.fileTitle {
  font-weight: bold;
  color: #333;
  margin-right: 5px;
}
.value {
  display: block;
  margin-top: 0.25rem;
  color: #555;
  font-size: 1rem;
}

p.value {
  margin: 0;
}


</style>
