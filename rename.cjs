const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

function replaceInFile(filePath) {
  if (!filePath.match(/\.(js|jsx|css|html|json)$/)) return;
  if (filePath.includes('node_modules')) return;
  if (filePath.includes('package-lock.json')) return;

  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // regex to match Ndule or ndule that are not already followed by 's'
  content = content.replace(/Ndule(?!s)/g, 'Ndules');
  content = content.replace(/ndule(?!s)/g, 'ndules');
  content = content.replace(/NDULE(?!S)/g, 'NDULES');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated:', filePath);
  }
}

walkDir('c:/Projects Antigravity/Ndule/src', replaceInFile);
replaceInFile('c:/Projects Antigravity/Ndule/index.html');
replaceInFile('c:/Projects Antigravity/Ndule/package.json');
