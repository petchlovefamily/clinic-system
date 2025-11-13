# Telehealth Clinic Management System: Design Document

## 1. General Implementation Approach
* **Backend:** Built with **Node.js** and **Express** to provide a stateless REST API. We used **Prisma ORM** for type-safe database interactions with **MariaDB**, ensuring data consistency and ease of migration.
* **Frontend:** Developed using **Next.js (App Router)** for structured routing and **Tailwind CSS** for a responsive, modern "Telehealth" aesthetic.
* **Security:** Implemented a strict **JWT-based authentication** system. Authorization is enforced via custom middleware (`isAuthenticated`, `hasRole`) to protect every API endpoint based on user roles (Admin, Clinician, Reception).

## 2. Data Deletion and Archiving
We implemented a **Soft Delete** strategy to maintain referential integrity and audit trails.
* **Mechanism:** A `deletedAt` timestamp field was added to all core models.
* **Logic:** Delete operations update this field instead of removing the record. All retrieval queries automatically filter out records where `deletedAt` is not null. This prevents broken foreign keys in historical appointment data.

## 3. Appointment Conflict Prevention
Conflict detection is enforced strictly on the **Backend** to prevent race conditions.
* **Logic:** Before creating an appointment, the API runs a Prisma `findFirst` query to check if the target clinician already has an active appointment that overlaps with the requested `startTime` and `endTime`.
* **Result:** If an overlap is found, the server rejects the request with a `409 Conflict` error, ensuring schedule integrity.

## 4. Record Number Generation
Sequential record numbers (e.g., PAT-001) are generated using the database's **AUTO_INCREMENT** primary key to ensure uniqueness without race conditions.
* **Process:** The system first inserts the record to get the unique `id`. It then formats this `id` (padding with zeros) into the `recordNumber` string and performs an immediate update to save it.

## 5. Frontend Conflict Detection
While the backend provides the hard guarantee, the Frontend improves UX by preventing invalid selections.
* **Implementation:** The frontend fetches existing appointments for the selected clinician and visually disables/blocks the occupied time slots in the UI forms, reducing the chance of a `409` error.

## 6. Authorization Enforcement
Authorization is layered:
* **Layer 1 (UI):** The frontend hides buttons (e.g., "Add Patient") based on the user's role stored in the `AuthContext`.
* **Layer 2 (API):** This is the critical layer. Middleware checks the JWT role claim on every request. For example, `PUT /api/appointments/:id` dynamically checks if the user is a `CLINICIAN` (can only update status) or `RECEPTION` (can only update schedule).

## 7. Validation Strategy
* **Frontend:** Uses HTML5 validation and React state to ensure required fields are filled and dates are valid before submission (Immediate Feedback).
* **Backend:** Performs logical validation (e.g., start time < end time, user existence checks) and data type enforcement via Prisma schema to protect the database integrity.

## 8. Trade-offs and Shortcuts
* **Role Selection:** Users can self-select roles during registration for ease of testing. In a real production system, an Admin would manually assign roles.
* **Input Sanitization:** We relied on Prisma's built-in protection against SQL injection but did not implement extensive input sanitization libraries (like Zod) due to time constraints.
* **Future Improvements:** With more time, we would add **WebSockets** for real-time schedule updates and a dedicated **Audit Log** table to track every change for HIPAA compliance.
