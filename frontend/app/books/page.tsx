'use client';

import { useState, useEffect } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  total_copies: number;
  available_copies: number;
}

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State to track if we are editing a book
  const [editingBookId, setEditingBookId] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    total_copies: 1,
    // We track available_copies separately during edit to calculate difference
    available_copies: 1 
  });

  // Fetch Books on Load
  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response: any = await api.get('/books/');
      const bookList = response.data?.results || response.data || [];
      setBooks(bookList);
    } catch (error) {
      console.error('Failed to fetch books:', error);
      toast.error('Could not load books');
    } finally {
      setIsLoading(false);
    }
  };

  // Populate form for editing
  const handleEditClick = (book: Book) => {
    setEditingBookId(book.id);
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      total_copies: book.total_copies,
      available_copies: book.available_copies
    });
    // Scroll to top to see form
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast('Editing mode activated', { icon: '✏️' });
};

  // Cancel Edit Mode
  const handleCancelEdit = () => {
    setEditingBookId(null);
    setFormData({ title: '', author: '', isbn: '', total_copies: 1, available_copies: 1 });
  };

  // Handle Form Submit (Create OR Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading('Saving book...');
    try {
      if (editingBookId) {
        // Calculate difference in total copies to adjust availability
        const oldBook = books.find(b => b.id === editingBookId);
        let newAvailable = formData.available_copies;
        
        if (oldBook) {
            const diff = formData.total_copies - oldBook.total_copies;
            newAvailable = oldBook.available_copies + diff;
        }

        await api.put(`/books/${editingBookId}/`, {
          title: formData.title,
          author: formData.author,
          isbn: formData.isbn,
          total_copies: formData.total_copies,
          available_copies: newAvailable
        });
        toast.success('Book updated successfully!', { id: toastId });
      } else {
        // --- CREATE MODE (POST) ---
        await api.post('/books/', {
          ...formData,
          available_copies: formData.total_copies 
        });
        toast.success('Book added successfully!', { id: toastId });
      }
      
      // Reset and Refresh
      handleCancelEdit(); // Clears form
      fetchBooks();
      
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to save book', { id: toastId });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Book Inventory</h1>

      {/* --- Add / Edit Form --- */}
      <div className={`p-6 rounded-lg shadow-md mb-8 border transition-colors duration-200 ${editingBookId ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-100'}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-xl font-semibold ${editingBookId ? 'text-yellow-700' : 'text-blue-600'}`}>
            {editingBookId ? 'Edit Book Details' : 'Add New Book'}
          </h2>
          {editingBookId && (
            <button onClick={handleCancelEdit} className="text-sm text-gray-500 underline hover:text-gray-700">
              Cancel Editing
            </button>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
            <input
              type="text"
              required
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ISBN</label>
            <input
              type="text"
              required
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={formData.isbn}
              onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
            />
          </div>
          <div className="w-24">
             <label className="block text-sm font-medium text-gray-700 mb-1">Total Copies</label>
             <input
              type="number"
              min="0"
              required
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={formData.total_copies}
              onChange={(e) => setFormData({ ...formData, total_copies: parseInt(e.target.value) || 0 })}
            />
          </div>
          <button
            type="submit"
            className={`px-4 py-2 rounded transition-colors h-10 font-medium text-white ${editingBookId ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {editingBookId ? 'Update Book' : 'Add Book'}
          </button>
        </form>
      </div>

      {/* --- Books Table --- */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title / ISBN</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inventory</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr><td colSpan={5} className="text-center py-4">Loading books...</td></tr>
            ) : books.length === 0 ? (
               <tr><td colSpan={5} className="text-center py-4 text-gray-500">No books found. Add one above!</td></tr>
            ) : (
              books.map((book) => (
                <tr key={book.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{book.title}</div>
                    <div className="text-sm text-gray-500">{book.isbn}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{book.author}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      book.available_copies > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {book.available_copies > 0 ? 'Available' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {book.available_copies} / {book.total_copies}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <button 
                      onClick={() => handleEditClick(book)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}