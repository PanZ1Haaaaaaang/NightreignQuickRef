import React, { useEffect, useId, useRef, useState } from 'react';
import { Tooltip, Menu } from 'antd';
import type { MenuProps, MenuRef } from 'antd';
import logoImage from '@/assets/logo-circle.svg';
import { getNavigationGroups } from '@/config/navigationConfig';
import type { NavigationTarget } from '@/utils/navigationUrl';

interface FunctionMenuProps {
  onNavigate: (target: NavigationTarget) => void;
}

type MenuItemType = NonNullable<MenuProps['items']>[number];

const GROUP_KEY_PREFIX = 'group:';
const SECTION_KEY_PREFIX = 'section:';

// 功能菜单的分组、页面和页内子项全部来自 navigationConfig，
// 不再在这里单独维护一份菜单，避免与顶部导航的命名/顺序漂移。
const FunctionMenu: React.FC<FunctionMenuProps> = ({ onNavigate }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<MenuRef>(null);

  useEffect(() => {
    if (menuVisible) menuRef.current?.focus({ preventScroll: true });
  }, [menuVisible]);

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

  const closeMenu = () => {
    setMenuVisible(false);
    triggerRef.current?.focus({ preventScroll: true });
  };

  const handleMenuClick: NonNullable<MenuProps['onClick']> = ({ key, domEvent }) => {
    const target = targets.get(key);
    if (!target) return;
    domEvent.preventDefault();
    // 菜单选择后立即卸载，避免同一次按键继续传给已关闭的菜单。
    domEvent.stopPropagation();
    onNavigate(target);
    closeMenu();
  };

  return (
    <div
      className="fixed-logo"
      onBlur={(event) => {
        if (menuVisible && event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) {
          setMenuVisible(false);
        }
      }}
      onKeyDownCapture={(event) => {
        if (menuVisible && event.key === 'Escape') {
          event.preventDefault();
          event.stopPropagation();
          closeMenu();
        }
      }}
    >
      <Tooltip title="功能导航" placement="right" trigger={['hover', 'focus']}>
        <button
          ref={triggerRef}
          type="button"
          className="function-menu-trigger"
          aria-label="功能导航"
          aria-haspopup="menu"
          aria-expanded={menuVisible}
          aria-controls={menuVisible ? menuId : undefined}
          onClick={() => setMenuVisible((visible) => !visible)}
        >
          <img src={logoImage} alt="" />
        </button>
      </Tooltip>

      {/* 功能导航菜单 */}
      {menuVisible && (
        <div className="function-menu-overlay">
          <Menu
            ref={menuRef}
            id={menuId}
            aria-label="功能导航"
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
      {menuVisible && <div className="function-menu-backdrop" aria-hidden="true" onClick={closeMenu} />}
    </div>
  );
};

export default FunctionMenu;
