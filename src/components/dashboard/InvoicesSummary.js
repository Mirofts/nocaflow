// src/components/dashboard/InvoicesSummary.js
import React, { useState, useMemo } from 'react';
import { DashboardCard } from './DashboardCard';
import { motion } from 'framer-motion';
import { parseISO } from 'date-fns';
import { useTheme } from '../../context/ThemeContext';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-2 bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-lg shadow-lg">
                <p className="label text-sm text-white">{`${label} : ${payload[0].value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}`}</p>
            </div>
        );
    }
    return null;
};

const InvoicesSummary = ({ invoices = [], openInvoiceForm, openInvoiceList, t, className = '' }) => {
    const { isDarkMode } = useTheme();
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const chartDataAndStats = useMemo(() => {
        const months = Array.from({ length: 12 }, (_, i) => ({ month: i, name: new Date(0, i).toLocaleString('fr', { month: 'short' }), total: 0 }));

        const processInvoices = (year) => {
            const yearData = months.map(m => ({ ...m }));
            let totalRevenue = 0;
            invoices
                .filter(inv => inv.status === 'Paid' && parseISO(inv.issueDate).getFullYear() === year)
                .forEach(inv => {
                    const month = parseISO(inv.issueDate).getMonth();
                    const amount = parseFloat(inv.totalAmount) || 0;
                    yearData[month].total += amount;
                    totalRevenue += amount;
                });
            return { data: yearData, total: totalRevenue };
        };

        const currentYearData = processInvoices(selectedYear);
        const previousYearData = processInvoices(selectedYear - 1);

        const pendingTotal = invoices
            .filter(inv => inv.status !== 'Paid')
            .reduce((sum, inv) => sum + (parseFloat(inv.amountDue) || 0), 0);
        
        let evolution = 0;
        if (previousYearData.total > 0) {
            evolution = ((currentYearData.total - previousYearData.total) / previousYearData.total) * 100;
        } else if (currentYearData.total > 0) {
            evolution = 100;
        }

        return {
            chartData: currentYearData.data,
            revenueThisYear: currentYearData.total,
            pendingTotal: pendingTotal,
            evolution: evolution
        };

    }, [invoices, selectedYear]);
    
    const EvolutionIndicator = () => {
        const { evolution } = chartDataAndStats;
        const isPositive = evolution >= 0;
        const colorClass = isPositive ? 'text-green-400' : 'text-red-400';
        const icon = isPositive ? '▲' : '▼';

        return (
            <span className={`font-bold text-lg ${colorClass}`}>
                {icon} {Math.abs(evolution).toFixed(1)}%
            </span>
        );
    };

    return (
        <DashboardCard 
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>}
            title={t('invoices_summary_title', 'Résumé des Factures')} 
            className={className}
        >
            <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={() => setSelectedYear(y => y - 1)} className="p-1 rounded-full hover:bg-color-bg-hover">
                        <svg className="w-5 h-5 text-color-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
                    </button>
                    <h3 className="font-bold text-xl text-color-text-primary">{selectedYear}</h3>
                    <button onClick={() => setSelectedYear(y => y + 1)} className="p-1 rounded-full hover:bg-color-bg-hover">
                        <svg className="w-5 h-5 text-color-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
                    </button>
                </div>

                <div className="w-full h-48 mb-4">
                    <ResponsiveContainer>
                        <LineChart data={chartDataAndStats.chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#30363d' : '#e2e8f0'} />
                            <XAxis dataKey="name" stroke={isDarkMode ? '#94a3b8' : '#4A5568'} fontSize={12} />
                            <YAxis stroke={isDarkMode ? '#94a3b8' : '#4A5568'} fontSize={12} tickFormatter={(value) => `${value / 1000}k`}/>
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(236, 72, 153, 0.1)' }} />
                            <defs>
                                <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                                </linearGradient>
                            </defs>
                            <Line type="monotone" dataKey="total" stroke="url(#lineGradient)" strokeWidth={3} dot={{ r: 4, fill: '#ec4899' }} activeDot={{ r: 6 }}/>
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center">
                        <p className="text-color-text-secondary">Chiffre d'affaires ({selectedYear}) :</p>
                        <span className="font-bold text-color-text-primary text-lg">
                            {chartDataAndStats.revenueThisYear.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <p className="text-color-text-secondary">Évolution vs {selectedYear - 1} :</p>
                        <EvolutionIndicator />
                    </div>
                </div>
                
                {/* BLOC DE BOUTONS AJOUTÉ ICI */}
                <div className="mt-auto space-y-2 pt-4">
                    <motion.button onClick={openInvoiceForm} whileHover={{ scale: 1.02 }} className="w-full main-action-button bg-gradient-to-r from-pink-500 to-violet-500">
                        Nouvelle Facture
                    </motion.button>
                    <motion.button onClick={openInvoiceList} whileHover={{ scale: 1.02 }} className="w-full main-button-secondary">
                        Voir Toutes les Factures
                    </motion.button>
                </div>
            </div>
        </DashboardCard>
    );
};

export default InvoicesSummary;