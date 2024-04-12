<template>
    <div :class="containerClass" @click="onWrapperClick">
        <ConfirmDialog></ConfirmDialog>
        <Toast/>
        <GuideTopBar @menu-toggle="onMenuToggle" v-model:pagemenu="localpagemenu"/>

        <transition name="layout-sidebar">
            <div :class="sidebarClass" @click="onSidebarClick" v-show="isSidebarVisible()">
                <div class="layout-logo">
                    <router-link to="/">
                        <h3>SMART ENU</h3>
                    </router-link>
                    <AddGuide/>
                    <MenuGuide/>
                </div>
            </div>
        </transition>
        <div class="layout-main guide_sidebar">
            <div class="col-12">
                <router-view v-model:pagemenu="localpagemenu"/>
            </div>
        </div>
        <AppFooter class="guide_sidebar"/>
    </div>
</template>

<script>
    import {useRoute} from "vue-router"
    import GuideTopBar from "./GuideTopBar";
    import AddGuide from "./AddGuide";
    import AppFooter from '../../AppFooter.vue';
    import MenuGuide from './MenuGuide.vue';

    export default {
        name: "Guide",
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
                    'layout-sidebar-light': 'light'
                }];
            },
            logo() {
                return (this.layoutColorMode === 'dark') ? "assets/layout/images/logo-white.svg" : "assets/layout/images/logo.svg";
            },
        },
        beforeUpdate() {
            if (this.mobileMenuActive)
                this.addClass(document.body, 'body-overflow-hidden');
            else
                this.removeClass(document.body, 'body-overflow-hidden');
        },
        components: {
            'AddGuide': AddGuide,
            'GuideTopBar': GuideTopBar,
            'MenuGuide': MenuGuide,
            'AppFooter': AppFooter,
        }
    }
</script>

<style lang="scss" scoped>

    .p-toast.p-toast-topright {
        z-index: 1000;
        top: 70px;
    }
    .layout-logo{
        margin: 0;
        h3{
            margin: 10px 0;
        }
    }
    .guide_sidebar{
      margin-left: 250px!important;
    }
    @media (max-width: 1026px) {
      .guide_sidebar{
        margin-left: 0!important;
      }
    }

</style>
