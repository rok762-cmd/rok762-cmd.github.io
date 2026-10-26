-- 버스 대절 견적 비교 (SQL Editor에 붙여 넣고 Run. 여러 번 실행해도 됨)
-- 고객은 로그인 없이 아래 서버 함수만 부른다(표를 직접 못 봄). 기사는 받은 요청에 금액을 써서 답장한다.

alter table jobs add column if not exists mode text not null default 'fixed';
alter table jobs add column if not exists to_lat double precision;
alter table jobs add column if not exists to_lng double precision;
alter table jobs add column if not exists round_trip boolean not null default false;
alter table jobs add column if not exists customer_name text;
alter table jobs add column if not exists token text;
alter table jobs add column if not exists note text;
alter table jobs add column if not exists chosen_reply_id text;
alter table jobs add column if not exists review jsonb;
create unique index if not exists jobs_token on jobs (token) where token is not null;

alter table replies add column if not exists price int;
alter table replies add column if not exists includes text;
-- 기사가 자기 답장(견적 금액)을 고칠 수 있게
drop policy if exists replies_update_own on replies;
create policy replies_update_own on replies for update using (driver_id = (me()).id) with check (driver_id = (me()).id);

-- 고객 휴대폰: 관제실과, 예약이 확정된 그 기사만
create table if not exists quote_contacts (id text primary key references jobs(id) on delete cascade, phone text not null);
alter table quote_contacts enable row level security;
grant select, insert, update, delete on quote_contacts to authenticated;
drop policy if exists qc_control on quote_contacts;
create policy qc_control on quote_contacts for all using ((me()).role = 'control') with check ((me()).role = 'control');
drop policy if exists qc_driver on quote_contacts;
create policy qc_driver on quote_contacts for select using (exists (select 1 from jobs j where j.id = quote_contacts.id and j.status = 'assigned' and j.assigned_driver_id = (me()).id));
drop policy if exists zz_carrier on quote_contacts;
create policy zz_carrier on quote_contacts as restrictive for all using (my_carrier() is null or c_job(id)) with check (my_carrier() is null or c_job(id));

-- ① 견적 요청 (로그인 없이)
create or replace function request_quote(p json) returns json language plpgsql security definer set search_path = public as $$
declare ph text := regexp_replace(coalesce(p->>'phone',''), '\D', '', 'g'); n int := coalesce((p->>'people')::int, 0);
        d date := (p->>'date')::date; s int := (p->>'start')::int; e int := (p->>'end')::int;
        tok text := substr(replace(gen_random_uuid()::text, '-', ''), 1, 15); jid text := 'job_' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 12);
        sent text[]; phone_fmt text;
begin
  if coalesce(trim(p->>'name'), '') = '' then return json_build_object('ok', false, 'message', '이름(단체 이름)을 넣어 주세요.'); end if;
  if ph !~ '^01[016789][0-9]{7,8}$' then return json_build_object('ok', false, 'message', '휴대폰 번호를 010-1234-5678 처럼 넣어 주세요.'); end if;
  if d is null or d < current_date then return json_build_object('ok', false, 'message', '날짜는 오늘 이후로 골라 주세요.'); end if;
  if s is null or e is null or e <= s then return json_build_object('ok', false, 'message', '돌아오는 시각이 출발 시각보다 늦어야 합니다.'); end if;
  if n < 1 or n > 45 then return json_build_object('ok', false, 'message', '인원은 1~45명으로 넣어 주세요.'); end if;
  if (p->>'fromLat') is null then return json_build_object('ok', false, 'message', '출발지 위치를 찾지 못했습니다.'); end if;
  phone_fmt := case when length(ph) = 10 then substr(ph,1,3)||'-'||substr(ph,4,3)||'-'||substr(ph,7) else substr(ph,1,3)||'-'||substr(ph,4,4)||'-'||substr(ph,8) end;
  if (select count(*) from jobs j join quote_contacts c on c.id = j.id where j.mode = 'quote' and j.status = 'open' and c.phone = phone_fmt) >= 5 then
    return json_build_object('ok', false, 'message', '진행 중인 견적 요청이 너무 많습니다. 먼저 받은 견적을 정리해 주세요.'); end if;
  -- 승인된 영업용 차량 기사 중 좌석이 맞는 사람 (시간 확인은 기사가 직접)
  select coalesce(array_agg(dp.id), '{}') into sent from driver_profiles dp join people pe on pe.id = dp.id
    where dp.status = 'approved' and dp.licensed and dp.seats >= n;
  insert into jobs (id, client, title, date, start_min, end_min, from_name, from_lat, from_lng, to_name, to_lat, to_lng, seats_needed, fee, needs_helper,
                    status, sent_to, created_at, mode, round_trip, customer_name, token, note)
  values (jid, trim(p->>'name'), coalesce(nullif(trim(p->>'purpose'), ''), '버스 대절'), d, s, e, trim(p->>'from'), (p->>'fromLat')::float8, (p->>'fromLng')::float8,
          trim(p->>'to'), (p->>'toLat')::float8, (p->>'toLng')::float8, n, 0, false, 'open', sent, now(), 'quote', coalesce((p->>'roundTrip')::boolean, false),
          trim(p->>'name'), tok, nullif(trim(coalesce(p->>'note','')), ''));
  insert into quote_contacts (id, phone) values (jid, phone_fmt);
  return json_build_object('ok', true, 'token', tok,
    'message', case when cardinality(sent) > 0 then '운행할 수 있는 기사 ' || cardinality(sent) || '명에게 견적을 요청했습니다.' else '요청을 받았습니다. 맞는 기사를 찾는 대로 견적을 보내 드립니다.' end);
