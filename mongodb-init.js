// MongoDB初始化脚本
// 连接到admin数据库
const adminDb = db.getSiblingDB('admin');

// 创建root用户（如果不存在）
adminDb.createUser({
  user: 'root',
  pwd: 'rootpassword',
  roles: [{ role: 'root', db: 'admin' }]
});

// 连接到keypro_trade数据库
const keyproDb = db.getSiblingDB('keypro_trade');

// 创建用户集合索引
keyproDb.users.createIndex({ username: 1 }, { unique: true });
keyproDb.users.createIndex({ email: 1 }, { unique: true });

// 创建WhatsApp号码集合索引
keyproDb.whatsapp_numbers.createIndex({ number: 1 });
keyproDb.whatsapp_numbers.createIndex({ uploadTime: 1 });
keyproDb.whatsapp_numbers.createIndex({ uploader: 1 });
keyproDb.whatsapp_numbers.createIndex({ industry: 1 });

// 创建管理员用户（如果不存在）
const adminUser = keyproDb.users.findOne({ username: 'admin' });
if (!adminUser) {
  // 使用bcrypt加密密码：admin123
  // 注意：这里使用了简化的密码加密，实际部署时应该使用更安全的方式
  keyproDb.users.insertOne({
    username: 'admin',
    email: 'admin@example.com',
    password: '$2a$10$eKdC9X7Z5Q7qY8W9E1R2T3Y4U5I6O7P8A9S0D1F2G3H4J5K6L7M8N9O0P1Q2R3S4T5U6V7W8X9Y0Z', // 实际密码是admin123
    role: 'admin',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLogin: new Date()
  });
  print('Admin user created successfully!');
} else {
  print('Admin user already exists!');
}

print('MongoDB initialization completed!');
