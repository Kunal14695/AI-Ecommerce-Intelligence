"""
TC-03: Product Search & Multi-Facet Filtering
"""

def test_tc03_search_and_filter(client):
    # Keyword search for "Apple"
    res = client.get("/api/search?q=Apple")
    assert res.status_code == 200
    products = res.json()
    assert len(products) > 0
    for p in products:
        assert "apple" in p["title"].lower() or "apple" in p["brand"].lower()

    # Category and price filter
    res_filtered = client.get("/api/products?min_price=10000&max_price=80000")
    assert res_filtered.status_code == 200
    filtered_prods = res_filtered.json()
    assert len(filtered_prods) > 0
    for p in filtered_prods:
        assert 10000 <= p["price"] <= 80000

    # Sorting by price ascending
    res_sorted = client.get("/api/products?sort_by=price_asc")
    assert res_sorted.status_code == 200
    sorted_prods = res_sorted.json()
    prices = [p["price"] for p in sorted_prods]
    assert prices == sorted(prices)
