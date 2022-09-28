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
        menu: null
      }
    }
  }
</script>
<style>


</style>
