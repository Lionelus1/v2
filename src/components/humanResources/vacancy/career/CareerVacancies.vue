<template>
  <TitleBlock :title="$t('hr.vacancies')" />
  <!-- Toolbar -->
  <Toolbar class="mb-4" v-if="userId === undefined">
    <template #end>
      <Button :label="$t('common.login')" icon="pi pi-user" v-on:click="visible.login = true"/>
    </template>
  </Toolbar>

  <ToolbarMenu @search="getVacancies" :search="true"/>
  <!-- Авторизация -->
  <Dialog v-model:visible="visible.login" :style="{ width: '500px' }" :modal="true">
    <Login></Login>
  </Dialog>
  <!-- DataTable -->
  <div class="card">
    <DataTable :lazy="true"
               :value="vacancies"
               @page="onPage($event)"
               :totalRecords="count"
               :paginator="true"
               paginatorTemplate="FirstPageLink
                                  PrevPageLink
                                  PageLinks
                                  NextPageLink
                                  LastPageLink
                                  CurrentPageReport
                                  RowsPerPageDropdown"
               :rowsPerPageOptions="[10, 25, 50]"
               :currentPageReportTemplate="$t('common.showingRecordsCount',
                                                   { first: '{first}',
                                                     last: '{last}',
                                                     totalRecords: '{totalRecords}'
                                                   })"
               class="p-datatable-customers"
               :rows="10"
               dataKey="id"
               :rowHover="true"
               v-model:selection="vacancy"
               selection-mode="single"
               @row-select="select"
               :filters="filters"
               filterDisplay="menu"
               :showFilterMatchModes="false"
               :loading="loading"
               responsiveLayout="scroll"
               @sort="onSort($event)">
      <!-- EMPTY -->
      <template #empty> {{ $t('common.noData') }}</template>
      <!-- NAME COLUMN -->
      <Column :field="'name' + c"
              v-bind:header="$t('common.nameIn')"
              :sortable="true">
        <template #body="slotProps">
          <span>
            {{
              $i18n.locale === "kz" ? slotProps.data.nameKz : $i18n.locale === "ru"
                  ? slotProps.data.nameRu : slotProps.data.nameEn
            }}
          </span>
        </template>
      </Column>
      <Column field="org"
              v-bind:header="$t('common.organizationName')"
              :sortable="false">
        <template #body="slotProps">
          <span>
            {{
              $i18n.locale === "kz" ? slotProps.data.organization.name : $i18n.locale === "ru"
                  ? slotProps.data.organization.nameru : slotProps.data.organization.name
            }}
          </span>
        </template>
      </Column>
      <Column field="stp"
              v-bind:header="$t('common.departmentNameLabel')"
              :sortable="false">
        <template #body="slotProps">
          <span>
            {{
              $i18n.locale === "kz" ? slotProps.data.department.nameKz : $i18n.locale === "ru"
                  ? slotProps.data.department.name : slotProps.data.department.nameEn
            }}
          </span>
        </template>
      </Column>
      <!-- DATE COLUMN -->
      <Column field="date"
              v-bind:header="$t('common.pDate')"
              :sortable="false">
        <template #body="slotProps">
          <span>
            {{
              new Date(slotProps.data.history.modifyDate).toLocaleDateString()
            }}
          </span>
        </template>
      </Column>
      <!-- APPLY BUTTON COLUMN -->
      <Column>
        <template #body="slotProps">
          <Button v-if="!slotProps.data.isApply" icon="pi pi-star" class="p-button-success white-space-nowrap" :label="$t('hr.action.apply')"
                  @click="openApplyDialog(slotProps.data.id)"/>
          <Tag v-if="slotProps.data.isApply" class="mr-2" severity="info" :value="$t('hr.action.applied')"></Tag>
        </template>
      </Column>
    </DataTable>
  </div>
  <!-- Просмотр резюме -->
  <Dialog v-model:visible="visible.view" :style="{ width: '800px' }" :modal="true">

    <template #header>
      <h5 style="padding-left: 15px">
        <b>{{ $i18n.locale === "kz" ? vacancy.nameKz : $i18n.locale === "ru" ? vacancy.nameRu : vacancy.nameEn }}</b>
      </h5>
    </template>

    <Card style="box-shadow: none">
      <template #header>
        <div style="padding-left: 15px">
          <Button v-if="!vacancy.isApply" icon="pi pi-star" class="p-button-success" :label="$t('hr.action.apply')"
                  @click="openApplyDialog(vacancy.id)"/>
          <Message v-if="vacancy.isApply" severity="info" :closable="false">{{ $t('hr.action.applied2') }}
          </Message>
        </div>
      </template>

      <template #subtitle>
        {{ $t('common.publishDate') }} {{
          new Date(vacancy.history.modifyDate).toLocaleDateString() + ' ' +
          new Date(vacancy.history.modifyDate).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
        }}
      </template>

      <template #content>

        <p><b>{{ $t('common.organizationNameLabel') }}</b></p>
        <p style="padding-left: 20px"><i>{{
            $i18n.locale === "kz" ? vacancy.organization.name :
                $i18n.locale === "ru" ? vacancy.organization.nameru : vacancy.organization.name
          }}</i>
        </p>

        <p><b>{{ $t('common.deadlineDate') }}</b></p>
        <p style="padding-left: 20px"><i>{{ new Date(vacancy.deadline).toLocaleDateString() }}</i>
        </p>

        <p><b>{{ $t('common.departmentNameLabel') }}</b></p>
        <p style="padding-left: 20px"><i>{{
            $i18n.locale === "kz" ? vacancy.department.nameKz :
                $i18n.locale === "ru" ? vacancy.department.name : vacancy.department.nameEn
          }}</i><br>
          <i><b style="font-weight: 600">{{ $t('common.headLabel') }}</b> {{ vacancy.departmentHead.fullName }}</i>
        </p>

        <p><b>{{ $t('hr.responsibilitiesLabel') }}</b></p>
        <div class="fielddef-padding"
             v-html='
              $i18n.locale === "kz" ? vacancy.responsibilitiesKz :
                  $i18n.locale === "ru" ? vacancy.responsibilitiesRu : vacancy.responsibilitiesEn'
        />

        <p><b>{{ $t('hr.educationLabel') }}</b></p>
        <div class="fielddef-padding"
             v-html='$i18n.locale === "kz" ? vacancy.educationKz :
                  $i18n.locale === "ru" ? vacancy.educationRu : vacancy.educationEn'
        />

        <p><b>{{ $t('hr.qualificationLabel') }}</b></p>
        <div class="fielddef-padding"
             v-html='$i18n.locale === "kz" ? vacancy.qualificationKz :
                  $i18n.locale === "ru" ? vacancy.qualificationRu : vacancy.qualificationEn'
        />

        <p><b>{{ $t('hr.experienceLabel') }}</b></p>
        <div class="fielddef-padding"
             v-html='$i18n.locale === "kz" ? vacancy.experienceKz :
                  $i18n.locale === "ru" ? vacancy.experienceRu : vacancy.experienceEn'
        />

        <p><b>{{ $t('hr.languageLevelLabel') }}</b></p>
        <div class="fielddef-padding"
             v-html='$i18n.locale === "kz" ? vacancy.languageLevelKz :
                  $i18n.locale === "ru" ? vacancy.languageLevelRu : vacancy.languageLevelEn'
        />

        <p><b>{{ $t('hr.certificateRequirementsLabel') }}</b></p>
        <div class="fielddef-padding"
             v-html='$i18n.locale === "kz" ? vacancy.certificateRequirementsKz :
                  $i18n.locale === "ru" ? vacancy.certificateRequirementsRu : vacancy.certificateRequirementsEn'
        />

        <p><b>{{ $t('hr.personalQualitiesLabel') }}</b></p>
        <div class="fielddef-padding"
             v-html='$i18n.locale === "kz" ? vacancy.personalQualitiesKz :
                  $i18n.locale === "ru" ? vacancy.personalQualitiesRu : vacancy.personalQualitiesEn'
        />
        <p><b>{{ $t('hr.workConditionLabel') }}</b></p>
        <div class="fielddef-padding"
             v-html='$i18n.locale === "kz" ? vacancy.workConditionKz :
                  $i18n.locale === "ru" ? vacancy.workConditionRu : vacancy.workConditionEn'
        />
      </template>
    </Card>

    <template #footer>
      <Button
          v-bind:label="$t('common.close')"
          icon="pi pi-times"
          class="p-button p-component p-button-primary"
          @click="visible.view = false"
      />
    </template>

  </Dialog>
  <!-- Подача заявки -->
  <Dialog v-model:visible="visible.apply" :style="{ width: '650px' }" :modal="true">

    <template #header>
      <h5>{{ $t('hr.action.apply').toUpperCase() }}</h5>
    </template>

    <div class="col-12 md:col-12 p-fluid">
      <div class="card">
        <div class="p-fluid grid formgrid">
          <div class="field col-12">
            <Label>{{ $t('hr.vacancySource') }}: </Label>
            <Dropdown class="mt-2" v-model="relation.vacancySource"
                      :options="vacancySources"
                      :class="{'p-invalid': validation.source}"
                      :optionLabel="('name' + ($i18n.locale).charAt(0).toUpperCase() + ($i18n.locale).slice(1))"
                      :placeholder="$t('common.select')"/>
            <small
                class="p-error"
                v-if="validation.source"
            >{{ $t("common.requiredField") }}</small>
          </div>
          <div class="field col-12">
            <Label>{{ $t('hr.motivationLetter') }}: </Label>
            <FileUpload
                class="mt-2"
                mode="basic"
                :customUpload="true"
                :class="{'p-invalid': validation.ml}"
                @uploader="upload($event)"
                :auto="true"
                v-bind:chooseLabel="$t('hdfs.chooseFile')"
            ></FileUpload>
            <InlineMessage severity="info"
                           class="mt-2"
                           show v-if="file">
              {{ $t('ncasigner.chosenFile', {fn: file ? file.name : ""}) }}
            </InlineMessage>
            <small
                class="p-error"
                v-if="validation.ml"
            >{{ $t("common.requiredField") }}</small>
          </div>
          <div class="field col-12">
            <hr>
          </div>
          <div class="field col-12">
            <p><b><em>{{ $t('hr.sp.header') }}:</em></b></p>
            <p style="text-align: justify">
              <em>
                {{ $t('hr.sp.label1') }}
              </em>
            </p>
            <p style="text-align: justify">
              <em>
                {{ $t('hr.sp.label2') }}
              </em>
            </p>
            <p style="text-align: justify">
              <em>
                {{ $t('hr.sp.label3') }}
              </em>
            </p>
          </div>
          <div class="field col-12">
            <hr>
          </div>
          <div class="field col-12">
            <div class="field-checkbox">
              <Checkbox id="binary" v-model="agreement" :binary="true"/>
              <label for="binary" style="font-size: 15px; text-align: justify">
                <b>
                  {{ $t('hr.sp.agreement') }}
                </b>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
    <template #footer>
      <Button
          v-bind:label="$t('hr.sp.request')"
          icon="pi pi-check"
          class="p-button p-component p-button-primary"
          :disabled="!agreement"
          @click="apply"
      />
    </template>
  </Dialog>
  <!-- Если резюме не найдено -->
  <Dialog
      v-model:visible="visible.notFound"
      :style="{ width: '450px' }"
      :modal="true"
      :closable="false">

    <div class="confirmation-content">
      <i class="pi pi-exclamation-circle mr-3" style="font-size: 2rem"/>
      <span>
        <b>{{$t('hr.resumeNorFound')}}</b>
        </span>
    </div>

    <template #footer>
      <Button
          :label="$t('common.yes')"
          icon="pi pi-check"
          @click="redirectToResume"/>
      <Button
          :label="$t('common.no')"
          icon="pi pi-times"
          class="p-button-secondary p-button-text"
          @click="visible.notFound = false"/>
    </template>
  </Dialog>
