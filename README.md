# GetDone – Plataforma Web para Gestión de Tareas

Proyecto de un sistema completo para la gestión de tareas con arquitectura de frontend y backend separadas.

---

## 📁 Estructura del Proyecto

```
task-manager/
├── frontend/               # Parte del cliente
│   ├── assets/
│   │   ├── images/        # Íconos, logos, gráficos
│   │   └── fonts/         # Fuentes personalizadas
│   ├── css/
│   │   ├── auth.css       # Estilos para autenticación
│   │   ├── admin.css      # Estilos específicos admin
│   │   ├── user.css       # Estilos específicos usuario
│   │   └── main.css       # Estilos compartidos
│   ├── js/
│   │   ├── auth.js        # Lógica de autenticación
│   │   ├── admin.js       # Funcionalidades admin
│   │   ├── user.js        # Funcionalidades usuario
│   │   ├── charts.js      # Gráficos (Chart.js)
│   │   └── notifications.js # Notificaciones
│   ├── views/
│   │   ├── auth/
│   │   │   ├── login.html
│   │   │   └── register.html
│   │   ├── admin/
│   │   │   ├── dashboard.html  # Vista principal admin
│   │   │   ├── tasks.html      # CRUD tareas
│   │   │   ├── projects.html   # Gestión proyectos
│   │   │   ├── users.html      # Asignación tareas
│   │   │   └── reports.html    # Estadísticas
│   │   ├── user/
│   │   │   ├── dashboard.html  # Vista principal usuario
│   │   │   ├── mytasks.html    # Tareas asignadas
│   │   │   ├── profile.html    # Perfil usuario
│   │   │   ├── shared.html     # Proyectos compartidos
│   │   │   └── stats.html      # Estadísticas personales
│   │   └── shared/             # Componentes reutilizables
│   │       ├── navbar.html
│   │       ├── footer.html
│   │       └── notification.html
│   └── index.html              # Página de inicio pública
├── backend/                # Parte del servidor
│   ├── config/             # Configuraciones
│   ├── controllers/        # Controladores
│   ├── models/             # Modelos de datos
│   ├── routes/             # Rutas
│   ├── middlewares/        # Middlewares
│   └── app.js              # Aplicación principal
├── database/               # Scripts y modelos de base de datos
├── docs/                   # Documentación
└── README.md               # Documentación principal
```

---

## 🚀 Tecnologías principales

- **Backend:** Node.js, Express.js, Sequelize, PostgreSQL, dotenv
- **Frontend:** HTML, CSS, JavaScript

---

## ⚙️ Instrucciones para desarrollo local

### 1. Clona el repositorio

```bash
git clone https://github.com/MasterxDual/GetDone-I.S.II.git
cd GetDone-I.S.II/
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
    ```
4. Configura la base de datos (usa uno de los siguientes métodos):

    - **Sin migraciones:**  
    Asegúrate de tener PostgreSQL corriendo y una base de datos creada.
    Asegúrate de que `sequelize.sync()` esté activado en el código. Nosostros lo configuramos dentro del archivo `app.js` en el backend. Asi que para crear las tablas de la BD automaticamente en caso que no existan es suficiente con iniciar el servidor backend.
      ```bash
      node app.js
      ```
    <!-- - **Con migraciones:**  
      ```bash
      npx sequelize-cli db:migrate
      ``` -->

5. Inicia el servidor backend:
    ```bash
    npm start
    ```
    El backend estará disponible en `http://localhost:3000`.

6. Abrir la app:

Nos ubicamos en la carpeta de frontend e ingresamos el siguiente comando:
```bash
    npx live-server
    ```
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

## 📚 Documentación

- Los endpoints principales de la API están en `backend/routes/`.
- Lógica de negocio y modelos en `backend/controllers/` y `backend/models/`.
- El frontend consume la API a través de los scripts en `frontend/js/`.

---

## 📬 Contacto

Para dudas técnicas o errores de configuración, puedes contactar:
- Tobias Funes: tobiasfunes@hotmail.com.ar - Desarrollador
- Agustin Brambilla: agusbram@gmail.com - Desarrollador

---

¡Proyecto en Desarrollo! 💻