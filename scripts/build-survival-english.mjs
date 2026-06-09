// 조각 파일을 합쳐 data/survival-english.json 생성.
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
const dir = "scripts/chapters";
const category = JSON.parse(readFileSync(`${dir}/_category.json`, "utf8"));
const files = readdirSync(dir)
  .filter((f) => /^ch\d{2}\.json$/.test(f))
  .sort();
const chapters = files.map((f) => JSON.parse(readFileSync(`${dir}/${f}`, "utf8")));
const out = { ...category, chapters };
writeFileSync("data/survival-english.json", JSON.stringify(out, null, 2) + "\n");
console.log(`빌드 완료: ${chapters.length}개 챕터`);
