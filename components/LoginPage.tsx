import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useStore } from '../store';
import { Button, Input } from './ui/primitives';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, Loader2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

import { LOGO_URL } from '../constants';

export const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isResetMode, setIsResetMode] = useState(false);
    const { setUser } = useStore();

    useEffect(() => {
        // Detect if we are coming from a recovery/invite link
        const hash = window.location.hash;
        if (hash && (hash.includes('type=recovery') || hash.includes('type=invite') || hash.includes('access_token='))) {
            setIsResetMode(true);
        }
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) throw authError;
            if (data?.user) setUser(data.user);
        } catch (err: any) {
            setError(err.message || 'Erro ao realizar login.');
        } finally {
            setLoading(false);
        }
    };

    const handleSetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error: updateError } = await supabase.auth.updateUser({
                password: password
            });

            if (updateError) throw updateError;

            alert('Senha definida com sucesso! Você já pode acessar o sistema.');
            setIsResetMode(false);
            window.location.hash = ''; // Clear hash
        } catch (err: any) {
            setError(err.message || 'Erro ao definir senha.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center relative bg-[#020617] overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-pulse delay-700" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 w-full max-w-md px-6"
            >
                <div className="flex flex-col items-center mb-8">
                    <motion.div
                        initial={{ y: -20 }}
                        animate={{ y: 0 }}
                        className="mb-6 p-4 rounded-3xl bg-white/[0.03] border border-white/5 backdrop-blur-xl shadow-glow shadow-primary/10"
                    >
                        <img
                            src={LOGO_URL}
                            alt="Kinderplay Logo"
                            className="h-16 w-auto object-contain"
                        />
                    </motion.div>
                    <h1 className="text-3xl font-black tracking-tighter text-white text-center">
                        {isResetMode ? 'Defina sua Senha' : 'Bem-vindo de volta'}
                    </h1>
                    <p className="text-muted-foreground font-medium mt-2 text-center text-sm">
                        {isResetMode
                            ? 'Crie uma senha forte para acessar seu painel administrativo.'
                            : 'Acesse o Kinderplay CRM Pro para gerenciar suas vendas.'}
                    </p>
                </div>

                <div className="p-8 rounded-[2.5rem] border border-white/5 bg-white/[0.02] backdrop-blur-3xl shadow-2xl space-y-6">
                    <form onSubmit={isResetMode ? handleSetPassword : handleLogin} className="space-y-4">
                        {!isResetMode && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-2">E-mail Corporativo</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input
                                        type="email"
                                        placeholder="exemplo@kinderplay.com.br"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-12 h-12 bg-white/5 border-white/10 group-hover:bg-white/[0.08]"
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-2">
                                {isResetMode ? 'Nova Senha de Acesso' : 'Sua Senha'}
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-12 h-12 bg-white/5 border-white/10 group-hover:bg-white/[0.08]"
                                    required
                                />
                            </div>
                        </div>

                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="flex items-center gap-2 p-3 text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl"
                                >
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                    <span>{error}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 rounded-2xl shadow-glow overflow-hidden group"
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <span className="flex items-center gap-2">
                                    {isResetMode ? 'Confirmar Senha' : 'Entrar no Painel'}
                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </span>
                            )}
                        </Button>
                    </form>

                    {isResetMode && (
                        <div className="pt-2 text-center">
                            <button
                                onClick={() => setIsResetMode(false)}
                                className="text-[10px] text-muted-foreground hover:text-primary font-black uppercase tracking-widest transition-colors"
                            >
                                Voltar para o Login
                            </button>
                        </div>
                    )}

                    <div className="pt-4 text-center">
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">
                            © 2026 Kinderplay CRM v2.0
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Bottom Glow */}
            <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
        </div>
    );
};
