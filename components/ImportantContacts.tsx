import React, { useState } from 'react';
import { useStore } from '../store';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Badge, cn, Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/primitives';
import { Search, Plus, Phone, Building2, Send, Trash2, Pencil, Filter, MessageSquare, ExternalLink } from 'lucide-react';
import { ImportantContact } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

export const ImportantContacts = () => {
    const { importantContacts, addImportantContact, updateImportantContact, deleteImportantContact, customers } = useStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingContact, setEditingContact] = useState<ImportantContact | null>(null);

    // Lead Sending States
    const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
    const [selectedContactForLead, setSelectedContactForLead] = useState<ImportantContact | null>(null);
    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [isSendingLead, setIsSendingLead] = useState(false);
    const [customerSearch, setCustomerSearch] = useState('');

    const categories = ['Transportadora', 'Revenda', 'Fábrica', 'Montador', 'Parceiro', 'Outros'];

    const getCategoryStyle = (category: string) => {
        const styles: Record<string, { bg: string, border: string, text: string }> = {
            'Transportadora': { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400' },
            'Revenda': { bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-400' },
            'Fábrica': { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400' },
            'Montador': { bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-400' },
            'Parceiro': { bg: 'bg-pink-500/10', border: 'border-pink-500/20', text: 'text-pink-400' },
            'Outros': { bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', text: 'text-cyan-400' },
        };
        return styles[category] || styles['Outros'];
    };

    const filteredContacts = (importantContacts || []).filter(contact => {
        const search = searchTerm.toLowerCase().trim();
        if (!search) return selectedCategory === 'all' || contact.category === selectedCategory;

        // Normalização para busca de telefone (remove parênteses, espaços e hifens)
        const normalizedSearch = search.replace(/\D/g, '');
        const normalizedPhone = (contact.phone || '').replace(/\D/g, '');

        const matchesSearch =
            (contact.name || '').toLowerCase().includes(search) ||
            (contact.company || '').toLowerCase().includes(search) ||
            ((normalizedPhone && normalizedSearch) ? normalizedPhone.includes(normalizedSearch) : (contact.phone || '').includes(search));

        const matchesCategory = selectedCategory === 'all' || contact.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const contactData: ImportantContact = {
            id: editingContact?.id || crypto.randomUUID(),
            name: formData.get('name') as string,
            phone: formData.get('phone') as string,
            company: formData.get('company') as string,
            category: formData.get('category') as string,
            createdAt: editingContact?.createdAt || new Date().toISOString(),
        };

        if (editingContact) {
            await updateImportantContact(contactData);
        } else {
            await addImportantContact(contactData);
        }

        setIsModalOpen(false);
        setEditingContact(null);
    };

    const handleSendToLead = (contact: ImportantContact) => {
        setSelectedContactForLead(contact);
        setIsLeadModalOpen(true);
    };

    const handleConfirmSendLead = async () => {
        if (!selectedContactForLead || !selectedCustomerId) {
            alert('Por favor, selecione um cliente.');
            return;
        }

        const customer = customers.find(c => c.id === selectedCustomerId);
        if (!customer) return;

        setIsSendingLead(true);
        try {
            const response = await fetch('https://n8n.gabrielguimaraes.site/webhook/7b92cb9e-a0ae-4d00-8292-6b4f806f64ab', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    customer_name: customer.name,
                    customer_phone: customer.phone,
                    contact_name: selectedContactForLead.name,
                    contact_phone: selectedContactForLead.phone,
                }),
            });

            if (response.ok) {
                alert('Contato enviado com sucesso!');
                setIsLeadModalOpen(false);
                setSelectedCustomerId('');
                setCustomerSearch('');
            } else {
                alert('Erro ao enviar contato para o webhook.');
            }
        } catch (error) {
            console.error('Error sending lead:', error);
            alert('Erro de conexão ao enviar contato.');
        } finally {
            setIsSendingLead(false);
        }
    };

    const filteredCustomers = (customers || []).filter(c =>
        c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
        c.company.toLowerCase().includes(customerSearch.toLowerCase())
    ).slice(0, 10); // Limit results for performance

    return (
        <div className="space-y-8 p-2">
            <header className="flex flex-col gap-2">
                <h2 className="text-3xl font-black tracking-tighter text-white sm:text-4xl">
                    Contatos <span className="text-primary text-glow">Importantes</span>
                </h2>
                <p className="text-muted-foreground font-medium italic">Gerencie transportadoras, revendas e parceiros estratégicos.</p>
            </header>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-white/[0.02] p-6 rounded-3xl border border-white/5 backdrop-blur-xl shadow-2xl">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="relative w-full sm:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Buscar por nome, empresa ou telefone..."
                            className="pl-12 bg-white/5 border-white/10 h-12 rounded-2xl"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant={selectedCategory === 'all' ? 'default' : 'outline'}
                            size="sm"
                            className="rounded-xl px-4"
                            onClick={() => setSelectedCategory('all')}
                        >
                            Todos
                        </Button>
                        {categories.slice(0, 3).map(cat => (
                            <Button
                                key={cat}
                                variant={selectedCategory === cat ? 'default' : 'outline'}
                                size="sm"
                                className="rounded-xl px-4"
                                onClick={() => setSelectedCategory(cat)}
                            >
                                {cat}
                            </Button>
                        ))}
                    </div>
                </div>
                <Button className="w-full sm:w-auto shadow-glow" onClick={() => { setEditingContact(null); setIsModalOpen(true); }}>
                    <Plus className="mr-2 h-5 w-5" /> Cadastrar Contato
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence mode="popLayout">
                    {filteredContacts.map((contact, index) => (
                        <motion.div
                            key={contact.id}
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: -20 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                            <Card className="group relative overflow-hidden">
                                {/* Decorativo */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />

                                <CardHeader className="flex flex-row items-start justify-between pb-2">
                                    <div className="space-y-1">
                                        <Badge variant="outline" className={cn("text-[9px] border", getCategoryStyle(contact.category).bg, getCategoryStyle(contact.category).border, getCategoryStyle(contact.category).text)}>
                                            {contact.category}
                                        </Badge>
                                        <CardTitle className="text-xl group-hover:text-primary transition-colors">{contact.name}</CardTitle>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => { setEditingContact(contact); setIsModalOpen(true); }}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-red-400 hover:text-red-500 hover:bg-red-500/10" onClick={() => deleteImportantContact(contact.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                                            <Building2 className="h-4 w-4 text-primary/50" />
                                            {contact.company || 'Empresa não informada'}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-white font-black group-hover:scale-105 origin-left transition-transform">
                                            <Phone className="h-4 w-4 text-green-400 shadow-green-500/50" />
                                            {contact.phone}
                                        </div>
                                    </div>

                                    <Button
                                        className="w-full bg-green-600 hover:bg-green-700 text-white rounded-[1.25rem] shadow-[0_5px_15px_-5px_rgba(22,163,74,0.4)]"
                                        onClick={() => handleSendToLead(contact)}
                                    >
                                        <Send className="mr-2 h-4 w-4" /> Enviar contato para lead
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {filteredContacts.length === 0 && (
                    <div className="col-span-full py-20 text-center space-y-4">
                        <div className="h-20 w-20 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/5">
                            <MessageSquare className="h-10 w-10 text-muted-foreground/30" />
                        </div>
                        <p className="text-muted-foreground">Nenhum contato encontrado nesta categoria.</p>
                    </div>
                )}
            </div>

            {/* Modal de Cadastro/Edição */}
            <Dialog open={isModalOpen} onOpenChange={(open) => !open && setIsModalOpen(false)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingContact ? 'Editar Contato' : 'Cadastrar Novo Contato'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="space-y-6 mt-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-primary/60">Nome Completo</label>
                                <Input name="name" defaultValue={editingContact?.name} required placeholder="Ex: João da Transportadora" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-primary/60">WhatsApp / Telefone</label>
                                    <Input name="phone" defaultValue={editingContact?.phone} required placeholder="Ex: (11) 99999-9999" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-primary/60">Categoria</label>
                                    <select
                                        name="category"
                                        defaultValue={editingContact?.category || 'Transportadora'}
                                        className="flex h-11 w-full rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 appearance-none transition-all"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat} className="bg-[#020617] text-white">{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-primary/60">Empresa / Referência</label>
                                <Input name="company" defaultValue={editingContact?.company} required placeholder="Ex: TransLog Express" />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                            <Button type="submit" className="shadow-glow px-8">Salvar Contato</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal de Envio para Lead */}
            <Dialog open={isLeadModalOpen} onOpenChange={(open) => !open && !isSendingLead && setIsLeadModalOpen(false)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Send className="h-5 w-5 text-primary" />
                            Enviar para Lead
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                            <p className="text-xs font-black uppercase tracking-widest text-primary/60">Contato selecionado</p>
                            <div className="font-bold text-lg">{selectedContactForLead?.name}</div>
                            <div className="text-sm text-muted-foreground">{selectedContactForLead?.company} • {selectedContactForLead?.phone}</div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase tracking-widest text-primary/60">Selecionar Cliente (Customer)</label>
                            <Input
                                placeholder="Buscar cliente..."
                                value={customerSearch}
                                onChange={(e) => setCustomerSearch(e.target.value)}
                                className="bg-white/5"
                            />

                            <div className="grid gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                {filteredCustomers.map(customer => (
                                    <button
                                        key={customer.id}
                                        onClick={() => setSelectedCustomerId(customer.id)}
                                        className={cn(
                                            "flex items-center justify-between p-3 rounded-xl border transition-all text-left",
                                            selectedCustomerId === customer.id
                                                ? "bg-primary/10 border-primary text-primary"
                                                : "bg-white/[0.02] border-white/5 hover:bg-white/5"
                                        )}
                                    >
                                        <div>
                                            <div className="font-bold text-sm">{customer.name}</div>
                                            <div className="text-[10px] opacity-60">{customer.company} • {customer.phone}</div>
                                        </div>
                                        {selectedCustomerId === customer.id && (
                                            <div className="h-2 w-2 rounded-full bg-primary shadow-glow-sm" />
                                        )}
                                    </button>
                                ))}
                                {filteredCustomers.length === 0 && customerSearch && (
                                    <div className="text-center py-4 text-xs text-muted-foreground italic">
                                        Nenhum cliente encontrado
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setIsLeadModalOpen(false)}
                            disabled={isSendingLead}
                        >
                            Cancelar
                        </Button>
                        <Button
                            className="shadow-glow px-8"
                            onClick={handleConfirmSendLead}
                            disabled={!selectedCustomerId || isSendingLead}
                        >
                            {isSendingLead ? (
                                <>
                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                    Enviando...
                                </>
                            ) : (
                                'Confirmar Envio'
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
