<template>
    <div class="col-12">
        <TitleBlock :title="$t('smartenu.eventsTitle')"/>
        <!-- BEGINNING OF TABLE -->
      <ToolbarMenu :data="menu"/>
        <!-- BEGINNING OF TABLE -->
        <div class="card">
            <DataTable :value="allEvents" :paginator="true" class="p-datatable-customers" :rows="10" dataKey="id"
                       selectionMode="single" :rowHover="true" v-model:selection="selectedEvent" :filters="filters"
                       :loading="loading" responsive-layout="scroll">
                <template #header>
                    <div class="table-header flex justify-content-end align-items-center">
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
                <Column headerStyle="width:120px">
                    <template #body="{ data }">
                        <ActionButton :show-label="true" :items="actions" @toggle="toggle(data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <EventsView v-if="eventViewVisible" :is-visible="eventViewVisible" :selected-event="selectedEvent"/>
        <AddEditEvent v-if="editVisible" :is-visible="editVisible" :selectedEvent="event" :partCats="participantsCategories"/>
    </div>
</template>

<script>
import {smartEnuApi} from "@/config/config";
import {FilterMatchMode} from "primevue/api";
import {fileRoute, findRole} from "../../config/config";
import EventsView from "./EventsView";
import {EventsService} from "../../service/event.service";
import {PosterService} from "../../service/poster.service";
import AddEditEvent from "./AddEditEvent";
import TitleBlock from "@/components/TitleBlock.vue";
import ToolbarMenu from "@/components/ToolbarMenu.vue";
import ActionButton from "@/components/ActionButton.vue";

export default {
    name: "Events",
    components: {ActionButton, ToolbarMenu, TitleBlock, AddEditEvent, EventsView},
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
            selectedEvent: false,
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
                isEnuWebAdmin: false,
                isEnuWebFacAdmin: false,
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
            additionalFile: null,
            eventService: new EventsService(),
            posterService: new PosterService(),
            loggedUser: JSON.parse(window.localStorage.getItem('loginedUser')),
            actionsNode: null
        };
    },
    mounted() {
        this.emitter.on('eventViewModalClose', data => {
            this.eventViewVisible = data;
        });
        this.emitter.on('addEditEventDialogHide', data => {
            if (data)
                this.hideDialog();
        });
        this.emitter.on('eventCreated', data => {
            if (data)
                this.eventSaved();
        });
    },
    methods: {
        findRole: findRole,
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
            this.eventService.getEvents().then((response) => {
                this.allEvents = response.data;
                this.loading = false;
                this.allEvents.map(e => {
                    e.imageUrl = smartEnuApi + fileRoute + e.main_image_path;
                    e.imageBool = e.main_image_path;
                    if (e.poster) {
                        e.poster.imageKkUrl = smartEnuApi + fileRoute + e.poster.imageKk;
                        e.poster.imageRuUrl = smartEnuApi + fileRoute + e.poster.imageRu;
                        e.poster.imageEnUrl = smartEnuApi + fileRoute + e.poster.imageEn;
                    }
                });
            }).catch((error) => {
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
            this.eventService.getParticipantsCategories().then((response) => {
                this.participantsCategories = response.data;
            }).catch((error) => {
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
            this.eventService.deleteEvent(id).then((response) => {
                if (response.status === 200) {
                    this.getAllEvents();
                }
            }).catch((error) => {
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
        eventSaved() {
            this.$toast.add({
                severity: "success",
                summary: this.$t("smartenu.saveSuccess"),
                life: 3000,
            });

            this.getAllEvents();
            this.editVisible = false;
            this.event = {};
        },

        /**
         *  CREATE EVENT
         */
        createEvent() {
            this.event = {}
            this.editVisible = true
            this.submitted = false;
            this.event.id = null
            this.event.eventDate = new Date()
            this.getMainCategories();
            this.getMasterCourses();
            this.getBachelorCourses();
            this.getFaculties();
            this.selectedFaculties = null;
            this.selectedMainCategories = null;
            this.selectedMasterCourses = null;
            this.selectedBachelorCourses = null;
            this.selectedDepartments = null;
            this.editVisible = true;
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
          console.log(this.editVisible)
            this.event = event;
            this.editVisible = true;
            this.submitted = false;
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
        eventView(data) {
            this.selectedEvent = data;
            this.eventViewVisible = true;
        },

        /**
         * PUBLSIH NEWS ACTION
         */
        publishEvent() {
            this.eventService.publishEvent(this.selectedEvent.id, this.selectedEvent.history.userId).then((response) => {
                if (response.data !== null) {
                    this.$toast.add({
                        severity: "success",
                        summary: this.$t("smartenu.saveSuccess"),
                        life: 3000,
                    });
                    this.selectedEvent = null;
                    this.getAllEvents();
                }
            }).catch((error) => {
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
            this.roles.isAdmin = this.findRole(null, "news_administrator");
            this.roles.isPublisher = this.findRole(null, "news_publisher");
            this.roles.isStudent = this.findRole(null, "student");
            this.roles.isModer = this.findRole(null, "news_moderator");
            this.roles.isEnuWebAdmin = this.findRole(null, "enu_web_admin");
            this.roles.isEnuWebFacAdmin = this.findRole(null, "enu_web_fac_admin");
        },
        isCreator(row) {
            return row.history.userId === this.loggedUser.userID;
        },
        toggle(node) {
          this.actionsNode = node
        },
    },

    created() {
        this.getAllEvents();
        this.getParticipantsCategories();
        this.getRoles();
    },

    computed: {
      menu () {
        return [
          {
            label: this.$t('common.add'),
            icon: "pi pi-plus",
            visible: this.isAdmin || this.isModer || this.isEnuWebAdmin || this.isEnuWebFacAdmin,
            command: () => {this.createEvent()},
          },
          {
            label: this.$t('common.publish'),
            icon: "pi pi-check",
            visible: this.isCreated && (this.isAdmin || this.isPublisher || this.isEnuWebAdmin || this.isEnuWebFacAdmin),
            command: () => {this.publishEvent()},
          }
        ]
      },
      actions () {
        return [
          {
            label: this.$t('common.show'),
            icon: "pi pi-eye",
            command: () => {this.eventView(this.actionsNode)},
          },
          {
            label: this.$t('common.edit'),
            icon: "pi pi-pencil",
            visible: this.actionsNode?.history.status.id ===this.statuses.created || this.userHasAdmin || this.isEnuWebAdmin || this.isEnuWebFacAdmin,
            command: () => {this.editEvent(this.actionsNode)},
          },
          {
            label: this.$t('common.delete'),
            icon: "pi pi-trash",
            visible: this.actionsNode?.history.status.id ===this.statuses.created || this.isAdmin|| this.isEnuWebAdmin || this.isEnuWebFacAdmin,
            command: () => {this.deleteConfirm(this.actionsNode)},
          },

        ]
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
                this.selectedEvent && this.selectedEvent.history.status.id === this.statuses.created
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
        isEnuWebAdmin: function() {
            return this.roles.isEnuWebAdmin
        },
        isEnuWebFacAdmin: function() {
            return this.roles.isEnuWebFacAdmin
        },
        userHasAdmin: function () {
            return this.roles.isAdmin || this.roles.isModer;
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
  flex-order-: space-between;
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

.p-progressbar-value.ui-widget-header {
  background: #607d8b;
}
</style>
