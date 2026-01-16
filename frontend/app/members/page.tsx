'use client';

import { useState, useEffect } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

interface Member {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  joined_date: string;
  is_active: boolean;
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State to track if we are editing a member
  const [editingMemberId, setEditingMemberId] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    joined_date: '',
    is_active: true
  });

  // Fetch Members on Load
  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await api.get('/members/');
      const memberList = response.data?.results || response.data || [];
      
      // Map backend field names to consistent frontend field names
      const mappedMembers = memberList.map((member: { 
        id: number;
        first_name: string;
        last_name: string;
        email: string;
        phone: string;
        joined_date?: string;
        join_date?: string;
        is_active: boolean;
      }) => ({
        ...member,
        joined_date: member.joined_date || member.join_date, // Handle both field names during transition
      }));
      
      setMembers(mappedMembers);
    } catch (error) {
      console.error('Failed to fetch members:', error);
      toast.error('Could not load members');
    } finally {
      setIsLoading(false);
    }
  };

  // Populate form for editing
  const handleEditClick = (member: Member) => {
    setEditingMemberId(member.id);
    setFormData({
      first_name: member.first_name,
      last_name: member.last_name,
      email: member.email,
      phone: member.phone,
      joined_date: member.joined_date ? new Date(member.joined_date).toISOString().split('T')[0] : '',
      is_active: member.is_active
    });
    // Scroll to top to see form
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast('Editing mode activated', { icon: '✏️' });
  };

  // Cancel Edit Mode
  const handleCancelEdit = () => {
    setEditingMemberId(null);
    setFormData({ first_name: '', last_name: '', email: '', phone: '', joined_date: '', is_active: true });
  };

  // Handle Form Submit (Create OR Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading('Saving member...');
    try {
      // Prepare data with backend-expected field names and formats
      const submitData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        joined_date: formData.joined_date,
        is_active: formData.is_active
      };

      if (editingMemberId) {
        // --- UPDATE MODE (PUT) ---
        await api.put(`/members/${editingMemberId}/`, submitData);
        toast.success('Member updated successfully!', { id: toastId });
      } else {
        // --- CREATE MODE (POST) ---
        await api.post('/members/', submitData);
        toast.success('Member added successfully!', { id: toastId });
      }
      
      // Reset and Refresh
      handleCancelEdit();
      fetchMembers();
      
    } catch (error: unknown) {
      console.error(error);
      const errorMessage = (error as { message?: string })?.message || 'Failed to save member';
      toast.error(errorMessage, { id: toastId });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Member Management</h1>

      {/* --- Add / Edit Form --- */}
      <div className={`p-6 rounded-lg shadow-md mb-8 border transition-colors duration-200 ${editingMemberId ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-100'}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-xl font-semibold ${editingMemberId ? 'text-yellow-700' : 'text-blue-600'}`}>
            {editingMemberId ? 'Edit Member Details' : 'Add New Member'}
          </h2>
          {editingMemberId && (
            <button onClick={handleCancelEdit} className="text-sm text-gray-500 underline hover:text-gray-700">
              Cancel Editing
            </button>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input
              type="text"
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input
              type="text"
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              required
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Membership Date</label>
            <input
              type="date"
              required
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={formData.joined_date}
              onChange={(e) => setFormData({ ...formData, joined_date: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={formData.is_active ? 'active' : 'inactive'}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'active' })}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <button
            type="submit"
            className={`px-4 py-2 rounded transition-colors h-10 font-medium text-white ${editingMemberId ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {editingMemberId ? 'Update Member' : 'Add Member'}
          </button>
        </form>
      </div>

      {/* --- Members Table --- */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name / Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Membership Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr><td colSpan={5} className="text-center py-4">Loading members...</td></tr>
            ) : members.length === 0 ? (
               <tr><td colSpan={5} className="text-center py-4 text-gray-500">No members found. Add one above!</td></tr>
            ) : (
              members.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{member.first_name} {member.last_name}</div>
                    <div className="text-sm text-gray-500">{member.email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{member.phone}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(member.joined_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      member.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {member.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <button 
                      onClick={() => handleEditClick(member)}
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