<template>
  <div id="carddiv" class="grid">
    <div class="col-12">
      <h3>{{ $t('showcase.crAndUpdEdu') }}</h3>
      <div>
        <Menubar :model="menu2" :key="active" style="height:36px;margin-top:-7px;margin-left:-14px;margin-right:-14px"></Menubar>
      </div>
    </div>
    <div class="col-12 md:col-12 p-fluid">
        <div class="grid formgrid">
          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ $t('showcase.nameKz') }}<span class="p-error">*</span></label>
            <InputText class="mt-2" type="text" :placeholder="$t('common.requiredField')" v-model="showcase.title_kz"></InputText>
            <small class="p-error" v-if="validation.titlekz">{{ $t("common.requiredField") }}</small>
          </div>
          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ $t('showcase.nameEn') }}<span class="p-error">*</span></label>
            <inputText class="mt-2"  type="text" :placeholder="$t('common.requiredField')" v-model="showcase.title_en"></inputText>
            <small class="p-error" v-if="validation.titleen">{{ $t("common.requiredField") }}</small>
          </div>
          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ $t('showcase.nameRu') }}<span class="p-error">*</span></label>
            <InputText class="mt-2" type="text" :placeholder="$t('common.requiredField')" v-model="showcase.title_ru"></InputText>
            <small class="p-error" v-if="validation.titleru">{{ $t("common.requiredField") }}</small>
          </div>
        </div>
    </div>
    <div class="col-12 md:col-12 p-fluid">
        <div class="grid formgrid">
          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ $t('showcase.descriptionKz') }}<span class="p-error">*</span></label>
            <Textarea rows="5" cols="30" class="mt-2" type="text" :placeholder="$t('common.requiredField')" v-model="showcase.description_kz"></Textarea>
            <small class="p-error" v-if="validation.descriptionkz">{{ $t("common.requiredField") }}</small>
          </div>
          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ $t('showcase.descriptionEn') }}<span class="p-error">*</span></label>
            <Textarea  rows="5" cols="30" class="mt-2" type="text" :placeholder="$t('common.requiredField')" v-model="showcase.description_en"></Textarea>
            <small class="p-error" v-if="validation.descriptionen">{{ $t("common.requiredField") }}</small>
          </div>
          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ $t('showcase.descriptionRu') }}<span class="p-error">*</span></label>
            <Textarea  rows="5" cols="30" class="mt-2" type="text" :placeholder="$t('common.requiredField')" v-model="showcase.description_ru"></Textarea>
            <small class="p-error" v-if="validation.descriptionru">{{ $t("common.requiredField") }}</small>
          </div>
        </div>
    </div>
    <div class="col-12 md:col-12 p-fluid">
      <div class="card-title">{{ $t('common.image') }}</div>
      <div class="field">
        <div class="post-select-image-container">
          <div v-if="filePath">
            <img :src="filePath" style="width: 100%; height: 100%"/>
            <Button icon="fa-solid fa-xmark" class="btn-remove-image p-button-danger" @click="removeImage" />
          </div>
          <div v-else class="btn-select-image">
            <div class="btn-select-image-inner">
              <i class="fa-regular fa-image"></i>
              <FileUpload ref="form"
                          mode="basic"
                          :customUpload="true"
                          @uploader="upload"
                          :auto="true"
                          v-bind:chooseLabel="$t('common.choose')"
                          accept="image/*"
                          class="p-button-outlined" />
              <small class="p-error" v-if="validation.file">{{ $t("common.requiredField") }}</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import FileUpload from 'primevue/fileupload';
import { inject, defineProps, ref, onMounted } from 'vue';
import { useI18n } from "vue-i18n";
import { ShowcaseService } from "@/service/showcase.service";
import { useToast } from "primevue/usetoast";
import InputText from "primevue/inputtext";
import {FileService} from "@/service/file.service";
import {fileRoute, smartEnuApi} from "@/config/config";
const { t,} = useI18n();
const toast = useToast();
const imageUrl = ref(null);
const props = defineProps({
  userID: {
    type: Number,
    default: null,
  },
  modelValue: {
    type: null,
    default: null,
  },
  readonly: {
    type: Boolean,
    default: true,
  },
  customType: {
    type: String,
    default: ''
  }
});
const filePath = ref();

