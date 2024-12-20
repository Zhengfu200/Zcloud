<template>

  <n-card title="Register" class="register-card">
    <n-form-item label="Username">
      <n-input v-model:value="username" placeholder="Enter your username" />
    </n-form-item>
    <n-form-item label="Password">
      <n-input type="password" v-model:value="password" placeholder="Enter your password" />
    </n-form-item>
    <n-button @click="handleRegister" type="primary" class="n-button">Register</n-button>
  </n-card>
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

<style scoped>
.register-card {
  width: 300px;
  margin: 50px auto;
  padding: 20px;
  border-radius: 8px;
  background-color: #f9f9f9;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.n-button {
  font-size: 16px;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.n-button--primary {
  background-color: #409eff;
  color: #fff;
}

.n-button--primary:hover {
  background-color: #4c9fff;
}

.n-button--ghost {
  color: #409eff;
  border: 1px solid #409eff;
  background-color: transparent;
}
</style>