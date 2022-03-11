  <template>
  <router-view
    v-model:pagemenu="menu"
  ></router-view>
</template>
<script>
  export default {
    name:'app',
    data() {
      return {
        menu: "salem"
      }
    }
  }
</script>
<style scoped>

</style>
