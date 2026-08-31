import { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Clock3,
  MapPin,
  QrCode,
  Search,
  TrendingUp,
  Users,
  Wheat,
} from 'lucide-react';

type Tab = 'queue' | 'scan' | 'analytics';
type QueueStatus = 'serving' | 'waiting';
type LoadLevel = 'high' | 'medium' | 'low';

interface QueueFarmer {
  id: number;
  token: string;
  name: string;
  mobile: string;
  slot: string;
  status: QueueStatus;
}

interface CentreLoad {
  name: string;
  load: LoadLevel;
  count: number;
}

const queue: QueueFarmer[] = [
  { id: 1, token: 'KQ-00143', name: 'Ramesh Kumar', mobile: '98765 43210', slot: '9:00 AM', status: 'serving' },
  { id: 2, token: 'KQ-00144', name: 'Suresh Yadav', mobile: '98765 11223', slot: '9:00 AM', status: 'waiting' },
  { id: 3, token: 'KQ-00145', name: 'Anita Devi', mobile: '98765 44556', slot: '9:30 AM', status: 'waiting' },
  { id: 4, token: 'KQ-00146', name: 'Vijay Singh', mobile: '98765 77889', slot: '9:30 AM', status: 'waiting' },
  { id: 5, token: 'KQ-00147', name: 'Pooja Sharma', mobile: '98765 12345', slot: '10:00 AM', status: 'waiting' },
];

const centres: CentreLoad[] = [
  { name: 'Azadpur Mandi', load: 'high', count: 42 },
  { name: 'Ghazipur Mandi', load: 'medium', count: 21 },
  { name: 'Najafgarh Procurement Centre', load: 'low', count: 8 },
];

const loadStyle: Record<LoadLevel, string> = {
  high: 'bg-red-50 text-red-700 ring-red-200',
  medium: 'bg-orange-50 text-[#b85b0a] ring-orange-200',
  low: 'bg-green-50 text-[#1B7A2E] ring-green-200',
};

function Hindi({ children, dark = false }: { children: string; dark?: boolean }) {
  return <span className={`bilingual-hi ${dark ? 'on-dark' : ''}`}>{children}</span>;
}

function AdminNavButton({ id, label, hindi, active, onSelect }: { id: Tab; label: string; hindi: string; active: boolean; onSelect: (tab: Tab) => void }) {
  return (
    <button onClick={() => onSelect(id)} className={`rounded-xl px-4 py-2 text-left transition ${active ? 'bg-green-50 text-[#1B7A2E]' : 'text-slate-500 hover:bg-slate-100'}`}>
      <span className="block text-sm font-bold">{label}</span>
      <Hindi>{hindi}</Hindi>
    </button>
  );
}

