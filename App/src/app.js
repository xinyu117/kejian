const fastify = require('fastify')({ logger: true });
const path = require('path');

// 注册插件
fastify.register(require('@fastify/static'), {
  root: path.join(__dirname, '..', 'public'),
  prefix: '/public/'
});

fastify.register(require('@fastify/view'), {
  engine: {
    ejs: require('ejs')
  },
  root: path.join(__dirname, '..', 'views')
});

fastify.register(require('@fastify/formbody'));
fastify.register(require('@fastify/cookie'));
fastify.register(require('@fastify/multipart'));

// 注册会话管理
fastify.register(require('@fastify/session'), {
  secret: 'your-secret-key-here-change-in-production',
  cookieName: 'sessionId',
  cookie: {
    secure: false, // 在生产环境中应该设置为 true
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24小时
  }
});

// 数据库初始化
const db = require('./database');

// 注册路由
fastify.register(require('./routes/auth'));
fastify.register(require('./routes/courseware'));
fastify.register(require('./routes/payment'));

// 中间件：检查认证
fastify.addHook('preHandler', async (request, reply) => {
  // 跳过登录和注册页面的认证检查
  const publicRoutes = ['/login', '/register', '/api/auth/login', '/api/auth/register', '/api/auth/wechat'];
  
  if (publicRoutes.includes(request.url) || request.url.startsWith('/public/')) {
    return;
  }

  if (!request.session.userId) {
    if (request.url.startsWith('/api/')) {
      reply.code(401).send({ error: '未授权访问' });
    } else {
      reply.redirect('/login');
    }
  }
});

// 首页路由
fastify.get('/', async (request, reply) => {
  const coursewares = await db.getCoursewares();
  const user = await db.getUserById(request.session.userId);
  
  return reply.view('index', { 
    coursewares, 
    user,
    title: '教育课件平台'
  });
});

// 启动服务器
const start = async () => {
  try {
    await db.init();
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log('服务器运行在 http://localhost:3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start(); 