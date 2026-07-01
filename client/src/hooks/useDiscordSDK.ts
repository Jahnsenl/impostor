import { useEffect, useState } from 'react';
import { DiscordSDK } from '@discord/embedded-app-sdk';

const CLIENT_ID = '1521711785466531851';

function getIsInDiscord() {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

const isInDiscord = getIsInDiscord();

function makeRandomName() {
  return 'Jugador-' + Math.random().toString(36).slice(2, 5).toUpperCase();
}

function makeRandomId() {
  return 'player-' + Math.random().toString(36).slice(2, 8);
}

export function useDiscordSDK() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roomId, setRoomId] = useState('dev-room');

  const [userId] = useState(() => {
    const stored = sessionStorage.getItem('impostor-userId');
    if (stored) return stored;
    const id = makeRandomId();
    sessionStorage.setItem('impostor-userId', id);
    return id;
  });

  const [username, setUsername] = useState(() => {
    const stored = sessionStorage.getItem('impostor-username');
    if (stored) return stored;
    const name = makeRandomName();
    sessionStorage.setItem('impostor-username', name);
    return name;
  });

  const [avatar, setAvatar] = useState('');

  useEffect(() => {
    if (!isInDiscord) {
      setIsReady(true);
      return;
    }

    let sdk: DiscordSDK;
    try {
      sdk = new DiscordSDK(CLIENT_ID);
      setRoomId(sdk.instanceId);
    } catch (e) {
      console.error('[Discord SDK init]', e);
      setIsReady(true);
      return;
    }

    sdk.ready()
      .then(async () => {
        try {
          const { code } = await sdk.commands.authorize({
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

          const { access_token } = await tokenRes.json() as { access_token: string };
          const auth = await sdk.commands.authenticate({ access_token });

          if (auth?.user) {
            const u = auth.user;
            const name = u.global_name ?? u.username ?? makeRandomName();
            const uid = u.id ?? userId;
            setUsername(name);
            sessionStorage.setItem('impostor-userId', uid);
            sessionStorage.setItem('impostor-username', name);
            if (u.avatar) {
              setAvatar(`https://cdn.discordapp.com/avatars/${uid}/${u.avatar}.png`);
            }
          }
        } catch (e) {
          console.error('[Discord Auth]', e);
        }
        setIsReady(true);
      })
      .catch(err => {
        console.error('[Discord SDK ready]', err);
        setError(err instanceof Error ? err.message : String(err));
        setIsReady(true);
      });
  }, [userId]);

  return { isReady, error, roomId, userId, username, avatar };
}
