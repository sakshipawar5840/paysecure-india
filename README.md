# 💳 PaySecure India – Smart Digital Banking System

A full-stack **secure banking application** built using modern technologies.  
This project simulates real-world digital banking features like secure login, transactions, fraud detection, and analytics.

---

## 🚀 🔥 Features

- 🔐 JWT Authentication & 2FA Security  
- 💰 Secure Money Transfer System  
- 📊 Analytics Dashboard  
- 🚨 Fraud Detection System  
- 🔔 Real-time Notifications  
- 🧾 Transaction History  
- 🧑‍💻 User & Account Management (CRUD)  
- 🎨 Premium Fintech UI (React + Tailwind)  

---

## 🛠️ Tech Stack

### 💻 Frontend:
- React.js  
- Tailwind CSS  
- Framer Motion  

### ⚙️ Backend:
- Java  
- Spring Boot  
- Spring Security (JWT Auth)  

### 🗄️ Database:
- MySQL  

---

### 👤 Normal User (Dashboard, UPI Transfer test karne ke liye)
- Email: john@example.com  
- Password: password  

---

### 👑 Admin User (Admin panel test karne ke liye)
- Email: admin@securebank.com  
- Password: admin123  

---

## 📁 Project Structure

### Backend:
- controller/
- service/
- repository/
- entity/
- dto/
- security/
- exception/

### Frontend:
- components/
- pages/
- services/
- hooks/

---

## 🔐 Security Features

- JWT-based Authentication  
- Password Encryption (BCrypt)  
- Role-based Access Control  
- Secure API endpoints  

---

## 🧪 API Testing

Use Postman to test APIs:

- POST `/api/auth/register`  
- POST `/api/auth/login`  
- GET `/api/accounts`  
- POST `/api/transactions`  

---

## 🎨 UI Highlights

- Modern fintech design  
- Glassmorphism effects  
- Smooth animations  
- Responsive layout  

---

## ⚙️ Installation & Setup

### Backend:
```bash
git clone <your-repo-link>
cd backend
mvn spring-boot:run