import { useEffect, useRef } from 'react';

interface NotificationSettings {
  browserNotifications: boolean;
  soundNotifications: boolean;
  emailNotifications: boolean;
  notificationFrequency: 'realtime' | 'digest' | 'off';
  doNotDisturb: boolean;
}

/**
 * Get notification settings from localStorage
 */
export const getNotificationSettings = (): NotificationSettings => {
  if (typeof window === 'undefined') {
    return {
      browserNotifications: false,
      soundNotifications: true,
      emailNotifications: false,
      notificationFrequency: 'realtime',
      doNotDisturb: false,
    };
  }

  return {
    browserNotifications: localStorage.getItem('notifications-browser') === 'true',
    soundNotifications: localStorage.getItem('notifications-sound') !== 'false',
    emailNotifications: localStorage.getItem('notifications-email') === 'true',
    notificationFrequency: (localStorage.getItem('notifications-frequency') as 'realtime' | 'digest' | 'off') || 'realtime',
    doNotDisturb: localStorage.getItem('notifications-dnd') === 'true',
  };
};

/**
 * Check if notifications should be shown based on settings
 */
const shouldShowNotification = (settings: NotificationSettings): boolean => {
  // If DND is enabled, don't show any notifications
  if (settings.doNotDisturb) {
    return false;
  }

  // If frequency is 'off', don't show notifications
  if (settings.notificationFrequency === 'off') {
    return false;
  }

  return true;
};

/**
 * Play notification sound
 */
const playNotificationSound = () => {
  try {
    // Create audio context for notification sound
    // Resume context in case it was suspended (browser autoplay policy)
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioContextClass();
    
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    
    // Create a pleasant notification sound using multiple oscillators
    const createTone = (frequency: number, startTime: number, duration: number, volume: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };
    
    const now = audioContext.currentTime;
    
    // Play a pleasant two-tone chime
    createTone(523.25, now, 0.15, 0.3); // C5
    createTone(659.25, now + 0.1, 0.2, 0.3); // E5
    
  } catch (error) {
    console.error('Error playing notification sound:', error);
    // Fallback: try using a simple beep
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (fallbackError) {
      console.error('Error playing fallback notification sound:', fallbackError);
    }
  }
};

/**
 * Show browser notification
 */
const showBrowserNotification = (title: string, body: string, icon?: string) => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return;
  }

  const permission = Notification.permission;
  
  if (permission === 'granted') {
    try {
      const notification = new Notification(title, {
        body,
        icon: icon || '/ai-ai.svg',
        badge: '/ai-ai.svg',
        tag: 'ai-chat-message', // Tag to replace previous notifications
        requireInteraction: false,
      });

      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      // Handle click to focus window
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (error) {
      console.error('Error showing browser notification:', error);
    }
  } else if (permission === 'default') {
    // Request permission if not yet requested
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        showBrowserNotification(title, body, icon);
      }
    });
  }
};

/**
 * Send email notification (placeholder - would need backend implementation)
 */
const sendEmailNotification = async (subject: string, body: string) => {
  // This would typically call a backend API to send emails
  // For now, we'll just log it
  console.log('Email notification would be sent:', { subject, body });
  
  // In a real implementation, you would:
  // 1. Call your backend API endpoint
  // 2. Backend would send email via service like SendGrid, AWS SES, etc.
  // 3. Handle errors appropriately
  
  // Example:
  // try {
  //   await fetch('/api/send-email', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ subject, body, to: userEmail }),
  //   });
  // } catch (error) {
  //   console.error('Error sending email notification:', error);
  // }
};

/**
 * Show notification based on settings
 */
export const showNotification = (
  title: string,
  body: string,
  options?: {
    icon?: string;
    skipSound?: boolean;
    skipBrowser?: boolean;
    skipEmail?: boolean;
  }
) => {
  const settings = getNotificationSettings();

  // Check if we should show notifications at all
  if (!shouldShowNotification(settings)) {
    return;
  }

  // Check if window is focused (don't notify if user is actively using the app)
  const isWindowFocused = document.hasFocus();

  // Browser notifications
  if (settings.browserNotifications && !options?.skipBrowser) {
    // Only show browser notification if window is not focused
    if (!isWindowFocused) {
      showBrowserNotification(title, body, options?.icon);
    }
  }

  // Sound notifications
  if (settings.soundNotifications && !options?.skipSound) {
    // Play sound notification (works even when window is focused)
    // Users typically want to hear sounds for new messages
    playNotificationSound();
  }

  // Email notifications (for digest mode or when enabled)
  if (settings.emailNotifications && !options?.skipEmail) {
    // Only send email in digest mode or for important notifications
    if (settings.notificationFrequency === 'digest') {
      // In digest mode, we would queue emails and send them periodically
      // For now, we'll just log it
      console.log('Email notification queued for digest:', { title, body });
    } else if (settings.notificationFrequency === 'realtime') {
      // In realtime mode, send email immediately (but this is usually not desired)
      // So we'll skip it unless explicitly requested
    }
  }
};

/**
 * Hook to handle notifications for new messages
 */
export const useNotifications = () => {
  const digestQueueRef = useRef<Array<{ title: string; body: string }>>([]);
  const digestIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    const checkAndSetupDigest = () => {
      const settings = getNotificationSettings();

      // Clear any existing interval
      if (digestIntervalRef.current !== null) {
        clearInterval(digestIntervalRef.current);
        digestIntervalRef.current = null;
      }

      // Set up digest interval if in digest mode
      if (settings.notificationFrequency === 'digest' && settings.emailNotifications) {
        // Send digest every hour
        digestIntervalRef.current = window.setInterval(() => {
          if (digestQueueRef.current.length > 0) {
            const digestBody = digestQueueRef.current
              .map((item, index) => `${index + 1}. ${item.title}: ${item.body}`)
              .join('\n\n');

            sendEmailNotification('AI Chat - Message Digest', digestBody);
            digestQueueRef.current = [];
          }
        }, 60 * 60 * 1000); // 1 hour
      }
    };

    // Initial setup
    checkAndSetupDigest();

    // Listen for storage changes to update digest interval
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'notifications-frequency' || e.key === 'notifications-email') {
        checkAndSetupDigest();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      if (digestIntervalRef.current !== null) {
        clearInterval(digestIntervalRef.current);
      }
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const notifyNewMessage = (messageContent: string, conversationTitle?: string) => {
    const settings = getNotificationSettings();

    if (!shouldShowNotification(settings)) {
      return;
    }

    const title = 'New AI Response';
    const body = conversationTitle 
      ? `${conversationTitle}: ${messageContent.slice(0, 100)}${messageContent.length > 100 ? '...' : ''}`
      : messageContent.slice(0, 100) + (messageContent.length > 100 ? '...' : '');

    // Show browser and sound notifications
    showNotification(title, body);

    // Handle email notifications based on frequency
    if (settings.emailNotifications) {
      if (settings.notificationFrequency === 'realtime') {
        // In realtime mode, we typically don't send emails for every message
        // But if user wants it, we can enable it
        // sendEmailNotification(title, body);
      } else if (settings.notificationFrequency === 'digest') {
        // Queue for digest
        digestQueueRef.current.push({ title, body });
      }
    }
  };

  return { notifyNewMessage };
};

