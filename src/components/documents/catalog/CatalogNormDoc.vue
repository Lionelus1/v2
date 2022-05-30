<template>
	<div class="card">
        <h4 class="p-ml-3">{{ $t("smartenu.catalogNormDoc") }}</h4>
        <Toolbar class="p-mb-4 ">
        <template #start>
            <Button
            :label="$t('common.add')"
            :title="$t('queue.creatQueue')"          
            icon="pi pi-plus"
            class="p-button-success p-mr-2"
            v-on:click="createQueue(null)"
            />
        </template>
        </Toolbar>
      
        <TreeTable class="p-treetable-sm" style="margin-bottom: 2rem" :value="catalog" :lazy="true" :paginator="true" :rows="lazyParams.rows" :loading="loading"
            @nodeExpand="onExpand" :totalRecords="totalRecords" selectionMode="single" v-model:selectionKeys="selected">
             <template #header>
              <div class="table-header">
                {{$t("queue.queues")}}
              </div>
            </template> 
             <Column field="name" :header="$t('common.name')" :expander="true">
                <template #body="slotProps">
                    <span><i :class="'pi pi-' + (slotProps.node.type === 0 ? 'folder' : 'file')"></i>&nbsp;{{slotProps.node["name"+$i18n.locale]}}</span>
                </template>
            </Column>
            <Column field="type" :header="$t('common.name')" >
                <template #body="slotProps">
                    {{slotProps.node.type}}
                </template>
            </Column>
        </TreeTable>
    </div>
</template>

<script>
import axios from "axios";
import {smartEnuApi, getHeader} from "@/config/config";

export default {
    data() {
        return {
            catalog: [],
            loading: false,
            lazyParams: {
                page: 0,
                rows:10,
                parentID: null,
                ownerID: -1
            },
            selected: null,
            totalRecords: 10,
        }
    },
    mounted() {
       this.getFolders();
    },
    methods: {
        getFolders() {
            this.loading = true;
            let url = "/doc/getfolders";
            axios.post(smartEnuApi+url, this.lazyParams, { headers: getHeader() })
            .then(response=>{
                this.catalog = response.data
                
                this.loading = false
            })
            .catch(error => {
                if (error.response.status == 401) {
                this.$store.dispatch("logLout");
            } else 
                console.error(error)
            }
            )
        },
        onExpand(node) {
        },
    }
}


</script>
             

