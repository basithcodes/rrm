import 'dart:convert';

import 'package:http/http.dart' as http;

typedef JsonMap = Map<String, dynamic>;

JsonMap asJsonMap(dynamic value) {
  if (value is JsonMap) {
    return value;
  }

  if (value is Map) {
    return value.map((key, entry) => MapEntry(key.toString(), entry));
  }

  throw const FormatException('Expected a JSON object.');
}

List<JsonMap> asJsonMapList(dynamic value) {
  if (value is! List) {
    return const [];
  }

  return value.map<JsonMap>(asJsonMap).toList(growable: false);
}

List<String> asStringList(dynamic value) {
  if (value is! List) {
    return const [];
  }

  return value.map((entry) => entry.toString()).toList(growable: false);
}

String readString(JsonMap json, String key, {String fallback = ''}) {
  final value = json[key];

  if (value is String) {
    return value;
  }

  if (value == null) {
    return fallback;
  }

  return value.toString();
}

int readInt(JsonMap json, String key, {int fallback = 0}) {
  final value = json[key];

  if (value is int) {
    return value;
  }

  if (value is num) {
    return value.toInt();
  }

  if (value is String) {
    return int.tryParse(value) ?? fallback;
  }

  return fallback;
}

double readDouble(JsonMap json, String key, {double fallback = 0}) {
  final value = json[key];

  if (value is double) {
    return value;
  }

  if (value is num) {
    return value.toDouble();
  }

  if (value is String) {
    return double.tryParse(value) ?? fallback;
  }

  return fallback;
}

bool readBool(JsonMap json, String key, {bool fallback = false}) {
  final value = json[key];

  if (value is bool) {
    return value;
  }

  if (value is String) {
    return value.toLowerCase() == 'true';
  }

  return fallback;
}

class ApiException implements Exception {
  const ApiException({
    required this.statusCode,
    required this.message,
  });

  final int statusCode;
  final String message;

  @override
  String toString() => message;
}

class RrmApiClient {
  RrmApiClient({required this.baseUrl, http.Client? client}) : _client = client ?? http.Client();

  final String baseUrl;
  final http.Client _client;

  String? _ownerToken;
  JsonMap? _publicBootstrapCache;
  List<JsonMap>? _catalogCache;
  final Map<String, JsonMap> _productDetailCache = <String, JsonMap>{};
  JsonMap? _ownerWorkspaceCache;
  JsonMap? _importMetaCache;

  String? get ownerToken => _ownerToken;

  void setOwnerToken(String? token) {
    _ownerToken = token;

    if (token == null || token.isEmpty) {
      _ownerWorkspaceCache = null;
      _importMetaCache = null;
    }
  }

  Future<JsonMap> fetchPublicBootstrap({bool refresh = false}) async {
    if (!refresh && _publicBootstrapCache != null) {
      return _publicBootstrapCache!;
    }

    final payload = await _getJson('/api/public/bootstrap');
    _publicBootstrapCache = payload;
    return payload;
  }

  Future<List<JsonMap>> fetchCatalog({bool refresh = false}) async {
    if (!refresh && _catalogCache != null) {
      return _catalogCache!;
    }

    final payload = await _getJson('/api/catalog');
    _catalogCache = asJsonMapList(payload['products']);
    return _catalogCache!;
  }

  Future<JsonMap> fetchProductDetail(String slug, {bool refresh = false}) async {
    if (!refresh && _productDetailCache.containsKey(slug)) {
      return _productDetailCache[slug]!;
    }

    final payload = await _getJson('/api/catalog/$slug');
    final product = asJsonMap(payload['product']);
    _productDetailCache[slug] = product;
    return product;
  }

  Future<JsonMap> fetchOwnerWorkspace({bool refresh = false}) async {
    if (!refresh && _ownerWorkspaceCache != null) {
      return _ownerWorkspaceCache!;
    }

    final payload = await _getJson('/api/owner/dashboard', ownerAuth: true);
    _ownerWorkspaceCache = payload;
    return payload;
  }

  Future<JsonMap> fetchImportMeta({bool refresh = false}) async {
    if (!refresh && _importMetaCache != null) {
      return _importMetaCache!;
    }

    final payload = await _getJson('/api/owner/imports', ownerAuth: true);
    _importMetaCache = payload;
    return payload;
  }

