import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Phone, DollarSign, User, Instagram, UserPlus, FileText } from 'lucide-react';
import { Customer } from '../../types';
import { useStore } from '../../store';
import { cn } from '../ui/primitives';

interface TagBadgeProps {
    tagId: string;
}

const TagBadge: React.FC<TagBadgeProps> = React.memo(({ tagId }) => {
    const tag = useStore(state => state.tags.find(t => t.id === tagId));
    if (!tag) return null;

    return (
        <span
            className="text-[10px] px-2 py-0.5 rounded-lg border font-bold flex items-center gap-1.5 shadow-sm"
            style={{
                backgroundColor: `${tag.color}15`,
                borderColor: `${tag.color}30`,
                color: tag.color
            }}
        >
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tag.color }} />
            {tag.name}
        </span>
    );
});

TagBadge.displayName = 'TagBadge';

interface CustomerCardProps {
    customer: Customer;
    isOverlay?: boolean;
    onClick?: (c: Customer) => void;
}

export const CustomerCard: React.FC<CustomerCardProps> = React.memo(({ customer, isOverlay, onClick }) => {
    const docCount = useStore(state => state.invoices.filter(i => i.customerId === customer.id && i.fileUrl).length);

    const createdAtDate = new Date(customer.createdAt || new Date().toISOString());
    const formattedDate = createdAtDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

    return (
        <motion.div
            layoutId={customer.id}
            onClick={() => onClick && onClick(customer)}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
                "group relative flex flex-col gap-4 rounded-3xl border border-foreground/5 bg-foreground/5 dark:bg-white/5 backdrop-blur-xl p-5 shadow-lg transition-all hover:bg-foreground/10 dark:hover:bg-white/10 hover:shadow-glow/10 cursor-grab active:cursor-grabbing overflow-hidden",
                isOverlay ? "rotate-3 scale-110 shadow-2xl border-primary bg-foreground/20 dark:bg-white/20 ring-4 ring-primary/20" : "hover:border-primary/20"
            )}
        >
            {/* Background Subtle Gradient */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none group-hover:bg-primary/20 transition-colors duration-500" />

            {/* Header with Name and Avatar */}
            <div className="flex items-center gap-4 relative z-10">
                <div className="relative">
                    {customer.avatar && customer.avatar.startsWith('http') ? (
                        <img src={customer.avatar} alt={customer.name} className="h-12 w-12 rounded-2xl object-cover ring-2 ring-white/10 group-hover:ring-primary/50 transition-all shadow-lg" loading="lazy" />
                    ) : (
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center border border-primary/20 text-primary font-black text-sm group-hover:shadow-glow transition-all">
                            {customer.name.substring(0, 2).toUpperCase()}
                        </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-[#0f172a] shadow-lg" />
                </div>
                <div className="flex flex-col min-w-0">
                    <h4 className="font-bold text-sm leading-tight text-foreground group-hover:text-primary transition-colors truncate">{customer.name}</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5 font-black uppercase tracking-widest truncate opacity-60 group-hover:opacity-100 transition-opacity">{customer.company}</p>
                </div>
            </div>

            {/* Tags */}
            {customer.tags && customer.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 relative z-10">
                    {customer.tags.map((tagId) => (
                        <TagBadge key={tagId} tagId={tagId} />
                    ))}
                </div>
            )}

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-2 relative z-10">
                <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground bg-foreground/5 dark:bg-white/5 p-2 rounded-xl border border-foreground/5 dark:border-white/5">
                    <Calendar className="h-3 w-3 text-primary/60" />
                    <span className="truncate">{formattedDate}</span>
                </div>
                {customer.phone && (
                    <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground bg-foreground/5 dark:bg-white/5 p-2 rounded-xl border border-foreground/5 dark:border-white/5">
                        <Phone className="h-3 w-3 text-primary/60" />
                        <span className="truncate">{customer.phone}</span>
                    </div>
                )}
            </div>

            {/* Footer with Value */}
            <div className="flex items-center justify-between pt-4 border-t border-foreground/5 dark:border-white/5 relative z-10">
                <div className="flex items-center gap-2">
                    <div className="flex -space-x-1.5">
                        <div className="bg-foreground/5 dark:bg-white/5 p-1.5 rounded-lg border border-foreground/10 dark:border-white/10 flex items-center justify-center w-8 h-8" title={`Origem: ${customer.saleOrigin || 'Desconhecida'}`}>
                            {customer.saleOrigin === 'whatsapp' && <img src="/assets/icons/origin-whatsapp.png" className="h-4 w-4" alt="WA" />}
                            {customer.saleOrigin === 'loja_integrada' && <img src="/assets/loja-integrada.png" className="h-[14px] object-contain brightness-110" alt="LI" />}
                            {customer.saleOrigin === 'instagram' && <Instagram className="h-4 w-4 text-pink-500" />}
                            {customer.saleOrigin === 'indication' && <UserPlus className="h-4 w-4 text-yellow-400" />}
                            {!customer.saleOrigin && <User className="h-4 w-4 text-muted-foreground/50" />}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-black text-foreground dark:text-white bg-foreground/5 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-foreground/10 dark:border-white/10">
                    <DollarSign className="h-3 w-3 text-emerald-500" />
                    {customer.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
            </div>

            {/* Document Indicator Overlay */}
            {docCount > 0 && (
                <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-blue-500/20 backdrop-blur-md px-2 py-1 rounded-lg border border-blue-500/30 text-blue-500 animate-pulse shadow-glow shadow-blue-500/20">
                    <FileText className="h-3 w-3" />
                    <span className="text-[10px] font-black">{docCount}</span>
                </div>
            )}
        </motion.div>
    );
});

CustomerCard.displayName = 'CustomerCard';
