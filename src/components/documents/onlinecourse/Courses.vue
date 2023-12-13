<template>
  <ConfirmPopup></ConfirmPopup>
  <TitleBlock :title="$t('course.courses')" :show-back-button="true"/>
  <div class="card mt-3 p-5">
    <div class="right mb-4">
      <Button @click="goToAdd()" icon="pi pi-plus-circle" label="Добавить курс" />
      <Button class="ml-2" icon="pi pi-filter" label="Фильтр" />
    </div>
    <div class="course_grid">
      <div class="grid_item_rating" v-for="(item, index) in courses" :key="index">
        <img :src="item.filePath" alt="" @click="selectCourse(item)">
        <div class="text p-3 cursor-pointer" @click="selectCourse(item)">
          <h5 class="title font-semibold">{{ item['name' + $i18n.locale] }}</h5>
          <p>{{ $t('fieldEducation.courseAuthor') }}: {{ item.AutorFullName }}</p>
          <p>05.10.2023</p>
          <p><i class="pi pi-star-fill text-yellow-500"></i> 4,9</p>
        </div>
        <div class="grid_footer flex justify-content-between align-items-center p-3">
          <Tag value="ОПУБЛИКОВАНО" severity="success"></Tag>
          <i class="pi pi-pencil text-primary-500"></i>
          <i class="pi pi-trash text-red-500 cursor-pointer" @click="deleteCourse()"></i>
          <i class="pi pi-list"></i>
        </div>
      </div>
    </div>
    <div v-if="!courses.length" class="text-center">{{ $t('common.noData') }}</div>
  </div>

</template>
<script>
import {Splide, SplideSlide} from "@splidejs/vue-splide";
import "@splidejs/splide/dist/css/splide.min.css";
import {Grid} from '@splidejs/splide-extension-grid';
import {OnlineCourseService} from "@/service/onlinecourse.service";
import {fileRoute, smartEnuApi} from "@/config/config";

export default {
  setup() {
    const options = {
      perPage: 3,
      perMove: 1,
      padding: 45,
      grid: {
        rows: 2,
        cols: 1,
      },
      breakpoints: {
        600: {
          perPage: 1,
          grid: {
            rows: 1,
            cols: 1,
          },
        },
      },
    };
    return {
      options: options,
      extensions: {
        Grid
      },
    };
  },
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
      categories: [],
      category: null,
      courses: [],
      course: null,
      total: 0,
      layout: 'grid',
      sortKey: null,
      sortOrder: null,
      sortField: null,
      courseId: null
    }
  },
  created() {
    this.courseId = parseInt(this.$route.params.courseID)
    this.getCourseCategories();
    this.getCourses();
  },
  watch: {
    $route(to, from) {
      if (to.path === '/courses') {
        this.catLazyParams.parentID = null;
      }
      this.getCourseCategories();
      this.getCourses();
    }
  },
  methods: {
    getCourseCategories() {
      this.loading = true,
          this.service.getCourseCategories(this.catLazyParams).then(response => {
            if (this.catLazyParams.parentID) {
              this.category.children = response.data.categories;
            } else {
              this.categories = response.data.categories
              this.total = response.data.total
            }
            this.loading = false
            this.myOptions - this.options
          }).catch(_ => {
            this.loading = false
          });
    },
    getCourses() {
      this.loading = true,
          this.service.getCourseFieldId(this.courseId).then(response => {
            console.log(response)
            this.courses = response.data
            this.courses.map(e => {
              e.filePath = smartEnuApi + fileRoute + e.logo
            });
            this.total = response.data.total
            this.loading = false
          }).catch(_ => {
            this.loading = false
          });
    },
    selectCategory(category) {
      this.$router.push('/catcourses/' + category.id)
      this.catLazyParams.parentID = category.id
      this.getCourseCategories();
      this.getCourses();
    },
    selectCourse(course) {
      this.$router.push('/course/' + course.id)
    },
    onPage(event) {
      this.courseLazyParams = event
      this.getCourses();
    },
    goToAdd() {
      this.$router.push({name: "AddCourse"})
    },
    deleteCourse(data) {
      this.$confirm.require({
        message: this.$t('common.doYouWantDelete'),
        header: this.$t('common.delete'),
        icon: 'pi pi-info-circle',
        acceptClass: 'p-button-rounded p-button-success',
        rejectClass: 'p-button-rounded p-button-danger',
        accept: () => {

        },
      });
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
  //border: 1px solid #ccc;
  box-shadow: rgba(0, 0, 0, 0.12) 0 1px 3px, rgba(0, 0, 0, 0.24) 0 1px 2px;
  border-radius: 3px;
  min-height: 220px;
  height: 100%;
  width: 245px;

  img {
    cursor: pointer;
    width: 100%;
    height: 160px;
    object-fit: cover;
    //object-position: bottom;
  }
  .grid_footer{
    border-top: 1px solid #ccc
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