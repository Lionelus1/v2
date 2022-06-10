<template>
    <div class="p-fluid">
        <div class="p-field">
            <label for="foldername" >{{$t('common.nameInQazaq')}}</label>
            <InputText id="fodernamekaz" v-model="folder.namekz" type="text" />
            <small class="p-error" v-if="validation.namekz">{{ $t("common.requiredField") }}</small>
        </div>
        <div class="p-field">
            <label for="foldernamerus">{{$t('common.nameInRussian')}}</label>
            <InputText id="foldernamerus" v-model="folder.nameru"  type="text"  />
            <small class="p-error" v-if="validation.nameru">{{ $t("common.requiredField") }}</small>
        </div>
        <div class="p-field">
            <label for="foldernameen">{{$t('common.nameInEnglish')}}</label>
            <InputText id="foldernameen" v-model="folder.nameen"  type="text" />
            <small class="p-error" v-if="validation.nameen">{{ $t("common.requiredField") }}</small>
        </div>
        <div class="p-field">
            <label for="foldercode">{{$t('common.code')}}</label>
            <InputText id="foldercode" v-model="folder.code"  type="text" />
            <small class="p-error" v-if="validation.code">{{ $t("common.requiredField") }}</small>
        </div>
        <div class="p-field">
            <label for="foldergroup">{{$t('common.userGroup')}}</label>
            <MultiSelect v-model="folder.groups" :options="groupsData" :optionLabel="'name' + $i18n.locale" v-bind:placeholder="$t('common.selectGroup')"  display="chip"/>
            <small class="p-error" v-if="validation.groups">{{ $t("common.requiredField") }}</small>
        </div>
        <div style="margin-top:5px;width:100%;text-align:right">
            <Button style="width:200px" :label="$t('common.save')" @click="updateFolder"></Button>
        </div> 
    </div>
</template>
<script>
import axios from "axios";
import {smartEnuApi, getHeader} from "@/config/config";

export default {
    
    data() {
        return {
            groupsData: [
                {namekz: 'білім алушылар', nameru: 'обучающиеся', nameen:'students', id: 0},
                {namekz: 'профессор-оқытушылар құрамы', nameru: 'профессорско-преподавательский состав', nameen:'teaching staff', id: 1},
                {namekz: 'қызметкерлер', nameru: 'сотрудники', nameen:'staff', id: 2},          
            ],
            language: ['kz', 'ru', 'en'],
            dialogOpenState: {
                addFolder : false,
            },
            folder: this.modelValue,
            state: this.visible,
            
            validation: {
                namekz: false,
                nameru: false,
                nameen: false,
                code: false,
                groups: false,
            }
    }
  },
    props: {
        modelValue: null,
    },
    emits: ['updated'],
    setup(props, context) {
    function updateValue(folder) {
      context.emit("update:modelValue", folder);
    }
    return {
      updateValue,
    };
  },
  methods: {

    notValid() {
        this.validation.namekz = this.folder.namekz === null || this.folder.namekz === ''
        this.validation.nameru = this.folder.nameru === null || this.folder.nameru === ''
        this.validation.nameen = this.folder.nameen === null || this.folder.nameen === ''
        this.validation.code = this.folder.code === null || this.folder.code === ''
        this.validation.groups = this.folder.groups === null || (this.folder.groups !== null && this.folder.groups.length<=0)
        var result = true;
        var validation = this.validation
        Object.keys(this.validation).forEach(function(k)
        {
            result = result && validation[k];
        });
        return result
    },
    showMessage(msgtype,message,content) {
        this.$toast.add({severity:msgtype, summary: message, detail:content, life: 3000});
    },
    moveFolder: function(folder) {
        this.folder = folder
        this.updateFolder()

    },
    updateFolder() {
        if (this.notValid()) {
            return
        }
        let url = "/doctemplate/createFolder";
        axios.post(smartEnuApi+url, this.folder, { headers: getHeader() })
        .then(response=>{
            this.folder.key = response.data.id;
            this.showMessage('success', this.$t('common.message.title.docCreation'),this.$t('common.message.catSuccesCreated'));
            this.$emit("updated", this.folder);
        },
        error =>{
          console.log(error);
        });
    },
    deleteFolder(hide) {
      
        let url = "/doc/deleteFolder";

        axios.post(smartEnuApi+url, {id: this.folder.id, hide: hide}, { headers: getHeader() })
        .then(response=>{
            this.folder.key = response.data.id;
            this.showMessage('success', this.$t('common.message.title.docCreation'),this.$t('common.message.catSuccesCreated'));
            this.$emit("updated", this.folder);
        },
        error =>{
          console.log(error);
        });
    },
  }
}
</script>