import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Check, ShieldCheck, Sparkles, Coins, Zap, Star, Crown, RefreshCw, AlertCircle, CreditCard, X, KeySquare } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';

const getDb = () => (globalThis as any).db;
const collection = (...args: any[]) => (globalThis as any).collection(...args);
const query = (...args: any[]) => (globalThis as any).query(...args);
const getDocs = (...args: any[]) => (globalThis as any).getDocs(...args);
const onSnapshot = (...args: any[]) => (globalThis as any).onSnapshot(...args);
const doc = (...args: any[]) => (globalThis as any).doc(...args);
const setDoc = (...args: any[]) => (globalThis as any).setDoc(...args);
const updateDoc = (...args: any[]) => (globalThis as any).updateDoc(...args);
const where = (...args: any[]) => (globalThis as any).where(...args);

export const FALLBACK_PACKAGES = [
  {
    id: 'starter-pkg',
    name: 'Bronze Starter',
    price: 4.99,
    description: 'Unlock entry-level benefits, basic daily card packs, and starter access to P2P player trading.',
    features: [
      'Daily reward bonus (~250 coins/day)',
      'Basic card pack discounts (5%)',
      'Unlock basic trade listings',
      'Bronze profile highlight badge'
    ]
  },
  {
    id: 'pro-pkg',
    name: 'Silver Pro',
    price: 14.99,
    description: 'Perfect balance for ambitious club managers. Higher trading limits, premium pack drops, and advanced penalty statistics.',
    features: [
      'Higher daily coin dividends (~500 coins/day)',
      'Advanced market analysis tools',
      'Bronze & Silver pack discounts (15%)',
      'Exclusive squad customization theme',
      'Silver profile highlight badge'
    ]
  },
  {
    id: 'elite-pkg',
    name: 'Gold Elite',
    price: 29.99,
    description: 'The ultimate privilege suite for top-tier Footex tycoons. Infinite trading power, maximum pack guarantees, and full match telemetry.',
    features: [
      'Legendary daily coin dividends (~1,500 coins/day)',
      'Max listing capacity in Auctions & P2P',
      'Premium packs discounts (25%)',
      'Unlimited penalty gameplay retries',
      'Special Golden crown icon on leaderboard',
      'Direct support from command office log access'
    ]
  }
];

