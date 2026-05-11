import 'package:flutter/material.dart';

import '../api/catalog_models.dart';
import '../api/rrm_api_client.dart';

// =====================================================================
// Catalog Screen
// ---------------------------------------------------------------------
// High-density industrial DataTable for warehouse / kiosk operators.
//   * White / slate / emerald system, sharp corners, 1px hairlines.
//   * Persistent search bar pinned under the AppBar (filters by SKU
//     or product name).
//   * Both vertical and horizontal `SingleChildScrollView` so workers
//     can pan across dense variant columns on small screens.
// =====================================================================

const _slate50 = Color(0xFFF8FAFC);
const _slate100 = Color(0xFFF1F5F9);
const _slate200 = Color(0xFFE2E8F0);
const _slate500 = Color(0xFF64748B);
const _slate700 = Color(0xFF334155);
const _slate900 = Color(0xFF0F172A);
const _emerald50 = Color(0xFFECFDF5);
const _emerald700 = Color(0xFF047857);
const _emerald800 = Color(0xFF065F46);

class _Row {
  const _Row({
    required this.product,
    required this.variant,
  });
  final Product product;
  final Variant variant;
}

class CatalogScreen extends StatefulWidget {
  const CatalogScreen({super.key, RrmApiClient? apiClient})
    : _injectedClient = apiClient;

  final RrmApiClient? _injectedClient;

  @override
  State<CatalogScreen> createState() => _CatalogScreenState();
}

class _CatalogScreenState extends State<CatalogScreen> {
  late final RrmApiClient _client;
  late Future<List<Product>> _future;
  final TextEditingController _searchController = TextEditingController();
  String _query = '';

