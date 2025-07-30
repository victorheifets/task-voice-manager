// Suppress hydration warnings in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const originalError = console.error;
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Hydration failed') ||
       args[0].includes('Text content does not match') ||
       args[0].includes('Prop `%s` did not match'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
}

export {};