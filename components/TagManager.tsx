import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, Button, Input } from './ui/primitives';
import { useStore } from '../store';
import { Tag } from '../types';
import { Trash2, Plus } from 'lucide-react';

const generateId = () => crypto.randomUUID();

interface TagManagerProps {
    isOpen: boolean;
    onClose: () => void;
}

export const TagManager: React.FC<TagManagerProps> = ({ isOpen, onClose }) => {
    const { tags, addTag, deleteTag } = useStore();
    const [newTagName, setNewTagName] = useState('');
    const [newTagColor, setNewTagColor] = useState('#3b82f6'); // Default blue

    const handleAddTag = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTagName.trim()) return;

        const newTag: Tag = {
            id: generateId(),
            name: newTagName.trim(),
            color: newTagColor
        };

        addTag(newTag);
        setNewTagName('');
        setNewTagColor('#3b82f6');
    };

    const handleDeleteTag = (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir esta etiqueta?')) {
            deleteTag(id);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Gerenciar Etiquetas</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Create New Tag */}
                    <form onSubmit={handleAddTag} className="flex gap-3 items-end p-4 bg-muted/30 rounded-lg border">
                        <div className="flex-1 space-y-2">
                            <label className="text-xs font-medium text-muted-foreground">Nome da Etiqueta</label>
                            <Input
                                value={newTagName}
                                onChange={e => setNewTagName(e.target.value)}
                                placeholder="Ex: Urgente"
                                className="bg-background"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground">Cor</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={newTagColor}
                                    onChange={e => setNewTagColor(e.target.value)}
                                    className="h-10 w-10 rounded cursor-pointer border-0 p-0"
                                />
                            </div>
                        </div>
                        <Button type="submit" disabled={!newTagName.trim()}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </form>

                    {/* List Tags */}
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                        <h4 className="text-sm font-medium text-muted-foreground mb-3">Etiquetas Existentes</h4>
                        {tags.length === 0 ? (
                            <div className="text-center text-sm text-muted-foreground py-4">
                                Nenhuma etiqueta criada.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-2">
                                {tags.map((tag) => (
                                    <div key={tag.id} className="flex items-center justify-between p-2 rounded-md border bg-card hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-4 h-4 rounded-full border shadow-sm"
                                                style={{ backgroundColor: tag.color }}
                                            />
                                            <span className="font-medium text-sm">{tag.name}</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDeleteTag(tag.id)}
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button variant="outline" onClick={onClose}>Fechar</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
