<template>
  <div v-if="!progressed">
    <h5><em>{{ $t('hr.resume.loading') }}</em></h5>
    <ProgressBar :value="progress"/>
  </div>
  <div ref="htmlToPdf" class="card" v-if="progressed">
    <div class="p-grid p-formgrid">
      <div class="p-col-12 p-lg-9">
        <p style="text-align: center">
          <b><em>{{ $t('hr.title.general')}} </em></b>
        </p>
        <hr>
        <span style="white-space: pre-line">
          <b>{{ $t('common.fullName') }}:</b> <em><b>{{ candidate.user.fullName + '\n' }}</b></em>
          <b>{{ $t('contact.birthday') }}:</b> <em>{{ candidate.user.birthday + '\n' }}</em>
          <b>{{ $t('contact.email') }}:</b> <em>{{ candidate.user.email }}</em>
        </span>
        <hr>
        <p style="text-align: center">
          <b><em>{{ $t('hr.title.id') + ' '}}</em></b>
          <Button v-if="!readonly" icon="pi pi-pencil" class="p-button-rounded p-button-outlined"
                  :onclick="editIdentificationDetail"></Button>
        </p>
        <hr>
        <span v-if="identificationDetail" style="white-space: pre-line">
          <b>{{ $t('contact.iin') }}:</b> <em>{{ identificationDetail.iin + '\n' }}</em>
          <b>{{ $t('common.number') }}:</b> <em>{{ identificationDetail.number + '\n' }}</em>
          <b>{{ $t('hr.id.startDate') }}:</b> <em>{{ new Date(identificationDetail.startDate).toLocaleDateString() + '\n' }}</em>
          <b>{{ $t('hr.id.issuedBy') }}:</b> <em>{{ identificationDetail.issuedBy + '\n' }}</em>
          <Button :label="$t('hr.title.id')" style="text-align: left" class="p-button-link" @click="showFile(identificationDetail.image)" />
        </span>
        <em v-if="!identificationDetail">{{ $t('common.noData') }}</em>
      </div>
      <div class="p-col-12 p-lg-2">
        <div class="card">
