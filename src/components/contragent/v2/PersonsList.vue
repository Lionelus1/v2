<template>
  <h3 v-if="personType == 1">
    {{$t("common.individualEntrepreneur")}}
  </h3>
  <h3 v-else-if="personType == 2">
  {{   $t("common.personal")  }}
  </h3>
  <h3 v-else-if="personType == 3">
  {{ $t("common.students") }}
  </h3>
  <h3 v-else-if="personType == 4">{{$t('common.graduates')}}</h3>
  <h3 v-else-if="!organization">{{ $t("common.individualEntrepreneur") }}</h3>
  <h3 v-else>{{ $t("contragent.orgEmployees", {"org": getOrganizationName(organization)}) }}</h3>
  <ToolbarMenu class="m-0 pt-0 pb-0" :data="menu" @filter="toggle('filterOverlayPanel', $event)" :filter="true" :filtered="filtered"></ToolbarMenu>
  <div class="card">
    <DataTable :value="persons" dataKey="userID" :rows="rows" :totalRecords="total"
      :paginator="true" :paginatorTemplate="paginatorTemplate" :rowsPerPageOptions="[10, 25, 50]"
      :currentPageReportTemplate="currentPageReportTemplate" :lazy="true" :loading="tableLoading"
      scrollable scrollHeight="flex" v-model:selection="currentPerson" selectionMode="single"
      :rowHover="true" stripedRows class="flex-grow-1" @page="onPage">
      <template #empty>
        {{ this.$t("common.recordsNotFound") }}
      </template>
      <Column v-if="sidebar" selectionMode="single" style="min-width: 20px; max-width: 40px;"></Column>
      <Column :header="$t('contragent.columns.name')" style="min-width: 150px;">
        <template #body="slotProps">
          <Button class="p-button-link text-left" @click="currentPerson=slotProps.data; personSelected()">
            {{ getPersonName(slotProps.data) }}
          </Button>
        </template>
      </Column>
      <Column v-if="!organization && personType != 3 && personType != 4" :header="$t('common.organization')" style="min-width: 250px;">
        <template #body="slotProps">
          {{ slotProps.data.mainPosition && slotProps.data.mainPosition.organization.id > 0 ?
            getOrganizationName(slotProps.data.mainPosition.organization) : '' }}
        </template>
      </Column>
      <Column v-if="!organization" :header="(personType == 3 || personType == 4) ? $t('web.degreeLevel') : $t('contact.position')" style="min-width: 250px;">
        <template #body="slotProps">
          {{ slotProps.data.mainPosition ? getPositionName(slotProps.data.mainPosition) : '' }}
        </template>
      </Column>
