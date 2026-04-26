# MineX

Proyecto de MineX usando node.js para crear la API

## Enlace al repositorio de GitHub

[https://github.com/miguelrodcas06/minex-backend](https://github.com/miguelrodcas06/minex-backend)

## Base de datos

La aplicación usa **Supabase (PostgreSQL)** en producción. Configura la variable de entorno:

```
DATABASE_URL=postgresql://postgres.[proyecto]:[password]@aws-0-eu-west-1.pooler.supabase.com:5432/postgres
```

Consulta el archivo `.env.example` para ver todas las variables necesarias.

## Ejecución del Proyecto

### Backend

1.  Navegar al directorio del backend:
    bash
    cd ../minex-backend
    
2.  Instalar dependencias:
    bash
    npm install
    
3.  Iniciar el servidor de desarrollo:
    bash
    npm run dev
    
