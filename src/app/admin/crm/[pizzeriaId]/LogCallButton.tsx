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
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={handleQuickCall}
        disabled={loading}
        className="h-7 text-xs gap-1 px-2"
      >
        <Phone className="h-3 w-3" />
        {loading ? '...' : 'Appel'}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button className="text-[10px] text-gray-400 hover:text-gray-600">+note</button>
        </DialogTrigger>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Enregistrer un appel</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCallWithNote} className="space-y-3">
            <div>
              <label className="text-xs font-medium mb-1 block text-gray-500">Note (optionnel)</label>
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Résumé de l'appel..."
                className="h-9"
              />
            </div>
            <Button type="submit" disabled={loading} size="sm" className="w-full">
              {loading ? '...' : 'Enregistrer'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
