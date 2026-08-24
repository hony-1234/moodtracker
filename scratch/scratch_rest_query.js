import https from 'https';

const token = "ya29.a0AT3oNZ9AhG9fIxfpxZ-GUikbBNW8yL1TkwHsOdiPmULN7hbNGClyX2Ole6DrAW3Ui2ahtW8fZuzAogz5WCEoYhyB47EaUiDQo3Bw9TSma8VdmiKf3gKksTk_PiGFPPSfbEr3s984Z5CuhsAPanuEJporBwssIkuLTfxCMgzy6eKd59yubNCNXAoK96g-D_jYviIW4unNwwC6ovAaCgYKATASARESFQHGX2Mi9ksroe4qMZd3FCjCJuIUcA0214";

const fetchURL = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'Authorization': `Bearer ${token}` } }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
};

async function run() {
  const settingsUrl = 'https://firestore.googleapis.com/v1/projects/moodtracker-app-d6b42/databases/(default)/documents/system_settings/push_notifications';
  const settings = await fetchURL(settingsUrl);
  console.log("=== Push Notifications Settings ===");
  console.log(JSON.stringify(settings, null, 2));

  const subsUrl = 'https://firestore.googleapis.com/v1/projects/moodtracker-app-d6b42/databases/(default)/documents/fcm_subscriptions';
  const subs = await fetchURL(subsUrl);
  console.log("\n=== Active Subscriptions ===");
  console.log(JSON.stringify(subs, null, 2));
}

run().catch(console.error);
