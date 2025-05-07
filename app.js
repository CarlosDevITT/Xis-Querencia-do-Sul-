// Registrar Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then((registration) => {
          console.log('Service Worker registrado:', registration.scope);
          initializeNotifications();
          checkRestaurantStatus();
        })
        .catch((err) => {
          console.log('Falha no registro:', err);
        });
    });
  }
  
  // Inicializar notificações
  function initializeNotifications() {
    if ('Notification' in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          console.log('Permissão concedida');
          subscribeToPushNotifications();
        }
      });
    }
  }
  
  // Verificar status do restaurante
  function checkRestaurantStatus() {
    const now = new Date();
    const hour = now.getHours();
    
    // Restaurante aberto das 18h às 22h
    if (hour >= 18 && hour < 22) {
      showLocalNotification(
        'Xis Querência do Sul', 
        'Estamos abertos! Venha saborear nossos xis!'
      );
    } else if (hour === 17) {
      // Notificação 1h antes de abrir
      showLocalNotification(
        'Xis Querência do Sul', 
        'Abre em 1 hora! Prepare-se para o melhor xis da região!'
      );
    }
  }
  
  // Mostrar notificação local
  function showLocalNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const options = {
        body: body,
        icon: '/img/icons/icon-192x192.png',
        badge: '/img/icons/icon-72x72.png'
      };
      
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, options);
      });
    }
  }
  
 