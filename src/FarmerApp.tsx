import { useEffect, useState, type ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import {
  ArrowLeft,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock3,
  Home,
  MapPin,
  Phone,
  QrCode,
  Wheat,
} from 'lucide-react';

type Screen = 'login' | 'otp' | 'centres' | 'slots' | 'confirmed' | 'tracking' | 'notifications';
type BookingStatus = 'booked' | 'arrived' | 'weighing' | 'quality_check' | 'complete';
type Language = 'en' | 'hi';

interface Centre {
  id: string;
  name: string;
  location: string;
  crop_types_accepted?: string[] | null;
}

interface Slot {
  id: string;
  centre_id: string;
  date: string;
  time_slot: string;
  capacity: number;
  booked_count: number;
}

interface Booking {
  id: string;
  farmer_id: string;
  centre_id: string;
  slot_id: string;
  token_number: string;
  status: BookingStatus;
  created_at?: string;
}

interface FarmerNotification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

interface HeaderProps {
  title: string;
  hindi: string;
  onBack?: () => void;
  lang: Language;
  onToggleLang: () => void;
}

// Small helper: pick the right string for the current language
function t(lang: Language, en: string, hi: string) {
  return lang === 'hi' ? hi : en;
}

function Bilingual({
  english,
  hindi,
  lang,
  className = '',
  dark = false,
}: {
  english: string;
  hindi: string;
  lang: Language;
  className?: string;
  dark?: boolean;
}) {
  if (lang === 'hi') {
    return <span className={className}>{hindi}</span>;
  }
  return (
    <span className={className}>
      <span className="block">{english}</span>
      <span className={`bilingual-hi ${dark ? 'on-dark' : ''}`}>{hindi}</span>
    </span>
  );
}

// Heading + small caption underneath, following the app's existing visual pattern.
// In English mode: big English heading, small Hindi caption below (unchanged from before).
// In Hindi mode: big Hindi heading, no caption (nothing left to caption).
function Heading({
  en,
  hi,
  lang,
  className = '',
  dark = false,
}: {
  en: string;
  hi: string;
  lang: Language;
  className?: string;
  dark?: boolean;
}) {
  return (
    <>
      <h1 className={className}>{lang === 'hi' ? hi : en}</h1>
      {lang === 'en' && <p className={`bilingual-hi ${dark ? 'on-dark' : ''}`}>{hi}</p>}
    </>
  );
}

function AppHeader({ title, hindi, onBack, lang, onToggleLang }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white shadow-sm">
      <div className="tricolor-top" />
      <div className="flex min-h-16 items-center px-4">
        <div className="w-10">
          {onBack && (
            <button onClick={onBack} aria-label="Go back" className="grid size-9 place-items-center rounded-xl text-[#1A2B6D] hover:bg-slate-100">
              <ArrowLeft size={21} />
            </button>
          )}
        </div>
        <div className="flex-1 text-center">
          <div className="flex items-center justify-center gap-1.5 text-[#1B7A2E]">
            <Wheat size={19} strokeWidth={2.5} />
            <span className="font-extrabold tracking-tight">AGROBRIDGE</span>
          </div>
          <span className="text-xs font-semibold text-[#1A2B6D]">{lang === 'hi' ? hindi : title}</span>
        </div>
        <div className="w-10">
          <button
            onClick={onToggleLang}
            aria-label="Toggle language"
            title={lang === 'en' ? 'हिंदी में देखें' : 'View in English'}
            className="grid size-9 place-items-center rounded-xl border border-slate-200 text-xs font-bold text-[#1A2B6D] transition hover:bg-slate-50"
          >
            {lang === 'en' ? 'अ' : 'A'}
          </button>
        </div>
      </div>
    </header>
  );
}

function FarmerFrame({ children, bottomNav = false }: { children: ReactNode; bottomNav?: boolean }) {
  return (
    <div className="ministry-shell mx-auto min-h-screen max-w-md overflow-x-hidden bg-[#F8F9FA] shadow-xl shadow-slate-900/5">
      {children}
      {bottomNav && <div className="tricolor-bottom fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md" />}
    </div>
  );
}

