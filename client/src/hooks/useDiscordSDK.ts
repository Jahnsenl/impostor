import { useEffect, useState } from 'react';
import { DiscordSDK } from '@discord/embedded-app-sdk';

const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID;
const isInDiscord = window.self !== window.top;

let discordSdk: DiscordSDK | null = null;
if (isInDiscord && clientId) {
  discordSdk = new DiscordSDK(clientId);
}

export function useDiscordSDK() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!discordSdk) { setIsReady(true); return; }

    discordSdk.ready()
      .then(() => setIsReady(true))
      .catch(err => setError(err instanceof Error ? err.message : 'Discord SDK error'));
  }, []);

  const roomId = discordSdk ? discordSdk.instanceId : 'dev-room';

  return { discordSdk, isReady, error, roomId };
}
