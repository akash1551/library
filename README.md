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
- **Backend:** Python 3.11, Django Rest Framework (DRF)
- **Database:** PostgreSQL 15
- **Frontend:** Next.js 13+ (App Router), TypeScript, Tailwind CSS
- **Containerization:** Docker & Docker Compose

---

## ⚡ One-Click Setup

I have included a helper script to automate the setup process. If you have Docker installed, simply run:

```bash
chmod +x setup.sh
./setup.sh