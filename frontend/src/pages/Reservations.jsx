import React, { useEffect, useState } from 'react';
import api from '../api/client.js';

const Reservations = () => {
  const [items, setItems] = useState([]);

  const load = () => api.get('/reservations').then((res) => setItems(res.data));
  useEffect(() => {
    load();
  }, []);

  const fulfill = async (id) => {
    await api.put(`/reservations/${id}/fulfill`);
    load();
  };

  return (
    <div className="card p-4">
      <div className="font-semibold text-slate-800 mb-3">Reservation queue</div>
      <div className="divide-y divide-slate-100">
        {items.map((resv) => (
          <div key={resv._id} className="py-3 flex items-center justify-between">
            <div>
              <div className="font-medium text-slate-800">{resv.book?.title}</div>
              <div className="text-xs text-slate-500">
                {resv.user?.name} • position {resv.position} • {resv.status}
              </div>
            </div>
            {resv.status !== 'fulfilled' && (
              <button className="btn btn-ghost" onClick={() => fulfill(resv._id)}>
                Fulfill
              </button>
            )}
          </div>
        ))}
        {items.length === 0 && <div className="text-sm text-slate-500 py-4">No reservations</div>}
      </div>
    </div>
  );
};

export default Reservations;

