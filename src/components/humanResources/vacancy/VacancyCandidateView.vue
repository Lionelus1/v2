<template>
  <div>
    <DataTable :value="candidates" responsiveLayout="scroll">
      <Column>

      </Column>
      <Column field="candidate.user.fullName" header="ФИО"></Column>
      <Column>
        <template #body="slotProps">
          <Button icon="pi pi-user" class="p-button-success" label="Резюме"
                  @click="apply(slotProps.data)"/>
        </template>
      </Column>
    </DataTable>
    <Sidebar
        v-model:visible="sidebar"
        position="right"
        class="p-sidebar-lg"
        style="overflow-y: scroll"
    >
      <ResumeView :value="candidates[0].candidate" :readonly="true"/>
    </Sidebar>
  </div>
</template>

<script>
import ResumeView from "../candidate/ResumeView";

export default {
  name: "VacancyCandidateView",
  components: {ResumeView},
  data() {
    return {
      sidebar: false
    }
  },
  methods: {
    apply(data) {
      this.sidebar = true
    },
  },
  props: {
    candidates: []
  },
  created() {
    console.log(this.candidates)
  }
}
</script>

<style scoped>

</style>