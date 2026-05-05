import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import api from '../utils/api';
import { Calendar as CalendarIcon, RefreshCw, Users, X, MapPin } from 'lucide-react';

const AdminCalendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState({ instansi: '', type: '', members: [] });

  useEffect(() => { fetchEvents(); }, []);

  // PERBAIKAN: Fungsi warna dengan palet lebih luas agar tidak bentrok
  const generateColor = (text) => {
    if (!text) return '#3B82F6';
    let hash = 0;
    // Algoritma hashing yang lebih sensitif terhadap perbedaan karakter
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // Palet warna yang lebih banyak untuk membedakan instansi
    const colors = [
      '#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', 
      '#EC4899', '#06B6D4', '#F43F5E', '#14B8A6', '#6366F1',
      '#D946EF', '#84CC16', '#F97316', '#0EA5E9', '#64748B'
    ];
    
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/calendar-events');
      const rawData = res.data;

      const grouped = {};

      rawData.forEach(item => {
        const startKey = `masuk-${item.start}-${item.instansi}`;
        const endKey = `keluar-${item.end}-${item.instansi}`;

        if (!grouped[startKey]) {
          grouped[startKey] = { type: 'MASUK', date: item.start, instansi: item.instansi, members: [] };
        }
        grouped[startKey].members.push(item.nama);

        if (!grouped[endKey]) {
          grouped[endKey] = { type: 'KELUAR', date: item.end, instansi: item.instansi, members: [] };
        }
        grouped[endKey].members.push(item.nama);
      });

      const formattedEvents = Object.values(grouped).map(group => {
        const color = generateColor(group.instansi);
        const isMasuk = group.type === 'MASUK';
        
        return {
          title: `${group.type}: ${group.instansi} (${group.members.length} Orang)`,
          start: group.date,
          backgroundColor: isMasuk ? 'white' : color,
          borderColor: color,
          textColor: isMasuk ? color : 'white',
          allDay: true,
          extendedProps: { ...group }
        };
      });

      setEvents(formattedEvents);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleEventClick = (info) => {
    setSelectedDetails(info.event.extendedProps);
    setIsModalOpen(true);
  };

  return (
    <div className="p-8 animate-in fade-in duration-500 text-left">
      {/* CSS untuk Fit Konten & Teks Penuh */}
      <style>
        {`
          .fc-event-main {
            white-space: normal !important;
            overflow-wrap: break-word !important;
            padding: 2px 4px !important;
          }
          .fc-daygrid-event {
            white-space: normal !important;
            height: auto !important;
            display: block !important;
            margin-top: 2px !important;
          }
          .fc-event-title {
            overflow: visible !important;
            white-space: normal !important;
            text-overflow: clip !important;
            display: inline-block !important;
            width: 100%;
          }
        `}
      </style>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tighter flex items-center gap-3">
            <CalendarIcon className="text-blue-600" size={28} />
            Jadwal Instansi
          </h1>
          <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest leading-none">Klik blok warna untuk melihat daftar nama peserta</p>
        </div>
        <button onClick={fetchEvents} className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-blue-50 text-blue-600 shadow-sm transition-all">
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          events={events}
          locale="id"
          headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth' }}
          height="auto"
          eventClick={handleEventClick}
          eventClassNames="rounded-lg px-2 py-1 text-[9px] font-black uppercase shadow-sm border-2 cursor-pointer transition-transform hover:scale-[1.02] whitespace-normal h-auto mb-1"
          displayEventTime={false}
          dayMaxEvents={5}
        />
      </div>

      {/* MODAL DETAIL PESERTA */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[100] p-4 text-left">
          <div className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-200">
            <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Users size={20} />
                <h2 className="font-black uppercase tracking-widest text-sm">Daftar Peserta</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/10 p-2 rounded-full"><X size={20}/></button>
            </div>
            
            <div className="p-8">
              <div className="mb-6 flex items-start gap-3">
                <MapPin className="text-blue-600 shrink-0" size={20} />
                <div>
                  <h3 className="font-black text-gray-700 uppercase leading-tight">{selectedDetails.instansi}</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mt-2 tracking-widest">
                    Status: <span className={selectedDetails.type === 'MASUK' ? 'text-green-500' : 'text-red-500'}>{selectedDetails.type}</span>
                  </p>
                </div>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {selectedDetails.members.map((name, i) => (
                  <div key={i} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-4">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-black text-xs shrink-0">{i + 1}</div>
                    <span className="font-bold text-gray-700 text-sm uppercase">{name}</span>
                  </div>
                ))}
              </div>

              <button onClick={() => setIsModalOpen(false)} className="w-full mt-8 bg-gray-900 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCalendar;