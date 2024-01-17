<template>
  <div class="col-12">
    <TitleBlock :showBackButton="true" :title="$t('blog.title')" />
    <div class="card">
      <DataTable :lazy="true" :value="items" dataKey="id" :loading="loading" responsiveLayout="scroll" :rowHover="true"
                 :rows="10" :paginator="true" :totalRecords="total" @page="onPage" @sort="onSort">
        <template #empty>{{ $t("common.noData") }}</template>
        <template #loading>{{ $t("common.loading") }}</template>
        <Column field="question" :header="$t('faq.question')" style="width: 30%;">
          <template #body="{data}">
            <a href="javascript:void(0)" @click="navigateToView(data)" v-tooltip.bottom="{value: data.question, class: 'w-100 tooltip-size'}">
              {{ truncateQuestion(data.question) }}
            </a>
          </template>
        </Column>
        <Column :header="$t('common.fullName')">
          <template #body="{data}">
            {{ data.last_name + ' ' + data.first_name }}
          </template>
        </Column>
        <Column :header="$t('common.status')">
          <template #body="{data}">
            <span :class="'customer-badge status-' + data.state.id">
              {{ $t("common.states." + data.state.code) }}
            </span>
          </template>
        </Column>
        <Column :header="$t('faq.createDate')">
          <template #body="{data}">
            {{ formatDate(data.created_date) }}
          </template>
        </Column>
        <Column class="text-right">
          <template #body="{data}">
            <Button type="button" icon="fa-solid fa-eye" class="mr-2" @click="navigateToView(data)"></Button>
            <!-- <Button icon="fa-solid fa-pen" class="p-button mr-2" @click="openEdit(data)" /> -->
            <Button icon="fa-solid fa-trash" class="p-button-danger" @click="deleteConfirm(data)" />
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<script>
import {useI18n} from "vue-i18n";
import {useToast} from "primevue/usetoast";
import {useConfirm} from "primevue/useconfirm";
import {ref} from "vue";
import {BlogService} from "@/service/blog.service";
import {useRouter, useRoute} from "vue-router";
import {formatDate} from "@/helpers/HelperUtil";

export default {
  name: "BlogRequests",
  adminMode: {
    type: Boolean,
    default: true
  },
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
    const route = useRoute()
    let formData = ref({})
    const options = ref([true, false]);
    const total = ref(0)
    const responsible = ref()
    const thumbFile = ref(null)
    const bgImg = ref(null)
    const blogId = ref(parseInt(route.params.id))
    const lazyParams = ref({
      page: 0,
      rows: 10,
      searchText: "",
      sortField: null,
      sortOrder: 0,
      blog_id: blogId.value
    })

    const navigateToView = (data) => {
      router.push({name: 'BlogRequestView', params: {id: data.id}})
    };

    const getBlogRequests = () => {
      loading.value = true;
      blogService.getBlogRequests(lazyParams.value).then(res => {
        if (res.data) {
          items.value = res.data.blogs
          total.value = res.data.total
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

    const onPage = (event) => {
      lazyParams.value.page = event.page
      lazyParams.value.rows = event.rows
      getBlogRequests();
    }

    const onSort = (event) => {
      lazyParams.value.sortField = event.sortField;
      lazyParams.value.sortOrder = event.sortOrder;
      getBlogRequests();
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
      blogService.deleteBlogRequest(id).then(res => {
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

    const truncateQuestion = (text) => {
      if (text.length <= 70) {
        return text;
      }

      return text.substring(0, 70) + '\u2026'
    }


    return {
      items, isCreateModal, formData, lazyParams, responsible,
      loading, selectedData, submitted, options, total, bgImg, thumbFile,
      navigateToView, openDialog, hideDialog, addBlog, save, deleteConfirm, openEdit, formatDate, uploadThumb, uploadBg,
      onSort, onPage, truncateQuestion
    }
  }
}
</script>

<style scoped lang="scss">
::v-global(.tooltip-size .p-tooltip-text) {
  width: 25rem !important;
}
</style>
