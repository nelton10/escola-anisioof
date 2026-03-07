import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export const LiveTimer = ({ startTime, limitSeconds }) => {
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        const updateTimer = () => setElapsed(Math.floor((new Date().getTime() - (startTime || Date.now())) / 1000));
        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [startTime]);

    const isOvertime = elapsed > (limitSeconds || 900);

    return (
        <div className={`flex items-center gap-1.5 font-mono text-sm font-bold tracking-tight px-2 py-1 rounded-lg ${isOvertime ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-slate-100/50 text-slate-600'}`}>
            {isOvertime && <AlertTriangle size={14} />}
            <span>{Math.floor(elapsed / 60).toString().padStart(2, '0')}:{(elapsed % 60).toString().padStart(2, '0')}</span>
        </div>
    );
};
