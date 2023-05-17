<template>
    <div class="mb-4">
        <label><b>Галерея</b></label>
        <!--      <CustomFileUpload v-model="galleryFiles" @upload="upload" :accept="'image/*'" :multiple="true" :is-gallery="true"/>-->
        <div class="my-2">
            <Button :label="'Выбрать файл'" icon="pi pi-upload" @click="upload"/>
        </div>
        <div v-if="galleryFiles" class="my-3 mr-2">
          <span v-for="(item, index) of galleryFiles" :key="index">
              <div class="m-news-images-item" v-if="!item.is_deleted">
                  <img :src="item.url" alt="">
                  <span class="trash" @click="removeFile(index)"><i class="fa-solid fa-trash"></i></span>
              </div>
          </span>
        </div>

        <Dialog header="Галерея" v-model:visible="modalAfterUpload" :style="{width: '60vw'}"
                :modal="true" class="p-fluid">
            <div class="image-item" v-for="(item, index) of detailInfo" :key="index">
                <div class="field">
                    <label>Картинка</label>
                    <div>
                        <img :src="item.url" alt="">
                    </div>
                </div>
                <div class="field">
                    <label>Автор</label>
                    <InputText v-model="item.author"/>
                </div>
                <div class="grid">
                    <div class="field col">
                        <label>{{ $t('common.nameInQazaq') }} <small id="nameQzHelp"></small></label>
                        <InputText v-model="item.img_desc_kz" />
                    </div>
                    <div class="field col">
                        <label>{{ $t('common.nameInRussian') }}</label>
                        <InputText v-model="item.img_desc_ru"/>
                    </div>
                    <div class="field col">
                        <label>{{ $t('common.nameInEnglish') }}</label>
                        <InputText v-model="item.img_desc_en"/>
                    </div>
                </div>
            </div>
            <template #footer>
                <Button :label="$t('common.save')" icon="pi pi-check"
                        class="p-button p-component p-button-success" @click="insert"/>
            </template>
        </Dialog>
    </div>
</template>

<script setup>
import {ref} from "vue";
import {FileService} from "@/service/file.service";
import {useToast} from "primevue/usetoast";
import {useI18n} from "vue-i18n";
import {useConfirm} from "primevue/useconfirm";
import {useStore} from "vuex";
import {fileRoute, smartEnuApi} from "@/config/config";

const toast = useToast()
const {t, locale} = useI18n()
const confirm = useConfirm()
const store = useStore()
const fileService = new FileService()

const galleryFiles = ref()
const uploadedFiles = ref()
const selectedFiles = ref()
const detailInfo = ref([])
const inserted = ref(false)
const modalAfterUpload = ref(false)
const props = defineProps(['fileList'])
const emit = defineEmits(['afterUpload', 'onRemove'])

if (props.fileList) {
    props.fileList.map(e => {
        e.file.url = smartEnuApi + fileRoute + e.file.filepath
        if (galleryFiles.value) {
            galleryFiles.value.push(e.file)
        } else {
            galleryFiles.value = []
            galleryFiles.value.push(e.file)
        }
    });
}

const upload = () => {
    detailInfo.value = [];
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('multiple', true)
    input.setAttribute('accept', 'image/*')
    input.addEventListener('change', (e) => {
        selectedFiles.value = e.target.files;
        for (let file of selectedFiles.value) {
            let blob = URL.createObjectURL(file)
            let data = {
                url: blob,
                author: null,
                img_desc_kz: null,
                img_desc_ru: null,
                img_desc_en: null
            }
            detailInfo.value.push(data)
        }
        modalAfterUpload.value = true;
    });
    input.click();

}

const removeFile = (index) => {
    let item = galleryFiles.value[index]
    if (item && item.id) {
        item.is_deleted = true;
    } else {
        galleryFiles.value.splice(index, 1)[0];
        galleryFiles.value = [...galleryFiles.value];
        galleryFiles.value && galleryFiles.value.length === 0 ? galleryFiles.value = null : galleryFiles.value

    }
    /*let data = {
        file: galleryFiles.value,
        deletedFile: fileIndex
    }*/
    emit('onRemove', item ? item : null)
}

const insert = () => {
    const fd = new FormData();
    let index = 0;
    for (let file of selectedFiles.value) {
        detailInfo.value[index].filename = file.name
        fd.append("files[]", file)
        index++;
    }
    fd.append('detail[]', JSON.stringify(detailInfo.value))
    fileService.uploadFile(fd).then(res => {
        uploadedFiles.value = res.data
        uploadedFiles.value.map(e => {
            e.is_gallery = true
            e.url = smartEnuApi + fileRoute + e.filepath
        })

        if (galleryFiles.value && galleryFiles.value.length !== 0) {
            galleryFiles.value = galleryFiles.value.concat(uploadedFiles.value)
        } else {
            galleryFiles.value = uploadedFiles.value;
        }
        inserted.value = true;
        modalAfterUpload.value = false;
        emit('afterUpload', uploadedFiles.value)
        uploadedFiles.value = null;
    }).catch(error => {
        this.$toast.add({severity: "error", summary: error, life: 3000});
    });
}
</script>

<style scoped>
.m-news-images-item {
    display: inline-block;
    overflow: hidden;
    margin: 0 10px 10px 0;
    position: relative;
    width: 140px;
}

.m-news-images-item img {
    max-width: 100%;
}

.trash {
    font-size: 17px;
    line-height: 17px;
    position: absolute;
    right: 10px;
    top: 10px;
    color: #fff;
    cursor: pointer;
}

.trash:hover {
    color: red;
}

.image-item {
    border: 1px solid #ccc;
    padding: 10px;
    margin-bottom: 10px;
    border-radius: 5px;
}

.image-item img {
    max-width: 500px;
}
</style>