<template>
    <div class="col-12">
        <h3>{{ $t('blog.title') }}</h3>
        <div class="card">
            <Button :label="$t('common.add')" @click="openDialog" />
        </div>
        <div class="card">
            <TabView>
                <TabPanel :header="$t('web.properties')">
                    <DataTable :lazy="true" :value="blogList" dataKey="id" :loading="loading" responsiveLayout="scroll"
                        :rowHover="true">
                        <template #empty>{{ $t("common.noData") }}</template>
                        <template #loading>{{ $t("common.loading") }}</template>
                        <Column :field="'name_' + $i18n.locale" :header="$t('common.nameIn')" sortable>
                            <template #body="{ data }">
                                <a href="javascript:void(0)" @click="navigateToView(data)">
                                    {{ data['name_' + $i18n.locale] }}
                                </a>
                            </template>
                        </Column>
                        <Column class="text-right">
                            <template #body="{ data }">
                                <Button icon="fa-solid fa-pen" class="p-button mr-2" @click="openEdit(data)" />
                                <Button icon="fa-solid fa-trash" class="p-button-danger" @click="deleteConfirm(data)" />
                            </template>
                        </Column>
                    </DataTable>
                </TabPanel>
                <TabPanel :header="$t('web.history')" @click="getTableLogs()">
                    <WebLogs :TN="TN" :key="TN" />
                </TabPanel>
            </TabView>

        </div>
    </div>


    <Dialog v-model:visible="isCreateModal" :style="{ width: '1000px' }" :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
        :header="formData ? $t('common.add') : $t('common.edit')" :modal="true" class="p-fluid" @hide="hideDialog">
        <div class="field">
            <label>{{ $t('common.nameInQazaq') }}</label>
            <InputText type="text" v-model="formData.name_kz" />
            <small class="p-error" v-if="!formData.name_kz && submitted">{{ $t("common.requiredField") }}</small>
        </div>
        <div class="field">
            <label>{{ $t('common.nameInRussian') }}</label>
            <InputText type="text" v-model="formData.name_ru" />
            <small class="p-error" v-if="!formData.name_ru && submitted">{{ $t("common.requiredField") }}</small>
        </div>
        <div class="field">
            <label>{{ $t('common.nameInEnglish') }}</label>
            <InputText type="text" v-model="formData.name_en" />
            <small class="p-error" v-if="!formData.name_en && submitted">{{ $t("common.requiredField") }}</small>
        </div>
        <div class="field">
            <label>{{ $t('blog.welcomeTextKz') }}</label>
            <TinyEditor v-model="formData.description_kz" :height="200" @click="toggle" />
        </div>
        <div class="field">
            <label>{{ $t('blog.welcomeTextRu') }}</label>
            <TinyEditor v-model="formData.description_ru" :height="200" />
        </div>
        <div class="field">
            <label>{{ $t('blog.welcomeTextEn') }}</label>
            <TinyEditor v-model="formData.description_en" :height="200" />
        </div>
        <div class="field">
            <label>{{ $t('cafedra.responsible') }}</label>
            <FindUser v-model="responsible" :max="1"></FindUser>
            <small class="p-error" v-if="!responsible && submitted">{{ $t("common.requiredField") }}</small>
        </div>
        <div class="field">
            <label>{{ $t('common.image') }}</label>
            <CustomFileUpload v-model="thumbFile" @upload="uploadThumb" :accept="'image/*'" :multiple="false"
                :preview="formData.thumb"></CustomFileUpload>
        </div>
        <div class="field">
            <label>{{ $t('web.bgImg') }}</label>
            <CustomFileUpload v-model="bgImg" @upload="uploadBg" :accept="'image/*'" :multiple="false"
                :preview="formData.background_bg"></CustomFileUpload>
        </div>
        <template #footer>
            <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button p-component p-button-danger mr-2"
                @click="hideDialog" />
            <Button v-if="!selectedData" :label="$t('common.add')" icon="pi pi-check"
                class="p-button p-component p-button-success" @click="addBlog" />
            <Button v-if="selectedData" :label="$t('common.save')" icon="pi pi-check"
                class="p-button p-component p-button-success" @click="save" />
        </template>
    </Dialog>
</template>

