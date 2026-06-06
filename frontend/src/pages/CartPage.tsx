import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Trash2, ShoppingBag, ArrowRight, Shield, Sparkles } from 'lucide-react';

export const CartPage: React.FC = () => {
  const { cart, removeFromCart } = useApp();
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState(false);

  const subtotal = cart.reduce((acc, item) => acc + item.course.price, 0);
  const discount = promoApplied ? subtotal * 0.15 : 0; // 15% discount
  const tax = subtotal * 0.05; // 5% tax
  const total = subtotal - discount + tax;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'FIT15') {
      setPromoApplied(true);
      setPromoError(false);
    } else {
      setPromoError(true);
      setPromoApplied(false);
    }
  };

  const handleCheckout = () => {
    if (cart.length > 0) {
      navigate('/checkout');
    }
  };

  return (
    <div className="w-full bg-bg-dark pt-32 pb-24 px-6 min-h-[90vh]">
      {/* Glow Rings */}
      <div className="absolute top-1/4 left-1/3 w-[350px] h-[350px] bg-brand-cyan/5 rounded-full filter blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto flex flex-col gap-10 relative z-10">
        
        {/* Header */}
        <div className="text-left flex flex-col gap-2 pb-4 border-b border-white/5">
          <h1 className="font-display font-black text-4xl text-white uppercase tracking-tight">Your Cart</h1>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
            {cart.length} course{cart.length === 1 ? '' : 's'} ready for checkout
          </p>
        </div>

        {cart.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Cart Items List (Col 8) */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              {cart.map((item) => (
                <div
                  key={item.course.id}
                  className="flex flex-col sm:flex-row gap-6 p-6 rounded-3xl bg-white/5 border border-white/5 items-center justify-between text-left hover:border-white/10 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row items-center gap-5 w-full">
                    <img
                      src={item.course.coverImage}
                      alt={item.course.title}
                      className="h-20 w-32 object-cover rounded-2xl border border-white/10 flex-shrink-0"
                    />
                    <div className="flex flex-col gap-1 w-full sm:w-auto">
                      <span className="text-[10px] text-brand-neon font-bold uppercase tracking-wider">
                        {item.course.category}
                      </span>
                      <h3 className="font-display font-bold text-white text-base leading-tight">
                        {item.course.title}
                      </h3>
                      <span className="text-xs text-gray-500">by {item.course.instructor.name}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-8 w-full sm:w-auto border-t sm:border-t-0 border-white/5 pt-4 sm:pt-0 mt-4 sm:mt-0">
                    <div className="text-right">
                      <span className="text-[9px] text-gray-500 block uppercase font-bold">Total</span>
                      <span className="text-lg font-black text-white">₹{item.course.price.toLocaleString('en-IN')}</span>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.course.id)}
                      className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-brand-red/15 hover:border-brand-red hover:text-brand-red transition-all"
                      title="Remove course"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex items-center gap-3 p-5 rounded-2xl bg-white/[0.02] border border-white/5 text-xs text-gray-400">
                <Sparkles className="h-5 w-5 text-brand-cyan" />
                <span>
                  Tip: Apply coupon code <strong className="text-brand-cyan uppercase">FIT15</strong> at checkout to save 15% on your order.
                </span>
              </div>
            </div>

            {/* Summary Sidebar (Col 4) */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="p-6 rounded-3xl glass-card border border-white/10 flex flex-col gap-5 text-left">
                <h3 className="font-display font-bold text-white text-lg uppercase tracking-wider">Summary</h3>

                {/* Promo Code Form */}
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Coupon Code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    disabled={promoApplied}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white uppercase placeholder-gray-500 focus:border-brand-cyan/50 focus:bg-white/10 outline-none transition-all"
                  />
                  <button
                    type="submit"
                    disabled={promoApplied}
                    className={`px-4 rounded-xl text-xs font-bold transition-all ${
                      promoApplied
                        ? 'bg-brand-cyan/20 border border-brand-cyan/20 text-brand-cyan'
                        : 'bg-white/10 border border-white/15 text-white hover:bg-white/20'
                    }`}
                  >
                    {promoApplied ? 'Applied' : 'Apply'}
                  </button>
                </form>

                {promoApplied && (
                  <div className="text-[11px] text-brand-cyan font-semibold">✔ FIT15: 15% discount applied.</div>
                )}
                {promoError && (
                  <div className="text-[11px] text-brand-red font-semibold">✘ Invalid code. Try "FIT15".</div>
                )}

                <hr className="border-white/5" />

                {/* Pricing Fields */}
                <div className="flex flex-col gap-3 text-xs text-gray-400">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-white">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  {promoApplied && (
                    <div className="flex justify-between text-brand-cyan">
                      <span>Discount (15%)</span>
                      <span>-₹{discount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Tax (5%)</span>
                    <span className="text-white">₹{tax.toLocaleString('en-IN')}</span>
                  </div>
                  <hr className="border-white/5" />
                  <div className="flex justify-between text-base font-bold">
                    <span className="text-white">Total</span>
                    <span className="text-brand-neon text-glow-neon">₹{total.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full py-4 rounded-full bg-brand-neon text-black font-extrabold text-sm hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(184,255,34,0.15)]"
                >
                  Proceed to Checkout
                  <ArrowRight className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Security info */}
              <div className="p-5 rounded-2xl bg-white/5 border border-white/5 text-left flex flex-col gap-3 text-[11px] text-gray-400 leading-relaxed">
                <div className="flex items-center gap-2.5 text-white font-bold">
                  <Shield className="h-4 w-4 text-brand-cyan" />
                  <span>Secure Adaptation Guarantee</span>
                </div>
                <div>We believe in our curriculum. If you do not experience structural gains within 14 days, you get a full refund.</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white/[0.01] border border-white/5 rounded-3xl">
            <ShoppingBag className="h-14 w-14 text-gray-600 mb-4" />
            <h3 className="font-display font-bold text-white text-xl">Your cart is empty</h3>
            <p className="text-gray-400 text-sm mt-1 max-w-xs">You have not added any training courses to your study sequence yet.</p>
            <Link
              to="/courses"
              className="px-6 py-3 rounded-full bg-brand-neon text-black font-bold text-xs mt-6 hover:scale-105 transition-all"
            >
              Browse Catalog
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
