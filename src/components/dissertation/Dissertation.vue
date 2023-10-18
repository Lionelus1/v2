<template>
  <div>
    <div class="col-12">
        <div class="card">
      <Toolbar class="mb-4">
        <template #end>

          <Button v-if="isDissertationAdmin && selectedCouncil && !selectedCouncil?.is_closed" icon="pi pi-list"
            class="p-button-primary mr-2" @click="openDissertationList(selectedCouncil?.id)"
            v-tooltip.top="$t('dissertation.dissertationList')" :disabled="!selectedCouncil" />
          <Button v-if="isDissertationAdmin" icon="pi pi-plus" class="p-button-success mr-2" v-tooltip="'Добавить'"
            @click="showAddCouncilDialog()" />
          <Button v-if="isDissertationAdmin" icon="pi pi-print" class="p-button-info mr-2" @click="openNew" />
          <Button v-if="isDissertationAdmin && selectedCouncil && !selectedCouncil?.is_closed" icon="fa-solid fa-ban"
            class="p-button-danger mr-2" @click="showStopCouncil" v-tooltip.top="$t('dissertation.closeCouncil')"
            :disabled="!selectedCouncil" />
          <Button v-if="isDissertationAdmin" icon="pi pi-trash" class="p-button-danger" @click="deleteCouncil()"
            :disabled="!selectedCouncil" />
        </template>
        <template #start>
          <h4>{{ $t("dissertation.title") }}</h4>
        </template>
      </Toolbar>
      <DataTable selectionMode="single" v-model:selection="selectedCouncil" :lazy="true" :totalRecords="CouncilsCount"
        :value="CouncilsList" @page="onPage($event)" :paginator="true" :rows="lazyParams.rows" dataKey="id"
        :rowHover="true" :loading="loading"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        :rowsPerPageOptions="[10, 25, 50]" :currentPageReportTemplate="$t('common.showingRecordsCount', {
          first: '{first}',
          last: '{last}',
          totalRecords: '{totalRecords}',
        })
          " responsiveLayout="scroll" @sort="onSort($event)" @filter="onFilter($event)">
        <Column field="specialitites" :header="$t('dissertation.directionCode')" style="min-width:12rem">
          <template #body="slotProps">
            <span v-for="sp in slotProps.data.specialities" :key="sp.id">
              {{ sp.trainingDirection.code }}-{{ getTrainigName(sp) }}<span
                v-if="slotProps.data.specialities.indexOf(sp) < slotProps.data.specialities.length - 1">, </span>

            </span>
          </template>
        </Column>
        <Column field="specialitites" :header="$t('dissertation.specialityCode')" style="min-width:12rem">
          <template #body="slotProps">
             <span v-for="sp in slotProps.data.specialities" :key="sp.code">
               {{ sp.code }}-{{ getProgramName(sp) }}<span
                 v-if="slotProps.data.specialities.indexOf(sp)<slotProps.data.specialities.length-1">, </span>
             </span>
          </template>
        </Column>
        <Column field="Secretary" :header="$t('dissertation.secretary')" sortable="true" style="min-width:12rem">
          <template #body="slotProps">
            <span v-if="slotProps.data.members.length > 0"> {{ slotProps.data.members[0].fullName }}</span>
          </template>
        </Column>
        <Column
          :field="($i18n.locale == 'kz' ? 'department.nameKz' : $i18n.locale == 'en' ? 'department.nameEn' : 'department.name')"
          sortable="true" :header="$t('common.faculty')" style="min-width:12rem"></Column>
        <Column field="is_closed" :header="$t('common.status')" style="min-width:12rem">
          <template #body="{ data }">
            <span class="p-badge p-badge-danger" v-if="data?.is_closed"> {{ $t('Тоқтатылған') }}</span>
            <!--<span class="badge" v-if="!data?.is_closed"> {{ $t('') }}</span>-->
          </template>
        </Column>
        <Column headerStyle="width: 7rem; text-align: left" bodyStyle="text-align: left; overflow: visible">
          <template #body="{ data }">
            <Button v-if="!data?.is_closed" type="button" icon="pi pi-user-edit" @click="openCouncil(data?.id)"></Button>
          </template>
        </Column>

      </DataTable>
      <Dialog v-model:visible="dialog.addCouncil.state" :style="{ width: '450px' }" :header="$t('dissertation.title')"
        :modal="true" class="p-fluid">
        <div class="p-fluid">
          <div class="field">
            <label for="name">{{ $t('dissertation.specialityCode') }}</label>
            <SpecialitySearch :educationLevel="Enums.EducationLevel.Doctorate" v-model="newCouncil.specialities"
              id="name"></SpecialitySearch>
            <small class="p-error" v-if="(submitted && validationErrors.speciality)">{{
              $t('dissertation.validationErrors.selectSpeciality') }}</small>
          </div>
          <div class="field">
            <label for="name">{{ $t('common.faculty') }}</label>
            <DepartmentList :autoLoad="true" v-model="newCouncil.department" :placeHolder="$t('smartenu.selectFaculty')">
            </DepartmentList>
            <small class="p-error" v-if="submitted && validationErrors.faculty">{{
              $t('dissertation.validationErrors.selectDepartment') }}</small>
          </div>
          <div class="field">
            <label for="name">{{ $t('dissertation.secretary') }}</label>
            <FindUser v-model="newCouncil.members" :max="1"></FindUser>
            <small class="p-error" v-if="submitted && validationErrors.members">{{
              $t('dissertation.validationErrors.selectSecretary') }}</small>
          </div>
          <div class="field">
            <label for="name">{{ $t('faq.createDate') }}</label>
            <PrimeCalendar style="width: 150px" :disabled="disabled" v-model="newCouncil.createdDate"
              dateFormat="dd.mm.yy" placeholder="dd.mm.yyyy" :monthNavigator="true" :yearNavigator="true"
              yearRange="2000:2030" />
            <small class="p-error" v-if="submitted && validationErrors.createdDate">{{
              $t('dissertation.validationErrors.selectCreatedDate') }}</small>
          </div>
          <div class="field">
            <label for="open_comment">{{ $t('common.comment') }}</label>
            <Textarea id="open_comment" v-model="newCouncil.open_comment" :placeholder="$t('dissertation.councilComment')"
              rows="3" cols="20" style="resize: vertical" />
          </div>
        </div>
        <template #footer>
          <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button-text"
            @click="hideDialog(dialog.addCouncil)" />
          <Button :label="$t('common.add')" icon="pi pi-check" class="p-button-text" @click="addCouncil" />
        </template>
      </Dialog>

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
            <small class="p-error" v-if="submitted && closeValid.comment">{{ $t('common.required') }}</small>
          </div>
        </div>
        <template #footer>
          <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button-text"
            @click="hideDialog(dialog.closeCouncil)" />
          <Button :label="$t('common.save')" icon="pi pi-check" class="p-button-text" @click="confirmCloseCouncil" />
        </template>
      </Dialog>
    </div>
  </div>
  </div>
