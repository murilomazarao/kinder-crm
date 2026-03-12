import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, Button, Input, Select, cn } from './ui/primitives';
import { useStore } from '../store';
import { Customer, FieldType, KanbanStatus, FieldDefinition } from '../types';
import { ManageFieldsModal } from './ManageFieldsModal';
import { Settings } from 'lucide-react';

const generateId = () => crypto.randomUUID();

interface CreateCardModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultStatus?: KanbanStatus;
}

export const CreateCardModal: React.FC<CreateCardModalProps> = ({ isOpen, onClose, defaultStatus = 'inbox' }) => {
    const { addCustomer, fieldDefinitions, tags } = useStore();
    const [isManageFieldsOpen, setIsManageFieldsOpen] = useState(false);

    const [formData, setFormData] = useState<Partial<Customer>>({
        name: '',
        company: '',
        email: '',
        phone: '',
        value: 0,
        priority: 'medium',
        status: defaultStatus,
        customFields: {},
        tags: [],
        saleOrigin: '',
    });

    const handleChange = (field: keyof Customer, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleCustomFieldChange = (fieldId: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            customFields: {
                ...prev.customFields,
                [fieldId]: value
            }
        }));
    };

    const handleToggleTag = (tagId: string) => {
        setFormData(prev => {
            const currentTags = prev.tags || [];
            if (currentTags.includes(tagId)) {
                return { ...prev, tags: currentTags.filter(id => id !== tagId) };
            } else {
                return { ...prev, tags: [...currentTags, tagId] };
            }
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newCustomer: Customer = {
            id: generateId(),
            name: formData.name || 'Novo Cliente',
            company: formData.company || '',
            email: formData.email || '',
            phone: formData.phone || '',
            status: defaultStatus as KanbanStatus,
            value: Number(formData.value) || 0,
            lastContact: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            priority: formData.priority as any || 'medium',
            products: [],
            customFields: formData.customFields || {},
            tags: formData.tags || [],
            discount: 0,
            freight: 0,
            saleOrigin: formData.saleOrigin,
        };
        addCustomer(newCustomer);
        onClose();
        setFormData({
            name: '',
            company: '',
            email: '',
            phone: '',
            value: 0,
            priority: 'medium',
            status: defaultStatus,
            customFields: {},
            tags: [],
            saleOrigin: '',
        });
    };

    const renderFieldInput = (field: FieldDefinition) => {
        const value = formData.customFields?.[field.id] || '';
        const onChange = (e: any) => handleCustomFieldChange(field.id, e.target.value);

        switch (field.type) {
            case 'date':
                return <Input type="date" value={value} onChange={onChange} />;
            case 'time':
                return <Input type="time" value={value} onChange={onChange} />;
            case 'date_time':
                return <Input type="datetime-local" value={value} onChange={onChange} />;
            case 'due_date':
                return <Input type="date" value={value} onChange={onChange} placeholder="Data de Vencimento" />;
            case 'email':
                return <Input type="email" value={value} onChange={onChange} placeholder="email@exemplo.com" />;
            case 'phone':
                return <Input type="tel" value={value} onChange={onChange} placeholder="(00) 00000-0000" />;
            case 'number':
            case 'currency':
                return <Input type="number" value={value} onChange={onChange} placeholder="0" />;
            case 'checkbox':
                return (
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={!!value}
                            onChange={e => handleCustomFieldChange(field.id, e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-muted-foreground">Ativado</span>
                    </div>
                );
            case 'long_text':
                return <textarea
                    className="flex min-h-[100px] w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300"
                    value={value}
                    onChange={onChange}
                    placeholder={field.name}
                />;
            case 'list_selection':
            case 'single_selection':
                return (
                    <Select
                        value={value}
                        onChange={onChange}
                    >
                        <option value="">Selecione...</option>
                        {field.options?.map((opt, idx) => (
                            <option key={idx} value={opt} className="bg-[#020617] text-white font-sans">{opt}</option>
                        ))}
                    </Select>
                );
            case 'fixed_text':
                return <Input type="text" value={value} readOnly placeholder="Texto Fixo (apenas leitura)" className="bg-muted" />;
            case 'document':
                return <Input type="text" value={value} onChange={onChange} placeholder="CPF/CNPJ" />;
            case 'responsible':
                return <Input type="text" value={value} onChange={onChange} placeholder="Nome do responsável" />;
            case 'attachment':
                return <Input type="file" onChange={(e) => {
                    if (e.target.files?.[0]) {
                        handleCustomFieldChange(field.id, e.target.files[0].name);
                    }
                }} />;
            case 'label':
                return <Input type="text" value={value} onChange={onChange} placeholder="Etiqueta" />;
            default:
                return <Input type="text" value={value} onChange={onChange} placeholder={field.name} />;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Novo Card</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nome</label>
                            <Input value={formData.name} onChange={e => handleChange('name', e.target.value)} placeholder="Nome do cliente" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Empresa</label>
                            <Input value={formData.company} onChange={e => handleChange('company', e.target.value)} placeholder="Empresa" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email</label>
                            <Input value={formData.email} onChange={e => handleChange('email', e.target.value)} placeholder="email@exemplo.com" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Telefone</label>
                            <Input value={formData.phone} onChange={e => handleChange('phone', e.target.value)} placeholder="(00) 00000-0000" />
                        </div>
                    </div>

                    {/* Sale Origin */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Origem da Venda</label>
                        <Select
                            value={formData.saleOrigin || ''}
                            onChange={(e) => handleChange('saleOrigin', e.target.value)}
                        >
                            <option value="" className="bg-[#020617] text-white">Selecione a origem...</option>
                            <option value="whatsapp" className="bg-[#020617] text-white">📱 WhatsApp</option>
                            <option value="loja_integrada" className="bg-[#020617] text-white">🛍️ Loja Integrada</option>
                            <option value="instagram" className="bg-[#020617] text-white">📸 Instagram</option>
                            <option value="google" className="bg-[#020617] text-white">🔍 Google</option>
                            <option value="site" className="bg-[#020617] text-white">🌐 Site</option>
                            <option value="indication" className="bg-[#020617] text-white">👥 Indicação</option>
                        </Select>
                    </div>

                    {/* Tags Selection */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">Etiquetas</label>
                        </div>

                        <div className="flex flex-wrap gap-2 min-h-[40px] p-3 border rounded-md bg-muted/20">
                            {tags.length === 0 ? (
                                <span className="text-xs text-muted-foreground">Nenhuma etiqueta disponível.</span>
                            ) : (
                                tags.map(tag => {
                                    const isSelected = formData.tags?.includes(tag.id);
                                    return (
                                        <button
                                            key={tag.id}
                                            type="button"
                                            onClick={() => handleToggleTag(tag.id)}
                                            className={`
                                                text-xs px-2.5 py-1 rounded-full border transition-all flex items-center gap-1.5
                                                ${isSelected
                                                    ? 'bg-primary/10 border-primary/50 ring-1 ring-primary/20'
                                                    : 'bg-background border-border hover:border-primary/30 opacity-70 hover:opacity-100'}
                                            `}
                                        >
                                            <div
                                                className="w-2 h-2 rounded-full"
                                                style={{ backgroundColor: tag.color }}
                                            />
                                            <span style={{ color: isSelected ? 'inherit' : undefined }}>{tag.name}</span>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Dynamic Fields */}
                    {fieldDefinitions.map(field => (
                        <div key={field.id} className="space-y-2">
                            <label className="text-sm font-medium">{field.name}</label>
                            {renderFieldInput(field)}
                        </div>
                    ))}

                    <div className="pt-2">
                        <Button type="button" variant="outline" onClick={() => setIsManageFieldsOpen(true)} className="w-full border-dashed">
                            <Settings className="mr-2 h-4 w-4" /> Gerenciar Campos
                        </Button>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
                        <Button type="submit">Criar Card</Button>
                    </div>
                </form>

                <ManageFieldsModal
                    isOpen={isManageFieldsOpen}
                    onClose={() => setIsManageFieldsOpen(false)}
                />
            </DialogContent>
        </Dialog>
    );
};
