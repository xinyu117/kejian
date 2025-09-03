const db = require('../database');
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');

async function authRoutes(fastify, options) {
  // 登录页面
  fastify.get('/login', async (request, reply) => {
    if (request.session.userId) {
      return reply.redirect('/');
    }
    return reply.view('login', { title: '用户登录' });
  });

  // 注册页面
  fastify.get('/register', async (request, reply) => {
    if (request.session.userId) {
      return reply.redirect('/');
    }
    return reply.view('register', { title: '用户注册' });
  });

  // 用户登录API
  fastify.post('/api/auth/login', async (request, reply) => {
    const { username, password } = request.body;

    try {
      const user = await db.validateUser(username, password);
      if (user) {
        request.session.userId = user.id;
        return reply.send({ success: true, message: '登录成功' });
      } else {
        return reply.code(401).send({ success: false, message: '用户名或密码错误' });
      }
    } catch (error) {
      return reply.code(500).send({ success: false, message: '登录失败' });
    }
  });

  // 用户注册API
  fastify.post('/api/auth/register', async (request, reply) => {
    const { username, email, password } = request.body;

    try {
      const existingUser = await db.getUserByUsername(username);
      if (existingUser) {
        return reply.code(400).send({ success: false, message: '用户名已存在' });
      }

      const userId = await db.createUser({ username, email, password });
      request.session.userId = userId;
      return reply.send({ success: true, message: '注册成功' });
    } catch (error) {
      return reply.code(500).send({ success: false, message: '注册失败' });
    }
  });

  // 微信登录二维码
  fastify.get('/api/auth/wechat-qr', async (request, reply) => {
    try {
      // 生成微信登录URL（这里是模拟的）
      const wechatUrl = `https://open.weixin.qq.com/connect/qrconnect?appid=YOUR_APPID&redirect_uri=${encodeURIComponent('http://localhost:3000/api/auth/wechat/callback')}&response_type=code&scope=snsapi_login&state=${Date.now()}`;
      
      // 生成二维码
      const qrCode = await QRCode.toDataURL(wechatUrl);
      
      return reply.send({ qrCode });
    } catch (error) {
      return reply.code(500).send({ success: false, message: '生成微信登录二维码失败' });
    }
  });

  // 微信登录回调（模拟）
  fastify.get('/api/auth/wechat/callback', async (request, reply) => {
    const { code } = request.query;
    
    try {
      // 这里应该调用微信API获取用户信息
      // 为了演示，我们创建一个模拟的微信用户
      const wechatUser = {
        openid: `wechat_${Date.now()}`,
        nickname: '微信用户',
        headimgurl: ''
      };

      // 检查是否已存在该微信用户
      let user = await db.getUserByWechatOpenid(wechatUser.openid);
      
      if (!user) {
        // 创建新用户
        const userId = await db.createWechatUser({
          username: wechatUser.nickname,
          wechat_openid: wechatUser.openid
        });
        user = await db.getUserById(userId);
      }

      request.session.userId = user.id;
      return reply.redirect('/');
    } catch (error) {
      return reply.redirect('/login?error=wechat_login_failed');
    }
  });

  // 退出登录
  fastify.post('/api/auth/logout', async (request, reply) => {
    request.session.destroy();
    return reply.send({ success: true, message: '退出成功' });
  });

  // 获取当前用户信息
  fastify.get('/api/auth/me', async (request, reply) => {
    try {
      const user = await db.getUserById(request.session.userId);
      if (user) {
        const { password, ...userInfo } = user;
        return reply.send(userInfo);
      }
      return reply.code(404).send({ error: '用户不存在' });
    } catch (error) {
      return reply.code(500).send({ error: '获取用户信息失败' });
    }
  });
}

module.exports = authRoutes; 