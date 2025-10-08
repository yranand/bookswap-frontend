import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import api, { BASE_URL } from "@/services/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, BookOpen, Plus } from "lucide-react";
import Loader from "@/components/Loader";
import noBookImage from "@/assets/no-book-image.png";

interface Book {
  id: string;
  title: string;
  author: string;
  condition: string;
  image?: string;
}

const Profile = () => {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserBooks = async () => {
      try {
        const { data } = await api.get("/books?owner=me");
        setBooks(data);
      } catch (error) {
        console.error("Failed to fetch user books:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserBooks();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-secondary">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <User className="w-6 h-6 text-primary" />
              Profile
            </CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-medium">Name:</span> {user?.name}
            </div>
            <div>
              <span className="font-medium">Email:</span> {user?.email}
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            My Books ({books.length})
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
                    <h3 className="font-semibold text-lg mb-1 truncate">{book.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">by {book.author}</p>
                    <span className="inline-block px-2 py-1 text-xs bg-accent text-accent-foreground rounded">
                      {book.condition}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
