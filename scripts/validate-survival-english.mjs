// data/survival-english.json 구조 검증. 사이트 런타임과 무관한 개발용 도구.
import { readFileSync } from "node:fs";
import { validateChapter } from "./lib/validate-rules.mjs";

const path = "data/survival-english.json";
const data = JSON.parse(readFileSync(path, "utf8"));
const errors = [];
const ids = new Set();

if (!Array.isArray(data.chapters)) errors.push("chapters가 배열이 아님");

let prev = "";
for (const ch of data.chapters || []) {
  errors.push(...validateChapter(ch, ids, prev));
  prev = ch.id;
}

console.log(`챕터 ${(data.chapters || []).length}개, 문항/대화 id ${ids.size}개 검사함`);
if (errors.length) {
  console.error(`\n검증 실패 (${errors.length}건):`);
  for (const e of errors) console.error("  - " + e);
  process.exit(1);
}
console.log("검증 통과 ✅");
