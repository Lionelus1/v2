<script setup>
import {ref} from "vue";

const props = defineProps(['item', 'notShowLabel'])
const subMenu = ref()
const label = (label) => {
  return !props.notShowLabel ? label : ''
}
</script>

<template>
  <Button
      v-if="item.items"
      :class="['p-button-outlined']"
      :icon="item.icon"
      :label="label(item.label)"
      :disabled="item.disabled"
      @click="subMenu.toggle($event)"/>
  <Menu v-if="item.items" ref="subMenu" :model="item.items" :popup="true" />
</template>

<style>
.toolbar_menu {
  position: relative;
  white-space: nowrap;
  max-width: 100%;
  background: #fff;
  color: #495057;
//border: 1px solid #dee2e6;
  border-radius: 3px;

  .p-button.p-button-outlined {
    color: #495057;
    border: none;
  }

  .p-button.p-button-outlined:hover {
    background: #d0f1ff;
  }
}
.vertical_line{
  margin: 5px 5px;
  padding: 5px 1px;
  border-right: 1px solid #ccc;
}

.search_toolbar{
  border: none;
}
.scroll-left,
.scroll-right {
  background: #fff;
  color: black;
  border: none;
  position: sticky;
  cursor: pointer;
  z-index: 1;
}

:deep(.scroll-right.p-button:enabled:hover) {
  background: #fff;
  color: black;
  box-shadow: none;
}

:deep(.scroll-left.p-button:enabled:hover) {
  background: #fff;
  color: black;
  box-shadow: none;
}

.scroll-left {
  left: 0;
}

.scroll-right {
  right: 0;
}

.scrollable {
  overflow-x: scroll;
}
</style>