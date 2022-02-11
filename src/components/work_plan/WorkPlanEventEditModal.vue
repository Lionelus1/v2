<template>
  <Button label="Редактировать" icon="pi pi-pencil" class="p-button-info p-ml-2" @click="openBasic"/>

  <Dialog header="Добавить мероприятие" v-model:visible="showWorkPlanEventEditModal" :style="{width: '450px'}"
          class="p-fluid">
    <div class="p-field">
      <label>Название мероприятия</label>
      <InputText v-model="editData.event_name"/>
      <small class="p-error" v-if="submitted && formValid.event_name">Введите название мероприятия</small>
    </div>
    <div class="p-field">
      <label>Ответственные лица</label>
      <FindUser v-model="selectedUsers" :editMode="true"></FindUser>
      <small class="p-error" v-if="submitted && formValid.users">Выберите ответственных лиц</small>
    </div>
    <div class="p-field" v-if="!editData.parent_id">
      <label>Квартал</label>
      <Dropdown v-model="editData.quarter" :options="quarters" optionLabel="name" optionValue="id"
                placeholder="Выберите"/>
      <small class="p-error" v-if="submitted && formValid.quarter">Выберите квартал</small>
    </div>
    <div class="p-field">
      <label>Результат</label>
      <Textarea v-model="editData.event_result" rows="3" style="resize: vertical"/>
    </div>
    <template #footer>
      <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button-rounded p-button-danger"
              @click="closeBasic"/>
      <Button :label="$t('common.save')" icon="pi pi-check" class="p-button-rounded p-button-success p-mr-2"
              @click="edit"/>
    </template>
  </Dialog>
</template>

<script>
import FindUser from "@/helpers/FindUser";
import axios from "axios";
import {getHeader, smartEnuApi} from "@/config/config";

export default {
  name: "WorkPlanEventEditModal",
  components: {FindUser},
  props: ['event'],
  data() {
    return {
      showWorkPlanEventEditModal: false,
      editData: JSON.parse(JSON.stringify(this.event)),
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
      parentData: null,
      selectedUsers: [],
      formValid: {
        event_name: false,
        users: false,
        quarter: false
      },
      submitted: false,
    }
  },
  created() {
    console.log(this.data)
    this.editData.quarter = parseInt(this.editData.quarter.String)
    this.editData.user.forEach(e => {
      e.userID = e.id;
      this.selectedUsers.push(e);
    })
    this.selectedUsers = this.editData.user;
    console.log(this.editData)
  },
  methods: {
    openBasic() {
      this.showWorkPlanEventEditModal = true;
    },
    closeBasic() {
      this.showWorkPlanEventEditModal = false;
    },
    edit() {
      let userIds = [];
      this.selectedUsers.forEach(e => {
        userIds.push(e.userID)
      });
      this.editData.resp_person_ids = userIds;
      axios.post(smartEnuApi + `/workPlan/editEvent`, this.editData, {headers: getHeader()}).then(res => {
        if (res.data.is_success) {
          this.$toast.add({
            severity: "success",
            summary: "План успешно отправлен на согласование",
            life: 3000,
          });
          this.emitter.emit("planEventChanged", true)
          this.closeBasic();
        }
      }).catch(error => {
        if (error.response.status === 401) {
          this.$store.dispatch("logLout");
        } else {
          this.$toast.add({
            severity: "error",
            summary: error,
            life: 3000,
          });
        }
      });
    }
  }
}
</script>

<style scoped>

</style>