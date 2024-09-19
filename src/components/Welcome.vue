<template>
  <div class="col-12">
    <div class="card">
      <h4 class="m-0">{{ $t("common.welcome") }}, {{ loginedUser.fullName }} !</h4>
    </div>
    <div class="card card_bottom">
      <TabView ref="templateView" v-model:activeIndex="active">
        <TabPanel v-bind:header="$t('smartenu.newsTitle')">
          <div v-if="allNews.length === 0">
            {{ $t("smartenu.newsNotFound") }}
          </div>
          <div v-if="loading" class="skeletons">
            <div class="skeleton" :key="s" v-for="s of skeletons">
              <Skeleton class="skeleton_img"></Skeleton>
              <div style="flex: 1; margin-left: 10px">
                <Skeleton class="first_skeleton"></Skeleton>
                <Skeleton class="second_skeleton"></Skeleton>
              </div>
            </div>
          </div>
          <DataView :lazy="true" :value="allNews" :layout="layout" :paginator="true" :rows="10"
                    @page="onPage($event)" :totalRecords="total" :pageLinkSize="mobile? 3:5">
            <template #empty>{{
                this.$t("smartenu.newsNotFound")
              }}
            </template>
            <template #list="slotProps">
              <template v-for="(item, index) in slotProps?.items" :key="index">
                <div class="post" v-on:click="newsView(item)">
                  <div class="img">
                    <img v-if="item?.imageUrl != null && item?.imageUrl !=''"
                         :src="item?.imageUrl"/>
                  </div>
                  <div class="text">
                    <strong>
                      {{
                        $i18n.locale === "kz"
                            ? item?.titleKz
                            : $i18n.locale === "ru"
                                ? item?.titleRu
                                : item?.titleEn
                      }}
                    </strong>
                    <div class="date">{{ formatDateMoment(item?.publish_date) }}</div>
                    <div class="mt-2">
                      <Tag severity="info" class="mt-2" :value="item?.site_url"></Tag>
                    </div>
                  </div>
                </div>
              </template>
            </template>
          </DataView>
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
              {{ formatDateMoment(slotProps.data.eventDate) }}
          </span>
              </template>
            </Column>
            <Column :field="$i18n.locale === 'kz' ? `titleKz` : $i18n.locale === 'ru' ? `titleRu` : `titleEn`"
                    v-bind:header="$t('common.nameIn')">
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
    <NewsView v-if="newsViewVisible" :is-visible="newsViewVisible" :selected-news="selectedNews"/>
    <EventsView v-if="eventViewVisible" :is-visible="eventViewVisible" :selectedEvent="selectedEvent"/>
  </div>
</template>

<script>
import {mapState} from "vuex";
import {getHeader, smartEnuApi} from "@/config/config";
import moment from "moment";
import NewsView from "./news/NewsView.vue";
import {fileRoute} from "../config/config";
import EventsView from "./events/EventsView";
import {NewsService} from "@/service/news.service";
import {EventsService} from "@/service/event.service";

export default {
  name: "Welcome",
  components: {EventsView, NewsView},
  data() {
    return {
      total: 0,
      layout: 'list',
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
      notifications: [],
      newsService: new NewsService(),
      eventService: new EventsService(),
      mobile: false,
    };
  },

  methods: {
    getAllNews() {
      this.loading = true
      this.lazyParams.countMode = null;
      this.newsService.getWelcomeNews(this.lazyParams).then((response) => {
        this.allNews = response.data.news;
        this.allNews.map(e => {
          let fileUrl = e.main_image_file ? e.main_image_file.filepath : e.image1
          e.imageUrl = smartEnuApi + fileRoute + fileUrl
          e.site_url = `${e.enu_slug.slug ? e.enu_slug.slug + "." : ""}enu.kz`
        });
        this.total = response.data.total;
        this.loading = false;
      })
          .catch((error) => {
            console.log(error, 'test')
            this.$toast.add({
              severity: "error",
              summary: this.$t("smartenu.loadAllNewsError") + ":\n" + error,
              life: 3000,
            });
            this.loading = false;
          });
    },
    getAllEvents() {
      this.allEvents = [];
      this.eventService.getPublishEvents().then((response) => {
        this.allEvents = response.data;
        this.allEvents.map(e => {
          let fileUrl = e.main_image_file ? e.main_image_file.filepath : e.image1
          e.imageUrl = smartEnuApi + fileRoute + fileUrl
        });
        this.loading = false;
      })
          .catch((error) => {
            this.$toast.add({
              severity: "error",
              summary: this.$t("smartenu.loadAllEventsError") + ":\n" + error,
              life: 3000,
            });
            this.loading = false;
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
    onPage(event) {
      this.lazyParams = event
      this.getAllNews();
    },
  getFullname(user) {
                let fullname = user.thirdName + ' ' + user.firstName;

                if (user.lastName && user.lastName.length > 0) {
                    fullname += ' ' + user.lastName;
                }

                return fullname
            }},
  created() {
    this.getAllNews();
    this.getAllEvents();
  },
  mounted() {
    this.mobile = window.innerWidth <= 640;
    this.emitter.on('newsViewModalClose', data => {
      this.newsViewVisible = data;
    });
    this.emitter.on('eventViewModalClose', data => {
      this.eventViewVisible = data;
    });
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
  width: 100%;
  border-radius: 5px;
  padding: 10px;
  //box-shadow: 0 2px 1px -1px rgb(0 0 0 / 20%), 0 1px 1px 0 rgb(0 0 0 / 14%), 0 1px 3px 0 rgb(0 0 0 / 12%);

  .text {
    padding: 0 0 0 10px;
    display: flex;
    flex-direction: column;

    .date {
      color: #838080;
      margin-top: 10px;
    }
  }

  .img {
    width: 120px;
    height: 80px;

    img{
      width: 120px;
      height: 100%;
      border-radius: 5px;
      object-fit: cover;
      box-shadow: 0 3px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 10px 0 rgba(0, 0, 0, 0.19);
    }
  }
}

@media (max-width: 780px) {
  .skeletons, .post {
    width: 100%;
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
    .img {
      width: 100px;
      height: 70px;

      img {
        width: 100px;
      }
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

</style>
