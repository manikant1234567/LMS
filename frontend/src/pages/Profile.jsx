import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    api.get('/users/profile').then((res) => setProfile(res.data));
  }, []);

  if (!profile) return <div className="p-4">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="card p-4 flex items-center justify-between">
        <div>
          <div className="text-xl font-semibold text-slate-800">{user.name}</div>
          <div className="text-sm text-slate-500">{user.email}</div>
          <div className="text-xs text-slate-500 mt-1 capitalize">{user.role}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-500">Outstanding fines</div>
          <div className="text-2xl font-semibold text-amber-600">${profile.outstandingFine || 0}</div>
        </div>
      </div>

      <div className="card p-4">
        <div className="font-semibold text-slate-800 mb-3">My loans</div>
        <div className="divide-y divide-slate-100">
          {profile.loans.map((loan) => (
            <div key={loan._id} className="py-3 flex items-center justify-between">
              <div>
                <div className="font-medium text-slate-800">{loan.book?.title}</div>
                <div className="text-xs text-slate-500">
                  Due {format(new Date(loan.dueDate), 'MMM d, yyyy')}
                  {loan.returnedAt && ` • Returned ${format(new Date(loan.returnedAt), 'MMM d, yyyy')}`}
                </div>
              </div>
              <div className="text-xs text-slate-500">
                {loan.returnedAt ? (
                  <span className="text-emerald-600">Returned</span>
                ) : (
                  <span className="text-amber-600">On loan</span>
                )}
              </div>
            </div>
          ))}
          {profile.loans.length === 0 && <div className="text-sm text-slate-500 py-3">No loans yet.</div>}
        </div>
      </div>

      <div className="card p-4">
        <div className="font-semibold text-slate-800 mb-3">My reservations</div>
        <div className="divide-y divide-slate-100">
          {profile.reservations.map((item) => (
            <div key={item._id} className="py-3 flex items-center justify-between">
              <div>
                <div className="font-medium text-slate-800">{item.book?.title}</div>
                <div className="text-xs text-slate-500">
                  Position {item.position} • {item.status}
                </div>
              </div>
            </div>
          ))}
          {profile.reservations.length === 0 && (
            <div className="text-sm text-slate-500 py-3">No reservations.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

