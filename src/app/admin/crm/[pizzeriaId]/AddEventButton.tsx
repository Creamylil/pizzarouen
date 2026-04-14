'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { addEvent } from '../../actions/crm';
import { EVENT_TYPES } from '../../schemas/deal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';

interface AddEventButtonProps {
  dealId: string;
  pizzeriaId: string;
}

export default function AddEventButton({ dealId, pizzeriaId }: AddEventButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [eventType, setEventType] = useState('appel');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) {
      toast.error('Description requise');
      return;
    }
    setLoading(true);
    const result = await addEvent(dealId, pizzeriaId, {
      event_type: eventType,
      description: description.trim(),
    });
    setLoading(false);
    if (result.success) {
      toast.success('Événement ajouté');
      setDescription('');
      setOpen(false);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 text-xs gap-1 px-2">
          <Plus className="h-3 w-3" />
          Événement
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base">Nouvel événement</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-medium mb-1 block text-gray-500">Type</label>
            <Select value={eventType} onValueChange={setEventType}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.filter((t) => t.value !== 'changement_statut').map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block text-gray-500">Description</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Résumé de l'échange..."
              className="h-9"
            />
          </div>
          <Button type="submit" disabled={loading} size="sm" className="w-full">
            {loading ? '...' : 'Ajouter'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
