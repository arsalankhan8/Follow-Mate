import { useEffect } from "react";
import { useModal } from "../context/ModalContext.jsx";

export default function AppModal() {
  const { isOpen, modalContent, closeModal } = useModal();

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "");
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={closeModal}
    >
      {/* Modal container */}
      <div
        className="relative w-full max-w-[40vw] h-[70vh] 
                   rounded-lg bg-white shadow-xl 
                   overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={closeModal}
          className="absolute right-4 top-4 z-10 text-gray-500 hover:text-gray-800"
        >
          ✕
        </button>

        {/* Scrollable content */}
        <div className="h-full overflow-y-auto p-6">
          {modalContent}
        </div>
      </div>
    </div>
  );
}
