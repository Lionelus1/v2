<template>
  <div class="layout-profile">
    <div>
      <img class="round" v-if="loginedUser.photo != null && loginedUser.photo !=''"
           :src="'data:image/jpeg;base64,' + loginedUser.photo "/>
      <img class="round" v-else src="assets/layout/images/default-user.jpg"/>
    </div>
    <button class="p-link layout-profile-link align-items-center px-3 justify-content-between" @click="onClick">
      <span class="pl-4">
        <i class="fa-regular fa-address-card mr-2"></i>
      <span class="username" v-if="loginedUser && loginedUser.userID > 0">{{ getFullname(loginedUser) }}</span>
      <span class="username" v-else>{{ $t("common.unknownUser") }}</span>
      </span>
      <i class="pi pi-fw pi-angle-down"></i>
    </button>
    <transition name="layout-submenu-wrapper">
      <ul v-if="loginedUser && loginedUser.userID > 0" v-show="expanded">
<!--        <li v-if="findRole(loginedUser, 'student')">-->
<!--        <li>-->
<!--          <button @click="navigateToFinance" class="p-link">-->
<!--            <i class="fa-solid fa-wallet"></i><span>Мои финансы</span>-->
<!--          </button>-->
<!--        </li>-->
        <li v-if="loginedUser && loginedUser.mainPosition && loginedUser.mainPosition.organization && loginedUser.mainPosition.organization.id === 1">
          <button @click="sVerify = true" class="p-link">
            <i class="pi pi-fw pi-verified"></i><span>{{ $t("common.verify") }}</span>
          </button>
        </li>
        <li>
          <button @click="myResume"  class="p-link">
            <i :class="{active: activeItem === 'myResume'}" class="pi pi-fw pi-id-card"></i><span :class="{active: activeItem === 'myResume'}">{{ $t("common.cabinet") }}</span>
          </button>
        </li>
        <li>
          <button @click="changeRole" class="p-link">
            <i  class="fa-solid fa-user-shield"></i><span >{{ $t("positions.menuTitle") }}</span>
          </button>
        </li>
        <li v-if="loginedUser && loginedUser.mainPosition && loginedUser.mainPosition.organization && loginedUser.mainPosition.organization.id === 1">
          <button @click="myRef" class="p-link">
            <i :class="{ active: activeItem === 'myRef' }" class="pi pi-fw pi-book"></i><span :class="{active: activeItem === 'myRef'}" >{{ $t("ref.myRefs") }}</span>
          </button>
        </li>
        <li v-if="!this.findRole(null, 'student')">
          <button @click="qr" class="p-link">
            <i :class="{active: activeItem === 'qr'}" class="pi pi-fw pi-qrcode"></i><span :class="{active: activeItem === 'qr'}" >{{ $t("common.qrGenerator") }}</span>
          </button>
        </li>
        <li>
          <button @click="myFinances" class="p-link">
            <i :class="{active: activeItem === 'categories-finances'}" class="pi pi-wallet"></i><span :class="{active: activeItem === 'categories-finances'}" >{{ $t("common.myFinances") }}</span>
          </button>
        </li>
        <li>
          <button @click="logOutFromSystem" class="p-link">
            <i class="pi pi-fw pi-power-off"></i><span>{{ $t("common.logout") }}</span>
          </button>
        </li>
      </ul>
      <ul v-else v-show="expanded">
        <li>
          <button @click="login" class="p-link">
            <i class="fa-solid fa-arrow-right-to-bracket"></i><span>{{ $t("common.login") }}</span>
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
import {mapActions, mapState} from "vuex";

import {findRole} from "@/config/config";

import DocSignatureVerification from "./components/DocSignatureVerification";
import PositionChangeDialog from './components/PositionChangeDialog.vue';

export default {
  components: {DocSignatureVerification, PositionChangeDialog},


  data() {
    return {
      localActiveItem: this.activeItem || localStorage.getItem('activeItem') || null,
      expanded: false,
      sVerify: false,
      findRole: findRole,
    };
  },
  methods: {
    ...mapActions(['updateParentVariable']),
    ...mapActions(["logLout"]),
    onClick(event) {
      this.expanded = !this.expanded;
      event.preventDefault();
    },
    clearActiveItem() {
      this.$emit('clearActiveItem');
    },
    logOutFromSystem() {
      this.updateParentVariable(null);
      localStorage.removeItem('activeItem');
      this.logLout();
    },
    myResume() {
      this.updateParentVariable('myResume');
      localStorage.setItem('activeItem', 'myResume');
      this.$router.push({path: "/cabinet"})
    },
    myRef() {
      this.updateParentVariable('myRef');
      localStorage.setItem('activeItem', 'myRef');
      this.$router.push({path: "/references"})
    },
    signVerify() {
      this.$router.push({path: "/sign-verify"})
    },
    qr() {
      this.updateParentVariable('qr');
      localStorage.setItem('activeItem', 'qr');
      this.$router.push({path: "/qr"})
    },
    myFinances(){
      this.updateParentVariable('categories-finances');
      localStorage.setItem('activeItem', 'categories-finances');
      this.$router.push({path: "/categories-finances"})
    },
    changeRole() {
      this.$refs.positionChangeDialog.show();
    },
    login() {
      this.$router.push({path: "/login"})
    },
    getFullname(user) {
      return user.thirdName + ' ' + user.firstName
    },
    navigateToFinance() {
      this.$router.push({name: "Finance"})
    }
  },
  computed: {
    ...mapState(['activeItem']),
    ...mapState(["loginedUser"]),
  },
  created() {
  if (!this.activeItem) {
    this.activeItem = this.localActiveItem;
  }
}
};


</script>

<style scoped>
.active{
  color: #568fed;;
  transition: 0.5s;
}
.p-link:focus {
  box-shadow: none;
}
</style>
