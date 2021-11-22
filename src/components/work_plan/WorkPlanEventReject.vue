<template>
  <Button label="Завершить" icon="pi pi-times" @click="openBasic" class="p-button p-button-danger p-ml-2"/>

  <Dialog header="Добавить мероприятие" v-model:visible="showWorkPlanEventModal" :style="{width: '450px'}"
          class="p-fluid">
    <div class="p-field">
      <label>Название мероприятия</label>
      <InputText v-model="event_name"/>
    </div>
    <div class="p-field">
      <label>Ответственные лица</label>
      <FindUser v-model="selectedUsers"></FindUser>
    </div>
    <div class="p-field" v-if="!parentData">
      <label>Квартал</label>
      <Dropdown v-model="quarter" :options="quarters" optionLabel="name" optionValue="id" placeholder="Выберите"
                @select="selectQuarter"/>
    </div>
    <div class="p-field">
      <label>Результат</label>
      <Textarea v-model="result" rows="3" style="resize: vertical"/>
    </div>
    <template #footer>
      <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button-rounded p-button-danger"
              @click="closeBasic"/>
      <Button :label="$t('common.add')" icon="pi pi-check" class="p-button-rounded p-button-success p-mr-2"
              @click="createEvent"/>
    </template>
  </Dialog>
</template>

<script>
export default {
  name: "WorkPlanEventReject"
}
</script>

<style scoped>

</style>