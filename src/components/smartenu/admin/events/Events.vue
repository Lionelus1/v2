<template>
  <div class="card">
    <!-- BEGINNING OF TABLE -->
    <Toolbar class="p-mb-4">
      <template #left>
        <Button
          v-if="isAdmin || isModer"
          :label="$t('common.add')"
          icon="pi pi-plus"
          class="p-button-success p-mr-2"
          v-on:click="createEvent"
        />
        <Button
          :label="$t('common.publish')"
          v-if="isCreated && (isAdmin || isPublisher)"
          icon="pi pi-check"
          class="p-button-help p-mr-2"
          v-on:click="publishEvent"
        />
        <Button
          :label="$t('common.show')"
          v-if="selectedEvent"
          icon="pi pi-eye"
          class="p-button-secondary p-mr-2"
          v-on:click="eventView"
        />
      </template>
    </Toolbar>

    <!-- BEGINNING OF TABLE -->

    <DataTable
      :value="allEvents"
      :paginator="true"
      class="p-datatable-customers"
      :rows="10"
      dataKey="id"
      :rowHover="true"
      v-model:selection="selectedEvent"
      :filters="filters"
      :loading="loading"
    >
      <template #header>
        <div class="table-header">
          {{ $t("smartenu.eventsTitle") }}
          <span class="p-input-icon-left">
            <i class="pi pi-search" />
            <InputText
              v-model="filters['global'].value"
              v-bind:placeholder="$t('hdfs.search')"
            />
          </span>
        </div>
      </template>
      <template #empty>
        {{ $t("smartenu.eventsNotFound") }}
      </template>
      <template #loading>
        {{ $t("smartenu.loadingEvents") }}
      </template>
      <Column selectionMode="single" headerStyle="width: 3em"></Column>
      <Column
        :field="
          $i18n.locale === 'kz'
            ? `titleKz`
            : $i18n.locale === 'ru'
            ? `titleRu`
            : `titleEn`
        "
        v-bind:header="$t('common.nameIn')"
        :sortable="true"
      >
        <template #body="slotProps">
          <span>
            {{
              $i18n.locale === "kz"
                ? slotProps.data.titleKz
                : $i18n.locale === "ru"
                ? slotProps.data.titleRu
                : slotProps.data.titleEn
            }}
          </span>
        </template>
      </Column>
      <Column
        :field="
          $i18n.locale === 'kz'
            ? `history.status.nameKz`
            : $i18n.locale === 'ru'
            ? `history.status.nameRu`
            : `history.status.nameEn`
        "
        v-bind:header="$t('common.status')"
        :sortable="true"
      >
        <template #body="slotProps">
          <span
            :class="'customer-badge status-' + slotProps.data.history.status.id"
          >
            {{
              $i18n.locale === "kz"
                ? slotProps.data.history.status.nameKz
                : $i18n.locale === "ru"
                ? slotProps.data.history.status.nameRu
                : slotProps.data.history.status.nameEn
            }}
          </span>
        </template>
      </Column>
      <Column
        field="createdBy"
        v-bind:header="$t('common.createdBy')"
        :sortable="true"
      >
        <template #body="slotProps">
          <span>
            {{ slotProps.data.createdBy.name }}
          </span>
        </template>
      </Column>
      <Column>
        <template #body="slotProps">
          <Button
            icon="pi pi-pencil"
            class="p-button-rounded p-button-success p-mr-2"
            @click="editEvent(slotProps.data.id)"
            v-if="
              slotProps.data.history.status.id === statuses.created ||
              isAdmin ||
              isModer
            "
          />
          <Button
            icon="pi pi-trash"
            class="p-button-rounded p-button-warning"
            v-if="
              slotProps.data.history.status.id === statuses.created || isAdmin
            "
            @click="delEvent(slotProps.data.id)"
          />
        </template>
      </Column>
    </DataTable>

    <!--    BEGINNING OF ADD/EDIT DIALOG-->

    <Dialog
      v-model:visible="editVisible"
      :closable="false"
      :style="{ width: '1000px' }"
      :header="$t('smartenu.createOrEditEvents')"
      :modal="true"
      class="p-fluid"
    >
      <div class="card">
        <Message v-for="msg of formValid" severity="error" :key="msg">{{
          msg
        }}</Message>
        <TabView>
          <TabPanel header="Қазақша">
            <div class="p-field p-mt-3">
              <label for="kz-title">{{ $t("common.nameInQazaq") }}</label>
              <InputText
                id="kz-title"
                v-model="event.titleKz"
                rows="3"
                :class="{ 'p-invalid': formValid.titleKz && submitted }"
              />
              <small v-show="formValid.titleKz && submitted" class="p-error">{{
                $t("smartenu.titleKzInvalid")
              }}</small>
            </div>
            <div class="p-field">
              <label for="kz-content">{{ $t("common.contentInQazaq") }}</label>
              <Editor
                id="kz-content"
                v-model="event.contentKz"
                editorStyle="height: 320px"
              />
              <small
                v-show="formValid.contentKz && submitted"
                class="p-error"
                >{{ $t("smartenu.contentKzInvalid") }}</small
              >
            </div>
          </TabPanel>
          <TabPanel header="Русский">
            <div class="p-field p-mt-3" style="margin-bottom: 1.5rem">
              <label for="ru-title">{{ $t("common.nameInRussian") }}</label>
              <InputText
                id="ru-title"
                v-model="event.titleRu"
                rows="3"
                :class="{ 'p-invalid': formValid.titleRu && submitted }"
              />
              <small v-show="formValid.titleRu && submitted" class="p-error">{{
                $t("smartenu.titleRuInvalid")
              }}</small>
            </div>
            <div class="p-field">
              <label for="ru-content">{{
                $t("common.contentInRussian")
              }}</label>
              <Editor
                id="ru-content"
                v-model="event.contentRu"
                editorStyle="height: 320px"
              />
              <small
                v-show="formValid.contentRu && submitted"
                class="p-error"
                >{{ $t("smartenu.contentRuInvalid") }}</small
              >
            </div>
          </TabPanel>
          <TabPanel header="English">
            <div class="p-field p-mt-3" style="margin-bottom: 1.5rem">
              <label for="en-title">{{ $t("common.nameInEnglish") }}</label>
              <InputText
                id="en-title"
                v-model="event.titleEn"
                rows="3"
                :class="{ 'p-invalid': formValid.titleEn && submitted }"
              />
              <small v-show="formValid.titleEn && submitted" class="p-error">{{
                $t("smartenu.titleEnInvalid")
              }}</small>
            </div>
            <div class="p-field">
              <label for="en-content">{{
                $t("common.contentInEnglish")
              }}</label>
              <Editor
                id="en-content"
                v-model="event.contentEn"
                editorStyle="height: 320px"
              />
              <small
                v-show="formValid.contentEn && submitted"
                class="p-error"
                >{{ $t("smartenu.contentEnInvalid") }}</small
              >
            </div>
          </TabPanel>
        </TabView>
        <div class="p-field">
          <label for="is-online">{{ $t("smartenu.eventFormat") }}</label>
          <Dropdown
            id="is-online"
            v-model="event.isOnline"
            :options="format"
            optionLabel="name"
            optionValue="value"
            :placeholder="$t('smartenu.eventFormat')"
            :class="{ 'p-invalid': formValid.isOnline && submitted }"
          />
          <small v-show="formValid.isOnline && submitted" class="p-error">{{
            $t("smartenu.isOnlineInvalid")
          }}</small>
        </div>
        <div
          class="p-field"
          style="margin-top: 1.5rem"
          v-if="event.isOnline == true"
        >
          <label for="event-link">{{ $t("smartenu.meetingLink") }}</label>
          <InputText
            id="event-link"
            v-model="event.eventLink"
            rows="3"
            :class="{ 'p-invalid': formValid.eventLink && submitted }"
          />
          <small v-show="formValid.eventLink && submitted" class="p-error">{{
            $t("smartenu.eventLinkInvalid")
          }}</small>
        </div>
        <div
          class="p-field"
          style="margin-top: 1.5rem"
          v-if="event.isOnline == false"
        >
          <label for="event-location">{{
            $t("smartenu.meetingLocation")
          }}</label>
          <InputText
            id="event-location"
            v-model="event.eventLocation"
            rows="3"
            :class="{ 'p-invalid': formValid.eventLocation && submitted }"
          />
          <small
            v-show="formValid.eventLocation && submitted"
            class="p-error"
            >{{ $t("smartenu.eventLocationInvalid") }}</small
          >
        </div>
        <div class="p-field">
          <label for="p-cat">{{ $t("smartenu.participantsCategory") }}</label>
          <MultiSelect
            v-model="selectedMainCategories"
            :options="participantsMainCategories"
            :optionLabel="
              $i18n.locale === 'kz'
                ? `nameKz`
                : $i18n.locale === 'ru'
                ? `nameRu`
                : `nameEn`
            "
            :placeholder="$t('smartenu.selectMainCategory')"
            :class="{
              'p-invalid': formValid.selectedMainCategories && submitted,
            }"
          />
          <small
            v-show="formValid.selectedMainCategories && submitted"
            class="p-error"
            >{{ $t("smartenu.selectedCatInvalid") }}</small
          >
        </div>
        <div class="p-field">
          <MultiSelect
            v-if="isBachelor"
            v-model="selectedBachelorCourses"
            :options="bachelorCourses"
            :optionLabel="
              $i18n.locale === 'kz'
                ? `nameKz`
                : $i18n.locale === 'ru'
                ? `nameRu`
                : `nameEn`
            "
            :placeholder="$t('smartenu.selectBachelor')"
          />
        </div>
        <div class="p-field">
          <MultiSelect
            v-if="isMaster"
            v-model="selectedMasterCourses"
            :options="masterCourses"
            :optionLabel="
              $i18n.locale === 'kz'
                ? `nameKz`
                : $i18n.locale === 'ru'
                ? `nameRu`
                : `nameEn`
            "
            :placeholder="$t('smartenu.selectMaster')"
          />
        </div>
        <div class="p-field">
          <MultiSelect
            v-if="isFaculty"
            v-model="selectedFaculties"
            :options="faculties"
            :optionLabel="
              $i18n.locale === 'kz'
                ? `nameKz`
                : $i18n.locale === 'ru'
                ? `nameRu`
                : `nameEn`
            "
            :placeholder="$t('smartenu.selectFaculty')"
          />
        </div>
        <div class="p-field">
          <MultiSelect
            v-if="isFacultySelected"
            v-model="selectedDepartments"
            :options="departments"
            :optionLabel="
              $i18n.locale === 'kz'
                ? `nameKz`
                : $i18n.locale === 'ru'
                ? `nameRu`
                : `nameEn`
            "
            :placeholder="$t('smartenu.selectDepartment')"
          />
        </div>
        <div class="p-field">
          <div>
            <label for="data-and-time">{{ $t("smartenu.dataAndTime") }}</label>
          </div>
          <DatePicker
            id="data-and-time"
            v-model="event.eventDate"
            mode="dateTime"
            is24hr
            class="p-invalid"
          />
        </div>
        <div class="p-field">
          <div class="p-grid">
            <div class="p-col-12 p-md-5">
              <FileUpload
                ref="form"
                mode="basic"
                :customUpload="true"
                @uploader="uploadMainImage($event)"
                :auto="true"
                v-bind:chooseLabel="$t('smartenu.chooseMainImage')"
              ></FileUpload>
            </div>
          </div>
          <div v-if="event.mainImage">
            <img :src="event.mainImage" style="width: 50%; height: 50%" />
          </div>
        </div>
        <div class="p-field">
          <div class="p-grid">
            <div class="p-col-12 p-md-3">
              <FileUpload
                ref="form"
                mode="basic"
                :customUpload="true"
                @uploader="uploadFile($event)"
                :auto="true"
                v-bind:chooseLabel="$t('smartenu.chooseAdditionalFile')"
              ></FileUpload>
            </div>
            <div class="p-col-12 p-md-5">
              <InlineMessage severity="info" show v-if="file">
                {{ $t("ncasigner.chosenFile", { fn: file ? file.name : "" }) }}
              </InlineMessage>
            </div>
          </div>
        </div>
        <div class="p-field-checkbox">
          <Checkbox
            id="isPoster"
            name="isPoster"
            v-model="isPoster"
            :binary="true"
          />
          <label for="isPoster">{{ $t("smartenu.addPoster") }}</label>
        </div>
        <div
          class="p-field p-mt-3"
          style="margin-bottom: 1.5rem"
          v-if="isPoster"
        >
          <label for="poster-link">{{ $t("smartenu.posterLink") }}</label>
          <InputText
            id="poster-link"
            v-model="poster.link"
            rows="3"
            :placeholder="$t('smartenu.posterLink')"
          />
          <div class="p-grid p-mt-3" v-if="isPoster">
            <div class="p-col">
              <FileUpload
                ref="form"
                mode="basic"
                :customUpload="true"
                @uploader="uploadPosterImageKk($event)"
                :auto="true"
                v-bind:chooseLabel="$t('smartenu.posterImageKk')"
              ></FileUpload>
              <div v-if="poster.imageKk" class="p-mt-3">
                <img :src="poster.imageKk" style="width: 50%; height: 50%" />
              </div>
            </div>
            <div class="p-col">
              <FileUpload
                ref="form"
                mode="basic"
                :customUpload="true"
                @uploader="uploadPosterImageRu($event)"
                :auto="true"
                v-bind:chooseLabel="$t('smartenu.posterImageRu')"
              ></FileUpload>
              <div v-if="poster.imageRu" class="p-mt-3">
                <img :src="poster.imageRu" style="width: 50%; height: 50%" />
              </div>
            </div>
            <div class="p-col">
              <FileUpload
                ref="form"
                mode="basic"
                :customUpload="true"
                @uploader="uploadPosterImageEn($event)"
                :auto="true"
                v-bind:chooseLabel="$t('smartenu.posterImageEn')"
              ></FileUpload>
              <div v-if="poster.imageEn" class="p-mt-3">
                <img :src="poster.imageEn" style="width: 50%; height: 50%" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <Button
          v-bind:label="$t('common.save')"
          icon="pi pi-check"
          class="p-button-rounded p-button-success p-mr-2"
          v-on:click="addEvent"
        />
        <Button
          v-bind:label="$t('common.cancel')"
          icon="pi pi-times"
          class="p-button-rounded p-button-danger"
          @click="hideDialog"
        />
      </template>
    </Dialog>

    <!--    BEGINNING OF DELETE DIALOG-->

    <Dialog
      v-model:visible="deleteVisible"
      :closable="false"
      :style="{ width: '450px' }"
      :modal="true"
    >
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle p-mr-3" style="font-size: 2rem" />
        <span v-if="event"
          >{{ $t("common.doYouWantDelete") }}
          <b>{{
            $i18n.locale === "kz"
              ? event.titleKz
              : $i18n.locale === "ru"
              ? event.titleRu
              : event.titleEn
          }}</b
          >?
        </span>
      </div>
      <template #footer>
        <Button
          :label="$t('common.yes')"
          icon="pi pi-check"
          class="p-button-rounded p-button-success p-mr-2"
          @click="deleteEvent(event.id)"
        />
        <Button
          :label="$t('common.no')"
          icon="pi pi-times"
          class="p-button-rounded p-button-danger"
          @click="deleteVisible = false"
        />
      </template>
    </Dialog>

    <!--    BEGINNING OF VIEW DIALOG-->

    <Dialog
      v-model:visible="eventViewVisible"
      :closable="false"
      :style="{ width: '1000px' }"
      :modal="true"
      class="p-fluid"
    >
      <Card style="box-shadow: none">
        <template #header>
          <div style="padding: 0 100px">
            <img
              :src="selectedEvent.mainImage"
              style="width: 100%; height: 100%"
            />
          </div>
        </template>
        <template #title>
          {{
            $i18n.locale === "kz"
              ? selectedEvent.titleKz
              : $i18n.locale === "ru"
              ? selectedEvent.titleRu
              : selectedEvent.titleEn
          }}
        </template>
        <template #subtitle>
          {{
            $t("smartenu.dataAndTime", {
              fn: new Date(selectedEvent.eventDate).toLocaleString(),
            })
          }}<br />
          {{
            $t("smartenu.eventFormatView", {
              fn: selectedEvent.isOnline
                ? $t("common.online")
                : $t("common.offline"),
            })
          }}<br />
          {{ $t("smartenu.meetingLinkView") }}
          <a
            v-if="selectedEvent.isOnline"
            :href="'//' + selectedEvent.eventLink"
            target="_blank"
          >
            {{ selectedEvent.eventLink }}
          </a>
          <br />
          <p v-if="!selectedEvent.isOnline">
            {{
              $t("smartenu.meetingLocationView", {
                fn: selectedEvent.eventLocation,
              })
            }}
          </p>
          {{
            $t("smartenu.participantsCategoryView", {
              fn: selectedEvent.participantsCategory
                .map((category) =>
                  $i18n.locale === "kz"
                    ? category.nameKz
                    : $i18n.locale === "ru"
                    ? category.nameRu
                    : category.nameEn
                )
                .toString()
                .replaceAll(",", ", "),
            })
          }}<br />
        </template>
        <template #content>
          <div
            v-html="
              $i18n.locale === 'kz'
                ? selectedEvent.contentKz
                : $i18n.locale === 'ru'
                ? selectedEvent.contentRu
                : selectedEvent.contentEn
            "
          ></div>
        </template>
        <template #footer>
          <Button
            v-if="selectedEvent.additionalFile"
            v-bind:label="$t('common.download')"
            icon="pi pi-download"
            class="p-button-link"
            @click="downloadFile(selectedEvent)"
          />
          <div>
            <Accordion v-if="selectedEvent.participants">
              <AccordionTab :header="$t('smartenu.eventParticipants')">
                <li
                  v-for="participant in selectedEvent.participants"
                  :key="participant.id"
                >
                  {{ participant.name + " " + participant.info }}
                </li>
              </AccordionTab>
            </Accordion>
          </div>
        </template>
      </Card>
      <template #footer>
        <Button
          v-bind:label="$t('common.close')"
          icon="pi pi-times"
          class="p-button-rounded p-button-danger"
          @click="eventViewVisible = false"
        />
      </template>
    </Dialog>
  </div>
