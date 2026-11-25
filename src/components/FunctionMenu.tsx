import React, { useState } from 'react';
import { Tooltip, Menu } from 'antd';
import type { MenuProps } from 'antd';
import logoImage from '../assets/logo-circle.svg';
import { getNavigationGroups } from '../config/navigationConfig';
import type { NavigationTarget } from '../utils/navigationUrl';

interface FunctionMenuProps {
  onNavigate: (target: NavigationTarget) => void;
}

type MenuItemType = NonNullable<MenuProps['items']>[number];

const GROUP_KEY_PREFIX = 'group:';
const SECTION_KEY_PREFIX = 'section:';

// 左下角功能菜单：完整索引（分组 → 页面 → 页内子项），数据全部来自 navigationConfig，
// 不再在这里单独维护一份菜单，避免与顶部导航的命名/顺序漂移。
const FunctionMenu: React.FC<FunctionMenuProps> = ({ onNavigate }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  const targets = new Map<string, NavigationTarget>();

  const menuItems: MenuItemType[] = getNavigationGroups().map((group) => ({
    key: `${GROUP_KEY_PREFIX}${group.key}`,
    label: group.label,
    children: group.pages.map((page) => {
      targets.set(page.key, { page });
      const children = page.sections.map((section) => {
        const key = `${SECTION_KEY_PREFIX}${page.key}:${section.key}`;
        targets.set(key, { page, section });
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
    const target = targets.get(key);
    if (!target) return;
    onNavigate(target);
    setMenuVisible(false);
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
