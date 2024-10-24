<template>
    <div class="layout-topbar no-print">
        <div>
            <button v-if="isMobile()" class="p-link layout-menu-button" @click="onMenuToggle">
                <span class="pi pi-bars"></span>
            </button>
            <Button v-if="($route.name=='organizations') || ($route.name=='persons')" class="add_new p-button"
                    icon="pi pi-plus"
                    :label="getCreateLabel" @click="toggle" aria-haspopup="true" aria-controls="overlay_menu"/>
        </div>
        <Menu id="overlay_menu" ref="menu" :model="pagemenu" :popup="true"/>
        <div class="header_icons flex align-items-center">
            <!--                <i v-tooltip.bottom="'Telegram Chat'" @click="navigateToTelegram()" class="tg pi pi-telegram ml-2 mr-2"></i>-->
            <img class="telegram ml-2 mr-2" v-tooltip.bottom="'Telegram Chat'" @click="navigateToTelegram()"
                 src="@/assets/layout/images/telegram.svg" alt="">
            <i v-if="isShowGuide" v-tooltip.bottom="$t('guide.guide')" @click="navigate()"
               class="pi pi-question-circle ml-2 mr-2"></i>
            <div class="notification ml-2 mr-4" @click="visibleRight = true">
                <i class="fa-regular fa-bell"/>
                <Badge :value="notLength" severity="primary"></Badge>
            </div>
            <LanguageDropdown class="top_lang"/>
        </div>
        <Sidebar v-model:visible="visibleRight"
                 blockScroll=false
                 @show="firstShow"
                 @after-hide="resetNot"
                 :baseZIndex="10000" position="right"
                 style="width: 25%;">
            <h4>{{ $t('common.notifications') }}</h4>
            <div>
                <div v-for="(n,ni) in notifications" :key="ni"
                     style="clear: left; width: 100%; display: block; margin-bottom:25px;padding-bottom:15px;border-bottom:1px dotted #ccc;">
                    <div class="flex">
                        <img class="notification_img round mr-3"
                             v-if="n.senderObject.photo != null && n.senderObject.photo !=''"
                             :src="'data:image/jpeg;base64,' + n.senderObject.photo " rounded/>
                        <div class="flex flex-column gap-1" style="width: 75%;word-wrap: break-word;">
                            <h6 :style="{margin:0,marginBottom:'2px',fontWeight : n.isSeen==0 ? 'bolder' : '400'}">
                                {{ n.senderObject.fullName }}</h6>
                            <div :style="{fontWeight : n.isSeen==0 ? 'bolder' : '400'}" class="font-semibold"
                                 v-html="n['description_' + $i18n.locale]">
                            </div>
                            <span class="text-gray-500">{{
                                timeDifference(n.createdDate)
                                }}</span>
                        </div>
                        <div v-if="n.isSeen===0" class="new_notification"></div>
                    </div>
                </div>
                <div class="p-w-full p-text-center">
                    <span v-if="notLoading">Loading please wait . . .</span>
                    <Button v-if="showCalc && !notLoading" icon="pi pi-refresh" @click="loadByPage()"
                            style="width:100%;" class="p-w-full p-button-rounded p-button-outlined" iconPos="right"
                            :label="$t('common.loadMore')"/>
                </div>
            </div>
        </Sidebar>
    </div>
</template>
<script>
import LanguageDropdown from "./LanguageDropdown";
import {getHeader, smartEnuApi, socketApi} from "@/config/config";
import moment from "moment";
import {mapState} from "vuex";
import {NotificationService} from "@/service/notification.service";

