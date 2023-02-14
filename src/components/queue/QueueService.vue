<template>
    <div class="card">
        <Toolbar class="p-mb-4 font-style p-jc-center">        
        <template #start>
            <div class="flex p-flex-wrap-reverse">
            <div class="p-mr-2 p-mb-2" :label="$t('smartenu.newsList')">5</div> 
            </div>
        </template>
        </Toolbar>   
         <div class="p-mr-2 p-mb-2"><Button :label="$t('queue.next')"/></div> 
    </div>
</template>

<script>

export default {
 
  data() {
    return {
     
    }
  },
  methods: {   
  
   
  },
  created() {
    
  },
 
};
</script>

<style scoped>
.font-style {    
    width:300px;
    height:300px;
    font-size:220px;
}

</style>