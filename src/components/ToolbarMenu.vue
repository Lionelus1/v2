<template>
  <div class="toolbar_menu" ref="containerRef" :class="{ 'scrollable': isScrollable && !search }">
    <Button v-if="isScrollable && !search" :class="['scroll-left']" icon="pi pi-angle-left" @click="scrollLeft"/>
    <div :class="['justify-content-between', {'flex': search},{'inline-flex': isScrollable && !search}]">
      <div v-if="search && isScrollable">
        <Button
            icon="pi pi-bars"
            @click="onClick($event)"
            aria-haspopup="true"
            aria-controls="overlay_menu" />
        <Menu ref="menu" id="overlay_menu" :model="actionList" :popup="true" />
      </div>
      <div class="" v-else>
        <template v-for="(i,index) of items" :key="i">
          <Button
              v-if="i.visible !== false"
              :class="['p-button-outlined']"
              :icon="i.icon"
              :label="label(i.label)"
              :disabled="i.disabled"
              @click="i.command(index)" />
        </template>
      </div>
      <div>
        <span class="p-input-icon-left" v-if="search">
                <i class="pi pi-search"/>
                <InputText
                    class="search_toolbar"
                    @keyup.enter="searchClick()"
                    v-model="searchModel"
                    :placeholder="$t('common.search')"
                />
    </span>
      </div>
    </div>
    <Button v-if="isScrollable && !search" :class="['scroll-right']" icon="pi pi-angle-right" @click="scrollRight"/>
  </div>
</template>

<script setup>
import {computed, onBeforeUnmount, onMounted, ref} from "vue";

const props = defineProps(['items', 'notShowLabel','search'])
const containerRef = ref(null);
const scrollStep = 50;
const isScrollable = ref(false);
const emit = defineEmits(['search'])
const searchModel = ref()
const menu = ref()
const actionList = computed(() => props.items)
const onClick = (event) => {
  menu.value.toggle(event);
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
  border: 1px solid #dee2e6;
  border-radius: 3px;

  .p-button.p-button-outlined {
    color: #495057;
    border: none;

  }

  .p-button.p-button-outlined:hover {
    background: #d0f1ff;
  }
}
.search_toolbar{
  border-bottom: none;
  border-top: none;
  border-right: none;
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