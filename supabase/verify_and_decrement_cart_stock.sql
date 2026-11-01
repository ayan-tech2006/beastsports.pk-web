-- One stock for the app and the website.
-- Checks a whole cart and reduces stock only if every line fits; otherwise changes nothing.
-- The Android app already calls this function first at checkout (BeastRepository.verifyAndDecrementCartStock),
-- and the website checkout calls it before saving an order.
-- p_items: [{"product_id": "...", "quantity": 2, "size": "M"}]; size "" or "Standard" means no size.
create or replace function public.verify_and_decrement_cart_stock(p_items jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_need record;
  v_product record;
  v_size_qty int;
begin
  if jsonb_typeof(p_items) is distinct from 'array' or jsonb_array_length(p_items) = 0 then
    return jsonb_build_object('success', false, 'error_type', 'EMPTY_CART', 'message', 'Your cart is empty.');
  end if;

  -- Lock the cart's products in a fixed order so two checkouts wait in line instead of overselling.
  perform 1
  from public.custom_products
  where id in (select distinct x->>'product_id' from jsonb_array_elements(p_items) x)
  order by id
  for update;

  -- Check every product (same product in two sizes counts together) before changing anything.
  for v_need in
    select x->>'product_id' as product_id,
           sum(greatest(1, coalesce((x->>'quantity')::int, 1)))::int as quantity
    from jsonb_array_elements(p_items) x
    group by 1
  loop
    select title, coalesce(quantity_available, 0) as qty into v_product
    from public.custom_products where id = v_need.product_id;

    if not found then
      return jsonb_build_object('success', false, 'error_type', 'NOT_FOUND', 'product_id', v_need.product_id,
        'available', 0, 'message', 'A product in your cart is no longer available.');
    end if;
    if v_product.qty < v_need.quantity then
      return jsonb_build_object('success', false, 'error_type', 'OUT_OF_STOCK', 'product_id', v_need.product_id,
        'available', v_product.qty,
        'message', case when v_product.qty <= 0
          then 'Sorry! "' || v_product.title || '" is out of stock.'
          else 'Sorry! Only ' || v_product.qty || ' piece(s) of "' || v_product.title || '" left in stock.' end);
    end if;
  end loop;

  -- Sizes are only checked when the product keeps per-size stock for that size.
  for v_need in
    select x->>'product_id' as product_id, x->>'size' as size,
           sum(greatest(1, coalesce((x->>'quantity')::int, 1)))::int as quantity
    from jsonb_array_elements(p_items) x
    where coalesce(x->>'size', '') not in ('', 'Standard')
    group by 1, 2
  loop
    select title, size_stock into v_product from public.custom_products where id = v_need.product_id;
    if v_product.size_stock is not null and v_product.size_stock ? v_need.size then
      v_size_qty := coalesce((v_product.size_stock->>v_need.size)::int, 0);
      if v_size_qty < v_need.quantity then
        return jsonb_build_object('success', false, 'error_type', 'SIZE_OUT_OF_STOCK', 'product_id', v_need.product_id,
          'available', v_size_qty,
          'message', 'Sorry! Only ' || greatest(v_size_qty, 0) || ' piece(s) of "' || v_product.title || ' (' || v_need.size || ')" left in stock.');
      end if;
    end if;
  end loop;

  -- Everything fits: reduce the stock.
  for v_need in
    select x->>'product_id' as product_id, coalesce(x->>'size', '') as size,
           greatest(1, coalesce((x->>'quantity')::int, 1)) as quantity
    from jsonb_array_elements(p_items) x
  loop
    update public.custom_products
    set quantity_available = greatest(0, coalesce(quantity_available, 0) - v_need.quantity),
        size_stock = case
          when v_need.size not in ('', 'Standard') and size_stock ? v_need.size
            then jsonb_set(size_stock, array[v_need.size],
                           to_jsonb(greatest(0, coalesce((size_stock->>v_need.size)::int, 0) - v_need.quantity)))
          else size_stock end
    where id = v_need.product_id;
  end loop;

  return jsonb_build_object('success', true, 'message', 'Stock verified and decremented successfully.');
end;
$$;

revoke all on function public.verify_and_decrement_cart_stock(jsonb) from public;
grant execute on function public.verify_and_decrement_cart_stock(jsonb) to anon, authenticated, service_role;
