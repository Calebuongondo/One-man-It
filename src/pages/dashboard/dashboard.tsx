import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import Text from '@/components/shared_ui/text';
import { useStore } from '@/hooks/useStore';
import { api_base } from '@/external/bot-skeleton';
import { localize } from '@deriv-com/translations';
import { useDevice } from '@deriv-com/ui';
import OnboardTourHandler from '../tutorials/dbot-tours/onboarding-tour';
import Announcements from './announcements';
import Cards from './cards';
import InfoPanel from './info-panel';

type TMobileIconGuide = {
    handleTabChange: (active_number: number) => void;
};

const DashboardComponent = observer(({ handleTabChange }: TMobileIconGuide) => {
    const [activePlaceholderTab, setActivePlaceholderTab] = useState('Dashboard');
    useEffect(() => {
        const handlePlaceholderTab = (event: Event) => {
            const tab = (event as CustomEvent<string>).detail;
            if (tab) setActivePlaceholderTab(tab);
        };
        window.addEventListener('novatrade:placeholder-tab', handlePlaceholderTab);
        return () => window.removeEventListener('novatrade:placeholder-tab', handlePlaceholderTab);
    }, []);
    const { load_modal, dashboard, client } = useStore();
    const { dashboard_strategies } = load_modal;
    const { active_tab, active_tour } = dashboard;
    const has_dashboard_strategies = !!dashboard_strategies?.length;
    const { isDesktop, isTablet } = useDevice();
    const [signalQuotes, setSignalQuotes] = useState<Record<string, number[]>>({});
    const [signalStatus, setSignalStatus] = useState('Connecting to Deriv market data…');
    const [showAiAssistant, setShowAiAssistant] = useState(false);

    const signalMarkets = [
        { symbol: 'R_75', name: 'Volatility 75 Index', group: 'Volatility' },
        { symbol: 'R_50', name: 'Volatility 50 Index', group: 'Volatility' },
        { symbol: 'R_25', name: 'Volatility 25 Index', group: 'Volatility' },
        { symbol: '1HZ75V', name: 'Volatility 75 (1s) Index', group: 'Volatility' },
        { symbol: 'BOOM500', name: 'Boom 500 Index', group: 'Boom & Crash' },
        { symbol: 'CRASH300', name: 'Crash 300 Index', group: 'Boom & Crash' },
        { symbol: 'stpRNG', name: 'Step Index', group: 'Other' },
    ];

    // Subscribe to public Deriv ticks through the application's existing socket.
    // This does not create another connection or submit trades.
    useEffect(() => {
        if (activePlaceholderTab !== 'Dashboard') return;
        let listener: { unsubscribe: () => void } | undefined;
        let retryTimer: ReturnType<typeof setTimeout> | undefined;
        let disposed = false;
        const subscriptionIds = new Set<string>();

        const connectToTicks = () => {
            const api = api_base.api;
            if (!api) {
                if (!disposed) retryTimer = setTimeout(connectToTicks, 1000);
                return;
            }

            setSignalStatus('Connected to Deriv · waiting for live ticks…');
            listener = api.onMessage().subscribe((event: any) => {
                let message = event?.data ?? event;
                if (typeof message === 'string') {
                    try { message = JSON.parse(message); } catch { return; }
                }
                if (message?.msg_type === 'tick' && message.tick?.symbol) {
                    const symbol = String(message.tick.symbol);
                    const quote = Number(message.tick.quote);
                    if (!Number.isFinite(quote)) return;
                    if (message.subscription?.id) subscriptionIds.add(String(message.subscription.id));
                    setSignalQuotes(previous => ({
                        ...previous,
                        [symbol]: [...(previous[symbol] || []), quote].slice(-20),
                    }));
                    setSignalStatus('Live market data received from Deriv');
                } else if (message?.error && message?.echo_req?.ticks) {
                    setSignalStatus('Deriv rejected one or more market subscriptions. Available markets will still appear.');
                }
            });

            signalMarkets.forEach(({ symbol }) => api.send({ ticks: symbol, subscribe: 1 }));
        };

        connectToTicks();
        return () => {
            disposed = true;
            if (retryTimer) clearTimeout(retryTimer);
            listener?.unsubscribe();
            subscriptionIds.forEach(id => api_base.api?.send({ forget: id }));
        };
    }, [activePlaceholderTab]);

    const liveSignalRows = signalMarkets.map(market => {
        const prices = signalQuotes[market.symbol] || [];
        if (prices.length < 2) return null;
        const first = prices[0];
        const latest = prices[prices.length - 1];
        const move = first ? ((latest - first) / first) * 100 : 0;
        return { ...market, latest, move, direction: move > 0 ? 'Rising' : move < 0 ? 'Falling' : 'Sideways' };
    }).filter(Boolean) as Array<{symbol:string;name:string;group:string;latest:number;move:number;direction:string}>;

    return (
        <React.Fragment>
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
            <section className='novatrade-live-signals' aria-label='Live trading signals'>
                <div className='novatrade-live-signals__heading'>
                    <div>
                        <h2><span className='novatrade-live-signals__dot' />Live Trading Signals</h2>
                        <p>Live market prices and short-term momentum calculated from Deriv ticks.</p>
                    </div>
                    <span className='novatrade-live-signals__status'>{signalStatus}</span>
                </div>
                {liveSignalRows.length ? (
                    <div className='novatrade-live-signals__grid'>
                        {liveSignalRows.map(signal => (
                            <article className='novatrade-live-signals__card' key={signal.symbol}>
                                <div className='novatrade-live-signals__card-top'><strong>{signal.name}</strong><span>{signal.group}</span></div>
                                <div className='novatrade-live-signals__quote'>{signal.latest.toLocaleString(undefined, { maximumFractionDigits: 5 })}</div>
                                <div className={`novatrade-live-signals__move novatrade-live-signals__move--${signal.move > 0 ? 'up' : signal.move < 0 ? 'down' : 'flat'}`}>
                                    {signal.direction} · {signal.move > 0 ? '+' : ''}{signal.move.toFixed(4)}%
                                </div>
                                <small>Based on recent ticks · not a guaranteed prediction</small>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className='novatrade-live-signals__empty'>
                        {signalStatus.includes('Connecting') ? 'Connecting to Deriv to load live prices…' : 'Waiting for live ticks. Signal cards appear when market data arrives.'}
                    </div>
                )}
            </section>
            <button className='novatrade-ai-fab' type='button' aria-label='Open AI assistant' onClick={() => setShowAiAssistant(value => !value)}>AI</button>
            {showAiAssistant && (
                <aside className='novatrade-ai-panel' role='dialog' aria-label='AI assistant'>
                    <button type='button' className='novatrade-ai-panel__close' onClick={() => setShowAiAssistant(false)} aria-label='Close AI assistant'>×</button>
                    <strong>OneMan Trade AI</strong>
                    <p>The assistant panel is ready for an AI service connection. Live market data and signal snapshots remain informational and do not place trades.</p>
                </aside>
            )}
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
