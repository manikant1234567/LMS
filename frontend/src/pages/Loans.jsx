import React, { useEffect, useState } from 'react';
import api from '../api/client.js';
import { format } from 'date-fns';

const Loans = () => {
  const [loans, setLoans] = useState([]);
  const [form, setForm] = useState({ userId: '', bookId: '' });
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);

  const load = () => api.get('/loans').then((res) => setLoans(res.data));
  useEffect(() => {
    load();
    api.get('/users').then((res) => setUsers(res.data));
    api.get('/books').then((res) => setBooks(res.data));
  }, []);

  const issue = async (e) => {
    e.preventDefault();
    if (!form.userId || !form.bookId) return;
    await api.post('/loans/issue', form);
    setForm({ userId: '', bookId: '' });
    load();
  };

  const markReturn = async (loanId) => {
    await api.post('/loans/return', { loanId });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="card p-4">
        <div className="font-semibold text-slate-800 mb-3">Issue a book</div>
        <form className="grid grid-cols-1 md:grid-cols-3 gap-3" onSubmit={issue}>
          <select
            value={form.userId}
            onChange={(e) => setForm((f) => ({ ...f, userId: e.target.value }))}
            className="rounded-lg border border-slate-200 px-3 py-2 focus:border-primary focus:ring-2 focus:ring-blue-100 outline-none"
          >
            <option value="">Select member</option>
            {users
              .filter((u) => u.role === 'member')
              .map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.email})
                </option>
              ))}
          </select>
          <select
            value={form.bookId}
            onChange={(e) => setForm((f) => ({ ...f, bookId: e.target.value }))}
            className="rounded-lg border border-slate-200 px-3 py-2 focus:border-primary focus:ring-2 focus:ring-blue-100 outline-none"
          >
            <option value="">Select book</option>
            {books.map((b) => (
              <option key={b._id} value={b._id}>
                {b.title} (ISBN {b.isbn})
              </option>
            ))}
          </select>
          <button className="btn btn-primary" type="submit">
            Issue
          </button>
        </form>
        <p className="text-xs text-slate-500 mt-2">Tip: choose member by email; copy Book ID from list.</p>
      </div>

      <div className="card p-4">
        <div className="font-semibold text-slate-800 mb-3">All loans</div>
        <div className="divide-y divide-slate-100">
          {loans.map((loan) => (
            <div key={loan._id} className="py-3 flex items-center justify-between gap-4">
              <div>
                <div className="font-medium text-slate-800">{loan.book?.title}</div>
                <div className="text-xs text-slate-500">
                  {loan.user?.name} • Due {format(new Date(loan.dueDate), 'MMM d, yyyy')}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!loan.returnedAt ? (
                  <button className="btn btn-ghost" onClick={() => markReturn(loan._id)}>
                    Mark returned
                  </button>
                ) : (
                  <span className="text-xs text-emerald-600">Returned</span>
                )}
              </div>
            </div>
          ))}
          {loans.length === 0 && <div className="text-sm text-slate-500 py-4">No loans</div>}
        </div>
      </div>
    </div>
  );
};

export default Loans;

