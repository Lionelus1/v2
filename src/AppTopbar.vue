<template>
    <div class="layout-topbar no-print">
        <button class="p-link layout-menu-button" @click="onMenuToggle">
            <span class="pi pi-bars"></span>
        </button>
        <Button v-if="($route.name=='organizations') || ($route.name=='persons')" class="p-ml-5 p-button"
                style="height:27px;background-color: #e3f2fd;color: #495057;" icon="pi pi-plus"
                :label="$t('common.createNew')" @click="toggle" aria-haspopup="true" aria-controls="overlay_menu"/>
        <Menu id="overlay_menu" ref="menu" :model="pagemenu" :popup="true"/>
        <div class="layout-topbar-icons">
            <button v-tooltip.bottom="$t('guide.guide')" class="guide" @click="navigate()">
                <i class="pi pi-question-circle"></i>
            </button>
            <LanguageDropdown/>
        </div>
    </div>
</template>

<script>
    import LanguageDropdown from "./LanguageDropdown";

    export default {
        components: {LanguageDropdown},
        props: {
            pagemenu: null,
        },
        data() {
            return {}
        },
        methods: {
            toggle(event) {
                this.$refs.menu.toggle(event);
            },
            onMenuToggle(event) {
                this.$emit('menu-toggle', event);
            },
            navigate() {
               this.$router.push({name: 'MainGuide', params: {id: this.$route.path}});
            },
        }
    }
</script>


<style lang="scss" scoped>

    .guide{
        border: none;
        cursor: pointer;
        background: transparent;
        font-size: 15px;
        margin-left: 0;
        margin-right: 15px;
        i{
            margin: 0!important;
        }
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
        color: white;
    }
</style>
