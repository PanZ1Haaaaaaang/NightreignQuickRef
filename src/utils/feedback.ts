// antd v6 起静态 message/notification 会丢失主题上下文，需通过 App.useApp() 获取实例。
// 这里做一个可注入的门面：React 侧在 App 挂载时注入实例，纯 TS 模块（如 dataManager）直接调用。

type MessageFn = (content: string) => void;

export interface MessageApiLike {
  success: MessageFn;
  error: MessageFn;
  warning: MessageFn;
  info: MessageFn;
}

let current: MessageApiLike | null = null;

export const setMessageApi = (api: MessageApiLike) => {
  current = api;
};

const fallback = (level: string, content: string) => {
  // 未挂载时（极早期）退化为控制台输出，避免静默丢失
  if (level === 'error') console.error('[message]', content);
  else console.warn('[message]', content);
};

export const message: MessageApiLike = {
  success: (content) => (current ? current.success(content) : fallback('success', content)),
  error: (content) => (current ? current.error(content) : fallback('error', content)),
  warning: (content) => (current ? current.warning(content) : fallback('warning', content)),
  info: (content) => (current ? current.info(content) : fallback('info', content)),
};
