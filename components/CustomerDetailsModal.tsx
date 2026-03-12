import React, { useState, useEffect } from 'react';
import { Customer, Product, Tag } from '../types';
import { useStore } from '../store';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Input, Dialog, DialogContent, DialogHeader, DialogTitle, Badge } from './ui/primitives';
import { Plus, Search, Mail, Phone, DollarSign, Trash2, Package, X, Minus, FileText, User } from 'lucide-react';
import { generateQuotePDF } from '../utils/pdfGenerator';
import { TagManager } from './TagManager';
import { InvoiceManager } from './InvoiceManager';

interface CustomerDetailsModalProps {
    customer: Customer | null;
    isOpen: boolean;
    onClose: () => void;
    onDelete: (id: string) => void;
}

export const CustomerDetailsModal: React.FC<CustomerDetailsModalProps> = ({ customer, isOpen, onClose, onDelete }) => {
    const { products, tags, fieldDefinitions, updateCustomer } = useStore();
    const [productSearch, setProductSearch] = useState('');
    const [localCustomer, setLocalCustomer] = useState<Customer | null>(customer);
    const [isTagSelectorOpen, setIsTagSelectorOpen] = useState(false);

    useEffect(() => {
        if (customer) {
            setLocalCustomer(customer);
        }
    }, [customer]);

    if (!isOpen) return null;

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.sku.toLowerCase().includes(productSearch.toLowerCase())
    );

    const handleUpdateCustomer = (updates: Partial<Customer>) => {
        if (!localCustomer) return;
        const updated = { ...localCustomer, ...updates };
        setLocalCustomer(updated);
        updateCustomer(updated);
    };

    const handleUpdateCustomField = (fieldId: string, value: any) => {
        if (!localCustomer) return;
        const customFields = { ...(localCustomer.customFields || {}), [fieldId]: value };
        handleUpdateCustomer({ customFields });
    };

    const handleAddProduct = (product: Product) => {
        if (!localCustomer) return;
        const updatedProducts = [...(localCustomer.products || []), product.id];
        calculateAndSetNewValue(updatedProducts, localCustomer.discount || 0, localCustomer.freight || 0);
    };

    const handleUpdateQuantity = (productId: string, delta: number) => {
        if (!localCustomer) return;
        const currentProducts = localCustomer.products || [];
        const count = currentProducts.filter(id => id === productId).length;
        const newCount = Math.max(0, count + delta);

        const otherProducts = currentProducts.filter(id => id !== productId);
        const newProductIds = Array(newCount).fill(productId);
        const updatedProducts = [...otherProducts, ...newProductIds];
        calculateAndSetNewValue(updatedProducts, localCustomer.discount || 0, localCustomer.freight || 0);
    };

    const handleRemoveProduct = (productId: string) => {
        if (!localCustomer) return;
        const updatedProducts = (localCustomer.products || []).filter(id => id !== productId);
        calculateAndSetNewValue(updatedProducts, localCustomer.discount || 0, localCustomer.freight || 0);
    };

    const calculateAndSetNewValue = (updatedProducts: string[], discount: number, freight: number) => {
        const subtotal = updatedProducts.reduce((acc, id) => {
            const p = products.find(prod => prod.id === id);
            return acc + (p ? p.salePrice : 0);
        }, 0);
        const newValue = (subtotal * (1 - discount / 100)) + freight;
        handleUpdateCustomer({ products: updatedProducts, value: newValue, discount, freight });
    };

    const handleUpdateFinancials = (key: 'discount' | 'freight', val: number) => {
        if (!localCustomer) return;
        const currentProducts = localCustomer.products || [];
        const discount = key === 'discount' ? val : (localCustomer.discount || 0);
        const freight = key === 'freight' ? val : (localCustomer.freight || 0);
        calculateAndSetNewValue(currentProducts, discount, freight);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()} isDraggable={false}>
            <DialogContent className="max-w-6xl max-h-[92vh] overflow-hidden p-0 border-foreground/10 bg-background/80 dark:bg-black/80 backdrop-blur-3xl shadow-[0_0_80px_-12px_hsl(var(--primary)/0.3)] rounded-[2.5rem]">
                {!localCustomer ? (
                    <div className="h-[60vh] flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <div className="flex flex-col h-full max-h-[92vh]">
                        <DialogHeader className="flex flex-row items-center justify-between p-8 border-b border-white/5 bg-white/[0.02]">
                            <DialogTitle className="flex items-center gap-6 flex-1">
                                <div className="h-16 w-16 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/20 shadow-glow overflow-hidden">
                                    {localCustomer.avatar && localCustomer.avatar.startsWith('http') ? (
                                        <img src={localCustomer.avatar} alt={localCustomer.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="h-full w-full bg-gradient-to-br from-primary/10 to-primary/40 flex items-center justify-center text-primary font-black text-xl">
                                            {localCustomer.name.substring(0, 2).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 max-w-md">
                                    <Input
                                        value={localCustomer.name}
                                        onChange={(e) => handleUpdateCustomer({ name: e.target.value })}
                                        className="font-black text-3xl border-none p-0 h-auto bg-transparent focus-visible:ring-0 text-foreground placeholder:text-foreground/20 tracking-tight"
                                        placeholder="Nome do Cliente"
                                    />
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">Perfil do Cliente</span>
                                        <span className="h-1 w-1 rounded-full bg-primary/30" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40">ID: {localCustomer.id.slice(0, 8)}</span>
                                    </div>
                                </div>
                            </DialogTitle>
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onDelete(localCustomer.id)}
                                    className="h-12 w-12 rounded-2xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all group"
                                    title="Excluir Card"
                                >
                                    <Trash2 className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onClose}
                                    className="h-12 w-12 rounded-2xl text-muted-foreground hover:bg-foreground/10 hover:text-foreground transition-all"
                                    title="Fechar"
                                >
                                    <X className="h-6 w-6" />
                                </Button>
                            </div>
                        </DialogHeader>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-y-auto no-scrollbar">
                            {/* Left Column: Info */}
                            <div className="lg:col-span-4 p-10 border-r border-white/5 bg-white/[0.01] space-y-10">
                                <div className="space-y-8">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40">Informações de Contato</h4>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-primary/60">Empresa / Negócio</label>
                                            <div className="relative group">
                                                <Package className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40 group-focus-within:text-primary transition-colors" />
                                                <Input
                                                    value={localCustomer.company}
                                                    onChange={(e) => handleUpdateCustomer({ company: e.target.value })}
                                                    className="pl-12 bg-foreground/5 dark:bg-white/5 border-white/5 h-12 rounded-2xl focus:bg-white/10 transition-all font-medium"
                                                    placeholder="Nome da empresa"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-primary/60">WhatsApp / Telefone</label>
                                            <div className="relative group">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40 group-focus-within:text-primary transition-colors" />
                                                <Input
                                                    value={localCustomer.phone}
                                                    onChange={(e) => handleUpdateCustomer({ phone: e.target.value })}
                                                    className="pl-12 bg-foreground/5 dark:bg-white/5 border-white/5 h-12 rounded-2xl focus:bg-white/10 transition-all font-medium"
                                                    placeholder="(00) 00000-0000"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-primary/60">E-mail Principal</label>
                                            <div className="relative group">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40 group-focus-within:text-primary transition-colors" />
                                                <Input
                                                    value={localCustomer.email}
                                                    onChange={(e) => handleUpdateCustomer({ email: e.target.value })}
                                                    className="pl-12 bg-foreground/5 dark:bg-white/5 border-white/5 h-12 rounded-2xl focus:bg-white/10 transition-all font-medium"
                                                    placeholder="email@exemplo.com"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-primary/60">Origem da Venda</label>
                                            <div className="flex items-center gap-3 bg-foreground/5 dark:bg-white/5 border border-white/5 h-12 rounded-2xl px-4 group focus-within:ring-2 focus-within:ring-primary/40 transition-all">
                                                {localCustomer.saleOrigin === 'loja_integrada' ? (
                                                    <img src="/assets/loja-integrada.png" className="h-5 object-contain" alt="Loja Integrada" />
                                                ) : localCustomer.saleOrigin === 'whatsapp' ? (
                                                    <span className="text-xl">📱</span>
                                                ) : localCustomer.saleOrigin === 'instagram' ? (
                                                    <span className="text-xl">📸</span>
                                                ) : localCustomer.saleOrigin === 'google' ? (
                                                    <span className="text-xl">🔍</span>
                                                ) : (
                                                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-black">?</div>
                                                )}
                                                <select
                                                    value={localCustomer.saleOrigin || ''}
                                                    onChange={(e) => handleUpdateCustomer({ saleOrigin: e.target.value })}
                                                    className="flex-1 bg-transparent border-none text-sm focus:outline-none appearance-none font-bold text-foreground dark:text-white"
                                                >
                                                    <option value="" className="bg-background text-foreground">Selecione a origem...</option>
                                                    <option value="whatsapp" className="bg-background text-foreground">WhatsApp</option>
                                                    <option value="loja_integrada" className="bg-background text-foreground">Loja Integrada</option>
                                                    <option value="instagram" className="bg-background text-foreground">Instagram</option>
                                                    <option value="google" className="bg-background text-foreground">Google</option>
                                                    <option value="site" className="bg-background text-foreground">Site</option>
                                                    <option value="indication" className="bg-background text-foreground">Indicação</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-10 border-t border-white/5">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40">Etiquetas / Tags</label>
                                        <Button variant="ghost" size="sm" className="h-6 text-[10px] font-black uppercase tracking-widest hover:bg-primary/10 hover:text-primary transition-all px-2 rounded-lg" onClick={() => setIsTagSelectorOpen(!isTagSelectorOpen)}>
                                            {isTagSelectorOpen ? 'Fechar' : 'Gerenciar'}
                                        </Button>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {(localCustomer.tags || []).map(tagId => {
                                            const tag = tags.find(t => t.id === tagId);
                                            if (!tag) return null;
                                            return (
                                                <span
                                                    key={tag.id}
                                                    className="inline-flex items-center rounded-xl px-3 py-1 text-[10px] font-black uppercase tracking-widest border transition-all shadow-glow-sm"
                                                    style={{
                                                        backgroundColor: `${tag.color}15`,
                                                        borderColor: `${tag.color}40`,
                                                        color: tag.color
                                                    }}
                                                >
                                                    {tag.name}
                                                </span>
                                            );
                                        })}
                                    </div>

                                    {isTagSelectorOpen && (
                                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4 animate-in slide-in-from-top-2 duration-300">
                                            <div className="flex flex-wrap gap-2">
                                                {tags.map(tag => {
                                                    const isSelected = (localCustomer.tags || []).includes(tag.id);
                                                    return (
                                                        <div
                                                            key={tag.id}
                                                            onClick={() => {
                                                                const currentTags = localCustomer.tags || [];
                                                                const newTags = isSelected
                                                                    ? currentTags.filter(t => t !== tag.id)
                                                                    : [...currentTags, tag.id];
                                                                handleUpdateCustomer({ tags: newTags });
                                                            }}
                                                            className={`cursor-pointer inline-flex items-center rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-widest border transition-all ${isSelected ? 'ring-2 ring-primary/40 scale-105' : 'opacity-40 hover:opacity-100 hover:scale-105'}`}
                                                            style={{
                                                                backgroundColor: `${tag.color}15`,
                                                                borderColor: `${tag.color}40`,
                                                                color: tag.color,
                                                            }}
                                                        >
                                                            {tag.name}
                                                            {isSelected && <X className="ml-1.5 h-3 w-3" />}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {Object.keys(localCustomer.customFields || {}).length > 0 && (
                                    <div className="space-y-6 pt-10 border-t border-white/5">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40">Dados Adicionais</h4>
                                        <div className="space-y-6">
                                            {Object.entries(localCustomer.customFields || {}).map(([fieldId, value]) => {
                                                const fieldDef = fieldDefinitions.find(f => f.id === fieldId);
                                                return (
                                                    <div key={fieldId} className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-primary/60">{fieldDef?.name || fieldId}</label>
                                                        <Input
                                                            value={String(value)}
                                                            onChange={(e) => handleUpdateCustomField(fieldId, e.target.value)}
                                                            className="bg-foreground/5 dark:bg-white/5 border-white/5 h-12 rounded-2xl focus:bg-white/10 transition-all font-medium"
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Column: Products & Budget */}
                            <div className="lg:col-span-8 p-10 space-y-10 bg-black/20">
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40 flex items-center gap-3">
                                            <DollarSign className="h-4 w-4" /> Composição do Orçamento
                                        </h4>
                                        <Badge variant="outline" className="border-primary/20 text-primary">
                                            {localCustomer.products?.length || 0} Itens
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        {(() => {
                                            const productCounts: Record<string, number> = {};
                                            (localCustomer.products || []).forEach(id => {
                                                productCounts[id] = (productCounts[id] || 0) + 1;
                                            });

                                            const uniqueProductIds = Object.keys(productCounts);

                                            if (uniqueProductIds.length === 0) {
                                                return (
                                                    <div className="text-sm text-muted-foreground text-center py-20 border-2 border-dashed border-white/5 rounded-[2.5rem] bg-white/[0.01]">
                                                        <Package className="h-12 w-12 mx-auto mb-4 opacity-10" />
                                                        <p className="font-medium">Nenhum produto vinculado ao orçamento.</p>
                                                        <p className="text-xs opacity-50 mt-1">Use a busca abaixo para adicionar itens.</p>
                                                    </div>
                                                );
                                            }

                                            return uniqueProductIds.map((productId) => {
                                                const product = products.find(p => p.id === productId);
                                                const quantity = productCounts[productId];
                                                if (!product) return null;

                                                return (
                                                    <motion.div
                                                        key={productId}
                                                        layout
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="flex items-center justify-between p-6 rounded-[2.5rem] border border-white/5 bg-white/[0.02] group/item hover:bg-white/[0.04] transition-all hover:border-primary/30"
                                                    >
                                                        <div className="flex items-center gap-6 flex-1">
                                                            <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover/item:border-primary/20 overflow-hidden relative">
                                                                {product.images?.[0] ? (
                                                                    <img src={product.images[0]} className="h-full w-full object-cover" />
                                                                ) : (
                                                                    <Package className="h-8 w-8 text-muted-foreground/20" />
                                                                )}
                                                                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <div className="text-lg font-black text-foreground dark:text-white group-hover/item:text-primary transition-colors">{product.name}</div>
                                                                <div className="flex items-center gap-3">
                                                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">{product.sku}</span>
                                                                    <span className="h-1 w-1 rounded-full bg-white/10" />
                                                                    <div className="text-sm font-black text-emerald-400">
                                                                        {product.salePrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-8">
                                                            <div className="flex items-center gap-4 bg-black/40 rounded-2xl border border-white/5 p-1.5 h-12">
                                                                <button
                                                                    className="h-9 w-9 flex items-center justify-center hover:bg-primary/20 rounded-xl text-muted-foreground hover:text-primary transition-all active:scale-90"
                                                                    onClick={() => handleUpdateQuantity(productId, -1)}
                                                                >
                                                                    <Minus className="h-4 w-4" />
                                                                </button>
                                                                <span className="text-base font-black w-6 text-center">{quantity}</span>
                                                                <button
                                                                    className="h-9 w-9 flex items-center justify-center hover:bg-primary/20 rounded-xl text-muted-foreground hover:text-primary transition-all active:scale-90"
                                                                    onClick={() => handleUpdateQuantity(productId, 1)}
                                                                >
                                                                    <Plus className="h-4 w-4" />
                                                                </button>
                                                            </div>

                                                            <div className="text-right min-w-[120px]">
                                                                <div className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Total Item</div>
                                                                <div className="text-xl font-black text-foreground dark:text-white">
                                                                    {(product.salePrice * quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                                </div>
                                                            </div>

                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-12 w-12 rounded-2xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive flex-shrink-0"
                                                                onClick={() => handleRemoveProduct(productId)}
                                                            >
                                                                <X className="h-5 w-5" />
                                                            </Button>
                                                        </div>
                                                    </motion.div>
                                                );
                                            });
                                        })()}
                                    </div>
                                </div>

                                <div className="space-y-4 pt-6">
                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40">Busca Rápida de Produtos</label>
                                    <div className="relative group">
                                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        <Input
                                            placeholder="Digite nome ou SKU para buscar..."
                                            className="pl-14 bg-white/5 border-white/10 h-16 rounded-3xl focus:bg-white/[0.08] text-lg placeholder:text-muted-foreground/20 focus:border-primary/30"
                                            value={productSearch}
                                            onChange={(e) => setProductSearch(e.target.value)}
                                        />
                                    </div>

                                    <AnimatePresence>
                                        {productSearch && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                                                className="border border-white/10 rounded-[2.5rem] max-h-80 overflow-y-auto bg-[#0a0a0b]/95 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] absolute z-50 mt-4 p-4 space-y-2 backdrop-blur-3xl border-primary/20 w-[calc(100%-5rem)]"
                                            >
                                                {filteredProducts.map(product => (
                                                    <div
                                                        key={product.id}
                                                        className="flex items-center gap-5 p-4 rounded-2xl hover:bg-primary/10 cursor-pointer transition-all group/searchItem border border-transparent hover:border-primary/20 bg-white/5"
                                                        onClick={() => {
                                                            handleAddProduct(product);
                                                            setProductSearch('');
                                                        }}
                                                    >
                                                        <div className="h-14 w-14 rounded-xl bg-white/10 overflow-hidden border border-white/10 shrink-0">
                                                            {product.images?.[0] ? (
                                                                <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover group-hover/searchItem:scale-110 transition-transform duration-500" />
                                                            ) : (
                                                                <Package className="h-6 w-6 text-muted-foreground/30" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-base font-black text-white group-hover/searchItem:text-primary transition-colors truncate">{product.name}</div>
                                                            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{product.sku}</div>
                                                        </div>
                                                        <div className="text-right mr-3">
                                                            <div className="text-lg font-black text-emerald-400">
                                                                {product.salePrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                            </div>
                                                            <div className="text-[10px] font-black text-emerald-400/40 uppercase tracking-widest">Preço</div>
                                                        </div>
                                                        <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center opacity-0 group-hover/searchItem:opacity-100 transition-all scale-75 group-hover/searchItem:scale-100">
                                                            <Plus className="h-6 w-6 text-primary" />
                                                        </div>
                                                    </div>
                                                ))}
                                                {filteredProducts.length === 0 && (
                                                    <div className="p-10 text-sm text-muted-foreground text-center italic opacity-50">Nenhum produto encontrado.</div>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Detailed Financial & PDF Section */}
                                <div className="space-y-8 pt-10 border-t border-white/5">
                                    <div className="grid grid-cols-1 gap-6 bg-emerald-500/5 border border-emerald-500/10 p-8 rounded-[2.5rem]">
                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Valor do Frete</label>
                                                    <Badge variant="outline" className="border-emerald-500/20 text-emerald-400 text-[8px] h-4">BRL</Badge>
                                                </div>
                                                <Input
                                                    type="number"
                                                    value={localCustomer.freight || 0}
                                                    onChange={(e) => handleUpdateFinancials('freight', Number(e.target.value))}
                                                    className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-black h-14 text-xl focus:bg-emerald-500/20 transition-all rounded-2xl"
                                                    placeholder="0,00"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/40">Transportadora</label>
                                                </div>
                                                <select
                                                    value={localCustomer.carrier || ''}
                                                    onChange={(e) => handleUpdateCustomer({ carrier: e.target.value })}
                                                    className="w-full bg-foreground/5 dark:bg-white/5 border border-white/10 h-14 rounded-2xl px-5 text-sm outline-none focus:ring-2 focus:ring-primary/40 appearance-none font-bold text-foreground dark:text-white"
                                                >
                                                    <option value="" className="bg-background">Selecione uma transportadora...</option>
                                                    <option value="TransOliveira" className="bg-background">TransOliveira</option>
                                                    <option value="Sao Miguel" className="bg-background">Sao Miguel</option>
                                                    <option value="Melhor Envio" className="bg-background">Melhor Envio</option>
                                                </select>
                                            </div>
                                        </div>

                                        {localCustomer.carrier === 'TransOliveira' && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                className="space-y-3 pt-6 border-t border-emerald-500/10"
                                            >
                                                <label className="text-[10px] font-black uppercase tracking-widest text-emerald-400/60 flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                                    Nº da Cotação TransOliveira
                                                </label>
                                                <Input
                                                    value={localCustomer.quoteNumber || ''}
                                                    onChange={(e) => handleUpdateCustomer({ quoteNumber: e.target.value })}
                                                    className="bg-emerald-500/10 border-emerald-500/10 text-emerald-400 h-14 rounded-2xl placeholder:text-emerald-500/20 font-bold tracking-widest text-center text-lg"
                                                    placeholder="DIGITE A COTAÇÃO"
                                                />
                                            </motion.div>
                                        )}

                                        <div className="grid grid-cols-2 gap-8 border-t border-emerald-500/10 pt-6 mt-2">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-red-400/60">Aplicar Desconto (%)</label>
                                                <Input
                                                    type="number"
                                                    value={localCustomer.discount || 0}
                                                    onChange={(e) => handleUpdateFinancials('discount', Number(e.target.value))}
                                                    className="bg-red-500/5 border-red-500/20 text-red-400 font-black h-12 rounded-xl text-lg"
                                                    max={100}
                                                    min={0}
                                                />
                                            </div>
                                            <div className="flex flex-col justify-end text-right">
                                                <div className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-1">Subtotal Bruto</div>
                                                <div className="text-lg font-black opacity-50 line-through decoration-red-500/50">
                                                    {((localCustomer.products || []).reduce((acc, id) => acc + (products.find(p => p.id === id)?.salePrice || 0), 0)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between bg-primary p-1 rounded-[3rem] shadow-glow">
                                        <div className="flex-1 px-10 py-6">
                                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-1">Total Consolidado</p>
                                            <p className="text-4xl font-black text-white tracking-tight">
                                                {(localCustomer.value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </p>
                                        </div>
                                        <Button
                                            className="h-20 px-12 rounded-[2.8rem] bg-white text-primary hover:bg-white/90 shadow-xl transition-all font-black text-lg group"
                                            onClick={() => generateQuotePDF(localCustomer, products)}
                                        >
                                            <FileText className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform" /> Gerar Orçamento PDF
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-8 pt-10 border-t border-white/5">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40 flex items-center gap-3">
                                        <FileText className="h-4 w-4" /> Gestão de Notas e Documentos
                                    </h4>
                                    <InvoiceManager customerId={localCustomer.id} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};
