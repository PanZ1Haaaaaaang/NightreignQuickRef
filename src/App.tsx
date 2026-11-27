import { lazy, Suspense, use, useEffect, useRef, useState } from 'react';
import { App as AntdApp, ConfigProvider, Spin, theme } from 'antd';
import { geekblue } from '@ant-design/colors';
// import zhCN from 'antd/locale/zh_CN';
// import enUS from 'antd/locale/en_US';
import Header from './components/Header';
import Footer from './components/Footer';
import Navigation from './components/Navigation';
import PageHeader from './components/PageHeader';
import FunctionMenu from './components/FunctionMenu';
import { initializeTheme, setupThemeListener, toggleTheme } from './utils/themeUtils';
import DataManager, { type DataGroup } from './utils/dataManager';
import { setMessageApi } from './utils/feedback';
import { getPageByKey, type PageTabProps } from './config/navigationConfig';
import { navigationUrl, readNavigationTarget, type NavigationTarget } from './utils/navigationUrl';

// 视图级懒加载：每个页面独立成 chunk，首屏只下载当前 tab
const RelicEntriesView = lazy(() => import('./pages/loadout/relic-entries/RelicEntriesView'));
const InGameEntriesView = lazy(() => import('./pages/in-run/in-game-entries/InGameEntriesView'));
const GameMechanicsView = lazy(() => import('./pages/match-rules/game-mechanics/GameMechanicsView'));
const LegendaryWeaponView = lazy(() => import('./pages/LegendaryWeaponView'));
const WeaponMechanicsView = lazy(() => import('./pages/WeaponMechanicsView'));
const CharacterDataView = lazy(() => import('./pages/loadout/character-data/CharacterDataView'));
const BossDataView = lazy(() => import('./pages/BossDataView'));
const WeaponSkillMagicView = lazy(() => import('./pages/WeaponSkillMagicView'));
const MerchantView = lazy(() => import('./pages/MerchantView'));
const DropPoolView = lazy(() => import('./pages/DropPoolView'));

// 懒加载占位：只占内容区，不遮挡顶部导航，避免布局跳动
const viewLoadingStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '40vh',
  width: '100%',
};

const ViewLoading = () => (
  <div style={viewLoadingStyle}>
    <Spin />
  </div>
);

// 各 tab 依赖的数据组。游戏机制 / 武器战技与魔法祷告 用的是随页面 chunk 打包的静态 JSON，
// 不在此表内，因此这两个页面切换时不需要任何额外请求。
const TAB_DATA_GROUPS: Record<string, DataGroup | undefined> = {
  遗物词条: 'entries',
  局内词条: 'entries',
  角色数据: 'character',
  夜王数据: 'boss',
  强敌与事件: 'boss',
  传说武器详情: 'weapon',
};

// 数据组 Promise 缓存：Suspense 需要跨渲染拿到同一个 Promise
const groupGatePromises = new Map<DataGroup, Promise<void>>();

const getGroupPromise = (group: DataGroup): Promise<void> => {
  const cached = groupGatePromises.get(group);
  if (cached) return cached;

  const task = DataManager.getInstance()
    .loadGroup(group)
    .catch((error) => {
      // 失败时不让 Suspense 抛错崩溃，由 DataManager 内部提示，页面按空数据降级
      console.error(`数据组 ${group} 加载失败:`, error);
    });

  groupGatePromises.set(group, task);
  return task;
};

// 在 Suspense 内挂起，直到该页所需数据就绪，避免首帧渲染空表格
const DataGate = ({ group, children }: { group: DataGroup; children: React.ReactNode }) => {
  use(getGroupPromise(group));
  return <>{children}</>;
};

// 把 antd v6 的 message 实例注入到纯 TS 模块可访问的位置
const MessageBridge = () => {
  const { message } = AntdApp.useApp();

  useEffect(() => {
    setMessageApi(message);
  }, [message]);

  return null;
};

