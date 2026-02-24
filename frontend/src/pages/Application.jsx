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
        <div className="min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-900 pt-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">

                {/* Show progress only for steps 1-3 */}
                {step <= 3 && (
                    <div className="mb-10">
                        <div className="flex items-center justify-between mb-4">
                            {steps.map((label, idx) => (
                                <div key={idx} className="flex flex-col items-center">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step > idx + 1 ? 'bg-green-600 text-white' :
                                        step === idx + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                                        }`}>
                                        {step > idx + 1 ? <Check className="w-5 h-5" /> : idx + 1}
                                    </div>
                                    <span className={`mt-2 text-xs font-medium ${step === idx + 1 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}>
                                        {label}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-600 transition-all duration-500 ease-in-out"
                                style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                )}

                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-5 sm:p-8">
                    <AnimatePresence mode="wait">

                        {/* Step 1: Village Selection */}
                        {step === 1 && (
                            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <div className="text-center mb-8">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Select Your Village</h2>
                                    <p className="text-gray-500 dark:text-gray-400">Where are you from?</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 max-h-75 sm:max-h-70 overflow-y-auto pr-2">
                                    {villages.map((village) => (
                                        <button
                                            key={village.id}
                                            onClick={() => updateFormData('village_id', village.id)}
                                            className={`flex flex-row items-center justify-between p-4 rounded-xl border-2 text-left transition-all ${formData.village_id === village.id
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                                                }`}
                                        >
                                            <h3 className="font-bold text-gray-900 dark:text-white">{village.name}</h3>
                                            <p className="text-sm text-gray-500">{village.district}</p>
                                        </button>
                                    ))}
                                    {villages.length === 0 && (
                                        <p className="text-center text-gray-500 col-span-2 py-8">No villages available yet. Please check back later.</p>
                                    )}
                                </div>
                                <div className="flex justify-end pt-6">
                                    <Button onClick={nextStep} disabled={!formData.village_id}>Continue</Button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: Personal Details */}
                        {step === 2 && (
                            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <div className="text-center mb-8">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Personal Details</h2>
                                    <p className="text-gray-500 dark:text-gray-400">Tell us a bit more about yourself.</p>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address *</label>
                                        <input type="text" value={formData.address || ''} onChange={(e) => updateFormData('address', e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
                                            placeholder="e.g. 123 Main St, City"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Profession *</label>
                                        <input type="text" value={formData.profession} onChange={(e) => updateFormData('profession', e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
                                            placeholder="e.g. Teacher, Farmer, Engineer"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-between pt-6">
                                    <Button variant="outline" onClick={prevStep}>Back</Button>
                                    <Button onClick={nextStep} disabled={!formData.address || !formData.profession}>Continue</Button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Review & Submit */}
                        {step === 3 && (
                            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <div className="text-center mb-8">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Review Your Application</h2>
                                    <p className="text-gray-500 dark:text-gray-400">Confirm your details before submitting.</p>
                                </div>

                                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-900/50">
                                    <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                                        <div className="flex justify-between"><span className="text-gray-500">Name</span><span className="font-medium">{user?.full_name || pendingRegistration?.full_name}</span></div>
                                        <div className="flex justify-between"><span className="text-gray-500">Email</span><span className="font-medium">{user?.email || pendingRegistration?.email}</span></div>
                                        <div className="flex justify-between"><span className="text-gray-500">Village</span><span className="font-medium">{villages.find(v => v.id === formData.village_id)?.name}</span></div>
                                        <div className="flex justify-between"><span className="text-gray-500">Address</span><span className="font-medium">{formData.address}</span></div>
                                        <div className="flex justify-between"><span className="text-gray-500">Profession</span><span className="font-medium">{formData.profession}</span></div>
                                    </div>
                                </div>

                                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800/50">
                                    <p className="text-sm text-amber-700 dark:text-amber-400">
                                        <strong>Note:</strong> After submission, your application will be reviewed by an admin.
                                        You'll be redirected to the homepage while your application is being reviewed.
                                    </p>
                                </div>

                                <div className="flex justify-between pt-6">
                                    <Button variant="outline" onClick={prevStep}>Back</Button>
                                    <Button onClick={handleSubmitApplication} className="bg-green-600 hover:bg-green-700" disabled={isProcessing}>
                                        {isProcessing ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                                        {isProcessing ? 'Submitting...' : 'Submit Application'}
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 4: Pending Status */}
                        {step === 4 && (
                            <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                                <div className="relative mx-auto w-24 h-24 mb-8">
                                    <div className="absolute inset-0 bg-amber-500/20 rounded-full animate-ping"></div>
                                    <div className="relative w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-xl shadow-amber-500/30">
                                        <Clock className="w-12 h-12 text-white" />
                                    </div>
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Application Pending</h2>
                                <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                                    Your application is under review. An admin will approve your membership shortly.
                                </p>
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-sm font-medium mb-8">
                                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                                    Waiting for Admin Approval
                                </div>
                                <div className="flex flex-col gap-3 max-w-xs mx-auto">
                                    <Button onClick={handleCheckStatus} className="w-full py-3 bg-blue-600 hover:bg-blue-700">Check Status</Button>
                                    <Button variant="outline" onClick={() => navigate('/')} className="w-full py-3">Go to Homepage</Button>
                                    <Button variant="outline" onClick={logout} className="w-full py-3 flex items-center justify-center gap-2">
                                        <LogOut className="w-4 h-4" /> Sign Out
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 5: Rejected */}
                        {step === 5 && (
                            <motion.div key="step5" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                                <div className="mx-auto w-24 h-24 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-xl shadow-red-500/30 mb-8">
                                    <AlertTriangle className="w-12 h-12 text-white" />
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Application Rejected</h2>
                                {user?.admin_comment && (
                                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800/50 max-w-md mx-auto mb-6">
                                        <p className="text-sm text-red-700 dark:text-red-400">
                                            <strong>Reason:</strong> {user.admin_comment}
                                        </p>
                                    </div>
                                )}
                                <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                                    Please contact the admin for more details or try again.
                                </p>
                                <div className="flex flex-col gap-3 max-w-xs mx-auto">
                                    <Button variant="outline" onClick={() => navigate('/')} className="w-full py-3">Go to Homepage</Button>
                                    <Button variant="outline" onClick={logout} className="w-full py-3 flex items-center justify-center gap-2">
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