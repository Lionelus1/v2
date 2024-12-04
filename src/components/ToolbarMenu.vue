<template>
  <div class="toolbar_menu card mb-3" ref="containerRef" :class="{ 'scrollable':!search || !filter || !analyze,'toolbar_border': border }">
    <Button v-if="isScrollable && (!search || !filter || !analyze)" :class="['scroll-left']" icon="pi pi-angle-left" @click="scrollLeft"/>
    <div :class="['justify-content-between', {'flex': search || filter || analyze},{'inline-flex': isScrollable && (!search || !filter || !analyze)}]">
      <div class="toolbar_bars" v-if="(search || filter || analyze)">
        <Button
            class="p-button-text p-button-secondary"
            icon="pi pi-bars"
            @click="onClick($event)"
            aria-haspopup="true"
            aria-controls="overlay_menu"/>
        <Menu ref="mobilemenu" id="overlay_menu" :model="actionList" :popup="true"/>
      </div>
      <div :class="{'button_list': (search || filter || analyze)}">
        <template v-for="(i,index) of data" :key="i">
          <Button
              v-if="i.visible !== false && !i.right && !i.items"
              :class="['p-button-outlined','toolbar_btn',
                {'button_green': i.color},
                {'button_blue': i.color === 'blue'},
                {'button_purple': i.color === 'purple'},
                {'button_yellow': i.color === 'yellow'},
                {'button_red': i.color === 'red'}
                ]"
              :icon="i.icon"
              :label="label(i.label)"
              :disabled="i.disabled"
              @click="i.command(index)"/>
          <template v-if="i.right">
            <Button
                v-if="i.visible !== false && i.right"
                :class="['p-button-outlined', 'float_right']"
                :icon="i.icon"
                :label="label(i.label)"
                :disabled="i.disabled"
                @click="i.command(index)"/>
          </template>
          <Button
              v-if="i && i.items"
              :class="['p-button-outlined']"
              icon="pi pi-angle-down"
              iconPos="right"
              :label="label(i.label)"
              :disabled="i.disabled"
              @click="toggleSubMenu($event, index)"/>
          <Menu v-if="i?.items" :ref="(el) => (subMenu[index] = el)" :model="i?.items" :popup="true"/>
        </template>
      </div>
      <div class="flex" v-if="search || filter || analyze">
        <Button v-if="filter"
                :label="filterLabel ? $t('common.filter') : ''"
                :style="{color: filtered ? '#2196f3':'#495057', padding: '4px'}"
                class="p-button-text p-button-secondary"
                icon="fa-solid fa-filter"
                @click="filterClick($event)"/>
               
        <template v-if="analyze">
          <Button 
              class="p-button-text p-button-primary hover:bg-blue-700 hover:text-white focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 ease-in-out"
              icon="fa-solid fa-chart-pie"
              :title="$t('workPlan.analyzer.analyzerButtonTitle')"
              @click="analyzeClick($event)"/>
        </template>
        <template v-if="rightBtn">
          <Button
              v-tooltip.bottom="$t('common.specialNeedsJobs')"
              :class="['p-button-outlined', 'float_right']"
              icon="fa-solid fa-wheelchair"
              @click="rightBtnClick($event)"/>
        </template>
        <template v-if="search">
          <div class="vertical_line"></div>
          <IconField iconPosition="left">
            <InputIcon class="pi pi-search"></InputIcon>
            <InputText type="search"
                       class="search_toolbar"
                       @keyup.enter="searchClick()"
                       @search="searchClick()"
                       v-model="searchModel"
                       :placeholder="$t('common.search')"/>
          </IconField>
        </template>
      </div>
    </div>
    <Button v-if="isScrollable && (!search || !filter || !analyze)" :class="['scroll-right']" icon="pi pi-angle-right" @click="scrollRight"/>
  </div>
</template>

<script setup>
import {computed, onBeforeUnmount, onMounted, ref} from "vue";

const props = defineProps(['data', 'notShowLabel', 'search', 'filter', 'filtered', 'border', 'filterLabel', 'change', 'rightBtn', 'analyze'])
const containerRef = ref(null);
const scrollStep = 50;
const isScrollable = ref(false);
const emit = defineEmits(['search', 'filter', 'analyze'])
const searchModel = defineModel('searchModel')
const mobilemenu = ref()
const subMenu = ref({})
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
const analyzeClick = (event) => {
  emit('analyze', event)
}

const rightBtnClick = (event) => {
  emit('rightBtn', event)
}
const toggleSubMenu = (event, index) => {
  subMenu?.value[index].toggle(event)
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
  padding: 5px !important;

  .p-button.p-button-outlined {
    color: #495057;
    border: none;
  }

  .p-button.p-button-outlined:hover {
    background: #d0f1ff;
  }
}

.toolbar_border {
  border: 1px solid #dee2e6;
  box-shadow: none;
}

.toolbar_bars {
  display: none;
}

.float_right {
  float: right;
}

.vertical_line {
  margin: 5px 5px;
  padding: 5px 1px;
  border-right: 1px solid #ccc;
}

.search_toolbar {
  border: none;
}

.scroll-left,
.scroll-right {
  background: #fff;
  color: black;
  box-shadow: 0 0 0 5px #fff;
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

.toolbar_btn {
  margin-right: 5px;
}

.button_green {
  color: green !important;
  background: rgba(0, 128, 0, 0.15);
}

.button_green:hover {
  background: rgba(0, 128, 0, 0.30) !important;
}

.button_blue {
  color: #0d89ec !important;
  background: rgba(13, 137, 236, 0.15);
}

.button_blue:hover {
  background: rgba(13, 137, 236, 0.30) !important;
}

.button_purple {
  color: purple !important;
  background: rgba(128, 0, 128, 0.15);
}

.button_purple:hover {
  background: rgba(128, 0, 128, 0.30) !important;
}

.button_yellow {
  color: #000 !important;
  background: rgba(251, 192, 45, 0.70);
}

.button_yellow:hover {
  background: rgba(251, 192, 45, 0.90) !important;
}

.button_red {
  color: red !important;
  background: rgba(255, 0, 0, 0.15);
}

.button_red:hover {
  background: rgba(255, 0, 0, 0.30) !important;
}

@media (max-width: 960px) {
  .toolbar_bars {
    display: block;
  }

  .button_list {
    display: none;
  }

  .scrollable {
    overflow-x: scroll;
  }

  .float_right {
    float: none;
  }

}
</style>
