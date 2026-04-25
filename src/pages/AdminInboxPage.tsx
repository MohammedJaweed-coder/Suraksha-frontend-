import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, MapPin, Clock, User, AlertCircle, ChevronRight, Inbox } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';
import { useAuthStore } from '../store/auth.store';

interface Message {
  id: string;
  name: string;
  email: string;
  location: string;
  description: string;
  createdAt: string;
  isNew: boolean;
}

export default function AdminInboxPage() {
  const navigate = useNavigate();
  const { role, isAuthenticated } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const isAdmin = role === 'admin';

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!isAdmin) {
      navigate('/home');
      return;
    }

    const fetchMessages = async () => {
      try {
        const { data } = await api.get('/admin/inbox');
        setMessages(data);
      } catch (err) {
        console.error('Failed to fetch inbox:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [isAdmin, isAuthenticated, navigate]);

  const selectedMessage = messages.find(m => m.id === selectedId);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-secondary/30 border-t-secondary" />
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-6xl p-4 lg:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <div className="p-2 bg-secondary/10 rounded-xl">
              <Inbox className="text-secondary" size={28} />
            </div>
            Admin Inbox
          </h1>
          <p className="mt-2 text-slate-500">Monitor and manage all citizen safety reports in real-time.</p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600">
          <span className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
          {messages.filter(m => m.isNew).length} New Reports
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 py-20">
          <Mail size={48} className="mb-4 text-slate-300" />
          <h2 className="text-xl font-bold text-slate-900">No reports yet</h2>
          <p className="text-slate-500">The inbox is clear. Good job!</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
          {/* Message List */}
          <div className="flex flex-col gap-3 max-h-[calc(100vh-16rem)] overflow-y-auto pr-2 custom-scrollbar">
            {messages.map((msg) => (
              <motion.button
                key={msg.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedId(msg.id)}
                className={`group relative flex flex-col items-start rounded-2xl border p-4 text-left transition-all ${
                  selectedId === msg.id 
                    ? 'border-secondary bg-white shadow-lg ring-1 ring-secondary' 
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                }`}
              >
                {msg.isNew && (
                  <div className="absolute right-3 top-3 h-2 w-2 rounded-full bg-secondary" />
                )}
                <div className="mb-2 flex items-center gap-2">
                  <div className="p-1.5 bg-slate-100 rounded-lg text-slate-500 group-hover:bg-secondary/10 group-hover:text-secondary transition-colors">
                    <User size={14} />
                  </div>
                  <span className="text-sm font-bold text-slate-900">{msg.name}</span>
                </div>
                <p className="line-clamp-2 text-xs text-slate-500 mb-3">{msg.description}</p>
                <div className="flex w-full items-center justify-between text-[10px] font-medium uppercase tracking-wider text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock size={10} />
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <ChevronRight size={14} className={selectedId === msg.id ? 'text-secondary' : 'text-slate-300'} />
                </div>
              </motion.button>
            ))}
          </div>

          {/* Details Panel */}
          <AnimatePresence mode="wait">
            {selectedMessage ? (
              <motion.div
                key={selectedMessage.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8"
              >
                <div className="mb-8 border-b border-slate-100 pb-8">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
                        <User size={28} />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">{selectedMessage.name}</h2>
                        <p className="text-sm text-slate-500">{selectedMessage.email}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Sent on</span>
                      <span className="text-sm font-bold text-slate-900">
                        {new Date(selectedMessage.createdAt).toLocaleDateString(undefined, { 
                          month: 'long', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="rounded-2xl bg-slate-50 p-6">
                    <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-400">
                      <AlertCircle size={16} />
                      REPORT DESCRIPTION
                    </div>
                    <p className="text-lg leading-relaxed text-slate-700">{selectedMessage.description}</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-center gap-4 rounded-2xl border border-slate-100 p-4 transition-colors hover:bg-slate-50">
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                        <MapPin size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Incident Location</p>
                        <p className="font-bold text-slate-900">{selectedMessage.location}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 rounded-2xl border border-slate-100 p-4 transition-colors hover:bg-slate-50">
                      <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                        <Clock size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Submission Time</p>
                        <p className="font-bold text-slate-900">
                          {new Date(selectedMessage.createdAt).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button className="flex-1 rounded-xl bg-secondary py-3.5 text-sm font-bold text-white shadow-lg shadow-secondary/20 transition hover:bg-secondary/90 active:scale-[0.98]">
                      Acknowledge Report
                    </button>
                    <button className="rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 active:scale-[0.98]">
                      Archive
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-slate-50/50 p-20 text-center">
                <div className="mb-6 rounded-full bg-white p-6 shadow-sm">
                  <Mail size={40} className="text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Select a report to view details</h3>
                <p className="max-w-xs text-sm text-slate-500">
                  Click on any message from the list on the left to see full incident details and take action.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </main>
  );
}
