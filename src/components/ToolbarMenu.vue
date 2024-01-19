<template>
<div class="toolbar_menu">
  <Button v-for="(i,index) of items" :key="i" class="p-button-outlined" :icon="i.icon" :label="i.label" :disabled="i.disabled" @click="i.command(index)"/>
  <i v-if="isMobile()" class="arrow_icon pi pi-angle-right"></i>
</div>
</template>

<script setup>
const props = defineProps(['items',])

const isMobile = () => {
  return window.innerWidth < 500;
}
</script>

<style scoped>

.toolbar_menu{
  position: relative;
  white-space: nowrap;
  max-width: 100%;
  //display: inline;
  background: #fff;
  color: #495057;
  border: 1px solid #dee2e6;
  border-radius: 3px;
  .p-button.p-button-outlined{
    color: #495057;
    border: none;

  }
  .p-button.p-button-outlined:hover{
    background: #d0f1ff;
  }
  .arrow_icon{
    pointer-events: none;
    position: absolute;
    right: 0;
    top: 0;
  }
}
@media (max-width: 500px) {
  .toolbar_menu{
    overflow-x: scroll;
  }
}
</style>