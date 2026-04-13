'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { toggleCommercialActive } from '../actions/crm';
import { Button } from '@/components/ui/button';
import { UserCheck, UserX } from 'lucide-react';

interface ToggleActiveButtonProps {
  id: string;
  active: boolean;
}

export default function ToggleActiveButton({ id, active }: ToggleActiveButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    const result = await toggleCommercialActive(id, !active);
    setLoading(false);
    if (result.success) {
      toast.success(active ? 'Commercial désactivé' : 'Commercial réactivé');
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      disabled={loading}
      title={active ? 'Désactiver' : 'Réactiver'}
    >
      {active ? (
        <UserCheck className="h-4 w-4 text-green-600" />
      ) : (
        <UserX className="h-4 w-4 text-gray-400" />
      )}
    </Button>
  );
}
