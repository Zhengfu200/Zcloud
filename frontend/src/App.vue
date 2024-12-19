<template>
  <n-page>
    <router-view/>
  </n-page>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

export default {
  data(){
    return{
      isLoggedIn: 0,
    };
  },
  methods: {
    // 检查登录状态
    checkLoginStatus() {
      const token = localStorage.getItem('token');  // 从 localStorage 获取 token
      if (!token) {
        this.$router.push('/login');  // 如果没有 token，则跳转到登录页面
      } else {
        this.isLoggedIn = true;
      }
    }
  },
  mounted(){
    this.checkLoginStatus();  // ��载时检查登录状态
  },
};
</script>
