// 全局JavaScript功能

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化工具提示
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // 添加页面加载动画
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// 退出登录功能
function logout() {
    fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.href = '/login';
        }
    })
    .catch(error => {
        console.error('退出登录失败:', error);
    });
}

// 通用工具函数
const Utils = {
    // 显示加载状态
    showLoading: function(element, text = '加载中...') {
        if (element) {
            element.innerHTML = `<i class="fas fa-spinner fa-spin me-2"></i>${text}`;
            element.disabled = true;
        }
    },

    // 隐藏加载状态
    hideLoading: function(element, originalText) {
        if (element) {
            element.innerHTML = originalText;
            element.disabled = false;
        }
    },

    // 显示提示消息
    showMessage: function(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alertDiv);
        
        // 3秒后自动消失
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 3000);
    },

    // 格式化日期
    formatDate: function(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    },

    // 格式化价格
    formatPrice: function(price) {
        return `¥${parseFloat(price).toFixed(2)}`;
    }
};

// 搜索功能
function searchCoursewares() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    const keyword = searchInput.value.trim();
    
    if (!keyword) {
        Utils.showMessage('请输入搜索关键词', 'warning');
        return;
    }

    // 显示搜索状态
    const searchBtn = document.querySelector('.hero-section .btn');
    const originalText = searchBtn ? searchBtn.innerHTML : '';
    
    if (searchBtn) {
        Utils.showLoading(searchBtn, '搜索中...');
    }

    fetch(`/api/courseware/search?q=${encodeURIComponent(keyword)}`)
        .then(response => response.json())
        .then(data => {
            if (data.coursewares) {
                renderCoursewares(data.coursewares);
                Utils.showMessage(`找到 ${data.coursewares.length} 个相关课件`, 'success');
            } else {
                Utils.showMessage('搜索失败，请稍后重试', 'danger');
            }
        })
        .catch(error => {
            console.error('搜索失败:', error);
            Utils.showMessage('搜索失败，请稍后重试', 'danger');
        })
        .finally(() => {
            if (searchBtn) {
                Utils.hideLoading(searchBtn, originalText);
            }
        });
}

// 渲染课件列表
function renderCoursewares(coursewares) {
    const listContainer = document.getElementById('coursewareList');
    if (!listContainer) return;

    if (coursewares.length === 0) {
        listContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-search text-muted" style="font-size: 3rem;"></i>
                <h4 class="mt-3 text-muted">未找到相关课件</h4>
                <p class="text-muted">请尝试使用其他关键词搜索</p>
            </div>
        `;
        return;
    }

    listContainer.innerHTML = coursewares.map((courseware, index) => `
        <div class="col-lg-3 col-md-4 col-sm-6 mb-4 courseware-item" data-category="${courseware.category}" style="animation-delay: ${index * 0.1}s;">
            <div class="card h-100 shadow-sm">
                <div class="card-img-top bg-gradient position-relative" style="height: 200px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                    <div class="position-absolute top-0 end-0 m-2">
                        ${!courseware.is_free ? 
                            `<span class="badge bg-warning text-dark">
                                <i class="fas fa-crown me-1"></i>${Utils.formatPrice(courseware.price)}
                            </span>` :
                            `<span class="badge bg-success">
                                <i class="fas fa-gift me-1"></i>免费
                            </span>`
                        }
                    </div>
                    <div class="position-absolute bottom-0 start-0 m-3">
                        <span class="badge bg-dark">${courseware.category}</span>
                    </div>
                    <div class="d-flex align-items-center justify-content-center h-100">
                        <i class="fas fa-book-open text-white" style="font-size: 3rem; opacity: 0.7;"></i>
                    </div>
                </div>
                <div class="card-body">
                    <h5 class="card-title">${courseware.title}</h5>
                    <p class="card-text text-muted">${courseware.description}</p>
                </div>
                <div class="card-footer bg-transparent">
                    ${courseware.is_free ? 
                        `<a href="/courseware/${courseware.id}" class="btn btn-primary w-100">
                            <i class="fas fa-play me-2"></i>开始学习
                        </a>` :
                        `<button class="btn btn-warning w-100" onclick="showPaymentModal('${courseware.id}', '${courseware.title}', ${courseware.price})">
                            <i class="fas fa-lock me-2"></i>立即解锁 ${Utils.formatPrice(courseware.price)}
                        </button>`
                    }
                </div>
            </div>
        </div>
    `).join('');
}

// 分类过滤功能
function filterByCategory(category) {
    // 更新按钮状态
    document.querySelectorAll('.btn-outline-primary').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 找到触发事件的按钮并激活
    const activeBtn = Array.from(document.querySelectorAll('.btn-outline-primary'))
        .find(btn => btn.textContent.trim() === (category || '全部'));
    if (activeBtn) {
        activeBtn.classList.add('active');
    }

    // 过滤课件
    const items = document.querySelectorAll('.courseware-item');
    let visibleCount = 0;
    
    items.forEach((item, index) => {
        if (category === '' || item.dataset.category === category) {
            item.style.display = 'block';
            item.style.animationDelay = `${visibleCount * 0.1}s`;
            visibleCount++;
        } else {
            item.style.display = 'none';
        }
    });

    // 显示过滤结果
    if (category) {
        Utils.showMessage(`显示 ${visibleCount} 个${category}课件`, 'info');
    }
}

// 支付相关功能
let currentPaymentId = null;

function showPaymentModal(coursewareId, title, price) {
    const modal = new bootstrap.Modal(document.getElementById('paymentModal'));
    modal.show();
}

function createPayment() {
    fetch('/api/payment/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount: 99 })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            currentPaymentId = data.paymentId;
            const qrContainer = document.getElementById('qrCodeContainer');
            const paymentQR = document.getElementById('paymentQR');
            
            if (qrContainer && paymentQR) {
                paymentQR.src = data.qrCode;
                qrContainer.style.display = 'block';
            }
            
            Utils.showMessage('支付二维码已生成', 'success');
        } else {
            Utils.showMessage('生成支付二维码失败', 'danger');
        }
    })
    .catch(error => {
        console.error('创建支付失败:', error);
        Utils.showMessage('创建支付失败', 'danger');
    });
}

function simulatePayment() {
    fetch('/api/payment/simulate-success', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            Utils.showMessage('支付成功！页面即将刷新...', 'success');
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } else {
            Utils.showMessage('支付失败: ' + data.message, 'danger');
        }
    })
    .catch(error => {
        console.error('模拟支付失败:', error);
        Utils.showMessage('支付失败', 'danger');
    });
}

// 回车搜索功能
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        const searchInput = document.getElementById('searchInput');
        if (searchInput && document.activeElement === searchInput) {
            searchCoursewares();
        }
    }
});

// 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
}); 