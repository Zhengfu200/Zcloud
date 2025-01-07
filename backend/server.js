const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();
const jwt = require('jsonwebtoken');
const SECRET_KEY = '63db94272f58cdc4511b9738d0a165c294c9a90cec0923176f4e21d66909ce32db1b1f8471d689b5d6201cb38417ff92b5b2c50c74e3908279adaccfa79f34b5';

// uploads 文件夹路径
const uploadDir = path.join(__dirname, 'uploads');

app.use(express.json());

// 允许跨域
app.use(cors());

// 提供静态文件的访问
app.use('/uploads', express.static(uploadDir));

// 创建 SQLite 数据库连接
const db = new sqlite3.Database(path.join(__dirname, 'users.db'), (err) => {
  if (err) {
    console.error('数据库连接失败:', err.message);
  } else {
    console.log('数据库连接成功');
  }
});

// 用户登录接口
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // 查询数据库验证用户名和密码
  db.get("SELECT * FROM users WHERE username = ? AND password = ?", [username, password], (err, row) => {
    if (err) {
      console.log("db failed");
      res.status(500).json({ message: "Database error" });
    } else if (row) {
      const token = jwt.sign({ username: row.username }, SECRET_KEY, { expiresIn: '1h' });
      console.log("login success", token);
      res.json({ success: true, message: "Login successful", username: row.username, isLoggedIn: 1, token });
    } else {
      console.log("login failed");
      res.status(400).json({ success: false, message: "Invalid username or password", isLoggedIn: 0 });
    }
  });
});

// 注册接口
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  // 检查用户名是否已存在
  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, row) => {
    if (row) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    try {
      // 插入新用户数据
      const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
      db.run(sql, [username, password], (err) => {
        if (err) {
          return res.status(500).json({ message: 'Error registering user' });
        }

        const userFolderPath = path.join(__dirname, 'uploads', username);

        if (!fs.existsSync(userFolderPath)) {
          fs.mkdirSync(userFolderPath, { recursive: true });
          console.log(`用户文件夹已创建: ${userFolderPath}`);
        }

        const readmeSource = path.join(__dirname, 'uploads', 'README.md');
        const readmeDestination = path.join(userFolderPath, 'README.md');

        try {
          fs.copyFileSync(readmeSource, readmeDestination);
          console.log(`readme.md 文件已复制到: ${readmeDestination}`);
        } catch (copyError) {
          console.error('复制 readme.md 文件时发生错误:', copyError);
        }
        res.status(201).json({ message: 'User registered successfully' });
      });
    } catch (error) {
      res.status(500).json({ message: 'Error hashing password' });
    }
  });
});

// 中间件：验证JWT并提取用户名
function authenticateToken(req, res, next) {
  const token = req.headers['authorization'];

  if (!token) return res.status(401).json({ message: 'Access denied' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
}

// 获取文件列表接口
app.get('/files', authenticateToken, (req, res) => {
  const username = req.user.username;
  let userFolderPath = req.headers['path'];
  let currentPath = path.join(uploadDir, username, userFolderPath);
  if (userFolderPath != '') {
    console.log(userFolderPath);
    currentPath = path.join(uploadDir, userFolderPath);
  }
  console.log(currentPath);

   // 存储 currentPath 到 app.locals
   app.locals.uploadPath = currentPath;

  if (!fs.existsSync(currentPath)) {
    return res.status(404).json({ message: 'Directory not found' });
  }

  fs.readdir(currentPath, (err, files) => {
    if (err) {
      return res.status(500).json({ message: 'Error reading directory' });
    }

    const fileList = files.map(file => {
      const filePath = path.join(currentPath, file);
      const fileStats = fs.statSync(filePath);

      return {
        name: file,
        size: fileStats.size,
        isDirectory: fileStats.isDirectory(),
        extension: fileStats.isDirectory() ? null : path.extname(file),
        uploadTime: fileStats.birthtime,
        relativePath: path.relative(uploadDir, filePath)
      };
    });

    res.json(fileList);
  });
});

// 文件下载接口
app.get('/download/:filename', (req, res) => {
  const username = req.user.username;
  const fileName = req.params.filename;
  const filePath = path.join(uploadDir, username, fileName);

  fs.stat(filePath, (err) => {
    if (err) {
      return res.status(404).send('File not found');
    }

    res.download(filePath, fileName);
  });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // 从请求体的表单数据中获取 currentPath
    let uploadDir = String(app.locals.uploadPath);
    cb(null, uploadDir); // 使用 currentPath 作为上传路径
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // 保持文件名
  }
});

const upload = multer({ storage: storage });

//文件上传接口
app.post('/upload', upload.single('file'), (req, res) => {
  console.log("Uploading",req.file);
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  res.send(`File uploaded to ${req.body.currentPath}`);
});

// 启动服务器
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
