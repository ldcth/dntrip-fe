import { MouseEventHandler, useEffect, useRef } from "react";
import Image from "next/image";
import { X } from "lucide-react";

export default function InfoModal({
  title,
  icon,
  content,
  onClose,
}: {
  title: string;
  icon: string;
  content: string;
  onClose: () => void;
}) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscKey);

    return () => {
      document.body.style.overflow = "unset";
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [onClose]);

  const handleBackdropClick = (e: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4"
      onClick={
        handleBackdropClick as unknown as MouseEventHandler<HTMLDivElement>
      }
    >
      <div
        className="bg-white w-full max-w-3xl max-h-[90vh] rounded overflow-hidden flex flex-col"
        ref={modalRef}
      >
        <div className="relative bg-[#a8c9d8] p-8 flex justify-center items-center">
          <Image
            src={icon || "/placeholder.svg?height=120&width=120"}
            alt={title}
            width={120}
            height={120}
            className="w-28 h-28 object-contain"
          />
          <button
            className="absolute top-2 right-2 bg-red-700 hover:bg-red-800 text-white border-none w-10 h-10 rounded flex items-center justify-center cursor-pointer transition-colors"
            onClick={onClose}
          >
            <X size={24} />
            <span className="sr-only">Close</span>
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          <div>
            {content.includes("<") && content.includes(">")
              ? content
                  .split("\n")
                  .map((paragraph, index) => (
                    <p
                      key={index}
                      dangerouslySetInnerHTML={{ __html: paragraph }}
                      className="text-gray-700"
                    />
                  ))
              : content.split("\n").map((paragraph, index) => (
                  <p
                    key={index}
                    className="mb-4 leading-relaxed text-gray-700 last:mb-0"
                  >
                    {paragraph}
                  </p>
                ))}
            {/* {content.split("\n").map((paragraph, index) => {
              return (
                <p
                  key={index}
                  className="mb-4 leading-relaxed text-gray-700 last:mb-0"
                >
                  {paragraph}
                </p>
              );
            })} */}
          </div>
        </div>
      </div>
    </div>
  );
}
