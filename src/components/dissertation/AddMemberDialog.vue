<template>
  <Dialog v-model:visible="dialog" :breakpoints="{'960px': '75vw', '640px': '90vw'}" :header="$t('dissertation.members')"
          :modal="true" class="p-fluid">
    <div class="p-fluid">
      <div class="field">
        <label for="name">{{ $t('common.fullName') }}</label>
        <FindUser v-model="selectedMembers" :max="1" :editMode="true" @add="onUserSelected"></FindUser>
        <small class="p-error" v-if="submitted && validationErrors.members">{{ $t('dissertation.validationErrors.selectSecretary') }}</small>
      </div>
      <div class="field">
        <label for="name">{{ $t('common.role') }}</label>
        <RolesByName v-model="selectedRole" roleGroupName="dissertation_council"></RolesByName>
        <small class="p-error" v-if="submitted && validationErrors.role">{{ $t('common.message.selectRole') }}</small>
      </div>
      <div
          v-if="selectedRole != null && (selectedRole.name=== 'dissertation_council_reviewer' ||
          selectedRole.name=== 'dissertation_council_temporary_member' || selectedRole.name=== 'dissertation_council_consultant')"
          class="field">
        <!-- <div v-if="selectedRole != null && (selectedRole.name=== 'dissertation_council_reviewer')" class="field"> -->
        <label for="name">{{ $t('dissertation.doctorals') }}</label>
        <FindDoctorals :max="2" v-model="selectedDoctorals"></FindDoctorals>
        <small class="p-error" v-if="submitted && validationErrors.doctorals">{{ $t('dissertation.validationErrors.selectDoctorals') }}</small>
      </div>

      <div v-if="selectedMemberCouncils">
        <Fieldset :legend="$t('dissertation.userOtherCouncils')" :toggleable="true">
          <DataTable :value="selectedMemberCouncils" :lazy="true" responsive-layout="stack">
            <Column field="specialitites" :header="$t('dissertation.directionCode')" style="min-width:12rem">
              <template #body="{data}">
                  <span v-for="sp in data.specialities" :key="sp.id">
                    {{ sp.trainingDirection.code }}-{{ getTrainigName(sp) }}
                    <span v-if="data?.specialities.indexOf(sp) < data?.specialities.length-1">, </span>

             </span>
              </template>
            </Column>
            <Column field="specialitites" :header="$t('dissertation.specialityCode')" style="min-width:12rem">
              <template #body="slotProps">
                   <span v-for="sp in slotProps.data.specialities" :key="sp.code">
                     {{ sp.code }}-{{ getTrainigName(sp) }}<span
                       v-if="slotProps.data.specialities.indexOf(sp)<slotProps.data.specialities.length-1">, </span>
                   </span>
              </template>
            </Column>
            <Column field="roles" :header="$t('common.role')" style="min-width:12rem">
              <template #body="{data}">
                   <span v-for="role in data?.member?.roles" :key="role.id">
                     {{ getRoleName(role) }}
                   </span>
              </template>
            </Column>
          </DataTable>
        </Fieldset>
      </div>
    </div>
    <template #footer>
      <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button-text" @click="hideDialog(dialog.addMember)"/>
      <Button :label="$t('common.add')" icon="pi pi-check" class="p-button-text" @click="addMember"/>
    </template>
  </Dialog>
</template>
<script setup>

import RolesByName from "@/components/smartenu/RolesByName.vue";
import FindDoctorals from "@/components/dissertation/FindDoctorals.vue";
import {ref} from "vue";
import axios from "axios";
import {getHeader, smartEnuApi} from "@/config/config";
import {useStore} from "vuex";
import {useToast} from "primevue/usetoast";
import {useI18n} from "vue-i18n";

const props = defineProps(['councilID', 'show', 'members'])
const emits = defineEmits(['hide'])

const store = useStore()
const toast = useToast()
const i18n = useI18n()

// eslint-disable-next-line vue/no-setup-props-destructure
const dialog = props.show
const submitted = ref(false)
const selectedMembers = ref(null)
const selectedRole = ref(null)
const selectedDoctorals = ref(null)
const MembersList = ref(props.members || [])
const validationErrors = ref({
  members: false,
  role: false,
  doctorals: false,
})

const addMember = () => {
  submitted.value = true;
  let request = {userID: selectedMembers.value[0].userID, roleID: selectedRole.value.id, councilID: props.councilID}
  if (validateAddConsulMemberForm()) {
    if ((selectedRole.value.name === "dissertation_council_reviewer" || selectedRole.value.name === "dissertation_council_temporary_member"
        || selectedRole.value.name === "dissertation_council_consultant")) {
      // if (this.selectedRole != null && (this.selectedRole.name === "dissertation_council_reviewer")) {
      request.dissertations = []
      selectedDoctorals.value.forEach(element => {
        request.dissertations.push(element.dissertation.id)
      });
      request.is_reviewer = selectedRole.value.name !== "dissertation_council_consultant"
    }
    axios.post(smartEnuApi + "/dissertation/addCouncilMember", request, {headers: getHeader()}).then((res) => {
      selectedMembers.value[0].memberID = res.data;
      selectedMembers.value[0].roles = []
      selectedMembers.value[0].roles.push(JSON.parse(JSON.stringify(selectedRole.value)))
      MembersList.value.push(JSON.parse(JSON.stringify(selectedMembers.value[0])));
      submitted.value = false;
      hideDialog();
    }).catch((error) => {
      if (error.response.status == 401) {
        store.dispatch("logLout");
      }
      if (error.response.status == 302) {
        toast.add({
          severity: "error",
          summary: i18n.t('dissertation.title'),
          detail: i18n.t('dissertation.message.hasSameMember'),
          life: 3000
        });
      } else {
        toast.add({
          severity: "error",
          summary: "dissertationNewCouncilError\n" + error,
          life: 3000
        })
      }
    })
  }
}

const validateAddConsulMemberForm = () => {
  validationErrors.value.members = !selectedMembers.value;
  validationErrors.value.role = !selectedRole.value;
  validationErrors.value.doctorals = !((selectedRole.value && selectedRole.value.name != "dissertation_council_reviewer") || (selectedRole.value && selectedRole.value.name == "dissertation_council_reviewer" && selectedDoctorals.value != null))
  return !validationErrors.value.members && !validationErrors.value.role && !validationErrors.value.doctorals
}

const hideDialog = () => {
  emits('hide')
}
</script>

<style scoped>

</style>