<template>
  <div :class="[containerClass, {'fixed_container': fixedMenu}]" @click="onWrapperClick">
    <ConfirmDialog></ConfirmDialog>
    <Toast/>
    <AppTopBar @menu-toggle="onMenuToggle" v-model:pagemenu="localpagemenu"/>
    <div class="hint" v-if="showOverlay">
      <div class="hint-popup">
        {{ $t("common.hint") }}
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
          <div style="display: flex; align-items: center;">
            <Checkbox v-model="showAnymore" :binary="true" style="margin-left: 10px;" />
            <div style="margin-left: 10px">{{ $t("common.doNotShowAnymore") }}</div>
          </div>
          <Button class="p-button-outlined" @click="hideOverlay">OK</Button>
        </div>

      </div>
    </div>
    <div :class="[sidebarClass,{ 'hide_items': hasClass }]" @click="onSidebarClick" v-show="isSidebarVisible()" :style="{ width: menuWidth + 'px' }"
         @mouseover="expandMenu" @mouseleave="collapseMenu">
      <div class="relative fixed_icon">
        <div class="absolute right-0 top-0" v-if="isDesktop()" @click="toggleMenuWidth" :style="{color: fixedMenu? '#2196f3':'#ced4da'}">
          <i class="fa-solid fa-thumbtack"></i>
        </div>
      </div>
      <div class="layout-logo">
        <div class="flex justify-content-center align-items-center">
          <router-link to="/">
            <h2 class="text-white">SMART.ENU</h2>
            <div class="text_enu">ENU</div>
          </router-link>
        </div>

      </div>
      <AppProfile/>
      <AppMenu v-show="false" :model="globalMenu" @menuitem-click="onMenuItemClick"/>
    </div>
    <div class="layout-main flex-grow-1" :class="{ 'flex flex-column': applyFlex }">
