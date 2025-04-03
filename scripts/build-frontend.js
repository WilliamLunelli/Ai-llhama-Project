const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Certifique-se de que o diretório public existe
if (!fs.existsSync('./public')) {
    fs.mkdirSync('./public');
}

// Compile o TypeScript do frontend
exec('npx tsc --target es2016 --module esnext --outDir ./public src/frontend/app.ts', (error, stdout, stderr) => {
    if (error) {
        console.error(`Erro: ${error.message}`);
        return;
    }
    if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
    }
    console.log('Frontend TypeScript compilado com sucesso!');
});