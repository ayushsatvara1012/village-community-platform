import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Users, Plus, Trash2, Loader2, AlertCircle, X,
    ChevronDown, ChevronRight, Mail, Phone, Briefcase, MapPin,
    RotateCcw, Edit2, Download, Award, ShieldCheck, Camera,
    ZoomIn, ZoomOut, Check, Upload, RefreshCw, ImageOff, Calendar
} from 'lucide-react';
import { API_URL } from '../config';
import { useFamilyTree, useFamilyList, useAddFamilyMember, useDeleteFamilyMember } from '../hooks/useFamily';
import { getFullImageUrl, dicebearUrl, getAvatarOptions, initialsUrl, DICEBEAR_AVATARS } from '../utils/avatar';



const compressImage = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800;
                const MAX_HEIGHT = 800;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob((blob) => resolve(blob), 'image/webp', 0.8);
            };
        };
        reader.onerror = (err) => reject(err);
    });
};

// Crop a loaded image using position/scale to an 800x800 canvas
const cropImageToBlob = (imageSrc, position, scale, viewportSize = 300) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = imageSrc;
        img.onload = () => {
            const OUTPUT_SIZE = 800;
            const canvas = document.createElement('canvas');
            canvas.width = OUTPUT_SIZE;
            canvas.height = OUTPUT_SIZE;
            const ctx = canvas.getContext('2d');

            // Scale factor from viewport pixels → output pixels
            const ratio = OUTPUT_SIZE / viewportSize;

            // The image natural size after scaling to fill the viewport
            const scaledW = img.naturalWidth * scale;
            const scaledH = img.naturalHeight * scale;

            // Source rectangle (in natural image coordinates)
            const srcX = (-position.x / scale);
            const srcY = (-position.y / scale);
            const srcW = viewportSize / scale;
            const srcH = viewportSize / scale;

            ctx.drawImage(
                img,
                srcX, srcY, srcW, srcH,
                0, 0, OUTPUT_SIZE, OUTPUT_SIZE
            );
            canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Canvas export failed')), 'image/webp', 0.85);
        };
        img.onerror = () => reject(new Error('Failed to load image for cropping'));
    });
};

