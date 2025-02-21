<template>
  <div>
    <Button @click="deleteSelectedFiles" :disabled="selectedIndexes.length === 0" label="Удалить выбранные" class="p-button-danger mb-3" />

    <DataTable v-model:selection="selectedIndexes" :value="dataStore.items" dataKey="id" responsiveLayout="scroll">
      <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
      <Column field="id" header="ID"></Column>
      <Column field="name" header="Название"></Column>
      <Column header="Файл">
        <template #body="{ data }">
          {{ data.fileUrl ? 'Есть файл' : 'Нет файла' }}
        </template>
      </Column>
      <Column field="port" header="Порт" />
      <Column field="resolution" header="Разрешение" />
      <Column field="date" header="Дата" />
    </DataTable>

    <Button @click="addNewItem" label="Добавить +" class="p-button-success mt-3" />
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useDataStore } from "@/store/dataStore.js";
import { Button } from "primevue/button";
import { DataTable } from "primevue/datatable";
import { Column } from "primevue/column";

const dataStore = useDataStore();
const selectedIndexes = ref([]);

const deleteSelectedFiles = () => {
  dataStore.removeItems(selectedIndexes.value.map(item => item.id));
  selectedIndexes.value = [];
};


const addNewItem = () => {
  const newItem = {
    id: dataStore.items.length + 1,
    name: `Файл ${dataStore.items.length + 1}`,
    fileUrl: null,
    port: `Порт ${dataStore.items.length + 1}`,
    resolution: "1920×1080",
    date: new Date().toISOString().split('T')[0],
  };
  dataStore.addItem(newItem);
};
</script>

<style scoped>
.mb-3 {
  margin-bottom: 10px;
}
.mt-3 {
  margin-top: 10px;
}
</style>
