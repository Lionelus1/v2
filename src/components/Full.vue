<template>
  <div :class="containerClass" @click="onWrapperClick">
    <ConfirmDialog></ConfirmDialog>
    <AppTopBar @menu-toggle="onMenuToggle" v-model:pagemenu="localpagemenu"/>

    <transition name="layout-sidebar">
      <div :class="sidebarClass" @click="onSidebarClick" v-show="isSidebarVisible()">
        <div class="layout-logo">
          <router-link to="/">
            <h1>SMART ENU</h1>
            <!-- <img alt="Logo" :src="logo" /> -->
          </router-link>
        </div>
        <AppProfile/>
        <AppMenu :model="globalMenu"  @menuitem-click="onMenuItemClick"/>
      </div>
    </transition>
    <div class="layout-main p-pr-0 p-pl-0">
      <router-view v-model:pagemenu="localpagemenu"/>
    </div>
    <AppConfig :layoutMode="layoutMode" :layoutColorMode="layoutColorMode" @layout-change="onLayoutChange"
               @layout-color-change="onLayoutColorChange"/>
    <AppFooter/>
  <Toast />

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
import { throwStatement } from '@babel/types';

export default {
  setup() {
    useRoute();
  },

  props : {
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
    initMenu() {
      return [

        //  {
        //    label: this.$t('common.administration'), icon: 'pi pi-fw pi-shield',
        //    items: [
        //      {
        //        label: this.$t('hr.vacancies'),
        //        icon: 'pi pi-fw pi-user-plus',
        //        to: '/human-resources/vacancies'
        //      },
        //    ]ß
//
        //  },
        {
          label: this.$t('common.documents'), icon: 'pi pi-fw pi-folder',
          items: [
            {label: this.$t('contracts.template'), icon: 'pi pi-fw pi-book', to: '/documents/doctemplate',
              visible: !this.findRole("student")
            },
            {label: this.$t('contracts.title'), icon: 'pi pi-fw pi-copy', to: '/documents/contracts'},
            {
              label: this.$t('smartenu.catalogNormDoc'), icon: 'pi pi-fw pi-folder', to: '/documents/catalog/normdoc'
            },
            {
              label: this.$t('educomplex.title'), icon: 'pi pi-fw pi-folder', to: '/documents/catalog/educomplex'
            },
          ]

        },
        {
          label: this.$t('common.administration'), icon: 'pi pi-fw pi-shield',
          items: [
            {
              label: this.$t('hr.vacancies'),
              icon: 'pi pi-fw pi-user-plus',
              to: '/human-resources/vacancies',
              visible: this.isVacancyRightsValidity()
            },
            {
              label: this.$t('common.cafedra'),
              icon: 'pi pi-fw pi-briefcase',
              to: '/cafedra',
              visible: this.findRole("dephead") || this.findRole("practice_responsible")
            },
          ]
        },
        {
          label: this.$t('common.contragents'), icon: 'pi pi-fw pi-users',
          visible: !this.findRole("student"),

          items: [
            {label: this.$t('common.organizations'), icon: 'pi pi-fw pi-home', to: '/contragent/organizations'},
            //{label: 'Банктер', icon: 'pi pi-fw pi-money-bill', to: '/contragent/banks'},
            // {
            //   label: 'Жеке тұлғалар',
            //   icon: 'pi pi-fw pi-user',
            //   to: '/contragent/persons/' + Enum.PersonType.IndividualEntrepreneur
            // },
            {
              label: this.$t('common.personal'),
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
              to: '/newscategories/cattable'
            },
            {label: this.$t('smartenu.newsList'), icon: 'pi pi-fw pi-money-bill', to: '/news'},
          ]
        },

        {
          label: this.$t('smartenu.eventsTitle'), icon: 'pi pi-fw pi-folder', to: '/events'
        },


        {
          label: this.$t('vaccination.title'), icon: 'pi pi-fw pi-check-circle', to: '/smartenu/vaccination'
        },
        // {
        //   label:  this.$t('faq.title'), icon: 'pi pi-fw pi-question-circle', to: '/faq/faqmain'
        // },
        {
          label:  this.$t('publicReception.title'), icon: 'pi pi-fw pi-question-circle', to: '/reception'
        },
        {
          label:  this.$t('dissertation.title'), icon: 'pi pi-fw pi-book',
          items: [
            {
              label:  this.$t('dissertation.council.list'), icon: 'pi pi-fw pi-list', to: '/dissertation', visible : this.isDissertationAdmin() || this.findRole("dissertation_council_secretary")
            },
            {
              label:  this.$t('dissertation.doctoralCard'), icon: 'pi pi-fw pi-users', to: '/dissertation/doctorals', visible : this.isRoleGroupMember("dissertation_council") ||  this.isDissertationAdmin()
            }
          ]

        },
        {
          label: this.$t('workPlan.plans'), icon: 'pi pi-fw pi-folder', to: '/work-plan'
        },
        {
          label: this.$t('common.forStudentsAndGraduates'), icon: 'pi pi-fw pi-users',
          items: [
            {
              label: this.$t('hr.vacancies'),
              icon: 'pi pi-fw pi-user-plus',
              to: '/human-resources/career/vacancies'
            },
          ]
        },
        //  {
//
        //         label: this.$t('common.forStudentsAndGraduates'), icon: 'pi pi-fw pi-users',
        //         items: [
        //           {
        //             label: this.$t('hr.vacancies'),
        //             icon: 'pi pi-fw pi-user-plus',
        //             to: '/human-resources/public/vacancies'
        //           },
        //         ]
        //       },

        {
          label: this.$t('hr.vacancies'),
          icon: 'pi pi-fw pi-user-plus',
          to: '/human-resources/public/vacancies'
        },

        {
          label: this.$t('queue.title'), icon: 'pi pi-fw pi-users ',
          items:[
            {
              label:  this.$t('queue.title'), icon: 'pi pi-fw pi-plus-circle', to:'/queue'
            },

            //  {
            //   label:  this.$t('queue.addService'), icon: 'pi pi-fw pi-th-large', to:'/queueCategories'
            //  },
            // {
            //   label:  this.$t('queue.secretary'), icon: 'pi pi-fw pi-user-edit', to:'/queueService'
            // },

          ]

        },
      ]
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
    }

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
</style>
