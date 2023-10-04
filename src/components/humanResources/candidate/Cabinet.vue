<template>
    <h3>{{ $t("common.cabinet") }}</h3>
<div class="card">
  <TabView>
    <TabPanel :header="$t('common.myResume')">
      <Resume/>
    </TabPanel>
    <TabPanel :header="$t('common.myVacancy')">
      <CandidateVacancy/>
    </TabPanel>
  </TabView>
</div>
</template>

<script>
import CandidateVacancy from "./CandidateVacancy";
import Resume from "./Resume";
export default {
  name: "Cabinet",
  components: {Resume, CandidateVacancy}
}
</script>

<style scoped>

</style>
