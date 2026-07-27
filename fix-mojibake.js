const fs = require("fs");
const path = "./messages/ar.json";
const raw = fs.readFileSync(path, "utf8");

function fixMojibake(str) {
  return Buffer.from(str, "latin1").toString("utf8");
}

function walk(obj) {
  if (typeof obj === "string") return fixMojibake(obj);
  if (Array.isArray(obj)) return obj.map(walk);
  if (obj && typeof obj === "object") {
    const out = {};
    for (const k of Object.keys(obj)) out[k] = walk(obj[k]);
    return out;
  }
  return obj;
}

const data = JSON.parse(raw);
const fixed = walk(data);
fs.writeFileSync(path, JSON.stringify(fixed, null, 2), "utf8");
console.log("تم الإصلاح ✅ — مثال:", fixed.common.signOut);
