import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { AlertCircle, CheckCircle2, Key, Plus, ShieldCheck, User as UserIcon, UserCog, X } from 'lucide-react';
import { db } from '../../db/db';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { hashPassword } from '../../utils/security';
import { formatDate } from '../../utils/date';
import type { User, UserRole } from '../../types';

export const UserManagement: React.FC = () => {
  const { currentUser } = useAuth();
  const { t, language } = useSettings();
  const users = useLiveQuery(() => db.users.toArray(), []) || [];
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('OPERATOR');
  const [errorMsg, setErrorMsg] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetUser, setResetUser] = useState<User | null>(null);
  const [resetNewPassword, setResetNewPassword] = useState('');

  const audit = async (action: string, recordId: string, details: string) => db.auditLogs.add({ id: `audit_${Date.now()}`, timestamp: new Date().toISOString(), date: formatDate(new Date(), language), time: new Date().toLocaleTimeString(language === 'ta' ? 'ta-IN' : 'en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }), user: currentUser?.username || 'admin', role: 'ADMIN', action, recordType: 'USER', recordId, details });

  const handleResetPassword = async (event: React.FormEvent) => {
    event.preventDefault(); if (!resetUser) return; setErrorMsg('');
    if (resetNewPassword.length < 4) { setErrorMsg(t.authMinPassword); return; }
    try { await db.users.update(resetUser.id, { passwordHash: await hashPassword(resetNewPassword) }); await audit('Admin Reset Password', resetUser.id, `Administrator reset password for ${resetUser.username}`); setFeedback(`${t.success}: ${resetUser.username}`); setIsResetOpen(false); setResetUser(null); setResetNewPassword(''); window.setTimeout(() => setFeedback(''), 4000); } catch (err: any) { setErrorMsg(`${t.error}: ${err?.message || ''}`); }
  };

  const handleCreateUser = async (event: React.FormEvent) => {
    event.preventDefault(); setErrorMsg('');
    if (!username.trim() || !password.trim() || !name.trim()) { setErrorMsg(t.authRequired); return; }
    if (await db.users.where('username').equalsIgnoreCase(username.trim()).first()) { setErrorMsg(t.usernameExists); return; }
    try {
      const newUser: User = { id: `usr_${Date.now()}`, username: username.trim().toLowerCase(), passwordHash: await hashPassword(password), role, name: name.trim(), active: true, createdAt: new Date().toISOString() };
      await db.users.add(newUser); await audit('Created New User', newUser.id, `Created user ${newUser.username} (${newUser.role})`); setFeedback(`${t.success}: ${newUser.name}`); setIsAddOpen(false); setUsername(''); setName(''); setPassword(''); setRole('OPERATOR'); window.setTimeout(() => setFeedback(''), 4000);
    } catch (err: any) { setErrorMsg(`${t.error}: ${err?.message || ''}`); }
  };

  const handleToggleActive = async (user: User) => {
    if (user.username === 'admin') { setErrorMsg(t.settingsViewOnly); return; }
    const active = !user.active; await db.users.update(user.id, { active }); await audit(active ? 'Activated User' : 'Deactivated User', user.id, `${active ? 'Activated' : 'Deactivated'} ${user.username}`); setFeedback(`${t.success}: ${user.username}`); window.setTimeout(() => setFeedback(''), 4000);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-4 pb-8">
      <section className="card-glass flex flex-wrap items-center justify-between gap-3 p-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-900 text-primary-100"><UserCog size={20} aria-hidden="true" /></div><div><h1 className="text-lg font-semibold text-primary-900">{t.users}</h1><p className="text-xs text-text-tertiary">{t.usersDescription}</p></div></div><button type="button" onClick={() => { setErrorMsg(''); setIsAddOpen(true); }} className="btn-primary px-4 py-2 text-xs"><Plus size={15} aria-hidden="true" />{t.addAccount}</button></section>
      {feedback && <div className="flex items-center gap-2 rounded-xl border border-success bg-success-bg p-3 text-xs font-semibold text-secondary-700" role="status"><CheckCircle2 size={16} aria-hidden="true" />{feedback}</div>}
      {errorMsg && !isAddOpen && !isResetOpen && <div className="flex items-center gap-2 rounded-xl border border-error bg-error-bg p-3 text-xs font-semibold text-error" role="alert"><AlertCircle size={16} aria-hidden="true" />{errorMsg}</div>}
      <section className="card-glass overflow-hidden"><div className="overflow-x-auto"><table className="table-arch"><thead><tr><th>#</th><th>{t.fullName}</th><th>{t.username}</th><th>{t.role}</th><th>{t.status}</th><th>{t.action}</th></tr></thead><tbody>{users.map((user, index) => <tr key={user.id}><td className="text-center text-text-tertiary">{index + 1}</td><td className="font-semibold text-primary-900">{user.name}</td><td className="font-mono text-xs text-text-secondary">@{user.username}</td><td><span className={`badge-${user.role === 'ADMIN' ? 'warning' : 'info'}`}>{user.role === 'ADMIN' ? <ShieldCheck size={13} aria-hidden="true" /> : <UserIcon size={13} aria-hidden="true" />}{user.role === 'ADMIN' ? t.roleAdmin : t.roleOperator}</span></td><td><span className={user.active ? 'badge-success' : 'badge-danger'}>{user.active ? t.active : t.disabled}</span></td><td><div className="flex justify-center gap-1.5"><button type="button" onClick={() => { setResetUser(user); setResetNewPassword(''); setErrorMsg(''); setIsResetOpen(true); }} className="btn-light px-2.5 py-1 text-xs" title={t.resetPassword}><Key size={13} aria-hidden="true" />{t.resetKey}</button>{user.username !== 'admin' && <button type="button" onClick={() => handleToggleActive(user)} className={user.active ? 'btn-danger px-3 py-1 text-xs' : 'btn-light px-3 py-1 text-xs'}>{user.active ? t.deactivate : t.activate}</button>}</div></td></tr>)}</tbody></table></div></section>

      {isAddOpen && <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="add-account-title"><div className="w-full max-w-md overflow-hidden rounded-2xl border border-primary-200 bg-white shadow-soft-lg"><div className="flex items-center justify-between bg-primary-900 p-4 text-white"><h2 id="add-account-title" className="font-semibold">{t.addNewAccount}</h2><button type="button" onClick={() => setIsAddOpen(false)} className="rounded p-1 text-primary-100 hover:bg-white/10" aria-label={t.close}><X size={18} aria-hidden="true" /></button></div><form onSubmit={handleCreateUser} className="space-y-3.5 p-5 text-xs">{errorMsg && <div className="flex items-center gap-2 rounded-lg border border-error bg-error-bg p-2.5 font-semibold text-error"><AlertCircle size={15} aria-hidden="true" />{errorMsg}</div>}<div><label className="label-arch" htmlFor="managed-name">{t.fullName}</label><input id="managed-name" className="input-arch" value={name} onChange={(event) => setName(event.target.value)} placeholder={t.fullNamePlaceholder} autoFocus /></div><div><label className="label-arch" htmlFor="managed-username">{t.username}</label><input id="managed-username" className="input-arch font-mono lowercase" value={username} onChange={(event) => setUsername(event.target.value)} placeholder={t.usernamePlaceholder} /></div><div><label className="label-arch" htmlFor="managed-password">{t.password}</label><input id="managed-password" className="input-arch" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder={t.loginPassword} /></div><div><label className="label-arch" htmlFor="managed-role">{t.role}</label><select id="managed-role" className="input-arch" value={role} onChange={(event) => setRole(event.target.value as UserRole)}><option value="OPERATOR">{t.operatorOption}</option><option value="ADMIN">{t.adminOption}</option></select></div><div className="flex justify-end gap-2 border-t border-border-subtle pt-3"><button type="button" onClick={() => setIsAddOpen(false)} className="btn-light px-4 py-2 text-xs">{t.cancel}</button><button type="submit" className="btn-primary px-5 py-2 text-xs">{t.createAccountButton}</button></div></form></div></div>}

      {isResetOpen && resetUser && <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="reset-password-title"><div className="w-full max-w-sm overflow-hidden rounded-2xl border border-primary-200 bg-white shadow-soft-lg"><div className="flex items-center justify-between bg-primary-900 p-4 text-white"><h2 id="reset-password-title" className="flex items-center gap-2 text-sm font-semibold"><Key size={15} aria-hidden="true" />{t.resetPassword}</h2><button type="button" onClick={() => { setIsResetOpen(false); setResetUser(null); }} className="rounded p-1 text-primary-100 hover:bg-white/10" aria-label={t.close}><X size={18} aria-hidden="true" /></button></div><form onSubmit={handleResetPassword} className="space-y-3.5 p-5 text-xs"><div className="rounded-xl border border-primary-100 bg-primary-50 p-2.5"><div className="font-medium text-text-tertiary">{t.userAccount}</div><div className="text-sm font-semibold text-primary-900">{resetUser.name} <span className="font-mono text-xs text-text-tertiary">(@{resetUser.username})</span></div></div>{errorMsg && <div className="flex items-center gap-2 rounded-lg border border-error bg-error-bg p-2.5 font-semibold text-error"><AlertCircle size={15} aria-hidden="true" />{errorMsg}</div>}<div><label className="label-arch" htmlFor="managed-reset-password">{t.newPassword}</label><input id="managed-reset-password" className="input-arch" type="password" value={resetNewPassword} onChange={(event) => setResetNewPassword(event.target.value)} placeholder={t.authMinChars} autoFocus /></div><div className="flex justify-end gap-2 border-t border-border-subtle pt-3"><button type="button" onClick={() => { setIsResetOpen(false); setResetUser(null); }} className="btn-light px-4 py-2 text-xs">{t.cancel}</button><button type="submit" className="btn-primary px-5 py-2 text-xs">{t.savePassword}</button></div></form></div></div>}
    </div>
  );
};
