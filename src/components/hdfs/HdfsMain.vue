<template>
  <div class="p-grid">
    <div class="p-col-12">
      <HdfsUpload></HdfsUpload>
      <HdfsList></HdfsList>
    </div>
  </div>
</template>

<script>
import HdfsUpload from "@/components/hdfs/HdfsUpload";
import HdfsList from "@/components/hdfs/HdfsList";


export default {
  components: {
    HdfsUpload,
    HdfsList
  }
};
</script>

<style>
.p-button {
  margin-right: .5rem;
}
</style>