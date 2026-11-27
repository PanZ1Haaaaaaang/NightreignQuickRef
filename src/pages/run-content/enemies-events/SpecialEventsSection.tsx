import { useEffect, useState } from 'react';
import { Button, Space, Spin, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Line } from '@ant-design/plots';
import { throttle } from 'lodash';
import { typeColorMap } from '@/types';
import type { EntryData } from '@/types';
import DataManager from '@/utils/dataManager';
import { message } from '@/utils/feedback';
import { getCurrentTheme } from '@/utils/themeUtils';

const curseData = [
  { rune: '0', damageIncrease: 0 },
  { rune: '1000', damageIncrease: 0.4 },
  { rune: '2000', damageIncrease: 0.8 },
  { rune: '5000', damageIncrease: 2 },
  { rune: '10000', damageIncrease: 4 },
  { rune: '20000', damageIncrease: 8 },
  { rune: '30000', damageIncrease: 12 },
  { rune: '50000', damageIncrease: 20 },
  { rune: '60000', damageIncrease: 22 },
  { rune: '80000', damageIncrease: 26 },
  { rune: '100000', damageIncrease: 30 },
  { rune: '150000', damageIncrease: 33.75 },
  { rune: '200000', damageIncrease: 37.5 },
  { rune: '300000', damageIncrease: 45 },
  { rune: '500000', damageIncrease: 60 },
  { rune: '700000', damageIncrease: 75 },
  { rune: '900000', damageIncrease: 90 },
  { rune: '1000000', damageIncrease: 91.2 },
  { rune: '1100000', damageIncrease: 92.42 },
  { rune: '1500000', damageIncrease: 97.26 },
];

const getTypeColor = (type: string | null | undefined): string => {
  if (!type) return 'default';
  return typeColorMap[type] || 'default';
};

const specialEventColumns: ColumnsType<EntryData> = [
  {
    title: 'ID',
    dataIndex: 'entry_id',
    key: 'entry_id',
    width: '8%',
    align: 'center',
    onCell: () => ({
      style: { fontSize: '11px', color: 'var(--theme-text-secondary)' },
    }),
    sorter: (a, b) => {
      const idA = a.entry_id || '';
      const idB = b.entry_id || '';
      return idA.localeCompare(idB);
    },
    sortDirections: ['ascend', 'descend'],
  },
  {
    title: '类型',
    dataIndex: 'entry_type',
    key: 'entry_type',
    align: 'center',
    width: '15%',
    render: (text) => (text ? <Tag color={getTypeColor(text)}>{text}</Tag> : '-'),
    sorter: (a, b) => {
      const typeA = a.entry_type || '';
      const typeB = b.entry_type || '';
      return typeA.localeCompare(typeB, 'zh-CN');
    },
    sortDirections: ['ascend', 'descend'],
  },
  {
    title: '效果名称',
    dataIndex: 'entry_name',
    key: 'entry_name',
    width: '20%',
  },
  {
    title: '效果描述',
    dataIndex: 'explanation',
    key: 'explanation',
    width: '55%',
    // 数据里用 \n 分行（如「地底神殿的恩惠」），要 pre-wrap 才会真的换行
    render: (text) => <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{text || '-'}</span>,
  },
];

