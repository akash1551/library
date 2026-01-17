'use client';

import { useState, useEffect } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

interface Borrowing {
  id: number;
  book_title: string;
  member_name: string;
  borrow_date: string;
  return_date: string | null;
  status: 'ACTIVE' | 'RETURNED';
}

interface Option {
  id: number;
  label: string;
}

export default function BorrowingsPage() {
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [books, setBooks] = useState<Option[]>([]);
  const [members, setMembers] = useState<Option[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Search Filters ---
  const [viewFilter, setViewFilter] = useState<'ACTIVE' | 'ALL'>('ACTIVE');
  const [filterMemberId, setFilterMemberId] = useState<string>('');
  const [filterBookId, setFilterBookId] = useState<string>('');

  // --- Checkout Form State ---
  const [selectedBook, setSelectedBook] = useState<string>('');
  const [selectedMember, setSelectedMember] = useState<string>('');

  // Reload data whenever any filter changes
  useEffect(() => {
    fetchData();
  }, [viewFilter, filterMemberId, filterBookId]);

const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Build Query Params for the List
      const params = new URLSearchParams();
      if (viewFilter === 'ACTIVE') params.append('status', 'ACTIVE');
      if (filterMemberId) params.append('member_id', filterMemberId);
      if (filterBookId) params.append('book_id', filterBookId);

      const borrowRes: any = await api.get(`/borrowings/?${params.toString()}`);
      setBorrowings(borrowRes.data?.results || borrowRes.data || []);

      // 2. ALWAYS Fetch Books to get latest "Available Copies"
      const booksRes: any = await api.get('/books/');
      setBooks((booksRes.data?.results || booksRes.data || []).map((b: any) => ({
        id: b.id,
        label: `${b.title} (Available: ${b.available_copies})` 
      })));

      // 3. Fetch Members (Only needed once if empty, as names rarely change)
      if (members.length === 0) {
        const membersRes: any = await api.get('/members/');
        setMembers((membersRes.data?.results || membersRes.data || []).map((m: any) => ({
          id: m.id,
          label: `${m.first_name} ${m.last_name}`
        })));
      }

    } catch (error) {
      console.error(error);
      toast.error('Could not load circulation data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBorrow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook || !selectedMember) {
      toast.error('Please select both a book and a member');
      return;
    }
    const toastId = toast.loading('Processing checkout...');
    try {
      await api.post('/borrowings/', { book: selectedBook, member: selectedMember });
      toast.success('Book checked out!', { id: toastId });
      setSelectedBook('');
      setSelectedMember('');
      fetchData(); // Refresh list to update inventory counts
    } catch (error: any) {
      const msg = error.errors?.book?.[0] || error.errors?.non_field_errors?.[0] || 'Checkout failed';
      toast.error(msg, { id: toastId });
    }
  };

  const handleReturn = async (borrowingId: number) => {
    const toastId = toast.loading('Returning book...');
    try {
      await api.post(`/borrowings/${borrowingId}/return_book/`);
      toast.success('Book returned!', { id: toastId });
      fetchData(); // Refresh list
    } catch (error) {
      toast.error('Failed to return book', { id: toastId });
    }
  };

  // Helper to clear filters
  const clearFilters = () => {
    setFilterMemberId('');
    setFilterBookId('');
    setViewFilter('ACTIVE');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Circulation Desk</h1>

      {/* --- Checkout Section --- */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-purple-100">
        <h2 className="text-xl font-semibold mb-4 text-purple-700">Checkout Book</h2>
        <form onSubmit={handleBorrow} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Member</label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
            >
              <option value="">-- Choose Member --</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Book</label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={selectedBook}
              onChange={(e) => setSelectedBook(e.target.value)}
            >
              <option value="">-- Choose Book --</option>
              {books.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
            </select>
          </div>
          <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 font-medium h-10">
            Checkout
          </button>
        </form>
      </div>

      {/* --- Filters & List Section --- */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        
        {/* Filter Bar */}
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4 w-full md:w-auto">
                {/* Filter by Book */}
                <div className="w-full md:w-64">
                    <select
                        className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-purple-500 focus:ring-purple-500"
                        value={filterBookId}
                        onChange={(e) => setFilterBookId(e.target.value)}
                    >
                        <option value="">All Books</option>
                        {books.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
                    </select>
                </div>

                {/* Filter by Member */}
                <div className="w-full md:w-64">
                    <select
                        className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-purple-500 focus:ring-purple-500"
                        value={filterMemberId}
                        onChange={(e) => setFilterMemberId(e.target.value)}
                    >
                        <option value="">All Members</option>
                        {members.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                    </select>
                </div>

                {/* Clear Button */}
                {(filterBookId || filterMemberId) && (
                    <button onClick={clearFilters} className="text-sm text-gray-500 hover:text-gray-700 underline">
                        Clear Filters
                    </button>
                )}
            </div>

            {/* View Toggle */}
            <div className="flex bg-gray-200 rounded-lg p-1 shrink-0">
                <button
                onClick={() => setViewFilter('ACTIVE')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
                    viewFilter === 'ACTIVE' ? 'bg-white shadow text-purple-700' : 'text-gray-500 hover:text-gray-700'
                }`}
                >
                Active
                </button>
                <button
                onClick={() => setViewFilter('ALL')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
                    viewFilter === 'ALL' ? 'bg-white shadow text-purple-700' : 'text-gray-500 hover:text-gray-700'
                }`}
                >
                All History
                </button>
            </div>
        </div>
        
        {/* Data Table */}
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Borrowed</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Returned</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr><td colSpan={6} className="text-center py-4">Loading...</td></tr>
            ) : borrowings.length === 0 ? (
               <tr><td colSpan={6} className="text-center py-4 text-gray-500">No records found matching filters.</td></tr>
            ) : (
              borrowings.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      b.status === 'ACTIVE' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{b.book_title}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{b.member_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(b.borrow_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {b.return_date ? new Date(b.return_date).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    {b.status === 'ACTIVE' && (
                      <button 
                        onClick={() => handleReturn(b.id)}
                        className="text-red-600 hover:text-red-900 font-medium"
                      >
                        Return
                      </button>
                    )}
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