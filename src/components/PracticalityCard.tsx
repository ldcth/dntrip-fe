import Image from "next/image";

export default function PracticalityCard({
  title,
  icon,
  description,
  onClick,
}: {
  title: string;
  icon: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <div
      className="bg-white rounded overflow-hidden shadow-md hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer h-full flex flex-col"
      onClick={onClick}
    >
      <div className="relative h-48 bg-[#a8c9d8] flex justify-center items-center">
        <Image
          src={icon || "/placeholder.svg?height=100&width=100"}
          alt={title}
          width={100}
          height={100}
          className="w-full h-full object-contain"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-red-700 text-white py-2 px-3 text-center">
          <h3 className="m-0 text-sm font-semibold">{title}</h3>
        </div>
      </div>
      <div className="p-4 flex-grow border border-gray-200 border-t-0">
        <p className="m-0 text-sm text-gray-700 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
