# Fatura Asistanı - Product Requirements Document (PRD)

## 1. Proje Özeti

**Proje Adı:** Turkcell Fatura Asistanı – Şeffaf Fatura Açıklayıcı, Anomali Avcısı ve "What-If" Simülatörü

**Hackathon Case:** Codenight Case - 10 saatlik geliştirme süresi

**Amaç:** Turkcell müşterilerinin aylık faturasını kalem kalem açıklayan, beklenmedik ücretleri tespit eden ve "başka paket/seçenekle olsaydı ne olurdu?" sorusuna yanıt veren bir mobil uygulama.

**Platform:** React Native (iOS + Android) + Node.js/Express Backend
**Dil:** Türkçe
**Deployment:** Local (localhost:3000)
**Veri:** Mock JSON/CSV
**LLM:** OpenAI API + Regresyon kütüphaneleri

**İş Senaryosu:** "Kullanıcılar faturalarında 'Ek Ücret', 'Premium SMS', 'Yurt Dışı Data' gibi kalemleri gördüğünde neden ödediğini anlamakta zorlanıyor. Fatura Asistanı, faturayı veri odaklı açıklar; normal dışı kalemleri işaretler; aynı ay için alternatif plan/ek paket senaryolarında toplam maliyeti simüle edip en düşük maliyetli seçenekleri önerir."

---

## 2. Zorunlu Özellikler (MVP) - Case'e %100 Uyumlu

### 2.1 Profil & Fatura Seçimi (mock)

- **Kullanıcı Seçimi:** Drop-down menüden kullanıcı seçimi
- **Dönem Seçimi:** Döneme göre fatura seçimi (YYYY-MM)
- **Fatura Özeti Kartları:**
  - Toplam Tutar
  - Vergiler
  - Kullanım Bazlı Ücretler
  - Tek Seferlik Ücretler

### 2.2 Açıklanabilir Fatura

- **Kategori Bazlı Breakdown:**

  - data (veri kullanımı)
  - voice (ses aramaları)
  - sms (mesajlaşma)
  - roaming (yurt dışı)
  - premium_sms (premium mesaj servisleri)
  - vas (değer artışlı servisler)
  - vergi (KDV, ÖTV)
  - indirim (kampanya indirimleri)

- **Detaylı Açıklamalar:**

  - Her kalem için kısa açıklama ve detay
  - Örnek: "07.06'da 2×Premium SMS"
  - Örnek: "Ay içinde 1.2 GB aşım → 1.2×8.50 TL"

- **Doğal Dil Özeti:**
  - "Bu ay toplam 6,2GB yurt içi, 120dk arama yaptınız. Ücret artışının %72'si Premium SMS kaynaklı."

### 2.3 Anomali Tespiti

- **Basit Kurallar + İstatistik:**

  - Kalem bazında son 3 aya göre %X üstünde (örn. %80+)
  - Yeni görünen ücret (ilk kez) → şüpheli etiketleme
  - Roaming/Premium SMS/VAS artışı uyarıları
  - Z-score veya % fark hesaplama: `this_month > mean(last_3) + 2σ` veya `%Δ > 80%`

- **Her Anomali için Gerekçe:**
  - "Önceki ortalama 12 TL iken bu ay 58 TL"
  - Yeni Kalem: son 3 ay yok → "ilk kez görüldü"
  - Roaming: `roaming_mb > 0` & önceki ay 0 → "yeni roaming"

### 2.4 What-If Simülasyonu

- **Plan Değişirse Senaryosu:**

  - Katalogdan yeni plan seçimi
  - Yeni sabit ücret + aşım ücretleriyle alternatif toplam maliyet
  - Formula: `new_total = new_plan.monthly_price + max(0, usage_gb - quota_gb)*overage_gb + ...`

- **Ek Paket Eklenseydi Senaryosu:**

  - Örn. "Sosyal 5GB" ek paketi
  - Aşımın bir kısmı düşer → yeni toplam
  - `effective_quota_gb = quota_gb + Σ(addons.extra_gb)`

- **Premium SMS/VAS İptal Edilmiş Olsaydı:**

  - İlgili kalemler hariç tekrar hesapla
  - VAS/Premium SMS kapalı: ilgili kalemler toplamdan çıkarılır

- **Senaryo Sıralaması:**
  - En düşük maliyetli 3 senaryoyu sırala
  - Tasarruf tutarını göster
  - Skor: en düşük `new_total + tasarruf = current_total - new_total`

### 2.5 Akışlar (Mock)

- **"VAS iptal et"** → onay → başarı (mock)
- **"Planı değiştir"** → mock checkout
- **"Ek paket ekle"** → mock checkout

### 2.6 Sunum Gereksinimleri

- **3 dakikalık demo:** Faturayı aç → anomalileri gör → What-If çalıştır → en iyi seçeneği uygula (mock)

---

## 3. Veri Setleri - Case Spesifikasyonu

### 3.1 Veri Yapıları (JSON/CSV)

#### users.json

```json
[
  {
    "user_id": 1001,
    "name": "Ahmet Yılmaz",
    "current_plan_id": 2,
    "type": "postpaid",
    "msisdn": "5551234567"
  }
]
```

#### plans.json

```json
[
  {
    "plan_id": 2,
    "plan_name": "Süper Online 20GB",
    "type": "postpaid",
    "quota_gb": 20,
    "quota_min": 1000,
    "quota_sms": 1000,
    "monthly_price": 129.0,
    "overage_gb": 8.5,
    "overage_min": 0.85,
    "overage_sms": 0.35
  }
]
```

#### bill_headers.json

```json
[
  {
    "bill_id": 700101,
    "user_id": 1001,
    "period_start": "2025-07-01",
    "period_end": "2025-07-31",
    "issue_date": "2025-08-05",
    "total_amount": 189.5,
    "currency": "TRY"
  }
]
```

#### bill_items.json

