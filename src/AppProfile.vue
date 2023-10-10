<template>
  <div class="layout-profile">
    <div>
      <img class="round" v-if="loginedUser.photo != null && loginedUser.photo !=''"
           :src="'data:image/jpeg;base64,' + loginedUser.photo "/>
      <img class="round" v-else src="assets/layout/images/default-user.jpg"/>
    </div>
    <button class="p-link layout-profile-link" @click="onClick">
      <span class="username">{{ loginedUser.fullName }}</span>
      <i class="pi pi-fw pi-cog"></i>
    </button>
    <transition name="layout-submenu-wrapper">
      <ul v-show="expanded">
        <li v-if="loginedUser && loginedUser.organization && loginedUser.organization.id === 1">
          <button @click="sVerify = true" class="p-link">
            <i class="pi pi-fw pi-verified"></i><span>{{ $t("common.verify") }}</span>
          </button>
        </li>
        <li>
          <button @click="myResume" class="p-link">
            <i class="pi pi-fw pi-id-card"></i><span>{{ $t("common.cabinet") }}</span>
          </button>
        </li>
        <li>
          <button @click="changeRole" class="p-link">
            <i class="fa-solid fa-user-shield"></i><span>{{ $t("positions.menuTitle") }}</span>
          </button>
        </li>
        <li v-if="loginedUser && loginedUser.organization && loginedUser.organization.id === 1">
          <button @click="myRef" class="p-link">
            <i class="pi pi-fw pi-book"></i><span>{{ $t("ref.myRefs") }}</span>
          </button>
        </li>
          <li v-if="!this.findRole(null, 'student')">
              <button @click="qr" class="p-link">
                  <i class="pi pi-fw pi-qrcode"></i><span>{{ $t("common.qrGenerator") }}</span>
              </button>
          </li>
        <li>
          <button @click="logOutFromSystem" class="p-link">
            <i class="pi pi-fw pi-power-off"></i><span>{{ $t("common.logout") }}</span>
          </button>
        </li>
      </ul>
    </transition>
  </div>
  <Sidebar
      v-model:visible="sVerify"
      position="right"
      class="p-sidebar-lg"
      style="overflow-y: scroll"
  >
    <DocSignatureVerification></DocSignatureVerification>
  </Sidebar>
  <PositionChangeDialog ref="positionChangeDialog"></PositionChangeDialog>
</template>

<script>
import {
  mapActions,
  mapState
} from "vuex";

import {findRole} from "@/config/config";

import DocSignatureVerification from "./components/DocSignatureVerification";
import PositionChangeDialog from './components/PositionChangeDialog.vue';

export default {
  components: {DocSignatureVerification, PositionChangeDialog},
  data() {
    return {
      expanded: false,
      sVerify: false,
      findRole: findRole,
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
    myResume() {
      this.$router.push({path: "/cabinet"})
    },
    myRef() {
      this.$router.push({path: "/references"})
    },
    signVerify() {
      this.$router.push({path: "/sign-verify"})
    },
    qr() {
      this.$router.push({path: "/qr"})
    },
    changeRole() {
      this.$refs.positionChangeDialog.show();
    }
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
.p-link:focus {
    box-shadow: none;
}
</style>
