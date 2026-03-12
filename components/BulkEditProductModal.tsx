import React, { useState } from 'react';
import { Button, Input, Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/primitives';
import { useStore } from '../store';
import { PRODUCT_CATEGORIES } from '../constants';

interface BulkEditProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedCount: number;
    onSave: (updates: { category?: string; salePrice?: number; stock?: number; supplierPrice?: number }) => void;
}

export const BulkEditProductModal: React.FC<BulkEditProductModalProps> = ({ isOpen, onClose, selectedCount, onSave }) => {
    const { products } = useStore();
    const [category, setCategory] = useState('');
    const [salePrice, setSalePrice] = useState('');
    const [supplierPrice, setSupplierPrice] = useState('');
    const [stock, setStock] = useState('');

    const uniqueCategories = Array.from(new Set(products.map(p => p.category))).filter(Boolean);

    const handleSave = () => {
        const updates: any = {};
        if (category) updates.category = category;
        if (salePrice) updates.salePrice = Number(salePrice);
        if (supplierPrice) updates.supplierPrice = Number(supplierPrice);
        if (stock) updates.stock = Number(stock);

        onSave(updates);
        onClose();

        // Reset fields
        setCategory('');
        setSalePrice('');
        setSupplierPrice('');
        setStock('');
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Editar {selectedCount} Produtos</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="text-sm text-muted-foreground bg-yellow-500/10 text-yellow-600 p-3 rounded-md border border-yellow-500/20">
                        Atenção: Os campos preenchidos substituirão os valores atuais de <strong>todos</strong> os itens selecionados. Deixe em branco para manter o valor original.
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Categoria</label>
                        <select
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="">-- Manter Original --</option>
                            {PRODUCT_CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Preço de Venda (R$)</label>
                            <Input
                                type="number"
                                placeholder="Manter original"
                                value={salePrice}
                                onChange={(e) => setSalePrice(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Preço de Custo (R$)</label>
                            <Input
                                type="number"
                                placeholder="Manter original"
                                value={supplierPrice}
                                onChange={(e) => setSupplierPrice(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Estoque</label>
                        <Input
                            type="number"
                            placeholder="Manter original"
                            value={stock}
                            onChange={(e) => setStock(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleSave}>Aplicar Alterações</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
