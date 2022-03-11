<template>
  <div id="carddiv" class="p-grid">
    <div class="p-col-12">
      <h3>{{ $t('hr.sendMessage') }}</h3>
      <div>
        <Menubar :model="menu" :key="active"
                 style="height:36px;margin-top:-7px;margin-left:-14px;margin-right:-14px">
        </Menubar>
      </div>
    </div>
    <div class="p-col-12 p-md-12 p-fluid">
      <div class="card">
        <div class="p-field">
          <label>{{$t('hr.messageTitle')}}</label>
          <InputText
              :readonly="readonly"
              class="p-mt-2"
              type="text"
              :placeholder="$t('hr.messageTitle')"
              v-model="request.subject"
          ></InputText>
        </div>
        <div class="p-field">
          <label>{{ $t('hr.messageBody') }}</label>
          <Editor
              class="p-mt-2"
              v-model="request.message"
              editorStyle="height: 200px"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import VacancyService from "./VacancyService";

export default {
  name: "ApplyActionEdit",
  props: {
    candidateRelation: null,
    readonly: Boolean,
    path: null,
  },
  data() {
    return {
      active: null,
      request: {},
      menu: [
        {
          label: this.$t('common.action.submit'),
          icon: "pi pi-fw pi-caret-up",
          visible: true,
          command: () => {
            this.sendMessage()
          },
        },
      ],
    }
  },
  created() {
    this.vacancyService = new VacancyService()
  },
  methods: {
    sendMessage() {
      this.request.relId = this.candidateRelation.id
      this.request.to = this.candidateRelation.candidate.user.email
      this.vacancyService.applyAction(this.request, this.path).then(response => {
        this.emitter.emit("updateForm", true);
      }).catch(error => {
        console.log(error)
      })
    }
  }
}
</script>

<style scoped>

</style>