export default function AdminApp() {
  const [tab, setTab] = useState<Tab>('queue');
  const [selectedFarmer, setSelectedFarmer] = useState<QueueFarmer | null>(null);
  const [search, setSearch] = useState('');
  const [quantity, setQuantity] = useState('');
  const [qualityGrade, setQualityGrade] = useState('Grade A');

  const visibleQueue = queue.filter((farmer) => {
    const query = search.trim().toLowerCase();
    return !query || farmer.token.toLowerCase().includes(query) || farmer.mobile.replaceAll(' ', '').includes(query.replaceAll(' ', '')) || farmer.name.toLowerCase().includes(query);
  });

  function openProcess(farmer: QueueFarmer) {
    setSelectedFarmer(farmer);
    setQuantity('');
    setQualityGrade('Grade A');
  }

  return (
    <div className="ministry-shell min-h-screen bg-[#F8F9FA] pb-8">
      <div className="tricolor-top" />
      <header className="border-b border-slate-200 bg-white px-5 py-4 sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-[#1B7A2E] text-white"><Wheat size={21} /></span>
            <div>
              <p className="font-extrabold tracking-tight text-[#1B7A2E]">AGROBRIDGE</p>
              <p className="text-xs font-bold text-[#1A2B6D]">Procurement centre desk <span className="font-medium text-slate-500">/ खरीद केंद्र डेस्क</span></p>
            </div>
          </div>
          <div className="hidden text-right sm:block">
            <p className="text-sm font-bold text-[#1A2B6D]">Azadpur Mandi</p>
            <p className="text-xs text-slate-500">Staff: Akshit · कर्मचारी: अक्षित</p>
          </div>
        </div>
      </header>

      <nav className="border-b border-slate-200 bg-white px-4 py-2 sm:px-8" aria-label="Admin navigation">
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto">
          <AdminNavButton id="queue" label="Live queue" hindi="लाइव कतार" active={tab === 'queue'} onSelect={setTab} />
          <AdminNavButton id="scan" label="QR scanner" hindi="क्यूआर स्कैनर" active={tab === 'scan'} onSelect={setTab} />
          <AdminNavButton id="analytics" label="Analytics" hindi="आंकड़े" active={tab === 'analytics'} onSelect={setTab} />
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-8">
        {tab === 'queue' && (
          <section>
            <div className="rounded-[1.7rem] bg-[#1B7A2E] p-6 text-white shadow-lg shadow-green-950/10 sm:flex sm:items-end sm:justify-between">
              <div>
                <p className="text-sm text-green-100">Today&apos;s procurement / आज की खरीद</p>
                <h1 className="mt-1 text-2xl font-extrabold">Live queue management</h1>
                <Hindi dark>लाइव कतार प्रबंधन</Hindi>
                <p className="mt-4 text-sm text-green-50">{queue.length} farmers booked · Currently serving {queue[0]?.token}</p>
              </div>
              <div className="mt-5 rounded-2xl bg-white/12 px-4 py-3 text-left sm:mt-0 sm:text-right">
                <p className="text-2xl font-extrabold">{queue.length}</p>
                <p className="text-xs text-green-100">Farmers in view / सूची में किसान</p>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-extrabold text-[#1A2B6D]">Manage farmer arrivals</h2>
                <Hindi>किसान आगमन प्रबंधित करें</Hindi>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <label className="relative block">
                  <span className="sr-only">Search farmer</span>
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search token, name, or mobile" className="input-control min-w-64 pl-9 py-2.5 text-sm" />
                </label>
                <button className="rounded-xl bg-[#F5841F] px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-orange-500/15 transition hover:bg-[#df7015]">Call next <span className="ml-1 text-xs text-orange-50">/ अगला बुलाएं</span></button>
              </div>
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70">
              <div className="overflow-x-auto">
                <table className="w-full min-w-180 text-sm">
                  <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Token / टोकन</th>
                      <th className="px-4 py-3">Farmer / किसान</th>
                      <th className="px-4 py-3">Mobile / मोबाइल</th>
                      <th className="px-4 py-3">Slot / स्लॉट</th>
                      <th className="px-4 py-3">Status / स्थिति</th>
                      <th className="px-4 py-3"><span className="sr-only">Process</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleQueue.map((farmer) => (
                      <tr key={farmer.id} className="border-t border-slate-100 transition hover:bg-slate-50/80">
                        <td className="px-4 py-4 font-mono font-extrabold text-[#1A2B6D]">{farmer.token}</td>
                        <td className="px-4 py-4 font-bold text-slate-700">{farmer.name}</td>
                        <td className="px-4 py-4 text-slate-500">{farmer.mobile}</td>
                        <td className="px-4 py-4 text-slate-500">{farmer.slot}</td>
                        <td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${farmer.status === 'serving' ? 'bg-orange-50 text-[#b85b0a]' : 'bg-slate-100 text-slate-600'}`}>{farmer.status === 'serving' ? 'Serving / सेवा में' : 'Waiting / प्रतीक्षारत'}</span></td>
                        <td className="px-4 py-4 text-right"><button onClick={() => openProcess(farmer)} className="inline-flex items-center gap-1 text-xs font-extrabold text-[#1B7A2E] hover:underline">Process <ChevronRight size={15} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {visibleQueue.length === 0 && <p className="p-8 text-center text-sm text-slate-500">No matching farmer found. / कोई मिलान किसान नहीं मिला।</p>}
            </div>
          </section>
        )}

        {tab === 'scan' && (
          <section className="mx-auto max-w-xl py-8 text-center">
            <div className="rounded-[1.7rem] bg-[#1B7A2E] p-6 text-white shadow-lg shadow-green-950/10"><p className="text-sm text-green-100">Fast check-in / त्वरित चेक-इन</p><h1 className="mt-1 text-2xl font-extrabold">Scan farmer QR</h1><Hindi dark>किसान क्यूआर स्कैन करें</Hindi></div>
            <div className="mt-5 rounded-3xl bg-white p-10 shadow-sm ring-1 ring-slate-200/70"><span className="mx-auto grid size-24 place-items-center rounded-3xl border-2 border-dashed border-green-200 bg-green-50 text-[#1B7A2E]"><QrCode size={52} /></span><p className="mt-6 font-extrabold text-[#1A2B6D]">Point the camera at a farmer&apos;s QR code</p><Hindi>कैमरा किसान के क्यूआर कोड की ओर करें</Hindi><button className="mt-6 rounded-xl bg-[#F5841F] px-5 py-3 font-bold text-white shadow-md shadow-orange-500/15 transition hover:bg-[#df7015]">Start camera <span className="ml-1 text-xs text-orange-50">/ कैमरा शुरू करें</span></button><p className="mt-5 text-xs text-slate-500">Camera scanning will be connected in the next functional phase.</p></div>
          </section>
        )}

        {tab === 'analytics' && (
          <section>
            <div className="rounded-[1.7rem] bg-[#1A2B6D] p-6 text-white shadow-lg shadow-blue-950/10"><p className="text-sm text-blue-100">Centre overview / केंद्र अवलोकन</p><h1 className="mt-1 text-2xl font-extrabold">Today&apos;s procurement analytics</h1><Hindi dark>आज के खरीद आंकड़े</Hindi></div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: 'Farmers served', hindi: 'सेवा प्राप्त किसान', value: '38', icon: Users, color: 'bg-blue-50 text-blue-700' },
                { label: 'Average wait', hindi: 'औसत प्रतीक्षा', value: '14 min', icon: Clock3, color: 'bg-orange-50 text-[#b85b0a]' },
                { label: 'No-shows', hindi: 'अनुपस्थित', value: '3', icon: AlertCircle, color: 'bg-red-50 text-red-700' },
                { label: 'Quantity procured', hindi: 'खरीदी गई मात्रा', value: '412 qtl', icon: TrendingUp, color: 'bg-green-50 text-[#1B7A2E]' },
              ].map((card) => {
                const Icon = card.icon;
                return <article key={card.label} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70"><span className={`grid size-10 place-items-center rounded-xl ${card.color}`}><Icon size={20} /></span><p className="mt-5 text-2xl font-extrabold text-[#1A2B6D]">{card.value}</p><p className="mt-1 text-sm font-bold text-slate-700">{card.label}</p><Hindi>{card.hindi}</Hindi></article>;
              })}
            </div>
            <section className="mt-5 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70"><h2 className="font-extrabold text-[#1A2B6D]">Centre load</h2><Hindi>केंद्र भार</Hindi><div className="mt-5 space-y-4">{centres.map((centre) => <div key={centre.name} className="flex items-center justify-between gap-4"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-slate-50 text-slate-500"><MapPin size={17} /></span><div><p className="text-sm font-bold text-slate-700">{centre.name}</p><p className="text-xs text-slate-500">{centre.count} farmers / किसान</p></div></div><span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ring-1 ${loadStyle[centre.load]}`}>{centre.load}</span></div>)}</div></section>
          </section>
        )}
      </main>

      {selectedFarmer && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4" onClick={() => setSelectedFarmer(null)}>
          <section className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-3"><div><p className="text-sm text-slate-500">Process farmer / किसान प्रक्रिया</p><h2 className="mt-1 text-xl font-extrabold text-[#1A2B6D]">{selectedFarmer.name}</h2><p className="mt-1 font-mono text-sm font-bold text-[#1B7A2E]">{selectedFarmer.token}</p></div><span className="grid size-10 place-items-center rounded-xl bg-green-50 text-[#1B7A2E]"><CheckCircle2 size={20} /></span></div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="field-label">Quantity (quintals)<Hindi>मात्रा (क्विंटल)</Hindi><input value={quantity} onChange={(event) => setQuantity(event.target.value)} type="number" min="0" placeholder="e.g. 12" className="input-control mt-2 text-sm font-medium" /></label><label className="field-label">Quality grade<Hindi>गुणवत्ता श्रेणी</Hindi><select value={qualityGrade} onChange={(event) => setQualityGrade(event.target.value)} className="input-control mt-2 text-sm font-medium"><option>Grade A</option><option>Grade B</option><option>Grade C</option></select></label></div>
            <div className="mt-5 flex items-center justify-between rounded-2xl bg-orange-50 p-4"><span><span className="block text-sm font-bold text-[#1A2B6D]">MSP rate (wheat)</span><span className="text-xs text-slate-500">न्यूनतम समर्थन मूल्य</span></span><span className="font-extrabold text-[#b85b0a]">₹2,275 / qtl</span></div>
            <div className="mt-6 flex gap-3"><button onClick={() => setSelectedFarmer(null)} className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50">Cancel / रद्द करें</button><button onClick={() => setSelectedFarmer(null)} className="flex-1 rounded-xl bg-[#1B7A2E] py-3 text-sm font-bold text-white shadow-md shadow-green-700/15 hover:bg-[#145d23]">Mark complete / पूर्ण करें</button></div>
            <p className="mt-4 text-center text-xs text-slate-400">The database action will be connected in the next functional phase.</p>
          </section>
        </div>
      )}
      <div className="tricolor-bottom fixed inset-x-0 bottom-0 z-40" />
    </div>
  );
}
