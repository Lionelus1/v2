<template>
    <div class="grid">
        <div class="col-12">
            <h3>{{ $t('web.createPage') }}</h3>
        </div>
        <div class="col-12">
            <Menubar :model="initMenu" :key="active"
                     style="height: 36px;margin-top: -7px;margin-left: -14px;margin-right: -14px;"></Menubar>

            <div class="field-checkbox mt-3">
                <Checkbox id="landing" name="landing" v-model="formData.is_landing" :binary="true"/>
                <label for="landing">Landing page</label>
            </div>

            <div v-if="formData.is_landing" class="p-fluid">
                <div class="field">
                    <label>{{ $t('common.nameInQazaq') }}</label>
                    <InputText type="text" v-model="formData.title_kz"/>
                    <small class="p-error" v-if="!formData.title_kz && submitted">{{ $t("common.requiredField") }}</small>
                </div>
                <div class="field">
                    <label>{{ $t('common.nameInRussian') }}</label>
                    <InputText type="text" v-model="formData.title_ru"/>
                    <small class="p-error" v-if="!formData.title_ru && submitted">{{ $t("common.requiredField") }}</small>
                </div>
                <div class="field">
                    <label>{{ $t('common.nameInEnglish') }}</label>
                    <InputText type="text" v-model="formData.title_en"/>
                    <small class="p-error" v-if="!formData.title_en && submitted">{{ $t("common.requiredField") }}</small>
                </div>
            </div>

            <div v-if="!formData.is_landing">
                <TabView class="p-fluid">
                    <TabPanel header="Қазақша">
                        <div class="field mt-3">
                            <label for="kz-title">{{ $t("common.nameInQazaq") }}</label>
                            <InputText v-model="formData.title_kz" rows="3" :class="{ 'p-invalid': !formData.title_kz && submitted }"/>
                            <small v-show="!formData.title_kz && submitted" class="p-error">{{ $t("smartenu.titleKzInvalid") }}</small>
                        </div>
                        <div class="field">
                            <label>{{ $t("common.contentInQazaq") }}</label>
                            <!--            <RichEditor ref="kztext" v-model="formData.content_kz" editorStyle="height: 320px"></RichEditor>-->
                            <TinyEditor v-model="formData.content_kz" :height="400" :custom-file-upload="true"
                                        @onAfterUpload="onAfterUpload"/>
                        </div>
                    </TabPanel>
                    <TabPanel header="Русский">
                        <div class="field mt-3" style="margin-bottom: 1.5rem">
                            <label>{{ $t("common.nameInRussian") }}</label>
                            <InputText v-model="formData.title_ru" rows="3" :class="{ 'p-invalid': !formData.title_ru && submitted }"/>
                            <small v-show="!formData.title_ru && submitted" class="p-error">
                                {{ $t("smartenu.titleRuInvalid") }}
                            </small>
                        </div>
                        <div class="field">
                            <label for="ru-content">{{ $t("common.contentInRussian") }}</label>
                            <!--            <RichEditor id="ru-content" v-model="formData.content_ru" editorStyle="height: 320px"/>-->
                            <TinyEditor v-model="formData.content_ru" :height="400" :custom-file-upload="true"
                                        @onAfterUpload="onAfterUpload"/>
                        </div>
                    </TabPanel>
                    <TabPanel header="English">
                        <div class="field mt-3" style="margin-bottom: 1.5rem">
                            <label>{{ $t("common.nameInEnglish") }}</label>
                            <InputText v-model="formData.title_en" rows="3" :class="{ 'p-invalid': !formData.title_en && submitted }"/>
                            <small v-show="!formData.title_en && submitted" class="p-error">
                                {{ $t("smartenu.titleEnInvalid") }}
                            </small>
                        </div>
                        <div class="field">
                            <label>{{ $t("common.contentInEnglish") }}</label>
                            <!--            <RichEditor v-model="formData.content_en" editorStyle="height: 320px"/>-->
                            <TinyEditor v-model="formData.content_en" :height="400" :custom-file-upload="true"
                                        @onAfterUpload="onAfterUpload"/>
                        </div>
                    </TabPanel>
                </TabView>

                <Gallery @afterUpload="afterUpload" @on-remove="onGalleryRemove"/>

                <div class="field" v-if="formData.files">
                    <label>{{ $t('workPlan.attachments') }}</label>
                    <div ref="content" class="p-fileupload-content">
                        <div class="p-fileupload-files">
                            <div v-for="(item, index) of formData.files" :key="index">
                                <div class="p-fileupload-row" v-if="!item.is_gallery">
                                    <span class="mr-3" style="cursor: pointer;" @click="downloadFile(item)">
                                        <i class="fa-solid fa-file-arrow-down text-green-500"></i>
                                    </span>
                                    <span @click="downloadFile(item)" style="cursor: pointer;">
                                        {{ item.file.filename ? item.file.filename : item.file.filepath }}</span>
                                    <span class="ml-2">
                                        <Button icon="pi pi-copy" class="p-button-rounded p-button-text"
                                                v-clipboard:copy="copyToClipboard(item.file)" v-clipboard:success="onCopy"/>
                                    </span>
                                    <span>
                                        <Button icon="pi pi-times" class="p-button-rounded p-button-text"
                                                @click="deleteFileConfirm($event, item, index)"/>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import RichEditor from "@/components/documents/editor/RichEditor.vue";
