'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { emailComposerSchema, type EmailComposerData } from '../../schemas/email';
import { sendQuickEmail } from '../../actions/email';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Mail, Send, Loader2 } from 'lucide-react';

interface EmailComposerProps {
  dealId: string;
  pizzeriaId: string;
  defaultTo: string;
}

export default function EmailComposer({ dealId, pizzeriaId, defaultTo }: EmailComposerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmailComposerData>({
    resolver: zodResolver(emailComposerSchema),
    defaultValues: {
      to: defaultTo,
      subject: '',
      body: '',
    },
  });

  async function onSubmit(data: EmailComposerData) {
    setSending(true);
    const result = await sendQuickEmail(dealId, pizzeriaId, data);
    setSending(false);

    if (result.success) {
      toast.success('Email envoyé');
      reset({ to: defaultTo, subject: '', body: '' });
      setOpen(false);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
          <Mail className="h-3.5 w-3.5" />
          Email
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base">Envoyer un email</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">À</label>
            <input
              type="email"
              {...register('to')}
              className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.to && <p className="text-xs text-red-500 mt-0.5">{errors.to.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Sujet</label>
            <input
              type="text"
              {...register('subject')}
              placeholder="Objet de l'email..."
              className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.subject && <p className="text-xs text-red-500 mt-0.5">{errors.subject.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Message</label>
            <textarea
              {...register('body')}
              rows={5}
              placeholder="Votre message..."
              className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            />
            {errors.body && <p className="text-xs text-red-500 mt-0.5">{errors.body.message}</p>}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Button type="submit" disabled={sending} size="sm" className="gap-1.5">
              {sending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              {sending ? 'Envoi...' : 'Envoyer'}
            </Button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700"
            >
              Annuler
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
