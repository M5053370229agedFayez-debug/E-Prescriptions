import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  ShieldAlert, 
  Trash2, 
  Edit3, 
  Lock, 
  AlertCircle, 
  CheckCircle2, 
  EyeOff,
  UserCheck
} from 'lucide-react';
import { User, UserRole } from '../types/pharmacy';
import { PharmacyDatabaseService } from '../services/db';

interface UsersManagementViewProps {
  currentUser: User;
}

export const UsersManagementView: React.FC<UsersManagementViewProps> = ({ currentUser }) => {
  const db = PharmacyDatabaseService.getInstance();
  const [users, setUsers] = useState<User[]>([]);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State
  const [fullName, setFullName] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [role, setRole] = useState<UserRole>('Pharmacist');
  const [phone, setPhone] = useState<string>('');
  const [nationalId, setNationalId] = useState<string>('');

  const loadUsers = () => {
    // 4.1 Central repository call:
    // Automatically excludes Owner if currentUser is not Owner!
    setUsers(db.getUsers());
  };

  useEffect(() => {
    loadUsers();
  }, [currentUser]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !fullName.trim()) return;

    const newUser: User = {
      id: `user_${Date.now()}`,
      username: username.trim(),
      fullName: fullName.trim(),
      role,
      isActive: true,
      phone,
      nationalId,
      createdAt: new Date().toISOString(),
    };

    const result = await db.saveUser(newUser, true);
    if (result.success) {
      setFeedback({ type: 'success', message: result.message });
      setShowAddModal(false);
      resetForm();
      loadUsers();
    } else {
      // Specification 4.1: Generic message "اسم المستخدم غير متاح"
      setFeedback({ type: 'error', message: result.message });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('هل أنت متأكد من رغبتك في حذف هذا المستخدم؟')) return;
    const res = await db.deleteUser(userId);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      loadUsers();
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  const resetForm = () => {
    setFullName('');
    setUsername('');
    setRole('Pharmacist');
    setPhone('');
    setNationalId('');
  };

  return (
    <div className="p-6 bg-slate-900 min-h-full space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              إدارة المستخدمين وصلاحيات النظام
              <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30 font-mono">
                {users.length} مستخدم
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              الأدوار: مدير الفرع (Admin)، صيدلي أول (Pharmacist)، كاشير (Cashier)، محاسب (Accountant)
            </p>
          </div>
        </div>

        <button
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-lg shadow-indigo-600/30 active:scale-95 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>إضافة مستخدم جديد</span>
        </button>
      </div>

      {/* Specification 4.1 Notice Box */}
      <div className="p-4 bg-slate-950/70 border border-indigo-900/50 rounded-2xl text-xs space-y-2">
        <div className="font-bold text-indigo-400 flex items-center gap-2">
          <EyeOff className="w-4 h-4 text-amber-400" />
          <span>مواصفة دور المالك (Owner) وعزله في طبقة البيانات:</span>
        </div>
        <p className="text-slate-300 leading-relaxed">
          {currentUser.role === 'Owner' ? (
            <span className="text-amber-300 font-semibold">
              أنت مسجل الدخول حالياً كـ "Owner". يظهر لك حسابك الرئيسي في القائمة أدناه بالإضافة لسجل التدقيق السري.
            </span>
          ) : (
            <span className="text-slate-300">
              أنت مسجل الدخول كـ "{currentUser.role}". لاحظ أن حساب المالك (Owner) <strong className="text-amber-400">مخفي تماماً</strong> في طبقة البيانات والاستعلامات (Data Layer Scope)، ولا يظهر في عدّاد المستخدمين، ولا يمكن تعديله أو حذفه. وإذا حاولت إنشاء مستخدم باسم "dr_owner"، ستظهر رسالة محايدة <strong className="text-rose-400">"اسم المستخدم غير متاح"</strong> دون كشف سبب وجود المالك.
            </span>
          )}
        </p>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div className={`p-4 rounded-xl flex items-center justify-between text-xs font-bold ${
          feedback.type === 'success' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
        }`}>
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="hover:opacity-80">✕</button>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-900 text-slate-400 text-xs font-bold border-b border-slate-800">
                <th className="py-3 px-4">اسم المستخدم</th>
                <th className="py-3 px-4">الاسم الكامل</th>
                <th className="py-3 px-4">الدور الوظيفي</th>
                <th className="py-3 px-4">رقم الهاتف</th>
                <th className="py-3 px-4">تاريخ الإنشاء</th>
                <th className="py-3 px-4">الحالة</th>
                <th className="py-3 px-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-white flex items-center gap-2">
                    {u.role === 'Owner' && <Lock className="w-3.5 h-3.5 text-amber-400" />}
                    <span>@{u.username}</span>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-200">{u.fullName}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      u.role === 'Owner' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      u.role === 'Admin' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                      u.role === 'Pharmacist' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400">{u.phone || '—'}</td>
                  <td className="py-3 px-4 font-mono text-slate-400">
                    {new Date(u.createdAt).toLocaleDateString('ar-EG')}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold">
                      نشط
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {u.role === 'Owner' ? (
                      <span className="text-[10px] text-amber-400 font-bold bg-amber-950/40 px-2 py-1 rounded">
                        محمي نهائياً
                      </span>
                    ) : (
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors"
                        title="حذف المستخدم"
                      >
                        <Trash2 className="w-4 h-4" />
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
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-md w-full shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-400" />
                إضافة مستخدم جديد
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">اسم المستخدم (Username) *</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="مثال: ph_mahmoud"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">الاسم الكامل *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="د. محمود عبد العزيز"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">الدور الوظيفي *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                >
                  <option value="Admin">مدير الفرع (Admin)</option>
                  <option value="Pharmacist">صيدلي أول (Pharmacist)</option>
                  <option value="Cashier">كاشير (Cashier)</option>
                  <option value="Accountant">محاسب (Accountant)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">رقم الهاتف</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01012345678"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow"
                >
                  حفظ المستخدم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
