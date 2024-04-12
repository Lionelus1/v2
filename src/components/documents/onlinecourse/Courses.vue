<template>
  <ConfirmPopup></ConfirmPopup>
  <div class="flex align-items-center content_title">
    <TitleBlock v-if="title" :title="$t('fieldEducation.title') + ': ' + title" :show-back-button="true"/>
    <TitleBlock v-else :title="$t('fieldEducation.title') + ': ' + $t('common.all')" :show-back-button="true"/>
  </div>
  <div class="card p-5">
    <div class="">
<!--      <div class="grid_item_rating" v-for="(item, index) in courses" :key="index">
        <img :src="item.filePath" alt="" @click="selectCourse(item)">
        <div class="text p-3 cursor-pointer" @click="selectCourse(item)">
          <h5 class="title font-semibold" :title="item['name' + $i18n.locale]">{{ item['name' + $i18n.locale] }}</h5>
          <p>{{ $t('fieldEducation.courseAuthor') }}: {{ item.AutorFullName }}</p>
          <p>{{ formatDateMoment(item.createDate) }}</p>
        </div>
        <div class="grid_footer p-3">
          <p><i class="pi pi-star-fill text-yellow-500"></i> 4,9</p>
          <div class="flex justify-content-between align-items-center">
          <Tag v-if="item.status" :value="item.status[0]['name' + $i18n.locale]" severity="success"></Tag>
          <div class="icons">
            <i v-if="findRole(null,'online_course_administrator')" class="pi pi-pencil text-primary-500 cursor-pointer mr-4" @click="editCourse(item.id)"></i>
            <i v-if="findRole(null,'online_course_administrator')" class="pi pi-trash text-red-500 cursor-pointer mr-4" @click="deleteCourse(item.id)"></i>
            <i class="pi pi-list"></i>
          </div>
          </div>
        </div>
      </div>-->
      <template v-if="allCourses">
        <DataView :value="allCourses.courses" :layout="layout" :loading="loading" :lazy="true" :paginator="true"
                  :rows="lazyParams.rows" @page="onPage($event)" :totalRecords="total" :first="first">
          <template #header>
            <div class="flex justify-content-between">
              <Button v-if="findRole(null,'online_course_administrator')" @click="goToAdd()" icon="pi pi-plus-circle" :label="$t('fieldEducation.addCourse')" />
              <DataViewLayoutOptions v-model="layout" />
            </div>
          </template>

          <template #list="slotProps">
              <div class="col-12">
                <div class="flex flex-column sm:flex-row sm:align-items-center p-3 gap-3">
                  <div class="md:w-10rem relative">
                    <div class="cursor-pointer" v-if="slotProps.data.logo" @click="selectCourse(slotProps.data)">
                      <img class="border-round w-full" src="https://thesette.co/wp-content/uploads/sites/9173/2017/09/graduation-cap.png"/>
                    </div>
                    <div v-else class="cursor-pointer flex justify-content-center bg-blue-50 py-5" @click="selectCourse(slotProps.data)">
                      <i class="fa-solid fa-chalkboard-user size text-blue-100" style="font-size: 30px"></i>
                    </div>
                  </div>
                  <div class="flex flex-column md:flex-row justify-content-between md:align-items-center flex-1 gap-4">
                    <div class="flex flex-row md:flex-column justify-content-between align-items-start gap-2">
                      <div>
                        <span class="font-medium text-secondary text-sm" v-if="slotProps.data.AutorFullName">
                          {{ $t('fieldEducation.courseAuthor') }}: {{ slotProps.data.AutorFullName }}
                        </span>
                        <div>
                        <div @click="selectCourse(slotProps.data)" v-if="slotProps.data['name' + $i18n.locale]" class="title cursor-pointer text-lg font-medium text-900 mt-1 mb-2" :title="slotProps.data['name' + $i18n.locale]">
                          {{ slotProps.data['name' + $i18n.locale] }}
                        </div>
                        <div @click="selectCourse(slotProps.data)" v-else class="cursor-pointer title text-lg font-medium text-900 mt-2 mb-2" :title="slotProps.data['description' + $i18n.locale]">
                          {{ slotProps.data['description' + $i18n.locale] }}
                        </div>
                        </div>
                      </div>
                      <div class="surface-100 p-1" style="border-radius: 30px">
                        <div class="surface-0 flex align-items-center gap-2 justify-content-center py-1 px-2" style="border-radius: 30px; box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.04), 0px 1px 2px 0px rgba(0, 0, 0, 0.06)">
                          <i class="pi pi-star-fill text-yellow-500"></i>
                        </div>
                      </div>
                    </div>
                    <div class="flex flex-column md:align-items-end gap-5">
                      <div class="flex align-items-center">
                        <span class="font-medium text-secondary text-sm mr-2" v-if="slotProps.data.history[0].createDate">
                          {{ formatDateMoment(slotProps.data.history[0].createDate) }}
                        </span>
                        <Tag v-if="slotProps.data.history[0].state" :value="slotProps.data.history[0].state['name' + $i18n.locale]" severity="success"></Tag>
                      </div>
                      <div class="flex flex-row-reverse md:flex-row gap-2">
                        <div class="icons">
                          <i v-if="findRole(null,'online_course_administrator')" class="pi pi-pencil text-primary-500 cursor-pointer mr-4" @click="editCourse(slotProps.data.id)"></i>
                          <i v-if="findRole(null,'online_course_administrator')" class="pi pi-trash text-red-500 cursor-pointer" @click="deleteCourse(slotProps.data.id)"></i>
                          <!--                          <i class="pi pi-list"></i>-->
                        </div>
                        </div>
                    </div>
                  </div>
                </div>
              </div>
          </template>

          <template #grid="slotProps">
              <div class="col-12 sm:col-6 md:col-4 xl:col-3 p-2">
                <div class="course_grid_card p-3 border-1 surface-border surface-card border-round flex flex-column justify-content-between">
                  <div class="cursor-pointer" @click="selectCourse(slotProps.data)">
                  <div class="" v-if="slotProps.data.logo">
                      <img style="height: 170px" class="border-round w-full" :src="slotProps.data.filePath"/>
                  </div>
                  <div v-else class="flex justify-content-center bg-blue-50 py-8 cursor-pointer" @click="selectCourse(slotProps.data)">
                    <i class="fa-solid fa-chalkboard-user size text-blue-100" style="font-size: 30px"></i>
                  </div>
                  </div>
                  <div class="pt-3">
                    <div class="flex flex-row justify-content-between align-items-start gap-2">
                      <div>
                        <span class="font-medium text-secondary text-sm" v-if="slotProps.data.AutorFullName">
                          {{ $t('fieldEducation.courseAuthor') }}: {{ slotProps.data.AutorFullName }}
                        </span>
                        <div v-if="slotProps.data['name' + $i18n.locale]" class="title cursor-pointer text-lg font-medium text-900 mt-1 mb-2"
                             @click="selectCourse(slotProps.data)" :title="slotProps.data['name' + $i18n.locale]">
                          {{ slotProps.data['name' + $i18n.locale] }}
                        </div>
                        <div v-else class="title cursor-pointer text-lg font-medium text-900 mt-1 mb-2" :title="slotProps.data['description' + $i18n.locale]" @click="selectCourse(slotProps.data)">
                          {{ slotProps.data['description' + $i18n.locale] }}
                        </div>
                        <span class="font-medium text-secondary text-sm" v-if="slotProps.data.history[0].createDate">
                          {{ formatDateMoment(slotProps.data.history[0].createDate) }}
                        </span>
                      </div>
                    </div>
                    <div class="flex flex-column gap-4 mt-auto">
                      <div class="surface-100 p-1 w-fit" style="border-radius: 30px">
                        <div class="surface-0 flex align-items-center gap-2 justify-content-center py-1 px-2" style="border-radius: 30px; box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.04), 0px 1px 2px 0px rgba(0, 0, 0, 0.06)">
                          <i class="pi pi-star-fill text-yellow-500"></i>
                        </div>
                      </div>
                      <div class="flex justify-content-between align-items-center">
                        <Tag v-if="slotProps.data.history[0].state" :value="slotProps.data.history[0].state['name' + $i18n.locale]" severity="success"></Tag>
                        <div class="icons">
                          <i v-if="findRole(null,'online_course_administrator')" class="pi pi-pencil text-primary-500 cursor-pointer mr-4" @click="editCourse(slotProps.data.id)"></i>
                          <i v-if="findRole(null,'online_course_administrator')" class="pi pi-trash text-red-500 cursor-pointer" @click="deleteCourse(slotProps.data.id)"></i>
