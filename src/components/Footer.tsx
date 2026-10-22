import React from 'react';
import { Typography, Space } from 'antd';
import { HeartOutlined, GithubOutlined } from '@ant-design/icons';
import { SITE_CONFIG } from '../config/siteConfig';

const { Text } = Typography;

// 格式化构建时间的函数
const formatBuildTime = (buildTime: string): string => {
  try {
    const date = new Date(buildTime);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    // 如果解析失败，返回原始字符串
    return buildTime;
  }
};

const Footer: React.FC = React.memo(() => {
  // 获取构建时间，如果不存在则使用当前时间
  const buildTime = typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : new Date().toISOString();
  const formattedBuildTime = formatBuildTime(buildTime);

  return (
    <div className="footer">
      <Space direction="vertical" size="small" align="center">
        <Text type="secondary" className="footer-text">
          <HeartOutlined style={{ marginRight: '4px', color: '#ff4d4f' }} />
          Created by{' '}
          <a href={SITE_CONFIG.original.authorUrl} target="_blank" rel="noopener noreferrer" className="footer-link">
            {SITE_CONFIG.original.author}
          </a>{' '}
          ｜ Modified by{' '}
          <a href={SITE_CONFIG.fork.url} target="_blank" rel="noopener noreferrer" className="footer-link">
            {SITE_CONFIG.fork.owner}
          </a>
        </Text>
        <Text type="secondary" className="footer-text">
          <GithubOutlined style={{ marginRight: '4px' }} />
          Based on{' '}
          <a href={SITE_CONFIG.original.repoUrl} target="_blank" rel="noopener noreferrer" className="footer-link">
            {SITE_CONFIG.original.repoName}
          </a>{' '}
          ·{' '}
          <a href={SITE_CONFIG.fork.issuesUrl} target="_blank" rel="noopener noreferrer" className="footer-link">
            Report an issue
          </a>
        </Text>
        <Text type="secondary" className="footer-text">
          © {new Date().getFullYear()} NightreignQuickRef · All Rights Reserved · Last updated: {formattedBuildTime}
        </Text>
      </Space>
    </div>
  );
});

export default Footer;
