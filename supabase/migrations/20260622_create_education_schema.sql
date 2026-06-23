-- 1. Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    is_under_construction BOOLEAN DEFAULT FALSE,
    route VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS for categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to categories" ON public.categories;
CREATE POLICY "Allow public read access to categories" ON public.categories 
    FOR SELECT TO public USING (true);

-- 2. Create lessons table
CREATE TABLE IF NOT EXISTS public.lessons (
    id VARCHAR(100) PRIMARY KEY, -- e.g. '1_nedir', '1_meditasyon', etc.
    category_id VARCHAR(100) REFERENCES public.categories(id) ON DELETE CASCADE,
    topic_id VARCHAR(100) NOT NULL, -- e.g. 'nedir', 'dengeleme', 'tasavvuf', 'meditasyon'
    title VARCHAR(255) NOT NULL,
    content TEXT,
    frequency INTEGER,
    image_url VARCHAR(255),
    astrology JSONB, -- planet, planetSymbol, signs, day
    quiz JSONB, -- question, options, correctAnswer, successMessage
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS for lessons
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to lessons" ON public.lessons;
CREATE POLICY "Allow public read access to lessons" ON public.lessons 
    FOR SELECT TO public USING (true);

-- 3. Create lesson_guidelines table
CREATE TABLE IF NOT EXISTS public.lesson_guidelines (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    icon VARCHAR(100),
    color VARCHAR(50),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS for guidelines
ALTER TABLE public.lesson_guidelines ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to lesson_guidelines" ON public.lesson_guidelines;
CREATE POLICY "Allow public read access to lesson_guidelines" ON public.lesson_guidelines 
    FOR SELECT TO public USING (true);

-- 4. Create emotional_diseases table
CREATE TABLE IF NOT EXISTS public.emotional_diseases (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    cause TEXT NOT NULL,
    affirmation TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS for emotional_diseases
ALTER TABLE public.emotional_diseases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to emotional_diseases" ON public.emotional_diseases;
CREATE POLICY "Allow public read access to emotional_diseases" ON public.emotional_diseases 
    FOR SELECT TO public USING (true);

-- 5. Create daily_affirmations table
CREATE TABLE IF NOT EXISTS public.daily_affirmations (
    day_of_week INTEGER PRIMARY KEY, -- 0 (Sunday) to 6 (Saturday)
    text TEXT NOT NULL,
    author VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS for daily_affirmations
ALTER TABLE public.daily_affirmations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to daily_affirmations" ON public.daily_affirmations;
CREATE POLICY "Allow public read access to daily_affirmations" ON public.daily_affirmations 
    FOR SELECT TO public USING (true);

-- 6. Create chakra_analysis_questions table
CREATE TABLE IF NOT EXISTS public.chakra_analysis_questions (
    id INTEGER PRIMARY KEY,
    chakra_id VARCHAR(50) NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS for chakra_analysis_questions
ALTER TABLE public.chakra_analysis_questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to chakra_analysis_questions" ON public.chakra_analysis_questions;
CREATE POLICY "Allow public read access to chakra_analysis_questions" ON public.chakra_analysis_questions 
    FOR SELECT TO public USING (true);

-- 7. Create quizzes table
CREATE TABLE IF NOT EXISTS public.quizzes (
    id VARCHAR(100) PRIMARY KEY, -- e.g. 'numeroloji_1', 'aura', etc.
    category_id VARCHAR(100) REFERENCES public.categories(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    required_unlock VARCHAR(100),
    is_highlight BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS for quizzes
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to quizzes" ON public.quizzes;
CREATE POLICY "Allow public read access to quizzes" ON public.quizzes 
    FOR SELECT TO public USING (true);

-- 8. Create quiz_questions table
CREATE TABLE IF NOT EXISTS public.quiz_questions (
    id VARCHAR(100) PRIMARY KEY, -- e.g. 'num_1', etc.
    quiz_id VARCHAR(100) REFERENCES public.quizzes(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options JSONB NOT NULL, -- list of choices, e.g. ["A", "B", "C"]
    correct_answer_index INTEGER NOT NULL, -- index of correct option
    explanation TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS for quiz_questions
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to quiz_questions" ON public.quiz_questions;
CREATE POLICY "Allow public read access to quiz_questions" ON public.quiz_questions 
    FOR SELECT TO public USING (true);
