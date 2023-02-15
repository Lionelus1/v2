<template>
  <div v-if="showBackButton" @click="$router.back()" class="inline-block mr-3">
    <i class="fa-solid fa-arrow-left ml-2" style="font-size: 16px;cursor: pointer"></i>
  </div>
  <h3 class="inline-block p-0 mt-0 mb-3">{{ title }}</h3>
</template>

<script>
export default {
  name: "TitleBlock",
  props: ['title', 'showBackButton']
}
</script>

<style scoped>

</style>