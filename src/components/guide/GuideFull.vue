<template>
    <div :class="containerClass" @click="onWrapperClick">
        <GuideTopBar @menu-toggle="onMenuToggle" v-model:pagemenu="localpagemenu"/>

        <transition name="layout-sidebar">
            <div :class="sidebarClass" @click="onSidebarClick" v-show="isSidebarVisible()">
                <div class="layout-logo">
                    <router-link to="/">
                        <h1>SMART ENU</h1>
                    </router-link>
                    <AddGuide/>
                    <AppMenu :model="globalMenu" @menuitem-click="onMenuItemClick"/>
                </div>
            </div>
        </transition>
        <div class="layout-main p-pr-0 p-pl-0">
            <div class="p-col-12">
                <div class="card">
                    <div class="title">Шаблоны документов</div>
                </div>
                <router-view v-model:pagemenu="localpagemenu"/>
            </div>
        </div>
        <AppFooter/>
    </div>
</template>

<script>
    import {useRoute} from "vue-router"
    import GuideTopBar from "./GuideTopBar";
    import AddGuide from "./AddGuide";
    import AppFooter from '../../AppFooter.vue';
    import AppMenu from "../../AppMenu";

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
            initMenu() {
                return [
                    {
                        label: this.$t('common.documents'), icon: 'pi pi-fw pi-folder',
                        items: [
                            {
                                label: this.$t('contracts.template'), icon: 'pi pi-fw pi-book', to: '/main-guide',
                            },
                            {label: this.$t('contracts.title'), icon: 'pi pi-fw pi-copy', to: '/documents/contracts'},
                            {
                                label: this.$t('smartenu.catalogNormDoc'),
                                icon: 'pi pi-fw pi-folder',
                                to: '/documents/catalog/normdoc'
                            },
                            {
                                label: this.$t('educomplex.title'),
                                icon: 'pi pi-fw pi-folder',
                                to: '/documents/catalog/educomplex'
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
                            },
                            {
                                label: this.$t('common.cafedra'),
                                icon: 'pi pi-fw pi-briefcase',
                                to: '/cafedra',
                            },
                        ]
                    },

                ]
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
                    'layout-sidebar-light': 'light'
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
            'AppMenu': AppMenu,
            'AppFooter': AppFooter,
        }
    }
</script>

<style lang="scss" scoped>
    .title {
        font-size: 20px;
        font-weight: 500;
    }

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
