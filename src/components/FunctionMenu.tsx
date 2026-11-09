import React, { useState } from 'react';
import { Tooltip, Menu } from 'antd';
import type { MenuProps } from 'antd';
import logoImage from '../assets/logo-circle.svg';
import { getNavigationGroups } from '../config/navigationConfig';
import type { NavSection } from '../config/navigationConfig';

interface FunctionMenuProps {
  onTabChange: (tab: string) => void;
  onSubTabChange?: (tabKey: string) => void; // 子Tab切换回调
  onStepChange?: (stepIndex: number) => void; // Step切换回调
}

type MenuItemType = NonNullable<MenuProps['items']>[number];

interface SectionMetadata {
  pageKey: string;
  section: NavSection;
}

const GROUP_KEY_PREFIX = 'group:';
const SECTION_KEY_PREFIX = 'section:';

// 目标页可能是懒加载 + 异步取数，锚点要等 DOM 出现后再滚（最多等约 3s）
const scrollToAnchor = (anchorId: string, tries = 0) => {
  const element = document.getElementById(anchorId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }
  if (tries < 25) {
    window.setTimeout(() => scrollToAnchor(anchorId, tries + 1), 120);
  }
};

// 左下角功能菜单：完整索引（分组 → 页面 → 页内子项），数据全部来自 navigationConfig，
// 不再在这里单独维护一份菜单，避免与顶部导航的命名/顺序漂移。
const FunctionMenu: React.FC<FunctionMenuProps> = ({ onTabChange, onSubTabChange, onStepChange }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  const sectionMetadata = new Map<string, SectionMetadata>();

  const menuItems: MenuItemType[] = getNavigationGroups().map((group) => ({
    key: `${GROUP_KEY_PREFIX}${group.key}`,
    label: group.label,
    children: group.pages.map((page) => {
      const children = page.sections.map((section) => {
        const key = `${SECTION_KEY_PREFIX}${page.key}:${section.key}`;
        sectionMetadata.set(key, { pageKey: page.key, section });
        return { key, label: section.label };
      });

      return {
        key: page.key,
        label: `${page.icon} ${page.label}`,
        ...(children.length > 0 && { children }),
      };
    }),
  }));

  const handleMenuClick = ({ key }: { key: string }) => {
    // 分组本身只负责展开/收起
    if (key.startsWith(GROUP_KEY_PREFIX)) return;

    // 页面级：直接切页
    if (!key.startsWith(SECTION_KEY_PREFIX)) {
      onTabChange(key);
      setMenuVisible(false);
      return;
    }

    // 页内子项：先切页，再联动子Tab / Step，最后滚到锚点
    const metadata = sectionMetadata.get(key);
    if (!metadata) return;

    const { pageKey, section } = metadata;
    onTabChange(pageKey);
    setMenuVisible(false);

    setTimeout(() => {
      if (section.tabKey && onSubTabChange) {
        onSubTabChange(section.tabKey);
      }
      if (typeof section.stepIndex === 'number' && onStepChange) {
        onStepChange(section.stepIndex);
      }
      if (section.anchorId) {
        scrollToAnchor(section.anchorId);
      }
    }, 200);
  };

  return (
    <div className="fixed-logo">
      <Tooltip title="功能导航" placement="right">
        <img
          src={logoImage}
          alt="Nightreign Logo"
          onClick={() => setMenuVisible(!menuVisible)}
          style={{
            cursor: 'pointer',
            width: 'clamp(30px, 5vw, 50px)',
            height: 'clamp(30px, 5vw, 50px)',
            borderRadius: '50%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
          }}
        />
      </Tooltip>

      {/* 功能导航菜单 */}
      {menuVisible && (
        <div
          className="function-menu-overlay"
          style={{
            position: 'fixed',
            top: 'clamp(60px, 8vh, 80px)',
            left: 'clamp(60px, 3vw, 80px)',
            zIndex: 1040,
            backgroundColor: 'var(--content-bg)',
            borderRadius: 'clamp(6px, 1vw, 12px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(0, 0, 0, 0.06)',
            minWidth: 'clamp(200px, 25vw, 280px)',
            maxWidth: 'clamp(250px, 30vw, 350px)',
            maxHeight: 'calc(100vh - clamp(120px, 15vh, 180px))',
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          <Menu
            mode="inline"
            items={menuItems}
            onClick={handleMenuClick}
            openKeys={openKeys}
            onOpenChange={setOpenKeys}
            inlineIndent={12}
            style={{
              border: 'none',
              backgroundColor: 'transparent',
            }}
            className="function-menu"
          />
        </div>
      )}

      {/* 点击外部关闭菜单 */}
      {menuVisible && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1030,
          }}
          onClick={() => setMenuVisible(false)}
        />
      )}
    </div>
  );
};

export default FunctionMenu;
