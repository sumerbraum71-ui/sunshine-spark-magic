import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useOrderNotification = (
  onNewOrder?: () => void,
  enabled: boolean = true
) => {
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // Create audio element for notification sound
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleTs8nODf2KhWGwI7mdnXtXgtARqN2tjBdyAIKo3V18NqKBUHi9fdx30oGhR7ztrDdh0JE3rK2LtzFQIAesra0YEsGAJ0xNrVfjMqBG272s5yKSYDb7Ta0HIOEQJ1wNnRejwtCWO22dFtMTIEWq/Wymo3OAFRqdXKZDpFBUWk08liP00GN5fPx1o+TwkymM7EYDxLCSmRzcNYOkoLKJDNwlY3SAwokM/BWThIDieP0cJXN0YQKY/QwFY2RBEokM/BVjZEESmQ0MFWNkQRKpHQwVY2QxErkdHBVjZDECuR0cFWNkMQK5HRwVY2QxArkdHBVjZDECuR0cFWNkMQK5HRwVY2QxArkdHBVjZDECuR0cFWNkMQK5HRwVY2QxArkdHBVjZDECuR0cFWNkMQK5HRwVY2QxArkdHBVjZDECuR0cBWNkMQK5HRwVY2QxArkdHBVjZDECuR0cFWNkMQK5HRwVY2QxArkdHBVjZDECuR0cFWNkMQK5HRwVY2QxArkdHBVjZDECuR0cFWNkMQK5HRwVY2QxArkdHBVjZDECuR0cFWNkMQK5HRwVY2QxArkdHBVjZDECuR0cFWNkMQK5HRwVY2QxA=');

    const channel = supabase
      .channel('new-orders')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          // Play notification sound
          if (audioRef.current) {
            audioRef.current.play().catch(() => {});
          }

          // Show toast notification
          toast({
            title: '🔔 طلب جديد!',
            description: `تم استلام طلب جديد بقيمة $${payload.new.amount}`,
          });

          // Callback for refreshing data
          onNewOrder?.();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, onNewOrder, toast]);
};
