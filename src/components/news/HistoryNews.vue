<!-- HistoryNews.vue -->
<template>
  <Dialog :header="$t('web.history')"
          v-model:visible="historyNewsVisible"
          :style="{ width: '1000px' }"
          :modal="true"
          class="p-fluid"
          :closable="true"
          :breakpoints="{'960px': '75vw', '640px': '90vw'}"
          :close-on-escape="true"
          @hide="closeModal"
  >
    <Card style="box-shadow: none">
      <template #content>
        <DataTable :value="selectedNews">
          <Column field="modifyDate" :header="$t('faq.createDate')"></Column>
          <Column field="status.nameKz" :header="$t('web.actionID')"></Column>
          <Column field="userFullName" :header="$t('web.logUser')"></Column>
        </DataTable>
      </template>
    </Card>
  </Dialog>
</template>

<script setup>
import { inject, ref, watch } from "vue";
import moment from "moment";
const props = defineProps(['isVisible', 'selectedNews']);
const historyNewsVisible = ref(props.isVisible ?? false);
const emitter = inject('emitter');

watch(() => props.isVisible, (newVal) => {
  historyNewsVisible.value = newVal;
});

const closeModal = () => {
  emitter.emit("newsViewModalClose", false);
}
</script>

<style scoped>
.dialog_img {
  padding: 0 100px;
}

@media (max-width: 780px) {
  .dialog_img {
    padding: 0;
  }
}
</style>
