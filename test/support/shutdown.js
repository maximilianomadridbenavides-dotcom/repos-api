process.on('message', (message) => { if (message === 'shutdown') process.exit(0); });
