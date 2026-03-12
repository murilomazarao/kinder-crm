import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { blingService } from '../lib/blingService';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from './ui/primitives';

export const BlingCallback: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [error, setError] = useState<string | null>(null);
    const processing = React.useRef(false);

    useEffect(() => {
        const handleCallback = async () => {
            if (processing.current) return;

            const code = searchParams.get('code');
            const errorParam = searchParams.get('error');

            if (errorParam) {
                setStatus('error');
                setError(errorParam);
                return;
            }

            if (!code) {
                setStatus('error');
                setError('Código de autorização não encontrado.');
                return;
            }

            try {
                processing.current = true;
                const result = await blingService.getToken(code);

                if (result.status === 'success') {
                    setStatus('success');
                    // Redireciona após 2 segundos
                    setTimeout(() => {
                        navigate('/products');
                    }, 2000);
                } else {
                    throw new Error(result.message);
                }
            } catch (err: any) {
                console.error(err);
                setStatus('error');
                setError(err.message || 'Falha ao conectar com o Bling');
            }
        };

        handleCallback();
    }, [searchParams, navigate]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 p-8">
            <div className="bg-card/50 backdrop-blur-xl border border-white/10 p-12 rounded-[2.5rem] shadow-2xl flex flex-col items-center max-w-md w-full text-center">
                {status === 'loading' && (
                    <>
                        <Loader2 className="h-16 w-16 text-primary animate-spin mb-6" />
                        <h2 className="text-2xl font-black text-white mb-2">Conectando ao Bling</h2>
                        <p className="text-muted-foreground">Estamos processando sua autorização. Por favor, aguarde...</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <CheckCircle2 className="h-16 w-16 text-emerald-500 mb-6" />
                        <h2 className="text-2xl font-black text-white mb-2">Conexão Realizada!</h2>
                        <p className="text-muted-foreground">Seu CRM agora está integrado ao Bling. Redirecionando...</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <XCircle className="h-16 w-16 text-destructive mb-6" />
                        <h2 className="text-2xl font-black text-white mb-2">Erro na Conexão</h2>
                        <p className="text-destructive/80 mb-6">{error}</p>
                        <Button onClick={() => navigate('/')} variant="outline" className="w-full">
                            Voltar ao Dashboard
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
};
