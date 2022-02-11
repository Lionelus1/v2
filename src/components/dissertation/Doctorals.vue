<template>
  <div>
    <div class="p-col-12">
      <Toolbar class="p-mb-4">
        <template #end>
          <Button
            icon="pi pi-plus"
            class="p-button-success p-mr-2"
            @click="showAddCouncilDialog()"
          />
          <Button
            icon="pi pi-print"
            class="p-button-info p-mr-2"
          />
          <Button
            icon="pi pi-trash"
            class="p-button-danger"
            @click="deleteMember()"
            :disabled="!selectedDoctoral"
          />
        </template>
        <template #start>
          <h4>{{ $t("dissertation.doctorals") }}</h4>
        </template>
      </Toolbar>
      <DataTable
        selectionMode="single"
        v-model:selection="selectedDoctoral"
        style="font-size: smaller"
        :lazy="true"
        :totalRecords="DoctoralList.length"
        :value="DoctoralList"
        @page="reload($event)"
        :paginator="true"
        :rows="lazyParams.rows"
        dataKey="memberID"
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
        @sort="reload($event)"
        @filter="reload($event)"
      >
        <Column
          field="speciality"
          :header="$t('dissertation.directionCode')"
        >
          <template #body="slotProps">
            <span> {{ slotProps.data.speciality.code + '-'+ slotProps.data.speciality.nameInKz}}</span>
          </template>
        </Column>
        <Column
          field="speciality"
          :header="$t('dissertation.specialityCode')"
        >
          <template #body="slotProps">
            <span> {{ slotProps.data.speciality.trainingDirection.code + '-'+ slotProps.data.speciality.trainingDirection.nameInKz}}</span>
            
          </template>
        </Column>
        <Column
          field="user.fullName"
          :header="$t('common.fullName')"
          :sortable="true"
        ></Column>
        <Column field="user.organization.name" :header="$t('common.graduate')"></Column>
        <Column
          field="graduationYear"
          :header="$t('common.graduationyear')"
        ></Column>
        <Column
          field="admissionYear"
          :header="$t('common.admissionyear')"
        ></Column>
        <Column
          field="dissertation.namekz"
          :header="$t('dissertation.disstitle')"
          :sortable="true"
        ></Column>
        <Column
          field="meetingTime"
          :sortable="true"
          :header="$t('dissertation.meetingTime')"
        ></Column>
        <Column
          field="dissertation.language"
          :header="$t('dissertation.defenseLang')"
        >
        </Column>
        <Column
          field="councilDecision"
          :header="$t('dissertation.councilDecision')"
        >
          <template #body="slotProps">
            <span v-for="role in slotProps.data.roles" :key="role.id">
              {{ getRoleName(role) }}
            </span>
          </template>
        </Column>
      </DataTable>
      <Dialog
        v-model:visible="dialog.addDoctoral.state"
        :style="{ width: '600px' }"
        :header="$t('dissertation.doctoralCard')"
        :modal="true"
        :maximizable="true"
        class="p-fluid"
      >
        <div class="p-grid p-formgrid">
          <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
            <label  for="name">{{ $t("common.fullName") }}</label>
            <FindUser class="p-pt-1" 
              v-model="selectedUsers"
              :max="1"
              :editMode="true"
            ></FindUser>
            <small
              class="p-error"
              v-if="submitted && validationErrors.user"
            >{{ $t("common.requiredField") }}</small>
          </div>
          <div class="p-col-12 p-pb-2 p-lg-6 p-mb-lg-0">
            <label for="name">{{ ($t("common.graduate")  + ' (' + $t('common.hei') + ')' )}}</label>
            <DepartmentList class="p-pt-1" :autoLoad="true" v-model="doctoral.hei" :orgType="1" :editMode="true" @changed="getDepartments($event, $refs.departmentList)"></DepartmentList>
            <small
              class="p-error"
              v-if="submitted && validationErrors.hei"
            >{{ $t("common.requiredField") }}</small>
          </div>
          <div class="p-col-12 p-pb-2 p-lg-6 p-mb-lg-0">
            <label for="name">{{$t("common.faculty")}}</label>
            <DepartmentList class="p-pt-1" ref="departmentList" :orgType="2" v-model="selectedDepartment"  :editMode="true" @changed="getDepartments($event,$refs.cafedraList)"></DepartmentList>
            <small
              class="p-error"
              v-if="submitted && validationErrors.faculty"
            >{{ $t("common.requiredField") }}</small>
          </div>
          <div class="p-col-12 p-pb-2 p-lg-6 p-mb-lg-0">
            <label for="name">{{ $t("common.cafedra")}}</label>
            <DepartmentList class="p-pt-1" ref="cafedraList" :orgType="3" v-model="doctoral.cafedra" :editMode="true"></DepartmentList>
            <small
              class="p-error"
              v-if="submitted && validationErrors.cafedra"
            >{{ $t("common.requiredField") }}</small>
          </div>
          <div class="p-col-12 p-pb-2 p-lg-6 p-mb-lg-0">
            <label for="speciality">{{$t('dissertation.specialityCode')}}</label>
            <SpecialitySearch :style="'height:38px'" class="p-pt-1" :max="1" :educationLevel="Enums.EducationLevel.Doctorate"  v-model="selectedSpecialities" id="speciality"></SpecialitySearch>
            <small class="p-error" v-if="(submitted && validationErrors.speciality)">{{$t('dissertation.validationErrors.selectSpeciality')}}</small>
          </div>
          <div class="p-col-12 p-pb-2 p-lg-6 p-mb-lg-0">
            <label for="name">{{$t('common.learnlang')}}</label>
            <SelectButton style="height:35px" v-model="doctoral.teachlang" :options="language" class="p-mt-1">
              <template #option="slotProps">
                <div v-if="slotProps.option == 1">{{$t('common.language.kz')}}</div>
                <div v-else-if="slotProps.option == 2">{{$t('common.language.ru')}}</div>
                <div v-else>{{$t('common.language.en')}}</div>
              </template>
            </SelectButton>
            <small class="p-error" v-if="(submitted && validationErrors.teachlang)">{{$t('common.requiredField')}}</small>
          </div>
           <div class="p-col-12 p-pb-2 p-lg-6 p-mb-lg-0">
            <label for="name">{{$t('common.graduationyear')}}</label>
            <PrimeCalendar :placeholder="$t('common.select')" style="height:33px" class="p-pt-1" id="graduationyear" v-model="doctoral.graduationYear" view="year" dateFormat="yy"/>
            <small class="p-error" v-if="(submitted && validationErrors.graduationYear)">{{$t('common.requiredField')}}</small>
          </div>
          <div class="p-col-12 p-pb-2 p-lg-6 p-mb-lg-0">
            <label for="name">{{$t('common.admissionyear')}}</label>
            <PrimeCalendar :placeholder="$t('common.select')" style="height:33px" class="p-pt-1" id="admissionyear" v-model="doctoral.admissionYear" view="year" dateFormat="yy"/>
            <small class="p-error" v-if="(submitted && validationErrors.admissionYear)">{{$t('common.requiredField')}}</small>
          </div>
          <div class="p-col-12 p-pb-2 p-lg-12 p-mb-lg-0">
            <label for="namekz">{{$t('dissertation.disstitle') + ' ' + $t('common.language.kz')}}</label>
            <InputText :placeholder="$t('common.enter')" class="p-pt-1" type="text" id="namekz" v-model="doctoral.dissertation.namekz" />
            <small class="p-error" v-if="(submitted && validationErrors.namekz)">{{$t('common.requiredField')}}</small>
          </div>
          <div class="p-col-12 p-pb-2 p-lg-12 p-mb-lg-0">
            <label for="nameru">{{$t('dissertation.disstitle') + ' ' + $t('common.language.ru')}}</label>
            <InputText :placeholder="$t('common.enter')" class="p-pt-1" type="text" id="nameru" v-model="doctoral.dissertation.nameru" />
            <small class="p-error" v-if="(submitted && validationErrors.nameru)">{{$t('common.requiredField')}}</small>
          </div>
          <div class="p-col-12 p-pb-2 p-lg-12 p-md-6 p-mb-lg-0">
            <label for="nameen">{{$t('dissertation.disstitle') + ' ' + $t('common.language.en')}}</label>
            <InputText :placeholder="$t('common.enter')" class="p-pt-1" type="text" id="nameen" v-model="doctoral.dissertation.nameen" />
            <small class="p-error" v-if="(submitted && validationErrors.nameen)">{{$t('common.requiredField')}}</small>
          </div>
          <div class="p-col-12 p-pb-2 p-lg-12 p-mb-lg-0">
            <label for="namekz">{{$t('common.annotation') + ' ' + $t('common.language.kz')}}</label>
            <Textarea :placeholder="$t('common.enter')" class="p-pt-1" type="text" id="annotationkz" v-model="doctoral.dissertation.annotation.kz" />
            <small class="p-error" v-if="(submitted && validationErrors.annotationkz)">{{$t('common.requiredField')}}</small>
          </div>
          <div class="p-col-12 p-pb-2 p-lg-12 p-mb-lg-0">
            <label for="nameru">{{$t('common.annotation') + ' ' + $t('common.language.ru')}}</label>
            <Textarea :placeholder="$t('common.enter')" class="p-pt-1" type="text" id="annotaionru" v-model="doctoral.dissertation.annotation.ru" />
            <small class="p-error" v-if="(submitted && validationErrors.annotationru)">{{$t('common.requiredField')}}</small>
          </div>
          <div class="p-col-12 p-pb-2 p-lg-12 p-md-6 p-mb-lg-0">
            <label for="nameen">{{$t('common.annotation') + ' ' + $t('common.language.en')}}</label>
            <Textarea :placeholder="$t('common.enter')" class="p-pt-1" type="text" id="annotationen" v-model="doctoral.dissertation.annotation.en" />
            <small class="p-error" v-if="(submitted && validationErrors.annotationen)">{{$t('common.requiredField')}}</small>
          </div>
          <div class="p-col-12 p-pb-2 p-lg-4 p-mb-lg-0">
            <label for="abstractfile">{{$t('dissertation.abstractFile') + ' ' + $t('common.docFormat')}}</label>
            <FileUpload
                id="abstractfile"
                mode="basic"
                class= "p-mt-1"
                :customUpload="true"
                @uploader="uploadFile($event,'abstractFile')"
                :auto="true"
                accept=".doc,.docx"
                :fileLimit="1"
              >
              </FileUpload>
            <small class="p-error" v-if="(submitted && validationErrors.abstractFile)">{{$t('common.requiredField')}}</small>
          </div>
          <div class="p-col-12 p-pb-2 p-lg-4 p-mb-lg-0">
            <label for="dissertationfile">{{$t('dissertation.dissertationFile') + ' ' + $t('common.docFormat')}}</label>
            <FileUpload
                id="dissertationfile"
                mode="basic"
                class= "p-mt-1"
                :customUpload="true"
                @uploader="uploadFile($event, 'dissertationFile')"
                :auto="true"
                accept=".doc,.docx"
                :fileLimit="1"
              >
              </FileUpload>
            <small class="p-error" v-if="(submitted && validationErrors.dissertationFile)">{{$t('common.requiredField')}}</small>
          </div>
           <div class="p-col-12 p-pb-2 p-lg-4 p-mb-lg-5">
            <label for="swList">{{$t('dissertation.swList') + ' ' + $t('common.pdfFormat')}}</label>
            <FileUpload
                id="swList"
                mode="basic"
                :customUpload="true"
                class= "p-mt-1"
                @uploader="uploadFile($event, 'swListFile')"
                :auto="true"
                accept=".pdf"
                :fileLimit="1"
            >
            </FileUpload>
            <small class="p-error" v-if="(submitted && validationErrors.swListFile)">{{$t('common.requiredField')}}</small>
          </div>
        </div>
        <template #footer>
          <Button
            :label="$t('common.cancel')"
            icon="pi pi-times"
            class="p-button-text"
            @click="hideDialog(dialog.addDoctoral)"
          />
          <Button
            :label="$t('common.add')"
            icon="pi pi-check"
            class="p-button-text"
            @click="addDoctoral"
          />
        </template>
      </Dialog>
    </div>
  </div>
