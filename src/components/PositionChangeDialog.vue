<template>
  <BlockUI :blocked="loading" :fullScreen="true"></BlockUI>
  <Dialog v-model:visible="visible" modal position="center" :style="{ width: '50vw' }" class="p-fluid">
    <p> {{ getCurrentPosition() }} </p>
    <Dropdown v-model="selectedPosition" :options="positions" optionLabel="name"></Dropdown>
    <template #footer>
        <Button class="p-button-help" :label="$t('positions.changePosition')" @click="visible = false;changePosition()" />
        <Button :label="$t('positions.continue')" @click="visible = false" autofocus />
    </template>
  </Dialog>
</template>
<script>
import axios from 'axios';

import { mapActions } from 'vuex';

import { getHeader, smartEnuApi } from "@/config/config";

export default {
  name: 'PositionChangeDialog',
  components: { },
  props: { },
  emits: [],
  data() {
    return {
      loading: false,
      visible: false,

      selectedPosition: null,
      positions: [],

      loginedUser: null,
    }
  },
  mounted() {
    this.parse(); 
  },
  methods: {
    ...mapActions(['setLoginedUser']),
    showMessage(msgtype, message, content) {
      this.$toast.add({
        severity: msgtype,
        summary: message,
        detail: content,
        life: 3000
      });
    },
    show() {
      this.parse();
      this.visible = true;
    },
    parse() {
      this.selectedPosition = null;
      this.positions = [];
      this.loginedUser = JSON.parse(localStorage.getItem('loginedUser'));

      if (this.loginedUser.mainPosition) {
        this.positions.push({
          id: -1,
          name: this.$t('positions.individual'),
        })
      }

      for (let i in this.loginedUser.positions) {
        let name = ''

        let org = this.loginedUser.positions[i].organization
        if (org.id) {
          let orgName = ''

          if (this.$i18n.locale === 'en') {
            orgName = org.nameen
          } else if (this.$i18n.locale === 'ru') {
            orgName = org.nameru
          } else {
            orgName = org.name
          }

          if (!orgName) {
            orgName = 'no name'
          }

          name += orgName + ' - '
        }

        let dep = this.loginedUser.positions[i].department
        if (dep.id) {
          let depName = ''

          if (this.$i18n.locale === 'en') {
            depName = dep.nameEn
          } else if (this.$i18n.locale === 'ru') {
            depName = dep.nameRu
          } else {
            depName = dep.nameKz
          }

          if (!depName) {
            depName = dep.name
          }

          name += depName + ' - '
        }

        let pos = this.loginedUser.positions[i]
        if (pos.id) {
          let posName = ''

          if (this.$i18n.locale === 'en') {
            posName = pos.nameen
          } else if (this.$i18n.locale === 'ru') {
            posName = pos.nameru
          } else {
            posName = pos.namekz
          }

          if (!posName) {
            posName = pos.name
          }

          name += posName
        }

        this.positions.push({
          id: i,
          name: name,
        })
      }
    },
    getCurrentPosition() {
      if (!this.loginedUser) {
        return ''
      }

      let result = this.$t('positions.beginText')

      if (!this.loginedUser.mainPosition) {
        return result + this.$t('positions.individual')
      }

      if (this.loginedUser.mainPosition.organization.id) {
        let orgName = ''

        if (this.$i18n.locale === 'en') {
          orgName = this.loginedUser.mainPosition.organization.nameen
        } else if (this.$i18n.locale === 'ru') {
          orgName = this.loginedUser.mainPosition.organization.nameru
        } else {
          orgName = this.loginedUser.mainPosition.organization.name
        }

        if (!orgName) {
          orgName = 'no name'
        }

        result += orgName + ' - '
      }

      if (this.loginedUser.mainPosition.department.id) {
        let depName = ''

        if (this.$i18n.locale === 'en') {
          depName = this.loginedUser.mainPosition.department.nameEn
        } else if (this.$i18n.locale === 'ru') {
          depName = this.loginedUser.mainPosition.department.nameRu
        } else {
          depName = this.loginedUser.mainPosition.department.nameKz
        }

        if (!depName) {
          depName = this.loginedUser.mainPosition.department.name
        }

        result += depName + ' - '
      }

      if (this.loginedUser.mainPosition.id) {
        let posName = ''

        if (this.$i18n.locale === 'en') {
          posName = this.loginedUser.mainPosition.nameen
        } else if (this.$i18n.locale === 'ru') {
          posName = this.loginedUser.mainPosition.nameru
        } else {
          posName = this.loginedUser.mainPosition.namekz
        }

        if (!posName) {
          posName = this.loginedUser.mainPosition.name
        }

        result += posName
      }

      return result 
    },
    changePosition() {
      if (!this.selectedPosition) {
        this.visible = false;
        return
      }

      this.loading = true;

      let position = null
      
      if (this.selectedPosition.id >= 0) {
        position = this.loginedUser.positions[this.selectedPosition.id]
      }

      axios.post(smartEnuApi + '/changePosition', {
        position: position,
      }, {
        headers: getHeader(),
      }).then(res => {
        axios.get(smartEnuApi + '/logineduserinfo', {
          headers: getHeader(),
        }).then(res => {
          localStorage.setItem("loginedUser", JSON.stringify(res.data));
          this.setLoginedUser();

          this.loading = false;
          this.visible = false;

          location.reload();
        }).catch(err => {
          this.loading = false;
          this.visible = false;
          this.$router.push({name:'Login'});
        });
      }).catch(err => {
        if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout")
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath), null)
        } else {
          console.log(err)
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
        }

        this.loading = false;
        this.visible = false;
      });
    }
  },
}
</script>
<style scoped>
</style>