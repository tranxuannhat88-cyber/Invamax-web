const fs = require('fs');
const content = fs.readFileSync('kham-benh-online/assets/js/questions_data.js', 'utf8');
const regex = /id:\s*(.+?),/g;
let match;
while ((match = regex.exec(content)) !== null) {
  console.log(match[1]);
}
