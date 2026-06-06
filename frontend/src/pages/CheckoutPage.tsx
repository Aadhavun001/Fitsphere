import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ShieldCheck, CreditCard, Lock, CheckCircle, ArrowRight, ArrowLeft, Smartphone, Landmark } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const CheckoutPage: React.FC = () => {
  const { cart, user, purchaseCourses } = useApp();
  const [step, setStep] = useState(1); // 1: Billing, 2: Payment, 3: Confirmation
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  // Local preservation state to avoid race condition when context clears cart
  const [purchasedItems, setPurchasedItems] = useState<typeof cart>([]);
  const [purchasedTotal, setPurchasedTotal] = useState(0);

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'netbanking'>('card');

  // Card details
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  // UPI details
  const [upiId, setUpiId] = useState('');

  // Netbanking details
  const [selectedBank, setSelectedBank] = useState('');

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const subtotal = cart.reduce((acc, item) => acc + item.course.price, 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  const validateBilling = () => {
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = 'Full name is required';
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) errors.email = 'Valid email is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePayment = () => {
    const errors: Record<string, string> = {};
    
    if (paymentMethod === 'card') {
      if (cardNumber.replace(/\s/g, '').length < 16) errors.cardNumber = 'Card number must be 16 digits';
      if (!expiry.trim() || !/^\d{2}\/\d{2}$/.test(expiry)) errors.expiry = 'Expiry must be MM/YY';
      if (cvc.length < 3) errors.cvc = 'CVC must be at least 3 digits';
    } else if (paymentMethod === 'upi') {
      if (!upiId.trim() || !upiId.includes('@')) errors.upiId = 'Enter a valid UPI ID (e.g. name@upi)';
    } else if (paymentMethod === 'netbanking') {
      if (!selectedBank) errors.selectedBank = 'Please select your bank';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (validateBilling()) {
        setStep(2);
        setFormErrors({});
      }
    } else if (step === 2) {
      if (validatePayment()) {
        setPurchasedItems([...cart]);
        setPurchasedTotal(total);
        purchaseCourses(); // Context action to unlock courses
        setStep(3);
        setFormErrors({});
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setFormErrors({});
    }
  };

  // Format card inputs
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    const formatted = val.replace(/(.{4})/g, '$1 ').trim();
    if (formatted.length <= 19) {
      setCardNumber(formatted);
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    let formatted = val;
    if (val.length > 2) {
      formatted = `${val.slice(0, 2)}/${val.slice(2, 4)}`;
    }
    if (formatted.length <= 5) {
      setExpiry(formatted);
    }
  };

  const indianBanks = [
    'State Bank of India (SBI)',
    'HDFC Bank',
    'ICICI Bank',
    'Axis Bank',
    'Kotak Mahindra Bank',
    'Punjab National Bank (PNB)',
    'IndusInd Bank',
    'Bank of Baroda'
  ];

  if (cart.length === 0 && step !== 3) {
    return (
      <div className="w-full bg-bg-dark pt-40 pb-24 text-center min-h-[80vh]">
        <div className="max-w-md mx-auto flex flex-col items-center gap-4">
          <CheckCircle className="h-12 w-12 text-brand-cyan" />
          <h1 className="text-2xl font-display font-black text-white">Your Cart is Empty</h1>
          <Link to="/courses" className="px-6 py-3 bg-brand-neon text-black font-bold rounded-full text-xs mt-4">
            Browse Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-bg-dark pt-32 pb-24 px-6 min-h-[90vh] relative">
      {/* Background ambient light */}
      <div className="absolute top-1/4 right-1/4 w-[350px] h-[350px] bg-brand-neon/5 rounded-full filter blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto flex flex-col gap-10 relative z-10">
        
        {/* Stepper Header */}
        <div className="flex items-center justify-between pb-6 border-b border-white/5">
          <div className="text-left">
            <h1 className="font-display font-black text-3xl text-white uppercase tracking-tight">Checkout</h1>
            <span className="text-xs text-gray-500 font-bold uppercase">
              {step === 3 ? 'Completed' : `Step ${step} of 2`}
            </span>
          </div>

          {/* Graphical Stepper */}
          <div className="flex items-center gap-2">
            <div className={`h-2.5 w-8 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-brand-neon' : 'bg-white/10'}`} />
            <div className={`h-2.5 w-8 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-brand-neon' : 'bg-white/10'}`} />
            <div className={`h-2.5 w-8 rounded-full transition-all duration-300 ${step === 3 ? 'bg-brand-cyan' : 'bg-white/10'}`} />
          </div>
        </div>

        {/* Content Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Form Side (Col 7) */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="glass-card border border-white/5 p-8 rounded-3xl text-left flex flex-col gap-6"
                >
                  <h3 className="font-display font-bold text-white text-lg uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-brand-neon" />
                    Billing & Onboarding Contact
                  </h3>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    This email is where we will send your invoice, receipt, and course credentials.
                  </p>

                  <form onSubmit={handleNextStep} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="full-name" className="text-xs font-bold text-gray-400 uppercase">Customer Full Name</label>
                      <input
                        id="full-name"
                        type="text"
                        required
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`bg-white/5 border rounded-xl px-4 py-3.5 text-sm text-white focus:bg-white/10 outline-none transition-all ${
                          formErrors.name ? 'border-brand-red' : 'border-white/10 focus:border-brand-neon/50'
                        }`}
                      />
                      {formErrors.name && <span className="text-[10px] text-brand-red font-semibold">{formErrors.name}</span>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="email-address" className="text-xs font-bold text-gray-400 uppercase">Email Address</label>
                      <input
                        id="email-address"
                        type="email"
                        required
                        placeholder="john@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`bg-white/5 border rounded-xl px-4 py-3.5 text-sm text-white focus:bg-white/10 outline-none transition-all ${
                          formErrors.email ? 'border-brand-red' : 'border-white/10 focus:border-brand-neon/50'
                        }`}
                      />
                      {formErrors.email && <span className="text-[10px] text-brand-red font-semibold">{formErrors.email}</span>}
                    </div>

                    <button
                      type="submit"
                      className="mt-4 py-4 rounded-full bg-brand-neon text-black font-extrabold text-sm hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                    >
                      Continue to Payment
                      <ArrowRight className="h-4.5 w-4.5" />
                    </button>
                  </form>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="glass-card border border-white/5 p-8 rounded-3xl text-left flex flex-col gap-6"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-bold text-white text-lg uppercase tracking-wider flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-brand-cyan" />
                      Payment Method
                    </h3>
                    <button
                      onClick={handleBack}
                      className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" /> Back
                    </button>
                  </div>

                  {/* Payment Method Select Toggles */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'card', label: 'Debit/Credit Card', icon: <CreditCard className="h-4 w-4" /> },
                      { id: 'upi', label: 'UPI / GPay / PhonePe', icon: <Smartphone className="h-4 w-4" /> },
                      { id: 'netbanking', label: 'Net Banking', icon: <Landmark className="h-4 w-4" /> }
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setPaymentMethod(item.id as any);
                          setFormErrors({});
                        }}
                        className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-2 text-center text-[10px] font-bold transition-all duration-200 ${
                          paymentMethod === item.id
                            ? 'border-brand-cyan bg-brand-cyan/15 text-white'
                            : 'border-white/5 bg-white/5 text-gray-400 hover:border-white/10'
                        }`}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>

                  <hr className="border-white/5" />

                  <form onSubmit={handleNextStep} className="flex flex-col gap-5">
                    {/* CONDITIONAL PAYMENT INPUTS */}
                    
                    {/* Card Method */}
                    {paymentMethod === 'card' && (
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label htmlFor="card-number" className="text-xs font-bold text-gray-400 uppercase">Card Number</label>
                          <input
                            id="card-number"
                            type="text"
                            required
                            autoComplete="cc-number"
                            placeholder="4242 4242 4242 4242"
                            value={cardNumber}
                            onChange={handleCardNumberChange}
                            className={`bg-white/5 border rounded-xl px-4 py-3.5 text-sm text-white focus:bg-white/10 outline-none transition-all ${
                              formErrors.cardNumber ? 'border-brand-red' : 'border-white/10 focus:border-brand-cyan/50'
                            }`}
                          />
                          {formErrors.cardNumber && <span className="text-[10px] text-brand-red font-semibold">{formErrors.cardNumber}</span>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label htmlFor="card-expiry" className="text-xs font-bold text-gray-400 uppercase">Expiration (MM/YY)</label>
                            <input
                              id="card-expiry"
                              type="text"
                              required
                              autoComplete="cc-exp"
                              placeholder="12/28"
                              value={expiry}
                              onChange={handleExpiryChange}
                              className={`bg-white/5 border rounded-xl px-4 py-3.5 text-sm text-white focus:bg-white/10 outline-none transition-all ${
                                formErrors.expiry ? 'border-brand-red' : 'border-white/10 focus:border-brand-cyan/50'
                              }`}
                            />
                            {formErrors.expiry && <span className="text-[10px] text-brand-red font-semibold">{formErrors.expiry}</span>}
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label htmlFor="card-cvc" className="text-xs font-bold text-gray-400 uppercase">Security Code (CVC)</label>
                            <input
                              id="card-cvc"
                              type="password"
                              required
                              autoComplete="cc-csc"
                              placeholder="•••"
                              value={cvc}
                              onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                              className={`bg-white/5 border rounded-xl px-4 py-3.5 text-sm text-white focus:bg-white/10 outline-none transition-all ${
                                formErrors.cvc ? 'border-brand-red' : 'border-white/10 focus:border-brand-cyan/50'
                              }`}
                            />
                            {formErrors.cvc && <span className="text-[10px] text-brand-red font-semibold">{formErrors.cvc}</span>}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* UPI Method */}
                    {paymentMethod === 'upi' && (
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="upi-id" className="text-xs font-bold text-gray-400 uppercase">UPI Virtual Payment Address (VPA)</label>
                        <input
                          id="upi-id"
                          type="text"
                          required
                          placeholder="e.g. name@okhdfcbank"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          className={`bg-white/5 border rounded-xl px-4 py-3.5 text-sm text-white focus:bg-white/10 outline-none transition-all ${
                            formErrors.upiId ? 'border-brand-red' : 'border-white/10 focus:border-brand-cyan/50'
                          }`}
                        />
                        {formErrors.upiId && <span className="text-[10px] text-brand-red font-semibold">{formErrors.upiId}</span>}
                        <p className="text-[10px] text-gray-500 leading-relaxed mt-1">
                          You will receive a collect request on your UPI-linked mobile app (GPay, PhonePe, BHIM, Paytm) to complete this transaction.
                        </p>
                      </div>
                    )}

                    {/* Netbanking Method */}
                    {paymentMethod === 'netbanking' && (
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="bank-select" className="text-xs font-bold text-gray-400 uppercase">Select Your Bank</label>
                        <select
                          id="bank-select"
                          required
                          value={selectedBank}
                          onChange={(e) => setSelectedBank(e.target.value)}
                          className={`bg-white/5 border rounded-xl px-4 py-3.5 text-sm text-white focus:bg-white/10 outline-none transition-all w-full ${
                            formErrors.selectedBank ? 'border-brand-red' : 'border-white/10 focus:border-brand-cyan/50'
                          }`}
                        >
                          <option value="" disabled className="bg-bg-dark text-gray-500">-- Choose your bank --</option>
                          {indianBanks.map((bank) => (
                            <option key={bank} value={bank} className="bg-bg-dark text-white">{bank}</option>
                          ))}
                        </select>
                        {formErrors.selectedBank && <span className="text-[10px] text-brand-red font-semibold">{formErrors.selectedBank}</span>}
                        <p className="text-[10px] text-gray-500 leading-relaxed mt-1">
                          On clicking payment button, we will redirect you to your bank's secure portal to authorize the transfer.
                        </p>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="mt-4 py-4 rounded-full bg-brand-cyan text-black font-extrabold text-sm hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,245,160,0.15)]"
                    >
                      <Lock className="h-4 w-4" />
                      Complete Purchase (₹{total.toLocaleString('en-IN')})
                    </button>
                  </form>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-card border border-brand-cyan/35 p-10 rounded-3xl text-center flex flex-col items-center gap-6 shadow-[0_0_30px_rgba(0,245,160,0.1)]"
                >
                  <CheckCircle className="h-16 w-16 text-brand-cyan animate-bounce" />
                  <div className="flex flex-col gap-1">
                    <h2 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight">Order Confirmed!</h2>
                    <p className="text-gray-400 text-xs">Your training courses are now unlocked on your learning portal profile.</p>
                  </div>
                  
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/5 text-left w-full flex flex-col gap-3 text-xs">
                    <div className="font-bold text-white uppercase text-[10px] tracking-wider border-b border-white/5 pb-2">Activated Courses</div>
                    {purchasedItems.map((item) => (
                      <div key={item.course.id} className="flex justify-between text-gray-300">
                        <span>{item.course.title}</span>
                        <span className="text-white font-bold">₹{item.course.price.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-brand-cyan font-bold border-t border-white/5 pt-2">
                      <span>Total Paid</span>
                      <span>₹{purchasedTotal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <Link
                    to="/dashboard"
                    className="px-8 py-4 rounded-full bg-brand-neon text-black font-extrabold text-sm hover:scale-[1.03] transition-transform shadow-[0_0_20px_rgba(184,255,34,0.15)]"
                  >
                    Enter Learning Portal
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Cart Summary Side (Col 4) */}
          {step !== 3 && (
            <div className="lg:col-span-4 flex flex-col gap-6 text-left">
              <div className="p-6 rounded-3xl bg-white/5 border border-white/5 flex flex-col gap-4">
                <h4 className="font-display font-bold text-white text-sm uppercase tracking-wider">Order Summary</h4>
                <div className="flex flex-col gap-3">
                  {cart.map((item) => (
                    <div key={item.course.id} className="flex justify-between text-xs text-gray-300 gap-4">
                      <span className="line-clamp-1">{item.course.title}</span>
                      <span className="text-white font-semibold">₹{item.course.price.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                  <hr className="border-white/5" />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Tax (5%)</span>
                    <span>₹{tax.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-white">
                    <span>Total</span>
                    <span className="text-brand-neon">₹{total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
