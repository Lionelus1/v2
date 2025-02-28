import { defineStore } from "pinia";
import { ref, watch } from "vue";

function loadStoredData() {
  try {
    const storedData = localStorage.getItem("dataStore");
    if (!storedData) return [];

    const data = JSON.parse(storedData);
    if (!Array.isArray(data)) throw new Error("Неверный формат данных");

    return data.map((item, index) => ({
      id: item.id || index + 1,
      name: item.name || "Без названия",
      fileUrl: item.fileUrl || null, 
      building: item.building || "",
      resolution: item.resolution || "",
      startDate: item.startDate || "",  
      endDate: item.endDate || "",  
      floor: allFloors[item.building]?.find(f => f.value === item.floor)?.label || item.floor,
      monitorNote: item.monitorNote || "", // Добавлено поле monitorNote
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

    // Сохраняем `label`, а не `value`
    newItem.floor = allFloors[newItem.building]?.find(f => f.value === newItem.floor)?.label || newItem.floor;
    
    newItem.monitorNote = newItem.monitorNote || ""; // Сохранение monitorNote

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

  watch(
    items,
    () => {
      saveToLocalStorage();
    },
    { deep: true }
  );

  return { items, addItem, removeItems };
});
