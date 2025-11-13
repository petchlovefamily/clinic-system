# Telehealth Clinic Management System

This repository contains a full-stack implementation of a Clinic Management System, developed as a Senior Fullstack Developer assessment. The application handles patient records, appointment scheduling, and enforces strict Role-Based Access Control (RBAC) for different user types.

## Project Overview

The system is designed to ensure data integrity and security in a medical context. Key architectural decisions include:
* **Conflict Prevention:** Server-side logic prevents overlapping appointments for the same clinician.
* **Data Preservation:** Implementation of "Soft Delete" strategies to maintain audit trails and referential integrity.
* **Role-Based UI:** The frontend interface dynamically adapts based on the user's permissions (Admin, Clinician, Reception).

## Technology Stack

### Backend
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MariaDB (hosted via Docker)
* **ORM:** Prisma (for schema definition, migrations, and type-safe queries)
* **Authentication:** JWT (JSON Web Tokens) and bcryptjs

### Frontend
* **Framework:** Next.js (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS (Custom Health-Tech theme)
* **State Management:** React Context API

## Features

### 1. Authentication & Authorization
* User Registration and Login.
* Middleware-based RBAC (Role-Based Access Control) protecting all API endpoints.
* Roles defined:
    * **Reception:** Full patient management, appointment scheduling (create/update time).
    * **Clinician:** View assigned appointments, update status (Pending/Completed), add clinical notes.
    * **Admin:** Full system access.

### 2. Patient Management
* Create, Read, Update, and Archive (Soft Delete) patient records.
* Restricted access: Only Reception and Admin roles can modify patient data.

### 3. Appointment System
* Scheduling system with conflict detection logic.
* Role-specific editing:
    * Reception can modify schedule details (Time, Admin Notes).
    * Clinicians can modify clinical details (Status, Clinical Notes).
* Visual status indicators for appointments.

## Installation and Setup Guide

Follow these steps to run the project locally.

### Prerequisites
* Node.js (v18 or higher)
* Docker Desktop (required for the database)

### Step 1: Database Setup
1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Start the MariaDB container:
    ```bash
    docker-compose up -d
    ```
3.  Ensure the container is running (default port: 3306).

### Step 2: Backend Setup
1.  Inside the `backend` directory, install dependencies:
    ```bash
    npm install
    ```
2.  Generate Prisma Client:
    ```bash
    npx prisma generate
    ```
3.  Run Database Migrations (This creates tables and resets data):
    ```bash
    npx prisma migrate reset
    ```
    (Confirm with `y` if prompted).
4.  Start the Server:
    ```bash
    npm run dev
    ```
    The backend will run on `http://localhost:5000`.

### Step 3: Frontend Setup
1.  Open a new terminal and navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the Next.js application:
    ```bash
    npm run dev
    ```
    The frontend will run on `http://localhost:3000`.

## Usage & Testing

To test the Role-Based Access Control, you can register distinct users via the `/register` page or Postman.

### Recommended Test Users

1.  **Receptionist Flow:**
    * Register a user with role: **RECEPTION**
    * Capabilities: Create patients, Book appointments, Edit appointment times.
    * Restriction: Cannot change appointment status to "Completed".

2.  **Clinician Flow:**
    * Register a user with role: **CLINICIAN**
    * Capabilities: View own appointments, Mark appointments as "Completed", Add clinical notes.
    * Restriction: Cannot create new patients or appointments.

## Architecture Notes

* **Soft Deletion:** Deleted records are not removed from the database. Instead, a `deletedAt` timestamp is set. The API automatically filters out these records for general views.
* **Timezones:** The system stores times in UTC/Database time but converts them to the user's local time for display and editing on the frontend.

---
