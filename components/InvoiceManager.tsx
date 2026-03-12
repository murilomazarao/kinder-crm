import React, { useState, useCallback, useMemo } from 'react';
import { useStore } from '../store';
import { supabase } from '../supabaseClient';
import { Invoice, InvoiceCategory } from '../types';
import { Button, Input, Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/primitives';
import { Plus, Trash2, FileText, ArrowUpRight, ArrowDownRight, Edit2, User, Calendar, AlertCircle } from 'lucide-react';

interface InvoiceManagerProps {
    customerId?: string;
    className?: string;
}

const InvoiceItem = React.memo(({
    invoice,
    customerId,
    customers,
    onEdit,
    onDelete,
    onOpenFile
}: {
    invoice: Invoice;
    customerId?: string;
    customers: any[];
    onEdit: (i: Invoice) => void;
    onDelete: (id: string) => void;
    onOpenFile: (url: string) => void;
}) => {
    const getCategoryLabel = (cat: string) => {
        switch (cat) {
            case 'invoice': return 'Nota Fiscal';
            case 'input_invoice': return 'Entrada';
            case 'output_invoice': return 'Saída';
            case 'order': return 'Pedido';
            case 'proposal': return 'Orçamento';
            case 'contract': return 'Contrato';
            case 'document': return 'DOC';
            case 'receipt': return 'Recibo';
            default: return cat;
        }
    };

    const customer = useMemo(() =>
        !customerId && invoice.customerId ? customers.find(c => c.id === invoice.customerId) : null
        , [customerId, invoice.customerId, customers]);

    const fileName = useMemo(() =>
        invoice.fileUrl ? invoice.fileUrl.split('/').pop()?.replace(/^\d+-/, '') : null
        , [invoice.fileUrl]);

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-primary/20 transition-all group">
            <div className="flex items-center gap-4 flex-1 min-w-0 w-full">
                <div className={`p-2.5 rounded-xl shadow-inner ${invoice.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                    {invoice.type === 'income' ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-bold text-white group-hover:text-primary transition-colors truncate">{invoice.title}</span>
                        <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg bg-white/5 text-muted-foreground border border-white/10">
                            {getCategoryLabel(invoice.category)}
                        </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-0.5">
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                            <Calendar className="h-3 w-3 opacity-50" />
                            {new Date(invoice.date).toLocaleDateString('pt-BR')}
                        </div>
                        {customer && (
                            <div className="flex items-center gap-1.5 text-[10px] text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/20">
                                <User className="h-3 w-3" />
                                <span className="truncate max-w-[100px]">{customer.name}</span>
                            </div>
                        )}
                        {fileName && (
                            <div className="flex items-center gap-1.5 text-[10px] text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-500/20 max-w-[180px]">
                                <FileText className="h-3 w-3" />
                                <span className="truncate cursor-pointer hover:underline" onClick={(e) => { e.stopPropagation(); onOpenFile(invoice.fileUrl!); }}>{fileName}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end sm:border-l sm:border-white/5 sm:pl-4">
                <div className={`text-base font-black ${invoice.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {invoice.type === 'income' ? '+' : '-'}
                    {invoice.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
                <div className="flex items-center gap-1">
                    {invoice.fileUrl && (
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-blue-400 hover:bg-blue-400/10" onClick={() => onOpenFile(invoice.fileUrl!)}>
                            <FileText className="h-4 w-4" />
                        </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:bg-white/5 hover:text-white" onClick={() => onEdit(invoice)}>
                        <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:bg-red-400/10 hover:text-red-400" onClick={() => onDelete(invoice.id)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
});

InvoiceItem.displayName = 'InvoiceItem';

export const InvoiceManager: React.FC<InvoiceManagerProps> = ({ customerId, className }) => {
    const { invoices, addInvoice, updateInvoice, deleteInvoice, customers } = useStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState<Partial<Invoice> | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const filteredInvoices = useMemo(() =>
        customerId ? invoices.filter(i => i.customerId === customerId) : invoices
        , [customerId, invoices]);

    const handleSaveInvoice = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (!editingInvoice) return;

        const finalCustomerId = customerId || editingInvoice.customerId;

        if (editingInvoice.id) {
            const original = invoices.find(i => i.id === editingInvoice.id);
            if (!original) return;
            const updated: Invoice = {
                ...original,
                ...editingInvoice,
                customerId: finalCustomerId,
                value: Number(editingInvoice.value) || original.value
            } as Invoice;
            updateInvoice(updated);
        } else {
            const invoice: Invoice = {
                id: crypto.randomUUID(),
                title: editingInvoice.title || 'Novo Registro',
                value: Number(editingInvoice.value) || 0,
                type: editingInvoice.type as 'income' | 'expense' || 'expense',
                category: editingInvoice.category as InvoiceCategory || 'invoice',
                date: editingInvoice.date || new Date().toISOString(),
                customerId: finalCustomerId,
                fileUrl: editingInvoice.fileUrl,
                createdAt: new Date().toISOString()
            };
            addInvoice(invoice);
        }

        setIsModalOpen(false);
        setEditingInvoice(null);
    }, [editingInvoice, customerId, invoices, addInvoice, updateInvoice]);

    const openAddModal = useCallback(() => {
        setEditingInvoice({
            type: 'expense',
            value: 0,
            title: '',
            category: 'input_invoice',
            date: new Date().toISOString().split('T')[0],
            customerId: customerId
        });
        setIsModalOpen(true);
    }, [customerId]);

    const openEditModal = useCallback((invoice: Invoice) => {
        setEditingInvoice({ ...invoice, date: invoice.date.split('T')[0] });
        setIsModalOpen(true);
    }, []);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `arquivos/${fileName}`;

            const { data, error } = await supabase.storage
                .from('arquivos')
                .upload(filePath, file);

            if (error) throw error;
            setEditingInvoice(prev => ({ ...prev, fileUrl: data?.path }));
        } catch (error: any) {
            console.error('Upload error:', error);
            alert(`Erro no upload: ${error.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    const handleOpenFile = useCallback(async (fileUrl: string) => {
        try {
            if (fileUrl.startsWith('http')) {
                window.open(fileUrl, '_blank');
                return;
            }
            const { data, error } = await supabase.storage
                .from('arquivos')
                .createSignedUrl(fileUrl, 60);
            if (error) throw error;
            if (data?.signedUrl) window.open(data.signedUrl, '_blank');
        } catch (err) {
            console.error(err);
            alert('Não foi possível abrir o arquivo.');
        }
    }, []);

    const handleDelete = useCallback((id: string) => {
        if (window.confirm('Excluir este registro?')) {
            deleteInvoice(id);
        }
    }, [deleteInvoice]);

    return (
        <div className={className}>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-primary/60">Controle Financeiro</h3>
                </div>
                <Button size="sm" className="rounded-xl shadow-glow" onClick={openAddModal}>
                    <Plus className="h-4 w-4 mr-2" /> Novo
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {filteredInvoices.length === 0 ? (
                    <div className="text-xs text-muted-foreground/40 text-center py-12 border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.01]">
                        <AlertCircle className="h-10 w-10 mx-auto mb-3 opacity-10" />
                        Nenhum registro encontrado.
                    </div>
                ) : (
                    filteredInvoices.map(invoice => (
                        <InvoiceItem
                            key={invoice.id}
                            invoice={invoice}
                            customerId={customerId}
                            customers={customers}
                            onEdit={openEditModal}
                            onDelete={handleDelete}
                            onOpenFile={handleOpenFile}
                        />
                    ))
                )}
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-md bg-[#0f172a] border-white/10 rounded-[2rem] shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black text-white">{editingInvoice?.id ? 'Editar Registro' : 'Novo Registro'}</DialogTitle>
                    </DialogHeader>
                    {editingInvoice && (
                        <form onSubmit={handleSaveInvoice} className="space-y-5 p-2">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-primary/60">Título / Descrição</label>
                                <Input
                                    value={editingInvoice.title}
                                    onChange={e => setEditingInvoice(prev => ({ ...prev, title: e.target.value }))}
                                    className="bg-white/5 border-white/10 h-12 rounded-xl focus:bg-white/[0.08]"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-primary/60">Valor R$</label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={editingInvoice.value}
                                        onChange={e => setEditingInvoice(prev => ({ ...prev, value: Number(e.target.value) }))}
                                        className="bg-white/5 border-white/10 h-12 rounded-xl"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-primary/60">Tipo</label>
                                    <select
                                        className="flex h-12 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                                        value={editingInvoice.type}
                                        onChange={e => setEditingInvoice(prev => ({ ...prev, type: e.target.value as any }))}
                                    >
                                        <option value="expense" className="bg-[#0f172a]">Despesa (Saída)</option>
                                        <option value="income" className="bg-[#0f172a]">Receita (Entrada)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-primary/60">Categoria</label>
                                    <select
                                        className="flex h-12 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white font-bold"
                                        value={editingInvoice.category}
                                        onChange={e => setEditingInvoice(prev => ({ ...prev, category: e.target.value as any }))}
                                    >
                                        <option value="input_invoice" className="bg-[#0f172a]">Nota de Entrada</option>
                                        <option value="output_invoice" className="bg-[#0f172a]">Nota de Saída</option>
                                        <option value="order" className="bg-[#0f172a]">Pedido</option>
                                        <option value="proposal" className="bg-[#0f172a]">Orçamento</option>
                                        <option value="receipt" className="bg-[#0f172a]">Recibo</option>
                                        <option value="other" className="bg-[#0f172a]">Outro</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-primary/60">Data</label>
                                    <Input
                                        type="date"
                                        value={editingInvoice.date}
                                        onChange={e => setEditingInvoice(prev => ({ ...prev, date: e.target.value }))}
                                        className="bg-white/5 border-white/10 h-12 rounded-xl"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-primary/60">Anexo (Opcional)</label>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 relative">
                                        <Input type="file" onChange={handleFileUpload} className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10" />
                                        <div className="bg-white/5 border border-white/10 h-12 rounded-xl flex items-center px-4 text-xs text-muted-foreground">
                                            <Plus className="h-4 w-4 mr-2" /> {isUploading ? 'Enviando...' : (editingInvoice.fileUrl ? 'Mudar arquivo' : 'Escolher arquivo')}
                                        </div>
                                    </div>
                                    {editingInvoice.fileUrl && <div className="h-10 w-10 flex items-center justify-center bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20"><FileText className="h-5 w-5" /></div>}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                                <Button type="button" variant="ghost" className="rounded-xl h-12 px-6" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                                <Button type="submit" disabled={isUploading} className="rounded-xl h-12 px-8 shadow-glow">
                                    {isUploading ? 'Processando...' : 'Salvar Registro'}
                                </Button>
                            </div>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};
