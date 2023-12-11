<template>
  <div class="col-12">
    <BlockUI :blocked="saving" :fullScreen="true"></BlockUI>
    <h3>{{ $t('course.categories') }}</h3>
    <div v-if="!catLazyParams.parentID"  class="surface-card p-4 mb-1 shadow-2 border-round">
      <Splide v-if="courses && courses.length>0" :options="options" :extensions="extensions">
        <SplideSlide v-for="cat of categories" :key="cat.id">
          <div @click="selectCategory(cat)" class="item category bg-blue-500 surface-card p-4 m-2 shadow-4 border-round p-ripple" v-ripple>
            <div class="card_title text-xl font-medium text-900 mb-3">{{ cat['name' + $i18n.locale] }}</div>
            <div class="card_description font-medium text-700 mb-3">{{ cat['description' + $i18n.locale] }}</div>
          </div>
        </SplideSlide>
      </Splide>
    </div>
    <div class="mt-5 mb-3 flex align-items-center w-fit">
      <div v-if="selectedCategory" @click="selectedCategory = false" class="inline-block mr-3">
        <i class="fa-solid fa-arrow-left ml-2" style="font-size: 16px;cursor: pointer"></i>
      </div>
      <h3 class="m-0">{{ $t('fieldEducation.title') }} <span v-if="selectedCategory">: {{ nameCourse }}</span></h3>
    </div>
    <div class="card pl-8 pr-8 pt-5" v-if="!selectedCategory">
      <Dropdown class="mb-4" placeholder="таңдаңыз" optionValue="id" :options="qualification" v-model="selectedItem" :optionLabel='"name"'/>
      <div class="cat_grid">
        <div v-for="(item, index) in filteredFieldEducation" :key="index" :style="{ 'background-image': 'url(' + item.filePath + ')' }"
             class="grid_item p-4 relative p-4 col-12 sm:col-6 lg:col-12 xl:col-3" @click="showCourses(item)">
          <div class="text-white absolute">
            <h5 class="title">{{item['name_' + $i18n.locale] }}</h5>
            <div class="count_course">{{item.total}} {{$t('course.course')}}</div>
          </div>
        </div>
      </div>
    </div>
    <Courses v-if="selectedCategory"/>
  </div>
</template>
<script>
import { Splide, SplideSlide } from "@splidejs/vue-splide";
import "@splidejs/splide/dist/css/splide.min.css";
import { Grid } from '@splidejs/splide-extension-grid';
import {OnlineCourseService} from "@/service/onlinecourse.service";
import Courses from "@/components/documents/onlinecourse/Courses.vue";
import {fileRoute, smartEnuApi} from "@/config/config";

export default{
  components: {
    Splide,
    SplideSlide,
    Courses
  },
  setup() {
    const options =  {
      perPage: 3,
      perMove: 1,
      padding:45,
      grid: {
        rows: 2,
        cols: 1,
      },
      breakpoints: {
        600: {
          perPage:1,
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
      selectedItem: 1,
      searchTerm: '',
      loading:false,
      service: new OnlineCourseService(),
      myOptions: null,
      catLazyParams: {
        Page: 0,
        Rows:10,
        parentID: this.$route.params.categoryID != undefined ? Number(this.$route.params.categoryID) : null,
      },
      courseLazyParams: {
        Page: 0,
        Rows:10,
        categoryID: this.$route.params.categoryID != undefined ? Number(this.$route.params.categoryID) : null,
      },
      categories: [],
      category: null,
      courses:[],
      dataFieldEducation:[],
      course:null,
      total:0,
      layout: 'grid',
      sortKey: null,
      sortOrder: null,
      sortField: null,
      selectedCategory : false,
      nameCourse : null,

    }
  },
  created() {
    this.getCourseCategories();
    this.getCourses();
    this.getFieldEducation();
  },
  watch:{
    $route (to, from){
      if (to.path === '/courses') {
        this.catLazyParams.parentID = null;
      }
      this.getCourseCategories();
      this.getCourses();
    },
  } ,
  computed: {
    filteredFieldEducation() {
      return this.dataFieldEducation.filter(item =>
            item.degree_id === this.selectedItem
      );
    },
    qualification(){
      return  [
        { id: 1, name: this.$t("educationalPrograms.bachelor") },
        { id: 2, name: this.$t("educationalPrograms.magistr") },
        { id: 4, name: this.$t("educationalPrograms.doctoral") },
      ]
    },
  },
  methods: {
    getCourseCategories() {
      this.loading = true
          this.service.getCourseCategories(this.catLazyParams).then(response => {
            if (this.catLazyParams.parentID)
            {
              this.category.children = response.data.categories;
            }
            else
            {
              this.categories = response.data.categories
              this.total = response.data.total
            }
            this.loading = false
            this.myOptions - this.options
          }).catch(_=> {
            this.loading = false
          });
    },
    getCourses() {
      this.loading = true,
          this.service.getCourses(this.courseLazyParams).then(response => {
            this.courses = response.data.courses
            this.total = response.data.total
            this.loading = false
          }).catch(_=> {
            this.loading = false
          });
    },
    getFieldEducation() {
      this.service.getFieldEducation().then(response => {
        if(response.data){
          this.dataFieldEducation = response.data
          this.dataFieldEducation.map(e => {
            e.filePath = smartEnuApi + fileRoute + e.filePath
          });
        }
        //this.total = response.data.total
        //this.loading = false
      }).catch(_=> {
        //this.loading = false
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
    goToAdd(){
      this.$router.push({name: "AddCourse"})
    },
    goToCourses(){
      this.$router.push({name: "onlinecourses"})
    },
    showCourses(item) {
      this.selectedCategory = true;
      this.nameCourse = item.namekz
    }
  }
};
</script>
<style lang="scss">
.cat_grid{
  display: grid;
  gap: 40px;
  grid-template-columns: repeat(4, 1fr);
}

.grid_item{
  width: 100%;
  cursor: pointer;
  //background-image: url("https://bogatyr.club/uploads/posts/2023-03/thumbs/1678091024_bogatyr-club-p-selskoe-khozyaistvo-kollazh-foni-krasivo-50.jpg");
  background-repeat: no-repeat;
  background-size: cover;
  border-radius: 3px;
  min-height: 220px;
  box-shadow: rgba(0, 0, 0, 0.19) 0 10px 20px, rgba(0, 0, 0, 0.23) 0 6px 6px;
  .text-white{
    bottom: 20px;
  }
}
.grid_item:nth-child(2){
  //background-image: url("https://www.hult.edu/blog/media/uploads/2020/12/photo-1503945438517-f65904a52ce6.jpg");
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
.card_title,.card_description{
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
  .cat_grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 1200px) {
  .cat_grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}

@media (max-width: 600px) {
  .cat_grid {
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