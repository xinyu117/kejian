const db = require('../database');
const QRCode = require('qrcode');

async function paymentRoutes(fastify, options) {
  // 升级到付费用户页面
  fastify.get('/upgrade', async (request, reply) => {
    const user = await db.getUserById(request.session.userId);
    return reply.view('upgrade', { 
      title: '升级到付费用户',
      user 
    });
  });

  // 生成支付二维码
  fastify.post('/api/payment/create', async (request, reply) => {
    const { amount = 99 } = request.body; // 默认99元升级费用
    
    try {
      const user = await db.getUserById(request.session.userId);
      
      if (user.is_premium) {
        return reply.code(400).send({ error: '您已经是付费用户' });
      }

      // 创建支付记录
      const paymentId = await db.createPayment(user.id, amount);
      
      // 生成微信支付URL（模拟）
      const paymentUrl = `https://wx.tenpay.com/cgi-bin/mmpayweb-bin/checkmweb?prepay_id=wx${paymentId}&package=WAP&redirect_url=${encodeURIComponent('http://localhost:3000/payment/success')}`;
      
      // 生成支付二维码
      const qrCode = await QRCode.toDataURL(paymentUrl);
      
      return reply.send({ 
        success: true,
        paymentId,
        qrCode,
        amount 
      });
    } catch (error) {
      return reply.code(500).send({ error: '创建支付订单失败' });
    }
  });

  // 支付成功页面
  fastify.get('/payment/success', async (request, reply) => {
    const user = await db.getUserById(request.session.userId);
    return reply.view('payment-success', { 
      title: '支付成功',
      user 
    });
  });

  // 模拟支付成功回调
  fastify.post('/api/payment/callback', async (request, reply) => {
    const { paymentId, status } = request.body;
    
    try {
      if (status === 'success') {
        // 获取支付记录
        const payment = await db.getPaymentById(paymentId);
        
        if (payment && payment.status === 'pending') {
          // 更新支付状态
          await db.updatePaymentStatus(paymentId, 'completed');
          
          // 升级用户为付费用户
          await db.updateUserToPremium(payment.user_id);
          
          return reply.send({ success: true, message: '支付成功，已升级为付费用户' });
        }
      }
      
      return reply.code(400).send({ error: '支付处理失败' });
    } catch (error) {
      return reply.code(500).send({ error: '支付回调处理失败' });
    }
  });

  // 模拟支付成功（用于测试）
  fastify.post('/api/payment/simulate-success', async (request, reply) => {
    try {
      const user = await db.getUserById(request.session.userId);
      
      if (user.is_premium) {
        return reply.code(400).send({ error: '您已经是付费用户' });
      }

      // 直接升级用户为付费用户
      await db.updateUserToPremium(user.id);
      
      return reply.send({ success: true, message: '模拟支付成功，已升级为付费用户' });
    } catch (error) {
      return reply.code(500).send({ error: '模拟支付失败' });
    }
  });

  // 检查支付状态
  fastify.get('/api/payment/status/:paymentId', async (request, reply) => {
    const { paymentId } = request.params;
    
    try {
      const payment = await db.getPaymentById(paymentId);
      
      if (!payment) {
        return reply.code(404).send({ error: '支付记录不存在' });
      }

      return reply.send({ 
        status: payment.status,
        amount: payment.amount 
      });
    } catch (error) {
      return reply.code(500).send({ error: '获取支付状态失败' });
    }
  });
}

module.exports = paymentRoutes; 