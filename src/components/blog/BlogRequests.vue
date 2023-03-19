<template>
  <div class="col-12">
    <div class="card">
      <DataView :lazy="true" :loading="loading" responsiveLayout="scroll" :value="items" :rows="10" >

        <template #list="slotProps">
          <div class="product-grid-item card">
            <div class="product-grid-item-top mb-2">
              <div class="col-12 grid">
                <div class="lg:col-3 md:col-3 p-sm-6">
                  <i class="fa-solid fa-tags product-category-icon"></i>
                  <small class="product-category">{{ slotProps.data.category['name' + $i18n.locale].split("(")[0] }}</small>
                </div>
                <div class="lg:col-3  md:col-3 p-sm-6  text-right">
                  <span v-if="adminMode"
                        :class="'customer-badge status-' + slotProps.data.state.id">{{ $t("common.states." + slotProps.data.state.code) }}</span>
                </div>
                <div class="lg:col-3  md:col-3 p-sm-6">
                  <small>№&nbsp;{{ slotProps.data.id }}</small>
                </div>
                <div class="lg:col-3  md:col-3 p-sm-6 text-right">
                  <span v-if="slotProps.data.expired">
                    <i class="fa-solid fa-calendar-days product-error-icon"></i>
                  </span>
                  <span v-else>
                    <i class="fa-solid fa-calendar-days product-category-icon"></i>
                  </span>
                  <small class="product-category">{{ moment(new Date(slotProps.data.createdDate)).utc().format("DD.MM.YYYY") }}</small>
                </div>
              </div>
            </div>
            <div class="product-grid-item-content">
              <p class="block-with-text">{{ slotProps.data.question }}</p>
            </div>
            <div class="product-grid-item-bottom">
              <div class="col-12 grid">
                <div class="lg:col-3 md:col-3 p-sm-6">
                <span>
                  <i class="fa-solid fa-at product-category-icon"></i>
                  <small class="product-category">{{ slotProps.data.lastName + " " + slotProps.data.firstName }}</small>
                </span>
                </div>
                <div class="lg:col-3 md:col-3 p-sm-6 text-right">
                  <div v-if="adminMode">
              <span v-if="slotProps.data.replier">
                <i class="fa-solid fa-user-tag product-category-icon"></i>
                <small class="product-category">{{ slotProps.data.replier.fullName }}</small>
              </span>
                    <Button v-if="slotProps.data.state.id !=7" :label="$t('common.send')" icon="pi pi-send" class="p-button-outlined p-button-warning"
                            @click="currentQuestion=slotProps.data.id;sendDialog=true"></Button>
                  </div>
                </div>
                <div class="lg:col-3 md:col-3 p-sm-6">
                  <Button v-if="slotProps.data.filePath" :label="$t('faq.attachments')" icon="pi pi-download"
                          @click="downloadFile(slotProps.data.filePath)"></Button>
                </div>
                <div class="lg:col-3 md:col-3 p-sm-6  text-right">
                  <router-link :to="{ name: 'ReceptionQuestion', params: { id: slotProps.data.id } }" tag="a">
                    <Button :label="$t('common.more')" class="p-button-outlined p-button-info"></Button>
                  </router-link>
                </div>

              </div>
            </div>
          </div>


        </template>
      </DataView>
    </div>
  </div>
</template>

<script>
import {useI18n} from "vue-i18n";
import {useToast} from "primevue/usetoast";
import {useConfirm} from "primevue/useconfirm";
import {ref} from "vue";
import {BlogService} from "@/service/blog.service";
import {useRouter} from "vue-router";
import {formatDate} from "@/helpers/HelperUtil";

