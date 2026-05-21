import React from 'react';
import { useMarketStore } from '../store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Mail, Smartphone, TrendingUp, DollarSign, Users, Info } from 'lucide-react';

export const NotificationSettings = () => {
    const { user, updateNotificationPreferences } = useMarketStore();
    const { notificationPreferences } = user;

    const handleChange = (key: keyof typeof notificationPreferences) => {
        updateNotificationPreferences({ [key]: !notificationPreferences[key] });
    };

    return (
        <Card className="bg-white/5 border-white/10 rounded-xl shadow-none">
            <CardHeader>
                <CardTitle className="text-lg font-black text-[#e0e0e0] uppercase tracking-tighter">Notification Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <h3 className="text-sm font-bold text-[#e0e0e0] opacity-60">In-App Alerts</h3>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-2 text-sm text-[#e0e0e0]">
                            <TrendingUp className="w-4 h-4" /> Auctions
                        </div>
                        <input type="checkbox" checked={notificationPreferences.auctions} onChange={() => handleChange('auctions')} className="accent-[#48A111]" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-2 text-sm text-[#e0e0e0]">
                            <DollarSign className="w-4 h-4" /> Price Changes
                        </div>
                        <input type="checkbox" checked={notificationPreferences.priceChanges} onChange={() => handleChange('priceChanges')} className="accent-[#48A111]" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-2 text-sm text-[#e0e0e0]">
                            <Users className="w-4 h-4" /> Social Interactions
                        </div>
                        <input type="checkbox" checked={notificationPreferences.social} onChange={() => handleChange('social')} className="accent-[#48A111]" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-2 text-sm text-[#e0e0e0]">
                            <Info className="w-4 h-4" /> System Messages
                        </div>
                        <input type="checkbox" checked={notificationPreferences.system} onChange={() => handleChange('system')} className="accent-[#48A111]" />
                    </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-white/10">
                    <h3 className="text-sm font-bold text-[#e0e0e0] opacity-60">Other Channels</h3>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-2 text-sm text-[#e0e0e0]">
                            <Smartphone className="w-4 h-4" /> Push Notifications
                        </div>
                        <input type="checkbox" checked={notificationPreferences.push} onChange={() => handleChange('push')} className="accent-[#48A111]" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-2 text-sm text-[#e0e0e0]">
                            <Mail className="w-4 h-4" /> Email Digests
                        </div>
                        <input type="checkbox" checked={notificationPreferences.email} onChange={() => handleChange('email')} className="accent-[#48A111]" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
