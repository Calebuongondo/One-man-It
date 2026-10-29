import React, { useState } from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import Text from '@/components/shared_ui/text';
import { useStore } from '@/hooks/useStore';
import { localize } from '@deriv-com/translations';
import { useDevice } from '@deriv-com/ui';
import OnboardTourHandler from '../tutorials/dbot-tours/onboarding-tour';
import Announcements from './announcements';
import Cards from './cards';
import InfoPanel from './info-panel';

type TMobileIconGuide = {
    handleTabChange: (active_number: number) => void;
};

const PLACEHOLDER_TABS = [
    { label: 'Dashboard', icon: '⌂' },
    { label: 'Bot Builder', icon: '⚙' },
    { label: 'Trading Bots', icon: '▣' },
    { label: 'Bulk Trader', icon: '⇄' },
    { label: 'Pro AI', icon: '✧' },
    { label: 'Dual Edge', icon: '⟳' },
    { label: 'Analysis Tool', icon: '⌕' },
    { label: 'Copy Trading', icon: '▤' },
    { label: 'Charts', icon: '⌁' },
    { label: 'Risk Calculator', icon: '▦' },
    { label: 'Manual Trader', icon: '✎' },
    { label: 'TradingView', icon: '♧' },
];

const DashboardComponent = observer(({ handleTabChange }: TMobileIconGuide) => {
    const [activePlaceholderTab, setActivePlaceholderTab] = useState('Dashboard');
    const { load_modal, dashboard, client } = useStore();
    const { dashboard_strategies } = load_modal;
    const { active_tab, active_tour } = dashboard;
    const has_dashboard_strategies = !!dashboard_strategies?.length;
    const { isDesktop, isTablet } = useDevice();

    return (
        <React.Fragment>
            <nav aria-label='OneMan Trade placeholder tabs' style={{ display: 'flex', flexFlow: 'row nowrap', alignItems: 'center', gap: 0, overflowX: 'auto', whiteSpace: 'nowrap', background: '#071c2b', borderBottom: '1px solid #254254', margin: '0 0 16px', minHeight: 48, scrollbarWidth: 'thin' }}>
                {PLACEHOLDER_TABS.map(tab => (
                    <button
                        key={tab.label}
                        type='button'
                        onClick={() => setActivePlaceholderTab(tab.label)}
                        aria-current={activePlaceholderTab === tab.label ? 'page' : undefined}
                        style={{ display: 'inline-flex', flex: '0 0 auto', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '12px 13px', minHeight: 48, border: 0, borderRight: '1px solid #254254', background: activePlaceholderTab === tab.label ? '#19457d' : 'transparent', color: '#f4f7fb', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                        <span aria-hidden='true' style={{ display: 'inline-block', fontSize: 17, lineHeight: 1, color: '#38b9f2' }}>{tab.icon}</span>
                        <span>{tab.label}</span>
                    </button>
                ))}
            </nav>
            {activePlaceholderTab === 'Dashboard' ? <>
            <div
                className={classNames('tab__dashboard', {
                    'tab__dashboard--tour-active': active_tour,
                })}
            >
                <div className='tab__dashboard__content'>
                    {client.is_logged_in && (
                        <Announcements is_mobile={!isDesktop} is_tablet={isTablet} handleTabChange={handleTabChange} />
                    )}
                    <div className='quick-panel'>
                        <div
                            className={classNames('tab__dashboard__header', {
                                'tab__dashboard__header--listed': isDesktop && has_dashboard_strategies,
                            })}
                        >
                            {!has_dashboard_strategies && (
                                <Text
                                    className='title'
                                    as='h2'
                                    color='prominent'
                                    size={isDesktop ? 'sm' : 's'}
                                    lineHeight='xxl'
                                    weight='bold'
                                >
                                    {localize('Load or build your bot')}
                                </Text>
                            )}
                            <Text
                                as='p'
                                color='prominent'
                                lineHeight='s'
                                size={isDesktop ? 's' : 'xxs'}
                                className={classNames('subtitle', { 'subtitle__has-list': has_dashboard_strategies })}
                            >
                                {localize(
                                    'Import a bot from your computer or Google Drive, build it from scratch, or start with a quick strategy.'
                                )}
                            </Text>
                        </div>
                        <Cards has_dashboard_strategies={has_dashboard_strategies} is_mobile={!isDesktop} />
                    </div>
                </div>
            </div>
            <InfoPanel />
            {active_tab === 0 && <OnboardTourHandler is_mobile={!isDesktop} />}
            </> : (
                <section role='status' style={{ margin: '16px', padding: '24px', border: '1px solid #d7dce0', borderRadius: 8, color: 'var(--text-general, #333)', background: 'var(--general-section-1, #fff)' }}>
                    <h2 style={{ marginTop: 0 }}>{activePlaceholderTab}</h2>
                    <p style={{ marginBottom: 0 }}>This tab is a placeholder for now. Its features will be added later.</p>
                </section>
            )}
        </React.Fragment>
    );
});

export default DashboardComponent;
