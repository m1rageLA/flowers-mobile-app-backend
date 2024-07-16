const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  uniqueId: { type: Number, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Функция для генерации уникального 4-цифрового ID
const generateUniqueId = async () => {
  const id = Math.floor(1000 + Math.random() * 9000);
  const existingUser = await User.findOne({ uniqueId: id });
  return existingUser ? generateUniqueId() : id;
};

// Перед сохранением пользователя генерируем уникальный ID
userSchema.pre("save", async function (next) {
  if (!this.uniqueId) {
    this.uniqueId = await generateUniqueId();
  }
  next();
});

// Экспортируем модель
const User = mongoose.model("User", userSchema);
module.exports = User;
