import { useState } from 'react';
import { generateOAuthURL } from '@/components/shared';
import './pre-login-landing.scss';

type AuthAction = 'login' | 'signup';

const PreLoginLanding = () => {
    const [loading, setLoading] = useState<AuthAction | null>(null);
    const [authError, setAuthError] = useState('');

    const startAuth = async (action: AuthAction) => {
        if (loading) return;

        setLoading(action);
        setAuthError('');

        try {
            const url = await generateOAuthURL(action === 'signup' ? 'registration' : undefined);
            if (url) {
                window.location.replace(url);
                return;
            }
            setAuthError('We could not start Deriv sign-in. Please refresh and try again.');
        } catch (error) {
            console.error('Authentication redirect failed:', error);
            setAuthError('We could not start Deriv sign-in. Please refresh and try again.');
        }

        setLoading(null);
    };

    return (
        <main className='om-landing'>
            <header className='om-landing__header'>
                <a className='om-landing__brand' href='/' aria-label='OneMan Trade home'>
                    <span className='om-landing__brand-mark'>OM</span>
                    <span>OneMan <strong>Trade</strong></span>
                </a>
                <nav className='om-landing__nav' aria-label='Main navigation'>
                    <a href='#features'>Features</a>
                    <a href='#how-it-works'>How it works</a>
                    <a href='#risk'>Risk notice</a>
                </nav>
                <div className='om-landing__header-actions'>
                    <button className='om-button om-button--quiet' onClick={() => startAuth('login')} disabled={!!loading}>
                        {loading === 'login' ? 'Connecting…' : 'Log in'}
                    </button>
                    <button className='om-button om-button--light' onClick={() => startAuth('signup')} disabled={!!loading}>
                        {loading === 'signup' ? 'Connecting…' : 'Sign up'} <span aria-hidden='true'>↗</span>
                    </button>
                </div>
            </header>

            <section className='om-hero'>
                <div className='om-hero__glow' aria-hidden='true' />
                <div className='om-hero__content'>
                    <div className='om-eyebrow'><span className='om-eyebrow__dot' /> A clearer way to build your trading workflow</div>
                    <h1>Build your strategy.<br /><span>Stay in control.</span></h1>
                    <p className='om-hero__copy'>
                        OneMan Trade brings visual bot building, market charts and trading tools together in one workspace.
                    </p>
                    <div className='om-hero__actions'>
                        <button className='om-button om-button--primary' onClick={() => startAuth('signup')} disabled={!!loading}>
                            {loading === 'signup' ? 'Connecting to Deriv…' : 'Get started'} <span aria-hidden='true'>→</span>
                        </button>
                        <button className='om-button om-button--outline' onClick={() => startAuth('login')} disabled={!!loading}>
                            I already have an account
                        </button>
                    </div>
                    {authError && <p className='om-landing__error' role='alert'>{authError}</p>}
                    <p className='om-hero__note'><span aria-hidden='true'>✓</span> Connect securely through Deriv · Test carefully before live trading</p>
                </div>

                <div className='om-preview' aria-label='Platform feature preview'>
                    <div className='om-preview__topbar'>
                        <div className='om-window-dots'><i /><i /><i /></div>
                        <span>ONEMAN TRADE <b>/ WORKSPACE</b></span>
                        <span className='om-preview__status'><i /> Ready to build</span>
                    </div>
                    <div className='om-preview__body'>
                        <aside className='om-preview__sidebar'>
                            <span className='om-preview__side-icon om-preview__side-icon--active'>▦</span>
                            <span className='om-preview__side-icon'>⌘</span>
                            <span className='om-preview__side-icon'>⌁</span>
                            <span className='om-preview__side-icon'>⚙</span>
                        </aside>
                        <div className='om-preview__workspace'>
                            <div className='om-preview__heading'>
                                <div><small>YOUR WORKSPACE</small><h3>Strategy overview</h3></div>
                                <span className='om-preview__demo'>DEMO FIRST</span>
                            </div>
                            <div className='om-preview__metrics'>
                                <div><small>Strategy status</small><strong><i /> Not running</strong></div>
                                <div><small>Trade execution</small><strong>Manual control</strong></div>
                            </div>
                            <div className='om-chart'>
                                <div className='om-chart__grid' />
                                <svg viewBox='0 0 600 170' preserveAspectRatio='none' role='img' aria-label='Illustrative market chart'>
                                    <defs><linearGradient id='om-chart-fill' x1='0' y1='0' x2='0' y2='1'><stop offset='0%' stopColor='#00d6b3' stopOpacity='.24' /><stop offset='100%' stopColor='#00d6b3' stopOpacity='0' /></linearGradient></defs>
                                    <path d='M0 135 C25 120 30 130 55 110 S90 118 115 92 S145 108 175 80 S205 94 235 66 S270 95 300 72 S330 86 355 52 S390 66 420 46 S450 64 480 35 S525 48 550 25 S580 40 600 12 L600 170 L0 170 Z' fill='url(#om-chart-fill)' />
                                    <path d='M0 135 C25 120 30 130 55 110 S90 118 115 92 S145 108 175 80 S205 94 235 66 S270 95 300 72 S330 86 355 52 S390 66 420 46 S450 64 480 35 S525 48 550 25 S580 40 600 12' fill='none' stroke='#00d6b3' strokeWidth='3' vectorEffect='non-scaling-stroke' />
                                </svg>
                                <div className='om-chart__label'>Illustrative chart · not live market data</div>
                            </div>
                            <div className='om-preview__blocks'>
                                <div><span className='om-block-icon'>⌘</span><span><b>Bot Builder</b><small>Build with visual blocks</small></span><span className='om-block-arrow'>↗</span></div>
                                <div><span className='om-block-icon om-block-icon--purple'>⌁</span><span><b>Market insights</b><small>Charts and indicators</small></span><span className='om-block-arrow'>↗</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className='om-trust-strip' aria-label='Platform principles'>
                <div><span>01</span><b>Visual strategy building</b><small>Configure a bot without starting from code</small></div>
                <div><span>02</span><b>Market context</b><small>Explore available charts and indicators</small></div>
                <div><span>03</span><b>Stay in control</b><small>Review your setup before you run it</small></div>
            </section>

            <section className='om-section' id='features'>
                <div className='om-section__intro'>
                    <span className='om-section__eyebrow'>THE PLATFORM</span>
                    <h2>Everything you need to shape your workflow.</h2>
                    <p>Practical tools for exploring markets and working with automated strategies, in one focused interface.</p>
                </div>
                <div className='om-feature-grid'>
                    <article className='om-feature-card om-feature-card--cyan'>
                        <span className='om-feature-card__icon'>⌘</span><span className='om-feature-card__number'>01 / BUILD</span>
                        <h3>Visual Bot Builder</h3><p>Assemble strategy logic with a visual block-based builder and adjust the setup to suit your approach.</p>
                    </article>
                    <article className='om-feature-card om-feature-card--green'>
                        <span className='om-feature-card__icon'>⌁</span><span className='om-feature-card__number'>02 / ANALYZE</span>
                        <h3>Charts and indicators</h3><p>Explore market movement with the charting and indicator tools available in the workspace.</p>
                    </article>
                    <article className='om-feature-card om-feature-card--purple'>
                        <span className='om-feature-card__icon'>◈</span><span className='om-feature-card__number'>03 / CONFIGURE</span>
                        <h3>Quick strategy setup</h3><p>Start with a quick strategy or configure your own bot, then review the settings before running.</p>
                    </article>
                    <article className='om-feature-card om-feature-card--blue'>
                        <span className='om-feature-card__icon'>⛨</span><span className='om-feature-card__number'>04 / REVIEW</span>
                        <h3>Risk-aware workflow</h3><p>Take time to understand your strategy, test it on a demo account, and only use money you can afford to lose.</p>
                    </article>
                </div>
            </section>

            <section className='om-how' id='how-it-works'>
                <div className='om-how__copy'>
                    <span className='om-section__eyebrow'>GET STARTED</span>
                    <h2>From sign-in to strategy, at your pace.</h2>
                    <p>Connect your Deriv account, explore the workspace, and test your setup before considering live trading.</p>
                </div>
                <div className='om-steps'>
                    <div><span>1</span><section><b>Connect your account</b><p>Use the secure Deriv sign-in flow to connect.</p></section></div>
                    <div><span>2</span><section><b>Build or choose a strategy</b><p>Use the Bot Builder or explore the quick strategy tools.</p></section></div>
                    <div><span>3</span><section><b>Test before live trading</b><p>Review your settings and start with a demo account.</p></section></div>
                </div>
            </section>

            <section className='om-cta'>
                <div className='om-cta__orb' aria-hidden='true' />
                <span className='om-section__eyebrow'>YOUR WORKSPACE AWAITS</span>
                <h2>Make your next step a thoughtful one.</h2>
                <p>Sign in to explore OneMan Trade and its trading tools.</p>
                <button className='om-button om-button--primary' onClick={() => startAuth('signup')} disabled={!!loading}>
                    {loading === 'signup' ? 'Connecting to Deriv…' : 'Get started with Deriv'} <span aria-hidden='true'>→</span>
                </button>
            </section>

            <footer className='om-footer' id='risk'>
                <div className='om-footer__brand'><span className='om-landing__brand-mark'>OM</span><span>OneMan <strong>Trade</strong></span></div>
                <p className='om-footer__risk'><strong>Risk disclaimer</strong> — Trading derivatives and options involves significant risk. You may lose some or all of your invested capital. Past performance does not guarantee future results. OneMan Trade does not guarantee profits. Please understand the risks and test with a demo account before trading with real funds.</p>
                <div className='om-footer__bottom'><span>© {new Date().getFullYear()} OneMan Trade</span><span>Built for informed, careful trading.</span></div>
            </footer>
        </main>
    );
};

export default PreLoginLanding;
