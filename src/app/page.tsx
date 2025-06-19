import LeadCapture from '@/components/LeadCapture';
import ProtectedRoute from '@/components/ProtectedRoute';
import LogoutButton from '@/components/LogoutButton';

export default function Home() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <div className="flex justify-end p-4">
          <LogoutButton />
        </div>
        <LeadCapture />
      </div>
    </ProtectedRoute>
  );
}