```json
[
  {
    "bill_id": 700101,
    "item_id": "ITM001",
    "category": "premium_sms",
    "subtype": "premium_3rdparty",
    "description": "3838 numarasına Premium SMS",
    "amount": 59.85,
    "unit_price": 3.99,
    "quantity": 15,
    "tax_rate": 0.2,
    "created_at": "2025-07-15T14:30:00Z"
  },
  {
    "bill_id": 700101,
    "item_id": "ITM002",
    "category": "data",
    "subtype": "data_overage",
    "description": "Veri aşım ücreti",
    "amount": 25.5,
    "unit_price": 8.5,
    "quantity": 3,
    "tax_rate": 0.2,
    "created_at": "2025-07-28T23:59:00Z"
  }
]
```

**Kategoriler:**

- `data|voice|sms|roaming|premium_sms|vas|one_off|discount|tax`
- **Subtype örnekleri:** `data_overage, voice_overage, intl_call, vas_tone, premium_3rdparty`

#### usage_daily.json

```json
[
  {
    "user_id": 1001,
    "date": "2025-07-15",
    "mb_used": 890,
    "minutes_used": 45,
    "sms_used": 8,
    "roaming_mb": 0
  }
]
```

#### vas_catalog.json

```json
[
  {
    "vas_id": "VAS001",
    "name": "Caller Tunes",
    "monthly_fee": 9.9,
    "provider": "Turkcell"
  }
]
```

#### premium_sms_catalog.json

```json
[
  {
    "shortcode": "3838",
    "provider": "Superonline",
    "unit_price": 3.99
  }
]
```

#### add_on_packs.json

```json
[
  {
    "addon_id": 101,
    "name": "Sosyal 5GB",
    "type": "data",
    "extra_gb": 5,
    "extra_min": 0,
    "extra_sms": 0,
    "price": 25.0
  }
]
```

---

## 4. Basit Mantık (Referans Kodları) - Case'den

### 4.1 Fatura Açıklama (Explainability)

```javascript
// Gruplama: bill_items → kategori bazlı toplamlar
function explainBill(billItems) {
  const breakdown = billItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = { total: 0, lines: [] };
    }
    acc[item.category].total += item.amount;
    acc[item.category].lines.push(generateExplanation(item));
    return acc;
  }, {});

  return {
    summary: {
      total: billItems.reduce((sum, item) => sum + item.amount, 0),
      taxes: breakdown.tax?.total || 0,
      savings_hint: calculateSavingsHint(billItems),
    },
    breakdown: Object.entries(breakdown).map(([category, data]) => ({
      category,
      total: data.total,
      lines: data.lines,
    })),
  };
}

// Satır üretimi örnekleri
function generateExplanation(item) {
  switch (item.subtype) {
    case 'data_overage':
      return `Ay içinde ${item.quantity} GB aşım → ${item.quantity}×${item.unit_price} TL`;
    case 'premium_3rdparty':
      return `${item.description} → ${item.quantity}×${
        item.unit_price
      } TL (sağlayıcı: ${getProvider(item)})`;
    case 'vas_tone':
      return `${getVasName(item)} servisi aylık ücret ${item.unit_price} TL`;
    default:
      return item.description;
  }
}
```

### 4.2 Anomali Kuralları

```javascript
function detectAnomalies(userId, currentPeriod) {
  const currentBill = getBill(userId, currentPeriod);
  const lastThreeMonths = getLastThreeMonthsBills(userId, currentPeriod);

  const anomalies = [];

  // Kategori bazlı anomali kontrolü
  const categories = ['data', 'voice', 'sms', 'premium_sms', 'vas', 'roaming'];

  categories.forEach(category => {
    const currentAmount = calculateCategoryTotal(currentBill, category);
    const historicalAmounts = lastThreeMonths.map(bill =>
      calculateCategoryTotal(bill, category),
    );

    // Z-score hesaplama
    const mean =
      historicalAmounts.reduce((sum, val) => sum + val, 0) /
      historicalAmounts.length;
    const stdDev = calculateStdDev(historicalAmounts, mean);
    const zScore = (currentAmount - mean) / stdDev;

    // % değişim hesaplama
    const percentageChange =
      mean > 0 ? ((currentAmount - mean) / mean) * 100 : 0;

    if (zScore > 2 || percentageChange > 80) {
      anomalies.push({
        category,
        delta: percentageChange.toFixed(0) + '%',
        reason: `Önceki ortalama ${mean.toFixed(
          2,
        )} TL iken bu ay ${currentAmount.toFixed(2)} TL`,
        suggested_action: getSuggestedAction(category),
      });
    }

    // Yeni kalem kontrolü
    if (mean === 0 && currentAmount > 0) {
      anomalies.push({
        category,
        delta: 'YENİ',
        reason: 'İlk kez görüldü',
        suggested_action: 'İnceleme önerilir',
      });
    }
  });

  // Roaming özel kontrolü
  const currentRoaming = getCurrentRoamingUsage(userId, currentPeriod);
  const lastRoaming = getLastMonthRoamingUsage(userId, currentPeriod);

  if (currentRoaming.roaming_mb > 0 && lastRoaming.roaming_mb === 0) {
    anomalies.push({
      category: 'roaming',
      delta: 'YENİ ROAMING',
      reason: 'Yurt dışı kullanım tespit edildi',
      suggested_action: 'Roaming paketi önerilebilir',
    });
  }

  return { anomalies };
}
```

### 4.3 What-If Simülatörü

