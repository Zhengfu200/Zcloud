import { createRouter, createWebHistory } from 'vue-router';
import FileList from '@/components/FileList.vue';
import login from '@/components/login.vue';
import Register from '@/components/Register.vue';

const routes = [
    {
      path: '/',
      name: 'Home',
      component: FileList,
    },
    {
      path: '/login',
      name: 'Login',
      component: login,
    },
    {
      path: '/register',
      name: 'Register',
      component: Register,
    },
  ];

  const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes,
  });
  
  export default router;