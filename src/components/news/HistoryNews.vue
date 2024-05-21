<template>
  <Dialog
      :header="$t('web.history')"
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
          <Column
              field="modifyDate"
              :header="$t('faq.createDate')"
              :body="formatDate"
          > <template #body="{data}"> {{ formatDate(data?.modifyDate) }} </template> </Column>
          <Column
              field="status"
              :header="$t('web.actionID')"
          >
            <template #body="{data}">
              <span
                  :class="'customer-badge status-' + data?.status.id">
                {{
                  locale === "kz"
                      ? data?.status.nameKz
                      : locale === "ru"
                          ? data?.status.nameRu
                          : data?.status.nameEn
                }}
              </span>
            </template>
          </Column>
          <Column field="userFullName" :header="$t('web.logUser')"></Column>
        </DataTable>
      </template>
    </Card>
  </Dialog>
</template>

<script setup>
import {inject, ref, watch} from "vue";
import {formatDate} from "@/helpers/HelperUtil";
import {useI18n} from "vue-i18n";
import {useToast} from "primevue/usetoast";
const {t, locale} = useI18n()

const props = defineProps(['isVisible', 'selectedNews', '$i18n']);
const historyNewsVisible = ref(props.isVisible ?? false);
const emitter = inject('emitter');

watch(() => props.isVisible, (newVal) => {
  historyNewsVisible.value = newVal;
});

const closeModal = () => {
  emitter.emit("historyNewsModalClose", false);
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
