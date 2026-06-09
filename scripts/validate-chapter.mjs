// 단일 챕터 조각 파일을 검사. 사용: node scripts/validate-chapter.mjs scripts/chapters/ch04.json
import { readFileSync } from "node:fs";
import { validateChapter } from "./lib/validate-rules.mjs";

const file = process.argv[2];
if (!file) { console.error("사용: node scripts/validate-chapter.mjs <조각파일>"); process.exit(2); }
const ch = JSON.parse(readFileSync(file, "utf8"));
const errors = validateChapter(ch);
if (errors.length) {
  console.error(`검증 실패 (${errors.length}건):`);
  for (const e of errors) console.error("  - " + e);
  process.exit(1);
}
console.log(`${ch.id} 검증 통과 ✅`);