<!--      <router-view v-model:pagemenu="localpagemenu" @apply-flex="applyFlexHandler"/>-->
      <div class="technical_work">
        <h1>
          {{
            $i18n.locale === 'kz' ? 'Сайтта техникалық жұмыстар жүргізілуде' : $i18n.locale === 'ru' ?
                'Ведутся технические работы на сайте' : 'Technical work is underway on the site'
          }}
        </h1>
        <p>
          {{
            $i18n.locale === 'kz' ? 'Өтініш кейінірек қайта кіріңіз' : $i18n.locale === 'ru' ?
                'Пожалуйста, зайдите позже.' : 'Please check back later.'
          }}
        </p>
      </div>
    </div>
    <AppConfig :layoutMode="layoutMode" :layoutColorMode="layoutColorMode" @layout-change="onLayoutChange"
               @layout-color-change="onLayoutColorChange"/>
    <AppFooter/>
    <Dialog v-model:visible="showModal" :header="$i18n.locale === 'kz' ? `Құрметті Гүлмира Тілеубердіқызы!` : $i18n.locale === 'ru' ? `Дорогая Гульмира Тылеубердиевна!` : `Құрметті Гүлмира Тілеубердіқызы!`" @hide="closeModal" modal :style="{ width: '800px' }" :breakpoints="{ '800px': '75vw', '640px': '90vw' }">
      <div v-if="$i18n.locale === 'kz' || $i18n.locale === 'en'">
        <p>Шын жүректен Сізді туған күніңізбен құттықтаймыз! 🎉</p>
        <p>Сіз — кәсібилік пен мақсаткерлікті ғана емес, сонымен қатар әрқайсымызға деген мейірімділік пен қамқорлықты бойына жиған ерекше жансыз. Сіздің биік мақсаттарыңыз бізді шабыттандырады, ал команданы біріктіріп, әрқайсымызды жетістікке жетелейтін қасиетіңіз Сізді нағыз көшбасшы етеді.</p>
        <p>Әрдайым қолдау көрсетіп, орынды әзілдесіп, қажет кезінде қатал бола білесіз. Сіздің күш-жігеріңізге, даналығыңызға және мансаптағы биіктерді бағындыра отырып, қамқор ана, сүйікті жар болып қалуыңызға тәнтіміз.</p>
        <p>Әрқайсымызға назар аударып, қамқорлық танытқаныңыз үшін алғыс айтамыз. Бізді жаңа жетістіктерге шабыттандырғаныңыз үшін алғыс білдіреміз! Сізге зор денсаулық, шексіз бақыт және жаңа табыстар тілейміз. Әр күніңіз қуаныш пен шабытқа толы болсын!</p>
        <p>Ізгі ниетпен,
          Сіздің командаңыз</p>
      </div>
      <div v-if="$i18n.locale === 'ru'">
        <p>От всей души поздравляем Вас с Днём Рождения! 🎉</p>
        <p>Вы — удивительный человек, который сочетает в себе не только профессионализм и целеустремлённость, но и невероятную теплоту и внимание к каждому из нас. Ваши высокие цели вдохновляют, а Ваша способность объединять команду и мотивировать всех на успех делает Вас настоящим лидером.</p>
        <p>Вы всегда находите слова поддержки, шутите в нужный момент и остаётесь строгой, когда это необходимо. Мы восхищаемся Вашей силой, мудростью и тем, как Вы, успевая достигать карьерных высот, остаётесь заботливой мамой и любящей супругой.</p>
        <p>Спасибо Вам за Ваше внимание и заботу о каждом из нас, за то, что вдохновляете нас на новые достижения! Желаем Вам счастья, здоровья, успехов во всех начинаниях и чтобы каждый новый день был наполнен радостью и вдохновением!</p>
        <p>С уважением и самыми тёплыми пожеланиями, Ваша команда</p>
      </div>
      <img style="border-radius: 10px; margin-top: 20px;" width="100%" src="@/assets/layout/images/birthday.jpg" alt="">
    </Dialog>
    <PositionChangeDialog v-if="!showModal && loginedUser && loginedUser.userID > 0" ref="positionChangeDialog"></PositionChangeDialog>
  </div>
</template>

<script>
import {useRoute} from "vue-router"

import {MenuService} from "../service/menu.service";
import {smartEnuApi, getHeader} from "@/config/config";
import axios from 'axios';
import AppTopBar from '../AppTopbar.vue';
import AppProfile from '../AppProfile.vue';
import AppMenu from '../AppMenu.vue';
import AppConfig from '../AppConfig.vue';
import AppFooter from '../AppFooter.vue';
import PositionChangeDialog from './PositionChangeDialog.vue';
import {isNumber} from "chart.js/helpers";
import Bold from "quill/formats/bold";
import logger from "quill/core/logger";

