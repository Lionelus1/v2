<template>
    <ConfirmPopup group="deleteResult"></ConfirmPopup>
    <Dialog v-if="editVisible" v-model:visible="editVisible" :closable="false" :style="{ width: '1000px' }"
            :breakpoints="{'960px': '75vw', '640px': '90vw'}"
            :header="$t('smartenu.createOrEditEvents')" :modal="true" class="p-fluid">
        <div class="card">
            <!--      <Message v-for="msg of formValid" severity="error" :key="msg">{{ msg }}</Message>-->
            <TabView>
                <TabPanel header="Қазақша">
                    <div class="field mt-3">
                        <label for="kz-title">{{ $t("common.nameInQazaq") }}</label>
                        <InputText id="kz-title" v-model="event.titleKz" rows="3"
                                   :class="{ 'p-invalid': event.titleKz && submitted }"/>
                        <small v-show="!event.titleKz && submitted" class="p-error">{{ $t("smartenu.titleKzInvalid") }}</small>
                    </div>
                    <div class="field">
                        <label for="kz-content">{{ $t("common.contentInQazaq") }}</label>
                        <TinyEditor v-model="event.contentKz" :height="300" :custom-file-upload="true" @onAfterUpload="onAfterUpload"/>
                        <!--            <RichEditor ref="kztext" id="kz-content" v-model="event.contentKz" editorStyle="height: 320px"></RichEditor>-->
                        <small v-show="!event.contentKz && submitted" class="p-error">
                            {{ $t("smartenu.contentKzInvalid") }}
                        </small>
                    </div>
                </TabPanel>
                <TabPanel header="Русский">
                    <div class="field mt-3" style="margin-bottom: 1.5rem">
                        <label for="ru-title">{{ $t("common.nameInRussian") }}</label>
                        <InputText id="ru-title" v-model="event.titleRu" rows="3"
                                   :class="{ 'p-invalid': !event.titleRu && submitted }"/>
                        <small v-show="!event.titleRu && submitted" class="p-error">
                            {{ $t("smartenu.titleRuInvalid") }}
                        </small>
                    </div>
                    <div class="field">
                        <label for="ru-content">{{ $t("common.contentInRussian") }}</label>
                        <TinyEditor v-model="event.contentRu" :height="300" :custom-file-upload="true" @onAfterUpload="onAfterUpload"/>
                        <!--            <Editor id="ru-content" v-model="event.contentRu" editorStyle="height: 320px"/>-->
                        <small v-show="!event.contentRu && submitted" class="p-error">
                            {{ $t("smartenu.contentRuInvalid") }}
                        </small>
                    </div>
                </TabPanel>
                <TabPanel header="English">
                    <div class="field mt-3" style="margin-bottom: 1.5rem">
                        <label for="en-title">{{ $t("common.nameInEnglish") }}</label>
                        <InputText id="en-title" v-model="event.titleEn" rows="3"
                                   :class="{ 'p-invalid': !event.titleEn && submitted }"/>
                        <small v-show="!event.titleEn && submitted" class="p-error">
                            {{ $t("smartenu.titleEnInvalid") }}
                        </small>
                    </div>
                    <div class="field">
                        <label for="en-content">{{ $t("common.contentInEnglish") }}</label>
                        <TinyEditor v-model="event.contentEn" :height="300" :custom-file-upload="true" @onAfterUpload="onAfterUpload"/>
                        <!--            <Editor id="en-content" v-model="event.contentEn" editorStyle="height: 320px"/>-->
                        <small v-show="!event.contentEn && submitted" class="p-error">
                            {{ $t("smartenu.contentEnInvalid") }}
                        </small>
                    </div>
                </TabPanel>
            </TabView>
            <div class="field">
                <Fieldset :legend="$t('workPlan.attachments')" :toggleable="true" v-if="event.files" collapsed>
                    <div ref="content" class="p-fileupload-content">
                        <div class="p-fileupload-files">
                            <div class="p-fileupload-row" v-for="(item, index) of event.files" :key="index">
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
            <div class="field" v-if="eventTypes">
                <label>{{ $t('common.eventType') }}</label>
                <Dropdown id="is-online" v-model="selectedEventType" :options="eventTypes" :optionLabel="'name_' + $i18n.locale" @change="onTypeSelect"
                          :placeholder="$t('common.eventType')" :class="{ 'p-invalid': !event.event_type_id && submitted }"/>
                <small v-show="!event.event_type_id && submitted" class="p-error">
                    {{ $t("common.requiredField") }}
                </small>
            </div>
            <div v-if="selectedEventType && selectedEventType.code === isEvent">
                <div class="field">
                    <label for="is-online">{{ $t("smartenu.eventFormat") }}</label>
                    <Dropdown id="is-online" v-model="event.isOnline" :options="format" optionLabel="name" optionValue="value"
                              :placeholder="$t('smartenu.eventFormat')" :class="{ 'p-invalid': !event.isOnline && submitted }"/>
                    <small v-show="!event.isOnline && submitted" class="p-error">
                        {{ $t("smartenu.isOnlineInvalid") }}
                    </small>
                </div>
                <div class="field" style="margin-top: 1.5rem" v-if="event.isOnline === true">
                    <label for="event-link">{{ $t("smartenu.meetingLink") }}</label>
                    <InputText id="event-link" v-model="event.eventLink" rows="3"
                               :class="{ 'p-invalid': !event.eventLink && submitted }"/>
                    <small v-show="!event.eventLink && submitted" class="p-error">
                        {{ $t("smartenu.eventLinkInvalid") }}
                    </small>
                </div>
                <div class="field" style="margin-top: 1.5rem" v-if="event.isOnline === false">
                    <label for="event-location">
                        {{ $t("smartenu.meetingLocation") }}
                    </label>
                    <InputText id="event-location" v-model="event.eventLocation" rows="3"
                               :class="{ 'p-invalid': !event.eventLocation && submitted }"/>
                    <small v-show="!event.eventLocation && submitted" class="p-error">
                        {{ $t("smartenu.eventLocationInvalid") }}
                    </small>
                </div>
                <div class="field" v-if="event.isOnline !== 2">
                    <label for="p-cat">{{ $t("smartenu.participantsCategory") }}</label>
                    <MultiSelect v-model="selectedMainCategories" :options="participantsMainCategories"
                                 :optionLabel="$i18n.locale === 'kz' ? `nameKz` : $i18n.locale === 'ru' ? `nameRu` : `nameEn`"
                                 :placeholder="$t('smartenu.selectMainCategory')"
                                 :class="{'p-invalid': !selectedMainCategories && submitted}"/>
                    <small v-show="!selectedMainCategories && submitted" class="p-error">
                        {{ $t("smartenu.selectedCatInvalid") }}
                    </small>
                </div>
                <div class="field">
                    <MultiSelect v-if="isBachelor" v-model="selectedBachelorCourses" :options="bachelorCourses"
                                 :optionLabel="$i18n.locale === 'kz' ? `nameKz` : $i18n.locale === 'ru' ? `nameRu` : `nameEn`"
                                 :placeholder="$t('smartenu.selectBachelor')"/>
                </div>
                <div class="field">
                    <MultiSelect v-if="isMaster" v-model="selectedMasterCourses" :options="masterCourses"
                                 :optionLabel="$i18n.locale === 'kz' ? `nameKz` : $i18n.locale === 'ru' ? `nameRu` : `nameEn`"
                                 :placeholder="$t('smartenu.selectMaster')"/>
                </div>
                <div class="field">
                    <MultiSelect v-if="isFaculty" v-model="selectedFaculties" :options="faculties"
                                 :optionLabel="$i18n.locale === 'kz' ? `nameKz` : $i18n.locale === 'ru' ? `nameRu` : `nameEn`"
                                 :placeholder="$t('smartenu.selectFaculty')"/>
                </div>
                <div class="field">
                    <MultiSelect v-if="isFacultySelected" v-model="selectedDepartments" :options="departments"
                                 :optionLabel="$i18n.locale === 'kz' ? `nameKz` : $i18n.locale === 'ru' ? `nameRu` : `nameEn`"
                                 :placeholder="$t('smartenu.selectDepartment')"/>
                </div>
            </div>
            <div class="field">
                <div><label for="data-and-time">{{ $t("smartenu.dataAndTime") }}</label></div>
                <PrimeCalendar id="data-and-time" :placeholder="$t('faq.createDate')" :showTime="true"
                               :showSeconds="true" v-model="event.eventDate" dateFormat="dd.mm.yy"/>
            </div>
            <div class="field">
                <div class="grid">
                    <div class="col-12 md:col-5">
                        <FileUpload ref="form" mode="basic" :customUpload="true" @uploader="uploadMainImage($event)"
                                    :auto="true" v-bind:chooseLabel="$t('smartenu.chooseMainImage')"/>
                    </div>
                </div>
                <div v-if="event.main_image_file">
                    <img :src="event.main_image_file.url" style="width: 50%; height: 50%"/>
                </div>
                <div v-else>
                    <img :src="event.imageUrl" style="width: 50%; height: 50%"/>
                </div>
            </div>
            <div class="field">
                <div class="grid">
                    <div class="col-12 md:col-3">
                        <FileUpload ref="form" mode="basic" :customUpload="true" @uploader="uploadFile($event)" :auto="true"
                                    v-bind:chooseLabel="$t('smartenu.chooseAdditionalFile')"/>
                    </div>
                    <div class="col-12 md:col-5">
                        <InlineMessage severity="info" show v-if="event.additionalFileName">
                            {{ $t("ncasigner.chosenFile", {fn: event.additionalFileName}) }}
                        </InlineMessage>
                    </div>
                </div>
            </div>
            <div class="field-checkbox">
                <Checkbox id="isPoster" name="isPoster" v-model="event.isPoster" :binary="true"/>
                <label for="isPoster">{{ $t("smartenu.addPoster") }}</label>
            </div>
            <div class="field mt-3" style="margin-bottom: 1.5rem" v-if="event.isPoster">
                <label for="poster-link">{{ $t("smartenu.posterLink") }}</label>
                <InputText id="poster-link" v-model="poster.link" rows="3" :placeholder="$t('smartenu.posterLink')"/>
                <div class="grid mt-3" v-if="event.isPoster">
                    <div class="p-col">
                        <FileUpload ref="form" mode="basic" :customUpload="true" @uploader="uploadPosterImageKk($event)"
                                    :auto="true" v-bind:chooseLabel="$t('smartenu.posterImageKk')" accept="image/*"/>
                        <div v-if="posterImageKk" class="mt-3">
                            <img :src="posterImageKk" style="width: 50%; height: 50%"/>
                        </div>
                        <div v-else class="mt-3">
                            <img :src="poster.imageKkUrl" style="width: 50%; height: 50%"/>
                        </div>
                    </div>
                    <div class="p-col">
                        <FileUpload ref="form" mode="basic" :customUpload="true" @uploader="uploadPosterImageRu($event)"
                                    :auto="true" v-bind:chooseLabel="$t('smartenu.posterImageRu')" accept="image/*"/>
                        <div v-if="posterImageRu" class="mt-3">
                            <img :src="posterImageRu" style="width: 50%; height: 50%"/>
                        </div>
                        <div v-else class="mt-3">
                            <img :src="poster.imageRuUrl" style="width: 50%; height: 50%"/>
                        </div>
                    </div>
                    <div class="p-col">
                        <FileUpload ref="form" mode="basic" :customUpload="true" @uploader="uploadPosterImageEn($event)"
                                    :auto="true" v-bind:chooseLabel="$t('smartenu.posterImageEn')" accept="image/*"/>
                        <div v-if="posterImageEn" class="mt-3">
                            <img :src="posterImageEn" style="width: 50%; height: 50%"/>
                        </div>
                        <div v-else class="mt-3">
                            <img :src="poster.imageEnUrl" style="width: 50%; height: 50%"/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <template #footer>
            <Button v-bind:label="$t('common.cancel')" icon="pi pi-times" class="p-button-rounded p-button-danger"
                    @click="hideDialog"/>
            <Button v-bind:label="$t('common.save')" icon="pi pi-check" class="p-button-rounded p-button-success mr-2"
                    v-on:click="addEvent"/>
        </template>
    </Dialog>