const SpecialEventsSection = ({ active }: { active: boolean }) => {
  const [specialEventData, setSpecialEventData] = useState<EntryData[]>([]);
  const [isLinearMode, setIsLinearMode] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>(getCurrentTheme());
  const [chartKey, setChartKey] = useState(0);
  const [loading, setLoading] = useState(true);

  // 羊头诅咒事件数据
  // 折线图配置
  const lineConfig = {
    data: isLinearMode ? curseData.map((item) => ({ ...item, rune: parseInt(item.rune) })) : curseData,
    xField: 'rune',
    yField: 'damageIncrease',
    theme: currentTheme,
    height: 400,
    autoFit: true,
    point: {
      size: 4,
      shape: 'circle',
      style: {
        fill: 'white',
        stroke: '#5B8FF9',
        lineWidth: 2,
      },
    },
    axis: {
      x: {
        // G2 v5 真正读取的是 axis 层级的 labelAutoRotate / labelAutoHide
        // （见 @antv/g2 esm/component/axis.js 的 inferLabelOverlap），
        // label 子对象里的 autoRotate 不生效。
        labelAutoRotate: false,
        labelAutoHide: true,
        label: {
          autoRotate: false,
          autoHide: true,
          autoEllipsis: true,
          style: {
            fill: currentTheme === 'dark' ? '#ffffff' : '#000000',
            fontSize: 12,
          },
          formatter: isLinearMode
            ? (value: string) => {
                const num = parseInt(value);
                if (num >= 1000000) {
                  return (num / 1000000).toFixed(1) + 'M';
                } else if (num >= 1000) {
                  return (num / 1000).toFixed(0) + 'K';
                }
                return value;
              }
            : undefined,
        },
        line: {
          style: {
            stroke: currentTheme === 'dark' ? '#ffffff' : '#000000',
            lineWidth: 1,
          },
        },
        tickLine: {
          style: {
            stroke: currentTheme === 'dark' ? '#ffffff' : '#000000',
            lineWidth: 1,
          },
        },
      },
      y: {
        label: {
          style: {
            fill: currentTheme === 'dark' ? '#ffffff' : '#000000',
            fontSize: 12,
          },
          formatter: (value: string) => `${value}%`,
        },
        line: {
          style: {
            stroke: currentTheme === 'dark' ? '#ffffff' : '#000000',
            lineWidth: 1,
          },
        },
        tickLine: {
          style: {
            stroke: currentTheme === 'dark' ? '#ffffff' : '#000000',
            lineWidth: 1,
          },
        },
      },
    },
    tooltip: {
      title: (datum: { rune: string | number; damageIncrease: number }) => {
        const runeValue = typeof datum.rune === 'number' ? datum.rune.toString() : datum.rune;
        return `卢恩:${runeValue} | 增伤:${datum.damageIncrease.toFixed(2)}%`;
      },
    },
    smooth: true,
    color: '#5B8FF9',
    lineStyle: {
      lineWidth: 3,
    },
  };

  // 加载特殊事件数据
  useEffect(() => {
    const loadSpecialEventData = async () => {
      try {
        const dataManager = DataManager.getInstance();
        await dataManager.loadGroup('boss');
        setSpecialEventData(dataManager.getInGameSpecialBuff());
        setLoading(false);
      } catch (error) {
        console.error('Failed to load special event data:', error);
        message.error('特殊事件数据加载失败');
        setLoading(false);
      }
    };

    void loadSpecialEventData();
  }, []);

  // 监听主题变化
  useEffect(() => {
    const checkTheme = () => {
      const newTheme = getCurrentTheme();
      if (newTheme !== currentTheme) {
        setCurrentTheme(newTheme);
        setChartKey((prev) => prev + 1);
      }
    };

    // 初始检查
    checkTheme();

    // 监听 localStorage 变化
    const handleStorageChange = () => {
      setTimeout(checkTheme, 50);
    };

    // 监听系统主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = () => {
      checkTheme();
    };

    // 监听自定义主题变化事件
    const handleThemeChange = () => {
      setTimeout(checkTheme, 50);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('themeChange', handleThemeChange);
    mediaQuery.addEventListener('change', handleMediaChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('themeChange', handleThemeChange);
      mediaQuery.removeEventListener('change', handleMediaChange);
    };
  }, [currentTheme]);

  // 处理窗口大小变化和拖拽导致的图表刷新问题
  useEffect(() => {
    const throttledChartRefresh = throttle(() => {
      setChartKey((prev) => prev + 1);
    }, 300);

    const handleResize = () => {
      throttledChartRefresh();
    };

    const handleDragEnd = () => {
      setTimeout(throttledChartRefresh, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('dragend', handleDragEnd);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('dragend', handleDragEnd);
      throttledChartRefresh.cancel();
    };
  }, []);

  // 监听标签页切换，确保图表正确渲染
  useEffect(() => {
    if (active) {
      const timer = setTimeout(() => {
        setChartKey((prev) => prev + 1);
        window.dispatchEvent(new Event('resize'));
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [active]);

  return (
    <>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin spinning={true} />
        </div>
      ) : (
        <>
          <Table
            columns={specialEventColumns}
            dataSource={specialEventData}
            // 没有游戏 ID 的条目都用 "-" 占位（火山口、地底神殿…），
            // 单用 entry_id 会撞 key，所以拼上名称
            rowKey={(record) => `${record.entry_id}|${record.entry_name}`}
            pagination={false}
            size="small"
            bordered
            style={{ marginBottom: '30px' }}
          />
          <div
            style={{
              marginTop: '30px',
              padding: '20px',
              backgroundColor: 'var(--theme-bg-primary)',
              borderRadius: '8px',
              border: '1px solid var(--theme-border)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
              }}
            >
              <h3
                style={{
                  color: 'var(--theme-text-primary)',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  margin: 0,
                }}
              >
                🪬 恶魔的添翼:卢恩-增伤关系图
              </h3>
              <Space.Compact size="small">
                <Button
                  color={isLinearMode ? 'default' : 'primary'}
                  variant={isLinearMode ? 'outlined' : 'solid'}
                  onClick={() => setIsLinearMode(false)}
                >
                  非线性模式
                </Button>
                <Button
                  color={isLinearMode ? 'primary' : 'default'}
                  variant={isLinearMode ? 'solid' : 'outlined'}
                  onClick={() => setIsLinearMode(true)}
                >
                  线性模式
                </Button>
              </Space.Compact>
            </div>
            <div id="line-chart-container" style={{ height: '400px' }}>
              <Line key={chartKey} {...lineConfig} />
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default SpecialEventsSection;
