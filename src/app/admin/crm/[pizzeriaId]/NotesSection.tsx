'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { addNote } from '../../actions/crm';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';

interface Note {
  id: string;
  content: string;
  note_date: string;
  created_at: string;
}

interface NotesSectionProps {
  dealId: string;
  pizzeriaId: string;
  notes: Note[];
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export default function NotesSection({ dealId, pizzeriaId, notes }: NotesSectionProps) {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    if (!content.trim()) return;
    setLoading(true);
    const result = await addNote(dealId, pizzeriaId, content.trim(), todayStr());
    setLoading(false);
    if (result.success) {
      toast.success('Note ajoutée');
      setContent('');
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-700 mb-2">Notes</h2>

      {/* Formulaire d'ajout — compact inline */}
      <div className="flex gap-2 mb-3">
        <Textarea
          rows={1}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Ajouter une note... (Ctrl+Enter pour envoyer)"
          className="resize-none text-sm min-h-[36px]"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              handleAdd();
            }
          }}
        />
        <Button
          size="sm"
          onClick={handleAdd}
          disabled={loading || !content.trim()}
          className="shrink-0 h-9"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          {loading ? '...' : 'Ajouter'}
        </Button>
      </div>

      {/* Liste des notes — compact */}
      {notes.length > 0 && (
        <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
          {notes.map((note) => (
            <div key={note.id} className="flex gap-2 text-sm border-l-2 border-gray-200 pl-3 py-0.5">
              <span className="text-[11px] text-gray-400 shrink-0 tabular-nums">
                {new Date(note.note_date).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: 'short',
                })}
              </span>
              <p className="text-gray-600 whitespace-pre-wrap">{note.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
