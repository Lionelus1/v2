<template>
  <div class="flex align-items-center mb-3">
    <div v-if="showBackButton" @click="$router.back()" class="mr-3">
      <i class="fa-solid fa-arrow-left ml-2" style="font-size: 16px;cursor: pointer"></i>
    </div>
    <h3 class="p-0 m-0">{{ title }}</h3>
  </div>
</template>

<script>
export default {
  name: "TitleBlock",
  props: ['title', 'showBackButton']
}
</script>

<style scoped>

</style>