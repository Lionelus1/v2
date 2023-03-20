<template>
    <div>
        <BlockUI v-if="uploading" :fullScreen="true"></BlockUI>
        <FileUpload name="demo[]" :multiple="true" :accept="accept" :maxFileSize="1000000" ref="ufile" @select="onSelectedFiles">
            <template #header="{ chooseCallback, clearCallback, files }">
                <div class="flex flex-wrap justify-content-between align-items-center flex-1 gap-2">
                    <div class="flex gap-2">
                        <Button @click="chooseCallback()" icon="pi pi-images" class="p-button-rounded"></Button>
                        <Button @click="uploadRelatedDocs(clearCallback)" icon="pi pi-cloud-upload" class="p-button-rounded p-button-success" :disabled="!files || files.length === 0"></Button>
                        <Button @click="clearFiles(clearCallback)" icon="pi pi-times" class="p-button-rounded p-button-danger" :disabled="!files || files.length === 0"></Button>
                    </div>
                    <ProgressBar v-if="uploading" mode="indeterminate"  :showValue="false" :class="['md:w-20rem h-1rem w-full md:ml-auto', {'exceeded-progress-bar': (totalSizePercent > 100)}]"><span class="white-space-nowrap">{{ totalSize }}B / 1Mb</span></ProgressBar>

                </div>
            </template>
            <template #content="{ fileRemoveCallback }">
                <div v-if="files.length > 0">
                    <h5>{{$t("common.pending")}}</h5>
                    <div class="flex flex-wrap p-5 gap-5">
                        <div v-for="(file,index) of files" :key="file.name + file.type + file.size" class="card m-0 px-6 flex flex-column border-1 surface-border align-items-center gap-3">
                            <div class="align-items-center" style="width:75px;height:75px;" >
                                <img role="presentation" :alt="file.name" :src="file.objectURL"   class="shadow-2" style="max-width:100%;max-height:100%;" />
                            </div>
                                <div>{{ formatSize(file.size) }}</div>
                            <Badge :value="$t('common.pending')" severity="warning" />
                            <Button icon="pi pi-times" @click="onRemoveTemplatingFile(file, fileRemoveCallback, index)" class="p-button-outlined p-button-danger p-button-rounded" />
                        </div>
                    </div>
                </div>
                <div v-if="uploadedFiles.length > 0">

                    <h5>{{ $t("common.uploaded") }}</h5>
                    <div class="flex flex-wrap p-0 sm:p-5 sm:p-5 gap-5">
                        <div v-for="file of uploadedFiles" :key="file.id" class="card m-0 px-6 flex flex-column border-1 surface-border align-items-center gap-3">
                            <div style="width:75px;height: 75px;" class="align-items-center">
                                <img :ref="'img' + file.id" role="presentation" :alt="file.name" :src="imageUrl+file.filePath" class="shadow-2" style="max-width: 75px;max-height: 75px;" />
                            </div>
                            <Button icon="pi pi-check" @click="selectFile(file)" class="p-button-outlined p-button-success p-button-rounded" />
                        </div>
                    </div>
                </div>
            </template>
            <template #empty>
                <div v-if="files.length<=0 && uploadedFiles.length<=0" class="flex align-items-center justify-content-center flex-column">
                    <i class="pi pi-cloud-upload border-2 border-circle p-5 text-8xl text-400 border-400" />
                    <p class="mt-4 mb-0">Drag and drop files to here to upload.</p>
                </div>
            </template>
        </FileUpload>

        
    </div>
</template>

<script>
import {DocService} from "@/service/doc.service";
import { smartEnuApi, fileRoute } from "../../config/config";
export default {
    name: "Files",
    emits: ['selected'],

    props: {
			folder: {
				type: String,
				default: null
			},
            fileID: {
                type: Number,
                default: null
            },
            uuid: {
                type: String,
                default:null,
            },
            fileType: {
                type: String,
				default: null
            },
            modelValue: null,
            currentImage: null,
	},
    setup(props, context) {
    function updateValue(currentImage) {
      context.emit("update:modelValue", currentImage);
    }
    return {
      updateValue,
    };
  },
    data() {
        return {
            value: this.modelValue,
            service: new DocService(),
            uploadedFiles: [],
            loading: false,
            uploading: false,
            imageUrl: smartEnuApi + fileRoute,
            files: [],
            totalSize: 0,
            totalSizePercent: 0,
            accept: this.fileType ? this.fileType : "image/*"
        };
    },
    created() {
        this.getRealtedFiles()
    },
    methods: {
        clearFiles(callBack){
            this.files=[];
            callBack();
        },
        selectFile(file) {
            if (this.$refs['img' + file.id]) {
                file.width = this.$refs['img' + file.id].naturalWidth
                file.height = this.$refs['img' + file.id].naturalHeight
            }
            this.$emit('selected', {
              value: file
          });
        },
        onRemoveTemplatingFile(file, onFileRemove, index) {
            this.files.splice(index,1)
        },
        getRealtedFiles() {
            this.uploading =true
            this.service.getRelatedDocs({fileID: this.fileID, uuid: this.uuid}).then(response =>{
                this.uploadedFiles = this.uploadedFiles.concat(response.data)
                this.uploading = false;

            })
            .catch(_=> {
                this.uploading = false;
            })
        },
        uploadRelatedDocs(callback) {
            this.uploading =true
            const fd = new FormData();
            var fcount = 0
            if (this.$refs.ufile !== undefined) {
                for (let i=0; i < this.$refs.ufile.files.length; i++) {
                    fd.append('f'+i, this.$refs.ufile.files[i]);
                }
                fcount = this.$refs.ufile.files.length
            }

            fd.append('info', JSON.stringify({directory: this.folder+ "/" + this.fileID, count: fcount, fileID: this.fileID, uuid: this.uuid}));
            this.service.uploadRelatedDocs(fd).then(response =>{
                this.files = []
                this.uploadedFiles =response.data.concat(this.uploadedFiles)
                this.uploading = false;
                callback();
                
            })
            .catch(_=> {
                this.uploading = false;
            })

        },
        onClearTemplatingUpload(clear) {
            clear();
            this.totalSize = 0;
            this.totalSizePercent = 0;
        },
        onSelectedFiles(event) {
            this.files = event.files;
            this.files.forEach((file) => {
                this.totalSize += parseInt(this.formatSize(file.size));
            });
        },
        onAdvancedUpload() {
            this.$toast.add({ severity: 'info', summary: 'Success', detail: 'File Uploaded', life: 3000 });
        },
        uploadEvent(callback) {
            this.totalSizePercent = this.totalSize / 10;
            callback();
        },
        onTemplatedUpload() {
            this.totalSize = 0;
            this.totalSizePercent = 0;
            this.$toast.add({ severity: 'info', summary: 'Success', detail: 'File Uploaded', life: 3000 });
        },
        onUpload() {
            this.$toast.add({ severity: 'info', summary: 'Success', detail: 'File Uploaded', life: 3000 });
        },
        formatSize(bytes) {
            if (bytes === 0) {
                return '0 B';
            }

            let k = 1000,
                dm = 3,
                sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
                i = Math.floor(Math.log(bytes) / Math.log(k));

            return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
        }
    }
};
</script>

<style lang="scss" scoped>
    ::v-deep(.custom-progress-bar) {
        .p-progressbar-value {
            background-color: #f44336;
        }
    }
</style>