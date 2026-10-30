import React, { lazy, Suspense, useEffect, useState } from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import { useLocation, useNavigate } from 'react-router-dom';
import ChunkLoader from '@/components/loader/chunk-loader';
import { generateOAuthURL } from '@/components/shared';
import DesktopWrapper from '@/components/shared_ui/desktop-wrapper';
import Dialog from '@/components/shared_ui/dialog';
import MobileWrapper from '@/components/shared_ui/mobile-wrapper';
import Tabs from '@/components/shared_ui/tabs/tabs';
import TradeTypeConfirmationModal from '@/components/trade-type-confirmation-modal';
import TradingViewModal from '@/components/trading-view-chart/trading-view-modal';
import { DBOT_TABS, TAB_IDS } from '@/constants/bot-contents';
import { api_base, updateWorkspaceName } from '@/external/bot-skeleton';
import { CONNECTION_STATUS } from '@/external/bot-skeleton/services/api/observables/connection-status-stream';
import { isDbotRTL } from '@/external/bot-skeleton/utils/workspace';
import { useApiBase } from '@/hooks/useApiBase';
import { useStore } from '@/hooks/useStore';
import {
    disableUrlParameterApplication,
    enableUrlParameterApplication,
    setupTradeTypeChangeListener,
} from '@/utils/blockly-url-param-handler';
import {
    checkAndShowTradeTypeModal,
    getModalState,
    handleTradeTypeCancel,
    handleTradeTypeConfirm,
    resetUrlParamProcessing,
    setModalStateChangeCallback,
} from '@/utils/trade-type-modal-handler';
import {
    LabelPairedChartLineCaptionRegularIcon,
    LabelPairedObjectsColumnCaptionRegularIcon,
    LabelPairedPuzzlePieceTwoCaptionBoldIcon,
} from '@deriv/quill-icons/LabelPaired';
import { LegacyGuide1pxIcon } from '@deriv/quill-icons/Legacy';
import { Localize, localize } from '@deriv-com/translations';
import { useDevice } from '@deriv-com/ui';
import RunPanel from '../../components/run-panel';
import ChartModal from '../chart/chart-modal';
import Dashboard from '../dashboard';
import RunStrategy from '../dashboard/run-strategy';
import './main.scss';

const ChartWrapper = lazy(() => import('../chart/chart-wrapper'));
const Tutorial = lazy(() => import('../tutorials'));


type NovaTradeToolProps = { name: string };