<script setup>
import { useI18n } from "vue-i18n";
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";
import { onMounted, ref } from "vue";
import { EnuWebService } from "@/service/enu.web.service";
import { useRouter } from "vue-router";
import { formatDate } from "@/helpers/HelperUtil";
import { BlogService } from "@/service/blog.service";
import CustomFileUpload from "@/components/CustomFileUpload.vue";
import WebLogs from "@/components/enuwebsite/EnuSiteLogs.vue";

const i18n = useI18n()
const toast = useToast()
const confirm = useConfirm()
const loading = ref(false)
let selectedData = ref()
let isCreateModal = ref(false)
let submitted = ref(false)
const TN = ref(null)
const blogList = ref([])
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
const op = ref();

const navigateToView = (data) => {
    router.push({ name: 'BlogRequests', params: { id: data.id } })
};

const getBlogs = () => {
    loading.value = true;
    blogService.getBlogs().then(res => {
        if (res.data) {
            blogList.value = res.data.blogs
            TN.value = res.data.tn_res
        }
        loading.value = false
    }).catch(error => {
        loading.value = false
        toast.add({ severity: "error", summary: error, life: 3000 });
    });
}
getBlogs()

const addBlog = () => {
    submitted.value = true;
    if (!isValid()) return;

    formData.value.owner_id = responsible.value.userID;
    const fd = new FormData();
    fd.append("blog", JSON.stringify(formData.value))
    if (bgImg.value)
        fd.append("background_bg", bgImg.value)
    if (thumbFile.value)
        fd.append("thumb", thumbFile.value)

    blogService.addBlog(fd).then(res => {
        if (res.data && res.data.is_success) {
            toast.add({ severity: "success", summary: i18n.t('common.success'), life: 3000 });
        }
        submitted.value = false;
        isCreateModal.value = false;
        formData.value = {}
        getBlogs()
    }).catch(error => {
        submitted.value = false;
        isCreateModal.value = false;
        formData.value = {}
        toast.add({ severity: "error", summary: error, life: 3000 });
    });
}

const save = () => {
    submitted.value = true;
    formData.value.owner_id = responsible.value[0].userID

    if (!isValid()) return;
    const fd = new FormData();
    fd.append("blog", JSON.stringify(formData.value))
    if (bgImg.value)
        fd.append("background_bg", bgImg.value)
    if (thumbFile.value)
        fd.append("thumb", thumbFile.value)

    blogService.editBlog(fd).then(res => {
        if (res.data && res.data.is_success) {
            toast.add({ severity: "success", summary: i18n.t('common.success'), life: 3000 });
        }
        submitted.value = false;
        isCreateModal.value = false;
        formData.value = {}
        selectedData.value = null
        getBlogs()
    }).catch(error => {
        submitted.value = false;
        isCreateModal.value = false;
        formData.value = {}
        selectedData.value = null
        toast.add({ severity: "error", summary: error, life: 3000 });
    });
}

const uploadThumb = (event) => {
    thumbFile.value = event.files
}

const uploadBg = (event) => {
    bgImg.value = event.files
}

const openEdit = (data) => {
    formData.value = data
    selectedData.value = data;
    isCreateModal.value = true;
}

const openDialog = () => {
    isCreateModal.value = true;
    formData.value = {}
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
            toast.add({ severity: "success", summary: i18n.t('common.success'), life: 3000 });
        } else {
            toast.add({ severity: "warn", summary: i18n.t('common.message.title.saveError'), life: 3000 });
        }
        getBlogs();
    }).catch(error => {
        toast.add({ severity: "error", summary: error, life: 3000 });
    });
}

const isValid = () => {
    let errors = [];
    debugger;
    if (!formData.value.name_kz)
        errors.push(1);
    if (!formData.value.name_ru)
        errors.push(1);
    if (!formData.value.name_en)
        errors.push(1);
    if (!formData.value.description_kz)
        errors.push(1);
    if (!formData.value.description_ru)
        errors.push(1);
    if (!formData.value.description_en)
        errors.push(1);
    if (!formData.value.owner_id)
        errors.push(1);
    return errors.length === 0
}

const toggle = (event) => {
    op.value.toggle(event);
}
</script>

<style scoped></style>