import React, { useEffect, useState } from 'react';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import Modal from '../components/Modal.jsx';

const empty = {
  title: '',
  author: '',
  isbn: '',
  category: '',
  year: '',
  description: '',
  quantity: 1
};
// near the top of Books component
const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

const Books = () => {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [myLoanBookIds, setMyLoanBookIds] = useState(new Set());
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [pendingBorrow, setPendingBorrow] = useState(new Set());
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, type: 'alert', title: '', message: '', confirmText: 'OK', cancelText: 'Cancel', onConfirm: null, bookId: null });

  const load = () => {
    const params = {};
    if (query) params.q = query;
    if (category) params.category = category;
    if (onlyAvailable) params.available = true;
    api.get('/books', { params }).then((res) => setBooks(res.data));
  };

  // load user's current loans so we can prevent duplicate borrows
  const loadMyLoans = async () => {
    try {
      const res = await api.get('/loans/mine');
      // Only include active (unreturned) loans
      const ids = new Set(
        res.data
          .filter((l) => !l.returnedAt)
          .map((l) => String(l.book?._id || l.book))
      );
      setMyLoanBookIds(ids);
    } catch (err) {
      // ignore
    }
  };

  const handleBorrowConfirm = async (bookId) => {
    try {
      setPendingBorrow((s) => new Set([...s, String(bookId)]));
      await api.post('/loans/issue', { bookId });
      await load();
      await loadMyLoans();
      setModal({ isOpen: false, type: 'alert', title: '', message: '', confirmText: 'OK', cancelText: 'Cancel', onConfirm: null, bookId: null });
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to borrow book';
      setModal({
        isOpen: true,
        type: 'alert',
        title: 'Error',
        message: msg,
        confirmText: 'OK',
        cancelText: 'Cancel',
        onConfirm: () => setModal({ ...modal, isOpen: false }),
        bookId: null
      });
    } finally {
      setPendingBorrow((s) => {
        const copy = new Set(s);
        copy.delete(String(bookId));
        return copy;
      });
    }
  };

  const borrow = (bookId) => {
    // prevent borrowing if user already has this book
    if (myLoanBookIds.has(String(bookId))) {
      setModal({
        isOpen: true,
        type: 'alert',
        title: 'Already Borrowed',
        message: 'You already have this book on loan.',
        confirmText: 'OK',
        cancelText: 'Cancel',
        onConfirm: () => setModal({ ...modal, isOpen: false }),
        bookId: null
      });
      return;
    }

    setModal({
      isOpen: true,
      type: 'confirm',
      title: 'Confirm Borrow',
      message: 'Are you sure you want to borrow this book?',
      confirmText: 'Borrow',
      cancelText: 'Cancel',
      onConfirm: () => handleBorrowConfirm(bookId),
      bookId
    });
  };

  useEffect(() => {
    load();
    loadMyLoans();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    const request = editing
      ? api.put(`/books/${editing}`, fd)
      : api.post('/books', fd);
    await request;
    setForm(empty);
    setEditing(null);
    load();
  };

  const handleEdit = (book) => {
    setForm({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      category: book.category || '',
      year: book.year || '',
      description: book.description || '',
      quantity: book.quantity
    });
    setEditing(book._id);
  };

  const handleDelete = async (id) => {
    await api.delete(`/books/${id}`);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="card p-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="flex gap-2">
          <input
            placeholder="Search by title or author"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-56 rounded-lg border border-slate-200 px-3 py-2 focus:border-primary focus:ring-2 focus:ring-blue-100 outline-none"
          />
          <input
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-40 rounded-lg border border-slate-200 px-3 py-2 focus:border-primary focus:ring-2 focus:ring-blue-100 outline-none"
          />
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={onlyAvailable} onChange={(e) => setOnlyAvailable(e.target.checked)} />
            Available
          </label>
          <button className="btn btn-primary" onClick={load}>Filter</button>
        </div>
        {['admin', 'librarian'].includes(user.role) && (
          <span className="text-sm text-slate-500">
            {editing ? 'Editing book' : 'Add new book'} • cover optional
          </span>
        )}
      </div>

      {['admin', 'librarian'].includes(user.role) && (
        <div className="card p-4">
          <form className="grid grid-cols-1 md:grid-cols-3 gap-3" onSubmit={handleSubmit}>
            {Object.keys(empty).map((key) => (
              <div key={key} className="flex flex-col">
                <label className="text-xs text-slate-500 capitalize">{key}</label>
                <input
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="rounded-lg border border-slate-200 px-3 py-2 focus:border-primary focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>
            ))}
            <div>
              <label className="text-xs text-slate-500">Cover image</label>
              <input
                type="file"
                onChange={(e) => setForm((f) => ({ ...f, cover: e.target.files[0] }))}
                className="rounded-lg border border-slate-200 px-3 py-2"
              />
            </div>
            <div className="md:col-span-3 flex gap-2">
              <button className="btn btn-primary" type="submit">
                {editing ? 'Update book' : 'Add book'}
              </button>
              {editing && (
                <button type="button" className="btn btn-ghost" onClick={() => { setEditing(null); setForm(empty); }}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {books.map((book) => (
            <div key={book._id} className="card p-4 space-y-3">
            <div className="overflow-hidden rounded-lg bg-slate-100 h-40 w-full">
                {book.coverImage && (
                <img
                    src={`${apiBase}${book.coverImage}`}
                    alt={book.title}
                    className="w-full h-full object-cover"
                />
                )}
            </div>
            <div className="flex justify-between items-start">
                <div>
                <div className="font-semibold text-slate-800">{book.title}</div>
                <div className="text-sm text-slate-500">{book.author}</div>
                </div>
                <span className="text-xs text-slate-500">ISBN {book.isbn}</span>
            </div>
            <div className="text-sm text-slate-600 line-clamp-3">{book.description}</div>
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>{book.category || 'Uncategorized'}</span>
              <span>
                {book.available}/{book.quantity} available
              </span>
            </div>
            <div className="flex gap-2">
              {['admin', 'librarian'].includes(user.role) && (
                <>
                  <button className="btn btn-ghost" onClick={() => handleEdit(book)}>Edit</button>
                  <button className="btn btn-ghost text-red-600" onClick={() => handleDelete(book._id)}>Delete</button>
                </>
              )}
              {user.role === 'member' && book.available > 0 && (
                <button
                  className="btn btn-primary"
                  onClick={() => borrow(book._id)}
                  disabled={pendingBorrow.has(String(book._id)) || myLoanBookIds.has(String(book._id))}
                >
                  {pendingBorrow.has(String(book._id)) ? 'Borrowing...' : myLoanBookIds.has(String(book._id)) ? 'Already borrowed' : 'Borrow'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={modal.isOpen}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        confirmText={modal.confirmText}
        cancelText={modal.cancelText}
        onConfirm={() => {
          modal.onConfirm?.();
        }}
        onCancel={() => setModal({ ...modal, isOpen: false })}
      />
    </div>
  );
};

export default Books;

