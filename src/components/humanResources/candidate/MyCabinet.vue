<template>
    <div class="grid formgrid">
        <MyCabinetView  :readonly="false" customType="myAccount"/>
    </div>
</template>

<script setup>
    import MyCabinetView from "./MyCabinetView"
</script>