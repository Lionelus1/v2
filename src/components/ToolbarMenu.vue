<template>
  <div class="toolbar_menu" ref="containerRef" :class="{ 'scrollable': isScrollable }">
    <Button v-if="isScrollable" :class="['scroll-left', {'p-button-lg': isScrollable}]" icon="pi pi-angle-left" @click="scrollLeft"/>
    <div class="button-scroll-content" >
      <Button v-for="(i,index) of items" :key="i" :class="['p-button-outlined', {'p-button-lg': isScrollable}]" :icon="i.icon" :label="label(i.label)" :disabled="i.disabled" @click="i.command(index)"/>
    </div>
    <Button v-if="isScrollable" :class="['scroll-right', {'p-button-lg': isScrollable}]" icon="pi pi-angle-right" @click="scrollRight"/>
  </div>
</template>

<script setup>
import {onBeforeUnmount, onMounted, ref} from "vue";

const props = defineProps(['items', 'notShowLabel'])
const containerRef = ref(null);
const scrollStep = 50;
const isScrollable = ref(false);

const checkScroll = () => {
  const menuItemsRef = containerRef.value;
  isScrollable.value = menuItemsRef.scrollWidth > menuItemsRef.clientWidth;
};
const label = (label) =>{
  return !props.notShowLabel? label: ''
}

const scrollLeft = () => {
  containerRef.value.scrollLeft -= scrollStep;
};

const scrollRight = () => {
  containerRef.value.scrollLeft += scrollStep;
};

onMounted(() => {
  checkScroll();
  window.addEventListener("resize", checkScroll);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", checkScroll);
});
</script>

<style scoped>
.toolbar_menu{
  position: relative;
  white-space: nowrap;
  max-width: 100%;
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
}
.button-scroll-content {
  display: inline-block;
}

.scroll-left,
.scroll-right {
  background: rgba(0, 0, 0, 0.40);
  border: none;
  position: sticky;
  cursor: pointer;
  z-index: 1;
}

:deep(.scroll-right.p-button:enabled:hover){
  background: rgba(0, 0, 0, 0.55);
  box-shadow: none;
}
:deep(.scroll-left.p-button:enabled:hover){
  background: rgba(0, 0, 0, 0.55);
  box-shadow: none;
}
.scroll-left {
  left: 0;
}

.scroll-right {
  right: 0;
}
.scrollable{
  overflow-x: scroll;
}
</style>