const file = ref(null);
const loginedUser = JSON.parse(localStorage.getItem("loginedUser"));

const emitter = inject("emitter");

const validation = ref({
  titlekz: false,
  titleen: false,
  titleru: false,
  descriptionkz: false,
  descriptionen: false,
  descriptionru: false,
});

const showcase = ref(props.modelValue);
const showcaseService = new ShowcaseService();
const fileService = new FileService();


const create = () => {
  const fd = new FormData();
  showcase.value.userID = loginedUser.id;
  fd.append("id", JSON.stringify(showcase.value));
  if (file.value !== null) {
    fd.append("idImage", file.value);
  }
  showcaseService.createShowcase(fd).then(res => {
    toast.add({ severity: 'success', summary: t('common.success'), life: 3000 });
    emitter.emit('showcase', true);
    emitter.emit('node', true);
  }).catch(err => {
    toast.add({
      summary: t('message.actionError'),
      life: 3000,
      severity: "error",
    });
  });
};
const oldFilePath = ref(null);
const upload = (event) => {
  if (!event || !event.files || event.files.length === 0) {
    toast.add({ severity: "error", summary: t("common.noFilesFound"), life: 3000 });
    return;
  }

  const fd = new FormData();
  fd.append("files[]", event.files[0]);

  oldFilePath.value = filePath.value;
  const oldShowcaseFilePath = showcase.value.file_path;

  fileService.uploadFile(fd)
      .then(res => {
        if (res.data) {
          file.value = event.files[0];
          const uploadedFilePath = res.data[0].filepath;

          showcase.value.file_path = uploadedFilePath;
          filePath.value = smartEnuApi + fileRoute + uploadedFilePath;

          toast.add({ severity: "success", summary: t("hdfs.toastMsg"), life: 3000 });
        }
      })
      .catch(() => {
        file.value = null;
        filePath.value = oldFilePath.value;
        showcase.value.file_path = oldShowcaseFilePath;
      });
};

const validationForm = () => {
  validation.value.titlekz = !showcase.value.title_kz || showcase.value.title_kz == "";
  validation.value.titleen = !showcase.value.title_en || showcase.value.title_en == "";
  validation.value.titleru = !showcase.value.title_ru || showcase.value.title_ru == "";
  validation.value.descriptionkz = !showcase.value.description_kz || showcase.value.description_kz == "";
  validation.value.descriptionen = !showcase.value.description_en || showcase.value.description_en == "";
  validation.value.descriptionru = !showcase.value.description_ru || showcase.value.description_ru == "";
  validation.value.file = !file.value && (!showcase.value.file_path || showcase.value.file_path.trim() === "");

  return (
      !validation.value.titlekz &&
      !validation.value.titleen &&
      !validation.value.titleru &&
      !validation.value.descriptionru &&
      !validation.value.descriptionen &&
      !validation.value.descriptionkz &&
      !validation.value.file
  );
};

const removeImage = () => {
  file.value = null;
  filePath.value = '';
  showcase.value.file_path = '';
};

const menu2 = ref([
  {
    label: t("common.save"),
    icon: "pi pi-fw pi-save",
    command: () => {
      if (validationForm()) {
        create();
      } else {
        toast.add({
          summary: t('common.fillRequiredFields'),
          severity: "error",
          life: 3000,
        });
      }
    },
  },
]);

onMounted(() => {
  filePath.value = showcase.value.file_path || '';
});
</script>

<style scoped>
.post-select-image-container {
  position: relative;
  width: 100%;
  height: 200px;
  max-width: 280px;
  margin-bottom: 15px;
  border-radius: 2px;
  overflow: hidden;
  border: 2px dashed #ccc;
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.image-wrapper img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.btn-remove-image {
  font-size: 12px;
  position: absolute;
  right: 0;
  top: 0;
  color: #fff;
  cursor: pointer;
}
.btn-select-image .btn-select-image-inner {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  flex-direction: column;
  text-align: center;
}

.btn-select-image svg {
  display: block;
  font-size: 48px;
  line-height: 48px;
  color: #dadbdd;
  margin-bottom: 15px;
}

</style>