```javascript
function calculateWhatIf(userId, period, scenario) {
  const usage = getUserUsage(userId, period);
  const currentBill = getBill(userId, period);
  const currentTotal = currentBill.total_amount;

  let newTotal = 0;
  let details = [];

  // Plan değişikliği
  if (scenario.plan_id) {
    const newPlan = getPlan(scenario.plan_id);
    newTotal += newPlan.monthly_price;
    details.push(
      `Yeni plan: ${newPlan.plan_name} - ${newPlan.monthly_price} TL`,
    );

    // Veri aşımı hesabı
    const effectiveDataGB =
      newPlan.quota_gb +
      (scenario.addons?.reduce((sum, addon) => {
        const addonInfo = getAddon(addon);
        return sum + addonInfo.extra_gb;
      }, 0) || 0);

    const dataOverage = Math.max(0, usage.total_gb - effectiveDataGB);
    if (dataOverage > 0) {
      const overageCost = dataOverage * newPlan.overage_gb;
      newTotal += overageCost;
      details.push(
        `Veri aşımı: ${dataOverage}GB × ${newPlan.overage_gb} TL = ${overageCost} TL`,
      );
    }

    // Dakika aşımı hesabı
    const voiceOverage = Math.max(0, usage.total_minutes - newPlan.quota_min);
    if (voiceOverage > 0) {
      const voiceOverageCost = voiceOverage * newPlan.overage_min;
      newTotal += voiceOverageCost;
      details.push(
        `Dakika aşımı: ${voiceOverage}dk × ${newPlan.overage_min} TL = ${voiceOverageCost} TL`,
      );
    }
  }

  // Ek paket ekleme
  if (scenario.addons) {
    scenario.addons.forEach(addonId => {
      const addon = getAddon(addonId);
      newTotal += addon.price;
      details.push(`Ek paket: ${addon.name} - ${addon.price} TL`);
    });
  }

  // VAS iptal
  if (scenario.disable_vas) {
    const vasItems = currentBill.items.filter(item => item.category === 'vas');
    const vasSavings = vasItems.reduce((sum, item) => sum + item.amount, 0);
    details.push(`VAS iptal tasarrufu: -${vasSavings} TL`);
  } else {
    // VAS devam ediyor
    const vasItems = currentBill.items.filter(item => item.category === 'vas');
    const vasCost = vasItems.reduce((sum, item) => sum + item.amount, 0);
    newTotal += vasCost;
  }

  // Premium SMS bloke
  if (scenario.block_premium_sms) {
    const premiumSmsItems = currentBill.items.filter(
      item => item.category === 'premium_sms',
    );
    const premiumSmsSavings = premiumSmsItems.reduce(
      (sum, item) => sum + item.amount,
      0,
    );
    details.push(`Premium SMS bloke tasarrufu: -${premiumSmsSavings} TL`);
  } else {
    // Premium SMS devam ediyor (bu senaryoda tekrar gönderilirse)
    const premiumSmsItems = currentBill.items.filter(
      item => item.category === 'premium_sms',
    );
    const premiumSmsCost = premiumSmsItems.reduce(
      (sum, item) => sum + item.amount,
      0,
    );
    newTotal += premiumSmsCost;
  }

  // Vergiler
  const taxRate = 0.2; // %20 KDV
  const taxes = newTotal * taxRate;
  newTotal += taxes;

  const saving = currentTotal - newTotal;

  return {
    new_total: newTotal.toFixed(2),
    saving: saving.toFixed(2),
    details,
  };
}
```

---

## 5. API Sözleşmesi (Case'den)

### 5.1 Endpoint'ler

#### Kullanıcı ve Katalog

```http
GET /api/users/{id}
Response: { user_id, name, current_plan, msisdn }

GET /api/bills/{user_id}?period=YYYY-MM
Response: { bill: {...header}, items: [ ... ] }

GET /api/catalog
Response: { plans:[...], addons:[...], vas:[...], premium_sms:[...] }
```

#### Açıklama ve Anomali

```http
POST /api/explain
Content-Type: application/json
Body: { "bill_id": 700101 }
Response: {
  "summary": {
    "total": 189.50,
    "taxes": 31.58,
    "savings_hint": "Alternatif planla 87 TL tasarruf mümkün"
  },
  "breakdown": [
    {
      "category": "premium_sms",
      "total": 59.85,
      "lines": ["3838 numarasına 15×Premium SMS → 15×3.99 TL (sağlayıcı: Superonline)"]
    }
  ]
}

POST /api/anomalies
Content-Type: application/json
Body: { "user_id": 1001, "period": "2025-07" }
Response: {
  "anomalies": [
    {
      "category": "premium_sms",
      "delta": "+180%",
      "reason": "Önceki ortalama 12 TL iken bu ay 58 TL",
      "suggested_action": "Premium SMS bloklamasını düşünün"
    }
  ]
}
```

#### What-If ve Checkout

```http
POST /api/whatif
Content-Type: application/json
Body: {
  "user_id": 1001,
  "period": "2025-07",
  "scenario": {
    "plan_id": 3,
    "addons": [101],
    "disable_vas": true
  }
}
Response: {
  "new_total": "102.45",
  "saving": "87.05",
  "details": ["Yeni plan: Premium 30GB - 159 TL", "VAS iptal tasarrufu: -9.90 TL"]
}

POST /api/checkout
Content-Type: application/json
Body: {
  "user_id": 1001,
  "actions": [
    {
      "type": "change_plan",
      "payload": {"plan_id": 3}
    },
    {
      "type": "add_addon",
      "payload": {"addon_id": 101}
    }
  ]
}
Response: {
  "status": "ok",
  "order_id": "MOCK-FT-123"
}
```

### 5.2 cURL Örnekleri (Case'den)

```bash
# Fatura getirme
curl -s "http://localhost:3000/api/bills/1001?period=2025-07"

# Fatura açıklama
curl -s -X POST http://localhost:3000/api/explain \
  -H "Content-Type: application/json" \
  -d '{"bill_id":700101}'

# What-If simülasyonu
curl -s -X POST http://localhost:3000/api/whatif \
  -H "Content-Type: application/json" \
  -d '{"user_id":1001,"period":"2025-07","scenario":{"plan_id":3,"addons":[101],"disable_vas":true}}'

# Anomali tespiti
curl -s -X POST http://localhost:3000/api/anomalies \
  -H "Content-Type: application/json" \
  -d '{"user_id":1001,"period":"2025-07"}'

# Mock checkout
curl -s -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{"user_id":1001,"actions":[{"type":"change_plan","payload":{"plan_id":3}}]}'
```

---

## 6. MongoDB Database Tasarımı

### 6.1 Database Schema ve Collection Yapısı

MongoDB'de her collection için şema yapısı:

#### A. Users Collection

```javascript
// Collection: users
{
  "_id": ObjectId,
  "user_id": Number, // unique identifier
  "name": String,
  "msisdn": String, // unique
  "current_plan_id": Number, // reference to plans
  "type": String, // "postpaid", "prepaid"
  "active_vas": [String], // array of vas_ids
  "active_addons": [Number], // array of addon_ids
  "created_at": Date,
  "updated_at": Date
}
```

#### B. Plans Collection