</template>

<script>
import {FilterMatchMode, FilterOperator} from "primevue/api";
import api from "@/service/api";
import {getHeader} from "@/config/config";
import Login from "../../../Login";
import router from '@/router';
import TitleBlock from "@/components/TitleBlock.vue";
import ToolbarMenu from "@/components/ToolbarMenu.vue";
export default {
  name: "CareerVacancies",
  components: {ToolbarMenu, TitleBlock, Login},
  data() {
    return {
      file: null,
      userId: null,
      count: 200,
      filters: {
        'global': {value: null, matchMode: FilterMatchMode.CONTAINS},
        'question': {value: null, matchMode: FilterMatchMode.CONTAINS},
        'recipient': {value: null, matchMode: FilterMatchMode.CONTAINS},
        'status': {value: null, matchMode: FilterMatchMode.EQUALS},
        'sendDate': {operator: FilterOperator.AND, constraints: [{value: null, matchMode: FilterMatchMode.DATE_IS}]},
        'createDate': {operator: FilterOperator.AND, constraints: [{value: null, matchMode: FilterMatchMode.DATE_IS}]}
      },
      lazyParams: {
        page: 0,
        rows: 10,
        searchText: null,
        sortField: "",
        sortOrder: 0,
        orgCode: 'other'
      },
      visible: {
        loading: false,
        view: false,
        apply: false,
        login: false,
        notFound: false,
      },
      validation: {
        source: false,
        ml: false
      },
      vacancies: [],
      vacancySources: [],
      relation: null,
      vacancy: null,
      agreement: false,
      candidate: null,
      loading: false,
    }
  },
  methods: {
    upload(event) {
      this.file = event.files[0];
    },
    /**
     * *********************** ПОЛУЧЕНИЕ ВСЕХ ОПУБЛИКОВАННЫХ ВАКАНСИЙ
     */
    getVacancies(data) {
      this.loading = true
      this.lazyParams.countMode = null;
      this.lazyParams.searchText = data;
      api.post("/vacancy/public", this.lazyParams, {headers: getHeader()}).then((response) => {
        this.vacancies = response.data.vacancies;
        this.count = response.data.total;
        this.loading = false;
      }).catch((error) => {
        if (error.response.status == 401) {
          this.$store.dispatch("logLout");
        } else {
          this.$toast.add({
            severity: "error",
            summary: error,
            life: 3000,
          });
        }
        this.loading = false;
      });
    },

    /**
     * *********************** ПОЛУЧЕНИЕ СПРАВОЧНИК ИСТОЧНИКОВ ВАКАНСИИ
     */
    getCatalog() {
      api.post("/vacancy/sources",
          {}, {headers: getHeader()}).then((res) => {
        this.vacancySources = res.data
        this.getUserCandidate()
      }).catch((error) => {
        if (error.response.status == 401) {
          this.visible.login = true
        } else {
          this.$toast.add({
            severity: "error",
            summary: error,
            life: 3000,
          });
        }
      });
    },

    /**
     * *********************** ПРОВЕРКА НАЛИЧИЯ РЕЗЮМЕ
     */
    getUserCandidate() {
      api.post("/candidate/get",
          {}, {headers: getHeader()}).then(res => {
        this.visible.apply = true
      }).catch(error => {
        if (error.response.status === 404) {
          this.candidate = null
          this.visible.notFound = true
        } else {
          this.$toast.add({
            severity: "error",
            summary: error,
            life: 3000,
          });
        }
      });
    },

    /**
     * *********************** ПОДАЧА ЗАЯВКИ НА УЧАСТИЕ В КОНКУРСЕ
     */
    apply() {
      const fd = new FormData();
      fd.append("rel", JSON.stringify(this.relation))
      fd.append("ml", this.file);
      if (this.validateForm()) {
        api.post("/vacancy/apply",
            fd, {headers: getHeader()}).then((response) => {
          for (let key in this.vacancies) {
            if (this.vacancies[key].id === this.relation.vacancyId) {
              this.vacancies[key].isApply = true
            }
          }
          this.visible.apply = false;
        }).catch((error) => {
          if (error.response.status == 401) {
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
    },

    /**
     * *********************** СОРТИРОВКА
     * @param event
     */
    onSort(event) {
      this.lazyParams.sortField = event.sortField;
      this.lazyParams.sortOrder = event.sortOrder;
      this.getVacancies();
    },

    /**
     * *********************** ПАГИНАЦИЯ
     * @param event
     */
    onPage(event) {
      this.lazyParams.page = event.page
      this.lazyParams.rows = event.rows
      this.getVacancies();
    },

    /**
     * *********************** ВЫБОР ЭЛЕМЕНТА ТАБЛИЦЫ
     * @param event
     */
    select(event) {
      this.vacancy = event.data
      this.visible.view = true
    },

    /**
     * ***********************
     */

    /**
     * *********************** ОТКРЫТИЕ ДИАЛОГОВОГО ОКНА ДЛЯ ПОДАЧИ ЗАЯВКИ
     * @param id ИДЕНТИФИКАТОР ВАКАНСИИ
     */
    openApplyDialog(id) {
      this.relation = {}
      this.relation.vacancyId = id
      this.relation.candidate = null
      this.getCatalog()
    },

    /**
     * *********************** ПЕРЕНАПРАВЛЕНИЕ НА РЕЗЮМЕ
     */
    redirectToResume() {
      router.push({ "name": "Cabinet" })
    },
    validateForm() {
      this.validation.source = !this.relation.vacancySource || this.relation.vacancySource === ""
      this.validation.ml = !this.file || this.file === ""
      return (!this.validation.source && !this.validation.ml)
    }
  },
  created() {
    this.getVacancies();
    this.userId = this.$store.state.loginedUser.userID;
  },
}
</script>

<style scoped>
.def-padding {
  padding-left: 20px;
  text-align: justify;
}
</style>
