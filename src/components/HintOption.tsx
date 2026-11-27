import type { ReactNode } from 'react';

interface HintOptionProps {
  data: {
    label?: ReactNode;
    hint?: ReactNode;
  };
}

/** 下拉选项：左主文案 + 右侧灰色说明（样式见 components.css 的 .hint-option） */
export const HintOption = ({ data: { label, hint } }: HintOptionProps) => (
  <div className="hint-option">
    <span className="hint-option-label">{label}</span>
    {hint ? <span className="hint-option-hint">{hint}</span> : null}
  </div>
);
