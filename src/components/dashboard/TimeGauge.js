// src/components/dashboard/TimeGauge.js
import React, { useState, useEffect, useMemo } from 'react';
import { differenceInSeconds, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const TimeGauge = ({ targetDate, startDate }) => {
    const initialTotalSeconds = useMemo(() => {
        const start = startDate ? new Date(startDate) : new Date();
        const end = new Date(targetDate);
        return differenceInSeconds(end, start);
    }, [targetDate, startDate]);

    const [remainingSeconds, setRemainingSeconds] = useState(0);

    useEffect(() => {
        const calculateRemaining = () => {
            const now = new Date();
            const end = new Date(targetDate);
            const remaining = differenceInSeconds(end, now);
            setRemainingSeconds(Math.max(0, remaining));
        };

        calculateRemaining();
        const interval = setInterval(calculateRemaining, 1000);

        return () => clearInterval(interval);
    }, [targetDate]);

    const percentage = initialTotalSeconds > 0 ? (remainingSeconds / initialTotalSeconds) * 100 : 0;
    const timeToNow = formatDistanceToNow(new Date(targetDate), { addSuffix: true, locale: fr });

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-mono text-purple-300">
                    {timeToNow}
                </span>
                <span className="text-xs font-mono text-slate-400">
                    {`${Math.floor(percentage)}%`}
                </span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
                <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full h-1.5 transition-all duration-1000 ease-linear"
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
};

export default TimeGauge;