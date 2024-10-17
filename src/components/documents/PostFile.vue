<template>
    <div>
    <ProgressBar v-if="uploading" mode="indeterminate" style="height: .5em" />
      <div class="p-fluid">
        <div class="field">
          <label for="language" >{{$t('common.doclang')}}</label>
          <SelectButton v-model="file.lang" optionLabel="name" :options="languages" dataKey="value" class="mb-3" :unselectable="false">
            <template #option="slotProps">
              <div>{{$t('common.language.' + slotProps.option.name)}}</div>
            </template>
          </SelectButton>
          <small class="p-error" v-if="validation.lang">{{ $t("common.requiredField") }}</small>
        </div>
        <div class="field">
          <label for="filename" >{{$t('common.nameInQazaq')}}</label>
          <InputText id="fodernamekaz" v-model="file.namekz" type="text" />
          <small class="p-error" v-if="validation.namekz">{{ $t("common.requiredField") }}</small>
        </div>
        <div class="field">
          <label for="filename" >{{$t('common.nameInRussian')}}</label>
          <InputText id="fodernameru" v-model="file.nameru" type="text" />
          <small class="p-error" v-if="validation.nameru">{{ $t("common.requiredField") }}</small>
        </div>
        <div class="field">
          <label for="filename" >{{$t('common.nameInEnglish')}}</label>
          <InputText id="fodernameen" v-model="file.nameen" type="text" />
          <small class="p-error" v-if="validation.nameen">{{ $t("common.requiredField") }}</small>
        </div>
        <div v-if="docType == attestationDocReportType" class="field">
                <label for="filename" >{{$t('web.chooseDegree')}}</label>
                <div class="flex flex-wrap gap-3">
                    <div class="flex align-items-center">
                        <RadioButton v-model="selectedEducationLevel" inputId="master" name="bachelor" :value="Enums.EducationLevel.Bachelor" />
                        <label for="levelBachelor" class="ml-2">{{$t('educationalPrograms.bachelor')}}</label>
                    </div>
                    <div class="flex align-items-center">
                        <RadioButton v-model="selectedEducationLevel" inputId="master" name="master" :value="Enums.EducationLevel.Magister" />
                        <label for="levelMaster" class="ml-2">{{$t('educationalPrograms.master')}}</label>
                    </div>
                    <div class="flex align-items-center">
                        <RadioButton v-model="selectedEducationLevel" inputId="doctorate" name="doctorate" :value="Enums.EducationLevel.Doctorate" />
                        <label for="levelDoctoral" class="ml-2">{{$t('educationalPrograms.doctoral')}}</label>
                    </div>
                </div>
                <small class="p-error" v-if="validation.academicLevel">{{ $t("common.requiredField") }}</small>
        </div>

        <div  v-if="file.params != null && file.params != undefined ">
          <div class="field" v-for="(param,i) of file.params" :key="`${i}`" >
            <label>{{$t('hdfs.' + param.name)}}</label>
            <div v-if="param.description==='img'">
              <img v-if="param.value" :src="imageUrl+param.value" class="shadow-2" style="max-width: 125px;max-height: 75px;" />
              <Button :label="$t('common.choose')" @click="param.dialog=true;"></Button>
              <Dialog v-model:visible="param.dialog" :modal="true" :closable="false" :breakpoints="{'960px': '75vw', '640px': '90vw'}" :style="{width: '80vw'}">
                <template #header>
                  <h5>{{ $t("common.message.addPicture") }}</h5>
                </template>
                  <Files folder="sysfile" :uuid="param.uuid" @selected="imageSelected($event, param)"></Files>
                <template #footer>
                  <div class="p-fluid">
                    <Button :label="$t('common.cancel')" style="width:100%" @click="param.dialog=false"  class="mt-3 p-button-secondary p-button-outlined"/>
                  </div> 
                </template>
              </Dialog>
            </div>
            <div v-else-if="param.name==='saceduprogram'">
              <SpecialitySearch :style="'height:38px'" class="pt-1" :editMode="true"
                :educationLevel="educationLevel" v-model="param.value" id="speciality">
              </SpecialitySearch>
              <small class="p-error" v-if="validation.academicLevel">{{ $t('web.chooseDegree') }}</small>
            </div>
            <div  v-else-if="param.name==='academicyear'">
              <PrimeCalendar v-model="param.value" selectionMode="range" dateFormat="yy"  view="year" :manualInput="false" />
            </div>
            <InputText v-else  v-model="param.value" type="text" />
            <small class="p-error" v-if="validation.param">{{ $t("common.requiredField") }}</small>
          </div>
        </div>
        <div v-if="approveInfo">
          <div class="field">
            <label for="filename" >{{$t('common.author')}}</label>
            <DepartmentList :orgType="2" :parentID="1" :autoLoad="true" class="pt-1" ref="departmentList"  v-model="file.author"  :editMode="true" ></DepartmentList>
            <small class="p-error" v-if="validation.author">{{ $t("common.requiredField") }}</small>
          </div>
          <div class="field">
            <label for="filename" >{{$t('common.approvedBy')}}</label>
            <InputText id="approvedBy" :placeholder="$t('common.councilName')" v-model="file.approvedBy" type="text" />
            <small class="p-error" v-if="validation.approvedBy">{{ $t("common.requiredField") }}</small>
          </div>
          <div class="field">
            <label for="filename" >{{$t('common.approveDate')}}</label>
             <PrimeCalendar
              class="mt-2"
              v-model="file.approveDate"
              dateFormat="dd.mm.yy"
            />
            <small class="p-error" v-if="validation.approveDate">{{ $t("common.requiredField") }}</small>
          </div>
        </div>
        <div class="field-checkbox col-12 md:col-6">
          <Checkbox
              v-model="file.is_view_only" :binary="true"
              inputId="viewOnlyCheckbox"
          />
          <label for="viewOnlyCheckbox">{{ $t('common.viewOnlyCheckbox') }}</label>
        </div>
        <div v-if="showUploader" class="field">
          <label>{{$t('common.doc')}}</label>
          <FileUpload
              :showUploadButton="false"
              :showCancelButton="false"
              ref="ufile"
              :multiple="false"
              fileLimit="1"
              accept=".doc,.docx,.pdf,.xls,.xlsx"
              @upload="onUpload"
              @select="onFileSelect"
          >
            <template #empty>
              <p>{{$t('hdfs.dragMsg')}}</p>
            </template>

            <template #content>
              <div class="upload-content">
                <div v-if="selectedFile" class="selected-file">
                  <p>{{ selectedFile.name }}</p>
                  <button @click="removeFile" class="remove-file-button">
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </div>

                <div class="field">
                  <label for="fileDescription">{{$t('hdfs.fileDescription')}}</label>
                  <textarea
                      id="fileDescription"
                      v-model="file.fileDescription"
                      :placeholder="$t('hdfs.hintEnterDescription')"
                      rows="3"
                  ></textarea>
                </div>
              </div>
            </template>
          </FileUpload>
          <small class="p-error" v-if="validation.file">{{ $t("hdfs.chooseFile") }}</small>
        </div>
        <div v-if="showCatalog" class="field">
          <label>{{$t('common.catalog')}}</label>
          <Dropdown v-model="catalog" :options="catalogs" :optionLabel='"name" + $i18n.locale'></Dropdown>
          <small class="p-error" v-if="validation.catalog">{{ $t("common.message.catalogNotFilled") }}</small>
        </div>
      </div>
      <div  style="text-align:right">
        <Button v-if="file.id===null" :label="$t('hdfs.uploadBtn')" icon="pi pi-upload" @click="updateFile" />
        <Button v-else :label="$t('common.save')" icon="pi pi-check" @click="updateFile" />
      </div>
    </div>

