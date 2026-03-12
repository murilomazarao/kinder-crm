import React from 'react';
import {
    Type, AlignLeft, AtSign, MessageSquare, FileText, Phone,
    CalendarClock, Calendar, Clock, CalendarDays, DollarSign,
    Hash, List, Grip, User, CheckSquare, Paperclip, Tag,
    Table, LayoutDashboard, Calculator, Hash as HashIcon
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/primitives';
import { FieldType } from '../types';

interface FieldSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (type: FieldType) => void;
}

const FIELD_TYPES: { type: FieldType; label: string; icon: React.ElementType }[] = [
    { type: 'text', label: 'Texto Curto', icon: Type },
    { type: 'long_text', label: 'Texto Longo', icon: AlignLeft },
    { type: 'email', label: 'E-mail', icon: AtSign },
    { type: 'fixed_text', label: 'Texto Fixo', icon: MessageSquare },
    { type: 'document', label: 'Documento', icon: FileText },
    { type: 'phone', label: 'Telefone', icon: Phone },
    { type: 'date_time', label: 'Data e Hora', icon: CalendarClock },
    { type: 'date', label: 'Data', icon: Calendar },
    { type: 'time', label: 'Tempo', icon: Clock },
    { type: 'due_date', label: 'Data de Vencimento', icon: CalendarDays },
    { type: 'currency', label: 'Moeda', icon: DollarSign },
    { type: 'number', label: 'Número', icon: Hash },
    { type: 'list_selection', label: 'Seleção de Lista', icon: List },
    { type: 'single_selection', label: 'Seleção Única', icon: Grip },
    { type: 'responsible', label: 'Responsável', icon: User },
    { type: 'checkbox', label: 'Checkbox', icon: CheckSquare },
    { type: 'attachment', label: 'Anexo', icon: Paperclip },
    { type: 'label', label: 'Etiqueta', icon: Tag },
];

const ADVANCED_FIELD_TYPES: { type: FieldType; label: string; icon: React.ElementType; beta?: boolean }[] = [
    // Keeping existing advanced types as they are useful features, even if not in the specific screenshot
    { type: 'connected_database', label: 'Database Conectado', icon: Table },
    { type: 'connected_board', label: 'Board Conectado', icon: LayoutDashboard, beta: true },
    { type: 'formula', label: 'Fórmula', icon: Calculator },
    { type: 'sequencer', label: 'Sequenciador', icon: HashIcon },
];

export const FieldSelector: React.FC<FieldSelectorProps> = ({ isOpen, onClose, onSelect }) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-center text-lg font-normal text-muted-foreground">
                        Selecione um tipo de campo! <span className="text-blue-500 text-sm cursor-pointer hover:underline">Saiba mais!</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-3 py-4">
                    {FIELD_TYPES.map((field) => (
                        <button
                            key={field.type}
                            onClick={() => onSelect(field.type)}
                            className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors text-left group"
                        >
                            <div className="text-muted-foreground group-hover:text-primary transition-colors">
                                <field.icon size={18} />
                            </div>
                            <span className="text-sm font-medium text-foreground">{field.label}</span>
                        </button>
                    ))}
                </div>

                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground">Campos Avançados</h4>
                    <div className="grid grid-cols-2 gap-3">
                        {ADVANCED_FIELD_TYPES.map((field) => (
                            <button
                                key={field.type}
                                onClick={() => onSelect(field.type)}
                                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors text-left group"
                            >
                                <div className="text-muted-foreground group-hover:text-primary transition-colors">
                                    <field.icon size={18} />
                                </div>
                                <span className="text-sm font-medium text-foreground flex items-center gap-2">
                                    {field.label}
                                    {field.beta && <span className="bg-blue-500 text-white text-[10px] px-1.5 rounded-sm">Beta</span>}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t flex justify-center">
                    <button className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2 px-4 py-2 rounded-md border hover:bg-muted/50 transition-colors">
                        Regras de Campo <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-sm">novo</span>
                    </button>
                </div>

            </DialogContent>
        </Dialog>
    );
};
