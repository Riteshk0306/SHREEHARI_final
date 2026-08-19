import React, { useState, useEffect } from 'react';
import { Mail, Calendar, User, Phone } from 'lucide-react';
import { api } from '../../api';
import { format } from 'date-fns';

export default function AdminContacts() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const data = await api.get('/api/contacts');
      setContacts(data.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div></div>;
  }

  return (
    <div className="space-y-6 flex-1">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 uppercase tracking-tight">Contact Messages</h1>
          <p className="text-slate-500 font-medium">Customer inquiries and feedback</p>
        </div>
      </div>
      
      <div className="space-y-4">
        {contacts.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center text-slate-500">
            No contact messages found.
          </div>
        ) : (
          contacts.map((contact: any) => (
            <div key={contact.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                    <User className="w-5 h-5 text-amber-500" />
                    {contact.name}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-slate-500 mt-2 font-medium">
                    <span className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {contact.email}
                    </span>
                    {contact.mobile && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {contact.mobile}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {contact.date ? format(new Date(contact.date), 'PPpp') : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg text-slate-700 whitespace-pre-wrap font-medium">
                {contact.message}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
