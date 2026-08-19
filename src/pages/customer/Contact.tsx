import React, { useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { api } from '../../api';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/contacts', { name, email, mobile, message });
      
      const whatsappNumber = "917058117155";
      const waMessage = `*New Contact Message!*\n\n*Name:* ${name}\n*Email:* ${email}\n*Mobile:* ${mobile}\n*Message:* \n${message}`;
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(waMessage)}`;
      // Simulated background WhatsApp API call
      // fetch('/api/whatsapp', { method: 'POST', body: JSON.stringify({ to: whatsappNumber, message: waMessage }) });
      
      alert('Message sent successfully!');
      setName('');
      setEmail('');
      setMobile('');
      setMessage('');
    } catch (err: any) {
      alert(err.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 mb-8 uppercase tracking-tight text-center">Contact Us</h1>
        <p className="text-slate-600 text-center mb-12 font-medium text-lg">
          We would love to hear from you. Reach out for any queries regarding our pooja samagri.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-6 uppercase tracking-wider">Get in Touch</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <MapPin className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-slate-900 uppercase tracking-widest text-xs mb-1">Address</h3>
                  <p className="text-slate-600 font-medium leading-relaxed">
                    Sanjay Gandhi Market,<br />
                    T.V Centre,<br />
                    Chhatrapati Sambhaji Nagar
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <Phone className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-slate-900 uppercase tracking-widest text-xs mb-1">Mobile No</h3>
                  <p className="text-slate-600 font-medium">9890898319</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Mail className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-slate-900 uppercase tracking-widest text-xs mb-1">Email</h3>
                  <p className="text-slate-600 font-medium">contact@shreehari.com</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-6 uppercase tracking-wider">Send a Message</h2>
            <form className="space-y-4" onSubmit={handleSubmit}>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Name</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 transition-all font-medium text-slate-900" placeholder="Your Name" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Email</label>
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 transition-all font-medium text-slate-900" placeholder="your@email.com" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Mobile Number</label>
                <input required type="tel" value={mobile} onChange={e => setMobile(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 transition-all font-medium text-slate-900" placeholder="Your Mobile Number" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Message</label>

                <textarea required rows={4} value={message} onChange={e => setMessage(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 transition-all font-medium text-slate-900" placeholder="How can we help?"></textarea>
              </div>
              <button disabled={loading} className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold text-sm uppercase tracking-wide hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50">
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
