import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { ArrowRight, Bell, CalendarCheck, MapPin, ShieldCheck, Wheat } from 'lucide-react';
import FarmerApp from './FarmerApp';
import AdminApp from './AdminApp';

function Home() {
  return (
    <div className="ministry-shell flex flex-col overflow-hidden">
      <div className="tricolor-top" />
      <header className="bg-white px-5 py-4 text-center shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-center gap-2 text-[#1B7A2E]">
          <Wheat size={25} strokeWidth={2.5} />
          <span className="text-xl font-extrabold tracking-tight">AGROBRIDGE</span>
        </div>
        <p className="mt-0.5 text-sm font-semibold text-[#1A2B6D]">किसानसेतु</p>
        <p className="mt-0.5 text-xs text-slate-500">Smart Procurement Platform</p>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center px-5 py-8 sm:py-14">
        <section className="w-full overflow-hidden rounded-[1.8rem] bg-[#1B7A2E] px-6 py-9 text-center text-white shadow-xl shadow-green-950/15 sm:px-12">
          <div className="mx-auto mb-5 grid size-14 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/20">
            <ShieldCheck size={30} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Procurement, without the wait</h1>
          <p className="bilingual-hi on-dark text-sm">बिना प्रतीक्षा के फसल खरीद</p>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-green-50 sm:text-base">
            Book a centre slot, follow your live queue, and track your procurement updates from one place.
          </p>
        </section>

        <section className="-mt-4 grid w-full max-w-3xl gap-4 rounded-2xl bg-white p-5 shadow-lg shadow-slate-900/5 sm:grid-cols-[1.25fr_1fr] sm:p-6">
          <Link
            to="/farmer"
            className="group flex min-h-32 flex-col justify-between rounded-2xl bg-[#F5841F] p-5 text-left text-white transition hover:bg-[#df7015]"
          >
            <CalendarCheck size={25} />
            <div>
              <p className="text-lg font-bold">Book your slot</p>
              <p className="text-sm text-orange-50">अपना स्लॉट बुक करें</p>
            </div>
            <span className="mt-2 flex items-center gap-1 text-sm font-bold">Continue <ArrowRight size={16} className="transition group-hover:translate-x-1" /></span>
          </Link>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-blue-50 p-4 text-[#1A2B6D]">
              <Bell size={20} />
              <p className="mt-4 text-sm font-bold">Live updates</p>
              <p className="bilingual-hi">लाइव जानकारी</p>
            </div>
            <div className="rounded-2xl bg-orange-50 p-4 text-[#a84c0a]">
              <MapPin size={20} />
              <p className="mt-4 text-sm font-bold">Nearby centres</p>
              <p className="bilingual-hi">नजदीकी केंद्र</p>
            </div>
          </div>
        </section>

        <p className="mt-8 text-center text-sm text-slate-500">
          New farmer?{' '}
          <Link to="/farmer" className="font-bold text-[#1B7A2E] hover:underline">Register now / अभी पंजीकरण करें</Link>
        </p>
      </main>

      <footer className="px-5 pb-5 text-center">
        <Link to="/admin" className="text-xs font-medium text-slate-400 hover:text-[#1A2B6D]">
          Procurement centre staff login / केंद्र कर्मचारी लॉगिन
        </Link>
      </footer>
      <div className="tricolor-bottom" />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/farmer" element={<FarmerApp />} />
        <Route path="/admin" element={<AdminApp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
