const fs = require('fs');
const c = fs.readFileSync('messages/ar.json', 'utf8').replace(/\r\n/g, '\n');
const l1 = '                              "saveFailed":  "فشل حفظ الحضور."';
const l2 = '                          },';
const l3 = '    "StudentProfilePage":  {';
console.log('line1:', c.split(l1).length - 1);
console.log('line2:', c.split(l2).length - 1);
console.log('line3:', c.split(l3).length - 1);
