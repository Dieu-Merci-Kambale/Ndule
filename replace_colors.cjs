const fs = require('fs');
const path = require('path');

const replacements = [
  // Jaune / Ambre -> Bleu
  [/#F59E0B/gi, '#3B82F6'],
  [/#FBBF24/gi, '#60A5FA'],
  [/#EAB308/gi, '#3B82F6'],
  [/#FFC107/gi, '#3B82F6'],
  [/text-amber-500/g, 'text-blue-500'],
  [/bg-amber-50/g, 'bg-blue-50'],
  [/text-yellow-400/g, 'text-blue-400'],
  [/text-yellow-500/g, 'text-blue-500'],
  [/#f97316/gi, '#3B82F6'], // orange-500
  [/#fed7aa/gi, '#BFDBFE'], // orange-200
  [/#ffedd5/gi, '#DBEAFE'], // orange-100
  [/#fffbeb/gi, '#eff6ff'], // amber-50
  [/rgba\(255,\s*251,\s*235/g, 'rgba(239, 246, 255'] // rgba amber-50 -> blue-50
];

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.jsx') || file.endsWith('.css') || file.endsWith('.js') || file.endsWith('.html')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(path.join(__dirname, 'src'));
files.push(path.join(__dirname, 'index.html'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  replacements.forEach(([regex, replacement]) => {
    // Reset regex index for global regexes before test
    regex.lastIndex = 0;
    if (regex.test(content)) {
      regex.lastIndex = 0;
      content = content.replace(regex, replacement);
      changed = true;
    }
  });
  
  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