<!--                          <i class="pi pi-list"></i>-->
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
          </template>
        </DataView>
<!--      <div class="grid_item_rating" v-for="(item, index) in allCourses" :key="index">
        <img :src="item.filePath" alt="" @click="selectCourse(item)">
        <div class="text p-3 cursor-pointer" @click="selectCourse(item)">
          <h5 class="title font-semibold" :title="item['name' + $i18n.locale]">{{ item['name' + $i18n.locale] }}</h5>
          <p>{{ $t('fieldEducation.courseAuthor') }}: {{ item.AutorFullName }}</p>
          <p>{{ formatDateMoment(item.createDate) }}</p>
        </div>
        <div class="grid_footer p-3">
          <p><i class="pi pi-star-fill text-yellow-500"></i> 4,9</p>
          <div class="flex justify-content-between align-items-center">
            <Tag v-if="item.status" :value="item.status[0]['name' + $i18n.locale]" severity="success"></Tag>
            <div class="icons">
              <i v-if="findRole(null,'online_course_administrator')" class="pi pi-pencil text-primary-500 cursor-pointer mr-4" @click="editCourse(item.id)"></i>
              <i v-if="findRole(null,'online_course_administrator')" class="pi pi-trash text-red-500 cursor-pointer mr-4" @click="deleteCourse(item.id)"></i>
              <i class="pi pi-list"></i>
            </div>
          </div>
        </div>
      </div>-->
      </template>
    </div>
    <div v-if="!courses && allCourses" class="text-center">{{ $t('common.noData') }}</div>
  </div>

