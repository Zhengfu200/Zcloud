<template>
    <n-page>
      <n-page-header title="Register" />
      <n-form>
        <n-form-item label="Username">
          <n-input v-model:value="username" placeholder="Enter your username" />
        </n-form-item>
        <n-form-item label="Password">
          <n-input type="password" v-model:value="password" placeholder="Enter your password" />
        </n-form-item>
        <n-button @click="handleRegister">Register</n-button>
      </n-form>
    </n-page>
  </template>
  
  <script>
  import { ref } from 'vue';  // 使用ref进行数据绑定
  
  export default {
    setup() {
      const username = ref('');  // 创建响应式username变量
      const password = ref('');  // 创建响应式password变量
  
      const handleRegister = async () => {
        try {
          const response = await fetch('http://localhost:3000/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              username: username.value,  // 使用ref绑定的value值
              password: password.value,
            }),
          });
  
          const data = await response.json();
          if (response.status === 201) {
            alert('Registration successful!');
            // 注册成功后跳转到登录页面
            window.location.href = '/login';
          } else {
            alert(data.message);
          }
        } catch (error) {
          console.error('Registration error:', error);
        }
      };
  
      return {
        username,
        password,
        handleRegister,
      };
    },
  };
  </script>
  