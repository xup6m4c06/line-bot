const express = require("express");
const line = require("@line/bot-sdk");

const app = express();

const config = {
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const client = new line.Client(config);

app.use(express.static("public"));

/* ======================
    Webhook（唯一）
====================== */
app.post("/webhook", line.middleware(config), async (req, res) => {
    try {
    for (const event of req.body.events) {
        if (event.type === "message") {
            await handleMessage(event);
        }
    }
    res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

/* ======================
    Message Router
====================== */
async function handleMessage(event) {
    const type = event.message.type;

    switch (type) {
        case "location":
        return handleLocation(event);

        case "text":
        return handleText(event);

        default:
        return client.replyMessage(event.replyToken, {
            type: "text",
            text: "目前不支援此訊息類型",
        });
    }
}

async function handleLocation(event) {
    const { latitude, longitude } = event.message;

    return client.replyMessage(event.replyToken, {
    type: "text",
    text: `收到位置：
緯度 ${latitude}
經度 ${longitude}`,
    });
}

async function handleText(event) {
    const text = event.message.text;

    if (text === "章魚燒")
        return sendTemplate(event.replyToken);

    if (text === "flex")
        return sendFlex(event.replyToken);
    
    if (text === "圖片")
        return sendImagemap(event.replyToken);

    if (text === "選單")
        return replyWithQuickReply(event.replyToken);
}

async function sendImagemap(replyToken) {
    return client.replyMessage(replyToken, {
        type: "imagemap",
        baseUrl: "https://line-bot-lk91.onrender.com/mojiang_takoyaki.jpg",
        altText: "Imagemap 範例",
        baseSize: { width: 1040, height: 1040 },
        actions: [
        {
            type: "message",
            text: "點擊區塊 A",
            area: { x: 0, y: 0, width: 520, height: 520 },
        },
        ],
    });
}

async function sendTemplate(replyToken) {
    return client.replyMessage(replyToken, {
    type: "template",
    altText: "Template 範例",
    template: {
    type: "buttons",
    title: "功能選單",
    text: "請選擇",
    actions: [
        { type: "message", label: "位置", text: "location" },
        { type: "message", label: "圖片", text: "image" },
        ],
    },
    });
}

async function sendFlex(replyToken) {
    return client.replyMessage(replyToken, {
    type: "flex",
    altText: "Flex 範例",
    contents: {
    type: "bubble",
    body: {
        type: "box",
        layout: "vertical",
        contents: [
            { type: "text", text: "Flex Message", weight: "bold" },
        ],
    },
    },
    });
}

async function replyWithQuickReply(replyToken) {
    return client.replyMessage(replyToken, {
    type: "text",
    text: "請選擇功能",
    quickReply: {
    items: [
        {
        type: "action",
        action: {
            type: "message",
            label: "口味",
            text: "口味",
        },
        },
        {
        type: "action",
        action: {
            type: "message",
            label: "菜單",
            text: "菜單",
        },
        },
        {
        type: "action",
        action: {
            type: "message",
            label: "營業時間",
            text: "營業時間",
        },
        },
        {
        type: "action",
        action: {
            type: "location",
            label: "地址",
            text: "地址",
        },
        },
        {
        type: "action",
        action: {
            type: "uri",
            label: "IG",
            uri: "https://www.instagram.com/mojiang_takoyaki/",
        },
        },
        {
        type: "action",
        action: {
            type: "message",
            label: "旋轉盤",
            text: "旋轉盤",
        },
        },
        {
        type: "action",
        action: {
            type: "message",
            label: "訂餐",
            text: "訂餐",
        },
        },
    ],
    },
});
}

// health check
    app.get("/", (req, res) => { 
        res.send("LINE Bot is running"); });
// Render 一定要這樣寫
    const PORT = process.env.PORT || 10000;
    app.listen(PORT, () => {
        console.log("Server running on port ${PORT}");
    });
