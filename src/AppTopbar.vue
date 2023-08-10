<template>
    <div class="layout-topbar no-print">
        <button class="p-link layout-menu-button" @click="onMenuToggle">
            <span class="pi pi-bars"></span>
        </button>
        <Button v-if="($route.name=='organizations') || ($route.name=='persons')" class="add_new p-button"
                icon="pi pi-plus"
                :label="$t('common.createNew')" @click="toggle" aria-haspopup="true" aria-controls="overlay_menu"/>
        <Menu id="overlay_menu" ref="menu" :model="pagemenu" :popup="true"/>
        <div class="layout-topbar-icons">
            <button v-tooltip.bottom="'Telegram Chat'" class="tg" @click="navigateToTelegram()">
                <i class="fa-brands fa-telegram"></i>
            </button>
            <button v-if="isShowGuide" v-tooltip.bottom="$t('guide.guide')" class="guide" @click="navigate()">
                <i class="pi pi-question-circle"></i>
            </button>
            <LanguageDropdown class="top_lang"/>
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
        return {
            isShowGuide: process.env.VUE_APP_SHOW_GUIDE === 'true'
        }
    },
    methods: {
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
        }
    }
}
</script>


<style lang="scss" scoped>
.layout-topbar .layout-topbar-icons {
  display: flex;
}

.add_new {
  margin-left: 20px;
  height: 27px;
  background-color: #e3f2fd;
  color: #495057;
}

.tg {
  border: none;
  cursor: pointer;
  background: transparent;
  font-size: 21px;
  margin-left: 0 !important;

  i {
    font-size: 20px;
    margin: 0 !important;
  }
}

.guide {
  border: none;
  cursor: pointer;
  background: transparent;
  font-size: 15px;
  margin-left: 5px !important;
  margin-right: 5px;

  i {
    margin: 0 !important;
  }
}

.top_lang {
  ::v-deep(.p-inputtext) {
    color: #fff !important;
  }
}

::v-deep(.p-dropdown .p-dropdown-trigger) {
  color: #fff !important;
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

@media (max-width: 425px) {
  .layout-topbar {
    padding: 1em;
  }
}
</style>
