<template>
  <Button label="Добавить мероприятие" icon="pi pi-plus" @click="openBasic"/>

  <Dialog header="Добавить мероприятие" v-model:visible="showWorkPlanEventModal" :style="{width: '450px'}"
          class="p-fluid">
    <div class="p-field">
      <label>Название мероприятия *</label>
      <InputText v-model="event_name" @input="nameInput" />
    </div>
    <div class="p-field">
      <label>Ответственные лица *</label>
      <FindUser v-model="selectedUsers" @add="userChange"></FindUser>
    </div>
    <div class="p-field">
      <label>Квартал *</label>
      <Dropdown v-model="quarter" :options="quarters" optionLabel="name" optionValue="id" placeholder="Выберите"
                @change="selectQuarter"/>
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
  props: ['data'],
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
          id: 1,
          name: 'I'
        },
        {
          id: 2,
          name: 'II'
        },
        {
          id: 3,
          name: 'III'
        },
        {
          id: 4,
          name: 'IV'
        },
        {
          id: 5,
          name: 'Весь год'
        }
      ],
      selectedUsers: null,
      parentData: null,
      parentId: null,
      formValid: [],
    }
  },
  mounted() {
    if (this.data)
      this.parentData = this.data;
  },
  created() {
    this.work_plan_id = parseInt(this.$route.params.id);
  },
  methods: {
    nameInput(event) {
      if (event.target.value) {
        this.formValid.push(true);
      }
    },
    userChange(event) {
      console.log(event)
      if (event.value && event.value.length > 0) {
        this.formValid.push(true);
      }
    },
    selectQuarter() {
      if (this.quarter) {
        this.formValid.push(true);
      }
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
        userIds.push(e.userID)
      });
      if (this.parentData) {
        this.parentId = parseInt(this.parentData.work_plan_event_id);
      } else {
        console.log("parent data is null")
      }
      axios.post(smartEnuApi + `/workPlan/addEvent`, {
        work_plan_id: this.work_plan_id,
        event_name: this.event_name,
        parent_id: this.parentId,
        quarter: this.quarter,
        result: this.result,
        resp_person_ids: userIds
      }, {headers: getHeader()}).then(res => {
        this.emitter.emit("workPlanEventIsAdded", true);
        this.$toast.add({severity: 'success', detail: 'Мероприятие успешно создан', life: 3000});
        this.showWorkPlanEventModal = false;
        this.clearModel();
      }).catch(error => {
        console.log(error)
      });
    },
    clearModel() {
      this.event_name = null;
      this.parentId = null;
      this.quarter = null;
      this.result = null;
      this.selectedUsers = null;
    }
  },
}
</script>