<!--      <Column v-if="personType == 3 || personType == 4" :header="$t('common.faculty')" style="min-width: 250px;">-->
<!--        <template #body="slotProps">-->
<!--          {{ slotProps.data.mainPosition ? getPositionName(slotProps.data.mainPosition.department?.parent) : '' }}-->
<!--        </template>-->
<!--      </Column>-->
      <Column v-if="personType == 3 || personType == 4" :header="$t('educationalPrograms.epg')" style="min-width: 250px;">
        <template #body="slotProps">
          {{ slotProps.data.educational_program_group ? getEducationalProgramGroup(slotProps.data.educational_program_group) : '' }}
        </template>
      </Column>
      <Column v-if="personType == 3 || personType == 4" :header="$t('educationalPrograms.ep')" style="min-width: 250px;">
        <template #body="slotProps">
          {{ slotProps.data.speciality ? localizeSpecialities(slotProps.data.speciality) : '' }}
        </template>
      </Column>
      <Column v-if="personType != 3 && personType != 4" field="IIN" :header="$t('contact.iin')" style="min-width: 100px;"></Column>
      <Column v-if="personType != 3 && personType != 4" field="email" :header="$t('contact.email')" style="min-width: 50px;"></Column>
    </DataTable>
  </div>
  <!-- personPage -->
  <Sidebar v-model:visible="visibility.personPage" position="right" style="width: 60%;" class="p-sidebar-lg">    
    <PersonPage :person="currentPerson" @personUpdated="personUpdated" :custom-type="customType" :personType="personType"></PersonPage>
  </Sidebar>

  <div v-if="visibility.shareResume">
    <AddEditMailing :isVisible="visibility.shareResume" :value="shareData"></AddEditMailing>
  </div>

  <OverlayPanel ref="filterOverlayPanel">
    <div class="col-12 md:col-12 p-fluid">
          <div class="grid formgrid">
      <div class="col-6 mb-2 pb-2 lg:col-6 mb-lg-0">
        <label>{{ $t('common.fullName') }}</label>
        <InputText  @keyup.enter="getPersons" v-model="filter.name" :placeholder="$t('common.search')"/>
      </div>
      <div v-if="personType == 3 || personType == 4" class="col-6 mb-2 pb-2 lg:col-6 mb-lg-0">
        <label>{{ $t('web.degreeLevel') }}</label>
        <Dropdown class="dropdown" v-model="academicDegree" :options="academicDegrees"
                  :optionLabel="'name'+this.$i18n.locale" :placeholder="this.$t('common.select')"
                  :filter="true" :showClear="true"
                  dataKey="value" :emptyFilterMessage="this.$t('roleControl.noResult')"
                  @filter="handleFilterDepartment"/>
      </div>
      <div v-if="personType == 3" class="col-6 mb-2 pb-2 lg:col-6 mb-lg-0">
        <label>{{ $t('common.faculty') }}</label>
        <Dropdown class="dropdown" v-model="selectedDepartment" :options="departments"
                  :optionLabel="localizeDepartment" :placeholder="this.$t('common.select')"
                  :filter="true" :showClear="true"
                  dataKey="id" :emptyFilterMessage="this.$t('roleControl.noResult')"
                  @filter="handleFilterDepartment" @change="handleSelectionChange"/>
      </div>
      <div v-if="personType == 3 || personType == 4" class="col-6 mb-2 pb-2 lg:col-6 mb-lg-0">
        <label>{{ $t('educationalPrograms.epg') }}</label>
        <Dropdown class="dropdown" v-model="educationalProgramGroup" :options="educationalProgramGroups"
                  :optionLabel="localizeEducationalProgramGroup" :placeholder="this.$t('common.select')"
                  :filter="true" :showClear="true"
                  dataKey="id" :emptyFilterMessage="this.$t('roleControl.noResult')"
                  @filter="handleFilterGetEducationalProgramGroup" @change="handleEducationalProgramGroupChange"/>
      </div>
      <div v-if="personType == 3" class="col-6 mb-2 pb-2 lg:col-6 mb-lg-0">
        <label>{{ $t('common.cafedra') }}</label>
        <Dropdown class="dropdown" v-model="selectedDepartmentCafedra" :options="departmentsCafedra"
                  :optionLabel="localizeDepartment" :placeholder="this.$t('common.select')"
                  :filter="true" :showClear="true"
                  dataKey="id" :emptyFilterMessage="this.$t('roleControl.noResult')"
                  @filter="handleFilterDepartmentCafedra" @change="handleSelectionChange"/>
      </div>
      <div v-if="personType == 3 || personType == 4" class="col-6 mb-2 pb-2 lg:col-6 mb-lg-0">
        <label>{{ $t('educationalPrograms.ep') }}</label>
        <Dropdown class="dropdown" v-model="specialist" :options="specialists"
                  :optionLabel="localizeSpecialities" :placeholder="this.$t('common.select')"
                  :filter="true" :showClear="true"
                  dataKey="id" :emptyFilterMessage="this.$t('roleControl.noResult')"
                  @filter="handleSelectionChange"/>
      </div>
          <div v-if="personType == 4" class="col-6 mb-2 pb-2 lg:col-6 mb-lg-0">
              <label>{{ $t('hr.edu.receiptDate') }}</label>
              <PrimeCalendar  v-model="filter.admissionYear" view="year" dateFormat="yy" />
            </div>
            <div v-if="personType == 4" class="col-6 mb-2 pb-2 lg:col-6 mb-lg-0">
              <label>{{ $t('hr.edu.expirationDate') }}</label>
              <PrimeCalendar v-model="filter.graduationYear" view="year" dateFormat="yy" />
            </div>
      </div>
      <hr>

      <div v-if="personType == 3 || personType == 4" class="col-12 md:col-12 p-fluid">
        <div class="grid formgrid">
        <div v-if="personType == 3 || personType == 4" class="col-6 mb-2 pb-2 lg:col-6 mb-lg-0">
          <label>{{ $t('common.paymentForm') }}</label>
          <Dropdown class="dropdown" v-model="paymentForm" :options="paymentForms"
                    :optionLabel="'name'+this.$i18n.locale" :placeholder="this.$t('common.select')"
                    :showClear="true" dataKey="id" :emptyFilterMessage="this.$t('roleControl.noResult')"/>
        </div>
        <div v-if="personType == 3 || personType == 4" class="col-6 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>GPA</label>
            <div class="col-3 mb-2 pb-2 lg:col-3 mb-lg-0 flex justify-content-space-between">
              <label class="mt-2">Min</label><InputNumber v-model="gpaMin" mode="decimal" :minFractionDigits="2" :maxFractionDigits="2" class="col-12 mb-lg-0"></InputNumber>
              <label class="mt-2">Max</label><InputNumber v-model="gpaMax" mode="decimal" :minFractionDigits="2" :maxFractionDigits="2" class="col-12 lg:col-12 mb-lg-0"></InputNumber>
          </div>
        </div>
          <div v-if="personType == 3 || personType == 4" class="col-6 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>Статус заполнения резюме</label>
            <Dropdown class="dropdown" v-model="resumeView" :options="resumeViews"
                      :optionLabel="'name'+this.$i18n.locale" :placeholder="this.$t('common.select')"
                      :showClear="true" dataKey="id" :emptyFilterMessage="this.$t('roleControl.noResult')"/>
          </div>
        </div>
      </div>

      <div v-if="personType == 3 || personType == 4">
        <Checkbox v-model="checked" :binary="true" /> Люди с особыми потребностями
      </div>

      <div class="flex justify-content-end">
          <div class="mb-2 mr-2">
            <Button :label="$t('common.clear')" @click="clearFilter();toggle('filterOverlayPanel', $event)" class="mb-2 pb-2 p-button-outlined"/>
          </div>
          <div>
            <Button :label="$t('common.search')" @click="saveFilter();toggle('filterOverlayPanel', $event)" class="mb-2 pb-2"/>
          </div>
      </div>
        </div>
  </OverlayPanel>

