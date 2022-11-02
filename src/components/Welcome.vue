<template>
    <div class="p-col-12">
        <div class="card">
            <h4>{{ $t("common.welcome") }}, {{ loginedUser.fullName }} !</h4>
        </div>
        <div class="card card_bottom">
            <TabView ref="templateView" v-model:activeIndex="active">
                <TabPanel v-bind:header="$t('smartenu.newsTitle')">
                    <div v-if="loading" class="skeletons">
                        <div class="skeleton" :key="s" v-for="s of skeletons">
                            <Skeleton class="skeleton_img"></Skeleton>
                            <div style="flex: 1; margin-left: 10px">
                                <Skeleton class="first_skeleton"></Skeleton>
                                <Skeleton class="second_skeleton"></Skeleton>
                            </div>
                        </div>
                    </div>
                    <div v-else class="post" :key="p.id" v-for="p of allNews" v-on:click="newsView(p)">
                        <img class="round" v-if="p.image1 != null && p.image1 !=''"
                             :src="p.image1"/>
                        <div class="text">
                            <strong>
                                {{
                                $i18n.locale === "kz"
                                ? p.titleKz
                                : $i18n.locale === "ru"
                                ? p.titleRu
                                : p.titleEn
                                }}
                            </strong>
                            <div class="date">{{ formatDateMoment(p.history.modifyDate)}}</div>
                        </div>
                    </div>
                </TabPanel>
                <TabPanel v-bind:header="$t('smartenu.eventsTitle')">
                    <DataTable
                            :value="allEvents"
                            :paginator="true"
                            class="p-datatable-customers"
                            :rows="10"
                            dataKey="id"
                            :rowHover="true"
                            :loading="loading"
                    >
                        <template #empty>
                            {{ $t("smartenu.eventsNotFound") }}
                        </template>
                        <Column
                                field="createdBy"
                                v-bind:header="$t('common.date')"
                        >
                            <template #body="slotProps">
          <span>
              {{new Date(slotProps.data.eventDate).toLocaleDateString()}}
          </span>
                            </template>
                        </Column>
                        <Column
                                :field="
          $i18n.locale === 'kz'
            ? `titleKz`
            : $i18n.locale === 'ru'
            ? `titleRu`
            : `titleEn`
        "
                                v-bind:header="$t('common.nameIn')"
                        >
                            <template #body="slotProps">
                                <a href="javascript:void(0)" @click="eventView(slotProps.data)">
                                    {{
                                    $i18n.locale === "kz"
                                    ? slotProps.data.titleKz
                                    : $i18n.locale === "ru"
                                    ? slotProps.data.titleRu
                                    : slotProps.data.titleEn
                                    }}
                                </a>
                            </template>
                        </Column>

                    </DataTable>
                </TabPanel>
            </TabView>
        </div>
        <Dialog
                v-model:visible="newsViewVisible"
                :style="{ width: '1000px' }"
                :modal="true"
                class="p-fluid"
                :closable="false"
        >
            <Card style="box-shadow: none">
                <template #header>
                    <div class="dialog_img">
                        <img :src="selectedNews.image1" style="width: 100%; height: 100%"/>
                    </div>
                </template>
                <template #title>
                    <div class="card_title">
                        {{
                        $i18n.locale === "kz"
                        ? selectedNews.titleKz
                        : $i18n.locale === "ru"
                        ? selectedNews.titleRu
                        : selectedNews.titleEn
                        }}
                    </div>
                </template>
                <template #subtitle>
                    {{ new Date(selectedNews.history.modifyDate).toLocaleString() }}
                </template>
                <template #content>
                    <div
                            v-html="
              $i18n.locale === 'kz'
                ? selectedNews.contentKz
                : $i18n.locale === 'ru'
                ? selectedNews.contentRu
                : selectedNews.contentEn
            "
                    ></div>
                </template>
                <template #footer>
                    <div style="padding: 0 100px">
                        <img :src="selectedNews.image2" v-if="selectedNews.image2" style="width: 100%; height: 100%"/>
                    </div>
                </template>
            </Card>
            <template #footer>
                <Button
                        v-bind:label="$t('common.close')"
                        icon="pi pi-times"
                        class="p-button p-component p-button-primary"
                        @click="newsViewVisible = false"
                />
            </template>
        </Dialog>
        <Dialog
                v-model:visible="eventViewVisible"
                :closable="false"
                :style="{ width: '1000px' }"
                :modal="true"
                class="p-fluid"
        >
            <Card style="box-shadow: none">
                <template #header>
                    <div class="dialog_img">
                        <img
                                :src="selectedEvent.main_image_base_64 ? selectedEvent.main_image_base_64 : selectedEvent.mainImage"
                                style="width: 100%; height: 100%"
                        />
                    </div>
                </template>
                <template #title>
                    <div class="card_title">
                        {{
                        $i18n.locale === "kz"
                        ? selectedEvent.titleKz
                        : $i18n.locale === "ru"
                        ? selectedEvent.titleRu
                        : selectedEvent.titleEn
                        }}
                    </div>
                </template>
                <template #subtitle>
                    {{
                    $t("smartenu.dataAndTime", {
                    fn: new Date(selectedEvent.eventDate).toLocaleString(),
                    })
                    }}<br/>
                    {{
                    $t("smartenu.eventFormatView", {
                    fn: selectedEvent.isOnline
                    ? $t("common.online")
                    : $t("common.offline"),
                    })
                    }}<br/>
                    {{ $t("smartenu.meetingLinkView") }}
                    <a
                            v-if="selectedEvent.isOnline"
                            :href="'//' + selectedEvent.eventLink"
                            target="_blank"
                    >
                        {{ selectedEvent.eventLink }}
                    </a>
                    <br/>
                    <p v-if="!selectedEvent.isOnline">
                        {{
                        $t("smartenu.meetingLocationView", {
                        fn: selectedEvent.eventLocation,
                        })
                        }}
                    </p>
                    <!--{{
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
                    }}--><br/>
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
                            v-if="selectedEvent.additionalFile || selectedEvent.additional_file_path"
                            v-bind:label="$t('common.download')"
                            icon="pi pi-download"
                            class="p-button-success p-mb-2"
                            @click="downloadFile(selectedEvent)"
                    />
                    <div>
                        <Accordion v-if="selectedEvent.participants && selectedEvent.participants.length > 0">
                            <AccordionTab :header="$t('smartenu.eventParticipants')">
                                <li
                                        v-for="participant in selectedEvent.participants"
                                        :key="participant.id"
                                >
                                    {{ participant.user.fullName }}
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
    import {mapState} from "vuex";
    import axios from "axios";
    import {getHeader, header, smartEnuApi} from "@/config/config";
    import moment from "moment";

    export default {
        name: "Welcome",
        data() {
            return {
                selectedNews: {},
                selectedEvent: {},
                newsViewVisible: false,
                eventViewVisible: false,
                skeletons: new Array(6),
                loading: false,
                lazyParams: {
                    page: 0,
                    rows: 10,
                    searchText: null,
                    sortField: "",
                    sortOrder: 0
                },
                allNews: [],
                allEvents: [],
            };
        },
        methods: {
            getAllNews() {
                this.loading = true
                this.lazyParams.countMode = null;
                axios
                    .post(smartEnuApi + "/allNews", this.lazyParams, {
                        headers: getHeader(),
                    })
                    .then((response) => {
                        this.allNews = response.data.news;
                        this.newsCount = response.data.total;
                        this.loading = false;
                    })
                    .catch((error) => {
                        if (error.response.status === 401) {
                            this.$store.dispatch("logLout");
                        } else {
                            this.$toast.add({
                                severity: "error",
                                summary: this.$t("smartenu.loadAllNewsError") + ":\n" + error,
                                life: 3000,
                            });
                        }
                    });
            },
            getAllEvents() {
                this.allEvents = [];
                axios
                    .get(smartEnuApi + "/allEvents")
                    .then((response) => {
                        this.allEvents = response.data;
                        //console.log("ddd", this.allEvents)
                        this.loading = false;
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
            formatDateMoment(date) {
                return moment(new Date(date)).utc().format("DD.MM.YYYY HH:mm")
            },
            newsView(item) {
                this.selectedNews = item;
                this.newsViewVisible = true;
            },
            eventView(item) {
                this.selectedEvent = item;
                this.eventViewVisible = true;
            },
        },
        created() {
            this.getAllNews();
            this.getAllEvents();
        },
        computed: {
            ...mapState(["loginedUser"]),
        },
    }
</script>

<style lang="scss" scoped>
    .skeletons {
        width: 80%;

        .skeleton {
            display: flex;
            margin: 15px 0;
            padding: 10px;

            .skeleton_img {
                width: 9rem !important;
                height: 6rem !important;
                border-radius: 5px !important;
            }

            .first_skeleton {
                width: 90% !important;
                height: 2rem !important;
                margin-bottom: 20px !important;
            }

            .second_skeleton {
                width: 25% !important;
            }

        }
    }

    .post {
        cursor: pointer;
        display: flex;
        margin: 15px 0;
        width: 80%;
        border-radius: 5px;
        //box-shadow: 1px 1px 3px 0;
        padding: 10px;
        box-shadow: 0 2px 1px -1px rgb(0 0 0 / 20%), 0 1px 1px 0 rgb(0 0 0 / 14%), 0 1px 3px 0 rgb(0 0 0 / 12%);

        .text {
            position: relative;
            margin-left: 10px;

            .date {
                position: absolute;
                bottom: 0;
                color: #838080;
            }
        }

        img {
            width: 120px;
            border-radius: 5px;
        }
    }

    .dialog_img {
        padding: 0 100px;
    }

    @media (max-width: 780px) {
        .skeletons, .post {
            width: 100%;
        }
        .dialog_img {
            padding: 0;
        }
    }

    @media (max-width: 550px) {
        .skeletons, .post {
            width: 100%;
        }
        .skeletons {
            .skeleton {
                .skeleton_img {
                    width: 7rem !important;
                    height: 5rem !important;
                }

                .first_skeleton {
                    width: 100% !important;
                }

                .second_skeleton {
                    width: 40% !important;
                }
            }
        }
        .post {
            img {
                width: 7rem;
                height: 5rem;
            }

            .text {
                strong {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            }
        }
        .card_bottom {
            padding: 0;
        }
        .card_title {
            font-size: 16px;
        }
    }

    @media (max-width: 400px) {

    }
</style>
