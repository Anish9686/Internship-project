import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Clock, Calendar } from 'lucide-react';

const WEEKLY_DATA = [
    { name: 'Mon', Productive: 4, Unproductive: 2 },
    { name: 'Tue', Productive: 5, Unproductive: 1.5 },
    { name: 'Wed', Productive: 3.5, Unproductive: 3 },
    { name: 'Thu', Productive: 6, Unproductive: 1 },
    { name: 'Fri', Productive: 4.5, Unproductive: 2.5 },
    { name: 'Sat', Productive: 2, Unproductive: 4 },
    { name: 'Sun', Productive: 1, Unproductive: 5 },
];

const StatBadge = ({ title, value, trend, icon: Icon, isPositive }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
            <p className="text-sm text-gray-500 mb-1">{title}</p>
            <h4 className="text-2xl font-bold text-gray-900">{value}</h4>
            <p className={`text-sm mt-2 flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className="w-4 h-4 mr-1" /> {trend}
            </p>
        </div>
        <div className="bg-blue-50 p-4 rounded-xl text-blue-600">
            <Icon className="w-6 h-6" />
        </div>
    </div>
);

const Analytics = () => {
    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                    <p className="text-gray-500 mt-1">Deep dive into your productivity trends.</p>
                </div>
                <div className="mt-4 sm:mt-0 flex space-x-2">
                    <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">7 Days</button>
                    <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-50 transition-colors">30 Days</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatBadge title="Avg. Daily Focus" value="4h 12m" trend="+12% vs last week" icon={Clock} isPositive={true} />
                <StatBadge title="Avg. Distraction" value="2h 30m" trend="-5% vs last week" icon={TrendingUp} isPositive={true} />
                <StatBadge title="Most Productive Day" value="Thursday" trend="6h 0m focused" icon={Calendar} isPositive={true} />
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Weekly Activity Breakdown (Hours)</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={WEEKLY_DATA} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} dx={-10} />
                            <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Bar dataKey="Productive" stackId="a" fill="#10B981" radius={[0, 0, 4, 4]} barSize={40} />
                            <Bar dataKey="Unproductive" stackId="a" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
