-- Cancelling an order puts its stock back; un-cancelling takes it again.
-- Works for every path (admin panel, the app's admin screen, SQL) because it is a trigger on orders.status.
-- Orders keep no product IDs, only items_summary written by the app and the website:
--   "Title (Color: Red, Size: M x2), Other title (x1)"
-- Titles can contain ", " and "(", so each item is found by the full product title (longest first),
-- never by splitting the text. An item whose product was renamed or deleted is skipped.

create or replace function public.restock_from_items_summary(p_summary text, p_direction int)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_rest text := ', ' || coalesce(p_summary, '');
  v_product record;
  v_needle text;
  v_at int;
  v_close int;
  v_inner text;
  v_qty int;
  v_size text;
begin
  for v_product in select id, title from public.custom_products order by length(title) desc loop
    v_needle := ', ' || v_product.title || ' (';
    loop
      v_at := strpos(v_rest, v_needle);
      exit when v_at = 0;
      v_close := strpos(substr(v_rest, v_at + length(v_needle)), ')');
      exit when v_close = 0;
      v_inner := substr(v_rest, v_at + length(v_needle), v_close - 1); -- e.g. "Color: Red, Size: M x2"
      -- Take this item out so a shorter title can't match inside it again.
      v_rest := substr(v_rest, 1, v_at - 1) || substr(v_rest, v_at + length(v_needle) + v_close);

      v_qty := coalesce((regexp_match(v_inner, 'x(\d+)\s*$'))[1]::int, 0);
      continue when v_qty <= 0;
      v_size := coalesce((regexp_match(v_inner, 'Size: (.+?)(?:,| x\d+\s*$)'))[1], '');

      update public.custom_products
      set quantity_available = greatest(0, coalesce(quantity_available, 0) + p_direction * v_qty),
          size_stock = case
            when v_size not in ('', 'Standard', 'One size') and size_stock ? v_size
              then jsonb_set(size_stock, array[v_size],
                             to_jsonb(greatest(0, coalesce((size_stock->>v_size)::int, 0) + p_direction * v_qty)))
            else size_stock end
      where id = v_product.id;
    end loop;
  end loop;
end;
$$;

-- Only the trigger may call it; nobody else gets to add stock.
revoke all on function public.restock_from_items_summary(text, int) from public, anon, authenticated;

create or replace function public.orders_restock_on_cancel()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_was boolean := lower(trim(coalesce(old.status, ''))) = 'cancelled';
  v_is boolean := lower(trim(coalesce(new.status, ''))) = 'cancelled';
begin
  if v_is and not v_was then
    perform public.restock_from_items_summary(new.items_summary, 1);
  elsif v_was and not v_is then
    perform public.restock_from_items_summary(new.items_summary, -1);
  end if;
  return new;
end;
$$;

revoke all on function public.orders_restock_on_cancel() from public, anon, authenticated;

drop trigger if exists orders_restock_on_cancel on public.orders;
create trigger orders_restock_on_cancel
after update of status on public.orders
for each row execute function public.orders_restock_on_cancel();
