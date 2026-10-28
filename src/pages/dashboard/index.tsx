import { observer } from 'mobx-react-lite';
import { useMemo, useState } from 'react';
import { useStore } from '../../hooks/useStore';

const NAV_ITEMS = [
    { label: 'Dashboard', icon: '⌂' },
    { label: 'Bot Builder', icon: '⚙' },
    { label: 'Trading Bots', icon: '▣' },
    { label: 'Bulk Trader', icon: '⌁' },
    { label: 'Pro AI', icon: '✧' },
    { label: 'Dual Edge', icon: '⟳' },
    { label: 'Analysis Tool', icon: '⌕' },
    { label: 'Copy Trading', icon: '▤' },
    { label: 'Charts', icon: '⌁' },
    { label: 'Risk Calculator', icon: '▦' },
    { label: 'Manual Trader', icon: '▣' },
    { label: 'TradingView', icon: '♧' },
];

const QUICK_LINKS = [
    { label: 'Load Bot', icon: '▣', tone: 'blue', detail: 'Open a saved bot in the existing bot builder.' },
    { label: 'Premium Bots', icon: '✣', tone: 'gold', detail: 'Browse premium bot strategies available to your account.' },
    { label: 'Free Bots', icon: '✣', tone: 'teal', detail: 'Browse free bot strategies available to your account.' },
    { label: 'Analysis Tool', icon: '▦', tone: 'violet', detail: 'Open analysis tools and market research.' },
];

const SIGNALS = [
    { rank: 1, market: 'Volatility 75 (1s) Index', contract: 'Under 5', confidence: 54, tag: 'Volatility' },
    { rank: 2, market: 'Volatility 50 Index', contract: 'Over 3', confidence: 68, tag: 'Volatility' },
    { rank: 3, market: 'Boom 500 Index', contract: 'Rise', confidence: 61, tag: 'Boom & Crash' },
    { rank: 4, market: 'Crash  crash 300 Index', contract: 'Fall', confidence: 57, tag: 'Boom & Crash' },
    { rank: 5, market: 'Volatility 25 Index', contract: 'Under 4', confidence: 72, tag: 'Volatility' },
    { rank: 6, market: 'Step Index', contract: 'Over 2', confidence: 63, tag: 'Other' },
];

