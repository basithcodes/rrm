import 'dart:convert';

import 'package:http/http.dart' as http;

import 'api_config.dart';
import 'catalog_models.dart';

// =====================================================================
// RrmApiClient
// ---------------------------------------------------------------------
// Typed thin client around the Next.js `/api/catalog` endpoint. Used by
// the warehouse / kiosk `CatalogScreen`. The legacy untyped client at
// `lib/src/api_client.dart` continues to back the marketing shell.
// =====================================================================

class RrmApiException implements Exception {
  RrmApiException(this.statusCode, this.message);
  final int statusCode;
  final String message;
  @override
  String toString() => 'RrmApiException($statusCode): $message';
}

class RrmApiClient {
  RrmApiClient({String? baseUrl, http.Client? client})
    : baseUrl = baseUrl ?? resolveApiBaseUrl(),
      _client = client ?? http.Client();

  final String baseUrl;
  final http.Client _client;

  /// Fetches the catalog from `GET /api/catalog` and decodes it into
  /// strongly typed `Product`/`Variant` instances.
  Future<List<Product>> fetchCatalog() async {
    final uri = Uri.parse('$baseUrl/api/catalog');
    final response = await _client.get(
      uri,
      headers: const {'Accept': 'application/json'},
    );

    if (response.statusCode != 200) {
      throw RrmApiException(
        response.statusCode,
        'Failed to load catalog: ${response.reasonPhrase ?? "HTTP ${response.statusCode}"}',
      );
    }

    final decoded = jsonDecode(response.body);
    if (decoded is! Map<String, dynamic>) {
      throw RrmApiException(200, 'Catalog payload was not a JSON object.');
    }

    final raw = decoded['products'];
    if (raw is! List) return const <Product>[];

    return raw
        .whereType<Map>()
        .map(
          (m) => Product.fromJson(m.map((k, v) => MapEntry(k.toString(), v))),
        )
        .toList(growable: false);
  }

  void close() => _client.close();
}
