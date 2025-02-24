<template>
  <div class="home-container">
    <Button @click="$router.push('/add')" label="Добавить" icon="pi pi-plus" class="p-button-success add-button" />
    <Button 
      @click="deleteSelected" 
      label="Удалить выбранные" 
      icon="pi pi-trash" 
      class="p-button-danger delete-button" 
      :disabled="selectedItems.length === 0" 
    />

    <DataTable v-model:selection="selectedItems" :value="items" dataKey="id" responsiveLayout="scroll">
      <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
      <Column field="id" header="ID"></Column>
      <Column field="name" header="Название"></Column>
      <Column header="Файл">
        <template #body="slotProps">
          <a v-if="slotProps.data.fileUrl" :href="slotProps.data.fileUrl" target="_blank">
            Файл загружен
          </a>
          <span v-else>Нет файла</span>
        </template>
      </Column>
      <Column field="port" header="Порт"></Column>
      <Column field="resolution" header="Разрешение"></Column>
      <Column field="date" header="Дата"></Column>
    </DataTable>
  </div>
</template>

<script>
import { useDataStore } from '@/store/dataStore';
import { computed, ref, watchEffect } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';

export default {
  components: {
    DataTable,
    Column,
    Button
  },
  setup() {
    const store = useDataStore();
    const items = computed(() => store.items);
    const selectedItems = ref([]);

    // Функция для удаления выбранных элементов
const deleteSelected = () => {
  store.removeItems(selectedItems.value.map(item => item.id));
  selectedItems.value = [];
};


    watchEffect(() => {
      console.log("Обновленные items:", items.value);
    });

    return { items, selectedItems, deleteSelected };
  }
};
</script>

<style scoped>
.home-container {
  padding: 20px;
  background: white;
  border-radius: 5px;
}

.add-button, .delete-button {
  margin-right: 10px;
}

.p-button-danger:disabled {
  background-color: #aaa;
  cursor: not-allowed;
}
</style>
