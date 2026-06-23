import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { getApiOrigin, getStoredSession, getWhatsappStatus, WhatsappSnapshot, WhatsappStatus } from '../../api';

const connectionId = 'default';

type UseWhatsappStatusOptions = {
  enabled: boolean;
};

export const useWhatsappStatus = ({ enabled }: UseWhatsappStatusOptions) => {
  const [snapshot, setSnapshot] = useState<WhatsappSnapshot | null>(null);

  useEffect(() => {
    if (!enabled) {
      setSnapshot(null);
      return undefined;
    }

    let isActive = true;

    const applySnapshot = (nextSnapshot: WhatsappSnapshot) => {
      if (!isActive || nextSnapshot.connectionId !== connectionId) {
        return;
      }

      setSnapshot(nextSnapshot);
    };

    void getWhatsappStatus()
      .then(applySnapshot)
      .catch(() => {
        if (isActive) {
          setSnapshot((currentSnapshot) => currentSnapshot ?? null);
        }
      });

    const session = getStoredSession();
    if (!session?.accessToken) {
      return () => {
        isActive = false;
      };
    }

    const socket = io(`${getApiOrigin()}/whatsapp-ws`, {
      auth: { token: session.accessToken },
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      socket.emit('watch-host', applySnapshot);
    });
    socket.on('whatsapp-status', applySnapshot);

    return () => {
      isActive = false;
      socket.off('whatsapp-status', applySnapshot);
      socket.disconnect();
    };
  }, [enabled]);

  const status: WhatsappStatus = snapshot?.status ?? 'DISCONNECTED';

  return { snapshot, status };
};