end $$;

-- ② 고객 화면: 요청 내용 + 받은 견적 (고르기 전엔 기사 이름 가림, 연락처 없음)
create or replace function get_quote(t text) returns json language plpgsql stable security definer set search_path = public as $$
declare j jobs; cards json; stage text;
begin
  select * into j from jobs where token = t and mode = 'quote';
  if not found then return json_build_object('ok', false, 'reason', '없는 견적 주소입니다.'); end if;
  select coalesce(json_agg(x order by (x->>'price')::int), '[]') into cards from (
    select json_build_object(
      'replyId', r.id, 'price', r.price, 'includes', r.includes, 'at', r.at,
      'driverName', case when r.id = j.chosen_reply_id then pe.name else left(pe.name, 1) || repeat('*', least(2, greatest(char_length(pe.name) - 1, 0))) end,
      'model', dp.model, 'year', dp.year, 'seats', dp.seats, 'verified', coalesce(dp.status = 'approved', false),
      'rating', (select json_build_object('avg', coalesce(round(avg((jj.review->>'stars')::numeric), 1), 0), 'count', count(*)) from jobs jj where jj.assigned_driver_id = r.driver_id and jj.review is not null),
      'phone', case when r.id = j.chosen_reply_id then pe.phone end, 'plate', case when r.id = j.chosen_reply_id then dp.plate end) as x
    from replies r join people pe on pe.id = r.driver_id left join driver_profiles dp on dp.id = r.driver_id
    where r.job_id = j.id and r.verdict = 'yes' and coalesce(r.price, 0) > 0) q;
  stage := case when j.status = 'cancelled' then 'cancelled' when j.status = 'assigned' and j.date < current_date then 'done'
                when j.status = 'assigned' then 'booked' when json_array_length(cards) > 0 then 'quoted' else 'waiting' end;
  return json_build_object('ok', true, 'client', j.client, 'title', j.title, 'date', j.date, 'start', j.start_min, 'end', j.end_min, 'from', j.from_name, 'to', j.to_name,
    'people', j.seats_needed, 'roundTrip', j.round_trip, 'note', j.note, 'stage', stage, 'sent', cardinality(j.sent_to), 'cards', cards,
    'chosenReplyId', j.chosen_reply_id, 'review', j.review);
end $$;

-- ③ 견적 고르기 → 확정
create or replace function choose_quote(t text, r text) returns json language plpgsql security definer set search_path = public as $$
declare j jobs; rp replies;
begin
  select * into j from jobs where token = t and mode = 'quote' for update;
  if not found then return json_build_object('ok', false, 'message', '견적 요청을 찾지 못했습니다.'); end if;
  if j.status <> 'open' then return json_build_object('ok', false, 'message', case when j.status = 'assigned' then '이미 예약이 확정됐습니다.' else '취소된 요청입니다.' end); end if;
  select * into rp from replies where id = r and job_id = j.id and verdict = 'yes' and coalesce(price, 0) > 0;
  if not found then return json_build_object('ok', false, 'message', '고른 견적을 찾지 못했습니다.'); end if;
  update jobs set status = 'assigned', assigned_driver_id = rp.driver_id, fee = rp.price, chosen_reply_id = rp.id, contact_sent_at = now() where id = j.id;
  return json_build_object('ok', true, 'message', '예약이 확정됐습니다. 아래에 기사님 연락처가 나옵니다.');
end $$;

create or replace function cancel_quote(t text) returns json language plpgsql security definer set search_path = public as $$
declare j jobs;
begin
  select * into j from jobs where token = t and mode = 'quote';
  if not found or j.status = 'cancelled' then return json_build_object('ok', false, 'message', '취소할 요청이 없습니다.'); end if;
  update jobs set status = 'cancelled' where id = j.id;
  return json_build_object('ok', true, 'message', case when j.status = 'assigned' then '예약을 취소했습니다. 기사님께도 알려 주세요.' else '견적 요청을 취소했습니다.' end);
end $$;

create or replace function review_quote(t text, stars int, body text) returns json language plpgsql security definer set search_path = public as $$
declare j jobs;
begin
  select * into j from jobs where token = t and mode = 'quote';
  if not found or j.status <> 'assigned' then return json_build_object('ok', false, 'message', '확정된 예약에만 후기를 남길 수 있습니다.'); end if;
  if j.date > current_date then return json_build_object('ok', false, 'message', '운행이 끝난 뒤에 후기를 남길 수 있습니다.'); end if;
  if stars is null or stars < 1 or stars > 5 then return json_build_object('ok', false, 'message', '별점을 골라 주세요.'); end if;
  update jobs set review = json_build_object('stars', stars, 'text', nullif(left(trim(coalesce(body, '')), 300), ''), 'at', now()) where id = j.id;
  return json_build_object('ok', true, 'message', '후기를 남겨 주셔서 감사합니다.');
end $$;

revoke all on function request_quote(json), get_quote(text), choose_quote(text, text), cancel_quote(text), review_quote(text, int, text) from public;
grant execute on function request_quote(json), get_quote(text), choose_quote(text, text), cancel_quote(text), review_quote(text, int, text) to anon, authenticated;

-- 확인
select (select count(*) from pg_proc where proname in ('request_quote','get_quote','choose_quote','cancel_quote','review_quote')) as funcs,
       (select count(*) from information_schema.columns where table_name = 'replies' and column_name = 'price') as price_col,
       (select count(*) from pg_policies where tablename = 'quote_contacts') as contact_pols;