export const PricingView = () => {
  const { user, profile } = useAuth();
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);

  // Load subscriptions packages from Firestore
  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(getDb(), 'pricing_packages'), (snap) => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (list.length > 0) {
          // Sort by price ascending
          list.sort((a: any, b: any) => a.price - b.price);
          setPackages(list);
        } else {
          setPackages(FALLBACK_PACKAGES);
        }
        setLoading(false);
      }, (err) => {
        console.error("Error loading packages from Firestore, using fallbacks:", err);
        setPackages(FALLBACK_PACKAGES);
        setLoading(false);
      });

      return () => unsub();
    } catch (e) {
      console.error(e);
      setPackages(FALLBACK_PACKAGES);
      setLoading(false);
    }
  }, []);

  const [selectedCheckoutPkg, setSelectedCheckoutPkg] = useState<any | null>(null);
  
  // Checkout form states
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'card'>('wallet');
  const [subscriberName, setSubscriberName] = useState('');
  const [paymentPhone, setPaymentPhone] = useState('');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);

  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [checkoutStep, setCheckoutStep] = useState<'form' | 'processing' | 'success'>('form');
  const [processingStatus, setProcessingStatus] = useState('');
  const [pendingRequest, setPendingRequest] = useState<any | null>(null);

  // Load pending subscription requests for the logged-in user
  useEffect(() => {
    if (!user) return;
    try {
      const q = query(
        collection(getDb(), 'transactions'),
        where('type', '==', 'subscription_purchase'),
        where('status', '==', 'pending'),
        where('participantIds', 'array-contains', user.uid)
      );
      const unsub = onSnapshot(q, (snap) => {
        if (snap.docs && snap.docs.length > 0) {
          const first = snap.docs[0].data();
          setPendingRequest({ id: snap.docs[0].id, ...first });
        } else {
          setPendingRequest(null);
        }
      });
      return () => unsub();
    } catch (e) {
      console.error("Error loading pending requests:", e);
    }
  }, [user]);

  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  useEffect(() => {
    const unsub = onSnapshot(doc(getDb(), 'settings', 'payment_info'), (snap: any) => {
        const data = typeof snap.data === 'function' ? snap.data() : snap;
        if (data) {
            setPaymentInfo(data);
        }
    });
    return () => unsub();
  }, []);

  // Prefill holder name on profile load
  useEffect(() => {
    if (profile) {
      setCardHolder(profile.club || profile.username || profile.email || 'Club Manager');
      setSubscriberName(profile.club || profile.username || '');
    }
  }, [profile]);

  const handleSubscribe = (pkg: any) => {
    if (!user || !profile) {
      toast.error("You must be logged in to subscribe!");
      return;
    }

    if (profile.subscription === pkg.id) {
      toast.error("You are already subscribed to this package!");
      return;
    }

    // Open checkout modal
    setSelectedCheckoutPkg(pkg);
    setCheckoutStep('form');
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
  };

  const handleCompleteUSDCheckout = async () => {
    if (!selectedCheckoutPkg || !user || !profile) return;
    
    // Simple validation
    if (paymentMethod === 'wallet') {
      if (!subscriberName.trim()) {
        toast.error("يرجى إدخال اسم الشخص الذي يشترك! / Please enter subscriber name!");
        return;
      }
      if (!paymentPhone.trim()) {
        toast.error("يرجى إدخال رقم هاتف محفظة التحويل! / Please enter payment phone number!");
        return;
      }
      if (!receiptImage) {
        toast.error("يرجى رفع أو إرفاق صورة التحويل! / Please upload/attach transfer receipt image!");
        return;
      }
    } else {
      if (!cardNumber || !cardExpiry || !cardCvv) {
        toast.error("Please complete all credit card details!");
        return;
      }
    }

    setCheckoutStep('processing');
    setProcessingStatus('Initiating secure vault gateway sequence...');
    
    await new Promise(resolve => setTimeout(resolve, 800));
    setProcessingStatus(paymentMethod === 'wallet' ? 'Validating wallet transfer proof file contents...' : 'Authenticating transaction with Stripe API sandbox...');
    
    await new Promise(resolve => setTimeout(resolve, 800));
    setProcessingStatus(paymentMethod === 'wallet' ? `Registering pending subscription for $${selectedCheckoutPkg.price} USD...` : `Authorizing standard secure billing of $${selectedCheckoutPkg.price} USD...`);
    
    await new Promise(resolve => setTimeout(resolve, 700));
    setProcessingStatus('Finalizing secure credentials transfer...');
    await new Promise(resolve => setTimeout(resolve, 400));

    try {
      const txId = `sub-${Date.now()}`;
      const txRef = doc(getDb(), 'transactions', txId);

      if (paymentMethod === 'card') {
        const userRef = doc(getDb(), 'users', user.uid);
        
        let updates: any = {
           subscription: selectedCheckoutPkg.id
        };
        if (!profile.promoCode) {
           updates.promoCode = Math.random().toString(36).substring(2, 6).toUpperCase() + user.uid.substring(0, 4).toUpperCase();
        }
        await updateDoc(userRef, updates);
      }

      await setDoc(txRef, {
        id: txId,
        type: 'subscription_purchase',
        senderId: user.uid,
        senderEmail: profile.email || user.email || 'Unregistered User',
        recipientId: 'system',
        recipientEmail: 'billing@footex.app',
        amount: selectedCheckoutPkg.price, // USD Price
        playerName: selectedCheckoutPkg.name,
        packageId: selectedCheckoutPkg.id,
        participantIds: [user.uid],
        date: new Date().toISOString(),
        paymentMethod: paymentMethod,
        subscriberName: paymentMethod === 'wallet' ? subscriberName : (cardHolder || profile.username || 'System User'),
        paymentPhone: paymentMethod === 'wallet' ? paymentPhone : 'Credit card Instant Auto-Cleared',
        transferProof: receiptImage || null,
        status: paymentMethod === 'wallet' ? 'pending' : 'approved'
      });

      setCheckoutStep('success');
      if (paymentMethod === 'wallet') {
        toast.success("تم تقديم طلب الاشتراك بنجاح! ينتظر مراجعة المدير. / Subscription request submitted successfully!");
      } else {
        toast.success(`${selectedCheckoutPkg.name} premium access is now live on your account!`);
      }
    } catch (err: any) {
      console.error("USD Subscription activation failure:", err);
      toast.error("Database write failure: " + err.message);
      setCheckoutStep('form');
    }
  };

  // If user has admin rights, we let them quickly initialize packages if Firestore is empty
  const handleSeedPackages = async () => {
    if (profile?.role !== 'admin') return;
    setLoading(true);
    try {
      for (const p of FALLBACK_PACKAGES) {
        await setDoc(doc(getDb(), 'pricing_packages', p.id), {
          name: p.name,
          price: p.price,
          description: p.description,
          features: p.features
        });
      }
      toast.success("Successfully seeded 3 default pricing packages to Firestore!");
    } catch (err: any) {
      toast.error("Error seeding pricing packages: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const currentPackage = packages.find(p => p.id === profile?.subscription);

  return (
    <div className="p-4 sm:p-8 min-h-screen flex flex-col gap-6 max-w-7xl mx-auto overflow-y-auto pb-24">
      {/* Header Banner */}
      <div className="text-center py-6 border-b border-white/10 flex flex-col items-center gap-2">
        <div className="inline-flex items-center gap-2 bg-[#48A111]/10 px-4 py-1.5 rounded-full border border-[#48A111]/20 text-[#48A111] text-xs font-mono font-bold tracking-widest uppercase mb-2">
          <Sparkles className="w-4.5 h-4.5 animate-pulse" />
          Footex Premium Club Access
        </div>
        <h1 className="text-3xl sm:text-5xl font-black uppercase italic tracking-tighter text-white">
          SOCIETY SUBSCRIPTION PLANS
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 max-w-2xl font-mono uppercase tracking-wide">
          Activate elite benefits, unlock compound daily rewards, and secure ultimate leverage on the Footex marketplace.
        </p>
      </div>

      {/* User Current Subscription Card */}
      <div className="bg-gradient-to-r from-zinc-900 via-neutral-950 to-zinc-900 border border-white/10 p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full border border-white/15 bg-black/55 flex items-center justify-center text-xl">
            {profile?.subscription === 'elite-pkg' ? (
              <Crown className="w-6 h-6 text-amber-400 rotate-12" />
            ) : profile?.subscription === 'pro-pkg' ? (
              <Star className="w-6 h-6 text-cyan-400" />
            ) : profile?.subscription === 'starter-pkg' ? (
              <Zap className="w-6 h-6 text-emerald-400" />
            ) : (
              <ShieldCheck className="w-6 h-6 text-gray-400" />
            )}
          </div>
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider font-mono">YOUR ACTIVE SUBSCRIPTION</span>
            <h3 className="text-xl font-black text-white italic uppercase tracking-tight flex items-center gap-2">
              {currentPackage ? currentPackage.name : "No Active Pack"}
              {profile?.promoCode && (
                <span className="bg-[#48A111]/20 text-[#48A111] px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest border border-[#48A111]/30">
                  CODE: {profile.promoCode}
                </span>
              )}
            </h3>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <div className="text-right">
            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider font-mono">AVAILABLE COINS</span>
            <div className="flex items-center gap-2 font-mono justify-end">
              <Coins className="w-4 h-4 text-[#48A111]" />
              <span className="text-lg font-bold text-[#48A111]">${(profile?.coins || 0).toLocaleString()}</span>
            </div>
          </div>

          {profile?.role === 'admin' && (
            <button
              onClick={handleSeedPackages}
              className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-[#48A111] transition-all flex items-center gap-1.5 font-mono"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset DB Seed
            </button>
          )}
        </div>
      </div>

      {pendingRequest && (
        <div className="bg-[#48A111]/10 border border-[#48A111]/20 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
          <div className="text-right sm:text-left flex items-start gap-3">
            <span className="text-2xl pt-1">⏳</span>
            <div>
              <span className="text-[10px] text-amber-500 font-extrabold tracking-widest block uppercase">طلب اشتراك قيد المراجعة / PENDING APPROVAL</span>
              <p className="text-white mt-0.5 leading-relaxed font-bold">
                الاسم: <span className="text-[#48A111]">{pendingRequest.subscriberName || 'غير معروف'}</span> • 
                الرقم: <span className="text-[#48A111] font-mono">{pendingRequest.paymentPhone || 'غير مدرج'}</span> • 
                الباقة: <span className="text-cyan-400 uppercase italic font-black">{pendingRequest.playerName || 'مميز'}</span>
              </p>
              <span className="text-[11px] text-gray-400 mt-1 block">
                يقوم المسؤول حاليًا بمراجعة لقطة شاشة التحويل المقدمة وتفعيل الحساب قريبًا.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {pendingRequest.transferProof && (
              <a 
                href={pendingRequest.transferProof} 
                target="_blank" 
                rel="noreferrer"
                className="bg-white/5 hover:bg-white/10 border border-white/15 px-3 py-1.5 rounded-xl text-[10px] font-bold text-gray-300 transition-colors uppercase"
              >
                🔎 View Proof
              </a>
            )}
            <span className="bg-[#48A111] text-black px-2.5 py-1 rounded font-black text-[10px] uppercase tracking-wider">
              مراجعة المدير
            </span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-24 text-[#48A111] font-mono tracking-widest animate-pulse font-bold text-lg">
          FETCHING SUITE INFORMATION...
        </div>
      ) : (
        /* Pricing Grid */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-4">
          {packages.map((pkg) => {
            const isCurrent = profile?.subscription === pkg.id;

            let borderStyle = 'border-white/10 bg-neutral-950';
            let badgeComponent = null;
            let themeColor = 'text-white';
            let btnStyle = 'bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20';

            if (pkg.id === 'elite-pkg') {
              borderStyle = 'border-amber-500/30 bg-gradient-to-b from-[#181206] via-zinc-950 to-black shadow-lg shadow-amber-500/5';
              themeColor = 'text-amber-400';
              badgeComponent = (
                <span className="absolute top-4 right-4 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1 font-mono">
                  <Crown className="w-3 h-3" /> LEGENDARY TIER
                </span>
              );
              btnStyle = isCurrent 
                ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400 cursor-default'
                : 'bg-amber-500 text-black hover:bg-amber-400 shadow-md shadow-amber-500/10 font-bold';
            } else if (pkg.id === 'pro-pkg') {
              borderStyle = 'border-cyan-500/30 bg-gradient-to-b from-[#081518] via-zinc-950 to-black shadow-lg shadow-cyan-500/5';
              themeColor = 'text-cyan-400';
              badgeComponent = (
                <span className="absolute top-4 right-4 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1 font-mono">
                  <Sparkles className="w-3 h-3" /> RECOMMENDED
                </span>
              );
              btnStyle = isCurrent 
                ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 cursor-default'
                : 'bg-cyan-500 text-black hover:bg-cyan-400 shadow-md shadow-cyan-500/10 font-bold';
            } else if (pkg.id === 'starter-pkg') {
              borderStyle = 'border-emerald-500/20 bg-gradient-to-b from-[#051108] via-zinc-950 to-black';
              themeColor = 'text-emerald-400';
              btnStyle = isCurrent 
                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 cursor-default'
                : 'bg-emerald-500 text-black hover:bg-emerald-400 font-bold';
            }

            return (
              <motion.div
                key={pkg.id}
                whileHover={{ y: -6, transition: { duration: 0.15 } }}
                className={`relative flex flex-col rounded-3xl p-6 border ${borderStyle} transition-all overflow-hidden`}
              >
                {badgeComponent}

                {/* Card Title & Cost */}
                <div className="mb-6">
                  <h3 className={`text-2xl font-black uppercase italic tracking-tight ${themeColor}`}>
                    {pkg.name}
                  </h3>
                  <div className="flex items-baseline gap-1 mt-3 font-mono">
                    <span className="text-4xl font-extrabold text-white">
                      ${typeof pkg.price === 'number' ? pkg.price.toFixed(2) : pkg.price}
                    </span>
                    <span className="text-xs text-gray-500 uppercase font-black tracking-widest">
                      / Month
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-3 font-medium leading-relaxed leading-5">
                    {pkg.description}
                  </p>
                </div>

                {/* Subscriptions Benefits list */}
                <div className="flex-1 flex flex-col gap-3.5 border-t border-white/5 pt-5 mb-8">
                  <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest font-mono">PLAN INCLUDES:</span>
                  {pkg.features && pkg.features.map((feature: string, index: number) => (
                    <div key={index} className="flex items-start gap-2 text-xs">
                      <div className={`w-4.5 h-4.5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5`}>
                        <Check className="w-3 object-contain text-[#48A111]" />
                      </div>
                      <span className="text-gray-300 leading-relaxed font-mono">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Buy Button - launches credit card billing modal */}
                <button
                  onClick={() => handleSubscribe(pkg)}
                  disabled={isCurrent}
                  className={`w-full py-3.5 rounded-xl text-xs uppercase tracking-widest font-black transition-all flex items-center justify-center gap-2 ${btnStyle}`}
                >
                  {isCurrent ? (
                    "YOUR ACTIVE SUITE"
                  ) : (
                    "UPGRADE MEMBERSHIP"
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Disclaimers / Info panel */}
      <div className="bg-black/40 border border-white/5 rounded-2xl p-5 flex gap-4 min-h-[80px] text-xs">
        <AlertCircle className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
        <div className="font-mono text-gray-500 uppercase leading-relaxed">
          <p className="font-bold text-gray-400 mb-1">SAFE BILLING & SECURE ACCESS</p>
          <p>
            Society memberships are simulated premium tiers. All subscription activations are fully integrated through safe sandbox payment options. No actual payment metadata or real monetary credentials are required or stored in this demonstration workspace environment.
          </p>
        </div>
      </div>

      {/* Interactive Secure Stripe Payment Checkout Modal */}
      {selectedCheckoutPkg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#0c0d0e] border border-white/10 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl relative"
          >
            {/* Modal Header */}
            <div className="border-b border-white/10 p-5 flex items-center justify-between bg-black/40">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#48A111]" />
                <span className="text-xs font-black uppercase tracking-wider font-mono text-white">SECURE PREMIUM CHECKOUT</span>
              </div>
              <button 
                onClick={() => setSelectedCheckoutPkg(null)}
                className="text-gray-500 hover:text-white transition-colors"
                disabled={checkoutStep === 'processing'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {checkoutStep === 'form' && (
              <div className="p-6 flex flex-col gap-6">
                
                {/* Subscription Tier Info Banner */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex justify-between items-center font-mono">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Selected Plan</span>
                    <span className="text-base font-black text-white uppercase italic tracking-tight">{selectedCheckoutPkg.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Total Amount</span>
                    <span className="text-lg font-black text-[#48A111]">${typeof selectedCheckoutPkg.price === 'number' ? selectedCheckoutPkg.price.toFixed(2) : selectedCheckoutPkg.price} / mo</span>
                  </div>
                </div>

                {/* Simulated Payment Methods Selector */}
                <div className="flex bg-black/50 p-1.5 rounded-xl border border-white/5 font-mono text-xs">
                  <button 
                    onClick={() => setPaymentMethod('wallet')}
                    className={`flex-1 py-2 rounded-lg font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${paymentMethod === 'wallet' ? 'bg-[#48A111] text-black' : 'text-gray-400 hover:text-white'}`}
                  >
                    💵 كاش / المحفظة
                  </button>
                  <button 
                    onClick={() => setPaymentMethod('card')}
                    className={`flex-1 py-2 rounded-lg font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${paymentMethod === 'card' ? 'bg-[#48A111] text-black' : 'text-gray-400 hover:text-white'}`}
                  >
                    💳 Credit Card
                  </button>
                </div>

                {paymentMethod === 'wallet' ? (
                  <div className="flex flex-col gap-5 text-right font-mono text-xs">
                    
                    {/* Wallet instructions in Arabic & English */}
                    {paymentInfo ? (
                      <div className="bg-[#48A111]/10 border border-[#48A111]/20 rounded-2xl p-4 text-xs flex flex-col gap-2 leading-relaxed text-[#48A111]">
                        <div className="flex justify-between items-center border-b border-[#48A111]/20 pb-1.5 font-bold">
                          <span>WALLET PAYMENTS / الدفع المباشر</span>
                          <span className="text-[9px] bg-[#48A111] text-black px-1.5 py-0.5 rounded">MANUAL MODERATION</span>
                        </div>
                        <p className="text-[11px] text-gray-300">
                          {paymentInfo.walletName || 'يرجى تحويل المبلغ المطلوب إلى'} على الرقم: 
                          <span className="text-white font-extrabold mx-1 underline font-mono">{paymentInfo.walletNumber}</span> 
                          أو عبر عنوان InstaPay: 
                          <span className="text-white font-extrabold mx-1 underline">{paymentInfo.instapayAddress}</span>
                        </p>
                      </div>
                    ) : (
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center p-6 text-gray-500 font-mono text-xs">
                        Payment information is not currently configured. Please contact the administrator.
                      </div>
                    )}

                    {/* Subscriber Name field */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] text-[#48A111] uppercase font-bold tracking-widest">Arabic / English</span>
                        <label className="block text-gray-400 font-bold uppercase tracking-wider">اسم الشخص اللي بيشترك / Subscriber Name</label>
                      </div>
                      <input 
                        type="text" 
                        value={subscriberName}
                        onChange={e => setSubscriberName(e.target.value)}
                        placeholder="أدخل الاسم بالكامل / Full Name"
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-right outline-none focus:border-[#48A111] transition-all text-white placeholder-gray-600 font-bold"
                      />
                    </div>

                    {/* Sender Phone Number field */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] text-gray-500 font-bold tracking-widest font-mono">e.g. 01012345678</span>
                        <label className="block text-gray-400 font-bold uppercase tracking-wider">رقم التليفون اللي هتحول منه / Sender Wallet Phone</label>
                      </div>
                      <input 
                        type="text" 
                        value={paymentPhone}
                        maxLength={15}
                        onChange={e => setPaymentPhone(e.target.value.replace(/[^\d+]/g, ''))}
                        placeholder="رقم هاتف المحفظة / Wallet phone number"
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-right outline-none focus:border-[#48A111] transition-all text-white font-bold placeholder-gray-600 font-mono"
                      />
                    </div>

                    {/* Receipt Image File upload place */}
                    <div className="flex flex-col gap-2">
                      <label className="block text-gray-400 font-bold uppercase tracking-wider text-right font-mono">صورة التحويل / لقطة الشاشة (Receipt Proof)</label>
                      
                      <div className="bg-black/40 border border-dashed border-white/20 hover:border-[#48A111]/50 rounded-2xl p-4 transition-all relative flex flex-col items-center justify-center gap-2.5 min-h-[140px] overflow-hidden">
                        {receiptImage ? (
                          <>
                            <img 
                              src={receiptImage} 
                              alt="Transfer Receipt Proof" 
                              className="w-full h-32 object-contain rounded-xl"
                              referrerPolicy="no-referrer"
                            />
                            <button
                              type="button"
                              onClick={() => setReceiptImage(null)}
                              className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1.5 transition-colors z-10"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <div className="text-center py-4 flex flex-col items-center gap-2">
                            <span className="text-3xl">📸</span>
                            <p className="text-[11px] text-gray-400 font-bold">اسحب صورة الإيصال أو اضغط للرفع</p>
                            <p className="text-[9px] text-gray-500">Drag & drop receipt screenshot, or click to browse</p>
                            <input 
                              type="file" 
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = () => {
                                    if (typeof reader.result === 'string') {
                                      setReceiptImage(reader.result);
                                      toast.success("تم رفع الإيصال بنجاح!");
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between gap-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            setReceiptImage('https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=500&auto=format&fit=crop&q=60');
                            toast.success("تم إرفاق إيصال تحويل تجريبي بنجاح!");
                          }}
                          className="bg-zinc-900 hover:bg-zinc-800 text-[10px] font-bold text-[#48A111] uppercase tracking-widest py-2 px-3 rounded-lg border border-[#48A111]/20 font-mono transition-colors"
                        >
                          ⚡ إرفاق إيصال تحويل تجريبي سريع (Simulate Receipt)
                        </button>
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="flex flex-col gap-5">
                    {/* Simulated Virtual Credit Card Graphic */}
                    <div className="bg-gradient-to-br from-neutral-900 via-zinc-800 to-neutral-950 border border-white/10 rounded-2xl p-5 h-44 shadow-lg flex flex-col justify-between text-white font-mono relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[#48A111]/5 rounded-full blur-2xl"></div>
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-[#48A111] font-black uppercase tracking-widest">Footex Secured Credit</span>
                          <span className="text-[9px] text-gray-500 font-bold uppercase mt-0.5">Premium Society Vault Card</span>
                        </div>
                        {/* Card brand logo detector */}
                        <div className="text-xs uppercase font-extrabold italic bg-white/10 px-2 py-0.5 rounded tracking-widest text-gray-300">
                          {cardNumber.startsWith('4') ? 'Visa' : cardNumber.startsWith('5') ? 'Mastercard' : cardNumber.startsWith('3') ? 'Amex' : 'Stripe Network'}
                        </div>
                      </div>

                      {/* Card Number block */}
                      <div className="text-lg tracking-widest font-bold my-2 text-center text-zinc-300">
                        {cardNumber ? cardNumber.replace(/(\d{4})/g, '$1 ').trim().substring(0, 19) : '•••• •••• •••• ••••'}
                      </div>

                      <div className="flex justify-between items-end text-xs">
                        <div>
                          <span className="text-[8px] text-gray-500 font-bold block uppercase tracking-wider">Cardholder Name</span>
                          <span className="uppercase tracking-wide font-semibold text-zinc-200 truncate max-w-[150px] inline-block">{cardHolder || 'Club Manager'}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[8px] text-gray-500 font-bold block uppercase tracking-wider">Expiry</span>
                          <span className="font-semibold text-zinc-200">{cardExpiry || 'MM/YY'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Form Input fields */}
                    <div className="grid grid-cols-2 gap-4 font-mono text-xs">
                      <div className="col-span-2">
                        <label className="block text-gray-400 font-bold uppercase tracking-wider mb-1.5">Cardholder Name</label>
                        <input 
                          type="text" 
                          value={cardHolder}
                          onChange={e => setCardHolder(e.target.value)}
                          placeholder="e.g. Cristiano Ronaldo"
                          className="w-full bg-black/50 border border-white/10 rounded-xl p-3 outline-none focus:border-[#48A111] transition-all text-white"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-gray-400 font-bold uppercase tracking-wider mb-1.5">Card Number</label>
                        <div className="relative">
                          <input 
                            type="text" 
                            maxLength={16}
                            value={cardNumber}
                            onChange={e => setCardNumber(e.target.value.replace(/\D/g, ''))}
                            placeholder="4242 4242 4242 4242"
                            className="w-full bg-black/50 border border-white/10 rounded-xl p-3 pl-10 outline-none focus:border-[#48A111] transition-all text-white font-bold"
                          />
                          <CreditCard className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-400 font-bold uppercase tracking-wider mb-1.5">Expiry Date</label>
                        <input 
                          type="text" 
                          maxLength={5}
                          value={cardExpiry}
                          onChange={e => {
                            let val = e.target.value;
                            if (val.length === 2 && !val.includes('/')) val += '/';
                            setCardExpiry(val);
                          }}
                          placeholder="MM/YY"
                          className="w-full bg-black/50 border border-white/10 rounded-xl p-3 outline-none focus:border-[#48A111] transition-all text-white text-center font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-400 font-bold uppercase tracking-wider mb-1.5">CVC / CVV</label>
                        <input 
                          type="password" 
                          maxLength={4}
                          value={cardCvv}
                          onChange={e => setCardCvv(e.target.value.replace(/\D/g, ''))}
                          placeholder="•••"
                          className="w-full bg-black/50 border border-white/10 rounded-xl p-3 outline-none focus:border-[#48A111] transition-all text-white text-center font-bold"
                        />
                      </div>
                    </div>

                    {/* Quick Demo Autofill Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setCardNumber('4242424242424242');
                        setCardExpiry('12/28');
                        setCardCvv('123');
                        toast.success("Safe practice credential simulated successfully!");
                      }}
                      className="bg-zinc-900 hover:bg-zinc-800 text-[10px] font-bold text-[#48A111] uppercase tracking-widest py-2 px-3 rounded-lg border border-[#48A111]/20 font-mono transition-colors self-start"
                    >
                      ⚡ Auto-Fill Practice Test Card
                    </button>
                  </div>
                )}

                {/* Secure Sandbox Footnote */}
                <div className="p-3 bg-neutral-900/60 rounded-xl border border-white/5 text-[10px] text-gray-500 font-mono flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#48A111] shrink-0" />
                  <span>Interactive Stripe Gateway Simulator Active. No Actual Balance is charged. Safe demo operations.</span>
                </div>

                {/* CTA Complete Buy Button */}
                <button
                  onClick={handleCompleteUSDCheckout}
                  className="w-full bg-[#48A111] hover:bg-[#52b714] text-black font-black uppercase tracking-widest py-4 rounded-xl transition-all font-mono text-sm shadow-md"
                >
                  SECURELY PAY ${typeof selectedCheckoutPkg.price === 'number' ? selectedCheckoutPkg.price.toFixed(2) : selectedCheckoutPkg.price} USD NOW
                </button>
              </div>
            )}

            {/* Simulated processing spinner gateway sequence */}
            {checkoutStep === 'processing' && (
              <div className="p-12 text-center flex flex-col items-center justify-center gap-6 min-h-[350px]">
                <div className="w-16 h-16 rounded-full border-4 border-t-[#48A111] border-white/10 animate-spin"></div>
                <div className="flex flex-col gap-1.5 font-mono">
                  <h4 className="text-sm font-black uppercase tracking-wider text-white">SECURE GATEWAY PROCESSING</h4>
                  <p className="text-xs text-[#48A111] animate-pulse uppercase tracking-wider">{processingStatus}</p>
                </div>
              </div>
            )}

            {/* Success transaction state screen */}
            {checkoutStep === 'success' && (
              <div className="p-8 text-center flex flex-col items-center justify-center gap-6 min-h-[350px]">
                <div className="w-16 h-16 rounded-full bg-[#48A111]/10 border border-[#48A111]/30 flex items-center justify-center">
                  <Check className="w-8 h-8 text-[#48A111]" />
                </div>
                
                <div className="font-mono flex flex-col gap-2">
                  <h4 className="text-xl font-black text-white uppercase italic tracking-tight">TRANSACTION SECURED</h4>
                  <p className="text-xs text-gray-400">
                    Your Stripe payment has been confirmed. Your subscriber tier is upgraded to <span className="text-[#48A111] font-bold uppercase">{selectedCheckoutPkg.name}</span>.
                  </p>
                  <p className="text-[9px] text-gray-500 mt-2 uppercase tracking-widest bg-black/40 py-2 rounded-xl border border-white/5 font-bold">
                    Receipt ID: ref-stripe-{Date.now().toString().substring(6)}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedCheckoutPkg(null)}
                  className="w-full bg-white/10 hover:bg-white/15 border border-white/10 text-white font-black uppercase tracking-widest py-3 rounded-xl transition-all font-mono text-xs max-w-xs"
                >
                  RETURN TO ARENA
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};
