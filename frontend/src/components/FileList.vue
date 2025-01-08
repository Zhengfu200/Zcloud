<template>
    <n-space vertical size="large" align="center" class="file-list">
  <n-upload
    :multiple = true
    :show-file-list="true" 
    :on-before-upload="onFileChange" 
  >
    <n-button>上传文件</n-button>
  </n-upload>
        <n-button @click="uploadFile">Upload</n-button>
        <n-grid x-gap="24" y-gap="24" cols="4">
            <n-grid-item v-for="(file, index) in files" :key="index">
                <n-card :title="file.name" bordered hoverable class="file-card">
                    <template v-slot:header-extra>
                        <n-button v-if="!file.isDirectory" type="primary"
                            @click="handleFileDownload(file.relativePath, file.name)">
                            下载
                        </n-button>
                        <n-button v-else type="success" @click="navigateToFolder(file.relativePath)">
                            打开文件夹
                        </n-button>
                    </template>
                    <p v-if="!file.isDirectory">文件大小: {{ file.size }} bytes</p>
                    <p v-if="!file.isDirectory">文件类型: {{ file.extension }}</p>
                    <p>上传时间: {{ formatDate(file.uploadTime) }}</p>
                    <p>文件路径: <a :href="file.relativePath" target="_blank">{{ file.relativePath }}</a></p>
                </n-card>
            </n-grid-item>
        </n-grid>
        <n-button v-if="currentPath !== username" type="info" @click="goBack">返回上一级</n-button>
    </n-space>
</template>

<script>
import axios from 'axios';

export default {
    data() {
        return {
            files:[],
            currentPath: '',
            username: '',
            selectedFile: null,
            message: '',
        };
    },
    methods: {
        checkLogin() {
            const token = localStorage.getItem('token');
            if (token) {
                const decodedToken = JSON.parse(atob(token.split('.')[1]))
                this.username = decodedToken.username;
                return true;
            }
            return false;
        },

        async fetchFiles(path = '') {
            const token = localStorage.getItem('token');
            let userFolderPath = `${path}`;
            console.log(userFolderPath);

            if (!this.checkLogin()) {
                console.log('用户未登录');
                return;
            }

            try {
                console.log(userFolderPath);
                const response = await fetch(`http://localhost:3000/files?path=${encodeURIComponent(userFolderPath)}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': token,
                        'path': userFolderPath,
                    },
                });
                const data = await response.json();
                this.files = data;
                this.currentPath = path;
                console.log(this.currentPath);
            } catch (error) {
                console.error('Error fetching files:', error);
            }
        },
        isImage(fileName) {
            const imageExtensions = ['jpg', 'jpeg', 'png', 'gif'];
            const fileExtension = fileName.split('.').pop().toLowerCase();
            return imageExtensions.includes(fileExtension);
        },
        handleFileDownload(filePath, fileName) {
            const downloadPath = 'uploads/' + filePath;
            console.log(fileName);
            if (this.isImage(fileName)) {
                console.error("image detected!")
                const link = document.createElement('a');
                link.href = `http://localhost:3000/${downloadPath}`;
                link.download = fileName;  // 强制下载
                link.click();
            } else {
                window.location.href = `http://localhost:3000/${downloadPath}`;
            }
        },
        // 格式化上传时间为 "YYYY年MM月DD日 HH:MM" 格式
        formatDate(dateString) {
            const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
            const date = new Date(dateString);
            return date.toLocaleDateString(undefined, options);
        },
        //进入文件夹
        navigateToFolder(relativePath) {
            this.fetchFiles(relativePath);
        },
        // 返回上一级文件夹
        goBack() {
            console.log(this.currentPath);
            if (this.currentPath && this.currentPath.includes('\\')) {
                const pathParts = this.currentPath.split('\\');
                pathParts.pop();
                this.currentPath = pathParts.join('\\');
                this.fetchFiles(this.currentPath);
            } else {
                console.log('已经在根目录，无法返回上一级');
            }

        },
        //上传文件
        onFileChange({file}) {
            console.log('File selected:', file);
            this.selectedFile = file;

        },
        async uploadFile() {
            console.log('Upload button clicked');

            if (!this.selectedFile) {
                console.log('No file selected.');
                return;
            }

            const formData = new FormData();
            formData.append('file', this.selectedFile.file);

            try {
                console.log('File uploading:', this.selectedFile);
                const response = await axios.post('http://localhost:3000/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                this.message = response.data;
            } catch (error) {
                this.message = 'File upload failed.';
                console.error(error);
            }
        },
        mounted() {
            this.fetchFiles();
        }
    },
    mounted() {
        this.fetchFiles();
    }
};
</script>

<style scoped>
.file-list {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.file-card {
    width: 100%;
    max-width: 250px;
}

.n-grid {
    justify-content: center;
}
</style>