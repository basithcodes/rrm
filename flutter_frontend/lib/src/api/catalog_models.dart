// =====================================================================
// Catalog Models
// ---------------------------------------------------------------------
// Strongly typed Dart classes that mirror the JSON returned by the
// Next.js `/api/catalog` endpoint. Used by the warehouse / kiosk
// `CatalogScreen`.
// =====================================================================

class Variant {
  const Variant({
    required this.sku,
    required this.description,
    required this.minimumOrderQuantity,
    required this.basePriceUsd,
    required this.dimensions,
  });

  final String sku;
  final String description;
  final int minimumOrderQuantity;
  final double? basePriceUsd;
  final Map<String, String> dimensions;

  factory Variant.fromJson(Map<String, dynamic> json) {
    final rawDims = json['dimensionsJson'];
    final dims = <String, String>{};
    if (rawDims is Map) {
      rawDims.forEach((key, value) {
        if (value == null) return;
        dims[key.toString()] = value.toString();
      });
    } else if (json['dimensions'] is List) {
      for (final entry in (json['dimensions'] as List)) {
        if (entry is Map &&
            entry['label'] != null &&
            entry['value'] != null) {
          dims[entry['label'].toString()] = entry['value'].toString();
        }
      }
    }

    final price = json['basePriceUsd'];
    double? basePrice;
    if (price is num) {
      basePrice = price.toDouble();
    } else if (price is String) {
      basePrice = double.tryParse(price);
    }

    return Variant(
      sku: (json['sku'] ?? json['code'] ?? '').toString(),
      description: (json['description'] ?? '').toString(),
      minimumOrderQuantity:
          json['minimumOrderQuantity'] is num
              ? (json['minimumOrderQuantity'] as num).toInt()
              : int.tryParse(
                    (json['minimumOrderQuantity'] ?? '0').toString(),
                  ) ??
                  0,
      basePriceUsd: basePrice,
      dimensions: dims,
    );
  }

  /// Best-effort lookup of a single dimension by needle keywords.
  String? lookupDimension(List<String> needles) {
    for (final entry in dimensions.entries) {
      final key = entry.key.toLowerCase();
      if (needles.any((n) => key.contains(n))) return entry.value;
    }
    return null;
  }
}

class Product {
  const Product({
    required this.slug,
    required this.name,
    required this.category,
    required this.material,
    required this.summary,
    required this.variants,
  });

  final String slug;
  final String name;
  final String category;
  final String material;
  final String summary;
  final List<Variant> variants;

  factory Product.fromJson(Map<String, dynamic> json) {
    final rawVariants = json['variants'];
    final variants = <Variant>[];
    if (rawVariants is List) {
      for (final v in rawVariants) {
        if (v is Map<String, dynamic>) {
          variants.add(Variant.fromJson(v));
        } else if (v is Map) {
          variants.add(
            Variant.fromJson(v.map((k, val) => MapEntry(k.toString(), val))),
          );
        }
      }
    }

    return Product(
      slug: (json['slug'] ?? '').toString(),
      name: (json['name'] ?? '').toString(),
      category: (json['category'] ?? '').toString(),
      material: (json['material'] ?? '').toString(),
      summary: (json['summary'] ?? '').toString(),
      variants: variants,
    );
  }
}