</template>
<script>
import { mapState } from "vuex";
import FindUser from "@/helpers/FindUser";
import Enums from "@/enum/docstates/index";
import axios from "axios";
import { getHeader, smartEnuApi } from "@/config/config";
import DepartmentList from '../smartenu/DepartmentList.vue';
import SpecialitySearch from "../smartenu/speciality/specialitysearch/SpecialitySearch.vue";

export default {
  components: { FindUser, DepartmentList, SpecialitySearch },
  data() {
    return {
      heiID: -1,
      councilID: -1,
      doctoral: {
        cafedra: null,
        hei: null,
        speciality: null,
        user: null,
        admissionYear: null,
        graduationYear: null,
        teachlang: null,
        dissertation: {
          namekz: null,
          nameru: null,
          nameen: null,
          annotation: {
            kz: null,
            ru: null,
            en: null,
          },
        }
      },
      abstractFile: null,
      dissertationFile: null,
      swListFile: null,
      language: [1, 2, 3],
      dialog: {
        addDoctoral: {
          state: false,
        },
        deleteMember: {
          state: false,
        },
      },
      selectedUsers: null,
      selectedDepartment: null,
      selectedDoctoral: null,
      selectedRole: null,
      selectedSpecialities: null,
      Enums: Enums,
      DoctoralList: [],
      DissertationCouncilRoles: [],
      membersCount: 10,
      submitted: false,
      validationErrors: {
        user: false,
        hei: false,
        faculty:false,
        cafedra: false,
        speciality: false,
        admissionYear: false,
        graduationYear: false,
        teachlang: false,
        nameru:false,
        namekz:false,
        nameen:false,
        annotationkz: false,
        annotationru: false,
        annotationen: false,
        abstractFile: false,
        dissertationFile:false,
        swListFile: false,
        
      },
      loading: false,
      lazyParams: {
        page: 0,
        rows: 10,
      },
    };
  },
  created() {
    this.councilID = Number(this.$route.params.id);
    this.getDoctorals();
  },
  methods: {
    getDepartments(event, departmentList) {
     
      departmentList.getDepartments(event.value.id);
    },
    isDissertationAdmin() {
      if (this.myDetails && this.myDetails.status)
        this.myDetails.status = this.statuses.indexOf(this.myDetails.status);
    },
    deleteMember(data) {
      if (data !== undefined) {
        this.selectedDoctoral = data;
      }
      this.$confirm.require({
        message: this.$t("common.confirmation"),
        header: this.$t("common.confirm"),
        icon: "pi pi-exclamation-triangle",
        accept: () => {
          axios
            .post(
              smartEnuApi + "/dissertation/deleteCouncilMember",
              { id: this.selectedDoctoral.memberID },
              {
                headers: getHeader(),
              }
            )
            .then((response) => {
              this.DoctoralList.splice(
                this.DoctoralList.indexOf(this.selectedDoctoral),
                1
              );
            })
            .catch((error) => {
              if (error.response.status == 401) {
                this.$store.dispatch("logLout");
              }
            });
        },
      });
    },

    showAddCouncilDialog() {
      this.selectedUsers = null;
      this.selectedRole = null;
      this.dialog.addDoctoral.state = true;
    },
    showDialog(dialog) {
      dialog.state = true;
    },
    hideDialog(dialog) {
      dialog.state = false;
    },
    uploadFile(event,ufile) {
      this[ufile] = event.files[0];
    },
    uploadDissertationNote(event) {
      this.dissertationFile = event.files[0];
    },
    reload(event) {
      //this.lazyParams = event;
      this.lazyParams = event;
      this.getDoctorals();
    },
    getDoctorals() {
      this.loading = true;
      let id = this.councilID;
      //this.lazyParams.countMode = null;
      axios
        .post(
          smartEnuApi + "/dissertation/getdoctorals",
          { userID:  this.$store.state.loginedUser.userID},
          {
            headers: getHeader(),
          }
        )
        .then((response) => {
          this.DoctoralList = response.data;
          this.loading = false;
        })
        .catch((error) => {
          if (error.response.status == 401) {
            this.$store.dispatch("logLout");
          }
        });
    },

    addDoctoral() {
      this.submitted = true;

      if (this.validateAddDoctoralForm()) {
        let data = new FormData()
        data.append("abstractFile", this.abstractFile);
        data.append("dissertationFile", this.dissertationFile)
        data.append("swListFile", this.swListFile)
        this.doctoral.user = this.selectedUsers[0]
        this.doctoral.speciality = this.selectedSpecialities[0]
        data.append("doctoral", JSON.stringify(this.doctoral))
        
        axios
          .post(
            smartEnuApi + "/dissertation/addDoctoral",
            data,
            {
              headers: getHeader(),
            }
          )
          .then((res) => {
            this.submitted = false;
            this.DoctoralList.push(res.data)
            this.hideDialog(this.dialog.addDoctoral)
          })
          .catch((error) => {
            if (error.response.status == 401) {
              this.$store.dispatch("logLout");
            }
             else {
              this.$toast.add({
                severity: "error",
                summary: "dissertationNewCouncilError\n" + error,
                life: 3000,
              });
            }
          });
      }
    },
    validateAddDoctoralForm() {
      this.validationErrors.user = !this.selectedUsers;
      this.validationErrors.hei = !this.doctoral.hei;
      this.validationErrors.faculty = !this.selectedDepartment;
      this.validationErrors.cafedra = !this.doctoral.cafedra;
      this.validationErrors.speciality = !this.selectedSpecialities;
      this.validationErrors.teachlang = !this.doctoral.teachlang;
      this.validationErrors.namekz = !this.doctoral.dissertation.namekz;
      this.validationErrors.nameru = !this.doctoral.dissertation.nameru;
      this.validationErrors.nameen = !this.doctoral.dissertation.nameen;
      this.validationErrors.admissionYear = !this.doctoral.admissionYear
      this.validationErrors.graduationYear = !this.doctoral.graduationYear;
      this.validationErrors.annotationkz = !this.doctoral.dissertation.annotation.kz
      this.validationErrors.annotationru = !this.doctoral.dissertation.annotation.ru
      this.validationErrors.annotationen = !this.doctoral.dissertation.annotation.en
      this.validationErrors.abstractFile = !this.abstractFile
      this.validationErrors.dissertationFile = !this.dissertationFile
      this.validationErrors.swListFile = !this.swListFile 
      let result = true
      for (var key of Object.keys(this.validationErrors)) {
        result = result && !this.validationErrors[key]
      }
      return result

    },
    getRoleName(role) {
      //alert("Hello");
      switch (this.$i18n.locale) {
        case "kz":
          return role.kz;
        case "en":
          return role.en;
        case "ru":
          return role.ru;
      }
    },
  },
  computed: {
    ...mapState(["loginedUser"]),
  },
};
</script>
<style scoped>
.rowclass {
  font-size: 13pt;
}
</style>