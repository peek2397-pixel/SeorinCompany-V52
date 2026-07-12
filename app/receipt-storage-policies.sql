-- 영수증 Storage 정책
-- 먼저 Storage에서 private bucket 이름을 receipts로 만든 뒤 실행하세요.

drop policy if exists "receipt upload own folder" on storage.objects;
drop policy if exists "receipt read own or card manager" on storage.objects;
drop policy if exists "receipt delete own or card manager" on storage.objects;

create policy "receipt upload own folder"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'receipts'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "receipt read own or card manager"
on storage.objects for select to authenticated
using (
  bucket_id = 'receipts'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or public.has_permission('card_manage')
  )
);

create policy "receipt delete own or card manager"
on storage.objects for delete to authenticated
using (
  bucket_id = 'receipts'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or public.has_permission('card_manage')
  )
);
