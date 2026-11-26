import { useState } from 'react';
import { Button, Modal, Segmented, Switch } from 'antd';
import { DownOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { commonDodgeProfiles, situationalDodgeProfiles, type DodgeProfile } from '../../config/dodgeFrameConfig';
import type { DodgeAnimation, DodgeFlagType } from '../../types';
import DataManager from '../../utils/dataManager';
import styles from '../../styles/dodgeFramesComparison.module.css';
import AbilityIcon from '../../components/common/AbilityIcon';
import CharacterAvatar from '../../components/common/CharacterAvatar';

const MOVE_FLAG = 11;
const SCALE_TICKS = 6;
const frameRateOptions = [
  { label: '60 fps', value: 60 },
  { label: '30 fps', value: 30 },
] as const;

interface DodgeRowProps {
  profile: DodgeProfile;
  showPortraits: boolean;
  animations: ReadonlyMap<string, DodgeAnimation>;
  cancelFlags: DodgeFlagType[];
  multiplier: number;
  scale: number;
  enhanced: boolean;
  expanded: boolean;
  toggleExpanded: () => void;
}

const formatFrame = (frame: number | undefined, multiplier: number) =>
  frame === undefined ? '—' : String(frame * multiplier);

function DodgeRow({
  profile,
  showPortraits,
  animations,
  cancelFlags,
  multiplier,
  scale,
  enhanced,
  expanded,
  toggleExpanded,
}: DodgeRowProps) {
  const [selectedId, setSelectedId] = useState(profile.variants[0].id);
  const action = animations.get(selectedId);
  if (!action) return null;

  const base = action.invincibility;
  const extra = enhanced ? action.enhancedInvincibility : null;
  const moveFrame = action.cancelFrames[MOVE_FLAG];
  const duration = base ? base[1] - base[0] : 0;
  const extraDuration = extra ? extra[1] - extra[0] : 0;
  const moveLabel = formatFrame(moveFrame, multiplier);
  const detailId = `dodge-detail-${profile.id}`;
  const percent = (frame: number) => `${(frame / scale) * 100}%`;

  return (
    <li className={styles.row}>
      <button
        type="button"
        className={styles.rowButton}
        aria-expanded={expanded}
        aria-controls={expanded ? detailId : undefined}
        onClick={toggleExpanded}
      >
        <span className={styles.action}>
          <strong>{profile.name}</strong>
          <span className={styles.characters}>
            {showPortraits ? (
              profile.characters.map((name) => <CharacterAvatar key={name} name={name} size={18} />)
            ) : (
              <>
                {profile.ability && <AbilityIcon {...profile.ability} size={20} />}
                <span>{profile.characters.join('、')}</span>
              </>
            )}
          </span>
        </span>
        <span className={styles.track} aria-hidden="true">
          {moveFrame !== undefined && <span className={styles.exposed} style={{ width: percent(moveFrame) }} />}
          {base && <span className={styles.base} style={{ left: percent(base[0]), width: percent(duration) }} />}
          {extra && (
            <span className={styles.extra} style={{ left: percent(extra[0]), width: percent(extraDuration) }} />
          )}
          {moveFrame !== undefined && <span className={styles.moveMark} style={{ left: percent(moveFrame) }} />}
        </span>
        <span className={styles.statistics}>
          <span className={styles.stat}>
            <span className={styles.mobileStatLabel}>无敌</span>
            <strong>{formatFrame(duration + extraDuration, multiplier)}</strong>
            {extraDuration > 0 && <span className={styles.bonus}>（+{extraDuration * multiplier}）</span>}
          </span>
          <span className={styles.stat}>
            <span className={styles.mobileStatLabel}>可移动</span>
            <strong>{moveLabel}</strong>
          </span>
        </span>
        <DownOutlined className={styles.chevron} aria-hidden="true" />
      </button>
      {expanded && (
        <div id={detailId} className={styles.details}>
          <div className={styles.detailHeader}>
            <div className={styles.variants} role="group" aria-label="方向或动作变体">
              {profile.variants.length > 1 ? (
                profile.variants.map(({ id, label }) => (
                  <Button
                    key={id}
                    size="small"
                    type={id === selectedId ? 'primary' : 'default'}
                    autoInsertSpace={false}
                    aria-pressed={id === selectedId}
                    onClick={() => setSelectedId(id)}
                  >
                    {label}
                  </Button>
                ))
              ) : (
                <span>{profile.variants[0].label}</span>
              )}
            </div>
            <code>{action.id}</code>
          </div>
          <dl className={styles.cancels}>
            {cancelFlags.map(({ id, cancelLabel }) => (
              <div key={id} className={styles.cancel}>
                <dt>
                  {cancelLabel} <span>{id}</span>
                </dt>
                <dd>{formatFrame(action.cancelFrames[id], multiplier)}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </li>
  );
}

export default function DodgeFramesComparison() {
  const data = DataManager.getInstance().getDodgeFrames();
  const [frameRate, setFrameRate] = useState<30 | 60>(60);
  const [view, setView] = useState<'common' | 'situational'>('common');
  const [enhanced, setEnhanced] = useState(false);
  const [expandedId, setExpandedId] = useState<string>();
  const [flagsOpen, setFlagsOpen] = useState(false);

  if (!data) return <p role="status">翻滚与闪避数据暂不可用。</p>;

  const animations = new Map(data.animations.map((animation) => [animation.id, animation]));
  const profiles = view === 'common' ? commonDodgeProfiles : situationalDodgeProfiles;
  const cancelFlags = data.flagTypes.filter((flag) => flag.cancelLabel);
  const multiplier = frameRate / data.sourceFrameRate;
  const ticks = Array.from({ length: SCALE_TICKS + 1 }, (_, index) => (index * frameRate) / SCALE_TICKS);

  return (
    <section className={styles.section} aria-labelledby="dodge-comparison-title">
      <header className={styles.header}>
        <h3 id="dodge-comparison-title">翻滚与闪避帧数</h3>
        <Button icon={<QuestionCircleOutlined />} onClick={() => setFlagsOpen(true)}>
          FlagType 释义
        </Button>
      </header>

      <div className={styles.toolbar}>
        <Segmented<'common' | 'situational'>
          aria-label="动作分类"
          value={view}
          onChange={setView}
          options={[
            { label: '常用动作', value: 'common' },
            { label: '情境动作', value: 'situational' },
          ]}
        />
        <div className={styles.settings}>
          <Segmented<30 | 60>
            aria-label="帧率"
            size="small"
            options={[...frameRateOptions]}
            value={frameRate}
            onChange={setFrameRate}
          />
          <div className={styles.enhancement}>
            <Switch aria-labelledby="dodge-enhanced-label" checked={enhanced} size="small" onChange={setEnhanced} />
            <span id="dodge-enhanced-label">强化闪避</span>
          </div>
        </div>
      </div>

      <div className={styles.comparison}>
        <div className={styles.legend}>
          <span>
            <i className={styles.baseKey} />
            基础无敌
          </span>
          {enhanced && (
            <span>
              <i className={styles.extraKey} />
              强化追加
            </span>
          )}
          <span>
            <i className={styles.exposedKey} />
            可移动前的非无敌区间
          </span>
        </div>
        <div className={styles.axisRow} aria-hidden="true">
          <span className={styles.axisTitle}>动作</span>
          <span className={styles.ticks}>
            {ticks.map((tick) => (
              <span key={tick}>{tick}</span>
            ))}
          </span>
          <span className={styles.statistics}>
            <span>无敌</span>
            <span>可移动</span>
          </span>
        </div>
        <ul className={styles.rows} aria-label="动作时间轴">
          {profiles.map((profile) => (
            <DodgeRow
              key={profile.id}
              profile={profile}
              showPortraits={view === 'common'}
              animations={animations}
              cancelFlags={cancelFlags}
              multiplier={multiplier}
              scale={data.sourceFrameRate}
              enhanced={enhanced}
              expanded={expandedId === profile.id}
              toggleExpanded={() => setExpandedId(expandedId === profile.id ? undefined : profile.id)}
            />
          ))}
        </ul>
      </div>

      <p className={styles.note}>
        展开动作查看方向、动作 ID 与取消帧。可移动时机以 Flag 11 为准，提前接其他动作可能会中断无敌和位移。
      </p>
      <p className={styles.source}>
        数据来源：
        <a href="https://www.bilibili.com/video/BV1LvuVzuEqo" target="_blank" rel="noreferrer">
          小辛《全角色回避翻滚动作，无敌帧分析对比》
        </a>
        ；并使用 Smithbox 解包 <code>c0000.anibnd.dcx</code>，通过{' '}
        <a href="https://github.com/Meowmaritus/DSAnimStudio" target="_blank" rel="noreferrer">
          DSAnimStudio
        </a>{' '}
        核对 TAE 动画参数。
      </p>

      <Modal title="FlagType 释义" open={flagsOpen} onCancel={() => setFlagsOpen(false)} footer={null} width={700}>
        <div className={styles.flagTableWrap} role="region" aria-label="FlagType 释义表格" tabIndex={0}>
          <table className={styles.flagTable} aria-label="FlagType 释义对照表">
            <thead>
              <tr>
                <th scope="col">FlagType</th>
                <th scope="col">事件名</th>
                <th scope="col">含义</th>
              </tr>
            </thead>
            <tbody>
              {data.flagTypes.map(({ id, name, meaning }) => (
                <tr key={id}>
                  <th scope="row">{id}</th>
                  <td>{name}</td>
                  <td>{meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>
    </section>
  );
}
