'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { addNote } from '../../actions/crm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Plus } from 'lucide-react';

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
  const [noteDate, setNoteDate] = useState(todayStr());
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    if (!content.trim()) {
      toast.error('Le contenu de la note est requis');
      return;
    }
    setLoading(true);
    const result = await addNote(dealId, pizzeriaId, content.trim(), noteDate);
    setLoading(false);
    if (result.success) {
      toast.success('Note ajoutée');
      setContent('');
      setNoteDate(todayStr());
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5 text-gray-600" />
          Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Formulaire d'ajout */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Input
              type="date"
              value={noteDate}
              onChange={(e) => setNoteDate(e.target.value)}
              className="w-[160px]"
            />
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={loading || !content.trim()}
            >
              <Plus className="h-4 w-4 mr-1" />
              {loading ? 'Ajout...' : 'Ajouter'}
            </Button>
          </div>
          <Textarea
            rows={2}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Ajouter une note..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleAdd();
              }
            }}
          />
        </div>

        {/* Liste des notes */}
        {notes.length === 0 ? (
          <p className="text-sm text-gray-400 py-2">Aucune note enregistrée.</p>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div key={note.id} className="flex gap-3 border-l-2 border-gray-200 pl-4 py-1">
                <div className="shrink-0">
                  <span className="text-xs font-medium text-gray-500">
                    {new Date(note.note_date).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
