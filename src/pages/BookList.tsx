import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { BASE_URL } from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, BookOpen } from "lucide-react";
import Loader from "@/components/Loader";
import noBookImage from "@/assets/no-book-image.png";
import booksHero from "@/assets/books-hero.jpg";

interface Book {
  id: string;
  title: string;
  author: string;
  condition: string;
  image?: string;
  owner: {
    name: string;
  };
}

const BookList = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const { data } = await api.get("/books");
        setBooks(data);
        setFilteredBooks(data);
      } catch (error) {
        console.error("Failed to fetch books:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  useEffect(() => {
    const filtered = books.filter(
      (book) =>
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredBooks(filtered);
  }, [searchQuery, books]);

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-secondary">
      {/* Hero Section */}
      <div className="relative h-64 bg-gradient-to-r from-primary/20 to-primary/5 overflow-hidden">
        <img
          src={booksHero}
          alt="Books library"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Discover Books
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Browse our community's collection and find your next great read
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by title or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            {filteredBooks.length} {filteredBooks.length === 1 ? "book" : "books"} available
          </p>
        </div>

        {/* Books Grid */}
        {filteredBooks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg text-muted-foreground">
                {searchQuery ? "No books found matching your search" : "No books available"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBooks.map((book) => (
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
                    <div className="flex items-center justify-between">
                      <span className="inline-block px-2 py-1 text-xs bg-accent text-accent-foreground rounded">
                        {book.condition}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Owner: {book.owner.name}
                      </span>
                    </div>
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

export default BookList;
