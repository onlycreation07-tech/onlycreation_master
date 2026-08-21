import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, MapPin, Star, Calendar, ChevronRight, Info, RefreshCw, Instagram, Globe, Layout, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { dbService } from '../../services/dbService';
import { AdCreative, Studio, BrandProfile } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import PaymentGatewayModal from '../payment/PaymentGatewayModal';
import { PaymentOrder } from '../../services/paymentService';

interface StudiosScreenProps {
  activeCreative?: AdCreative | null;
  brandProfile: BrandProfile;
  onToggleLike: (studioId: string) => void;
  initialCategory?: 'all' | 'photography' | 'video' | 'music' | 'podcast' | 'billboard' | 'liked';
}

export default function StudiosScreen({ activeCreative, brandProfile, onToggleLike, initialCategory = 'all' }: StudiosScreenProps) {
  const [studios, setStudios] = useState<Studio[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'photography' | 'video' | 'music' | 'podcast' | 'billboard' | 'liked'>(initialCategory);
  const [selectedStudio, setSelectedStudio] = useState<Studio | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'feed'>('list');
  const [paymentOrder, setPaymentOrder] = useState<PaymentOrder | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    setSelectedCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    const loadStudios = async () => {
      setLoading(true);
      try {
        const data = await dbService.getStudios();
        setStudios(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadStudios();
  }, []);

  const filteredStudios = studios.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                         s.location.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'all' 
      ? true 
      : selectedCategory === 'liked' 
        ? brandProfile.likedStudioIds?.includes(s.id)
        : s.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <RefreshCw className="animate-spin text-sleek-violet" size={32} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-12">
      <header className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tighter text-white/90">Studios</h1>
            <span className="bg-sleek-violet/20 text-sleek-violet text-[8px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-full border border-sleek-violet/30">
              Live Production
            </span>
          </div>
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-sleek-violet text-white shadow-lg' : 'text-white/40'}`}
            >
              <SlidersHorizontal size={14} />
            </button>
            <button 
              onClick={() => setViewMode('feed')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'feed' ? 'bg-sleek-violet text-white shadow-lg' : 'text-white/40'}`}
            >
              <Layout size={14} />
            </button>
          </div>
        </div>
        <p className="text-white/40 text-sm font-medium">One-stop source for any production needs.</p>
      </header>

      {activeCreative && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-sleek-violet/20 to-transparent border border-sleek-violet/30 p-5 rounded-3xl flex flex-col gap-4"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-sleek-violet/20 text-white/90">Produce this Ad</h3>
              <p className="text-[10px] uppercase font-bold tracking-widest text-white/40 mt-1">AI pre-filled brief for studios</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-sleek-violet/20 flex items-center justify-center">
              <ChevronRight size={16} className="text-sleek-violet" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-800 border border-white/10">
              <img src={activeCreative.imageUrls[0]} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold text-white/90 truncate max-w-[160px]">{activeCreative.prompt}</div>
              <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-0.5">3 Studio matches</div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="flex flex-col gap-4 sticky top-0 z-10 bg-sleek-black pt-2 pb-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search studios..."
            className="w-full bg-sleek-dark border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white/80 focus:outline-none focus:ring-1 focus:ring-sleek-violet/50"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {(['all', 'liked', 'photography', 'video', 'music', 'podcast', 'billboard'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`relative px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest leading-none transition-all whitespace-nowrap border ${
                selectedCategory === cat 
                  ? 'bg-sleek-violet text-white border-sleek-violet shadow-lg shadow-sleek-violet/20' 
                  : 'bg-white/5 text-white/40 border-white/10 hover:border-white/20'
              }`}
            >
              {cat === 'liked' ? 'Saved' : cat === 'photography' ? 'Photo' : cat === 'video' ? 'Film' : cat}
              {cat === 'billboard' && (
                <span className="absolute -top-2 -right-1 bg-gradient-to-tr from-sleek-fuchsia to-sleek-violet text-[7px] text-white px-1.5 py-0.5 rounded-full ring-2 ring-sleek-black animate-pulse font-black">
                  NEW
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {viewMode === 'list' ? (
          filteredStudios.map((studio, idx) => (
            <motion.div
              key={studio.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => setSelectedStudio(studio)}
              className="group flex flex-col gap-3 cursor-pointer"
            >
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-xl">
                <img
                  src={studio.imageUrl}
                  alt={studio.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleLike(studio.id);
                    }}
                    className={`p-2 rounded-full backdrop-blur-md transition-all ${
                      brandProfile.likedStudioIds?.includes(studio.id)
                        ? 'bg-red-500 text-white'
                        : 'bg-black/50 text-white/70 hover:text-white'
                    }`}
                  >
                    <Star size={14} className={brandProfile.likedStudioIds?.includes(studio.id) ? 'fill-current' : ''} />
                  </button>
                  <div className="bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1">
                    <Star size={12} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-xs font-bold text-white">{studio.rating}</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-start px-1">
                <div className="flex flex-col gap-1">
                  <h3 className="font-bold text-lg text-white/90">{studio.name}</h3>
                  <div className="flex items-center gap-1.5 text-white/40 text-[10px] font-bold uppercase tracking-widest">
                    <MapPin size={10} className="text-sleek-violet" />
                    <span>{studio.location}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black tracking-tighter text-white/90">${studio.pricePerHour}</p>
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest whitespace-nowrap">per hour</p>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="flex flex-col gap-12">
            {filteredStudios.map((studio, idx) => (
              <motion.div
                key={studio.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col gap-4 bg-sleek-dark/30 p-2 rounded-[48px] border border-white/5"
              >
                <div 
                  className="relative aspect-square rounded-[40px] overflow-hidden border border-white/10"
                >
                  <img 
                    src={studio.imageUrl} 
                    className="w-full h-full object-cover" 
                    onClick={() => setSelectedStudio(studio)}
                  />
                  <div className="absolute top-6 right-6 flex flex-col gap-3">
                    <button 
                      onClick={() => onToggleLike(studio.id)}
                      className={`p-4 rounded-3xl backdrop-blur-xl border transition-all ${
                        brandProfile.likedStudioIds?.includes(studio.id)
                          ? 'bg-red-500 border-red-400 text-white shadow-xl shadow-red-500/20'
                          : 'bg-black/20 border-white/10 text-white'
                      }`}
                    >
                      <Star size={20} className={brandProfile.likedStudioIds?.includes(studio.id) ? 'fill-current' : ''} />
                    </button>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-8">
                    <div className="flex justify-between items-end">
                      <div className="flex flex-col gap-1" onClick={() => setSelectedStudio(studio)}>
                        <div className="flex items-center gap-2">
                           <h3 className="text-2xl font-black text-white">{studio.name}</h3>
                           {studio.isPremium && <span className="bg-sleek-violet text-white text-[8px] font-black px-1.5 py-0.5 rounded">PRO</span>}
                        </div>
                        <p className="text-white/60 text-xs font-bold uppercase tracking-widest">{studio.location} • {studio.category}</p>
                      </div>
                      <button 
                        onClick={() => setSelectedStudio(studio)}
                        className="bg-white text-black p-4 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all"
                      >
                        <ArrowUpRight size={20} />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Visual Portfolio Strip */}
                <div className="flex gap-2 px-1 overflow-x-auto hide-scrollbar mb-2 mt-1">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex-shrink-0 w-24 h-24 rounded-2xl bg-white/5 border border-white/5 overflow-hidden">
                      <img src={`https://picsum.photos/seed/${studio.id}${i}/200`} className="w-full h-full object-cover grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all" />
                    </div>
                  ))}
                  <button 
                    onClick={() => setSelectedStudio(studio)}
                    className="flex-shrink-0 w-24 h-24 rounded-2xl bg-sleek-violet/10 border border-sleek-violet/20 flex flex-col items-center justify-center gap-1 hover:bg-sleek-violet/20 transition-all"
                  >
                    <Layout size={16} className="text-sleek-violet" />
                    <span className="text-[8px] font-black text-sleek-violet uppercase tracking-widest">More</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedStudio && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-zinc-950 w-full max-w-md rounded-t-[40px] border-t border-zinc-900 pb-12 max-h-[90vh] overflow-y-auto hide-scrollbar relative"
            >
              <div className="sticky top-0 z-20 bg-zinc-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-white/5">
                <button 
                  onClick={() => setSelectedStudio(null)}
                  className="flex items-center gap-2 text-white/40 hover:text-white transition-colors"
                >
                  <ChevronRight size={20} className="rotate-180" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Back to Gallery</span>
                </button>
                <div className="h-1.5 w-12 bg-zinc-800 rounded-full" />
                <button 
                  onClick={() => onToggleLike(selectedStudio.id)}
                  className={`p-2 rounded-full border transition-all ${
                    brandProfile.likedStudioIds?.includes(selectedStudio.id)
                      ? 'bg-red-500 border-red-400 text-white'
                      : 'bg-white/5 border-white/10 text-white/40'
                  }`}
                >
                  <Star size={16} className={brandProfile.likedStudioIds?.includes(selectedStudio.id) ? 'fill-current' : ''} />
                </button>
              </div>
              
              <div className="px-6 flex flex-col gap-8 pt-4">
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <h2 className="text-3xl font-bold tracking-tighter">{selectedStudio.name}</h2>
                    <button onClick={() => setSelectedStudio(null)} className="text-zinc-500 hover:text-white">
                      <Star size={24} />
                    </button>
                  </div>
                  <div className="aspect-video rounded-2xl overflow-hidden">
                    <img src={selectedStudio.imageUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <h3 className="text-lg font-bold tracking-tight">About this space</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{selectedStudio.description}</p>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold tracking-tight">Portfolio & Vibes</h3>
                    <div className="flex items-center gap-3">
                      <button className="text-white/40 hover:text-sleek-violet transition-colors">
                        <Instagram size={18} />
                      </button>
                      <button className="text-white/40 hover:text-white transition-colors">
                        <Globe size={18} />
                      </button>
                    </div>
                  </div>
                  {selectedStudio.previousWorks && selectedStudio.previousWorks.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {selectedStudio.previousWorks.map((work, idx) => (
                        <div key={idx} className="aspect-square rounded-xl overflow-hidden border border-white/5 bg-white/5">
                          <img src={work.url} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="aspect-square rounded-xl overflow-hidden border border-white/5 bg-white/5 opacity-50">
                          <img src={`https://picsum.photos/seed/${selectedStudio.name}${i}/200`} className="w-full h-full object-cover grayscale" />
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] text-center mt-1">Check verified previous works</p>
                </div>

                <div className="flex flex-col gap-4">
                  <h3 className="text-lg font-bold tracking-tight">Production Expertise</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedStudio.genres?.map(genre => (
                      <span key={genre} className="bg-sleek-violet/10 border border-sleek-violet/20 text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full text-sleek-violet">
                        {genre}
                      </span>
                    ))}
                    {!selectedStudio.genres?.length && (
                      <span className="text-xs text-white/40 italic">Open to all genres</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <h3 className="text-lg font-bold tracking-tight">
                    {selectedStudio.category === 'billboard' ? 'Billboard Specifications' : 'Technical Inventory'}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedStudio.equipment.map(item => (
                      <span key={item} className="bg-zinc-900 border border-zinc-800 text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded-lg text-zinc-300">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {selectedStudio.amenities && selectedStudio.amenities.length > 0 && (
                  <div className="flex flex-col gap-4">
                    <h3 className="text-lg font-bold tracking-tight">Amenities</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedStudio.amenities.map(amenity => (
                        <div key={amenity} className="flex items-center gap-2 text-white/60">
                          <div className="w-1.5 h-1.5 rounded-full bg-sleek-violet"></div>
                          <span className="text-xs font-medium">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-4 bg-zinc-900/50 p-6 rounded-3xl border border-white/5">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-white text-black rounded-2xl">
                        <Calendar size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Availability</p>
                        <p className="text-sm font-bold">{selectedStudio.availability || 'Inquire for slots'}</p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-zinc-700" />
                  </div>
                </div>

                <div className="flex flex-col gap-3 py-6 border-t border-zinc-900 mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2 text-white/40">
                      <Info size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Flexible cancellation</span>
                    </div>
                  </div>
                  
                  {bookingSuccess ? (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center gap-2 text-emerald-400 font-bold text-sm">
                      <CheckCircle2 size={20} />
                      Booking Authorized & Confirmed!
                    </div>
                  ) : (
                    <button 
                      onClick={() => {
                        setPaymentOrder({
                          orderId: `std_${Date.now()}`,
                          amount: selectedStudio.pricePerHour * 4,
                          currency: 'INR',
                          itemType: 'studio_booking',
                          itemTitle: `4-Hour Booking: ${selectedStudio.name}`,
                          itemDescription: `${selectedStudio.location} • Production Space`,
                          customerEmail: 'creator@onlycreation.io',
                          customerName: brandProfile.name
                        });
                      }}
                      className="w-full bg-gradient-to-r from-sleek-violet to-sleek-fuchsia text-white py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-xl shadow-sleek-violet/20 active:scale-[0.98] transition-all hover:brightness-110"
                    >
                      Confirm Booking • ₹{selectedStudio.pricePerHour * 4}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Production Payment Modal */}
      {paymentOrder && (
        <PaymentGatewayModal
          isOpen={!!paymentOrder}
          order={paymentOrder}
          onClose={() => setPaymentOrder(null)}
          onSuccess={async (res) => {
            if (selectedStudio) {
              await dbService.createBooking({
                studioId: selectedStudio.id,
                studioName: selectedStudio.name,
                userId: 'auth_user',
                date: new Date().toISOString().split('T')[0],
                hours: 4,
                totalPrice: selectedStudio.pricePerHour * 4,
                status: 'confirmed',
                brandName: brandProfile.name
              }).catch(console.error);
            }
            setBookingSuccess(true);
            setTimeout(() => {
              setBookingSuccess(false);
              setSelectedStudio(null);
            }, 2000);
          }}
        />
      )}
    </div>
  );
}
