-- ════════════════════════════════════════════════════════════════
-- Car photos — run this AFTER cars-schema.sql, once.
-- Safe to re-run by accident: every statement is guarded.
-- Contains NO destructive statements (no drop / truncate / delete).
--
-- Storage has its OWN row level security, separate from the `cars`
-- table. Getting the table policies right does nothing for the
-- bucket. The security boundary here is the FILE PATH: every upload
-- goes to  {user_id}/{random}.{ext}  and the policies below check
-- that the first folder is the uploader's own id.
-- ════════════════════════════════════════════════════════════════

-- 1) One nullable column on the existing table.
--    Additive: no rebuild, no data touched, existing rows get NULL.
--    The four `cars` policies keep working unchanged.
alter table public.cars
  add column if not exists photo_path text;

-- 2) The bucket. `public = true` means anyone can READ a file if they
--    have its URL — which is what a shop window needs. Writing is
--    still controlled by the policies in step 3.
insert into storage.buckets (id, name, public)
values ('car-photos', 'car-photos', true)
on conflict (id) do nothing;

-- 3) Storage policies.
--    storage.foldername(name) splits the path into folders;
--    element [1] is the first one, which we require to be the
--    uploader's user id. auth.uid() is NULL for signed-out visitors,
--    so all three write policies reject them automatically.
--
--    If the SQL editor refuses with "must be owner of table objects",
--    create these four in the dashboard instead:
--    Storage -> car-photos -> Policies. Same rules, different route.
do $$
begin
  -- READ: anyone, signed in or not. Matches the public browse page.
  if not exists (select 1 from pg_policies
                 where schemaname = 'storage' and tablename = 'objects'
                   and policyname = 'car_photos_public_read') then
    create policy car_photos_public_read on storage.objects
      for select using (bucket_id = 'car-photos');
  end if;

  -- UPLOAD: only into a folder named after your own user id.
  if not exists (select 1 from pg_policies
                 where schemaname = 'storage' and tablename = 'objects'
                   and policyname = 'car_photos_insert_own') then
    create policy car_photos_insert_own on storage.objects
      for insert with check (
        bucket_id = 'car-photos'
        and auth.uid()::text = (storage.foldername(name))[1]
      );
  end if;

  -- REPLACE: checks the existing file (using) and the new one
  -- (with check), so nobody can move a file into someone else's folder.
  if not exists (select 1 from pg_policies
                 where schemaname = 'storage' and tablename = 'objects'
                   and policyname = 'car_photos_update_own') then
    create policy car_photos_update_own on storage.objects
      for update
      using (
        bucket_id = 'car-photos'
        and auth.uid()::text = (storage.foldername(name))[1]
      )
      with check (
        bucket_id = 'car-photos'
        and auth.uid()::text = (storage.foldername(name))[1]
      );
  end if;

  -- DELETE: only your own files.
  if not exists (select 1 from pg_policies
                 where schemaname = 'storage' and tablename = 'objects'
                   and policyname = 'car_photos_delete_own') then
    create policy car_photos_delete_own on storage.objects
      for delete using (
        bucket_id = 'car-photos'
        and auth.uid()::text = (storage.foldername(name))[1]
      );
  end if;
end $$;
