import React, { useEffect, useState } from 'react';
import { MessageContext, type MessageType } from './MessageContext';
import { ignoreSource } from './source.ignore';

const messageBuffer: MessageEvent[] = [];

const bufferMessages = (event: MessageEvent) => {
  if (!ignoreSource.includes(event.data.source)) {
    messageBuffer.push(event);
  }
};

window.addEventListener('message', bufferMessages);

export const MessageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [message, setMessage] = useState<any | null>(null);

  const sendMessage = (
    message: MessageType,
    target: Window = window,
    origin: string = '*'
  ) => {
    target.postMessage(JSON.parse(JSON.stringify(message || '{}')), origin);
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (ignoreSource.includes(event.data.source)) return;
      console.log(
        `(in parent) message from ${event.origin} with data: `,
        event.data
      );
      setMessage(event.data);
    };

    while (messageBuffer.length > 0) {
      const bufferedEvent = messageBuffer.shift();
      if (bufferedEvent) {
        handleMessage(bufferedEvent);
      }
    }

    window.addEventListener('message', handleMessage);

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <MessageContext.Provider value={{ message, sendMessage }}>
      {children}
    </MessageContext.Provider>
  );
};
