'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';

interface Rule {
  id: string;
  rule_name: string;
  rule_type: string;
  vendor_pattern: string;
  amount_tolerance: number;
  days_apart_threshold: number;
  enabled: boolean;
}

export default function RulesManager() {
  const { user } = useUser();
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRule, setNewRule] = useState({
    rule_name: '',
    rule_type: 'fuzzy_match',
    vendor_pattern: '',
    amount_tolerance: 5,
    days_apart_threshold: 7
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const fetchRules = async () => {
      try {
        if (!user) return;
        const response = await fetch(\/api/detection/rules?userId=\\);
        const data = await response.json();
        setRules(data.rules || []);
      } catch (error) {
        console.error('Error fetching rules:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRules();
  }, [user]);

  const handleCreateRule = async () => {
    if (!newRule.rule_name || !newRule.vendor_pattern) {
      alert('Please fill in all fields');
      return;
    }

    setCreating(true);
    try {
      const response = await fetch(\/api/detection/rules?userId=\\, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRule)
      });

      const data = await response.json();
      if (data.success) {
        setRules([...rules, data.rule]);
        setNewRule({
          rule_name: '',
          rule_type: 'fuzzy_match',
          vendor_pattern: '',
          amount_tolerance: 5,
          days_apart_threshold: 7
        });
      }
    } catch (error) {
      console.error('Error creating rule:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleToggleRule = async (ruleId: string, enabled: boolean) => {
    try {
      const response = await fetch(\/api/detection/rules?ruleId=\\, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !enabled })
      });

      const data = await response.json();
      if (data.success) {
        setRules(rules.map(r => r.id === ruleId ? { ...r, enabled: !enabled } : r));
      }
    } catch (error) {
      console.error('Error toggling rule:', error);
    }
  };

  if (loading) {
    return <div className="text-slate-600">Loading rules...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Detection Rules</h2>

      {/* Create Rule Form */}
      <div className="bg-white rounded-lg p-6 shadow border border-slate-200">
        <h3 className="font-semibold text-slate-900 mb-4">Create New Rule</h3>
        
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Rule name"
            value={newRule.rule_name}
            onChange={(e) => setNewRule({ ...newRule, rule_name: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg"
          />

          <select
            value={newRule.rule_type}
            onChange={(e) => setNewRule({ ...newRule, rule_type: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg"
          >
            <option value="exact_match">Exact Vendor Match</option>
            <option value="fuzzy_match">Fuzzy Vendor Match (75%+)</option>
            <option value="custom">Custom Amount + Timing</option>
          </select>

          <input
            type="text"
            placeholder="Vendor pattern"
            value={newRule.vendor_pattern}
            onChange={(e) => setNewRule({ ...newRule, vendor_pattern: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg"
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-600 mb-1">Amount Tolerance (\$)</label>
              <input
                type="number"
                value={newRule.amount_tolerance}
                onChange={(e) => setNewRule({ ...newRule, amount_tolerance: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Days Apart Threshold</label>
              <input
                type="number"
                value={newRule.days_apart_threshold}
                onChange={(e) => setNewRule({ ...newRule, days_apart_threshold: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <button
            onClick={handleCreateRule}
            disabled={creating}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Create Rule'}
          </button>
        </div>
      </div>

      {/* Rules List */}
      <div className="space-y-3">
        <h3 className="font-semibold text-slate-900">Active Rules ({rules.filter(r => r.enabled).length})</h3>
        
        {rules.length === 0 ? (
          <div className="bg-slate-50 rounded-lg p-6 text-center text-slate-600">
            No rules yet. Create one above.
          </div>
        ) : (
          rules.map((rule) => (
            <div key={rule.id} className="bg-white rounded-lg p-4 border border-slate-200 flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900">{rule.rule_name}</h4>
                <p className="text-sm text-slate-600">
                  {rule.rule_type === 'exact_match' && 'Exact vendor match'}
                  {rule.rule_type === 'fuzzy_match' && 'Fuzzy vendor match (75%+)'}
                  {rule.rule_type === 'custom' && 'Custom amount + timing'}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  Vendor: {rule.vendor_pattern} | Tolerance: \ | Days: {rule.days_apart_threshold}
                </p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rule.enabled}
                  onChange={() => handleToggleRule(rule.id, rule.enabled)}
                  className="w-5 h-5 rounded border-slate-300"
                />
              </label>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
