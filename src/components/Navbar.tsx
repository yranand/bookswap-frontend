import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { BookOpen, User, LogOut, FileText, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    toast({
      title: "Logged out successfully",
      description: "See you soon!",
    });
    navigate("/", { replace: true });
  };

  return (
    <nav className="bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary hover:opacity-80 transition-opacity">
            <BookOpen className="w-6 h-6" />
            BookSwap
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link to="/dashboard">
                  <Button
                    variant={isActive("/dashboard") ? "default" : "ghost"}
                    size="sm"
                    className="gap-2"
                  >
                    <Home className="w-4 h-4" />
                    Dashboard
                  </Button>
                </Link>
                <Link to="/books">
                  <Button
                    variant={isActive("/books") ? "default" : "ghost"}
                    size="sm"
                    className="gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    Browse Books
                  </Button>
                </Link>
                <Link to="/profile">
                  <Button
                    variant={isActive("/profile") ? "default" : "ghost"}
                    size="sm"
                    className="gap-2"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
