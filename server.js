const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const userRoutes = require("./app/routes/userRoutes");
const flowersRoutes = require("./app/routes/flowersRoutes");
const morgan = require("morgan");
const http = require("http");

dotenv.config();

//   =========================================
//   =============  WebSocket  =============
//   =========================================

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  ws.on("message", async (message) => {
    const data = JSON.parse(message);

    // Сохранение клиента по его ID
    if (data.type === "register") {
      clients[data.id] = ws;

      // Получение всех непрочитанных уведомлений (для женщины)
      const notifications = await db
        .collection("orders")
        .find({ recipientId: data.id, status: "pending" })
        .toArray();

      notifications.forEach(order => {
        ws.send(JSON.stringify({
          type: 'orderReceived',
          orderId: order.orderId,
          sessionId: order.sessionId,
        }));
      });
    }

    // Отправка заказа
    if (data.type === 'sendOrder' && clients[data.recipientId]) {
      // Отправка уведомления
      clients[data.recipientId].send(JSON.stringify({
        type: 'orderReceived',
        orderId: data.orderId,
        sessionId: data.sessionId,
      }));
    } else if (data.type === 'sendOrder') {
      // Сохранение заказа в базе данных (если установить соединение с женщиной не удалось)
      await db.collection('orders').insertOne({
        orderId: data.orderId,
        recipientId: data.recipientId,
        sessionId: data.sessionId,
        status: 'pending',
        createdAt: new Date(),
      });
    }
  });

  ws.on("close", () => {
    // Удаление клиента при отключении
    for (const id in clients) {
      if (clients[id] === ws) {
        delete clients[id];
        break;
      }
    }
  });
});


//   =========================================
//   =============  MONGO DB  =============
//   =========================================

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/users", userRoutes);
app.use("/flowers", flowersRoutes);

app.use(express.static("public"));

app.use(morgan("dev"));

app.use((req, res, next) => {
  res.status(404).send("Sorry, we cannot find that");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