export default {
  name: "BlogRequests",
  setup() {
    const i18n = useI18n()
    const toast = useToast()
    const confirm = useConfirm()
    const loading = ref(false)
    let selectedData = ref()
    let isCreateModal = ref(false)
    let submitted = ref(false)
    const items = ref([])
    const blogService = new BlogService()
    const router = useRouter()
    let formData = ref({})
    const options = ref([true, false]);
    const total = ref(0)
    const responsible = ref()
    const thumbFile = ref(null)
    const bgImg = ref(null)
    const lazyParams = ref({
      page: 0,
      rows: 10,
      searchText: "",
      sortField: null,
      sortOrder: 0
    })

    const navigateToView = (data) => {
      router.push({name: 'BlogRequestView', params: {id: data.block_id}})
    };

    const getBlogRequests = () => {
      loading.value = true;
      blogService.getBlogRequests().then(res => {
        if (res.data) {
          items.value = res.data
        }
        loading.value = false
      }).catch(error => {
        loading.value = false
        toast.add({severity: "error", summary: error, life: 3000});
      });
    }
    getBlogRequests()

    const addBlog = () => {
      submitted.value = true;
      formData.value.owner_id = responsible.value.userID;
      const fd = new FormData();
      fd.append("blog", JSON.stringify(formData.value))
      if (bgImg.value)
        fd.append("background_bg", bgImg.value)
      if (thumbFile.value)
        fd.append("thumb", thumbFile.value)

      blogService.addBlog(fd).then(res => {
        if (res.data && res.data.is_success) {
          toast.add({severity: "success", summary: i18n.t('common.success'), life: 3000});
        }
        submitted.value = false;
        isCreateModal.value = false;
        formData.value = {}
        getBlogRequests()
      }).catch(error => {
        submitted.value = false;
        isCreateModal.value = false;
        formData.value = {}
        toast.add({severity: "error", summary: error, life: 3000});
      });
    }

    const save = () => {
      submitted.value = true;
      formData.value.owner_id = responsible.value.userID
      const fd = new FormData();
      fd.append("blog", JSON.stringify(formData.value))
      if (bgImg.value)
        fd.append("background_bg", bgImg.value)
      if (thumbFile.value)
        fd.append("thumb", thumbFile.value)

      blogService.editBlog(fd).then(res => {
        if (res.data && res.data.is_success) {
          toast.add({severity: "success", summary: i18n.t('common.success'), life: 3000});
        }
        submitted.value = false;
        isCreateModal.value = false;
        formData.value = {}
        selectedData.value = null
        getBlogRequests()
      }).catch(error => {
        submitted.value = false;
        isCreateModal.value = false;
        formData.value = {}
        selectedData.value = null
        toast.add({severity: "error", summary: error, life: 3000});
      });
    }

    const uploadThumb = (event) => {
      thumbFile.value = event.files[0]
    }

    const uploadBg = (event) => {
      bgImg.value = event.files[0]
    }

    const openEdit = (data) => {
      formData.value = data
      selectedData.value = data;
      isCreateModal.value = true;
    }

    const openDialog = () => {
      isCreateModal.value = true;
    }

    const hideDialog = () => {
      isCreateModal.value = false;
    }

    const deleteConfirm = (data) => {
      confirm.require({
        message: i18n.t('common.doYouWantDelete'),
        header: i18n.t('common.delete'),
        icon: 'pi pi-info-circle',
        acceptClass: 'p-button-rounded p-button-success',
        rejectClass: 'p-button-rounded p-button-danger',
        accept: () => {
          remove(data.id)
        },
      });
    }

    const remove = (id) => {
      blogService.deleteBlog(id).then(res => {
        if (res.data && res.data.is_success) {
          toast.add({severity: "success", summary: i18n.t('common.success'), life: 3000});
        } else {
          toast.add({severity: "warn", summary: i18n.t('common.message.title.saveError'), life: 3000});
        }
        getBlogRequests();
      }).catch(error => {
        toast.add({severity: "error", summary: error, life: 3000});
      });
    }

    return {
      items, isCreateModal, formData, lazyParams, responsible,
      loading, selectedData, submitted, options, total, bgImg, thumbFile,
      navigateToView, openDialog, hideDialog, addBlog, save, deleteConfirm, openEdit, formatDate, uploadThumb, uploadBg
    }
  }
}
</script>

<style scoped>

</style>