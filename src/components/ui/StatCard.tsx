interface Props {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: React.ReactNode;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
}

export default function StatCard({ title, value, subtitle, icon, trend, trendValue }: Props) {
    const trendColors = {
        up: 'text-green-400',
        down: 'text-red-400',
        neutral: 'text-gray-400',
    };

    const trendIcons = {
        up: '↑',
        down: '↓',
        neutral: '→',
    };

    return (
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-5 hover:border-purple-500/30 transition-all duration-300">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-gray-400 text-sm font-medium">{title}</p>
                    <p className="text-3xl font-bold text-white mt-1">{value}</p>
                    {subtitle && (
                        <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
                    )}
                    {trend && trendValue && (
                        <p className={`text-sm mt-2 ${trendColors[trend]}`}>
                            {trendIcons[trend]} {trendValue}
                        </p>
                    )}
                </div>
                {icon && (
                    <div className="text-purple-400 opacity-80">
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
}