function FarmerBottomNav({
  screen,
  hasBooking,
  onNavigate,
  lang,
}: {
  screen: Screen;
  hasBooking: boolean;
  onNavigate: (nextScreen: Screen) => void;
  lang: Language;
}) {
  const tabs = [
    { id: 'tracking', label: 'Live queue', hindi: 'लाइव कतार', icon: Home, target: hasBooking ? 'tracking' : 'centres' },
    { id: 'centres', label: 'Book a slot', hindi: 'स्लॉट बुक करें', icon: CalendarDays, target: 'centres' },
    { id: 'notifications', label: 'Alerts', hindi: 'सूचनाएं', icon: Bell, target: 'notifications' },
  ] as const;
  const activeId = screen === 'confirmed' ? 'tracking' : screen === 'slots' ? 'centres' : screen;

  return (
    <nav className="bottom-nav fixed inset-x-0 bottom-[5px] z-40 mx-auto max-w-md px-3 py-2" aria-label="Farmer navigation">
      <div className="grid grid-cols-3 gap-1">
        {tabs.map((tab) => {
          const active = activeId === tab.id;
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => onNavigate(tab.target)} className={`rounded-xl px-2 py-2 text-center transition ${active ? 'bg-green-50 text-[#1B7A2E]' : 'text-slate-500 hover:bg-slate-50'}`}>
              <Icon size={19} className="mx-auto" strokeWidth={active ? 2.5 : 2} />
              <span className="mt-1 block text-[11px] font-bold leading-3">{lang === 'hi' ? tab.hindi : tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function FarmerApp() {
  const [screen, setScreen] = useState<Screen>('login');
  const [lang, setLang] = useState<Language>('en');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [farmerId, setFarmerId] = useState<string | null>(null);
  const [farmerName, setFarmerName] = useState('Farmer');

  const [centres, setCentres] = useState<Centre[]>([]);
  const [selectedCentre, setSelectedCentre] = useState<Centre | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [notifications, setNotifications] = useState<FarmerNotification[]>([]);
  const [peopleAhead, setPeopleAhead] = useState(0);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const toggleLang = () => setLang((current) => (current === 'en' ? 'hi' : 'en'));

  useEffect(() => {
    if (screen !== 'centres' || !supabase) return;

    setLoading(true);
    setNotice(null);
    void supabase
      .from('centres')
      .select('*')
      .then(({ data, error }) => {
        if (error) setNotice(t(lang, 'Centres could not be loaded. Please try again.', 'केंद्र लोड नहीं हो सके। कृपया पुनः प्रयास करें।'));
        if (data) setCentres(data as Centre[]);
        setLoading(false);
      });
  }, [screen]);

  useEffect(() => {
    if (!selectedCentre || !supabase) return;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    setLoading(true);
    setNotice(null);
    void supabase
      .from('slots')
      .select('*')
      .eq('centre_id', selectedCentre.id)
      .eq('date', dateStr)
      .then(({ data, error }) => {
        if (error) setNotice(t(lang, 'Slots could not be loaded. Please try again.', 'स्लॉट लोड नहीं हो सके। कृपया पुनः प्रयास करें।'));
        if (data) setSlots(data as Slot[]);
        setLoading(false);
      });
  }, [selectedCentre]);

  useEffect(() => {
    const client = supabase;
    if (screen !== 'tracking' || !booking || !client) return;

    const channel = client
      .channel(`booking-status-${booking.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'bookings', filter: `id=eq.${booking.id}` },
        (payload) => setBooking((current) => (current ? { ...current, ...(payload.new as Partial<Booking>) } : current)),
      )
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, [screen, booking?.id]);

  useEffect(() => {
    if (screen !== 'tracking' || !booking || !supabase) return;

    void supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('centre_id', booking.centre_id)
      .eq('slot_id', booking.slot_id)
      .neq('id', booking.id)
      .in('status', ['booked', 'arrived', 'weighing', 'quality_check'])
      .then(({ count }) => setPeopleAhead(count ?? 0));
  }, [screen, booking?.centre_id, booking?.id, booking?.slot_id]);

  useEffect(() => {
    if (screen !== 'notifications' || !farmerId || !supabase) return;

    setLoading(true);
    setNotice(null);
    void supabase
      .from('notifications')
      .select('*')
      .eq('farmer_id', farmerId)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) setNotice(t(lang, 'Notifications could not be loaded. Please try again.', 'सूचनाएं लोड नहीं हो सकीं। कृपया पुनः प्रयास करें।'));
        if (data) setNotifications(data as FarmerNotification[]);
        setLoading(false);
      });
  }, [screen, farmerId]);

  const statusMap: BookingStatus[] = ['booked', 'arrived', 'weighing', 'quality_check', 'complete'];
  const statusLabels = [
    ['Slot booked', 'स्लॉट बुक हुआ'],
    ['Arrival confirmed', 'आगमन की पुष्टि'],
    ['Weighing', 'तौल'],
    ['Quality check', 'गुणवत्ता जांच'],
    ['Payment initiated', 'भुगतान शुरू'],
  ];
  const currentIndex = booking ? statusMap.indexOf(booking.status) : 0;
  const estimatedWait = peopleAhead * 5;

  function openCentre(centre: Centre) {
    setSelectedCentre(centre);
    setSelectedSlot(null);
    setSlots([]);
    setScreen('slots');
  }

  async function handleVerifyOtp() {
    if (!supabase) return;

    setLoading(true);
    setNotice(null);
    const { data: existing, error: lookupError } = await supabase
      .from('farmers')
      .select('*')
      .eq('mobile', mobile)
      .maybeSingle();

    if (lookupError) {
      setNotice(t(lang, 'We could not verify this number. Please try again.', 'हम इस नंबर को सत्यापित नहीं कर सके। कृपया पुनः प्रयास करें।'));
      setLoading(false);
      return;
    }

    if (existing) {
      const farmer = existing as { id: string; name?: string | null };
      setFarmerId(farmer.id);
      setFarmerName(farmer.name || 'Farmer');
    } else {
      const { data: created, error } = await supabase
        .from('farmers')
        .insert({ name: 'Farmer', mobile })
        .select()
        .single();

      if (error || !created) {
        setNotice(t(lang, 'Your profile could not be created. Please try again.', 'आपकी प्रोफ़ाइल नहीं बन सकी। कृपया पुनः प्रयास करें।'));
        setLoading(false);
        return;
      }

      const farmer = created as { id: string; name?: string | null };
      setFarmerId(farmer.id);
      setFarmerName(farmer.name || 'Farmer');
    }

    setLoading(false);
    setScreen('centres');
  }

  async function handleConfirmBooking() {
    if (!supabase || !farmerId || !selectedCentre || !selectedSlot) return;

    setLoading(true);
    setNotice(null);
    const token = `KQ-2026-${Math.floor(10000 + Math.random() * 89999)}`;
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        farmer_id: farmerId,
        centre_id: selectedCentre.id,
        slot_id: selectedSlot.id,
        token_number: token,
        status: 'booked',
      })
      .select()
      .single();

    if (error || !data) {
      setNotice(t(lang, 'Booking could not be completed. Please choose the slot again.', 'बुकिंग पूरी नहीं हो सकी। कृपया स्लॉट फिर से चुनें।'));
      setLoading(false);
      return;
    }

    const createdBooking = data as Booking;
    setBooking(createdBooking);
    const { error: slotError } = await supabase
      .from('slots')
      .update({ booked_count: selectedSlot.booked_count + 1 })
      .eq('id', selectedSlot.id);

    if (slotError) setNotice(t(lang, 'Your booking is confirmed, but the slot count will refresh shortly.', 'आपकी बुकिंग की पुष्टि हो गई है, स्लॉट गिनती जल्द अपडेट होगी।'));
    setLoading(false);
    setScreen('confirmed');
  }

  if (!isSupabaseConfigured) {
    return (
      <FarmerFrame>
        <AppHeader title="Farmer portal" hindi="किसान पोर्टल" lang={lang} onToggleLang={toggleLang} />
        <main className="px-5 py-10">
          <div className="rounded-3xl border border-orange-200 bg-orange-50 p-6 text-center">
            <p className="font-bold text-[#1A2B6D]">{t(lang, 'AgroBridge needs its Supabase connection.', 'AgroBridge को Supabase कनेक्शन की आवश्यकता है।')}</p>
            <p className="mt-4 text-sm leading-6 text-slate-600">{t(lang, 'Add the Supabase URL and anon key to the local environment file, then restart the app.', 'स्थानीय एनवायरनमेंट फाइल में Supabase URL और anon key जोड़ें, फिर ऐप को पुनः प्रारंभ करें।')}</p>
          </div>
        </main>
      </FarmerFrame>
    );
  }

  if (screen === 'login') {
    return (
      <FarmerFrame>
        <AppHeader title="Farmer portal" hindi="किसान पोर्टल" lang={lang} onToggleLang={toggleLang} />
        <main className="px-5 py-8">
          <section className="relative overflow-hidden rounded-[1.7rem] bg-gradient-to-br from-[#1F8A34] via-[#1B7A2E] to-[#0F5C1F] p-6 text-white shadow-xl shadow-green-950/20">
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '18px 18px',
              }}
            />
            <div className="relative">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-white/15 shadow-inner shadow-black/10 ring-1 ring-white/20">
                <Wheat size={25} />
              </div>
              <Heading en="Welcome, farmer" hi="किसान का स्वागत है" lang={lang} dark className="mt-5 text-2xl font-extrabold tracking-tight" />
              <p className="mt-4 text-sm leading-6 text-green-50/90">
                {t(lang, 'Book your visit, see your place in the queue, and receive procurement updates.', 'अपनी यात्रा बुक करें, कतार में अपना स्थान देखें, और खरीद अपडेट प्राप्त करें।')}
              </p>
            </div>
          </section>

          <section className="mt-5 rounded-3xl bg-white p-5 shadow-lg shadow-slate-900/[0.06] ring-1 ring-slate-200/70 transition hover:shadow-slate-900/[0.09]">
            <label className="field-label">
              <Bilingual english="Mobile number" hindi="मोबाइल नंबर" lang={lang} />
            </label>
            <div className="mt-2 flex overflow-hidden rounded-xl border border-slate-200 bg-white transition focus-within:border-[#1B7A2E] focus-within:ring-4 focus-within:ring-green-700/10">
              <span className="flex items-center gap-1 border-r border-slate-200 bg-slate-50/60 px-3 font-bold text-[#1A2B6D]">
                <Phone size={15} /> +91
              </span>
              <input
                type="tel"
                value={mobile}
                onChange={(event) => setMobile(event.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="98765 43210"
                className="min-w-0 flex-1 px-3 py-3 outline-none"
                maxLength={10}
                inputMode="numeric"
              />
            </div>
            <button
              onClick={() => setScreen('otp')}
              disabled={mobile.length !== 10}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#F5841F] to-[#E06D0B] px-4 py-3.5 font-bold text-white shadow-lg shadow-orange-500/25 transition-all duration-150 hover:shadow-orange-500/35 active:scale-[0.98] disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300 disabled:opacity-70 disabled:shadow-none"
            >
              <Bilingual english="Continue" hindi="आगे बढ़ें" lang={lang} dark />
              <ChevronRight size={19} />
            </button>
            <p className="mt-5 text-center text-xs leading-5 text-slate-500">
              {t(
                lang,
                'By continuing, you agree to receive procurement status updates.',
                'आगे बढ़कर आप स्थिति अपडेट प्राप्त करने के लिए सहमत हैं।',
              )}
            </p>
          </section>
        </main>
        <div className="tricolor-bottom" />
      </FarmerFrame>
    );
  }

  if (screen === 'otp') {
    return (
      <FarmerFrame>
        <AppHeader title="Verify number" hindi="नंबर सत्यापित करें" onBack={() => setScreen('login')} lang={lang} onToggleLang={toggleLang} />
        <main className="px-5 py-8">
          <Heading en="Enter verification code" hi="सत्यापन कोड दर्ज करें" lang={lang} className="text-2xl font-extrabold text-[#1A2B6D]" />
          <p className="mt-4 text-sm leading-6 text-slate-500">
            {t(lang, `Enter the six-digit demo code for +91 ${mobile}.`, `+91 ${mobile} के लिए छह अंकों का डेमो कोड दर्ज करें।`)}
          </p>
          <div className="mt-7 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
            <label className="field-label">
              <Bilingual english="One-time password" hindi="वन-टाइम पासवर्ड" lang={lang} />
            </label>
            <input
              type="text"
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="input-control mt-2 text-center text-2xl font-bold tracking-[0.4em] text-[#1A2B6D]"
              maxLength={6}
              inputMode="numeric"
            />
            {notice && <p className="mt-3 text-sm font-medium text-red-600">{notice}</p>}
            <button
              onClick={handleVerifyOtp}
              disabled={otp.length !== 6 || loading}
              className="mt-6 w-full rounded-xl bg-[#F5841F] px-4 py-3.5 font-bold text-white shadow-md shadow-orange-500/20 transition hover:bg-[#df7015] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? t(lang, 'Verifying…', 'सत्यापित हो रहा है…') : t(lang, 'Verify & continue', 'सत्यापित करें और आगे बढ़ें')}
            </button>
            <p className="mt-4 text-center text-xs text-slate-500">{t(lang, 'Demo mode: enter any six digits.', 'डेमो मोड: कोई भी छह अंक दर्ज करें।')}</p>
          </div>
        </main>
      </FarmerFrame>
    );
  }

  if (screen === 'centres') {
    return (
      <FarmerFrame bottomNav>
        <AppHeader title="Choose a centre" hindi="केंद्र चुनें" lang={lang} onToggleLang={toggleLang} />
        <main className="px-4 pb-28 pt-5">
          <Heading en="Nearby procurement centres" hi="नजदीकी खरीद केंद्र" lang={lang} className="text-xl font-extrabold text-[#1A2B6D]" />
          <p className="mt-3 text-sm text-slate-500">{t(lang, 'Choose the centre that is most convenient for your arrival.', 'वह केंद्र चुनें जो आपके आगमन के लिए सबसे सुविधाजनक हो।')}</p>
          {notice && <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{notice}</p>}
          <div className="mt-5 space-y-3">
            {loading && <p className="rounded-2xl bg-white p-4 text-sm text-slate-500 shadow-sm">{t(lang, 'Loading centres…', 'केंद्र लोड हो रहे हैं…')}</p>}
            {!loading && centres.length === 0 && (
              <p className="rounded-2xl bg-white p-4 text-sm text-slate-500 shadow-sm">{t(lang, 'No centres are available right now.', 'अभी कोई केंद्र उपलब्ध नहीं है।')}</p>
            )}
            {centres.map((centre) => (
              <button key={centre.id} onClick={() => openCentre(centre)} className="flex w-full items-center gap-3 rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-slate-200/70 transition hover:-translate-y-0.5 hover:ring-green-700/30">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-green-50 text-[#1B7A2E]"><MapPin size={21} /></span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold text-[#1A2B6D]">{centre.name}</span>
                  <span className="mt-1 block text-xs text-slate-500">{centre.location}</span>
                  <span className="mt-2 flex flex-wrap gap-1">
                    {centre.crop_types_accepted?.map((crop) => (
                      <span key={crop} className="rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-bold text-[#b85b0a]">{crop}</span>
                    ))}
                  </span>
                </span>
                <ChevronRight size={19} className="text-slate-300" />
              </button>
            ))}
          </div>
        </main>
        <FarmerBottomNav screen={screen} hasBooking={Boolean(booking)} onNavigate={setScreen} lang={lang} />
      </FarmerFrame>
    );
  }

  if (screen === 'slots') {
    return (
      <FarmerFrame bottomNav>
        <AppHeader title="Choose your slot" hindi="अपना स्लॉट चुनें" onBack={() => setScreen('centres')} lang={lang} onToggleLang={toggleLang} />
        <main className="px-4 pb-28 pt-5">
          <section className="rounded-2xl bg-[#1B7A2E] p-4 text-white">
            <p className="text-xs text-green-100">{t(lang, 'Procurement centre', 'खरीद केंद्र')}</p>
            <h1 className="mt-1 text-lg font-extrabold">{selectedCentre?.name}</h1>
            <p className="mt-1 text-xs text-green-100">{selectedCentre?.location}</p>
          </section>
          <Heading en="Select tomorrow's time" hi="कल का समय चुनें" lang={lang} className="mt-6 text-xl font-extrabold text-[#1A2B6D]" />
          {notice && <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{notice}</p>}
          <div className="mt-5 grid grid-cols-2 gap-3">
            {loading && <p className="col-span-2 rounded-2xl bg-white p-4 text-sm text-slate-500 shadow-sm">{t(lang, 'Loading slots…', 'स्लॉट लोड हो रहे हैं…')}</p>}
            {!loading && slots.length === 0 && (
              <p className="col-span-2 rounded-2xl bg-white p-4 text-sm text-slate-500 shadow-sm">{t(lang, 'No slots are available for tomorrow.', 'कल के लिए कोई स्लॉट उपलब्ध नहीं है।')}</p>
            )}
            {slots.map((slot) => {
              const full = slot.booked_count >= slot.capacity;
              const selected = selectedSlot?.id === slot.id;
              return (
                <button
                  key={slot.id}
                  onClick={() => setSelectedSlot(slot)}
                  disabled={full}
                  className={`rounded-2xl border-2 p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-45 ${selected ? 'border-[#1B7A2E] bg-green-50 text-[#1B7A2E]' : 'border-white bg-white text-[#1A2B6D] shadow-sm hover:border-green-200'}`}
                >
                  <span className="flex items-center gap-2 font-extrabold"><Clock3 size={18} /> {slot.time_slot}</span>
                  <span className="mt-2 block text-xs text-slate-500">
                    {full ? t(lang, 'Full', 'भरा हुआ') : t(lang, `${slot.capacity - slot.booked_count} places left`, `${slot.capacity - slot.booked_count} स्थान शेष`)}
                  </span>
                </button>
              );
            })}
          </div>
          {selectedSlot && (
            <button onClick={handleConfirmBooking} disabled={loading} className="mt-6 w-full rounded-xl bg-[#F5841F] px-4 py-3.5 font-bold text-white shadow-md shadow-orange-500/20 transition hover:bg-[#df7015] disabled:opacity-50">
              {loading ? t(lang, 'Confirming…', 'पुष्टि हो रही है…') : t(lang, `Confirm ${selectedSlot.time_slot}`, `${selectedSlot.time_slot} की पुष्टि करें`)}
            </button>
          )}
        </main>
        <FarmerBottomNav screen={screen} hasBooking={Boolean(booking)} onNavigate={setScreen} lang={lang} />
      </FarmerFrame>
    );
  }

  if (screen === 'confirmed') {
    return (
      <FarmerFrame bottomNav>
        <AppHeader title="Booking confirmed" hindi="बुकिंग की पुष्टि" onBack={() => setScreen('centres')} lang={lang} onToggleLang={toggleLang} />
        <main className="px-4 pb-28 pt-6">
          <section className="rounded-[1.7rem] bg-[#1B7A2E] p-6 text-center text-white shadow-lg shadow-green-950/10">
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-white/15"><CheckCircle2 size={32} /></span>
            <Heading en="Your slot is booked" hi="आपका स्लॉट बुक हो गया है" lang={lang} dark className="mt-4 text-2xl font-extrabold" />
            <p className="mt-3 text-sm text-green-50">{selectedCentre?.name} · {selectedSlot?.time_slot}</p>
          </section>
          <section className="mt-5 rounded-3xl bg-white p-5 text-center shadow-sm ring-1 ring-slate-200/70">
            <p className="text-sm font-bold text-[#1A2B6D]">{t(lang, 'Your token', 'आपका टोकन')}</p>
            <p className="mt-3 rounded-2xl bg-green-50 px-3 py-4 font-mono text-2xl font-extrabold tracking-wide text-[#1B7A2E]">{booking?.token_number}</p>
            <div className="mx-auto mt-5 grid size-28 place-items-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-[#1A2B6D]"><QrCode size={76} /></div>
            <p className="mt-3 text-xs text-slate-500">{t(lang, 'Show this at the centre.', 'इसे केंद्र पर दिखाएं।')}</p>
          </section>
          <button onClick={() => setScreen('tracking')} className="mt-5 w-full rounded-xl bg-[#F5841F] px-4 py-3.5 font-bold text-white shadow-md shadow-orange-500/20 transition hover:bg-[#df7015]">
            {t(lang, 'Track live queue', 'लाइव कतार देखें')}
          </button>
        </main>
        <FarmerBottomNav screen={screen} hasBooking={Boolean(booking)} onNavigate={setScreen} lang={lang} />
      </FarmerFrame>
    );
  }

  if (screen === 'tracking') {
    const statusLabel = booking?.status.replace('_', ' ') ?? 'booked';
    return (
      <FarmerFrame bottomNav>
        <AppHeader title="Live queue" hindi="लाइव कतार" onBack={() => setScreen('confirmed')} lang={lang} onToggleLang={toggleLang} />
        <main className="px-4 pb-28 pt-5">
          <section className="rounded-[1.7rem] bg-[#1B7A2E] p-6 text-white shadow-lg shadow-green-950/10">
            <p className="text-sm text-green-100">{t(lang, 'Live procurement', 'लाइव खरीद')}</p>
            <h1 className="mt-1 text-2xl font-extrabold">{farmerName}</h1>
            <p className="mt-1 flex items-center gap-1 text-sm text-green-50"><MapPin size={14} /> {selectedCentre?.name ?? t(lang, 'Procurement centre', 'खरीद केंद्र')}</p>
            <span className="mt-4 inline-flex items-center gap-1 rounded-lg bg-green-950/25 px-3 py-2 text-sm font-bold"><Wheat size={16} /> {selectedCentre?.crop_types_accepted?.[0] ?? t(lang, 'Procurement', 'खरीद')}</span>
          </section>
          <section className="relative mt-5 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
            <span className="absolute right-5 top-5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-bold capitalize text-blue-700">{statusLabel}</span>
            <p className="text-sm font-bold text-[#1A2B6D]">{t(lang, 'Token number', 'टोकन नंबर')}</p>
            <p className="mt-4 rounded-2xl bg-green-50 px-3 py-4 text-center font-mono text-2xl font-extrabold tracking-wide text-[#1B7A2E]">{booking?.token_number}</p>
            <p className="mt-4 flex items-center gap-2 text-sm text-slate-600"><MapPin size={16} className="text-slate-400" /> {selectedCentre?.name}</p>
            <p className="mt-2 flex items-center gap-2 text-sm text-slate-600"><CalendarDays size={16} className="text-slate-400" /> {t(lang, 'Tomorrow', 'कल')} · {selectedSlot?.time_slot}</p>
          </section>
          <section className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-blue-50 p-4 text-center text-blue-700">
              <p className="text-2xl font-extrabold">{peopleAhead}</p>
              <p className="mt-1 text-xs font-bold">{t(lang, 'In this queue', 'कतार में किसान')}</p>
            </div>
            <div className="rounded-2xl bg-orange-50 p-4 text-center text-[#c45c06]">
              <p className="text-2xl font-extrabold">~{estimatedWait} min</p>
              <p className="mt-1 text-xs font-bold">{t(lang, 'Estimated wait', 'अनुमानित प्रतीक्षा')}</p>
            </div>
          </section>
          <section className="mt-5 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
            <Heading en="Status timeline" hi="स्थिति समयरेखा" lang={lang} className="font-extrabold text-[#1A2B6D]" />
            <div className="mt-5 space-y-0">
              {statusLabels.map(([label, hindi], index) => {
                const complete = index < currentIndex || (index === currentIndex && booking?.status === 'complete');
                const current = index === currentIndex && booking?.status !== 'complete';
                return (
                  <div key={label} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      {complete ? (
                        <CheckCircle2 size={22} className="text-[#1B7A2E]" />
                      ) : current ? (
                        <span className="grid size-[22px] place-items-center rounded-full border-2 border-[#F5841F] bg-orange-50"><span className="size-2 rounded-full bg-[#F5841F]" /></span>
                      ) : (
                        <Circle size={22} className="text-slate-300" />
                      )}
                      {index < statusLabels.length - 1 && <span className={`my-1 h-7 w-0.5 ${complete ? 'bg-green-200' : 'bg-slate-200'}`} />}
                    </div>
                    <div className="pb-3">
                      <p className={`text-sm font-bold ${complete ? 'text-[#1B7A2E]' : current ? 'text-[#b85b0a]' : 'text-slate-400'}`}>{lang === 'hi' ? hindi : label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </main>
        <FarmerBottomNav screen={screen} hasBooking={Boolean(booking)} onNavigate={setScreen} lang={lang} />
      </FarmerFrame>
    );
  }

  return (
    <FarmerFrame bottomNav>
      <AppHeader title="Notifications" hindi="सूचनाएं" onBack={() => setScreen(booking ? 'tracking' : 'centres')} lang={lang} onToggleLang={toggleLang} />
      <main className="px-4 pb-28 pt-5">
        <Heading en="Your updates" hi="आपकी सूचनाएं" lang={lang} className="text-xl font-extrabold text-[#1A2B6D]" />
        {notice && <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{notice}</p>}
        <div className="mt-5 space-y-3">
          {loading && <p className="rounded-2xl bg-white p-4 text-sm text-slate-500 shadow-sm">{t(lang, 'Loading updates…', 'अपडेट लोड हो रहे हैं…')}</p>}
          {!loading && notifications.length === 0 && (
            <div className="rounded-3xl bg-white p-7 text-center shadow-sm ring-1 ring-slate-200/70">
              <Bell size={28} className="mx-auto text-slate-300" />
              <Heading en="No notifications yet" hi="अभी कोई सूचना नहीं है" lang={lang} className="mt-3 font-bold text-[#1A2B6D]" />
            </div>
          )}
          {notifications.map((notification) => (
            <article key={notification.id} className={`flex gap-3 rounded-2xl p-4 shadow-sm ring-1 ${notification.read ? 'bg-white ring-slate-200/70' : 'bg-green-50 ring-green-200'}`}>
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700"><Bell size={18} /></span>
              <div>
                <h2 className="text-sm font-extrabold text-[#1A2B6D]">{notification.title}</h2>
                <p className="mt-1 text-sm leading-5 text-slate-600">{notification.message}</p>
                <p className="mt-2 text-xs text-slate-400">{new Date(notification.created_at).toLocaleString()}</p>
              </div>
            </article>
          ))}
        </div>
      </main>
      <FarmerBottomNav screen={screen} hasBooking={Boolean(booking)} onNavigate={setScreen} lang={lang} />
    </FarmerFrame>
  );
}

export default FarmerApp;