export default {
  setup() {
    useRoute();
  },

  props: {
    pagemenu: null,
  },
  data() {
    return {
      loginedUser: {},
      layoutMode: 'static',
      layoutColorMode: 'dark',
      staticMenuInactive: false,
      overlayMenuActive: false,
      mobileMenuActive: false,
      localpagemenu: this.pagemenu,
      menuService: new MenuService(),
      applyFlex: false,
      menuWidth: 85,
      hasClass: false,
      showOverlay: false,
      showAnymore: false,
      fixedMenu: localStorage.getItem('fixedMenu') === 'true' || false,
      birthday: '1996-09-18T00:00:00Z',
      showModal: false
    }
  },

  watch: {
    $route() {
      this.menuActive = false;
      this.$toast.removeAllGroups();
    },
    fixedMenu(newVal, oldVal) {
      this.fixedMenu = newVal
      if (this.fixedMenu) {
        this.menuWidth = 250
        this.hasClass = true
      } else {
        this.menuWidth = 85
        this.hasClass = false
      }
    }
  },
  methods: {
    getLoginedUser() {
      this.loginedUser = this.$store.state.loginedUser;
    },

    initMenu() {
      let menus = this.menuService.getGlobalMenu(this.$t);
      return menus;
    },
    isDissertationAdmin() {
      if (!this.loginedUser)
        this.getLoginedUser();
      return this.findRole('dissertation_chief');
    },
    isVacancyRightsValidity() {
      if (!this.loginedUser)
        this.getLoginedUser();
      return this.findRole('hr_administrator') ||
          this.findRole('career_administrator') ||
          this.findRole('hr_moderator') ||
          this.findRole('career_moderator') ||
          this.findRole('vacancy_initial_approve') ||
          this.findRole('vacancy_final_approve');
    },
    findRole(roleName) {
      if (!this.loginedUser)
        this.getLoginedUser();
      if (!this.loginedUser.roles) {
        return false;
      }
      for (let i = 0; i < this.loginedUser.roles.length; i++) {
        if (this.loginedUser.roles[i].name === roleName) {
          return true;
        }
      }
      return false;
    },
    isRoleGroupMember(groupPrefix) {
      if (!this.loginedUser)
        this.getLoginedUser();
      if (!this.loginedUser.roles) {
        return false;
      }
      for (let i = 0; i < this.loginedUser.roles.length; i++) {
        if (this.loginedUser.roles[i].name.includes(groupPrefix)) {
          return true;
        }
      }
      return false;
    },
    onWrapperClick() {
      if (!this.menuClick) {
        this.overlayMenuActive = false;
        this.mobileMenuActive = false;
      }

      this.menuClick = false;
    },
    onMenuToggle() {
      this.menuClick = true;
      this.$emit("update:pagemenu", this.localpagemenu);
      this.mobileMenuActive = !this.mobileMenuActive;
      this.hasClass = true;
      if (this.menuWidth === 85) {
        this.menuWidth = 250;
      }
    },
    onSidebarClick() {
      this.menuClick = true;
    },
    onMenuItemClick(event) {
      if (event.item && !event.item.items) {
        this.overlayMenuActive = false;
        this.mobileMenuActive = false;
      }
    },
    toggleMenuWidth() {
      this.menuWidth = this.menuWidth === 85 ? 250 : 85;
      this.fixedMenu = !this.fixedMenu
      localStorage.setItem("fixedMenu", this.fixedMenu)

      axios
          .post(smartEnuApi + "/smartenu/settings/insert", {
                fixed_menu: this.fixedMenu,
              },
              {
                headers: getHeader()
              },).then((res) => {

      }).catch((err) => {
        if (err.response.status == 401) {
          this.$store.dispatch("logLout");
        }

        this.$toast.add({
          severity: "error",
          detail: this.$t("common.message.saveError"),
          life: 3000,
        });

        this.loading = false;
      });

    },
    expandMenu() {
      if (this.fixedMenu) return;
      this.hasClass = true;
      if (this.menuWidth === 85) {
        this.menuWidth = 250;
      }
    },
    collapseMenu() {
      if (this.fixedMenu) return;
      this.hasClass = false;
      if (this.menuWidth === 250) {
        this.menuWidth = 85;
      }
    },
    onLayoutChange(layoutMode) {
      this.layoutMode = layoutMode;
    },
    onLayoutColorChange(layoutColorMode) {
      this.layoutColorMode = layoutColorMode;
    },
    addClass(element, className) {
      if (element.classList)
        element.classList.add(className);
      else
        element.className += ' ' + className;
    },
    removeClass(element, className) {
      if (element.classList)
        element.classList.remove(className);
      else
        element.className = element.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    },
    isDesktop() {
      return window.innerWidth > 1024;
    },
    isSidebarVisible() {
      if (this.isDesktop()) {
        if (this.layoutMode === 'static')
          return !this.staticMenuInactive;
        else if (this.layoutMode === 'overlay')
          return this.overlayMenuActive;
        else
          return true;
      } else {
        return true;
      }
    },
    applyFlexHandler(value) {
      this.applyFlex = value;
    },
    loadMenuIcon() {

      const fixedMenu = localStorage.getItem("fixedMenu");


      const isValueMissing = fixedMenu === null || fixedMenu === undefined || fixedMenu === 'null' || fixedMenu === 'undefined';

      if (isValueMissing) {

        axios
            .get(smartEnuApi + "/smartenu/settings/get", {
              headers: getHeader()
            })
            .then((res) => {

              if (res.data && res.data.enu_settings) {
                localStorage.setItem("fixedMenu", res.data.enu_settings.fixed_menu);
                this.fixedMenu = res.data.enu_settings.fixed_menu;
              } else {
                this.fixedMenu = false
              }
            })
            .catch((err) => {

              console.error('Ошибка при получении значения fixedMenu из бэкенда:', err);

              this.fixedMenu = false;
            });
      } else {

        this.fixedMenu = fixedMenu === 'true';
      }
    },

    saveMenuIcon() {

    },
    hideOverlay() {
      this.showOverlay = false;
      localStorage.setItem("show-hint", true);
      this.saveThemeStyles()
    },
    changeShowAnymore(value) {
      this.showAnymore = value;
    },
    saveThemeStyles(){
      axios
          .post(smartEnuApi + "/smartenu/settings/insert",{
                show_anymore: this.showAnymore,
              },
              {
                headers: getHeader()
              },).then((res) => {

      }).catch((err) => {
        if (err.response.status == 401) {
          this.$store.dispatch("logLout");
        }

        this.$toast.add({
          severity: "error",
          detail: this.$t("common.message.saveError"),
          life: 3000,
        });

        this.loading = false;
      });
    },
    getThemeStyles() {
      axios
          .get(smartEnuApi + "/smartenu/settings/get",
              {
                headers: getHeader()
              },
          )
          .then((res) => {
            console.log(res.data.enu_settings)
            if (res.data && res.data.enu_settings){
              this.changeShowAnymore(res.data.enu_settings.show_anymore)
              this.showOverlay = !res.data.enu_settings.show_anymore
            }
          })
          .catch((err) => {
            console.error("Error loading data:", err);
          });
    },
    checkBirthday() {
      const today = new Date();
      const userBirthday = new Date(this.$store.state.loginedUser.birthday);
      if (this.$store.state.loginedUser.IIN === '810919401753' && (today.getDate() === userBirthday.getUTCDate() && today.getMonth() === userBirthday.getUTCMonth())) {
        if (!localStorage.getItem('birthdayModalShown')) {
          this.showModal = true;
          localStorage.setItem('birthdayModalShown', 'true');
        }
      }
    },
    closeModal() {
      this.showModal = false;
    }
  },
  computed: {
    containerClass() {
      return ['layout-wrapper', {
        'layout-overlay': this.layoutMode === 'overlay',
        'layout-static': this.layoutMode === 'static',
        'layout-static-sidebar-inactive': this.staticMenuInactive && this.layoutMode === 'static',
        'layout-overlay-sidebar-active': this.overlayMenuActive && this.layoutMode === 'overlay',
        'layout-mobile-sidebar-active': this.mobileMenuActive,
        'p-input-filled': this.$primevue.config.inputStyle === 'filled',
        'p-ripple-disabled': this.$primevue.config.ripple === false
      }];
    },
    sidebarClass() {
      return ['layout-sidebar', {
        'layout-sidebar-dark': this.layoutColorMode === 'dark',
        'layout-sidebar-light': this.layoutColorMode === 'light'
      }];
    },
    logo() {
      return (this.layoutColorMode === 'dark') ? "assets/layout/images/logo-white.svg" : "assets/layout/images/logo.svg";
    },
    globalMenu() {
      return this.initMenu();
    },
  },
  created() {
    this.getLoginedUser();
    if (this.fixedMenu) {
      this.menuWidth = 250
      this.hasClass = true
    } else {
      this.menuWidth = 85
    }

  },
  mounted() {
    if (!localStorage.getItem("show-hint")) {
      this.showOverlay = true;
    }
    let showPositionsDialog = localStorage.getItem('showPositionsDialog');
    let doNotShowAnymore = localStorage.getItem('doNotShowWelcomePositionChangeDialog') === 'true';

    if (showPositionsDialog && !doNotShowAnymore) {
      this.$refs.positionChangeDialog.show();

      localStorage.removeItem('showPositionsDialog');
    } else if (doNotShowAnymore) {
      localStorage.removeItem('showPositionsDialog');
    }
    this.loadMenuIcon()
    this.getThemeStyles()
    this.checkBirthday();
  },
  beforeUpdate() {
    if (this.mobileMenuActive)
      this.addClass(document.body, 'body-overflow-hidden');
    else
      this.removeClass(document.body, 'body-overflow-hidden');
  },
  components: {
    'AppTopBar': AppTopBar,
    'AppProfile': AppProfile,
    'AppMenu': AppMenu,
    'AppConfig': AppConfig,
    'AppFooter': AppFooter,
    PositionChangeDialog,
  }
}
</script>

