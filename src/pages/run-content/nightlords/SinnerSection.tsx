import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import CharacterAvatar from '../../../components/common/CharacterAvatar';
import sinnerList from '../../../data/zh-CN/sinner_list.json';

interface SinnerData {
  key: string;
  characterName: string;
  buildIndex: number;
  leftHand: string;
  rightHand: string;
  consumable: string;
}

const processSinnerData = (): SinnerData[] => {
  const sinnerTableData: SinnerData[] = [];

  Object.entries(sinnerList).forEach(([characterName, builds]) => {
    builds.forEach((build: { 左手: string | string[]; 右手: string | string[]; 消耗品: string }, index: number) => {
      sinnerTableData.push({
        key: `${characterName}-${index}`,
        characterName,
        buildIndex: index + 1,
        leftHand: Array.isArray(build.左手) ? build.左手.join(' + ') : build.左手,
        rightHand: Array.isArray(build.右手) ? build.右手.join(' + ') : build.右手,
        consumable: build.消耗品,
      });
    });
  });

  return sinnerTableData;
};

const sinnerColumns: ColumnsType<SinnerData> = [
  {
    title: '角色名称',
    dataIndex: 'characterName',
    key: 'characterName',
    width: 100,
    align: 'center',
    fixed: 'left',
    render: (name: string) => (
      <strong>
        <CharacterAvatar name={name} size={18} />
      </strong>
    ),
    onCell: (record) => {
      const currentIndex = processSinnerData().findIndex(
        (item) => item.characterName === record.characterName && item.buildIndex === record.buildIndex,
      );

      // 计算相同角色的行数
      let rowSpan = 1;
      const allData = processSinnerData();
      for (let i = currentIndex + 1; i < allData.length; i++) {
        if (allData[i].characterName === record.characterName) {
          rowSpan++;
        } else {
          break;
        }
      }

      // 如果是相同角色的第一行，设置rowSpan
      if (currentIndex === 0 || allData[currentIndex - 1]?.characterName !== record.characterName) {
        return { rowSpan };
      }

      // 否则隐藏单元格
      return { rowSpan: 0 };
    },
  },
  {
    title: '配置',
    dataIndex: 'buildIndex',
    key: 'buildIndex',
    width: 60,
    align: 'center',
    render: (text) => `配置${text}`,
  },
  {
    title: '左手装备',
    dataIndex: 'leftHand',
    key: 'leftHand',
    width: 200,
    align: 'center',
  },
  {
    title: '右手装备',
    dataIndex: 'rightHand',
    key: 'rightHand',
    width: 200,
    align: 'center',
  },
  {
    title: '消耗品',
    dataIndex: 'consumable',
    key: 'consumable',
    width: 120,
    align: 'center',
  },
];

const SinnerSection = () => {
  const sinnerFooter = () => (
    <div className="footer-text">
      <div>*双人1.1倍血量/三人1.2倍血量 *每个NPC基础数据均为满级 *每个NPC自带仇恨-6的BUFF</div>
      <div>◦ 罪人金身 buff：第一层加 20% 攻击，后续每层加 2% 攻击</div>
    </div>
  );

  return (
    <div id="sinner-details">
      <Table
        columns={sinnerColumns}
        dataSource={processSinnerData()}
        rowKey="key"
        scroll={{ x: 700 }}
        pagination={false}
        size="small"
        bordered
        footer={sinnerFooter}
      />
    </div>
  );
};

export default SinnerSection;
