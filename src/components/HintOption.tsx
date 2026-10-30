import React from 'react';
import type { DefaultOptionType } from 'antd/es/select';

/** 带右侧说明的下拉选项数据：label 左侧主文案，hint 右侧灰色说明（一般填原来的悬浮文案） */
export interface HintOptionData extends DefaultOptionType {
  hint?: React.ReactNode;
}

/** 下拉选项：左主文案 + 右侧灰色说明（样式见 components.css 的 .hint-option） */
export const HintOption: React.FC<{ label?: React.ReactNode; hint?: React.ReactNode }> = ({ label, hint }) => (
  <div className="hint-option">
    <span className="hint-option-label">{label}</span>
    {hint ? <span className="hint-option-hint">{hint}</span> : null}
  </div>
);

/**
 * 直接传给 antd Select 的 optionRender：
 * <Select options={options} optionRender={renderHintOption} />
 */
export const renderHintOption = (option: { data: DefaultOptionType }): React.ReactNode => {
  const data = option.data as HintOptionData;
  return <HintOption label={data.label} hint={data.hint} />;
};
