import React from 'react';

const isChunkLoadError = (error) => {
  if (!error) return false;
  if (error.name === 'ChunkLoadError') return true;
  const message = error.message || '';
  return (
    message.includes('Loading chunk') || message.includes('ChunkLoadError')
  );
};

export const lazyWithRetry = (importer) => {
  let hasRetried = false;

  return React.lazy(async () => {
    try {
      return await importer();
    } catch (error) {
      if (!hasRetried && isChunkLoadError(error)) {
        hasRetried = true;
        // Force reload to fetch latest assets (Service Worker / cache issues)
        window.location.reload();
        // Return a pending promise to keep React waiting until reload happens
        return new Promise(() => {});
      }
      throw error;
    }
  });
};
