import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import api, { BASE_URL } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Edit, Trash2, Send, User } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Loader from "@/components/Loader";
import noBookImage from "@/assets/no-book-image.png";

interface Book {
  id: string;
  title: string;
  author: string;
  condition: string;
  description: string;
  image?: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
}

const BookDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const { data } = await api.get(`/books/${id}`);
        setBook(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load book details",
          variant: "destructive",
        });
        navigate("/books");
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id, navigate, toast]);

  const handleDelete = async () => {
    try {
      await api.delete(`/books/${id}`);
      toast({
        title: "Book deleted",
        description: "Your book has been removed",
      });
      navigate("/profile");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete book",
        variant: "destructive",
      });
    }
  };

  const handleRequest = async () => {
    try {
      await api.post(`/books/${id}/request`);
      toast({
        title: "Request sent",
        description: "Your book request has been sent to the owner",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to send request",
        variant: "destructive",
      });
    }
  };

  if (loading) return <Loader />;
  if (!book) return null;

  const isOwner = user?.id === book.owner.id;

  return (
    <div className="min-h-screen bg-secondary">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <Card>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <img
                  src={book.image ? `${BASE_URL}${book.image}` : noBookImage}
                  alt={book.title}
                  className="w-full rounded-lg shadow-md"
                  onError={(e) => {
                    e.currentTarget.src = noBookImage;
                  }}
                />
              </div>

              <div className="space-y-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
                  <p className="text-lg text-muted-foreground">by {book.author}</p>
                </div>

                <div>
                  <span className="inline-block px-3 py-1 bg-accent text-accent-foreground rounded-md">
                    {book.condition}
                  </span>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground">{book.description}</p>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Owner
                  </h3>
                  <p className="text-muted-foreground">{book.owner.name}</p>
                  <p className="text-sm text-muted-foreground">{book.owner.email}</p>
                </div>

                <div className="flex gap-3 pt-4">
                  {isOwner ? (
                    <>
                      <Link to={`/books/${id}/edit`} className="flex-1">
                        <Button className="w-full gap-2">
                          <Edit className="w-4 h-4" />
                          Edit
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" className="flex-1 gap-2">
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this book?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete your book listing.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  ) : (
                    <Button onClick={handleRequest} className="w-full gap-2">
                      <Send className="w-4 h-4" />
                      Request This Book
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookDetail;
