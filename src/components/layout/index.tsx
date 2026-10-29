import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import { Outlet } from 'react-router-dom';
import { api_base } from '@/external/bot-skeleton';
import { useStore } from '@/hooks/useStore';
import { useApiBase } from '@/hooks/useApiBase';
import { useDevice } from '@deriv-com/ui';
import { crypto_currencies_display_order, fiat_currencies_display_order } from '../shared';
import Footer from './footer';
import AppHeader from './header';
import Body from './main-body';
import PreLoginLanding from './pre-login-landing';
import NovaTradeLoading from '../novatrade-loading';
import './layout.scss';

const getStoredOAuthLoginid = (): string => {
    try {
        const rawAuthInfo = sessionStorage.getItem('auth_info');
        const authInfo = rawAuthInfo ? JSON.parse(rawAuthInfo) : null;
        const isTokenValid = !!authInfo?.access_token && (!authInfo.expires_at || Date.now() < authInfo.expires_at);
        if (!isTokenValid) return '';
        return sessionStorage.getItem('novatrade_oauth_loginid') || localStorage.getItem('active_loginid') || '';
    } catch {
        return '';
    }
};

const Layout = observer(() => {
    const { isDesktop } = useDevice();
    const store = useStore();
    const { activeLoginid } = useApiBase();
    // Recover the OAuth account synchronously so a Layout remount cannot briefly
    // uncover the landing/loading overlay after the OAuth callback has completed.
    const [oauthLoginid, setOAuthLoginid] = useState(getStoredOAuthLoginid);
    const resolvedLoginid = activeLoginid || oauthLoginid;

    useEffect(() => {
        const handleOAuthAccountReady = (event: Event) => {
            const loginid = (event as CustomEvent<string>).detail;
            if (loginid) {
                sessionStorage.setItem('novatrade_oauth_loginid', loginid);
                setOAuthLoginid(loginid);
            }
        };
        window.addEventListener('novatrade:oauth-account-ready', handleOAuthAccountReady);
        return () => window.removeEventListener('novatrade:oauth-account-ready', handleOAuthAccountReady);
    }, []);
    // Keep the pre-login page accessible immediately; the decorative splash must not block login.
    const [showStartupSplash, setShowStartupSplash] = useState(false);
    const is_quick_strategy_active = store?.quick_strategy?.is_open;
    const isCallbackPage = window.location.pathname === '/callback';

    const checkClientAccount = JSON.parse(localStorage.getItem('clientAccounts') ?? '{}');
    const getQueryParams = new URLSearchParams(window.location.search);
    const currency = getQueryParams.get('account') ?? '';
    const accountsList = JSON.parse(localStorage.getItem('accountsList') ?? '{}');
    const isClientAccountsPopulated = Object.keys(accountsList).length > 0;
    const ifClientAccountHasCurrency =
        Object.values(checkClientAccount).some((account: any) => account.currency === currency) ||
        currency === 'demo' ||
        currency === '';
    const [clientHasCurrency, setClientHasCurrency] = useState(ifClientAccountHasCurrency);
    const [isAuthenticating, setIsAuthenticating] = useState(true); // Start with true to prevent flashing

    useEffect(() => {
        if (isCallbackPage || resolvedLoginid) {
            setShowStartupSplash(false);
            return;
        }
        const timer = window.setTimeout(() => setShowStartupSplash(false), 3200);
        return () => window.clearTimeout(timer);
    }, [isCallbackPage, resolvedLoginid]);

    // Expose setClientHasCurrency to window for global access
    useEffect(() => {
        (window as any).setClientHasCurrency = setClientHasCurrency;

        return () => {
            delete (window as any).setClientHasCurrency;
        };
    }, []);

    const validCurrencies = [...fiat_currencies_display_order, ...crypto_currencies_display_order];
    const query_currency = (getQueryParams.get('account') ?? '')?.toUpperCase();
    const isCurrencyValid = validCurrencies.includes(query_currency);
    const api_accounts: any[][] = [];
    let subscription: { unsubscribe: () => void };

    const validateApiAccounts = ({ data }: any) => {
        //TO do work on this with account switcher
        if (data.msg_type === 'authorize') {
            const account_list = data?.authorize?.account_list || [];
            const account_list_filter = account_list.filter((acc: any) => acc.is_disabled === 0);
            api_accounts.push(account_list_filter || []);
            const allCurrencies = new Set(Object.values(checkClientAccount).map((acc: any) => acc.currency));

            // Skip disabled accounts when checking for missing currency
            const accounts = api_accounts.flat();
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            let detected_currency = '';
            const hasMissingCurrency = accounts.some(data => {
                if (!allCurrencies.has(data.currency)) {
                    sessionStorage.setItem('query_param_currency', data.currency);
                    return true;
                }
                detected_currency = data.currency;
                return false;
            });

            let hasMissingToken = false;
            let missingTokenCurrency = '';

            for (const acc of account_list_filter) {
                if (acc.loginid && !accountsList[acc.loginid]) {
                    hasMissingToken = true;
                    missingTokenCurrency = acc.currency || '';
                    // Store the missing token's currency in session storage
                    if (missingTokenCurrency) {
                        sessionStorage.setItem('query_param_currency', missingTokenCurrency);
                    }
                    break;
                }
            }

            if (hasMissingCurrency || hasMissingToken) {
                setClientHasCurrency(false);
            } else {
                const account_list_ =
                    account_list_filter?.find((acc: { currency: string }) => acc.currency === currency) ||
                    account_list_filter?.[0];

                let session_storage_currency =
                    sessionStorage.getItem('query_param_currency') || account_list_?.currency || 'USD';

                session_storage_currency = `account=${session_storage_currency}`;
                setClientHasCurrency(true);
                if (!new URLSearchParams(window.location.search).has('account')) {
                    window.history.pushState({}, '', `${window.location.pathname}?${session_storage_currency}`);
                }

                setClientHasCurrency(true);
            }

            if (subscription) {
                subscription?.unsubscribe();
            }
        }
    };

    useEffect(() => {
        if (isCurrencyValid && api_base.api) {
            // Subscribe to the onMessage event
            const is_valid_currency = currency && validCurrencies.includes(currency.toUpperCase());
            if (!is_valid_currency) return;
            subscription = api_base.api.onMessage().subscribe(validateApiAccounts);
        }
    }, []);

    useEffect(() => {
        // Always set the currency in session storage, even if the user is not logged in
        // This ensures the currency is available on the callback page
        setIsAuthenticating(true);
        if (currency) {
            sessionStorage.setItem('query_param_currency', currency);
        }

        // Authentication is now handled by the OAuth flow
        setIsAuthenticating(false);
    }, [isClientAccountsPopulated, isCallbackPage, clientHasCurrency, currency]);

    // Add a state to track if initial authentication check is complete
    const [isInitialAuthCheckComplete, setIsInitialAuthCheckComplete] = useState(false);

    // Effect to mark initial auth check as complete after a short delay
    useEffect(() => {
        if (!isAuthenticating && !isInitialAuthCheckComplete) {
            // Wait a bit to ensure all state updates have propagated
            const timer = setTimeout(() => {
                setIsInitialAuthCheckComplete(true);
            }, 500); // Give it enough time to stabilize

            return () => clearTimeout(timer);
        }
    }, [isAuthenticating, isInitialAuthCheckComplete]);

    return (
        <div
            className={clsx('layout', {
                responsive: isDesktop,
                'quick-strategy-active': is_quick_strategy_active && !isDesktop,
            })}
        >
            {!isCallbackPage && <AppHeader isAuthenticating={isAuthenticating || !isInitialAuthCheckComplete} />}
            <Body>
                <Outlet />
            </Body>
            {!isCallbackPage && isDesktop && <Footer />}
            {!resolvedLoginid && !isCallbackPage && (showStartupSplash ? (
                <NovaTradeLoading status='Connecting to Volatility Markets...' fullscreen />
            ) : (
                <div className='om-landing-overlay'>
                    <PreLoginLanding />
                </div>
            ))}
        </div>
    );
});

export default Layout;
