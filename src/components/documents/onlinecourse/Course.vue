<template>
    <div v-if="course">

      <BlockUI :blocked="loading" :fullScreen="true"></BlockUI>

      <TitleBlock class="content_title" :title="$t('Онлайн курс')" :show-back-button="true"/>
        <div class="course_card block sm:flex p-4">
          <div class="text text-white">
            <div class="flex mb-4">
                <h5 v-if="course.history[0].stateID === 8" class="mb-0 mr-2">{{ course["name" + $i18n.locale] }} - <span class="text-gray-400">{{ this.$t("course.isNotAvailable") }}</span></h5>
                <h5 v-else class="mb-0 mr-2">{{ course["name" + $i18n.locale] }}</h5>
              </div>
            <p class="text-gray-400">{{ $t('fieldEducation.duration') }} : {{course.hours}}</p>
            <p class="text-gray-400">{{ $t('fieldEducation.trainingFormat') }}:
            <span v-if="course.courseType === 1">{{ $t('fieldEducation.online') }}</span>
            <span v-if="course.courseType === 2">{{ $t('fieldEducation.offline') }}</span>
            <span v-if="course.courseType === 3">{{ $t('fieldEducation.mixed') }}</span>
          </p>
          </div>
        </div>

      <TabView>
        <!-- КУРС ТУРАЛЫ АҚПАРАТ -->
        <TabPanel :header="$t('fieldEducation.aboutCourse')">
          <div class="content">
            <p class="title font-bold">{{ $t('fieldEducation.purposeCourse') }}</p>
            <p>{{course.descriptionkz}} {{course.descriptionru}} {{course.descriptionen}}</p>
            <p class="title font-bold">{{ $t('fieldEducation.briefSummary') }}</p>
            <p>{{course.annotationKz}} {{course.annotationRu}} {{course.annotationEn}}</p>
          </div>
        </TabPanel>

        <!-- КУРС ҚАТЫСУШЫЛАРЫ -->
<!--        <TabPanel :header="$t('course.users')">-->
<!--          <CourseStudents  :props-course="course" :get-course="getCourse" @update-course="getCourse" />-->
<!--        </TabPanel>-->
        <TabPanel  :header="$t('course.potok')">
          <CourseHistories  :props-course="course" :get-course="getCourse" @update-course="getCourse" :courseID="course.id"></CourseHistories>
        </TabPanel>
        <!--  КУРС МОДУЛІ  -->
        <TabPanel :header="$t('course.modules')">

          <CourseModule :course-i-d="course_id"> </CourseModule>

<!--          <div class="module_grid">-->
<!--            <div class="module_card" v-for="item of module" :key="item">-->
<!--              <div class="content">-->
<!--                <img src="https://www.mooc.org/hubfs/are-free-online-courses-worth-it.jpg" alt="">-->
<!--                <p>{{ item['name_' + $i18n.locale] }}</p>-->
<!--              </div>-->
<!--              <div class="footer">-->
<!--                <hr>-->
<!--                <i class="pi pi-list" @click="toggle"></i>-->
<!--              </div>-->
<!--            </div>-->
<!--          </div>-->

<!--          <OverlayPanel ref="op">-->
<!--            <Button class="p-button-raised" icon="pi pi-fw pi-desktop" :label="$t('Презентация')"/>-->
<!--            <br>-->
<!--            <Button class="p-button-outlined w-full" icon="pi pi-fw pi-desktop" :label="$t('Тест')"/>-->
<!--          </OverlayPanel>-->

<!--          <DataTable :value="module">-->

<!--            <template #header>-->
<!--                <div class="table-header flex justify-content-between flex-wrap card-container purple-container">-->
<!--                    <div class="flex gap-2">-->
<!--                        <Button v-if="findRole(null,'online_course_administrator')" class="p-button-success"-->
<!--                                icon="pi pi-plus" :label="$t('common.add')" @click="addModule"/>-->
<!--                    </div>-->
<!--                </div>-->
<!--            </template>-->

<!--            <Column field="name_kz" :header="$t('common.name')"></Column>-->
<!--            <Column field="hours" :header="$t('course.moduleHours')"></Column>-->
<!--            <Column :field="'description_' + $i18n.locale" :header="$t('common.description')"></Column>-->
<!--            <Column field="">-->
<!--                      <template #body="{data}">-->
<!--                          <Button v-if="findRole(null, 'online_course_administrator')" class="p-button-warning mb-2 mr-2"-->
<!--                              icon="pi pi-pencil" label="" @click="updateModule(data)"/>-->