<!--          <img :src="'data:image/jpeg;base64,' + candidate.user.photo" style="width: 150px"/>-->
        </div>
      </div>
      <div class="p-col-12">
        <hr>
        <p style="text-align: center">
          <b><em>{{ $t('hr.title.education') + ' ' }} </em></b>
          <Button v-if="!readonly" icon="pi pi-pencil" class="p-button-rounded p-button-outlined"
                  :onclick="editEducation"></Button>
        </p>
        <hr>
        <Timeline style="align-content: flex-start" :value="educations">
          <template #opposite="slotProps">
            <div class="p-text-secondary">
              <em>{{ new Date(slotProps.item.receiptDate).getFullYear() }} -
                {{ new Date(slotProps.item.expirationDate).getFullYear() }}</em>
            </div>
          </template>
          <template #content="slotProps">
            <div style="text-align: justify">
              <em>
                  <span style="white-space: pre-line">
                    <b>{{ slotProps.item.institution + ', ' + slotProps.item.institutionAddress + '\n' }}</b>
                    {{
                      slotProps.item.faculty + ', ' +
                      slotProps.item.speciality +
                      ', №' + slotProps.item.diplomaNumber
                    }}
                  </span>
              </em>
              <br>
              <br>
            </div>
          </template>
        </Timeline>
        <em v-if="!educations" style="text-align: center">{{ $t('common.noData') }}</em>
        <hr>
        <p style="text-align: center">
          <b><em>{{ $t('hr.title.degreeAndTitle') + ' '}}</em></b>
          <Button v-if="!readonly" icon="pi pi-pencil" class="p-button-rounded p-button-outlined"
                  :onclick="editDegreesAndTitles"></Button>
        </p>
        <hr>
      </div>
      <div class="p-col-12 p-lg-6 card-border">
        <Timeline style="align-content: flex-start" :value="academicDegrees">
          <template #opposite="slotProps">
            <div class="p-text-secondary">
              <em>{{ new Date(slotProps.item.defenseDate).toLocaleDateString() }}</em>
            </div>
          </template>
          <template #content="slotProps">
            <div style="text-align: justify">
              <em>
                  <span style="white-space: pre-line">
                    <b>{{ slotProps.item.academicDegree['name' + ($i18n.locale).charAt(0).toUpperCase() + ($i18n.locale).slice(1)] + '\n' }}</b>
                    {{
                      slotProps.item.defensePlace + ',\n' +
                      slotProps.item.speciality + ',\n' +
                      '№' + slotProps.item.diplomaNumber
                    }}
                  </span>
              </em>
              <br>
              <br>
            </div>
          </template>
        </Timeline>
        <em v-if="!academicDegrees">{{ $t('common.noData') }}</em>
      </div>
      <div class="p-col-12 p-lg-6">
        <Timeline style="align-content: flex-start" :value="academicTitles">
          <template #opposite="slotProps">
            <div class="p-text-secondary">
              <em>{{ new Date(slotProps.item.defenseDate).toLocaleDateString() }}</em>
            </div>
          </template>
          <template #content="slotProps">
            <div style="text-align: justify">
              <em>
                  <span style="white-space: pre-line">
                    <b>{{ slotProps.item.academicTitle['name' + ($i18n.locale).charAt(0).toUpperCase() + ($i18n.locale).slice(1)] + '\n' }}</b>
                    {{
                      slotProps.item.defensePlace + ',\n' +
                      slotProps.item.speciality + ',\n' +
                      '№' + slotProps.item.diplomaNumber
                    }}
                  </span>
              </em>
              <br>
              <br>
            </div>
          </template>
        </Timeline>
        <em v-if="!academicTitles">{{ $t('common.noData') }}</em>
      </div>
      <div class="p-col-12">
        <hr>
        <p style="text-align: center">
          <b><em>{{ $t('hr.title.academicDetail') + ' '}} </em></b>
          <Button v-if="!readonly" icon="pi pi-pencil" class="p-button-rounded p-button-outlined"
                  :onclick="editAcademicDetail"></Button>
        </p>
        <hr>
        <span v-if="academicDetail " style="white-space: pre-line; text-align: justify; padding-left: 20px">
          <em>{{ academicDetail.detailValue}}</em>
        </span>
        <em v-if="!academicDetail">{{ $t('common.noData') }}</em>
      </div>
      <div class="p-col-12">
        <hr>
        <p style="text-align: center">
          <b><em>{{ $t('hr.title.experience') + ' '}}</em></b>
          <Button v-if="!readonly" icon="pi pi-pencil" class="p-button-rounded p-button-outlined"
                  :onclick="editWorkExperiences"></Button>
        </p>
        <hr>
        <Timeline style="align-content: flex-start" :value="experiences">
          <template #opposite="slotProps">
            <div class="p-text-secondary">
              <em>{{ new Date(slotProps.item.startDate).toLocaleDateString() }} -
                {{ !slotProps.item.isStillWorking ? new Date(slotProps.item.endDate).toLocaleDateString() : $t('hr.we.untilNow') }}</em>
            </div>
          </template>
          <template #content="slotProps">
            <div style="text-align: justify">
              <em>
                  <span style="white-space: pre-line">
                    <b>{{ slotProps.item.organizationName + ',\n' }}</b>
                    {{
                      slotProps.item.position + ',\n' +
                      slotProps.item.responsibilities
                    }}
                  </span>
              </em>
              <br>
              <br>
            </div>
          </template>
        </Timeline>
        <em v-if="!experiences">{{ $t('common.noData') }}</em>
      </div>
      <div class="p-col-12">
        <hr>
        <p style="text-align: center">
          <b><em>{{ $t('hr.title.language') + ' ' }} </em></b>
          <Button v-if="!readonly" icon="pi pi-pencil" class="p-button-rounded p-button-outlined"
                  :onclick="editLanguages"></Button>
        </p>
        <hr>
        <Timeline style="align-content: flex-start" :value="languages">
          <template #opposite="slotProps">
            <div class="p-text-secondary">
              <em>{{ slotProps.item.language['name' + ($i18n.locale).charAt(0).toUpperCase() + ($i18n.locale).slice(1)] }}</em>
            </div>
          </template>
          <template #content="slotProps">
            <div style="text-align: justify">
              <em>
                  <span style="white-space: pre-line">
                    <em><b>{{ $t('hr.lang.pl') }}:</b> {{
                        slotProps.item.isNative ? $t('hr.lang.native') : $t('hr.lang.notNative') + '\n'
                      }}</em>
                    <em><b>{{ $t('hr.lang.rl') }}:</b> {{ slotProps.item.readingLevel.value + '\n' }}</em>
                    <em><b>{{ $t('hr.lang.sl') }}:</b> {{ slotProps.item.speakingLevel.value + '\n' }}</em>
                    <em><b>{{ $t('hr.lang.wl') }}:</b> {{ slotProps.item.writingLevel.value + '\n' }}</em>
                    <em><b>{{ $t('hr.lang.cs') }}:</b> {{ slotProps.item.certificate }}</em>
                  </span>
              </em>
            </div>
            <Button v-if="slotProps.item.image" :label="$t('hr.lang.c')" style="text-align: left" class="p-button-link" @click="showFile(slotProps.item.image)" />
            <br>
            <br>
          </template>
        </Timeline>
        <em v-if="!languages">{{ $t('common.noData') }}</em>
      </div>
      <div class="p-col-12">
        <hr>
        <p style="text-align: center">
          <b><em>{{ $t('hr.title.refresherCourse') + ' ' }} </em></b>
          <Button v-if="!readonly" icon="pi pi-pencil" class="p-button-rounded p-button-outlined"
                  :onclick="editRefresherCourses"></Button>
        </p>
        <hr>
        <Timeline style="align-content: flex-start" :value="refresherCourses">
          <template #opposite="slotProps">
            <div class="p-text-secondary">
              <em>{{ new Date(slotProps.item.startDate).toLocaleDateString() }} -
                {{ new Date(slotProps.item.endDate).toLocaleDateString() }}</em>
            </div>
          </template>
          <template #content="slotProps">
            <div style="text-align: justify">
              <em>
                  <span style="white-space: pre-line">
                    <em><b>{{ slotProps.item.title + '\n' }}</b> </em>
                    <em>{{ slotProps.item.institution + '\n' }}</em>
                  </span>
              </em>
              <br>
              <br>
            </div>
          </template>
        </Timeline>
        <em v-if="!refresherCourses">{{ $t('common.noData') }}</em>
      </div>
      <div class="p-col-12">
        <hr>
        <p style="text-align: center">
          <b><em>{{ $t('hr.title.referee') + ' ' }} </em></b>
          <Button v-if="!readonly" icon="pi pi-pencil" class="p-button-rounded p-button-outlined"
                  :onclick="editReferees"></Button>
        </p>
        <hr>
        <Timeline style="align-content: flex-start" :value="referees">
          <template #opposite="slotProps">
            <div class="p-text-secondary">
              <em>{{ slotProps.item.fullName }}</em>
            </div>
          </template>
          <template #content="slotProps">
            <div style="text-align: justify">
              <em>
                  <span style="white-space: pre-line">
                    <em>{{ slotProps.item.position + '\n' }}</em>
                    <em>{{ slotProps.item.phoneNumber + '\n' }}</em>
                  </span>
              </em>
              <br>
              <br>
            </div>
          </template>
        </Timeline>
        <em v-if="!referees">{{ $t('common.noData') }}</em>
      </div>
      <div class="p-col-12">
        <hr>
        <p style="text-align: center">
          <b><em>{{ $t('hr.title.info') + ' '}}</em></b>
          <Button v-if="!readonly" icon="pi pi-pencil" class="p-button-rounded p-button-outlined"
                  :onclick="editInfo"></Button>
        </p>
        <hr>
        <span v-if="candidate && candidate.info" style="white-space: pre-line; text-align: justify; padding-left: 20px">
          <em>{{ candidate.info}}</em>
        </span>
        <em v-if="!candidate.info">{{ $t('common.noData') }}</em>
      </div>
    </div>
  </div>
  <Sidebar
      v-model:visible="exchange.editMode"
      position="right"
      class="p-sidebar-lg"
      style="overflow-y: scroll"
  >
    <h3>{{exchange.title}}</h3>
    <Menubar :model="menu" :key="active"
             style="height:36px;margin-top:-7px;margin-left:-14px;margin-right:-14px"></Menubar>
    <ResumeEdit :section="exchange.section" :value="exchange.value" :title-value="exchange.titleValue"/>
  </Sidebar>
  <Dialog v-model:visible="fileView" :style="{ width: '650px' }" :modal="true">
    <div style="padding: 0 100px">
      <img :src="fileData" style="width: 100%; height: 100%"/>
    </div>
    <template #footer>
      <Button
          v-bind:label="$t('common.close')"
          icon="pi pi-times"
          class="p-button p-component p-button-primary"
          @click="fileView = false"
      />
    </template>
  </Dialog>

