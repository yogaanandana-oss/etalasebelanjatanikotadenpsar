const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, RefreshCw, Search, Lock, Users, Shield, User as UserIcon, Loader2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import BaliPattern from '@/components/marketplace/BaliPattern';
import { format } from 'date-fns';

export default function AdminUsers() {
  const { toast } = useToast();
  const [me, setMe] = useState(null);
  const [denied, setDenied] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [updating, setUpdating] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await db.entities.User.list('-created_date', 500);
      const list = Array.isArray(data) ? data : data.items || [];
      setUsers(list);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    db.auth.me().then(setMe).catch(() => setMe(null));
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (me && me.role !== 'admin') setDenied(true);
  }, [me]);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter !== 'all' && (u.role || 'user') !== roleFilter) return false;
      if (query) {
        const q = query.toLowerCase();
        const hay = `${u.full_name || ''} ${u.email || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [users, query, roleFilter]);

  const counts = useMemo(() => {
    const admins = users.filter((u) => (u.role || 'user') === 'admin').length;
    return { total: users.length, admins, customers: users.length - admins };
  }, [users]);

  const changeRole = async (user, role) => {
    setUpdating(user.id);
    try {
      await db.entities.User.update(user.id, { role });
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, role } : u)));
      toast({
        description:
          role === 'admin'
            ? `${user.full_name || user.email} kini admin / now admin`
            : `${user.full_name || user.email} kini pelanggan / now customer`,
      });
    } catch (err) {
      toast({ description: 'Gagal mengubah peran / Failed to update role: ' + (err?.message || ''), variant: 'destructive' });
    } finally {
      setUpdating(null);
    }
  };

  if (denied) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-center px-6">
        <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
          <Lock className="w-7 h-7 text-destructive" />
        </div>
        <p className="font-display font-semibold text-foreground">Akses ditolak</p>
        <p className="text-sm text-muted-foreground/70">Access denied</p>
        <p className="text-sm text-muted-foreground">Halaman ini khusus admin.</p>
        <p className="text-sm text-muted-foreground/70">This page is admin-only.</p>
        <Button asChild variant="outline" className="rounded-full mt-2">
          <Link to="/"><ArrowLeft className="w-4 h-4 mr-1.5" />Kembali / Back</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-12">
      <div className="border-b border-border bg-background sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 lg:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="icon" className="rounded-full">
              <Link to="/"><ArrowLeft className="w-5 h-5" /></Link>
            </Button>
            <div className="leading-tight">
              <p className="font-display font-bold text-foreground">Kelola Pengguna</p>
              <p className="text-[0.7em] text-muted-foreground/70">Manage Users</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="rounded-full" onClick={fetchUsers} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />Muat ulang
          </Button>
        </div>
      </div>

      <BaliPattern className="text-primary/25" height={20} />

      <main className="max-w-5xl mx-auto px-4 lg:px-6 py-6 space-y-6">
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4 rounded-xl">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="w-4 h-4" />
              <span className="text-xs">Total / Total</span>
            </div>
            <p className="font-display font-extrabold text-2xl text-foreground mt-1">{counts.total}</p>
          </Card>
          <Card className="p-4 rounded-xl">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span className="text-xs">Admin</span>
            </div>
            <p className="font-display font-extrabold text-2xl text-foreground mt-1">{counts.admins}</p>
          </Card>
          <Card className="p-4 rounded-xl">
            <div className="flex items-center gap-2 text-muted-foreground">
              <UserIcon className="w-4 h-4" />
              <span className="text-xs">Pelanggan / Customers</span>
            </div>
            <p className="font-display font-extrabold text-2xl text-foreground mt-1">{counts.customers}</p>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama / email…"
              className="pl-9"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="sm:w-48 rounded-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Peran / All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="user">Pelanggan / Customer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card className="rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-10 flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />Memuat pengguna… / Loading users…
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center">
              <p className="font-display font-semibold text-foreground">Tidak ada pengguna cocok</p>
              <p className="text-sm text-muted-foreground/70 mt-1">No matching users</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((u) => {
                const isAdmin = (u.role || 'user') === 'admin';
                const isSelf = me && u.id === me.id;
                return (
                  <div key={u.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${isAdmin ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
                        {(u.full_name || u.email || '?').charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">
                          {u.full_name || '(Tanpa nama / No name)'}
                          {isSelf && <span className="text-xs text-muted-foreground ml-2">(Anda / You)</span>}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">{u.email}</p>
                        <p className="text-xs text-muted-foreground/70 mt-0.5">
                          Bergabung / Joined: {u.created_date ? format(new Date(u.created_date), 'dd MMM yyyy') : '-'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:justify-end flex-wrap">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${isAdmin ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        {isAdmin ? 'Admin' : 'Pelanggan / Customer'}
                      </span>
                      {isSelf ? (
                        <span className="text-xs text-muted-foreground/70 px-2">Tidak bisa ubah diri sendiri / Cannot edit self</span>
                      ) : isAdmin ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                          disabled={updating === u.id}
                          onClick={() => changeRole(u, 'user')}
                        >
                          {updating === u.id ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <UserIcon className="w-4 h-4 mr-1.5" />}
                          Jadikan Pelanggan
                        </Button>
                      ) : (
                        <Button
                          variant="default"
                          size="sm"
                          className="rounded-full"
                          disabled={updating === u.id}
                          onClick={() => changeRole(u, 'admin')}
                        >
                          {updating === u.id ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Shield className="w-4 h-4 mr-1.5" />}
                          Jadikan Admin
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}