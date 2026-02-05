import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Tenant, Niche } from '../../types';
import * as Lucide from 'lucide-react';

const LandingPage: React.FC = () => {
    const { slug } = useParams();
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [renderError, setRenderError] = useState<string | null>(null);

    // Global error handler to catch sneaky crashes
    useEffect(() => {
        const handleError = (event: ErrorEvent) => {
            console.error('CRITICAL CLIENT ERROR:', event.error);
            setRenderError(event.error?.message || 'Erro crítico de execução no navegador.');
        };
        window.addEventListener('error', handleError);
        return () => window.removeEventListener('error', handleError);
    }, []);

    useEffect(() => {
        if (slug) fetchTenant();
    }, [slug]);

    const fetchTenant = async () => {
        try {
            console.log('Fetching tenant for slug:', slug);
            const { data, error: sbError } = await supabase.from('tenants').select('*').eq('slug', slug).single();
            if (sbError) {
                console.error('Supabase Error:', sbError);
                setError(`Erro do Banco: ${sbError.message}`);
            } else {
                console.log('Tenant Data:', data);
                setTenant(data);
            }
        } catch (e: any) {
            console.error('Fetch Catch:', e);
            setError(`Falha de Conexão: ${e.message || 'Erro desconhecido'}`);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-10 font-bold animate-pulse">
            <div className="text-4xl mb-4">SINCRONIZANDO DESIGN...</div>
        </div>
    );

    if (error || renderError) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 text-red-900 p-10 text-center">
            <h1 className="text-4xl font-black mb-4">ERRO DE CARREGAMENTO</h1>
            <p className="text-xl mb-6">{error || renderError}</p>
            <div className="bg-white p-4 rounded border border-red-200 text-sm font-mono text-left inline-block">
                <p>Slug: {slug}</p>
                <p>Origin: {error ? 'DATABASE' : 'RUNTIME'}</p>
            </div>
            <Link to="/login" className="mt-8 px-6 py-3 bg-red-600 text-white rounded-lg font-bold">Voltar ao Login</Link>
        </div>
    );

    if (!tenant) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-500 p-10 text-center">
            <h1 className="text-4xl font-black mb-4">404</h1>
            <p className="text-xl">Estabelecimento não encontrado.</p>
        </div>
    );

    // SAFE DATA PROCESSING
    const safeName = tenant.name || 'Agendify Business';
    const safeSlug = tenant.slug || slug || '';
    const safeFirstName = safeName.split(' ')[0] || 'Empresa';

    const effectiveNiche = tenant.niche || (
        safeName.toLowerCase().includes('personal') || safeName.toLowerCase().includes('treino')
            ? Niche.PERSONAL
            : safeName.toLowerCase().includes('clinica') || safeName.toLowerCase().includes('saude')
                ? Niche.CLINIC
                : safeName.toLowerCase().includes('pet') || safeName.toLowerCase().includes('animal')
                    ? Niche.PETSHOP
                    : Niche.SALON
    );

    const displayColor = (tenant.primary_color === '#be185d' || !tenant.primary_color)
        ? (effectiveNiche === Niche.PERSONAL ? '#22c55e'
            : effectiveNiche === Niche.CLINIC ? '#00a3ff'
                : effectiveNiche === Niche.PETSHOP ? '#f59e0b'
                    : '#be185d')
        : tenant.primary_color;

    const isPersonal = effectiveNiche === Niche.PERSONAL;

    const getNicheConfig = () => {
        try {
            switch (effectiveNiche) {
                case Niche.PERSONAL:
                    return {
                        bg: 'bg-[#0a0a0a]',
                        text: 'text-white',
                        subtext: 'text-gray-400',
                        cardBg: 'bg-[#171717]',
                        heroTitle: 'TREINE COM PROPÓSITO',
                        heroSub: 'Alta performance para resultados reais.',
                        featuresTitle: `MÉTODO ${safeFirstName.toUpperCase()}`,
                        mainIcon: Lucide.Dumbbell,
                        features: [
                            { title: 'Treino Híbrido', desc: 'Foco e força.', icon: Lucide.Dumbbell },
                            { title: 'Métricas', desc: 'Acompanhamento total.', icon: Lucide.Activity },
                            { title: 'Exclusivo', desc: 'Sessões 1-on-1.', icon: Lucide.Check }
                        ]
                    };
                case Niche.CLINIC:
                    return {
                        bg: 'bg-white',
                        text: 'text-gray-900',
                        subtext: 'text-gray-500',
                        cardBg: 'bg-white',
                        heroTitle: 'Sua Saúde em Boas Mãos',
                        heroSub: 'Atendimento humanizado e especializado.',
                        featuresTitle: 'Nossa Estrutura',
                        mainIcon: Lucide.Activity,
                        features: [
                            { title: 'Tecnologia', desc: 'Diagnósticos precisos.', icon: Lucide.Activity },
                            { title: 'Especialistas', desc: 'Corpo clínico de elite.', icon: Lucide.Check },
                            { title: 'Agilidade', desc: 'Sem filas de espera.', icon: Lucide.Check }
                        ]
                    };
                case Niche.PETSHOP:
                    return {
                        bg: 'bg-[#FFFAF0]',
                        text: 'text-gray-900',
                        subtext: 'text-gray-600',
                        cardBg: 'bg-white',
                        heroTitle: 'Carinho e Cuidado Pet',
                        heroSub: 'Banho, tosa e muito amor.',
                        featuresTitle: `Por que o ${safeFirstName}?`,
                        mainIcon: Lucide.Dog,
                        features: [
                            { title: 'Equipe Apaixonada', desc: 'Cuidado real.', icon: Lucide.Dog },
                            { title: 'Transparência', desc: 'Fotos do banho.', icon: Lucide.Activity },
                            { title: 'Táxi Dog', desc: 'Buscamos em casa.', icon: Lucide.Check }
                        ]
                    };
                default:
                    return {
                        bg: 'bg-white',
                        text: 'text-gray-900',
                        subtext: 'text-gray-600',
                        cardBg: 'bg-white',
                        heroTitle: 'ESTILO & SOFISTICAÇÃO',
                        heroSub: 'Transforme seu visual hoje.',
                        featuresTitle: 'Nossos Serviços',
                        mainIcon: Lucide.Scissors,
                        features: [
                            { title: 'Corte Moderno', desc: 'Tendências atuais.', icon: Lucide.Scissors },
                            { title: 'Barba Classic', desc: 'Estilo e cuidado.', icon: Lucide.Scissors },
                            { title: 'Atendimento', desc: 'Excelência total.', icon: Lucide.Check }
                        ]
                    };
            }
        } catch (e) {
            console.error('Config Error:', e);
            return null;
        }
    };

    const config = getNicheConfig();
    if (!config) return <div className="p-20 text-center">Erro crítico de configuração de nicho.</div>;

    const IconHero = config.mainIcon || Lucide.Activity;

    return (
        <div className={`min-h-screen ${config.bg} ${config.text} selection:bg-primary selection:text-white`}>
            {/* CSS Variables Injection */}
            <style dangerouslySetInnerHTML={{
                __html: `
                :root { 
                    --primary-color: ${displayColor} !important; 
                    --primary: ${displayColor} !important;
                }
                .bg-primary { background-color: var(--primary-color) !important; }
                .text-primary { color: var(--primary-color) !important; }
                .border-primary { border-color: var(--primary-color) !important; }
            `}} />

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-md border-b border-white/5 p-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-xl">
                            <IconHero className="w-6 h-6" />
                        </div>
                        <span className={`font-black text-2xl ${isPersonal ? 'text-primary' : ''}`}>
                            {safeName}
                        </span>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <main className="pt-32 pb-20 px-6">
                <div className="max-w-5xl mx-auto text-center space-y-10">
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none">
                        {config.heroTitle}
                    </h1>
                    <p className={`text-xl ${config.subtext} max-w-2xl mx-auto`}>
                        {config.heroSub}
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Link
                            to={`/agendar/${safeSlug}`}
                            className="w-full sm:w-auto px-12 py-6 bg-primary text-white rounded-2xl font-black text-2xl shadow-xl hover:scale-105 transition-all flex items-center gap-3"
                        >
                            Agendar Agora <Lucide.ArrowRight className="w-6 h-6" />
                        </Link>
                    </div>
                </div>

                {/* Features */}
                <section className="mt-20">
                    <div className="text-center mb-12">
                        <h3 className="text-3xl font-black uppercase tracking-widest">{config.featuresTitle}</h3>
                        <div className="w-20 h-1.5 bg-primary mx-auto mt-4 rounded-full" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {config.features.map((f, i) => {
                            const FeatIcon = f.icon || Lucide.Check;
                            return (
                                <div key={i} className={`${config.cardBg} p-8 rounded-3xl border border-white/5 shadow-sm`}>
                                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                                        <FeatIcon className="w-6 h-6 text-primary" />
                                    </div>
                                    <h4 className="text-xl font-bold mb-2">{f.title}</h4>
                                    <p className={config.subtext}>{f.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </section>
            </main>

            <footer className="p-12 text-center opacity-30 text-xs">
                © 2024 {safeName} • Todos os direitos reservados
            </footer>
        </div>
    );
};

export default LandingPage;
