<script setup>

import TitleBlock from "@/components/TitleBlock.vue";
import {useStore} from "vuex";
import {computed} from "vue";

const store = useStore()
const user = computed(() => store.state.loginedUser)
</script>

<template>
  <div class="col-12">
    <TitleBlock title="Мои финансы" />
    <div class="col-12 xl:col-4 md:col-12">
      <div class="card">
        <h3 class="font-bold">{{ user.fullName }}</h3>

      </div>
    </div>
    <div class="card">
      content...
    </div>
  </div>
</template>

<style scoped>

</style>