</template>
<script>
import api from "@/service/api";
import Files from "@/components/documents/Files.vue"

import {smartEnuApi, getHeader, getFileHeader, fileRoute} from "@/config/config";
import DepartmentList from "../smartenu/DepartmentList.vue"
import Enum from "@/enum/docstates/index";
import SpecialitySearch from "../smartenu/speciality/specialitysearch/SpecialitySearch.vue";
import Enums from "@/enum/docstates/index";

export default {
    components: {DepartmentList, SpecialitySearch, Files},
    data() {
      return {
        file: this.modelValue,
        selectedFile: null,
        catalogs: null,
        catalog: null,
        state: this.visible,
        selectedDepartment: null,
        uploading: false,
        imageUrl: smartEnuApi + fileRoute,
        showUploader: this.fileUpload,
        uploadedFiles: [],
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
            catalog: false,
            academicLevel:false,
            eduProg:false,
        },
        Enums: Enums,
        selectedEducationLevel: null,
        attestationDocReportType: parseInt(Enum.DocType.StateAttestationCommission),
      }
    },
    props: {
      modelValue: null,
      directory: null,
      parentID: null,
      fileUpload: Boolean,
      showCatalog: Boolean,
      approveInfo: {
        default: false
      },
      docType: null
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
  watch: {
    'file.params': {
      handler(params) {

        if (!params) {
          console.error("params is undefined!");
          return;
        }

        params.forEach(param => {
          if (param.name === 'saceduprogram') {
            this.selectedSpecialities = param.value;
          }
          if (param.name === 'academicyear') {
            if (param && (param.value === undefined || param.value === null)) {
              param.value = [new Date(new Date().getFullYear(), 0)];
            }
          }
        });
      },
      deep: true,
      immediate: true
    },
    selectedSpecialities(newVal) {
      const param = this.file.params.find(p => p.name === 'saceduprogram');
      if (param) {
        param.value = newVal;
      }
    },
  },
  computed: {
    educationLevel() {
      return this.selectedEducationLevel;
    },

  },
  methods: {
    onFileSelect(event) {
      if (event.files.length > 0) {
        this.selectedFile = event.files[0];
      }
    },
    removeFile() {
      this.selectedFile = null;
      this.file.fileDescription = '';
      this.$refs.ufile.clear();
    },
    levelValidate(){
      let docType = parseInt(this.docType)
      if (docType === this.attestationDocReportType){
        this.validation.academicLevel = this.selectedEducationLevel === null;
        return !this.validation.academicLevel;
      }

    },
    notValid() {
      this.validation.namekz = this.file.namekz === null || this.file.namekz === ''
      this.validation.nameru = this.file.nameru === null || this.file.nameru === ''
      this.validation.nameen = this.file.nameen === null || this.file.nameen === ''
      //this.validation.parent = this.file.parentID === null || this.file.parentID === undefined
      this.levelValidate();
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
      if (this.showCatalog) {
        this.validation.catalog = this.catalog === null || this.catalog === undefined || this.catalogs === null;
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
    imageSelected(event,param) {
      param.value = event.value.filePath;
      param.dialog = false;
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

        let locFolderId = this.parentID
        if (this.catalogs !== null && this.catalog !== null) {
          locFolderId = this.catalog.id
        }

        if (this.directory === 'normativeDocs' && (this.parentID === null || this.parentID === undefined || 
          locFolderId === null || locFolderId === undefined)) {
          this.$toast.add({
            severity: 'error', 
            detail: this.$t('common.message.saveErrorToUpdate'), 
            life: 3000
          });
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
      this.file.params = [];
      let param = {
        value: this.file.fileDescription,
        name: 'FileDescription'
      };
      this.file.params.push(param);
      console.log(this.file)
        fd.append('info', JSON.stringify({directory: this.directory, count: fcount, folderID: locFolderId, fileInfo: this.file}));
        api.post("/doc/updateFile", fd, {
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
      api.post(url, {id: this.folder.id, hide: hide}, { headers: getHeader() })
      .then(response=>{
          this.folder.key = response.data.id;
          this.showMessage('success', this.$t('common.message.title.docCreation'),this.$t('common.message.catSuccesCreated'));
          this.$emit("updated", this.folder);
      },
      error =>{
        console.log(error);
      })
    },
    getReadyDocCatalog() {
      api.post('/doc/getFoldersByType', {
        type: Enum.FolderType.FilledDoc,
        showDocs: false,
      }, {
        headers: getHeader()
      }).then(res => {
        this.catalogs = res.data
      }).catch(err => {
        if (err.response.status == 401) {
          this.$store.dispatch("logLout");
        } else {
          console.log(err)
        }
      })
    },
  },
  mounted() {
    if (this.file.docType === Enum.DocType.Contract && this.file.sourceType === Enum.DocSourceType.FilledDoc) {
      this.getReadyDocCatalog()
    }
  },
}
</script>

<style>

.selected-file {
  margin-bottom: 10px;
  font-weight: bold;
  display: flex;
  align-items: center;
}

.remove-file-button {
  background: none;
  border: none;
  cursor: pointer;
  color: #d9534f; /* Красный цвет для иконки */
  margin-left: 10px; /* Отступ между текстом и иконкой */
}

textarea {
  width: 100%;
  resize: vertical;
}

</style>
