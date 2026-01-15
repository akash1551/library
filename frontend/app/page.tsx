import Link from 'next/link';

export default function Home() {
  return (
    <div className="text-center py-20">
      <h1 className="text-4xl font-bold mb-4">Welcome to Library</h1>
      <p className="text-xl text-gray-600 mb-8">Manage books, members, and book-borrowing efficiently.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <DashboardCard 
          title="Manage Books" 
          desc="Add new books and track inventory." 
          link="/books" 
          color="bg-blue-500"
        />
        <DashboardCard 
          title="Manage Members" 
          desc="Register new library members." 
          link="/members" 
          color="bg-green-500"
        />
        <DashboardCard 
          title="Circulation Desk" 
          desc="Check-out and Check-in books." 
          link="/borrowings" 
          color="bg-purple-500"
        />
      </div>
    </div>
  );
}

// Simple internal component for the cards
function DashboardCard({ title, desc, link, color }: any) {
  return (
    <Link href={link} className="block group">
      <div className={`${color} text-white p-6 rounded-lg shadow-lg transform transition group-hover:scale-105`}>
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="opacity-90">{desc}</p>
      </div>
    </Link>
  );
}
