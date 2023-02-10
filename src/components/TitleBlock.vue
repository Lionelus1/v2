<template>
  <div v-if="showBackButton" @click="$router.back()" class="p-d-inline-block p-mr-3">
    <i class="fa-solid fa-arrow-left p-ml-2" style="font-size: 16px;cursor: pointer"></i>
  </div>
  <h3 class="p-d-inline-block p-p-0 p-mt-0 p-mb-3">{{ title }}</h3>
</template>

<script>
export default {
  name: "TitleBlock",
  props: ['title', 'showBackButton']
}
</script>

<style scoped>

</style>