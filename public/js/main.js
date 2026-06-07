$(document).ready(function () {

  // ---- Auto-dismiss alerts ----
  setTimeout(() => { $('.alert').fadeOut(500); }, 4000);

  // ---- Active nav link ----
  const path = window.location.pathname;
  $('.nav-link').each(function () {
    const href = $(this).attr('href');
    if (href && path.startsWith(href) && href !== '/') {
      $(this).addClass('active');
    } else if (href === '/' && path === '/') {
      $(this).addClass('active');
    }
  });

  // ---- Toast utility (used by React components via window) ----
  window.showToast = function (message, type = 'info') {
    const bg = type === 'warning' ? '#f59e0b' : type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#2563eb';
    const toast = $(`<div style="position:fixed;bottom:24px;right:24px;background:${bg};color:#fff;padding:14px 22px;border-radius:10px;box-shadow:0 4px 20px rgba(0,0,0,0.15);z-index:9999;font-weight:500;">${message}</div>`);
    $('body').append(toast);
    setTimeout(() => toast.fadeOut(300, function () { $(this).remove(); }), 3000);
  };

  // NOTE: Compare functionality, image previews, and favorite toggle
  // are now handled by React components (see /js/react-components/).
  // This file only keeps non-React utilities.

});
