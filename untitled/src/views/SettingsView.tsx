import React from 'react';
import { NotificationSettings } from '../components/NotificationSettings';
import { ProfileSettings } from '../components/ProfileSettings';

export const SettingsView = () => {
    return (
        <div className="p-4 sm:p-6 space-y-6">
            <h1 className="text-4xl font-black uppercase tracking-tighter text-[#e0e0e0] italic">Settings<span className="text-[#48A111]">.</span></h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <ProfileSettings />
                </div>
                <div className="space-y-6">
                    <NotificationSettings />
                </div>
            </div>
        </div>
    );
};
