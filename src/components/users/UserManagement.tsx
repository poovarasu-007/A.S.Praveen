import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { useAuth } from '../../context/AuthContext';
import { hashPassword } from '../../utils/security';
import { formatDate, formatTime } from '../../utils/date';
import type { User, UserRole } from '../../types';
import { UserCog, Plus, ShieldCheck, User as UserIcon, CheckCircle2, AlertCircle, Trash2, Key } from 'lucide-react';

export const UserManagement: React.FC = () => {
  const { currentUser } = useAuth();
  const users = useLiveQuery(() => db.users.toArray(), []) || [];

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('OPERATOR');
  const [errorMsg, setErrorMsg] = useState('');
  const [feedback, setFeedback] = useState('');

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim() || !password.trim() || !name.trim()) {
      setErrorMsg('Please enter Username, Full Name, and Password.');
      return;
    }

    // Check if user already exists
    const existing = await db.users.where('username').equalsIgnoreCase(username.trim()).first();
    if (existing) {
      setErrorMsg('A user with this username already exists.');
      return;
    }

    try {
      const passwordHash = await hashPassword(password);
      const now = new Date().toISOString();
      const newUser: User = {
        id: `usr_${Date.now()}`,
        username: username.trim().toLowerCase(),
        passwordHash,
        role,
        name: name.trim(),
        active: true,
        createdAt: now
      };

      await db.users.add(newUser);

      await db.auditLogs.add({
        id: `audit_${Date.now()}`,
        timestamp: now,
        date: formatDate(new Date()),
        time: formatTime(new Date()),
        user: currentUser?.username || 'admin',
        role: 'ADMIN',
        action: 'Created New User',
        recordType: 'USER',
        recordId: newUser.id,
        details: `Created user ${newUser.username} (${newUser.role})`
      });

      setFeedback(`User ${newUser.name} created successfully.`);
      setIsAddOpen(false);
      setUsername('');
      setName('');
      setPassword('');
      setRole('OPERATOR');
      setTimeout(() => setFeedback(''), 4000);
    } catch (err: any) {
      setErrorMsg('Failed to create user: ' + err?.message);
    }
  };

  const handleToggleActive = async (user: User) => {
    if (user.username === 'admin') {
      alert('Default admin account cannot be deactivated.');
      return;
    }

    const updatedStatus = !user.active;
    await db.users.update(user.id, { active: updatedStatus });

    await db.auditLogs.add({
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      date: formatDate(new Date()),
      time: formatTime(new Date()),
      user: currentUser?.username || 'admin',
      role: 'ADMIN',
      action: updatedStatus ? 'Activated User' : 'Deactivated User',
      recordType: 'USER',
      recordId: user.id,
      details: `${updatedStatus ? 'Activated' : 'Deactivated'} ${user.username}`
    });

    setFeedback(`User ${user.username} is now ${updatedStatus ? 'Active' : 'Deactivated'}.`);
    setTimeout(() => setFeedback(''), 4000);
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-agri-200 p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-agri-700 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            <UserCog className="w-5 h-5 text-agri-gold" />
          </div>
          <div>
            <h2 className="text-lg font-black text-agri-900 tracking-tight">
              USER ACCOUNTS & PERMISSIONS
            </h2>
            <p className="text-xs text-gray-500">
              Manage billing operators and system administrators
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center space-x-1.5 px-4 py-2 bg-agri-700 hover:bg-agri-800 text-white font-bold text-xs rounded-xl shadow transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 text-agri-gold" />
          <span>Add Operator / Admin</span>
        </button>
      </div>

      {feedback && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3 rounded-xl text-xs font-semibold flex items-center space-x-2 animate-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Users List Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-agri-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-agri-900 text-white text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3 px-3 text-center w-12">#</th>
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Username</th>
                <th className="py-3 px-3 text-center">Role</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((u, idx) => (
                <tr key={u.id} className="hover:bg-agri-50/40">
                  <td className="py-3 px-3 text-center text-gray-500 font-medium">{idx + 1}</td>
                  <td className="py-3 px-4 font-bold text-gray-900">{u.name}</td>
                  <td className="py-3 px-4 font-mono text-xs text-gray-700">@{u.username}</td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        u.role === 'ADMIN'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-agri-100 text-agri-800 border border-agri-300'
                      }`}
                    >
                      {u.role === 'ADMIN' ? <ShieldCheck className="w-3.5 h-3.5" /> : <UserIcon className="w-3.5 h-3.5" />}
                      <span>{u.role}</span>
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        u.active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {u.active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {u.username !== 'admin' && (
                      <button
                        onClick={() => handleToggleActive(u)}
                        className={`text-xs font-bold px-3 py-1 rounded-lg transition-colors ${
                          u.active
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                        }`}
                      >
                        {u.active ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200">
            <div className="bg-agri-800 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-base">Add New Account</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-agri-200 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-5 space-y-3.5 text-xs">
              {errorMsg && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg font-semibold flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. S. Kumar"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-agri-600"
                  autoFocus
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Username (Login ID)</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. kumar"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-agri-600 font-mono lowercase"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter login password"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-agri-600"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">System Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-agri-600 bg-white"
                >
                  <option value="OPERATOR">Billing Operator (Counter billing only)</option>
                  <option value="ADMIN">System Administrator (Full access, price editing, deletions)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-agri-700 hover:bg-agri-800 rounded-xl shadow"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
