/* Admin JS file */
// packages/backend/public/admin/js/admin.js
document.addEventListener('DOMContentLoaded', function() {
    // Sidebar toggle
    const sidebarToggleBtn = document.querySelector('.sidebar-toggle');
    if (sidebarToggleBtn) {
      sidebarToggleBtn.addEventListener('click', function() {
        document.body.classList.toggle('sidebar-collapsed');
        
        // Save preference in localStorage
        const isCollapsed = document.body.classList.contains('sidebar-collapsed');
        localStorage.setItem('sidebar-collapsed', isCollapsed);
      });
      
      // Check if sidebar was collapsed previously
      const wasCollapsed = localStorage.getItem('sidebar-collapsed') === 'true';
      if (wasCollapsed) {
        document.body.classList.add('sidebar-collapsed');
      }
    }
    
    // Auto-dismiss alerts after 5 seconds
    const alerts = document.querySelectorAll('.alert:not(.alert-permanent)');
    alerts.forEach(alert => {
      setTimeout(() => {
        const closeBtn = alert.querySelector('.btn-close');
        if (closeBtn) {
          closeBtn.click();
        }
      }, 5000);
    });
    
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Initialize datepickers
    const datepickers = document.querySelectorAll('.datepicker');
    datepickers.forEach(picker => {
      if (picker.flatpickr) {
        picker.flatpickr({
          dateFormat: 'Y-m-d'
        });
      }
    });
    
    // Add confirmation dialog to delete buttons
    const deleteButtons = document.querySelectorAll('[data-confirm]');
    deleteButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        const message = this.getAttribute('data-confirm') || 'Are you sure you want to delete this item?';
        if (!confirm(message)) {
          e.preventDefault();
        }
      });
    });
  });