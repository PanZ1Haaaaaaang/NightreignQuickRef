import React from 'react';
import { SHOW_NAV_GROUP_NOTE, SHOW_PAGE_BADGES, getNavigationGroups } from '../config/navigationConfig';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

// 顶部分组目录卡：按游戏内核分 4 组，组内列出该组全部页面（仍然一键直达，不藏层级）
const Navigation: React.FC<NavigationProps> = React.memo(({ activeTab, onTabChange }) => {
  const groups = getNavigationGroups();

  return (
    <nav className="nav-directory" aria-label="站点导航">
      {groups.map((group) => {
        const isActiveGroup = group.pages.some((page) => page.key === activeTab);

        return (
          <div
            key={group.key}
            className={`nav-group ${isActiveGroup ? 'nav-group-active' : ''}`}
            // 页面多的一组占更宽，组宽自然反映内容量
            style={{ flexGrow: group.pages.length }}
          >
            <div className="nav-group-head">
              <span className="nav-group-label">{group.label}</span>
              {SHOW_NAV_GROUP_NOTE && <span className="nav-group-note">{group.note}</span>}
            </div>
            <div className="nav-group-items">
              {group.pages.map((page) => (
                <button
                  key={page.key}
                  type="button"
                  title={page.desc}
                  aria-current={activeTab === page.key ? 'page' : undefined}
                  className={`nav-pill ${activeTab === page.key ? 'active' : ''}`}
                  onClick={() => onTabChange(page.key)}
                >
                  <span className="nav-pill-label">
                    <span className="nav-pill-icon" aria-hidden="true">
                      {page.icon}
                    </span>
                    {page.label}
                  </span>
                  {SHOW_PAGE_BADGES && (
                    <span className="nav-pill-badges">
                      {page.badges.map((badge) => (
                        <span key={badge} className="nav-badge" data-badge={badge}>
                          {badge}
                        </span>
                      ))}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </nav>
  );
});

export default Navigation;
