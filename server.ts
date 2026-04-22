import express from "express";
import { createServer as createViteServer } from "vite";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import path from "path";
import crypto from "crypto";
import { Server } from "socket.io";
import http from "http";
import fs from "fs";

const JWT_SECRET = "super_secure_secret_key_12345";
const TEMP_SECRET = "temp_2fa_secret_key_12345";
const DB_FILE = path.join(process.cwd(), "database.json");

// --- Database Simulation ---
let users: any[] = [];
let accounts: any[] = [];
let transactions: any[] = [];
let notifications: any[] = [];

let nextUserId = 1;
let nextAccountId = 1;
let nextTxId = 1;
let nextNotifId = 1;

function saveDb() {
  const data = { users, accounts, transactions, notifications, nextUserId, nextAccountId, nextTxId, nextNotifId };
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
}

function loadDb() {
  if (fs.existsSync(DB_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
      users = data.users || [];
      accounts = data.accounts || [];
      transactions = data.transactions || [];
      notifications = data.notifications || [];
      nextUserId = data.nextUserId || 1;
      nextAccountId = data.nextAccountId || 1;
      nextTxId = data.nextTxId || 1;
      nextNotifId = data.nextNotifId || 1;
      return true;
    } catch (e) {
      console.error("Failed to load db file:", e);
      return false;
    }
  }
  return false;
}

// Seed Initial Data
const setupDb = async () => {
    if (loadDb()) return;

    const adminPass = await bcrypt.hash("admin123", 10);
    users.push({ id: nextUserId++, name: "Admin", email: "admin@securebank.com", password: adminPass, role: "ADMIN" });
    
    const userPass = await bcrypt.hash("password", 10);
    const userId = nextUserId++;
    users.push({ id: userId, name: "John Doe", email: "john@example.com", password: userPass, role: "USER" });
    
    const accNum = "SB" + Math.floor(1000000000 + Math.random() * 9000000000);
    accounts.push({ id: nextAccountId++, userId, accountNumber: accNum, balance: 150000, isFrozen: false });
    
    saveDb();
}
setupDb();

