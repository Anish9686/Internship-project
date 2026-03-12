import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { MonitorPlay, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MOCK_DATA = {
    summary: {
        total: 28800, // 8 hours in sec
        productive: 18000, // 5 hours
        unproductive: 7200, // 2 hours
        neutral: 3600 // 1 hour
    },
    pieData: [
        { name: 'Productive', value: 18000, color: '#10B981' },
        { name: 'Unproductive', value: 7200, color: '#EF4444' },
        { name: 'Neutral', value: 3600, color: '#6B7280' }
    ],
    websites: [
        { url: 'github.com', category: 'Productive', duration: 7200 },
        { url: 'stackoverflow.com', category: 'Productive', duration: 5400 },
        { url: 'youtube.com', category: 'Unproductive', duration: 3600 },
        { url: 'x.com', category: 'Unproductive', duration: 1800 },
        { url: 'google.com', category: 'Neutral', duration: 3600 },
    ]
};

const formatTime = (seconds) => {
    if (!seconds) return '0h 0m';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
};

const StatCard = ({ title, value, icon: Icon, colorClass, borderClass }) => (
    <div className={`bg-white rounded-2xl p-6 shadow-sm border-l-4 ${borderClass}`}>
        <div className="flex items-center justify-between pointer-events-none">
            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            </div>
            <div className={`p-3 rounded-xl ${colorClass}`}>
                <Icon className="w-6 h-6" />
            </div>
        </div>
    </div>
);

const DashboardView = () => {
    const { user } = useAuth();

    const [summary, setSummary] = useState(MOCK_DATA.summary);
    const [websites, setWebsites] = useState(MOCK_DATA.websites);
    const [isLoading, setIsLoading] = useState(true);
    const [isUsingMockData, setIsUsingMockData] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // In a real app we'd attach Authorization: Bearer <token>
                // We assume localhost:5000 for local backend
                const headers = {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer MOCK_TOKEN_UNLESS_PROVIDED` // Placeholder
                };

                const [dailyRes, websitesRes] = await Promise.all([
                    fetch('http://localhost:5000/api/analytics/daily', { headers }),
                    fetch('http://localhost:5000/api/analytics/websites', { headers })
                ]);

                if (dailyRes.ok && websitesRes.ok) {
                    const dailyData = await dailyRes.json();
                    const websitesData = await websitesRes.json();

                    // The backend returns:
                    // dailyData: { totalBrowsingTime, productiveTime, unproductiveTime }
                    // Only overwrite the mock data if real data exists
                    if (websitesData && websitesData.length > 0) {
                        const neutralTime = dailyData.totalBrowsingTime - dailyData.productiveTime - dailyData.unproductiveTime;

                        setSummary({
                            total: dailyData.totalBrowsingTime,
                            productive: dailyData.productiveTime,
                            unproductive: dailyData.unproductiveTime,
                            neutral: neutralTime > 0 ? neutralTime : 0
                        });

                        // Mapping it to the UI expected format
                        setWebsites(websitesData.map(ws => ({
                            url: ws._id,
                            category: ws.category,
                            duration: ws.timeSpent
                        })));
                        setIsUsingMockData(false);
                    } else {
                        console.log("No real tracking data found, defaulting to Demo Data.");
                    }
                } else {
                    console.error("Failed to fetch real data, keeping MOCK_DATA.");
                }
            } catch (err) {
                console.error("Error fetching dashboard data:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();

        // Polling interval to refresh data (optional, every 1 minute)
        const interval = setInterval(fetchDashboardData, 60000);
        return () => clearInterval(interval);

    }, [user]); // Re-fetch if user changes

    const pieData = [
        { name: 'Productive', value: summary.productive, color: '#10B981' },
        { name: 'Unproductive', value: summary.unproductive, color: '#EF4444' },
        { name: 'Neutral', value: summary.neutral, color: '#6B7280' }
    ].filter(item => item.value > 0); // Hide empty sections

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Loading today's activity...</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                    Today's Overview
                    {isUsingMockData && (
                        <span className="ml-3 text-xs font-semibold text-amber-700 bg-amber-100 border border-amber-300 px-2 py-1 rounded-md">
                            Demo Data
                        </span>
                    )}
                </h1>
                <p className="text-gray-500 mt-1">
                    {isUsingMockData
                        ? "This is sample data. Install and use the extension to see your real stats."
                        : "Here is the summary of your browsing habits today."}
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Total Browsing Time"
                    value={formatTime(summary.total)}
                    icon={MonitorPlay}
                    colorClass="bg-blue-50 text-blue-600"
                    borderClass="border-blue-500"
                />
                <StatCard
                    title="Productive Time"
                    value={formatTime(summary.productive)}
                    icon={CheckCircle}
                    colorClass="bg-green-50 text-green-600"
                    borderClass="border-green-500"
                />
                <StatCard
                    title="Unproductive Time"
                    value={formatTime(summary.unproductive)}
                    icon={XCircle}
                    colorClass="bg-red-50 text-red-600"
                    borderClass="border-red-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Charts */}
                <div className="bg-white rounded-2xl shadow-sm p-6 col-span-1 border border-gray-100 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Activity Split</h3>

                    {pieData.length > 0 ? (
                        <>
                            <div className="h-64 flex-1">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => formatTime(value)} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex justify-center flex-wrap gap-4 mt-4">
                                {pieData.map(item => (
                                    <div key={item.name} className="flex items-center text-sm">
                                        <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></span>
                                        <span className="text-gray-600">{item.name}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                            No browsing activity recorded yet today.
                        </div>
                    )}
                </div>

                {/* Top Websites Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 col-span-1 lg:col-span-2 overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900">Top Websites</h3>
                    </div>

                    {websites.length > 0 ? (
                        <div className="overflow-x-auto flex-1">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 text-gray-500 text-sm">
                                        <th className="px-6 py-4 font-medium">Website</th>
                                        <th className="px-6 py-4 font-medium">Category</th>
                                        <th className="px-6 py-4 font-medium">Time Spent</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {websites.map((site) => (
                                        <tr key={site.url} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <img
                                                        src={`https://www.google.com/s2/favicons?domain=${site.url}&sz=32`}
                                                        alt="favicon"
                                                        className="w-5 h-5 mr-3 rounded-sm"
                                                    />
                                                    <span className="font-medium text-gray-900">{site.url}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${site.category === 'Productive' ? 'bg-green-100 text-green-800' :
                                                    site.category === 'Unproductive' ? 'bg-red-100 text-red-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {site.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 font-medium">
                                                {formatTime(site.duration)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-sm p-12">
                            <MonitorPlay className="w-12 h-12 mb-3 text-gray-200" />
                            <p>No websites tracked today.</p>
                            <p className="mt-1 text-xs text-gray-300">Make sure your Chrome extension is installed and active.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardView;
