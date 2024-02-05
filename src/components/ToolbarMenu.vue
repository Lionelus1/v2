<template>
  <div class="toolbar_menu card p-0 mb-3" ref="containerRef" :class="{ 'scrollable':!search || !filter,'toolbar_border': border }">
    <Button v-if="isScrollable && (!search || !filter)" :class="['scroll-left']" icon="pi pi-angle-left" @click="scrollLeft"/>
    <div :class="['justify-content-between', {'flex': search || filter},{'inline-flex': isScrollable && (!search || !filter)}]">
      <div class="toolbar_bars" v-if="(search || filter)">
        <Button
            class="p-button-text p-button-secondary"
            icon="pi pi-bars"
            @click="onClick($event)"
            aria-haspopup="true"
            aria-controls="overlay_menu" />
        <Menu ref="mobilemenu" id="overlay_menu" :model="actionList" :popup="true" />
      </div>
      <div :class="{'button_list': (search || filter)}">
        <template v-for="(i,index) of data" :key="i">
            <Button
                v-if="i.visible !== false && !i.right && !i.items"
                :class="['p-button-outlined']"
                :icon="i.icon"
                :label="label(i.label)"
                :disabled="i.disabled"
                @click="i.command(index)" />
          <template v-if="i.right">
              <Button
                  v-if="i.visible !== false && i.right"
                  :class="['p-button-outlined', 'float_right']"
                  :icon="i.icon"
                  :label="label(i.label)"
                  :disabled="i.disabled"
                  @click="i.command(index)" />
            </template>
          <Button
              v-if="i.items"
              :class="['p-button-outlined']"
              icon="pi pi-angle-down"
              iconPos="right"
              :label="label(i.label)"
              :disabled="i.disabled"
              @click="subMenu.toggle($event)"/>
          <Menu v-if="i.items" ref="subMenu" :model="i.items" :popup="true" />
        </template>
      </div>
      <div class="flex" v-if="search || filter">
        <Button v-if="filter"
            :style="{color: filtered ? '#2196f3':'#495057'}"
            class="p-button-text p-button-secondary"
            icon="fa-solid fa-filter"
            @click="filterClick($event)"/>
        <template v-if="search">
          <div class="vertical_line"></div>
          <span class="p-input-icon-left" >
                <i class="pi pi-search"/>
                <InputText
                    class="search_toolbar"
                    @keyup.enter="searchClick()"
                    v-model="searchModel"
                    :placeholder="$t('common.search')"
                /></span>
        </template>
      </div>
    </div>
    <Button v-if="isScrollable && (!search || !filter)" :class="['scroll-right']" icon="pi pi-angle-right" @click="scrollRight"/>
  </div>
</template>

<script setup>
import {computed, onBeforeUnmount, onMounted, ref} from "vue";

const props = defineProps(['data', 'notShowLabel','search','filter','filtered','border'])
const containerRef = ref(null);
const scrollStep = 50;
const isScrollable = ref(false);
const emit = defineEmits(['search','filter'])
const searchModel = ref()
const mobilemenu = ref()
const subMenu = ref()
const actionList = computed(() => props.data)
const onClick = (event) => {
  mobilemenu.value.toggle(event);
  emit('toggle')
}
const checkScroll = () => {
  const menuItemsRef = containerRef.value;
  isScrollable.value = menuItemsRef.scrollWidth > menuItemsRef.clientWidth;
};
const label = (label) => {
  return !props.notShowLabel ? label : ''
}

const scrollLeft = () => {
  containerRef.value.scrollLeft -= scrollStep;
};

const scrollRight = () => {
  containerRef.value.scrollLeft += scrollStep;
};
const searchClick = () => {
  emit('search', searchModel.value)
}
const filterClick = (event) => {
  emit('filter', event)
}

onMounted(() => {
  checkScroll();
  window.addEventListener("resize", checkScroll);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", checkScroll);
});
</script>

<style scoped>
.toolbar_menu {
  position: relative;
  white-space: nowrap;
  max-width: 100%;
  background: #fff;
  color: #495057;
  border-radius: 3px;

  .p-button.p-button-outlined {
    color: #495057;
    border: none;
  }

  .p-button.p-button-outlined:hover {
    background: #d0f1ff;
  }
}
.toolbar_border{
  border: 1px solid #dee2e6;
  box-shadow: none;
}
.toolbar_bars{
  display: none;
}
.float_right{
  float: right;
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


@media (max-width: 960px) {
  .toolbar_bars{
    display: block;
  }
  .button_list{
    display: none;
  }
  .scrollable {
    overflow-x: scroll;
  }
  .float_right{
    float: none;
  }

}
</style>