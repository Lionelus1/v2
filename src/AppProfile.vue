<template>
<div class="layout-profile">
    <div>
        <img class="round" v-if="loginedUser.photo != null && loginedUser.photo !=''" :src="'data:image/jpeg;base64,' + loginedUser.photo " />
        <img class="round" v-else src="assets/layout/images/default-user.jpg" />
    </div>
    <button class="p-link layout-profile-link" @click="onClick">
        <span class="username">{{ loginedUser.name }}</span>
        <i class="pi pi-fw pi-cog"></i>
    </button>
    <transition name="layout-submenu-wrapper">
        <ul v-show="expanded">
            <li>
                <button @click="logOutFromSystem" class="p-link">
                    <i class="pi pi-fw pi-power-off"></i><span>{{ $t("common.logout") }}</span>
                </button>
            </li>
        </ul>
    </transition>
</div>
</template>

<script>
import {
    mapActions,
    mapState
} from "vuex";
export default {
    data() {
        return {
            expanded: false,
        };
    },
    methods: {
        ...mapActions(["logLout"]),
        onClick(event) {
            this.expanded = !this.expanded;
            event.preventDefault();
        },
        logOutFromSystem() {
            this.logLout();
        },
    },
    computed: {
        ...mapState(["loginedUser"]),
    },
};
</script>

<style scoped>
.round {
    border-radius: 100px;
    /* Радиус скругления */
    box-shadow: 0 0 0 3px #2196f3, 0 0 13px #333;
    /* Параметры теней */
}
</style>
