<template>
  <ConfirmPopup></ConfirmPopup>
  <div class="flex align-items-center content_title">
    <TitleBlock :title="$t('fieldEducation.title') + ': ' + title" :show-back-button="true"/>
  </div>
  <div class="card p-5">
    <div class="right mb-4">
      <Button v-if="findRole(null,'online_course_administrator')" @click="goToAdd()" icon="pi pi-plus-circle" :label="$t('fieldEducation.addCourse')" />
      <Button class="ml-2" icon="pi pi-filter" :label="$t('common.filter')" />
    </div>
    <div class="course_grid">
      <div class="grid_item_rating" v-for="(item, index) in courses" :key="index">
        <img :src="item.filePath" alt="" @click="selectCourse(item)">
        <div class="text p-3 cursor-pointer" @click="selectCourse(item)">
          <h5 class="title font-semibold" :title="item['name' + $i18n.locale]">{{ item['name' + $i18n.locale] }}</h5>
          <p>{{ $t('fieldEducation.courseAuthor') }}: {{ item.AutorFullName }}</p>
          <p>{{ formatDate(item.createDate) }}</p>
          <p><i class="pi pi-star-fill text-yellow-500"></i> 4,9</p>
        </div>
        <div class="grid_footer flex justify-content-between align-items-center p-3">
          <Tag v-if="item.status" :value="item.status[0]['name' + $i18n.locale]" severity="success"></Tag>
          <div class="icons">
            <i v-if="findRole(null,'online_course_administrator')" class="pi pi-pencil text-primary-500 cursor-pointer mr-4" @click="editCourse(item.id)"></i>
            <i v-if="findRole(null,'online_course_administrator')" class="pi pi-trash text-red-500 cursor-pointer mr-4" @click="deleteCourse(item.id)"></i>
            <i class="pi pi-list"></i>
          </div>
        </div>
      </div>
    </div>
    <div v-if="!courses.length" class="text-center">{{ $t('common.noData') }}</div>
  </div>

</template>
<script>
import "@splidejs/splide/dist/css/splide.min.css";
import {OnlineCourseService} from "@/service/onlinecourse.service";
import {fileRoute, findRole, smartEnuApi} from "@/config/config";
import { formatDate } from "@/helpers/HelperUtil";

export default {
  data() {
    return {
      loading: false,
      service: new OnlineCourseService(),
      myOptions: null,
      catLazyParams: {
        Page: 0,
        Rows: 10,
        parentID: this.$route.params.categoryID != undefined ? Number(this.$route.params.categoryID) : null,
      },
      courseLazyParams: {
        Page: 0,
        Rows: 10,
        categoryID: this.$route.params.categoryID != undefined ? Number(this.$route.params.categoryID) : null,
      },
      category: null,
      courses: [],
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
    this.getCourses();
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
      this.loading = true,
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
      }).catch(error => {
          this.$toast.add({
            severity: "error",
            summary: error,
            life: 3000,
          });
      });
    }
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
    border-top: 1px solid #ccc
  }
  .title{
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    display: -webkit-box;
    display: -moz-box;
    overflow: hidden;
  }
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