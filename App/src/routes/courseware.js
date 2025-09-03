const db = require('../database');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

async function coursewareRoutes(fastify, options) {
  // 课件详情页面
  fastify.get('/courseware/:id', async (request, reply) => {
    const { id } = request.params;
    
    try {
      const courseware = await db.getCoursewareById(id);
      const user = await db.getUserById(request.session.userId);
      
      if (!courseware) {
        return reply.code(404).view('error', { 
          title: '课件不存在', 
          message: '请求的课件不存在' 
        });
      }

      // 检查权限
      if (!courseware.is_free && !user.is_premium) {
        return reply.view('payment-required', { 
          courseware, 
          title: '需要付费',
          user 
        });
      }

      return reply.view('courseware-detail', { 
        courseware, 
        user,
        title: courseware.title 
      });
    } catch (error) {
      return reply.code(500).view('error', { 
        title: '服务器错误', 
        message: '获取课件信息失败' 
      });
    }
  });

  // 课件内容页面
  fastify.get('/courseware/:id/content', async (request, reply) => {
    const { id } = request.params;
    
    try {
      const courseware = await db.getCoursewareById(id);
      const user = await db.getUserById(request.session.userId);
      
      if (!courseware) {
        return reply.code(404).send('课件不存在');
      }

      // 检查权限
      if (!courseware.is_free && !user.is_premium) {
        return reply.code(403).send('需要付费才能查看此课件');
      }

      // 读取课件HTML文件
      // 现在所有课件的file_path都是 /coursewares/filename.html 格式
      const filename = courseware.file_path.replace('/coursewares/', '');
      const filePath = path.join(__dirname, '..', '..', 'coursewares', filename);
      
      try {
        const content = await fs.readFile(filePath, 'utf8');
        
        // 设置强制不缓存的HTTP头
        reply.header('Cache-Control', 'no-cache, no-store, must-revalidate');
        reply.header('Pragma', 'no-cache');
        reply.header('Expires', '0');
        reply.type('text/html').send(content);
      } catch (fileError) {
        // 如果文件不存在，返回默认内容
        const defaultContent = `
          <!DOCTYPE html>
          <html>
          <head>
              <meta charset="UTF-8">
              <title>${courseware.title}</title>
              <style>
                  body { font-family: Arial, sans-serif; margin: 40px; }
                  .header { border-bottom: 2px solid #007bff; padding-bottom: 20px; }
                  .content { margin-top: 30px; line-height: 1.6; }
              </style>
          </head>
          <body>
              <div class="header">
                  <h1>${courseware.title}</h1>
                  <p><strong>分类:</strong> ${courseware.category}</p>
              </div>
              <div class="content">
                  <h2>课程介绍</h2>
                  <p>${courseware.description}</p>
                  
                  <h2>学习目标</h2>
                  <ul>
                      <li>掌握${courseware.category}的基本概念</li>
                      <li>理解相关理论知识</li>
                      <li>能够应用所学知识解决实际问题</li>
                  </ul>
                  
                  <h2>课程内容</h2>
                  <p>这里是课程的主要内容。本课件包含了丰富的教学材料和实例演示。</p>
                  
                  <h3>第一章：基础知识</h3>
                  <p>介绍${courseware.category}的基础概念和原理。</p>
                  
                  <h3>第二章：进阶内容</h3>
                  <p>深入学习${courseware.category}的高级知识点。</p>
                  
                  <h3>第三章：实践应用</h3>
                  <p>通过实际案例学习如何应用所学知识。</p>
                  
                  <div style="margin-top: 40px; padding: 20px; background-color: #f8f9fa; border-radius: 5px;">
                      <h4>练习题</h4>
                      <p>1. 请简述${courseware.category}的基本概念。</p>
                      <p>2. 举例说明${courseware.category}的应用场景。</p>
                      <p>3. 分析${courseware.category}的优势和局限性。</p>
                  </div>
              </div>
          </body>
          </html>
        `;
        reply.type('text/html').send(defaultContent);
      }
    } catch (error) {
      return reply.code(500).send('服务器错误');
    }
  });

  // 搜索课件API
  fastify.get('/api/courseware/search', async (request, reply) => {
    const { q: keyword, category } = request.query;
    
    try {
      let coursewares;
      if (keyword) {
        coursewares = await db.searchCoursewares(keyword);
      } else {
        coursewares = await db.getCoursewares(category);
      }
      
      return reply.send({ coursewares });
    } catch (error) {
      return reply.code(500).send({ error: '搜索失败' });
    }
  });

  // 获取所有课件API
  fastify.get('/api/courseware', async (request, reply) => {
    const { category } = request.query;
    
    try {
      const coursewares = await db.getCoursewares(category);
      return reply.send({ coursewares });
    } catch (error) {
      return reply.code(500).send({ error: '获取课件列表失败' });
    }
  });

  // 上传课件页面
  fastify.get('/upload', async (request, reply) => {
    const user = await db.getUserById(request.session.userId);
    return reply.view('upload', { 
      title: '上传课件',
      user 
    });
  });

  // 上传课件API
  fastify.post('/api/courseware/upload', async (request, reply) => {
    try {
      const data = await request.file();
      const { title, description, category, is_free, price } = data.fields;
      
      if (!data) {
        return reply.code(400).send({ error: '请选择文件' });
      }

      // 保存文件
      const filename = `${uuidv4()}.html`;
      const filepath = path.join(__dirname, '..', '..', 'coursewares', filename);
      
      // 确保目录存在
      await fs.mkdir(path.dirname(filepath), { recursive: true });
      
      // 保存文件
      const buffer = await data.toBuffer();
      await fs.writeFile(filepath, buffer);

      // 保存到数据库
      const coursewareId = uuidv4();
      await db.run(`
        INSERT INTO coursewares 
        (id, title, description, file_path, is_free, price, category) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        coursewareId, 
        title.value, 
        description.value, 
        `/coursewares/${filename}`,
        is_free.value === 'true',
        parseFloat(price.value) || 0,
        category.value
      ]);

      return reply.send({ 
        success: true, 
        message: '课件上传成功',
        coursewareId 
      });
    } catch (error) {
      return reply.code(500).send({ error: '上传失败' });
    }
  });
}

module.exports = coursewareRoutes; 