<template>
  <div class="p-col-12">
    <!-- BEGINNING OF TABLE -->
    <div class="card" v-if="isAdmin || isModer || selectedEvent">
      <Button v-if="isAdmin || isModer" :label="$t('common.add')" icon="pi pi-plus"
              class="p-button-success p-mr-2" v-on:click="createEvent"/>
      <Button :label="$t('common.publish')" v-if="isCreated && (isAdmin || isPublisher)" icon="pi pi-check"
              class="p-button-help p-mr-2" v-on:click="publishEvent"/>
      <Button :label="$t('common.show')" v-if="selectedEvent" icon="pi pi-eye"
              class="p-button-secondary p-mr-2" v-on:click="eventView"/>
    </div>

    <!-- BEGINNING OF TABLE -->
    <div class="card">
      <DataTable :value="allEvents" :paginator="true" class="p-datatable-customers" :rows="10" dataKey="id"
                 selectionMode="single" :rowHover="true" v-model:selection="selectedEvent" :filters="filters"
                 :loading="loading">
        <template #header>
          <div class="table-header">
            {{ $t("smartenu.eventsTitle") }}
            <span class="p-input-icon-left">
              <i class="pi pi-search"/>
              <InputText v-model="filters['global'].value" v-bind:placeholder="$t('hdfs.search')"/>
            </span>
          </div>
        </template>
        <template #empty>{{ $t("smartenu.eventsNotFound") }}</template>
        <template #loading>{{ $t("smartenu.loadingEvents") }}</template>
        <Column :field="$i18n.locale === 'kz' ? `titleKz`: $i18n.locale === 'ru' ? `titleRu` : `titleEn`"
                v-bind:header="$t('common.nameIn')" :sortable="true">
          <template #body="slotProps">
          <span>
            {{
              $i18n.locale === "kz" ? slotProps.data.titleKz : $i18n.locale === "ru" ? slotProps.data.titleRu : slotProps.data.titleEn
            }}
          </span>
          </template>
        </Column>
        <Column field="history" v-bind:header="$t('common.status')" :sortable="true">
          <template #body="slotProps">
          <span :class="'customer-badge status-' + slotProps.data.history.status.id">
            {{
              $i18n.locale === "kz" ? slotProps.data.history.status.nameKz : $i18n.locale === "ru"
                  ? slotProps.data.history.status.nameRu : slotProps.data.history.status.nameEn
            }}
          </span>
          </template>
        </Column>
        <Column field="createdBy" v-bind:header="$t('common.createdBy')" :sortable="true">
          <template #body="slotProps">
          <span>
            {{ slotProps.data.createdBy.fullName }}
          </span>
          </template>
        </Column>
        <Column>
          <template #body="{ data }">
            <Button icon="pi pi-pencil" class="p-button-rounded p-button-success" @click="editEvent(data)"
                    v-if="data.history.status.id === statuses.created || isAdmin || isModer "/>
            <Button icon="pi pi-trash" class="p-button-rounded p-button-warning p-ml-2" @click="deleteConfirm(data)"
                    v-if="data.history.status.id === statuses.created || isAdmin"/>
          </template>
        </Column>
      </DataTable>
    </div>


    <EventsView v-if="eventViewVisible" :is-visible="eventViewVisible" :selected-event="event" />
  </div>
</template>

<script>
import axios from "axios";
import {getHeader, smartEnuApi} from "@/config/config";
import {FilterMatchMode} from "primevue/api";
import * as imageResizeCompress from "image-resize-compress";
import RichEditor from "../documents/editor/RichEditor";
import {resizeImages} from "../../helpers/HelperUtil";
import {fileRoute} from "../../config/config";
import EventsView from "./EventsView"; // ES6

