import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlayerCard3D } from './PlayerCard3D';

export const PackOpeningOverlay = ({ isOpen, onComplete, players }) => {
    const [showingPlayer, setShowingPlayer] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                setShowingPlayer(true);
            }, 2000); // 2 second pack animation
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
                >
                    {!showingPlayer ? (
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="text-6xl font-black text-white"
                        >
                            PACK OPENING...
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                        >
                            {players.map((p, i) => (
                                <div key={i} className="transform hover:scale-105 transition-transform">
                                    {/* Using existing PlayerCard3D or need to implement a simple display */}
                                    <h3 className="text-white text-center font-bold mb-2">{p.name}</h3>
                                    <img src={p.image} alt={p.name} className="w-64 h-64 object-contain" />
                                </div>
                            ))}
                            <button 
                                onClick={onComplete}
                                className="mt-8 bg-[#48A111] text-black font-bold p-4 rounded-xl col-span-full"
                            >
                                Done
                            </button>
                        </motion.div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
};