// ─── Image Crop Modal Component ───────────────────────────────────────────────
function ImageCropModal({ imageSrc, onConfirm, onCancel, uploading, initialScale, initialPos, initialNaturalSize }) {
    const VIEWPORT = 280; // px — matches profile avatar visual size

    // ── ALL state initialized from props so frame-1 is ALWAYS correct ──────────
    const [naturalSize, setNaturalSize] = useState(
        initialNaturalSize ?? { w: 0, h: 0 }
    );
    const [scale, setScale] = useState(initialScale ?? 1);
    const [pos, setPos] = useState(initialPos ?? { x: 0, y: 0 });
    const imgRef = useRef(null);
    const dragRef = useRef(null);

    // Use naturalSize (which is pre-populated from props) for all calculations
    const nw = naturalSize.w;
    const nh = naturalSize.h;

    const getMinScale = (w = nw, h = nh) =>
        w && h ? Math.max(VIEWPORT / w, VIEWPORT / h) : scale;

    const clampPos = (x, y, sc, w = nw, h = nh) => {
        if (!w || !h) return { x, y };
        const imgW = w * sc;
        const imgH = h * sc;
        return {
            x: Math.min(0, Math.max(x, VIEWPORT - imgW)),
            y: Math.min(0, Math.max(y, VIEWPORT - imgH)),
        };
    };

    // onImgLoad: update naturalSize (in case it wasn't passed as a prop)
    // and recompute if no initial values were provided
    const onImgLoad = () => {
        const { naturalWidth: w, naturalHeight: h } = imgRef.current;
        setNaturalSize({ w, h });
        if (initialScale == null) {
            const minSc = Math.max(VIEWPORT / w, VIEWPORT / h);
            setScale(minSc);
            setPos({ x: (VIEWPORT - w * minSc) / 2, y: (VIEWPORT - h * minSc) / 2 });
        }
    };

    const handleSlider = (e) => {
        const minSc = getMinScale();
        const maxSc = minSc * 4;
        const newScale = minSc + (maxSc - minSc) * (e.target.value / 100);
        setScale(newScale);
        setPos(clampPos(pos.x, pos.y, newScale));
    };

    const sliderValue = () => {
        const minSc = getMinScale();
        const maxSc = minSc * 4;
        if (!nw || maxSc === minSc) return 0;
        return Math.round(((scale - minSc) / (maxSc - minSc)) * 100);
    };

    const onPointerDown = (e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        dragRef.current = { startX: e.clientX, startY: e.clientY, startPosX: pos.x, startPosY: pos.y };
    };

    const onPointerMove = (e) => {
        if (!dragRef.current) return;
        setPos(clampPos(
            dragRef.current.startPosX + (e.clientX - dragRef.current.startX),
            dragRef.current.startPosY + (e.clientY - dragRef.current.startY),
            scale
        ));
    };

    const onPointerUp = () => { dragRef.current = null; };

    const handleConfirm = () => onConfirm(imageSrc, pos, scale, VIEWPORT);

    // ── img style: natural-size element, positioned via CSS transform ───────────
    // maxWidth/maxHeight: 'none' overrides Tailwind's global `img { max-width: 100% }`
    // which would otherwise shrink the image and break our coordinate system.
    const imgStyle = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: nw || 'auto',
        height: nh || 'auto',
        maxWidth: 'none',
        maxHeight: 'none',
        transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
        transformOrigin: '0 0',
        pointerEvents: 'none',   // all pointer events go to the parent container
        userSelect: 'none',
        WebkitUserSelect: 'none',
        willChange: 'transform',
    };

    // Profile-avatar border radius (matches `rounded-[2.2rem]` on the preview)
    const RADIUS = '2.2rem';

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
            >
                <motion.div
                    initial={{ scale: 0.93, y: 24 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.93, y: 24 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                    className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl w-full overflow-hidden"
                    style={{ maxWidth: VIEWPORT + 56 }}
                >
                    {/* Header */}
                    <div className="px-6 pt-6 pb-4">
                        <h3 className="text-lg font-black text-gray-900 dark:text-white">Position Your Photo</h3>
                        <p className="text-xs text-gray-400 mt-0.5">Drag · Pinch · Slide to adjust</p>
                    </div>

                    {/* ── Crop Viewport ── */}
                    {/* Outer wrapper: rounded like the profile avatar + blue ring to show the crop frame */}
                    <div className="mx-auto" style={{ width: VIEWPORT, height: VIEWPORT, position: 'relative' }}>

                        {/* The actual clipping area — rounded to match the profile avatar exactly */}
                        <div
                            style={{
                                position: 'absolute',
                                inset: 0,
                                borderRadius: RADIUS,
                                overflow: 'hidden',
                                cursor: dragRef.current ? 'grabbing' : 'grab',
                                touchAction: 'none',
                                background: '#111',
                            }}
                            onPointerDown={onPointerDown}
                            onPointerMove={onPointerMove}
                            onPointerUp={onPointerUp}
                            onPointerLeave={onPointerUp}
                        >
                            <img
                                ref={imgRef}
                                src={imageSrc}
                                alt="Crop preview"
                                onLoad={onImgLoad}
                                draggable={false}
                                style={imgStyle}
                            />

                            {/* Rule-of-thirds grid */}
                            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gridTemplateRows: 'repeat(3,1fr)' }}>
                                {Array.from({ length: 9 }).map((_, i) => (
                                    <div key={i} style={{ border: '1px solid rgba(255,255,255,0.15)' }} />
                                ))}
                            </div>
                        </div>

                        {/* Blue profile-shape ring overlay — sits on top, pointer-none */}
                        <div
                            style={{
                                position: 'absolute',
                                inset: 0,
                                borderRadius: RADIUS,
                                border: '3px solid rgba(59,130,246,0.7)',
                                boxShadow: '0 0 0 6px rgba(59,130,246,0.12)',
                                pointerEvents: 'none',
                            }}
                        />
                    </div>

                    {/* Zoom Slider */}
                    <div className="px-6 pt-5 pb-2">
                        <div className="flex items-center gap-3">
                            <ZoomOut className="w-4 h-4 text-gray-400 shrink-0" />
                            <input
                                type="range"
                                min={0}
                                max={100}
                                value={sliderValue()}
                                onChange={handleSlider}
                                className="w-full h-1.5 appearance-none rounded-full cursor-pointer accent-blue-600"
                                style={{ background: `linear-gradient(to right, #3b82f6 ${sliderValue()}%, #e5e7eb ${sliderValue()}%)` }}
                            />
                            <ZoomIn className="w-4 h-4 text-gray-400 shrink-0" />
                        </div>
                        <div className="flex justify-between mt-2 px-0.5">
                            <span className="text-[10px] text-gray-400">Fit</span>
                            <span className="text-[10px] text-gray-400 font-medium">Zoom {Math.round(sliderValue())}%</span>
                            <span className="text-[10px] text-gray-400">4×</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="px-6 pb-6 pt-2 flex gap-3">
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={uploading}
                            className="flex-1 h-12 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirm}
                            disabled={uploading}
                            className="flex-2 h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-60"
                        >
                            {uploading ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
                            ) : (
                                <><Upload className="w-4 h-4" /> Use This Crop</>
                            )}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}


// API_URL is now centralized in src/config.js

const RELATIONS = ['Father', 'Mother', 'Spouse', 'Son', 'Daughter', 'Brother', 'Sister', 'Grandfather', 'Grandmother', 'Uncle', 'Aunt'];

