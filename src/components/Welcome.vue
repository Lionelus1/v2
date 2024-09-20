<template>
  <div class="col-12">
    <div class="card">
      <h4 class="m-0">{{ $t("common.welcome") }}, {{ loginedUser.fullName }} !</h4>
    </div>
    <div class="card card_bottom">
      <TabView ref="templateView" v-model:activeIndex="active">
        <TabPanel v-bind:header="$t('smartenu.newsTitle')">
          <div class="calendar_buttons flex justify-content-end mb-2">
      <span class="p-buttonset mb-2">
    <Button class="p-button-outlined calendar_btn_left" :class="{'active': isGrid}" icon="pi pi-th-large" @click="getAllNews(true)"/>
    <Button class="p-button-outlined calendar_btn_right" :class="{'active': !isGrid}" icon="pi pi-list" @click="getAllNews(false)"/>
      </span>
          </div>
          <ProgressBar v-if="loading" mode="indeterminate" style="height: 6px"></ProgressBar>
          <template v-if="isGrid">
            <div class="news_cards grid">
              <div
                  v-for="(i, index) in allNews"
                  :key="index"
                  class="news_card_border"
                  :class="getBlockClass(index)"
                  @click="newsView(i)">
                <div class="news_card cursor-pointer">
                <div class="img">
                  <img class="w-full" height="220" v-if="i?.imageUrl != null && i?.imageUrl !==''" :src="i?.imageUrl" alt="">
                  <div class="news_content">
                    <div class="news_tag">{{i?.site_url}}</div>
                    <div class="date my-2">{{ formatDateMoment(i?.publish_date) }}</div>
                    <strong class="news_title" :title="
                    $i18n.locale === 'kz'
                ? i?.titleKz
                : $i18n.locale === 'ru'
                ? i?.titleRu
                : i?.titleEn
                ">
                      {{
                        $i18n.locale === "kz"
                            ? i?.titleKz
                            : $i18n.locale === "ru"
                                ? i?.titleRu
                                : i?.titleEn
                      }}
                    </strong>
                  </div>
                </div>
              </div>
              </div>
            </div>
            <Paginator @page="onPageGrid($event)" :rows="7" :totalRecords="total" :pageLinkSize="mobile? 3:5"></Paginator>
          </template>
          <div v-if="allNews.length === 0">
            {{ $t("smartenu.newsNotFound") }}
          </div>
          <template v-if="!isGrid">
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
          </template>
        </TabPanel>
        <TabPanel v-bind:header="$t('smartenu.eventsTitle')">
          <div class="calendar_buttons flex justify-content-end mb-2">
      <span class="p-buttonset">
    <Button class="p-button-outlined calendar_btn_left" :class="{'active': !isCalendar}" icon="pi pi-list" @click="isCalendarBool(false)"/>
    <Button class="p-button-outlined calendar_btn_right" :class="{'active': isCalendar}" icon="pi pi-calendar" @click="isCalendarBool(true)"/>
      </span>
          </div>
          <template v-if="isCalendar">
            <div v-show="isCalendar" id="full_calendar"></div>
            <div class="flex justify-content-center" v-if="loadingEvents">
              <ProgressSpinner  class="progress-spinner" strokeWidth="2" style="width: 50px;"/>
            </div>
          </template>
          <DataTable
              v-if="!isCalendar"
              @page="onPageEvents($event)"
              :totalRecords="totalEvents"
              :value="allEvents"
              :paginator="true"
              :lazy="true"
              class="p-datatable-customers"
              :rows="10"
              dataKey="id"
              :rowHover="true"
              :loading="loadingEvents"
              :pageLinkSize="mobile? 3:5"
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
import {Calendar} from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import kkLocale from '@fullcalendar/core/locales/kk';
import ruLocale from '@fullcalendar/core/locales/ru';
import {ref} from "vue";

