'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';

export default function EmailSettings() {
  const { user } = useUser();
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        if (!user) return;
        const response = await fetch(
          \/api/user/email-settings?userId=\\
        );
        const data = await response.json();
        setSettings(data.settings);
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(\/api/user/email-settings?userId=\\, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const data = await response.json();
      if (data.success) {
        alert('Settings saved!');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-slate-600">Loading settings...</div>;
  }

  if (!settings) {
    return <div className="text-slate-600">Failed to load settings</div>;
  }

  return (
    <div className="bg-white rounded-lg p-8 shadow max-w-lg">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Email Preferences</h2>

      <div className="mb-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.digest_enabled}
            onChange={(e) =>
              setSettings({ ...settings, digest_enabled: e.target.checked })
            }
            className="w-5 h-5 rounded border-slate-300"
          />
          <span className="font-semibold text-slate-900">
            Enable Weekly Digest Email
          </span>
        </label>
      </div>

      {settings.digest_enabled && (
        <>
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Frequency
            </label>
            <select
              value={settings.digest_frequency}
              onChange={(e) =>
                setSettings({ ...settings, digest_frequency: e.target.value })
              }
              className="w-full px-4 py-2 border border-slate-300 rounded-lg"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>

          {settings.digest_frequency === 'weekly' && (
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Send on
              </label>
              <select
                value={settings.digest_day_of_week}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    digest_day_of_week: parseInt(e.target.value)
                  })
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
              >
                {daysOfWeek.map((day, index) => (
                  <option key={day} value={index}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Send at
            </label>
            <input
              type="time"
              value={settings.digest_time_of_day}
              onChange={(e) =>
                setSettings({ ...settings, digest_time_of_day: e.target.value + ':00' })
              }
              className="w-full px-4 py-2 border border-slate-300 rounded-lg"
            />
          </div>
        </>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all"
      >
        {saving ? 'Saving...' : 'Save Preferences'}
      </button>
    </div>
  );
}