function TreeNode({ node, onDelete, depth = 0 }) {
    const [expanded, setExpanded] = useState(true);
    const hasChildren = node.children && node.children.length > 0;
    const isSelf = node.relation === 'Self';

    const genderColor = node.gender === 'female'
        ? 'from-pink-500 to-rose-500'
        : 'from-blue-500 to-indigo-500';

    const genderBorder = node.gender === 'female'
        ? 'border-pink-200 dark:border-pink-900/50'
        : 'border-blue-200 dark:border-blue-900/50';

    return (
        <div className="flex flex-col items-center">
            {/* Node card */}
            <motion.div
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className={`relative group bg-white dark:bg-gray-800 rounded-2xl shadow-sm border-2 ${genderBorder} p-3 sm:p-4 min-w-[140px] sm:min-w-[180px] max-w-[200px] text-center transition-all hover:shadow-md ${isSelf ? 'ring-2 ring-blue-500 ring-offset-4 dark:ring-offset-gray-900 z-10' : ''}`}
            >
                {/* Avatar */}
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-linear-to-br ${genderColor} flex items-center justify-center mx-auto mb-2 shadow-inner`}>
                    <span className="text-white text-base sm:text-lg font-bold">
                        {node.name.charAt(0).toUpperCase()}
                    </span>
                </div>

                {/* Info */}
                <div className="space-y-0.5">
                    <h4 className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm truncate px-1">{node.name}</h4>
                    <span className="inline-block px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-tight">
                        {node.relation}
                    </span>
                </div>

                {/* Additional Info (Desktop or larger scale) */}
                <div className="mt-2 hidden sm:block">
                    {node.age && (
                        <p className="text-[10px] text-gray-400">Age: {node.age}</p>
                    )}
                    {node.profession && (
                        <p className="text-[10px] text-gray-400 truncate italic">"{node.profession}"</p>
                    )}
                </div>

                {/* Delete button — hidden for Self */}
                {!isSelf && onDelete && (
                    <button
                        onClick={() => onDelete(node.id)}
                        className="absolute -top-2 -right-2 w-7 h-7 bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center opacity-100 transition-all shadow-lg active:scale-95"
                        title="Remove member"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                )}

                {/* Expand toggle */}
                {hasChildren && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full flex items-center justify-center text-gray-400 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors z-10 shadow-sm"
                    >
                        {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </button>
                )}
            </motion.div>

            {/* Children with connecting lines */}
            {hasChildren && expanded && (
                <div className="flex flex-col items-center mt-0">
                    {/* Vertical connector from parent */}
                    <div className="w-0.5 h-8 bg-linear-to-b from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600"></div>

                    {/* Child nodes with relative horizontal connectors */}
                    <div className="flex items-start mt-0 relative">
                        {node.children.map((child, index) => (
                            <div key={child.id} className="flex flex-col items-center relative px-2 sm:px-6">
                                {/* Horizontal bridge — self-aligning and flush */}
                                {node.children.length > 1 && (
                                    <div className="absolute top-0 left-0 right-0 flex h-0.5">
                                        <div className={`flex-1 ${index === 0 ? 'bg-transparent' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                                        <div className={`flex-1 ${index === node.children.length - 1 ? 'bg-transparent' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                                    </div>
                                )}

                                {/* Vertical connector to child */}
                                <div className="w-0.5 h-8 bg-gray-300 dark:bg-gray-600 z-10"></div>
                                <TreeNode node={child} onDelete={onDelete} depth={depth + 1} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}


export default function Profile() {
    const { user, refreshUser } = useAuth();
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [zoomScale, setZoomScale] = useState(0.85);
    const containerRef = useRef(null);
    const dateInputRef = useRef(null);
    const [lastTouchDistance, setLastTouchDistance] = useState(null);
    const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });

    // Queries
    const { data: tree, isLoading: loadingTree } = useFamilyTree();
    const { data: flatList = [], isLoading: loadingList } = useFamilyList();
    const loading = loadingTree || loadingList;

    // Mutations
    const addMemberMutation = useAddFamilyMember();
    const deleteMemberMutation = useDeleteFamilyMember();

    const [newMember, setNewMember] = useState({
        name: '',
        relation: 'Spouse',
        gender: 'male',
        age: '',
        profession: '',
        linked_sabhasad_id: ''
    });

    const [editProfileData, setEditProfileData] = useState({
        full_name: '',
        phone_number: '',
        address: '',
        profession: '',
        date_of_birth: ''
    });
    const [selectedAvatar, setSelectedAvatar] = useState(null);
    const [imageType, setImageType] = useState('avatar');
    const [uploadingImage, setUploadingImage] = useState(false);
    const [cropSrc, setCropSrc] = useState(null);
    const [uploadToast, setUploadToast] = useState(null);
    const fileInputRef = useRef(null);
    const toastTimerRef = useRef(null);
    const [rawCropSrc, setRawCropSrc] = useState(null);
    const [cropInitial, setCropInitial] = useState(null);

    const showToast = (type, message, ms = 5000) => {
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        setUploadToast({ type, message });
        toastTimerRef.current = setTimeout(() => setUploadToast(null), ms);
    };

    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const MAX_FILE_SIZE_MB = 10;

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        try {
            const cleanDate = dateStr.split('T')[0];
            const parts = cleanDate.split('-');
            if (parts.length === 3) {
                const [y, m, d] = parts;
                return `${d}/${m}/${y}`;
            }
            return dateStr;
        } catch (e) {
            return dateStr;
        }
    };

    const token = localStorage.getItem('village_app_token');
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

    useEffect(() => {
        if (user) {
            setEditProfileData({
                full_name: user.full_name || '',
                phone_number: user.phone_number || '',
                address: user.address || '',
                profession: user.profession || '',
                date_of_birth: user.date_of_birth ? user.date_of_birth.split('T')[0] : ''
            });
            setSelectedAvatar(user.avatar_style || null);
            setImageType(user.profile_image ? 'photo' : 'avatar');
        }
    }, [user]);

    const handleAdd = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            const payload = {
                ...newMember,
                parent_id: newMember.parent_id ? parseInt(newMember.parent_id) : undefined,
                age: newMember.age ? parseInt(newMember.age) : undefined,
                linked_sabhasad_id: newMember.linked_sabhasad_id || undefined
            };
            await addMemberMutation.mutateAsync(payload);
            setShowAddModal(false);
            setNewMember({ name: '', relation: 'Spouse', parent_id: null, gender: 'male', age: '', profession: '', linked_sabhasad_id: '' });
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            const res = await fetch(`${API_URL}/auth/me`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify({
                    ...editProfileData,
                    // Save the selected avatar style, or null to reset to name-based default
                    avatar_style: selectedAvatar || null,
                    // If user switched to avatar mode, clear the profile_image link
                    profile_image: imageType === 'avatar' ? null : user.profile_image
                })
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || 'Failed to update profile');
            }
            await refreshUser();
            setShowEditModal(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        // Reset input so same file can be re-selected after an error
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (!file) return;

        // ── Client-side validation ──────────────────────────────────────
        if (!ALLOWED_TYPES.includes(file.type)) {
            showToast('error', `Unsupported file type "${file.type || 'unknown'}". Please upload a JPEG, PNG or WebP image.`);
            return;
        }
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            showToast('error', `Image is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum allowed size is ${MAX_FILE_SIZE_MB} MB.`);
            return;
        }

        // Pre-load the image to compute exact dimensions BEFORE showing the crop
        // modal — this ensures the modal renders correctly from the very first frame.
        const reader = new FileReader();
        reader.onload = (ev) => {
            const dataUrl = ev.target.result;
            const img = new window.Image();
            img.onload = () => {
                const VIEWPORT = 280;
                const { naturalWidth: w, naturalHeight: h } = img;
                const minSc = Math.max(VIEWPORT / w, VIEWPORT / h);
                const initX = (VIEWPORT - w * minSc) / 2;
                const initY = (VIEWPORT - h * minSc) / 2;
                setCropInitial({
                    scale: minSc,
                    pos: { x: initX, y: initY },
                    naturalSize: { w, h },   // ← pass dims so modal frame-1 is correct
                });
                setRawCropSrc(dataUrl);   // remember for re-crop
                setCropSrc(dataUrl);
            };
            img.onerror = () => showToast('error', 'Could not read the image. Please try a different file.');
            img.src = dataUrl;
        };
        reader.onerror = () => showToast('error', 'Could not read the file. Please try a different image.');
        reader.readAsDataURL(file);
    };

    // Re-open the crop modal for an already-uploaded image
    const handleReCrop = () => {
        if (!rawCropSrc && !user?.profile_image) return;
        const src = rawCropSrc || getFullImageUrl(user.profile_image);
        // For server images we don't have precomputed dims, so pass null (modal will compute onLoad)
        setCropInitial(null);
        setRawCropSrc(src);
        setCropSrc(src);
    };

    const handleCropConfirm = async (imageSrc, pos, scale, viewportSize) => {
        setUploadingImage(true);
        setError('');

        // 20-second hard timeout to catch stalled requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000);

        try {
            const croppedBlob = await cropImageToBlob(imageSrc, pos, scale, viewportSize);
            const formData = new FormData();
            formData.append('file', croppedBlob, 'profile.webp');

            const res = await fetch(`${API_URL}/auth/upload-profile-image`, {
                method: 'POST',
                headers: { 'Authorization': headers['Authorization'] },
                body: formData,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (res.status === 413) {
                throw new Error('Image is too large for the server. Try a smaller photo.');
            } else if (res.status === 415) {
                throw new Error('Server rejected the file type. Please upload a JPEG, PNG, or WebP.');
            } else if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.detail || `Upload failed with status ${res.status}. Please try again.`);
            }

            await refreshUser();
            setCropSrc(null);
            setImageType('photo');
            showToast('success', 'Profile photo updated successfully!');
        } catch (err) {
            clearTimeout(timeoutId);
            if (err.name === 'AbortError') {
                showToast('error', 'Upload timed out. Check your internet connection and try again.');
            } else {
                showToast('error', err.message || 'An unexpected error occurred. Please try again.');
            }
        } finally {
            setUploadingImage(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Remove this family member?')) return;
        try {
            await fetch(`${API_URL}/family/${id}`, { method: 'DELETE', headers });
            await fetchFamily();
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    // Pinch to zoom logic
    const handleTouchStart = (e) => {
        if (e.touches.length === 2) {
            const dist = Math.hypot(
                e.touches[0].pageX - e.touches[1].pageX,
                e.touches[0].pageY - e.touches[1].pageY
            );
            setLastTouchDistance(dist);
        }
    };

    const handleTouchMove = (e) => {
        if (e.touches.length === 2 && lastTouchDistance) {
            const dist = Math.hypot(
                e.touches[0].pageX - e.touches[1].pageX,
                e.touches[0].pageY - e.touches[1].pageY
            );
            const delta = dist - lastTouchDistance;

            // Adjust sensitivity
            if (Math.abs(delta) > 2) {
                setZoomScale(s => {
                    const next = s + delta * 0.005;
                    return Math.min(Math.max(next, 0.2), 1.5);
                });
                setLastTouchDistance(dist);
            }
        }
    };

    const handleTouchEnd = () => {
        setLastTouchDistance(null);
    };

    const resetView = () => {
        setZoomScale(0.85);
        setDragPosition({ x: 0, y: 0 });
    };

    return (
        <>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8 font-sans">
                <div className="max-w-7xl mx-auto">
                    {/* Profile Header */}
                    <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl overflow-hidden mb-12 border border-white dark:border-gray-700/50 relative">

                        {/* Background Image Container */}
                        <div className="h-48 sm:h-64 bg-[url('/vishwakarma_profile.webp')] bg-cover bg-top relative overflow-hidden">

                            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent"></div>
                            <div className="absolute left-10 top-5 flex items-center gap-3 z-10 max-w-[calc(100%-5rem)] overflow-hidden">
                                <div className='shrink-0 px-3 py-1 bg-blue-50 dark:bg-blue-800/30 text-blue-600 dark:text-white border border-transparent dark:border-blue-400/40 rounded-full text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-sm'>
                                    {user?.status}
                                </div>
                                <button
                                    onClick={() => setShowEditModal(true)}
                                    className="shrink-0 flex items-center gap-1.5 px-3 py-1 bg-white/80 hover:bg-white/50 dark:bg-blue-600 dark:hover:bg-blue-600/40 text-blue-600 dark:text-white border border-blue-200/20 dark:border-blue-200/50 rounded-full text-[12px] font-black uppercase tracking-wide backdrop-blur-md transition-all active:scale-95 group"
                                >
                                    <Edit2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                                </button>
                            </div>

                        </div>

                        <div className="relative px-6 sm:px-10 lg:px-12 pb-10">
                            <div className="-mt-20 sm:-mt-24 flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-10">
                                <div className="relative group">
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        className="relative"
                                    >
                                        <img
                                            src={user?.avatar || initialsUrl(user?.full_name || 'User')}
                                            alt={user?.name}
                                            className="w-36 h-36 sm:w-44 sm:h-44 rounded-[2.5rem] border-8 border-white dark:border-gray-800 shadow-[0_20px_50px_rgba(0,0,0,0.3)] bg-white dark:bg-gray-700 object-cover object-top relative z-10"
                                        />
                                        <div className="absolute -inset-2 bg-linear-to-tr from-blue-500 to-purple-500 rounded-[2.8rem] blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                                    </motion.div>

                                    {/* Camera button — opens edit modal directly to avatar picker */}
                                    <button
                                        onClick={() => setShowEditModal(true)}
                                        title="Change avatar"
                                        className="absolute bottom-3 right-3 z-20 w-9 h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-500/40 transition-all active:scale-90 border-2 border-white dark:border-gray-800"
                                    >
                                        <Camera className="w-4 h-4" />
                                    </button>

                                    <span className={`absolute bottom-3 left-3 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-gray-800 shadow-sm z-20 ${user?.status === 'member' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                                </div>

                                <div className="text-center lg:text-left flex-1 pt-4 self-center lg:self-top">
                                    <div className="flex flex-col lg:flex-row items-center lg:items-center gap-3">
                                        <h1 className="text-3xl sm:text-5xl font-black inline-block bg-gradient-to-r from-yellow-500 to-yellow-200 text-transparent bg-clip-text dark:text-white tracking-tight leading-none">
                                            {user?.full_name}
                                        </h1>
                                        {user?.position && (
                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 dark:bg-blue-500 rounded-lg shadow-lg shadow-blue-500/20 transform hover:scale-105 transition-transform duration-200">
                                                <ShieldCheck className="w-4 h-4 text-white" />
                                                <span className="text-xs font-black text-white uppercase tracking-wider">{user.position}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-3 mt-4 text-sm font-semibold text-gray-500 dark:text-gray-400">
                                        <span className="flex items-center gap-2 group cursor-default">
                                            <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-500/10 group-hover:text-blue-500 transition-colors">
                                                <Mail className="w-4 h-4" />
                                            </div>
                                            {user.email || "No email"}
                                        </span>
                                        {user.phone_number && (
                                            <span className="flex items-center gap-2 group cursor-default">
                                                <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 group-hover:bg-green-500/10 group-hover:text-green-500 transition-colors">
                                                    <Phone className="w-4 h-4" />
                                                </div>
                                                {user.phone_number}
                                            </span>
                                        )}
                                        <span className="flex items-center gap-2 group cursor-default">
                                            <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 group-hover:bg-rose-500/10 group-hover:text-rose-500 transition-colors">
                                                <MapPin className="w-4 h-4" />
                                            </div>
                                            {user.village?.name || "Village Not Set"}
                                        </span>
                                        {user.date_of_birth && (
                                            <span className="flex items-center gap-2 group cursor-default">
                                                <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 group-hover:bg-amber-500/10 group-hover:text-amber-500 transition-colors">
                                                    <User className="w-4 h-4" />
                                                </div>
                                                Born: {formatDate(user.date_of_birth)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex mt-3 w-full items-center justify-center gap-2 group cursor-default lg:justify-end lg:mt-0 lg:absolute lg:bottom-5 lg:right-6">
                                        <div className="px-3 py-1 bg-blue-50 dark:bg-blue-800/30 text-blue-800 dark:text-white border border-transparent dark:border-blue-400/40 rounded-full text-sm font-black backdrop-blur-sm">
                                            {user.sabhasad_id || "ID Not Assigned"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Family Tree Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/30 overflow-hidden flex flex-col h-[600px] sm:h-[700px]">
                        <div className="p-6 sm:p-8 shrink-0 flex items-center justify-between border-b border-gray-100 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm z-20">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                                        <Users className="w-6 h-6 text-blue-600" />
                                    </div>
                                    Family Tree
                                </h2>
                                <p className="hidden sm:block text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {flatList.length} total nodes in your lineage
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                {/* Zoom Stats */}
                                <div className="hidden sm:flex items-center gap-1 px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 text-[10px] font-bold text-gray-500">
                                    <span>{(zoomScale * 100).toFixed(0)}%</span>
                                </div>

                                <Button
                                    onClick={() => { setShowAddModal(true); setError(''); }}
                                    className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 h-10 w-10 sm:h-auto sm:w-auto p-0 sm:px-6 sm:py-2.5 rounded-xl border-none gap-2 flex items-center justify-center font-bold"
                                >
                                    <Plus className="w-5 h-5" />
                                    <span className="hidden sm:inline">Add Member</span>
                                </Button>
                            </div>
                        </div>

                        {/* Tree visualization with Zoom/Pan */}
                        <div
                            ref={containerRef}
                            className="flex-1 relative overflow-hidden bg-gray-50/50 dark:bg-gray-900/30 touch-none cursor-grab active:cursor-grabbing"
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                        >
                            {loading ? (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                                </div>
                            ) : tree ? (
                                <>
                                    <motion.div
                                        drag
                                        dragConstraints={{ left: -1200, right: 1200, top: -800, bottom: 1200 }}
                                        dragElastic={0.15}
                                        dragMomentum={false}
                                        animate={{
                                            scale: zoomScale,
                                            x: dragPosition.x,
                                            y: dragPosition.y
                                        }}
                                        transition={{
                                            scale: { duration: 0.3 },
                                            x: { duration: dragPosition.x === 0 ? 0.5 : 0 },
                                            y: { duration: dragPosition.y === 0 ? 0.5 : 0 }
                                        }}
                                        onDragEnd={(e, info) => {
                                            setDragPosition({
                                                x: dragPosition.x + info.offset.x,
                                                y: dragPosition.y + info.offset.y
                                            });
                                        }}
                                        style={{
                                            transformOrigin: 'center center'
                                        }}
                                        className="absolute inset-0 flex items-start justify-center p-8 pt-12"
                                    >
                                        <div className="min-w-fit flex flex-col items-center justify-center">
                                            <TreeNode node={tree} onDelete={handleDelete} />
                                        </div>
                                    </motion.div>

                                    {/* Zoom Controls */}
                                    <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-30">
                                        <button
                                            onClick={() => setZoomScale(s => Math.min(s + 0.1, 1.5))}
                                            className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                                        >
                                            <Plus className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => setZoomScale(s => Math.max(s - 0.1, 0.2))}
                                            className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5 rotate-45" style={{ transform: 'rotate(45deg)' }} />
                                            <div className="w-4 h-0.5 bg-current absolute rounded-full" />
                                        </button>
                                        <button
                                            onClick={resetView}
                                            title="Reset View"
                                            className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                                        >
                                            <RotateCcw className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="absolute bottom-6 left-6 text-[10px] font-black uppercase tracking-widest text-gray-400 grid grid-col-2 gap-2 pointer-events-none">
                                        <div className="flex gap-1 items-center">
                                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                            <span>Male</span>
                                        </div>
                                        <div className="flex gap-1 items-center">
                                            <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                                            <span>Female</span>
                                        </div>
                                        <span>• Pinch or drag to navigate</span>
                                    </div>
                                </>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                                    <Users className="w-20 h-20 mx-auto mb-6 opacity-10" />
                                    <h3 className="text-xl font-bold text-gray-600 dark:text-gray-400">Empty Lineage</h3>
                                    <p className="text-sm mt-2 max-w-xs">Your family tree is waiting to be built. Start by adding your first relative.</p>
                                    <Button
                                        onClick={() => setShowAddModal(true)}
                                        className="mt-6 bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 border-none px-8"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Get Started
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Add Member Modal */}
                <AnimatePresence>
                    {showAddModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full p-8 relative border border-white/20 dark:border-gray-700/30"
                            >
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>

                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <User className="w-8 h-8 text-blue-600" />
                                    </div>
                                    <h2 className="text-2xl font-black text-gray-900 dark:text-white">Add Family Member</h2>
                                    <p className="text-sm text-gray-500 mt-1">Expanding your community lineage</p>
                                </div>

                                {error && (
                                    <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-700 dark:text-red-400 text-sm flex items-center gap-3">
                                        <AlertCircle className="w-5 h-5 shrink-0" />
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleAdd} className="space-y-5">
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1">Full Name *</label>
                                        <input
                                            type="text" required
                                            value={newMember.name}
                                            onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white transition-all"
                                            placeholder="Full name of member"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1">Relation *</label>
                                            <select
                                                value={newMember.relation}
                                                onChange={(e) => setNewMember({ ...newMember, relation: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white transition-all"
                                            >
                                                {RELATIONS.map(r => <option key={r} value={r}>{r}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1">Gender</label>
                                            <select
                                                value={newMember.gender}
                                                onChange={(e) => setNewMember({ ...newMember, gender: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white transition-all"
                                            >
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1">Age</label>
                                            <input
                                                type="number"
                                                value={newMember.age}
                                                onChange={(e) => setNewMember({ ...newMember, age: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white transition-all"
                                                placeholder="Optional"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1">Profession</label>
                                            <input
                                                type="text"
                                                value={newMember.profession}
                                                onChange={(e) => setNewMember({ ...newMember, profession: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white transition-all"
                                                placeholder="Optional"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1">Attach Under Parent</label>
                                        <select
                                            value={newMember.parent_id || ''}
                                            onChange={(e) => setNewMember({ ...newMember, parent_id: e.target.value || null })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white transition-all font-medium"
                                        >
                                            <option value="">— Primary Root (Under You) —</option>
                                            {flatList.map(m => (
                                                <option key={m.id} value={m.id}>{m.name} ({m.relation})</option>
                                            ))}
                                        </select>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20 border-none text-base font-black rounded-xl"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                                        <span className="ml-2">{isSubmitting ? 'Processing...' : 'Add to Family Tree'}</span>
                                    </Button>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Edit Profile Modal */}
                <AnimatePresence>
                    {showEditModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
                            onClick={(e) => { if (e.target === e.currentTarget) setShowEditModal(false); }}
                        >
                            <motion.div
                                initial={{ y: '100%' }}
                                animate={{ y: 0 }}
                                exit={{ y: '100%' }}
                                transition={{ type: 'spring', stiffness: 350, damping: 35 }}
                                className="bg-white dark:bg-gray-800 w-full sm:max-w-lg sm:mx-4 rounded-t-4xl sm:rounded-4xl shadow-2xl relative border-t border-gray-100 dark:border-gray-700 sm:border overflow-hidden"
                            >
                                {/* Drag handle indicator (mobile only) */}
                                <div className="sm:hidden flex justify-center pt-3 pb-1">
                                    <div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-gray-600" />
                                </div>

                                <div className="overflow-y-auto max-h-[85vh] sm:max-h-[90vh] p-5 sm:p-8">
                                    <button
                                        onClick={() => setShowEditModal(false)}
                                        className="absolute top-4 right-4 sm:top-6 sm:right-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>

                                    <div className="mb-5 sm:mb-7">
                                        <h2 className="text-xl sm:text-3xl font-black text-black dark:text-white mb-1">Edit Profile</h2>
                                        <p className="text-xs sm:text-sm text-gray-500">Update your personal information</p>
                                    </div>

                                    {/* ─── Avatar Picker ─────────────────────── */}
                                    <div className="mb-6">
                                        <div className="flex items-center justify-between mb-3">
                                            <p className="text-xs font-black uppercase tracking-widest text-gray-400">Profile Picture</p>
                                            <div className="flex bg-gray-100/80 dark:bg-gray-900/80 backdrop-blur-md p-1.5 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
                                                <button
                                                    type="button"
                                                    onClick={() => setImageType('avatar')}
                                                    className={`px-4 py-2 text-xs font-black rounded-xl transition-all duration-300 ${imageType === 'avatar' ? 'bg-white dark:bg-gray-800 text-blue-600 shadow-xl shadow-blue-500/10' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'}`}
                                                >
                                                    AI Avatar
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setImageType('photo')}
                                                    className={`px-4 py-2 text-xs font-black rounded-xl transition-all duration-300 ${imageType === 'photo' ? 'bg-white dark:bg-gray-800 text-blue-600 shadow-xl shadow-blue-500/10' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'}`}
                                                >
                                                    My Photo
                                                </button>
                                            </div>
                                        </div>

                                        {/* Live preview — Larger and more prominent */}
                                        <div className="flex flex-col items-center gap-6 mb-8 p-6 bg-gray-50/50 dark:bg-gray-900/30 rounded-[2.5rem] border border-gray-100/50 dark:border-gray-700/30 backdrop-blur-sm">
                                            <div className="relative group">
                                                <div className="absolute -inset-4 bg-linear-to-tr from-blue-500/20 to-purple-500/20 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                                {/* Clickable preview for re-cropping */}
                                                <button
                                                    type="button"
                                                    onClick={imageType === 'photo' && user?.profile_image ? handleReCrop : undefined}
                                                    disabled={imageType !== 'photo' || !user?.profile_image || uploadingImage}
                                                    className={`relative z-10 block rounded-[2.2rem] overflow-hidden border-4 border-white dark:border-gray-700 shadow-2xl shrink-0 ${imageType === 'photo' && user?.profile_image ? 'cursor-pointer ring-0 hover:ring-4 hover:ring-blue-400/50 transition-all' : 'cursor-default'}`}
                                                    title={imageType === 'photo' && user?.profile_image ? 'Click to adjust photo position' : ''}
                                                >
                                                    <img
                                                        src={imageType === 'photo' && user?.profile_image
                                                            ? getFullImageUrl(user.profile_image)
                                                            : (selectedAvatar ? dicebearUrl(selectedAvatar, getAvatarOptions(selectedAvatar)) : (user?.avatar || dicebearUrl(user?.full_name || 'User', getAvatarOptions(user?.avatar_style))))}
                                                        alt="Profile Preview"
                                                        className="w-32 h-32 sm:w-40 sm:h-40 object-cover object-top"
                                                    />
                                                    {/* Hover overlay showing adjust option */}
                                                    {imageType === 'photo' && user?.profile_image && (
                                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center gap-1">
                                                                <Camera className="w-6 h-6 text-white" />
                                                                <span className="text-white text-[10px] font-black uppercase tracking-widest">Adjust</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </button>

                                                {uploadingImage && (
                                                    <div className="absolute inset-0 bg-black/60 rounded-[2.2rem] flex items-center justify-center z-20 backdrop-blur-[2px]">
                                                        <Loader2 className="w-8 h-8 animate-spin text-white" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-center">
                                                <p className="font-black text-lg text-gray-900 dark:text-white mb-1">
                                                    {imageType === 'photo' ? (user?.profile_image ? 'Personal Photo' : 'No photo uploaded') : (selectedAvatar ? selectedAvatar : 'Current avatar')}
                                                </p>
                                                <p className="text-xs text-gray-500 font-medium">
                                                    {imageType === 'photo'
                                                        ? 'Upload a real photo to help members identify you'
                                                        : (selectedAvatar ? `Seed: ${selectedAvatar}` : 'Selected AI character')}
                                                </p>
                                                {imageType === 'avatar' && selectedAvatar && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedAvatar(null)}
                                                        className="text-xs font-black text-red-500 hover:text-red-600 mt-2 transition-colors uppercase tracking-widest bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full"
                                                    >
                                                        Reset
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {imageType === 'photo' ? (
                                            <div className="space-y-3">
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    onChange={handlePhotoUpload}
                                                    accept="image/*"
                                                    className="hidden"
                                                />

                                                {/* Upload Toast */}
                                                <AnimatePresence>
                                                    {uploadToast && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: -8 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: -8 }}
                                                            className={`flex items-start gap-3 p-3 rounded-2xl text-sm font-medium ${uploadToast.type === 'error'
                                                                ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/50'
                                                                : 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800/50'
                                                                }`}
                                                        >
                                                            <div className="shrink-0 mt-0.5">
                                                                {uploadToast.type === 'error'
                                                                    ? <ImageOff className="w-4 h-4" />
                                                                    : <Check className="w-4 h-4" />
                                                                }
                                                            </div>
                                                            <p className="flex-1 text-xs leading-relaxed">{uploadToast.message}</p>
                                                            <div className="flex flex-col items-end gap-1 shrink-0">
                                                                {uploadToast.type === 'error' && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => fileInputRef.current?.click()}
                                                                        className="text-[10px] font-black uppercase tracking-widest text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                                                                    >
                                                                        Try Again
                                                                    </button>
                                                                )}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setUploadToast(null)}
                                                                    className="text-gray-400 hover:text-gray-600"
                                                                >
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>

                                                <Button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    disabled={uploadingImage}
                                                    className="w-full h-12 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white border-none text-sm font-bold flex items-center justify-center gap-2"
                                                >
                                                    <Camera className="w-4 h-4" />
                                                    {user?.profile_image ? 'Change Photo' : 'Upload New Photo'}
                                                </Button>
                                                <p className="text-[10px] text-center text-gray-400 font-medium">PNG, JPG or WebP · Max 10MB · Auto-compressed</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-6 gap-1">
                                                {DICEBEAR_AVATARS.map((avatar) => (
                                                    <button
                                                        key={avatar.seed}
                                                        type="button"
                                                        onClick={() => setSelectedAvatar(avatar.seed)}
                                                        title={avatar.seed}
                                                        className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all active:scale-90 ${selectedAvatar === avatar.seed
                                                            ? 'border-blue-500 shadow-lg shadow-blue-500/30 scale-105'
                                                            : 'border-transparent hover:border-gray-300 dark:hover:border-gray-500'
                                                            }`}
                                                    >
                                                        <img
                                                            src={dicebearUrl(avatar.seed, avatar.options)}
                                                            alt={avatar.seed}
                                                            className="w-full h-full object-cover"
                                                            loading="lazy"
                                                            decoding="async"
                                                        />
                                                        {selectedAvatar === avatar.seed && (
                                                            <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center">
                                                                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                                                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="border-t border-gray-100 dark:border-gray-700 pt-5 mb-5" />

                                    {error && (
                                        <div className="mb-4 p-3 sm:p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-700 dark:text-red-400 text-sm flex items-center gap-3">
                                            <AlertCircle className="w-4 h-4 shrink-0" />
                                            {error}
                                        </div>
                                    )}

                                    <form onSubmit={handleUpdateProfile} className="space-y-4 sm:space-y-5">
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Full Name</label>
                                            <input
                                                type="text" required
                                                value={editProfileData.full_name}
                                                onChange={(e) => setEditProfileData({ ...editProfileData, full_name: e.target.value })}
                                                className="w-full h-[54px] sm:h-[66px] px-4 sm:px-5 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-black dark:text-white transition-all font-bold"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
                                            <div className="space-y-1.5">
                                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Phone</label>
                                                <input
                                                    type="text"
                                                    value={editProfileData.phone_number}
                                                    onChange={(e) => setEditProfileData({ ...editProfileData, phone_number: e.target.value })}
                                                    className="w-full h-[54px] sm:h-[66px] px-4 sm:px-5 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-black dark:text-white transition-all font-bold"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Birth Date</label>
                                                <div className="relative group/date h-[54px] sm:h-[66px]">
                                                    {/* Visual Layer - Perfectly styled and consistent */}
                                                    <div className="absolute inset-0 flex items-center justify-between px-4 sm:px-5 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/5 transition-all font-bold">
                                                        <span className={editProfileData.date_of_birth ? "text-black dark:text-white text-sm" : "text-gray-400 text-sm"}>
                                                            {editProfileData.date_of_birth ? formatDate(editProfileData.date_of_birth) : "DD / MM / YYYY"}
                                                        </span>
                                                        <Calendar className="w-4 h-4 text-gray-400 group-hover/date:text-blue-500 transition-colors" />
                                                    </div>
                                                    {/* Functional Layer - Native input on top with opacity 0 to capture touch directly */}
                                                    <input
                                                        ref={dateInputRef}
                                                        type="date"
                                                        value={editProfileData.date_of_birth}
                                                        onChange={(e) => setEditProfileData({ ...editProfileData, date_of_birth: e.target.value })}
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5 col-span-1 sm:col-span-2">
                                            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Profession</label>
                                            <input
                                                type="text"
                                                value={editProfileData.profession}
                                                onChange={(e) => setEditProfileData({ ...editProfileData, profession: e.target.value })}
                                                className="w-full h-[54px] sm:h-[66px] px-4 sm:px-5 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-black dark:text-white transition-all font-bold"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Address</label>
                                            <textarea
                                                rows="2"
                                                value={editProfileData.address}
                                                onChange={(e) => setEditProfileData({ ...editProfileData, address: e.target.value })}
                                                className="w-full px-4 py-3 sm:px-5 sm:py-4 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-black dark:text-white transition-all font-bold resize-none"
                                            />
                                        </div>

                                        <div className="flex gap-3 pt-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setShowEditModal(false)}
                                                className="flex-1 py-3 rounded-xl sm:rounded-2xl font-bold h-12"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="flex-1 py-3 bg-black hover:bg-gray-900 text-white rounded-xl sm:rounded-2xl font-black h-12 shadow-lg shadow-black/10"
                                            >
                                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ─── Image Crop Modal ─── */}
            {
                cropSrc && (
                    <ImageCropModal
                        key={cropSrc}
                        imageSrc={cropSrc}
                        onConfirm={handleCropConfirm}
                        onCancel={() => setCropSrc(null)}
                        uploading={uploadingImage}
                        initialScale={cropInitial?.scale ?? null}
                        initialPos={cropInitial?.pos ?? null}
                        initialNaturalSize={cropInitial?.naturalSize ?? null}
                    />
                )
            }
        </>
    );
}