export default {
    components: {LanguageDropdown},
    props: {
        pagemenu: null,
    },
    data() {
        return {
            visibleRight: false,
            socket: null,
            isShowGuide: process.env.VUE_APP_SHOW_GUIDE === 'true',
            notifications: [],
            itemsPerPage: 6,
            pageCount: 0,
            pageNum: 1,
            newCount: 0,
            firstShown: false,
            notificationService: new NotificationService(),
            loginedUser: null,
        }
    },
    methods: {
        resetNot() {
            this.notifications = [];
            this.pageNum = 1;
        },
        firstShow() {
            this.loadNotifications();
        },
        loadByPage() {
            //alert("pageNum :"+this.pageNum +" pageCount :" +parseInt(this.pageCount-1))
            this.loadNotifications();
        },
        toggle(event) {
            this.$refs.menu.toggle(event);
        },
        onMenuToggle(event) {
            this.$emit('menu-toggle', event);
        },
        navigate() {
            let routeData = this.$router.resolve({name: 'MainGuide', params: {id: this.$route.path}});
            window.open(routeData.href, '_blank');
        },
        navigateToTelegram() {
            window.open('https://t.me/smartenu_chat', '_blank')
        },
        ViewNotification(nots) {
            this.notificationService.viewNotifications({views: nots}).then(response => {
                    if (this.newCount > 0)
                        this.newCount = this.newCount - nots.length < 0 ? 0 : this.newCount - nots.length;
                    console.info("view result", response)
                }
            ).catch(_ => {});
        },
        loadNotifications() {
          if (this.loginedUser) {
            this.notLoading = true;
            this.notificationService.getNotifications(this.pageNum, this.itemsPerPage).then(response => {
              this.newCount = response.data.NewCount ? response.data.NewCount : 0;
              let recordCount = response.data.RecordCount;
              this.pageCount = recordCount % this.itemsPerPage == 0 ? parseInt(recordCount / this.itemsPerPage) : parseInt(recordCount / this.itemsPerPage) + 1;
              //alert("private len "+response.data.private.length+" "+" general len"+response.data.general.length);
              if (!response.data.private) {
                  response.data.private = [];
              }
              if (!response.data.general) {
                  response.data.general = [];
              }
              let nots = response.data.private.concat(response.data.general);
              nots.forEach(n => {
                  if (n) {
                      n.senderObject = JSON.parse(n.senderJSON);
                      if (!n.isSeen) {
                          n.isSeen = 0;
                      }
                  }

              });
              this.notifications = this.notifications.concat(nots);
              this.pageNum = this.pageNum + 1;
              this.notLoading = false;
              let newNots = this.notifications.filter(f => parseInt(f.isSeen) == 0);
              if (newNots.length > 0) {
                  this.ViewNotification(newNots);
              }
            }).catch(_ => {})
          }
        },
        timeDifference(givenDate) {

            const now = moment()

            const given = moment(givenDate);
            moment.locale('smartEnu', {
                relativeTime: {
                    future: this.$i18n.locale === "kz" ? "" : this.$i18n.locale === "en" ? "in %s" : "",
                    past: this.$i18n.locale === "kz" ? "%s бұрын" : this.$i18n.locale === "en" ? "%s ago" : "",
                    ss: this.$i18n.locale === "kz" ? "бірнеше секунд бұрын" : this.$i18n.locale === "en" ? "few seconds ago" : "",
                    m: this.$i18n.locale === "kz" ? "минут бұрын" : this.$i18n.locale === "en" ? "a minute" : "",
                    mm: this.$i18n.locale === "kz" ? "%d минут бұрын" : this.$i18n.locale === "en" ? "%d minutes" : "",

                    h: this.$i18n.locale === "kz" ? "бір сағат бұрын" : this.$i18n.locale === "en" ? "an hour" : "",
                    hh: this.$i18n.locale === "kz" ? "%d сағат бұрын" : this.$i18n.locale === "en" ? "%d hours" : "",
                    d: this.$i18n.locale === "kz" ? "бір күн бұрын" : this.$i18n.locale === "en" ? "a day" : "",
                    dd: this.$i18n.locale === "kz" ? "%d күн бұрын" : this.$i18n.locale === "en" ? "%d days" : "",
                    w: this.$i18n.locale === "kz" ? "бір апта бұрын" : this.$i18n.locale === "en" ? "a week" : "",
                    ww: this.$i18n.locale === "kz" ? "%d апта бұрын" : this.$i18n.locale === "en" ? "%d weeks" : "",
                    M: this.$i18n.locale === "kz" ? "бір ай бұрын" : this.$i18n.locale === "en" ? "a month" : "",
                    MM: this.$i18n.locale === "kz" ? "%d ай бұрын" : this.$i18n.locale === "en" ? "%d months" : "",
                    y: this.$i18n.locale === "kz" ? "бір жыл бұрын" : this.$i18n.locale === "en" ? "a year" : "",
                    yy: this.$i18n.locale === "kz" ? "%d жыл бұрын" : this.$i18n.locale === "en" ? "%d years" : "",
                }
            });
            return moment.duration(given.diff(now)).humanize();

        },
      isMobile() {
        return window.innerWidth <= 1024;
      },
    },
    computed: {
        ...mapState(["loginedUser"]),
        notLength() {
            return this.newCount.toString()
        },

        showCalc() {
            if (parseInt(this.pageNum) <= parseInt(this.pageCount)) {
                return true;
            }
            return false;
        },
        getCreateLabel() {
            if (window.innerWidth <= 460) {
                return ""
            }
            return this.$t('common.createNew')
        }
    },
    mounted() {
      this.loginedUser = localStorage.getItem("loginedUser");
      if (this.loginedUser) {
        this.notLoading = true;
        this.notificationService.getNotifications(this.pageNum, this.itemsPerPage).then(response => {
          this.newCount = response.data.NewCount ? response.data.NewCount : 0;
          let recordCount = response.data.RecordCount;
          this.pageCount = recordCount % this.itemsPerPage == 0 ? parseInt(recordCount / this.itemsPerPage) : parseInt(recordCount / this.itemsPerPage) + 1;
        }).catch(_ => {})
      }
    },
    async created() {

        let v = this;
        this.socket = await new WebSocket(socketApi + "/notificationws");
        this.socket.onopen = () => {
            this.socket.send(this.loginedUser);
        }

        this.socket.onmessage = (event) => {
            let parsed = JSON.parse(event.data);
            this.$toast.add({
                    severity: 'success',
                    summary: parsed.description,
                    detail: JSON.parse(parsed.senderJSON).fullName,
                    life: 3000
                }
            );
            this.newCount = this.newCount + 1;
            // v.notifications.unshift({
            //     uniqueName:parsed.uniqueName,
            //     isSeen:parsed.isSeen,
            //     notificationId:parsed.notificationId,
            //     senderId:parsed.senderId,
            //     senderObject:JSON.parse(parsed.senderJSON),
            //     description:parsed.description,
            //     link:parsed.link,
            //     jsMethod:parsed.jsMethod,
            // });
        }
    }
}
</script>