const rateLimitMap = new Map<string, { count: number, resetTime: number }>();
const passwordResetTokens = new Map<string, { userId: number, expiresAt: number }>();

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  // Setup HTTP server combining Express and Socket.IO
  const server = http.createServer(app);
  const io = new Server(server, { cors: { origin: "*" } });

  app.use(express.json());

  // --- WebSocket Setup ---
  const userSockets = new Map<number, string>(); // userId -> socketId
  
  io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error("Authentication error"));
      jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
          if (err) return next(new Error("Authentication error"));
          socket.data.userId = decoded.id;
          next();
      });
  });

  io.on("connection", (socket) => {
      userSockets.set(socket.data.userId, socket.id);
      
      socket.on("disconnect", () => {
          userSockets.delete(socket.data.userId);
      });
  });

  const pushNotification = (userId: number, title: string, message: string, type: string) => {
      const notif = { id: nextNotifId++, userId, title, message, type, date: new Date().toISOString(), read: false };
      notifications.push(notif);
      
      const socketId = userSockets.get(userId);
      if (socketId) {
          io.to(socketId).emit("notification", notif);
      }
      saveDb();
  };

  const rateLimiter = (req: any, res: any, next: any) => {
    const ip = req.ip || "unknown";
    const now = Date.now();
    const windowMs = 60000;
    const maxRequests = 100;

    if (!rateLimitMap.has(ip)) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    const clientData = rateLimitMap.get(ip)!;
    if (now > clientData.resetTime) {
      clientData.count = 1;
      clientData.resetTime = now + windowMs;
      return next();
    }

    clientData.count++;
    if (clientData.count > maxRequests) {
      return res.status(429).json({ error: "Too many requests. Please try again later." });
    }
    next();
  };
  
  // Rate limiter removed for dev environment to avoid blocking Vite static assets
  // app.use(rateLimiter);

  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Token missing" });

    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
      if (err) return res.status(403).json({ error: "Invalid or expired token" });
      
      const dbUser = users.find(u => u.id === decoded.id);
      if (!dbUser) return res.status(401).json({ error: "Session expired or user deleted. Please log in again." });
      
      req.user = dbUser;
      next();
    });
  };

  app.post("/api/auth/forgot-password", (req, res) => {
    const { email } = req.body;
    const user = users.find(u => u.email === email);
    if (!user) {
      // Return 200 anyway to prevent user enumeration
      return res.status(200).json({ message: "If that email is registered, a reset link has been sent." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 mins
    passwordResetTokens.set(token, { userId: user.id, expiresAt });

    // In a real app, send email here. For simulation, we return the token in the response or console.
    console.log(`[Email Service] Password reset requested for ${email}. Link: /reset-password/${token}`);
    
    return res.status(200).json({ message: "If that email is registered, a reset link has been sent.", mockToken: token });
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ error: "Token and new password are required" });
    }

    const resetInfo = passwordResetTokens.get(token);
    if (!resetInfo) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    if (Date.now() > resetInfo.expiresAt) {
      passwordResetTokens.delete(token);
      return res.status(400).json({ error: "Token has expired" });
    }

    const userIndex = users.findIndex(u => u.id === resetInfo.userId);
    if (userIndex === -1) {
      return res.status(400).json({ error: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    users[userIndex].password = hashedPassword;
    saveDb();
    
    // Invalidate the token
    passwordResetTokens.delete(token);

    return res.status(200).json({ message: "Password has been successfully reset" });
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { name, email, password } = req.body;
      if (users.find(u => u.email === email)) {
        return res.status(400).json({ error: "Email already registered" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = nextUserId++;
      users.push({ id: userId, name, email, password: hashedPassword, role: "USER" });

      const accNum = "SB" + Math.floor(1000000000 + Math.random() * 9000000000);
      accounts.push({ id: nextAccountId++, userId, accountNumber: accNum, balance: 10000, isFrozen: false });
      
      saveDb();
      pushNotification(userId, "Welcome!", "Your PaySecure India account has been created successfully.", "success");

      res.status(201).json({ message: "Registration successful!" });
    } catch (e) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    // FAST LOGIN: directly issue token & skip 2FA 
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
    pushNotification(user.id, "Login Detected", "New login from a recognized device.", "info");

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  });

  app.post("/api/auth/verify-otp", async (req, res) => {
    const { tempToken, otp } = req.body;
    if (otp !== "123456") return res.status(400).json({ error: "Invalid OTP" });

    try {
        const decoded: any = jwt.verify(tempToken, TEMP_SECRET);
        const user = users.find(u => u.id === decoded.id);
        if (!user) return res.status(404).json({ error: "User not found" });

        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
        
        pushNotification(user.id, "Login Detected", "New login from a recognized device.", "info");

        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch(err) {
        return res.status(401).json({ error: "OTP session expired. Process login again." });
    }
  });

  app.get("/api/account/details", authenticateToken, (req: any, res) => {
    const account = accounts.find(a => a.userId === req.user.id);
    if (!account) return res.status(404).json({ error: "Account not found" });
    res.json(account);
  });

  app.get("/api/account/analytics", authenticateToken, (req: any, res) => {
    const account = accounts.find(a => a.userId === req.user.id);
    if (!account) return res.status(404).json({ error: "Account not found" });

    const userTxs = transactions.filter(t => t.fromAccount === account.accountNumber || t.toAccount === account.accountNumber);
    
    let income = 0;
    let expense = 0;
    const categories: Record<string, number> = {};

    userTxs.forEach(tx => {
        if (tx.toAccount === account.accountNumber && tx.status === 'SUCCESS') {
            income += tx.amount;
        } else if (tx.fromAccount === account.accountNumber && tx.status === 'SUCCESS') {
            expense += tx.amount;
            categories[tx.category] = (categories[tx.category] || 0) + tx.amount;
        }
    });

    res.json({ income, expense, categories });
  });

  app.post("/api/account/transfer", authenticateToken, (req: any, res) => {
    const { toAccountStr, amount, method, category = "Transfer" } = req.body;
    const fromAccount = accounts.find(a => a.userId === req.user.id);
    let toAccount;
    
    if (method === 'UPI') {
        if (!toAccountStr.includes('@')) return res.status(400).json({ error: "Invalid UPI ID" });
        toAccount = accounts.find(a => a.accountNumber === toAccountStr); 
        if (!toAccount) {
            toAccount = { id: nextAccountId++, userId: 999, accountNumber: toAccountStr, balance: 0, isFrozen: false };
            accounts.push(toAccount);
        }
    } else {
        toAccount = accounts.find(a => a.accountNumber === toAccountStr);
        if (!toAccount) {
             toAccount = { id: nextAccountId++, userId: 999, accountNumber: toAccountStr, balance: 0, isFrozen: false };
             accounts.push(toAccount);
        }
    }

    if (!fromAccount) return res.status(404).json({ error: "Your account not found" });
    if (fromAccount.isFrozen) return res.status(403).json({ error: "Your account is frozen due to security reasons." });
    if (fromAccount.balance < amount) return res.status(400).json({ error: "Insufficient balance" });
    if (amount <= 0) return res.status(400).json({ error: "Invalid amount" });

    // --- Smart Fraud Detection (Advanced Logic) ---
    let isSuspicious = false;
    let fraudReason = "";

    // 1. High value transfer
    if (amount > 50000) {
        isSuspicious = true;
        fraudReason = "High value transaction crossed limit";
    }

    // 2. High velocity (Multiple txns in 1 minute)
    const recentTx = transactions.filter(t => 
        t.fromAccount === fromAccount.accountNumber && 
        new Date().getTime() - new Date(t.date).getTime() < 60000
    );
    if (recentTx.length >= 3 && !isSuspicious) {
        isSuspicious = true;
        fraudReason = "Unusual transaction velocity (3+ in 1 min)";
    }

    // 3. Nighttime anomaly (11 PM - 5 AM UTC for demo)
    const currentHour = new Date().getUTCHours();
    if ((currentHour >= 23 || currentHour < 5) && !isSuspicious) {
        isSuspicious = true;
        fraudReason = "Suspicious nighttime activity triggered threshold";
    }

    fromAccount.balance -= amount;
    toAccount.balance += amount;

    const tx = {
      id: nextTxId++,
      fromAccount: fromAccount.accountNumber,
      toAccount: toAccount.accountNumber,
      amount,
      method: method || 'ACCOUNT',
      category,
      date: new Date().toISOString(),
      status: isSuspicious ? "FLAGGED" : "SUCCESS",
      type: "TRANSFER",
      isSuspicious,
      fraudReason
    };
    transactions.push(tx);
    saveDb();

    // Emit Real-Time WebSockets Notifications
    if (isSuspicious) {
        // Explictly warn the sender via Socket.IO
        pushNotification(req.user.id, "Security Alert Tripped", `Transaction flagged: ${fraudReason}.`, "danger");
        
        // Notify all ADMIN sockets in real-time
        const adminUsers = users.filter(u => u.role === 'ADMIN');
        adminUsers.forEach(admin => {
             pushNotification(admin.id, "Admin: Fraud Alert", `User ${fromAccount.userId} flagged for ${amount} INR. Reason: ${fraudReason}`, "danger");
        });
    }

    pushNotification(req.user.id, isSuspicious ? "Transfer Flagged" : "Transfer Successful", `Sent ₹${amount} to ${method === 'UPI' ? toAccountStr : toAccount.accountNumber}`, isSuspicious ? "warning" : "success");
    
    if (!isSuspicious) { // Only notify receiver if money is actually moving
        pushNotification(toAccount.userId, "Funds Received", `Successfully received ₹${amount} to your account.`, "success");
    }

    res.json({ message: "Transfer processed", transaction: tx });
  });

  app.get("/api/account/transactions", authenticateToken, (req: any, res) => {
    const account = accounts.find(a => a.userId === req.user.id);
    if (!account) return res.status(404).json({ error: "Account not found" });

    const userTxs = transactions.filter(t => t.fromAccount === account.accountNumber || t.toAccount === account.accountNumber);
    const processed = userTxs.map(t => ({
        ...t,
        type: t.fromAccount === account.accountNumber ? 'DEBIT' : 'CREDIT'
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    res.json(processed);
  });

  app.get("/api/notifications", authenticateToken, (req: any, res) => {
    const userNotifs = notifications
        .filter(n => n.userId === req.user.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    res.json(userNotifs);
  });

  app.post("/api/notifications/read", authenticateToken, (req: any, res) => {
      notifications.filter(n => n.userId === req.user.id).forEach(n => n.read = true);
      saveDb();
      res.json({ success: true });
  });

  const adminGuard = (req: any, res: any, next: any) => {
      if (req.user.role !== "ADMIN") return res.status(403).json({ error: "Admin strictly only" });
      next();
  }

  app.get("/api/admin/users", authenticateToken, adminGuard, (req: any, res) => {
    const enrichedUsers = users.map(u => {
        const acc = accounts.find(a => a.userId === u.id);
        return {
            id: u.id, name: u.name, email: u.email, role: u.role,
            accountNumber: acc?.accountNumber,
            balance: acc?.balance,
            isFrozen: acc?.isFrozen
        };
    });
    res.json(enrichedUsers);
  });

  app.get("/api/admin/transactions", authenticateToken, adminGuard, (req: any, res) => {
     res.json(transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  });

  app.post("/api/admin/freeze/:userId", authenticateToken, adminGuard, (req: any, res) => {
      const acc = accounts.find(a => a.userId === parseInt(req.params.userId));
      if (!acc) return res.status(404).json({ error: "Account not found" });
      
      acc.isFrozen = !acc.isFrozen;
      saveDb();
      
      pushNotification(parseInt(req.params.userId), "Security Alert", `Your account has been ${acc.isFrozen ? 'FROZEN' : 'UNFROZEN'} by an administrator.`, "warning");

      res.json({ message: `Account ${acc.isFrozen ? 'Frozen' : 'Unfrozen'} successfully`, isFrozen: acc.isFrozen });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist', 'index.html'));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
