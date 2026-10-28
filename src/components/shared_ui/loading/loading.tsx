import React from 'react';
import NovaTradeLoading from '../../novatrade-loading';

export type TLoadingProps = React.HTMLProps<HTMLDivElement> & {
    is_fullscreen: boolean;
    is_slow_loading: boolean;
    status: string[];
    theme: string;
};

const Loading = ({ className, id, is_fullscreen = true, is_slow_loading, status }: Partial<TLoadingProps>) => {
    return (
        <div id={id} className={className} data-testid='dt_initial_loader'>
            <NovaTradeLoading
                fullscreen={is_fullscreen}
                status={is_slow_loading && status?.length ? status[0] : 'Preparing your NovaTrade workspace...'}
            />
        </div>
    );
};

export default Loading;
