<template>
    <div class="layout-topbar no-print">
        <button class="p-link layout-menu-button" @click="onMenuToggle">
            <span class="pi pi-bars"></span>
        </button>
        <div class="layout-topbar-icons">
            <LanguageDropdown/>
        </div>
    </div>
</template>

<script>
    import LanguageDropdown from "../../LanguageDropdown";

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
        }
    }
</script>

<style scoped>
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

</style>
