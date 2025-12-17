const express = require("express");
const line = require("@line/bot-sdk");

const app = express();

// LINE 設定（從 Render 環境變數讀）
const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const client = new line.Client(config);

// webhook（一定要）
app.post("/webhook", line.middleware(config), async (req, res) => {
  // ❶ 第一時間回 200（LINE 最在乎這個）
  res.sendStatus(200);

  try {
    const events = req.body.events;
    if (!events || events.length === 0) return;

    for (const event of events) {
      if (
        event.type === "message" &&
        event.message.type === "location"
      ) {
        await client.replyMessage(event.replyToken, {
          type: "text",
          text: `收到你的位置：
經度 ${event.message.longitude}
緯度 ${event.message.latitude}`,
        });
      }
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
  }
});


// health check（建議）
app.get("/", (req, res) => {
  res.send("LINE Bot is running");
});

// ⚠️ Render 一定要這樣寫
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