</template>

<script>
import RichEditor from "../documents/editor/RichEditor";
import {EventsService} from "../../service/event.service";
import {resizeImages} from "../../helpers/HelperUtil";
import * as imageResizeCompress from "image-resize-compress";
import {PosterService} from "../../service/poster.service";
import {downloadRoute, fileRoute, getHeader, smartEnuApi} from "@/config/config";
import {FileService} from "@/service/file.service";

export default {
    name: "AddEditEvent",
    props: ['selectedEvent', 'isVisible', 'partCats'],
    data() {
        return {
            editVisible: this.isVisible ?? false,
            event: this.selectedEvent,
            formValid: [],
            isPoster: false,
            poster: this.selectedEvent && this.selectedEvent.poster ? this.selectedEvent.poster : {
                link: "",
                imageKk: null,
                imageRu: null,
                imageEn: null,
            },
            format: [
                {
                    name: "Онлайн",
                    value: true,
                },
                {
                    name: "Оффлайн",
                    value: false,
                },
            ],
            eventTypes: null,
            selectedEventType: this.selectedEvent ? this.selectedEvent.event_type : null,
            posterImageKk: null,
            posterImageRu: null,
            posterImageEn: null,
            posterImgKk: null,
            posterImgRu: null,
            posterImgEn: null,
            submitted: false,
            participantsCategories: this.partCats,
            participantsMainCategories: null,
            selectedMainCategories: null,
            masterCourses: null,
            selectedMasterCourses: null,
            bachelorCourses: null,
            selectedBachelorCourses: null,
            faculties: null,
            selectedFaculties: null,
            departments: null,
            selectedDepartments: null,
            eventService: new EventsService(),
            posterService: new PosterService(),
            fileService: new FileService(),
            fileList: [],
            mainImage: null
        }
    },
    mounted() {
      if (this.event && this.event.main_image_file) {
          this.event.main_image_file.url = smartEnuApi + fileRoute + this.event.main_image_file.filepath
      } else if (this.event && this.event.main_image_path) {
          this.event.main_image_path = smartEnuApi + fileRoute + this.event.main_image_path
      }
    },
    created() {
        this.getEventTypes();
        this.getMainCategories();
        this.getMasterCourses();
        this.getBachelorCourses();
        this.getFaculties();
        if (this.event && this.event.id) {
            this.selectedMainCategories = this.event.participantsCategory.filter(
                (category) => category.parentId === null
            );
            this.selectedMasterCourses = this.event.participantsCategory.filter(
                (category) => category.parentId === 3
            );
            this.selectedBachelorCourses = this.event.participantsCategory.filter(
                (category) => category.parentId === 4
            );
            this.selectedFaculties = this.event.participantsCategory.filter(
                (category) => category.parentId === 6
            );
            this.selectedDepartments = [];
            for (let i = 0; i < this.selectedFaculties.length; i++) {
                let array = this.participantsCategories.filter(
                    (category) => category.parentId === this.selectedFaculties[i].id
                );
                this.selectedDepartments = this.selectedDepartments.concat(array);
            }
        }
    },
    methods: {
        addEvent() {
            this.submitted = true;
            this.validateEvents();
            if (this.formValid.length > 0) {
                return;
            }
            let main = [];
            main =
                this.selectedMainCategories != null
                    ? this.selectedMainCategories.concat(
                        this.selectedBachelorCourses != null
                            ? this.selectedBachelorCourses.concat(
                                this.selectedMasterCourses != null
                                    ? this.selectedMasterCourses
                                    : null
                            )
                            : this.selectedMasterCourses != null
                                ? this.selectedMasterCourses
                                : null
                    )
                    : null;
            this.event.participantsCategory = main ? main.concat(
                this.selectedFaculties !== null
                    ? this.selectedFaculties.concat(
                        this.selectedDepartments !== null
                            ? this.selectedDepartments
                            : null
                    )
                    : null
            ) : null;
            if (this.event.isPoster) {
                this.validPosterImages();
                if (this.formValid.length > 0) {
                    return;
                }
                const fd = new FormData();
                fd.append("link", this.poster.link ? this.poster.link : '')
                fd.append("imageKk", this.poster.imageKk)
                fd.append("imageRu", this.poster.imageRu)
                fd.append("imageEn", this.poster.imageEn)
                if (this.posterImgKk)
                    fd.append("imgKk", this.posterImgKk)
                if (this.posterImgRu)
                    fd.append("imgRu", this.posterImgRu)
                if (this.posterImgEn)
                    fd.append("imgEn", this.posterImgEn)

                fd.append("id", this.poster.id ? parseInt(this.poster.id) : 0)

                this.posterService.addPoster(fd).then((res) => {
                    this.event.posterId = res.data.id;
                    this.insertEvent();
                });
            } else {
                this.insertEvent();
            }
        },
        insertEvent() {
            if (this.event.poster)
                this.event.posterId = this.event.poster.id;
            /*const fd = new FormData();
            fd.append("event", JSON.stringify(this.event))*/

            this.eventService.addEvent(this.event).then((response) => {
                if (response.data !== null) {
                    this.emitter.emit('eventCreated', true);
                }
            }).catch((error) => {
                this.$toast.add({
                    severity: "error",
                    summary: this.$t("smartenu.saveEventError") + ":\n" + error,
                    life: 3000,
                });
            });
        },
        onTypeSelect(event) {
            this.event.event_type_id = event.value.id
        },
        uploadMainImage(event) {
            const fd = new FormData()
            fd.append("files[]", event.files[0])
            this.fileService.uploadFile(fd).then(res => {
                if (res.data) {
                    this.event.main_image_file = res.data[0];
                    this.event.main_image_file.url = smartEnuApi + fileRoute + this.event.main_image_file.filepath
                    this.event.main_image_id = this.event.main_image_file.id
                }
            }).catch(error => {
                this.$toast.add({severity: "error", summary: error, life: 3000});
            })
        },
        uploadFile(event) {
            const fd = new FormData()
            fd.append("files[]", event.files[0])
            this.fileService.uploadFile(fd).then(res => {
                if (res.data) {
                    const file = res.data[0]
                    this.event.additionalFileName = file.filename;
                    this.event.additional_file_path = file.filepath;
                }
            }).catch(error => {
                this.$toast.add({severity: "error", summary: error, life: 3000});
            })
        },
        uploadPosterImageKk(event) {
            const file = event.files[0];
            this.posterImgKk = file;
            imageResizeCompress
                .fromBlob(file, 90, 720, "auto", "jpeg")
                .then((res) => {
                    imageResizeCompress.blobToURL(res).then((resp) => {
                        this.posterImageKk = resp;
                    });
                });
        },
        uploadPosterImageRu(event) {
            const file = event.files[0];
            this.posterImgRu = file;
            imageResizeCompress
                .fromBlob(file, 90, 720, "auto", "jpeg")
                .then((res) => {
                    imageResizeCompress.blobToURL(res).then((resp) => {
                        this.posterImageRu = resp;
                    });
                });
        },
        uploadPosterImageEn(event) {
            const file = event.files[0];
            this.posterImgEn = file;
            imageResizeCompress
                .fromBlob(file, 90, 720, "auto", "jpeg")
                .then((res) => {
                    imageResizeCompress.blobToURL(res).then((resp) => {
                        this.posterImageEn = resp;
                    });
                });
        },
        getEventTypes() {
          this.eventService.getEventTypes().then(res => {
              if (res.data) {
                  this.eventTypes = res.data;
              }
          }).catch(error => {
              this.$toast.add({severity: "error", summary: error, life: 3000});
          })
        },
        getMainCategories() {
            this.participantsMainCategories = [];
            this.participantsMainCategories = this.participantsCategories.filter(
                (category) => category.parentId === null
            );
        },
        getMasterCourses() {
            this.masterCourses = [];
            this.masterCourses = this.participantsCategories.filter(
                (category) => category.parentId === 3
            );
        },

        getBachelorCourses() {
            this.bachelorCourses = [];
            this.bachelorCourses = this.participantsCategories.filter(
                (category) => category.parentId === 4
            );
        },
        getFaculties() {
            this.faculties = [];
            this.faculties = this.participantsCategories.filter(
                (category) => category.parentId === 6
            );
        },
        hideDialog() {
            this.emitter.emit('addEditEventDialogHide', true);
        },
        validateEvents() {
            this.formValid = [];
            if (!this.event.titleKz) {
                this.formValid.push({titleKz: true})
            }
            if (!this.event.titleRu) {
                this.formValid.push({titleRu: true})
            }
            if (!this.event.titleEn) {
                this.formValid.push({titleEn: true})
            }
            if (!this.event.contentKz) {
                this.formValid.push({contentKz: true})
            }
            if (!this.event.contentRu) {
                this.formValid.push({contentRu: true})
            }
            if (!this.event.contentEn) {
                this.formValid.push({contentEn: true})
            }

            if (this.selectedEventType.code === this.isEvent && this.event.isOnline == true && !this.event.eventLink) {
                this.formValid.push({eventLink: true})
            }

            if (this.selectedEventType.code === this.isEvent && this.event.isOnline == false && !this.event.eventLocation) {
                this.formValid.push({eventLocation: true})
            }
            if (this.selectedEventType.code === this.isEvent && !this.editVisible && !this.mainImageFile) {
                this.formValid.push(this.$t("smartenu.image1Invalid"));
            }
            if (this.selectedEventType.code === this.isEvent && !this.selectedMainCategories) {
                this.formValid["selectedMainCategories"] = true;
            } else {
                delete this.formValid["selectedMainCategories"];
            }
        },
        validPosterImages() {
            if (!this.poster.imageKk && !this.posterImgKk) {
                this.formValid.push(this.$t("smartenu.posterImageKkInvalid"));
            }
            if (!this.poster.imageRu && !this.posterImgRu) {
                this.formValid.push(this.$t("smartenu.posterImageRuInvalid"));
            }
            if (!this.poster.imageEn && !this.posterImgEn) {
                this.formValid.push(this.$t("smartenu.posterImageEnInvalid"));
            }
        },
        onAfterUpload(file) {
            this.fileList.push(file);
            if (this.event.files && this.event.files.length !== 0) {
                this.event.files.push({file_id: file.id, file: file})
            } else {
                this.event.files = [];
                this.event.files.push({file_id: file.id, file: file})
            }
        },
        copyToClipboard(file) {
            return smartEnuApi + downloadRoute + file.uuid;
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
                        this.event.files.splice(index, 1)
                    }
                }
            });
        },
        deleteFile(id) {
            this.eventService.deleteEventFile(id).then(res => {
                if (res.data.is_success) {
                    this.getEventFiles();
                    this.$toast.add({severity: 'success', detail: this.$t('common.done'), life: 3000});
                }
            }).catch((error) => {
                this.$toast.add({severity: "error", summary: error, life: 3000});
            });
        },
        getEventFiles() {
            this.eventService.getEventFiles(this.event.id).then(res => {
                this.event.files = res.data;
            }).catch(error => {
                this.$toast.add({severity: "error", summary: error, life: 3000});
            });
        },
        onCopy() {
            this.$toast.add({severity: 'success', summary: this.$t('ncasigner.successCopy'), life: 3000});
        },
        async convertBase64(document) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(document);
                reader.onload = () => {
                    resolve(reader.result);
                };
                reader.onerror = (error) => reject(error);
            });
        },
    },
    computed: {
        isEvent: function() {
            return this.eventService.isEvent()
        },
        isMaster: function () {
            if (this.selectedMainCategories === null) {
                return false;
            } else {
                return this.selectedMainCategories.find(
                    (category) => category.id === 3
                );
            }
        },
        isBachelor: function () {
            if (this.selectedMainCategories === null) {
                return false;
            } else {
                return this.selectedMainCategories.find(
                    (category) => category.id === 4
                );
            }
        },
        isFaculty: function () {
            if (this.selectedMainCategories === null) {
                return false;
            } else {
                return this.selectedMainCategories.find(
                    (category) => category.id === 6
                );
            }
        },

        isFacultySelected: function () {
            if (this.selectedFaculties === null) {
                return false;
            } else {
                return this.selectedFaculties.find(
                    (category) => category.parentId === 6
                );
            }
        },
        isCreated: function () {
            return (
                this.selectedEvent &&
                this.selectedEvent.history.status.id === this.statuses.created
            );
        },

        isAdmin: function () {
            return this.roles.isAdmin;
        },
        isModer: function () {
            return this.roles.isModer;
        },
        isPublisher: function () {
            return this.roles.isPublisher;
        },
        isStudent: function () {
            return this.roles.isStudent;
        }
    },
    watch: {
        selectedFaculties: function () {
            if (this.selectedFaculties === null) {
                return null;
            } else {
                this.departments = [];
                for (let i = 0; i < this.selectedFaculties.length; i++) {
                    let array = this.participantsCategories.filter(
                        (category) => category.parentId === this.selectedFaculties[i].id
                    );
                    this.departments = this.departments.concat(array);
                }
            }
        },
    },
}
</script>

<style scoped>

</style>