```javascript
// Collection: plans
{
  "_id": ObjectId,
  "plan_id": Number, // unique identifier
  "plan_name": String,
  "type": String, // "postpaid", "prepaid"
  "quota_gb": Number,
  "quota_min": Number,
  "quota_sms": Number,
  "monthly_price": Number,
  "overage_gb": Number,
  "overage_min": Number,
  "overage_sms": Number,
  "is_active": Boolean,
  "created_at": Date
}
```

#### C. Bills Collection

```javascript
// Collection: bills
{
  "_id": ObjectId,
  "bill_id": String, // unique identifier
  "user_id": Number, // reference to users
  "period_start": Date,
  "period_end": Date,
  "issue_date": Date,
  "total_amount": Number,
  "subtotal": Number,
  "taxes": Number,
  "currency": String, // "TRY"
  "items": [
    {
      "item_id": String,
      "category": String, // data, voice, sms, roaming, premium_sms, vas, one_off, discount, tax
      "subtype": String, // data_overage, voice_overage, premium_3rdparty, etc.
      "description": String,
      "amount": Number,
      "unit_price": Number,
      "quantity": Number,
      "tax_rate": Number,
      "created_at": Date
    }
  ],
  "created_at": Date,
  "updated_at": Date
}
```

#### D. Usage Daily Collection

```javascript
// Collection: usage_daily
{
  "_id": ObjectId,
  "user_id": Number,
  "usage_date": Date,
  "mb_used": Number,
  "minutes_used": Number,
  "sms_used": Number,
  "roaming_mb": Number,
  "created_at": Date
}
```

#### E. VAS Catalog Collection

```javascript
// Collection: vas_catalog
{
  "_id": ObjectId,
  "vas_id": String, // unique identifier
  "name": String,
  "monthly_fee": Number,
  "provider": String,
  "category": String, // entertainment, communication, utility
  "is_active": Boolean,
  "created_at": Date
}
```

#### F. Premium SMS Catalog Collection

```javascript
// Collection: premium_sms_catalog
{
  "_id": ObjectId,
  "shortcode": String, // unique identifier
  "provider": String,
  "unit_price": Number,
  "service_name": String,
  "category": String, // game, entertainment, news
  "is_active": Boolean
}
```

#### G. Add-on Packs Collection

```javascript
// Collection: add_on_packs
{
  "_id": ObjectId,
  "addon_id": Number, // unique identifier
  "name": String,
  "type": String, // data, voice, sms, combo
  "extra_gb": Number,
  "extra_min": Number,
  "extra_sms": Number,
  "price": Number,
  "compatible_plans": [Number], // array of plan_ids
  "is_active": Boolean,
  "created_at": Date
}
```

### 6.2 MongoDB Collection Oluşturma ve Index'ler

```javascript
// MongoDB Collection ve Index oluşturma komutları

// Database bağlantısı
use fatura_asistani;

// Collections oluşturma ve indexler
db.createCollection("users");
db.createCollection("plans");
db.createCollection("bills");
db.createCollection("usage_daily");
db.createCollection("vas_catalog");
db.createCollection("premium_sms_catalog");
db.createCollection("add_on_packs");

// Indexler
db.users.createIndex({ "user_id": 1 }, { unique: true });
db.users.createIndex({ "msisdn": 1 }, { unique: true });

db.plans.createIndex({ "plan_id": 1 }, { unique: true });
db.plans.createIndex({ "type": 1, "is_active": 1 });

db.bills.createIndex({ "bill_id": 1 }, { unique: true });
db.bills.createIndex({ "user_id": 1, "period_start": -1 });
db.bills.createIndex({ "user_id": 1, "issue_date": -1 });

db.usage_daily.createIndex({ "user_id": 1, "usage_date": -1 });
db.usage_daily.createIndex({ "user_id": 1, "usage_date": 1 }, { unique: true });

db.vas_catalog.createIndex({ "vas_id": 1 }, { unique: true });
db.premium_sms_catalog.createIndex({ "shortcode": 1 }, { unique: true });
db.add_on_packs.createIndex({ "addon_id": 1 }, { unique: true });
```

### 6.3 Mock Veri Insert Komutları

