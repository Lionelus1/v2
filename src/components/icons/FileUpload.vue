<template>
  <div>
    <Menubar :model="items" />
    <router-view></router-view>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Menubar from 'primevue/menubar';

export default {
  name: "App",
  components: { Menubar },
  setup() {
    const router = useRouter();

    const items = ref([
      { label: 'Главная', icon: 'pi pi-home', command: () => router.push('/') },
      { label: 'Редактировать', icon: 'pi pi-pencil', command: () => router.push('/edit') }
    ]);

    return { items };
  }
};
</script>

<style>
body {
  font-family: Arial, sans-serif;
  background-color: #f0f0f0;
  margin: 0;
  padding: 0;
}
</style>

<router>
{
  path: "/",
  component: () => import("@/components/Training.vue")
},
{
  path: "/edit",
  component: () => import("@/components/FileEditor.vue")
}
</router>
