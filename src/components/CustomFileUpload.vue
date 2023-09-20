<template>
    <ConfirmPopup group="deleteResult"></ConfirmPopup>
    <FileUpload v-if="button" mode="basic" :customUpload="true" @uploader="upload" :auto="true"
                :multiple="multiple" :chooseLabel="$t('hdfs.chooseFile')" :accept="accept"></FileUpload>
    <div v-if="(!button && !uploadedFiles) || multiple">
      <a v-if="!uploadedFiles || multiple" href="javascript:void(0)" @click="upload" class="text-underline">{{ $t('hdfs.chooseFile') }} </a>
    </div>

    <!-- <div class="m-news-images-item" v-for="(item, index) of files" :key="index">
        <img src="item" alt="">
    </div> -->

    <template v-if="preview && !uploadedFiles">
      <div class="field">
        <img :src="imgPreview" alt="" class="w-20rem">
      </div>
    </template>
    <div class="field" v-if="uploadedFiles">
        <div ref="content" class="p-fileupload-content">
            <div class="p-fileupload-files" v-if="uploadedFiles">
                <div v-for="(file, index) of uploadedFiles" :key="index">
                    <div v-if="file.objectURL"><img :src="file.objectURL" alt="" class="w-20rem"></div>
                    <div class="p-fileupload-row">
                        <span class="mr-3"><i class="pi pi-paperclip"></i></span>
                        <span>{{ file.name }}</span>
                        <span class="ml-5"><Button icon="pi pi-times" class="p-button-rounded p-button-text" @click="removeFile(index)"/></span>
                    </div>
                </div>
            </div>
            <div class="p-fileupload-empty" v-if="uploadedFiles.length === 0">
                <slot name="empty"></slot>
            </div>
        </div>
    </div>
</template>

<script>
import {ref, watch} from "vue";
import {fileRoute, smartEnuApi} from "@/config/config";

export default {
    name: "CustomFileUpload",
    props: ['modelValue', 'accept', 'multiple', 'preview', 'isGallery', 'button'],
    setup(props, context) {
        const uploadedFiles = ref(props.modelValue)
        const imgPreview = ref(props.preview)
        const files = ref()
        if (imgPreview.value)
            imgPreview.value = smartEnuApi + fileRoute + imgPreview.value;
        const removeFile = (index) => {
            uploadedFiles.value.splice(index, 1)[0];
            uploadedFiles.value = [...uploadedFiles.value];
            uploadedFiles.value && uploadedFiles.value.length === 0 ? uploadedFiles.value = null : uploadedFiles.value
        }

        const upload = (event) => {
            if (!props.button) {
              const input = document.createElement('input');
              input.setAttribute('type', 'file');
              input.setAttribute('accept', props.accept)
              input.setAttribute('multiple', props.multiple)
              input.addEventListener('change', (e) => {
                context.emit('upload', props.multiple ? e.target.files : e.target.files[0])
              });
              input.click();
            } else {
              context.emit('upload', event)
            }
        }

        watch(() => props.modelValue, (newValue, oldValue) => {
          if (!props.multiple) {
            // eslint-disable-next-line valid-typeof
            uploadedFiles.value = typeof newValue === "array" ? newValue : [newValue]
          } else {
            uploadedFiles.value = uploadedFiles.value || []
            uploadedFiles.value = uploadedFiles.value.push(newValue) || uploadedFiles.value.concat(newValue)
          }
        })

        return {
            uploadedFiles, removeFile, imgPreview, upload, files
        }
    }
}
</script>

<style scoped>
.p-fileupload-content {
    position: relative;
}

.p-fileupload-row {
    display: flex;
    align-items: center;
    padding: 5px;
    font-size: 12px;
}

.p-fileupload-row > div {
    flex: 1 1 auto;
    width: 25%;
}

.p-fileupload-row > div:last-child {
    text-align: right;
}

.p-fileupload-content .p-progressbar {
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
}

.p-button.p-fileupload-choose input[type=file] {
    display: none;
}

.p-fileupload-choose.p-fileupload-choose-selected input[type=file] {
    display: none;
}

.p-fileupload-filename {
    word-break: break-all;
}

.tumblr {
    width: 100px;
    height: auto;
}
</style>