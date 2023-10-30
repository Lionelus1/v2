<script setup>
import ActionButton from "@/components/ActionButton.vue";
import {ref} from "vue";

const items = ref()
const loading = ref(false)


const openDialog = () => {

}
</script>

<template>
  <div class="col-12">
    <TitleBlock title="Параметрлар" />

    <div class="card">
      <Button @click="openDialog()" icon="pi pi-plus"
              class="p-button p-button-success" :label="$t('common.add')" />
    </div>

    <div class="card">
      <DataTable :lazy="true" :value="items" dataKey="id" :loading="loading" responsiveLayout="scroll"
                 :rowHover="true">
        <template #empty>{{ $t("common.noData") }}</template>
        <template #loading>{{ $t("common.loading") }}</template>
        <Column :field="'name_' + $i18n.locale" :header="$t('common.nameIn')" sortable>
          <template #body="{ data }">
            <a href="javascript:void(0)" @click="navigateToView(data)">
              {{ data['name_' + $i18n.locale] }}
            </a>
          </template>
        </Column>
        <Column :header="$t('cafedra.responsible')">
          <template #body="{ data }">
                                <span v-if="data.owner_id !== null">
                                    {{ data.ownedBy.fullName }}
                                </span>
            <span v-else>
                                    User is not defined
                                </span>
          </template>
        </Column>
        <Column class="text-right">
          <template #body="{ data }">
            <ActionButton :show-label="true" :items="initItems" @toggle="toggle(data)" />
          </template>
        </Column>
      </DataTable>
    </div>
  </div>

  <Dialog v-model:visible="dialog.closeCouncil.state" :style="{ width: '450px' }"
          :header="$t('dissertation.closeCouncil')" :modal="true" class="p-fluid">
    <div class="p-fluid">
      <div class="field">
        <label for="name">{{ $t('dissertation.closeDate') }}</label>
        <PrimeCalendar style="width: 150px" v-model="closeCouncil.close_date" dateFormat="dd.mm.yy"
                       placeholder="dd.mm.yyyy" :monthNavigator="true" :yearNavigator="true" yearRange="2000:2030" />
        <small class="p-error" v-if="submitted && closeValid.date">{{ $t('common.required') }}</small>
      </div>
      <div class="field">
        <label for="open_comment">{{ $t('common.comment') }}</label>
        <Textarea id="open_comment" v-model="closeCouncil.close_comment"
                  :placeholder="$t('dissertation.councilComment')" rows="3" cols="20" style="resize: vertical" />
        <small class="p-error" v-if="submitted && closeValid.commen+t">{{ $t('common.required') }}</small>
      </div>
    </div>
    <template #footer>
      <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button-text"
              @click="hideDialog(dialog.closeCouncil)" />
      <Button :label="$t('common.save')" icon="pi pi-check" class="p-button-text" @click="confirmCloseCouncil" />
    </template>
  </Dialog>
</template>

<style scoped>

</style>