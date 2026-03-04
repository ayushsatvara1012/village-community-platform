import React from 'react';

/**
 * Reusable Skeleton Primitive
 * Uses a subtle shimmer animation with linear-gradient sweep.
 * Follows accessibility best practices with aria-busy and SR-only labels.
 */
const Skeleton = ({
    className = "",
    variant = "rect", // rect, circle, text
    width,
    height,
    borderRadius,
    ...props
}) => {
    const baseStyles = "relative overflow-hidden bg-gray-200 dark:bg-gray-700";

    // Animation overlay using linear-gradient sweep
    const shimmerOverlay = (
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-linear-to-r from-transparent via-white/20 dark:via-white/5 to-transparent shadow-[0_0_20px_20px_rgba(255,255,255,0.05)]" />
    );

    const variants = {
        rect: "rounded-md",
        circle: "rounded-full",
        text: "rounded h-4 w-full mb-2 last:mb-0"
    };

    const style = {
        width: width || undefined,
        height: height || undefined,
        borderRadius: borderRadius || undefined,
    };

    return (
        <div
            className={`${baseStyles} ${variants[variant]} ${className}`}
            style={style}
            aria-hidden="true"
            {...props}
        >
            {shimmerOverlay}
        </div>
    );
};

export default Skeleton;

/**
 * Keyframes for the shimmer effect. 
 * Add this to your index.css or tailwind.config.js if using raw tailwind.
 * 
 * @keyframes shimmer {
 *   100% { transform: translateX(100%); }
 * }
 */
