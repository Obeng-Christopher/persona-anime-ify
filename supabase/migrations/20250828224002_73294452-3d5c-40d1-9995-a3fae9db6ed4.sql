-- Create users table for profile information
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    avatar_url TEXT,
    total_transformations INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create characters table with anime character data
CREATE TABLE IF NOT EXISTS public.characters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    anime_series TEXT NOT NULL,
    image_url TEXT NOT NULL,
    costume_description TEXT NOT NULL,
    prompt_template TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'popular',
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transformations table to track user transformations
CREATE TABLE IF NOT EXISTS public.transformations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    character_id UUID REFERENCES public.characters(id) ON DELETE SET NULL,
    original_image_url TEXT NOT NULL,
    transformed_image_url TEXT,
    status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
    processing_time INTEGER,
    user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transformations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert their own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- RLS Policies for characters table (publicly readable)
CREATE POLICY "Characters are viewable by everyone" ON public.characters
    FOR SELECT USING (true);

-- RLS Policies for transformations table
CREATE POLICY "Users can view their own transformations" ON public.transformations
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own transformations" ON public.transformations
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own transformations" ON public.transformations
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language plpgsql;

-- Create trigger for users table
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample character data
INSERT INTO public.characters (name, anime_series, image_url, costume_description, prompt_template, category, is_featured) VALUES
('Naruto Uzumaki', 'Naruto', '/assets/characters/naruto.jpg', 'Orange ninja outfit with blue trim, whisker marks on cheeks', 'Transform this person into Naruto Uzumaki style with spiky blonde hair, blue eyes, orange ninja outfit with blue trim, and whisker marks on cheeks. Anime art style with vibrant colors and dynamic pose.', 'shonen', true),
('Monkey D. Luffy', 'One Piece', '/assets/characters/luffy.jpg', 'Red vest, blue shorts, straw hat', 'Transform this person into Monkey D. Luffy style with black hair, red vest, blue shorts, straw hat, wide grin and stretching pose. One Piece anime art style with vibrant colors.', 'shonen', true),
('Goku', 'Dragon Ball', '/assets/characters/goku.jpg', 'Orange gi uniform with blue undershirt', 'Transform this person into Goku style with spiky black hair, orange gi uniform with blue undershirt, confident smile and fighting stance. Dragon Ball anime art style with vibrant colors.', 'shonen', true),
('Deku', 'My Hero Academia', '/assets/characters/deku.jpg', 'Green hero costume with mask', 'Transform this person into Deku (Izuku Midoriya) style with green curly hair, freckles, green hero costume with mask, confident heroic expression. My Hero Academia anime art style.', 'shonen', true),
('Tanjiro Kamado', 'Demon Slayer', '/assets/characters/tanjiro.jpg', 'Checkered haori jacket, water breathing effects', 'Transform this person into Tanjiro Kamado style with burgundy hair, checkered haori jacket, kind expression, and water breathing technique effects. Demon Slayer anime art style with flowing water elements.', 'shonen', true),
('Sasuke Uchiha', 'Naruto', '/assets/characters/sasuke.jpg', 'Dark blue shirt, serious expression', 'Transform this person into Sasuke Uchiha style with black hair, dark blue shirt, serious expression, and Sharingan eyes glowing red. Naruto anime art style with cool dark energy effects.', 'shonen', true);

-- Create storage bucket for user uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('user-uploads', 'user-uploads', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('transformations', 'transformations', false);

-- Storage policies for user uploads
CREATE POLICY "Users can upload their own images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'user-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own uploads" ON storage.objects
    FOR SELECT USING (bucket_id = 'user-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for transformations
CREATE POLICY "Users can view their own transformations" ON storage.objects
    FOR SELECT USING (bucket_id = 'transformations' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload transformation results" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'transformations' AND auth.uid()::text = (storage.foldername(name))[1]);