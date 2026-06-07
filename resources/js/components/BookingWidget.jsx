import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

export default function BookingWidget({ car, bookedDates = [] }) {
    const { t } = useTranslation();
    const { user } = useAuth();
    const navigate = useNavigate();

    // Form state
    const [pickupCity, setPickupCity] = useState('');
    const [returnCity, setReturnCity] = useState('');
    const [pickupDate, setPickupDate] = useState('');
    const [returnDate, setReturnDate] = useState('');
    
    // Coupon state
    const [couponCode, setCouponCode] = useState('');
    const [couponApplied, setCouponApplied] = useState(null); // { code, discount, total }
    const [couponError, setCouponError] = useState('');

    // Payment state
    const [paymentMethod, setPaymentMethod] = useState('stripe');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [successInvoice, setSuccessInvoice] = useState('');

    // Cities state
    const [cities, setCities] = useState([]);

    useEffect(() => {
        axios.get('/api/cars/cities')
            .then(res => setCities(res.data))
            .catch(() => {});
    }, []);

    // Calculate rental days
    const calculateDays = () => {
        if (!pickupDate || !returnDate) return 0;
        const start = new Date(pickupDate);
        const end = new Date(returnDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays || 1;
    };

    const days = calculateDays();
    const subtotal = car.price_per_day * days;
    const finalPrice = couponApplied ? couponApplied.total : subtotal;

    // Check date range overlap
    const isRangeOverlap = (start, end) => {
        if (!start || !end) return false;
        const s = new Date(start);
        const e = new Date(end);
        return bookedDates.some(range => {
            const rs = new Date(range.start);
            const re = new Date(range.end);
            return (s <= re && e >= rs);
        });
    };

    const handleApplyCoupon = async () => {
        if (!couponCode) return;
        setCouponError('');
        try {
            const res = await axios.post('/api/bookings/apply-coupon', {
                coupon_code: couponCode,
                subtotal: subtotal
            });
            setCouponApplied(res.data);
        } catch (err) {
            setCouponApplied(null);
            setCouponError(err.response?.data?.message || 'Invalid coupon code');
        }
    };

    const handleCheckout = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        if (!user) {
            navigate('/login');
            return;
        }

        if (isRangeOverlap(pickupDate, returnDate)) {
            setErrorMsg('This vehicle is already booked during the selected date range.');
            return;
        }

        setIsSubmitting(true);
        try {
            // Step 1: Create Booking
            const bookingRes = await axios.post('/api/bookings', {
                car_id: car.id,
                pickup_city_id: pickupCity,
                return_city_id: returnCity,
                pickup_date: pickupDate,
                return_date: returnDate,
                coupon_code: couponApplied ? couponCode : null,
            });

            const bookingId = bookingRes.data.booking.id;

            // Step 2: Process Payment (Mock)
            const paymentRes = await axios.post('/api/payments/process', {
                booking_id: bookingId,
                payment_method: paymentMethod,
            });

            setSuccessInvoice(paymentRes.data.invoice_number);
            setSuccessMsg('Booking Confirmed! Payment processed successfully.');
            
            // Redirect to dashboard or show success view
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Booking failed. Please check your entries.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-md space-y-6">
            
            {successMsg ? (
                <div className="text-center py-6 space-y-4">
                    <div className="w-16 h-16 bg-green-500/10 border border-green-500 rounded-full flex items-center justify-center mx-auto text-2xl text-green-500">
                        ✓
                    </div>
                    <h3 className="text-xl font-bold text-white">Drive Reserved!</h3>
                    <p className="text-gray-400 text-sm">{successMsg}</p>
                    {successInvoice && (
                        <div className="pt-4 space-y-3">
                            <a
                                href={`/api/payments/invoice/${successInvoice}/view`}
                                target="_blank"
                                rel="noreferrer"
                                className="block w-full text-center bg-[#FF7A00] hover:bg-[#E06B00] text-white py-3.5 rounded-full text-sm font-semibold tracking-wider uppercase transition duration-200"
                            >
                                {t('invoice_download')}
                            </a>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="block w-full text-center bg-white/5 hover:bg-white/10 text-white py-3.5 rounded-full text-sm font-semibold tracking-wider uppercase border border-white/10 transition duration-200"
                            >
                                Go to Dashboard
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <form onSubmit={handleCheckout} className="space-y-6">
                    <div>
                        <h3 className="text-xl font-bold text-white tracking-wide">{t('book_now')}</h3>
                        <p className="text-gray-500 text-xs mt-1">Select your cities, dates, and complete payment secure.</p>
                    </div>

                    {errorMsg && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm">
                            {errorMsg}
                        </div>
                    )}

                    {/* Pickup City */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase text-gray-400 tracking-wider">Pickup Location</label>
                        <select
                            value={pickupCity}
                            onChange={(e) => setPickupCity(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FF7A00]"
                            required
                        >
                            <option value="" className="bg-black text-white">Select Location</option>
                            {cities.map(c => (
                                <option key={c.id} value={c.id} className="bg-black text-white">{c.name_en}</option>
                            ))}
                        </select>
                    </div>

                    {/* Return City */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase text-gray-400 tracking-wider">Return Location</label>
                        <select
                            value={returnCity}
                            onChange={(e) => setReturnCity(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FF7A00]"
                            required
                        >
                            <option value="" className="bg-black text-white">Select Location</option>
                            {cities.map(c => (
                                <option key={c.id} value={c.id} className="bg-black text-white">{c.name_en}</option>
                            ))}
                        </select>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase text-gray-400 tracking-wider">{t('pickup_date')}</label>
                            <input
                                type="date"
                                value={pickupDate}
                                onChange={(e) => setPickupDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF7A00]"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase text-gray-400 tracking-wider">{t('return_date')}</label>
                            <input
                                type="date"
                                value={returnDate}
                                onChange={(e) => setReturnDate(e.target.value)}
                                min={pickupDate || new Date().toISOString().split('T')[0]}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF7A00]"
                                required
                            />
                        </div>
                    </div>

                    {/* Pricing Breakdowns */}
                    {days > 0 && (
                        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-3 text-sm">
                            <div className="flex justify-between text-gray-400">
                                <span>{days} Days Rental</span>
                                <span className="text-white">{subtotal.toFixed(2)} MAD</span>
                            </div>
                            
                            {/* Coupon Input */}
                            <div className="flex space-x-2 pt-1">
                                <input
                                    type="text"
                                    placeholder={t('coupon_code')}
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                    className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none w-full"
                                />
                                <button
                                    type="button"
                                    onClick={handleApplyCoupon}
                                    className="bg-white/10 hover:bg-[#FF7A00] text-white px-4 py-2 rounded-xl text-xs font-bold transition duration-200"
                                >
                                    {t('apply_coupon')}
                                </button>
                            </div>
                            
                            {couponError && <p className="text-red-400 text-xs">{couponError}</p>}

                            {couponApplied && (
                                <div className="flex justify-between text-green-400 text-xs">
                                    <span>Discount Applied</span>
                                    <span>-{couponApplied.discount.toFixed(2)} MAD</span>
                                </div>
                            )}

                            <div className="h-px bg-white/5 my-2"></div>

                            <div className="flex justify-between font-bold text-base">
                                <span className="text-white">Total price</span>
                                <span className="text-[#FF7A00]">{finalPrice.toFixed(2)} MAD</span>
                            </div>
                        </div>
                    )}

                    {/* Payment Gateways */}
                    {days > 0 && user && (
                        <div className="space-y-2.5">
                            <label className="text-xs font-semibold uppercase text-gray-400 tracking-wider">{t('payment_method')}</label>
                            <div className="grid grid-cols-3 gap-3">
                                {['stripe', 'paypal', 'cmi'].map((gateway) => (
                                    <button
                                        key={gateway}
                                        type="button"
                                        onClick={() => setPaymentMethod(gateway)}
                                        className={`py-3 rounded-xl border text-xs font-bold uppercase tracking-wider transition duration-200 ${
                                            paymentMethod === gateway
                                            ? 'border-[#FF7A00] bg-[#FF7A00]/10 text-white'
                                            : 'border-white/10 bg-white/5 text-gray-400 hover:text-white'
                                        }`}
                                    >
                                        {gateway}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <div>
                        {user ? (
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-[#FF7A00] hover:bg-[#E06B00] text-white font-bold uppercase tracking-wider py-4 rounded-full text-xs shadow-lg shadow-[#FF7A00]/20 transition duration-200"
                            >
                                {isSubmitting ? 'Processing Payment...' : t('checkout_btn')}
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => navigate('/login')}
                                className="w-full bg-white/10 hover:bg-[#FF7A00] text-white font-bold uppercase tracking-wider py-4 rounded-full text-xs transition duration-200"
                            >
                                Login to Rent
                            </button>
                        )}
                    </div>
                </form>
            )}

        </div>
    );
}
