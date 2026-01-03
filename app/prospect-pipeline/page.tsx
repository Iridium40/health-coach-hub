"use client";

import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Search, Filter, Phone, Mail, MessageSquare, Calendar, ChevronDown, ChevronUp, MoreVertical, Edit2, Trash2, CheckCircle, Circle, Clock, ArrowRight, Star, TrendingUp, AlertCircle, X, Plus, Save, RefreshCw, Download, Upload, Eye, Target, Zap, Heart, Award, UserCheck, Briefcase } from 'lucide-react';

export default function ProspectPipeline() {
  const [prospects, setProspects] = useState([
    { id: 1, name: 'Sarah Johnson', phone: '555-123-4567', email: 'sarah@email.com', relationship: 'Friend', source: 'Facebook', status: 'warm', lastContact: '2024-01-02', nextAction: '2024-01-05', nextActionType: 'follow-up', notes: 'Interested in weight loss, has tried other programs. Husband might be interested too.', priority: 'high', createdAt: '2024-01-01', haScheduled: null, haCompleted: null, clientStartDate: null },
    { id: 2, name: 'Mike Williams', phone: '555-234-5678', email: 'mike@email.com', relationship: 'Coworker', source: 'In Person', status: 'ha-scheduled', lastContact: '2024-01-03', nextAction: '2024-01-04', nextActionType: 'health-assessment', notes: 'HA scheduled for Thursday 7pm. Very motivated, just had health scare.', priority: 'high', createdAt: '2023-12-28', haScheduled: '2024-01-04', haCompleted: null, clientStartDate: null },
    { id: 3, name: 'Jennifer Davis', phone: '555-345-6789', email: 'jen@email.com', relationship: 'Gym Acquaintance', source: 'Referral', status: 'client', lastContact: '2024-01-03', nextAction: '2024-01-04', nextActionType: 'check-in', notes: 'Started program 1/1. Day 3 - check in on how she\'s feeling.', priority: 'medium', createdAt: '2023-12-15', haScheduled: '2023-12-20', haCompleted: '2023-12-20', clientStartDate: '2024-01-01' },
    { id: 4, name: 'Robert Chen', phone: '555-456-7890', email: 'robert@email.com', relationship: 'Neighbor', source: 'Social Media', status: 'cold', lastContact: '2023-12-20', nextAction: '2024-01-06', nextActionType: 'reach-out', notes: 'Commented on my transformation post. Haven\'t connected yet.', priority: 'low', createdAt: '2023-12-20', haScheduled: null, haCompleted: null, clientStartDate: null },
    { id: 5, name: 'Amanda Torres', phone: '555-567-8901', email: 'amanda@email.com', relationship: 'Sister-in-law', source: 'Family', status: 'coach-prospect', lastContact: '2024-01-02', nextAction: '2024-01-07', nextActionType: 'business-call', notes: 'Great client results! Interested in the business opportunity. Schedule call to discuss.', priority: 'high', createdAt: '2023-11-01', haScheduled: '2023-11-05', haCompleted: '2023-11-05', clientStartDate: '2023-11-10' },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('nextAction');
  const [sortOrder, setSortOrder] = useState('asc');

  const [newProspect, setNewProspect] = useState({
    name: '', phone: '', email: '', relationship: '', source: '', status: 'cold',
    nextAction: '', nextActionType: 'reach-out', notes: '', priority: 'medium'
  });

  const [newContact, setNewContact] = useState({
    type: 'call', notes: '', nextActionDate: '', nextActionType: 'follow-up'
  });

  const statuses = [
    { id: 'cold', label: 'Cold', color: '#78909c', icon: Circle, description: 'Not yet contacted' },
    { id: 'warm', label: 'Warm', color: '#ff9800', icon: Zap, description: 'Showed interest' },
    { id: 'ha-scheduled', label: 'HA Scheduled', color: '#2196f3', icon: Calendar, description: 'Health Assessment scheduled' },
    { id: 'ha-completed', label: 'HA Completed', color: '#9c27b0', icon: CheckCircle, description: 'Completed HA, following up' },
    { id: 'client', label: 'Client', color: '#4caf50', icon: Heart, description: 'Active client' },
    { id: 'coach-prospect', label: 'Coach Prospect', color: '#e91e63', icon: TrendingUp, description: 'Interested in business' },
    { id: 'coach', label: 'Coach', color: '#00bcd4', icon: Award, description: 'Signed as coach' },
    { id: 'not-interested', label: 'Not Interested', color: '#9e9e9e', icon: X, description: 'Declined - may revisit' },
  ];

  const priorities = [
    { id: 'high', label: 'High', color: '#f44336' },
    { id: 'medium', label: 'Medium', color: '#ff9800' },
    { id: 'low', label: 'Low', color: '#4caf50' },
  ];

  const sources = ['Facebook', 'Instagram', 'In Person', 'Referral', 'Family', 'Friend', 'Coworker', 'Gym', 'Church', 'Neighborhood', 'LinkedIn', 'Other'];
  
  const relationships = ['Friend', 'Family', 'Coworker', 'Acquaintance', 'Referral', 'Social Media Contact', 'Neighbor', 'Gym Acquaintance', 'Church Member', 'Other'];

  const actionTypes = [
    { id: 'reach-out', label: 'Initial Reach Out', icon: MessageSquare },
    { id: 'follow-up', label: 'Follow Up', icon: Phone },
    { id: 'health-assessment', label: 'Health Assessment', icon: Target },
    { id: 'close', label: 'Close / Get Started', icon: CheckCircle },
    { id: 'check-in', label: 'Client Check-In', icon: Heart },
    { id: 'business-call', label: 'Business Opportunity Call', icon: Briefcase },
  ];

  const getStatusInfo = (statusId: string) => statuses.find(s => s.id === statusId) || statuses[0];
  const getPriorityInfo = (priorityId: string) => priorities.find(p => p.id === priorityId) || priorities[1];

  const today = new Date().toISOString().split('T')[0];

  const isOverdue = (dateStr: string | null) => {
    if (!dateStr) return false;
    return dateStr < today;
  };

  const isToday = (dateStr: string | null) => {
    return dateStr === today;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getDaysSince = (dateStr: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const filteredProspects = prospects
    .filter(p => {
      if (filterStatus !== 'all' && p.status !== filterStatus) return false;
      if (filterPriority !== 'all' && p.priority !== filterPriority) return false;
      if (searchTerm && !p.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !p.email.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !p.phone.includes(searchTerm)) return false;
      return true;
    })
    .sort((a, b) => {
      let aVal: any, bVal: any;
      if (sortBy === 'nextAction') {
        aVal = a.nextAction || '9999-12-31';
        bVal = b.nextAction || '9999-12-31';
      } else if (sortBy === 'lastContact') {
        aVal = a.lastContact || '0000-01-01';
        bVal = b.lastContact || '0000-01-01';
      } else if (sortBy === 'name') {
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
      } else if (sortBy === 'priority') {
        const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
        aVal = priorityOrder[a.priority];
        bVal = priorityOrder[b.priority];
      }
      if (sortOrder === 'asc') return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });

  const stats = {
    total: prospects.length,
    cold: prospects.filter(p => p.status === 'cold').length,
    warm: prospects.filter(p => p.status === 'warm').length,
    haScheduled: prospects.filter(p => p.status === 'ha-scheduled').length,
    clients: prospects.filter(p => p.status === 'client').length,
    coaches: prospects.filter(p => p.status === 'coach').length,
    overdueActions: prospects.filter(p => isOverdue(p.nextAction)).length,
    todayActions: prospects.filter(p => isToday(p.nextAction)).length,
  };

  const addProspect = () => {
    const prospect = {
      ...newProspect,
      id: Date.now(),
      lastContact: today,
      createdAt: today,
      haScheduled: null,
      haCompleted: null,
      clientStartDate: null,
    };
    setProspects([...prospects, prospect]);
    setNewProspect({
      name: '', phone: '', email: '', relationship: '', source: '', status: 'cold',
      nextAction: '', nextActionType: 'reach-out', notes: '', priority: 'medium'
    });
    setShowAddModal(false);
  };

  const updateProspect = () => {
    setProspects(prospects.map(p => p.id === selectedProspect.id ? selectedProspect : p));
    setShowEditModal(false);
    setSelectedProspect(null);
  };

  const deleteProspect = (id: number) => {
    if (confirm('Are you sure you want to delete this prospect?')) {
      setProspects(prospects.filter(p => p.id !== id));
    }
  };

  const logContact = () => {
    const updated = {
      ...selectedProspect,
      lastContact: today,
      nextAction: newContact.nextActionDate,
      nextActionType: newContact.nextActionType,
      notes: selectedProspect.notes + '\n\n' + `[${today}] ${newContact.type}: ${newContact.notes}`
    };
    setProspects(prospects.map(p => p.id === selectedProspect.id ? updated : p));
    setShowContactModal(false);
    setNewContact({ type: 'call', notes: '', nextActionDate: '', nextActionType: 'follow-up' });
    setSelectedProspect(null);
  };

  const moveToNextStatus = (prospect: any) => {
    const statusOrder = ['cold', 'warm', 'ha-scheduled', 'ha-completed', 'client', 'coach-prospect', 'coach'];
    const currentIndex = statusOrder.indexOf(prospect.status);
    if (currentIndex < statusOrder.length - 1) {
      const newStatus = statusOrder[currentIndex + 1];
      const updates: any = { status: newStatus };
      
      if (newStatus === 'ha-scheduled') updates.haScheduled = today;
      if (newStatus === 'ha-completed') updates.haCompleted = today;
      if (newStatus === 'client') updates.clientStartDate = today;
      
      setProspects(prospects.map(p => p.id === prospect.id ? { ...p, ...updates } : p));
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)', fontFamily: "'Avenir Next', 'Segoe UI', sans-serif" }}>
      <header style={{ background: 'linear-gradient(135deg, #00A651 0%, #006633 100%)', padding: '24px 32px', color: 'white', boxShadow: '0 4px 20px rgba(0, 166, 81, 0.3)' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, opacity: 0.9, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <span>Coach Tools</span>
                <ChevronDown size={14} style={{ transform: 'rotate(-90deg)' }} />
                <span style={{ fontWeight: 600 }}>Prospect Pipeline</span>
              </div>
              <h1 style={{ fontSize: 32, fontWeight: 700, margin: '0 0 8px 0', letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <Users size={32} />
                Prospect Pipeline
              </h1>
              <p style={{ fontSize: 16, opacity: 0.9, margin: 0 }}>Track your 100s list from first contact to client to coach.</p>
            </div>
            <button 
              onClick={() => setShowAddModal(true)}
              style={{ padding: '12px 24px', background: 'white', border: 'none', borderRadius: 10, color: '#00A651', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
            >
              <UserPlus size={20} />
              Add Prospect
            </button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 12, marginBottom: 24 }}>
          <div style={{ background: 'white', borderRadius: 12, padding: 16, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#1a1a1a' }}>{stats.total}</div>
            <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase' }}>Total</div>
          </div>
          <div style={{ background: 'white', borderRadius: 12, padding: 16, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: '3px solid #78909c' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#78909c' }}>{stats.cold}</div>
            <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase' }}>Cold</div>
          </div>
          <div style={{ background: 'white', borderRadius: 12, padding: 16, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: '3px solid #ff9800' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#ff9800' }}>{stats.warm}</div>
            <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase' }}>Warm</div>
          </div>
          <div style={{ background: 'white', borderRadius: 12, padding: 16, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: '3px solid #2196f3' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#2196f3' }}>{stats.haScheduled}</div>
            <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase' }}>HA Sched</div>
          </div>
          <div style={{ background: 'white', borderRadius: 12, padding: 16, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: '3px solid #4caf50' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#4caf50' }}>{stats.clients}</div>
            <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase' }}>Clients</div>
          </div>
          <div style={{ background: 'white', borderRadius: 12, padding: 16, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: '3px solid #00bcd4' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#00bcd4' }}>{stats.coaches}</div>
            <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase' }}>Coaches</div>
          </div>
          <div style={{ background: stats.overdueActions > 0 ? '#ffebee' : 'white', borderRadius: 12, padding: 16, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: '3px solid #f44336' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#f44336' }}>{stats.overdueActions}</div>
            <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase' }}>Overdue</div>
          </div>
          <div style={{ background: stats.todayActions > 0 ? '#e3f2fd' : 'white', borderRadius: 12, padding: 16, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: '3px solid #2196f3' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#2196f3' }}>{stats.todayActions}</div>
            <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase' }}>Today</div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: 12, padding: 16, marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '10px 12px 10px 40px', border: '2px solid #e0e0e0', borderRadius: 8, fontSize: 14 }}
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Filter size={16} color="#888" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ padding: '10px 12px', border: '2px solid #e0e0e0', borderRadius: 8, fontSize: 13, minWidth: 140 }}
            >
              <option value="all">All Statuses</option>
              {statuses.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            style={{ padding: '10px 12px', border: '2px solid #e0e0e0', borderRadius: 8, fontSize: 13 }}
          >
            <option value="all">All Priorities</option>
            {priorities.map(p => (
              <option key={p.id} value={p.id}>{p.label} Priority</option>
            ))}
          </select>

          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order);
            }}
            style={{ padding: '10px 12px', border: '2px solid #e0e0e0', borderRadius: 8, fontSize: 13 }}
          >
            <option value="nextAction-asc">Next Action (Soonest)</option>
            <option value="nextAction-desc">Next Action (Latest)</option>
            <option value="lastContact-desc">Last Contact (Recent)</option>
            <option value="lastContact-asc">Last Contact (Oldest)</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="priority-asc">Priority (High First)</option>
          </select>
        </div>

        <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1.5fr 120px', padding: '14px 20px', background: '#f8f9fa', borderBottom: '1px solid #e0e0e0', fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            <div>Prospect</div>
            <div>Status</div>
            <div>Last Contact</div>
            <div>Next Action</div>
            <div>Notes</div>
            <div style={{ textAlign: 'center' }}>Actions</div>
          </div>

          {filteredProspects.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center', color: '#888' }}>
              <Users size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No prospects found</div>
              <div style={{ fontSize: 14 }}>Add your first prospect to get started!</div>
            </div>
          ) : (
            filteredProspects.map((prospect, index) => {
              const statusInfo = getStatusInfo(prospect.status);
              const priorityInfo = getPriorityInfo(prospect.priority);
              const overdue = isOverdue(prospect.nextAction);
              const dueToday = isToday(prospect.nextAction);
              const daysSinceContact = getDaysSince(prospect.lastContact);
              const StatusIcon = statusInfo.icon;

              return (
                <div
                  key={prospect.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 1fr 1.5fr 120px',
                    padding: '16px 20px',
                    borderBottom: index < filteredProspects.length - 1 ? '1px solid #f0f0f0' : 'none',
                    background: overdue ? '#fff8f8' : (dueToday ? '#f0f9ff' : 'white'),
                    alignItems: 'center',
                    transition: 'background 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: `linear-gradient(135deg, ${statusInfo.color}, ${statusInfo.color}cc)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: 14
                    }}>
                      {prospect.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#1a1a1a', display: 'flex', alignItems: 'center', gap: 8 }}>
                        {prospect.name}
                        <span style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: priorityInfo.color
                        }} title={`${priorityInfo.label} Priority`} />
                      </div>
                      <div style={{ fontSize: 12, color: '#888' }}>
                        {prospect.relationship} • {prospect.source}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '4px 10px',
                      background: `${statusInfo.color}15`,
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 600,
                      color: statusInfo.color
                    }}>
                      <StatusIcon size={12} />
                      {statusInfo.label}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 13, color: '#1a1a1a' }}>{formatDate(prospect.lastContact)}</div>
                    <div style={{ fontSize: 11, color: daysSinceContact && daysSinceContact > 7 ? '#f44336' : '#888' }}>
                      {daysSinceContact === 0 ? 'Today' : daysSinceContact === 1 ? 'Yesterday' : `${daysSinceContact} days ago`}
                    </div>
                  </div>

                  <div>
                    <div style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: overdue ? '#f44336' : (dueToday ? '#2196f3' : '#1a1a1a'),
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}>
                      {overdue && <AlertCircle size={14} />}
                      {dueToday && <Zap size={14} />}
                      {formatDate(prospect.nextAction)}
                    </div>
                    <div style={{ fontSize: 11, color: '#888' }}>
                      {actionTypes.find(a => a.id === prospect.nextActionType)?.label || prospect.nextActionType}
                    </div>
                  </div>

                  <div style={{ fontSize: 12, color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {prospect.notes.split('\n')[0].slice(0, 60)}...
                  </div>

                  <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                    <button
                      onClick={() => { setSelectedProspect(prospect); setShowContactModal(true); }}
                      title="Log Contact"
                      style={{ padding: 8, background: '#e3f2fd', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                    >
                      <Phone size={16} color="#1565c0" />
                    </button>
                    <button
                      onClick={() => moveToNextStatus(prospect)}
                      title="Move to Next Status"
                      style={{ padding: 8, background: '#e8f5e9', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                    >
                      <ArrowRight size={16} color="#2e7d32" />
                    </button>
                    <button
                      onClick={() => { setSelectedProspect(prospect); setShowEditModal(true); }}
                      title="Edit"
                      style={{ padding: 8, background: '#f5f5f5', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                    >
                      <Edit2 size={16} color="#666" />
                    </button>
                    <button
                      onClick={() => deleteProspect(prospect.id)}
                      title="Delete"
                      style={{ padding: 8, background: '#ffebee', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                    >
                      <Trash2 size={16} color="#c62828" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: 32, width: '100%', maxWidth: 500, maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Add New Prospect</h2>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} color="#888" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>Full Name *</label>
                <input
                  type="text"
                  value={newProspect.name}
                  onChange={(e) => setNewProspect({ ...newProspect, name: e.target.value })}
                  placeholder="John Smith"
                  style={{ width: '100%', padding: '12px 14px', border: '2px solid #e0e0e0', borderRadius: 8, fontSize: 15 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>Phone</label>
                  <input
                    type="tel"
                    value={newProspect.phone}
                    onChange={(e) => setNewProspect({ ...newProspect, phone: e.target.value })}
                    placeholder="555-123-4567"
                    style={{ width: '100%', padding: '12px 14px', border: '2px solid #e0e0e0', borderRadius: 8, fontSize: 15 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>Email</label>
                  <input
                    type="email"
                    value={newProspect.email}
                    onChange={(e) => setNewProspect({ ...newProspect, email: e.target.value })}
                    placeholder="john@email.com"
                    style={{ width: '100%', padding: '12px 14px', border: '2px solid #e0e0e0', borderRadius: 8, fontSize: 15 }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>Relationship</label>
                  <select
                    value={newProspect.relationship}
                    onChange={(e) => setNewProspect({ ...newProspect, relationship: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', border: '2px solid #e0e0e0', borderRadius: 8, fontSize: 15 }}
                  >
                    <option value="">Select...</option>
                    {relationships.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>Source</label>
                  <select
                    value={newProspect.source}
                    onChange={(e) => setNewProspect({ ...newProspect, source: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', border: '2px solid #e0e0e0', borderRadius: 8, fontSize: 15 }}
                  >
                    <option value="">Select...</option>
                    {sources.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>Priority</label>
                  <select
                    value={newProspect.priority}
                    onChange={(e) => setNewProspect({ ...newProspect, priority: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', border: '2px solid #e0e0e0', borderRadius: 8, fontSize: 15 }}
                  >
                    {priorities.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>Status</label>
                  <select
                    value={newProspect.status}
                    onChange={(e) => setNewProspect({ ...newProspect, status: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', border: '2px solid #e0e0e0', borderRadius: 8, fontSize: 15 }}
                  >
                    {statuses.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>Next Action Date</label>
                  <input
                    type="date"
                    value={newProspect.nextAction}
                    onChange={(e) => setNewProspect({ ...newProspect, nextAction: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', border: '2px solid #e0e0e0', borderRadius: 8, fontSize: 15 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>Action Type</label>
                  <select
                    value={newProspect.nextActionType}
                    onChange={(e) => setNewProspect({ ...newProspect, nextActionType: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', border: '2px solid #e0e0e0', borderRadius: 8, fontSize: 15 }}
                  >
                    {actionTypes.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>Notes</label>
                <textarea
                  value={newProspect.notes}
                  onChange={(e) => setNewProspect({ ...newProspect, notes: e.target.value })}
                  placeholder="What do you know about this person? What are their goals? Any important details..."
                  rows={3}
                  style={{ width: '100%', padding: '12px 14px', border: '2px solid #e0e0e0', borderRadius: 8, fontSize: 15, resize: 'vertical' }}
                />
              </div>

              <button
                onClick={addProspect}
                disabled={!newProspect.name}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: newProspect.name ? 'linear-gradient(135deg, #00A651, #00c853)' : '#e0e0e0',
                  border: 'none',
                  borderRadius: 10,
                  color: 'white',
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: newProspect.name ? 'pointer' : 'not-allowed',
                  marginTop: 8
                }}
              >
                Add Prospect
              </button>
            </div>
          </div>
        </div>
      )}

      {showContactModal && selectedProspect && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: 32, width: '100%', maxWidth: 450 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Log Contact</h2>
              <button onClick={() => { setShowContactModal(false); setSelectedProspect(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} color="#888" />
              </button>
            </div>

            <div style={{ padding: 16, background: '#f5f5f5', borderRadius: 10, marginBottom: 20 }}>
              <div style={{ fontWeight: 600, color: '#1a1a1a' }}>{selectedProspect.name}</div>
              <div style={{ fontSize: 13, color: '#888' }}>{selectedProspect.phone} • {selectedProspect.email}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>Contact Type</label>
                <select
                  value={newContact.type}
                  onChange={(e) => setNewContact({ ...newContact, type: e.target.value })}
                  style={{ width: '100%', padding: '12px 14px', border: '2px solid #e0e0e0', borderRadius: 8, fontSize: 15 }}
                >
                  <option value="call">Phone Call</option>
                  <option value="text">Text Message</option>
                  <option value="dm">DM / Social Media</option>
                  <option value="email">Email</option>
                  <option value="in-person">In Person</option>
                  <option value="video">Video Call</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>What happened?</label>
                <textarea
                  value={newContact.notes}
                  onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
                  placeholder="Summary of the conversation..."
                  rows={3}
                  style={{ width: '100%', padding: '12px 14px', border: '2px solid #e0e0e0', borderRadius: 8, fontSize: 15, resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>Next Action Date</label>
                  <input
                    type="date"
                    value={newContact.nextActionDate}
                    onChange={(e) => setNewContact({ ...newContact, nextActionDate: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', border: '2px solid #e0e0e0', borderRadius: 8, fontSize: 15 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>Next Action Type</label>
                  <select
                    value={newContact.nextActionType}
                    onChange={(e) => setNewContact({ ...newContact, nextActionType: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', border: '2px solid #e0e0e0', borderRadius: 8, fontSize: 15 }}
                  >
                    {actionTypes.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
                  </select>
                </div>
              </div>

              <button
                onClick={logContact}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'linear-gradient(135deg, #00A651, #00c853)',
                  border: 'none',
                  borderRadius: 10,
                  color: 'white',
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: 'pointer',
                  marginTop: 8
                }}
              >
                Log Contact
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedProspect && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: 32, width: '100%', maxWidth: 500, maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Edit Prospect</h2>
              <button onClick={() => { setShowEditModal(false); setSelectedProspect(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} color="#888" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>Full Name</label>
                <input
                  type="text"
                  value={selectedProspect.name}
                  onChange={(e) => setSelectedProspect({ ...selectedProspect, name: e.target.value })}
                  style={{ width: '100%', padding: '12px 14px', border: '2px solid #e0e0e0', borderRadius: 8, fontSize: 15 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>Phone</label>
                  <input
                    type="tel"
                    value={selectedProspect.phone}
                    onChange={(e) => setSelectedProspect({ ...selectedProspect, phone: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', border: '2px solid #e0e0e0', borderRadius: 8, fontSize: 15 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>Email</label>
                  <input
                    type="email"
                    value={selectedProspect.email}
                    onChange={(e) => setSelectedProspect({ ...selectedProspect, email: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', border: '2px solid #e0e0e0', borderRadius: 8, fontSize: 15 }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>Status</label>
                  <select
                    value={selectedProspect.status}
                    onChange={(e) => setSelectedProspect({ ...selectedProspect, status: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', border: '2px solid #e0e0e0', borderRadius: 8, fontSize: 15 }}
                  >
                    {statuses.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>Priority</label>
                  <select
                    value={selectedProspect.priority}
                    onChange={(e) => setSelectedProspect({ ...selectedProspect, priority: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', border: '2px solid #e0e0e0', borderRadius: 8, fontSize: 15 }}
                  >
                    {priorities.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>Notes</label>
                <textarea
                  value={selectedProspect.notes}
                  onChange={(e) => setSelectedProspect({ ...selectedProspect, notes: e.target.value })}
                  rows={5}
                  style={{ width: '100%', padding: '12px 14px', border: '2px solid #e0e0e0', borderRadius: 8, fontSize: 15, resize: 'vertical' }}
                />
              </div>

              <button
                onClick={updateProspect}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'linear-gradient(135deg, #00A651, #00c853)',
                  border: 'none',
                  borderRadius: 10,
                  color: 'white',
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: 'pointer',
                  marginTop: 8
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}