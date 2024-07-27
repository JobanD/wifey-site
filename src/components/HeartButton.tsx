import Link from "next/link";

interface HeartButtonProps {
  color: string;
  href: string;
  children: React.ReactNode;
}

const HeartButton: React.FC<HeartButtonProps> = ({ color, href, children }) => (
  <Link href={href} className="block w-32 h-32 relative group">
    <svg
      viewBox="0 0 24 24"
      className={`w-full h-full ${color} animate-[heartbeat_1.5s_ease-in-out_infinite] hover:animate-none hover:scale-110 transition-transform duration-600`}
    >
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        fill="currentColor"
      />
    </svg>
    <span className="absolute inset-0 flex items-center justify-center text-white font-bold z-10">
      {children}
    </span>
  </Link>
);

export default HeartButton;
