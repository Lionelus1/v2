<template>
  <div class="back-button-container">
    <router-link to="/ilyas" class="back-button">
      <i class="pi pi-arrow-left"></i> Форма
    </router-link>
  </div>
  <div class="container">
    <div class="form-container">
      <div class="p-fluid">
        <label>Название</label>
        <InputText v-model="name" />

        <label>Выберите здание</label>
        <Dropdown v-model="building" :options="buildings" optionLabel="label" optionValue="value" @change="updateFloors" />

        <label>Выберите этаж</label>
        <Dropdown v-model="floor" :options="floors" optionLabel="label" optionValue="value" :disabled="!floors.length" @change="updateMonitorNote" />

        <label>Разрешение</label>
        <InputText v-model="resolution" disabled />

        <label>Дата начала</label>
        <Calendar v-model="startDate" showTime dateFormat="dd.mm.yy" placeholder="дд.мм.гг чч:мм" />

        <label>Дата окончания</label>
        <Calendar v-model="endDate" showTime dateFormat="dd.mm.yy" placeholder="дд.мм.гг чч:мм" />

        <label>Примечание</label>
        <Textarea v-model="monitorNote" disabled />

        <label>Выберите файл</label>
        <div class="file-buttons">
          <FileUpload mode="basic" accept="image/*" :maxFileSize="1000000" @select="handleFileUpload" />
          <Button @click="openCropper" :disabled="!file" icon="pi pi-file-edit" label="Редактировать" class="p-button-warning" />
        </div>
 
<!-- Модальное окно кроппера -->
  <Dialog v-model:visible="showCropper" modal header="Редактирование изображения" :style="{ width: '50vw' }">
    <div class="cropper-container">
      <vue-cropper ref="cropper" :src="cropFile" :aspect-ratio="16/9" guides></vue-cropper>
    </div>
    <template #footer>
      <Button @click="saveCroppedImage" icon="pi pi-check" label="Сохранить" class="p-button-success" />
      <Button @click="showCropper = false" icon="pi pi-times" label="Отмена" class="p-button-secondary" />
    </template>
  </Dialog>
        <div class="buttons-container">
          <Button @click="saveData" icon="pi pi-save" label="Сохранить" class="p-button-success save-button" />
        </div>
      </div>
    </div>
  </div>


</template>

<script>
import { ref, onMounted, nextTick  } from 'vue';
import { useRouter } from 'vue-router';
import { useDataStore } from '@/store/dataStore';
import { InputText } from 'primevue/inputtext';
import { Dropdown } from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import Textarea from 'primevue/textarea';
import { Button } from 'primevue/button';
import { FileUpload } from 'primevue/fileupload';
import Dialog from 'primevue/dialog';
import VueCropper from 'vue-cropperjs';
import "cropperjs/dist/cropper.css";
export default {
  components: {
    InputText,
    Dropdown,
    Calendar,
    Textarea,
    Button,
    FileUpload,
    VueCropper,
  },
setup() {
  const router = useRouter();
  const store = useDataStore();
  const name = ref('');
  const building = ref(null);
  const floor = ref(null);
  const resolution = ref('1920×1080');
  const startDate = ref(null);
  const endDate = ref(null);
  const monitorNote = ref('');
  const file = ref(null);
  const cropFile = ref(null);
  const showCropper = ref(false);
  const cropper = ref(null);

  const buildings = ref([]);
  const floors = ref([]);
 
  const fetchBuildings = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/buildings');
      const data = await response.json();
      buildings.value = data.map((b) => ({
        label: b.label,
        value: b.value,
        floors: b.floors.map((f) => ({
          label: f.label,
          value: f.value,
          notes: f.notes,
        })),
      }));
    } catch (error) {
      console.error('Ошибка загрузки зданий:', error);
    }
  };
  onMounted(fetchBuildings);

  const updateFloors = () => {
    const selectedBuilding = buildings.value.find((b) => b.value === building.value);
    floors.value = selectedBuilding ? selectedBuilding.floors : [];
    floor.value = null;
    monitorNote.value = '';
  };

  const updateMonitorNote = () => {
    const selectedBuilding = buildings.value.find((b) => b.value === building.value);
    const selectedFloor = selectedBuilding?.floors.find((f) => f.value === floor.value);
    monitorNote.value = selectedFloor?.notes.join(', ') || '';
  };

  const handleFileUpload = (event) => {
    const uploadedFile = event.files[0];
    if (!uploadedFile) return;
    file.value = uploadedFile;
    cropFile.value = URL.createObjectURL(uploadedFile);
  };

   const openCropper = async () => {
      if (!file.value || !cropFile.value) return;
      showCropper.value = false;
         await nextTick();
         showCropper.value = true; 
      if (cropper.value) {
        cropper.value.replace(cropFile.value);
      }
    };

    const saveCroppedImage = () => {
      if (!cropper.value) return;

      cropper.value.getCroppedCanvas().toBlob((blob) => {
        if (!blob) return;
        const croppedFile = new File([blob], "cropped-image.jpg", { type: "image/jpeg" });
        file.value = croppedFile;
        cropFile.value = URL.createObjectURL(croppedFile);
        showCropper.value = false;
      }, "image/jpeg");
    };

  const saveData = () => {
    store.addItem({
      name: name.value,
      building: building.value,
      floor: floor.value,
      resolution: resolution.value,
      startDate: startDate.value,
      endDate: endDate.value,
      file: file.value,
      monitorNote: monitorNote.value,
    });
    router.push('/ilyas');
  };

  return {
    name,
    building,
    floor,
    resolution,
    startDate,
    endDate,
    monitorNote,
    file,
    buildings,
    floors,
    fetchBuildings,
    updateFloors,
    updateMonitorNote,
    handleFileUpload,
    saveData,
    showCropper,
    cropFile,
    openCropper,
    saveCroppedImage,
    cropper,
  };
}
}

</script>



<style scoped>
.container {
  display: flex;
  justify-content: center; 
}
.form-container {
  width: 700px; 
  max-width: 100%;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-shadow: 2px 2px 12px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  width: 80%;
  margin-top: 30px;
}
.buttons {
  display: flex;
  justify-content: center;
  gap: 80px;
  margin-top: 15px;
}
.small-button {
  width: 150px; 
}
.back-button {
  
  align-items: center;
  font-size: 20px;
  text-decoration: none;
  color: black;
  font-weight: bold;
}
.back-button i {
  margin-right: 8px;
}
.calendar-container {
  display: flex;
  align-items: center;
  gap: 10px;
}
.p-fluid {
  display: block;
  margin-bottom: 5px;
}
.p-fluid > * {
  margin-bottom: 15px; 
}
.p-button-warning {
  width: 150px;
}
.p-button-success {
  width: 150px;
}
.file-buttons {
  display: flex;
  align-items: center;
  gap: 15px; 
  margin-bottom: 15px; 
}
.buttons-container {
  display: flex;
  justify-content: flex-end; 
  margin-top: 15px;
}
.save-button {
  width: 150px;
}
</style>
