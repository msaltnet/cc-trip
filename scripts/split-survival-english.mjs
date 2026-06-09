// 1회용: 현재 data/survival-english.json을 조각 파일로 분리.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const data = JSON.parse(readFileSync("data/survival-english.json", "utf8"));
mkdirSync("scripts/chapters", { recursive: true });
const { chapters, ...category } = data;
writeFileSync("scripts/chapters/_category.json", JSON.stringify(category, null, 2) + "\n");
for (const ch of chapters) {
  writeFileSync(`scripts/chapters/${ch.id}.json`, JSON.stringify(ch, null, 2) + "\n");
}
console.log(`분리 완료: ${chapters.length}개 + _category.json`);
