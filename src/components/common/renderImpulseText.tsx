import type { ReactNode } from 'react';
import ImpulseBadge from './ImpulseBadge';

const impulseMentions = new RegExp(
  [
    /(?:(?<!其他)冲击力|冲击力(?:视距离为|抗性|提升为|弱化为))[ \t]*\d+(?:或\d+)*(?![\d.%％])/,
    /(?<![\d.])\d+(?:[ \t]*号?[ \t]*[/,、][ \t]*\d+)*(?=[ \t]*(?:号?[ \t]*冲击力|号[ \t]*(?:微硬直|短硬直)))/,
    /(?<![\d.])\d+(?=[ \t]+冲(?:[ \t]+\d|攻击|[，；。]|$))/,
  ]
    .map((pattern) => pattern.source)
    .join('|'),
  'g',
);

export const renderImpulseText = (value = '') => {
  const parts: ReactNode[] = [];
  let offset = 0;

  for (const mention of value.matchAll(impulseMentions)) {
    for (const number of mention[0].matchAll(/\d+/g)) {
      const start = mention.index + number.index;
      parts.push(value.slice(offset, start), <ImpulseBadge key={start} level={Number(number[0])} size="sm" />);
      offset = start + number[0].length;
    }
  }

  return parts.length > 0 ? [...parts, value.slice(offset)] : value;
};
