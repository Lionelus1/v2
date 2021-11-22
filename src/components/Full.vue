<template>
	<div :class="containerClass" @click="onWrapperClick">
        <Toast />
        <ConfirmDialog></ConfirmDialog>
		<AppTopBar @menu-toggle="onMenuToggle" />

    <transition name="layout-sidebar">
      <div :class="sidebarClass" @click="onSidebarClick" v-show="isSidebarVisible()">
        <div class="layout-logo">
          <router-link to="/">
            <h1>SMART ENU</h1>
            <!-- <img alt="Logo" :src="logo" /> -->
          </router-link>
        </div>

        <AppProfile/>
        <AppMenu :model="menu" @menuitem-click="onMenuItemClick"/>
      </div>
    </transition>

    <div class="layout-main p-pr-0 p-pl-0">

      <router-view/>
    </div>

    <AppConfig :layoutMode="layoutMode" :layoutColorMode="layoutColorMode" @layout-change="onLayoutChange"
               @layout-color-change="onLayoutColorChange"/>

    <AppFooter/>
  </div>
</template>

<script>
import AppTopBar from '../AppTopbar.vue';
import AppProfile from '../AppProfile.vue';
import AppMenu from '../AppMenu.vue';
import AppConfig from '../AppConfig.vue';
import AppFooter from '../AppFooter.vue';
import {useRoute} from "vue-router"
import Enum from "@/enum/docstates"
import {mapState} from "vuex";

export default {
  setup() {
    useRoute();


  },
  data() {
    return {
      loginedUser: {},
      layoutMode: 'static',
      layoutColorMode: 'dark',
      staticMenuInactive: false,
      overlayMenuActive: false,
      mobileMenuActive: false,

      menu: [
        {
          label: 'Құжаттар', icon: 'pi pi-fw pi-folder',
          items: [
            {label: 'Келісім-шарт үлгілері', icon: 'pi pi-fw pi-book', to: '/documents/doctemplate'},
            {label: 'Келісім-шарттар', icon: 'pi pi-fw pi-copy', to: '/documents/contracts'},
          ]
        },
        {
          label: 'Контрагенттер', icon: 'pi pi-fw pi-users',
          items: [
            {label: 'Ұйымдықтар', icon: 'pi pi-fw pi-home', to: '/contragent/organizations'},
            {label: 'Банктер', icon: 'pi pi-fw pi-money-bill', to: '/contragent/banks'},
            {
              label: 'Жеке тұлғалар',
              icon: 'pi pi-fw pi-user',
              to: '/contragent/persons/' + Enum.PersonType.IndividualEntrepreneur
            },
            {
              label: 'Қызметкерлер',
              icon: 'pi pi-fw pi-user',
              to: '/contragent/persons/' + Enum.PersonType.OrganizationMember
            }
          ]
        },
        // {
        //     label: 'HDFS', icon: 'pi pi-fw pi-folder', to: '/hdfs/hdfsmain'
        // },
        {

          label: this.$t('smartenu.newsTitle'), icon: 'pi pi-fw pi-users',
          items: [
            {
              label: this.$t('smartenu.categories'),
              icon: 'pi pi-fw pi-home',
              to: '/smartenu/admin/newscategories/cattable'
            },
            {label: this.$t('smartenu.newsList'), icon: 'pi pi-fw pi-money-bill', to: '/smartenu/admin/news/newstable'},
          ]
        },

        {
          label: this.$t('smartenu.eventsTitle'), icon: 'pi pi-fw pi-folder', to: '/smartenu/admin/events/events'
        },
        {
          label: this.$t('vaccination.title'), icon: 'pi pi-fw pi-check-circle', to: '/smartenu/vaccination'
        },
        /*{
          label:  this.$t('faq.title'), icon: 'pi pi-fw pi-question-circle', to: '/faq/faqmain'
        },*/
        {
          label: this.$t('dissertation.title'), icon: 'pi pi-fw pi-book',
          items: [
            {
              label: this.$t('dissertation.council.list'),
              icon: 'pi pi-fw pi-list',
              to: '/dissertation/main',
              visible: this.isDissertationAdmin()
            }
          ]
        },
        {
          label: 'План', icon: 'pi pi-fw pi-folder', to: '/work-plan'
        }
      ]
    }
  },
  watch: {
    $route() {
      this.menuActive = false;
      this.$toast.removeAllGroups();
    }
  },
  methods: {
    getLoginedUser() {
      this.loginedUser = this.$store.state.loginedUser;
    },
    isDissertationAdmin() {
      if (!this.loginedUser)
        this.getLoginedUser();
      return (this.loginedUser.info === "Департамент цифрового развития и дистанционного обучения" && this.loginedUser.position === "начальник отдела");

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

      if (this.isDesktop()) {
        if (this.layoutMode === 'overlay') {
          if (this.mobileMenuActive === true) {
            this.overlayMenuActive = true;
          }

          this.overlayMenuActive = !this.overlayMenuActive;
          this.mobileMenuActive = false;
        } else if (this.layoutMode === 'static') {
          this.staticMenuInactive = !this.staticMenuInactive;
        }
      } else {
        this.mobileMenuActive = !this.mobileMenuActive;
      }

      event.preventDefault();
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
  },
  computed: {
    ...mapState(["loginedUser"]),
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


  },
  created() {
    this.getLoginedUser();
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
  }
}
</script>

<style lang="scss">
.p-toast.p-toast-topright {
  z-index: 1000;
  top: 70px;
}
</style>
