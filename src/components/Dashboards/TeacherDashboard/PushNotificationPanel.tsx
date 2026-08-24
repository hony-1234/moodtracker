import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Bell,
  Key,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Smartphone,
  Trash2,
  Send,
  Save,
  Eye,
  EyeOff,
  RefreshCw,
  Info
} from 'lucide-react';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  serverTimestamp,
  addDoc
} from 'firebase/firestore';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { db, app } from '../../../firebase/config';

interface PushNotificationPanelProps {
  currentUser: any;
  selectedClass: string;
}

export const PushNotificationPanel: React.FC<PushNotificationPanelProps> = ({ currentUser, selectedClass }) => {
  // Config keys
  const [vapidKey, setVapidKey] = useState('BOAMWObDC_aDjW8OmSLiWB_2Y1E_bsSKYEmzLxd9AjPIh2RYOlTG49Vtd7Ocu1G3X4ti1QmzwHVJDbaLKvzFmp0');
  const [fcmServerKey, setFcmServerKey] = useState('BOAMWObDC_aDjW8OmSLiWB_2Y1E_bsSKYEmzLxd9AjPIh2RYOlTG49Vtd7Ocu1G3X4ti1QmzwHVJDbaLKvzFmp0');
  const [showServerKey, setShowFcmServerKey] = useState(false);
  const [isSavingKeys, setIsSavingKeys] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  // Subscription states
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [activeToken, setActiveToken] = useState<string | null>(null);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  
  // List of active subscriptions for this user
  const [mySubscriptions, setMySubscriptions] = useState<any[]>([]);
  const [isLoadingSubscriptions, setIsLoadingSubscriptions] = useState(false);

  // Check browser support and load current permission on mount
  useEffect(() => {
    const supported = typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);
    if (supported) {
      setPermission(Notification.permission);
    }
  }, []);

  // Load Settings & Keys
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const docRef = doc(db, 'system_settings', 'push_notifications');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          setVapidKey(data.vapid_key || 'BOAMWObDC_aDjW8OmSLiWB_2Y1E_bsSKYEmzLxd9AjPIh2RYOlTG49Vtd7Ocu1G3X4ti1QmzwHVJDbaLKvzFmp0');
          setFcmServerKey(data.fcm_server_key || 'BOAMWObDC_aDjW8OmSLiWB_2Y1E_bsSKYEmzLxd9AjPIh2RYOlTG49Vtd7Ocu1G3X4ti1QmzwHVJDbaLKvzFmp0');
        } else {
          setVapidKey('BOAMWObDC_aDjW8OmSLiWB_2Y1E_bsSKYEmzLxd9AjPIh2RYOlTG49Vtd7Ocu1G3X4ti1QmzwHVJDbaLKvzFmp0');
          setFcmServerKey('BOAMWObDC_aDjW8OmSLiWB_2Y1E_bsSKYEmzLxd9AjPIh2RYOlTG49Vtd7Ocu1G3X4ti1QmzwHVJDbaLKvzFmp0');
        }
      } catch (err) {
        console.error('Failed to load push settings:', err);
      } finally {
        setIsLoadingSettings(false);
      }
    };
    loadSettings();
  }, []);

  // Load User Subscriptions
  const loadSubscriptions = async () => {
    if (!selectedClass) return;
    setIsLoadingSubscriptions(true);
    try {
      let q;
      if (selectedClass === 'GCCPS') {
        // Admin: Load all school-wide subscriptions (including testing class and other classes)
        q = query(collection(db, 'fcm_subscriptions'));
      } else {
        // Teachers: Load subscriptions for their specific class or empty/general class subscriptions
        const queryClasses = Array.from(new Set([selectedClass, ''])).filter((c) => typeof c === 'string' && c !== undefined && c !== null);
        q = query(
          collection(db, 'fcm_subscriptions'),
          where('class', 'in', queryClasses)
        );
      }
      const snap = await getDocs(q);
      const subs = snap.docs.map((d) => ({
        id: d.id,
        ...d.data()
      }));
      setMySubscriptions(subs);

      // Check if current device is in the list
      const localToken = localStorage.getItem('moodtracker_fcm_token');
      if (localToken) {
        const found = subs.find((s) => s.token === localToken);
        if (found) {
          setActiveToken(localToken);
        } else {
          setActiveToken(null);
          localStorage.removeItem('moodtracker_fcm_token');
        }
      }
    } catch (err: any) {
      console.error('Failed to load subscriptions:', err);
      alert('❌ 載入已訂閱裝置列表失敗，請將此錯誤回報給管理員：\n' + (err.message || String(err)));
    } finally {
      setIsLoadingSubscriptions(false);
    }
  };

  useEffect(() => {
    loadSubscriptions();
  }, [selectedClass]);

  // Handle foreground notification banners
  useEffect(() => {
    if (!isSupported || !activeToken) return;
    try {
      const messaging = getMessaging(app);
      const unsub = onMessage(messaging, (payload) => {
        console.log('[PushNotificationPanel] Received foreground message: ', payload);
        if (Notification.permission === 'granted') {
          const title = payload.notification?.title || '🏫 心情加油站 - 即時警報';
          const options = {
            body: payload.notification?.body || '收到新的學生情緒預警。',
            icon: payload.notification?.icon || '/icon.svg',
            badge: '/icon.svg',
            tag: payload.messageId || String(Date.now()), // Prevent duplicate visual banner popups
            data: payload.data || {}
          };
          
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then((reg) => {
              reg.showNotification(title, options);
            }).catch(() => {
              new Notification(title, options);
            });
          } else {
            new Notification(title, options);
          }
        }
      });
      return () => unsub();
    } catch (err) {
      console.warn('Foreground messaging listener setup failed:', err);
    }
  }, [isSupported, activeToken]);

  // Handle saving API Keys
  const handleSaveKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingKeys(true);
    try {
      await setDoc(doc(db, 'system_settings', 'push_notifications'), {
        vapid_key: vapidKey.trim(),
        fcm_server_key: fcmServerKey.trim(),
        updatedAt: serverTimestamp(),
        updatedBy: currentUser?.email || 'admin'
      });
      alert('✅ 推送通知 API 金鑰設定儲存成功！');
    } catch (err: any) {
      console.error('Failed to save push credentials:', err);
      alert('❌ 儲存失敗：' + (err.message || String(err)));
    } finally {
      setIsSavingKeys(false);
    }
  };

  // Subscribe this device
  const handleSubscribe = async () => {
    if (!isSupported) {
      alert('❌ 您的瀏覽器不支援推送通知功能。');
      return;
    }
    if (!vapidKey) {
      alert('⚠️ 系統尚未配置 VAPID 公鑰，請聯絡學校 IT 系統管理員。');
      return;
    }

    setIsSubscribing(true);
    try {
      // 1. Request Browser Permission
      const reqPermission = await Notification.requestPermission();
      setPermission(reqPermission);
      if (reqPermission !== 'granted') {
        alert('⚠️ 權限被拒絕。請在瀏覽器網址列設定中啟用通知，否則將無法收到情緒警報。');
        setIsSubscribing(false);
        return;
      }

      // 2. Register Service Worker and get token
      console.log('Registering FCM Service Worker and fetching token...');
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      const messaging = getMessaging(app);
      
      const token = await getToken(messaging, {
        serviceWorkerRegistration: registration,
        vapidKey: vapidKey.trim()
      });

      if (!token) {
        throw new Error('未取得有效 FCM Token');
      }

      // 3. Save subscription to Firestore
      const userAgent = navigator.userAgent;
      let deviceLabel = '桌面型瀏覽器';
      if (/iPhone|iPad|iPod/i.test(userAgent)) {
        deviceLabel = 'iPhone / iOS 行動裝置';
      } else if (/Android/i.test(userAgent)) {
        deviceLabel = 'Android 行動裝置';
      }

      const newSubRef = await addDoc(collection(db, 'fcm_subscriptions'), {
        email: currentUser?.email || 'anonymous',
        token,
        device: deviceLabel,
        userAgent,
        createdAt: serverTimestamp(),
        class: selectedClass // Link the subscription to the logged-in class
      });

      localStorage.setItem('moodtracker_fcm_token', token);
      setActiveToken(token);
      await loadSubscriptions();
      alert('🎉 恭喜！本裝置已成功啟用情緒預警即時推送。');
    } catch (err: any) {
      console.error('Subscription error:', err);
      alert('❌ 訂閱失敗：' + (err.message || String(err)));
    } finally {
      setIsSubscribing(false);
    }
  };

  // Unsubscribe a device
  const handleUnsubscribe = async (subId: string, tokenToClear: string) => {
    if (!window.confirm('確定要移除此裝置的推送通知訂閱嗎？')) return;

    try {
      await deleteDoc(doc(db, 'fcm_subscriptions', subId));
      if (localStorage.getItem('moodtracker_fcm_token') === tokenToClear) {
        localStorage.removeItem('moodtracker_fcm_token');
        setActiveToken(null);
      }
      await loadSubscriptions();
      alert('✅ 已移除該裝置的推送訂閱。');
    } catch (err: any) {
      console.error('Failed to unsubscribe:', err);
      alert('❌ 移除失敗: ' + (err.message || String(err)));
    }
  };

  // Send Test Push
  const handleSendTestPush = async () => {
    if (!fcmServerKey) {
      alert('⚠️ 尚未設定 FCM Server Key，無法測試發送。');
      return;
    }
    if (mySubscriptions.length === 0) {
      alert('⚠️ 尚未訂閱任何裝置，請先點擊上方按鈕訂閱本裝置。');
      return;
    }

    setIsTesting(true);
    try {
      const tokens = mySubscriptions.map((s) => s.token);
      
      // Call the secure same-origin Cloud Function endpoint /api/sendPush which proxies via FCM HTTP v1 safely
      const res = await fetch('/api/sendPush', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${fcmServerKey.trim()}`
        },
        body: JSON.stringify({
          registration_ids: tokens,
          notification: {
            title: '🧪 心情加油站 - 測試推送成功',
            body: '您好！這是一條測試預警推送通知。這代表您的設備與 GCCPS 即時情緒系統已完成連結！',
            icon: '/icon.svg',
            click_action: window.location.origin
          }
        })
      });

      if (!res.ok) {
        throw new Error('FCM API error: ' + (await res.text()));
      }

      const result = await res.json();
      console.log('Test notification sent: ', result);
      alert(`🎉 測試推送已發出！\n成功發送至 ${result.success} 個裝置。請檢查您的手機或通知中心！`);
    } catch (err: any) {
      console.error('Test push error:', err);
      alert('❌ 測試發送失敗：' + (err.message || String(err)));
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="bg-white border border-slate-200 p-6 rounded-2xl space-y-6 font-sans text-slate-700"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <h4 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-500 animate-bounce" />
            🔔 即時情緒警報推送通知中心 (PWA Web Push)
          </h4>
          <p className="text-xs text-slate-400 mt-1 font-semibold">
            設定並訂閱學生情緒嚴重低落時的即時通知，即使關閉網頁、手機鎖屏也可用 PWA 接收。
          </p>
        </div>

        <button
          onClick={loadSubscriptions}
          disabled={isLoadingSubscriptions}
          className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-black px-3.5 py-2 rounded-xl transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSubscriptions ? 'animate-spin' : ''}`} />
          刷新裝置
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Subscription status & buttons */}
        <div className="lg:col-span-7 space-y-5">
          {/* Support Warning Banner */}
          {!isSupported && (
            <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl flex items-start gap-2.5 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">您的瀏覽器或作業系統目前不支援 PWA 推送通知</p>
                <p className="mt-1 text-slate-500 font-medium">
                  iOS (iPhone) 系統必須為 <strong>iOS 16.4 或更新版本</strong>，且必須使用 Safari 瀏覽器打開此網頁並點選 <strong>「分享 ➔ 加入主畫面」</strong>，從主畫面圖示打開，才能啟用推送功能。
                </p>
              </div>
            </div>
          )}

          {/* Browser Notification State */}
          {isSupported && (
            <div className="bg-slate-50/50 p-5 rounded-xl border border-slate-100 space-y-4">
              <h5 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-indigo-500" />
                當前本機裝置與瀏覽器連線狀態
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold">
                <div className="p-3 bg-white border border-slate-200 rounded-lg flex flex-col justify-center">
                  <span className="text-slate-400 font-bold text-[10px]">瀏覽器通知授權</span>
                  <span
                    className={`mt-1 font-black ${
                      permission === 'granted'
                        ? 'text-emerald-600'
                        : permission === 'denied'
                        ? 'text-rose-600'
                        : 'text-amber-600'
                    }`}
                  >
                    {permission === 'granted' ? '✅ 已授權發送' : permission === 'denied' ? '❌ 已拒絕通知' : '❓ 尚未要求權限'}
                  </span>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-lg flex flex-col justify-center">
                  <span className="text-slate-400 font-bold text-[10px]">本機警警報連結</span>
                  <span className={`mt-1 font-black ${activeToken ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {activeToken ? '✅ 已訂閱此裝置' : '⚪ 尚未訂閱本裝置'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2">
                {!activeToken ? (
                  <button
                    onClick={handleSubscribe}
                    disabled={isSubscribing || !isSupported}
                    className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-black text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Bell className="w-4 h-4" />
                    {isSubscribing ? '正在進行安全訂閱連線...' : '🔔 啟用並訂閱此裝置的情緒推送警報'}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      const localToken = localStorage.getItem('moodtracker_fcm_token');
                      const found = mySubscriptions.find((s) => s.token === localToken);
                      if (found) {
                        handleUnsubscribe(found.id, localToken || '');
                      }
                    }}
                    className="flex-1 h-11 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-black text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    🔕 取消本裝置的警報推送訂閱
                  </button>
                )}

                {activeToken && (
                  <button
                    onClick={handleSendTestPush}
                    disabled={isTesting || !fcmServerKey}
                    className="h-11 px-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-black text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    {isTesting ? '發送中...' : '🧪 發送測試推送'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Active Subscriptions List */}
          <div className="space-y-3">
            <h5 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              已啟用情緒預警推送的個人裝置 ({mySubscriptions.length} 個裝置)
            </h5>

            <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
              {mySubscriptions.map((sub, idx) => (
                <div
                  key={sub.id || idx}
                  className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between gap-4 text-xs font-semibold hover:bg-slate-100/50 transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-black text-slate-800 flex items-center gap-1.5">
                        {sub.device || '移動裝置'}
                        {localStorage.getItem('moodtracker_fcm_token') === sub.token && (
                          <span className="text-[9px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.5 rounded">
                            當前裝置
                          </span>
                        )}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5 max-w-[200px] sm:max-w-md truncate">
                        FCM 金鑰: {sub.token}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleUnsubscribe(sub.id, sub.token)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                    title="移除裝置"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {mySubscriptions.length === 0 && (
                <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl">
                  <span className="text-2xl block mb-1">📭</span>
                  <p className="text-xs text-slate-400 font-semibold">您目前沒有啟用任何裝置接收推送通知。</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: IT Key Configurations (Collapsible or Standard) */}
        <div className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-slate-100 pt-5 lg:pt-0 lg:pl-6 space-y-4">
          <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 space-y-2.5 text-xs text-indigo-800">
            <h5 className="font-black flex items-center gap-1">
              <HelpCircle className="w-4 h-4" />
              PWA 推送通知如何運作？
            </h5>
            <p className="font-semibold leading-relaxed text-slate-500">
              1. 學校 IT 管理員在下方保存 API 金鑰憑證。<br />
              2. 教師在手機、平板或電腦登入本平台，點擊左側「啟用並訂閱」按鈕。<br />
              3. 平台會自動在背景取得您裝置的專屬 FCM Token。<br />
              4. 當任何學生寫入異常心情日誌（如連續 3 天低落）時，後台 Dispatcher 核心將直接發信給您手機，鎖屏即時亮起。
            </p>
          </div>

          {selectedClass === 'GCCPS' ? (
            <>
              <form onSubmit={handleSaveKeys} className="space-y-4">
                <h5 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-indigo-500" />
                  🔑 推送通知金鑰設定 (IT 系統管理專用)
                </h5>

                <div className="space-y-3.5 text-xs font-semibold">
                  <div className="space-y-1.5">
                    <label className="text-slate-500 block font-black">FCM VAPID Public Key (Web 推送公鑰)</label>
                    <textarea
                      required
                      placeholder="請在此貼上 Firebase 產生的 Web Push Public Key (長字串)"
                      className="w-full h-16 p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 text-slate-700 font-mono text-[10.5px] leading-relaxed resize-none"
                      value={vapidKey}
                      onChange={(e) => setVapidKey(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-slate-500 block font-black">FCM Server Key (發送專用伺服器金鑰)</label>
                      <button
                        type="button"
                        onClick={() => setShowFcmServerKey(!showServerKey)}
                        className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 cursor-pointer"
                      >
                        {showServerKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        {showServerKey ? '隱藏金鑰' : '顯示金鑰'}
                      </button>
                    </div>
                    <input
                      required
                      type={showServerKey ? 'text' : 'password'}
                      placeholder="請在此貼上 Firebase Cloud Messaging Server Key (或 Legacy Server Key)"
                      className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 text-slate-700 font-mono text-[10.5px]"
                      value={fcmServerKey}
                      onChange={(e) => setFcmServerKey(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSavingKeys}
                    className="w-full h-11 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Save className="w-4 h-4" />
                    {isSavingKeys ? '正在安全上載憑證金鑰...' : '💾 儲存並啟用推送通知 API 設定'}
                  </button>
                </div>
              </form>

              {/* IT Guide Box */}
              <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl text-[10.5px] leading-relaxed text-slate-500 font-semibold space-y-1">
                <p className="font-black text-slate-700 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-indigo-500" />
                  IT 系統管理配置說明:
                </p>
                <p>
                  1. 登入 <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline font-black">Firebase Console</a>，進入您的專案中。<br />
                  2. 進入 <strong>專案設定 &gt; 雲端通訊 (Cloud Messaging)</strong>。<br />
                  3. 滾動到底部 <strong>網頁設定 (Web Configuration) &gt; Web 推送憑證</strong>，點擊產生金鑰，複製 <strong>公開金鑰 (Public Key)</strong> 填入上方第一欄 VAPID Key。<br />
                  4. 於上方雲端通訊 API (Legacy) 點選啟用，複製產生的 <strong>伺服器金鑰 (Server Key)</strong> 填入上方第二欄即可。
                </p>
              </div>
            </>
          ) : (
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-150 space-y-3.5 text-xs font-semibold">
              <h5 className="font-black text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4.5 h-4.5 text-emerald-600 animate-pulse" />
                🛡️ 本地班級通知託管狀態
              </h5>
              <div className="space-y-2.5 text-slate-500 font-medium leading-relaxed">
                <p>
                  本校 <strong>心情加油站 PWA 即時預警推送服務</strong> 已由學校 IT 管理員完成全局安全金鑰託管與配置。
                </p>
                <p>
                  本班級（<strong>{selectedClass}班</strong>）已成功串接校方全局預警安全網絡，您<strong>無須手動輸入或維護</strong>任何 API 金鑰憑證。
                </p>
                <div className="text-[11px] text-indigo-600 font-semibold bg-indigo-50/50 border border-indigo-100 p-3 rounded-lg flex items-start gap-1.5 leading-relaxed">
                  <Info className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                  <p>
                    本機裝置點選左側 <strong>「啟用並訂閱」</strong> 後，您將會<strong>僅接收</strong>來自於 <strong>{selectedClass}班</strong> 學生的異常情緒預警推送。
                    <br />
                    全校性警報則會自動安全分流給學校安全中心管理員。
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
export default PushNotificationPanel;