const NovaTradeTool = ({ name }: NovaTradeToolProps) => {
    const [capital, setCapital] = useState('100');
    const [risk, setRisk] = useState('2');
    const [trades, setTrades] = useState('5');
    const [stake, setStake] = useState('1');
    const [target, setTarget] = useState('55');
    const [market, setMarket] = useState('Volatility 75 Index');
    const [notes, setNotes] = useState('');
    const [saved, setSaved] = useState(false);
    const [result, setResult] = useState('');
    const n = (v: string) => Number.isFinite(Number(v)) ? Number(v) : 0;
    const money = (v: number) => v.toLocaleString(undefined, { maximumFractionDigits: 2 });
    const panel: React.CSSProperties = { padding: '24px', color: 'var(--text-general)', maxWidth: 900, margin: '0 auto', width: '100%', boxSizing: 'border-box' };
    const fieldStyle: React.CSSProperties = { display: 'grid', gap: 6, minWidth: 0, color: 'var(--text-general)', fontSize: 14 };
    const inputStyle: React.CSSProperties = { width: '100%', boxSizing: 'border-box', minHeight: 44, border: '1px solid var(--border-normal)', borderRadius: 8, padding: '10px 12px', background: 'var(--general-section-1)', color: 'var(--text-prominent)', fontSize: 16 };
    const buttonStyle: React.CSSProperties = { minHeight: 44, padding: '10px 16px', border: 0, borderRadius: 8, background: '#c91f32', color: '#fff', fontWeight: 700, cursor: 'pointer' };
    const field = (label: string, value: string, onChange: (value: string) => void, type = 'number') => <label style={fieldStyle}>{label}<input style={inputStyle} type={type} value={value} onChange={event => onChange(event.target.value)} /></label>;
    const runTool = () => {
        setSaved(false);
        if (name === 'Risk Calculator') {
            const budget = Math.max(0, n(capital) * n(risk) / 100);
            setResult(`Risk budget: ${money(budget)} per trade. At ${money(n(stake))} stake, ${budget > 0 && n(stake) > 0 ? Math.floor(budget / n(stake)) : 0} stake units fit within that budget.`);
        } else if (name === 'Bulk Trader') {
            setResult(`Planned combined stake: ${money(Math.max(0, n(stake) * Math.floor(Math.max(0, n(trades)))))} across ${Math.floor(Math.max(0, n(trades)))} entries. This calculates a plan only; it does not submit orders.`);
        } else if (name === 'Dual Edge') {
            setResult(`Risk budget: ${money(Math.max(0, n(capital) * n(risk) / 100))}. Target amount at ${n(target)}%: ${money(Math.max(0, n(capital) * n(target) / 100))}. These are user-defined scenarios, not a prediction.`);
        } else if (name === 'Analysis Tool') {
            const winRate = Math.min(100, Math.max(0, n(target)));
            const expectancy = winRate / 100 * Math.max(0, n(stake)) - (1 - winRate / 100) * Math.max(0, n(risk));
            setResult(`Estimated expectancy: ${money(expectancy)} stake units per trade, using ${winRate}% win rate, average win ${money(n(stake))}, and average loss ${money(n(risk))}.`);
        } else if (name === 'Pro AI') {
            setResult(`Strategy checklist for ${market}: write entry and exit rules, set a maximum loss before entry, test the rules on a demo account, and never raise stake to recover losses. This is a checklist, not an AI prediction.`);
        } else if (name === 'Manual Trader') {
            setResult(`Trade plan for ${market}: stake ${money(n(stake))}; planning risk cap ${money(Math.max(0, n(capital) * n(risk) / 100))}. Review the broker's order controls before placing any live trade. This panel does not submit live orders.`);
        } else if (name === 'Trading Bots') {
            const plan = { name: notes.trim() || 'My bot plan', market, stake: n(stake), riskPercent: n(risk), createdAt: new Date().toISOString() };
            try {
                const old = JSON.parse(localStorage.getItem('novatrade-bot-plans') || '[]');
                localStorage.setItem('novatrade-bot-plans', JSON.stringify([plan, ...old].slice(0, 20)));
                setResult(`Saved “${plan.name}” on this device. Market: ${market}; stake: ${money(plan.stake)}; risk cap: ${plan.riskPercent}%.`);
                setSaved(true);
            } catch { setResult('Unable to save on this device. Check browser storage permissions.'); }
        } else if (name === 'Copy Trading') {
            setResult(`Copy-trading checklist: verify the provider's history, set a maximum loss of ${money(Math.max(0, n(capital) * n(risk) / 100))}, test on demo first, and never share account credentials. No external provider is connected here.`);
        } else if (name === 'TradingView') {
            setResult('Use the Charts tab for the integrated chart workspace. Select a market there, then return here to record notes about your analysis.');
        }
    };
    if (name === 'TradingView') {
        // Use Deriv's native SmartChart integration: it receives live symbols,
        // quotes and chart state from the authenticated Deriv API connection.
        return <div className='novatrade-tradingview-panel' aria-label='TradingView live Deriv chart'>
            <ChartWrapper show_digits_stats={false} />
        </div>;
    }
    const riskCalc = name === 'Risk Calculator';
    const bulk = name === 'Bulk Trader';
    const dual = name === 'Dual Edge';
    const analysis = name === 'Analysis Tool';
    return <section className={`novatrade-tool novatrade-tool--${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} style={panel} aria-label={name}>
        <h2 style={{ margin: '4px 0 8px', fontSize: 24, lineHeight: 1.25, color: 'var(--text-prominent)' }}>{name}</h2>
        <p style={{ margin: '0 0 20px', lineHeight: 1.6, color: 'var(--text-general)' }}>
            {name === 'Trading Bots' ? 'Create and save a bot plan for review.' : bulk ? 'Calculate the combined stake for a batch.' : name === 'Pro AI' ? 'Build a disciplined, rules-based trading checklist.' : dual ? 'Compare risk and target scenarios.' : analysis ? 'Estimate trade expectancy from your assumptions.' : name === 'Copy Trading' ? 'Review a copy-trading safety checklist.' : riskCalc ? 'Calculate a per-trade risk budget.' : name === 'Manual Trader' ? 'Prepare a plan; live orders remain in broker controls.' : 'Use market notes alongside the integrated Charts workspace.'}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: 14, marginBottom: 16 }}>
            <label style={fieldStyle}>Market<select style={inputStyle} value={market} onChange={event => setMarket(event.target.value)}><option>Volatility 75 Index</option><option>Volatility 100 Index</option><option>Volatility 50 Index</option><option>Step Index</option><option>EUR/USD</option><option>Gold</option></select></label>
            {field('Account capital (planning only)', capital, setCapital)}
            {field(analysis ? 'Win rate (%)' : 'Risk limit (%)', analysis ? target : risk, analysis ? setTarget : setRisk)}
            {field(analysis ? 'Average win (stake units)' : 'Stake per entry', stake, setStake)}
            {(bulk || dual) && field(bulk ? 'Number of entries' : 'Target (%)', bulk ? trades : target, bulk ? setTrades : setTarget)}
            {name === 'Trading Bots' && field('Plan name', notes, setNotes, 'text')}
            {analysis && field('Average loss (stake units)', risk, setRisk)}
        </div>
        <button type='button' style={buttonStyle} onClick={runTool}>{name === 'Trading Bots' ? 'Save bot plan' : bulk ? 'Calculate batch' : riskCalc ? 'Calculate risk' : analysis ? 'Calculate expectancy' : 'Generate plan'}</button>
        {result && <div role='status' style={{ marginTop: 18, padding: 16, border: '1px solid #c91f32', borderRadius: 12, background: 'var(--general-section-1)', color: 'var(--text-general)', lineHeight: 1.6 }}><strong>{saved ? 'Saved' : 'Result'}</strong><p style={{ margin: '8px 0 0' }}>{result}</p></div>}
        {name === 'Trading Bots' && <p style={{ fontSize: 12, lineHeight: 1.5, marginTop: 16, color: 'var(--text-less-prominent)' }}>Saved plans stay on this device and are not automatically executed.</p>}
    </section>;
};

const AppWrapper = observer(() => {
    const { connectionStatus } = useApiBase();
    const { dashboard, load_modal, run_panel, quick_strategy, summary_card, blockly_store } = useStore();
    const { is_loading } = blockly_store;
    const {
        active_tab,
        active_tour,
        is_chart_modal_visible,
        is_trading_view_modal_visible,
        setActiveTab,
        setWebSocketState,
        setActiveTour,
        setTourDialogVisibility,
    } = dashboard;
    const { dashboard_strategies } = load_modal;
    const {
        is_dialog_open,
        is_drawer_open,
        dialog_options,
        onCancelButtonClick,
        onCloseDialog,
        onOkButtonClick,
        stopBot,
    } = run_panel;
    const { is_open } = quick_strategy;
    const { cancel_button_text, ok_button_text, title, message, dismissable, is_closed_on_cancel } = dialog_options as {
        [key: string]: string;
    };
    const { clear } = summary_card;
    const { DASHBOARD, BOT_BUILDER } = DBOT_TABS;
    const init_render = React.useRef(true);
    const hash = ['dashboard', 'bot_builder', 'chart', 'tutorial'];
    const { isDesktop } = useDevice();
    const location = useLocation();
    const navigate = useNavigate();
    const [left_tab_shadow, setLeftTabShadow] = useState<boolean>(false);
    const [right_tab_shadow, setRightTabShadow] = useState<boolean>(false);

    // Trade type modal state
    const [tradeTypeModalState, setTradeTypeModalState] = useState(getModalState());

    /**
     * Helper function to get modal props with enhanced type safety and clear documentation
     *
     * Props serve distinct purposes:
     * - current_trade_type: Technical identifier for API/internal use (format: "category/type")
     * - current_trade_type_display_name: Human-readable name for UI display
     *
     * This separation ensures proper data flow between technical systems and user interface
     */
    const getTradeTypeModalProps = () => {
        const { tradeTypeData } = tradeTypeModalState;

        return {
            is_visible: tradeTypeModalState.isVisible,
            trade_type_display_name: tradeTypeData?.displayName || '',

            // Technical identifier for internal/API use (e.g., "callput/callput")
            // Used by backend systems and technical integrations
            current_trade_type: tradeTypeData?.currentTradeType
                ? `${tradeTypeData.currentTradeType.tradeTypeCategory}/${tradeTypeData.currentTradeType.tradeType}`
                : 'N/A',

            // Human-readable display name for UI (e.g., "Rise/Fall")
            // Used for user-facing text and modal content
            current_trade_type_display_name: tradeTypeData?.currentTradeTypeDisplayName || 'N/A',

            onConfirm: handleTradeTypeConfirm,
            onCancel: handleTradeTypeCancel,
        };
    };

    let tab_value: number | string = active_tab;
    const GetHashedValue = (tab: number) => {
        tab_value = location.hash?.split('#')[1];
        if (!tab_value) return tab;
        return Number(hash.indexOf(String(tab_value)));
    };
    const active_hash_tab = GetHashedValue(active_tab);

    // Set up modal state change listener
    React.useEffect(() => {
        setModalStateChangeCallback(new_state => {
            setTradeTypeModalState(new_state);
        });
    }, [is_loading]);

    // Reset URL parameter processing when location changes
    React.useEffect(() => {
        resetUrlParamProcessing();
    }, [location.search]);

    React.useEffect(() => {
        const el_dashboard = document.getElementById('id-dbot-dashboard');
        const el_tutorial = document.getElementById('id-tutorials');

        const observer_dashboard = new window.IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setLeftTabShadow(false);
                    return;
                }
                setLeftTabShadow(true);
            },
            {
                root: null,
                threshold: 0.5, // set offset 0.1 means trigger if atleast 10% of element in viewport
            }
        );

        const observer_tutorial = new window.IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setRightTabShadow(false);
                    return;
                }
                setRightTabShadow(true);
            },
            {
                root: null,
                threshold: 0.5, // set offset 0.1 means trigger if atleast 10% of element in viewport
            }
        );
        observer_dashboard.observe(el_dashboard);
        observer_tutorial.observe(el_tutorial);
    });

    React.useEffect(() => {
        if (connectionStatus !== CONNECTION_STATUS.OPENED) {
            const is_bot_running = document.getElementById('db-animation__stop-button') !== null;
            if (is_bot_running) {
                clear();
                stopBot();
                api_base.setIsRunning(false);
                setWebSocketState(false);
            }
        }
    }, [clear, connectionStatus, setWebSocketState, stopBot]);

    // Update tab shadows height to match bot builder height
    const updateTabShadowsHeight = () => {
        const botBuilderEl = document.getElementById('id-bot-builder');
        const leftShadow = document.querySelector('.tabs-shadow--left') as HTMLElement;
        const rightShadow = document.querySelector('.tabs-shadow--right') as HTMLElement;

        if (botBuilderEl && leftShadow && rightShadow) {
            const height = botBuilderEl.offsetHeight;
            leftShadow.style.height = `${height}px`;
            rightShadow.style.height = `${height}px`;
        }
    };

    React.useEffect(() => {
        let pollTimeoutId: ReturnType<typeof setTimeout> | null = null;

        // Handle URL trade type parameters when switching to Bot Builder tab
        if (active_tab === BOT_BUILDER) {
            // Use requestAnimationFrame to ensure Blockly workspace is fully initialized
            requestAnimationFrame(() => {
                // Disable automatic URL parameter application to prevent changes before modal
                disableUrlParameterApplication();

                // Set up listener for manual trade type changes (only once)
                setupTradeTypeChangeListener();

                // Create unified handler for both immediate and delayed execution
                const handleTradeTypeModal = () => {
                    checkAndShowTradeTypeModal(
                        // onConfirm: Changes are now handled by the modal component
                        () => {
                            // Re-enable URL parameter application for future parameters
                            enableUrlParameterApplication();
                        },
                        // onCancel: URL parameter removal is now handled by the modal component
                        () => {}
                    );
                };

                // Wait for Blockly to finish loading before checking for URL parameters
                if (!blockly_store.is_loading) {
                    // Blockly is loaded, but add longer delay to ensure workspace is fully initialized
                    // and trade type fields are populated
                    setTimeout(() => {
                        handleTradeTypeModal();
                    }, 500);
                } else {
                    // Blockly is still loading, wait for it to finish with optimized polling
                    let pollAttempts = 0;
                    const maxPollAttempts = 10; // Maximum 5 seconds (10 * 500ms) - optimized performance

                    const checkBlocklyLoaded = () => {
                        if (!blockly_store.is_loading) {
                            handleTradeTypeModal();
                            return; // Exit polling once loaded
                        }

                        if (pollAttempts < maxPollAttempts) {
                            pollAttempts++;
                            // Use 500ms intervals for better performance (5x improvement from 100ms)
                            pollTimeoutId = setTimeout(checkBlocklyLoaded, 500);
                        } else {
                            console.warn(
                                'Blockly loading timeout after 5 seconds - proceeding without URL parameter check'
                            );
                        }
                    };

                    checkBlocklyLoaded();
                }
            });
        }

        // Cleanup function to prevent memory leaks
        return () => {
            if (pollTimeoutId) {
                clearTimeout(pollTimeoutId);
                pollTimeoutId = null;
            }
        };
    }, [active_tab, is_loading]);

    React.useEffect(() => {
        // Run on mount and when active tab changes
        updateTabShadowsHeight();

        if (is_open) {
            setTourDialogVisibility(false);
        }
        if (init_render.current) {
            setActiveTab(Number(active_hash_tab));
            if (!isDesktop) handleTabChange(Number(active_hash_tab));
            init_render.current = false;
        } else {
            // Preserve URL parameters when navigating
            const currentSearch = window.location.search;
            navigate(`${currentSearch}#${hash[active_tab] || hash[0]}`);
        }
        if (active_tour !== '') {
            setActiveTour('');
        }

        // Prevent scrolling when tutorial tab is active (only on mobile)
        const mainElement = document.querySelector('.main__container');
        if (active_tab === DBOT_TABS.TUTORIAL && !isDesktop) {
            document.body.style.overflow = 'hidden';
            if (mainElement instanceof HTMLElement) {
                mainElement.classList.add('no-scroll');
            }
        } else {
            document.body.style.overflow = '';
            if (mainElement instanceof HTMLElement) {
                mainElement.classList.remove('no-scroll');
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active_tab]);

    React.useEffect(() => {
        const trashcan_init_id = setTimeout(() => {
            if (active_tab === BOT_BUILDER && Blockly?.derivWorkspace?.trashcan) {
                const trashcanY = window.innerHeight - 250;
                let trashcanX;
                if (is_drawer_open) {
                    trashcanX = isDbotRTL() ? 380 : window.innerWidth - 460;
                } else {
                    trashcanX = isDbotRTL() ? 20 : window.innerWidth - 100;
                }
                Blockly?.derivWorkspace?.trashcan?.setTrashcanPosition(trashcanX, trashcanY);
            }
        }, 100);

        return () => {
            clearTimeout(trashcan_init_id); // Clear the timeout on unmount
        };
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active_tab, is_drawer_open]);

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (dashboard_strategies.length > 0) {
            // Needed to pass this to the Callback Queue as on tab changes
            // document title getting override by 'Bot | Deriv' only
            timer = setTimeout(() => {
                updateWorkspaceName();
            });
        }
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [dashboard_strategies, active_tab]);

    const handleTabChange = React.useCallback(
        (tab_index: number) => {
            setActiveTab(tab_index);
            const el_id = TAB_IDS[tab_index];
            if (el_id) {
                const el_tab = document.getElementById(el_id);
                setTimeout(() => {
                    el_tab?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                }, 10);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [active_tab]
    );

    // [AI]
    const handleLoginGeneration = async () => {
        const oauthUrl = await generateOAuthURL();
        if (oauthUrl) {
            window.location.replace(oauthUrl);
        } else {
            console.error('Failed to generate OAuth URL');
        }
    };
    // [/AI]
    return (
        <React.Fragment>
            <div className='main'>
                <div
                    className={classNames('main__container', {
                        'main__container--active': active_tour && active_tab === DASHBOARD && !isDesktop,
                    })}
                >
                    <div>
                        
                        <Tabs active_index={active_tab} className='main__tabs' onTabItemClick={handleTabChange} is_scrollable top>
                            <div
                                label={
                                    <>
                                        <LabelPairedObjectsColumnCaptionRegularIcon
                                            height='24px'
                                            width='24px'
                                            fill='var(--text-general)'
                                        />
                                        <Localize i18n_default_text='Dashboard' />
                                    </>
                                }
                                id='id-dbot-dashboard'
                            >
                                <Dashboard handleTabChange={handleTabChange} />
                            </div>
                            <div
                                label={
                                    <>
                                        <LabelPairedPuzzlePieceTwoCaptionBoldIcon
                                            height='24px'
                                            width='24px'
                                            fill='var(--text-general)'
                                        />
                                        <Localize i18n_default_text='Bot Builder' />
                                    </>
                                }
                                id='id-bot-builder'
                            />
                            <div
                                label={
                                    <>
                                        <LabelPairedChartLineCaptionRegularIcon
                                            height='24px'
                                            width='24px'
                                            fill='var(--text-general)'
                                        />
                                        <Localize i18n_default_text='Charts' />
                                    </>
                                }
                                id={
                                    is_chart_modal_visible || is_trading_view_modal_visible
                                        ? 'id-charts--disabled'
                                        : 'id-charts'
                                }
                            >
                                <Suspense
                                    fallback={<ChunkLoader message={localize('Please wait, loading chart...')} />}
                                >
                                    <ChartWrapper show_digits_stats={false} />
                                </Suspense>
                            </div>
                            <div
                                label={
                                    <>
                                        <LegacyGuide1pxIcon
                                            height='16px'
                                            width='16px'
                                            fill='var(--text-general)'
                                            className='icon-general-fill-g-path'
                                        />
                                        <Localize i18n_default_text='Tutorials' />
                                    </>
                                }
                                id='id-tutorials'
                            >
                                <div className='tutorials-wrapper'>
                                    <Suspense
                                        fallback={
                                            <ChunkLoader message={localize('Please wait, loading tutorials...')} />
                                        }
                                    >
                                        <Tutorial handleTabChange={handleTabChange} />
                                    </Suspense>
                                </div>
                            </div>
                            <div
                                label={
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                        <span aria-hidden='true' style={{ fontSize: 20 }}>{'▣'}</span>
                                        <span>{'Trading Bots'}</span>
                                    </span>
                                }
                                id='id-novatrade-trading-bots'
                            >
                                <NovaTradeTool name='Trading Bots' />
                            </div>
                            <div
                                label={
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                        <span aria-hidden='true' style={{ fontSize: 20 }}>{'⇄'}</span>
                                        <span>{'Bulk Trader'}</span>
                                    </span>
                                }
                                id='id-novatrade-bulk-trader'
                            >
                                <NovaTradeTool name='Bulk Trader' />
                            </div>
                            <div
                                label={
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                        <span aria-hidden='true' style={{ fontSize: 20 }}>{'✧'}</span>
                                        <span>{'Pro AI'}</span>
                                    </span>
                                }
                                id='id-novatrade-pro-ai'
                            >
                                <NovaTradeTool name='Pro AI' />
                            </div>
                            <div
                                label={
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                        <span aria-hidden='true' style={{ fontSize: 20 }}>{'⟳'}</span>
                                        <span>{'Dual Edge'}</span>
                                    </span>
                                }
                                id='id-novatrade-dual-edge'
                            >
                                <NovaTradeTool name='Dual Edge' />
                            </div>
                            <div
                                label={
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                        <span aria-hidden='true' style={{ fontSize: 20 }}>{'⌕'}</span>
                                        <span>{'Analysis Tool'}</span>
                                    </span>
                                }
                                id='id-novatrade-analysis-tool'
                            >
                                <NovaTradeTool name='Analysis Tool' />
                            </div>
                            <div
                                label={
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                        <span aria-hidden='true' style={{ fontSize: 20 }}>{'▤'}</span>
                                        <span>{'Copy Trading'}</span>
                                    </span>
                                }
                                id='id-novatrade-copy-trading'
                            >
                                <NovaTradeTool name='Copy Trading' />
                            </div>
                            <div
                                label={
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                        <span aria-hidden='true' style={{ fontSize: 20 }}>{'▦'}</span>
                                        <span>{'Risk Calculator'}</span>
                                    </span>
                                }
                                id='id-novatrade-risk-calculator'
                            >
                                <NovaTradeTool name='Risk Calculator' />
                            </div>
                            <div
                                label={
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                        <span aria-hidden='true' style={{ fontSize: 20 }}>{'✎'}</span>
                                        <span>{'Manual Trader'}</span>
                                    </span>
                                }
                                id='id-novatrade-manual-trader'
                            >
                                <NovaTradeTool name='Manual Trader' />
                            </div>
                            <div
                                label={
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                        <span aria-hidden='true' style={{ fontSize: 20 }}>{'♧'}</span>
                                        <span>{'TradingView'}</span>
                                    </span>
                                }
                                id='id-novatrade-trading-view'
                            >
                                <NovaTradeTool name='TradingView' />
                            </div>
                        </Tabs>
                        
                    </div>
                </div>
            </div>
            <DesktopWrapper>
                <div className='main__run-strategy-wrapper'>
                    <RunStrategy />
                    <RunPanel />
                </div>
                <ChartModal />
                <TradingViewModal />
            </DesktopWrapper>
            <MobileWrapper>{!is_open && <RunPanel />}</MobileWrapper>
            <Dialog
                cancel_button_text={cancel_button_text || localize('Cancel')}
                className='dc-dialog__wrapper--fixed'
                confirm_button_text={ok_button_text || localize('Ok')}
                has_close_icon
                is_mobile_full_width={false}
                is_visible={is_dialog_open}
                onCancel={onCancelButtonClick}
                onClose={onCloseDialog}
                onConfirm={onOkButtonClick || onCloseDialog}
                portal_element_id='modal_root'
                title={title}
                login={handleLoginGeneration}
                dismissable={dismissable} // Prevents closing on outside clicks
                is_closed_on_cancel={is_closed_on_cancel}
            >
                {message}
            </Dialog>

            {/* Trade Type Confirmation Modal */}
            {(() => {
                const modalProps = getTradeTypeModalProps();
                return (
                    <TradeTypeConfirmationModal
                        is_visible={modalProps.is_visible}
                        trade_type_display_name={modalProps.trade_type_display_name}
                        current_trade_type={modalProps.current_trade_type}
                        current_trade_type_display_name={modalProps.current_trade_type_display_name}
                        onConfirm={modalProps.onConfirm}
                        onCancel={modalProps.onCancel}
                    />
                );
            })()}
        </React.Fragment>
    );
});

export default AppWrapper;
