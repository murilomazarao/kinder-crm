import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, Button } from './ui/primitives';
import { useStore } from '../store';
import { FieldDefinition, FieldType } from '../types';
import { Trash2, Plus, Settings } from 'lucide-react';
import { FieldSelector } from './FieldSelector';

const generateId = () => crypto.randomUUID();

interface ManageFieldsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ManageFieldsModal: React.FC<ManageFieldsModalProps> = ({ isOpen, onClose }) => {
    const { fieldDefinitions, addFieldDefinition, deleteFieldDefinition } = useStore();
    const [isFieldSelectorOpen, setIsFieldSelectorOpen] = useState(false);

    const handleAddField = (type: FieldType) => {
        setIsFieldSelectorOpen(false);
        const name = window.prompt("Nome do campo:");
        if (!name) return;

        let options: string[] | undefined;
        if (type === 'list_selection' || type === 'single_selection') {
            const optionsString = window.prompt("Opções (separadas por vírgula):");
            if (optionsString) {
                options = optionsString.split(',').map(o => o.trim()).filter(Boolean);
            }
        }

        const newField: FieldDefinition = {
            id: generateId(),
            name,
            type,
            options
        };
        addFieldDefinition(newField);
    };

    const handleDeleteField = (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este campo? Os dados existentes serão ocultados.')) {
            deleteFieldDefinition(id);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Gerenciar Campos Personalizados</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {fieldDefinitions.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8">
                            Nenhum campo personalizado criado.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {fieldDefinitions.map((field) => (
                                <div key={field.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                                    <div>
                                        <div className="font-medium">{field.name}</div>
                                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                                            {field.type}
                                            {field.options && (
                                                <span className="bg-muted px-1 rounded">
                                                    {field.options.length} opções
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDeleteField(field.id)}
                                        className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}

                    <Button
                        onClick={() => setIsFieldSelectorOpen(true)}
                        className="w-full border-dashed"
                        variant="outline"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Adicionar Novo Campo
                    </Button>
                </div>

                <div className="flex justify-end">
                    <Button onClick={onClose}>Concluir</Button>
                </div>

                <FieldSelector
                    isOpen={isFieldSelectorOpen}
                    onClose={() => setIsFieldSelectorOpen(false)}
                    onSelect={handleAddField}
                />
            </DialogContent>
        </Dialog>
    );
};
