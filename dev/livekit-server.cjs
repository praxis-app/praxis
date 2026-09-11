const { spawn } = require('node:child_process');

const livekit = spawn('livekit-server', ['--dev', '--bind', '0.0.0.0'], {
  stdio: ['inherit', 'inherit', 'pipe'],
});

livekit.stderr.pipe(process.stdout);

for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
  process.once(signal, () => livekit.kill(signal));
}

livekit.once('error', (error) => {
  console.error(`Unable to start LiveKit Server: ${error.message}`);
  process.exit(1);
});

livekit.once('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exit(code ?? 1);
  }
});
