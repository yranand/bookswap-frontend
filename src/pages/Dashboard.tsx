import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import api, { BASE_URL } from "@/services/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { User, BookOpen, Plus, FileText, Check, X, Trash2 } from "lucide-react";
import Loader from "@/components/Loader";
import noBookImage from "@/assets/no-book-image.png";

interface Book {
  id: string;
  title: string;
  author: string;
  condition: string;
  image?: string;
}

interface Request {
  id: string;
  status: string;
  createdAt: string;
  book: { id: string; title: string; author: string; image?: string };
  requester: { name: string; email: string };
}

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<Request[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate(); // Add navigate

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", { replace: true });
    }
  }, [user, authLoading, navigate]);

  const fetchData = async () => {
    if (!user) return; // Prevent fetching if user is not authenticated
    try {
      const [booksRes, requestsRes] = await Promise.all([
        api.get("/books?owner=me"),
        api.get("/requests"),
      ]);
      setBooks(booksRes.data);
      setIncomingRequests(requestsRes.data.incoming || []);
      setOutgoingRequests(requestsRes.data.outgoing || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleAccept = async (requestId: string) => {
    try {
      await api.patch(`/requests/${requestId}`, { status: "accepted" });
      toast({
        title: "Request accepted",
        description: "You've accepted this book request",
      });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept request",
        variant: "destructive",
      });
    }
  };

  const handleDecline = async (requestId: string) => {
    try {
      await api.patch(`/requests/${requestId}`, { status: "declined" });
      toast({
        title: "Request declined",
        description: "You've declined this book request",
      });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to decline request",
        variant: "destructive",
      });
    }
  };

  const handleCancel = async (requestId: string) => {
    try {
      await api.delete(`/requests/${requestId}`);
      toast({
        title: "Request cancelled",
        description: "Your request has been cancelled",
      });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel request",
        variant: "destructive",
      });
    }
  };

  if (authLoading || loading) return <Loader />;

  return (
    <div className="min-h-screen bg-secondary">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <User className="w-6 h-6 text-primary" />
              Welcome, {user?.name}!
            </CardTitle>
            <CardDescription>{user?.email}</CardDescription>
          </CardHeader>
        </Card>
        <Tabs defaultValue="books" className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-3 mb-6">
            <TabsTrigger value="books">My Books ({books.length})</TabsTrigger>
            <TabsTrigger value="incoming">
              Incoming ({incomingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="outgoing">
              Outgoing ({outgoingRequests.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="books">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-primary" />
                My Books
              </h2>
              <Link to="/books/add">
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Book
                </Button>
              </Link>
            </div>
            {books.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg text-muted-foreground mb-4">
                    You haven't added any books yet
                  </p>
                  <Link to="/books/add">
                    <Button>Add Your First Book</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {books.map((book) => (
                  <Link key={book.id} to={`/books/${book.id}`}>
                    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <img
                          src={
                            book.image
                              ? `${BASE_URL}${book.image}`
                              : noBookImage
                          }
                          alt={book.title}
                          className="w-full h-48 object-cover rounded-md mb-3"
                          onError={(e) => {
                            e.currentTarget.src = noBookImage;
                          }}
                        />
                        <h3 className="font-semibold text-lg mb-1 truncate">
                          {book.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          by {book.author}
                        </p>
                        <span className="inline-block px-2 py-1 text-xs bg-accent text-accent-foreground rounded">
                          {book.condition}
                        </span>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="incoming">
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
              <FileText className="w-6 h-6 text-primary" />
              Incoming Requests
            </h2>
            {incomingRequests.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg text-muted-foreground">
                    No incoming requests yet
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {incomingRequests.map((request) => (
                  <Card key={request.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        <Link
                          to={`/books/${request.book.id}`}
                          className="shrink-0"
                        >
                          <img
                            src={
                              request.book.image
                                ? `${BASE_URL}${request.book.image}`
                                : noBookImage
                            }
                            alt={request.book.title}
                            className="w-32 h-32 object-cover rounded-md"
                            onError={(e) => {
                              e.currentTarget.src = noBookImage;
                            }}
                          />
                        </Link>
                        <div className="flex-1 space-y-3">
                          <div>
                            <Link
                              to={`/books/${request.book.id}`}
                              className="text-xl font-semibold hover:text-primary transition-colors"
                            >
                              {request.book.title}
                            </Link>
                            <p className="text-muted-foreground">
                              by {request.book.author}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm">
                              <span className="font-medium">Requested by:</span>{" "}
                              {request.requester.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {request.requester.email}
                            </p>
                          </div>
                          <div>
                            <span
                              className={`inline-block px-3 py-1 text-xs rounded ${
                                request.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : request.status === "accepted"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {request.status.charAt(0).toUpperCase() +
                                request.status.slice(1)}
                            </span>
                          </div>
                          {request.status === "pending" && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleAccept(request.id)}
                                className="gap-2"
                              >
                                <Check className="w-4 h-4" />
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDecline(request.id)}
                                className="gap-2"
                              >
                                <X className="w-4 h-4" />
                                Decline
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="outgoing">
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
              <FileText className="w-6 h-6 text-primary" />
              Outgoing Requests
            </h2>
            {outgoingRequests.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg text-muted-foreground mb-4">
                    No outgoing requests yet
                  </p>
                  <Link to="/books">
                    <Button>Browse Books</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {outgoingRequests.map((request) => (
                  <Card key={request.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        <Link
                          to={`/books/${request.book.id}`}
                          className="shrink-0"
                        >
                          <img
                            src={
                              request.book.image
                                ? `${BASE_URL}${request.book.image}`
                                : noBookImage
                            }
                            alt={request.book.title}
                            className="w-32 h-32 object-cover rounded-md"
                            onError={(e) => {
                              e.currentTarget.src = noBookImage;
                            }}
                          />
                        </Link>
                        <div className="flex-1 space-y-3">
                          <div>
                            <Link
                              to={`/books/${request.book.id}`}
                              className="text-xl font-semibold hover:text-primary transition-colors"
                            >
                              {request.book.title}
                            </Link>
                            <p className="text-muted-foreground">
                              by {request.book.author}
                            </p>
                          </div>
                          <div>
                            <span
                              className={`inline-block px-3 py-1 text-xs rounded ${
                                request.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : request.status === "accepted"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {request.status.charAt(0).toUpperCase() +
                                request.status.slice(1)}
                            </span>
                          </div>
                          {request.status === "pending" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCancel(request.id)}
                              className="gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Cancel Request
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