const Dashboard = observer(() => {
    const { ui } = useStore();
    const { isAuthorized } = ui;
    const [activeTab, setActiveTab] = useState('Dashboard');
    const [category, setCategory] = useState('All');
    const [search, setSearch] = useState('');
    const [notice, setNotice] = useState('');
    const [showDisclaimer, setShowDisclaimer] = useState(false);

    const filteredSignals = useMemo(
        () => SIGNALS.filter(signal =>
            (category === 'All' || signal.tag === category) &&
            signal.market.toLowerCase().includes(search.toLowerCase())
        ),
        [category, search]
    );

    const openTab = (label: string) => {
        setActiveTab(label);
        setNotice(label === 'Dashboard' ? '' : label + ' selected. Connect or open the corresponding tool to use its full features.');
    };

    return (
        <div className='ot-dashboard'>
            <style>{`
                .ot-dashboard{min-height:100vh;background:#0b0d0e;color:#f4f7fa;font-family:inherit;padding:0 0 34px;box-sizing:border-box}
                .ot-dashboard *{box-sizing:border-box}
                .ot-accountbar{display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:14px 18px;background:#e9fff7;color:#078f85;border-bottom:1px solid #d2f4e8}
                .ot-brandmark{font-weight:900;color:#092d40;background:#d5e9f4;border-radius:6px;padding:7px 10px;font-size:13px}
                .ot-balance{font-size:18px;font-weight:800;margin-left:auto;white-space:nowrap}
                .ot-action{border:0;border-radius:22px;padding:9px 18px;background:#8437e9;color:white;font-weight:700;cursor:pointer}
                .ot-ticker{background:#bd2028;color:#fff;padding:8px 14px;font-size:12px;font-weight:800;letter-spacing:.3px;overflow:hidden;white-space:nowrap}
                .ot-nav{display:flex;gap:0;overflow-x:auto;background:#061a28;border-bottom:1px solid #17374a;scrollbar-width:thin}
                .ot-nav button{flex:0 0 auto;min-height:58px;padding:12px 18px;border:0;border-right:1px solid #152c3a;background:transparent;color:#f4f7fb;font-weight:800;font-size:14px;display:flex;align-items:center;gap:11px;cursor:pointer}
                .ot-nav button span{font-size:24px;color:#38b9f2}
                .ot-nav button.active{background:#19457d}
                .ot-content{width:min(100%,1000px);margin:0 auto;padding:24px 18px}
                .ot-search{display:flex;min-height:54px;border:1px solid #333b3e;border-radius:10px;overflow:hidden;margin-bottom:30px;background:#111415}
                .ot-search select,.ot-search input{background:transparent;color:#eaf0f3;border:0;padding:0 16px;min-width:0;font:inherit}
                .ot-search select{width:118px;border-right:1px solid #333b3e}
                .ot-search input{flex:1}
                .ot-search button{width:66px;background:#174780;border:0;color:white;font-size:23px;cursor:pointer}
                .ot-shortcuts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;max-width:490px;margin:0 auto 34px}
                .ot-shortcut{position:relative;display:flex;align-items:center;gap:12px;min-height:86px;padding:13px 14px;background:#f6f7f8;color:#14202b;border:1px solid #d5dbe0;border-radius:14px;text-align:left;font-weight:800;font-size:15px;cursor:pointer;box-shadow:0 2px 0 #cbd1d6;overflow:hidden}
                .ot-shortcut:before{content:'';position:absolute;left:0;top:0;bottom:0;width:5px;background:var(--tone)}
                .ot-shortcut .ot-short-icon{display:grid;place-items:center;width:50px;height:50px;flex:0 0 50px;border-radius:12px;background:color-mix(in srgb,var(--tone) 15%,white);color:#12556c;font-size:25px}
                .ot-blue{--tone:#23518e}.ot-gold{--tone:#dba400}.ot-teal{--tone:#139d8e}.ot-violet{--tone:#8062ee}
                .ot-panel{border:1px solid #213b3b;border-radius:20px;padding:22px 18px;background:radial-gradient(ellipse at 100% 0%,#142624 0%,#101718 42%,#0e1112 100%);box-shadow:0 0 0 1px #121c1c}
                .ot-panel-head{display:flex;align-items:center;gap:10px;margin-bottom:6px}
                .ot-live-dot{width:14px;height:14px;background:#10b6aa;border-radius:50%;box-shadow:0 0 0 7px #10b6aa26;flex:0 0 auto}
                .ot-panel h2{font-size:clamp(22px,4vw,30px);margin:0;letter-spacing:-.8px}
                .ot-muted{color:#8b949a;margin:12px 0 22px}
                .ot-signal{border:1px solid #51282d;border-radius:24px;padding:20px;margin:14px 0;background:#0d0f10;box-shadow:inset 0 0 0 1px #1c1516}
                .ot-signal-top{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:16px}
                .ot-rank{color:#e7b526;font-weight:900}
                .ot-contract{color:#12b9b0;border:1px solid #245b5a;background:#102524;border-radius:20px;padding:6px 12px;font-weight:800;font-size:13px}
                .ot-signal h3{font-size:18px;margin:0 0 18px;overflow-wrap:anywhere}
                .ot-meter{height:7px;background:#26302f;border-radius:8px;overflow:hidden;margin-top:10px}
                .ot-meter span{display:block;height:100%;background:linear-gradient(90deg,#0ba99b,#52d59b);border-radius:8px}
                .ot-signal-foot{display:flex;justify-content:space-between;color:#9ca6a9;font-size:12px;gap:8px}
                .ot-disclaimer{background:#ffdc00;color:#171717;border:0;border-radius:7px;padding:10px 13px;font-weight:900;cursor:pointer;margin:12px 0}
                .ot-notice{background:#102b30;border:1px solid #24545a;color:#c4f7f0;border-radius:12px;padding:14px;margin:0 0 18px;font-size:14px;line-height:1.5}
                .ot-section-title{font-size:24px;margin:0 0 8px}.ot-empty{border:1px solid #263638;border-radius:16px;padding:24px;background:#111718;color:#c5cece;line-height:1.6}
                .ot-bottom{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-top:22px;padding:14px;background:#101516;border:1px solid #202a2c;border-radius:14px}
                .ot-run{background:#087d75;color:white;border:0;border-radius:8px;padding:13px 20px;font-weight:900;cursor:pointer}
                .ot-ai{position:fixed;right:18px;bottom:22px;width:62px;height:62px;border-radius:50%;border:3px solid #9877fa;background:radial-gradient(circle,#c56bdf,#6332a5);color:white;font-size:19px;font-weight:900;box-shadow:0 0 0 7px #704dd455,0 0 0 12px #704dd422;z-index:10;cursor:pointer}
                @media(min-width:720px){.ot-content{padding:30px 26px}.ot-accountbar{padding:16px 28px}.ot-shortcuts{margin-bottom:38px}.ot-panel{padding:28px 30px}.ot-signal{padding:22px 26px}}
                @media(max-width:380px){.ot-content{padding:18px 12px}.ot-shortcuts{gap:9px}.ot-shortcut{font-size:13px;padding:10px;gap:8px;min-height:78px}.ot-shortcut .ot-short-icon{width:40px;height:40px;flex-basis:40px}.ot-search select{width:84px;padding:0 8px}.ot-search input{padding:0 10px}.ot-nav button{padding:11px 13px}}
            `}</style>

            <header className='ot-accountbar'>
                <span aria-hidden='true' style={{ fontSize: 24, color: '#94a4a3' }}>☰</span>
                <span className='ot-brandmark'>ONEMAN <span style={{ color: '#1a8b9b' }}>TRADE</span></span>
                <button className='ot-action' onClick={() => setNotice('Deposit: open your account funding options to continue. No payment has been initiated.')}>Deposit</button>
                <button className='ot-action' onClick={() => setNotice('Withdraw: review your available balance and withdrawal options in your account.')}>Withdraw</button>
                <div className='ot-balance'>◎ <span style={{ color: '#078f85' }}>Account</span></div>
                <span style={{ color: '#078f85', fontWeight: 800 }}>⌄</span>
            </header>
            <div className='ot-ticker'>ONEMAN TRADE — YOUR HUB FOR TRADING TOOLS, BOT BUILDING, MARKET ANALYSIS AND MORE</div>
            <nav className='ot-nav' aria-label='Trading tools'>
                {NAV_ITEMS.map(item => (
                    <button key={item.label} className={activeTab === item.label ? 'active' : ''} onClick={() => openTab(item.label)}>
                        <span aria-hidden='true'>{item.icon}</span>{item.label}
                    </button>
                ))}
            </nav>

            <main className='ot-content'>
                {notice && <div className='ot-notice' role='status'>{notice}<button onClick={() => setNotice('')} style={{ float: 'right', border: 0, background: 'transparent', color: 'inherit', cursor: 'pointer' }} aria-label='Dismiss notice'>✕</button></div>}
                {activeTab === 'Dashboard' ? (
                    <>
                        <div className='ot-search'>
                            <select aria-label='Signal category' value={category} onChange={event => setCategory(event.target.value)}>
                                <option>All</option><option>Volatility</option><option>Boom &amp; Crash</option><option>Other</option>
                            </select>
                            <input aria-label='Search signals' placeholder='Search for a bot or market...' value={search} onChange={event => setSearch(event.target.value)} />
                            <button aria-label='Search signals' onClick={() => setNotice(filteredSignals.length + ' matching signal(s) shown below.')}>⌕</button>
                        </div>
                        <div className='ot-shortcuts'>
                            {QUICK_LINKS.map(item => (
                                <button key={item.label} className={'ot-shortcut ot-' + item.tone} onClick={() => openTab(item.label === 'Load Bot' ? 'Bot Builder' : item.label)}>
                                    <span className='ot-short-icon' aria-hidden='true'>{item.icon}</span><span>{item.label}</span>
                                </button>
                            ))}
                        </div>
                        <section className='ot-panel'>
                            <div className='ot-panel-head'><span className='ot-live-dot' /><h2>Live Trading Signals</h2></div>
                            <p className='ot-muted'>{filteredSignals.length} signal{filteredSignals.length === 1 ? '' : 's'} listed · For research only</p>
                            {filteredSignals.map(signal => (
                                <article className='ot-signal' key={signal.rank}>
                                    <div className='ot-signal-top'><span className='ot-rank'>#{signal.rank}</span><span className='ot-contract'>{signal.contract}</span></div>
                                    <h3>{signal.market}</h3>
                                    <div className='ot-signal-foot'><span>Indicative score</span><strong>{signal.confidence}%</strong></div>
                                    <div className='ot-meter'><span style={{ width: signal.confidence + '%' }} /></div>
                                </article>
                            ))}
                            {filteredSignals.length === 0 && <p className='ot-empty'>No matching markets. Try a different search or category.</p>}
                            <button className='ot-disclaimer' onClick={() => setShowDisclaimer(value => !value)}>Risk Disclaimer {showDisclaimer ? '−' : '+'}</button>
                            {showDisclaimer && <div className='ot-notice'>Trading involves substantial risk and you may lose your invested capital. These example signal cards are informational UI only, not verified live market data or a guarantee of results. Confirm all trades independently.</div>}
                        </section>
                        <div className='ot-bottom'><span style={{ color: '#a7b3b5', fontSize: 13 }}>Trading controls</span><button className='ot-run' onClick={() => setNotice('Select a supported bot or trading tool before running. No trade was placed.')}>▶ &nbsp; Run</button><span style={{ color: '#899497', fontSize: 12 }}>Execution: manual confirmation</span></div>
                    </>
                ) : (
                    <section className='ot-panel'>
                        <div className='ot-panel-head'><span className='ot-live-dot' /><h2>{activeTab}</h2></div>
                        <p className='ot-muted'>OneMan Trade workspace</p>
                        <div className='ot-empty'>
                            <h3 className='ot-section-title'>{activeTab}</h3>
                            <p>{activeTab === 'Bot Builder' ? 'Build and configure trading strategies using the existing bot builder.' : activeTab === 'Trading Bots' ? 'Find and manage your available trading bots.' : activeTab === 'Bulk Trader' ? 'Review multiple trade setups before taking action.' : activeTab === 'Pro AI' ? 'AI-assisted market research workspace.' : activeTab === 'Dual Edge' ? 'Compare strategy ideas and market conditions.' : activeTab === 'Analysis Tool' ? 'Explore analysis and signal research tools.' : activeTab === 'Copy Trading' ? 'Review copy-trading options and risk settings.' : activeTab === 'Charts' || activeTab === 'TradingView' ? 'Charting workspace for reviewing market movements.' : activeTab === 'Risk Calculator' ? 'Estimate exposure and risk before entering a trade.' : activeTab === 'Manual Trader' ? 'Manual trading workspace. Review every order before confirming.' : 'Browse available strategies and saved bot configurations.'}</p>
                            <p>Some tools may require account authorization or configuration. This dashboard does not claim that a trade, deposit, or withdrawal has been executed.</p>
                            <button className='ot-run' onClick={() => { setActiveTab('Dashboard'); setNotice('Returned to Dashboard.'); }}>← Back to Dashboard</button>
                        </div>
                    </section>
                )}
            </main>
            <button className='ot-ai' aria-label='Open AI assistant' onClick={() => setNotice('AI assistant selected. Configure an AI provider to enable live responses.')}>AI</button>
            <div style={{ padding: '0 18px', textAlign: 'center', color: '#687478', fontSize: 11 }}>Signed-in session: {String(isAuthorized)} · OneMan Trade</div>
        </div>
    );
});

export default Dashboard;