</template>
<script>
import "@splidejs/splide/dist/css/splide.min.css";
import {OnlineCourseService} from "@/service/onlinecourse.service";
import {fileRoute, findRole, smartEnuApi} from "@/config/config";
import { formatDate } from "@/helpers/HelperUtil";
import moment from "moment/moment";

export default {
  data() {
    return {
      loading: false,
      service: new OnlineCourseService(),
      myOptions: null,
      catLazyParams: {
        Page: 0,
        Rows: 10,
        parentID: this.$route.params.categoryID !== undefined ? Number(this.$route.params.categoryID) : null,
      },
      courseLazyParams: {
        Page: 0,
        Rows: 10,
        categoryID: this.$route.params.categoryID !== undefined ? Number(this.$route.params.categoryID) : null,
      },
      lazyParams: {
        page: 0,
        rows: 10,
        categoryID: this.$route.params.categoryID !== undefined ? Number(this.$route.params.categoryID) : null,
      },
      first: null,
      category: null,
      courses: [],
      allCourses: [],
      course: null,
      total: 0,
      layout: 'grid',
      sortKey: null,
      sortOrder: null,
      sortField: null,
      fieldId: null,
      title: null,
    }
  },
  created() {
    this.fieldId = parseInt(this.$route.params.courseID)
    if(this.fieldId !== 777)this.getCourses();
    this.getAllCourses();
  },
  watch: {
    $route(to, from) {
      if (to.path === '/courses') {
        this.catLazyParams.parentID = null;
      }
      this.getCourses();
    }
  },
  methods: {
    findRole,
    formatDate,
    getCourses() {
      this.loading = true;
      this.service.getCourseFieldId(this.fieldId).then(response => {
        this.courses = response.data
        this.courses.map(e => {
          e.filePath = smartEnuApi + fileRoute + e.logo
          this.title = e.field[0]['name_' + this.$i18n.locale]
        });
        this.total = response.data.total
        this.loading = false
      }).catch(_ => {
        this.loading = false
      });
    },
    getAllCourses() {
      this.service.getCourses(this.lazyParams).then(response => {
        this.allCourses = response.data
        this.total = response.data.total
        this.allCourses.courses.map(e => {
          e.filePath = smartEnuApi + fileRoute + e.logo
        });

      }).catch(_ => {
      });
    },
    onPage(event){
      this.lazyParams.page = event.page
      this.lazyParams.rows = event.rows
      this.first = event.first
      this.getAllCourses();
    },
    selectCourse(course) {
      this.$router.push('/course/' + course.id)
    },
    goToAdd() {
      this.$router.push({name: "AddCourse", params: {fieldId: this.fieldId}})
    },
    editCourse(id){
      this.$router.push({name: 'EditCourse', params: {fieldId : this.fieldId, courseId: id}})
    },
    deleteCourse(id) {
      this.$confirm.require({
        message: this.$t('common.doYouWantDelete'),
        header: this.$t('common.delete'),
        icon: 'pi pi-info-circle',
        acceptClass: 'p-button-rounded p-button-success',
        rejectClass: 'p-button-rounded p-button-danger',
        accept: () => {
          this.remove(id)
        },
      });
    },
    remove(id){
      this.service.deleteCourse(id).then(response => {
        this.$toast.add({ severity: 'success', summary: this.$t('common.success'), life: 3000 });
        this.getCourses()
        this.getAllCourses()
      }).catch(error => {
          this.$toast.add({
            severity: "error",
            summary: error,
            life: 3000,
          });
      });
    },
    formatDateMoment(date) {
      return moment(new Date(date)).utc().format("DD.MM.YYYY")
    },
  }
};
</script>
<style lang="scss">
.course_grid {
  //display: flex;
  //flex-wrap: wrap;
  width: fit-content;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
}

