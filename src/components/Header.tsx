import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "react-redux";
import { authSelector, logout } from "@/redux/reducers";
import useClickOutside from "@/hooks/useClickOutside";

const mainDropdownMenuItems = [
  { id: "login", label: "Login", type: "button" as const },
  { id: "settings", label: "Settings", href: "#" },
  { id: "my-chats", label: "My Chats", href: "/chat" },
  { id: "subscription", label: "Manage Subscription", href: "#" },
  { id: "about", label: "About", href: "#" },
  { id: "contact", label: "Contact", href: "#" },
  { id: "terms", label: "Terms of service", href: "#" },
];

const headerNavLinks = [
  { id: "chat-link", label: "Chat", href: "/chat" },
  { id: "blogs-link", label: "Blogs", href: "/" },
  {
    id: "practicalities-link",
    label: "Practicalities",
    href: "/practicalities",
  },
];

export default function Header() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const router = useRouter();
  const { loggedIn } = useSelector(authSelector);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const userMenuButtonRef = useRef<HTMLButtonElement>(null);

  const dispatch = useDispatch();

  useClickOutside(userMenuRef, (event) => {
    if (
      userMenuButtonRef.current &&
      !userMenuButtonRef.current.contains(event.target as Node)
    ) {
      setIsUserMenuOpen(false);
    }
  });

  const handleSignIn = () => {
    router.push("/login");
    setIsUserMenuOpen(false);
  };

  const handleSignOut = useCallback(() => {
    dispatch(logout());
    setIsUserMenuOpen(false);
  }, []);

  let currentDropdownMenuItems = [...mainDropdownMenuItems];
  if (loggedIn) {
    currentDropdownMenuItems = currentDropdownMenuItems.filter(
      (item) => item.id !== "login"
    );
    currentDropdownMenuItems.unshift({
      id: "profile",
      label: "Profile",
      href: "#",
    });
    currentDropdownMenuItems.push({
      id: "signout",
      label: "Sign Out",
      type: "button" as const,
    });
  } else {
    currentDropdownMenuItems = currentDropdownMenuItems.filter(
      (item) => item.id !== "signout" && item.id !== "profile"
    );
  }

  const renderDropdownItems = () => {
    const commonClasses =
      "block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left cursor-pointer";
    return currentDropdownMenuItems.map((item) => {
      if (item.type === "button") {
        if (item.id === "login") {
          return (
            <button
              key={item.id}
              onClick={handleSignIn}
              className={commonClasses}
            >
              {item.label}
            </button>
          );
        }
        if (item.id === "signout") {
          return (
            <button
              key={item.id}
              onClick={handleSignOut}
              className={commonClasses}
            >
              {item.label}
            </button>
          );
        }
      }
      return (
        <Link href={item.href!} key={item.id} legacyBehavior>
          <a className={commonClasses} onClick={() => setIsUserMenuOpen(false)}>
            {item.label}
          </a>
        </Link>
      );
    });
  };

  return (
    <header className="bg-gray-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex ">
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold">
              L
            </div>

            <span className="text-xl font-bold">Logo</span>
          </Link>

          <nav className="flex items-center space-x-6 ml-10">
            {headerNavLinks.map((link) => (
              <Link href={link.href} key={link.id} legacyBehavior>
                <a className="hover:text-gray-300 cursor-pointer">
                  {link.label}
                </a>
              </Link>
            ))}
          </nav>
        </div>
        <div className="relative">
          <button
            ref={userMenuButtonRef}
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-1.5 px-3 rounded-full flex items-center space-x-2 focus:outline-none cursor-pointer shadow"
            aria-expanded={isUserMenuOpen}
            aria-haspopup="true"
            aria-label="User menu"
          >
            {loggedIn ? (
              <svg
                className="w-6 h-6 text-gray-300"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
            )}
          </button>

          {isUserMenuOpen && (
            <div
              ref={userMenuRef}
              className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-xl py-1 z-20 border border-gray-200 text-gray-800 origin-top-right"
            >
              {renderDropdownItems()}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
