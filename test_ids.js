const fs = require('fs');
const content = fs.readFileSync('kham-benh-online/assets/js/questions_data.js', 'utf8');
eval(content + '\nconsole.log(AppQuestions.partD.map(q => q.id).join(", "));');
