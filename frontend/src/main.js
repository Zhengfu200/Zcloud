import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; // 引入 Vue Router

// 全局引入 Naive UI 组件库
import { create, NButton, NCard, NMessageProvider, NSpace, NGrid, NGridItem,NForm, NFormItem, NInput, NPageHeader } from 'naive-ui';

// 创建 Naive UI 组件的实例
const naive = create({
  components: [NButton, NCard, NMessageProvider, NSpace, NGrid, NGridItem,NForm, NFormItem, NInput, NPageHeader]
});

const app = createApp(App);

// 使用 Naive UI
app.use(naive);
app.use(router);

// 挂载 Vue 应用
app.mount('#app');
