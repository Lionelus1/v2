<template>
  <template v-if="!visible && actionList.length > 1">
    <Button class="p-button-outlined p-button-sm" type="button" v-tooltip.bottom="showTooltip ? $t('web.actionID'): ''"
            :label="showLabel ? $t('web.actionID') : ''"
            icon="pi pi-chevron-down" iconPos="right"
            @click="onClick($event)" aria-haspopup="true" aria-controls="overlay_menu"  />
    <Menu ref="menu" id="overlay_menu" :model="actionList" :popup="true" />
  </template>
    <template v-else>
      <template v-for="(i,index) of actionList" :key="i">
        <Button v-if="i.visible !== false" :disabled="i.disabled" class="p-button-text p-1"  @click="onClick($event, index)" v-tooltip.bottom="i.label">
          <i :class="[i.icon, 'fa-xl']"></i>
        </Button>
      </template>
    </template>
</template>

<script setup>

import {computed, ref, watch} from "vue";

const props = defineProps(['items', 'showLabel', 'showTooltip'])
const emit = defineEmits(['toggle'])
const menu = ref()
const actionList = computed(() => props.items)

watch(() => props.items, (newItems) => {
  actionList.value = newItems
})
const onClick = (event, index = null) => {
    if (index !== null) {
      actionList.value[index].command(index)
    } else {
      menu.value.toggle(event);
    }
    emit('toggle')
}

const visibleCount = computed(() => {
  return actionList.value.filter(item => item.visible === undefined || item.visible).length;
})

const visible = computed(() => {
  return visibleCount.value === 1;
});

</script>

<style scoped>

</style>