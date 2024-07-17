const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const userRoutes = require("./app/routes/userRoutes");
const flowersRoutes = require("./app/routes/flowersRoutes");
const morgan = require("morgan");
const http = require("http");
const WebSocket = require('ws'); // Импорт модуля WebSocket
const Order = require("./app/models/order");

dotenv.config();

//   =========================================
//   ==============  WebSocket  ==============
//   =========================================

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const clients = {};

// Подключение к WebSocket серверу
wss.on("connection", (ws) => {
  console.log('New client connected');

  ws.on("message", async (message) => {
    const data = JSON.parse(message);

    // Сохранение клиента по его ID
    if (data.type === "register") {
      clients[data.id] = ws;

      // Получение всех непрочитанных уведомлений
      const notifications = await Order.find({
        recipientId: data.id,
        status: "pending"
      });

      notifications.forEach(order => {
        ws.send(JSON.stringify({
          type: 'orderReceived',
          orderId: order.orderId,
          sessionId: order.sessionId,
        }));
      });
    }

    // Отправка заказа
    if (data.type === 'sendOrder') {
      if (clients[data.recipientId]) {
        // Отправка уведомления
        clients[data.recipientId].send(JSON.stringify({
          type: 'orderReceived',
          orderId: data.orderId,
          sessionId: data.sessionId,
        }));
      } else {
        // Сохранение заказа в базе данных
        const newOrder = new Order({
          orderId: data.orderId,
          recipientId: data.recipientId,
          sessionId: data.sessionId,
          status: 'pending',
          createdAt: new Date(),
        });
        await newOrder.save();
      }
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
    console.log('Client disconnected');
  });
});

//   =========================================
//   ==============  MONGO DB  ==============
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

// Запуск HTTP сервера
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
