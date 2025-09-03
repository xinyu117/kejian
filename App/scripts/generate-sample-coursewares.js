const fs = require('fs').promises;
const path = require('path');

const categories = ['数学', '语文', '英语', '科学', '历史'];
const levels = ['基础', '进阶', '高级', '专项', '综合'];

const coursewareTemplates = {
  '数学': {
    content: `
      <h2>第一章：数学概念</h2>
      <p>本章介绍数学的基本概念和原理。</p>
      
      <h3>1.1 基本定义</h3>
      <p>数学是研究数量关系和空间形式的科学。</p>
      
      <div class="example">
        <h4>例题</h4>
        <p>求解方程：x + 5 = 12</p>
        <p><strong>解：</strong>x = 12 - 5 = 7</p>
      </div>
    `,
    color: '#007bff'
  },
  '语文': {
    content: `
      <h2>第一章：文学鉴赏</h2>
      <p>通过文学作品的学习，提升语言文字运用能力。</p>
      
      <h3>1.1 现代诗歌</h3>
      <p>现代诗歌以自由的形式表达深刻的思想感情。</p>
      
      <div class="poem">
        <p>天空很蓝，云朵很白</p>
        <p>微风轻抚着大地</p>
        <p>这是一个美好的日子</p>
      </div>
    `,
    color: '#28a745'
  },
  '英语': {
    content: `
      <h2>Chapter 1: English Communication</h2>
      <p>This chapter focuses on improving your English communication skills.</p>
      
      <h3>1.1 Daily Conversations</h3>
      <p>Learn how to have natural conversations in English.</p>
      
      <div class="dialogue">
        <p><strong>A:</strong> How are you today?</p>
        <p><strong>B:</strong> I'm doing great, thanks! How about you?</p>
      </div>
    `,
    color: '#6f42c1'
  },
  '科学': {
    content: `
      <h2>第一章：科学探索</h2>
      <p>科学是探索自然规律的重要途径。</p>
      
      <h3>1.1 观察与实验</h3>
      <p>科学研究从观察现象开始，通过实验验证假设。</p>
      
      <div class="experiment">
        <h4>实验：水的沸腾</h4>
        <p>观察水在不同温度下的状态变化。</p>
      </div>
    `,
    color: '#17a2b8'
  },
  '历史': {
    content: `
      <h2>第一章：历史的重要性</h2>
      <p>学习历史有助于我们理解现在，展望未来。</p>
      
      <h3>1.1 古代文明</h3>
      <p>古代文明为人类社会的发展奠定了基础。</p>
      
      <div class="timeline">
        <h4>重要时间节点</h4>
        <ul>
          <li>公元前2070年：夏朝建立</li>
          <li>公元前221年：秦朝统一中国</li>
        </ul>
      </div>
    `,
    color: '#dc3545'
  }
};

async function generateCourseware(courseNumber) {
  const category = categories[courseNumber % 5];
  const level = levels[(courseNumber - 1) % 5];
  const template = coursewareTemplates[category];
  
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>课件${courseNumber}: ${category}${level}教程</title>
    <style>
        body {
            font-family: 'Microsoft YaHei', sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 40px;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 3px solid ${template.color};
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .section {
            margin-bottom: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 10px;
            border-left: 5px solid ${template.color};
        }
        .example {
            background: #e7f3ff;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
        }
        .poem {
            background: #e8f5e8;
            padding: 20px;
            border-radius: 8px;
            font-style: italic;
            text-align: center;
            margin: 20px 0;
        }
        .dialogue {
            background: #f0fff0;
            padding: 20px;
            border-radius: 8px;
            margin: 15px 0;
        }
        .experiment {
            background: #fff3cd;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
        }
        .timeline {
            background: #ffeaa7;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
        }
        h1 { color: ${template.color}; }
        h2 { color: ${template.color}; }
        h3 { color: #495057; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>课件${courseNumber}: ${category}${level}教程</h1>
            <p><strong>分类:</strong> ${category} | <strong>级别:</strong> ${level}</p>
        </div>

        <div class="section">
            ${template.content}
        </div>

        <div class="section">
            <h2>第二章：深入学习</h2>
            <p>在这一章中，我们将深入学习${category}的核心内容。</p>
            
            <h3>2.1 重点知识</h3>
            <p>掌握${category}的重点知识对于后续学习非常重要。</p>
            
            <div class="example">
                <h4>知识点总结</h4>
                <ul>
                    <li>理解${category}的基本概念</li>
                    <li>掌握相关的解题方法</li>
                    <li>能够应用到实际问题中</li>
                </ul>
            </div>
        </div>

        <div class="section">
            <h2>第三章：练习与应用</h2>
            
            <div class="example">
                <h4>课后练习</h4>
                <ol>
                    <li>复习本课的重点内容</li>
                    <li>完成相关练习题</li>
                    <li>思考${category}在生活中的应用</li>
                    <li>准备下一课的学习内容</li>
                </ol>
            </div>
        </div>

        <div style="text-align: center; margin-top: 40px; padding: 25px; background: linear-gradient(135deg, #e7f3ff 0%, #d4edda 100%); border-radius: 10px;">
            <h3>课程总结</h3>
            <p>通过本课程的学习，您已经掌握了${category}${level}的核心知识。</p>
            <p><strong>继续努力，不断进步！</strong></p>
        </div>
    </div>
</body>
</html>`;

  return html;
}

async function generateAllCoursewares() {
  const coursewaresDir = path.join(__dirname, '..', 'coursewares');
  
  // 确保目录存在
  try {
    await fs.mkdir(coursewaresDir, { recursive: true });
  } catch (error) {
    // 目录已存在
  }

  // 生成课件4-20
  for (let i = 4; i <= 20; i++) {
    const html = await generateCourseware(i);
    const filename = `course${i}.html`;
    const filepath = path.join(coursewaresDir, filename);
    
    try {
      await fs.writeFile(filepath, html, 'utf8');
      console.log(`生成课件文件: ${filename}`);
    } catch (error) {
      console.error(`生成课件${i}失败:`, error);
    }
  }

  console.log('所有示例课件生成完成！');
}

// 如果直接运行此脚本
if (require.main === module) {
  generateAllCoursewares().catch(console.error);
}

module.exports = { generateAllCoursewares }; 