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
    
    if (text === "圖片")
        return sendImagemap(event.replyToken);

    if (text === "章魚燒")
        return sendTemplate(event.replyToken);

    if (text === "活動")
        return sendFlex(event.replyToken);

    if (text === "口味")
        return replyFlavorImage(event.replyToken);

    if( text === "營業時間"){
        return client.replyMessage(event.replyToken, {
            type: "text",
            text: "營業時間：每日 16:00 - 23:00（ 週六公休 ）",
        });
    }

    if( text === "地址"){
        return client.replyMessage(event.replyToken, {
            type: "text",
            text: "地址：嘉義縣民雄鄉神農路129-1號",
        });
    }

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
    altText: "章魚燒口味",
    template: {
    type: "image_carousel",
    
    columns: [
        {
        imageUrl: "https://line-bot-lk91.onrender.com/flavor1.jpg",
        action: {
            type: "uri",
            label: "原味",
            uri: "https://line-bot-lk91.onrender.com/flavor1.jpg",
        },
        },
        {
        imageUrl: "https://line-bot-lk91.onrender.com/flavor2.jpg",
        action: {
            type: "uri",
            label: "起司",
            uri: "https://line-bot-lk91.onrender.com/flavor2.jpg",
        },
        },
        {
        imageUrl: "https://line-bot-lk91.onrender.com/flavor3.jpg",
        action: {
            type: "uri",
            label: "海苔",
            uri: "https://line-bot-lk91.onrender.com/flavor3.jpg",
        },
        },
        {
        imageUrl: "https://line-bot-lk91.onrender.com/flavor4.jpg",
        action: {
            type: "uri",
            label: "芥末",
            uri: "https://line-bot-lk91.onrender.com/flavor4.jpg",
        },
        },
        {
        imageUrl: "https://line-bot-lk91.onrender.com/flavor5.jpg",
        action: {
            type: "uri",
            label: "梅子",
            uri: "https://line-bot-lk91.onrender.com/flavor5.jpg",
        },
        },
        {
        imageUrl: "https://line-bot-lk91.onrender.com/flavor6.jpg",
        action: {
            type: "uri",
            label: "泡菜",
            uri: "https://line-bot-lk91.onrender.com/flavor6.jpg",
        },
        },
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
            label: "訂餐",
            text: "訂餐",
        },
        },
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
            label: "轉盤",
            text: "轉盤",
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
            type: "message",
            label: "地址",
            text: "地址",
        },
        },
        {
        type: "action",
        action: {
            type: "uri",
            label: "外送",
            uri: "https://www.foodpanda.com.tw/restaurant/r7b7/mo-jiang-zhang-yu-shao-min-xiong-zhong-zheng-dian",
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
    ],
    },
});
}

async function replyFlavorImage(replyToken) {
    return client.replyMessage(replyToken, {
    type: "image",
    originalContentUrl: "https://line-bot-lk91.onrender.com/flavor.jpg",
    previewImageUrl: "https://line-bot-lk91.onrender.com/flavor.jpg",
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

