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
      <Column field="building" header="Здание"></Column>
      <Column field="floor" header="Этаж"></Column>
      <Column field="resolution" header="Разрешение"></Column>
      <Column field="startDate" header="Дата начала">
      <template #body="slotProps">
        {{ formatDate(slotProps.data.startDate) }}
      </template>
    </Column>
      <Column field="endDate" header="Дата окончания">
      <template #body="slotProps">
        {{ formatDate(slotProps.data.endDate) }}
      </template>
    </Column>
    </DataTable>
  </div>
</template>

<script>
import { useDataStore } from '@/store/dataStore';
import { computed, ref, watchEffect } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import { format } from "date-fns";
import { ru } from "date-fns/locale";

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

    const deleteSelected = () => {
      store.removeItems(selectedItems.value.map(item => item.id));
      selectedItems.value = [];
    };
    const formatDate = (date) => {
  if (!date) return "";
  return format(new Date(date), "dd.MM.yyyy HH:mm", { locale: ru });
};

    watchEffect(() => {
      console.log("Обновленные items:", items.value);
    });

    return { items, selectedItems, deleteSelected,formatDate };
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
