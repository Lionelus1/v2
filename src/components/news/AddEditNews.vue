<template>
    <ConfirmPopup group="deleteResult"></ConfirmPopup>
    <Dialog v-if="editVisible" v-model:visible="editVisible" :style="{ width: '1000px' }" :breakpoints="{'960px': '75vw', '640px': '90vw'}"
            :header="$t('smartenu.createOrEditNews')"
            :modal="true" closable @close="hideDialog" :close-on-escape="false">
        <div class="card p-fluid">
            <!--      <Message v-for="msg of formValid" severity="error" :key="msg">{{ msg }}</Message>-->
            <TabView>
                <TabPanel header="Қазақша">
                    <div class="field mt-3">
                        <label for="kz-title">{{ $t("common.nameInQazaq") }}</label>
                        <InputText id="kz-title" v-model="newsData.titleKz" rows="3" :class="{ 'p-invalid': !newsData.titleKz && submitted }"/>
                        <small v-show="!newsData.titleKz && submitted" class="p-error">{{ $t("smartenu.titleKzInvalid") }}</small>
                    </div>
                    <div class="field">
                        <label for="kz-content">{{ $t("common.contentInQazaq") }}</label>
                        <TinyEditor v-model="newsData.contentKz" :height="300" :custom-file-upload="true" @onAfterUpload="onAfterUpload"/>
                        <!--            <Editor id="kz-content" v-model="newsData.contentKz" editorStyle="height: 320px"/>-->
                        <small v-show="!newsData.contentKz && submitted" class="p-error">{{ $t("smartenu.contentKzInvalid") }}</small>
                    </div>
                </TabPanel>
                <TabPanel header="Русский">
                    <div class="field mt-3">
                        <label for="ru-title">{{ $t("common.nameInRussian") }}</label>
                        <InputText id="ru-title" v-model="newsData.titleRu" rows="3" :class="{ 'p-invalid': !newsData.titleRu && submitted }"/>
                        <small v-show="!newsData.titleRu && submitted" class="p-error">{{ $t("smartenu.titleRuInvalid") }}</small>
                    </div>
                    <div class="field">
                        <label for="ru-content">{{ $t("common.contentInRussian") }}</label>
                        <TinyEditor v-model="newsData.contentRu" :height="300" :custom-file-upload="true" @onAfterUpload="onAfterUpload"/>
                        <!--            <Editor id="ru-content" v-model="newsData.contentRu" editorStyle="height: 320px"/>-->
                        <small v-show="!newsData.contentRu && submitted" class="p-error">{{ $t("smartenu.contentRuInvalid") }}</small>  
                    </div>
                </TabPanel>
                <TabPanel header="English">
                    <div class="field mt-3">
                        <label for="en-title">{{ $t("common.nameInEnglish") }}</label>
                        <InputText id="en-title" v-model="newsData.titleEn" rows="3" :class="{ 'p-invalid': !newsData.titleEn && submitted }"/>
                        <small v-show="!newsData.titleEn && submitted" class="p-error">{{ $t("smartenu.titleEnInvalid") }}</small>
                    </div>

                    <div class="field">
                        <label for="en-content">{{ $t("common.contentInEnglish") }}</label>
                        <TinyEditor v-model="newsData.contentEn" :height="300" :custom-file-upload="true" @onAfterUpload="onAfterUpload"/>
                        <!--            <Editor id="en-content" v-model="newsData.contentEn" editorStyle="height: 320px"/>-->
                        <small v-show="!newsData.contentEn && submitted" class="p-error">{{ $t("smartenu.contentEnInvalid") }}</small>
                    </div>
                </TabPanel>
            </TabView>
            <div class="field">
                <Fieldset :legend="$t('workPlan.attachments')" :toggleable="true" v-if="newsData.files" collapsed>
                    <div ref="content" class="p-fileupload-content">
                        <div class="p-fileupload-files">
                            <div class="p-fileupload-row" v-for="(item, index) of newsData.files" :key="index">
            <span class="mr-3" style="cursor: pointer;" @click="downloadFile(item.file)">
              <i class="fa-solid fa-file-arrow-down text-green-500"></i>
            </span>
                                <span @click="downloadFile(item.file)"
                                      style="cursor: pointer;">{{ item.file.filename ? item.file.filename : item.file.filepath }}</span>
                                <span class="ml-2">
                <Button icon="pi pi-copy" class="p-button-rounded p-button-text"
                        v-clipboard:copy="copyToClipboard(item.file)" v-clipboard:success="onCopy"/>
              </span>
                                <span>
                <Button icon="pi pi-times" class="p-button-rounded p-button-text" @click="deleteFileConfirm($event, item, index)"/>
              </span>
                            </div>
                        </div>
                    </div>
                </Fieldset>
            </div>
            <div class="field">
                <TreeSelect v-show="selectedCatTree" v-model="selectedCatTree" :options="catTree.root" selectionMode="checkbox"
                            :placeholder="$t('smartenu.selectCategories')"
                            :class="{ 'p-invalid': selectedCatTree.length === 0 && submitted }"/>
                <small v-show="selectedCatTree.length === 0 && submitted" class="p-error">
                    {{ $t("smartenu.selectedCatInvalid") }}
                </small>
            </div>
            <div class="field">
                <label>{{ $t('common.pDate') }}</label>
                <PrimeCalendar v-model="newsData.publish_date" showTime hourFormat="24" dateFormat="dd.mm.yy" showIcon @date-select="selectDate"/>
            </div>
            <div class="field">
                <div class="grid">
                    <div class="col-12 md:col-5">
                        <FileUpload ref="form" mode="basic" :customUpload="true" @uploader="uploadImage1($event)"
                                    :auto="true" v-bind:chooseLabel="$t('smartenu.chooseMainImage')" accept="image/*"/>
                    </div>
                </div>
                <small v-show="!newsData.image_id && submitted" class="p-error">
                    {{ $t("smartenu.image1Invalid") }}
                </small>
                <div v-if="newsData.main_image_file">
                    <img :src="newsData.main_image_file.url" style="width: 50%; height: 50%"/>
                </div>
                <div v-else>
                    <img :src="newsData.imageUrl" style="width: 50%; height: 50%"/>
                </div>
            </div>
            <div class="field-checkbox">
                <Checkbox id="isPoster" name="isPoster" v-model="newsData.isPoster" :binary="true" @change="onChangePoster"/>
                <label for="isPoster">{{ $t("smartenu.addPoster") }}</label>
            </div>
            <div class="field mt-3" style="margin-bottom: 1.5rem" v-if="newsData.isPoster">
                <label for="poster-link">{{ $t("smartenu.posterLink") }}</label>
                <InputText id="poster-link" v-model="poster.link" rows="3" :placeholder="$t('smartenu.posterLink')"/>
                <div class="grid mt-3" v-if="newsData.isPoster">
                    <div class="col">
                        <FileUpload ref="form" mode="basic" :customUpload="true" @uploader="uploadPosterImageKk($event)"
                                    :auto="true" v-bind:chooseLabel="$t('smartenu.posterImageKk')" accept="image/*"/>
                        <div class="mt-3">
                            <img :src="poster.imageKkUrl" style="width: 50%; height: 50%"/>
                        </div>
                    </div>
                    <div class="col">
                        <FileUpload ref="form" mode="basic" :customUpload="true" @uploader="uploadPosterImageRu($event)"
                                    :auto="true" v-bind:chooseLabel="$t('smartenu.posterImageRu')" accept="image/*"/>
                        <div class="mt-3">
                            <img :src="poster.imageRuUrl" style="width: 50%; height: 50%"/>
                        </div>
                    </div>
                    <div class="col">
                        <FileUpload ref="form" mode="basic" :customUpload="true" @uploader="uploadPosterImageEn($event)"
                                    :auto="true" v-bind:chooseLabel="$t('smartenu.posterImageEn')" accept="image/*"/>
                        <div v-if="posterImageEn" class="mt-3">
                            <img :src="posterImageEn" style="width: 50%; height: 50%"/>
                        </div>
                        <div class="mt-3">
                            <img :src="poster.imageEnUrl" style="width: 50%; height: 50%"/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="card">
            <Gallery @afterUpload="afterUpload" @on-remove="onGalleryRemove" :fileList="newsData.files"/>
        </div>
        <template #footer>
            <Button
                    v-bind:label="$t('common.save')"
                    icon="pi pi-check"
                    class="p-button p-component p-button-success mr-2"
                    v-on:click="addNews"
            />
            <Button
                    v-bind:label="$t('common.cancel')"
                    icon="pi pi-times"
                    class="p-button p-component p-button-danger"
                    @click="hideDialog"
            />
        </template>
    </Dialog>
