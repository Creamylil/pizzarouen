'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { emailComposerSchema, type EmailComposerData } from '../../schemas/email';
import { sendQuickEmail } from '../../actions/email';
import { Button } from '@/components/ui/button';
import { Mail, Send, Loader2, ChevronDown, ChevronUp, X } from 'lucide-react';

interface EmailComposerProps {
  dealId: string;
  pizzeriaId: string;
  defaultTo: string;
}

export default function EmailComposer({ dealId, pizzeriaId, defaultTo }: EmailComposerProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
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
      toast.success('Email envoyé au client');
      reset({ to: defaultTo, subject: '', body: '' });
      setExpanded(false);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  if (!expanded) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="h-8 text-xs gap-1.5"
        onClick={() => setExpanded(true)}
      >
        <Mail className="h-3.5 w-3.5" />
        Email
      </Button>
    );
  }

  return (
    <div className="w-full bg-white border rounded-lg p-3 mt-1">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-600 flex items-center gap-1.5">
          <Mail className="h-3.5 w-3.5" />
          Envoyer un email au client
        </span>
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <input
              type="email"
              {...register('to')}
              className="w-full px-2.5 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Email destinataire"
            />
            {errors.to && <p className="text-[11px] text-red-500 mt-0.5">{errors.to.message}</p>}
          </div>
          <div>
            <input
              type="text"
              {...register('subject')}
              placeholder="Objet de l'email..."
              className="w-full px-2.5 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.subject && <p className="text-[11px] text-red-500 mt-0.5">{errors.subject.message}</p>}
          </div>
        </div>

        <div>
          <textarea
            {...register('body')}
            rows={3}
            placeholder="Votre message..."
            className="w-full px-2.5 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          />
          {errors.body && <p className="text-[11px] text-red-500 mt-0.5">{errors.body.message}</p>}
        </div>

        <div className="flex items-center gap-2">
          <Button type="submit" disabled={sending} size="sm" className="h-8 gap-1.5 text-xs">
            {sending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            {sending ? 'Envoi...' : 'Envoyer au client'}
          </Button>
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
