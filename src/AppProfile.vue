<template>
  <div class="layout-profile">
    <div>
      <img src="assets/layout/images/profile.png" alt="" />
    </div>
    <button class="p-link layout-profile-link" @click="onClick">
      <span class="username">{{ loginedUser.name }}</span>
      <i class="pi pi-fw pi-cog"></i>
    </button>
    <transition name="layout-submenu-wrapper">
      <ul v-show="expanded">
        <li>
          <button @click="logOutFromSystem" class="p-link">
            <i class="pi pi-fw pi-power-off"></i
            ><span>{{ $t("common.logout") }}</span>
          </button>
        </li>
      </ul>
    </transition>
  </div>
</template>

<script>
import { mapActions, mapState } from "vuex";
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
</style>