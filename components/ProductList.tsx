import React, { useState } from 'react';
import { useStore } from '../store';
import { Badge, Button, Input, Select, cn } from './ui/primitives';
import { Plus, Search, Filter, MoreHorizontal, ArrowUpDown, Pencil, Trash2, CheckSquare, Square, X, RefreshCcw, Loader2 } from 'lucide-react';
import { Product } from '../types';
import { AddProductModal } from './AddProductModal';
import { BulkEditProductModal } from './BulkEditProductModal';
import { blingService } from '../lib/blingService';

export const ProductList = () => {
    const { products, deleteProduct, updateProduct, addProduct, fetchData } = useStore();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);

    const handleSyncBling = async () => {
        setIsSyncing(true);
        try {
            const blingProducts = await blingService.fetchAllProducts();
            let syncCount = 0;
            let newCount = 0;

            for (const bp of blingProducts) {
                const mapped = blingService.mapBlingProductToCRM(bp);
                const existing = products.find(p => p.sku === mapped.sku);

                if (existing) {
                    // Update existing
                    await updateProduct({ ...existing, ...mapped, id: existing.id });
                    syncCount++;
                } else {
                    // Add new
                    await addProduct(mapped);
                    newCount++;
                }
            }

            await fetchData();
            alert(`Sincronização concluída! ${syncCount} atualizados, ${newCount} novos.`);
        } catch (err: any) {
            console.error(err);
            alert('Erro ao sincronizar: ' + err.message);
        } finally {
            setIsSyncing(false);
        }
    };

    // Bulk Actions State
    const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
    const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);

    const handleEditClick = (product: Product) => {
        setEditingProduct(product);
        setIsAddModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsAddModalOpen(false);
        setEditingProduct(null);
    };

    const getCategoryStyle = (category: string) => {
        const styles: Record<string, string> = {
            'Balanço': 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
            'Escorregadores': 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
            'Brinquedos de Molas': 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
            'Casinhas': 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
            'Mini Playgrounds': 'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800',
            'Bancos': 'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-800',
            'Tubos': 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800',
            'Geral': 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
        };
        return styles[category] || 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    };

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [sortConfig, setSortConfig] = useState<{ key: keyof Product; direction: 'asc' | 'desc' } | null>(null);

    const handleSort = (key: keyof Product) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const filteredProducts = products
        .filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.sku.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
            if (!sortConfig) return 0;

            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            if (aValue === undefined || bValue === undefined) return 0;

            if (aValue < bValue) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });

    const uniqueCategories = Array.from(new Set(products.map(p => p.category))).filter(Boolean);

    // --- Selection Logic ---
    const toggleSelectAll = () => {
        if (selectedProducts.size === filteredProducts.length && filteredProducts.length > 0) {
            setSelectedProducts(new Set());
        } else {
            setSelectedProducts(new Set(filteredProducts.map(p => p.id)));
        }
    };

    const toggleSelect = (id: string) => {
        const newSelected = new Set(selectedProducts);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedProducts(newSelected);
    };

    const handleBulkDelete = () => {
        if (window.confirm(`Tem certeza que deseja excluir ${selectedProducts.size} produtos?`)) {
            selectedProducts.forEach(id => deleteProduct(id));
            setSelectedProducts(new Set());
        }
    };

    const handleBulkEditSave = (updates: any) => {
        selectedProducts.forEach(id => {
            const product = products.find(p => p.id === id);
            if (product) {
                updateProduct({ ...product, ...updates });
            }
        });
        setSelectedProducts(new Set());
    };

    const { isLoading } = useStore();

    if (isLoading) {
        return (
            <div className="space-y-8 animate-pulse">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-card/50 p-6 rounded-2xl border">
                    <div className="flex gap-4 w-full sm:w-auto">
                        <div className="h-12 w-96 bg-white/5 rounded-2xl" />
                        <div className="h-12 w-48 bg-white/5 rounded-2xl" />
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <div className="h-12 w-40 bg-white/5 rounded-2xl" />
                        <div className="h-12 w-40 bg-white/5 rounded-2xl" />
                    </div>
                </div>
                <div className="h-[500px] w-full bg-white/5 border border-white/10 rounded-3xl" />
            </div>
        );
    }

    return (
        <div className="space-y-8 p-2 relative">
            <AddProductModal
                isOpen={isAddModalOpen}
                onClose={handleCloseModal}
                product={editingProduct}
            />

            <BulkEditProductModal
                isOpen={isBulkEditModalOpen}
                onClose={() => setIsBulkEditModalOpen(false)}
                selectedCount={selectedProducts.size}
                onSave={handleBulkEditSave}
            />

            {/* Header & Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-card/50 p-6 rounded-2xl border shadow-sm backdrop-blur-sm">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="relative w-full sm:w-96 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Buscar por nome ou SKU..."
                            className="pl-12 bg-white/5 border-white/10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="relative min-w-[200px]">
                        <Select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            <option value="all" className="bg-[#020617] text-white">Todas Categorias</option>
                            {uniqueCategories.map(cat => (
                                <option key={cat} value={cat} className="bg-[#020617] text-white">{cat}</option>
                            ))}
                        </Select>
                    </div>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Button
                        variant="outline"
                        className="flex-1 sm:flex-none border-white/10 hover:bg-white/5"
                        onClick={handleSyncBling}
                        disabled={isSyncing}
                    >
                        {isSyncing ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <RefreshCcw className="mr-2 h-4 w-4" />
                        )}
                        {isSyncing ? 'Sincronizando...' : 'Sincronizar Bling'}
                    </Button>
                    <Button
                        className="flex-1 sm:flex-none shadow-glow"
                        onClick={() => setIsAddModalOpen(true)}
                    >
                        <Plus className="mr-2 h-5 w-5" /> Novo Produto
                    </Button>
                </div>
            </div>

            {/* Bulk Actions Floating Bar */}
            {
                selectedProducts.size > 0 && (
                    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-foreground text-background px-6 py-3 rounded-full shadow-2xl flex items-center gap-6 animate-in slide-in-from-bottom-10 fade-in duration-300 border border-white/20">
                        <div className="font-medium text-sm border-r border-background/20 pr-6">
                            {selectedProducts.size} selecionados
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                variant="ghost"
                                className="text-background hover:bg-background/20 h-8"
                                onClick={() => setIsBulkEditModalOpen(true)}
                            >
                                <Pencil className="mr-2 h-3.5 w-3.5" /> Editar
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="text-background hover:bg-red-500/80 hover:text-white h-8"
                                onClick={handleBulkDelete}
                            >
                                <Trash2 className="mr-2 h-3.5 w-3.5" /> Excluir
                            </Button>
                            <div className="w-px h-4 bg-background/20 mx-2" />
                            <Button
                                size="icon"
                                variant="ghost"
                                className="text-background hover:bg-background/20 h-8 w-8 rounded-full"
                                onClick={() => setSelectedProducts(new Set())}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )
            }

            {/* Table Card */}
            <div className="rounded-2xl border bg-card/50 backdrop-blur-sm shadow-xl shadow-black/5 overflow-hidden">
                <div className="w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm text-left">
                        <thead className="[&_tr]:border-b bg-muted/30">
                            <tr className="border-b border-border/50 transition-colors">
                                <th className="h-14 px-4 align-middle w-[50px]">
                                    <button
                                        className="flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                                        onClick={toggleSelectAll}
                                    >
                                        {selectedProducts.size > 0 && selectedProducts.size === filteredProducts.length ? (
                                            <CheckSquare className="h-5 w-5 text-primary" />
                                        ) : (
                                            <Square className="h-5 w-5" />
                                        )}
                                    </button>
                                </th>
                                <th className="h-14 px-6 align-middle font-semibold text-muted-foreground w-[100px]">Imagem</th>
                                <th className="h-14 px-6 align-middle font-semibold text-muted-foreground">
                                    <div
                                        className="flex items-center cursor-pointer hover:text-primary transition-colors select-none"
                                        onClick={() => handleSort('name')}
                                    >
                                        Nome
                                        <ArrowUpDown className={cn("ml-2 h-3 w-3 transition-colors", sortConfig?.key === 'name' ? "text-primary" : "text-muted-foreground/50")} />
                                    </div>
                                </th>
                                <th className="h-14 px-6 align-middle font-semibold text-muted-foreground">SKU</th>
                                <th className="h-14 px-6 align-middle font-semibold text-muted-foreground">
                                    <div
                                        className="flex items-center cursor-pointer hover:text-primary transition-colors select-none"
                                        onClick={() => handleSort('category')}
                                    >
                                        Categoria
                                        <ArrowUpDown className={cn("ml-2 h-3 w-3 transition-colors", sortConfig?.key === 'category' ? "text-primary" : "text-muted-foreground/50")} />
                                    </div>
                                </th>
                                <th className="h-14 px-6 align-middle font-semibold text-muted-foreground text-right">Valor de Compra</th>
                                <th className="h-14 px-6 align-middle font-semibold text-muted-foreground text-right">Valor de Venda</th>
                                <th className="h-14 px-6 align-middle font-semibold text-muted-foreground">Estoque</th>
                                <th className="h-14 px-6 align-middle font-semibold text-muted-foreground text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {filteredProducts.map((product) => (
                                <tr
                                    key={product.id}
                                    className={cn(
                                        "border-b border-border/50 transition-all hover:bg-muted/40 group",
                                        selectedProducts.has(product.id) && "bg-primary/5 hover:bg-primary/10"
                                    )}
                                >
                                    <td className="p-4 align-middle px-4">
                                        <button
                                            className="flex items-center justify-center text-muted-foreground/50 hover:text-primary transition-colors"
                                            onClick={() => toggleSelect(product.id)}
                                        >
                                            {selectedProducts.has(product.id) ? (
                                                <CheckSquare className="h-5 w-5 text-primary" />
                                            ) : (
                                                <Square className="h-5 w-5" />
                                            )}
                                        </button>
                                    </td>
                                    <td className="p-4 align-middle pl-6">
                                        <div className="h-12 w-12 rounded-xl bg-muted overflow-hidden border border-border/50 shadow-sm group-hover:scale-105 transition-transform duration-300">
                                            <img src={product.images?.[0] || 'https://via.placeholder.com/40'} alt={product.name} className="h-full w-full object-cover" />
                                        </div>
                                    </td>
                                    <td className="p-4 align-middle font-medium text-foreground text-base">{product.name}</td>
                                    <td className="p-4 align-middle text-muted-foreground font-mono text-xs bg-muted/30 px-2 py-1 rounded-md w-fit">{product.sku}</td>
                                    <td className="p-4 align-middle">
                                        <Badge variant="secondary" className={cn("font-medium border", getCategoryStyle(product.category))}>
                                            {product.category}
                                        </Badge>
                                    </td>
                                    <td className="p-4 align-middle text-right font-medium text-muted-foreground">
                                        {product.purchasePrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </td>
                                    <td className="p-4 align-middle text-right font-bold text-green-600 dark:text-green-400 text-base">
                                        {product.salePrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </td>
                                    <td className="p-4 align-middle">
                                        <div className="flex items-center gap-2">
                                            <div className={cn("h-2.5 w-2.5 rounded-full shadow-[0_0_8px]",
                                                product.stock < 10 ? "bg-red-500 shadow-red-500/50" :
                                                    product.stock < 30 ? "bg-yellow-500 shadow-yellow-500/50" : "bg-green-500 shadow-green-500/50"
                                            )} />
                                            <span className={cn("font-medium",
                                                product.stock < 10 ? "text-red-600 dark:text-red-400" :
                                                    product.stock < 30 ? "text-yellow-600 dark:text-yellow-400" : "text-green-600 dark:text-green-400"
                                            )}>{product.stock} un</span>
                                        </div>
                                    </td>
                                    <td className="p-4 align-middle text-right pr-6">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                                            onClick={() => handleEditClick(product)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {filteredProducts.length === 0 && (
                                <tr>
                                    <td colSpan={9} className="p-8 text-center text-muted-foreground">
                                        Nenhum produto encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div >
    );
};
