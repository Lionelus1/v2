<template>
    <div class="col-12">
        <BlockUI :blocked="saving" :fullScreen="true"></BlockUI>
        <div v-if="!catLazyParams.parentID"  class="surface-card p-4 mb-1 shadow-2 border-round">
            <h4 class="mb-3">{{ $t('course.categories') }}</h4>
            <Splide v-if="courses && courses.length>0" :options="options" :extensions="extensions">
                <SplideSlide v-for="cat of categories" :key="cat.id">
                    <div @click="selectCategory(cat)" class="item category bg-blue-500 surface-card p-4 m-2 shadow-4 border-round p-ripple" v-ripple>
                        <div class="card_title text-xl font-medium text-900 mb-3">{{ cat['name' + $i18n.locale] }}</div>
                        <div class="card_description font-medium text-700 mb-3">{{ cat['description' + $i18n.locale] }}</div>
                    </div>
                </SplideSlide>
            </Splide>
        </div>
        <div class="surface-card p-4 shadow-2 border-round">
            <h4 class="mb-3">{{ $t('course.courses') }}</h4>
            <DataView class="xl:ml-7 xl:mr-7" :value="courses" :layout="layout" :paginator="true" :rows="9" :sortOrder="sortOrder">
                 <!-- :sortField="sortField"> -->
                <template #list="slotProps">
                    <div class="col-12 shadow-4 border-round p-4">
                        <div class="card_title text-xl font-medium text-900 mb-3">{{ slotProps.data['name' + $i18n.locale] }}</div>
                        <div class="card_description font-medium text-700 mb-3">{{ slotProps.data['description' + $i18n.locale] }}</div>
                    </div>
                </template>

			<template #grid="slotProps">
				<div @click="selectCourse(slotProps.data)" class="col-12 md:col-4 shadow-4 border-round p-4 item course p-ripple mr-3 mb-3" v-ripple>
                    <div class="card_title text-xl font-medium text-900 mb-3" :title="slotProps.data['name' + $i18n.locale]">{{ slotProps.data['name' + $i18n.locale] }}</div>
                    <div class="card_description font-medium text-700 mb-3" :title="slotProps.data['description' + $i18n.locale]">{{ slotProps.data['description' + $i18n.locale] }}</div>
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
  
  export default({
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
        }
    }
  });
  </script>
  <style>
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