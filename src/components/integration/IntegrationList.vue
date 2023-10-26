<script setup>

import ActionButton from "@/components/ActionButton.vue";
</script>

<template>
  <div class="col-12">
    <TitleBlock title="Интергациялар" />
    <div class="card">
      <Button @click="openDialog()" icon="pi pi-plus"
              class="p-button p-button-success" :label="$t('common.add')" />
    </div>

    <div class="card">
      <DataTable :lazy="true" :value="blogList" dataKey="id" :loading="loading" responsiveLayout="scroll"
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
</template>

<style scoped>

</style>