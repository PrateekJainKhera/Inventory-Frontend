'use client'

import React from 'react'
import {
    AlertCircle,
    CheckCircle,
    Lightbulb,
    MessageSquare,
    ThumbsUp,
    AlertTriangle,
    Info,
    Quote
} from 'lucide-react'
import { Badge, Card, CardHeader, CardTitle, CardContent } from '@/components'
import { cn } from '@/lib/utils'

interface ComplaintLogsTabProps {
    clientName?: string
    productName?: string
    productCode?: string
}

export default function ComplaintLogsTab({
    clientName,
    productName,
    productCode
}: ComplaintLogsTabProps) {

    // Mock Data for the 4 Cards
    const clientComplaints = [
        {
            id: 1,
            severity: 'HIGH',
            date: '12 Dec 2025',
            title: 'Color variance observed in previous batch (Cyan too dark).',
            status: 'Pending'
        },
        {
            id: 2,
            severity: 'MEDIUM',
            date: '05 Nov 2025',
            title: 'Die cut misalignment on left edge.',
            status: 'Resolved'
        }
    ]

    const capaActions = [
        {
            id: 1,
            fixedOn: '14 Dec 2025',
            description: 'Calibrated anilox rollers and updated density targets for Wine Labels.'
        }
    ]

    const operatorTips = [
        {
            id: 1,
            date: '10 Jan 2026',
            tip: 'Use 45-degree screen angle for Cyan to reduce moiré effect.'
        }
    ]

    const positiveFeedback = [
        {
            id: 1,
            salesRep: 'SALES REP',
            date: '15 Jan 2026',
            quote: '"Client praised the foil stamping quality on the last run."'
        }
    ]

    return (
        <div className="h-full bg-gray-50/50 p-1">
            {/* Grid Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">

                {/* 1. Client Complaints (Red) */}
                <Card className="border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group">
                    <CardHeader className="bg-red-50/30 pb-3 border-b border-red-100/50">
                        <CardTitle className="flex items-center gap-3 text-base font-semibold text-gray-900">
                            <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 ring-4 ring-white shadow-sm">
                                <AlertCircle className="h-4 w-4" />
                            </div>
                            Client Complaints
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-3">
                        {clientComplaints.map(complaint => (
                            <div key={complaint.id} className="group/item relative pl-4 border-l-2 border-gray-100 hover:border-red-200 transition-colors pb-1">
                                <div className="flex items-center justify-between mb-1.5">
                                    <Badge variant={complaint.severity === 'HIGH' ? "destructive" : "secondary"} className="h-5 px-1.5 text-[10px] uppercase tracking-wider font-bold">
                                        {complaint.severity}
                                    </Badge>
                                    <span className="text-[10px] font-medium text-gray-400">{complaint.date}</span>
                                </div>
                                <p className="text-sm text-gray-700 font-medium leading-relaxed group-hover/item:text-gray-900 transition-colors">
                                    {complaint.title}
                                </p>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* 2. Corrective Actions (Green) */}
                <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
                    <CardHeader className="bg-green-50/30 pb-3 border-b border-green-100/50">
                        <CardTitle className="flex items-center gap-3 text-base font-semibold text-gray-900">
                            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 ring-4 ring-white shadow-sm">
                                <CheckCircle className="h-4 w-4" />
                            </div>
                            Corrective Actions (CAPA)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                        {capaActions.map(action => (
                            <div key={action.id} className="bg-green-50/40 rounded-lg p-3 border border-green-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 ring-2 ring-green-200"></div>
                                    <span className="text-[10px] font-bold text-green-700 uppercase tracking-wide">Fixed On • {action.fixedOn}</span>
                                </div>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                    {action.description}
                                </p>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* 3. Operator Tips (Yellow) */}
                <Card className="border-l-4 border-l-amber-400 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
                    <CardHeader className="bg-amber-50/30 pb-3 border-b border-amber-100/50">
                        <CardTitle className="flex items-center gap-3 text-base font-semibold text-gray-900">
                            <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 ring-4 ring-white shadow-sm">
                                <Lightbulb className="h-4 w-4" />
                            </div>
                            Operator Tips
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-3">
                        {operatorTips.map(tip => (
                            <div key={tip.id} className="flex gap-3">
                                <div className="flex-shrink-0 mt-0.5">
                                    <Info className="h-4 w-4 text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-amber-600 mb-1 uppercase tracking-wide">{tip.date}</p>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        {tip.tip}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* 4. Positive Feedback (Blue) */}
                <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
                    <CardHeader className="bg-blue-50/30 pb-3 border-b border-blue-100/50">
                        <CardTitle className="flex items-center gap-3 text-base font-semibold text-gray-900">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 ring-4 ring-white shadow-sm">
                                <MessageSquare className="h-4 w-4" />
                            </div>
                            Positive Feedback
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-3">
                        {positiveFeedback.map(feedback => (
                            <div key={feedback.id} className="relative pl-8 italic text-gray-600 text-sm">
                                <Quote className="absolute left-0 top-0 h-4 w-4 text-blue-200 fill-blue-100 transform -scale-x-100" />
                                <p className="mb-2 relative z-10">{feedback.quote}</p>
                                <div className="flex items-center gap-1.5 text-xs not-italic border-t border-blue-50 pt-2 mt-2 w-fit">
                                    <ThumbsUp className="h-3 w-3 text-blue-400" />
                                    <span className="font-bold text-blue-600 uppercase tracking-wide">{feedback.salesRep}</span>
                                    <span className="text-gray-300">•</span>
                                    <span className="text-gray-400">{feedback.date}</span>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
