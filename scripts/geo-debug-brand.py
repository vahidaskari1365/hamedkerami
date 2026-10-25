"""Debug the GEO brand-entity check against the live homepage."""
import asyncio
import sys

sys.path.insert(0, "/home/z/my-project/tools/seo/geo-optimizer-skill/src")

from geo_optimizer.core.audit_brand import audit_brand_entity  # noqa: E402


async def main():
    res = await audit_brand_entity("https://dr-kermani.com")
    print("checked:", res.checked)
    print("names_found:", res.names_found)
    print("primary_name:", res.primary_name)
    print("consistent:", res.brand_name_consistent)
    print("kg_links_found:", getattr(res, "knowledge_graph_links_found", None))
    print("sameas:", getattr(res, "sameas_count", None))
    for attr in dir(res):
        if attr.startswith("_") or attr in {"checked", "names_found", "primary_name", "brand_name_consistent"}:
            continue
        val = getattr(res, attr)
        if not callable(val) and val not in (None, False, [], 0, {}):
            print(f"{attr}: {val}")


asyncio.run(main())
