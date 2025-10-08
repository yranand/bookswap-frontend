import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/services/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { FileText, Check, X, Trash2 } from "lucide-react";
import Loader from "@/components/Loader";
import noBookImage from "@/assets/no-book-image.png";

interface Request {
  id: string;
  status: string;
  createdAt: string;
  book: {
    id: string;
    title: string;
    author: string;
    image?: string;
  };
  requester: {
    name: string;
    email: string;
  };
}

const Requests = () => {
  const [incomingRequests, setIncomingRequests] = useState<Request[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRequests = async () => {
    try {
      const { data } = await api.get("/requests");
      setIncomingRequests(data.incoming || []);
      setOutgoingRequests(data.outgoing || []);
    } catch (error) {
      console.error("Failed to fetch requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAccept = async (requestId: string) => {
    try {
      await api.patch(`/requests/${requestId}`, { status: "accepted" });
      toast({
        title: "Request accepted",
        description: "You've accepted this book request",
      });
      fetchRequests();
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
      fetchRequests();
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
      fetchRequests();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel request",
        variant: "destructive",
      });
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-secondary">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
            <FileText className="w-8 h-8 text-primary" />
            Book Requests
          </h1>
          <p className="text-muted-foreground">
            Manage your incoming and outgoing book swap requests
          </p>
        </div>

        <Tabs defaultValue="incoming" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="incoming">
              Incoming ({incomingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="outgoing">
              Outgoing ({outgoingRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="incoming">
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
                        <Link to={`/books/${request.book.id}`} className="shrink-0">
                          <img
                            src={request.book.image || noBookImage}
                            alt={request.book.title}
                            className="w-32 h-32 object-cover rounded-md"
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
                            <p className="text-muted-foreground">by {request.book.author}</p>
                          </div>
                          <div>
                            <p className="text-sm">
                              <span className="font-medium">Requested by:</span> {request.requester.name}
                            </p>
                            <p className="text-sm text-muted-foreground">{request.requester.email}</p>
                          </div>
                          <div>
                            <span className={`inline-block px-3 py-1 text-xs rounded ${
                              request.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : request.status === "accepted"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}>
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
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
            {outgoingRequests.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg text-muted-foreground">
                    No outgoing requests yet
                  </p>
                  <Link to="/books">
                    <Button className="mt-4">Browse Books</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {outgoingRequests.map((request) => (
                  <Card key={request.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        <Link to={`/books/${request.book.id}`} className="shrink-0">
                          <img
                            src={request.book.image || noBookImage}
                            alt={request.book.title}
                            className="w-32 h-32 object-cover rounded-md"
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
                            <p className="text-muted-foreground">by {request.book.author}</p>
                          </div>
                          <div>
                            <span className={`inline-block px-3 py-1 text-xs rounded ${
                              request.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : request.status === "accepted"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}>
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
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

export default Requests;
