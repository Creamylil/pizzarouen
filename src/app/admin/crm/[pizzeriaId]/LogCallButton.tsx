'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { logCall } from '../../actions/crm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Phone } from 'lucide-react';

interface LogCallButtonProps {
  dealId: string;
  pizzeriaId: string;
}

export default function LogCallButton({ dealId, pizzeriaId }: LogCallButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleQuickCall() {
    setLoading(true);
    const result = await logCall(dealId, pizzeriaId);
    setLoading(false);
    if (result.success) {
      toast.success('Appel enregistré');
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  async function handleCallWithNote(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const result = await logCall(dealId, pizzeriaId, note.trim() || undefined);
    setLoading(false);
    if (result.success) {
      toast.success('Appel enregistré');
      setNote('');
      setOpen(false);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleQuickCall}
        disabled={loading}
      >
        <Phone className="h-4 w-4 mr-1" />
        {loading ? '...' : 'Appel passé'}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="text-xs text-gray-500">
            + note
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enregistrer un appel</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCallWithNote} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Note (optionnel)</label>
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Résumé de l'appel..."
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Enregistrement...' : 'Enregistrer l\'appel'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
