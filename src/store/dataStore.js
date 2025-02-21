import { defineStore } from "pinia";
import { ref, watch } from "vue";

function loadStoredData() {
  try {
    const data = JSON.parse(localStorage.getItem("dataStore")) || [];
    return data.map((item, index) => ({
      id: item.id || index + 1,
      name: item.name || "Без названия",
      fileUrl: item.fileUrl || null,
      port: item.port || "",
      resolution: item.resolution || "",
      date: item.date || "",
    }));
  } catch (error) {
    console.error("Ошибка при загрузке данных из localStorage:", error);
    return [];
  }
}

export const useDataStore = defineStore("dataStore", () => {
  const items = ref(loadStoredData());

  const addItem = (newItem) => {
    const maxId = items.value.length > 0 ? Math.max(...items.value.map(item => item.id)) : 0;
    newItem.id = maxId + 1;

    if (newItem.file) {
      newItem.fileUrl = URL.createObjectURL(newItem.file);
    }

    items.value.push(newItem);
    saveToLocalStorage();
  };

  const removeItems = (ids) => {
    items.value = items.value.filter(item => !ids.includes(item.id));
    saveToLocalStorage();
  };

  const saveToLocalStorage = () => {
    try {
      localStorage.setItem("dataStore", JSON.stringify(items.value));
    } catch (error) {
      console.error("Ошибка при сохранении в localStorage:", error);
    }
  };

  watch(items, saveToLocalStorage, { deep: true });

  return { items, addItem, removeItems };
});
