import { lazy, Suspense } from 'react';
import { Spin } from 'antd';

const Line = lazy(() => import('@ant-design/plots').then(({ Line }) => ({ default: Line })));

interface ScalingCurveChartProps {
  curves: readonly { name: string; stages: number[]; growth: number[] }[];
  height: number;
  theme: 'light' | 'dark';
}

const ScalingCurveChart = ({ curves, height, theme }: ScalingCurveChartProps) => {
  const data = curves.flatMap(({ stages, growth, name }) =>
    stages.map((stat, index) => ({ stat, value: growth[index], curve: name })),
  );

  return (
    <Suspense
      fallback={
        <div role="status" style={{ display: 'grid', minHeight: height, placeContent: 'center', gap: 8 }}>
          <Spin size="small" aria-hidden />
          <span>正在加载补正曲线…</span>
        </div>
      }
    >
      <Line
        data={data}
        xField="stat"
        yField="value"
        colorField="curve"
        theme={theme}
        height={height}
        autoFit
        point={{ sizeField: 4, shapeField: 'circle' }}
        scale={{ color: { range: ['#1677ff', '#fa8c16'] } }}
        axis={{ x: { title: '属性值' }, y: { title: '成长值（%）' } }}
        legend={{ color: { position: 'bottom' } }}
      />
    </Suspense>
  );
};

export default ScalingCurveChart;