  @override
  void initState() {
    super.initState();
    _client = widget._injectedClient ?? RrmApiClient();
    _future = _client.fetchCatalog();
    _searchController.addListener(() {
      final next = _searchController.text.trim();
      if (next == _query) return;
      setState(() => _query = next);
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    if (widget._injectedClient == null) _client.close();
    super.dispose();
  }

  Future<void> _refresh() async {
    setState(() {
      _future = _client.fetchCatalog();
    });
    await _future;
  }

  List<_Row> _flattenAndFilter(List<Product> products) {
    final q = _query.toLowerCase();
    final out = <_Row>[];
    for (final p in products) {
      for (final v in p.variants) {
        if (q.isEmpty ||
            v.sku.toLowerCase().contains(q) ||
            p.name.toLowerCase().contains(q) ||
            p.material.toLowerCase().contains(q)) {
          out.add(_Row(product: p, variant: v));
        }
      }
    }
    return out;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _slate50,
      appBar: AppBar(
        backgroundColor: Colors.white,
        foregroundColor: _slate900,
        elevation: 0,
        scrolledUnderElevation: 0,
        shape: const Border(bottom: BorderSide(color: _slate200, width: 1)),
        title: const Text(
          'RRM CATALOG',
          style: TextStyle(
            fontFamily: 'monospace',
            fontWeight: FontWeight.w700,
            letterSpacing: 2,
            fontSize: 13,
            color: _slate900,
          ),
        ),
        actions: [
          IconButton(
            tooltip: 'Refresh',
            icon: const Icon(Icons.refresh, color: _slate700),
            onPressed: _refresh,
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(56),
          child: Container(
            color: Colors.white,
            padding: const EdgeInsets.fromLTRB(12, 0, 12, 8),
            child: SizedBox(
              height: 40,
              child: TextField(
                controller: _searchController,
                style: const TextStyle(
                  fontFamily: 'monospace',
                  fontSize: 13,
                  color: _slate900,
                ),
                decoration: InputDecoration(
                  isDense: true,
                  filled: true,
                  fillColor: _slate50,
                  hintText: 'FILTER BY SKU / NAME / MATERIAL…',
                  hintStyle: const TextStyle(
                    fontFamily: 'monospace',
                    fontSize: 12,
                    color: _slate500,
                    letterSpacing: 1,
                  ),
                  prefixIcon: const Icon(Icons.search, size: 18, color: _slate500),
                  suffixIcon: _query.isEmpty
                      ? null
                      : IconButton(
                          icon: const Icon(Icons.close, size: 16, color: _slate500),
                          onPressed: () => _searchController.clear(),
                        ),
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 8,
                  ),
                  border: const OutlineInputBorder(
                    borderRadius: BorderRadius.zero,
                    borderSide: BorderSide(color: _slate200, width: 1),
                  ),
                  enabledBorder: const OutlineInputBorder(
                    borderRadius: BorderRadius.zero,
                    borderSide: BorderSide(color: _slate200, width: 1),
                  ),
                  focusedBorder: const OutlineInputBorder(
                    borderRadius: BorderRadius.zero,
                    borderSide: BorderSide(color: _emerald700, width: 1),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
      body: FutureBuilder<List<Product>>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const Center(
              child: CircularProgressIndicator(
                strokeWidth: 2,
                color: _emerald700,
              ),
            );
          }
          if (snapshot.hasError) {
            return _ErrorState(
              message: snapshot.error.toString(),
              onRetry: _refresh,
            );
          }
          final products = snapshot.data ?? const <Product>[];
          final rows = _flattenAndFilter(products);
          return Column(
            children: [
              _StatusBar(
                visible: rows.length,
                total: products.fold<int>(
                  0,
                  (sum, p) => sum + p.variants.length,
                ),
                productCount: products.length,
              ),
              Expanded(
                child: rows.isEmpty
                    ? const _EmptyState()
                    : _CatalogTable(rows: rows),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _StatusBar extends StatelessWidget {
  const _StatusBar({
    required this.visible,
    required this.total,
    required this.productCount,
  });
  final int visible;
  final int total;
  final int productCount;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: _slate200, width: 1)),
      ),
      child: Text(
        'SHOWING $visible OF $total VARIANTS · $productCount PRODUCTS',
        style: const TextStyle(
          fontFamily: 'monospace',
          fontSize: 11,
          letterSpacing: 1.4,
          color: _slate700,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}

class _CatalogTable extends StatelessWidget {
  const _CatalogTable({required this.rows});
  final List<_Row> rows;

  static const _headerStyle = TextStyle(
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: FontWeight.w700,
    color: _slate900,
    letterSpacing: 1.2,
  );
  static const _cellStyle = TextStyle(
    fontFamily: 'monospace',
    fontSize: 12,
    color: _slate900,
  );
  static const _mutedCellStyle = TextStyle(
    fontFamily: 'monospace',
    fontSize: 12,
    color: _slate500,
  );

  String _formatPrice(double? usd) {
    if (usd == null || usd <= 0) return '—';
    return 'USD ${usd.toStringAsFixed(2)}';
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      // Vertical scroll for tall tables.
      scrollDirection: Axis.vertical,
      child: SingleChildScrollView(
        // Horizontal scroll so dense variant columns can be panned on
        // a small warehouse phone screen.
        scrollDirection: Axis.horizontal,
        child: Container(
          color: Colors.white,
          margin: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.white,
            border: Border.all(color: _slate200, width: 1),
            borderRadius: BorderRadius.zero,
          ),
          child: DataTable(
            headingRowColor: WidgetStateProperty.all(_slate100),
            headingRowHeight: 32,
            dataRowMinHeight: 28,
            dataRowMaxHeight: 32,
            columnSpacing: 24,
            horizontalMargin: 12,
            showCheckboxColumn: false,
            dividerThickness: 1,
            dataTextStyle: _cellStyle,
            headingTextStyle: _headerStyle,
            border: TableBorder(
              horizontalInside: BorderSide(color: _slate200.withOpacity(0.7)),
            ),
            columns: const [
              DataColumn(label: Text('SKU')),
              DataColumn(label: Text('NAME')),
              DataColumn(label: Text('MATERIAL')),
              DataColumn(label: Text('HARDNESS')),
              DataColumn(label: Text('TEMP')),
              DataColumn(label: Text('DIMENSIONS')),
              DataColumn(label: Text('MOQ'), numeric: true),
              DataColumn(label: Text('BASE PRICE'), numeric: true),
            ],
            rows: rows.map((row) {
              final v = row.variant;
              final p = row.product;
              final hardness =
                  v.lookupDimension(['hardness', 'shore', 'durometer']) ?? '—';
              final temp = v.lookupDimension(['temp']) ?? '—';
              final dims = v.dimensions.entries.take(2).map((e) {
                return '${e.key} ${e.value}';
              }).join(' · ');
              return DataRow(
                cells: [
                  DataCell(
                    SelectableText(
                      v.sku,
                      style: _cellStyle.copyWith(fontWeight: FontWeight.w700),
                    ),
                  ),
                  DataCell(
                    SizedBox(
                      width: 220,
                      child: Text(
                        p.name,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: _cellStyle,
                      ),
                    ),
                  ),
                  DataCell(Text(p.material, style: _cellStyle)),
                  DataCell(Text(hardness, style: _mutedCellStyle)),
                  DataCell(Text(temp, style: _mutedCellStyle)),
                  DataCell(
                    SizedBox(
                      width: 220,
                      child: Text(
                        dims.isEmpty ? '—' : dims,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: _mutedCellStyle,
                      ),
                    ),
                  ),
                  DataCell(
                    Text('${v.minimumOrderQuantity}', style: _cellStyle),
                  ),
                  DataCell(
                    Text(
                      _formatPrice(v.basePriceUsd),
                      style: _cellStyle.copyWith(fontWeight: FontWeight.w700),
                    ),
                  ),
                ],
              );
            }).toList(growable: false),
          ),
        ),
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState();

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Padding(
        padding: EdgeInsets.all(24),
        child: Text(
          'NO VARIANTS MATCH THIS FILTER',
          style: TextStyle(
            fontFamily: 'monospace',
            fontSize: 12,
            letterSpacing: 1.4,
            color: _slate500,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
    );
  }
}

class _ErrorState extends StatelessWidget {
  const _ErrorState({required this.message, required this.onRetry});
  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Container(
        margin: const EdgeInsets.all(24),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          border: Border.all(color: _slate200, width: 1),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'CATALOG FETCH FAILED',
              style: TextStyle(
                fontFamily: 'monospace',
                fontSize: 12,
                letterSpacing: 1.4,
                color: _slate900,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              message,
              style: const TextStyle(
                fontFamily: 'monospace',
                fontSize: 12,
                color: _slate700,
              ),
            ),
            const SizedBox(height: 12),
            Align(
              alignment: Alignment.centerRight,
              child: OutlinedButton(
                onPressed: onRetry,
                style: OutlinedButton.styleFrom(
                  foregroundColor: _emerald800,
                  side: const BorderSide(color: _emerald700),
                  shape: const RoundedRectangleBorder(
                    borderRadius: BorderRadius.zero,
                  ),
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 10,
                  ),
                ),
                child: const Text(
                  'RETRY',
                  style: TextStyle(
                    fontFamily: 'monospace',
                    fontWeight: FontWeight.w700,
                    letterSpacing: 1.4,
                    fontSize: 12,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