<!--                          <Button v-if="findRole(null,'online_course_administrator')" class="p-button-danger mb-2 mr-2"-->
<!--                                  icon="fa-solid fa-trash" label="" @click="deleteModule(data.id)"/>-->
<!--                      </template>-->
<!--                  </Column>-->
<!--          </DataTable>-->

          </TabPanel>

        <!--  КУРС АҒЫНДАРЫ  -->
<!--        <TabPanel v-if="findRole(null,'online_course_administrator')" :header="this.$t('course.сompletedСourse')">-->
<!--            <CourseHistories  :props-course="course" :get-course="getCourse" @update-course="getCourse" :courseID="course.id"></CourseHistories>-->
<!--        </TabPanel>-->
      </TabView>

    </div>

    <!-- КУРС МОДУЛІН ҚОСУ -->
    <Dialog v-model:visible="moduleDialog" :style="{ width: '450px' }" :header="$t('course.module')" :modal="true"
            class="p-fluid">
        <div class="field">
            <label>{{ $t('common.nameInQazaq') }}</label>
            <InputText type="text" v-model="formData.name_kz"></InputText>
            <small class="p-error" v-if="!formData.name_kz && submitted">{{
                $t('common.requiredField')
                }}</small>
        </div>
        <div class="field">
            <label>{{ $t('common.nameInRussian') }}</label>
            <InputText type="text" v-model="formData.name_ru"></InputText>
            <small class="p-error" v-if="!formData.name_ru && submitted">{{
                $t('common.requiredField')
                }}</small>
        </div>
        <div class="field">
            <label>{{ $t('common.nameInEnglish') }}</label>
            <InputText type="text" v-model="formData.name_en"></InputText>
            <small class="p-error" v-if="!formData.name_en && submitted">{{
                $t('common.requiredField')
                }}</small>
        </div>
        <div class="field">
            <label>{{ $t('course.moduleHours') }}</label>
            <InputNumber v-model="formData.hours"></InputNumber>
            <small class="p-error" v-if="!formData.hours && submitted">{{
                $t('common.requiredField')
                }}</small>
        </div>
        <div class="field">
            <label>{{ $t('common.descriptionKz') }}</label>
            <InputText type="text" v-model="formData.description_kz"></InputText>
            <small class="p-error" v-if="!formData.description_kz && submitted">{{
                $t('common.requiredField')
                }}</small>
        </div>
        <div class="field">
            <label>{{ $t('common.descriptionRu') }}</label>
            <InputText type="text" v-model="formData.description_ru"></InputText>
            <small class="p-error" v-if="!formData.description_ru && submitted">{{
                $t('common.requiredField')
                }}</small>
        </div>
        <div class="field">
            <label>{{ $t('common.descriptionEn') }}</label>
            <InputText type="text" v-model="formData.description_en"></InputText>
            <small class="p-error" v-if="!formData.description_en && submitted">{{
                $t('common.requiredField')
                }}</small>
        </div>
        <template #footer>
            <div class="flex flex-wrap row-gap-1" v-if="!formData.id" >
                <Button :label="$t('common.save')" @click="addModulesToCourse" class="w-full p-button-primary"/>
                <Button :label="$t('common.cancel')" @click="closeModuleDialog"
                        class="w-full p-button-secondary p-button-outlined"/>
            </div>
            <div class="flex flex-wrap row-gap-1" v-if="formData.id">
                <Button :label="$t('common.save')" @click="updateModuleOfCourse" class="w-full p-button-primary"/>
                <Button :label="$t('common.cancel')" @click="closeModuleDialog"
                        class="w-full p-button-secondary p-button-outlined"/>
            </div>
        </template>
    </Dialog>

