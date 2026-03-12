import React, { useState, useCallback } from 'react';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { KanbanColumn } from './kanban/KanbanColumn';
import { CustomerCard } from './kanban/CustomerCard';
import { useStore } from '../store';
import { Customer, KanbanStatus, Product } from '../types';
import { Button, Input, Dialog, DialogContent, DialogHeader, DialogTitle, Select } from './ui/primitives';
import { Plus, Settings, Search, Mail, Phone, DollarSign, Trash2, Package, X, Minus, FileText, Tag } from 'lucide-react';
import { generateQuotePDF } from '../utils/pdfGenerator';
import { CreateCardModal } from './CreateCardModal';
import { ManagePhasesModal } from './ManagePhasesModal';
import { TagManager } from './TagManager';
import { InvoiceManager } from './InvoiceManager';
import { motion } from 'framer-motion';
import { CustomerDetailsModal } from './CustomerDetailsModal';

// --- Main Board Component ---
export const KanbanBoard = () => {
  const { customers, moveCustomer, updateCustomer, deleteCustomer, products, columns, tags } = useStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createModalStatus, setCreateModalStatus] = useState<KanbanStatus>('inbox');
  const [isManagePhasesOpen, setIsManagePhasesOpen] = useState(false);
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);
  const [isTagSelectorOpen, setIsTagSelectorOpen] = useState(false);
  const [productSearch, setProductSearch] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const findContainer = useCallback((id: string) => {
    if (columns.some(col => col.id === id)) return id;
    const customer = customers.find(c => c.id === id);
    return customer?.status;
  }, [columns, customers]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }
  }, [findContainer]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeCustomer = customers.find(c => c.id === activeId);
    if (!activeCustomer) return;

    // Over a column
    if (columns.some(col => col.id === overId)) {
      if (activeCustomer.status !== overId) {
        moveCustomer(activeId, overId as KanbanStatus);
      }
      return;
    }

    // Over another customer
    const overCustomer = customers.find(c => c.id === overId);
    if (overCustomer && activeCustomer.status !== overCustomer.status) {
      moveCustomer(activeId, overCustomer.status);
    }
  }, [customers, columns, moveCustomer]);

  const openCreateModal = (status: KanbanStatus = 'inbox') => {
    setCreateModalStatus(status);
    setIsCreateModalOpen(true);
  };

  const openSheet = (customer: Customer) => {
    setSelectedCustomer(customer);
  };

  const handleAddProduct = useCallback((product: Product) => {
    if (!selectedCustomer) return;
    const updatedProducts = [...(selectedCustomer.products || []), product.id];

    const subtotal = updatedProducts.reduce((acc, id) => {
      const p = products.find(prod => prod.id === id);
      return acc + (p?.salePrice || 0);
    }, 0);

    const discountValue = subtotal * ((selectedCustomer.discount || 0) / 100);
    const newValue = (subtotal - discountValue) + (selectedCustomer.freight || 0);

    const updated = { ...selectedCustomer, products: updatedProducts, value: newValue };
    updateCustomer(updated);
    setSelectedCustomer(updated);
  }, [selectedCustomer, products, updateCustomer]);

  const handleUpdateQuantity = useCallback((productId: string, delta: number) => {
    if (!selectedCustomer) return;
    const currentProducts = selectedCustomer.products || [];
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const currentQty = currentProducts.filter(id => id === productId).length;
    const newQty = Math.max(0, currentQty + delta);

    if (currentQty === newQty) return;

    const otherProducts = currentProducts.filter(id => id !== productId);
    const newProductIds = Array(newQty).fill(productId);
    const updatedProducts = [...otherProducts, ...newProductIds];

    const subtotal = updatedProducts.reduce((acc, id) => {
      const p = products.find(prod => prod.id === id);
      return acc + (p?.salePrice || 0);
    }, 0);

    const discountValue = subtotal * ((selectedCustomer.discount || 0) / 100);
    const newValue = (subtotal - discountValue) + (selectedCustomer.freight || 0);

    const updated = { ...selectedCustomer, products: updatedProducts, value: newValue };
    updateCustomer(updated);
    setSelectedCustomer(updated);
  }, [selectedCustomer, products, updateCustomer]);

  const handleRemoveProduct = useCallback((productId: string) => {
    if (!selectedCustomer) return;
    const updatedProducts = (selectedCustomer.products || []).filter(id => id !== productId);

    const subtotal = updatedProducts.reduce((acc, id) => {
      const p = products.find(prod => prod.id === id);
      return acc + (p?.salePrice || 0);
    }, 0);

    const discountValue = subtotal * ((selectedCustomer.discount || 0) / 100);
    const newValue = (subtotal - discountValue) + (selectedCustomer.freight || 0);

    const updated = { ...selectedCustomer, products: updatedProducts, value: newValue };
    updateCustomer(updated);
    setSelectedCustomer(updated);
  }, [selectedCustomer, products, updateCustomer]);

  const handleUpdateFinancials = useCallback((field: 'discount' | 'freight', value: number) => {
    if (!selectedCustomer) return;

    const currentProducts = selectedCustomer.products || [];
    const subtotal = currentProducts.reduce((acc, id) => {
      const p = products.find(prod => prod.id === id);
      return acc + (p?.salePrice || 0);
    }, 0);

    const discountPercentage = field === 'discount' ? value : (selectedCustomer.discount || 0);
    const freight = field === 'freight' ? value : (selectedCustomer.freight || 0);

    const discountValue = subtotal * (discountPercentage / 100);
    const newValue = (subtotal - discountValue) + freight;

    const updated = { ...selectedCustomer, [field]: value, value: newValue };
    updateCustomer(updated);
    setSelectedCustomer(updated);
  }, [selectedCustomer, products, updateCustomer]);

  const handleDeleteCustomer = () => {
    if (!selectedCustomer) return;
    if (window.confirm('Tem certeza que deseja excluir este card?')) {
      deleteCustomer(selectedCustomer.id);
      setSelectedCustomer(null);
    }
  };

  const handleUpdateCustomer = (updates: Partial<Customer>) => {
    if (!selectedCustomer) return;
    const updated = { ...selectedCustomer, ...updates };
    setSelectedCustomer(updated);
    updateCustomer(updated);
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.sku.toLowerCase().includes(productSearch.toLowerCase())
  );

  const { isLoading } = useStore();

  if (isLoading) {
    return (
      <div className="flex h-full flex-col animate-pulse">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-white/5 rounded-xl" />
            <div className="h-4 w-48 bg-white/5 rounded-lg" />
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-24 bg-white/5 rounded-2xl" />
            <div className="h-10 w-24 bg-white/5 rounded-2xl" />
            <div className="h-12 w-32 bg-white/5 rounded-2xl" />
          </div>
        </div>
        <div className="flex-1 flex overflow-x-auto pb-4 gap-4 items-start no-scrollbar">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="min-w-[320px] h-[600px] rounded-[2rem] bg-white/5 border border-white/10" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-foreground">Pipeline de Vendas</h2>
          <p className="text-sm text-muted-foreground font-medium">Gerencie seu funil de vendas em tempo real.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-2xl border-foreground/5 dark:border-white/5 bg-foreground/5 dark:bg-white/5" onClick={() => setIsTagManagerOpen(true)}>
            <Tag className="mr-2 h-4 w-4 text-primary" /> Etiquetas
          </Button>
          <Button variant="outline" className="rounded-2xl border-foreground/5 dark:border-white/5 bg-foreground/5 dark:bg-white/5" onClick={() => setIsManagePhasesOpen(true)}>
            <Settings className="mr-2 h-4 w-4 text-primary" /> Fases
          </Button>
          <Button size="lg" className="rounded-2xl" onClick={() => openCreateModal(columns[0]?.id as KanbanStatus || 'inbox')}>
            <Plus className="mr-2 h-5 w-5" /> Novo Card
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-x-auto pb-4 gap-2 items-start no-scrollbar">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          {columns.map((col) => (
            <KanbanColumn
              key={col.id}
              column={col}
              customers={customers.filter((c) => c.status === col.id)}
              onCardClick={openSheet}
              onAddCard={openCreateModal}
            />
          ))}

          <DragOverlay>
            {activeId ? (
              <CustomerCard
                customer={customers.find((c) => c.id === activeId)!}
                isOverlay
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <CreateCardModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        defaultStatus={createModalStatus}
      />

      <ManagePhasesModal
        isOpen={isManagePhasesOpen}
        onClose={() => setIsManagePhasesOpen(false)}
      />

      <TagManager
        isOpen={isTagManagerOpen}
        onClose={() => setIsTagManagerOpen(false)}
      />

      <CustomerDetailsModal
        customer={selectedCustomer}
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        onDelete={handleDeleteCustomer}
      />
    </div>
  );
};