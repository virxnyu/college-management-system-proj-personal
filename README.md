# EduTrack — College Management System (MERN + Firebase)

EduTrack is a full-stack college management system showcasing DBMS concepts using the **MERN stack** (MongoDB, Express, React, Node.js), integrated with **Firebase Authentication** for secure user management and **Cloudinary** for file storage.


## 1️⃣ Project Architecture

The system uses an **MVC architecture** for the backend and **component-based design** on the frontend.

| Layer    | Technology                                 | Responsibilities                                                        |
| -------- | ------------------------------------------ | ----------------------------------------------------------------------- |
| Frontend | React, Axios, React Router, Chart.js       | UI, state management (AuthContext), routing, API communication          |
| Backend  | Node.js, Express, Mongoose, Firebase Admin | Business logic, routing, authentication, authorization                  |
| Database | MongoDB Atlas                              | Persistent storage for users, subjects, attendance, assignments, grades |

---

## 2️⃣ Authentication and Role-Based Access Control (RBAC)

Authentication is a **hybrid model** built using:

* **Firebase Authentication** → verifies identity, generates secure ID Token
* **MongoDB** → maps Firebase UID to user roles (`student`, `teacher`, `admin`)

### Request Flow

1. User logs in using Firebase (React)
2. Axios attaches Firebase ID Token to each API request (`Authorization: Bearer <token>`)
3. Backend verifies token using Firebase Admin SDK
4. Middleware fetches the user profile from MongoDB based on UID
5. Role check determines route access (RBAC)

If any step fails → request is blocked.

This ensures:
✔ Firebase authentication
✔ MongoDB role verification
✔ Secure permission-based API access

---

## 3️⃣ Core DBMS-Driven Functionalities

### A) Attendance System

Data model links:
**Student ↔ Subject ↔ Date ↔ Status**

Key DBMS concepts implemented:

| Feature                | Concept                                       |
| ---------------------- | --------------------------------------------- |
| Bulk attendance update | Atomicity using `bulkWrite()`                 |
| View stats             | Aggregation (`attended`, `total`)             |
| Predictor              | “Classes needed for 75%” computed dynamically |

Formula used:

```
needed = ceil(3 * total - 4 * attended)
```

---

### B) Assignments + Cloud File Storage

Models:

* `Assignment` → Subject + Teacher link
* `Submission` → Student + Assignment + file ref

Upload pipeline:

* File uploaded via Multer → Cloudinary
* URL stored in database (not the file)

Cascading delete when a subject is removed:

* Deletes related attendance, assignments, notes, submissions

→ Maintains **referential integrity**

---

### C) Marks / Grading System

Models:

* `Exam` → metadata, subject, total marks
* `Grade` → student score for an exam (linked to Exam + Student)

Bulk grade entry:

* `Grade.bulkWrite()` with `upsert: true`
  → Insert/update efficiently for entire class

Student view:

* Populates exam name + total marks via `.populate()`

---

### D) Search System (Indexing-based)

Subject searching uses:

```
$or + $regex
```

→ Supports partial queries (example: “DBM” → “DBMS”)

---

## ✔ Tech Concepts Showcased

* MVC Architecture
* Secure Authentication + Authorization
* Aggregation Pipelines
* Bulk Transactions
* Joins (Mongo Lookup Pattern)
* Cloud File Storage
* Data Consistency & Cascading Deletes
* Search Indexing + Regex Matching
