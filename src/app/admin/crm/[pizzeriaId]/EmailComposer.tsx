'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { emailComposerSchema, type EmailComposerData } from '../../schemas/email';
import { sendQuickEmail } from '../../actions/email';
import { Mail, Send, ChevronDown, ChevronUp } from 'lucide-react';

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
      toast.success('Email envoyé');
      reset({ to: defaultTo, subject: '', body: '' });
      setExpanded(false);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="bg-white border rounded-lg">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <span className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Envoyer un email
        </span>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        )}
      </button>

      {expanded && (
        <form onSubmit={handleSubmit(onSubmit)} className="px-4 pb-4 space-y-3 border-t">
          <div className="pt-3">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Destinataire
            </label>
            <input
              type="email"
              {...register('to')}
              className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.to && (
              <p className="text-xs text-red-500 mt-1">{errors.to.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Sujet
            </label>
            <input
              type="text"
              {...register('subject')}
              placeholder="Objet de l'email..."
              className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.subject && (
              <p className="text-xs text-red-500 mt-1">{errors.subject.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Message
            </label>
            <textarea
              {...register('body')}
              rows={6}
              placeholder="Votre message..."
              className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            />
            {errors.body && (
              <p className="text-xs text-red-500 mt-1">{errors.body.message}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 transition-colors"
            >
              <Send className="h-3.5 w-3.5" />
              {sending ? 'Envoi...' : 'Envoyer'}
            </button>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
