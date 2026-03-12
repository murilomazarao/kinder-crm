import React from 'react';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { Customer, KanbanStatus } from '../../types';
import { Button, Badge } from '../ui/primitives';
import { Plus, Package } from 'lucide-react';
import { CustomerCard } from './CustomerCard';
import { CSS } from '@dnd-kit/utilities';

interface SortableItemProps {
    customer: Customer;
    onClick: (c: Customer) => void;
}

const SortableItem: React.FC<SortableItemProps> = React.memo(({ customer, onClick }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: customer.id, data: { type: 'Customer', customer } });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    if (isDragging) {
        return (
            <div ref={setNodeRef} style={style} className="opacity-30 h-[140px] rounded-2xl bg-white/5 border-2 border-dashed border-white/20 backdrop-blur-sm mb-4" />
        );
    }

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="mb-4">
            <CustomerCard customer={customer} onClick={onClick} />
        </div>
    );
});

SortableItem.displayName = 'SortableItem';

interface KanbanColumnProps {
    column: { id: string; title: string; color: string };
    customers: Customer[];
    onCardClick: (c: Customer) => void;
    onAddCard: (status: KanbanStatus) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = React.memo(({ column, customers, onCardClick, onAddCard }) => {
    const { setNodeRef } = useSortable({
        id: column.id,
        data: { type: 'Column', column }
    });

    const columnTotal = React.useMemo(() =>
        customers.reduce((acc, curr) => acc + curr.value, 0),
        [customers]
    );

    return (
        <div className="flex h-full min-w-[320px] max-w-[350px] flex-col rounded-[2.5rem] bg-foreground/[0.02] dark:bg-white/[0.02] backdrop-blur-3xl border border-foreground/[0.05] dark:border-white/[0.05] overflow-hidden shadow-2xl mr-2">
            {/* Header */}
            <div className="p-6 pb-2">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]" style={{ backgroundColor: column.color }} />
                        <h3 className="font-black text-sm uppercase tracking-widest text-foreground/90 dark:text-white/90">{column.title}</h3>
                        <Badge variant="outline" className="h-5 px-1.5 text-[10px] font-black border-foreground/10 dark:border-white/10 bg-foreground/5 dark:bg-white/5 text-muted-foreground">
                            {customers.length}
                        </Badge>
                    </div>

                    <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-foreground/10 dark:hover:bg-white/10" onClick={() => onAddCard(column.id as KanbanStatus)}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-2xl font-black tracking-tighter text-foreground dark:text-white">
                        {columnTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total</span>
                </div>
            </div>

            {/* Droppable Area */}
            <div ref={setNodeRef} className="flex-1 p-4 overflow-y-auto no-scrollbar space-y-4">
                <SortableContext items={customers.map(c => c.id)} strategy={verticalListSortingStrategy}>
                    {customers.map((customer) => (
                        <SortableItem key={customer.id} customer={customer} onClick={onCardClick} />
                    ))}
                </SortableContext>
                {customers.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground/30 border-2 border-dashed border-white/5 rounded-[2rem]">
                        <Package className="h-8 w-8 mb-2" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Vazio</p>
                    </div>
                )}
            </div>
        </div>
    );
});

KanbanColumn.displayName = 'KanbanColumn';
