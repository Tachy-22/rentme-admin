"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./button";
import {
  HousePlug,
  Menu,
  X,
  Home,
  Search,
  Building2,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";
// import { removeAuthToken } from "@/lib/utils";
// import { signOut } from "@/actions/auth";
// import { useAuth } from "@/hooks/useAuth";
// import { Skeleton } from "./skeleton";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "./tooltip";
// import { useSelector } from "react-redux";
// import { RootState } from "@/lib/redux/store";
// import { Avatar, AvatarImage, AvatarFallback } from "./avatar";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "./dropdown-menu";

export function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const {
    isAuthenticated,
    loading: isAuthStatusLoading,
    removeAdminSession,
  } = useAuth();

  // const { user } = useSelector((state: RootState) => state.userSlice);

  // const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      removeAdminSession();
      removeAuthToken();
      setIsMobileMenuOpen(false);
      router.push("/");
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleProfileClick = () => {
    if (user?.id) {
      router.push(`/${user.id}/dashboard`);
      setIsMobileMenuOpen(false);
    }
  };

  const menuItems = [
    {
      name: "dashboard",
      href: "/dashboard",
      icon: Home,
      showAlways: true,
    },
    {
      name: "Upload",
      href: "/upload",
      icon: Building2,
      showAlways: true,
      badge: 2, // You can make this dynamic based on unread messages
    },
    
  ];

  // Only show items that should always be shown or when authenticated
  const visibleMenuItems = menuItems.filter(
    (item) => item.showAlways || isAuthenticated
  );

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="flex fixed top-0 w-full z-[30] bg-blue-950/95 backdrop-blur-sm shadow-lg">
        {/* Mobile menu button */}
        <div className="flex md:hidden w-full items-center justify-between px-6 h-16">
          <Link
            href="/"
            className="text-2xl font-bold text-white flex items-center gap-2  transition-transform"
          >
            <HousePlug className="h-6 w-6" /> RentMe
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(true)}
            className="text-white hover:text-white hover:bg-white/20"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>

        {/* Desktop menu */}
        <div className="relative w-full md:flex mx-auto px-6 h-16 hidden items-center justify-between">
          <Link
            href="/"
            className="text-2xl font-bold text-white flex items-center gap-2  transition-transform"
          >
            <HousePlug className="h-6 w-6" /> RentMe
          </Link>

          <div className="flex items-center gap-2">
            {isAuthStatusLoading ? (
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton
                    key={i}
                    className="h-9 w-9 rounded-full bg-white/20"
                  />
                ))}
              </div>
            ) : (
              <TooltipProvider>
                <div className="flex items-center gap-1 z-[5000]">
                  {visibleMenuItems.map((item) => (
                    <Tooltip key={item.name}>
                      <TooltipTrigger asChild>
                        <Button
                          variant={
                            pathname === item.href ? "secondary" : "ghost"
                          }
                          size="icon"
                          className={` ${
                            pathname === item.href
                              ? "text-blue-950"
                              : "!text-white"
                          } relative   hover:bg-white/20   `}
                          onClick={() => router.push(item.href)}
                        >
                          <item.icon className="h-5 w-5" />
                          {item.badge && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                              {item.badge}
                            </span>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{item.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}

                  {isAuthenticated && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="flex items-center gap-2 hover:bg-white/0 hover:text-white text-white p-2"
                        >
                          <Avatar className="h-8 w-8 text-black">
                            <AvatarImage src={user?.image} alt={user?.name} />
                            <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{user?.name}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleProfileClick}>
                          Dashboard
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={handleSignOut}
                          disabled={isSigningOut}
                        >
                          {isSigningOut ? "Signing out..." : "Sign Out"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}

                  {!isAuthenticated && (
                    <Button
                      variant="default"
                      className="bg-white text-blue-950 hover:bg-white/90 ml-2"
                      onClick={() => router.push("/login")}
                    >
                      Sign In
                    </Button>
                  )}
                </div>
              </TooltipProvider>
            )}

            {/* Remove the separate sign out button since it's now in the dropdown */}
          </div>
        </div>

        {/* Mobile menu overlay and content */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 h-screen bg-[#172554]/90 backdrop-blur-md z-[100] md:hidden"
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed right-0 top-0 bottom-0 w-[80%] max-w-sm h-screen  bg-[#172554] z-[100] shadow-2xl"
              >
                <div className="p-6 flex h-fit items-center justify-between border-b border-white bg-white text-black">
                  <span className=" text-xl font-bold">Menu</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="hover:bg-white/10 t"
                  >
                    <X className="h-6 w-6" />
                  </Button>
                </div>

                <div className="py-6 bg-white text-black h-full">
                  {isAuthStatusLoading ? (
                    <div className="space-y-4 px-6">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-12 w-full bg-white/10" />
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white text-black h-full">
                      {isAuthenticated && (
                        <div
                          className="flex items-center gap-3 px-6 py-4 hover:bg-black/5 cursor-pointer"
                          onClick={handleProfileClick}
                        >
                          <Avatar className="h-12 w-12 text-black">
                            <AvatarImage src={user?.image} alt={user?.name} />
                            <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <h3 className="font-medium leading-none">
                              {user?.name}
                            </h3>
                          </div>
                        </div>
                      )}
                      {menuItems.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`flex items-center px-6 py-3 text-black hover:text-black hover:bg-black/10 transition-colors ${
                            pathname === item.href
                              ? "bg-black/5 font-medium"
                              : ""
                          }`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <item.icon className="h-5 w-5 mr-3" />
                          {item.name}
                        </Link>
                      ))}
                      <hr className="my-4 border-white/10 mx-6" />
                      {isAuthenticated ? (
                        <Button
                          variant="outline"
                          className="w-[calc(100%-48px)] mx-6 text-black  hover:bg-black/10 bg-white hover:text-black"
                          onClick={() => {
                            // setIsMobileMenuOpen(false);
                            handleSignOut();
                          }}
                          disabled={isSigningOut}
                        >
                          {isSigningOut ? "Signing out..." : "Sign Out"}
                        </Button>
                      ) : (
                        <Button
                          variant="default"
                          className="w-[calc(100%-48px)] mx-6 bg-black text-white hover:bg-black/90"
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            router.push("/login");
                          }}
                        >
                          Sign In
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
