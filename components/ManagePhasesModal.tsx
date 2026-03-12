import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, Button, Input } from './ui/primitives';
import { useStore } from '../store';
import { KanbanColumnDefinition } from '../types';
import { Trash2, GripVertical, Plus } from 'lucide-react';

const generateId = () => Math.random().toString(36).substr(2, 9);

interface ManagePhasesModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ManagePhasesModal: React.FC<ManagePhasesModalProps> = ({ isOpen, onClose }) => {
    const { columns, addColumn, updateColumn, deleteColumn } = useStore();
    const [newPhaseTitle, setNewPhaseTitle] = useState('');

    const handleAddPhase = () => {
        if (!newPhaseTitle.trim()) return;

        const newColumn: KanbanColumnDefinition = {
            id: generateId(),
            title: newPhaseTitle,
            color: '#6b7280', // Default gray hex
            order: columns.length,
        };

        addColumn(newColumn);
        setNewPhaseTitle('');
    };

    const handleDeletePhase = (id: string) => {
        if (confirm('Tem certeza que deseja excluir esta fase? Cards nesta fase podem ficar inacessíveis.')) {
            deleteColumn(id);
        }
    };

    const handleUpdatePhase = (id: string, updates: Partial<KanbanColumnDefinition>) => {
        const col = columns.find(c => c.id === id);
        if (col) {
            updateColumn({ ...col, ...updates });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Gerenciar Fases do Kanban</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        {columns.map((col, index) => (
                            <div key={col.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded-md border">
                                <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                                <input
                                    type="color"
                                    value={col.color.startsWith('#') ? col.color : '#000000'} // Fallback for legacy classes
                                    onChange={(e) => handleUpdatePhase(col.id, { color: e.target.value })}
                                    className="h-6 w-6 rounded cursor-pointer border-none p-0 bg-transparent"
                                />
                                <Input
                                    value={col.title}
                                    onChange={(e) => handleUpdatePhase(col.id, { title: e.target.value })}
                                    className="h-8 flex-1"
                                />
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDeletePhase(col.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-2 pt-2 border-t">
                        <Input
                            placeholder="Nome da nova fase..."
                            value={newPhaseTitle}
                            onChange={(e) => setNewPhaseTitle(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddPhase()}
                        />
                        <Button onClick={handleAddPhase}>
                            <Plus className="h-4 w-4 mr-2" /> Adicionar
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
