<template>
    <div>
        <div class="p-col-12">
            <h5>{{$t('cafedra.title', {name: loginedUser.mainPosition.department['name'+$i18n.locale[0].toUpperCase() + $i18n.locale.slice(1)]})}}</h5>
            <Accordion   :activeIndex="0">
                <AccordionTab :header="$t('cafedra.practiceResponsibles')">
                    <DataTable :value="responsibles" editMode="row" dataKey="id" v-model:editingRows="editingRows" @row-edit-save="onRowEditSave" responsiveLayout="scroll">
                        <Column v-if="$i18n.locale=='kz'" field="nameKz" :styles="{width:'20%'}"></Column>
                        <Column v-if="$i18n.locale=='ru'" field="nameRu" :styles="{width:'20%'}"></Column>
                        <Column v-if="$i18n.locale=='en'" field="nameEn" :styles="{width:'20%'}"></Column>
                   
                       
                        <Column field="responsible" :header="$t('cafedra.responsible')" :styles="{width:'20%'}">
                            <template #editor="slotProps">
                                <FindUser @input="correct" @remove="correct" class="p-mt-2" :disabled="localReadonly" :editMode="true" v-model="slotProps.data.responsible"   :max="1"/>
                            </template>
                            <template #body="slotProps">
                                {{slotProps.data.responsible != null ? slotProps.data.responsible.fullName : ""}}
                            </template>
                        </Column>
                        <Column :rowEditor="true" :styles="{width:'10%', 'min-width':'8rem'}" :bodyStyle="{'text-align':'center'}"></Column>
                    </DataTable>
                </AccordionTab>
                <AccordionTab>
                    <div>
                    
                </div>
                </AccordionTab>
            </Accordion>
        </div>
    </div>
    
</template>

<script>
import axios from 'axios';
import {getHeader, findRole, smartEnuApi} from "@/config/config";
import FindUser from "@/helpers/FindUser";

export default {
  components: {FindUser}, 
  data() {
    return {
        responsibles: [],
        loginedUser: null,
        editingRows:[],
        users: [],
    }
  },
  created() {
    this.init(),
    this.loginedUser = this.$store.state.loginedUser;
  },
  methods: {
    init() {
        axios
        .post(
          smartEnuApi + "/dic/getPracticeResponsibles",{},
          {
            headers: getHeader(),
          }
        )
        .then(res => {
          this.responsibles = res.data
         
        })
        .catch((error) => {
          if (error.response.status == 401) {
            this.$store.dispatch("logLout");
          } else {
            this.$toast.add({
              severity: "error",
              summary: "Dictionary load error:\n" + error,
              life: 3000,
            });
          }
        });
    },
    onRowEditSave(event) {
        alert("sasa")
            let { newData, index } = event;

            this.products2[index] = newData;
    },
  }
}

</script>