.grid_item_rating {
  position: relative;
  //border: 1px solid #ccc;
  box-shadow: rgba(0, 0, 0, 0.12) 0 1px 3px, rgba(0, 0, 0, 0.24) 0 1px 2px;
  border-radius: 3px;
  min-height: 220px;
  height: 380px;
  width: 245px;

  img {
    cursor: pointer;
    width: 100%;
    height: 160px;
    object-fit: cover;
    //object-position: bottom;
  }
  .grid_footer{
    width: 100%;
    position: absolute;
    bottom: 0;
  }

}
.course_grid_card{
  min-height: 364px;
}
.title{
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  display: -webkit-box;
  display: -moz-box;
  overflow: hidden;
}
.item {
  transition: width 1s ease;
  height: 150px;
}

.category {
  background: linear-gradient(158.84deg, rgba(117, 190, 248, 0.28) 11.11%, rgba(255, 255, 255, 0) 86.05%);

}

.course {
  background: linear-gradient(158.84deg, rgba(194, 121, 206, 0.28) 11.11%, rgba(255, 255, 255, 0) 86.05%);
}

.card_title, .card_description {
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  display: -webkit-box;
  overflow: hidden;
}

#splide {
  height: 400px;
}

.item:hover {
  cursor: pointer;
}

.splide__slide {
  box-sizing: border-box;
}

.splide__slide img {
  display: block;
  width: 100%;
}
.p-tag-value{
  text-transform: uppercase;
}
.content_title{
  h3{
    font-size: 20px;
  }
}
@media (max-width: 1450px) {
  .course_grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 1160px) {
  .course_grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}
@media (max-width: 700px) {
  .grid_item_rating {
    width: 100%;
  }
  .card {
    padding: 20px!important;
  }
}
@media (max-width: 500px) {
  .course_grid {
    grid-template-columns: repeat(1, 1fr);
  }
}
@media (min-width: 768px) {
  .splide__slide {
    width: 50%;
  }
}

@media (max-width: 576px) {
  .splide__slide {
    width: 100%;
  }
}
</style>