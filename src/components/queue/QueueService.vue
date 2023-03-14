<template>
    <div class="card">
        <Toolbar class="mb-4 font-style justify-content-center">        
        <template #start>
            <div class="flex flex-wrap-reverse">
            <div class="mr-2 mb-2" :label="$t('smartenu.newsList')">5</div> 
            </div>
        </template>
        </Toolbar>   
         <div class="mr-2 mb-2"><Button :label="$t('queue.next')"/></div> 
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