-- 1. PERFIL DE USUARIO
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  weight DECIMAL(5,2) NOT NULL,
  height INTEGER NOT NULL,
  dob DATE,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. EJERCICIOS GLOBALES (no cambia por usuario)
CREATE TABLE exercises (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  muscle_group VARCHAR(50),
  category VARCHAR(50),
  description TEXT,
  is_active BOOLEAN DEFAULT true
);

-- 3. ENTRENAMIENTOS
CREATE TABLE training_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. EJERCICIOS POR ENTRENAMIENTO (Junction Table)
CREATE TABLE workout_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  training_session_id UUID NOT NULL REFERENCES training_sessions(id) ON DELETE CASCADE,
  exercise_id INTEGER NOT NULL REFERENCES exercises(id),
  sets INTEGER NOT NULL CHECK (sets >= 1 AND sets <= 10),
  reps INTEGER NOT NULL CHECK (reps >= 1 AND reps <= 30),
  weight DECIMAL(6,2),
  rpe INTEGER CHECK (rpe >= 1 AND rpe <= 10),
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. MÉTRICAS DIARIAS
CREATE TABLE daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  rpe INTEGER CHECK (rpe >= 1 AND rpe <= 10),
  fatigue INTEGER CHECK (fatigue >= 1 AND fatigue <= 10),
  sleep_hours DECIMAL(3,1),
  sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
  body_weight DECIMAL(5,2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- ÍNDICES
CREATE INDEX idx_training_sessions_user_date ON training_sessions(user_id, date);
CREATE INDEX idx_workout_exercises_training ON workout_exercises(training_session_id);
CREATE INDEX idx_daily_metrics_user_date ON daily_metrics(user_id, date);

-- ROW LEVEL SECURITY
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own profile"
  ON user_profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users modify own profile"
  ON user_profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users see own training sessions"
  ON training_sessions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users create own training"
  ON training_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users modify own training"
  ON training_sessions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users delete own training"
  ON training_sessions FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users see own metrics"
  ON daily_metrics FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users manage own metrics"
  ON daily_metrics FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own metrics"
  ON daily_metrics FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users delete own metrics"
  ON daily_metrics FOR DELETE USING (auth.uid() = user_id);

-- SEED: Ejercicios iniciales
INSERT INTO exercises (name, muscle_group, category) VALUES
('Press de banca', 'Pecho', 'Fuerza'),
('Sentadillas', 'Piernas', 'Fuerza'),
('Peso muerto', 'Espalda', 'Fuerza'),
('Dominadas', 'Espalda', 'Fuerza'),
('Fondos', 'Pecho', 'Fuerza'),
('Flexiones', 'Pecho', 'Fuerza'),
('Remo', 'Espalda', 'Fuerza'),
('Curl de bíceps', 'Brazos', 'Aislamiento'),
('Extensión de tríceps', 'Brazos', 'Aislamiento'),
('Prensa de hombros', 'Hombros', 'Fuerza'),
('Leg press', 'Piernas', 'Fuerza'),
('Hack squat', 'Piernas', 'Fuerza'),
('Vuelos de pecho', 'Pecho', 'Aislamiento'),
('Jalones', 'Espalda', 'Aislamiento'),
('Elevaciones laterales', 'Hombros', 'Aislamiento'),
('Crunch', 'Core', 'Aislamiento'),
('Planchas', 'Core', 'Fuerza'),
('Sentadilla búlgara', 'Piernas', 'Fuerza'),
('Press de piernas', 'Piernas', 'Fuerza'),
('Remo en T', 'Espalda', 'Fuerza'),
('Press inclinado', 'Pecho', 'Fuerza'),
('Pulldowns', 'Espalda', 'Aislamiento'),
('Cardio - Trotadora', 'Cardio', 'Cardio'),
('Cardio - Bicicleta', 'Cardio', 'Cardio'),
('Cardio - Elíptica', 'Cardio', 'Cardio');