<style lang="scss" scoped>

.add_new {
  margin-left: 20px;
  height: 27px;
  background-color: #e3f2fd;
  color: #495057;
}

.header_icons {
  color: #293042;
  cursor: pointer;
}

.header_icons i:hover {
  color: #293042;
}

.header_icons svg:hover {
  color: #293042;
}

.tg {
  font-size: 20px;
}

.round {
  border-radius: 100px;
  /* Радиус скругления */
  margin-right: 5px;
}

.notification_img {
  width: 60px;
  min-width: 60px;
  height: 60px;
}

.new_notification {
  width: 8px;
  min-width: 8px;
  height: 8px;
  background: #4eb0ff;
  border-radius: 50%;
  //box-shadow: 0 0 3px 1px #2196F3;
}
.telegram {
    width: 21px;
    height: 21px;
    display: block;
}
::v-deep(.p-inputtext, .p-dropdown .p-dropdown-trigger){
    color: #293042!important;
}
::v-deep(.p-dropdown .p-dropdown-trigger){
    color: #293042!important;
}

@media print {
  .no-print, .no-print * {
    display: none !important;
  }
}

@media print {
  .show-print, .show-print * {
    display: block !important;
    width: 100% !important;
  }
}

.pi-question-circle {
  margin-right: 10px;
  font-size: 20px;
  //color: white;
}
.p-link:focus {
    box-shadow: none;
}
@media (max-width: 425px) {
  .layout-topbar {
    padding: 1em;
  }
}

.product-item {
  display: flex;
  align-items: center;
  padding: .5rem;
  width: 100%;

  img {
    width: 75px;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
    margin-right: 1rem;
  }

  .product-list-detail {
    flex: 1 1 0;
  }

  .product-list-action {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }

  .product-category-icon {
    vertical-align: middle;
    margin-right: .5rem;
    font-size: .875rem;
  }

  .product-category {
    vertical-align: middle;
    line-height: 1;
    font-size: .875rem;
  }
}

.notification {
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;

  svg {
    font-size: 20px;
  }

  span {
    position: absolute;
    left: 10px;
    top: -5px;
  }
}

@media screen and (max-width: 576px) {
  .product-item {
    flex-wrap: wrap;

    .image-container {
      width: 100%;
      text-align: center;
    }

    img {
      margin: 0 0 1rem 0;
      width: 100px;
    }
  }
}

</style>