</template>

<script>
import ResumeService from "./ResumeService";
import ResumeEdit from "./ResumeEdit";

export default {
  name: "ResumeView",
  components: {ResumeEdit},
  props: {
    value: null,
    readonly: Boolean,
  },
  created() {
    this.loginedUser = this.$store.state.loginedUser;
    this.resumeService = new ResumeService()
  },
  data() {
    return {
      fileData: null,
      fileView: false,
      progressed: false,
      progress: 0,
      iter: 0,
      interval: null,
      loginedUser: null,
      candidate: {},
      educations: [],
      academicDegrees: [],
      academicTitles: [],
      languages: [],
      experiences: [],
      refresherCourses: [],
      referees: [],
      identificationDetail: null,
      academicDetail: null,
      section: {
        education: 'education',
        degreeAndTitle: 'degreeAndTitle',
        language: 'languages',
        experience: 'experience',
        refresherCourse: 'refresherCourse',
        referee: 'referee',
        id: 'id',
        academicDetail: 'academicDetail',
        info: 'info'
      },
      titles: {
        education: this.$t('hr.title.education'),
        degreeAndTitle: this.$t('hr.title.degreeAndTitle'),
        language: this.$t('hr.title.language'),
        experience: this.$t('hr.title.experience'),
        refresherCourse: this.$t('hr.title.refresherCourse'),
        referee: this.$t('hr.title.referee'),
        id: this.$t('hr.title.id'),
        academicDetail: this.$t('hr.title.academicDetail'),
        info: this.$t('hr.title.info')
      },
      exchange: {
        editMode: false,
        title: null,
        section: null,
        value: null,
        titleValue: null,
      }
    }
  },
  mounted() {
    this.candidate = this.value
    this.startProgress()
    this.getCandidateEducations()
    this.getCandidateAcademicDegrees()
    this.getCandidateAcademicTitles()
    this.getCandidateLanguages()
    this.getCandidateWorkExperiences()
    this.getCandidateRefresherCourses()
    this.getCandidateReferees()
    this.getCandidateIdentificationDetail()
    this.getCandidateAcademicDetail()
    this.emitter.on('education', (data) => {
      if (data === true) {
        this.getCandidateEducations();
      }
    });
    this.emitter.on('academicDegree', (data) => {
      if (data === true) {
        this.getCandidateAcademicDegrees();
      }
    });
    this.emitter.on('academicTitle', (data) => {
      if (data === true) {
        this.getCandidateAcademicTitles();
      }
    });
    this.emitter.on('experience', (data) => {
      if (data === true) {
        this.getCandidateWorkExperiences();
      }
    });
    this.emitter.on('refresherCourse', (data) => {
      if (data === true) {
        this.getCandidateRefresherCourses();
      }
    });
    this.emitter.on('referee', (data) => {
      if (data === true) {
        this.getCandidateReferees();
      }
    });

    this.emitter.on('id', (data) => {
      if (data === true) {
        this.getCandidateIdentificationDetail();
      }
    });
    this.emitter.on('language', (data) => {
      if (data === true) {
        this.getCandidateLanguages();
      }
    });
    this.emitter.on('academicDetail', (data) => {
      if (data === true) {
        this.getCandidateAcademicDetail();
      }
    });
    this.emitter.on('info', (data) => {
      if (data === true) {
        this.getCandidate();
      }
    });
  },
  methods: {
    startProgress() {
      this.interval = setInterval(async () => {

        let newValue = this.iter * 10 + 10;
        if (newValue >= 100) {
          newValue = 100;
        }
        this.progress = newValue;
        if (this.progress === 100) {
          await new Promise(r => setTimeout(r, 1500));
          this.endProgress()
          this.progressed = true
        }
      }, 0);
    },
    endProgress() {
      clearInterval(this.interval);
      this.interval = null;
    },
    showFile(fileData) {
      this.fileData = fileData
      this.fileView = true
    },
    getCandidate() {
      this.resumeService.getCandidate().then(response => {
        this.candidate = response.data
      }).catch(error => {
        this.$toast.add({
          severity: "error",
          summary: error,
          life: 3000,
        });
      })
    },
    getCandidateEducations() {
      this.resumeService.getCandidateEducations(this.candidate.id).then(response => {
        this.educations = response.data
        this.iter++
      }).catch(error => {
        this.$toast.add({
          severity: "error",
          summary: error,
          life: 3000,
        });
      })
    },
    getCandidateAcademicDegrees() {
      this.resumeService.getCandidateAcademicDegrees(this.candidate.id).then(response => {
        this.academicDegrees = response.data
        this.iter++
      }).catch(error => {
        this.$toast.add({
          severity: "error",
          summary: error,
          life: 3000,
        });
      })
    },
    getCandidateAcademicTitles() {
      this.resumeService.getCandidateAcademicTitles(this.candidate.id).then(response => {
        this.academicTitles = response.data
        this.iter++
      }).catch(error => {
        this.$toast.add({
          severity: "error",
          summary: error,
          life: 3000,
        });
      })
    },
    getCandidateLanguages() {
      this.resumeService.getCandidateLanguages(this.candidate.id).then(response => {
        this.languages = response.data
        this.iter++
      }).catch(error => {
        this.$toast.add({
          severity: "error",
          summary: error,
          life: 3000,
        });
      })
    },
    getCandidateWorkExperiences() {
      this.resumeService.getCandidateWorkExperiences(this.candidate.id).then(response => {
        this.experiences = response.data
        this.iter++
      }).catch(error => {
        this.$toast.add({
          severity: "error",
          summary: error,
          life: 3000,
        });
      })
    },
    getCandidateRefresherCourses() {
      this.resumeService.getCandidateRefresherCourses(this.candidate.id).then(response => {
        this.refresherCourses = response.data
        this.iter++
      }).catch(error => {
        this.$toast.add({
          severity: "error",
          summary: error,
          life: 3000,
        });
      })
    },
    getCandidateReferees() {
      this.resumeService.getCandidateReferees(this.candidate.id).then(response => {
        this.referees = response.data
        this.iter++
      }).catch(error => {
        console.log(error)
      })
    },
    getCandidateIdentificationDetail() {
      this.resumeService.getCandidateIdentificationDetail(this.candidate.id).then(response => {
        this.identificationDetail = response.data
        this.iter++
      }).catch(error => {
        if (error.response.status === 404) {
          this.identificationDetail = null
          this.iter++
        }
      })
    },
    getCandidateAcademicDetail() {
      this.resumeService.getCandidateAcademicDetail(this.candidate.id).then(response => {
        this.academicDetail = response.data
        this.iter++
      }).catch(error => {
        if (error.response.status === 404) {
          this.academicDetail = null
          this.iter++
        }
      })
    },
    editEducation() {
      this.exchange.value = this.educations
      this.exchange.section = this.section.education
      this.exchange.editMode = true
      this.exchange.title = this.titles.education
    },
    editDegreesAndTitles() {
      this.exchange.value = this.academicDegrees
      this.exchange.titleValue = this.academicTitles
      this.exchange.section = this.section.degreeAndTitle
      this.exchange.editMode = true
      this.exchange.title = this.titles.degreeAndTitle
    },
    editWorkExperiences() {
      this.exchange.value = this.experiences
      this.exchange.section = this.section.experience
      this.exchange.editMode = true
      this.exchange.title = this.titles.experience
    },
    editLanguages() {
      this.exchange.value = this.languages
      this.exchange.section = this.section.language
      this.exchange.editMode = true
      this.exchange.title = this.titles.language
    },
    editRefresherCourses() {
      this.exchange.value = this.refresherCourses
      this.exchange.section = this.section.refresherCourse
      this.exchange.editMode = true
      this.exchange.title = this.titles.refresherCourse
    },
    editReferees() {
      this.exchange.value = this.referees
      this.exchange.section = this.section.referee
      this.exchange.editMode = true
      this.exchange.title = this.titles.referee
    },
    editIdentificationDetail() {
      this.exchange.value = this.identificationDetail
      this.exchange.section = this.section.id
      this.exchange.editMode = true
      this.exchange.title = this.titles.id
    },
    editAcademicDetail() {
      this.exchange.value = this.academicDetail
      this.exchange.section = this.section.academicDetail
      this.exchange.editMode = true
      this.exchange.title = this.titles.academicDetail
    },
    editInfo() {
      this.exchange.section = this.section.info
      this.exchange.editMode = true
      this.exchange.title = this.titles.info
    }
  }
}
</script>

<style>
.card-border {
  border-right: 0 solid #dee2e6;
  border-radius: 0;
}

</style>