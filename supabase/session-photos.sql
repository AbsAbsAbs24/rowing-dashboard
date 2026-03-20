alter table public.sessions
add column if not exists photo_url text;

insert into storage.buckets (id, name, public)
values ('session-photos', 'session-photos', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Public can view session photos" on storage.objects;
create policy "Public can view session photos"
on storage.objects
for select
to public
using (bucket_id = 'session-photos');

drop policy if exists "Public can upload session photos" on storage.objects;
create policy "Public can upload session photos"
on storage.objects
for insert
to public
with check (bucket_id = 'session-photos');
