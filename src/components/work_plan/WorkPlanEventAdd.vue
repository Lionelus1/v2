<template>
  <div class="card">
    <Button label="Добавить мероприятие" icon="pi pi-plus" @click="openBasic"/>
  </div>

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
    <div class="p-field">
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
import FindUser from "@/helpers/FindUser";
import axios from "axios";
import {getHeader, smartEnuApi} from "@/config/config";

export default {
  name: 'WorkPlanEventAdd',
  components: {FindUser},
  data() {
    return {
      showWorkPlanEventModal: false,
      work_plan_id: null,
      event_name: null,
      resp_person_id: null,
      quarter: null,
      result: null,
      comment: null,
      quarters: [
        {
          id: 0,
          name: 'I'
        },
        {
          id: 1,
          name: 'II'
        },
        {
          id: 2,
          name: 'III'
        },
        {
          id: 3,
          name: 'IV'
        }
      ],
      selectedUsers: null
    }
  },
  created() {
    this.work_plan_id = parseInt(this.$route.params.id);
  },
  methods: {
    selectQuarter(event) {
      console.log(event)
    },
    openBasic() {
      this.showWorkPlanEventModal = true;
    },
    closeBasic() {
      this.showWorkPlanEventModal = false;
    },
    createEvent() {
      let userIds = [];
      this.selectedUsers.forEach(e => {
        userIds.push(e.id)
      });
      console.log(userIds)
      axios.post(smartEnuApi + `/workPlan/addEvent`, {
        work_plan_id: this.work_plan_id,
        event_name: this.event_name,
        quarter: this.quarter,
        result: this.result,
        resp_person_ids: userIds
      }, {headers: getHeader()}).then(res => {
        this.emitter.emit("workPlanEventIsAdded", true);
        this.$toast.add({severity: 'info', summary: 'Success', detail: 'Мероприятие успешно создан', life: 3000});
        this.showWorkPlanEventModal = false;
      }).catch(error => {
        console.log(error)
      });
    }
  }
}
</script>