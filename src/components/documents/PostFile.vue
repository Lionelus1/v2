<template>
    <div>
    <ProgressBar v-if="uploading" mode="indeterminate" style="height: .5em" />
      <div class="p-fluid">
        <div class="p-field">
          <label for="filename" >{{$t('common.nameInQazaq')}}</label>
          <InputText id="fodernamekaz" v-model="file.namekz" type="text" />
          <small class="p-error" v-if="validation.namekz">{{ $t("common.requiredField") }}</small>
        </div>
        <div class="p-field">
          <label for="filename" >{{$t('common.nameInRussian')}}</label>
          <InputText id="fodernameru" v-model="file.nameru" type="text" />
          <small class="p-error" v-if="validation.nameru">{{ $t("common.requiredField") }}</small>
        </div>
        <div class="p-field">
          <label for="filename" >{{$t('common.nameInEnglish')}}</label>
          <InputText id="fodernameen" v-model="file.nameen" type="text" />
          <small class="p-error" v-if="validation.nameen">{{ $t("common.requiredField") }}</small>
        </div>
      </div>
      <div class="p-field">
        <FileUpload v-if="showUploader" :showUploadButton="false" :showCancelButton="true" ref="ufile" :multiple="false"  class= "p-mt-1"  fileLimit="1" accept=".doc,.docx,.pdf">
          <template #empty>
            <p>{{$t('hdfs.dragMsg')}}</p>
          </template>
        </FileUpload>
        <small class="p-error" v-if="validation.file">{{ $t("hdfs.chooseFile") }}</small>
      </div>
      <div  style="text-align:right">
        <Button v-if="file.id===null" :label="$t('hdfs.uploadBtn')" icon="pi pi-upload" @click="updateFile" />
        <Button v-else :label="$t('common.save')" icon="pi pi-check" @click="updateFile" />
      </div>
    </div>
</template>
<script>
import axios from "axios";
import {smartEnuApi, getHeader, getFileHeader} from "@/config/config";

export default {
    data() {
      return {
        file: this.modelValue,
        state: this.visible,
        uploading: false,
        showUploader: this.fileUpload,
        validation: {
            namekz: false,
            nameru: false,
            nameen: false,
            parent: false,
            file: false,
        }
      }
    },
    props: {
      modelValue: null,
      directory: null,
      parentID: null,
      fileUpload: Boolean,
    },
    emits: ['updated'],
    setup(props, context) {
    function updateValue(file) {
      context.emit("update:modelValue", file);
    }
    return {
      updateValue,
    };
  },
    methods: {
    notValid() {
      this.validation.namekz = this.file.namekz === null || this.file.namekz === ''
      this.validation.nameru = this.file.nameru === null || this.file.nameru === ''
      this.validation.nameen = this.file.nameen === null || this.file.nameen === ''
      this.validation.parent = this.file.parentID === null || this.file.parentID === undefined
      if (this.showUploader) {
        this.validation.file =  this.$refs.ufile.files.length <=0
      }
      var result = true;
      var validation = this.validation
      Object.keys(this.validation).forEach(function(k)
      {
          result = result && validation[k];
      });
      return result
    },
    showMessage(msgtype,message,content) {
      this.$toast.add({severity:msgtype, summary: message, detail:content, life: 3000});
    },
    onUpload() {
      this.$toast.add({severity: 'success', summary: this.$t('hdfs.success'), detail: this.$t('hdfs.toastMsg'), life: 3000});
    },
    updateFile() {
        if (this.notValid()) {
            return
        }
        this.uploading = true;
        const fd = new FormData();
        if (this.file.id === null)
        for (let i=0; i < this.$refs.ufile.files.length; i++) {
          fd.append('f'+i, this.$refs.ufile.files[i]);  
        }
        var fcount = this.file.id !== null ? 0 : this.$refs.ufile.files.length
        fd.append('info', JSON.stringify({directory: this.directory, count: fcount, folderID: this.parentID, fileInfo: this.file}));
        axios.post(smartEnuApi + "/doc/updateFile", fd, {
          headers: getFileHeader()
        })
        .then(resp => {
          if (this.file.id === null && resp.data.length>0) {
              this.file.id = resp.data[0].id
              this.file.key = resp.data[0].uuid
              this.file.path = resp.data[0].filePath
              this.file.stateID =  1
              this.file.statekz = "құрылды"
              this.file.stateru = "создан"
              this.file.stateen = "created"

          }
          this.uploading = false;
          this.file.leaf = null;
          this.$emit("updated", this.file);
          this.onUpload();
        })
        .catch(error => {
          this.uploading = false;
          this.$toast.add({severity: 'error', summary: 'Error', detail: error.message, life: 3000});
        });
      },
      deleteFile(hide) {
        let url = "/doc/deleteFile";
        axios.post(smartEnuApi+url, {id: this.folder.id, hide: hide}, { headers: getHeader() })
        .then(response=>{
            this.folder.key = response.data.id;
            this.showMessage('success', this.$t('common.message.title.docCreation'),this.$t('common.message.catSuccesCreated'));
            this.$emit("updated", this.folder);
        },
        error =>{
          console.log(error);
        });
    },
  }
}
</script>