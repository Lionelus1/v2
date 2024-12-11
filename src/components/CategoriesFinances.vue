<template>
  <div class="col-12">
    <h3>{{ $t('common.categoriesFinance') }}</h3>
    <div  class="surface-card p-4 mb-1 shadow-2 border-round">
      <Splide :options="options" :extensions="extensions">
        <SplideSlide v-for="cat of categories" :key="cat.id">
          <div @click="selectCategory(cat)" class="item category bg-blue-500 surface-card p-4 m-2 shadow-4 border-round p-ripple" v-ripple>
            <div class="card_title text-xl font-medium text-900 mb-3">{{ cat['name' + $i18n.locale] }}</div>
            <div class="card_description font-medium text-700 mb-3">{{ cat['description' + $i18n.locale] }}</div>
          </div>
        </SplideSlide>
      </Splide>
    </div>
    </div>
</template>
<script>
import {Grid} from "@splidejs/splide-extension-grid";
import {Splide, SplideSlide} from "@splidejs/vue-splide";
import "@splidejs/splide/dist/css/splide.min.css";

export default {
  components: {
    Splide,
    SplideSlide
  },
  data() {
    return {
      finance: null,
      categories: [
        {
          namekz: "Қаржылық міндеттемелер",
          nameru: "Финансовые обязательства",
          nameen: "Financial obligations",
          isActive: 0,
          descriptionkz: "Қаржылық міндеттемелер",
          descriptionru: "Финансовые обязательства",
          descriptionen: "Financial obligations",
          organizerID: 1,
        },
        {
          namekz: "Қаржылық операциялар",
          nameru: "Финансовые операции",
          nameen: "Financial transactions",
          isActive: 0,
          descriptionkz: "Қаржылық операциялар",
          descriptionru: "Финансовые операции",
          descriptionen: "Financial transactions",
          organizerID: 1,
        }
      ],
    }
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
  methods: {
    selectCategory(category) {
      this.$router.push('/catfinances/' + category.id)
    },
  }

}

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
  background: black;
  background-repeat: no-repeat;
  background-size: cover;
  border-radius: 3px;
  min-height: 220px;
  box-shadow: rgba(0, 0, 0, 0.19) 0 10px 20px, rgba(0, 0, 0, 0.23) 0 6px 6px;
  .text-white{
    bottom: 20px;
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