<style lang="scss">

.p-toast.p-toast-topright {
  z-index: 1000;
  top: 70px;
}

.customer-badge {
  border-radius: 2px;
  padding: 0.25em 0.5rem;
  text-transform: uppercase;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.3px;

  &.status-vaccinated {
    background: #c8e6c9;
    color: #256029;
  }

  &.status-firstcomponent {
    background: #b3e5fc;
    color: #23547b;
  }

  &.status-noData {
    background: #ffcdd2;
    color: #c63737;
  }

  &.status-rejected {
    background: #feedaf;
    color: #ff0000;
  }

  &.status-planned {
    background: #eccfff;
    color: #694382;
  }

  &.status-minor {
    background: #a2fcfc;
    color: #00f7f7;
  }

  &.status-created {
    background: #6c757d;
    color: #fff;
  }

  &.status-signing {
    background: #17a2b8;
    color: #fff;
  }

  &.status-signed {
    background: #28a745;
    color: #fff;
  }

  &.status-inapproval {
    background: #9317b8;
    color: #ffffff;
  }

  &.status-approved {
    background: #007bff;
    color: #ffffff;
  }

  &.status-revision {
    background: #ffcdd2;
    color: #c63737;
  }

}


.hint-popup {
  width: 300px;
  top: 55px;
  right: 162px;
  padding: 20px;
  position: fixed;
  background: #fff;
  z-index: 999;
  box-shadow: rgba(0, 0, 0, 0.35) 0 2px 10px;
  border-radius: 5px;
  animation: jump 2s ease-in-out 2;
}

.hint-popup:before {
  content: "";
  border: solid transparent;
  position: absolute;
  right: 12px;
  bottom: 100%;
  border-bottom-color: #2196F3;
  border-width: 9px;
  margin-left: 0;
}

@media (max-width: 500px) {
  .hint-popup {
    right: 2%;
  }
  .hint-popup:before {
    right: 53%;
  }
}

@keyframes jump {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-20px);
  }
  60% {
    transform: translateY(-15px);
    box-shadow: rgb(33, 150, 243) 0 2px 10px;
  }
}
.technical_work{
  text-align: center;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 10px;
  color: #003c76;
  font-weight: 600;
  white-space: nowrap;
  p{
    font-size: 20px;
  }
}
@media (max-width: 640px) {
  .technical_work{
    h1{
      font-size: 20px;
    }
    p{
      font-size: 18px;
    }
  }
}
@media (max-width: 415px) {
  .technical_work{
    width: 100%;
    white-space: normal;
    img{
      width: 200px;
    }
    h1{
      font-size: 18px;
    }
    p{
      font-size: 16px;
    }
  }
}
</style>