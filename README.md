# 🐐 Goatslite Website

This is the source code for the **Goatslite** website — a retro-inspired project hosted on a Raspberry Pi. The site is built with a containerized setup for easy deployment and management.

---

## What is Goatslite?
- Retro 90s-inspired web design  
- Dockerized frontend for portability  
- Easy to run locally or deploy to a server (e.g., Raspberry Pi, Unraid, or cloud VPS)  

---

## 📂 Project Structure
```
.
├── api/
│   ├── Dockerfile
│   └── index.js
│
├── public/
│   ├── goatslite.ico
│   ├── goatslite.svg
│   └── vite.svg
│
├── src/
│   ├── App.css
│   ├── App.jsx
│   ├── main.jsx
│   ├── assets/
│   │   ├── b1.webp
│   │   ├── b2.webp
│   │   ├── b3.webp
│   │   ├── b4.webp
│   │   ├── g1.webp
│   │   ├── g2.webp
│   │   ├── g3.webp
│   │   ├── g4.webp
│   │   ├── goat-lick.gif
│   │   ├── goatslite_goat_lineart_v2.png
│   │   ├── icons/
│   │   │   ├── Book.ico
│   │   │   ├── Booksfolder.ico
│   │   │   ├── Info.ico
│   │   │   └── sound.ico
│   │   └── sounds/
│   │       ├── goat-amazing-sound-effects-12537.mp3
│   │       ├── Goat-baa-sound-effect.mp3
│   │       ├── goat-sound-effect-259473.mp3
│   │       └── screaming-goat.mp3
│   └── components/
│       ├── ContextMenu.css
│       ├── ContextMenu.jsx
│       ├── Desktop.css
│       ├── Desktop.jsx
│       ├── DesktopIcon.css
│       ├── DesktopIcon.jsx
│       ├── GoatGalleryApp.css
│       ├── GoatGalleryApp.jsx
│       ├── GoatJukeboxApp.css
│       ├── GoatJukeboxApp.jsx
│       ├── GuestbookApp.css
│       ├── GuestbookApp.jsx
│       ├── StartMenu.css
│       ├── StartMenu.jsx
│       ├── Taskbar.css
│       ├── Taskbar.jsx
│       ├── Window.css
│       └── Window.jsx
│
├── docker-compose.yml
├── index.php
├── package.json
├── package-lock.json
├── README.md
├── tree.txt
└── vite.config.js

```

---

## 🐳 Running with Docker

To make my life easier, I run everything in Docker. Both the server, and development machine have **Docker** and **Docker Compose** installed.

1. **Clone this repo**:
   ```bash
   git clone https://github.com/drewjordan414/goatslite.git
   cd goatslite
   ```

2. **Start the container**:
   ```bash
   docker-compose up -d --build
   ```

3. **Access the site**:  
   Open your browser and go to:  
   👉 [http://localhost:5174](http://localhost:5174)
   🐐[https://goatslite.com](https://goatslite.com)

---

## 🔧 Updating

- Rebuild the container after major changes:
  ```bash
  docker-compose up -d --build
  ```

---

## 🌍 Hosting Publicly

- I host this project publicly by running it behind:
  - **Nginx Proxy Manager** for SSL + domains
  - **Cloudflare Tunnel** for secure remote access
- My domain points to the server and proxies traffic into the container running on port `5174`.

---

## 📝 License
MIT License.  
Feel free to use, modify, and share.

---

## 👤 Author
**Drew Jordan**  
- 🌐 [drewjordan.dev](https://drewjordan.dev)  
- 📧 drew@drewjordan.dev

