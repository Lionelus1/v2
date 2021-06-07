<template>
  <div class="card card-shadow border-0">
    <div class="card-header">
      <h5 class="card-title mb-0">{{ $t('news.addNews') }}</h5>
    </div>
    <div class="card-body">
      <form @submit.prevent="">
        <div class="form-group">
          <label>{{ $t('news.titleKz') }}</label>
          <input
              v-model="newsData.titleKz"
              type="text"
              class="form-control"
              :placeholder="$t('news.titleKz')"
          />
        </div>
        <div class="form-group">
          <label>{{ $t('news.titleRu') }}</label>
          <input
              v-model="newsData.titleRu"
              type="text"
              class="form-control"
              :placeholder="$t('news.titleRu')"
          />
        </div>
        <div class="form-group">
          <label>{{ $t('news.titleEn') }}</label>
          <input
              v-model="newsData.titleEn"
              type="text"
              class="form-control"
              :placeholder="$t('news.titleEn')"
          />
        </div>
        <div class="form-group">
          <label>{{ $t('news.textKz') }}</label>
          <editor
              ref="toastuiEditorKz"
              height="300px"
              initialEditType="wysiwyg"></editor>
        </div>
        <div class="form-group">
          <label>{{ $t('news.textRu') }}</label>
          <editor
              ref="toastuiEditorRu"
              height="300px"
              initialEditType="wysiwyg"></editor>
        </div>
        <div class="form-group">
          <label>{{ $t('news.textEn') }}</label>
          <editor
              ref="toastuiEditorEn"
              height="300px"
              initialEditType="wysiwyg"></editor>
        </div>
        <div class="form-group">
          <label>{{ $t('news.image') }}</label>
          <b-form-file
              v-model="newsData.image"
              :placeholder="$t('news.chooseImage')"
              :browse-text="$t('actions.choose')"
              accept="image/*"

          ></b-form-file>
          <div class="mt-3">
            <img :src="newsData.img_base64" style="max-width: 250px" alt=""/>
          </div>
        </div>
        <div class="form-group">
          <label>{{ $t('news.source') }}</label>
          <input
              v-model="newsData.imgSrc"
              type="text"
              class="form-control"
              :placeholder="$t('news.source')"
          />
        </div>
        <div class="mt-3">
          <button class="btn btn-lg btn-lg-size btn-primary" type="submit">
            {{ $t('actions.add') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>


<script>
export default {
  data() {
    return {
      newsData: {
        titleKz: null,
        titleRu: null,
        titleEn: null,
        textKz: null,
        textRu: null,
        textEn: null,
        imgSrc: null,
        img_base64: null
      },
      imgUrl: null,
    }
  }
}
</script>