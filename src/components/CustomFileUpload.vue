<template>
  <div class="field">
    <FileUpload mode="basic" :customUpload="true" @uploader="$emit('upload', $event)" :auto="true"
        :multiple="multiple" :chooseLabel="$t('hdfs.chooseFile')" :accept="accept"></FileUpload>
  </div>
  <div class="field" v-if="preview">
    <img :src="imgPreview" alt="" class="w-full">
  </div>
  <div class="field" v-if="uploadedFiles">
    <div ref="content" class="p-fileupload-content">
      <div class="p-fileupload-files">
        <div v-for="(file, index) of files" :key="index">
          <div v-if="file.objectURL"><img :src="file.objectURL" alt="" class="tumblr"></div>
          <div class="p-fileupload-row">
            <span class="mr-3"><i class="pi pi-paperclip"></i></span>
            <span>{{ file.name }}</span>
            <span class="ml-5"><Button icon="pi pi-times" class="p-button-rounded p-button-text" @click="removeFile(index)"/></span>
          </div>
        </div>
      </div>
      <div class="p-fileupload-empty" v-if="files.length === 0">
        <slot name="empty"></slot>
      </div>
    </div>
  </div>
</template>

<script>
import {computed, ref, watch} from "vue";
import {fileRoute, smartEnuApi} from "@/config/config";

export default {
  name: "CustomFileUpload",
  props: ['files', 'accept', 'multiple', 'preview'],
  setup(props) {
    const uploadedFiles = computed(() =>  props.files);

    const imgPreview = ref(props.preview)
    if (imgPreview.value)
      imgPreview.value = smartEnuApi + fileRoute + imgPreview.value;
    const removeFile = (index) => {
      uploadedFiles.value.splice(index, 1)[0];
      uploadedFiles.value = [...uploadedFiles.value];
    };

    return {
      uploadedFiles, removeFile, imgPreview
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