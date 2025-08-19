import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface Bill {
    total_amount: number;
    subtotal: number;
    taxes: number;
    currency: string;
}

interface Anomaly {
    category: string;
    delta: string;
    reason: string;
    severity: 'high' | 'medium' | 'low';
}

interface BillSummaryCardProps {
    bill: Bill;
    anomalies: Anomaly[];
    onViewDetail: () => void;
    onViewAnomalies: () => void;
}

export const BillSummaryCard: React.FC<BillSummaryCardProps> = ({
    bill,
    anomalies,
    onViewDetail,
    onViewAnomalies
}) => {
    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'high': return { bg: '#fef2f2', border: '#fecaca' };
            case 'medium': return { bg: '#fffbeb', border: '#fed7aa' };
            case 'low': return { bg: '#fff7ed', border: '#fed7aa' };
            default: return { bg: '#fffbeb', border: '#fed7aa' };
        }
    };

    const getSeverityTextColor = (severity: string) => {
        switch (severity) {
            case 'high': return '#991b1b';
            case 'medium': return '#92400e';
            case 'low': return '#c2410c';
            default: return '#92400e';
        }
    };

    return (
        <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 24, margin: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
            {/* Total Amount */}
            <View style={{ alignItems: 'center', marginBottom: 24 }}>
                <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#111827' }}>
                    ₺{bill.total_amount.toFixed(2)}
                </Text>
                <Text style={{ color: '#6b7280', fontSize: 18 }}>Toplam Fatura</Text>
            </View>

            {/* Breakdown */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }}>
                <View style={{ alignItems: 'center', flex: 1 }}>
                    <Text style={{ fontSize: 14, color: '#6b7280' }}>Hizmetler</Text>
                    <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827' }}>
                        ₺{bill.subtotal.toFixed(2)}
                    </Text>
                </View>
                <View style={{ alignItems: 'center', flex: 1 }}>
                    <Text style={{ fontSize: 14, color: '#6b7280' }}>Vergiler</Text>
                    <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827' }}>
                        ₺{bill.taxes.toFixed(2)}
                    </Text>
                </View>
            </View>

            {/* Anomalies Alert */}
            {anomalies.length > 0 && (
                <TouchableOpacity
                    style={{
                        borderRadius: 8,
                        padding: 16,
                        marginBottom: 16,
                        borderWidth: 1,
                        borderColor: getSeverityColor(anomalies[0].severity).border,
                        backgroundColor: getSeverityColor(anomalies[0].severity).bg
                    }}
                    onPress={onViewAnomalies}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ fontSize: 18, marginRight: 8 }}>⚠️</Text>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontWeight: '500', color: getSeverityTextColor(anomalies[0].severity) }}>
                                {anomalies.length} anomali tespit edildi
                            </Text>
                            <Text style={{ fontSize: 14, marginTop: 4, color: getSeverityTextColor(anomalies[0].severity) }}>
                                {anomalies[0].reason}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
            )}

            {/* View Details Button */}
            <TouchableOpacity
                style={{ backgroundColor: '#2563eb', borderRadius: 8, padding: 16, alignItems: 'center' }}
                onPress={onViewDetail}
            >
                <Text style={{ color: 'white', fontWeight: '600', fontSize: 18 }}>Fatura Detaylarını Gör</Text>
            </TouchableOpacity>
        </View>
    );
};
