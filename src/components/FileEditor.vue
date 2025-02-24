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

        <label>Выберите порт</label>
        <Dropdown v-model="port" :options="ports" optionLabel="label" />

        <label>Разрешение</label>
        <InputText v-model="resolution" disabled />

        <label>Выберите дату</label>
        <div class="calendar-container">
          <Calendar
            ref="calendarRef"
            v-model="date"  
            :show-icon="false"
            dateFormat="dd.mm.yy"
            placeholder="дд.мм.гг"
          />
          <Button icon="pi pi-calendar" class="p-button-outlined" @click="openCalendar" />
        </div>    

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
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import VueCropper from 'vue-cropperjs';
import 'cropperjs/dist/cropper.css';

import { useDataStore } from '@/store/dataStore';
import { Button } from 'primevue/button';
import { InputText } from 'primevue/inputtext';
import { Dropdown } from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import { FileUpload } from 'primevue/fileupload';
import { Dialog } from 'primevue/dialog';
import { watch } from 'vue';
export default {
  components: {
    VueCropper,
    Button,
    InputText,
    Dropdown,
    Calendar,
    FileUpload,
    Dialog
  },
  setup() {
    console.log("Компонент FileEditor загружается");
    console.log("Calendar импортирован:", Calendar);
    const router = useRouter();
    const name = ref('');
    const port = ref(null);
    const resolution = ref('1920×1080');
    const date = ref(null);
    const file = ref(null);
    const cropFile = ref(null);
    const showCropper = ref(false);
    const cropper = ref(null);
    const calendarRef = ref(null);

    const minDate = new Date(2000, 0, 1);
    const maxDate = new Date(2100, 11, 31);

    const ports = ref([
      { label: 'УЛК', value: 'УЛК' },
      { label: 'Порт 2', value: 'Порт 2' },
      { label: 'Порт 3', value: 'Порт 3' },
      { label: 'port 4', value: 'port 4'},
    ]);

    const handleFileUpload = (event) => {
      const uploadedFile = event.files[0];
      if (!uploadedFile) return;

      const fileType = uploadedFile.type;
      file.value = uploadedFile;

      if (fileType.startsWith('image/')) {
        cropFile.value = URL.createObjectURL(uploadedFile);
      } else {
        cropFile.value = null;
      }
    };
watch(date, (newVal) => {
  console.log("Выбранная дата:", newVal);
});
const openCalendar = () => {
  if (calendarRef.value?.$el) {
    calendarRef.value.$el.querySelector('input').focus();
  }
};


    const openCropper = () => {
      if (file.value && cropFile.value) showCropper.value = true;
    };

const saveCroppedImage = () => {
  if (cropper.value && cropper.value.getCroppedCanvas()) {
    cropper.value.getCroppedCanvas().toBlob((blob) => {
      if (blob) {
        file.value = new File([blob], "cropped_image.png", { type: "image/png" });
        cropFile.value = URL.createObjectURL(blob);
        showCropper.value = false;
      } else {
        console.error("Ошибка: не удалось создать Blob из обрезанного изображения");
      }
    });
  } else {
    console.error("Ошибка: cropper не инициализирован");
  }
};



    const store = useDataStore();

const saveData = () => {
  if (!date.value) {
    console.error("Дата не выбрана!");
    return;
  }

const formattedDate = date.value.toLocaleDateString('ru-RU');

console.log("Дата перед сохранением:", formattedDate);

  const newItem = {
    name: name.value,
    port: port.value ? port.value.label : '', 
    resolution: resolution.value,
    date: formattedDate,
    file: file.value
  };

  store.addItem(newItem);
  console.log("Файл перед сохранением:", file.value);
  console.log("Данные в store после сохранения:", store.items);

  router.push('/ilyas'); 
};
    return {
      name, port, resolution, date, file, cropFile, showCropper, cropper,
      minDate, maxDate, openCalendar, calendarRef,
      handleFileUpload, openCropper, saveCroppedImage, saveData, ports
    };
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
