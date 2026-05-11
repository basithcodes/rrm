import 'dart:io' show Platform;

import 'package:flutter/foundation.dart' show kIsWeb;

/// Resolves the base URL for the Next.js REST API.
///
/// Priority:
///   1. `--dart-define=API_BASE_URL=https://...` (deployment override).
///   2. Android emulator → `http://10.0.2.2:3000` (the special host that
///      maps to the developer machine's `localhost`).
///   3. Everything else (web, iOS simulator, desktop) → `http://localhost:3000`.
String resolveApiBaseUrl() {
  const override = String.fromEnvironment('API_BASE_URL');
  if (override.isNotEmpty) return override;

  if (!kIsWeb && Platform.isAndroid) {
    return 'http://10.0.2.2:3000';
  }

  return 'http://localhost:3000';
}
