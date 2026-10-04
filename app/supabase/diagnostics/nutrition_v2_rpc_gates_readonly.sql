-- Optional read-only breakdown when the aggregate RPC pre-smoke checks fail.
-- Expected: three rows, *_ok=true, auth_execute=true, service_execute=true,
-- anon_execute=false, overloads=1.
WITH expected_rpc(name, signature, body_hash) AS (
  VALUES
    ('persist_v2_meal_plan_atomic',
     'public.persist_v2_meal_plan_atomic(uuid,jsonb,jsonb)',
     'b8018a4bf66ca3bf6e76eab8c34d147c'),
    ('execute_v2_meal_swap_atomic',
     'public.execute_v2_meal_swap_atomic(uuid,date,text,timestamptz,timestamptz,jsonb)',
     'f0afa01b9412010c1091e373795a8fbf'),
    ('log_v2_planned_meal_atomic',
     'public.log_v2_planned_meal_atomic(uuid,date,text,jsonb)',
     '0afea0e58dcd0f2d323725ee8c5a4483')
)
SELECT e.name AS rpc,
       p.oid IS NOT NULL AS signature_ok,
       md5(btrim(regexp_replace(p.prosrc, '[[:space:]]+', ' ', 'g'))) = e.body_hash AS body_ok,
       pg_get_function_result(p.oid) = 'jsonb' AS result_ok,
       p.prosecdef AS definer_ok,
       p.proconfig @> ARRAY['search_path=public, pg_catalog']::text[] AS path_ok,
       has_function_privilege('authenticated', p.oid, 'EXECUTE') AS auth_execute,
       has_function_privilege('service_role', p.oid, 'EXECUTE') AS service_execute,
       has_function_privilege('anon', p.oid, 'EXECUTE') AS anon_execute,
       (SELECT count(*) FROM pg_proc overload
        WHERE overload.pronamespace = 'public'::regnamespace
          AND overload.proname = e.name) AS overloads
FROM expected_rpc e
LEFT JOIN pg_proc p ON p.oid = to_regprocedure(e.signature)
ORDER BY e.name;
