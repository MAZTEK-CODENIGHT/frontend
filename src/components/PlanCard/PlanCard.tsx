import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
// Icon importu kaldırıldı ve SafeAreaView importu kaldırıldı

// Bileşen artık doğrudan 'plan' objesini prop olarak alıyor
const PlanCard = ({ plan }) => {
  console.log('PLAN_CARD_PLAN', plan); // Debugging için konsola yazdırılıyor

  const { plan_name, monthly_price, quota_gb, quota_min, quota_sms, best_for, popular } = plan;

  return (
    <View style={[styles.card, popular && styles.popularCard]}>
      {popular && ( // 'popular' değeri ile popülerlik kontrolü
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>EN POPÜLER</Text>
        </View>
      )}
      <Text style={styles.planName}>{plan_name}</Text> {/* plan.plan_name */}
      
      <View style={styles.priceContainer}>
        <Text style={styles.price}>{monthly_price}</Text> {/* plan.monthly_price */}
        <Text style={styles.currency}>TL/ay</Text>
      </View>

      <View style={styles.quotaContainer}>
        <View style={styles.quotaItem}>
          <Text style={styles.quotaText}>{quota_gb} GB</Text> {/* plan.quota_gb */}
        </View>
        <View style={styles.quotaItem}>
          <Text style={styles.quotaText}>{quota_min} DK</Text> {/* plan.quota_min */}
        </View>
        <View style={styles.quotaItem}>
          <Text style={styles.quotaText}>{quota_sms} SMS</Text> {/* plan.quota_sms */}
        </View>
      </View>

      <Text style={styles.bestFor}>{best_for}</Text> {/* plan.best_for */}
      
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>İncele</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginVertical: 10,
    marginHorizontal: 8,
    width: 200, 
    minHeight: 250, // **Yeni eklenen: Kartın minimum yüksekliğini garanti eder**
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#eee',
    justifyContent: 'space-between', // İçerikleri dikeyde daha iyi dağıtmak için
  },
  popularCard: {
    borderColor: '#FFD700',
    borderWidth: 2,
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: 15,
    backgroundColor: '#FFD700',
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  popularText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  planName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center', 
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center', 
    marginBottom: 20,
  },
  price: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#333',
  },
  currency: {
    fontSize: 18,
    color: '#555',
    marginBottom: 5,
    marginLeft: 5,
  },
  quotaContainer: {
    flexDirection: 'column', 
    alignItems: 'center', 
    marginBottom: 20,
  },
  quotaItem: {
    flexDirection: 'row', 
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5, 
  },
  quotaText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center', // **Yeni eklenen: Metinleri ortalamak için**
  },
  bestFor: {
    textAlign: 'center',
    color: '#777',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PlanCard;
