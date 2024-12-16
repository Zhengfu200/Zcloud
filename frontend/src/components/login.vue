<template>
    <n-card title="Login" class="login-card">
      <n-form @submit="handleLogin">
        <n-form-item label="Username">
          <n-input v-model:value="username" placeholder="Enter your username" />
        </n-form-item>
  
        <n-form-item label="Password">
          <n-input type="password" v-model:value="password" placeholder="Enter your password" />
        </n-form-item>
  
        <n-button type="primary" @click="handleLogin">Login</n-button>
      </n-form>
    </n-card>
  </template>
  
  <script>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { NCard, NForm, NFormItem, NInput, NButton } from 'naive-ui';
  
  export default {
    name: 'Login',
    setup() {
      const username = ref('');
      const password = ref('');
      const router = useRouter();
  
      // 处理登录请求
      const handleLogin = async () => {
        try {
          const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username.value, password: password.value }),
          });
          const data = await response.json();
  
          if (data.success) {
            // 登录成功，记录用户名并跳转到主页
            localStorage.setItem('token', data.token);
            localStorage.setItem('isLoggedIn', 1);
            localStorage.setItem('username', data.username);
            router.push('/'); // 跳转到主页
          } else {
            // 登录失败
            alert(data.message);
          }
        } catch (error) {
          console.error('Login error:', error);
          alert('An error occurred. Please try again later.');
        }
      };
  
      return {
        username,
        password,
        handleLogin,
      };
    },
  };
  </script>
  
  <style scoped>
  .login-card {
    width: 300px;
    margin: 50px auto;
  }
  </style>
  