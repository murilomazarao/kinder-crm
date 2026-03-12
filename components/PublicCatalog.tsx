import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Product } from '../types';
import { LOGO_URL, LOGO_ICON_URL } from '../constants';
import {
    Search,
    Package,
    Tag,
    Info,
    ChevronRight,
    ShoppingCart,
    LayoutGrid,
    List,
    Filter,
    X,
    Sun,
    Moon,
    CheckCircle2,
    Zap,
    Image as ImageIcon,
    ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, cn } from './ui/primitives';

export const PublicCatalog: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    // Force light mode for the catalog
    useEffect(() => {
        document.documentElement.classList.remove('dark');
        return () => {
            // Restore dark mode if that's the app default when leaving
            // This depends on the main app's state, but for the catalog we want light
        };
    }, []);

    const brandColors = {
        blue: '#0f75bc',
        green: '#8cc63f',
        orange: '#f7941e',
        white: '#ffffff'
    };

    const fetchProducts = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('name');

        if (error) {
            console.error('Error fetching products:', error);
        } else {
            setProducts((data || []).map((p: any) => ({
                ...p,
                salePrice: p.sale_price,
                images: p.images || (p.image ? [p.image] : []),
            })) as Product[]);
        }
        setIsLoading(false);
    };

    const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = !selectedCategory || p.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(price);
    };

    const LOGO_MAIN = LOGO_URL;
    const LOGO_ICON = LOGO_ICON_URL;

    return (
        <div className="min-h-screen bg-[hsl(var(--background))] text-foreground flex flex-col font-sans selection:bg-primary/30">
            {/* Background Orbs with Brand Colors */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <motion.div
                    animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, 30, 0] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#0f75bc]/5 rounded-full blur-[160px] opacity-40"
                />
                <motion.div
                    animate={{ scale: [1, 1.3, 1], x: [0, -40, 0], y: [0, -50, 0] }}
                    transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute bottom-[-15%] right-[-15%] w-[60%] h-[60%] bg-[#8cc63f]/5 rounded-full blur-[180px] opacity-30"
                />
            </div>

            {/* Header */}
            <header className="sticky top-0 z-50 w-full bg-background/60 backdrop-blur-2xl border-b border-foreground/5 py-4 px-6 md:px-12 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <img src={LOGO_MAIN} alt="Kinderplay" className="h-10 md:h-12 object-contain dark:brightness-110" />
                    <div className="hidden md:block h-8 w-[1px] bg-foreground/10 mx-2" />
                    <div className="hidden md:block">
                        <h1 className="text-lg font-bold tracking-tight">Catálogo Oficial</h1>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-60">Linha Completa 2026</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-[#0f75bc] transition-colors" />
                        <input
                            type="text"
                            placeholder="Encontrar diversão..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-black/5 border border-black/5 rounded-2xl pl-11 pr-4 py-2.5 text-sm w-72 focus:bg-white focus:ring-4 focus:ring-[#0f75bc]/10 focus:border-[#0f75bc]/20 transition-all outline-none"
                        />
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden rounded-2xl bg-black/5"
                        onClick={() => {/* Toggle search on mobile */ }}
                    >
                        <Search className="h-5 w-5" />
                    </Button>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative py-16 px-6 md:px-12 overflow-hidden text-center">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                <div className="relative z-10 max-w-4xl mx-auto space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none mb-2 text-slate-900">
                            Catálogo Digital <br />
                            <span className="text-[#0f75bc] drop-shadow-[0_0_15px_rgba(15,117,188,0.2)]">Kinderplay</span>
                        </h1>
                        <p className="text-sm md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                            🎯 Explore nossa linha completa de produtos com descrição detalhada, <span className="text-[#f7941e] font-bold">imagens em alta qualidade</span> e <span className="text-[#8cc63f] font-bold">preços especiais!</span>
                        </p>

                        {/* Feature Badges */}
                        <div className="flex flex-wrap justify-center gap-4 py-4">
                            {[
                                { icon: CheckCircle2, text: "Preços Atualizados", color: "text-[#8cc63f]", bg: "bg-[#8cc63f]/10" },
                                { icon: ImageIcon, text: "Imagens HD", color: "text-[#0f75bc]", bg: "bg-[#0f75bc]/10" },
                                { icon: Zap, text: "Entrega Rápida", color: "text-[#f7941e]", bg: "bg-[#f7941e]/10" },
                            ].map((badge, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.2 + (idx * 0.1) }}
                                    className={cn("flex items-center gap-2 px-4 py-2 rounded-full border border-foreground/5 shadow-sm backdrop-blur-md", badge.bg)}
                                >
                                    <badge.icon className={cn("h-4 w-4", badge.color)} />
                                    <span className="text-xs font-bold tracking-wide">{badge.text}</span>
                                </motion.div>
                            ))}
                        </div>

                        <div className="flex justify-center flex-col items-center gap-6">
                            <div className="w-24 h-1 px-[2px] rounded-full bg-gradient-to-r from-emerald-400 via-blue-500 to-primary" />
                            <motion.div
                                animate={{ y: [0, 5, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <ChevronDown className="h-6 w-6 text-muted-foreground opacity-40" />
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Category Filter */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-wrap justify-center gap-3 pt-4"
                    >
                        <Button
                            variant={selectedCategory === null ? 'primary' : 'secondary'}
                            size="sm"
                            style={{ backgroundColor: selectedCategory === null ? '#0f75bc' : '' }}
                            className={cn("rounded-full px-8 font-bold border-none shadow-md",
                                selectedCategory === null ? "text-white" : "bg-slate-100 text-slate-600"
                            )}
                            onClick={() => setSelectedCategory(null)}
                        >
                            Todos os Produtos
                        </Button>
                        {categories.map(cat => (
                            <Button
                                key={cat}
                                variant={selectedCategory === cat ? 'primary' : 'secondary'}
                                size="sm"
                                style={{ backgroundColor: selectedCategory === cat ? '#0f75bc' : '' }}
                                className={cn("rounded-full px-8 font-bold border-none shadow-md",
                                    selectedCategory === cat ? "text-white" : "bg-slate-100 text-slate-600"
                                )}
                                onClick={() => setSelectedCategory(cat)}
                            >
                                {cat}
                            </Button>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl mx-auto w-full px-6 md:px-12 pb-24">
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="h-80 rounded-3xl bg-foreground/5 animate-pulse" />
                        ))}
                    </div>
                ) : filteredProducts.length > 0 ? (
                    <motion.div
                        layout
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                    >
                        <AnimatePresence mode="popLayout">
                            {filteredProducts.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    formatPrice={formatPrice}
                                    onClick={() => setSelectedProduct(product)}
                                />
                            ))}
                        </AnimatePresence>
                    </motion.div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 opacity-50">
                        <Package className="h-16 w-16 mb-4" />
                        <h3 className="text-xl font-bold">Nenhum produto encontrado</h3>
                        <p>Tente ajustar sua busca ou filtros.</p>
                    </div>
                )}
            </main>

            {/* Product Detail Modal */}
            <AnimatePresence>
                {selectedProduct && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedProduct(null)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            layoutId={`product-${selectedProduct.id}`}
                            className="relative w-full max-w-4xl bg-background rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-foreground/10"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                        >
                            <button
                                onClick={() => setSelectedProduct(null)}
                                className="absolute top-6 right-6 z-10 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>

                            {/* Image Gallery */}
                            <div className="w-full md:w-1/2 h-80 md:h-[500px] bg-white relative flex items-center justify-center p-8">
                                {selectedProduct.images && selectedProduct.images.length > 0 ? (
                                    <img
                                        src={selectedProduct.images[0]}
                                        alt={selectedProduct.name}
                                        className="max-w-full max-h-full object-contain"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Package className="h-20 w-20 opacity-20" />
                                    </div>
                                )}
                                <div className="absolute bottom-6 left-6 right-6 flex gap-2">
                                    {selectedProduct.images && selectedProduct.images.length > 1 && selectedProduct.images.slice(0, 4).map((img, idx) => (
                                        <div key={idx} className="h-16 w-16 rounded-xl overflow-hidden border-2 border-primary/20 bg-white flex items-center justify-center p-1 cursor-pointer hover:border-primary transition-colors shadow-sm">
                                            <img src={img} className="max-w-full max-h-full object-contain" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Product Info */}
                            <div className="w-full md:w-1/2 p-10 flex flex-col">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider rounded-full">
                                            {selectedProduct.category || 'Geral'}
                                        </span>
                                        {selectedProduct.sku && (
                                            <span className="text-[10px] text-muted-foreground font-mono">
                                                SKU: {selectedProduct.sku}
                                            </span>
                                        )}
                                    </div>
                                    <h2 className="text-3xl font-black tracking-tight mb-4">{selectedProduct.name}</h2>
                                    <p className="text-muted-foreground leading-relaxed mb-8">
                                        {/* If we had description field we'd use it here. For now, a placeholder or just name/category */}
                                        Este é um produto de alta qualidade da Kinderplay, desenvolvido com os melhores materiais para garantir durabilidade e segurança.
                                    </p>

                                    <div className="space-y-2 mb-8">
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
                                                <Tag className="h-4 w-4" />
                                            </div>
                                            <span className="font-medium">Pronta entrega</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                                                <Info className="h-4 w-4" />
                                            </div>
                                            <span className="font-medium">Garantia Kinderplay</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-foreground/5 flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Preço Kinderplay (com IPI)</p>
                                        <p className="text-3xl font-black text-[#0f75bc]">{formatPrice(selectedProduct.salePrice || 0)}</p>
                                        <p className="text-[10px] text-[#8cc63f] font-bold uppercase tracking-wider">🔥 À vista 5% de desconto</p>
                                    </div>
                                    <Button
                                        style={{ backgroundColor: '#0f75bc' }}
                                        className="rounded-2xl px-10 py-7 h-auto font-black shadow-[0_10px_20px_rgba(15,117,188,0.3)] hover:shadow-[0_15px_30px_rgba(15,117,188,0.4)] transition-all hover:-translate-y-1 text-white uppercase tracking-wider text-sm border-none"
                                    >
                                        Solicitar Orçamento
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <footer className="py-12 border-t border-foreground/5 bg-foreground/[0.02]">
                <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex flex-col items-center md:items-start space-y-4">
                        <img src={LOGO_MAIN} alt="Kinderplay" className="h-8 opacity-50 grayscale hover:grayscale-0 transition-all cursor-pointer" />
                        <p className="text-xs text-muted-foreground">© 2026 Kinderplay. Todos os direitos reservados.</p>
                    </div>

                    <div className="flex gap-8 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        <a href="#" className="hover:text-primary transition-colors">Instagram</a>
                        <a href="#" className="hover:text-primary transition-colors">Facebook</a>
                        <a href="#" className="hover:text-primary transition-colors">WhatsApp</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

interface ProductCardProps {
    product: Product;
    formatPrice: (p: number) => string;
    onClick: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, formatPrice, onClick }) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ y: -10 }}
            className="group cursor-pointer"
            onClick={onClick}
        >
            <div className="relative aspect-[4/5] rounded-[2.5rem] bg-white overflow-hidden mb-4 border border-foreground/5 transition-all group-hover:shadow-premium group-hover:border-primary/20 flex items-center justify-center p-6">
                {product.images && product.images.length > 0 ? (
                    <img
                        src={product.images[0]}
                        alt={product.name}
                        className="max-w-full max-h-full object-contain transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                        <Package className="h-16 w-16" />
                    </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full p-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <ChevronRight className="h-6 w-6 text-white" />
                    </div>
                </div>

                {/* Category Tag */}
                {product.category && (
                    <div className="absolute top-6 left-6 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[10px] font-bold text-white uppercase tracking-wider">
                        {product.category}
                    </div>
                )}
            </div>

            <div className="px-4 pb-6 pt-2 space-y-4">
                <div className="space-y-1">
                    <span className="text-[10px] text-[#0f75bc] font-black uppercase tracking-[0.2em] opacity-80">
                        {product.category || 'Geral'}
                    </span>
                    <h3 className="font-black text-lg leading-tight text-slate-800 group-hover:text-[#0f75bc] transition-colors truncate">
                        {product.name}
                    </h3>
                </div>

                <div className="bg-slate-50 rounded-3xl p-5 space-y-1 border border-slate-100">
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Preço Kinderplay (com IPI)</p>
                    <p className="text-2xl font-black text-[#0f75bc]">{formatPrice(product.salePrice || 0)}</p>
                    <p className="text-[9px] text-[#8cc63f] font-bold uppercase tracking-wider">🔥 À vista 5% de desconto</p>
                </div>

                <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5 opacity-60">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Código:</span>
                        <span className="text-[10px] font-black text-slate-700">{product.sku || 'N/A'}</span>
                    </div>
                </div>

                <Button
                    style={{ backgroundColor: '#0f75bc' }}
                    className="w-full rounded-2xl py-6 h-auto font-black shadow-[0_8px_15px_rgba(15,117,188,0.25)] hover:shadow-[0_12px_25px_rgba(15,117,188,0.35)] transition-all hover:scale-[1.02] text-white border-none uppercase tracking-[0.1em] text-xs"
                >
                    Solicitar Orçamento
                </Button>
            </div>
        </motion.div>
    );
};

export default PublicCatalog;
