import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCiVyiPSlSAdfHsWGbKqxoK-ZFTBdPqsNs",
  authDomain: "moodtracker-app-d6b42.firebaseapp.com",
  projectId: "moodtracker-app-d6b42",
  storageBucket: "moodtracker-app-d6b42.firebasestorage.app",
  messagingSenderId: "57804525083",
  appId: "1:57804525083:web:3ff42e4d46e95a81d572be",
  measurementId: "G-CF3FE737NF"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testNotifications() {
  console.log('----------------------------------------------------');
  console.log('🚀 心情加油站 - FCM 推送通知系統連線與發送測試工具');
  console.log('----------------------------------------------------');

  const args = process.argv.slice(2);
  let passedKey = args[0] ? args[0].trim() : null;

  // 1. Load push notification settings
  console.log('📡 1. 正在從 Firestore 讀取系統推送設定 (system_settings)...');
  const pushConfigSnap = await getDoc(doc(db, "system_settings", "push_notifications"));
  let vapidKey = 'BOAMWObDC_aDjW8OmSLiWB_2Y1E_bsSKYEmzLxd9AjPIh2RYOlTG49Vtd7Ocu1G3X4ti1QmzwHVJDbaLKvzFmp0';
  let fcmServerKey = 'BOAMWObDC_aDjW8OmSLiWB_2Y1E_bsSKYEmzLxd9AjPIh2RYOlTG49Vtd7Ocu1G3X4ti1QmzwHVJDbaLKvzFmp0';

  if (pushConfigSnap.exists()) {
    const pushData = pushConfigSnap.data();
    vapidKey = pushData.vapid_key || vapidKey;
    fcmServerKey = pushData.fcm_server_key || fcmServerKey;
  }

  // If key is passed via CLI, update it in Firestore first!
  if (passedKey) {
    console.log(`\n⚙️  偵測到 CLI 傳入的金鑰參數。正在將金鑰寫入 Firestore...`);
    try {
      await setDoc(doc(db, "system_settings", "push_notifications"), {
        vapid_key: vapidKey,
        fcm_server_key: passedKey,
        updatedAt: serverTimestamp(),
        updatedBy: 'Test-Script-CLI'
      }, { merge: true });
      fcmServerKey = passedKey;
      console.log(`✅ 金鑰已成功存入資料庫！`);
    } catch (e: any) {
      console.error(`❌ 寫入金鑰失敗 (可能缺少權限):`, e.message || e);
    }
  }

  console.log(`   - VAPID 公鑰: ${vapidKey ? '✅ 已設定 (' + vapidKey.substring(0, 10) + '...)' : '❌ 未設定'}`);
  console.log(`   - FCM 伺服器金鑰: ${fcmServerKey ? '✅ 已設定 (' + fcmServerKey.substring(0, 10) + '...)' : '❌ 未設定'}`);

  if (!fcmServerKey) {
    console.error('\n❌ 錯誤：資料庫中未設定 FCM Server Key 且無命令列輸入！');
    console.log('\n💡 使用方法：');
    console.log('   npx tsx test_notification.ts [您的_FCM_SERVER_KEY]');
    console.log('   (這會將金鑰同步存入資料庫並執行推送測試！)\n');
    process.exit(1);
  }

  // 2. Fetch active subscriptions
  console.log('\n👥 2. 正在讀取已註冊的裝置訂閱 (fcm_subscriptions)...');
  const subSnap = await getDocs(collection(db, "fcm_subscriptions"));
  if (subSnap.empty) {
    console.log('⚠️ 警告：目前沒有任何註冊的訂閱裝置！請在瀏覽器打開網頁並點選「啟用並訂閱」後再試。');
    process.exit(0);
  }

  console.log(`   - 發現 ${subSnap.size} 個註冊的訂閱項目：`);
  const subscriptions = subSnap.docs.map(d => ({
    id: d.id,
    ...d.data()
  })) as any[];

  subscriptions.forEach((sub, idx) => {
    console.log(`     [#${idx + 1}] ID: ${sub.id}`);
    console.log(`         - 班級: ${sub.class || '無/全校'}`);
    console.log(`         - 裝置: ${sub.device || '未知'}`);
    console.log(`         - 身份: ${sub.email || 'anonymous'}`);
    console.log(`         - Token: ${sub.token ? sub.token.substring(0, 20) + '...' : '❌ 無'}`);
  });

  // 3. Dispatch test notification to all tokens
  console.log('\n⚡ 3. 正在測試推送通知發送...');
  const tokens = subscriptions.map(s => s.token).filter(Boolean);
  if (tokens.length === 0) {
    console.error('❌ 錯誤：沒有可用的有效 FCM Token。');
    process.exit(1);
  }

  // A. Test the legacy endpoint
  console.log('\n📡 [測試 A] 嘗試調用 Legacy FCM API (https://fcm.googleapis.com/fcm/send)...');
  try {
    const res = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `key=${fcmServerKey.trim()}`
      },
      body: JSON.stringify({
        registration_ids: tokens,
        notification: {
          title: '🧪 系統測試 - Legacy FCM API 測試',
          body: '這代表您的 Legacy FCM 連結測試。',
          icon: '/icon.svg'
        }
      })
    });

    console.log(`   - 回應狀態碼: ${res.status} ${res.statusText}`);
    const resultText = await res.text();
    console.log(`   - 回應內容:`, resultText);
  } catch (err: any) {
    console.log('   - Legacy FCM API 網路異常 (符合預期，舊版可能已被禁用):', err.message || err);
  }

  // B. Test the deployed Cloud Function modern proxy endpoint
  const proxyUrl = 'https://moodtracker-app-d6b42.web.app/api/sendPush';
  console.log(`\n📡 [測試 B] 嘗試調用 Modern FCM v1 API 安全代理 (via Firebase Function/Hosting rewrite) ➔ ${proxyUrl}...`);
  try {
    const res = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${fcmServerKey.trim()}`
      },
      body: JSON.stringify({
        registration_ids: tokens,
        notification: {
          title: '🧪 心情加油站 - FCM v1 安全代理測試成功',
          body: '您好！這是一條透過 Firebase Cloud Function (FCM v1 安全代理) 發送的測試通知。這代表您的設備可以正常接收來自心情加油站的即時情緒預警。',
          icon: '/icon.svg'
        }
      })
    });

    console.log(`   - 回應狀態碼: ${res.status} ${res.statusText}`);
    const resultText = await res.text();
    console.log(`   - 回應內容:`, resultText);

    try {
      const result = JSON.parse(resultText);
      console.log('\n----------------------------------------------------');
      if (res.ok && result.success !== undefined) {
        console.log(`✅ [測試 B] FCM v1 代理髮送成功！`);
        console.log(`   - 成功發送個數: ${result.success}`);
        console.log(`   - 失敗個數: ${result.failure}`);
        if (result.results) {
          result.results.forEach((r: any, idx: number) => {
            if (r.error) {
              console.log(`     - 項目 #${idx + 1} 失敗原因: ${r.error}`);
            } else {
              console.log(`     - 項目 #${idx + 1} 成功，Message ID: ${r.message_id}`);
            }
          });
        }
      } else {
        console.log(`❌ [測試 B] FCM v1 代理測試未完全成功。`);
      }
      console.log('----------------------------------------------------');
    } catch (e) {
      console.log(`⚠️ 解析 JSON 回應失敗，原始內容如下：`, resultText);
    }
  } catch (err: any) {
    console.error('❌ [測試 B] 發生網路異常：', err.message || err);
  }

}

testNotifications().catch(err => {
  console.error('❌ 執行發生未預期錯誤：', err);
});
