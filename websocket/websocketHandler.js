const Order = require("../app/models/order");
const Message = require("../app/models/message");

const clients = {};

// Подключение к WebSocket серверу
module.exports = (wss) => {
  wss.on("connection", (ws) => {
    console.log("New client connected");

    ws.on("message", async (message) => {
      const data = JSON.parse(message);

      // Сохранение клиента по его ID
      if (data.type === "register") {
        clients[data.id] = ws;

        // Отправка всех непрочитанных уведомлений клиенту
        const notifications = await Order.find({
          recipientId: data.id,
          status: "pending",
        });

        notifications.forEach((order) => {
          ws.send(
            JSON.stringify({
              type: "orderReceived",
              orderId: order.orderId,
              recipientId: order.recipientId,
              sessionId: order.sessionId,
              flower: order.flower,
              quantity: order.quantity,
              amount: order.amount,
              currency: order.currency,
              status: "delivered",
              createdAt: new Date(),
            })
          );
        });

        // Обновление статуса заказов на "доставлено"
        await Promise.all(
          notifications.map(async (order) => {
            order.status = "delivered";
            await order.save();
          })
        );
      }

      // Отправка заказа
      if (data.type === "sendOrder") {
        if (clients[data.recipientId]) {
          // Отправка уведомления
          clients[data.recipientId].send(
            JSON.stringify({
              type: data.type,
              orderId: data.orderId,
              recipientId: data.recipientId,
              sessionId: data.sessionId,
              flower: data.flower,
              quantity: data.quantity,
              amount: data.amount,
              currency: data.currency,
              status: "delivered",
              createdAt: new Date(),
            })
          );
          // Сохранение заказа в базе данных (отпрваленный в realtime)
          const newOrder = new Order({
            type: data.type,
            orderId: data.orderId,
            recipientId: data.recipientId,
            sessionId: data.sessionId,
            flower: data.flower,
            quantity: data.quantity,
            amount: data.amount,
            currency: data.currency,
            status: "delivered",
            createdAt: new Date(),
          });
          await newOrder.save();
        } else {
          // Сохранение заказа в базе данных (получатель офлайн)
          const newOrder = new Order({
            type: data.type,
            orderId: data.orderId,
            recipientId: data.recipientId,
            sessionId: data.sessionId,
            flower: data.flower,
            quantity: data.quantity,
            amount: data.amount,
            currency: data.currency,
            status: "pending",
            createdAt: new Date(),
          });
          await newOrder.save();
        }
      }

      if (data.type === "sendMessage") {
        if (clients[data.recipientId]) {
          clients[data.recipientId].send(
            JSON.stringify({
              type: data.type,
              message: data.message,
              senderId: data.senderId,
              recipientId: data.recipientId,
              status: "delivered",
              createdAt: new Date(),
            })
          );
          const message = new Message({
            type: data.type,
            message: data.message,
            senderId: data.senderId,
            recipientId: data.recipientId,
            status: "delivered",
            createdAt: new Date(),
          });
          await message.save();
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
      console.log("Client disconnected");
    });
  });
};