```javascript
// Users collection mock data
db.users.insertMany([
  {
    "user_id": 1001,
    "name": "Ahmet Yılmaz",
    "msisdn": "5551234567",
    "current_plan_id": 2,
    "type": "postpaid",
    "active_vas": ["VAS001"],
    "active_addons": [101],
    "created_at": new Date(),
    "updated_at": new Date()
  },
  {
    "user_id": 1002,
    "name": "Fatma Demir",
    "msisdn": "5557891234",
    "current_plan_id": 1,
    "type": "postpaid",
    "active_vas": ["VAS002", "VAS003"],
    "active_addons": [],
    "created_at": new Date(),
    "updated_at": new Date()
  },
  {
    "user_id": 1003,
    "name": "Mehmet Kaya",
    "msisdn": "5556547890",
    "current_plan_id": 3,
    "type": "postpaid",
    "active_vas": [],
    "active_addons": [102, 103],
    "created_at": new Date(),
    "updated_at": new Date()
  }
]);

// Plans collection mock data
db.plans.insertMany([
  {
    "plan_id": 1,
    "plan_name": "Başlangıç 10GB",
    "type": "postpaid",
    "quota_gb": 10,
    "quota_min": 500,
    "quota_sms": 500,
    "monthly_price": 79.00,
    "overage_gb": 8.50,
    "overage_min": 0.85,
    "overage_sms": 0.35,
    "is_active": true,
    "created_at": new Date()
  },
  {
    "plan_id": 2,
    "plan_name": "Süper Online 20GB",
    "type": "postpaid",
    "quota_gb": 20,
    "quota_min": 1000,
    "quota_sms": 1000,
    "monthly_price": 129.00,
    "overage_gb": 8.50,
    "overage_min": 0.85,
    "overage_sms": 0.35,
    "is_active": true,
    "created_at": new Date()
  },
  {
    "plan_id": 3,
    "plan_name": "Premium 30GB",
    "type": "postpaid",
    "quota_gb": 30,
    "quota_min": 2000,
    "quota_sms": 2000,
    "monthly_price": 179.00,
    "overage_gb": 7.50,
    "overage_min": 0.75,
    "overage_sms": 0.30,
    "is_active": true,
    "created_at": new Date()
  }
]);

// Bills collection mock data (Temmuz 2025 - Anomali içeren)
db.bills.insertMany([
  {
    "bill_id": "BILL_1001_202507",
    "user_id": 1001,
    "period_start": new Date("2025-07-01"),
    "period_end": new Date("2025-07-31"),
    "issue_date": new Date("2025-08-05"),
    "total_amount": 189.50,
    "subtotal": 157.92,
    "taxes": 31.58,
    "currency": "TRY",
    "items": [
      {
        "item_id": "ITM_001",
        "category": "data",
        "subtype": "monthly_allowance",
        "description": "Süper Online 20GB Aylık Kotası",
        "amount": 129.00,
        "unit_price": 129.00,
        "quantity": 1,
        "tax_rate": 0.20,
        "created_at": new Date("2025-07-01")
      },
      {
        "item_id": "ITM_002",
        "category": "data",
        "subtype": "data_overage",
        "description": "Veri aşım ücreti (3.2GB)",
        "amount": 27.20,
        "unit_price": 8.50,
        "quantity": 3.2,
        "tax_rate": 0.20,
        "created_at": new Date("2025-07-28")
      },
      {
        "item_id": "ITM_003",
        "category": "premium_sms",
        "subtype": "premium_3rdparty",
        "description": "3838 numarasına Premium SMS",
        "amount": 59.85,
        "unit_price": 3.99,
        "quantity": 15,
        "tax_rate": 0.20,
        "created_at": new Date("2025-07-15")
      },
      {
        "item_id": "ITM_004",
        "category": "vas",
        "subtype": "vas_monthly",
        "description": "Caller Tunes aylık ücret",
        "amount": 9.90,
        "unit_price": 9.90,
        "quantity": 1,
        "tax_rate": 0.20,
        "created_at": new Date("2025-07-01")
      },
      {
        "item_id": "ITM_005",
        "category": "voice",
        "subtype": "voice_overage",
        "description": "Dakika aşım ücreti (45dk)",
        "amount": 38.25,
        "unit_price": 0.85,
        "quantity": 45,
        "tax_rate": 0.20,
        "created_at": new Date("2025-07-25")
      }
    ],
    "created_at": new Date(),
    "updated_at": new Date()
  },
  // Haziran 2025 - Karşılaştırma için normal fatura
  {
    "bill_id": "BILL_1001_202506",
    "user_id": 1001,
    "period_start": new Date("2025-06-01"),
    "period_end": new Date("2025-06-30"),
    "issue_date": new Date("2025-07-05"),
    "total_amount": 154.20,
    "subtotal": 128.50,
    "taxes": 25.70,
    "currency": "TRY",
    "items": [
      {
        "item_id": "ITM_006",
        "category": "data",
        "subtype": "monthly_allowance",
        "description": "Süper Online 20GB Aylık Kotası",
        "amount": 129.00,
        "unit_price": 129.00,
        "quantity": 1,
        "tax_rate": 0.20,
        "created_at": new Date("2025-06-01")
      },
      {
        "item_id": "ITM_007",
        "category": "premium_sms",
        "subtype": "premium_3rdparty",
        "description": "3838 numarasına Premium SMS",
        "amount": 7.98,
        "unit_price": 3.99,
        "quantity": 2,
        "tax_rate": 0.20,
        "created_at": new Date("2025-06-12")
      },
      {
        "item_id": "ITM_008",
        "category": "vas",
        "subtype": "vas_monthly",
        "description": "Caller Tunes aylık ücret",
        "amount": 9.90,
        "unit_price": 9.90,
        "quantity": 1,
        "tax_rate": 0.20,
        "created_at": new Date("2025-06-01")
      }
    ],
    "created_at": new Date(),
    "updated_at": new Date()
  }
]);

// Usage Daily collection mock data
db.usage_daily.insertMany([
  // Temmuz 2025 - günlük kullanımlar (seçili günler)
  {
    "user_id": 1001,
    "usage_date": new Date("2025-07-01"),
    "mb_used": 850,
    "minutes_used": 25,
    "sms_used": 5,
    "roaming_mb": 0,
    "created_at": new Date()
  },
  {
    "user_id": 1001,
    "usage_date": new Date("2025-07-15"),
    "mb_used": 1200,
    "minutes_used": 65,
    "sms_used": 8,
    "roaming_mb": 0,
    "created_at": new Date()
  },
  {
    "user_id": 1001,
    "usage_date": new Date("2025-07-28"),
    "mb_used": 2100,
    "minutes_used": 95,
    "sms_used": 12,
    "roaming_mb": 0,
    "created_at": new Date()
  },
  {
    "user_id": 1001,
    "usage_date": new Date("2025-07-31"),
    "mb_used": 950,
    "minutes_used": 40,
    "sms_used": 3,
    "roaming_mb": 0,
    "created_at": new Date()
  }
]);

// VAS Catalog mock data
db.vas_catalog.insertMany([
  {
    "vas_id": "VAS001",
    "name": "Caller Tunes",
    "monthly_fee": 9.90,
    "provider": "Turkcell",
    "category": "entertainment",
    "is_active": true,
    "created_at": new Date()
  },
  {
    "vas_id": "VAS002",
    "name": "SMS Paketi 1000",
    "monthly_fee": 15.50,
    "provider": "Turkcell",
    "category": "communication",
    "is_active": true,
    "created_at": new Date()
  },
  {
    "vas_id": "VAS003",
    "name": "Mobil TV",
    "monthly_fee": 19.90,
    "provider": "Digiturk",
    "category": "entertainment",
    "is_active": true,
    "created_at": new Date()
  },
  {
    "vas_id": "VAS004",
    "name": "Müzik Paketi",
    "monthly_fee": 12.50,
    "provider": "Fizy",
    "category": "entertainment",
    "is_active": true,
    "created_at": new Date()
  }
]);

// Premium SMS Catalog mock data
db.premium_sms_catalog.insertMany([
  {
    "shortcode": "3838",
    "provider": "Superonline",
    "unit_price": 3.99,
    "service_name": "Oyun Servisleri",
    "category": "game",
    "is_active": true
  },
  {
    "shortcode": "4545",
    "provider": "Avea Entertainment",
    "unit_price": 2.50,
    "service_name": "Müzik İndirme",
    "category": "entertainment",
    "is_active": true
  },
  {
    "shortcode": "5656",
    "provider": "Haber Merkezi",
    "unit_price": 1.99,
    "service_name": "Günlük Haber",
    "category": "news",
    "is_active": true
  },
  {
    "shortcode": "7878",
    "provider": "Astroloji Plus",
    "unit_price": 4.99,
    "service_name": "Günlük Burç",
    "category": "lifestyle",
    "is_active": true
  }
]);

// Add-on Packs mock data
db.add_on_packs.insertMany([
  {
    "addon_id": 101,
    "name": "Sosyal 5GB",
    "type": "data",
    "extra_gb": 5,
    "extra_min": 0,
    "extra_sms": 0,
    "price": 25.00,
    "compatible_plans": [1, 2, 3],
    "is_active": true,
    "created_at": new Date()
  },
  {
    "addon_id": 102,
    "name": "Konuşma 500dk",
    "type": "voice",
    "extra_gb": 0,
    "extra_min": 500,
    "extra_sms": 0,
    "price": 20.00,
    "compatible_plans": [1, 2, 3],
    "is_active": true,
    "created_at": new Date()
  },
  {
    "addon_id": 103,
    "name": "Combo 3GB+300dk",
    "type": "combo",
    "extra_gb": 3,
    "extra_min": 300,
    "extra_sms": 0,
    "price": 35.00,
    "compatible_plans": [1, 2, 3],
    "is_active": true,
    "created_at": new Date()
  },
  {
    "addon_id": 104,
    "name": "Gece 10GB",
    "type": "data",
    "extra_gb": 10,
    "extra_min": 0,
    "extra_sms": 0,
    "price": 15.00,
    "compatible_plans": [1, 2],
    "is_active": true,
    "created_at": new Date()
  },
  {
    "addon_id": 105,
    "name": "SMS 1000 Adet",
    "type": "sms",
    "extra_gb": 0,
    "extra_min": 0,
    "extra_sms": 1000,
    "price": 10.00,
    "compatible_plans": [1, 2, 3],
    "is_active": true,
    "created_at": new Date()
  }
]);

// Diğer kullanıcılar için de benzer faturalar
db.bills.insertMany([
  {
    "bill_id": "BILL_1002_202507",
    "user_id": 1002,
    "period_start": new Date("2025-07-01"),
    "period_end": new Date("2025-07-31"),
    "issue_date": new Date("2025-08-05"),
    "total_amount": 115.60,
    "subtotal": 96.33,
    "taxes": 19.27,
    "currency": "TRY",
    "items": [
      {
        "item_id": "ITM_009",
        "category": "data",
        "subtype": "monthly_allowance",
        "description": "Başlangıç 10GB Aylık Kotası",
        "amount": 79.00,
        "unit_price": 79.00,
        "quantity": 1,
        "tax_rate": 0.20,
        "created_at": new Date("2025-07-01")
      },
      {
        "item_id": "ITM_010",
        "category": "vas",
        "subtype": "vas_monthly",
        "description": "SMS Paketi 1000",
        "amount": 15.50,
        "unit_price": 15.50,
        "quantity": 1,
        "tax_rate": 0.20,
        "created_at": new Date("2025-07-01")
      },
      {
        "item_id": "ITM_011",
        "category": "vas",
        "subtype": "vas_monthly",
        "

---

## 7. API Tasarımı ve Dokümantasyonu

### 7.1 API Base URL ve Authentication
```