</template>
<script>

  import {OnlineCourseService} from "@/service/onlinecourse.service";
  import {smartEnuApi, findRole, fileRoute} from "@/config/config";
  import CourseHistories from "@/components/documents/onlinecourse/CourseHistories.vue";
  import CourseStudents from "./CourseStudents.vue";
  import CourseModule from "@/components/documents/onlinecourse/CourseModule.vue";

  export default {
      components: {CourseModule, CourseHistories},
      data() {
          return {
              course_id: parseInt(this.$route.params.id),
              loading: false,
              service: new OnlineCourseService(),
              course: null,
              modules: [],
              moduleDialog: false,
              module: null,
              submitted: false,
              formData: {},
          }
      },
      created() {
          this.getCourse();
          // this.getModuleByCourseID();
      },
      methods: {
          findRole: findRole,

          getModuleByCourseID() {
              this.loading = true
              this.service.getModulesByCourseID(this.course_id).then(response => {
                  this.module = response.data;
                  this.loading = false
              }).catch(_ => {
                  this.loading = false
              });
          },

          addModule() {
              this.moduleDialog = true;
              this.formData = {};
          },

          closeModuleDialog() {
              this.moduleDialog = false;
              this.formData = {};
          },

          addModulesToCourse() {
              this.formData.course_id = parseInt(this.course_id);
              this.submitted = true;
              if (!this.isValid()) {
                  return;
              }
              this.loading = true
              this.service.addModulesToCourse(this.formData).then(_ => {
                  this.loading = false;
                  this.submitted = false;
                  this.closeModuleDialog()
                  this.getModuleByCourseID()
              }).catch(_ => {
                  this.loading = false;
                  this.submitted = false;
              })
          },

          isValid() {
              let errors = [];
              if (!this.formData.name_kz)
                  errors.push(1);
              if (!this.formData.name_ru)
                  errors.push(1);
              if (!this.formData.name_en)
                  errors.push(1);
              if (!this.formData.hours)
                  errors.push(1);
              if (!this.formData.description_kz)
                  errors.push(1);
              if (!this.formData.description_ru)
                  errors.push(1);
              if (!this.formData.description_en)
                  errors.push(1);

              return errors.length === 0
          },

          getCourse() {
              this.loading = true
              this.service.getCourse(this.course_id).then(response => {
                  this.course = response.data
                  this.course.logo = smartEnuApi + fileRoute + this.course.logo
                  this.loading = false
              }).catch(_ => {
                  this.loading = false
              });
          },

          deleteModule(id) {
              this.$confirm.require({
                  message: this.$t('common.doYouWantDelete'),
                  header: this.$t('common.delete'),
                  icon: 'pi pi-info-circle',
                  acceptClass: 'p-button-rounded p-button-success',
                  rejectClass: 'p-button-rounded p-button-danger',
                  accept: () => {
                      this.service.deleteModule(id).then(res => {
                          this.getModuleByCourseID();
                          this.$toast.add({severity: "success", summary: this.$t("common.success"), life: 3000});
                      }).catch(error => {
                          this.$toast.add({severity: "error", summary: this.$t("common.message.saveError"), life: 3000});
                      })
                  }
              });
          },

          updateModule(data) {
              this.moduleDialog = true;

              this.formData = data;
          },

          updateModuleOfCourse() {
            this.formData.course_id = parseInt(this.course_id);
            this.submitted = true;
            if (!this.isValid()) {
                this.loading = false
                return;

              }
              this.loading = true

              this.service.updateModuleOfCourse(this.formData).then(_ => {
                  this.loading = false;
                  this.submitted = false
                  this.closeModuleDialog();
              }).catch(_ => {
                  this.submitted = false
                  this.loading = false;
              });
          },

          toggle (event) {
            this.$refs.op.toggle(event);
          },

          showMessage(msgtype, message, content, life) {
            this.$toast.add({
              severity: msgtype,
              summary: message,
              detail: content,
              life: life
            });
          },
      }

}
</script>

<style lang="scss">
.course_card{
  background: #293042;
  img{
    margin-right: 20px;
    width: 240px;
    height: 160px;
    object-fit: cover;
    //object-position: bottom;
  }
}
.module_grid{
  width: fit-content;
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(4, 1fr);
}
.module_card{
  display: flex;
  flex-direction: column;
  width: 240px;
  border: 1px solid #ccc;
  border-radius: 3px;
  padding: 10px;
  .content{
    flex: 1;
  }
  img {
    width: 100%;
  }
  i{
    text-align: right;
  }
}
.content_title{
  h3{
    font-size: 20px;
  }
}
@media (max-width: 500px) {
  .course_card{
    img{
      width: 100%;
    }
  }
}


</style>