import {EnuWebService} from "@/service/enu.web.service";
import TinyEditor from "../../TinyEditor.vue";
import Gallery from "@/components/Gallery.vue";
import {downloadRoute, getHeader, smartEnuApi} from "@/config/config";

export default {
    name: "AddPage",
    components: {Gallery, TinyEditor},
    data() {
        return {
            formData: {},
            submitted: false,
            enuService: new EnuWebService(),
            fileList: [],
            uploadedGalleryFiles: null
        }
    },
    computed: {
        initMenu() {
            return [
                {
                    label: this.$t('common.save'),
                    icon: "pi pi-fw pi-save",
                    command: () => {
                        this.save();
                    },
                }
            ];
        }
    },
    methods: {
        save() {
            this.submitted = true;
            if (!this.isValid()) {
                return;
            }

            if (this.uploadedGalleryFiles) {
                this.uploadedGalleryFiles.forEach(item => {
                    this.formData.files = this.formData.files || []
                    let data = {
                        file_id: item.id,
                        file: item,
                        is_gallery: item.is_gallery,
                        author: item.author ? item.author : null,
                        img_desc_kz: item.img_desc_kz ? item.img_desc_kz : null,
                        img_desc_ru: item.img_desc_ru ? item.img_desc_ru : null,
                        img_desc_en: item.img_desc_en ? item.img_desc_en : null,
                    }
                    this.formData.files.push(data);
                })
            }


            this.enuService.addPage(this.formData).then(res => {
                if (res.data) {
                    this.emitter.emit("pageCreated", res.data);
                }
            }).catch(error => {
                this.$toast.add({
                    severity: "error",
                    summary: error,
                    life: 3000,
                });
            });

        },
        downloadFile(file) {
            let url = `${smartEnuApi + downloadRoute + file.uuid}`
            fetch(url, {
                method: 'GET',
                headers: getHeader()
            }).then(response => response.blob()).then(blob => {
                let url = window.URL.createObjectURL(blob);
                let a = document.createElement('a');
                a.href = url;
                a.download = file.filename;
                document.body.appendChild(a);
                a.click();
                a.remove();
            }).catch(error => {
                if (error.response && error.response.status === 401) {
                    this.$store.dispatch("logLout");
                } else {
                    this.$toast.add({
                        severity: "error",
                        summary: error,
                        life: 3000,
                    });
                }
            });
        },
        deleteFileConfirm(event, item, index) {
            this.$confirm.require({
                target: event.currentTarget,
                message: this.$t('common.confirmation'),
                header: this.$t('common.confirm'),
                group: 'deleteResult',
                icon: 'pi pi-info-circle',
                acceptClass: 'p-button-rounded p-button-success',
                rejectClass: 'p-button-rounded p-button-danger',
                accept: () => {
                    if (item.id) {
                        this.deleteFile(item.id);
                    } else {
                        this.formData.files.splice(index, 1);
                    }
                }
            });
        },
        deleteFile(id) {
            this.enuService.deletePageFile(id).then(res => {
                if (res.data.is_success) {
                    this.getPageFiles();
                    this.$toast.add({severity: 'success', detail: this.$t('common.done'), life: 3000});
                }
            }).catch((error) => {
                this.$toast.add({severity: "error", summary: error, life: 3000});
            });
        },
        onAfterUpload(item) {
            this.fileList.push(item);
            if (this.formData.files) {
                this.formData.files.push({file_id: item.id, file: item});
            } else {
                this.formData.files = [];
                this.formData.files.push({file_id: item.id, file: item});
            }
        },
        afterUpload(files) {
            this.uploadedGalleryFiles = files;
        },
        onGalleryRemove(event) {
            if (event && this.formData.files) {
                this.formData.files.forEach(e => {
                    if (e.file_id === event.id) {
                        e.is_deleted = true;
                    }
                })
                /*let found = galleryFiles.value.find(x => x.file_id === event.id)
                console.log(found)
                found.is_deleted = true;*/
            }
        },
        copyToClipboard(file) {
            return smartEnuApi + downloadRoute + file.uuid;
        },
        onCopy() {
            this.$toast.add({severity: 'success', summary: this.$t('ncasigner.successCopy'), life: 3000});
        },
        isValid() {
            let errors = [];
            if (!this.formData.title_kz)
                errors.push(1);
            if (!this.formData.title_ru)
                errors.push(1);
            if (!this.formData.title_en)
                errors.push(1);

            return errors.length === 0
        }
    }
}
</script>

<style scoped>

</style>
