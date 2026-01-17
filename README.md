# Neighborhood Library Management System

A full-stack library management application built with **Django (Python)**, **PostgreSQL**, and **Next.js (React)**.

This application allows library staff to manage book inventory, register members, and track borrowings with real-time stock updates.

## 📋 Features
- **Books Management:** Create, read, and update book inventory with stock tracking.
- **Member Management:** Register and update library members.
- **Circulation Desk:** Check-out and return books with automated inventory adjustments.
- **History Tracking:** View active loans and historical return records.
- **Smart Filters:** Filter circulation records by specific books or members.

## 🛠 Tech Stack
- **Backend:** Python 3.9, Django Rest Framework (DRF)
- **Database:** PostgreSQL 15
- **Frontend:** Next.js 13+ (App Router), TypeScript, Tailwind CSS
- **Containerization:** Docker & Docker Compose

---

## 🚀 Quick Start (Recommended)

The easiest way to run the application is using **Docker Compose**. This sets up the database, backend, and frontend automatically in a single command.

### 1. Configure Environment Variables
Create a `.env` file in the root directory and paste the following configuration:

```ini
# --- Django Settings ---
DJANGO_SECRET_KEY=django-insecure-1bxqll%q+#aeb0bj_269_6+58ejse=mp@)dojxvxzzx#e22g-v
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost 127.0.0.1 [::1] 0.0.0.0

# --- Database Settings ---
# Note: In Docker, the HOST is the service name 'db'
POSTGRES_ENGINE=django.db.backends.postgresql
POSTGRES_DB=library_db
POSTGRES_USER=desertbox
POSTGRES_PASSWORD=catching_sunshine
POSTGRES_HOST=db
POSTGRES_PORT=5432

# --- Frontend Settings ---
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1


2. Run the Application
Run the following command in the root directory:
docker-compose up --build


3. Access the App
Once the containers are running:

Frontend (UI): http://localhost:3000
Backend API: http://localhost:8000/api/v1/