</template>

<script>
import * as imageResizeCompress from "image-resize-compress";
import {formatDate, resizeImages} from "../../helpers/HelperUtil";
import {NewsService} from "../../service/news.service";
import {PosterService} from "../../service/poster.service";
import {downloadRoute, fileRoute, getHeader, smartEnuApi} from "@/config/config";
import Gallery from "@/components/Gallery.vue";
import {FileService} from "@/service/file.service";
import {EnuWebService} from "@/service/enu.web.service";

export default {
    name: "AddEditNews",
    components: {Gallery},
    props: ['isVisible', 'selectedNews', 'catTree', 'catTreeList'],
    data() {
        return {
            editVisible: this.isVisible ?? false,
            formValid: [],
            newsData: this.selectedNews || {},
            submitted: false,
            selectedCatTree: null,
            catTreeElementsList: this.catTreeList,
            mainImage: null,
            posterImageKk: null,
            posterImageRu: null,
            posterImageEn: null,
            posterImgKk: null,
            posterImgRu: null,
            posterImgEn: null,
            poster: this.selectedNews.poster ? this.selectedNews.poster : {
                link: "",
                imageKk: null,
                imageRu: null,
                imageEn: null,
            },
            imageFileMain: null,
            newsService: new NewsService(),
            posterService: new PosterService(),
            galleryFiles: null,
            fileList: [],
            uploadedGalleryFiles: null,
            enuService: new EnuWebService(),
            fileService: new FileService()
        }
    },
    created() {
        if (this.editVisible) {
            this.selectedCatTree = [];
            for (let key in this.catTreeElementsList) {
                for (let ixd in this.newsData.contentCategoryRelations) {
                    if (this.catTreeElementsList[key].data.id === this.newsData.contentCategoryRelations[ixd].categoryId) {
                        this.selectedCatTree[this.catTreeElementsList[key].key] = {
                            checked: this.newsData.contentCategoryRelations[ixd].checked,
                            partialChecked: this.newsData.contentCategoryRelations[ixd].partialChecked,
                        };
                    }
                }
            }
        }
    },
    mounted() {
        this.getGalleryFiles()
        if (this.newsData && this.newsData.main_image_file) {
            this.newsData.main_image_file.url = smartEnuApi + fileRoute + this.newsData.main_image_file.filepath
        } else if (this.newsData && this.newsData.image1) {
            this.newsData.imageUrl = smartEnuApi + fileRoute + this.newsData.image1
        }

        if (this.poster) {
            this.poster.imageKkUrl = this.poster.imageKk ? smartEnuApi + fileRoute + this.poster.imageKk : ""
            this.poster.imageRuUrl = this.poster.imageRu ? smartEnuApi + fileRoute + this.poster.imageRu : ""
            this.poster.imageEnUrl = this.poster.imageEn ? smartEnuApi + fileRoute + this.poster.imageEn : ""
        }
    },
    methods: {
        formatDate,
        onAfterUpload(file) {
            this.fileList.push(file);
            if (this.newsData.files && this.newsData.files.length !== 0) {
                this.newsData.files.push({file_id: file.id, file: file})
            } else {
                this.newsData.files = [];
                this.newsData.files.push({file_id: file.id, file: file})
            }
        },
        copyToClipboard(file) {
            return smartEnuApi + downloadRoute + file.uuid;
        },
        selectDate(event) {
            this.newsData.publish_date = new Date(event);
        },
        addNews() {
            this.submitted = true;
            if (this.validateNews().length > 0) {
                return;
            }
            this.newsData.contentCategoryRelations = [];
            for (let key in this.catTreeElementsList) {
                for (let ixd in this.selectedCatTree) {
                    if (this.catTreeElementsList[key].key.toString() === ixd) {
                        this.newsData.contentCategoryRelations.push({
                            id: 0,
                            contentId: 0,
                            categoryId: this.catTreeElementsList[key].data.id,
                            checked: this.selectedCatTree[ixd].checked,
                            partialChecked: this.selectedCatTree[ixd].partialChecked,
                        });
                    }
                }
            }

            if (this.newsData.isPoster) {
                this.validPosterImages();
                if (this.formValid.length > 0) {
                    return;
                }

                this.posterService.addPoster(this.poster).then((res) => {
                    this.newsData.posterId = res.data.id;
                    this.insertNews();
                });
            } else {
                this.insertNews();
            }
        },
        async insertNews() {
            /*await resizeImages(this.newsData.contentKz).then(res => {
              this.newsData.contentKz = res
            });
            await resizeImages(this.newsData.contentRu).then(res => {
              this.newsData.contentRu = res
            });
            await resizeImages(this.newsData.contentEn).then(res => {
              this.newsData.contentEn = res
            });*/

            if (this.uploadedGalleryFiles) {
                this.uploadedGalleryFiles.forEach(item => {
                    this.newsData.files = this.newsData.files || [];
                    this.newsData.files.push({file_id: item.id, file: item, is_gallery: item.is_gallery});
                })
            }

            const data = this.newsData;
            delete data.galleryFiles;

            /*const fd = new FormData();
            fd.append("news", JSON.stringify(data))
            fd.append("imageFileMain", this.imageFileMain);*/
            this.newsService.addNews(data).then((response) => {
                if (response.data !== null) {
                    this.emitter.emit('newsCreated', true);
                }
            }).catch((error) => {
                if (error.response.status == 401) {
                    this.$store.dispatch("logLout");
                } else {
                    this.$toast.add({
                        severity: "error",
                        summary: this.$t("smartenu.saveNewsError") + ":\n" + error,
                        life: 3000,
                    });
                }
            });
        },
        uploadImage1(event) {
            const fd = new FormData()
            fd.append("files[]", event.files[0])
            this.fileService.uploadFile(fd).then(res => {
                if (res.data) {
                    this.newsData.main_image_file = res.data[0];
                    this.newsData.main_image_file.url = smartEnuApi + fileRoute + this.newsData.main_image_file.filepath
                    this.newsData.image_id = this.newsData.main_image_file.id
                }
            }).catch(error => {
                this.$toast.add({severity: "error", summary: error, life: 3000});
            })
        },
        uploadPosterImageKk(event) {
            const fd = new FormData()
            fd.append("files[]", event.files[0])
            fd.append("watermark", false)
            this.fileService.uploadFile(fd).then(res => {
                if (res.data) {
                    this.poster.image_kk_file = res.data[0];
                    this.poster.imageKkUrl = smartEnuApi + fileRoute + this.poster.image_kk_file.filepath
                    this.poster.imageKk = this.poster.image_kk_file.filepath

                }
            }).catch(error => {
                this.$toast.add({severity: "error", summary: error, life: 3000});
            })
        },
        uploadPosterImageRu(event) {
            const fd = new FormData()
            fd.append("files[]", event.files[0])
            fd.append("watermark", false)
            this.fileService.uploadFile(fd).then(res => {
                if (res.data) {
                    this.poster.image_ru_file = res.data[0];
                    this.poster.imageRuUrl = smartEnuApi + fileRoute + this.poster.image_ru_file.filepath
                    this.poster.imageRu = this.poster.image_ru_file.filepath
                }
            }).catch(error => {
                this.$toast.add({severity: "error", summary: error, life: 3000});
            })
        },
        uploadPosterImageEn(event) {
            const fd = new FormData()
            fd.append("files[]", event.files[0])
            fd.append("watermark", false)
            this.fileService.uploadFile(fd).then(res => {
                if (res.data) {
                    this.poster.image_en_file = res.data[0];
                    this.poster.imageEnUrl = smartEnuApi + fileRoute + this.poster.image_en_file.filepath
                    this.poster.imageEn = this.poster.image_en_file.filepath
                }
            }).catch(error => {
                this.$toast.add({severity: "error", summary: error, life: 3000});
            })
        },
        onChangePoster() {
            if (!this.newsData.isPoster) {
                this.newsData.posterId = null
                this.poster = {
                    link: "",
                    imageKk: null,
                    imageRu: null,
                    imageEn: null,
                }
            }
        },
        createCatTree: function (id, key) {
            let array = [];
            let grandparents = this.categories.filter(
                (category) => category.parentId === id
            );
            for (let i = 0; i < grandparents.length; i++) {
                this.catTreeElementsList.push({
                    key: key + i,
                    data: grandparents[i],
                });
                array.push({
                    key: key + i,
                    label:
                        this.$i18n.locale === "kz"
                            ? grandparents[i].nameKz
                            : this.$i18n.locale === "ru"
                                ? grandparents[i].nameRu
                                : grandparents[i].nameEn,
                    data: grandparents[i],
                    children: this.createCatTree(grandparents[i].id, key + i + "-"),
                });
            }
            return array;
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
                        this.newsData.files.splice(index, 1)
                    }
                }
            });
        },
        deleteFile(id) {
            this.newsService.deleteNewsFile(id).then(res => {
                if (res.data.is_success) {
                    this.getNewsFiles();
                    this.$toast.add({severity: 'success', detail: this.$t('common.done'), life: 3000});
                }
            }).catch((error) => {
                this.$toast.add({severity: "error", summary: error, life: 3000});
            });
        },
        getNewsFiles() {
            this.newsService.getNewsFiles({content_id: this.newsData.id}).then(res => {
                this.newsData.files = res.data;
            }).catch(error => {
                this.$toast.add({severity: "error", summary: error, life: 3000});
            });
        },
        onCopy() {
            this.$toast.add({severity: 'success', summary: this.$t('ncasigner.successCopy'), life: 3000});
        },
        getGalleryFiles() {
            this.newsService.getNewsFiles({content_id: this.newsData.id, is_gallery: true}).then(res => {
                this.galleryFiles = res.data;
            }).catch(error => {
                this.$toast.add({severity: "error", summary: error, life: 3000});
            });
        },
        afterUpload(files) {
            this.uploadedGalleryFiles = files;
        },
        onGalleryRemove(event) {
            if (event && this.newsData.files) {
                this.newsData.files.forEach(e => {
                    if (e.file_id === event.id) {
                        e.is_deleted = true;
                    }
                })
            }
        },
        validateNews() {
            this.formValid = [];
            if (!this.newsData.titleKz) {
                this.formValid.push({titleKz: true})
            }
            if (!this.newsData.titleRu) {
                this.formValid.push({titleRu: true})
            }
            if (!this.newsData.titleEn) {
                this.formValid.push({titleRu: true})
            }
            if (!this.newsData.contentKz) {
                this.formValid.push({contentKz: true})
            }
            if (!this.newsData.contentRu) {
                this.formValid.push({contentRu: true})
            }
            if (!this.newsData.contentEn) {
                this.formValid.push({contentEn: true})
            }
            if (this.selectedCatTree.length === 0) {
                this.formValid.push({selectedCatTree: true})
            }
            if (!this.newsData.image_id) {
                this.formValid.push(this.$t("smartenu.image1Invalid"));
            }
            return this.formValid;
        },
        validPosterImages() {
            if (!this.poster.imageKk) {
                this.formValid.push(this.$t("smartenu.posterImageKkInvalid"));
            }
            if (!this.poster.imageRu) {
                this.formValid.push(this.$t("smartenu.posterImageRuInvalid"));
            }
            if (!this.poster.imageEn) {
                this.formValid.push(this.$t("smartenu.posterImageEnInvalid"));
            }
        },
        hideDialog() {
            this.emitter.emit('addEditNewsDialogHide', true);
        }
    }
}
</script>

<style scoped>
.p-fileupload-row {
    display: flex;
    align-items: center;
}
</style>
