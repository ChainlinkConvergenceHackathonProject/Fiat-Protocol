import { motion, AnimatePresence } from 'motion/react';
import { X, Construction } from 'lucide-react';

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
}

export function ComingSoonModal({ isOpen, onClose, feature }: ComingSoonModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white w-full max-w-sm rounded-2xl shadow-xl p-6 border border-gray-100 text-center"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-500">
              <Construction className="w-8 h-8" />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">{feature}</h3>
            <p className="text-gray-500">
              This feature is currently under development. Check back soon!
            </p>
            
            <button
              onClick={onClose}
              className="mt-6 w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors"
            >
              Got it
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
