const { spawn } = require('child_process');

const pythonProcess = spawn('python', ['app2.py', '10', '15'], {
    cwd: 'E:/Mercor-3/App/backend', // Use the correct absolute path
    shell: true
});

pythonProcess.stdout.on('data', (data) => {
    console.log(`Python output: ${data}`);
});

pythonProcess.stderr.on('data', (data) => {
    console.error(`Error from Python: ${data}`);
});

pythonProcess.on('close', (code) => {
    console.log(`Python process exited with code ${code}`);
});


