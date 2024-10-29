<template>

  <DataTable       :value="imgData"  :totalRecords="imgPages"     rows="1"
              :paginator="true"
             :lazy="true" :loading="loading"
              scrollable scrollHeight="flex"  selectionMode="single"
              :rowHover="true" stripedRows class="flex-grow-1" @page="onPage">
    <img class="card_img round" v-if="imgData != null && imgData !== ''"
         :src="'data:image/jpeg;base64,' + imgData" style="max-width: 100%; height: auto;" />
  </DataTable>


</template>

<script setup>
  import {computed, onMounted, ref, defineProps, inject} from "vue";
  import {useI18n} from "vue-i18n";
  import {useToast} from "primevue/usetoast";
  import {DocService} from "@/service/doc.service";

  const {t, locale} = useI18n()
  const toast = useToast()
  const loading = ref(false)
  const docService = new DocService()

  const imgData = ref(null)
  const imgPages = ref(0)
  const currentPage = ref(1)
  const props = defineProps({
    docId: {
      type:  Number,
      default: null,
    },
  })

  const showDoc = () => {
    loading.value = true
    const req  = {
      doc_id: Number(props.docId),
      current_page: currentPage.value,
    }

    docService.showDoc(req).then(res => {
      imgData.value = res.data.img_data
      imgPages.value = res.data.page_count
      loading.value = false
    }).catch(err => {
      loading.value = false
    })

  }


  const onPage = (event) => {
    currentPage.value = event.page+1;
    showDoc();
  }

  onMounted(() => {
    showDoc()
  })

</script>

<style scoped>
h1 {
  font-size: 24px;
  color: #333;
  text-align: center;
  margin-bottom: 20px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 15px;
}

.pagination button {
  background-color: #007bff;
  border: none;
  color: white;
  padding: 10px 20px;
  margin: 5px;
  cursor: pointer;
  font-size: 16px;
  border-radius: 4px;
}

.pagination button:hover {
  background-color: #0056b3;
}

.pagination button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

img {
  display: block;
  margin: 0 auto;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

button {
  font-size: 16px;
  padding: 10px 20px;
  margin: 10px 5px;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #007bff;
  color: white;
}

button:disabled {
  background-color: #ddd;
  cursor: not-allowed;
}
</style>
