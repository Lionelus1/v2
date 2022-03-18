<template>
  <div>
    <Menubar :model="menu" :key="active" style="height:36px;margin-top:-7px;margin-left:-14px;margin-right:-14px"></Menubar>
  </div>
</template>
<script>
export default {
	 data() {
		return {
            active: null,
    }
   },
    props: {
      menu: null,
      readonly: Boolean,
  },
}

</script>