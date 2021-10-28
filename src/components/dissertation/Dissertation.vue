<template>
  <div>
    <div class="p-col-12">

      <Toolbar class="p-mb-4">
        <template #right>
          <Button icon="pi pi-plus" class="p-button-success p-mr-2" @click="openNew" />
          <Button icon="pi pi-print" class="p-button-info p-mr-2" @click="openNew" />
          <Button icon="pi pi-trash" class="p-button-danger" @click="confirmDeleteSelected" :disabled="!selectedProducts || !selectedProducts.length" />
        </template>
        <template #left>
          <h4>{{ $t("dissertation.title") }}</h4>
        </template>
      </Toolbar>
      <DataTable
          :lazy="true"
          :totalRecords="CouncilsCount"
          :value="CouncilsList"
          @page="onPage($event)"
          :paginator="true"
          :rows="10"
          dataKey="id"
          :rowHover="true"

          :loading="loading"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          :rowsPerPageOptions="[10, 25, 50]"
          :currentPageReportTemplate="
            $t('common.showingRecordsCount', {
              first: '{first}',
              last: '{last}',
              totalRecords: '{totalRecords}',
            })
          "
           responsiveLayout="scroll"
          @sort="onSort($event)"
          @filter="onFilter($event)"
        >
           <Column field="directionCode" :header="$t('dissertation.directionCode')" style="min-width:12rem"></Column>
           <Column field="specialityCode" :header="$t('dissertation.specialityCode')" style="min-width:12rem"></Column>
           <Column field="secretary" :header="$t('dissertation.secretary')" sortable="true" style="min-width:12rem"></Column>
           <Column field="faculty" :header="$t('dissertation.faculty')"  style="min-width:12rem"></Column>
           <Column field="inactive"  style="min-width:12rem"></Column>


          </DataTable>
          <Dialog v-model:visible="councilDialog" :style="{width: '450px'}" :header="$t('dissertation.title')" :modal="true" class="p-fluid">
            <div class="p-field">
                <label for="name">{{$t('dissertation.specialityCode')}}</label>
                <SpecialitySearch v-model="selectedUsers" id="name"></SpecialitySearch>

                <small class="p-error" v-if="submitted && !product.name">Name is required.</small>
            </div>



            <template #footer>
                <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog"/>
                <Button label="Save" icon="pi pi-check" class="p-button-text" @click="saveProduct" />
            </template>
        </Dialog>

    </div>
  </div>
</template>
<script>
import {

    mapState
} from "vuex";
import SpecialitySearch from "./specialitysearch/SpecialitySearch.vue";
export default {
  components: { SpecialitySearch },
 data() {
   return {
    councilDialog: false,
    selectedUsers: null,
    CouncilsList : [
      {directionCode: 1005, specialityCode: 2006, secretary: "Ергеш Бану Жантуғанқызы", faculty: "Факультет информационных технологий", inactive : this.$t('dissertation.inactive')}
    ],
    Councils:[],
    CouncilsCount : 10,
   }
 },
 methods: {
  isDissertationAdmin() {
    if (this.myDetails && this.myDetails.status)
      this.myDetails.status = this.statuses.indexOf(this.myDetails.status);
  },
  openNew() {
    this.councilDialog = true;
  }
 },
 computed: {
        ...mapState(["loginedUser"]),
    },
}
</script>
