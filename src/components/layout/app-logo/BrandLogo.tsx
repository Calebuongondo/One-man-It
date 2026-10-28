type TBrandLogoProps = {
    width?: number;
    height?: number;
    fill?: string;
    className?: string;
};

export const BrandLogo = ({ width = 144, height = 34, fill = 'currentColor', className = '' }: TBrandLogoProps) => (
    <svg
        width={width}
        height={height}
        viewBox='0 0 168 36'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        className={className}
        role='img'
        aria-label='NovaTrade'
    >
        <text x='1' y='27' fontFamily='Inter, Segoe UI, Arial, sans-serif' fontSize='27' fontWeight='850' letterSpacing='-1.3'>
            <tspan fill='#00D6AE'>Nova</tspan><tspan fill='#FF4058'>Trade</tspan>
        </text>
    </svg>
);