Base URL: http://localhost:3000/api
Content-Type: application/json
Authentication: None (hackathon için)

````

### 7.2 API Endpoints - Detaylı Spesifikasyon

#### A. User Management

```http
GET /api/users
Description: Tüm kullanıcıları listele
Response 200:
{
  "success": true,
  "data": [
    {
      "user_id": 1001,
      "name": "Ahmet Yılmaz",
      "msisdn": "5551234567",
      "current_plan": {
        "plan_id": 2,
        "plan_name": "Süper Online 20GB",
        "monthly_price": 129.00
      },
      "type": "postpaid"
    }
  ]
}

GET /api/users/{user_id}
Description: Belirli kullanıcı bilgisi
Response 200:
{
  "success": true,
  "data": {
    "user_id": 1001,
    "name": "Ahmet Yılmaz",
    "msisdn": "5551234567",
    "current_plan": {
      "plan_id": 2,
      "plan_name": "Süper Online 20GB",
      "quota_gb": 20,
      "quota_min": 1000,
      "quota_sms": 1000,
      "monthly_price": 129.00,
      "overage_gb": 8.50
    },
    "type": "postpaid",
    "active_vas": ["VAS001"],
    "active_addons": [101]
  }
}
````

#### B. Bill Management

```http
GET /api/bills/{user_id}
Query Parameters:
  - period: YYYY-MM (optional, defaults to current month)
  - include_items: boolean (default: true)

Description: Kullanıcının fatura bilgileri
Response 200:
{
  "success": true,
  "data": {
    "bill": {
      "bill_id": 700101,
      "user_id": 1001,
      "period_start": "2025-07-01",
      "period_end": "2025-07-31",
      "issue_date": "2025-08-05",
      "total_amount": 189.50,
      "currency": "TRY"
    },
    "items": [
      {
        "item_id": "ITM001",
        "category": "premium_sms",
        "subtype": "premium_3rdparty",
        "description": "3838 numarasına Premium SMS",
        "amount": 59.85,
        "unit_price": 3.99,
        "quantity": 15,
        "tax_rate": 0.20,
        "created_at": "2025-07-15T14:30:00Z"
      },
      {
        "item_id": "ITM002",
        "category": "data",
        "subtype": "data_overage",
        "description": "Veri aşım ücreti",
        "amount": 25.50,
        "unit_price": 8.50,
        "quantity": 3,
        "tax_rate": 0.20
      }
    ],
    "summary": {
      "subtotal": 157.92,
      "taxes": 31.58,
      "total": 189.50
    }
  }
}

GET /api/bills/{user_id}/history
Query Parameters:
  - months: number (default: 6, max: 12)

