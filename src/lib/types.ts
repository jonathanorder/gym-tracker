// User Profile
export interface UserProfile {
  id: string
  weight: number
  height: number
  dob?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

// Exercise
export interface Exercise {
  id: number
  name: string
  muscle_group?: string
  category?: string
  description?: string
  is_active: boolean
}

// Training Session
export interface TrainingSession {
  id: string
  user_id: string
  date: string
  notes?: string
  created_at: string
  updated_at: string
}

// Workout Exercise (dentro de una sesión)
export interface WorkoutExercise {
  id: string
  training_session_id: string
  exercise_id: number
  sets: number
  reps: number
  weight?: number
  rpe?: number
  order: number
  created_at: string
}

// Daily Metric
export interface DailyMetric {
  id: string
  user_id: string
  date: string
  rpe?: number
  fatigue?: number
  sleep_hours?: number
  sleep_quality?: number
  body_weight?: number
  notes?: string
  created_at: string
  updated_at: string
}

// Session (para auth)
export interface Session {
  user: {
    id: string
    email: string
  } | null
}
