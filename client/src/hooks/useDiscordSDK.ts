import { useEffect, useState } from 'react';
import { DiscordSDK } from '@discord/embedded-app-sdk';

const CLIENT_ID = '1521711785466531851';
const isInDiscord = window.self !== window.top;

let discordSdk: DiscordSDK | null = null;
if (isInDiscord) {
  discordSdk = new DiscordSDK(CLIENT_ID);
}

export function useDiscordSDK() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [userId, setUserId] = useState(() => {
    const stored = sessionStorage.getItem('impostor-userId');
    if (stored) return stored;
    const id = 'player-' + Math.random().toString(36).slice(2, 8);
    sessionStorage.setItem('impostor-userId', id);
    return id;
  });

  const [username, setUsername] = useState(() => {
    const stored = sessionStorage.getItem('impostor-username');
    if (stored) return stored;
    const name = 'Jugador-' + Math.random().toString(36).slice(2, 5).toUpperCase();
    sessionStorage.setItem('impostor-username', name);
    return name;
  });

  const [avatar, setAvatar] = useState('');

  const roomId = discordSdk ? discordSdk.instanceId : 'dev-room';

  useEffect(() => {
    if (!discordSdk) {
      setIsReady(true);
      return;
    }

    discordSdk.ready()
      .then(async () => {
        try {
          const { code } = await discordSdk!.commands.authorize({
            client_id: CLIENT_ID,
            response_type: 'code',
            state: '',
            prompt: 'none',
            scope: ['identify'],
          });

          const tokenRes = await fetch('/api/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code }),
          });

          if (!tokenRes.ok) {
            throw new Error(`Token error: ${tokenRes.status}`);
          }

          const { access_token } = await tokenRes.json() as { access_token: string };

          const auth = await discordSdk!.commands.authenticate({ access_token });

          if (auth?.user) {
            const u = auth.user;
            const name = u.global_name ?? u.username ?? 'Jugador';
            setUserId(u.id);
            setUsername(name);
            sessionStorage.setItem('impostor-userId', u.id);
            sessionStorage.setItem('impostor-username', name);
            if (u.avatar) {
              setAvatar(`https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.png`);
            }
          }
        } catch (e) {
          console.error('[Discord Auth]', e);
        }
        setIsReady(true);
      })
      .catch(err => {
        console.error('[Discord SDK ready]', err);
        setError(err instanceof Error ? err.message : 'Discord SDK error');
        setIsReady(true);
      });
  }, []);

  return { isReady, error, roomId, userId, username, avatar };
}
