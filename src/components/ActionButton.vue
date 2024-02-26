<template>
    <Button class="p-button-outlined p-button-sm" type="button" v-tooltip.bottom="showTooltip ? $t('web.actionID'): ''"
            :label="showLabel ? $t('web.actionID') : ''"
            icon="pi pi-chevron-down" iconPos="right"
            @click="onClick($event)" aria-haspopup="true" aria-controls="overlay_menu"  />
    <Menu ref="menu" id="overlay_menu" :model="actionList" :popup="true" />
</template>

<script setup>

import {computed, ref} from "vue";

const props = defineProps(['items', 'showLabel', 'showTooltip'])
const emit = defineEmits(['toggle'])
const menu = ref()
const actionList = computed(() => props.items)

const onClick = (event) => {
    menu.value.toggle(event);
    emit('toggle')
}

</script>

<style scoped>

</style>