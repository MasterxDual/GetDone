# GetDone – Plataforma Web para Gestión de Tareas

<div align="center">
  <img src="./frontend/assets/images/GetDone.png" alt="Logo" width="200" style="border-radius: 15px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"/>

  <p align="center">
    <em>¡Crea Grupos colaborativos y administra Tareas!</em>
  </p>

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Sequelize](https://img.shields.io/badge/Sequelize-52B0E7?style=for-the-badge&logo=sequelize&logoColor=white)](https://sequelize.org/)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/docs/Web/JavaScript)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)](https://getbootstrap.com/)

</div>

---

## 📌 Descripción del Proyecto

**GetDone** es una Aplicación web para la gestión colaborativa de tareas y grupos, con frontend y backend desacoplados, que facilita la organización, asignación y seguimiento de actividades en equipo.

---

## 📁 Estructura del Proyecto

```
GetDone/
├── frontend/               # Cliente web (HTML, CSS, JS)
│   ├── assets/             # Imágenes y fuentes
│   ├── css/                # Hojas de estilo
│   ├── js/                 # Scripts principales (admin, user, auth, tasks, etc.)
│   └── views/              # Vistas HTML (admin, user, auth)
├── backend/                # Servidor Node.js/Express
│   ├── config/             # Configuración de Sequelize y BD
│   ├── controllers/        # Lógica de negocio (usuarios, grupos, tareas)
│   ├── models/             # Modelos Sequelize
│   ├── routes/             # Endpoints de la API REST
│   ├── middleware/         # Middlewares (autenticación, etc.)
│   └── app.js              # Entrada principal del backend
├── database/               # Modelos de BD.
├── enunciado_proyecto/     # Documentación adicional
└── README.md               # Este archivo
```

---

## 🚀 Tecnologías principales

- **Backend:** Node.js, Express.js, Sequelize, PostgreSQL, dotenv
- **Frontend:** HTML, CSS, JavaScript

---

## ⚙️ Instrucciones para desarrollo local

### 1. Clona el repositorio

```bash
git clone https://github.com/TOB1EH/GetDone.git
cd GetDone/
```

### 2. Configura el backend

Por convención: Todos los comandos `npm` deben ejecutarse dentro de la carpeta /backend. Debido a que el proyecto se desarrollo con una arquitectura separada frontend/backend, por lo cual se tiene un unico archivo `package.json` alojado en el backend con todas sus dependencias. El frontend no usa Node/npm o herramientas del tipo.

1. Entra a la carpeta:
    ```bash
    cd backend/
    ```
2. Instala las dependencias:
    ```bash
    npm install
    ```
3. Crea un archivo `.env` con la siguiente estructura:
    ```env
    DB_NAME=nombre_de_tu_db
    DB_USER=usuario
    DB_PASS=contraseña
    DB_HOST=localhost
    PORT=3000

    JWT_SECRET=tu_clave_secreta
    ```
    Puedes crear un token aleatorio para usar como clave con el siguiente comando desde la Terminal de Linux:
    ```bash
    head -c 32 /dev/urandom | base64
    ```

4. Configura la base de datos:

    **Sin migraciones:**  
    Asegúrate de tener PostgreSQL corriendo y una base de datos creada.
    Asegúrate de que `sequelize.sync()` esté activado en el código. Nosostros lo configuramos dentro del archivo `app.js` en el backend. Asi que para crear las tablas de la BD automaticamente en caso que no existan es suficiente con iniciar el servidor backend.

    **La Base de datos debera tener la siguiente estructura:**
    ![Diagrama Entidad Relacion DB](./db/DER.png)

    <!-- - **Con migraciones:**  
      ```bash
      npx sequelize-cli db:migrate
      ``` -->

5. Inicia el servidor backend:
    ```bash
    npm start
    ```
    El backend estará disponible en [http://localhost:3000](http://localhost:3000).

6. Abrir la app:

    Abrir la siguiente direccion: [http://localhost:3000](http://localhost:3000).

---

### 3. Configura el frontend

1. Entra a la carpeta:
    ```bash
    cd ../frontend
    ```
2. Abre `index.html` en tu navegador o usa una extensión tipo "Live Server" para desarrollo.

---

## 📦 Requisitos previos

- Node.js y npm instalados: [Descargar Node.js](https://nodejs.org/)
- PostgreSQL instalado y en funcionamiento
- Configuración correcta del archivo `.env` en `/backend`

---

## 📚 Documentación y arquitectura

- **Endpoints principales:** `/backend/routes/`
- **Lógica de negocio y modelos:** `/backend/controllers/` y `/backend/models/`
- **Frontend:** `/frontend/js/` y `/frontend/views/`
- **El frontend consume la API REST del backend usando fetch y JWT para autenticación.**

---

## 📬 Contacto

Para dudas técnicas o errores de configuración, puedes contactar:
- Tobias Funes: tobiasfunes@hotmail.com.ar - Desarrollador
- Agustin Brambilla: agusbram@gmail.com - Desarrollador

---

¡Proyecto en Desarrollo! 💻