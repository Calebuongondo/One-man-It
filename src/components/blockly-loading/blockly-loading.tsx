import { observer } from 'mobx-react-lite';
import { useStore } from '@/hooks/useStore';
import NovaTradeLoading from '../novatrade-loading';

const BlocklyLoading = observer(() => {
    const { blockly_store } = useStore();
    const { is_loading } = blockly_store;

    return is_loading ? (
        <div data-testid='blockly-loader' className='bot__loading'>
            <NovaTradeLoading status='Loading the visual bot builder...' fullscreen={false} />
        </div>
    ) : null;
});

export default BlocklyLoading;
