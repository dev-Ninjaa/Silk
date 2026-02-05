'use client';

import React from 'react';
import styles from './Tabs.module.css';

interface TabsProps {
    tabs: string[];
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabChange }) => {
    return (
        <div className={styles.container}>
            {tabs.map((tab) => {
                const isActive = tab === activeTab;
                return (
                    <button
                        key={tab}
                        onClick={() => onTabChange(tab)}
                        className={`${styles.tab} ${isActive ? styles.active : styles.inactive}`}
                        type="button"
                    >
                        {tab}
                    </button>
                );
            })}
        </div>
    );
};
