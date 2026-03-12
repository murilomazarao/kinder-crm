import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { supabase } from '../supabaseClient';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from './ui/primitives';
import { motion } from 'framer-motion';
import { User, Shield, Key, Camera, Loader2, Save, Trash2, ShieldCheck, Mail, Fingerprint, LogOut } from 'lucide-react';

export const ProfilePage: React.FC = () => {
    const { user, profile, fetchProfile, fetchAllProfiles, allProfiles, signOut } = useStore();
    const [fullName, setFullName] = useState(profile?.full_name || '');
    const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });

    useEffect(() => {
        if (user) {
            fetchProfile(user.id);
            fetchAllProfiles();
        }
    }, [user, fetchProfile, fetchAllProfiles]);

    useEffect(() => {
        if (profile) {
            setFullName(profile.full_name || '');
            setAvatarUrl(profile.avatar_url || '');
        }
    }, [profile]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.from('profiles').update({
                full_name: fullName,
                avatar_url: avatarUrl,
                updated_at: new Date().toISOString()
            }).eq('id', user.id);

            if (error) throw error;
            alert('Perfil atualizado com sucesso!');
            fetchProfile(user.id);
        } catch (error: any) {
            alert(`Erro ao atualizar perfil: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('arquivos')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('arquivos')
                .getPublicUrl(filePath);

            setAvatarUrl(publicUrl);
            await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);
            fetchProfile(user.id);
        } catch (error: any) {
            alert(`Erro no upload: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.new !== passwordData.confirm) {
            alert('As senhas não coincidem!');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: passwordData.new
            });
            if (error) throw error;
            alert('Senha redefinida com sucesso!');
            setPasswordData({ current: '', new: '', confirm: '' });
        } catch (error: any) {
            alert(`Erro ao redefinir senha: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const isAdmin = profile?.role === 'admin' || user?.email === 'gabriel.gbr.fire@gmail.com';

    return (
        <div className="space-y-10 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h2 className="text-4xl font-black tracking-tighter text-foreground">Meu Perfil</h2>
                    <p className="text-muted-foreground font-medium flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                        {isAdmin ? 'Acesso Administrativo Principal' : 'Acesso de Usuário'}
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={signOut} className="text-red-500 border-red-500/20 hover:bg-red-500/10">
                    <LogOut className="h-4 w-4 mr-2" /> Sair da Conta
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Side: General Info */}
                <div className="lg:col-span-4 space-y-8">
                    <Card className="overflow-hidden border-foreground/5">
                        <CardHeader className="p-0 h-32 bg-gradient-to-br from-primary/30 to-purple-600/30 relative">
                        </CardHeader>
                        <CardContent className="px-8 pb-8 -mt-16 relative z-10 text-center">
                            <div className="inline-block relative group">
                                <div className="h-32 w-32 rounded-[2.5rem] bg-background p-1.5 shadow-2xl overflow-hidden ring-4 ring-primary/20">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt={fullName} className="h-full w-full object-cover rounded-[2rem]" />
                                    ) : (
                                        <div className="h-full w-full bg-gradient-to-tr from-foreground/5 to-foreground/10 flex items-center justify-center rounded-[2rem]">
                                            <User className="h-12 w-12 text-primary/40" />
                                        </div>
                                    )}
                                </div>
                                <label className="absolute bottom-1 right-1 h-10 w-10 bg-primary text-white rounded-xl shadow-glow flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all">
                                    <Camera className="h-5 w-5" />
                                    <input type="file" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
                                </label>
                            </div>
                            <h3 className="mt-6 text-2xl font-black tracking-tight text-foreground">{fullName || 'Seu Nome'}</h3>
                            <p className="text-sm text-muted-foreground font-medium">{user?.email}</p>
                            <div className="mt-4 flex justify-center">
                                <span className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-widest text-primary">
                                    {profile?.role || 'Usuário'}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-foreground/5">
                        <CardHeader>
                            <CardTitle className="text-sm flex items-center gap-2 text-foreground">
                                <Fingerprint className="h-4 w-4 text-primary" /> Sistema ID
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Seu UUID</label>
                                <div className="p-3 bg-foreground/5 border border-foreground/10 rounded-xl text-[10px] font-mono select-all break-all text-muted-foreground">
                                    {user?.id}
                                </div>
                            </div>
                            <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                                Este ID é único e vincula todos os seus documentos e vendas no sistema Kinderplay.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Side: Forms */}
                <div className="lg:col-span-8 space-y-8">
                    <Card className="border-foreground/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-foreground">
                                <User className="h-5 w-5 text-primary" /> Dados Pessoais
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleUpdateProfile} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Nome Completo</label>
                                        <Input
                                            value={fullName}
                                            onChange={e => setFullName(e.target.value)}
                                            placeholder="Nome e Sobrenome"
                                            className="h-12 bg-foreground/5 border-foreground/10 text-foreground focus:bg-foreground/[0.08]"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">E-mail de Login</label>
                                        <Input
                                            value={user?.email}
                                            disabled
                                            className="h-12 bg-foreground/5 border-foreground/10 text-foreground opacity-50 cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end pt-2">
                                    <Button type="submit" disabled={loading} className="px-8">
                                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4 mr-2" /> Salvar Alterações</>}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    <Card className="border-foreground/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-foreground">
                                <Key className="h-5 w-5 text-primary" /> Segurança
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handlePasswordReset} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Nova Senha</label>
                                        <Input
                                            type="password"
                                            value={passwordData.new}
                                            onChange={e => setPasswordData(prev => ({ ...prev, new: e.target.value }))}
                                            className="h-12 bg-foreground/5 border-foreground/10 text-foreground"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Confirmar Senha</label>
                                        <Input
                                            type="password"
                                            value={passwordData.confirm}
                                            onChange={e => setPasswordData(prev => ({ ...prev, confirm: e.target.value }))}
                                            className="h-12 bg-foreground/5 border-foreground/10 text-foreground"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end pt-2">
                                    <Button type="submit" variant="outline" disabled={loading} className="px-8 text-foreground border-foreground/10">
                                        Atualizar Senha
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {isAdmin && (
                        <Card className="border-primary/20 bg-foreground/5">
                            <CardHeader className="bg-primary/5">
                                <CardTitle className="flex items-center gap-2 text-foreground">
                                    <Shield className="h-5 w-5 text-primary" /> Gerenciamento de Usuários
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-foreground/5">
                                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 w-16 text-center">Avatar</th>
                                                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Nome / Email</th>
                                                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">UUID / Role</th>
                                                <th className="px-8 py-4 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-foreground/5">
                                            {allProfiles.map(p => (
                                                <tr key={p.id} className="hover:bg-foreground/[0.02] transition-colors">
                                                    <td className="px-8 py-4">
                                                        <div className="h-10 w-10 mx-auto rounded-xl bg-foreground/5 border border-foreground/10 flex items-center justify-center overflow-hidden">
                                                            {p.avatar_url ? <img src={p.avatar_url} className="h-full w-full object-cover" /> : <User className="h-4 w-4 opacity-20 text-foreground" />}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 min-w-[200px]">
                                                        <div className="font-bold text-sm text-foreground">{p.full_name || 'Usuário Sem Nome'}</div>
                                                        <div className="text-[10px] text-muted-foreground lowercase mt-0.5">{p.id.substring(0, 8)}...</div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="text-[9px] font-mono text-muted-foreground opacity-50 mb-1">{p.id.substring(0, 18)}...</div>
                                                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase border ${p.role === 'admin' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-foreground/5 border-foreground/10 text-muted-foreground'}`}>
                                                            {p.role || 'user'}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-primary">
                                                                <Save className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-red-400">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};
