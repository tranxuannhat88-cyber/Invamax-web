const fs = require('fs');
const content = fs.readFileSync('kham-benh-online/assets/js/questions_data.js', 'utf8');
const regex = /\[\s*\"([A-F][0-9]{2})\"/g;
let match;
let ids = [];
while ((match = regex.exec(content)) !== null) {
    ids.push(match[1]);
}
ids = [...new Set(ids)].sort();
console.log(JSON.stringify(ids));
