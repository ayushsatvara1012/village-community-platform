import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

import { Button } from '../components/ui/Button';
import { Check, Clock, Loader2, LogOut, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Application() {
    const { user, applyForMembership, registerAndApply, pendingRegistration, logout, refreshUser } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        village_id: '',
        address: '',
        profession: '',
    });
    const [isProcessing, setIsProcessing] = useState(false);
    const [villages, setVillages] = useState([]);

    useEffect(() => {
        // If user already has village_id set — they already submitted, show status
        if (user && user.status === 'pending' && user.village_id) {
            setStep(4);
        }
        // If rejected, show rejection screen
        if (user && user.status === 'rejected') {
            setStep(5);
        }
    }, [user]);

    useEffect(() => {
        const fetchVillages = async () => {
            try {
                const response = await fetch((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://127.0.0.1:8000' : 'https://village-community-platform.onrender.com') + '/villages/');
                if (response.ok) {
                    const data = await response.json();
                    setVillages(data);
                }
            } catch (error) {
                console.error("Failed to fetch villages:", error);
            }
        };
        fetchVillages();
    }, []);

    const updateFormData = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    const handleSubmitApplication = async () => {
        setIsProcessing(true);
        try {
            if (pendingRegistration) {
                // Fresh registration — register + apply atomically
                await registerAndApply({
                    village_id: formData.village_id,
                    address: formData.address,
                    profession: formData.profession,
                });
            } else {
                // Already registered user re-applying
                await applyForMembership({
                    village_id: formData.village_id,
                    address: formData.address,
                    profession: formData.profession,
                });
            }
            navigate('/');
        } catch (error) {
            console.error('Application Error:', error);
            alert(error.message || 'Something went wrong. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCheckStatus = async () => {
        if (refreshUser) {
            await refreshUser();
        } else {
            window.location.reload();
        }
    };

    const steps = ['Village', 'Details', 'Review'];

    return (
        <div className="h-dvh bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden">
            <div className="flex-1 max-w-3xl mx-auto w-full flex flex-col p-4 sm:p-6">
                {/* Show progress only for steps 1-3 */}
                {step <= 3 && (
                    <div className="mb-6 shrink-0">
                        <div className="flex items-center justify-between mb-3 px-2">
                            {steps.map((label, idx) => (
                                <div key={idx} className="flex flex-col items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${step > idx + 1 ? 'bg-green-600 text-white' :
                                        step === idx + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                                        }`}>
                                        {step > idx + 1 ? <Check className="w-4 h-4" /> : idx + 1}
                                    </div>
                                    <span className={`mt-1.5 text-[10px] uppercase font-bold tracking-wider ${step === idx + 1 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
                                        {label}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mx-1">
                            <div
                                className="h-full bg-linear-to-r from-blue-600 to-indigo-600 transition-all duration-500 ease-in-out"
                                style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                )}

                <div className="flex-1 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/30 p-5 sm:p-10 flex flex-col min-h-0 overflow-hidden relative">
                    <AnimatePresence mode="wait">

                        {/* Step 1: Village Selection */}
                        {step === 1 && (
                            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col h-full min-h-0">
                                <div className="text-center mb-6 shrink-0">
                                    <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">Select Your Village</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Where are you from?</p>
                                </div>
                                <div className="flex-1 overflow-y-auto pr-1 min-h-0 space-y-2 mb-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                                        {villages.map((village) => (
                                            <button
                                                key={village.id}
                                                onClick={() => updateFormData('village_id', village.id)}
                                                className={`flex flex-row items-center justify-between p-4 rounded-2xl border-2 text-left transition-all ${formData.village_id === village.id
                                                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/30 shadow-md ring-1 ring-blue-500/20'
                                                    : 'border-gray-100 dark:border-gray-700/50 hover:border-blue-200 dark:hover:border-blue-900/50 bg-white/50 dark:bg-gray-900/30'
                                                    }`}
                                            >
                                                <div>
                                                    <h3 className="font-bold text-gray-900 dark:text-white">{village.name}</h3>
                                                    <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400">{village.district}</p>
                                                </div>
                                                {formData.village_id === village.id && (
                                                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                                        <Check className="w-4 h-4 text-white" />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                    {villages.length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                            <Loader2 className="w-8 h-8 animate-spin mb-4 opacity-20" />
                                            <p className="text-sm">Fetching villages...</p>
                                        </div>
                                    )}
                                </div>
                                <div className="shrink-0 pt-4 border-t border-gray-100 dark:border-gray-700/50 flex justify-end">
                                    <Button onClick={nextStep} disabled={!formData.village_id} className="w-full sm:w-auto py-6 sm:py-2 text-lg sm:text-base font-black rounded-xl">Continue</Button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: Personal Details */}
                        {step === 2 && (
                            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col h-full min-h-0">
                                <div className="text-center mb-8 shrink-0">
                                    <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">Personal Details</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Tell us a bit more about yourself.</p>
                                </div>
                                <div className="flex-1 overflow-y-auto space-y-6 pr-1 min-h-0 mb-4">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1">Current Address *</label>
                                            <input type="text" value={formData.address || ''} onChange={(e) => updateFormData('address', e.target.value)}
                                                className="w-full px-5 py-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white transition-all"
                                                placeholder="e.g. 123 Main St, City"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1">Primary Profession *</label>
                                            <input type="text" value={formData.profession} onChange={(e) => updateFormData('profession', e.target.value)}
                                                className="w-full px-5 py-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white transition-all"
                                                placeholder="e.g. Teacher, Farmer, Engineer"
                                            />
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 flex gap-3">
                                        <div className="shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-800/50 rounded-xl flex items-center justify-center mt-1">
                                            <Check className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-blue-900 dark:text-blue-100">Verification</p>
                                            <p className="text-xs text-blue-700 dark:text-blue-300/80 leading-relaxed mt-0.5">Your details will be verified by the community administrator for approval.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="shrink-0 pt-4 border-t border-gray-100 dark:border-gray-700/50 flex justify-between gap-4">
                                    <Button variant="outline" onClick={prevStep} className="flex-1 sm:flex-none py-6 sm:py-2 rounded-xl font-bold">Back</Button>
                                    <Button onClick={nextStep} disabled={!formData.address || !formData.profession} className="flex-1 sm:flex-none py-6 sm:py-2 text-lg sm:text-base font-black rounded-xl">Continue</Button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Review & Submit */}
                        {step === 3 && (
                            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col h-full min-h-0">
                                <div className="text-center mb-8 shrink-0">
                                    <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">Review Application</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Confirm your details before submitting.</p>
                                </div>

                                <div className="flex-1 overflow-y-auto space-y-6 pr-1 min-h-0 mb-4">
                                    <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-700/50 space-y-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] uppercase font-black tracking-widest text-gray-400">Full Name</span>
                                            <span className="font-bold text-gray-900 dark:text-white">{user?.full_name || pendingRegistration?.full_name}</span>
                                        </div>
                                        <div className="h-px bg-gray-200 dark:bg-gray-700/50"></div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] uppercase font-black tracking-widest text-gray-400">Village Selection</span>
                                            <span className="font-bold text-gray-900 dark:text-white">{villages.find(v => v.id === formData.village_id)?.name}</span>
                                        </div>
                                        <div className="h-px bg-gray-200 dark:bg-gray-700/50"></div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] uppercase font-black tracking-widest text-gray-400">Residential Address</span>
                                            <span className="font-bold text-gray-900 dark:text-white">{formData.address}</span>
                                        </div>
                                        <div className="h-px bg-gray-200 dark:bg-gray-700/50"></div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] uppercase font-black tracking-widest text-gray-400">Professional Role</span>
                                            <span className="font-bold text-gray-900 dark:text-white">{formData.profession}</span>
                                        </div>
                                    </div>

                                    <div className="bg-amber-50 dark:bg-amber-900/20 p-5 rounded-2xl border border-amber-200 dark:border-amber-900/30">
                                        <p className="text-xs text-amber-800 dark:text-amber-400 leading-relaxed">
                                            <strong className="block mb-1 text-sm">Processing Notice</strong>
                                            Submission will initiate an administrative review. You will be notified once your membership is activated.
                                        </p>
                                    </div>
                                </div>

                                <div className="shrink-0 pt-4 border-t border-gray-100 dark:border-gray-700/50 flex justify-between gap-4">
                                    <Button variant="outline" onClick={prevStep} className="flex-1 sm:flex-none py-6 sm:py-2 rounded-xl font-bold">Back</Button>
                                    <Button onClick={handleSubmitApplication} className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 shadow-xl shadow-green-500/20 border-none py-6 sm:py-2 text-lg sm:text-base font-black rounded-xl" disabled={isProcessing}>
                                        {isProcessing ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                                        {isProcessing ? 'Submitting...' : 'Submit Now'}
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 4: Pending Status */}
                        {step === 4 && (
                            <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center h-full text-center py-4">
                                <div className="relative w-28 h-28 mb-8 shrink-0">
                                    <div className="absolute inset-0 bg-amber-500/20 rounded-full animate-ping"></div>
                                    <div className="relative w-full h-full bg-linear-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl shadow-amber-500/30">
                                        <Clock className="w-14 h-14 text-white" />
                                    </div>
                                </div>
                                <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-3">Under Review</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-xs mx-auto">
                                    The village administrator is currently reviewing your registration details. This typically takes 24-48 hours.
                                </p>
                                <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-xs font-black uppercase tracking-widest mb-10">
                                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                                    Awaiting Approval
                                </div>
                                <div className="grid grid-cols-1 gap-3 w-full max-w-xs">
                                    <Button onClick={handleCheckStatus} className="w-full py-4 bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20 border-none font-black rounded-xl">Check Status</Button>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Button variant="outline" onClick={() => navigate('/')} className="py-4 rounded-xl font-bold">Home</Button>
                                        <Button variant="outline" onClick={logout} className="py-4 rounded-xl font-bold flex items-center justify-center gap-2">
                                            <LogOut className="w-4 h-4" /> Exit
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 5: Rejected */}
                        {step === 5 && (
                            <motion.div key="step5" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center h-full text-center py-4">
                                <div className="w-28 h-28 bg-linear-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-2xl shadow-red-500/30 mb-8 shrink-0">
                                    <AlertTriangle className="w-14 h-14 text-white" />
                                </div>
                                <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-3">Rejected</h2>
                                {user?.admin_comment && (
                                    <div className="bg-red-50 dark:bg-red-900/20 p-5 rounded-2xl border border-red-100 dark:border-red-900/30 max-w-md mx-auto mb-6">
                                        <p className="text-sm text-red-700 dark:text-red-400 italic">
                                            "{user.admin_comment}"
                                        </p>
                                    </div>
                                )}
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-10 max-w-xs mx-auto">
                                    Your application was not approved. Please contact the administrator or re-submit with correct details.
                                </p>
                                <div className="grid grid-cols-1 gap-3 w-full max-w-xs">
                                    <Button variant="outline" onClick={() => navigate('/')} className="w-full py-4 rounded-xl font-black">Back to Home</Button>
                                    <Button variant="outline" onClick={logout} className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2">
                                        <LogOut className="w-4 h-4" /> Sign Out
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}