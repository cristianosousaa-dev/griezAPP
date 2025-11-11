import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Play, Pause, Square, Clock } from 'lucide-react';
import { AppData, TimeEntry } from '../App';

interface TimeTrackerProps {
  data: AppData;
  setData: (data: AppData) => void;
}

export function TimeTracker({ data, setData }: TimeTrackerProps) {
  const [isTracking, setIsTracking] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTracking && currentEntryId) {
      const entry = data.timeEntries.find(e => e.id === currentEntryId);
      if (entry) {
        interval = setInterval(() => {
          const elapsed = Math.floor((Date.now() - entry.startTime) / 1000);
          setElapsedTime(elapsed);
        }, 1000);
      }
    }
    return () => clearInterval(interval);
  }, [isTracking, currentEntryId, data.timeEntries]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartTracking = () => {
    if (!selectedProjectId) return;
    
    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      projectId: selectedProjectId,
      startTime: Date.now(),
      billable: true,
      hourlyRate: data.settings.hourlyRate,
    };

    setData({
      ...data,
      timeEntries: [...data.timeEntries, newEntry]
    });
    setCurrentEntryId(newEntry.id);
    setIsTracking(true);
    setElapsedTime(0);
  };

  const handleStopTracking = () => {
    if (!currentEntryId) return;

    setData({
      ...data,
      timeEntries: data.timeEntries.map(entry =>
        entry.id === currentEntryId
          ? { ...entry, endTime: Date.now() }
          : entry
      )
    });

    setIsTracking(false);
    setCurrentEntryId(null);
    setElapsedTime(0);
  };

  const totalHoursToday = data.timeEntries
    .filter(entry => {
      const entryDate = new Date(entry.startTime).toDateString();
      const today = new Date().toDateString();
      return entryDate === today && entry.endTime;
    })
    .reduce((sum, entry) => {
      const duration = ((entry.endTime || Date.now()) - entry.startTime) / 1000 / 3600;
      return sum + duration;
    }, 0);

  return (
    <div className="space-y-6 pb-6">
      {/* Active Tracker */}
      <div className="p-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl border border-purple-400/30 rounded-2xl">
        <div className="text-center mb-6">
          <p className="text-white/60 text-sm mb-2">Tempo Atual</p>
          <motion.p
            key={elapsedTime}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className="text-5xl text-white mb-6"
          >
            {formatTime(elapsedTime)}
          </motion.p>
        </div>

        {!isTracking ? (
          <div className="space-y-3">
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-400/50"
            >
              <option value="">Selecionar projeto</option>
              {data.projects.filter(p => p.status === 'active').map((project) => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>

            <button
              onClick={handleStartTracking}
              disabled={!selectedProjectId}
              className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-green-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-5 h-5" />
              <span>Iniciar</span>
            </button>
          </div>
        ) : (
          <button
            onClick={handleStopTracking}
            className="w-full px-6 py-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl text-white flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-red-500/50 transition-all"
          >
            <Square className="w-5 h-5" />
            <span>Parar</span>
          </button>
        )}
      </div>

      {/* Today's Summary */}
      <div className="p-5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-purple-400" />
            <span className="text-white">Hoje</span>
          </div>
          <span className="text-2xl text-white">{totalHoursToday.toFixed(1)}h</span>
        </div>
      </div>

      {/* Recent Entries */}
      <div>
        <h3 className="text-white mb-4">Entradas Recentes</h3>
        <div className="space-y-3">
          {data.timeEntries
            .filter(entry => entry.endTime)
            .sort((a, b) => b.startTime - a.startTime)
            .slice(0, 10)
            .map((entry) => {
              const project = data.projects.find(p => p.id === entry.projectId);
              const duration = ((entry.endTime || Date.now()) - entry.startTime) / 1000 / 3600;
              
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl hover:border-white/20 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white mb-1">{project?.name}</p>
                      <p className="text-white/60 text-sm">
                        {new Date(entry.startTime).toLocaleDateString('pt-PT')} • 
                        {new Date(entry.startTime).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })} - 
                        {new Date(entry.endTime!).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white text-lg">{duration.toFixed(2)}h</p>
                      {entry.billable && entry.hourlyRate && (
                        <p className="text-white/60 text-sm">{(duration * entry.hourlyRate).toFixed(0)}€</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
