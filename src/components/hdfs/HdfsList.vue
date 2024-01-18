<template>
  <div class="card">
    <h4>{{ $t('hdfs.title') }}</h4>
    <DataTable :value="tableData" :paginator="true" :rows="10" v-model:filters="filter" filterDisplay="menu" :showFilterMatchModes="false">
      <template #header>
        <div class="flex justify-content-between">
          <select v-model="selected" @change="selectDir($event)">
            <option>/</option>
            <option v-for="(item, index) in dirs" v-bind:key="index">{{ item.dirName }}</option>
          </select>
          <span class="p-input-icon-left">
                    <i class="pi pi-search" />
                    <InputText v-model="filter['global']" v-bind:placeholder="$t('hdfs.search')" />
                </span>
        </div>
      </template>
      <template #empty>
        {{ $t('hdfs.noData') }}
      </template>
      <template #loading>
        {{ $t('hdfs.loading') }}
      </template>
      <Column field="fileName" v-bind:header="$t('hdfs.fileName')" sortable="true"></Column>
      <Column>
        <template #body="slotProps">
          <Button
              type="button"
              v-on:click="download(slotProps.data.fileName)">
            {{ $t('hdfs.download') }}
          </Button>
          <Button
              type="button"
              class="p-button-danger"
              v-on:click="remove(slotProps.data.fileName)">
            {{ $t('hdfs.remove') }}
          </Button>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script>
import api from "@/service/api";
import {smartEnuApi} from "@/config/config";

export default {
  data() {
    return {
      tableData: [],
      selected: null,
      filter: {},
      loading: true,
      dirs: []
    };
  },
  customerService: null,
  productService: null,
  created() {
    this.getData(this.selected);
    this.getDirectories();
  },
  mounted() {
    this.emitter.on('updateAfterUpload', (data) => {
      if (data === true) {
        this.getData(this.selected);
      } else {
        console.log("error emit")
      }
    });
    console.log(this.selected)
  },
  methods: {
    getData(dirName) {
      this.tableData = [];
      if (!dirName)
        dirName = "/"
        api.get("/getFiles?dirName=" + dirName).then(
          (response) => {
            var pathList = response.data;
            pathList.forEach((i) => {
              this.tableData.push({fileName: i});
            });
            this.loading = false;
          },
          (response) => {
            console.log(response);
          }
      );
    },
    download(fileName) {
      let fname = this.selected ? this.selected + "/" + fileName : fileName;
      var aLink = document.createElement("a");
      aLink.download = fileName;
      aLink.href = smartEnuApi + "/download?fileName=" + fname;
      aLink.click();
    },
    remove(fileName) {
      let fname = this.selected ? this.selected + "/" + fileName : fileName;
      api.post("/remove?fileName=" + fname, {}).then((r) => {
        if (r.status === 200) {
          this.$toast.add({severity: 'info', summary: this.$t('hdfs.success'), detail: this.$t('hdfs.fileRemoved'), life: 3000});
          this.getData(this.selected);
        }
      });
    },
    getDirectories() {
      this.dirs = [];
      api.get("/getDirs").then(response => {
        response.data.forEach((r) => {
          this.dirs.push({dirName: r});
        });
      });
    },
    selectDir(event) {
      this.emitter.emit("selectedDir", event.target.value);
      this.getData(event.target.value)
    }
  },
}
</script>
<style>
.p-button {
  margin-right: .5rem;
}
</style>