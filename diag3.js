const fs = require('fs');
const c = fs.readFileSync('messages/ar.json', 'utf8').replace(/\r\n/g, '\n');
const anchor = '                              "saveFailed":  "فشل حفظ الحضور."\n                          },\n    "StudentProfilePage":  {';
console.log('combined count:', c.split(anchor).length - 1);
