import React from 'react';
import { Download, Filter, Search } from 'lucide-react';

const REPORT_DATA = [
    { id: 1, date: '2026-03-11', website: 'github.com', category: 'Productive', duration: '2h 15m' },
    { id: 2, date: '2026-03-11', website: 'youtube.com', category: 'Unproductive', duration: '45m' },
    { id: 3, date: '2026-03-10', website: 'stackoverflow.com', category: 'Productive', duration: '1h 30m' },
    { id: 4, date: '2026-03-10', website: 'instagram.com', category: 'Unproductive', duration: '1h 10m' },
    { id: 5, date: '2026-03-09', website: 'leetcode.com', category: 'Productive', duration: '3h 0m' },
    { id: 6, date: '2026-03-09', website: 'google.com', category: 'Neutral', duration: '20m' },
];

const Reports = () => {
    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Detailed Reports</h1>
                    <p className="text-gray-500 mt-1">View and export your raw browsing logs.</p>
                </div>
                <div className="mt-4 sm:mt-0">
                    <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
                    <div className="relative w-full sm:w-64">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search domains..."
                            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                    </div>
                    <button className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors w-full sm:w-auto justify-center">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white text-gray-500 text-sm border-b border-gray-100">
                                <th className="px-6 py-4 font-semibold">Date</th>
                                <th className="px-6 py-4 font-semibold">Website</th>
                                <th className="px-6 py-4 font-semibold">Category</th>
                                <th className="px-6 py-4 font-semibold">Time Spent</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {REPORT_DATA.map((row) => (
                                <tr key={row.id} className="hover:bg-gray-50/50 transition-colors bg-white">
                                    <td className="px-6 py-4 text-sm text-gray-600">{row.date}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <img
                                                src={`https://www.google.com/s2/favicons?domain=${row.website}&sz=32`}
                                                alt="favicon"
                                                className="w-5 h-5 mr-3 rounded-sm drop-shadow-sm"
                                            />
                                            <span className="font-medium text-gray-900">{row.website}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${row.category === 'Productive' ? 'bg-green-100 text-green-700' :
                                                row.category === 'Unproductive' ? 'bg-red-100 text-red-700' :
                                                    'bg-gray-100 text-gray-700'
                                            }`}>
                                            {row.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-700">
                                        {row.duration}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500 bg-gray-50/50">
                    <span>Showing 1 to 6 of 24 entries</span>
                    <div className="flex space-x-1">
                        <button className="px-3 py-1 border border-gray-200 rounded bg-white hover:bg-gray-50 disabled:opacity-50">Prev</button>
                        <button className="px-3 py-1 border border-gray-200 rounded bg-blue-50 text-blue-600 font-medium">1</button>
                        <button className="px-3 py-1 border border-gray-200 rounded bg-white hover:bg-gray-50">2</button>
                        <button className="px-3 py-1 border border-gray-200 rounded bg-white hover:bg-gray-50">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
