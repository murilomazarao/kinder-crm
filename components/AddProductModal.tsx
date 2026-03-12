import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, Button, Input, Select, cn } from './ui/primitives';
import { useStore } from '../store';
import { Product } from '../types';
import { Plus, X, Upload } from 'lucide-react';
import { PRODUCT_CATEGORIES } from '../constants';

const generateId = () => crypto.randomUUID();

interface AddProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    product?: Product | null;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose, product }) => {
    const { addProduct, updateProduct } = useStore();
    const [formData, setFormData] = useState<Partial<Product>>({
        name: '',
        sku: '',
        supplierPrice: 0,
        salePrice: 0,
        purchasePrice: 0,
        stock: 0,
        category: '',
        images: [],
    });

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name,
                sku: product.sku,
                supplierPrice: product.supplierPrice,
                salePrice: product.salePrice,
                purchasePrice: product.purchasePrice,
                stock: product.stock,
                category: product.category,
                images: product.images || [],
            });
        } else {
            setFormData({
                name: '',
                sku: '',
                supplierPrice: 0,
                salePrice: 0,
                purchasePrice: 0,
                stock: 0,
                category: '',
                images: [],
            });
        }
    }, [product, isOpen]);
    const [imageUrlInput, setImageUrlInput] = useState('');

    // Auto-calculate prices when Supplier Price changes
    const handleSupplierPriceChange = (value: number) => {
        setFormData(prev => ({
            ...prev,
            supplierPrice: value,
            salePrice: value + (value * 0.70), // 70% Markup
            purchasePrice: value * 0.50, // 50% Discount (assuming this is the logic requested)
            price: value + (value * 0.70) // Keeping price synced with salePrice for now
        }));
    };

    const handleAddImage = () => {
        if (!imageUrlInput) return;
        setFormData(prev => ({
            ...prev,
            images: [...(prev.images || []), imageUrlInput]
        }));
        setImageUrlInput('');
    };

    const handleRemoveImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images?.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (product) {
                const updatedProduct: Product = {
                    ...product,
                    name: formData.name || '',
                    sku: formData.sku || '',
                    price: formData.salePrice || 0,
                    supplierPrice: formData.supplierPrice || 0,
                    salePrice: formData.salePrice || 0,
                    purchasePrice: formData.purchasePrice || 0,
                    stock: Number(formData.stock) || 0,
                    category: formData.category || 'Geral',
                    images: formData.images || [],
                };
                const { error } = await updateProduct(updatedProduct);
                if (error) throw error;
            } else {
                const newProduct: Product = {
                    id: generateId(),
                    name: formData.name || 'Novo Produto',
                    sku: formData.sku || '',
                    price: formData.salePrice || 0,
                    supplierPrice: formData.supplierPrice || 0,
                    salePrice: formData.salePrice || 0,
                    purchasePrice: formData.purchasePrice || 0,
                    stock: Number(formData.stock) || 0,
                    category: formData.category || 'Geral',
                    images: formData.images || [],
                };
                const { error } = await addProduct(newProduct);
                if (error) throw error;
            }
            onClose();
            if (!product) {
                setFormData({
                    name: '',
                    sku: '',
                    supplierPrice: 0,
                    salePrice: 0,
                    purchasePrice: 0,
                    stock: 0,
                    category: '',
                    images: [],
                });
            }
        } catch (error) {
            console.error("Failed to save product:", error);
            alert("Erro ao salvar produto. Verifique o console para mais detalhes.");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader className="p-8 border-b border-white/5 bg-white/[0.02]">
                    <DialogTitle className="text-2xl font-black text-white">{product ? 'Editar' : 'Novo'} <span className="text-primary">Produto</span></DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-primary/60">Nome do Produto</label>
                            <Input
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ex: Cadeira Ergonômica"
                                className="bg-white/5 border-white/10"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-primary/60">SKU</label>
                            <Input
                                value={formData.sku}
                                onChange={e => setFormData({ ...formData, sku: e.target.value })}
                                placeholder="Ex: CAD-001"
                                className="bg-white/5 border-white/10"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-primary/60">Preço Fornecedor</label>
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">R$</span>
                                <Input
                                    type="number"
                                    className="pl-10 bg-white/5 border-white/10"
                                    value={formData.supplierPrice}
                                    onChange={e => handleSupplierPriceChange(Number(e.target.value))}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-emerald-400">Preço Venda (+70%)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400/60">R$</span>
                                <Input
                                    type="number"
                                    className="pl-10 bg-emerald-500/5 border-emerald-500/20 text-emerald-400 font-black h-12"
                                    value={formData.salePrice}
                                    readOnly
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-blue-400">Preço Compra (50%)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400/60">R$</span>
                                <Input
                                    type="number"
                                    className="pl-10 bg-blue-500/5 border-blue-500/20 text-blue-400 font-black h-12"
                                    value={formData.purchasePrice}
                                    readOnly
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-primary/60">Estoque Inicial</label>
                            <Input
                                type="number"
                                value={formData.stock}
                                onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })}
                                placeholder="0"
                                className="bg-white/5 border-white/10"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-primary/60">Categoria</label>
                            <Select
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                className="bg-white/5 border-white/10"
                            >
                                <option value="" className="bg-[#020617] text-white">Selecione uma categoria...</option>
                                {PRODUCT_CATEGORIES.map(cat => (
                                    <option key={cat} value={cat} className="bg-[#020617] text-white">{cat}</option>
                                ))}
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-medium">Imagens do Produto</label>

                        {/* Drag & Drop Zone */}
                        <div
                            className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors hover:bg-muted/50 hover:border-primary/50"
                            onDragOver={(e: React.DragEvent<HTMLDivElement>) => {
                                e.preventDefault();
                                e.currentTarget.classList.add('border-primary', 'bg-primary/5');
                            }}
                            onDragLeave={(e: React.DragEvent<HTMLDivElement>) => {
                                e.preventDefault();
                                e.currentTarget.classList.remove('border-primary', 'bg-primary/5');
                            }}
                            onDrop={(e: React.DragEvent<HTMLDivElement>) => {
                                e.preventDefault();
                                e.currentTarget.classList.remove('border-primary', 'bg-primary/5');
                                const files = Array.from(e.dataTransfer.files);
                                files.forEach((file: File) => {
                                    if (file.type.startsWith('image/')) {
                                        const reader = new FileReader();
                                        reader.onload = (event) => {
                                            if (event.target?.result) {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    images: [...(prev.images || []), event.target!.result as string]
                                                }));
                                            }
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                });
                            }}
                        >
                            <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                            <div className="text-sm font-medium">Arraste e solte imagens aqui</div>
                            <div className="text-xs text-muted-foreground mt-1">ou cole uma URL abaixo</div>
                        </div>

                        <div className="flex gap-4">
                            <Input
                                value={imageUrlInput}
                                onChange={e => setImageUrlInput(e.target.value)}
                                placeholder="Cole a URL da imagem aqui..."
                                className="flex-1 bg-white/5 border-white/10"
                            />
                            <Button type="button" variant="secondary" className="px-6 rounded-2xl" onClick={handleAddImage}>
                                <Plus className="h-4 w-4 mr-2" /> Adicionar
                            </Button>
                        </div>

                        {/* Image Preview Grid */}
                        {formData.images && formData.images.length > 0 && (
                            <div className="grid grid-cols-4 gap-4 mt-4">
                                {formData.images.map((img, idx) => (
                                    <div key={idx} className="relative group aspect-square rounded-lg border overflow-hidden bg-muted">
                                        <img src={img} alt={`Preview ${idx}`} className="h-full w-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveImage(idx)}
                                            className="absolute top-1 right-1 h-6 w-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
                        <Button type="submit">{product ? 'Salvar Alterações' : 'Salvar Produto'}</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
