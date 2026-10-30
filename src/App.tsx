import { lazy, Suspense, use, useState, useEffect } from 'react';
import { App as AntdApp, ConfigProvider, Spin, theme } from 'antd';
import { geekblue } from '@ant-design/colors';
// import zhCN from 'antd/locale/zh_CN';
// import enUS from 'antd/locale/en_US';
import Header from './components/Header';
import Footer from './components/Footer';
import Navigation from './components/Navigation';
import FunctionMenu from './components/FunctionMenu';
import { initializeTheme, setupThemeListener, toggleTheme } from './utils/themeUtils';
import DataManager, { type DataGroup } from './utils/dataManager';
import { setMessageApi } from './utils/feedback';
import { getDefaultPage } from './config/navigationConfig';

// 视图级懒加载：每个页面独立成 chunk，首屏只下载当前 tab
const EntryDetailView = lazy(() => import('./pages/EntryDetailView'));
const GameMechanicsView = lazy(() => import('./pages/GameMechanicsView'));
const LegendaryWeaponView = lazy(() => import('./pages/LegendaryWeaponView'));
const CharacterDataView = lazy(() => import('./pages/CharacterDataView'));
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
  词条详细数据: 'entries',
  角色数据: 'character',
  夜王Boss数据: 'boss',
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
  const [activeTab, setActiveTab] = useState(getDefaultPage());
  const [isDarkMode, setIsDarkMode] = useState(false);
  // const [isEnglish, setIsEnglish] = useState(false);

  // 子Tab和Step状态管理
  const [activeSubTab, setActiveSubTab] = useState<string>('');
  const [activeStep, setActiveStep] = useState<number>(0);

  // 主题切换函数
  const handleToggleTheme = () => {
    toggleTheme(isDarkMode, setIsDarkMode);
  };

  // 语言切换
  // const handleToggleLanguage = () => {
  //   setIsEnglish(!isEnglish);
  // };

  // 子Tab切换处理
  const handleSubTabChange = (tabKey: string) => {
    setActiveSubTab(tabKey);
  };

  // Step切换处理
  const handleStepChange = (stepIndex: number) => {
    setActiveStep(stepIndex);
  };

  // 初始化主题
  useEffect(() => {
    initializeTheme(setIsDarkMode);
  }, []);

  // 监听系统主题变化
  useEffect(() => {
    return setupThemeListener(setIsDarkMode);
  }, []);

  // 主Tab切换时重置子Tab和Step状态
  useEffect(() => {
    setActiveSubTab('');
    setActiveStep(0);
  }, [activeTab]);

  // 子Tab为一次性指令：生效后立即清空，避免持续控制子组件，阻止手动切换
  useEffect(() => {
    if (activeSubTab) {
      const timer = setTimeout(() => setActiveSubTab(''), 0);
      return () => clearTimeout(timer);
    }
  }, [activeSubTab]);

  // 渲染内容（视图组件已懒加载，需由 Suspense 包裹）
  const renderView = () => {
    switch (activeTab) {
      case '词条详细数据':
        return <EntryDetailView activeSubTab={activeSubTab} />;
      case '传说武器详情':
        return <LegendaryWeaponView activeStep={activeStep} />;
      case '角色数据':
        return <CharacterDataView />;
      case '游戏机制':
        return <GameMechanicsView functionName="游戏机制" />;
      case '夜王Boss数据':
        return <BossDataView activeSubTab={activeSubTab} />;
      case '武器战技与魔法祷告':
        return <WeaponSkillMagicView activeSubTab={activeSubTab} />;
      case '商人数据':
        return <MerchantView activeSubTab={activeSubTab} />;
      case '掉落池':
        return <DropPoolView />;
      default:
        return <EntryDetailView activeSubTab={activeSubTab} />;
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
          <FunctionMenu
            onTabChange={setActiveTab}
            onSubTabChange={handleSubTabChange}
            onStepChange={handleStepChange}
          />

          <Header
            isDarkMode={isDarkMode}
            onToggleTheme={handleToggleTheme}
            // onToggleLanguage={handleToggleLanguage}
          />

          <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

          {renderContent()}

          <Footer />
        </div>
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;