  Future<bool> fetchOwnerSession() async {
    final payload = await _getJson('/api/owner/session', ownerAuth: true);
    return readBool(payload, 'authenticated');
  }

  Future<JsonMap> signInOwner(String passcode) async {
    final payload = await _postJson(
      '/api/owner/session',
      <String, dynamic>{'passcode': passcode},
      ownerAuth: true,
    );
    final token = readString(payload, 'token');

    if (token.isNotEmpty) {
      setOwnerToken(token);
    }

    return payload;
  }

  Future<void> signOutOwner() async {
    try {
      await _deleteJson('/api/owner/session', ownerAuth: true);
    } finally {
      setOwnerToken(null);
    }
  }

  Future<JsonMap> previewImport(String csvText, String fileName) {
    return _postJson(
      '/api/owner/imports/preview',
      <String, dynamic>{
        'csvText': csvText,
        'fileName': fileName,
      },
      ownerAuth: true,
    );
  }

  Future<JsonMap> commitImport(JsonMap preview) async {
    final payload = await _postJson(
      '/api/owner/imports/commit',
      <String, dynamic>{
        'fileName': readString(preview, 'fileName'),
        'rowCount': readInt(preview, 'rowCount'),
        'successfulCount': readInt(preview, 'successfulCount'),
        'failedCount': readInt(preview, 'failedCount'),
        'rows': preview['rows'],
      },
      ownerAuth: true,
    );

    _ownerWorkspaceCache = null;
    return payload;
  }

  Future<JsonMap> submitPublicRfq(JsonMap body) async {
    final payload = await _postJson('/api/public/rfq', body);
    _ownerWorkspaceCache = null;
    return payload;
  }

  Future<String> exportCatalogCsv() {
    return _getText('/api/owner/imports/export', ownerAuth: true);
  }

  Uri resolvePath(String path) {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return Uri.parse(path);
    }

    return Uri.parse('$baseUrl$path');
  }

  Future<JsonMap> _getJson(String path, {bool ownerAuth = false}) async {
    final response = await _client.get(
      resolvePath(path),
      headers: _headers(ownerAuth: ownerAuth),
    );

    return _decodeJsonResponse(response);
  }

  Future<String> _getText(String path, {bool ownerAuth = false}) async {
    final response = await _client.get(
      resolvePath(path),
      headers: _headers(ownerAuth: ownerAuth),
    );

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw _toApiException(response);
    }

    return response.body;
  }

  Future<JsonMap> _postJson(
    String path,
    JsonMap body, {
    bool ownerAuth = false,
  }) async {
    final response = await _client.post(
      resolvePath(path),
      headers: _headers(ownerAuth: ownerAuth, includeJsonContentType: true),
      body: jsonEncode(body),
    );

    return _decodeJsonResponse(response);
  }

  Future<JsonMap> _deleteJson(String path, {bool ownerAuth = false}) async {
    final response = await _client.delete(
      resolvePath(path),
      headers: _headers(ownerAuth: ownerAuth),
    );

    return _decodeJsonResponse(response);
  }

  JsonMap _decodeJsonResponse(http.Response response) {
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw _toApiException(response);
    }

    final decoded = jsonDecode(response.body);
    return asJsonMap(decoded);
  }

  ApiException _toApiException(http.Response response) {
    var message = response.body.trim();

    if (message.isEmpty) {
      message = 'Request failed with status ${response.statusCode}.';
    } else {
      try {
        final decoded = jsonDecode(message);

        if (decoded is Map && decoded['message'] is String) {
          message = decoded['message'] as String;
        }
      } catch {
        // Keep plain text response body when it is not JSON.
      }
    }

    return ApiException(statusCode: response.statusCode, message: message);
  }

  Map<String, String> _headers({
    required bool ownerAuth,
    bool includeJsonContentType = false,
  }) {
    final headers = <String, String>{
      'Accept': 'application/json',
    };

    if (includeJsonContentType) {
      headers['Content-Type'] = 'application/json';
    }

    if (ownerAuth && _ownerToken != null && _ownerToken!.isNotEmpty) {
      headers['Authorization'] = 'Bearer $_ownerToken';
    }

    return headers;
  }
}