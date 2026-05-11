import 'package:flutter/material.dart';

import 'screens/catalog_screen.dart';

// =====================================================================
// RRM Flutter App — Warehouse / Kiosk Catalog
// ---------------------------------------------------------------------
// Mounts the high-density `CatalogScreen` as the home widget. The
// previous marketing-style shell is archived at
// `lib/src/marketing_shell.dart.legacy` and is no longer wired in.
// =====================================================================

const _slate900 = Color(0xFF0F172A);
const _slate200 = Color(0xFFE2E8F0);
const _emerald700 = Color(0xFF047857);

class RrmFlutterApp extends StatelessWidget {
  const RrmFlutterApp({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = ThemeData(
      brightness: Brightness.light,
      scaffoldBackgroundColor: const Color(0xFFF8FAFC),
      primaryColor: _emerald700,
      colorScheme: const ColorScheme.light(
        primary: _emerald700,
        onPrimary: Colors.white,
        secondary: _emerald700,
        surface: Colors.white,
        onSurface: _slate900,
      ),
      dividerColor: _slate200,
      useMaterial3: true,
      // Strict: no rounded corners by default, no floating shadows.
      cardTheme: const CardTheme(
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.zero,
          side: BorderSide(color: _slate200, width: 1),
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: _emerald700,
          foregroundColor: Colors.white,
          shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.zero,
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.zero,
          ),
        ),
      ),
    );

    return MaterialApp(
      title: 'RRM Catalog',
      debugShowCheckedModeBanner: false,
      theme: theme,
      home: const CatalogScreen(),
    );
  }
}
