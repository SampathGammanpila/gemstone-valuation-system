// packages/backend/public/admin/js/admin.js
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin panel initialized');
    
    // Auto dismiss alerts after 5 seconds
    setTimeout(() => {
      const alerts = document.querySelectorAll('[role="alert"]');
      alerts.forEach(alert => {
        if (alert.classList.contains('auto-dismiss')) {
          alert.classList.add('opacity-0', 'transition-opacity', 'duration-500');
          setTimeout(() => {
            alert.remove();
          }, 500);
        }
      });
    }, 5000);
  });