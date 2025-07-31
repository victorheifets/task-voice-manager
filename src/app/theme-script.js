// Force dark mode on page load
(function() {
  try {
    // Apply dark mode classes
    document.documentElement.classList.add('dark-mode');
    document.body.classList.add('dark-mode');
    
    // Store preference in localStorage
    localStorage.setItem('themeMode', 'dark');
    
    // Apply slate background immediately
    document.documentElement.style.backgroundColor = '#111827';
    document.body.style.backgroundColor = '#111827';
    
    console.log('Dark mode applied by theme-script.js');
  } catch (e) {
    console.error('Error in theme-script.js:', e);
  }
})();