export default {
  name: "Events",
  components: {EventsView},
  data() {
    return {
      statuses: {
        created: 1,
        published: 3,
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
      participantsCategories: [],
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
      editVisible: false,
      deleteVisible: false,
      eventViewVisible: false,
      submitted: false,
      event: null,
      allEvents: [],
      selectedEvent: null,
      filters: {
        global: {
          value: null,
          matchMode: FilterMatchMode.CONTAINS,
        },
        name: {
          value: null,
          matchMode: FilterMatchMode.STARTS_WITH,
        },
        "country.name": {
          value: null,
          matchMode: FilterMatchMode.STARTS_WITH,
        },
        representative: {
          value: null,
          matchMode: FilterMatchMode.IN,
        },
        status: {
          value: null,
          matchMode: FilterMatchMode.EQUALS,
        },
        verified: {
          value: null,
          matchMode: FilterMatchMode.EQUALS,
        },
      },
      loading: true,
      file: null,
      userRoles: null,
      roles: {
        isAdmin: false,
        isModer: false,
        isPublisher: false,
        isUser: true,
        isStudent: false,
      },
      formValid: [],
      isPoster: false,
      poster: {
        imageKk: "",
        imageRu: "",
        imageEn: "",
      },
      posterImageKk: null,
      posterImageRu: null,
      posterImageEn: null,
      mainImageFile: null,
      additionalFile: null
    };
  },
  mounted() {
    this.emitter.on('eventViewModalClose', data => {
      this.eventViewVisible = data;
    });
  },
  methods: {
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
    /**
     *  UPLOAD POSTER IMAGEKK
     */
    uploadPosterImageKk(event) {
      const file = event.files[0];
      this.posterImageKk = file;
      imageResizeCompress
          .fromBlob(file, 90, 720, "auto", "jpeg")
          .then((res) => {
            imageResizeCompress.blobToURL(res).then((resp) => {
              this.poster.imageKk = resp;
            });
          });
    },
    /**
     *  UPLOAD POSTER IMAGERU
     */
    uploadPosterImageRu(event) {
      const file = event.files[0];
      this.posterImageRu = file;
      imageResizeCompress
          .fromBlob(file, 90, 720, "auto", "jpeg")
          .then((res) => {
            imageResizeCompress.blobToURL(res).then((resp) => {
              this.poster.imageRu = resp;
            });
          });
    },
    /**
     *  UPLOAD POSTER IMAGEEN
     */
    uploadPosterImageEn(event) {
      const file = event.files[0];
      this.posterImageEn = file;
      imageResizeCompress
          .fromBlob(file, 90, 720, "auto", "jpeg")
          .then((res) => {
            imageResizeCompress.blobToURL(res).then((resp) => {
              this.poster.imageEn = resp;
            });
          });
    },
    /**
     *  UPLOAD MAIN IMAGE
     */
    uploadMainImage(event) {
      const file = event.files[0];
      this.event.mainImageName = event.files[0].name;
      this.mainImageFile = event.files[0];
      try {
        this.convertBase64(file).then((r) => {
          this.event.mainImage = r;
        });
      } catch (err) {
        console.log(err);
      }
    },

    /**
     *  UPLOAD ADDITIONAL FILE
     */

    uploadFile(event) {
      const file = event.files[0];
      this.file = event.files[0];
      this.event.additionalFileName = event.files[0].name;
      /*try {
        this.convertBase64(file).then((r) => {
          this.event.additionalFile = r;
        });
      } catch (err) {
        console.log(err);
      }*/
    },

    /**
     *  DOUNLOAD FILE
     */
    downloadFile(event) {
      if (event.additional_file_path) {
        axios.post(smartEnuApi + `/downloadEventFile`, {additional_file_path: event.additional_file_path})
            .then(res => {
              this.download(res.data, event.additionalFileName);
            }).catch(error => {
          if (error.response.status === 401) {
            this.$store.dispatch("logLout");
          } else {
            this.$toast.add({
              severity: "error",
              summary: error,
              life: 3000,
            });
          }
        });
      } else {
        this.download(event.additionalFile, event.additionalFileName);
      }
    },

    download(file, filename) {
      let aLink = document.createElement("a");
      aLink.download = filename;
      aLink.href = file;
      aLink.click();
    },

    /**
     *  CONVERT IMAGE TO BASE64
     */
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
    /**
     *  GET ALL EVENTS
     */
    getAllEvents() {
      this.allNews = [];
      axios
          .get(smartEnuApi + "/allEvents")
          .then((response) => {
            this.allEvents = response.data;
            this.loading = false;
            this.allEvents.map(e => {
              e.imageUrl = smartEnuApi + fileRoute + e.main_image_path;
              if (e.poster) {
                e.poster.map(p => {
                  p.imageKkUrl = smartEnuApi + fileRoute + p.imageKk;
                  p.imageRuUrl = smartEnuApi + fileRoute + p.imageRu;
                  p.imageEnUrl = smartEnuApi + fileRoute + p.imageEn;
                });
              }
            });
          })
          .catch((error) => {
            if (error.response.status === 401) {
              this.$store.dispatch("logLout");
            } else {
              this.$toast.add({
                severity: "error",
                summary: this.$t("smartenu.loadAllEventsError") + ":\n" + error,
                life: 3000,
              });
            }
          });
    },

    /**
     * GET
     */
    getParticipantsCategories() {
      this.participantsCategories = [];
      axios
          .get(smartEnuApi + "/getParticipantsCategories", {
            headers: getHeader(),
          })
          .then((response) => {
            this.participantsCategories = response.data;
          })
          .catch((error) => {
            if (error.response.status == 401) {
              this.$store.dispatch("logLout");
            } else {
              this.$toast.add({
                severity: "error",
                summary: this.$t("smartenu.loadAllEventsError") + ":\n" + error,
                life: 3000,
              });
            }
          });
    },

    /**
     *  DELETE EVENT
     */
    deleteEvent(id) {
      axios
          .post(
              smartEnuApi + "/delEvent",
              {
                id: id,
              },
              {
                headers: getHeader(),
              }
          )
          .then((response) => {
            if (response.status === 200) {
              this.getAllEvents();
            }
          })
          .catch((error) => {
            if (error.response.status == 401) {
              this.$store.dispatch("logLout");
            } else {
              this.$toast.add({
                severity: "error",
                summary: this.$t("smartenu.delEventError") + ":\n" + error,
                life: 3000,
              });
            }
          });
      this.deleteVisible = false;
      this.event = {};
    },
    /**
     *  ADD EVENT
     */
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
      this.event.participantsCategory = main.concat(
          this.selectedFaculties !== null
              ? this.selectedFaculties.concat(
                  this.selectedDepartments !== null
                      ? this.selectedDepartments
                      : null
              )
              : null
      );
      if (this.isPoster) {
        this.validPosterImages();
        if (this.formValid.length > 0) {
          return;
        }
        const fd = new FormData();
        fd.append("link", this.poster.link ? this.poster.link : '')
        fd.append("imageKk", this.posterImageKk)
        fd.append("imageRu", this.posterImageRu)
        fd.append("imageEn", this.posterImageEn)
        fd.append("id", parseInt(this.poster.id))

        axios
            .post(smartEnuApi + "/addPoster", fd, {
              headers: getHeader(),
            })
            .then((res) => {
              this.event.posterId = res.data.id;
              this.event.isPoster = this.isPoster;
              this.insertEvent();
            });
      } else {
        this.insertEvent();
      }
    },
    async insertEvent() {
      await resizeImages(this.event.contentKz).then(res => {
        this.event.contentKz = res
      });
      await resizeImages(this.event.contentRu).then(res => {
        this.event.contentRu = res
      });
      await resizeImages(this.event.contentEn).then(res => {
        this.event.contentEn = res
      });

      this.event.additionalFile = null;
      this.event.mainImage = null;
      this.event.main_image_base_64 = null;
      const fd = new FormData();
      fd.append("event", JSON.stringify(this.event))
      fd.append("additionalFile", this.file ? this.file : null);
      fd.append("mainImageFile", this.mainImageFile ? this.mainImageFile : null);

      axios
          .post(smartEnuApi + "/addEvent", fd, {
            headers: getHeader(),
          })
          .then((response) => {
            if (response.data !== null) {
              this.$toast.add({
                severity: "success",
                summary: this.$t("smartenu.saveSuccess"),
                life: 3000,
              });
              this.getAllEvents();
              this.editVisible = false;
              this.event = {};
            }
          })
          .catch((error) => {
            this.$toast.add({
              severity: "error",
              summary: this.$t("smartenu.saveEventError") + ":\n" + error,
              life: 3000,
            });
          });
    },

    /**
     *  CREATE EVENT
     */
    createEvent() {
      this.event = {};
      this.editVisible = true;
      this.submitted = false;
      this.event.id = null;
      this.event.eventDate = new Date();
      this.getMainCategories();
      this.getMasterCourses();
      this.getBachelorCourses();
      this.getFaculties();
      this.selectedFaculties = null;
      this.selectedMainCategories = null;
      this.selectedMasterCourses = null;
      this.selectedBachelorCourses = null;
      this.selectedDepartments = null;
    },

    /**
     *  NEWS PRE DELETE
     */
    delEvent(id) {
      this.event = {};
      this.event = this.allEvents.find((x) => x.id === id);
      this.deleteVisible = true;
    },

    /**
     *  NEWS PRE EDITING
     */
    editEvent(event) {
      console.log(event)
      this.event = event;
      this.editVisible = true;
      this.submitted = false;
      this.isPoster = event.isPoster;
      this.poster.id = event.posterId;
      this.poster.link = event.poster.link;
      this.poster.imageKk = event.poster.imageKk;
      this.poster.imageRu = event.poster.imageRu;
      this.poster.imageEn = event.poster.imageEn;
      this.getMainCategories();
      this.getMasterCourses();
      this.getBachelorCourses();
      this.getFaculties();
      this.selectedMainCategories = event.participantsCategory.filter(
          (category) => category.parentId === null
      );
      this.selectedMasterCourses = event.participantsCategory.filter(
          (category) => category.parentId === 3
      );
      this.selectedBachelorCourses = event.participantsCategory.filter(
          (category) => category.parentId === 4
      );
      this.selectedFaculties = event.participantsCategory.filter(
          (category) => category.parentId === 6
      );
      this.selectedDepartments = [];
      for (let i = 0; i < this.selectedFaculties.length; i++) {
        let array = this.participantsCategories.filter(
            (category) => category.parentId === this.selectedFaculties[i].id
        );
        this.selectedDepartments = this.selectedDepartments.concat(array);
      }
    },

    /**
     * HIDE ADD EDIT DIALOG
     */
    hideDialog() {
      this.event = {};
      this.editVisible = false;
      this.submitted = false;
    },

    /**
     * VIEW NEWS DIALOG VISIBILITY
     */
    eventView() {
      this.eventViewVisible = true;
    },

    /**
     * PUBLSIH NEWS ACTION
     */
    publishEvent() {
      axios
          .post(
              smartEnuApi + "/publishEvent",
              {
                id: this.selectedEvent.id,
                userId: this.selectedEvent.history.userId,
              },
              {
                headers: getHeader(),
              }
          )
          .then((response) => {
            if (response.data !== null) {
              this.$toast.add({
                severity: "success",
                summary: this.$t("smartenu.saveSuccess"),
                life: 3000,
              });
              this.getAllEvents();
            }
          })
          .catch((error) => {
            if (error.response.status == 401) {
              this.$store.dispatch("logLout");
            } else {
              this.$toast.add({
                severity: "error",
                summary: this.$t("smartenu.saveEventError") + ":\n" + error,
                life: 3000,
              });
            }
          });
    },
    deleteConfirm(event) {
      this.$confirm.require({
        message: this.$t('common.doYouWantDelete'),
        header: this.$t('common.delete'),
        icon: 'pi pi-info-circle',
        acceptClass: 'p-button-rounded p-button-success',
        rejectClass: 'p-button-rounded p-button-danger',
        accept: () => {
          this.deleteEvent(event.id);
        },
      });
    },
    getRoles() {
      this.userRoles = [];
      axios
          .get(smartEnuApi + "/getroles", {
            headers: getHeader(),
          })
          .then((response) => {
            this.userRoles = response.data;
            this.roles.isAdmin = this.findRole(this.userRoles, "news_administrator");
            this.roles.isPublisher = this.findRole(this.userRoles, "news_publisher");
            this.roles.isStudent = this.findRole(this.userRoles, "student");
            this.roles.isModer = this.findRole(this.userRoles, "news_moderator");
          })
          .catch((error) => {
            if (error.response.status == 401) {
              this.$store.dispatch("logLout");
            } else {
              this.$toast.add({
                severity: "error",
                summary: this.$t("smartenu.loadAllEventsError") + ":\n" + error,
                life: 3000,
              });
            }
          });
    },
    findRole(roles, code) {
      for (let i = 0; i < roles.length; i++) {
        if (roles[i].name === code) {
          return true;
        }
      }
      return false;
    },
    validateEvents() {
      this.formValid = [];
      if (!this.event.titleKz) {
        this.formValid["titleKz"] = true;
      } else {
        delete this.formValid["titleKz"];
      }
      if (!this.event.titleRu) {
        this.formValid["titleRu"] = true;
      } else {
        delete this.formValid["titleRu"];
      }
      if (!this.event.titleEn) {
        this.formValid["titleEn"] = true;
      } else {
        delete this.formValid["titleEn"];
      }
      if (!this.event.contentKz) {
        this.formValid["contentKz"] = true;
      } else {
        delete this.formValid["contentKz"];
      }
      if (!this.event.contentRu) {
        this.formValid["contentRu"] = true;
      } else {
        delete this.formValid["contentRu"];
      }
      if (!this.event.contentEn) {
        this.formValid["contentEn"] = true;
      } else {
        delete this.formValid["contentEn"];
      }
      if (this.event.isOnline == null) {
        this.formValid["isOnline"] = true;
      } else {
        delete this.formValid["isOnline"];
      }
      if (this.event.isOnline == true && !this.event.eventLink) {
        this.formValid["eventLink"] = true;
      } else {
        delete this.formValid["eventLink"];
      }
      if (this.event.isOnline == false && !this.event.eventLocation) {
        this.formValid["eventLocation"] = true;
      } else {
        delete this.formValid["eventLocation"];
      }
      if (!this.editVisible && !this.mainImageFile) {
        this.formValid.push(this.$t("smartenu.image1Invalid"));
      }
      if (!this.selectedMainCategories) {
        this.formValid["selectedMainCategories"] = true;
      } else {
        delete this.formValid["selectedMainCategories"];
      }
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
  },

  created() {
    this.getAllEvents();
    this.getParticipantsCategories();
    this.getRoles();
  },

  computed: {
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
    },
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
};
</script>

<style lang="scss" scoped>
::v-deep(.p-progressbar) {
  height: 0.5rem;
  background-color: #d8dadc;

  .p-progressbar-value {
    background-color: #607d8b;
  }
}

.p-datatable .p-column-filter {
  display: none;
}

.table-header {
  display: flex;
  justify-content: space-between;
}

::v-deep(.p-datatable.p-datatable-customers) {
  .p-datatable-header {
    padding: 1rem;
    text-align: left;
    font-size: 1.5rem;
  }

  .p-paginator {
    padding: 1rem;
  }

  .p-datatable-thead > tr > th {
    text-align: left;
  }

  .p-datatable-tbody > tr > td {
    cursor: auto;
  }

  .p-dropdown-label:not(.p-placeholder) {
    text-transform: uppercase;
  }
}

/* Responsive */
.p-datatable-customers .p-datatable-tbody > tr > td .p-column-title {
  display: none;
}

.customer-badge {
  border-radius: 2px;
  padding: 0.25em 0.5rem;
  text-transform: uppercase;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.3px;

  &.status-3 {
    background: #c8e6c9;
    color: #256029;
  }

  &.status-4 {
    background: #ffcdd2;
    color: #c63737;
  }

  &.status-negotiation {
    background: #feedaf;
    color: #8a5340;
  }

  &.status-1 {
    background: #b3e5fc;
    color: #23547b;
  }

  &.status-2 {
    background: #eccfff;
    color: #694382;
  }

  &.status-proposal {
    background: #ffd8b2;
    color: #805b36;
  }

  &.online {
    background: #c8e6c9;
    color: #256029;
  }

  &.offline {
    background: #ffcdd2;
    color: #c63737;
  }
}

.p-progressbar-value.ui-widget-header {
  background: #607d8b;
}

@media (max-width: 640px) {
  .p-progressbar {
    margin-top: 0.5rem;
  }
}

.product-image {
  width: 100px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
}

.orders-subtable {
  padding: 1rem;
}

.product-badge {
  border-radius: 2px;
  padding: 0.25em 0.5rem;
  text-transform: uppercase;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.3px;

  &.status-instock {
    background: #c8e6c9;
    color: #256029;
  }

  &.status-outofstock {
    background: #ffcdd2;
    color: #c63737;
  }

  &.status-lowstock {
    background: #feedaf;
    color: #8a5340;
  }
}

.order-badge {
  border-radius: 2px;
  padding: 0.25em 0.5rem;
  text-transform: uppercase;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.3px;

  &.order-delivered {
    background: #c8e6c9;
    color: #256029;
  }

  &.order-cancelled {
    background: #ffcdd2;
    color: #c63737;
  }

  &.order-pending {
    background: #feedaf;
    color: #8a5340;
  }

  &.order-returned {
    background: #eccfff;
    color: #694382;
  }
}

@media screen and (max-width: 960px) {
  ::v-deep(.p-datatable) {
    &.p-datatable-customers {
      .p-datatable-thead > tr > th,
      .p-datatable-tfoot > tr > td {
        display: none !important;
      }

      .p-datatable-tbody > tr {
        > td {
          text-align: left;
          display: block;
          border: 0 none !important;
          width: 100% !important;
          float: left;
          clear: left;
          border: 0 none;

          .p-column-title {
            padding: 0.4rem;
            min-width: 30%;
            display: inline-block;
            margin: -0.4rem 1rem -0.4rem -0.4rem;
            font-weight: bold;
          }

          .p-progressbar {
            margin-top: 0.5rem;
          }
        }
      }
    }
  }
}
</style>