</template>

<script>
import axios from "axios";
import { getHeader, header, smartEnuApi } from "@/config/config";
import { DatePicker } from "v-calendar";
import LoginedUserDetailsService from "@/service/LoginedUserDetailsService";
import { FilterMatchMode, FilterOperator } from "primevue/api";
import * as imageResizeCompress from "image-resize-compress"; // ES6

export default {
  name: "Events",
  components: {
    DatePicker,
  },
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
    };
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
      try {
        this.convertBase64(file).then((r) => {
          this.event.additionalFile = r;
        });
      } catch (err) {
        console.log(err);
      }
    },

    /**
     *  DOUNLOAD FILE
     */
    downloadFile(event) {
      let aLink = document.createElement("a");
      aLink.download = event.additionalFileName;
      aLink.href = event.additionalFile;
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
          console.log(this.allEvents);
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
        axios
          .post(smartEnuApi + "/addPoster", this.poster, {
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

    insertEvent() {
      axios
        .post(smartEnuApi + "/addEvent", this.event, {
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
    editEvent(id) {
      //TODO надо переделать
      this.event = {};
      this.editVisible = true;
      this.submitted = false;
      let event = this.allEvents.find((x) => x.id === id);
      console.log(event);
      this.event.id = event.id;
      this.event.titleKz = event.titleKz;
      this.event.titleRu = event.titleRu;
      this.event.titleEn = event.titleEn;
      this.event.mainImage = event.mainImage;
      this.event.additionalFile = event.additionalFile;
      this.event.isOnline = event.isOnline;
      this.event.contentKz = event.contentKz;
      this.event.contentRu = event.contentRu;
      this.event.contentEn = event.contentEn;
      this.event.eventLocation = event.eventLocation;
      this.event.eventLink = event.eventLink;
      this.event.eventDate = event.eventDate;
      this.event.history = event.history;
      this.event.createdBy = event.createdBy;
      this.event.mainImageName = event.mainImageName;
      this.event.additionalFileName = event.additionalFileName;
      this.isPoster = event.isPoster;
      this.poster.id = event.posterId;
      this.poster.link = event.poster.link;
      this.poster.imageKk = event.poster.posterKk;
      this.poster.imageRu = event.poster.posterRu;
      this.poster.imageEn = event.poster.posterEn;
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
          console.log(this.userRoles);
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
        console.log(roles[i]);
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
      if (!this.event.mainImage) {
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
