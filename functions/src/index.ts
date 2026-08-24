import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

export const sendPushNotification = onRequest({ cors: true }, async (req, res) => {
  // Only allow POST requests
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  try {
    // 1. Authenticate Request using the configured fcm_server_key in Firestore as a shared secret
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).send("Unauthorized: Missing Authorization Header");
      return;
    }

    // Extract bearer token or key
    let passedKey = "";
    if (authHeader.startsWith("Bearer ")) {
      passedKey = authHeader.substring(7).trim();
    } else if (authHeader.startsWith("key=")) {
      passedKey = authHeader.substring(4).trim();
    } else {
      passedKey = authHeader.trim();
    }

    if (!passedKey) {
      res.status(401).send("Unauthorized: Empty Authorization Token");
      return;
    }

    // Read the master fcm_server_key from system_settings
    const pushSettingsSnap = await db.collection("system_settings").doc("push_notifications").get();
    if (!pushSettingsSnap.exists) {
      res.status(500).send("Internal Server Error: Push notification settings not found");
      return;
    }

    const pushData = pushSettingsSnap.data();
    const actualServerKey = pushData?.fcm_server_key || "";

    if (!actualServerKey || passedKey !== actualServerKey.trim()) {
      res.status(401).send("Unauthorized: Invalid Authorization Token");
      return;
    }

    // 2. Parse request payload
    const { registration_ids, notification } = req.body;

    if (!registration_ids || !Array.isArray(registration_ids) || registration_ids.length === 0) {
      res.status(400).send("Bad Request: Missing or empty registration_ids array");
      return;
    }

    if (!notification) {
      res.status(400).send("Bad Request: Missing notification payload");
      return;
    }

    // 3. Construct the Multicast Message in FCM HTTP v1 standard format
    const message: admin.messaging.MulticastMessage = {
      tokens: registration_ids,
      notification: {
        title: notification.title || "🏫 心情加油站",
        body: notification.body || ""
      },
      webpush: {
        notification: {
          icon: notification.icon || "/icon.svg",
          badge: "/icon.svg",
          clickAction: notification.click_action || req.headers.origin || "/"
        }
      }
    };

    // 4. Send multicast push alerts via FCM v1 API
    console.log(`FCM HTTP v1: Dispatching multicast alert to ${registration_ids.length} tokens...`);
    const batchResponse = await admin.messaging().sendEachForMulticast(message);
    console.log(`FCM HTTP v1: Successfully sent: ${batchResponse.successCount}, Failed: ${batchResponse.failureCount}`);

    // 5. Structure the response to match the exact schema of the legacy FCM response so frontend requires zero rewrite!
    const legacyResponse = {
      success: batchResponse.successCount,
      failure: batchResponse.failureCount,
      results: batchResponse.responses.map((resp) => {
        if (resp.success) {
          return { message_id: resp.messageId };
        } else {
          return { error: resp.error ? resp.error.code || resp.error.message : "unknown_error" };
        }
      })
    };

    res.status(200).json(legacyResponse);

  } catch (err: any) {
    console.error("FCM v1 Multicast error:", err);
    res.status(500).send("Internal Server Error: " + (err.message || String(err)));
  }
});