Description: Kullanıcının fatura geçmişi
Response 200:
{
  "success": true,
  "data": [
    {
      "period": "2025-07",
      "total_amount": 189.50,
      "change_percent": +23.5,
      "anomaly_count": 2
    },
    {
      "period": "2025-06",
      "total_amount": 154.20,
      "change_percent": -5.2,
      "anomaly_count": 0
    }
  ]
}
```

#### C. Explanation Engine

```http
POST /api/explain
Content-Type: application/json
Body:
{
  "bill_id": 700101,
  "language": "tr" // optional, default: tr
}

Description: Faturayı açıklanabilir formatta döndür
Response 200:
{
  "success": true,
  "data": {
    "summary": {
      "total": 189.50,
      "taxes": 31.58,
      "savings_hint": "Alternatif planla 87 TL tasarruf mümkün",
      "natural_language": "Bu ay toplam 23.2GB veri, 845dk arama yaptınız. Ücret artışının %65'i Premium SMS kaynaklı."
    },
    "breakdown": [
      {
        "category": "premium_sms",
        "total": 59.85,
        "percentage": 31.6,
        "lines": [
          "3838 numarasına 15×Premium SMS → 15×3.99 TL (sağlayıcı: Superonline)",
          "Oyun/Eğlence kategorisi premium servisleri"
        ]
      },
      {
        "category": "data",
        "total": 25.50,
        "percentage": 13.5,
        "lines": [
          "Plan kotası: 20GB, kullanılan: 23.2GB",
          "Aşım ücreti: 3.2GB × 8.50 TL = 27.20 TL"
        ]
      }
    ]
  }
}
```

#### D. Anomaly Detection

```http
POST /api/anomalies
Content-Type: application/json
Body:
{
  "user_id": 1001,
  "period": "2025-07",
  "threshold": 0.8 // optional, default: 0.8 (%80)
}

Description: Faturadaki anomalileri tespit et
Response 200:
{
  "success": true,
  "data": {
    "anomalies": [
      {
        "category": "premium_sms",
        "current_amount": 59.85,
        "historical_average": 18.42,
        "delta": "+225%",
        "severity": "high", // high, medium, low
        "reason": "Son 3 ay ortalaması 18.42 TL iken bu ay 59.85 TL",
        "suggested_action": "Premium SMS bloklama önerilir",
        "first_occurrence": false
      },
      {
        "category": "roaming",
        "current_amount": 45.60,
        "historical_average": 0.00,
        "delta": "YENİ",
        "severity": "medium",
        "reason": "İlk kez yurt dışı kullanım tespit edildi",
        "suggested_action": "Roaming paketlerini değerlendirin",
        "first_occurrence": true
      }
    ],
    "total_anomalies": 2,
    "risk_score": 7.8 // 0-10 arası
  }
}
```

#### E. What-If Simulation

```http
POST /api/whatif
Content-Type: application/json
Body:
{
  "user_id": 1001,
  "period": "2025-07",
  "scenario": {
    "plan_id": 3, // optional
    "addons": [101, 102], // optional addon ids
    "disable_vas": true, // optional
    "block_premium_sms": true, // optional
    "enable_roaming_block": true // optional
  }
}

Description: Alternatif senaryo maliyetini hesapla
Response 200:
{
  "success": true,
  "data": {
    "current_total": 189.50,
    "new_total": 102.45,
    "saving": 87.05,
    "saving_percent": 45.9,
    "details": [
      "Plan değişikliği: Premium 30GB → +179.00 TL",
      "Sosyal 5GB ek paketi → +25.00 TL",
      "VAS iptali (Caller Tunes) → -9.90 TL",
      "Premium SMS bloke → -59.85 TL",
      "Aşım düşüşü (30GB > 23.2GB) → -25.50 TL",
      "Vergiler (%20 KDV) → +24.49 TL"
    ],
    "recommendations": [
      "En yüksek tasarruf bu senaryoda",
      "Veri aşımınız tamamen elimine edilir",
      "Premium SMS riskini ortadan kaldırır"
    ]
  }
}

POST /api/whatif/compare
Content-Type: application/json
Body:
{
  "user_id": 1001,
  "period": "2025-07",
  "scenarios": [
    {"plan_id": 1, "addons": [101]},
    {"plan_id": 3, "disable_vas": true},
    {"addons": [101, 102], "block_premium_sms": true}
  ]
}

Description: Birden fazla senaryoyu karşılaştır
Response 200:
{
  "success": true,
  "data": {
    "current_total": 189.50,
    "scenarios": [
      {
        "id": 1,
        "name": "Başlangıç + Sosyal",
        "total": 125.30,
        "saving": 64.20,
        "rank": 2
      },
      {
        "id": 2,
        "name": "Premium (VAS iptal)",
        "total": 102.45,
        "saving": 87.05,
        "rank": 1
      },
      {
        "id": 3,
        "name": "Mevcut + Ek paketler",
        "total": 155.65,
        "saving": 33.85,
        "rank": 3
      }
    ],
    "best_scenario": {
      "id": 2,
      "saving": 87.05,
      "saving_percent": 45.9
    }
  }
}
```

#### F. Catalog Management

```http
GET /api/catalog
Description: Tüm katalog bilgilerini getir
Response 200:
{
  "success": true,
  "data": {
    "plans": [
      {
        "plan_id": 2,
        "plan_name": "Süper Online 20GB",
        "type": "postpaid",
        "quota_gb": 20,
        "quota_min": 1000,
        "quota_sms": 1000,
        "monthly_price": 129.00,
        "overage_gb": 8.50,
        "popular": true
      }
    ],
    "addons": [
      {
        "addon_id": 101,
        "name": "Sosyal 5GB",
        "type": "data",
        "extra_gb": 5,
        "price": 25.00,
        "compatible_plans": [1, 2, 3]
      }
    ],
    "vas": [
      {
        "vas_id": "VAS001",
        "name": "Caller Tunes",
        "monthly_fee": 9.90,
        "provider": "Turkcell",
        "category": "entertainment"
      }
    ],
    "premium_sms": [
      {
        "shortcode": "3838",
        "provider": "Superonline",
        "unit_price": 3.99,
        "service_name": "Oyun Servisleri"
      }
    ]
  }
}
```

#### G. Mock Checkout

```http
POST /api/checkout
Content-Type: application/json
Body:
{
  "user_id": 1001,
  "actions": [
    {
      "type": "change_plan",
      "payload": {"plan_id": 3}
    },
    {
      "type": "add_addon",
      "payload": {"addon_id": 101}
    },
    {
      "type": "cancel_vas",
      "payload": {"vas_id": "VAS001"}
    },
    {
      "type": "block_premium_sms",
      "payload": {"enable": true}
    }
  ]
}