</template>
<script>
import { ContragentService } from "@/service/contragent.service";
import PersonPage from "@/components/contragent/v2/PersonPage";
import api from "@/service/api";
import {apiDomain, findRole, getHeader, smartEnuApi} from "@/config/config";
import department from "@/components/smartenu/Department.vue";
import JSZip from "jszip";
import { saveAs } from 'file-saver';
import AddEditMailing from "@/components/mailing/AddEditMailing.vue";
import CryptoJS from 'crypto-js';

export default {
  name: 'PersonsList',
  computed: {
    menu () { return [
      {
        icon: "pi pi-fw pi-refresh",
        command: () => { this.getPersons(); }
      },
      {
        label: this.$t("bank.card"),
        icon: "pi pi-fw pi-id-card",
        disabled: !this.currentPerson,
        command: () => { this.open('personPage'); }
      },
      {
        label: this.$t("contragent.menu.select"),
        icon: "fa-regular fa-square-check",
        disabled: () => !this.currentPerson,
        visible: this.sidebar,
        command: () => { this.$emit('personSelected', this.currentPerson); }
      },
      {
        label: this.$t("common.createNew"),
        icon: "pi pi-fw pi-plus",
        command: () => {
          this.addPerson()
        },
        disabled: () => this.personType != 3
      },
      {
        label: this.$t("common.downloadResume"),
        icon: "pi pi-fw pi-download",
        command: () => { this.downloadResume(); },
        disabled: !(this.isVisible && !(this.personType === 3 || this.personType === 4))
      },
      {
        label: this.$t("common.share"),
        icon: "pi pi-fw pi-share-alt",
        command: () => { this.shareResults(); },
        disabled: !(this.isVisible && !(this.personType === 3 || this.personType === 4))
      },
      // {
      //   label: this.$t("students.report")disabled,
      //   icon: "pi pi-fw pi-file",
      //   command: () => { this.generateReport(); },
      //   visible: () => (this.personType == 3 || this.personType == 4)
      // }
    ]},
    department() {
      return department
    }
  },
  components: {AddEditMailing, PersonPage },
  props: {
    organization: null,
    signers: {
      type: Boolean,
      default: false
    },
    sidebar: {
      type: Boolean,
      default: false
    }
  },
  emits: ['personSelected'],
  data() {
    return {
      service: new ContragentService(),
      paginatorTemplate: "FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink JumpToPageDropdown CurrentPageReport RowsPerPageDropdown",
      currentPageReportTemplate: this.$t('common.showingRecordsCount', {
          first: '{first}',
          last: '{last}',
          totalRecords: '{totalRecords}',
        }),

      visibility: {
        personPage: false,
        shareResume: false,
      },

      tableLoading: false,

      persons: [],
      currentPerson: null,
      total: 0,
      page: 0,
      rows: 10,

      filter: {
        name: '',
        departmentId: null,
        facultyId: null,
        cafedraId: null,
        paymentFormId: null,
        graduationYear: null,
        admissionYear: null,
      },

      personType: null,
      customType: '',
      tempFilter: {
        author: [],
        departmentId: null,
        departmentFacultyId: null,
        departmentCafedraId: null,
      },
      filtered: false,
      selectedDepartment: null,
      selectedDepartmentParent: null,
      selectedDepartmentCafedra: null,
      selectedDepartmentGroup: null,
      departments:[],
      departmentsParent: [],
      departmentsCafedra: [],
      departmentsGroup: [],
      searchText: null,
      academicDegrees: [
        {namekz: "Бакалавр", nameru:"Бакалавр",nameen:"Bachelor", value: 'Бакалавр'},
        {namekz: 'Магистрант (бейіндік бағыт)', nameen: 'Master (specialized)', nameru: 'Магистрант (профильное направление)', value: 'Магистрант (профильное направление)'},
        {namekz: 'Бакалавриат (ғылыми-педагогикалық бағыт)', nameen: 'Master (scientific-pedagogical)', nameru: 'Магистрант (научно-педагогическое направление)', value: 'Магистрант (научно-педагогическое направление)'},
        {namekz: 'Докторант PhD', nameen: 'PhD student', nameru: 'Докторант PhD', value: 'Докторант PhD'},
      ],
      academicDegree: null,
      specialitieFilter: {
        searchText: null,
        page: 0,
        rows: 25,
        educational_program_group_id: null
      },
      specialists: [],
      specialist: null,
      educationalProgramFilter: {
        searchText: null,
        page: 0,
        rows: 25,
        faculty_id: null,
        cafedra_ids: []
      },
      educationalProgramGroups: [],
      educationalProgramGroup: null,
      paymentForms: [
        {namekz:"Келісімшарт", nameru:"Договор", nameen:"Deal", id:1},
        {namekz:"Мемлекеттік грант", nameru:"Государственный грант", nameen:"Government grant", id:2},
        {namekz:"Алмасу бойынша", nameru:"По обмену", nameen:"By exchange", id:3},
      ],
      paymentForm: null,
      gpaMin: null,
      gpaMax: null,
      resumeViews: [
        {namekz:"Барлығы", nameru:"Все", nameen:"All", id:0},
        {namekz:"Түйіндемені толтырды", nameru:"Заполнил резюме", nameen:"Filled out a CV", id:1},
        {namekz:"Түйіндемені толтырған жоқ", nameru:"Не заполнил резюме", nameen:"Didn't fill out a CV", id:2},
      ],
      resumeView: null,
      admissionYears: [],
      graduationYears: [],
      isVisible: false,
      resumeContainer: null,
      shareData: null,
    }
  },
  watch: {
    "$route.params.type": function (type) {
      this.personType = type;
      this.getPersons();
    },
  },
  mounted() {
    if (!this.sidebar) {
      this.$emit('apply-flex', true);
    }

    this.emitter.on('addEditMailingDialogHide', data => {
      this.visibility.shareResume = false
    });

    this.personType = this.$route.params.type;
    this.getPersons();
    this.getFaculties();
    this.getCafedras();
    this.getGroups();
    this.getSpecialities();
    this.getEducationalProgramGroups()
  },
  beforeUnmount() {
    if (!this.sidebar) {
      this.$emit('apply-flex', false);
    }
  },
  created() {
    this.fillYears();
  },
  methods: {
    findRole: findRole,
    showMessage(msgtype, message, content) {
      this.$toast.add({
        severity: msgtype,
        summary: message,
        detail: content,
        life: 3000
      });
    },
    open(name) {
      this.visibility[name] = true
    },
    close(name) {
      this.visibility[name] = false
    },
    getPersonName(person) {
      let name = '';

      if (this.$i18n.locale === 'en' && this.validString(person.thirdnameEn) && this.validString(person.firstnameEn)) {
        name = person.thirdnameEn + ' ' + person.firstnameEn

        if (this.validString(person.lastnameEn)) {
          name += ' ' + person.lastnameEn
        }

        return name
      }

      name = person.thirdName + ' ' + person.firstName 
      
      if (this.validString(person.lastName)) {
        name += ' ' + person.lastName
      }

      return name
    },
    getPositionName(position) {
      if (position === undefined || position === '') {
        return ''
      }
      if (this.$i18n.locale === 'kz' && this.validString(position.namekz)) {
        return position.namekz;
      } else if (this.$i18n.locale === 'ru' && this.validString(position.nameru)) {
        return position.nameru;
      } else if (this.$i18n.locale === 'en' && this.validString(position.nameen)) {
        return position.nameen;
      }

      return position.name;
    },
    getOrganizationName(org) {
      let name = '';

      if (this.$i18n.locale === 'kz' && this.validString(org.name)) {
        if (org.form) {
          name = '"' + org.name + '" ' + org.form.shortname;
        } else {
          name = org.name;
        }
      } else if (this.$i18n.locale === 'ru' && this.validString(org.nameru)) {
        if (org.form) {
          name = org.form.shortnameru + ' "' + org.nameru + '"';
        } else {
          name = org.nameru;
        }
      } else if (this.$i18n.locale === 'en' && this.validString(org.nameen)) {
        if (org.form && org.form.shortnameen) {
          name = org.form.shortnameen + ' "' + org.nameen + '"';
        } else {
          name = org.nameen;
        }
      } else if (org.name) {
        name = org.name;
      }

      return name;
    },
    onPage(event) {
      this.page = event.page;
      this.rows = event.rows;
      this.getPersons();
    },
    getPersons() {
      this.customType = 'viewUser'
      this.tableLoading = true;

      const searchMode = this.personType == 1 ? "individual_entrepreneur" : this.personType == 2 ? "staff"
          : this.personType == 3 ? "student" : this.personType == 4 ? "graduate" : null;

      if (this.personType != 3 && this.personType != 4) {
        this.filter = {
          departmentId: null,
          cafedraId: null,
          facultyId: null,
          name: this.filter?.name ?? '',
        }
      }

      if (this.personType != 4) {
        this.filter.admissionYear = null
        this.filter.graduationYear = null
      }

      const ldap = (this.personType == 3 || this.personType == 2) && (this.filter?.name?.length > 3 ?? false);
      this.service.getPersons({
        page: this.page,
        rows: this.rows,
        filter: {
          orgId: this.organization ? this.organization.id : null,
          name: this.filter.name,
          signers: this.signers,
          departmentId: this.filter.departmentId,
          departmentParentId: this.filter.facultyId,
          departmentCafedraId: this.filter.cafedraId,
          positionName: this.academicDegree?.value,
          educationProgramId: this.specialist?.id,
          educationProgramGroupId: this.educationalProgramGroup?.id,
          paymentFormId: this.filter.paymentFormId,
          gpa_min: this.gpaMin,
          gpa_max: this.gpaMax,
          resumeView: this.resumeView?.id,
          admissionYear: this.filter.admissionYear,
          graduationYear: this.filter.graduationYear
        },
        searchMode: searchMode,
        searchCookie: this.searchCookie,
        ldap: ldap,
      }).then(res => {
        this.persons = res.data.foundUsers;
        this.total = res.data.total;
        this.currentPerson = null;
        this.searchCookie = res.data.searchCookie;

        this.tableLoading = false;
      }).catch(err => {
        this.persons = [];
        this.total = 0;
        this.currentPerson = null;

        if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout");
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath), null);
        } else {
          console.log(err);
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'));
        }

        this.tableLoading = false;
      })
    },
    personSelected() {
      if (!this.sidebar) {
        this.customType = 'viewUser'
        this.open('personPage');
        return;
      }

      if (this.validString(this.currentPerson.firstName) && this.validString(this.currentPerson.thirdName) && 
        this.validString(this.currentPerson.email)) {
          this.customType = 'viewUser'
          this.$emit('personSelected', this.currentPerson);
      } else {
        this.customType = 'viewUser'
        this.open('personPage');
      }
    },
    personUpdated(event) {
      this.getPersons();
    },
    validString(str) {
      if (str && str.length > 0) {
        return true;
      }

      return false;
    },
    addPerson(type){
      const searchMode = type == 2 ? "staff" : type == 3 ? "student" : null;

      
      this.currentPerson = {
        IIN: null,
        name: null,
        type: null,
        mail: null,
        info: null,
        id : null,
        photo: null,
        lastName: null,
        thirdName: null,
        firstName: null,
        birthday: null,
        gender: null,
        state: null,
        residnet: null,
        locality: {
          id: null,
          name: null,
        },
        address: null, 
        addressrus: null,
        phone: null,
        email: null,
        idnumber: null,

        mainPosition: {
          id: null,
          name:null,
          nameen: null,
          namekz:null,
          nameru:null,
        },
        bank: {}
        
      }
      this.visibility.personPage = true
      this.customType = 'createUser';
    },
    toggle(ref, event) {
      if (ref === 'filterOverlayPanel') {
        this.tempFilter = JSON.parse(JSON.stringify(this.filter));
        this.tempFilter.createdFrom = this.tempFilter.createdFrom ? new Date(this.tempFilter.createdFrom) : null;
        this.tempFilter.createdTo = this.tempFilter.createdTo ? new Date(this.tempFilter.createdTo) : null;
      }

      this.$refs[ref].toggle(event);
    },
    clearFilter() {
      this.filter = {
        name: null,
        cafedraId: null,
        departmentId: null,
        departmentParentId: null,
        departmentsGroup: null,
      };

      this.selectedDepartment = null
      this.selectedDepartmentGroup = null
      this.selectedDepartmentParent = null
      this.selectedDepartmentCafedra = null
      this.specialist = null
      this.filtered = false;
      this.specialitieFilter = {
        searchText: null,
        faculty_id: null,
        cafedra_ids: [],
      }
      this.educationalProgramGroup = null
      this.getPersons()
    },
    saveFilter() {

      if (this.selectedDepartment) {
          this.filter.facultyId = this.selectedDepartment?.id;
      } else {
        this.filter.facultyId = null
      }


      if (this.selectedDepartmentCafedra) {
        this.filter.cafedraId = this.selectedDepartmentCafedra?.id;
      } else {
        this.filter.cafedraId = null
      }

      if (this.selectedDepartmentGroup) {
        this.filter.departmentId = this.selectedDepartmentGroup?.id
      } else {
        this.filter.departmentId = null
      }

      if (this.paymentForm) {
        this.filter.paymentFormId = this.paymentForm.id
      } else {
        this.filter.paymentFormId = null
      }
      this.isVisible = true
      this.getPersons()
    },
    localizeDepartment(department) {
      const localizedText = this.$t(department['name'+this.capitalize(this.$i18n.locale)])
      return localizedText
    },
    capitalize(str) {
      if (typeof str !== 'string') return '';
      return str.charAt(0).toUpperCase() + str.slice(1);
    },
    handleFilterDepartment(event) {
      if (event && event.length > 1) {
        this.searchText = event
        this.getFaculties()
      } else {
        this.searchText = null
        this.getFaculties()
      }
    },
    handleFilterDepartmentCafedra(event) {
      if (event && event.length > 1) {
        this.searchText = event
        this.getCafedras()
      } else {
        this.searchText = null
        this.getCafedras()
      }
    },
    handleFilterDepartmentGroup(event) {
      if (event && event.length > 1) {
        this.searchText = event
        this.getGroups()
      } else {
        this.searchText = null
        this.getGroups()
      }
    },
    getDepartments(type)  {
      this.loading = true
      const orgId = 1

      const req = {
        orgId: orgId,
        searchText: this.searchText,
        parentId: this.parentId,
        cafedraId: this.cafedraId,
        type: type,
      }

      api.post('/departments', req, {
        headers: getHeader()
      }).then(res => {

        switch (type) {
          case 'faculty':
            this.departments = res.data.departments;
            break;
          case 'cafedra':
            this.departmentsCafedra = res.data.departments;
            break;
          case 'group':
            this.departmentsGroup = res.data.departments;
            break;
          default:
            console.error(`Unknown type: ${type}`);
        }

        this.loading = false
      }).catch(err => {
        this.faculties = []

        if (err.response && err.response.data && err.response.data.localized) {
          this.$toast.add({
            severity: "error",
            summary: this.$t(err.response.data.localizedPath),
            life: 3000,
          })
        } else {
          console.log(err)
          this.$toast.add({
            severity: "error",
            summary: this.$t('common.message.actionError'),
            life: this.$t('common.message.actionErrorContactAdmin'),
          })
        }

        this.loading = false;
      })
    },
    getFaculties() {
      return this.getDepartments('faculty');
    },
    getCafedras() {
      return this.getDepartments('cafedra');
    },
    getGroups() {
      return this.getDepartments('group');
    },
    handleSelectionChange() {
      if (this.selectedDepartment) {
        this.parentId = this.selectedDepartment.id
        this.cafedraId = null
        this.selectedDepartmentGroup = null
        if (this.selectedDepartmentCafedra && this.selectedDepartmentCafedra.parentId !== this.selectedDepartment.id) {
          this.selectedDepartmentCafedra = null
        }

        this.getCafedras()
        this.getGroups()

        if (this.selectedDepartmentCafedra) {
          this.specialitieFilter.cafedra_ids = []
          this.educationalProgramFilter.cafedra_ids.push(this.selectedDepartmentCafedra.id)
          this.educationalProgramFilter.faculty_id = null
        } else {
          this.educationalProgramFilter.cafedra_ids = []
          this.educationalProgramFilter.faculty_id = this.selectedDepartment?.id
        }

        this.getEducationalProgramGroups()
      } else {
        this.parentId = null
      }

      if (this.selectedDepartmentCafedra) {
        this.cafedraId = this.selectedDepartmentCafedra.id
        this.selectedDepartmentGroup = null
        this.getGroups()

        if (!this.selectedDepartment) {
          this.educationalProgramFilter.cafedra_ids = []
          this.educationalProgramFilter.cafedra_ids.push(this.selectedDepartmentCafedra.id)
          this.educationalProgramFilter.faculty_id = null
          this.getEducationalProgramGroups()
        }
      } else {
        this.cafedraId = null
      }
    },
    getSpecialities() {
      let url = "/getspecialities";
      api.post(url, {
            "name" : this.specialitieFilter?.searchText,
            "level" : this.educationLevel,
            "page": this.specialitieFilter?.page,
            "rows": this.specialitieFilter?.rows,
            "educational_program_group_id": this.specialitieFilter?.educational_program_group_id
          },
      )
          .then(response=>{
            this.specialists = response.data;
            this.searchInProgres = false;
          })
          .catch((error) => {
              this.$toast.add({
                severity: "error",
                summary: "getSpeciliatyListError:\n" + error,
                life: 3000,
              });
              this.searchInProgres = false;
              if (error.response.status === 404) {
                this.foundSpecialists = null;
              }
          });
    },
    handleFilterSpecialities(event) {
      if (event && event.length > 1) {
        this.specialitieFilter.searchText = event
        this.getSpecialities()
      } else {
        this.specialitieFilter.searchText = null
        this.getSpecialities()
      }
    },
    localizeSpecialities(specialist) {
      const localizedText = this.$t(specialist['nameIn'+this.capitalize(this.$i18n.locale)])
      return specialist?.code + " " + localizedText
    },
    getEducationalProgramGroups() {
      let url = "/educational/program/group/get";
      api.post(url, {
            "id" : this.educationalProgramFilter?.searchText,
            "searchText" : this.educationalProgramFilter.searchText,
            "page": this.educationalProgramFilter?.page,
            "rows": this.educationalProgramFilter?.rows,
            "faculty_id": this.educationalProgramFilter.faculty_id,
            "cafedra_ids": this.educationalProgramFilter.cafedra_ids
          },
      )
          .then(response=>{
            this.educationalProgramGroups = response.data.educational_program_groups;
          })
          .catch((error) => {
            this.$toast.add({
              severity: "error",
              summary: error,
              life: 3000,
            });
            this.searchInProgres = false;
            if (error.response.status === 404) {
              this.foundSpecialists = null;
            }
          });
    },
    handleFilterGetEducationalProgramGroup(event) {
      if (event && event.length > 1) {
        this.educationalProgramFilter.searchText = event
        this.getEducationalProgramGroups()
      } else {
        this.educationalProgramFilter.searchText = null
        this.getEducationalProgramGroups()
      }
    },
    localizeEducationalProgramGroup(eduactionalProgramGroup) {
      const localizedText = this.$t(eduactionalProgramGroup['name_'+(this.$i18n.locale)])
      return eduactionalProgramGroup?.code + " " + localizedText
    },
    handleEducationalProgramGroupChange() {
      if (this.educationalProgramGroup) {
        this.specialitieFilter.educational_program_group_id = this.educationalProgramGroup?.id
        this.specialist = null
        this.getSpecialities()
      } else {
        this.specialist = null
        this.specialitieFilter.educational_program_group_id = null
        this.getSpecialities()
      }
    },
    getEducationalProgramGroup(educationalProgramGroup) {
      console.log("educationalProgramGroup: ", educationalProgramGroup)
      if (educationalProgramGroup === undefined || educationalProgramGroup === '') {
        return ''
      }
      if (this.$i18n.locale === 'kz' && this.validString(educationalProgramGroup.name_kz)) {
        return educationalProgramGroup.code + " " + educationalProgramGroup.name_kz;
      } else if (this.$i18n.locale === 'ru' && this.validString(educationalProgramGroup.name_ru)) {
        return educationalProgramGroup.code + " " + educationalProgramGroup.name_ru;
      } else if (this.$i18n.locale === 'en' && this.validString(educationalProgramGroup.name_en)) {
        return educationalProgramGroup.code + " " + educationalProgramGroup.name_en;
      }

      return '';
    },
    fillYears() {
      const currentYear = new Date().getFullYear();
      for (let i = 0; i <= this.yearsRange; i++) {
        this.admissionYears.push(currentYear - i);
        this.graduationYears.push(currentYear - i);
      }
    },

    async downloadResume() {
      const selectedPersons = this.persons.filter(person => person.userID);

      if (selectedPersons.length === 1) {
        const studentId = selectedPersons[0].userID;
        try {
          const pdfBase64 = await this.getResume(studentId);
          const pdfData = atob(pdfBase64.split(',')[1]);

          const arrayBuffer = new ArrayBuffer(pdfData.length);
          const uint8Array = new Uint8Array(arrayBuffer);
          for (let i = 0; i < pdfData.length; i++) {
            uint8Array[i] = pdfData.charCodeAt(i);
          }
          const pdfBlob = new Blob([uint8Array], { type: 'application/pdf' });

          saveAs(pdfBlob, `${selectedPersons[0].fullName}.pdf`);
        } catch (error) {
          console.error('Failed to download resume:', error);
        }
      } else if (selectedPersons.length > 1) {
        const zip = new JSZip();

        for (const person of selectedPersons) {
          const studentId = person.userID;
          try {
            const pdfBase64 = await this.getResume(studentId);
            const pdfData = atob(pdfBase64.split(',')[1]);

            // Convert base64 to Blob
            const arrayBuffer = new ArrayBuffer(pdfData.length);
            const uint8Array = new Uint8Array(arrayBuffer);
            for (let i = 0; i < pdfData.length; i++) {
              uint8Array[i] = pdfData.charCodeAt(i);
            }
            const pdfBlob = new Blob([uint8Array], { type: 'application/pdf' });

            zip.file(`${person.fullName}.pdf`, pdfBlob);
          } catch (error) {
            console.error(`Failed to download resume for ${person.name}:`, error);
          }
        }

        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, "resumes.zip");
      }
    },

    async getResume(studentId) {
      try {
        const response = await this.service.getResume({ userID: studentId });
        if (!response.data) {
          throw new Error('Пустой ответ от сервера');
        }

        const base64Data = `data:application/pdf;base64,${response.data}`;

        return base64Data;
      } catch (error) {
        console.error('Ошибка при загрузке резюме:', error);
        throw error;
      }
    },

    shareResults() {
      console.log(this.persons);

      this.shareData = '<div>';

      this.persons.forEach(async person => {
        const result = await this.service.checkResume({ userID: person.userID });
        console.log('result: ', result);
        if (result?.data === true) {
          const hashedUserId = this.hashUserId(person.userID.toString());
          this.shareData += `
          <p>
            <a href="${apiDomain}/user/cv/${hashedUserId}">${person.fullName}</a>
          </p>
        `;
        }
      });

      this.shareData += '</div>';

      this.visibility.shareResume = true;
    },

    hashUserId(userId) {
      const secretKey = 'secretKey';
      const encrypted = CryptoJS.AES.encrypt(userId, secretKey).toString();
      return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(encrypted));
    },

    encode(str) {
      return Buffer.from(str, 'utf8').toString('base64');
    },

    decode(encodedStr) {
      return Buffer.from(encodedStr, 'base64').toString('utf8');
    },

    hideDialog() {
    },

    // Метод для инициирования скачивания файла
    downloadFile(fileContent, fileName) {
      const url = window.URL.createObjectURL(fileContent);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
  }
}

</script>
<style scoped>

:deep(.p-datatable.p-datatable-scrollable > .p-datatable-wrapper > .p-datatable-table > .p-datatable-thead) {
  background: transparent;
}

.p-sidebar-lg {
    width: 300px; 
  }

  @media only screen and (max-width: 1024px) {
    .p-sidebar {
      width: 100%;
    }
  }
</style>