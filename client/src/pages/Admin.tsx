import React, { useEffect, useState } from 'react';
import { ShieldAlert, Users, Shirt, Sparkles, MessageSquare, AlertCircle, CheckCircle2, Server } from 'lucide-react';
import api from '@/services/api';
import AppLayout from '@/components/layout/AppLayout';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import toast from 'react-hot-toast';

export default function Admin() {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [health, setHealth] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats').catch(() => null),
      api.get('/admin/users').catch(() => ({ data: [] })),
      api.get('/admin/reports').catch(() => ({ data: [] })),
      api.get('/admin/health').catch(() => null),
    ]).then(([statsRes, usersRes, reportsRes, healthRes]) => {
      setStats(statsRes);
      setUsers(usersRes?.data || []);
      setReports(reportsRes?.data || []);
      setHealth(healthRes);
      setIsLoading(false);
    });
  }, []);

  const handleResolveReport = async (id: string, action: string) => {
    try {
      await api.put(`/admin/reports/${id}`, {
        status: 'resolved',
        action,
      });
      setReports(reports.filter((r) => r.id !== id));
      toast.success(`Report resolved with action: ${action}`);
    } catch {
      toast.error('Failed to resolve report.');
    }
  };

  const handleToggleUserStatus = async (user: any) => {
    try {
      await api.put(`/admin/users/${user.id}/status`, {
        isActive: !user.isActive,
      });
      setUsers(users.map((u) => (u.id === user.id ? { ...u, isActive: !u.isActive } : u)));
      toast.success(`User ${!user.isActive ? 'activated' : 'suspended'}`);
    } catch {
      toast.error('Failed to update user status.');
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8 animate-fadeIn">
        {/* Header */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-cream-300 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-burgundy-50 border border-burgundy-200 text-burgundy-800 text-xs font-semibold">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Administrative Portal • Restricted Access</span>
            </div>
            <h1 className="text-2xl font-extrabold text-charcoal-950 tracking-tight">
              FITSYNC Admin & Moderation
            </h1>
            <p className="text-xs text-charcoal-500">
              System monitoring, compliance logs, reported content moderation, and user management
            </p>
          </div>
        </div>

        {/* 1. Metric Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-cream-300 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-burgundy-50 text-burgundy-800 flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-bold text-charcoal-950 block">{stats?.userCount || 0}</span>
              <span className="text-xs text-charcoal-500">Registered Users</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-cream-300 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cream-100 text-charcoal-700 flex items-center justify-center font-bold">
              <Shirt className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-bold text-charcoal-950 block">{stats?.itemCount || 0}</span>
              <span className="text-xs text-charcoal-500">Wardrobe Items</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-cream-300 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 text-green-700 flex items-center justify-center font-bold">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-bold text-charcoal-950 block">{stats?.outfitCount || 0}</span>
              <span className="text-xs text-charcoal-500">AI Outfits Generated</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-cream-300 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-bold text-charcoal-950 block">{stats?.reportCount || 0}</span>
              <span className="text-xs text-charcoal-500">Pending Reports</span>
            </div>
          </div>
        </div>

        {/* 2. System Health & AI Provider Status */}
        <section className="bg-white rounded-3xl border border-cream-300 p-6 shadow-card space-y-4">
          <div className="flex items-center gap-2 border-b border-cream-200 pb-3">
            <Server className="w-4 h-4 text-burgundy-800" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-charcoal-800">
              Engine Health & AI Provider Status
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-cream-50 rounded-2xl border border-cream-200">
              <span className="text-charcoal-400 block mb-1">Database Engine</span>
              <span className="font-bold text-charcoal-900 block capitalize">
                SQLite3 (WAL Mode) • {health?.database?.status || 'Active'}
              </span>
            </div>

            <div className="p-4 bg-cream-50 rounded-2xl border border-cream-200">
              <span className="text-charcoal-400 block mb-1">AI Styling Model</span>
              <span className="font-bold text-charcoal-900 block uppercase">
                {health?.aiService?.provider || 'Demo Provider'} ({health?.aiService?.status || 'Ready'})
              </span>
            </div>

            <div className="p-4 bg-cream-50 rounded-2xl border border-cream-200">
              <span className="text-charcoal-400 block mb-1">System Uptime</span>
              <span className="font-bold text-charcoal-900 block">
                {health?.uptime ? `${Math.round(health.uptime)} seconds` : 'Nominal'}
              </span>
            </div>
          </div>
        </section>

        {/* 3. Moderation Queue */}
        <section className="bg-white rounded-3xl border border-cream-300 p-6 shadow-card space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-charcoal-800 border-b border-cream-200 pb-3">
            Community Moderation Queue ({reports.length})
          </h2>

          {reports.length === 0 ? (
            <div className="p-8 text-center text-xs text-charcoal-400">
              No pending reports. All community posts comply with acceptable conduct.
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <div key={report.id} className="p-4 bg-cream-50 rounded-2xl border border-cream-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-charcoal-900 block">
                      Target: {report.targetType} • Reason: {report.reason}
                    </span>
                    {report.details && (
                      <p className="text-xs text-charcoal-600 italic">"{report.details}"</p>
                    )}
                    <span className="text-[10px] text-charcoal-400">
                      Reported by {report.reporter?.displayName || 'User'} on {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResolveReport(report.id, 'none')}
                    >
                      Dismiss
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleResolveReport(report.id, 'remove_content')}
                    >
                      Remove Content
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 4. User Directory */}
        <section className="bg-white rounded-3xl border border-cream-300 p-6 shadow-card space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-charcoal-800 border-b border-cream-200 pb-3">
            User Accounts ({users.length})
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-100 text-charcoal-600 uppercase text-[10px] tracking-wider font-bold">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Display Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 rounded-r-xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-cream-50/50">
                    <td className="py-3.5 px-4 font-semibold text-charcoal-900">{u.displayName}</td>
                    <td className="py-3.5 px-4 text-charcoal-500">{u.email}</td>
                    <td className="py-3.5 px-4">
                      <Badge variant={u.role === 'admin' ? 'burgundy' : 'cream'} size="sm">
                        {u.role}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 font-semibold ${u.isActive ? 'text-green-700' : 'text-red-600'}`}>
                        {u.isActive ? '● Active' : '○ Suspended'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant={u.isActive ? 'outline' : 'primary'}
                        size="sm"
                        onClick={() => handleToggleUserStatus(u)}
                      >
                        {u.isActive ? 'Suspend' : 'Activate'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
