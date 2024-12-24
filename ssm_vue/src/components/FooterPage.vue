<template>
<footer class="footer">
  <div class="footer-content">
    <div class="contact-info">
      <h4>联系我们</h4>
      <p class="fcolor">地址: 浙江 杭州 余杭区</p>
      <p class="fcolor">电话: 19101234567</p>
      <p class="fcolor">电子邮件：<a href="mailto:info@company.com">huayunxinyu@company.com</a></p>
      <div class="social-media">
        <a href="https://facebook.com/company" target="_blank" rel="noopener noreferrer">Facebook</a>
        <a href="https://twitter.com/company" target="_blank" rel="noopener noreferrer">Twitter</a>
        <a href="https://linkedin.com/company" target="_blank" rel="noopener noreferrer">LinkedIn</a>
      </div>
    </div>
    <div class="footer-nav">
      <h4>快速导航</h4>
      <ul>
        <li><a href="/about">关于我们</a></li>
        <li><a href="/services">服务</a></li>
        <li><a href="/blog">博客</a></li>
        <li><a href="/faq">常见问题</a></li>
        <li><a href="/sitemap">网站地图</a></li>
      </ul>
    </div>
    <div class="legal-info">
      <h4>法律信息</h4>
      <ul>
        <li><a href="/privacy-policy">隐私政策</a></li>
        <li><a href="/terms-of-service">用户协议</a></li>
        <li><a href="/disclaimer">免责声明</a></li>
      </ul>
    </div>
  </div>
  <div class="footer-bottom">
    <p>&copy; 2024 花韵心语. 保留所有权利.</p>
  </div>
</footer>
</template>

<style scoped>
.footer {
  background: linear-gradient(135deg, #ec6975, #fcb3b3); /* 渐变背景 */
  padding: 20px;
  border-top: 1px solid #e9ecef;
  margin-top: 6%;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
}

.footer-content > div {
  flex: 1;
  margin: 10px;
}

.footer-content h4 {
  margin-bottom: 10px;
  color: rgb(250, 250, 250);
  font-weight: bold;
}

.footer-content p, .footer-content ul, .footer-content form {
  margin: 0;
  padding: 0;
}

.footer-content ul {
  list-style: none;
}

.footer-content ul li {
  margin-bottom: 5px;
}

.footer-content a {
  color: #fdfeff;
  text-decoration: none;
  margin: 0 5px;
}

.footer-content a:hover {
  text-decoration: underline;
}

.footer-bottom {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #ffffff;
}

.fcolor{
    color: #e9eeee;
}
</style>