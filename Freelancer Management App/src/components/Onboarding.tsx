import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Briefcase } from 'lucide-react';
import { motion } from 'motion/react';

interface OnboardingProps {
  onComplete: (userName: string, businessName: string) => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [userName, setUserName] = useState('');
  const [businessName, setBusinessName] = useState('');

  const handleComplete = () => {
    onComplete(userName, businessName);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
            <Briefcase className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl text-white text-center mb-2">Bem-vindo!</h1>
          <p className="text-white/60 text-center">
            Configure o seu perfil para começar
          </p>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label className="text-white/80 mb-2 block">O seu nome</Label>
              <Input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Ex: João Silva"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-purple-400/50"
              />
            </div>
            <Button 
              onClick={() => setStep(2)} 
              disabled={!userName.trim()}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/50"
            >
              Continuar
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <Label className="text-white/80 mb-2 block">Nome do negócio</Label>
              <Input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Ex: Design Studio"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-purple-400/50"
              />
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={() => setStep(1)} 
                variant="outline" 
                className="flex-1 bg-white/5 border border-white/10 text-white hover:bg-white/10"
              >
                Voltar
              </Button>
              <Button
                onClick={handleComplete}
                disabled={!businessName.trim()}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/50"
              >
                Começar
              </Button>
            </div>
          </div>
        )}

        <div className="flex gap-2 justify-center mt-6">
          {[1, 2].map(i => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${
                i === step ? 'w-8 bg-gradient-to-r from-purple-500 to-pink-500' : 'w-2 bg-white/20'
              }`}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}