</template>
<script>
import { mapState } from "vuex";
import SpecialitySearch from "../smartenu/speciality/specialitysearch/SpecialitySearch.vue";
import DepartmentList from "../smartenu/DepartmentList.vue"
import Enums from "@/enum/docstates/index";
import {getHeader, findRole, smartEnuApi} from "@/config/config";
import {DissertationService} from "@/service/dissertation.service"

export default {
  components: { SpecialitySearch, DepartmentList },
  data() {
    return {
      dialog: {
        addCouncil: {
          state: false
        },
        deleteCouncil: {
          state: false
        },
        closeCouncil: {
          state: false
        }
      },
      newCouncil: {
        specialities: [],
        department: null,
        members: [],
        createdDate: null,
        open_comment: null
      },
      closeCouncil: {
        close_comment: null,
        close_date: new Date(),
      },
      selectedCouncil: null,

      Enums: Enums,
      CouncilsList: [],

      isDissertationAdmin: false,
      CouncilsCount: -1,
      submitted: false,
      validationErrors: {
        speciality: false,
        faculty: false,
        members: false,
        createdDate: false,
      },
      closeValid: {
        comment: false,
        date: false,
        council_id: false
      },
      loading: false,
      lazyParams: {
        page: 0,
        rows: 10,
      },

      dissertationService: new DissertationService()
    }
  },
  created() {
    this.loadCouncilsList()
  },
  mounted() {
    this.checkRole()
  },
  methods: {
    findRole: findRole,
    checkRole() {
      this.isDissertationAdmin = this.findRole(null, 'dissertation_chief')
    },

    deleteCouncil() {
      this.$confirm.require({
        message: this.$t("common.confirmation"),
        header: this.$t("common.confirm"),
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.dissertationService.deleteCouncil(this.selectedCouncil.id).then((response) => {
            this.CouncilsList.splice(this.CouncilsList.indexOf(this.selectedCouncil), 1);
          }).catch((error) => {
            if (error.response.status == 401) {
              this.$store.dispatch("logLout");
            }
          });

        },
      });
    },
    openCouncil(id) {
      this.$router.push({ name: "Members", params: { id: id, role: 1 } });
    },
    openDissertationList(id) {
      this.$router.push({ name: "DissertationReport", params: { id: id, specCode:this.selectedCouncil.specialities[0].code, specNameKz: this.selectedCouncil.specialities[0].nameInKz || "null", specNameRu: this.selectedCouncil.specialities[0].nameInRu || "null", specNameEn: this.selectedCouncil.specialities[0].nameInEn || "null", dirCode:this.selectedCouncil.specialities[0].trainingDirection.code, trainingDirectionKz:this.selectedCouncil.specialities[0].trainingDirection.nameInKz || "null", trainingDirectionRu:this.selectedCouncil.specialities[0].trainingDirection.nameInRu || "null", trainingDirectionEn:this.selectedCouncil.specialities[0].trainingDirection.nameInEn || "null"} });


    },
    showAddCouncilDialog() {
      this.newCouncil.specialities = [];
      this.newCouncil.department = null;
      this.newCouncil.members = [];
      this.newCouncil.createdDate = null;
      this.dialog.addCouncil.state = true;
    },
    showDialog(dialog) {
      dialog.state = true;

    },
    hideDialog(dialog) {
      dialog.state = false;
    },
    onPage(event) {
      //this.lazyParams = event;
      this.lazyParams = event;
      this.loadCouncilsList();
    },
    onSort(event) {
      this.lazyParams = event;
      this.loadCouncilsList();
    },
    onFilter() {
      this.lazyParams.filters = this.filters;
      this.loadCouncilsList();
    },

    loadCouncilsList() {
      this.loading = true;

      this.lazyParams.userID = this.$store.state.loginedUser.userID
      this.dissertationService.getCouncils(this.lazyParams).then((response) => {
        this.CouncilsList = response.data;
        if (this.CouncilsList.length > 0 && this.CouncilsCount < 0) {
          this.CouncilsCount = this.CouncilsList[0].count
        }
        this.loading = false;
      }).catch((error) => {
        this.$toast.add({ severity: "error", summary: error, life: 3000 })
      });
    },
    addCouncil() {
      this.submitted = true;
      if (this.validateAddConsulForm()) {
        this.dissertationService.newCouncil(this.newCouncil).then((res) => {
          this.newCouncil.id = res.data;
          this.CouncilsList.push(JSON.parse(JSON.stringify(this.newCouncil)));
          this.submitted = false;
          this.hideDialog(this.dialog.addCouncil);
        }).catch((error) => {
          console.log(error.response.data)
          this.$toast.add({ severity: "error", summary: error, life: 3000 })
        })
      }
    },
    validateAddConsulForm() {
      this.validationErrors.speciality = !this.newCouncil.specialities || this.newCouncil.specialities.count <= 0;
      this.validationErrors.faculty = !this.newCouncil.department;
      this.validationErrors.members = !this.newCouncil.members;
      this.validationErrors.createdDate = !this.newCouncil.createdDate;
      return !this.validationErrors.members && !this.validationErrors.speciality && !this.validationErrors.faculty && !this.validationErrors.createdDate;
    },
    getTrainigName(sp) {
      switch (this.$i18n.locale) {
        case "kz":
          return sp.trainingDirection.nameInKz;
        case "en":
          return sp.trainingDirection.nameInEn;
        case "ru":
          return sp.trainingDirection.nameInRu;
      }
    },
    getProgramName(sp) {
      switch (this.$i18n.locale) {
        case "kz":
          return sp.nameInKz;
        case "en":
          return sp.nameInEn;
        case "ru":
          return sp.nameInRu;
      }
    },
    showStopCouncil() {
      this.dialog.closeCouncil.state = true;
    },
    confirmCloseCouncil() {
      this.$confirm.require({
        message: this.$t("common.confirmation"),
        header: this.$t("common.confirm"),
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.initCloseCouncil();
        }
      });
    },
    initCloseCouncil() {
      if (!this.selectedCouncil) return
      this.closeCouncil.council_id = this.selectedCouncil.id;
      this.dissertationService.closeCouncil(this.closeCouncil).then(res => {
        this.loadCouncilsList();
        this.hideDialog(this.dialog.closeCouncil);
      }).catch(error => {
        this.$toast.add({ severity: "error", summary: error, life: 3000 })
      })
    }
  },
  computed: {
    ...mapState(["loginedUser"]),
  },
}
</script>


