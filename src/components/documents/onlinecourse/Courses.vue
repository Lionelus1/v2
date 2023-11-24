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
      <div class="mt-5 mb-3 flex justify-content-between">
        <h3>{{ $t('course.courses') }}</h3>
        <div>
          <Button @click="goToAdd()" icon="pi pi-plus-circle" label="Добавить курс" />
          <Button class="ml-2" icon="pi pi-filter" label="Фильтр" />
        </div>
      </div>
      <div class="card grid pl-8 pr-8">
        <div class="p-4 col-12 sm:col-6 lg:col-12 xl:col-3">
          <div class="grid_item_rating">
            <img src="https://www.hult.edu/blog/media/uploads/2020/12/photo-1503945438517-f65904a52ce6.jpg" alt="">
            <div class="text p-3">
              <h5 class="title font-semibold">Наука в области химии</h5>
              <p>Автор курса: ХХХХХ</p>
              <p>05.10.2023</p>
              <p> <i class="pi pi-star-fill text-yellow-500"></i> 4,9</p>
              <div class="grid_footer flex justify-content-between align-items-center">
                <Tag value="ОПУБЛИКОВАНО" severity="success"></Tag>
                <i class="pi pi-list"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="card grid pl-8 pr-8">
        <div  v-for="(item, index) in courses" :key="index" class="p-4 col-12 sm:col-6 lg:col-12 xl:col-3">
          <div class="grid_item p-4 relative">
            <div class="text-white absolute">
              <h5 class="title">{{item['name' + $i18n.locale] }}</h5>
              <div class="count_course">15 курс</div>
            </div>
          </div>
        </div>
      </div>

        <div class="surface-card p-4 shadow-2 border-round">
            <DataView class="xl:ml-7 xl:mr-7" :lazy="true" :value="courses" :layout="layout" :paginator="true" :rows="10" @page="onPage($event)" :totalRecords="total">
                <template #list="slotProps">
                    <div class="col-12 shadow-4 border-round p-4">
                        <div class="card_title text-xl font-medium text-900 mb-3">{{ slotProps.data['name' + $i18n.locale] }}</div>
                        <div class="card_description font-medium text-700 mb-3">{{ slotProps.data['description' + $i18n.locale] }}</div>
                    </div>
                </template>

                <template #grid="slotProps">
                    <div class="col-12 lg:col-6 xl:col-4 p-2">
                    <div @click="selectCourse(slotProps.data)" class="shadow-4 border-round p-4 item course p-ripple" v-ripple>
                        <div class="card_title text-xl font-medium text-900 mb-3" :title="slotProps.data['name' + $i18n.locale]">{{ slotProps.data['name' + $i18n.locale] }}</div>
                        <div class="card_description font-medium text-700 mb-3" :title="slotProps.data['description' + $i18n.locale]">{{ slotProps.data['description' + $i18n.locale] }}</div>
                    </div>
                    </div>
                </template>
		    </DataView>
        </div>
    </div>
  </template>
  <script>
  import { Splide, SplideSlide } from "@splidejs/vue-splide";
  import "@splidejs/splide/dist/css/splide.min.css";
  import { Grid } from '@splidejs/splide-extension-grid';
  import {OnlineCourseService} from "@/service/onlinecourse.service";
  
  export default{
    components: {
      Splide,
      SplideSlide,
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
            course:null,
            total:0,
            layout: 'grid',
            sortKey: null,
            sortOrder: null,
            sortField: null,
        }
    },
    created() {
        this.getCourseCategories();
        this.getCourses();
    },  
    watch:{
    $route (to, from){
        if (to.path === '/courses') {
            this.catLazyParams.parentID = null;
        }
        this.getCourseCategories();
        this.getCourses();
    }
} ,
    methods: {
        getCourseCategories() {
            this.loading = true,
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
        }
    }
  };
  </script>
  <style lang="scss">
  .grid_item{
    background-image: url("https://bogatyr.club/uploads/posts/2023-03/thumbs/1678091024_bogatyr-club-p-selskoe-khozyaistvo-kollazh-foni-krasivo-50.jpg");
    background-repeat: no-repeat;
    background-size: cover;
    border-radius: 3px;
    min-height: 220px;
    box-shadow: rgba(0, 0, 0, 0.19) 0 10px 20px, rgba(0, 0, 0, 0.23) 0 6px 6px;
    .text-white{
      bottom: 20px;
    }
  }
  .grid_item_rating{
    box-shadow: rgba(0, 0, 0, 0.19) 0 10px 20px, rgba(0, 0, 0, 0.23) 0 6px 6px;
    border-radius: 3px;
    min-height: 220px;
    img{
      width: 100%;
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