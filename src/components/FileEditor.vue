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
      <Dropdown v-model="floor" :options="floors" optionLabel="label" optionValue="value" :disabled="!floors.length" />



        <label>Разрешение</label>
        <InputText v-model="resolution" disabled />

        <label>Дата начала</label>
        <Calendar v-model="startDate" showTime :showIcon="false" dateFormat="dd.mm.yy" placeholder="дд.мм.гг чч:мм" />

        <label>Дата окончания</label>
        <Calendar v-model="endDate" showTime :showIcon="false" dateFormat="dd.mm.yy" placeholder="дд.мм.гг чч:мм" />

        <label>Примечание</label>
        <Textarea v-model="monitorNote" disabled />

        <label>Выберите файл</label>
        <div class="file-buttons">
          <FileUpload mode="basic" accept="image/*" :maxFileSize="1000000" @select="handleFileUpload" />
          <Button @click="openCropper" :disabled="!file" icon="pi pi-file-edit" label="Редактировать" class="p-button-warning" />
        </div>

        <div class="buttons-container">
          <Button @click="saveData" icon="pi pi-save" label="Сохранить" class="p-button-success save-button" />
        </div>
      </div>
    </div>
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
</template>

<script>
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { Button } from 'primevue/button';
import { InputText } from 'primevue/inputtext';
import { Dropdown } from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import { FileUpload } from 'primevue/fileupload';
import Textarea from 'primevue/textarea';
import { Dialog } from 'primevue/dialog';
import VueCropper from 'vue-cropperjs';
import 'cropperjs/dist/cropper.css';
import { useDataStore } from '@/store/dataStore';



export default {
  components: {
    Button,
    InputText,
    Dropdown,
    Calendar,
    FileUpload,
    Textarea,
    Dialog,
    VueCropper
  },
  setup() {
    const router = useRouter();
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

    const buildings = ref([
      { label: 'УЛК', value: 'УЛК' },
      { label: 'Здание', value: 'Здание' }
    ]);

    const allFloors = {
      УЛК: [
        { label: '1 этаж', value: 'floor1' },
        { label: '2 этаж', value: 'floor2' }
      ],
      Здание: [
        { label: '1 этаж', value: 'floor1' },
        { label: '2 этаж', value: 'floor2' },
        { label: '3 этаж', value: 'floor3' }
      ]
    };

    const floors = ref([]);

const updateFloors = () => {
  console.log("Выбрано здание:", building.value);
  floors.value = allFloors[building.value] || [];
  console.log("Доступные этажи:", floors.value);
  floor.value = null; // Сброс этажа
  monitorNote.value = ''; // Сброс примечания
};



const saveCroppedImage = () => {
  if (!cropper.value) return;

  cropper.value.getCroppedCanvas().toBlob((blob) => {
    const croppedFile = new File([blob], "cropped-image.jpg", { type: "image/jpeg" });
    file.value = croppedFile;
    cropFile.value = URL.createObjectURL(croppedFile);
    showCropper.value = false;
  }, "image/jpeg");
};
    const handleFileUpload = (event) => {
      const uploadedFile = event.files[0];
      if (!uploadedFile) return;
      file.value = uploadedFile;
      cropFile.value = URL.createObjectURL(uploadedFile);
    };

    const openCropper = () => {
      if (file.value && cropFile.value) showCropper.value = true;
    };
    const monitorNotesData = {
      УЛК: {
        floor1: ['У кабинета 101','У входа'],
        floor2: ['У кабинета 201', 'Возле лифта']
      },
      Здание: {
        floor1: ['В холле', 'Возле стойки администратора'],
        floor2: ['У окна в коридоре'],
        floor3: ['У выхода на крышу']
      }
    };
    const store = useDataStore();
    const saveData = () => {
      console.log("Сохраняемый этаж:", floor.value);
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
watch(floor, (newFloor) => {
  if (building.value && newFloor) {
    monitorNote.value = monitorNotesData[building.value]?.[newFloor]?.join(', ') || '';
  } else {
    monitorNote.value = '';
  }
});
    return { name, building, floor, resolution, startDate, endDate, monitorNote, file, cropFile,saveCroppedImage, showCropper, cropper, buildings, floors, updateFloors, handleFileUpload, openCropper, saveData };
  }
};
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
