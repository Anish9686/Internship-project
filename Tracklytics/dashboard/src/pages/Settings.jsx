import React from 'react';
import { Save, Bell, Shield, Laptop } from 'lucide-react';

const SettingsSection = ({ title, description, children }) => (
    <div className="py-6 border-b border-gray-100 last:border-0 flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3">
            <h3 className="text-sm font-bold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
        <div className="md:w-2/3 max-w-xl">
            {children}
        </div>
    </div>
);

const Settings = () => {
    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-12">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-500 mt-1">Manage your account and preferences.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="p-6 sm:p-8">
                    <SettingsSection
                        title="Profile Details"
                        description="Update your personal information and email address."
                    >
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input type="text" defaultValue="Anish" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input type="email" defaultValue="22tec2cs182@vgu.ac.in" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                            </div>
                        </div>
                    </SettingsSection>

                    <SettingsSection
                        title="Tracking Preferences"
                        description="Configure how the extension limits tracking and syncs your local data."
                    >
                        <div className="space-y-4">
                            <label className="flex items-center p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                                <div className="bg-blue-100 p-2 rounded-lg mr-4 text-blue-600">
                                    <Laptop className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-medium text-gray-900">Track Incognito Windows</h4>
                                    <p className="text-xs text-gray-500">Enable tracking inside private browsing windows.</p>
                                </div>
                                <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                                    <input type="checkbox" name="toggle" id="toggle1" className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer" />
                                    <label htmlFor="toggle1" className="toggle-label block overflow-hidden h-5 rounded-full bg-gray-300 cursor-pointer"></label>
                                </div>
                            </label>

                            <label className="flex items-center p-4 border border-blue-500 bg-blue-50/30 rounded-xl cursor-pointer">
                                <div className="bg-blue-100 p-2 rounded-lg mr-4 text-blue-600">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-medium text-gray-900">Strict Categorization</h4>
                                    <p className="text-xs text-gray-500">Automatically block unverified domains.</p>
                                </div>
                                <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                                    <input type="checkbox" name="toggle" id="toggle2" defaultChecked className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-blue-600 border-4 appearance-none cursor-pointer" />
                                    <label htmlFor="toggle2" className="toggle-label block overflow-hidden h-5 rounded-full bg-blue-600 cursor-pointer"></label>
                                </div>
                            </label>
                        </div>
                        {/* Note: the custom switch CSS implies the thumb moves. In a real React app we'd use state or a library for the switch, but this works nicely for visual UI. */}
                        <style>{`
                            .toggle-checkbox:checked { right: 0; border-color: #2563EB; }
                            .toggle-checkbox:checked + .toggle-label { background-color: #2563EB; }
                            .toggle-checkbox { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
                        `}</style>
                    </SettingsSection>

                    <SettingsSection
                        title="Notifications"
                        description="Control when and how you receive productivity alerts."
                    >
                        <div className="space-y-3 mt-2">
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" defaultChecked />
                                <span className="text-sm text-gray-700 font-medium">Daily productivity summaries</span>
                            </label>
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" defaultChecked />
                                <span className="text-sm text-gray-700 font-medium">Unproductive time warnings (2+ hours)</span>
                            </label>
                        </div>
                    </SettingsSection>
                </div>

                <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex justify-end rounded-b-2xl">
                    <button className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium mr-3 hover:bg-white bg-transparent transition-colors">Cancel</button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm flex items-center">
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
