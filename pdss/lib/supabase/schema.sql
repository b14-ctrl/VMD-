-- PDSS Database Schema

-- Projects
create table public.projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  store_name text,
  store_area_m2 numeric,
  event_date date,
  season_tag text,
  floor_plan_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.projects enable row level security;
create policy "Users can manage own projects" on public.projects
  for all using (auth.uid() = user_id);

-- Scenes
create table public.scenes (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  name text default 'Main Scene',
  version integer default 1,
  scene_json jsonb default '{}',
  thumbnail_url text,
  created_at timestamptz default now()
);
alter table public.scenes enable row level security;
create policy "Users can manage scenes of own projects" on public.scenes
  for all using (
    exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
  );

-- Object Library
create table public.object_library (
  id uuid default gen_random_uuid() primary key,
  category text check (category in ('mannequin','hanger','shelf','lighting','prop','sign')) not null,
  name text not null,
  model_url text,
  thumbnail_url text,
  tags text[] default '{}',
  source text check (source in ('ai','manual')) default 'manual',
  created_at timestamptz default now()
);
alter table public.object_library enable row level security;
create policy "Object library is readable by all authenticated users" on public.object_library
  for select using (auth.role() = 'authenticated');

-- Scene Objects
create table public.scene_objects (
  id uuid default gen_random_uuid() primary key,
  scene_id uuid references public.scenes(id) on delete cascade not null,
  object_lib_id uuid references public.object_library(id),
  position_x numeric default 0,
  position_y numeric default 0,
  position_z numeric default 0,
  rotation_y numeric default 0,
  scale numeric default 1,
  color text default '#ffffff',
  label text,
  z_index integer default 0
);
alter table public.scene_objects enable row level security;
create policy "Users can manage scene objects of own scenes" on public.scene_objects
  for all using (
    exists (
      select 1 from public.scenes s
      join public.projects p on p.id = s.project_id
      where s.id = scene_id and p.user_id = auth.uid()
    )
  );

-- AI Suggestions
create table public.ai_suggestions (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  variation_index integer not null,
  prompt_used text,
  result_json jsonb,
  image_url text,
  selected boolean default false,
  created_at timestamptz default now()
);
alter table public.ai_suggestions enable row level security;
create policy "Users can manage own AI suggestions" on public.ai_suggestions
  for all using (
    exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
  );

-- Season Events
create table public.season_events (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  date_start text not null,
  date_end text not null,
  theme_tags text[] default '{}',
  color_palette_json jsonb default '{}'
);
insert into public.season_events (name, date_start, date_end, theme_tags, color_palette_json) values
  ('크리스마스', '12-01', '12-25', '{"트리","오너먼트","따뜻한조명","산타"}', '{"primary":"#C41E3A","secondary":"#FFD700","accent":"#228B22"}'),
  ('설날·신년', '12-26', '01-20', '{"전통패턴","새해메시지","사이니지"}', '{"primary":"#C41E3A","secondary":"#FFD700","accent":"#FFFFFF"}'),
  ('발렌타인', '02-01', '02-14', '{"하트","커플마네킹","로맨틱"}', '{"primary":"#FF69B4","secondary":"#C41E3A","accent":"#FFB6C1"}'),
  ('봄시즌', '03-01', '05-15', '{"플라워","식물","자연광","파스텔"}', '{"primary":"#98FB98","secondary":"#FFB6C1","accent":"#87CEEB"}');

-- Updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_projects_updated
  before update on public.projects
  for each row execute procedure public.handle_updated_at();
