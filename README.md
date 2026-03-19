# Gym Tracker - Initial Setup

Este es el proyecto base de Gym Tracker con toda la configuración lista.

## ✅ Qué está incluido

- ✅ Next.js 15 configurado
- ✅ TypeScript
- ✅ Tailwind CSS
- ✅ Cliente Supabase
- ✅ Estructura de carpetas
- ✅ Tipos TypeScript
- ✅ SQL para BD

## 🚀 Primeros pasos

### 1. Descargar y descomprimir

Descomprime el ZIP en tu carpeta de proyectos.

### 2. Instalar dependencias

```bash
cd gym-tracker
npm install
```

### 3. Crear BD en Supabase

1. Ir a https://supabase.com
2. Sign Up con GitHub
3. Crear proyecto:
   - Name: `gym-tracker`
   - Region: `eu-west-1`
   - Esperar 2-3 min
4. En SQL Editor, copiar TODO el contenido de `SUPABASE_SETUP.sql`
5. Pegar en SQL Editor y click Run

### 4. Configurar variables de entorno

1. En Supabase: Settings → API
2. Copiar `Project URL` y `anon public` key
3. Crear archivo `.env.local` en la raíz (gym-tracker/)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxxxxx
```

4. Reemplaza `xxxxx` con tus valores

### 5. Iniciar el servidor

```bash
npm run dev
```

Abre http://localhost:3000

---

## 📁 Estructura

```
gym-tracker/
├── src/
│   ├── app/           # Next.js app router
│   ├── components/    # Componentes React
│   ├── lib/          # Funciones y tipos
│   └── styles/       # CSS global
├── public/           # Assets estáticos
├── .env.local        # Variables (crear)
└── SUPABASE_SETUP.sql
```

---

## 🔧 Próximos pasos

Una vez tengas todo corriendo:

1. **P1: Autenticación** - Login con magic link
2. **P2: Setup usuario** - Onboarding (peso, altura)
3. **P3: CRUD Entrenamientos** - Registrar ejercicios
4. **P4: CRUD Métricas** - Registrar diarias
5. **P5: Dashboard** - Ver datos

---

## ⚠️ Troubleshooting

### "npm command not found"
Instala Node.js desde https://nodejs.org

### "SUPABASE_URL is undefined"
- Verifica que `.env.local` existe en la raíz
- Reinicia `npm run dev`

### "CREATE TABLE: permission denied"
- Usa admin de Supabase
- Verifica que creaste el proyecto

---

**¿Dudas? Revisa FUNCTIONAL_SCOPE.md y PROJECT_CONTEXT.md**
