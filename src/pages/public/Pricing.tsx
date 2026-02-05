import React from 'react';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const Pricing: React.FC = () => {
    const plans = [
        {
            name: 'Starter',
            price: 'R$ 49',
            features: ['Até 2 profissionais', 'Serviços ilimitados', 'Agendamento via WhatsApp', 'Suporte por email'],
        },
        {
            name: 'Pro',
            price: 'R$ 99',
            features: ['Até 10 profissionais', 'Dashboard avançado', 'Lembretes automáticos', 'Suporte prioritário'],
            popular: true
        },
        {
            name: 'Enterprise',
            price: 'Sob consulta',
            features: ['Profissionais ilimitados', 'API de integração', 'Gerente de conta', 'Whitelabel'],
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-20 px-4">
            <div className="max-w-5xl mx-auto text-center mb-16">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Planos que acompanham seu crescimento</h1>
                <p className="text-gray-600 text-lg">Escolha o Agendify e transforme a gestão do seu negócio.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {plans.map((plan) => (
                    <div key={plan.name} className={`bg-white rounded-3xl p-8 border ${plan.popular ? 'border-primary ring-4 ring-primary/10 scale-105' : 'border-gray-200'} shadow-sm relative`}>
                        {plan.popular && <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Mais Popular</span>}
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                        <div className="mb-6">
                            <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                            {plan.price !== 'Sob consulta' && <span className="text-gray-500 font-medium ml-1">/mês</span>}
                        </div>
                        <ul className="space-y-4 mb-8">
                            {plan.features.map((f) => (
                                <li key={f} className="flex items-center gap-3 text-sm text-gray-600">
                                    <Check className="w-5 h-5 text-green-500" /> {f}
                                </li>
                            ))}
                        </ul>
                        <Link to="/signup" className={`w-full py-3 rounded-xl font-bold transition-all inline-block text-center ${plan.popular ? 'bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}>
                            Começar Agora
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Pricing;