function App() {
  const [navigation, setNavigation] = useState(() => ({
    target: readNavigationTarget(window.location.search),
    scrollToSection: true,
  }));
  const [isDarkMode, setIsDarkMode] = useState(false);
  const pageContent = useRef<HTMLDivElement>(null);
  // const [isEnglish, setIsEnglish] = useState(false);

  const { page, section } = navigation.target;
  const activeTab = page.key;
  const activeStep = section?.stepIndex ?? 0;

  const navigate = (target: NavigationTarget, scrollToSection = false) => {
    const url = navigationUrl(window.location.href, target);
    if (url.href !== window.location.href) {
      window.history.pushState(null, '', url);
    }
    setNavigation({ target, scrollToSection });
  };

  const handlePageChange = (key: string) => {
    const nextPage = getPageByKey(key);
    if (nextPage && nextPage !== page) navigate({ page: nextPage });
  };

  const pageTabs: PageTabProps = {
    activeSubTab: section?.tabKey ?? page.sections.find(({ tabKey }) => tabKey)?.tabKey ?? '',
    onSubTabChange: (tabKey) => {
      const nextSection = page.sections.find((item) => item.tabKey === tabKey);
      if (nextSection) navigate({ page, section: nextSection });
    },
  };

  const handleStepChange = (stepIndex: number) => {
    const nextSection = page.sections.find((item) => item.stepIndex === stepIndex);
    if (nextSection) navigate({ page, section: nextSection });
  };

  useEffect(() => {
    const handlePopState = () => {
      setNavigation({ target: readNavigationTarget(window.location.search), scrollToSection: true });
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const anchorId = navigation.target.section?.anchorId;
    const container = pageContent.current;
    if (!navigation.scrollToSection || !anchorId || !container) return;

    let frame = 0;
    const scrollWhenVisible = () => {
      const anchor = document.getElementById(anchorId);
      if (!anchor || !container.contains(anchor) || !anchor.getClientRects().length) return;

      observer.disconnect();
      frame = window.requestAnimationFrame(() => {
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        anchor.scrollIntoView({ behavior: reduceMotion ? 'instant' : 'smooth', block: 'start' });
      });
    };

    // 目标所在的页面和子页签可能在 Suspense 之后才挂载。
    const observer = new MutationObserver(scrollWhenVisible);
    observer.observe(container, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'hidden'],
    });
    scrollWhenVisible();

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, [navigation]);

  // 主题切换函数
  const handleToggleTheme = () => {
    toggleTheme(isDarkMode, setIsDarkMode);
  };

  // 语言切换
  // const handleToggleLanguage = () => {
  //   setIsEnglish(!isEnglish);
  // };

  // 初始化主题
  useEffect(() => {
    initializeTheme(setIsDarkMode);
  }, []);

  // 监听系统主题变化
  useEffect(() => {
    return setupThemeListener(setIsDarkMode);
  }, []);

  // 渲染内容（视图组件已懒加载，需由 Suspense 包裹）
  const renderView = () => {
    switch (activeTab) {
      case '遗物词条':
        return <RelicEntriesView {...pageTabs} />;
      case '局内词条':
        return <InGameEntriesView {...pageTabs} />;
      case '机制':
        return <WeaponMechanicsView {...pageTabs} />;
      case '传说武器详情':
        return <LegendaryWeaponView activeStep={activeStep} onStepChange={handleStepChange} />;
      case '角色数据':
        return <CharacterDataView {...pageTabs} />;
      case '游戏机制':
        return <GameMechanicsView functionName="游戏机制" {...pageTabs} />;
      case '夜王数据':
        return <BossDataView scope="夜王" {...pageTabs} />;
      case '强敌与事件':
        return <BossDataView scope="地图" {...pageTabs} />;
      case '武器战技与魔法祷告':
        return <WeaponSkillMagicView {...pageTabs} />;
      case '商人数据':
        return <MerchantView {...pageTabs} />;
      case '掉落池':
        return <DropPoolView />;
      default:
        return null;
    }
  };

  const renderContent = () => {
    const group = TAB_DATA_GROUPS[activeTab];
    const view = renderView();

    return <Suspense fallback={<ViewLoading />}>{group ? <DataGate group={group}>{view}</DataGate> : view}</Suspense>;
  };

  // 统一的主题配置
  const themeConfig = {
    algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary: isDarkMode ? geekblue[4] : geekblue[6],
      colorPrimaryHover: isDarkMode ? geekblue[3] : geekblue[5],
      colorPrimaryActive: isDarkMode ? geekblue[5] : geekblue[7],
    },
  };

  return (
    <ConfigProvider
      theme={themeConfig}
      // locale={isEnglish ? enUS : zhCN}
    >
      <AntdApp component={false}>
        <MessageBridge />
        <div className="app-container">
          <FunctionMenu onNavigate={(target) => navigate(target, true)} />

          <Header
            isDarkMode={isDarkMode}
            onToggleTheme={handleToggleTheme}
            // onToggleLanguage={handleToggleLanguage}
          />

          <Navigation activeTab={activeTab} onTabChange={handlePageChange} />

          <PageHeader pageKey={activeTab} />

          {/* key 绑定当前 tab：切页时整块内容重新入场，统一动效见 styles/motion.css */}
          <div className="page-enter" key={activeTab} ref={pageContent}>
            {renderContent()}
          </div>

          <Footer />
        </div>
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;