export default {
  name: "Welcome",
  components: {EventsView, NewsView},
  data() {
    return {
      total: 0,
      totalEvents: 0,
      layout: 'list',
      selectedNews: {},
      selectedEvent: {},
      newsViewVisible: false,
      eventViewVisible: false,
      skeletons: new Array(6),
      loading: false,
      loadingEvents: false,
      lazyParams: {
        page: 0,
        rows: 7,
        searchText: null,
        sortField: "",
        sortOrder: 0
      },
      eventParams: {
        page: 0,
        rows: 10,
        first: 0,
        eventType: "publish",
        sortField: "",
        sortOrder: 0,
        countMode: null
      },
      allNews: [],
      allEvents: [],
      calendarEvents: [],
      notifications: [],
      newsService: new NewsService(),
      eventService: new EventsService(),
      mobile: false,
      isCalendar: false,
      isGrid: true,
      currentMonth:  new Date().getMonth()+1,
      currentYear:  new Date().getFullYear()
    };
  },

  methods: {
    getAllNews(data) {
      if(data === false) {
        this.isGrid = false
        this.lazyParams.rows = 10;
      }else {
        this.isGrid = true
        this.lazyParams.rows = 7;
      }
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
      }).catch((error) => {
        this.loading = false;
        this.$toast.add({
          severity: "error",
          summary: this.$t("smartenu.loadAllNewsError") + ":\n" + error,
          life: 3000,
        });
      });
    },
    async getAllEvents(data) {
      this.isCalendar = data
      this.allEvents = [];
      this.loadingEvents = true
      if(data) {
        delete this.eventParams.countMode
        delete this.eventParams.first
        delete this.eventParams.page
        delete this.eventParams.sortField
        delete this.eventParams.sortOrder
      }else {
        this.eventParams.rows = 10;
      }
      this.eventService.getPublishEvents(this.eventParams).then((response) => {
        this.allEvents = response.data.events;
        this.allEvents.map(e => {
          let fileUrl = e.main_image_file ? e.main_image_file.filepath : e.image1
          e.imageUrl = smartEnuApi + fileRoute + fileUrl
        });
        if(data){
          this.calendarEvents = this.allEvents
          this.calendarEvents.map(i => {
            i.title = this.$i18n.locale === "kz" ? i.titleKz : this.$i18n.locale === "ru" ? i.titleRu : i.titleEn
            i.start = this.formatDateCalendar(i.eventDate)
            i.url = this.eventView
          })
        }
        this.totalEvents = response.data.total;
        this.loadingEvents = false;
      }).catch((error) => {
        this.loadingEvents = false;
        this.$toast.add({
          severity: "error",
          summary: this.$t("smartenu.loadAllEventsError") + ":\n" + error,
          life: 3000,
        });
      });
    },
    eventView(item) {
      if(item.event){
        this.selectedEvent = item.event.extendedProps;
      }else {
        this.selectedEvent = item;
      }
      this.eventViewVisible = true;
    },
    getCalendar() {
        setTimeout(() => {
          const calendarEl = document.getElementById('full_calendar');
          this.allEvents.map(i => {
                i.title = this.$i18n.locale === "kz" ? i.titleKz : this.$i18n.locale === "ru" ? i.titleRu : i.titleEn
                i.start = this.formatDateCalendar(i.eventDate)
              })
          let month = this.currentMonth;
          let year = this.currentYear;
          const calendar = new Calendar(calendarEl, {
            plugins: [dayGridPlugin, timeGridPlugin],
            events: this.calendarEvents,
            eventClick: this.eventView,
            locales: [kkLocale, ruLocale],
            locale: this.$i18n.locale === "kz" ? 'kk' : this.$i18n.locale,
            initialView: 'dayGridMonth',
            header: {
              left: 'customprev,customnext',
              center: 'title',
              right: ''
            },
            customButtons: {
              customprev: {
                icon: 'pi pi-chevron-left',
                click: () => {
                  month--;
                  if (month < 1) {
                    month = 12;
                    year--;
                  }
                  this.eventParams.month = month;
                  this.eventParams.year = year;
                  this.getAllEvents(true).then(() => {
                    calendar.prev();
                    calendar.removeAllEvents();
                    calendar.addEventSource(this.calendarEvents);
                  });
                }
              },
              customnext: {
                icon: 'pi pi-chevron-right',
                click: () =>  {
                  month++;
                  if (month > 12) {
                    month = 1;
                    year++;
                  }
                  this.eventParams.month = month;
                  this.eventParams.year = year;
                  this.getAllEvents(true).then(() => {
                    calendar.next();
                    calendar.removeAllEvents();
                    calendar.addEventSource(this.calendarEvents);
                  });
                }
              }
            }
          });
          calendar.render();
    },500)
    },
    formatDateMoment(date) {
      return moment(new Date(date)).utc().format("DD.MM.YYYY HH:mm")
    },
    formatDateCalendar(date) {
      return moment(new Date(date)).utc().format("YYYY-MM-DD");
    },
    newsView(item) {
      this.selectedNews = item;
      this.newsViewVisible = true;
    },
    getBlockClass(index) {
      if(this.mobile){
        return index < 1 ? 'col-12' : 'col-6';
      }else {
        return index < 3 ? 'col-4' : 'col-3';
      }
    },
    onPage(event) {
      this.lazyParams = event
      this.getAllNews(false);
    },
    onPageGrid(event) {
      this.lazyParams = event
      this.getAllNews(true);
    },
    onPageEvents(event) {
      this.eventParams.page = event.page
      this.eventParams.first = event.first
      this.getAllEvents();
    },
    isCalendarBool(bool){
      if (bool) {
        this.eventParams.month = this.currentMonth
        this.eventParams.year = this.currentYear
        this.eventParams.eventType = "publish";
        this.getAllEvents(true)
        this.getCalendar()
        this.isCalendar = bool
      } else {
        delete this.eventParams.month
        delete this.eventParams.year
        this.getAllEvents(false)
        this.isCalendar = bool
      }
    }
  },
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
.news_cards {
  .news_card{
    border: 1px solid #dee2e6;
    border-radius: 15px;
    .news_content{
      padding: 15px;
      position: absolute;
      bottom: 0;
      color: #fff;
      .date{
        color: #ccc;
      }
    }
    .news_title{
      -webkit-line-clamp: 2;
      line-clamp: 2;
      -webkit-box-orient: vertical;
      display: -webkit-box;
      display: -moz-box;
      overflow: hidden;
    }
    .img{
      position: relative;
      border-radius: 15px;
      height: 220px;
    }
    .img:before {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 50%;
      background: linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgb(41, 48, 66) 100%);
      border-bottom-left-radius: 15px;
      border-bottom-right-radius: 15px;
    }
    .news_tag{
      background: #007be5;
      color: #fff;
      padding: 2px 5px;
      bottom: 14px;
      left: 10px;
      width: fit-content;
      border-radius: 5px;
    }
  }
  img{
    border-radius: 15px;
    object-fit: cover;
  }
}
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
.calendar_buttons button {
  border-radius: 10px;
  padding: 7px 20px;
}
:deep(.fc-button-group button) {
  border-radius: 10px;
}
.calendar_buttons .calendar_btn_left{
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
.calendar_buttons .calendar_btn_right{
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}
.calendar_buttons button.active {
  background: #007be5;
  color: #fff;
  border: 1px solid #007be5;
}

:deep(.fc-button-primary) {
  background: #007be5;
  border: 1px solid #fff;
}
:deep(.fc-unthemed td.fc-today) {
  background: #e9f7ff;
}
:deep(.fc-day-grid-event) {
  cursor: pointer;
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
  .news_cards{
    .col-6 {
      .img, img{
        height: 100px;
      }
    }
  }
  .news_content{
    font-size: 11px;
  }
}
@media only screen and (max-width: 1920px) and (min-width: 1535px) {
  .news_cards{
    .col-4 {
      .img, img{
        height: 280px;
      }
    }
    .col-3 {
      .img, img{
        height: 250px;
      }
    }
  }
}
</style>
