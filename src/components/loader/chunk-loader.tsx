import NovaTradeLoading from '../novatrade-loading';

export default function ChunkLoader({ message }: { message: string }) {
    return <NovaTradeLoading status={message || 'Loading NovaTrade tools...'} fullscreen />;
}
