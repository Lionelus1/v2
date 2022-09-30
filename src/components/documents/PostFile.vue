<template>
    <div>
    <ProgressBar v-if="uploading" mode="indeterminate" style="height: .5em" />
      <div class="p-fluid">
         <div class="p-field">
          <label for="language" >{{$t('common.doclang')}}</label>
          <SelectButton v-model="file.lang" optionLabel="name" :options="languages" dataKey="value" class="p-mb-3">
            <template #option="slotProps">
              <div>{{$t('common.language.' + slotProps.option.name)}}</div>
            </template>
          </SelectButton>
          <small class="p-error" v-if="validation.lang">{{ $t("common.requiredField") }}</small>
        </div>
        <div class="p-field">
          <label for="filename" >{{$t('common.nameInQazaq')}}</label>
          <InputText id="fodernamekaz" v-model="file.namekz" type="text" />
          <small class="p-error" v-if="validation.namekz">{{ $t("common.requiredField") }}</small>
        </div>
        <div class="p-field">
          <label for="filename" >{{$t('common.nameInRussian')}}</label>
          <InputText id="fodernameru" v-model="file.nameru" type="text" />
        </div>
        <div class="p-field">
          <label for="filename" >{{$t('common.nameInEnglish')}}</label>
          <InputText id="fodernameen" v-model="file.nameen" type="text" />
          <small class="p-error" v-if="validation.nameen">{{ $t("common.requiredField") }}</small>
        </div>
        <div  v-if="file.params != null && file.params != undefined ">
          <div class="p-field" v-for="(param,i) of file.params" :key="`${i}`" >
            <label>{{$t('hdfs.' + param.name)}}</label>
            <InputText  v-model="param.value" type="text" />
            <small class="p-error" v-if="validation.param">{{ $t("common.requiredField") }}</small>
          </div>
        </div>
        <div v-if="approveInfo">
          <div class="p-field">
            <label for="filename" >{{$t('common.author')}}</label>
            <DepartmentList :orgType="2" :parentID="1" :autoLoad="true" class="p-pt-1" ref="departmentList"  v-model="file.author"  :editMode="true" ></DepartmentList>
            <small class="p-error" v-if="validation.author">{{ $t("common.requiredField") }}</small>
          </div>
          <div class="p-field">
            <label for="filename" >{{$t('common.approvedBy')}}</label>
            <InputText id="approvedBy" :placeholder="$t('common.councilName')" v-model="file.approvedBy" type="text" />
            <small class="p-error" v-if="validation.approvedBy">{{ $t("common.requiredField") }}</small>
          </div>
          <div class="p-field">
            <label for="filename" >{{$t('common.approveDate')}}</label>
             <PrimeCalendar
              class="p-mt-2"
              v-model="file.approveDate"
              dateFormat="dd.mm.yy"
            />
            <small class="p-error" v-if="validation.approveDate">{{ $t("common.requiredField") }}</small>
          </div>
        </div>
      <div class="p-field">
        <FileUpload v-if="showUploader" :showUploadButton="false" :showCancelButton="true" ref="ufile" :multiple="false"  class= "p-mt-1"  fileLimit="1" :accept="accept">
          <template #empty>
            <p>{{$t('hdfs.dragMsg')}}</p>
          </template>
        </FileUpload>
        <small class="p-error" v-if="validation.file">{{ $t("hdfs.chooseFile") }}</small>
      </div>
      </div>
      <div  style="text-align:right">
        <Button v-if="file.id===null" :label="$t('hdfs.uploadBtn')" icon="pi pi-upload" @click="updateFile" />
        <Button v-else :label="$t('common.save')" icon="pi pi-check" @click="updateFile" />
      </div>
    </div>

</template>
<script>
import axios from "axios";
import DepartmentList from "../smartenu/DepartmentList.vue"

import {smartEnuApi, getHeader, getFileHeader} from "@/config/config";

export default {
    components: {DepartmentList},
    data() {
      return {
        file: this.modelValue,
        state: this.visible,
        selectedDepartment: null,
        uploading: false,
        showUploader: this.fileUpload,
        languages: [{name:"kz", value: 0}, {name:"ru", value:1},  {name:"en", value:2}],
        validation: {
            namekz: false,
            nameru: false,
            nameen: false,
            parent: false,
            file: false,
            param: false,
            lang: false,
            approvedBy: false,
            approveDate: false,
            author: false,
        }
      }
    },
    props: {
      modelValue: null,
      directory: null,
      parentID: null,
      fileUpload: Boolean,
      approveInfo: {
        default: false
      },
      accept: {
        default: ".doc,.docx,.pdf"
      }
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
      //this.validation.parent = this.file.parentID === null || this.file.parentID === undefined
      this.validation.lang = (this.file.id === null && this.file.lang === null)
      this.validation.param =  false
      if (this.file.params != null) {
        this.file.params.forEach(param=> {
          if (param.value === null || param.value === '') {
            this.validation.param = true
          }
        })
      }
      if (this.approveInfo) {
        this.validation.approvedBy = this.file.approvedBy=== null || this.file.approvedBy === '';
        this.validation.approveDate = this.file.approveDate === null || this.file.approveDate === undefined;
        this.validation.author =  this.file.author === null || this.file.author === undefined;
      }
      if (this.showUploader) {
        this.validation.file = this.$refs.ufile.files == undefined || this.$refs.ufile.files.length <=0
      }
      //var result = true;
      var validation = this.validation;
      var errors = [];
      Object.keys(this.validation).forEach(function(k)
      {
          if (validation[k] === true) errors.push(validation[k])
          //result = result && validation[k];
      });
      return errors.length > 0
    },
    showMessage(msgtype,message,content) {
      this.$toast.add({severity:msgtype, summary: message, detail:content, life: 3000});
    },
    onUpload() {
      this.$toast.add({severity: 'success', summary: this.$t('hdfs.success'), detail: this.$t('hdfs.toastMsg'), life: 3000});
    },
    updateFile() {
        if (this.notValid()) {
            return;
        }
        this.uploading = true;
        const fd = new FormData();
        var fcount = 0
        if (this.$refs.ufile !== undefined) {
          for (let i=0; i < this.$refs.ufile.files.length; i++) {
            fd.append('f'+i, this.$refs.ufile.files[i]);
          }
        
        //var fcount = this.file.id !== null ? 0 : this.$refs.ufile.files.length
          fcount = this.$refs.ufile.files.length
        }
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
