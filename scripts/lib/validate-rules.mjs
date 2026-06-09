// 단일 챕터 객체를 검사해 에러 문자열 배열을 반환. ids는 전역 중복 검사용 Set.
export function validateChapter(ch, ids = new Set(), prev = "") {
  const errors = [];
  if (!/^ch\d{2}$/.test(ch.id)) errors.push(`잘못된 챕터 id: ${ch.id}`);
  if (prev && ch.id <= prev) errors.push(`챕터 순서 오류: ${ch.id} (이전 ${prev})`);
  if (!ch.title || !ch.summary) errors.push(`${ch.id}: title/summary 누락`);

  const hasDialogues = Array.isArray(ch.dialogues) && ch.dialogues.length > 0;
  const hasSections = Array.isArray(ch.sections) && ch.sections.length > 0;
  if (!hasDialogues && !hasSections)
    errors.push(`${ch.id}: dialogues(또는 sections) 누락`);

  if (hasDialogues) {
    if (ch.dialogues.length !== 10)
      errors.push(`${ch.id}: 대화 ${ch.dialogues.length}개 (10개여야 함)`);
    for (const d of ch.dialogues) {
      if (!d.id) errors.push(`${ch.id}: dialogue.id 누락`);
      else if (ids.has(d.id)) errors.push(`중복 대화 id: ${d.id}`);
      else ids.add(d.id);
      if (!d.title) errors.push(`${d.id || ch.id}: dialogue.title 누락`);
      if (!Array.isArray(d.lines) || d.lines.length < 2)
        errors.push(`${d.id || ch.id}: lines 2줄 이상 필요`);
      for (const ln of d.lines || []) {
        if (!ln.speaker || !ln.en || !ln.ko)
          errors.push(`${d.id || ch.id}: line의 speaker/en/ko 누락`);
      }
      if (!Array.isArray(d.keyExpressions) || d.keyExpressions.length < 1)
        errors.push(`${d.id || ch.id}: keyExpressions 1개 이상 필요`);
      for (const ex of d.keyExpressions || []) {
        if (!ex.en || !ex.ko)
          errors.push(`${d.id || ch.id}: keyExpression의 en/ko 누락`);
        if (!Array.isArray(ex.alternatives) || ex.alternatives.length < 2)
          errors.push(`${d.id || ch.id}: "${ex.en}" 대체표현 2개 이상 필요`);
        for (const alt of ex.alternatives || []) {
          if (!alt.en || !alt.ko)
            errors.push(`${d.id || ch.id}: 대체표현의 en/ko 누락`);
        }
      }
    }
  }

  for (const set of ch.sets || []) {
    if (!set.id) errors.push(`${ch.id}: set.id 누락`);
    const qs = set.questions || [];
    if (qs.length < 10)
      errors.push(`${ch.id}/${set.id}: 문항 ${qs.length}개 (10개 이상이어야 함)`);
    for (const q of qs) {
      if (ids.has(q.id)) errors.push(`중복 문항 id: ${q.id}`);
      ids.add(q.id);
      const expectId = `se_${ch.id}_${set.id}_`;
      if (!q.id.startsWith(expectId))
        errors.push(`${q.id}: id 접두사가 ${expectId} 와 불일치`);
      if (!q.question) errors.push(`${q.id}: question 누락`);
      if (typeof q.answerIndex !== "number")
        errors.push(`${q.id}: answerIndex 누락`);
      if (q.type === "multiple_choice") {
        if (!Array.isArray(q.options) || q.options.length !== 4)
          errors.push(`${q.id}: options 4개여야 함`);
        if (q.answerIndex < 0 || q.answerIndex > 3)
          errors.push(`${q.id}: answerIndex 범위 오류`);
      } else if (q.type === "ox") {
        if (q.options) errors.push(`${q.id}: ox에는 options 불필요`);
        if (q.answerIndex !== 0 && q.answerIndex !== 1)
          errors.push(`${q.id}: ox answerIndex는 0 또는 1`);
      } else {
        errors.push(`${q.id}: 알 수 없는 type ${q.type}`);
      }
      if (!q.explanation) errors.push(`${q.id}: explanation 누락`);
    }
  }
  return errors;
}
