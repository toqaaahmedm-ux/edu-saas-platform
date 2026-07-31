const fs = require('fs');
const c = fs.readFileSync('messages/ar.json', 'utf8').replace(/\r\n/g, '\n');
const l1 = '                              "saveFailed":  "فشل حفظ الحضور."';
const idx = c.indexOf(l1);
console.log(JSON.stringify(c.slice(idx, idx + 120)));
