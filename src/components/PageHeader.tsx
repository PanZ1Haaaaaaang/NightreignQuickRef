import React from 'react';
import { SHOW_PAGE_BADGES, SHOW_PAGE_DESC, getGroupByKey, getPageByKey } from '../config/navigationConfig';

interface PageHeaderProps {
  pageKey: string;
}

/**
 * 页面头：每次切换 tab 都贴在导航下方，回答「我在哪一层、这页是干什么的」。
 * 页面自身不再需要写标题，内容区第一张卡片就是纯内容。
 */
const PageHeader: React.FC<PageHeaderProps> = ({ pageKey }) => {
  const page = getPageByKey(pageKey);
  if (!page) return null;

  const group = getGroupByKey(page.group);

  return (
    <header className="page-header">
      <div className="page-header-top">
        <div className="page-header-title-row">
          <span className="page-header-group">{group?.label}</span>
          <span className="page-header-sep" aria-hidden="true">
            ›
          </span>
          <h2 className="page-header-title">
            <span className="page-header-icon" aria-hidden="true">
              {page.icon}
            </span>
            {page.label}
          </h2>
        </div>
        {SHOW_PAGE_BADGES && (
          <div className="page-header-badges">
            {page.badges.map((badge) => (
              <span key={badge} className="page-badge" data-badge={badge}>
                {badge}
              </span>
            ))}
          </div>
        )}
      </div>
      {SHOW_PAGE_DESC && <p className="page-header-desc">{page.desc}</p>}
    </header>
  );
};

export default PageHeader;