Description: Mock sipariş işlemleri
Response 201:
{
  "success": true,
  "data": {
    "order_id": "MOCK-FT-20250818-001",
    "status": "completed",
    "total_saving": 87.05,
    "effective_date": "2025-09-01",
    "actions_applied": [
      {
        "type": "change_plan",
        "status": "success",
        "message": "Plan Premium 30GB olarak değiştirildi"
      },
      {
        "type": "add_addon",
        "status": "success",
        "message": "Sosyal 5GB paketi eklendi"
      }
    ],
    "next_bill_estimate": 102.45
  }
}
```

#### H. LLM Integration

```http
POST /api/llm/explain
Content-Type: application/json
Body:
{
  "question": "Bu ay Premium SMS harcaman neden arttı?",
  "context": {
    "user_id": 1001,
    "period": "2025-07",
    "bill_id": 700101
  }
}

Description: LLM ile doğal dil açıklaması
Response 200:
{
  "success": true,
  "data": {
    "explanation": "Bu ay 15 adet premium SMS gönderdin (geçen ay sadece 2'ydi). Bunların çoğu 3838 numaralı oyun servisine gitti. Her biri 3.99 TL olduğu için toplam 59.85 TL ekstra ücret oluştu. Premium SMS'leri bloke etmeyi düşünebilirsin.",
    "confidence": 0.92,
    "suggestions": [
      "Premium SMS bloklaması aktifleştir",
      "Oyun ve eğlence servisleri için limit belirle"
    ],
    "model_used": "gpt-4"
  }
}
```

### 7.3 Error Handling

```http
Error Response Structure:
{
  "success": false,
  "error": {
    "code": "BILL_NOT_FOUND",
    "message": "Belirtilen dönem için fatura bulunamadı",
    "details": {
      "user_id": 1001,
      "period": "2025-08"
    }
  }
}

Common Error Codes:
- USER_NOT_FOUND (404)
- BILL_NOT_FOUND (404)
- INVALID_PERIOD (400)
- INVALID_SCENARIO (400)
- LLM_SERVICE_ERROR (503)
- CALCULATION_ERROR (500)
```

---

## 8. Frontend Tasarımı (React Native)

### 8.1 Ekran Hiyerarşisi ve Navigation

```javascript
// App.js - Navigation Structure
const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="UserSelection">
        <Stack.Screen name="UserSelection" component={UserSelectionScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="BillDetail" component={BillDetailScreen} />
        <Stack.Screen name="Anomalies" component={AnomaliesScreen} />
        <Stack.Screen name="WhatIfSimulator" component={WhatIfScreen} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} />
        <Stack.Screen name="LLMExplain" component={LLMExplainScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

### 8.2 Detaylı Ekran Spesifikasyonları

#### A. User Selection Screen (Kullanıcı Seçimi)

```javascript
// UserSelectionScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

const UserSelectionScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/users');
      const data = await response.json();
      setUsers(data.data);
    } catch (error) {
      console.error('Users fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = user => {
    setSelectedUser(user);
    navigation.navigate('Dashboard', {
      userId: user.user_id,
      userName: user.name,
    });
  };

  return (
    <View className="flex-1 bg-gray-50 p-6">
      {/* Header */}
      <View className="mt-12 mb-8">
        <Text className="text-3xl font-bold text-gray-900">
          Fatura Asistanı
        </Text>
        <Text className="text-lg text-gray-600 mt-2">Kullanıcınızı seçin</Text>
      </View>

      {/* User List */}
      <ScrollView className="flex-1">
        {users.map(user => (
          <TouchableOpacity
            key={user.user_id}
            className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-200"
            onPress={() => handleUserSelect(user)}
          >
            <Text className="text-lg font-semibold text-gray-900">
              {user.name}
            </Text>
            <Text className="text-sm text-gray-500">{user.msisdn}</Text>
            <Text className="text-sm text-blue-600 mt-1">
              {user.current_plan.plan_name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};
```

#### B. Dashboard Screen (Ana Sayfa)

```javascript
// DashboardScreen.js
const DashboardScreen = ({ route, navigation }) => {
  const { userId, userName } = route.params;
  const [billData, setBillData] = useState(null);
  const [anomalies, setAnomalies] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('2025-07');

  const BillSummaryCard = ({ bill }) => (
    <View className="bg-white rounded-xl p-6 m-4 shadow-lg">
      <Text className="text-2xl font-bold text-gray-900">₺{bill.total_amount}</Text>
      <Text className="text-gray-600 mb-4">Toplam Fatura</Text>

      <View className="flex-row justify-between">
        <View>
          <Text className="text-sm text-gray-500">Hizmetler</Text>
          <Text className="text-lg font-semibold">₺{bill.subtotal}</Text>
        </View>
        <View>
          <Text className="text-sm text-gray-500">Vergiler</Text>
          <Text className="text-lg font-semibold">₺{bill.taxes}</Text>
        </View>
      </View>

      {anomalies.length > 0 && (
        <TouchableOpacity
          className="bg-yellow-100 rounded-lg p-3 mt-4"
          onPress={() => navigation.navigate('Anomalies', { userId, period: selectedPeriod })}
        >
          <Text className="text-yellow-800 font-medium">
            ⚠️ {anomalies.length} anomali tespit edildi
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const CategoryCard = ({ category, amount, percentage, color }) => (
    <View className="bg-white rounded-lg p-4 m-2 flex-1 shadow-sm">
      <View className={`w-4 h-4 rounded-full bg-${color}-500 mb-2`} />
      <Text className="text-sm text-gray-500 uppercase">{category}</Text>
      <Text className="text-lg font-bold text-gray-900">₺{amount}</Text>
      <Text className="text-xs text-gray-400">%{percentage}</Text>

```
