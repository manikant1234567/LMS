import React, { useEffect, useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

const Stat = ({ title, value, sub }) => (
  <div className="card p-4">
    <div className="text-slate-500 text-sm">{title}</div>
    <div className="text-2xl font-semibold text-slate-800 mt-1">{value}</div>
    {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [loans, setLoans] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    api.get('/books').then((res) => setBooks(res.data));
    api.get('/loans/mine').then((res) => setLoans(res.data));
    if (['admin', 'librarian'].includes(user.role)) {
      api.get('/loans/overdue').then((res) => setOverdue(res.data));
      api.get('/reservations').then((res) => setReservations(res.data));
    } else {
      api.get('/reservations/mine').then((res) => setReservations(res.data));
    }
  }, [user.role]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat title="Total books" value={books.length} />
        <Stat title="Borrowed" value={loans.filter((l) => !l.returnedAt).length} />
        <Stat title="Reservations" value={reservations.length} />
        <Stat
          title="Overdue"
          value={overdue.length}
          sub={overdue[0] ? `Nearest: ${format(overdue[0].dueDate, 'MMM d')}` : 'All clear'}
        />
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-lg font-semibold text-slate-800">My loans</div>
          <div className="text-sm text-slate-500">Due and history</div>
        </div>
        <div className="divide-y divide-slate-100">
          {loans.map((loan) => (
            <div key={loan._id} className="py-3 flex items-center justify-between">
              <div>
                <div className="font-medium text-slate-800">{loan.book.title}</div>
                <div className="text-xs text-slate-500">
                  Due {format(new Date(loan.dueDate), 'MMM d, yyyy')} •{' '}
                  {loan.returnedAt
                    ? `Returned ${format(new Date(loan.returnedAt), 'MMM d')}`
                    : formatDistanceToNow(new Date(loan.dueDate), { addSuffix: true })}
                </div>
              </div>
              <div className="text-sm text-slate-500">
                {loan.returnedAt ? (
                  <span className="text-emerald-600">Returned</span>
                ) : (
                  <span className="text-amber-600">On loan</span>
                )}
              </div>
            </div>
          ))}
          {loans.length === 0 && <div className="text-sm text-slate-500 py-4">No loans yet.</div>}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

