import React from 'react';
import Giscus from '@giscus/react';
import { SITE_CONFIG } from '../config/siteConfig';

const GiscusComments: React.FC = () => {
    // 检测当前主题
    const isDarkMode = document.body.getAttribute('tomato-theme') === 'dark' ||
        document.documentElement.getAttribute('data-theme') === 'dark';
    const theme = isDarkMode ? 'dark_protanopia' : 'light_protanopia';

    return (
        <div style={{
            padding: '10px 20px'
        }}>
            <Giscus
                id="comments"
                repo={SITE_CONFIG.giscus.repo}
                repoId={SITE_CONFIG.giscus.repoId}
                category={SITE_CONFIG.giscus.category}
                categoryId={SITE_CONFIG.giscus.categoryId}
                mapping="pathname"
                strict="0"
                reactionsEnabled="1"
                emitMetadata="0"
                inputPosition="bottom"
                theme={theme}
                lang="zh-CN"
                loading="lazy"
            />
        </div>
    );
};

export default GiscusComments;
