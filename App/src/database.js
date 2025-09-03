const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

class Database {
  constructor() {
    this.db = new sqlite3.Database(path.join(__dirname, '..', 'data.db'));
  }

  async init() {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        // 用户表
        this.db.run(`
          CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE,
            password TEXT NOT NULL,
            wechat_openid TEXT UNIQUE,
            is_premium BOOLEAN DEFAULT FALSE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // 课件表
        this.db.run(`
          CREATE TABLE IF NOT EXISTS coursewares (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            thumbnail TEXT,
            file_path TEXT NOT NULL,
            is_free BOOLEAN DEFAULT TRUE,
            price DECIMAL(10,2) DEFAULT 0,
            category TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // 支付记录表
        this.db.run(`
          CREATE TABLE IF NOT EXISTS payments (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            status TEXT DEFAULT 'pending',
            wechat_order_id TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
          )
        `);

        // 创建测试数据
        this.createTestData();
        resolve();
      });
    });
  }

  async createTestData() {
    // 创建测试用户
    const adminUser = {
      id: uuidv4(),
      username: 'admin',
      password: await bcrypt.hash('admin123', 10),
      is_premium: true
    };

    const normalUser = {
      id: uuidv4(),
      username: 'user',
      password: await bcrypt.hash('user123', 10),
      is_premium: false
    };

    this.db.run(
      'INSERT OR IGNORE INTO users (id, username, password, is_premium) VALUES (?, ?, ?, ?)',
      [adminUser.id, adminUser.username, adminUser.password, adminUser.is_premium]
    );

    this.db.run(
      'INSERT OR IGNORE INTO users (id, username, password, is_premium) VALUES (?, ?, ?, ?)',
      [normalUser.id, normalUser.username, normalUser.password, normalUser.is_premium]
    );

    // 创建20个测试课件
    const categories = ['数学', '语文', '英语', '科学', '历史'];
    const subjects = ['基础', '进阶', '高级', '专项', '综合'];
    
    for (let i = 1; i <= 20; i++) {
      const courseware = {
        id: uuidv4(),
        title: `课件${i}: ${categories[i % 5]}${subjects[(i-1) % 5]}教程`,
        description: `这是第${i}个测试课件，包含丰富的教学内容和实例演示。适合${categories[i % 5]}学科的学习。`,
        thumbnail: `/public/images/thumbnail${i}.jpg`,
        file_path: `course${i}.html`,
        is_free: i <= 10, // 前10个免费，后10个付费
        price: i > 10 ? (Math.floor(Math.random() * 50) + 10) : 0,
        category: categories[i % 5]
      };

      this.db.run(`
        INSERT OR IGNORE INTO coursewares 
        (id, title, description, thumbnail, file_path, is_free, price, category) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        courseware.id, courseware.title, courseware.description, 
        courseware.thumbnail, courseware.file_path, courseware.is_free, 
        courseware.price, courseware.category
      ]);
    }
  }

  // 用户相关方法
  async createUser(userData) {
    const id = uuidv4();
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO users (id, username, email, password) VALUES (?, ?, ?, ?)',
        [id, userData.username, userData.email, hashedPassword],
        function(err) {
          if (err) reject(err);
          else resolve(id);
        }
      );
    });
  }

  async getUserByUsername(username) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM users WHERE username = ?',
        [username],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  async getUserById(id) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM users WHERE id = ?',
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  async validateUser(username, password) {
    const user = await this.getUserByUsername(username);
    if (user && await bcrypt.compare(password, user.password)) {
      return user;
    }
    return null;
  }

  // 课件相关方法
  async getCoursewares(category = null) {
    return new Promise((resolve, reject) => {
      let sql = 'SELECT * FROM coursewares ORDER BY created_at DESC';
      let params = [];
      
      if (category) {
        sql = 'SELECT * FROM coursewares WHERE category = ? ORDER BY created_at DESC';
        params = [category];
      }

      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  async getCoursewareById(id) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM coursewares WHERE id = ?',
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  async searchCoursewares(keyword) {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM coursewares WHERE title LIKE ? OR description LIKE ? ORDER BY created_at DESC',
        [`%${keyword}%`, `%${keyword}%`],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  }

  // 支付相关方法
  async createPayment(userId, amount) {
    const id = uuidv4();
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO payments (id, user_id, amount) VALUES (?, ?, ?)',
        [id, userId, amount],
        function(err) {
          if (err) reject(err);
          else resolve(id);
        }
      );
    });
  }

  async updateUserToPremium(userId) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE users SET is_premium = TRUE WHERE id = ?',
        [userId],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });
  }

  // 微信用户相关方法
  async getUserByWechatOpenid(openid) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM users WHERE wechat_openid = ?',
        [openid],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  async createWechatUser(userData) {
    const id = uuidv4();
    const password = await bcrypt.hash(Math.random().toString(36), 10); // 随机密码
    
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO users (id, username, password, wechat_openid) VALUES (?, ?, ?, ?)',
        [id, userData.username, password, userData.wechat_openid],
        function(err) {
          if (err) reject(err);
          else resolve(id);
        }
      );
    });
  }

  // 支付相关方法
  async getPaymentById(id) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM payments WHERE id = ?',
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  async updatePaymentStatus(id, status) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE payments SET status = ? WHERE id = ?',
        [status, id],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });
  }

  // 通用数据库操作
  async run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  }
}

module.exports = new Database(); 