<script setup>
import { ref, watch } from "vue";
const props = defineProps(['mailingViewVisible', 'selectedMailing']);
const localMailingViewVisible = ref(props.mailingViewVisible);

console.log("MailingView received selectedMailing:", props.selectedMailing);

watch(() => props.mailingViewVisible, (newVal) => {
  localMailingViewVisible.value = newVal;
});

const closeModal = () => {
  localMailingViewVisible.value = false;
};
</script>

<template>
  <Dialog header="Mailing Details"
          v-model:visible="localMailingViewVisible"
          :style="{ width: '1000px' }"
          modal
          closeable
          close-on-escape>
    <Card style="box-shadow: none">
      <template #header>
        <h2>{{ props.selectedMailing?.title }}</h2>
      </template>
      <div>
        <h3>Category IDs:</h3>
        <p>{{ props.selectedMailing?.categoryIds }}</p>

        <h3>Description:</h3>
        <div v-html="props.selectedMailing?.description"></div>

        <h3>Emails:</h3>
        <p>{{ props.selectedMailing?.emails }}</p>

        <h3>Sender:</h3>
        <p>{{ props.selectedMailing?.senderJSON.firstName }} {{ props.selectedMailing?.senderJSON.lastName }}</p>

        <h3>Template ID:</h3>
        <p>{{ props.selectedMailing?.templateId }}</p>

        <h3>Status ID:</h3>
        <p>{{ props.selectedMailing?.statusId }}</p>
      </div>
    </Card>
  </Dialog>
</template>