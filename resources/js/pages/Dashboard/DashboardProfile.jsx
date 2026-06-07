import React, { useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';

export default function DashboardProfile() {
    const { t } = useTranslation();
    const { user, setUser } = useOutletContext();
    const [name, setName] = useState(user.name);
    const [phone, setPhone] = useState(user.phone || '');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.put('/api/dashboard/profile', { name, phone });
            setUser(res.data.user);
            alert(res.data.message);
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h1 className="text-2xl font-bold">{t('dashboard_profile')}</h1>
            
            <div>
                <label className="block text-sm text-gray-400">{t('name')}</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white" />
            </div>

            <div>
                <label className="block text-sm text-gray-400">{t('phone')}</label>
                <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white" />
            </div>

            <button type="submit" className="bg-[#FF7A00] text-white px-6 py-3 rounded-full font-bold" disabled={loading}>
                {loading ? t('saving') : t('save')}
            </button>
        </form>
    );
}
