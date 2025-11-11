import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Play, Pause, RotateCcw, Coffee, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FocusModeProps {
  onClose: () => void;
}

export function FocusMode({ onClose }: FocusModeProps) {
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);

  const FOCUS_TIME = 25 * 60;
  const SHORT_BREAK = 5 * 60;
  const LONG_BREAK = 15 * 60;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Session complete
      if (mode === 'focus') {
        setSessions(prev => prev + 1);
        const newSessions = sessions + 1;
        
        // Every 4 sessions, take a long break
        if (newSessions % 4 === 0) {
          setMode('break');
          setTimeLeft(LONG_BREAK);
        } else {
          setMode('break');
          setTimeLeft(SHORT_BREAK);
        }
      } else {
        setMode('focus');
        setTimeLeft(FOCUS_TIME);
      }
      setIsRunning(false);
      
      // Play notification sound (browser notification)
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(
          mode === 'focus' ? '🎉 Sessão completa!' : '⏰ Intervalo terminado!',
          {
            body: mode === 'focus' 
              ? 'Hora de fazer uma pausa!' 
              : 'Pronto para voltar ao trabalho?',
            icon: '/favicon.ico'
          }
        );
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode, sessions]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(mode === 'focus' ? FOCUS_TIME : (sessions % 4 === 0 ? LONG_BREAK : SHORT_BREAK));
  };

  const handleSkip = () => {
    setIsRunning(false);
    if (mode === 'focus') {
      setSessions(prev => prev + 1);
      setMode('break');
      setTimeLeft(sessions % 4 === 0 ? LONG_BREAK : SHORT_BREAK);
    } else {
      setMode('focus');
      setTimeLeft(FOCUS_TIME);
    }
  };

  const progress = mode === 'focus'
    ? ((FOCUS_TIME - timeLeft) / FOCUS_TIME) * 100
    : ((timeLeft / (sessions % 4 === 0 ? LONG_BREAK : SHORT_BREAK)) * 100);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className={`absolute inset-0 ${mode === 'focus' ? 'gradient-primary' : 'gradient-success'} opacity-20`}
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-6">
        {/* Close button */}
        <Button
          variant="ghost"
          onClick={onClose}
          className="glass"
        >
          ← Voltar
        </Button>

        {/* Main timer card */}
        <motion.div
          layout
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <Card className="glass-strong p-8 text-center">
            <AnimatePresence mode="wait">
              {mode === 'focus' ? (
                <motion.div
                  key="focus"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  className="mb-6"
                >
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full gradient-primary mb-4">
                    <Zap className="size-5 text-white" />
                    <span className="text-white">Modo Foco</span>
                  </div>
                  <p className="text-muted-foreground">Concentre-se na tarefa</p>
                </motion.div>
              ) : (
                <motion.div
                  key="break"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  className="mb-6"
                >
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full gradient-success mb-4">
                    <Coffee className="size-5 text-white" />
                    <span className="text-white">Intervalo</span>
                  </div>
                  <p className="text-muted-foreground">
                    {sessions % 4 === 0 ? 'Intervalo longo' : 'Intervalo curto'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Circular progress */}
            <div className="relative w-64 h-64 mx-auto mb-8">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="8"
                  fill="none"
                />
                <motion.circle
                  cx="128"
                  cy="128"
                  r="120"
                  stroke={mode === 'focus' ? '#8b5cf6' : '#10b981'}
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: progress / 100 }}
                  transition={{ duration: 0.5 }}
                  style={{
                    strokeDasharray: '753.6',
                    strokeDashoffset: 753.6 * (1 - progress / 100),
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div>
                  <div className="text-6xl font-mono mb-2">{formatTime(timeLeft)}</div>
                  <div className="text-sm text-muted-foreground">
                    Sessão {sessions + 1}
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-3 justify-center">
              {!isRunning ? (
                <Button
                  onClick={handleStart}
                  size="lg"
                  className={mode === 'focus' ? 'gradient-primary' : 'gradient-success'}
                >
                  <Play className="size-5 mr-2" />
                  Iniciar
                </Button>
              ) : (
                <Button
                  onClick={handlePause}
                  size="lg"
                  variant="outline"
                  className="glass"
                >
                  <Pause className="size-5 mr-2" />
                  Pausar
                </Button>
              )}
              
              <Button
                onClick={handleReset}
                size="lg"
                variant="outline"
                className="glass"
              >
                <RotateCcw className="size-5" />
              </Button>
            </div>

            {/* Skip button */}
            <Button
              onClick={handleSkip}
              variant="ghost"
              className="mt-4 w-full"
            >
              Pular {mode === 'focus' ? 'para intervalo' : 'intervalo'}
            </Button>
          </Card>
        </motion.div>

        {/* Sessions tracker */}
        <Card className="glass p-4">
          <div className="flex items-center justify-center gap-2">
            {Array.from({ length: Math.min(sessions, 8) }).map((_, i) => (
              <div
                key={i}
                className={`size-3 rounded-full ${
                  i < sessions % 4 ? 'gradient-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-2">
            {sessions} sessões completas hoje
          </p>
        </Card>

        {/* Tips */}
        <Card className="glass p-4">
          <h3 className="mb-2">💡 Dicas</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Elimine distrações durante o foco</li>
            <li>• Use o intervalo para se alongar</li>
            <li>• Mantenha água por perto</li>
            <li>• Celebre cada sessão completa</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
