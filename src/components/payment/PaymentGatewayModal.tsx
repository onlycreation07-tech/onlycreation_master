import React, { useState } from 'react';
import { 
  X, 
  CreditCard, 
  Smartphone, 
  QrCode, 
  ShieldCheck, 
  CheckCircle2, 
  Lock, 
  Building, 
  Coins, 
  ArrowRight,
  Download,
  Receipt,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PaymentOrder, PaymentResult, paymentService } from '../../services/paymentService';

interface PaymentGatewayModalProps {
  isOpen: boolean;
  order: PaymentOrder;
  onClose: () => void;
  onSuccess: (result: PaymentResult) => void;
}

export default function PaymentGatewayModal({ isOpen, order, onClose, onSuccess }: PaymentGatewayModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'wallet' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('creator@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');
  const [cardName, setCardName] = useState('CREATOR ENTERPRISES');
  const [processing, setProcessing] = useState(false);
  const [completedResult, setCompletedResult] = useState<PaymentResult | null>(null);
  const [gatewayMode, setGatewayMode] = useState<'live' | 'test'>('test');

  if (!isOpen) return null;

  const handlePay = async () => {
    setProcessing(true);
    try {
      const result = await paymentService.verifyPayment(order, selectedMethod.toUpperCase());
      setCompletedResult(result);
      onSuccess(result);
    } catch (err) {
      console.error(err);
      alert('Payment could not be processed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-sleek-dark border border-white/10 rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl flex flex-col relative"
      >
        {/* Header */}
        <div className="p-5 bg-zinc-950/80 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sleek-violet to-sleek-fuchsia flex items-center justify-center text-white shadow-lg">
              <ShieldCheck size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-white">OnlyCreation Pay</h3>
                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${
                  gatewayMode === 'live' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}>
                  {gatewayMode === 'live' ? 'Live Gateway' : 'Test Mode Active'}
                </span>
              </div>
              <p className="text-[10px] text-white/40 font-mono">256-bit SSL Encrypted Production Checkout</p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            disabled={processing}
            className="p-2 text-white/40 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body content */}
        {!completedResult ? (
          <div className="p-6 flex flex-col gap-6 max-h-[80vh] overflow-y-auto hide-scrollbar">
            
            {/* Order Summary Pill */}
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">Payable Amount</span>
                <span className="text-2xl font-black text-white tracking-tight">₹{order.amount.toLocaleString()}</span>
                <span className="text-[10px] text-sleek-violet font-semibold mt-0.5 truncate max-w-[240px]">{order.itemTitle}</span>
              </div>

              <div className="text-right">
                <span className="text-[9px] font-bold uppercase tracking-widest text-white/30">Order Reference</span>
                <p className="text-[10px] font-mono text-white/60">{order.orderId}</p>
              </div>
            </div>

            {/* Payment Method Selector Tabs */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Select Payment Gateway / Option</label>
              
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'upi', label: 'UPI / QR', icon: Smartphone },
                  { id: 'card', label: 'Cards', icon: CreditCard },
                  { id: 'wallet', label: 'GoCab Coin', icon: Coins },
                  { id: 'netbanking', label: 'NetBank', icon: Building },
                ].map(m => {
                  const Icon = m.icon;
                  const active = selectedMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMethod(m.id as any)}
                      className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                        active 
                          ? 'bg-sleek-violet text-white border-sleek-violet shadow-lg shadow-sleek-violet/20' 
                          : 'bg-white/5 text-white/50 border-white/5 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon size={18} />
                      <span className="text-[9px] font-bold uppercase tracking-wider">{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Method Inputs */}
            {selectedMethod === 'upi' && (
              <div className="bg-zinc-950/60 p-4 rounded-2xl border border-white/5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-white/40">Instant UPI & QR</span>
                  <div className="flex gap-2">
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/20">GPay</span>
                    <span className="text-[9px] bg-purple-500/10 text-purple-400 font-bold px-2 py-0.5 rounded border border-purple-500/20">PhonePe</span>
                    <span className="text-[9px] bg-blue-500/10 text-blue-400 font-bold px-2 py-0.5 rounded border border-blue-500/20">Paytm</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-white/30 uppercase">Enter Virtual Payment Address (VPA)</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="yourname@okhdfcbank"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white font-mono outline-none focus:border-sleek-violet"
                  />
                </div>

                <div className="p-3 bg-white/5 rounded-xl border border-dashed border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <QrCode size={20} className="text-sleek-violet" />
                    <div>
                      <p className="text-xs font-bold text-white/90">Scan UPI Dynamic QR</p>
                      <p className="text-[9px] text-white/40">Open Camera / Any UPI App</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-sleek-violet uppercase bg-sleek-violet/10 px-2 py-1 rounded-lg">Scan to Pay</span>
                </div>
              </div>
            )}

            {selectedMethod === 'card' && (
              <div className="bg-zinc-950/60 p-4 rounded-2xl border border-white/5 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase text-white/40">Credit / Debit Card</span>
                  <div className="flex gap-1.5">
                    <span className="text-[8px] font-bold bg-white/10 text-white/80 px-1.5 py-0.5 rounded">VISA</span>
                    <span className="text-[8px] font-bold bg-white/10 text-white/80 px-1.5 py-0.5 rounded">MasterCard</span>
                    <span className="text-[8px] font-bold bg-white/10 text-white/80 px-1.5 py-0.5 rounded">RuPay</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-white/30 uppercase">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white font-mono outline-none focus:border-sleek-violet"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-white/30 uppercase">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white font-mono outline-none focus:border-sleek-violet"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-white/30 uppercase">CVV</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white font-mono outline-none focus:border-sleek-violet"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-white/30 uppercase">Cardholder Name</label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white uppercase outline-none focus:border-sleek-violet"
                  />
                </div>
              </div>
            )}

            {selectedMethod === 'wallet' && (
              <div className="bg-zinc-950/60 p-4 rounded-2xl border border-white/5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-white/40">OnlyCreation Instant Wallet</span>
                  <span className="text-xs font-black text-amber-400">120,000 Coins Available</span>
                </div>
                <p className="text-xs text-white/70">
                  You can pay instantly using your verified balance. Zero gateway fees and 100% instant settlement.
                </p>
              </div>
            )}

            {selectedMethod === 'netbanking' && (
              <div className="bg-zinc-950/60 p-4 rounded-2xl border border-white/5 flex flex-col gap-2">
                <span className="text-[10px] font-bold uppercase text-white/40">Select NetBanking Provider</span>
                <div className="grid grid-cols-2 gap-2 text-xs font-bold text-white/80">
                  {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank'].map((b) => (
                    <button key={b} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 text-left">
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Hosting / Deployment Notice */}
            <div className="flex items-center justify-between text-[9px] text-white/40 px-1">
              <span className="flex items-center gap-1">
                <Lock size={10} /> PCI-DSS Level 1 Certified
              </span>
              <button 
                onClick={() => setGatewayMode(prev => prev === 'test' ? 'live' : 'test')}
                className="text-sleek-violet font-bold hover:underline"
              >
                Switch to {gatewayMode === 'test' ? 'Live Gateway Keys' : 'Test Sandbox'}
              </button>
            </div>

            {/* Action Pay Button */}
            <button
              onClick={handlePay}
              disabled={processing}
              className="w-full bg-gradient-to-r from-sleek-violet to-sleek-fuchsia text-white py-4 rounded-2xl font-black text-sm uppercase tracking-wider shadow-xl shadow-sleek-violet/30 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
            >
              {processing ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Securing & Processing ₹{order.amount}...
                </>
              ) : (
                <>
                  <Lock size={16} />
                  Authorize & Pay ₹{order.amount.toLocaleString()}
                </>
              )}
            </button>
          </div>
        ) : (
          /* Payment Success & Receipt View */
          <div className="p-6 flex flex-col items-center text-center gap-5">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-xl">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <h3 className="text-xl font-black text-white">Payment Confirmed!</h3>
              <p className="text-xs text-white/50 font-medium mt-1">Transaction settled and authorized on production gateway.</p>
            </div>

            {/* Invoice Details */}
            <div className="bg-white/5 w-full p-4 rounded-2xl border border-white/5 flex flex-col gap-2.5 text-xs text-left">
              <div className="flex justify-between">
                <span className="text-white/40 font-bold uppercase text-[9px]">Payment ID:</span>
                <span className="font-mono text-emerald-400 font-bold">{completedResult.paymentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40 font-bold uppercase text-[9px]">Item:</span>
                <span className="font-semibold text-white/90 truncate max-w-[200px]">{order.itemTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40 font-bold uppercase text-[9px]">Method:</span>
                <span className="font-semibold text-white">{completedResult.method}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-white/5 font-extrabold text-sm">
                <span className="text-white">Total Settled:</span>
                <span className="text-sleek-violet">₹{completedResult.amount.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-2 w-full">
              <button
                onClick={onClose}
                className="flex-1 bg-sleek-violet text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg hover:bg-sleek-violet/80 transition-all"
              >
                Done
              </button>
              <button
                onClick={() => alert(`Receipt downloaded for ${completedResult.paymentId}`)}
                className="p-3.5 bg-white/5 hover:bg-white/10 rounded-xl text-white/70 border border-white/10 flex items-center justify-center"
                title="Download Receipt"
              >
                <Download size={16} />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
