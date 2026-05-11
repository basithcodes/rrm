import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'api_client.dart';

const apiBaseUrl = String.fromEnvironment(
  'API_BASE_URL',
  defaultValue: 'http://localhost:3000',
);

const _canvasColor = Color(0xFFF4EEDB);
const _surfaceColor = Color(0xFFFFFAEF);
const _lineColor = Color(0x33A88D5D);
const _inkColor = Color(0xFF173523);
const _mutedColor = Color(0xFF6A725A);
const _accentGreen = Color(0xFF2F7D3A);
const _accentDeep = Color(0xFF1C5428);
const _accentWarm = Color(0xFFF6D59E);
const _accentBerry = Color(0xFF94452E);
const _inkInverse = Color(0xFFFFFAEF);

const _allCategoriesLabel = 'All categories';
const _allMaterialsLabel = 'All materials';
const _maxComparedProducts = 3;

const _sortOptions = <Map<String, String>>[
  <String, String>{'value': 'relevance', 'label': 'Best match'},
  <String, String>{'value': 'name', 'label': 'Name A-Z'},
  <String, String>{'value': 'lead-time', 'label': 'Fastest lead time'},
  <String, String>{'value': 'variants', 'label': 'Most variants'},
];

const _rfqFieldLabels = <String>[
  'Company name',
  'Contact person',
  'Email and phone',
  'Country and delivery city',
  'Product or variant code',
  'Requested quantity',
  'Application details',
  'Drawing or sample reference',
];

const _rfqSteps = <String>[
  'Buyer submits one clean request with quantity, market, and fit details.',
  'Sales reviews the application and checks the matching product family or variant.',
  'Private pricing and cost logic stay inside the owner workspace before the quote is sent.',
];

const _rfqVisibilityRules = <String>[
  'Attach RFQ entries to a customer record and source channel.',
  'Store quantity, country, and variant detail for quote generation.',
  'Keep pricing and cost logic in the protected owner workflow.',
];

const _shoppingFlow = <Map<String, String>>[
  <String, String>{
    'title': 'Enter through a clear aisle',
    'detail': 'Start by category or market instead of forcing buyers to read every product card.',
  },
  <String, String>{
    'title': 'Shortlist with technical cues',
    'detail': 'Variant count, lead time, and material show up before the RFQ conversation starts.',
  },
  <String, String>{
    'title': 'Move directly into RFQ',
    'detail': 'Once buyers find the right family, the page keeps them one step away from a quote request.',
  },
];

const _publicNavigation = <_NavItem>[
  _NavItem('/', 'Home', Icons.home_outlined),
  _NavItem('/products', 'Catalog', Icons.storefront_outlined),
  _NavItem('/industries', 'Industries', Icons.grid_view_rounded),
  _NavItem('/rfq', 'RFQ', Icons.assignment_outlined),
  _NavItem('/owner-access', 'Owner access', Icons.lock_outline),
];

const _adminNavigation = <_NavItem>[
  _NavItem('/admin', 'Dashboard', Icons.dashboard_outlined),
  _NavItem('/admin/pricing', 'Pricing', Icons.price_change_outlined),
  _NavItem('/admin/costs', 'Costs', Icons.account_balance_wallet_outlined),
  _NavItem('/admin/sourcing', 'Sourcing', Icons.inventory_2_outlined),
  _NavItem('/admin/manufacturing', 'Manufacturing', Icons.precision_manufacturing_outlined),
  _NavItem('/admin/competitors', 'Competitors', Icons.bar_chart_outlined),
  _NavItem('/admin/imports', 'Imports', Icons.upload_file_outlined),
];

const _publicSurfaceNavigation = <_NavItem>[
  _NavItem('/products', 'Public catalog', Icons.storefront_outlined),
  _NavItem('/rfq', 'RFQ surface', Icons.assignment_outlined),
];

void _replaceRoute(BuildContext context, String route) {
  Navigator.of(context).pushReplacementNamed(route);
}

void _pushRoute(BuildContext context, String route) {
  Navigator.of(context).pushNamed(route);
}

bool _isSelectedPath(String currentPath, String targetPath) {
  if (targetPath == '/') {
    return currentPath == '/';
  }

  return currentPath == targetPath || currentPath.startsWith('$targetPath/');
}

int _columnsForWidth(
  double width, {
  int phone = 1,
  int tablet = 2,
  int desktop = 3,
  int wide = 4,
}) {
  if (width >= 1400) {
    return wide;
  }

  if (width >= 1000) {
    return desktop;
  }

  if (width >= 640) {
    return tablet;
  }

  return phone;
}

double _itemWidth(double width, int columns, {double spacing = 16}) {
  if (columns <= 1) {
    return width;
  }

  return (width - (spacing * (columns - 1))) / columns;
}

String _joinValues(dynamic value, {int? limit}) {
  final items = asStringList(value);

  if (items.isEmpty) {
    return 'Not available';
  }

  if (limit != null && items.length > limit) {
    return items.take(limit).join(', ');
  }

  return items.join(', ');
}

String _formatCurrency(dynamic amount, String currency) {
  final numericAmount = amount is num ? amount.toDouble() : double.tryParse(amount.toString()) ?? 0;
  final decimals = currency == 'OMR' ? 3 : 2;

  const prefixes = <String, String>{
    'AED': 'AED ',
    'SAR': 'SAR ',
    'OMR': 'OMR ',
    'QAR': 'QAR ',
    'USD': r'$',
  };

  return '${prefixes[currency] ?? '$currency '}${numericAmount.toStringAsFixed(decimals)}';
}

double _sumField(Iterable<JsonMap> entries, String key) {
  return entries.fold<double>(0, (sum, entry) => sum + readDouble(entry, key));
}

Map<String, JsonMap> _ownerRecordsBySlug(JsonMap workspace) {
  return <String, JsonMap>{
    for (final record in asJsonMapList(workspace['ownerProductRecords']))
      readString(record, 'slug'): record,
  };
}

double _relevanceScore(JsonMap product, String query) {
  if (query.isEmpty) {
    return 0;
  }

  var score = 0.0;
  final name = readString(product, 'name').toLowerCase();
  final material = readString(product, 'material').toLowerCase();
  final category = readString(product, 'category').toLowerCase();

  if (name.contains(query)) {
    score += 120;
  }

  if (material.contains(query)) {
    score += 75;
  }

  if (category.contains(query)) {
    score += 60;
  }

  for (final application in asStringList(product['applications'])) {
    if (application.toLowerCase().contains(query)) {
      score += 32;
    }
  }

  for (final industry in asStringList(product['industries'])) {
    if (industry.toLowerCase().contains(query)) {
      score += 26;
    }
  }

  for (final variant in asJsonMapList(product['variants'])) {
    if (readString(variant, 'code').toLowerCase().contains(query)) {
      score += 90;
    }

    if (readString(variant, 'description').toLowerCase().contains(query)) {
      score += 28;
    }

    for (final dimension in asJsonMapList(variant['dimensions'])) {
      final value = '${readString(dimension, 'label')} ${readString(dimension, 'value')}'.toLowerCase();
      if (value.contains(query)) {
        score += 18;
      }
    }
  }

  return score;
}

bool _matchesSearch(JsonMap product, String query) {
  if (query.isEmpty) {
    return true;
  }

  final haystack = <String>[
    readString(product, 'name'),
    readString(product, 'category'),
    readString(product, 'material'),
    readString(product, 'summary'),
    readString(product, 'description'),
    ...asStringList(product['applications']),
    ...asStringList(product['industries']),
    ...asStringList(product['features']),
    ...asStringList(product['certifications']),
    ...asStringList(product['supplyFormats']),
    for (final variant in asJsonMapList(product['variants'])) ...<String>[
      readString(variant, 'code'),
      readString(variant, 'description'),
      for (final dimension in asJsonMapList(variant['dimensions']))
        '${readString(dimension, 'label')} ${readString(dimension, 'value')}',
    ],
  ].join(' ').toLowerCase();

  return haystack.contains(query);
}

List<JsonMap> _sortCatalogProducts(List<JsonMap> products, String sortValue, String query) {
  final nextProducts = List<JsonMap>.from(products);

  nextProducts.sort((left, right) {
    switch (sortValue) {
      case 'name':
        return readString(left, 'name').compareTo(readString(right, 'name'));
      case 'lead-time':
        return readInt(left, 'standardLeadTimeDays').compareTo(readInt(right, 'standardLeadTimeDays'));
      case 'variants':
        return readInt(right, 'variantCount').compareTo(readInt(left, 'variantCount'));
      case 'relevance':
      default:
        return _relevanceScore(right, query).compareTo(_relevanceScore(left, query));
    }
  });

  return nextProducts;
}

List<JsonMap> _buildCatalogAisles(List<JsonMap> products) {
  final productCounts = <String, int>{};
  final variantCounts = <String, int>{};
  final fastestLeadTimes = <String, int>{};
  final materialSets = <String, Set<String>>{};

  for (final product in products) {
    final category = readString(product, 'category');

    productCounts[category] = (productCounts[category] ?? 0) + 1;
    variantCounts[category] = (variantCounts[category] ?? 0) + asJsonMapList(product['variants']).length;

    final currentLeadTime = fastestLeadTimes[category];
    final nextLeadTime = readInt(product, 'standardLeadTimeDays');
    fastestLeadTimes[category] = currentLeadTime == null
        ? nextLeadTime
        : nextLeadTime < currentLeadTime
            ? nextLeadTime
            : currentLeadTime;

    materialSets.putIfAbsent(category, () => <String>{}).add(readString(product, 'material'));
  }

  final aisles = productCounts.keys
      .map(
        (category) => <String, dynamic>{
          'category': category,
          'productCount': productCounts[category] ?? 0,
          'variantCount': variantCounts[category] ?? 0,
          'fastestLeadTime': fastestLeadTimes[category] ?? 0,
          'materials': materialSets[category]?.take(2).toList(growable: false) ?? const <String>[],
        },
      )
      .toList(growable: false);

  aisles.sort(
    (left, right) => readInt(right, 'productCount').compareTo(readInt(left, 'productCount')),
  );

  return aisles;
}

Map<String, String> _buildCatalogViewQueryParameters({
  required String query,
  required String category,
  required String material,
  required String sortValue,
  required List<String> compareSlugs,
}) {
  final params = <String, String>{};
  final trimmedQuery = query.trim();

  if (trimmedQuery.isNotEmpty) {
    params['q'] = trimmedQuery;
  }

  if (category != _allCategoriesLabel) {
    params['category'] = category;
  }

  if (material != _allMaterialsLabel) {
    params['material'] = material;
  }

  if (sortValue != 'relevance') {
    params['sort'] = sortValue;
  }

  if (compareSlugs.isNotEmpty) {
    params['compare'] = compareSlugs.join(',');
  }

  return params;
}

class _NavItem {
  const _NavItem(this.route, this.label, this.icon);

  final String route;
  final String label;
  final IconData icon;
}

class RrmFlutterApp extends StatefulWidget {
  const RrmFlutterApp({super.key});

  @override
  State<RrmFlutterApp> createState() => _RrmFlutterAppState();
}

class _RrmFlutterAppState extends State<RrmFlutterApp> {
  late final RrmApiClient _api = RrmApiClient(baseUrl: apiBaseUrl);

  @override
  Widget build(BuildContext context) {
    final baseTheme = ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: _accentGreen,
        brightness: Brightness.light,
        primary: _accentGreen,
        secondary: _accentWarm,
        surface: _surfaceColor,
      ),
      scaffoldBackgroundColor: _canvasColor,
    );

    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'RRM Flutter Frontend',
      theme: baseTheme.copyWith(
        textTheme: baseTheme.textTheme.copyWith(
          displaySmall: const TextStyle(
            fontFamily: 'Georgia',
            fontWeight: FontWeight.w700,
            color: _inkColor,
            height: 1.02,
          ),
          headlineMedium: const TextStyle(
            fontFamily: 'Georgia',
            fontWeight: FontWeight.w700,
            color: _inkColor,
            height: 1.08,
          ),
          headlineSmall: const TextStyle(
            fontFamily: 'Georgia',
            fontWeight: FontWeight.w700,
            color: _inkColor,
          ),
          titleLarge: const TextStyle(
            fontFamily: 'Georgia',
            fontWeight: FontWeight.w700,
            color: _inkColor,
          ),
          bodyLarge: const TextStyle(color: _mutedColor, height: 1.5),
          bodyMedium: const TextStyle(color: _mutedColor, height: 1.5),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: Colors.white.withOpacity(0.78),
          contentPadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(20),
            borderSide: const BorderSide(color: _lineColor),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(20),
            borderSide: const BorderSide(color: _lineColor),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(20),
            borderSide: const BorderSide(color: _accentGreen, width: 1.4),
          ),
        ),
        filledButtonTheme: FilledButtonThemeData(
          style: FilledButton.styleFrom(
            backgroundColor: _accentGreen,
            foregroundColor: _inkInverse,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
            padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 16),
            textStyle: const TextStyle(fontWeight: FontWeight.w700),
          ),
        ),
        outlinedButtonTheme: OutlinedButtonThemeData(
          style: OutlinedButton.styleFrom(
            foregroundColor: _inkColor,
            side: const BorderSide(color: _lineColor),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
            padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 16),
            textStyle: const TextStyle(fontWeight: FontWeight.w700),
          ),
        ),
      ),
      onGenerateRoute: _buildRoute,
      initialRoute: '/',
    );
  }

  Route<dynamic> _buildRoute(RouteSettings settings) {
    final uri = Uri.parse(settings.name ?? '/');

    if (uri.pathSegments.length == 2 && uri.pathSegments.first == 'products') {
      return MaterialPageRoute<void>(
        settings: settings,
        builder: (context) => PublicShell(
          currentPath: uri.path,
          child: ProductDetailScreen(api: _api, slug: uri.pathSegments[1]),
        ),
      );
    }

    if (uri.path == '/admin' || uri.path.startsWith('/admin/')) {
      return MaterialPageRoute<void>(
        settings: settings,
        builder: (context) => AdminRouteScreen(api: _api, currentPath: uri.path),
      );
    }

    switch (uri.path) {
      case '/':
        return MaterialPageRoute<void>(
          settings: settings,
          builder: (context) => PublicShell(
            currentPath: uri.path,
            child: HomeScreen(api: _api),
          ),
        );
      case '/products':
        return MaterialPageRoute<void>(
          settings: settings,
          builder: (context) => PublicShell(
            currentPath: uri.path,
            child: ProductsScreen(api: _api, initialUri: uri),
          ),
        );
      case '/industries':
        return MaterialPageRoute<void>(
          settings: settings,
          builder: (context) => PublicShell(
            currentPath: uri.path,
            child: IndustriesScreen(api: _api),
          ),
        );
      case '/rfq':
        return MaterialPageRoute<void>(
          settings: settings,
          builder: (context) => PublicShell(
            currentPath: uri.path,
            child: RfqScreen(api: _api),
          ),
        );
      case '/owner-access':
        return MaterialPageRoute<void>(
          settings: settings,
          builder: (context) => PublicShell(
            currentPath: uri.path,
            child: OwnerAccessScreen(api: _api),
          ),
        );
      default:
        return MaterialPageRoute<void>(
          settings: settings,
          builder: (context) => PublicShell(
            currentPath: '/',
            child: const NotFoundScreen(),
          ),
        );
    }
  }
}

class SurfacePanel extends StatelessWidget {
  const SurfacePanel({
    required this.child,
    super.key,
    this.padding = const EdgeInsets.all(24),
    this.dark = false,
  });

  final Widget child;
  final EdgeInsetsGeometry padding;
  final bool dark;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: padding,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(30),
        border: Border.all(color: dark ? Colors.white.withOpacity(0.08) : _lineColor),
        gradient: dark
            ? const LinearGradient(
                colors: <Color>[_inkColor, _accentDeep],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              )
            : LinearGradient(
                colors: <Color>[
                  Colors.white.withOpacity(0.88),
                  const Color(0xFFF4E5C0).withOpacity(0.72),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
        boxShadow: <BoxShadow>[
          BoxShadow(
            color: _inkColor.withOpacity(dark ? 0.25 : 0.08),
            blurRadius: 40,
            offset: const Offset(0, 18),
          ),
        ],
      ),
      child: child,
    );
  }
}

class ResponsiveWrap extends StatelessWidget {
  const ResponsiveWrap({
    required this.children,
    super.key,
    this.phone = 1,
    this.tablet = 2,
    this.desktop = 3,
    this.wide = 4,
    this.spacing = 16,
    this.runSpacing = 16,
  });

  final List<Widget> children;
  final int phone;
  final int tablet;
  final int desktop;
  final int wide;
  final double spacing;
  final double runSpacing;

  @override
  Widget build(BuildContext context) {
    if (children.isEmpty) {
      return const SizedBox.shrink();
    }

    return LayoutBuilder(
      builder: (context, constraints) {
        final columns = _columnsForWidth(
          constraints.maxWidth,
          phone: phone,
          tablet: tablet,
          desktop: desktop,
          wide: wide,
        );
        final itemWidth = _itemWidth(constraints.maxWidth, columns, spacing: spacing);

        return Wrap(
          spacing: spacing,
          runSpacing: runSpacing,
          children: children
              .map((child) => SizedBox(width: itemWidth, child: child))
              .toList(growable: false),
        );
      },
    );
  }
}

class PillChip extends StatelessWidget {
  const PillChip({
    required this.label,
    super.key,
    this.dark = false,
    this.warm = false,
  });

  final String label;
  final bool dark;
  final bool warm;

  @override
  Widget build(BuildContext context) {
    final backgroundColor = dark
        ? Colors.white.withOpacity(0.12)
        : warm
            ? _accentWarm.withOpacity(0.72)
            : Colors.white.withOpacity(0.76);
    final foregroundColor = dark ? _inkInverse : warm ? _accentBerry : _inkColor;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: dark ? Colors.white.withOpacity(0.12) : _lineColor),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: foregroundColor,
          fontWeight: FontWeight.w700,
          fontSize: 12,
          letterSpacing: 0.2,
        ),
      ),
    );
  }
}

class SectionHeading extends StatelessWidget {
  const SectionHeading({
    required this.eyebrow,
    required this.title,
    super.key,
    this.description,
    this.dark = false,
  });

  final String eyebrow;
  final String title;
  final String? description;
  final bool dark;

  @override
  Widget build(BuildContext context) {
    final foreground = dark ? _inkInverse : _inkColor;
    final muted = dark ? Colors.white.withOpacity(0.72) : _mutedColor;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Text(
          eyebrow,
          style: TextStyle(
            color: dark ? Colors.white.withOpacity(0.62) : _accentDeep,
            fontSize: 12,
            fontWeight: FontWeight.w800,
            letterSpacing: 1.8,
          ),
        ),
        const SizedBox(height: 12),
        Text(
          title,
          style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                color: foreground,
              ),
        ),
        if (description != null) ...<Widget>[
          const SizedBox(height: 12),
          Text(
            description!,
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: muted),
          ),
        ],
      ],
    );
  }
}

class MetricCard extends StatelessWidget {
  const MetricCard({
    required this.label,
    required this.value,
    super.key,
    this.dark = false,
  });

  final String label;
  final String value;
  final bool dark;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(22),
        color: dark ? Colors.white.withOpacity(0.08) : Colors.white.withOpacity(0.76),
        border: Border.all(color: dark ? Colors.white.withOpacity(0.08) : _lineColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text(
            label,
            style: TextStyle(
              color: dark ? Colors.white.withOpacity(0.58) : _mutedColor,
              fontSize: 11,
              fontWeight: FontWeight.w800,
              letterSpacing: 1.5,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            value,
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  color: dark ? _accentWarm : _inkColor,
                ),
          ),
        ],
      ),
    );
  }
}

class LoadingView extends StatelessWidget {
  const LoadingView({super.key, this.message = 'Loading...'});

  final String message;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: SurfacePanel(
        padding: const EdgeInsets.all(28),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            const SizedBox(
              height: 28,
              width: 28,
              child: CircularProgressIndicator(strokeWidth: 2.4),
            ),
            const SizedBox(height: 16),
            Text(message, style: Theme.of(context).textTheme.bodyLarge),
          ],
        ),
      ),
    );
  }
}

class MessageCard extends StatelessWidget {
  const MessageCard({
    required this.title,
    required this.message,
    super.key,
    this.actionLabel,
    this.onAction,
    this.dark = false,
  });

  final String title;
  final String message;
  final String? actionLabel;
  final VoidCallback? onAction;
  final bool dark;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 640),
        child: SurfacePanel(
          dark: dark,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              SectionHeading(
                eyebrow: dark ? 'Attention' : 'Status',
                title: title,
                description: message,
                dark: dark,
              ),
              if (actionLabel != null && onAction != null) ...<Widget>[
                const SizedBox(height: 18),
                FilledButton(onPressed: onAction, child: Text(actionLabel!)),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class NavigationChip extends StatelessWidget {
  const NavigationChip({
    required this.label,
    required this.icon,
    required this.selected,
    required this.onTap,
    super.key,
    this.dark = false,
  });

  final String label;
  final IconData icon;
  final bool selected;
  final VoidCallback onTap;
  final bool dark;

  @override
  Widget build(BuildContext context) {
    final backgroundColor = selected
        ? dark
            ? _accentWarm.withOpacity(0.2)
            : _accentGreen.withOpacity(0.12)
        : Colors.transparent;
    final foregroundColor = selected
        ? dark
            ? _accentWarm
            : _accentDeep
        : dark
            ? Colors.white.withOpacity(0.74)
            : _inkColor;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(999),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(999),
          color: backgroundColor,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            Icon(icon, size: 18, color: foregroundColor),
            const SizedBox(width: 10),
            Text(
              label,
              style: TextStyle(
                color: foregroundColor,
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class PublicShell extends StatelessWidget {
  const PublicShell({
    required this.currentPath,
    required this.child,
    super.key,
  });

  final String currentPath;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: DecoratedBox(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: <Color>[
              _canvasColor,
              Color(0xFFF7EBD0),
              Color(0xFFE3F1CF),
            ],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: SafeArea(
          child: Column(
            children: <Widget>[
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 12),
                child: SurfacePanel(
                  padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 18),
                  child: LayoutBuilder(
                    builder: (context, constraints) {
                      final compact = constraints.maxWidth < 960;
                      final nav = Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: _publicNavigation
                            .map(
                              (item) => NavigationChip(
                                label: item.label,
                                icon: item.icon,
                                selected: _isSelectedPath(currentPath, item.route),
                                onTap: () => _replaceRoute(context, item.route),
                              ),
                            )
                            .toList(growable: false),
                      );

                      final brand = Row(
                        mainAxisSize: MainAxisSize.min,
                        children: <Widget>[
                          Container(
                            height: 52,
                            width: 52,
                            decoration: const BoxDecoration(
                              shape: BoxShape.circle,
                              gradient: LinearGradient(
                                colors: <Color>[_accentGreen, _accentDeep],
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                              ),
                            ),
                            alignment: Alignment.center,
                            child: const Text(
                              'RRM',
                              style: TextStyle(color: _inkInverse, fontWeight: FontWeight.w800),
                            ),
                          ),
                          const SizedBox(width: 14),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: const <Widget>[
                              Text(
                                'RRM Industrial Rubber',
                                style: TextStyle(fontWeight: FontWeight.w800, color: _inkColor),
                              ),
                              SizedBox(height: 4),
                              Text(
                                'Vegetable-store clarity for industrial buyers',
                                style: TextStyle(color: _mutedColor, fontSize: 12),
                              ),
                            ],
                          ),
                        ],
                      );

                      final cta = FilledButton(
                        onPressed: () => _replaceRoute(context, '/rfq'),
                        child: const Text('Start an RFQ'),
                      );

                      if (compact) {
                        return Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: <Widget>[
                            brand,
                            const SizedBox(height: 18),
                            nav,
                            const SizedBox(height: 18),
                            cta,
                          ],
                        );
                      }

                      return Row(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: <Widget>[
                          Expanded(flex: 4, child: brand),
                          Expanded(flex: 5, child: nav),
                          Align(alignment: Alignment.centerRight, child: cta),
                        ],
                      );
                    },
                  ),
                ),
              ),
              Expanded(child: child),
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
                child: SurfacePanel(
                  padding: const EdgeInsets.all(22),
                  child: LayoutBuilder(
                    builder: (context, constraints) {
                      final compact = constraints.maxWidth < 900;
                      final content = <Widget>[
                        const Text(
                          'Public shelves stay focused on product fit, dimensions, and RFQ flow. Pricing, chemistry, and competitive notes remain in the owner workspace.',
                          style: TextStyle(color: _mutedColor, height: 1.6),
                        ),
                        const SizedBox(height: 14),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: const <Widget>[
                            PillChip(label: '5 currencies'),
                            PillChip(label: '3D-ready products'),
                            PillChip(label: 'Owner-only cost logic', warm: true),
                          ],
                        ),
                      ];

                      if (compact) {
                        return Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: content,
                        );
                      }

                      return Row(
                        children: <Widget>[
                          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: content)),
                          OutlinedButton(
                            onPressed: () => _replaceRoute(context, '/owner-access'),
                            child: const Text('Owner workspace'),
                          ),
                        ],
                      );
                    },
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class AdminShell extends StatelessWidget {
  const AdminShell({
    required this.currentPath,
    required this.child,
    required this.onSignOut,
    super.key,
  });

  final String currentPath;
  final Widget child;
  final VoidCallback onSignOut;

  @override
  Widget build(BuildContext context) {
    Widget buildSideNav() {
      return SurfacePanel(
        dark: true,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Row(
              children: <Widget>[
                Container(
                  height: 56,
                  width: 56,
                  decoration: const BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: LinearGradient(
                      colors: <Color>[_accentGreen, _accentDeep],
                    ),
                  ),
                  alignment: Alignment.center,
                  child: const Text(
                    'RRM',
                    style: TextStyle(color: _inkInverse, fontWeight: FontWeight.w800),
                  ),
                ),
                const SizedBox(width: 14),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    const Text(
                      'Owner workspace',
                      style: TextStyle(color: _inkInverse, fontWeight: FontWeight.w800),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Private market board',
                      style: TextStyle(color: Colors.white.withOpacity(0.58), fontSize: 12),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 24),
            const SectionHeading(
              eyebrow: 'Owner workspace',
              title: 'RRM Control Room',
              description: 'Pricing, sourcing, manufacturing, imports, and competitor intelligence stay in the back-room ledger.',
              dark: true,
            ),
            const SizedBox(height: 18),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: const <Widget>[
                PillChip(label: 'Secure session', dark: true),
                PillChip(label: 'Owner only', dark: true),
              ],
            ),
            const SizedBox(height: 24),
            Text(
              'Owner data',
              style: TextStyle(
                color: Colors.white.withOpacity(0.46),
                fontSize: 12,
                fontWeight: FontWeight.w800,
                letterSpacing: 1.6,
              ),
            ),
            const SizedBox(height: 10),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _adminNavigation
                  .map(
                    (item) => NavigationChip(
                      label: item.label,
                      icon: item.icon,
                      selected: _isSelectedPath(currentPath, item.route),
                      onTap: () => _replaceRoute(context, item.route),
                      dark: true,
                    ),
                  )
                  .toList(growable: false),
            ),
            const SizedBox(height: 24),
            Text(
              'Public surfaces',
              style: TextStyle(
                color: Colors.white.withOpacity(0.46),
                fontSize: 12,
                fontWeight: FontWeight.w800,
                letterSpacing: 1.6,
              ),
            ),
            const SizedBox(height: 10),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _publicSurfaceNavigation
                  .map(
                    (item) => NavigationChip(
                      label: item.label,
                      icon: item.icon,
                      selected: false,
                      onTap: () => _replaceRoute(context, item.route),
                      dark: true,
                    ),
                  )
                  .toList(growable: false),
            ),
            const SizedBox(height: 24),
            OutlinedButton(
              onPressed: onSignOut,
              style: OutlinedButton.styleFrom(
                foregroundColor: _inkInverse,
                side: BorderSide(color: Colors.white.withOpacity(0.14)),
              ),
              child: const Text('Sign out'),
            ),
          ],
        ),
      );
    }

    return Scaffold(
      body: DecoratedBox(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: <Color>[
              Color(0xFF0B1710),
              Color(0xFF14251B),
              Color(0xFF203826),
            ],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: LayoutBuilder(
              builder: (context, constraints) {
                final compact = constraints.maxWidth < 1100;

                final mainPanel = SurfacePanel(
                  dark: true,
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Wrap(
                        spacing: 12,
                        runSpacing: 12,
                        alignment: WrapAlignment.spaceBetween,
                        children: <Widget>[
                          const SizedBox(
                            width: 560,
                            child: SectionHeading(
                              eyebrow: 'Owner operations',
                              title: 'Private modules styled to match the migrated storefront.',
                              description: 'Flutter now covers the protected pricing, sourcing, manufacturing, competitor, and import surfaces against the same backend data.',
                              dark: true,
                            ),
                          ),
                          Wrap(
                            spacing: 10,
                            runSpacing: 10,
                            children: <Widget>[
                              OutlinedButton(
                                onPressed: () => _replaceRoute(context, '/products'),
                                style: OutlinedButton.styleFrom(
                                  foregroundColor: _inkInverse,
                                  side: BorderSide(color: Colors.white.withOpacity(0.14)),
                                ),
                                child: const Text('View public catalog'),
                              ),
                              FilledButton(
                                onPressed: () => _replaceRoute(context, '/admin/imports'),
                                child: const Text('Import catalog data'),
                              ),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 22),
                      Expanded(child: child),
                    ],
                  ),
                );

                if (compact) {
                  return Column(
                    children: <Widget>[
                      buildSideNav(),
                      const SizedBox(height: 18),
                      Expanded(child: mainPanel),
                    ],
                  );
                }

                return Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    SizedBox(width: 320, child: buildSideNav()),
                    const SizedBox(width: 18),
                    Expanded(child: mainPanel),
                  ],
                );
              },
            ),
          ),
        ),
      ),
    );
  }
}

class HomeScreen extends StatelessWidget {
  const HomeScreen({required this.api, super.key});

  final RrmApiClient api;

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<dynamic>>(
      future: Future.wait<dynamic>(<Future<dynamic>>[
        api.fetchPublicBootstrap(),
        api.fetchCatalog(),
      ]),
      builder: (context, snapshot) {
        if (snapshot.connectionState != ConnectionState.done) {
          return const LoadingView(message: 'Loading the storefront...');
        }

        if (snapshot.hasError) {
          return MessageCard(
            title: 'Unable to load the storefront',
            message: snapshot.error.toString(),
            actionLabel: 'Retry',
            onAction: () => _replaceRoute(context, '/'),
          );
        }

        final bootstrap = snapshot.requireData[0] as JsonMap;
        final products = snapshot.requireData[1] as List<JsonMap>;
        final featuredProducts = asJsonMapList(bootstrap['featuredProducts']);
        final markets = asJsonMapList(bootstrap['markets']);
        final qualityPillars = asJsonMapList(bootstrap['qualityPillars']);
        final customerSegments = asJsonMapList(bootstrap['customerSegments']);
        final industries = asJsonMapList(bootstrap['industrySolutions']);
        final catalogAisles = _buildCatalogAisles(products).take(4).toList(growable: false);
        final totalVariants = products.fold<int>(
          0,
          (sum, product) => sum + asJsonMapList(product['variants']).length,
        );

        return ListView(
          padding: const EdgeInsets.fromLTRB(20, 4, 20, 24),
          children: <Widget>[
            SurfacePanel(
              padding: const EdgeInsets.all(28),
              child: LayoutBuilder(
                builder: (context, constraints) {
                  final wide = constraints.maxWidth >= 1000;

                  final left = Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      const Text(
                        'VEGETABLE-STORE CLARITY, INDUSTRIAL-GRADE CATALOG',
                        style: TextStyle(
                          color: _accentDeep,
                          fontSize: 12,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 1.8,
                        ),
                      ),
                      const SizedBox(height: 18),
                      Text(
                        'A fresh-market storefront for thousands of rubber products and fast RFQs.',
                        style: Theme.of(context).textTheme.displaySmall,
                      ),
                      const SizedBox(height: 18),
                      Text(
                        'The layout takes its cues from a premium produce hall: clean aisles, visible grades, quick selection, and no clutter. Buyers move from category to dimension to quote request without losing context.',
                        style: Theme.of(context).textTheme.bodyLarge,
                      ),
                      const SizedBox(height: 20),
                      Wrap(
                        spacing: 10,
                        runSpacing: 10,
                        children: <Widget>[
                          FilledButton(
                            onPressed: () => _replaceRoute(context, '/products'),
                            child: const Text('Explore the catalog'),
                          ),
                          OutlinedButton(
                            onPressed: () => _replaceRoute(context, '/rfq'),
                            child: const Text('Start an order sheet'),
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),
                      ResponsiveWrap(
                        phone: 2,
                        tablet: 2,
                        desktop: 4,
                        wide: 4,
                        children: <Widget>[
                          MetricCard(label: 'Product families', value: '${products.length}'),
                          MetricCard(label: 'Variant sizes', value: '$totalVariants'),
                          MetricCard(label: 'Markets', value: '${markets.length}'),
                          const MetricCard(label: 'Tracked currencies', value: '5'),
                        ],
                      ),
                    ],
                  );

                  final right = Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      SurfacePanel(
                        dark: true,
                        padding: const EdgeInsets.all(22),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: <Widget>[
                            Text(
                              'TODAY ON THE BOARD',
                              style: TextStyle(
                                color: Colors.white.withOpacity(0.58),
                                fontSize: 12,
                                fontWeight: FontWeight.w800,
                                letterSpacing: 1.8,
                              ),
                            ),
                            const SizedBox(height: 18),
                            ...featuredProducts.take(3).map(
                              (product) => Padding(
                                padding: const EdgeInsets.only(bottom: 14),
                                child: Container(
                                  padding: const EdgeInsets.all(16),
                                  decoration: BoxDecoration(
                                    color: Colors.white.withOpacity(0.08),
                                    borderRadius: BorderRadius.circular(20),
                                    border: Border.all(color: Colors.white.withOpacity(0.08)),
                                  ),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: <Widget>[
                                      Row(
                                        children: <Widget>[
                                          Expanded(
                                            child: Text(
                                              readString(product, 'name'),
                                              style: const TextStyle(
                                                color: _inkInverse,
                                                fontWeight: FontWeight.w800,
                                              ),
                                            ),
                                          ),
                                          PillChip(
                                            label: readString(product, 'category'),
                                            dark: true,
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 8),
                                      Text(
                                        readString(product, 'summary'),
                                        style: TextStyle(color: Colors.white.withOpacity(0.72), height: 1.45),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),
                      ResponsiveWrap(
                        phone: 1,
                        tablet: 2,
                        desktop: 2,
                        wide: 2,
                        children: markets
                            .map(
                              (market) => SurfacePanel(
                                padding: const EdgeInsets.all(20),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: <Widget>[
                                    Text(
                                      readString(market, 'currency'),
                                      style: const TextStyle(
                                        color: _accentDeep,
                                        fontWeight: FontWeight.w800,
                                        letterSpacing: 1.4,
                                      ),
                                    ),
                                    const SizedBox(height: 10),
                                    Text(
                                      readString(market, 'name'),
                                      style: Theme.of(context).textTheme.titleLarge,
                                    ),
                                    const SizedBox(height: 8),
                                    Text(
                                      readString(market, 'serviceLevel'),
                                      style: Theme.of(context).textTheme.bodyMedium,
                                    ),
                                  ],
                                ),
                              ),
                            )
                            .toList(growable: false),
                      ),
                      const SizedBox(height: 16),
                      SurfacePanel(
                        padding: const EdgeInsets.all(22),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: <Widget>[
                            const Text(
                              'PROTECTED OWNER DATA',
                              style: TextStyle(
                                color: _accentBerry,
                                fontWeight: FontWeight.w800,
                                letterSpacing: 1.8,
                              ),
                            ),
                            const SizedBox(height: 12),
                            Text(
                              'Pricing, chemistry, and cost drivers stay on the operations side.',
                              style: Theme.of(context).textTheme.titleLarge,
                            ),
                            const SizedBox(height: 10),
                            Text(
                              'Public pages show product applications, dimensions, and 3D-ready media. Internal records track labor, utilities, warehouse rent, equipment, and compound know-how.',
                              style: Theme.of(context).textTheme.bodyMedium,
                            ),
                          ],
                        ),
                      ),
                    ],
                  );

                  if (wide) {
                    return Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        Expanded(flex: 11, child: left),
                        const SizedBox(width: 18),
                        Expanded(flex: 9, child: right),
                      ],
                    );
                  }

                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      left,
                      const SizedBox(height: 18),
                      right,
                    ],
                  );
                },
              ),
            ),
            const SizedBox(height: 22),
            ResponsiveWrap(
              phone: 1,
              tablet: 2,
              desktop: 4,
              wide: 4,
              children: qualityPillars
                  .map(
                    (pillar) => SurfacePanel(
                      padding: const EdgeInsets.all(22),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: <Widget>[
                          Text(
                            readString(pillar, 'metric'),
                            style: const TextStyle(
                              color: _mutedColor,
                              fontSize: 11,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 1.5,
                            ),
                          ),
                          const SizedBox(height: 12),
                          Text(
                            readString(pillar, 'title'),
                            style: Theme.of(context).textTheme.titleLarge,
                          ),
                          const SizedBox(height: 10),
                          Text(
                            readString(pillar, 'detail'),
                            style: Theme.of(context).textTheme.bodyMedium,
                          ),
                        ],
                      ),
                    ),
                  )
                  .toList(growable: false),
            ),
            const SizedBox(height: 22),
            LayoutBuilder(
              builder: (context, constraints) {
                final wide = constraints.maxWidth >= 1000;
                final left = SurfacePanel(
                  dark: true,
                  padding: const EdgeInsets.all(28),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Text(
                        'HOW LARGE CATALOGS STAY USABLE',
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.58),
                          fontSize: 12,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 1.8,
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'The public storefront now behaves more like an engineered supply counter.',
                        style: Theme.of(context).textTheme.headlineMedium?.copyWith(color: _inkInverse),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        'The best industrial catalogs are beautiful because they are legible. They put browse lanes, fast technical cues, and quote actions in front of the buyer before the page turns into a wall of cards.',
                        style: TextStyle(color: Colors.white.withOpacity(0.76), height: 1.6),
                      ),
                      const SizedBox(height: 18),
                      ..._shoppingFlow.asMap().entries.map(
                        (entry) => Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.08),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(color: Colors.white.withOpacity(0.08)),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: <Widget>[
                                Text(
                                  'STEP ${entry.key + 1}',
                                  style: TextStyle(
                                    color: Colors.white.withOpacity(0.58),
                                    fontSize: 11,
                                    fontWeight: FontWeight.w800,
                                    letterSpacing: 1.6,
                                  ),
                                ),
                                const SizedBox(height: 10),
                                Text(
                                  entry.value['title']!,
                                  style: const TextStyle(color: _inkInverse, fontWeight: FontWeight.w800),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  entry.value['detail']!,
                                  style: TextStyle(color: Colors.white.withOpacity(0.74), height: 1.5),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                );

                final right = ResponsiveWrap(
                  phone: 1,
                  tablet: 2,
                  desktop: 2,
                  wide: 2,
                  children: catalogAisles
                      .map(
                        (aisle) => SurfacePanel(
                          padding: const EdgeInsets.all(24),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: <Widget>[
                              Text(
                                '${readInt(aisle, 'productCount')} families',
                                style: const TextStyle(
                                  color: _mutedColor,
                                  fontSize: 11,
                                  fontWeight: FontWeight.w800,
                                  letterSpacing: 1.5,
                                ),
                              ),
                              const SizedBox(height: 12),
                              Text(
                                readString(aisle, 'category'),
                                style: Theme.of(context).textTheme.headlineSmall,
                              ),
                              const SizedBox(height: 14),
                              ResponsiveWrap(
                                phone: 2,
                                tablet: 2,
                                desktop: 2,
                                wide: 2,
                                children: <Widget>[
                                  MetricCard(
                                    label: 'Variant sizes',
                                    value: '${readInt(aisle, 'variantCount')}',
                                  ),
                                  MetricCard(
                                    label: 'Fastest lead time',
                                    value: '${readInt(aisle, 'fastestLeadTime')} days',
                                  ),
                                ],
                              ),
                              const SizedBox(height: 14),
                              Wrap(
                                spacing: 8,
                                runSpacing: 8,
                                children: asStringList(aisle['materials'])
                                    .map((material) => PillChip(label: material, warm: true))
                                    .toList(growable: false),
                              ),
                              const SizedBox(height: 16),
                              FilledButton(
                                onPressed: () => _replaceRoute(
                                  context,
                                  '/products?category=${Uri.encodeComponent(readString(aisle, 'category'))}',
                                ),
                                child: const Text('Open aisle'),
                              ),
                            ],
                          ),
                        ),
                      )
                      .toList(growable: false),
                );

                if (wide) {
                  return Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Expanded(flex: 8, child: left),
                      const SizedBox(width: 18),
                      Expanded(flex: 11, child: right),
                    ],
                  );
                }

                return Column(
                  children: <Widget>[
                    left,
                    const SizedBox(height: 18),
                    right,
                  ],
                );
              },
            ),
            const SizedBox(height: 22),
            SurfacePanel(
              padding: const EdgeInsets.all(28),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Row(
                    children: <Widget>[
                      Expanded(
                        child: SectionHeading(
                          eyebrow: 'Featured products',
                          title: 'Displayed like clean produce crates, specified like industrial parts.',
                          description: 'Public cards stay simple while the owner workspace keeps the deeper cost, sourcing, and benchmark records.',
                        ),
                      ),
                      TextButton(
                        onPressed: () => _replaceRoute(context, '/products'),
                        child: const Text('See full catalog'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 18),
                  ResponsiveWrap(
                    phone: 1,
                    tablet: 2,
                    desktop: 3,
                    wide: 3,
                    children: featuredProducts
                        .map(
                          (product) => CatalogProductCard(
                            product: product,
                            onOpenDetails: () => _pushRoute(context, '/products/${readString(product, 'slug')}'),
                          ),
                        )
                        .toList(growable: false),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 22),
            LayoutBuilder(
              builder: (context, constraints) {
                final wide = constraints.maxWidth >= 1000;
                final left = SurfacePanel(
                  padding: const EdgeInsets.all(28),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      const SectionHeading(
                        eyebrow: 'Who we sell to',
                        title: 'Customer routes that keep technical buyers oriented.',
                        description: 'The public flow stays quote-first, while the owner workspace holds the private price book and manufacturing data.',
                      ),
                      const SizedBox(height: 18),
                      ...customerSegments.map(
                        (segment) => Padding(
                          padding: const EdgeInsets.only(bottom: 14),
                          child: Container(
                            padding: const EdgeInsets.all(18),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.74),
                              borderRadius: BorderRadius.circular(22),
                              border: Border.all(color: _lineColor),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: <Widget>[
                                Text(
                                  readString(segment, 'title'),
                                  style: const TextStyle(color: _inkColor, fontWeight: FontWeight.w800),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  readString(segment, 'detail'),
                                  style: Theme.of(context).textTheme.bodyMedium,
                                ),
                                const SizedBox(height: 10),
                                Text(
                                  'Primary route: ${readString(segment, 'channel')}',
                                  style: const TextStyle(
                                    color: _accentDeep,
                                    fontSize: 12,
                                    fontWeight: FontWeight.w800,
                                    letterSpacing: 1.2,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                      FilledButton(
                        onPressed: () => _replaceRoute(context, '/rfq'),
                        child: const Text('Send a structured RFQ'),
                      ),
                    ],
                  ),
                );

                final right = ResponsiveWrap(
                  phone: 1,
                  tablet: 2,
                  desktop: 2,
                  wide: 2,
                  children: industries
                      .map(
                        (industry) => SurfacePanel(
                          padding: const EdgeInsets.all(22),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: <Widget>[
                              Text(
                                readString(industry, 'focus'),
                                style: const TextStyle(
                                  color: _mutedColor,
                                  fontSize: 11,
                                  fontWeight: FontWeight.w800,
                                  letterSpacing: 1.5,
                                ),
                              ),
                              const SizedBox(height: 12),
                              Text(
                                readString(industry, 'name'),
                                style: Theme.of(context).textTheme.titleLarge,
                              ),
                              const SizedBox(height: 10),
                              Text(
                                readString(industry, 'challenge'),
                                style: Theme.of(context).textTheme.bodyMedium,
                              ),
                              const SizedBox(height: 14),
                              Wrap(
                                spacing: 8,
                                runSpacing: 8,
                                children: asStringList(industry['products'])
                                    .map((item) => PillChip(label: item))
                                    .toList(growable: false),
                              ),
                            ],
                          ),
                        ),
                      )
                      .toList(growable: false),
                );

                if (wide) {
                  return Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Expanded(flex: 8, child: left),
                      const SizedBox(width: 18),
                      Expanded(flex: 11, child: right),
                    ],
                  );
                }

                return Column(
                  children: <Widget>[
                    left,
                    const SizedBox(height: 18),
                    right,
                  ],
                );
              },
            ),
          ],
        );
      },
    );
  }
}

class IndustriesScreen extends StatelessWidget {
  const IndustriesScreen({required this.api, super.key});

  final RrmApiClient api;

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<JsonMap>(
      future: api.fetchPublicBootstrap(),
      builder: (context, snapshot) {
        if (snapshot.connectionState != ConnectionState.done) {
          return const LoadingView(message: 'Loading industry aisles...');
        }

        if (snapshot.hasError) {
          return MessageCard(
            title: 'Unable to load industries',
            message: snapshot.error.toString(),
            actionLabel: 'Retry',
            onAction: () => _replaceRoute(context, '/industries'),
          );
        }

        final bootstrap = snapshot.requireData;
        final customerSegments = asJsonMapList(bootstrap['customerSegments']);
        final industries = asJsonMapList(bootstrap['industrySolutions']);

        return ListView(
          padding: const EdgeInsets.fromLTRB(20, 4, 20, 24),
          children: <Widget>[
            LayoutBuilder(
              builder: (context, constraints) {
                final wide = constraints.maxWidth >= 980;
                final left = SurfacePanel(
                  padding: const EdgeInsets.all(28),
                  child: const SectionHeading(
                    eyebrow: 'Industries',
                    title: 'Application aisles for buyers who shop by problem, not part number.',
                    description: 'Each industry tile frames the environment, challenge, and likely product family in one glance, borrowing the best instincts from a premium produce store.',
                  ),
                );
                final right = SurfacePanel(
                  dark: true,
                  padding: const EdgeInsets.all(26),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Text(
                        'HOW BUYERS ARRIVE',
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.58),
                          fontSize: 12,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 1.8,
                        ),
                      ),
                      const SizedBox(height: 18),
                      ...customerSegments.map(
                        (segment) => Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.08),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(color: Colors.white.withOpacity(0.08)),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: <Widget>[
                                Text(
                                  readString(segment, 'title'),
                                  style: const TextStyle(color: _inkInverse, fontWeight: FontWeight.w800),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  readString(segment, 'channel'),
                                  style: TextStyle(color: Colors.white.withOpacity(0.72)),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                );

                if (wide) {
                  return Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Expanded(flex: 11, child: left),
                      const SizedBox(width: 18),
                      Expanded(flex: 9, child: right),
                    ],
                  );
                }

                return Column(
                  children: <Widget>[
                    left,
                    const SizedBox(height: 18),
                    right,
                  ],
                );
              },
            ),
            const SizedBox(height: 22),
            ResponsiveWrap(
              phone: 1,
              tablet: 2,
              desktop: 2,
              wide: 2,
              children: industries
                  .asMap()
                  .entries
                  .map(
                    (entry) => SurfacePanel(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: <Widget>[
                          Row(
                            children: <Widget>[
                              PillChip(label: 'Aisle ${entry.key + 1}'),
                              const SizedBox(width: 8),
                              PillChip(label: readString(entry.value, 'focus'), warm: true),
                            ],
                          ),
                          const SizedBox(height: 16),
                          Text(
                            readString(entry.value, 'name'),
                            style: Theme.of(context).textTheme.headlineSmall,
                          ),
                          const SizedBox(height: 10),
                          Text(
                            readString(entry.value, 'challenge'),
                            style: Theme.of(context).textTheme.bodyMedium,
                          ),
                          const SizedBox(height: 14),
                          Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: asStringList(entry.value['products'])
                                .map((product) => PillChip(label: product))
                                .toList(growable: false),
                          ),
                        ],
                      ),
                    ),
                  )
                  .toList(growable: false),
            ),
            const SizedBox(height: 22),
            Center(
              child: FilledButton(
                onPressed: () => _replaceRoute(context, '/rfq'),
                child: const Text('Request application support'),
              ),
            ),
          ],
        );
      },
    );
  }
}

class RfqScreen extends StatefulWidget {
  const RfqScreen({required this.api, super.key});

  final RrmApiClient api;

  @override
  State<RfqScreen> createState() => _RfqScreenState();
}

class _RfqScreenState extends State<RfqScreen> {
  late final Map<String, TextEditingController> _controllers = <String, TextEditingController>{
    for (final label in _rfqFieldLabels) label: TextEditingController(),
  };
  bool _isSubmitting = false;
  String _submissionTone = 'idle';
  String _submissionMessage = 'Structured submissions land in the owner RFQ queue once the form is sent.';
  String? _submissionReference;

  @override
  void dispose() {
    for (final controller in _controllers.values) {
      controller.dispose();
    }
    super.dispose();
  }

  String _valueFor(String label) => _controllers[label]?.text.trim() ?? '';

  Future<void> _submitRfq() async {
    final hasAnyValue = _controllers.values.any((controller) => controller.text.trim().isNotEmpty);

    if (!hasAnyValue) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Add at least one field before preparing the RFQ sheet.')),
      );
      return;
    }

    if (_valueFor('Company name').isEmpty ||
        _valueFor('Country and delivery city').isEmpty ||
        _valueFor('Product or variant code').isEmpty ||
        _valueFor('Requested quantity').isEmpty) {
      setState(() {
        _submissionTone = 'error';
        _submissionReference = null;
        _submissionMessage = 'Company, delivery location, product code, and quantity are required.';
      });
      return;
    }

    setState(() {
      _isSubmitting = true;
      _submissionTone = 'idle';
      _submissionReference = null;
      _submissionMessage = 'Submitting RFQ...';
    });

    try {
      final payload = await widget.api.submitPublicRfq(<String, dynamic>{
        'companyName': _valueFor('Company name'),
        'contactPerson': _valueFor('Contact person'),
        'emailPhone': _valueFor('Email and phone'),
        'countryAndDeliveryCity': _valueFor('Country and delivery city'),
        'productOrVariantCode': _valueFor('Product or variant code'),
        'requestedQuantity': _valueFor('Requested quantity'),
        'applicationDetails': _valueFor('Application details'),
        'drawingOrSampleReference': _valueFor('Drawing or sample reference'),
        'sourceChannel': 'flutter_public_app',
      });

      for (final controller in _controllers.values) {
        controller.clear();
      }

      if (!mounted) {
        return;
      }

      setState(() {
        _isSubmitting = false;
        _submissionTone = 'success';
        _submissionReference = readString(payload, 'reference');
        _submissionMessage = readString(
          payload,
          'message',
          fallback: 'RFQ submitted and added to the owner queue.',
        );
      });
    } catch (error) {
      if (!mounted) {
        return;
      }

      setState(() {
        _isSubmitting = false;
        _submissionTone = 'error';
        _submissionReference = null;
        _submissionMessage = error.toString();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 4, 20, 24),
      children: <Widget>[
        LayoutBuilder(
          builder: (context, constraints) {
            final wide = constraints.maxWidth >= 980;
            final left = SurfacePanel(
              padding: const EdgeInsets.all(28),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  const SectionHeading(
                    eyebrow: 'Request for quote',
                    title: 'Send one clear order sheet instead of ten scattered messages.',
                    description: 'The migrated Flutter page keeps the RFQ flow visible like a tidy market clipboard: buyers see exactly what to prepare before the private quote workflow begins.',
                  ),
                  const SizedBox(height: 20),
                  ResponsiveWrap(
                    phone: 1,
                    tablet: 2,
                    desktop: 2,
                    wide: 2,
                    children: _rfqFieldLabels
                        .map(
                          (label) => TextField(
                            controller: _controllers[label],
                            maxLines: label == 'Application details' ? 4 : 1,
                            decoration: InputDecoration(labelText: label),
                          ),
                        )
                        .toList(growable: false),
                  ),
                  const SizedBox(height: 18),
                  Container(
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      color: _submissionTone == 'success'
                          ? _accentWarm.withOpacity(0.16)
                          : _submissionTone == 'error'
                              ? _accentWarm.withOpacity(0.28)
                              : Colors.white.withOpacity(0.72),
                      borderRadius: BorderRadius.circular(22),
                      border: Border.all(
                        color: _submissionTone == 'success'
                            ? _accentGreen.withOpacity(0.22)
                            : _submissionTone == 'error'
                                ? _accentWarm.withOpacity(0.42)
                                : _lineColor,
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        Text(
                          _submissionMessage,
                          style: TextStyle(
                            color: _submissionTone == 'error' ? _accentBerry : _inkColor,
                            fontWeight: FontWeight.w700,
                            height: 1.5,
                          ),
                        ),
                        if (_submissionReference != null && _submissionReference!.isNotEmpty) ...<Widget>[
                          const SizedBox(height: 8),
                          Text(
                            'Reference ${_submissionReference!}',
                            style: const TextStyle(
                              color: _accentDeep,
                              fontSize: 12,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 1.2,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                  const SizedBox(height: 18),
                  FilledButton(
                    onPressed: _isSubmitting ? null : _submitRfq,
                    child: Text(_isSubmitting ? 'Submitting RFQ...' : 'Submit RFQ to owner queue'),
                  ),
                ],
              ),
            );

            final right = Column(
              children: <Widget>[
                SurfacePanel(
                  dark: true,
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      const SectionHeading(
                        eyebrow: 'What happens next',
                        title: 'Structured requests move into the private quote workflow.',
                        dark: true,
                      ),
                      const SizedBox(height: 16),
                      ..._rfqSteps.map(
                        (step) => Padding(
                          padding: const EdgeInsets.only(bottom: 10),
                          child: Text(
                            step,
                            style: TextStyle(color: Colors.white.withOpacity(0.78), height: 1.6),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 18),
                SurfacePanel(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      const SectionHeading(
                        eyebrow: 'Visibility rules',
                        title: 'The public form stays clean while internal pricing remains protected.',
                      ),
                      const SizedBox(height: 16),
                      ..._rfqVisibilityRules.map(
                        (rule) => Padding(
                          padding: const EdgeInsets.only(bottom: 10),
                          child: Text(rule, style: Theme.of(context).textTheme.bodyMedium),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            );

            if (wide) {
              return Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Expanded(flex: 11, child: left),
                  const SizedBox(width: 18),
                  Expanded(flex: 9, child: right),
                ],
              );
            }

            return Column(
              children: <Widget>[
                left,
                const SizedBox(height: 18),
                right,
              ],
            );
          },
        ),
      ],
    );
  }
}

class CatalogProductCard extends StatelessWidget {
  const CatalogProductCard({
    required this.product,
    required this.onOpenDetails,
    super.key,
    this.onToggleCompare,
    this.selectedForCompare = false,
    this.compareDisabled = false,
  });

  final JsonMap product;
  final VoidCallback onOpenDetails;
  final VoidCallback? onToggleCompare;
  final bool selectedForCompare;
  final bool compareDisabled;

  @override
  Widget build(BuildContext context) {
    final variants = asJsonMapList(product['variants']);
    final firstVariant = variants.isNotEmpty ? variants.first : null;
    final supplyFormats = asStringList(product['supplyFormats']);
    final industries = asStringList(product['industries']);

    return SurfacePanel(
      padding: const EdgeInsets.all(22),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: <Widget>[
              PillChip(label: readString(product, 'category')),
              PillChip(label: readString(product, 'material'), warm: true),
              PillChip(label: 'Lead time ${readInt(product, 'standardLeadTimeDays')} days'),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            readString(product, 'name'),
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 10),
          Text(
            readString(product, 'summary'),
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          const SizedBox(height: 14),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: asStringList(product['features'])
                .take(3)
                .map((feature) => PillChip(label: feature))
                .toList(growable: false),
          ),
          const SizedBox(height: 16),
          ResponsiveWrap(
            phone: 1,
            tablet: 3,
            desktop: 3,
            wide: 3,
            children: <Widget>[
              MetricCard(
                label: 'Variants',
                value: '${readInt(product, 'variantCount')}',
              ),
              MetricCard(
                label: 'Lead time',
                value: '${readInt(product, 'standardLeadTimeDays')} days',
              ),
              MetricCard(
                label: 'Supply format',
                value: supplyFormats.isNotEmpty ? supplyFormats.first : 'Custom quote',
              ),
            ],
          ),
          if (firstVariant != null) ...<Widget>[
            const SizedBox(height: 16),
            SurfacePanel(
              dark: true,
              padding: const EdgeInsets.all(18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Row(
                    children: <Widget>[
                      Expanded(
                        child: Text(
                          'QUICK SPEC CHECK',
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.58),
                            fontSize: 11,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 1.6,
                          ),
                        ),
                      ),
                      PillChip(
                        label: 'MOQ ${readInt(firstVariant, 'minimumOrderQuantity')}',
                        dark: true,
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    readString(firstVariant, 'code'),
                    style: const TextStyle(color: _inkInverse, fontWeight: FontWeight.w800),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    readString(firstVariant, 'description'),
                    style: TextStyle(color: Colors.white.withOpacity(0.74), height: 1.5),
                  ),
                  const SizedBox(height: 14),
                  ResponsiveWrap(
                    phone: 1,
                    tablet: 3,
                    desktop: 3,
                    wide: 3,
                    children: asJsonMapList(firstVariant['dimensions'])
                        .map(
                          (dimension) => Container(
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.08),
                              borderRadius: BorderRadius.circular(18),
                              border: Border.all(color: Colors.white.withOpacity(0.08)),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: <Widget>[
                                Text(
                                  readString(dimension, 'label'),
                                  style: TextStyle(
                                    color: Colors.white.withOpacity(0.58),
                                    fontSize: 11,
                                    fontWeight: FontWeight.w800,
                                    letterSpacing: 1.4,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  readString(dimension, 'value'),
                                  style: const TextStyle(color: _inkInverse, fontWeight: FontWeight.w800),
                                ),
                              ],
                            ),
                          ),
                        )
                        .toList(growable: false),
                  ),
                ],
              ),
            ),
          ],
          const SizedBox(height: 16),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: <Widget>[
              ...asStringList(product['certifications'])
                  .take(2)
                  .map((certification) => PillChip(label: certification)),
              ...industries.take(2).map((industry) => PillChip(label: industry, warm: true)),
            ],
          ),
          const SizedBox(height: 16),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: <Widget>[
              FilledButton(
                onPressed: onOpenDetails,
                child: const Text('View details'),
              ),
              if (onToggleCompare != null)
                OutlinedButton(
                  onPressed: compareDisabled && !selectedForCompare ? null : onToggleCompare,
                  child: Text(selectedForCompare ? 'Remove from compare' : 'Compare'),
                ),
            ],
          ),
        ],
      ),
    );
  }
}

class ProductsScreen extends StatefulWidget {
  const ProductsScreen({
    required this.api,
    required this.initialUri,
    super.key,
  });

  final RrmApiClient api;
  final Uri initialUri;

  @override
  State<ProductsScreen> createState() => _ProductsScreenState();
}

class _ProductsScreenState extends State<ProductsScreen> {
  late final Future<List<JsonMap>> _catalogFuture;
  late final TextEditingController _searchController;
  late String _selectedCategory;
  late String _selectedMaterial;
  late String _sortValue;
  late List<String> _compareSlugs;
  String _shareMessage = '';

  @override
  void initState() {
    super.initState();
    _catalogFuture = widget.api.fetchCatalog();
    _searchController = TextEditingController(text: widget.initialUri.queryParameters['q'] ?? '');
    _selectedCategory = widget.initialUri.queryParameters['category'] ?? _allCategoriesLabel;
    _selectedMaterial = widget.initialUri.queryParameters['material'] ?? _allMaterialsLabel;
    _sortValue = widget.initialUri.queryParameters['sort'] ?? 'relevance';
    _compareSlugs = (widget.initialUri.queryParameters['compare'] ?? '')
        .split(',')
        .map((value) => value.trim())
        .where((value) => value.isNotEmpty)
        .take(_maxComparedProducts)
        .toList(growable: true);
    _searchController.addListener(() => setState(() {}));
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _toggleCompare(String slug) {
    setState(() {
      if (_compareSlugs.contains(slug)) {
        _compareSlugs.remove(slug);
      } else if (_compareSlugs.length < _maxComparedProducts) {
        _compareSlugs.add(slug);
      }
    });
  }

  void _clearFilters() {
    setState(() {
      _searchController.clear();
      _selectedCategory = _allCategoriesLabel;
      _selectedMaterial = _allMaterialsLabel;
      _sortValue = 'relevance';
    });
  }

  Future<void> _copyCurrentView() async {
    final queryParameters = _buildCatalogViewQueryParameters(
      query: _searchController.text,
      category: _selectedCategory,
      material: _selectedMaterial,
      sortValue: _sortValue,
      compareSlugs: _compareSlugs,
    );
    final relativeRoute = queryParameters.isEmpty
        ? '/products'
        : '/products?${Uri(queryParameters: queryParameters).query}';

    await Clipboard.setData(ClipboardData(text: relativeRoute));

    if (!mounted) {
      return;
    }

    setState(() {
      _shareMessage = 'Current catalog view copied as $relativeRoute';
    });
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<JsonMap>>(
      future: _catalogFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState != ConnectionState.done) {
          return const LoadingView(message: 'Loading catalog aisles...');
        }

        if (snapshot.hasError) {
          return MessageCard(
            title: 'Unable to load the catalog',
            message: snapshot.error.toString(),
            actionLabel: 'Retry',
            onAction: () => _replaceRoute(context, '/products'),
          );
        }

        final products = snapshot.requireData;
        final categories = <String>{for (final product in products) readString(product, 'category')}.toList()..sort();
        final materials = <String>{for (final product in products) readString(product, 'material')}.toList()..sort();
        final categorySummaries = _buildCatalogAisles(products);
        final normalizedQuery = _searchController.text.trim().toLowerCase();
        final filteredProducts = _sortCatalogProducts(
          products.where((product) {
            if (_selectedCategory != _allCategoriesLabel && readString(product, 'category') != _selectedCategory) {
              return false;
            }

            if (_selectedMaterial != _allMaterialsLabel && readString(product, 'material') != _selectedMaterial) {
              return false;
            }

            return _matchesSearch(product, normalizedQuery);
          }).toList(growable: false),
          _sortValue,
          normalizedQuery,
        );
        final selectedProducts = _compareSlugs
            .map((slug) => products.where((product) => readString(product, 'slug') == slug).cast<JsonMap?>().firstOrNull)
            .whereType<JsonMap>()
            .toList(growable: false);
        final totalVariants = products.fold<int>(
          0,
          (sum, product) => sum + asJsonMapList(product['variants']).length,
        );
        final visibleVariants = filteredProducts.fold<int>(
          0,
          (sum, product) => sum + asJsonMapList(product['variants']).length,
        );
        final hasActiveFilters = normalizedQuery.isNotEmpty ||
            _selectedCategory != _allCategoriesLabel ||
            _selectedMaterial != _allMaterialsLabel ||
            _sortValue != 'relevance';

        return ListView(
          padding: const EdgeInsets.fromLTRB(20, 4, 20, 24),
          children: <Widget>[
            LayoutBuilder(
              builder: (context, constraints) {
                final wide = constraints.maxWidth >= 1100;
                final left = SurfacePanel(
                  padding: const EdgeInsets.all(28),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      const SectionHeading(
                        eyebrow: 'Browse lanes',
                        title: 'Start with the right shelf before you open product cards.',
                        description: 'Large industrial catalogs work better when buyers can enter through a clear lane. These category tiles show product depth, variant volume, and the quickest lead time without forcing a full-card scan.',
                      ),
                      const SizedBox(height: 18),
                      ResponsiveWrap(
                        phone: 1,
                        tablet: 2,
                        desktop: 2,
                        wide: 2,
                        children: categorySummaries
                            .map(
                              (summary) => SurfacePanel(
                                padding: const EdgeInsets.all(20),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: <Widget>[
                                    Text(
                                      '${readInt(summary, 'productCount')} families',
                                      style: const TextStyle(
                                        color: _mutedColor,
                                        fontSize: 11,
                                        fontWeight: FontWeight.w800,
                                        letterSpacing: 1.5,
                                      ),
                                    ),
                                    const SizedBox(height: 10),
                                    Text(
                                      readString(summary, 'category'),
                                      style: Theme.of(context).textTheme.titleLarge,
                                    ),
                                    const SizedBox(height: 12),
                                    Wrap(
                                      spacing: 8,
                                      runSpacing: 8,
                                      children: asStringList(summary['materials'])
                                          .map((material) => PillChip(label: material, warm: true))
                                          .toList(growable: false),
                                    ),
                                    const SizedBox(height: 14),
                                    ResponsiveWrap(
                                      phone: 2,
                                      tablet: 2,
                                      desktop: 2,
                                      wide: 2,
                                      children: <Widget>[
                                        MetricCard(
                                          label: 'Variant sizes',
                                          value: '${readInt(summary, 'variantCount')}',
                                        ),
                                        MetricCard(
                                          label: 'Fastest lead time',
                                          value: '${readInt(summary, 'fastestLeadTime')} days',
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 14),
                                    OutlinedButton(
                                      onPressed: () => setState(() {
                                        _selectedCategory = readString(summary, 'category');
                                      }),
                                      child: Text(
                                        _selectedCategory == readString(summary, 'category')
                                            ? 'Active lane'
                                            : 'Open aisle',
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            )
                            .toList(growable: false),
                      ),
                    ],
                  ),
                );

                final right = SurfacePanel(
                  dark: true,
                  padding: const EdgeInsets.all(26),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      const SectionHeading(
                        eyebrow: 'Shortlist and share',
                        title: 'Keep teams aligned while they narrow a large catalog.',
                        description: 'Keep the current slice visible, shortlist candidates, then move directly into RFQ.',
                        dark: true,
                      ),
                      const SizedBox(height: 18),
                      ResponsiveWrap(
                        phone: 1,
                        tablet: 3,
                        desktop: 3,
                        wide: 3,
                        children: <Widget>[
                          MetricCard(label: 'Matching families', value: '${filteredProducts.length}', dark: true),
                          MetricCard(label: 'Visible variants', value: '$visibleVariants', dark: true),
                          MetricCard(
                            label: 'Shortlist tray',
                            value: '${selectedProducts.length}/$_maxComparedProducts',
                            dark: true,
                          ),
                        ],
                      ),
                      const SizedBox(height: 18),
                      Container(
                        padding: const EdgeInsets.all(18),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.08),
                          borderRadius: BorderRadius.circular(22),
                          border: Border.all(color: Colors.white.withOpacity(0.08)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: <Widget>[
                            Text(
                              'CURRENT SHORTLIST',
                              style: TextStyle(
                                color: Colors.white.withOpacity(0.58),
                                fontSize: 11,
                                fontWeight: FontWeight.w800,
                                letterSpacing: 1.6,
                              ),
                            ),
                            const SizedBox(height: 12),
                            if (selectedProducts.isEmpty)
                              Text(
                                'Add products to the compare tray and this board becomes a live shortlist for RFQ preparation.',
                                style: TextStyle(color: Colors.white.withOpacity(0.74), height: 1.5),
                              )
                            else
                              ...selectedProducts.map(
                                (product) => Padding(
                                  padding: const EdgeInsets.only(bottom: 10),
                                  child: Row(
                                    children: <Widget>[
                                      Expanded(
                                        child: Text(
                                          readString(product, 'name'),
                                          style: const TextStyle(color: _inkInverse, fontWeight: FontWeight.w800),
                                        ),
                                      ),
                                      PillChip(label: readString(product, 'category'), dark: true),
                                    ],
                                  ),
                                ),
                              ),
                          ],
                        ),
                      ),
                      if (_shareMessage.isNotEmpty) ...<Widget>[
                        const SizedBox(height: 16),
                        Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.08),
                            borderRadius: BorderRadius.circular(18),
                            border: Border.all(color: Colors.white.withOpacity(0.08)),
                          ),
                          child: Text(
                            _shareMessage,
                            style: TextStyle(color: Colors.white.withOpacity(0.82), height: 1.5),
                          ),
                        ),
                      ],
                      const SizedBox(height: 18),
                      Wrap(
                        spacing: 10,
                        runSpacing: 10,
                        children: <Widget>[
                          OutlinedButton(
                            onPressed: _copyCurrentView,
                            style: OutlinedButton.styleFrom(
                              foregroundColor: _inkInverse,
                              side: BorderSide(color: Colors.white.withOpacity(0.14)),
                            ),
                            child: const Text('Copy current view'),
                          ),
                          FilledButton(
                            onPressed: () => _replaceRoute(context, '/rfq'),
                            child: const Text('Continue to RFQ'),
                          ),
                        ],
                      ),
                    ],
                  ),
                );

                if (wide) {
                  return Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Expanded(flex: 12, child: left),
                      const SizedBox(width: 18),
                      Expanded(flex: 8, child: right),
                    ],
                  );
                }

                return Column(
                  children: <Widget>[
                    left,
                    const SizedBox(height: 18),
                    right,
                  ],
                );
              },
            ),
            const SizedBox(height: 22),
            SurfacePanel(
              padding: const EdgeInsets.all(28),
              child: LayoutBuilder(
                builder: (context, constraints) {
                  final wide = constraints.maxWidth >= 980;
                  final intro = Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      const SectionHeading(
                        eyebrow: 'Product catalog',
                        title: 'Catalog aisles that feel organized the moment a buyer lands.',
                        description: 'The Flutter catalog keeps the same search, filter, sort, and comparison behavior while rendering from JSON instead of the original Next pages.',
                      ),
                      const SizedBox(height: 18),
                      Text(
                        'Search by product name, material, application, dimension, or variant code, then compare up to three products before moving into the quote flow.',
                        style: Theme.of(context).textTheme.bodyLarge,
                      ),
                    ],
                  );
                  final stats = SurfacePanel(
                    dark: true,
                    padding: const EdgeInsets.all(22),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        Text(
                          'CATALOG NUMBERS',
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.58),
                            fontSize: 12,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 1.8,
                          ),
                        ),
                        const SizedBox(height: 16),
                        ResponsiveWrap(
                          phone: 1,
                          tablet: 3,
                          desktop: 3,
                          wide: 3,
                          children: <Widget>[
                            MetricCard(label: 'Product families', value: '${products.length}', dark: true),
                            MetricCard(label: 'Variant sizes', value: '$totalVariants', dark: true),
                            const MetricCard(label: 'Public rule', value: 'Quote first', dark: true),
                          ],
                        ),
                      ],
                    ),
                  );

                  if (wide) {
                    return Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        Expanded(flex: 11, child: intro),
                        const SizedBox(width: 18),
                        Expanded(flex: 9, child: stats),
                      ],
                    );
                  }

                  return Column(
                    children: <Widget>[
                      intro,
                      const SizedBox(height: 18),
                      stats,
                    ],
                  );
                },
              ),
            ),
            const SizedBox(height: 22),
            LayoutBuilder(
              builder: (context, constraints) {
                final sidebar = SurfacePanel(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      const SectionHeading(
                        eyebrow: 'Search the aisles',
                        title: 'Filter the catalog the way a buyer actually shops.',
                        description: 'Search, category, material, sort order, and compare tray stay on one page.',
                      ),
                      const SizedBox(height: 18),
                      TextField(
                        controller: _searchController,
                        decoration: const InputDecoration(labelText: 'Search catalog'),
                      ),
                      const SizedBox(height: 14),
                      DropdownButtonFormField<String>(
                        value: _sortValue,
                        decoration: const InputDecoration(labelText: 'Sort results'),
                        items: _sortOptions
                            .map(
                              (option) => DropdownMenuItem<String>(
                                value: option['value'],
                                child: Text(option['label']!),
                              ),
                            )
                            .toList(growable: false),
                        onChanged: (value) => setState(() => _sortValue = value ?? 'relevance'),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'Category',
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                      const SizedBox(height: 10),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: <String>[_allCategoriesLabel, ...categories]
                            .map(
                              (category) => FilterChip(
                                label: Text(category),
                                selected: _selectedCategory == category,
                                onSelected: (_) => setState(() => _selectedCategory = category),
                              ),
                            )
                            .toList(growable: false),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'Material',
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                      const SizedBox(height: 10),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: <String>[_allMaterialsLabel, ...materials]
                            .map(
                              (material) => FilterChip(
                                label: Text(material),
                                selected: _selectedMaterial == material,
                                onSelected: (_) => setState(() => _selectedMaterial = material),
                              ),
                            )
                            .toList(growable: false),
                      ),
                      const SizedBox(height: 18),
                      ResponsiveWrap(
                        phone: 2,
                        tablet: 2,
                        desktop: 1,
                        wide: 1,
                        children: <Widget>[
                          MetricCard(label: 'Matching products', value: '${filteredProducts.length}'),
                          MetricCard(
                            label: 'Compare tray',
                            value: '${selectedProducts.length}/$_maxComparedProducts',
                          ),
                        ],
                      ),
                      const SizedBox(height: 18),
                      OutlinedButton(
                        onPressed: hasActiveFilters ? _clearFilters : null,
                        child: const Text('Clear filters'),
                      ),
                      const SizedBox(height: 18),
                      SurfacePanel(
                        dark: true,
                        padding: const EdgeInsets.all(18),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: <Widget>[
                            Text(
                              'LAUNCH RULES',
                              style: TextStyle(
                                color: Colors.white.withOpacity(0.58),
                                fontSize: 12,
                                fontWeight: FontWeight.w800,
                                letterSpacing: 1.8,
                              ),
                            ),
                            const SizedBox(height: 12),
                            ...const <String>[
                              'Public pages show dimensions, applications, and technical fit.',
                              'Prices stay off the shelf and move through RFQ or owner workflow.',
                              'Manufacturing chemistry and cost inputs remain owner-only.',
                            ].map(
                              (rule) => Padding(
                                padding: const EdgeInsets.only(bottom: 8),
                                child: Text(
                                  rule,
                                  style: TextStyle(color: Colors.white.withOpacity(0.76), height: 1.5),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                );

                final results = Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    SurfacePanel(
                      padding: const EdgeInsets.all(22),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: <Widget>[
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: <Widget>[
                                Text(
                                  'LIVE CATALOG RESULTS',
                                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                                        color: _mutedColor,
                                        fontWeight: FontWeight.w800,
                                        letterSpacing: 1.5,
                                      ),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  '${filteredProducts.length} matching product family${filteredProducts.length == 1 ? '' : 'ies'}${normalizedQuery.isNotEmpty ? ' for "${_searchController.text.trim()}"' : ''}.',
                                  style: Theme.of(context).textTheme.bodyLarge,
                                ),
                              ],
                            ),
                          ),
                          Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: <Widget>[
                              if (_sortValue != 'relevance')
                                PillChip(
                                  label: _sortOptions.firstWhere((option) => option['value'] == _sortValue)['label']!,
                                ),
                              if (_selectedCategory != _allCategoriesLabel) PillChip(label: _selectedCategory),
                              if (_selectedMaterial != _allMaterialsLabel) PillChip(label: _selectedMaterial, warm: true),
                              if (selectedProducts.isNotEmpty) PillChip(label: 'Compare ${selectedProducts.length}'),
                            ],
                          ),
                        ],
                      ),
                    ),
                    if (selectedProducts.isNotEmpty) ...<Widget>[
                      const SizedBox(height: 18),
                      ComparisonTable(
                        products: selectedProducts,
                        onClear: () => setState(() => _compareSlugs = <String>[]),
                      ),
                    ],
                    const SizedBox(height: 18),
                    if (filteredProducts.isEmpty)
                      const MessageCard(
                        title: 'No matching products',
                        message: 'Try relaxing the search or clearing one of the filters to widen the aisle.',
                      )
                    else
                      ResponsiveWrap(
                        phone: 1,
                        tablet: 2,
                        desktop: 2,
                        wide: 2,
                        children: filteredProducts
                            .map(
                              (product) => CatalogProductCard(
                                product: product,
                                selectedForCompare: _compareSlugs.contains(readString(product, 'slug')),
                                compareDisabled: _compareSlugs.length >= _maxComparedProducts,
                                onToggleCompare: () => _toggleCompare(readString(product, 'slug')),
                                onOpenDetails: () => _pushRoute(
                                  context,
                                  '/products/${readString(product, 'slug')}',
                                ),
                              ),
                            )
                            .toList(growable: false),
                      ),
                  ],
                );

                if (constraints.maxWidth >= 1120) {
                  return Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      SizedBox(width: 340, child: sidebar),
                      const SizedBox(width: 18),
                      Expanded(child: results),
                    ],
                  );
                }

                return Column(
                  children: <Widget>[
                    sidebar,
                    const SizedBox(height: 18),
                    results,
                  ],
                );
              },
            ),
          ],
        );
      },
    );
  }
}

class ComparisonTable extends StatelessWidget {
  const ComparisonTable({
    required this.products,
    required this.onClear,
    super.key,
  });

  final List<JsonMap> products;
  final VoidCallback onClear;

  @override
  Widget build(BuildContext context) {
    String valueFor(JsonMap product, String attribute) {
      switch (attribute) {
        case 'Category':
          return readString(product, 'category');
        case 'Material':
          return readString(product, 'material');
        case 'Lead time':
          return '${readInt(product, 'standardLeadTimeDays')} days';
        case 'Variants':
          return '${readInt(product, 'variantCount')}';
        case 'MOQ range':
          return readString(product, 'minimumOrderQuantityRange');
        case 'Applications':
          return _joinValues(product['applications'], limit: 3);
        case 'Supply formats':
          return _joinValues(product['supplyFormats']);
        case 'Certifications':
          return _joinValues(product['certifications']);
        default:
          return '';
      }
    }

    const attributes = <String>[
      'Category',
      'Material',
      'Lead time',
      'Variants',
      'MOQ range',
      'Applications',
      'Supply formats',
      'Certifications',
    ];

    return SurfacePanel(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Row(
            children: <Widget>[
              Expanded(
                child: const SectionHeading(
                  eyebrow: 'Compare selected products',
                  title: 'Side-by-side product snapshot.',
                  description: 'Select up to three products to compare commercial attributes before you request a quote.',
                ),
              ),
              OutlinedButton(onPressed: onClear, child: const Text('Clear comparison')),
            ],
          ),
          const SizedBox(height: 18),
          if (products.length < 2)
            const Padding(
              padding: EdgeInsets.only(bottom: 16),
              child: Text(
                'Select at least one more product card to make the comparison more useful.',
                style: TextStyle(color: _mutedColor),
              ),
            ),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: DataTable(
              columns: <DataColumn>[
                const DataColumn(label: Text('Attribute')),
                ...products.map(
                  (product) => DataColumn(label: Text(readString(product, 'name'))),
                ),
              ],
              rows: attributes
                  .map(
                    (attribute) => DataRow(
                      cells: <DataCell>[
                        DataCell(Text(attribute)),
                        ...products.map((product) => DataCell(SizedBox(width: 180, child: Text(valueFor(product, attribute))))),
                      ],
                    ),
                  )
                  .toList(growable: false),
            ),
          ),
        ],
      ),
    );
  }
}

class ProductDetailScreen extends StatelessWidget {
  const ProductDetailScreen({
    required this.api,
    required this.slug,
    super.key,
  });

  final RrmApiClient api;
  final String slug;

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<JsonMap>(
      future: api.fetchProductDetail(slug),
      builder: (context, snapshot) {
        if (snapshot.connectionState != ConnectionState.done) {
          return const LoadingView(message: 'Loading product detail...');
        }

        if (snapshot.hasError) {
          return MessageCard(
            title: 'Unable to load the product',
            message: snapshot.error.toString(),
            actionLabel: 'Back to catalog',
            onAction: () => _replaceRoute(context, '/products'),
          );
        }

        final product = snapshot.requireData;
        final variants = asJsonMapList(product['variants']);
        final viewer = asJsonMap(product['viewer']);

        return ListView(
          padding: const EdgeInsets.fromLTRB(20, 4, 20, 24),
          children: <Widget>[
            LayoutBuilder(
              builder: (context, constraints) {
                final wide = constraints.maxWidth >= 1080;

                final left = Column(
                  children: <Widget>[
                    SurfacePanel(
                      padding: const EdgeInsets.all(28),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: <Widget>[
                          Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: <Widget>[
                              PillChip(label: readString(product, 'category')),
                              PillChip(label: readString(product, 'material'), warm: true),
                              PillChip(label: 'Lead time ${readInt(product, 'standardLeadTimeDays')} days'),
                            ],
                          ),
                          const SizedBox(height: 16),
                          Text(
                            readString(product, 'name'),
                            style: Theme.of(context).textTheme.displaySmall,
                          ),
                          const SizedBox(height: 14),
                          Text(
                            readString(product, 'description'),
                            style: Theme.of(context).textTheme.bodyLarge,
                          ),
                          const SizedBox(height: 16),
                          Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: asStringList(product['features'])
                                .map((feature) => PillChip(label: feature))
                                .toList(growable: false),
                          ),
                          const SizedBox(height: 18),
                          ResponsiveWrap(
                            phone: 1,
                            tablet: 3,
                            desktop: 3,
                            wide: 3,
                            children: <Widget>[
                              MetricCard(label: 'Variants', value: '${variants.length}'),
                              MetricCard(
                                label: 'Supply formats',
                                value: '${asStringList(product['supplyFormats']).length}',
                              ),
                              MetricCard(
                                label: 'Certifications',
                                value: '${asStringList(product['certifications']).length}',
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 18),
                    SurfacePanel(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: <Widget>[
                          const SectionHeading(
                            eyebrow: 'Applications',
                            title: 'Use cases and industry fit at one glance.',
                          ),
                          const SizedBox(height: 16),
                          ResponsiveWrap(
                            phone: 1,
                            tablet: 2,
                            desktop: 2,
                            wide: 2,
                            children: <Widget>[
                              SurfacePanel(
                                padding: const EdgeInsets.all(20),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: <Widget>[
                                    Text('Typical use cases', style: Theme.of(context).textTheme.titleLarge),
                                    const SizedBox(height: 12),
                                    ...asStringList(product['applications']).map(
                                      (application) => Padding(
                                        padding: const EdgeInsets.only(bottom: 8),
                                        child: Text(application, style: Theme.of(context).textTheme.bodyMedium),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              SurfacePanel(
                                padding: const EdgeInsets.all(20),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: <Widget>[
                                    Text('Industries served', style: Theme.of(context).textTheme.titleLarge),
                                    const SizedBox(height: 12),
                                    ...asStringList(product['industries']).map(
                                      (industry) => Padding(
                                        padding: const EdgeInsets.only(bottom: 8),
                                        child: Text(industry, style: Theme.of(context).textTheme.bodyMedium),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                );

                final right = Column(
                  children: <Widget>[
                    ViewerPlaceholder(productName: readString(product, 'name'), viewer: viewer),
                    const SizedBox(height: 18),
                    SurfacePanel(
                      dark: true,
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: <Widget>[
                          const SectionHeading(
                            eyebrow: 'Quote handling',
                            title: 'Public detail, private pricing.',
                            description: 'Buyers inspect form, applications, and dimensions from the public side while price books, cost logic, and manufacturing intelligence stay protected.',
                            dark: true,
                          ),
                          const SizedBox(height: 14),
                          Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: asStringList(product['certifications'])
                                .map((certification) => PillChip(label: certification, dark: true))
                                .toList(growable: false),
                          ),
                          const SizedBox(height: 18),
                          FilledButton(
                            onPressed: () => _replaceRoute(context, '/rfq'),
                            child: const Text('RFQ this product'),
                          ),
                        ],
                      ),
                    ),
                  ],
                );

                if (wide) {
                  return Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Expanded(flex: 10, child: left),
                      const SizedBox(width: 18),
                      Expanded(flex: 9, child: right),
                    ],
                  );
                }

                return Column(
                  children: <Widget>[
                    left,
                    const SizedBox(height: 18),
                    right,
                  ],
                );
              },
            ),
            const SizedBox(height: 22),
            ResponsiveWrap(
              phone: 1,
              tablet: 2,
              desktop: 2,
              wide: 2,
              children: <Widget>[
                SurfacePanel(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      const SectionHeading(
                        eyebrow: 'Technical profile',
                        title: 'Specifications visible without exposing internal formulation.',
                      ),
                      const SizedBox(height: 14),
                      ...<JsonMap>[
                        <String, dynamic>{'label': 'Base material', 'value': readString(product, 'material')},
                        ...asJsonMapList(product['technicalProfile']),
                      ].map(
                        (specification) => Padding(
                          padding: const EdgeInsets.only(bottom: 10),
                          child: Container(
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.72),
                              borderRadius: BorderRadius.circular(18),
                              border: Border.all(color: _lineColor),
                            ),
                            child: Row(
                              children: <Widget>[
                                Expanded(
                                  child: Text(
                                    readString(specification, 'label'),
                                    style: Theme.of(context).textTheme.bodyMedium,
                                  ),
                                ),
                                Text(
                                  readString(specification, 'value'),
                                  style: const TextStyle(color: _inkColor, fontWeight: FontWeight.w800),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                Column(
                  children: <Widget>[
                    SurfacePanel(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: <Widget>[
                          const SectionHeading(
                            eyebrow: 'Supply format',
                            title: 'Prepared the way buyers actually order.',
                          ),
                          const SizedBox(height: 14),
                          Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: asStringList(product['supplyFormats'])
                                .map((format) => PillChip(label: format))
                                .toList(growable: false),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 18),
                    SurfacePanel(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: <Widget>[
                          const SectionHeading(
                            eyebrow: 'Quality checks',
                            title: 'Public-facing confidence without revealing process secrets.',
                          ),
                          const SizedBox(height: 14),
                          ...asStringList(product['qualityChecks']).map(
                            (check) => Padding(
                              padding: const EdgeInsets.only(bottom: 8),
                              child: Text(check, style: Theme.of(context).textTheme.bodyMedium),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 22),
            SurfacePanel(
              padding: const EdgeInsets.all(28),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Row(
                    children: <Widget>[
                      Expanded(
                        child: const SectionHeading(
                          eyebrow: 'Dimensions and variants',
                          title: 'Variant-aware quoting starts from the right shelf label.',
                          description: 'Each variant stays dimension-first on the public side while tracked currencies remain private to the owner workflow.',
                        ),
                      ),
                      FilledButton(
                        onPressed: () => _replaceRoute(context, '/rfq'),
                        child: const Text('RFQ this product'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 18),
                  ResponsiveWrap(
                    phone: 1,
                    tablet: 2,
                    desktop: 2,
                    wide: 2,
                    children: variants
                        .map(
                          (variant) => SurfacePanel(
                            padding: const EdgeInsets.all(20),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: <Widget>[
                                Text(
                                  readString(variant, 'code'),
                                  style: const TextStyle(color: _inkColor, fontWeight: FontWeight.w800),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  readString(variant, 'description'),
                                  style: Theme.of(context).textTheme.bodyMedium,
                                ),
                                const SizedBox(height: 12),
                                ...asJsonMapList(variant['dimensions']).map(
                                  (dimension) => Padding(
                                    padding: const EdgeInsets.only(bottom: 6),
                                    child: Row(
                                      children: <Widget>[
                                        Expanded(child: Text(readString(dimension, 'label'))),
                                        Text(
                                          readString(dimension, 'value'),
                                          style: const TextStyle(color: _inkColor, fontWeight: FontWeight.w700),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 12),
                                Text(
                                  'MOQ ${readInt(variant, 'minimumOrderQuantity')}',
                                  style: const TextStyle(color: _inkColor, fontWeight: FontWeight.w700),
                                ),
                                const SizedBox(height: 10),
                                Wrap(
                                  spacing: 8,
                                  runSpacing: 8,
                                  children: asStringList(variant['currenciesTracked'])
                                      .map((currency) => PillChip(label: currency, warm: true))
                                      .toList(growable: false),
                                ),
                                const SizedBox(height: 10),
                                const Text(
                                  'Quote only. Owner workspace tracks the full regional matrix privately.',
                                  style: TextStyle(color: _mutedColor, height: 1.5),
                                ),
                              ],
                            ),
                          ),
                        )
                        .toList(growable: false),
                  ),
                  const SizedBox(height: 18),
                  SurfacePanel(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const <Widget>[
                        SectionHeading(
                          eyebrow: 'Visibility rules',
                          title: 'Owner-only data stays behind the gate.',
                        ),
                        SizedBox(height: 14),
                        Text('Customer-facing pages exclude compound ratios and process notes.', style: TextStyle(color: _mutedColor, height: 1.5)),
                        SizedBox(height: 8),
                        Text('Owner workspace stores internal cost drivers and chemistry records.', style: TextStyle(color: _mutedColor, height: 1.5)),
                        SizedBox(height: 8),
                        Text('Competitor pricing stays in a separate private dataset.', style: TextStyle(color: _mutedColor, height: 1.5)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        );
      },
    );
  }
}

class ViewerPlaceholder extends StatelessWidget {
  const ViewerPlaceholder({
    required this.productName,
    required this.viewer,
    super.key,
  });

  final String productName;
  final JsonMap viewer;

  @override
  Widget build(BuildContext context) {
    return SurfacePanel(
      padding: const EdgeInsets.all(24),
      child: Container(
        constraints: const BoxConstraints(minHeight: 320),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(26),
          gradient: const LinearGradient(
            colors: <Color>[Color(0xFFFDF7E9), Color(0xFFF1E6BF), Color(0xFFDFF0CF)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: Stack(
          children: <Widget>[
            Positioned(
              left: 24,
              right: 24,
              top: 42,
              child: Transform.rotate(
                angle: -0.4,
                child: Container(
                  height: 160,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(28),
                    gradient: const LinearGradient(
                      colors: <Color>[_inkColor, _accentWarm],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    boxShadow: <BoxShadow>[
                      BoxShadow(
                        color: _inkColor.withOpacity(0.28),
                        blurRadius: 38,
                        offset: const Offset(0, 18),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            Positioned(
              left: 32,
              top: 24,
              child: PillChip(label: readString(viewer, 'label')),
            ),
            Positioned(
              right: 32,
              top: 24,
              child: PillChip(label: readString(viewer, 'preset').toUpperCase(), warm: true),
            ),
            Positioned(
              left: 24,
              right: 24,
              bottom: 24,
              child: SurfacePanel(
                padding: const EdgeInsets.all(18),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    const Text(
                      '3D asset slot',
                      style: TextStyle(
                        color: _accentDeep,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 1.4,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(productName, style: Theme.of(context).textTheme.titleLarge),
                    const SizedBox(height: 8),
                    const Text(
                      'This Flutter migration keeps the 3D-ready placeholder and viewer metadata in place until dedicated GLB/GLTF assets are attached.',
                      style: TextStyle(color: _mutedColor, height: 1.5),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class OwnerAccessScreen extends StatefulWidget {
  const OwnerAccessScreen({required this.api, super.key});

  final RrmApiClient api;

  @override
  State<OwnerAccessScreen> createState() => _OwnerAccessScreenState();
}

class _OwnerAccessScreenState extends State<OwnerAccessScreen> {
  late final Future<bool> _sessionFuture;
  final TextEditingController _passcodeController = TextEditingController();
  bool _isSubmitting = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _sessionFuture = widget.api.fetchOwnerSession();
  }

  @override
  void dispose() {
    _passcodeController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    setState(() {
      _isSubmitting = true;
      _errorMessage = null;
    });

    try {
      final response = await widget.api.signInOwner(_passcodeController.text.trim());

      if (!mounted) {
        return;
      }

      if (readBool(response, 'authenticated')) {
        _replaceRoute(context, '/admin');
      }
    } on ApiException catch (error) {
      setState(() => _errorMessage = error.message);
    } catch (error) {
      setState(() => _errorMessage = error.toString());
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<bool>(
      future: _sessionFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState != ConnectionState.done) {
          return const LoadingView(message: 'Checking owner access...');
        }

        final alreadyAuthenticated = snapshot.data ?? false;

        return ListView(
          padding: const EdgeInsets.fromLTRB(20, 4, 20, 24),
          children: <Widget>[
            LayoutBuilder(
              builder: (context, constraints) {
                final wide = constraints.maxWidth >= 980;
                final left = SurfacePanel(
                  dark: true,
                  padding: const EdgeInsets.all(30),
                  child: const SectionHeading(
                    eyebrow: 'Owner workspace access',
                    title: 'Private pricing, chemistry, and cost controls stay behind a server-side gate.',
                    description: 'This Flutter migration uses the same owner access code and session model as the Next backend, with bearer-token support for external frontends.',
                    dark: true,
                  ),
                );
                final right = SurfacePanel(
                  padding: const EdgeInsets.all(30),
                  child: alreadyAuthenticated
                      ? Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: <Widget>[
                            const SectionHeading(
                              eyebrow: 'Session active',
                              title: 'Owner access is already available in this browser session.',
                              description: 'You can move directly into the private workspace or sign in again to refresh the token used by the Flutter frontend.',
                            ),
                            const SizedBox(height: 18),
                            FilledButton(
                              onPressed: () => _replaceRoute(context, '/admin'),
                              child: const Text('Enter owner workspace'),
                            ),
                          ],
                        )
                      : Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: <Widget>[
                            const SectionHeading(
                              eyebrow: 'Sign in',
                              title: 'Owner-only area',
                              description: 'Set OWNER_ACCESS_CODE and SESSION_SECRET in the environment before production use.',
                            ),
                            const SizedBox(height: 18),
                            TextField(
                              controller: _passcodeController,
                              obscureText: true,
                              decoration: const InputDecoration(labelText: 'Owner access code'),
                            ),
                            if (_errorMessage != null) ...<Widget>[
                              const SizedBox(height: 12),
                              Text(
                                _errorMessage!,
                                style: const TextStyle(color: _accentBerry, fontWeight: FontWeight.w700),
                              ),
                            ],
                            const SizedBox(height: 18),
                            FilledButton(
                              onPressed: _isSubmitting ? null : _submit,
                              child: Text(_isSubmitting ? 'Signing in...' : 'Enter owner workspace'),
                            ),
                          ],
                        ),
                );

                if (wide) {
                  return Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Expanded(flex: 10, child: left),
                      const SizedBox(width: 18),
                      Expanded(flex: 10, child: right),
                    ],
                  );
                }

                return Column(
                  children: <Widget>[
                    left,
                    const SizedBox(height: 18),
                    right,
                  ],
                );
              },
            ),
          ],
        );
      },
    );
  }
}

class AdminRouteScreen extends StatefulWidget {
  const AdminRouteScreen({
    required this.api,
    required this.currentPath,
    super.key,
  });

  final RrmApiClient api;
  final String currentPath;

  @override
  State<AdminRouteScreen> createState() => _AdminRouteScreenState();
}

class _AdminRouteScreenState extends State<AdminRouteScreen> {
  late Future<JsonMap> _workspaceFuture;

  @override
  void initState() {
    super.initState();
    _workspaceFuture = widget.api.fetchOwnerWorkspace();
  }

  void _refreshWorkspace() {
    setState(() {
      _workspaceFuture = widget.api.fetchOwnerWorkspace(refresh: true);
    });
  }

  Future<void> _signOut() async {
    await widget.api.signOutOwner();

    if (!mounted) {
      return;
    }

    _replaceRoute(context, '/owner-access');
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<JsonMap>(
      future: _workspaceFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState != ConnectionState.done) {
          return const Scaffold(body: LoadingView(message: 'Loading owner workspace...'));
        }

        if (snapshot.hasError) {
          final error = snapshot.error;

          if (error is ApiException && error.statusCode == 401) {
            return PublicShell(
              currentPath: '/owner-access',
              child: MessageCard(
                title: 'Owner sign-in required',
                message: 'The private workspace needs a valid owner session or bearer token before Flutter can read the protected modules.',
                actionLabel: 'Go to owner access',
                onAction: () => _replaceRoute(context, '/owner-access'),
              ),
            );
          }

          return PublicShell(
            currentPath: '/owner-access',
            child: MessageCard(
              title: 'Unable to load the owner workspace',
              message: snapshot.error.toString(),
              actionLabel: 'Retry',
              onAction: () => _replaceRoute(context, widget.currentPath),
            ),
          );
        }

        final workspace = snapshot.requireData;

        return AdminShell(
          currentPath: widget.currentPath,
          onSignOut: _signOut,
          child: _buildSection(context, workspace),
        );
      },
    );
  }

  Widget _buildSection(BuildContext context, JsonMap workspace) {
    switch (widget.currentPath) {
      case '/admin':
        return AdminDashboardBody(workspace: workspace);
      case '/admin/pricing':
        return AdminPricingBody(workspace: workspace);
      case '/admin/costs':
        return AdminCostsBody(workspace: workspace);
      case '/admin/sourcing':
        return AdminSourcingBody(workspace: workspace);
      case '/admin/manufacturing':
        return AdminManufacturingBody(workspace: workspace);
      case '/admin/competitors':
        return AdminCompetitorsBody(workspace: workspace);
      case '/admin/imports':
        return AdminImportsBody(api: widget.api, onImportComplete: _refreshWorkspace);
      default:
        return MessageCard(
          title: 'Owner page not found',
          message: 'The requested private module does not exist in the Flutter route tree.',
          actionLabel: 'Back to dashboard',
          onAction: () => _replaceRoute(context, '/admin'),
          dark: true,
        );
    }
  }
}

class AdminDashboardBody extends StatelessWidget {
  const AdminDashboardBody({required this.workspace, super.key});

  final JsonMap workspace;

  @override
  Widget build(BuildContext context) {
    final dashboard = asJsonMap(workspace['dashboard']);
    final recentRfqs = asJsonMapList(workspace['recentRfqs']);
    final keyCustomers = asJsonMapList(workspace['keyCustomers']);
    final products = asJsonMapList(workspace['products']);
    final internalCostBuckets = asJsonMapList(workspace['internalCostBuckets']);
    final ownerRecords = asJsonMapList(workspace['ownerProductRecords']);
    final totalCosts = _sumField(internalCostBuckets, 'monthlyUsd');
    final totalBenchmarks = ownerRecords.fold<int>(
      0,
      (sum, record) => sum + asJsonMapList(record['competitorBenchmarks']).length,
    );
    final totalRawMaterials = ownerRecords.fold<int>(
      0,
      (sum, record) => sum + asJsonMapList(record['rawMaterials']).length,
    );

    final modules = <JsonMap>[
      <String, dynamic>{
        'route': '/admin/pricing',
        'title': 'Pricing',
        'detail': 'Owner-only regional prices, variant matrices, and price-book notes.',
        'stat': '${products.fold<int>(0, (sum, product) => sum + asJsonMapList(product['variants']).length)} variant prices',
      },
      <String, dynamic>{
        'route': '/admin/costs',
        'title': 'Costs',
        'detail': 'Monthly overhead for labor, power, maintenance, rent, and reserve planning.',
        'stat': _formatCurrency(totalCosts, 'USD'),
      },
      <String, dynamic>{
        'route': '/admin/sourcing',
        'title': 'Sourcing',
        'detail': 'Raw materials, suppliers, origin countries, landed costs, and sourcing notes.',
        'stat': '$totalRawMaterials raw material lines',
      },
      <String, dynamic>{
        'route': '/admin/manufacturing',
        'title': 'Manufacturing',
        'detail': 'Compound codes, cure systems, batch sizes, output, scrap, and QA checks.',
        'stat': '${readInt(dashboard, 'protectedManufacturingRecords')} protected records',
      },
      <String, dynamic>{
        'route': '/admin/competitors',
        'title': 'Competitors',
        'detail': 'Regional dummy benchmark pricing and comparison notes.',
        'stat': '$totalBenchmarks benchmark entries',
      },
      <String, dynamic>{
        'route': '/admin/imports',
        'title': 'Imports',
        'detail': 'CSV template, validation preview, and Prisma-backed import actions.',
        'stat': 'Extended CSV template',
      },
    ];

    return ListView(
      children: <Widget>[
        LayoutBuilder(
          builder: (context, constraints) {
            final wide = constraints.maxWidth >= 1080;
            final hero = SurfacePanel(
              dark: true,
              padding: const EdgeInsets.all(28),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const <Widget>[
                  SectionHeading(
                    eyebrow: 'Dashboard',
                    title: 'A cleaner back-room dashboard for pricing, sourcing, and protected records.',
                    description: 'This area stays behind the server-side gate and keeps internal price books, chemistry notes, competitor records, and RFQ handling logic out of the public storefront.',
                    dark: true,
                  ),
                  SizedBox(height: 14),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: <Widget>[
                      PillChip(label: 'Private price books', dark: true),
                      PillChip(label: 'Protected manufacturing', dark: true),
                      PillChip(label: 'RFQ queue', dark: true),
                    ],
                  ),
                ],
              ),
            );

            final stats = ResponsiveWrap(
              phone: 2,
              tablet: 2,
              desktop: 2,
              wide: 2,
              children: <Widget>[
                MetricCard(label: 'Open RFQs', value: '${readInt(dashboard, 'pendingRfqs')}', dark: true),
                MetricCard(label: 'Active customers', value: '${readInt(dashboard, 'activeCustomers')}', dark: true),
                MetricCard(label: 'Cataloged variants', value: '${readInt(dashboard, 'catalogedVariants')}', dark: true),
                MetricCard(label: 'Protected records', value: '${readInt(dashboard, 'protectedManufacturingRecords')}', dark: true),
              ],
            );

            if (wide) {
              return Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Expanded(flex: 11, child: hero),
                  const SizedBox(width: 18),
                  Expanded(flex: 9, child: stats),
                ],
              );
            }

            return Column(
              children: <Widget>[
                hero,
                const SizedBox(height: 18),
                stats,
              ],
            );
          },
        ),
        const SizedBox(height: 22),
        LayoutBuilder(
          builder: (context, constraints) {
            final wide = constraints.maxWidth >= 1080;
            final modulesPanel = SurfacePanel(
              dark: true,
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  const SectionHeading(
                    eyebrow: 'Owner modules',
                    title: 'Private data pages now mirrored in Flutter.',
                    description: 'Each module reads the same backend data while staying visually aligned with the storefront palette.',
                    dark: true,
                  ),
                  const SizedBox(height: 18),
                  ResponsiveWrap(
                    phone: 1,
                    tablet: 2,
                    desktop: 2,
                    wide: 2,
                    children: modules
                        .map(
                          (module) => SurfacePanel(
                            dark: true,
                            padding: const EdgeInsets.all(20),
                            child: InkWell(
                              onTap: () => _replaceRoute(context, readString(module, 'route')),
                              borderRadius: BorderRadius.circular(24),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: <Widget>[
                                  Text(
                                    readString(module, 'stat'),
                                    style: TextStyle(
                                      color: Colors.white.withOpacity(0.55),
                                      fontSize: 12,
                                      fontWeight: FontWeight.w800,
                                      letterSpacing: 1.5,
                                    ),
                                  ),
                                  const SizedBox(height: 10),
                                  Text(
                                    readString(module, 'title'),
                                    style: Theme.of(context).textTheme.titleLarge?.copyWith(color: _inkInverse),
                                  ),
                                  const SizedBox(height: 10),
                                  Text(
                                    readString(module, 'detail'),
                                    style: TextStyle(color: Colors.white.withOpacity(0.72), height: 1.5),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        )
                        .toList(growable: false),
                  ),
                ],
              ),
            );
            final summaryPanel = SurfacePanel(
              dark: true,
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  const SectionHeading(
                    eyebrow: 'Workspace summary',
                    title: 'Dummy data depth carried into the migrated admin surface.',
                    dark: true,
                  ),
                  const SizedBox(height: 18),
                  ...<JsonMap>[
                    <String, dynamic>{
                      'title': '${products.length} products in dummy catalog',
                      'detail': 'The product seed layer now includes dimensions, supply formats, technical profiles, and 3D preview metadata.',
                    },
                    <String, dynamic>{
                      'title': '${_formatCurrency(totalCosts, 'USD')} monthly owner-only overhead',
                      'detail': 'Rent, electricity, labor, maintenance, and equipment reserve stay split out into dedicated owner views.',
                    },
                    <String, dynamic>{
                      'title': 'Extended CSV import template ready',
                      'detail': 'The import workflow supports owner-only columns for sourcing, process records, QA, and competitor benchmarks.',
                    },
                  ].map(
                    (item) => Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: SurfacePanel(
                        dark: true,
                        padding: const EdgeInsets.all(18),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: <Widget>[
                            Text(
                              readString(item, 'title'),
                              style: Theme.of(context).textTheme.titleLarge?.copyWith(color: _inkInverse),
                            ),
                            const SizedBox(height: 10),
                            Text(
                              readString(item, 'detail'),
                              style: TextStyle(color: Colors.white.withOpacity(0.72), height: 1.5),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            );

            if (wide) {
              return Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Expanded(flex: 11, child: modulesPanel),
                  const SizedBox(width: 18),
                  Expanded(flex: 9, child: summaryPanel),
                ],
              );
            }

            return Column(
              children: <Widget>[
                modulesPanel,
                const SizedBox(height: 18),
                summaryPanel,
              ],
            );
          },
        ),
        const SizedBox(height: 22),
        LayoutBuilder(
          builder: (context, constraints) {
            final wide = constraints.maxWidth >= 1080;
            final rfqPanel = SurfacePanel(
              dark: true,
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  const SectionHeading(
                    eyebrow: 'Recent RFQ queue',
                    title: 'Live owner queue snapshot.',
                    dark: true,
                  ),
                  const SizedBox(height: 16),
                  ...recentRfqs.map(
                    (rfq) => Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: SurfacePanel(
                        dark: true,
                        padding: const EdgeInsets.all(18),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: <Widget>[
                            Text(
                              '${readString(rfq, 'reference')} · ${readString(rfq, 'company')}',
                              style: const TextStyle(color: _inkInverse, fontWeight: FontWeight.w800),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              readString(rfq, 'requestedProduct'),
                              style: TextStyle(color: Colors.white.withOpacity(0.72), height: 1.5),
                            ),
                            const SizedBox(height: 12),
                            Wrap(
                              spacing: 8,
                              runSpacing: 8,
                              children: <Widget>[
                                PillChip(label: readString(rfq, 'market'), dark: true),
                                PillChip(label: readString(rfq, 'quantity'), dark: true),
                                PillChip(label: readString(rfq, 'source'), dark: true),
                                PillChip(label: readString(rfq, 'status'), dark: true),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            );
            final customerPanel = SurfacePanel(
              dark: true,
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  const SectionHeading(
                    eyebrow: 'Customer pipeline snapshot',
                    title: 'Who is moving through the quote funnel.',
                    dark: true,
                  ),
                  const SizedBox(height: 16),
                  ...keyCustomers.map(
                    (customer) => Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: SurfacePanel(
                        dark: true,
                        padding: const EdgeInsets.all(18),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: <Widget>[
                            Text(
                              readString(customer, 'company'),
                              style: const TextStyle(color: _inkInverse, fontWeight: FontWeight.w800),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              readString(customer, 'demand'),
                              style: TextStyle(color: Colors.white.withOpacity(0.72), height: 1.5),
                            ),
                            const SizedBox(height: 12),
                            Wrap(
                              spacing: 8,
                              runSpacing: 8,
                              children: <Widget>[
                                PillChip(label: readString(customer, 'segment'), dark: true),
                                PillChip(label: readString(customer, 'market'), dark: true),
                                PillChip(label: readString(customer, 'relationship'), dark: true),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            );

            if (wide) {
              return Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Expanded(flex: 11, child: rfqPanel),
                  const SizedBox(width: 18),
                  Expanded(flex: 9, child: customerPanel),
                ],
              );
            }

            return Column(
              children: <Widget>[
                rfqPanel,
                const SizedBox(height: 18),
                customerPanel,
              ],
            );
          },
        ),
      ],
    );
  }
}

class AdminPricingBody extends StatelessWidget {
  const AdminPricingBody({required this.workspace, super.key});

  final JsonMap workspace;

  @override
  Widget build(BuildContext context) {
    final products = asJsonMapList(workspace['products']);
    final ownerRecords = _ownerRecordsBySlug(workspace);

    return ListView(
      children: <Widget>[
        SurfacePanel(
          dark: true,
          padding: const EdgeInsets.all(26),
          child: const SectionHeading(
            eyebrow: 'Pricing',
            title: 'Owner-only regional price books',
            description: 'Dummy variant prices stay tracked in AED, SAR, OMR, QAR, and USD. Public pages remain quote-first while the private Flutter workspace keeps the full internal matrix and price-book notes.',
            dark: true,
          ),
        ),
        const SizedBox(height: 18),
        ...products.map((product) {
          final ownerRecord = ownerRecords[readString(product, 'slug')];
          final variants = asJsonMapList(product['variants']);

          return Padding(
            padding: const EdgeInsets.only(bottom: 18),
            child: SurfacePanel(
              dark: true,
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Row(
                    children: <Widget>[
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: <Widget>[
                            Text(
                              readString(product, 'category'),
                              style: TextStyle(
                                color: Colors.white.withOpacity(0.46),
                                fontSize: 12,
                                fontWeight: FontWeight.w800,
                                letterSpacing: 1.6,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              readString(product, 'name'),
                              style: Theme.of(context).textTheme.headlineSmall?.copyWith(color: _inkInverse),
                            ),
                            const SizedBox(height: 10),
                            Text(
                              ownerRecord == null ? 'Price-book notes not available.' : readString(ownerRecord, 'priceBookNotes'),
                              style: TextStyle(color: Colors.white.withOpacity(0.72), height: 1.5),
                            ),
                          ],
                        ),
                      ),
                      PillChip(label: '${variants.length} variants', dark: true),
                    ],
                  ),
                  const SizedBox(height: 16),
                  ResponsiveWrap(
                    phone: 1,
                    tablet: 1,
                    desktop: 2,
                    wide: 2,
                    children: variants
                        .map(
                          (variant) => SurfacePanel(
                            dark: true,
                            padding: const EdgeInsets.all(18),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: <Widget>[
                                Text(
                                  readString(variant, 'code'),
                                  style: const TextStyle(color: _inkInverse, fontWeight: FontWeight.w800),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  readString(variant, 'description'),
                                  style: TextStyle(color: Colors.white.withOpacity(0.72), height: 1.5),
                                ),
                                const SizedBox(height: 12),
                                ...asJsonMapList(variant['dimensions']).map(
                                  (dimension) => Padding(
                                    padding: const EdgeInsets.only(bottom: 6),
                                    child: Text(
                                      '${readString(dimension, 'label')}: ${readString(dimension, 'value')}',
                                      style: TextStyle(color: Colors.white.withOpacity(0.72)),
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 10),
                                Text(
                                  'MOQ ${readInt(variant, 'minimumOrderQuantity')}',
                                  style: const TextStyle(color: _accentWarm, fontWeight: FontWeight.w800),
                                ),
                                const SizedBox(height: 12),
                                Wrap(
                                  spacing: 8,
                                  runSpacing: 8,
                                  children: <String>['AED', 'SAR', 'OMR', 'QAR', 'USD']
                                      .map(
                                        (currency) => PillChip(
                                          label: _formatCurrency(asJsonMap(variant['priceBook'])[currency], currency),
                                          dark: true,
                                        ),
                                      )
                                      .toList(growable: false),
                                ),
                              ],
                            ),
                          ),
                        )
                        .toList(growable: false),
                  ),
                ],
              ),
            ),
          );
        }),
      ],
    );
  }
}

class AdminCostsBody extends StatelessWidget {
  const AdminCostsBody({required this.workspace, super.key});

  final JsonMap workspace;

  @override
  Widget build(BuildContext context) {
    final buckets = asJsonMapList(workspace['internalCostBuckets']);
    final ownerRecords = asJsonMapList(workspace['ownerProductRecords']);
    final total = _sumField(buckets, 'monthlyUsd');

    return ListView(
      children: <Widget>[
        SurfacePanel(
          dark: true,
          padding: const EdgeInsets.all(26),
          child: Row(
            children: <Widget>[
              const Expanded(
                child: SectionHeading(
                  eyebrow: 'Costs',
                  title: 'Rent, electricity, labor, maintenance, and reserve planning',
                  description: 'Dummy owner-only cost data stays separated from the public catalog so overhead assumptions can be reviewed without mixing them into customer-facing pages.',
                  dark: true,
                ),
              ),
              MetricCard(label: 'Monthly total', value: _formatCurrency(total, 'USD'), dark: true),
            ],
          ),
        ),
        const SizedBox(height: 18),
        LayoutBuilder(
          builder: (context, constraints) {
            final wide = constraints.maxWidth >= 1080;
            final left = SurfacePanel(
              dark: true,
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  const SectionHeading(
                    eyebrow: 'Overhead buckets',
                    title: 'Monthly cost assumptions by bucket',
                    dark: true,
                  ),
                  const SizedBox(height: 16),
                  ...buckets.map(
                    (bucket) => Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: SurfacePanel(
                        dark: true,
                        padding: const EdgeInsets.all(18),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: <Widget>[
                            Row(
                              children: <Widget>[
                                Expanded(
                                  child: Text(
                                    readString(bucket, 'title'),
                                    style: const TextStyle(color: _inkInverse, fontWeight: FontWeight.w800),
                                  ),
                                ),
                                Text(
                                  _formatCurrency(readDouble(bucket, 'monthlyUsd'), 'USD'),
                                  style: const TextStyle(color: _accentWarm, fontWeight: FontWeight.w800),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Text(
                              readString(bucket, 'note'),
                              style: TextStyle(color: Colors.white.withOpacity(0.72), height: 1.5),
                            ),
                            const SizedBox(height: 10),
                            Wrap(
                              spacing: 8,
                              runSpacing: 8,
                              children: <Widget>[
                                PillChip(label: readString(bucket, 'costCenter'), dark: true),
                                PillChip(label: readString(bucket, 'allocationBasis'), dark: true),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            );
            final right = SurfacePanel(
              dark: true,
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  const SectionHeading(
                    eyebrow: 'Product cost allocation',
                    title: 'How overhead lands inside each owner record',
                    dark: true,
                  ),
                  const SizedBox(height: 16),
                  ...ownerRecords.map(
                    (record) => Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: SurfacePanel(
                        dark: true,
                        padding: const EdgeInsets.all(18),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: <Widget>[
                            Text(
                              readString(record, 'slug'),
                              style: const TextStyle(color: _inkInverse, fontWeight: FontWeight.w800),
                            ),
                            const SizedBox(height: 12),
                            ...asJsonMapList(record['overheadAllocation']).map(
                              (allocation) => Padding(
                                padding: const EdgeInsets.only(bottom: 10),
                                child: Container(
                                  padding: const EdgeInsets.all(14),
                                  decoration: BoxDecoration(
                                    color: Colors.white.withOpacity(0.06),
                                    borderRadius: BorderRadius.circular(18),
                                    border: Border.all(color: Colors.white.withOpacity(0.08)),
                                  ),
                                  child: Row(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: <Widget>[
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: <Widget>[
                                            Text(
                                              readString(allocation, 'label'),
                                              style: const TextStyle(color: _inkInverse, fontWeight: FontWeight.w800),
                                            ),
                                            const SizedBox(height: 6),
                                            Text(
                                              readString(allocation, 'allocationBasis'),
                                              style: TextStyle(color: Colors.white.withOpacity(0.72), height: 1.4),
                                            ),
                                          ],
                                        ),
                                      ),
                                      const SizedBox(width: 12),
                                      Text(
                                        _formatCurrency(readDouble(allocation, 'monthlyUsd'), 'USD'),
                                        style: const TextStyle(color: _accentWarm, fontWeight: FontWeight.w800),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            );

            if (wide) {
              return Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Expanded(flex: 11, child: left),
                  const SizedBox(width: 18),
                  Expanded(flex: 9, child: right),
                ],
              );
            }

            return Column(
              children: <Widget>[
                left,
                const SizedBox(height: 18),
                right,
              ],
            );
          },
        ),
      ],
    );
  }
}

class AdminSourcingBody extends StatelessWidget {
  const AdminSourcingBody({required this.workspace, super.key});

  final JsonMap workspace;

  @override
  Widget build(BuildContext context) {
    final products = <String, JsonMap>{
      for (final product in asJsonMapList(workspace['products'])) readString(product, 'slug'): product,
    };
    final ownerRecords = asJsonMapList(workspace['ownerProductRecords']);

    return ListView(
      children: <Widget>[
        const SurfacePanel(
          dark: true,
          padding: EdgeInsets.all(26),
          child: SectionHeading(
            eyebrow: 'Sourcing',
            title: 'Raw materials, suppliers, origins, and landed costs',
            description: 'This Flutter page keeps the owner-only sourcing layer together: what material is used, where it comes from, how it is sourced, what it costs, and how long it takes to arrive.',
            dark: true,
          ),
        ),
        const SizedBox(height: 18),
        ...ownerRecords.map((record) {
          final product = products[readString(record, 'slug')];
          final rawMaterials = asJsonMapList(record['rawMaterials']);

          return Padding(
            padding: const EdgeInsets.only(bottom: 18),
            child: SurfacePanel(
              dark: true,
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Row(
                    children: <Widget>[
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: <Widget>[
                            Text(
                              product == null ? readString(record, 'slug') : readString(product, 'name'),
                              style: Theme.of(context).textTheme.headlineSmall?.copyWith(color: _inkInverse),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              product == null ? '' : readString(product, 'material'),
                              style: TextStyle(color: Colors.white.withOpacity(0.46), fontWeight: FontWeight.w800),
                            ),
                            const SizedBox(height: 10),
                            Text(
                              readString(record, 'priceBookNotes'),
                              style: TextStyle(color: Colors.white.withOpacity(0.72), height: 1.5),
                            ),
                          ],
                        ),
                      ),
                      PillChip(label: '${rawMaterials.length} materials', dark: true),
                    ],
                  ),
                  const SizedBox(height: 16),
                  ResponsiveWrap(
                    phone: 1,
                    tablet: 2,
                    desktop: 2,
                    wide: 2,
                    children: rawMaterials
                        .map(
                          (material) => SurfacePanel(
                            dark: true,
                            padding: const EdgeInsets.all(18),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: <Widget>[
                                Row(
                                  children: <Widget>[
                                    Expanded(
                                      child: Text(
                                        readString(material, 'name'),
                                        style: const TextStyle(color: _inkInverse, fontWeight: FontWeight.w800),
                                      ),
                                    ),
                                    Text(
                                      readString(material, 'percentage'),
                                      style: const TextStyle(color: _accentWarm, fontWeight: FontWeight.w800),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 10),
                                Text(
                                  '${readString(material, 'supplier')} · ${readString(material, 'origin')}',
                                  style: TextStyle(color: Colors.white.withOpacity(0.72), height: 1.5),
                                ),
                                const SizedBox(height: 10),
                                Wrap(
                                  spacing: 8,
                                  runSpacing: 8,
                                  children: <Widget>[
                                    PillChip(label: readString(material, 'sourceType'), dark: true),
                                    PillChip(
                                      label: '${_formatCurrency(readDouble(material, 'landedCostUsdPerKg'), 'USD')}/kg',
                                      dark: true,
                                    ),
                                    PillChip(label: '${readInt(material, 'leadTimeDays')} days', dark: true),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        )
                        .toList(growable: false),
                  ),
                  const SizedBox(height: 16),
                  SurfacePanel(
                    dark: true,
                    padding: const EdgeInsets.all(18),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        const Text(
                          'SOURCING NOTES',
                          style: TextStyle(color: _inkInverse, fontWeight: FontWeight.w800, letterSpacing: 1.5),
                        ),
                        const SizedBox(height: 12),
                        ...asStringList(record['sourcingNotes']).map(
                          (note) => Padding(
                            padding: const EdgeInsets.only(bottom: 8),
                            child: Text(note, style: TextStyle(color: Colors.white.withOpacity(0.72), height: 1.5)),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          );
        }),
      ],
    );
  }
}

class AdminManufacturingBody extends StatelessWidget {
  const AdminManufacturingBody({required this.workspace, super.key});

  final JsonMap workspace;

  @override
  Widget build(BuildContext context) {
    final products = <String, JsonMap>{
      for (final product in asJsonMapList(workspace['products'])) readString(product, 'slug'): product,
    };
    final ownerRecords = asJsonMapList(workspace['ownerProductRecords']);

    return ListView(
      children: <Widget>[
        const SurfacePanel(
          dark: true,
          padding: EdgeInsets.all(26),
          child: SectionHeading(
            eyebrow: 'Manufacturing',
            title: 'Compound, cure, batch, output, and QA dummy records',
            description: 'This is the owner-only process view for how products are made. Compound codes, cure systems, batch sizes, output assumptions, scrap, and QA checks stay out of the public catalog.',
            dark: true,
          ),
        ),
        const SizedBox(height: 18),
        ...ownerRecords.map((record) {
          final product = products[readString(record, 'slug')];
          final process = asJsonMap(record['process']);
          final rawMaterials = asJsonMapList(record['rawMaterials']);
          final overhead = asJsonMapList(record['overheadAllocation']);

          return Padding(
            padding: const EdgeInsets.only(bottom: 18),
            child: SurfacePanel(
              dark: true,
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Row(
                    children: <Widget>[
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: <Widget>[
                            Text(
                              readString(process, 'compoundCode'),
                              style: TextStyle(color: Colors.white.withOpacity(0.46), fontWeight: FontWeight.w800),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              product == null ? readString(record, 'slug') : readString(product, 'name'),
                              style: Theme.of(context).textTheme.headlineSmall?.copyWith(color: _inkInverse),
                            ),
                            const SizedBox(height: 10),
                            Text(
                              readString(process, 'cureSystem'),
                              style: TextStyle(color: Colors.white.withOpacity(0.72), height: 1.5),
                            ),
                          ],
                        ),
                      ),
                      PillChip(label: 'Scrap ${readString(process, 'scrapRate')}', dark: true),
                    ],
                  ),
                  const SizedBox(height: 16),
                  ResponsiveWrap(
                    phone: 2,
                    tablet: 2,
                    desktop: 4,
                    wide: 4,
                    children: <Widget>[
                      MetricCard(label: 'Batch size', value: '${readInt(process, 'batchSizeKg')} kg', dark: true),
                      MetricCard(label: 'Monthly output', value: '${readInt(process, 'monthlyOutputKg')} kg', dark: true),
                      MetricCard(label: 'Raw materials', value: '${rawMaterials.length} lines', dark: true),
                      MetricCard(label: 'Allocated overhead', value: _formatCurrency(_sumField(overhead, 'monthlyUsd'), 'USD'), dark: true),
                    ],
                  ),
                  const SizedBox(height: 16),
                  ResponsiveWrap(
                    phone: 1,
                    tablet: 2,
                    desktop: 2,
                    wide: 2,
                    children: <Widget>[
                      SurfacePanel(
                        dark: true,
                        padding: const EdgeInsets.all(18),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: <Widget>[
                            const Text(
                              'QA CHECKS',
                              style: TextStyle(color: _inkInverse, fontWeight: FontWeight.w800, letterSpacing: 1.5),
                            ),
                            const SizedBox(height: 12),
                            ...asStringList(process['qaChecks']).map(
                              (check) => Padding(
                                padding: const EdgeInsets.only(bottom: 8),
                                child: Text(check, style: TextStyle(color: Colors.white.withOpacity(0.72), height: 1.5)),
                              ),
                            ),
                          ],
                        ),
                      ),
                      SurfacePanel(
                        dark: true,
                        padding: const EdgeInsets.all(18),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: <Widget>[
                            const Text(
                              'RAW MATERIAL RATIO SNAPSHOT',
                              style: TextStyle(color: _inkInverse, fontWeight: FontWeight.w800, letterSpacing: 1.5),
                            ),
                            const SizedBox(height: 12),
                            ...rawMaterials.map(
                              (material) => Padding(
                                padding: const EdgeInsets.only(bottom: 10),
                                child: Container(
                                  padding: const EdgeInsets.all(14),
                                  decoration: BoxDecoration(
                                    color: Colors.white.withOpacity(0.06),
                                    borderRadius: BorderRadius.circular(18),
                                    border: Border.all(color: Colors.white.withOpacity(0.08)),
                                  ),
                                  child: Row(
                                    children: <Widget>[
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: <Widget>[
                                            Text(
                                              readString(material, 'name'),
                                              style: const TextStyle(color: _inkInverse, fontWeight: FontWeight.w800),
                                            ),
                                            const SizedBox(height: 4),
                                            Text(
                                              readString(material, 'supplier'),
                                              style: TextStyle(color: Colors.white.withOpacity(0.58), fontSize: 12),
                                            ),
                                          ],
                                        ),
                                      ),
                                      Text(
                                        readString(material, 'percentage'),
                                        style: const TextStyle(color: _accentWarm, fontWeight: FontWeight.w800),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          );
        }),
      ],
    );
  }
}

class AdminCompetitorsBody extends StatelessWidget {
  const AdminCompetitorsBody({required this.workspace, super.key});

  final JsonMap workspace;

  @override
  Widget build(BuildContext context) {
    final products = <String, JsonMap>{
      for (final product in asJsonMapList(workspace['products'])) readString(product, 'slug'): product,
    };
    final ownerRecords = asJsonMapList(workspace['ownerProductRecords']);

    return ListView(
      children: <Widget>[
        const SurfacePanel(
          dark: true,
          padding: EdgeInsets.all(26),
          child: SectionHeading(
            eyebrow: 'Competitors',
            title: 'Private competitor benchmark pricing',
            description: 'Dummy benchmark entries are grouped by product and market so sales can compare owner price books against regional competitor signals without exposing any of it publicly.',
            dark: true,
          ),
        ),
        const SizedBox(height: 18),
        ...ownerRecords.map((record) {
          final product = products[readString(record, 'slug')];
          final benchmarks = asJsonMapList(record['competitorBenchmarks']);

          return Padding(
            padding: const EdgeInsets.only(bottom: 18),
            child: SurfacePanel(
              dark: true,
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Row(
                    children: <Widget>[
                      Expanded(
                        child: Text(
                          product == null ? readString(record, 'slug') : readString(product, 'name'),
                          style: Theme.of(context).textTheme.headlineSmall?.copyWith(color: _inkInverse),
                        ),
                      ),
                      PillChip(label: '${benchmarks.length} benchmarks', dark: true),
                    ],
                  ),
                  const SizedBox(height: 16),
                  ResponsiveWrap(
                    phone: 1,
                    tablet: 2,
                    desktop: 2,
                    wide: 2,
                    children: benchmarks
                        .map(
                          (benchmark) => SurfacePanel(
                            dark: true,
                            padding: const EdgeInsets.all(18),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: <Widget>[
                                Row(
                                  children: <Widget>[
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: <Widget>[
                                          Text(
                                            readString(benchmark, 'market'),
                                            style: TextStyle(color: Colors.white.withOpacity(0.46), fontWeight: FontWeight.w800),
                                          ),
                                          const SizedBox(height: 8),
                                          Text(
                                            readString(benchmark, 'competitor'),
                                            style: const TextStyle(color: _inkInverse, fontWeight: FontWeight.w800),
                                          ),
                                        ],
                                      ),
                                    ),
                                    Text(
                                      _formatCurrency(readDouble(benchmark, 'unitPrice'), readString(benchmark, 'currency')),
                                      style: const TextStyle(color: _accentWarm, fontWeight: FontWeight.w800),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 12),
                                Text(
                                  readString(benchmark, 'note'),
                                  style: TextStyle(color: Colors.white.withOpacity(0.72), height: 1.5),
                                ),
                              ],
                            ),
                          ),
                        )
                        .toList(growable: false),
                  ),
                ],
              ),
            ),
          );
        }),
      ],
    );
  }
}

class AdminImportsBody extends StatefulWidget {
  const AdminImportsBody({
    required this.api,
    required this.onImportComplete,
    super.key,
  });

  final RrmApiClient api;
  final VoidCallback onImportComplete;

  @override
  State<AdminImportsBody> createState() => _AdminImportsBodyState();
}

class _AdminImportsBodyState extends State<AdminImportsBody> {
  late final Future<JsonMap> _metaFuture;
  final TextEditingController _fileNameController = TextEditingController(text: 'sample-template.csv');
  final TextEditingController _csvController = TextEditingController();
  JsonMap? _meta;
  JsonMap? _preview;
  bool _isPreviewing = false;
  bool _isImporting = false;
  bool _isExporting = false;
  bool _seededFromMeta = false;
  String? _statusMessage;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _metaFuture = widget.api.fetchImportMeta();
  }

  @override
  void dispose() {
    _fileNameController.dispose();
    _csvController.dispose();
    super.dispose();
  }

  Future<void> _seedFromMeta(JsonMap meta) async {
    if (_seededFromMeta) {
      return;
    }

    _seededFromMeta = true;
    _meta = meta;
    _csvController.text = readString(meta, 'sampleCsvText');
    _fileNameController.text = 'sample-template.csv';
    await _previewCurrent();
  }

  Future<void> _previewCurrent() async {
    setState(() {
      _isPreviewing = true;
      _errorMessage = null;
      _statusMessage = null;
    });

    try {
      final preview = await widget.api.previewImport(
        _csvController.text,
        _fileNameController.text.trim().isEmpty ? 'uploaded.csv' : _fileNameController.text.trim(),
      );

      if (!mounted) {
        return;
      }

      setState(() {
        _preview = preview;
      });
    } catch (error) {
      if (!mounted) {
        return;
      }

      setState(() {
        _errorMessage = error.toString();
      });
    } finally {
      if (mounted) {
        setState(() => _isPreviewing = false);
      }
    }
  }

  Future<void> _resetToSample() async {
    final meta = _meta;
    if (meta == null) {
      return;
    }

    _csvController.text = readString(meta, 'sampleCsvText');
    _fileNameController.text = 'sample-template.csv';
    await _previewCurrent();
  }

  Future<void> _loadCurrentCatalogExport() async {
    setState(() {
      _isExporting = true;
      _errorMessage = null;
      _statusMessage = null;
    });

    try {
      final csvText = await widget.api.exportCatalogCsv();

      if (!mounted) {
        return;
      }

      setState(() {
        _csvController.text = csvText;
        _fileNameController.text = 'rrm-catalog-export.csv';
      });
      await _previewCurrent();
    } catch (error) {
      if (!mounted) {
        return;
      }

      setState(() {
        _errorMessage = error.toString();
      });
    } finally {
      if (mounted) {
        setState(() => _isExporting = false);
      }
    }
  }

  Future<void> _commitImport() async {
    final preview = _preview;
    if (preview == null || readInt(preview, 'successfulCount') == 0) {
      return;
    }

    setState(() {
      _isImporting = true;
      _errorMessage = null;
      _statusMessage = null;
    });

    try {
      final result = await widget.api.commitImport(preview);

      if (!mounted) {
        return;
      }

      setState(() {
        _statusMessage = readString(result, 'message');
      });
      widget.onImportComplete();
    } catch (error) {
      if (!mounted) {
        return;
      }

      setState(() {
        _errorMessage = error.toString();
      });
    } finally {
      if (mounted) {
        setState(() => _isImporting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<JsonMap>(
      future: _metaFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState != ConnectionState.done) {
          return const LoadingView(message: 'Loading import workspace...');
        }

        if (snapshot.hasError) {
          return MessageCard(
            title: 'Unable to load import metadata',
            message: snapshot.error.toString(),
            actionLabel: 'Retry',
            onAction: () => _replaceRoute(context, '/admin/imports'),
            dark: true,
          );
        }

        final meta = snapshot.requireData;

        if (!_seededFromMeta) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            _seedFromMeta(meta);
          });
        }

        final preview = _preview;

        return ListView(
          children: <Widget>[
            SurfacePanel(
              dark: true,
              padding: const EdgeInsets.all(26),
              child: Row(
                children: <Widget>[
                  const Expanded(
                    child: SectionHeading(
                      eyebrow: 'Imports',
                      title: 'Extended CSV import template for public and owner-only dummy data',
                      description: 'Upload or paste a CSV, preview normalized rows, then import valid records into Prisma without leaving the Flutter workspace.',
                      dark: true,
                    ),
                  ),
                  OutlinedButton(
                    onPressed: () async {
                      final exportUrl = '${widget.api.baseUrl}${readString(meta, 'exportUrl')}';
                      await Clipboard.setData(ClipboardData(text: exportUrl));
                      if (!context.mounted) {
                        return;
                      }
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Export endpoint copied to the clipboard.')),
                      );
                    },
                    style: OutlinedButton.styleFrom(
                      foregroundColor: _inkInverse,
                      side: BorderSide(color: Colors.white.withOpacity(0.14)),
                    ),
                    child: const Text('Copy export URL'),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),
            LayoutBuilder(
              builder: (context, constraints) {
                final wide = constraints.maxWidth >= 1080;
                final uploadPanel = SurfacePanel(
                  dark: true,
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      const SectionHeading(
                        eyebrow: 'Upload and preview',
                        title: 'Paste CSV text and validate rows before any database step.',
                        dark: true,
                      ),
                      const SizedBox(height: 18),
                      TextField(
                        controller: _fileNameController,
                        decoration: const InputDecoration(labelText: 'File name'),
                      ),
                      const SizedBox(height: 14),
                      TextField(
                        controller: _csvController,
                        minLines: 16,
                        maxLines: 22,
                        style: const TextStyle(fontFamily: 'monospace', fontSize: 13),
                        decoration: const InputDecoration(labelText: 'CSV text'),
                      ),
                      const SizedBox(height: 16),
                      Wrap(
                        spacing: 10,
                        runSpacing: 10,
                        children: <Widget>[
                          FilledButton(
                            onPressed: _isPreviewing ? null : _previewCurrent,
                            child: Text(_isPreviewing ? 'Parsing...' : 'Parse current CSV'),
                          ),
                          OutlinedButton(
                            onPressed: _resetToSample,
                            style: OutlinedButton.styleFrom(
                              foregroundColor: _inkInverse,
                              side: BorderSide(color: Colors.white.withOpacity(0.14)),
                            ),
                            child: const Text('Reset to sample'),
                          ),
                          OutlinedButton(
                            onPressed: _isExporting ? null : _loadCurrentCatalogExport,
                            style: OutlinedButton.styleFrom(
                              foregroundColor: _inkInverse,
                              side: BorderSide(color: Colors.white.withOpacity(0.14)),
                            ),
                            child: Text(_isExporting ? 'Loading export...' : 'Load current catalog CSV'),
                          ),
                        ],
                      ),
                    ],
                  ),
                );

                final headersPanel = SurfacePanel(
                  dark: true,
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      const SectionHeading(
                        eyebrow: 'CSV columns',
                        title: 'Public and owner-only headers stay explicit.',
                        dark: true,
                      ),
                      const SizedBox(height: 18),
                      Text('Public/shared columns', style: Theme.of(context).textTheme.titleLarge?.copyWith(color: _inkInverse)),
                      const SizedBox(height: 10),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: asStringList(meta['productImportHeaders'])
                            .map((header) => PillChip(label: header, dark: true))
                            .toList(growable: false),
                      ),
                      const SizedBox(height: 18),
                      Text('Owner-only columns', style: Theme.of(context).textTheme.titleLarge?.copyWith(color: _inkInverse)),
                      const SizedBox(height: 10),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: asStringList(meta['ownerOnlyImportHeaders'])
                            .map((header) => PillChip(label: header, dark: true))
                            .toList(growable: false),
                      ),
                    ],
                  ),
                );

                if (wide) {
                  return Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Expanded(flex: 9, child: uploadPanel),
                      const SizedBox(width: 18),
                      Expanded(flex: 11, child: headersPanel),
                    ],
                  );
                }

                return Column(
                  children: <Widget>[
                    uploadPanel,
                    const SizedBox(height: 18),
                    headersPanel,
                  ],
                );
              },
            ),
            const SizedBox(height: 18),
            if (_errorMessage != null)
              Padding(
                padding: const EdgeInsets.only(bottom: 18),
                child: MessageCard(
                  title: 'Import action failed',
                  message: _errorMessage!,
                  dark: true,
                ),
              ),
            if (_statusMessage != null)
              Padding(
                padding: const EdgeInsets.only(bottom: 18),
                child: MessageCard(
                  title: 'Import status',
                  message: _statusMessage!,
                  dark: true,
                ),
              ),
            if (preview == null)
              const LoadingView(message: 'Preparing CSV preview...')
            else ...<Widget>[
              ResponsiveWrap(
                phone: 2,
                tablet: 4,
                desktop: 4,
                wide: 4,
                children: <Widget>[
                  MetricCard(label: 'File', value: readString(preview, 'fileName'), dark: true),
                  MetricCard(label: 'Rows detected', value: '${readInt(preview, 'rowCount')}', dark: true),
                  MetricCard(label: 'Valid rows', value: '${readInt(preview, 'successfulCount')}', dark: true),
                  MetricCard(label: 'Issues', value: '${readInt(preview, 'failedCount')}', dark: true),
                ],
              ),
              const SizedBox(height: 18),
              LayoutBuilder(
                builder: (context, constraints) {
                  final wide = constraints.maxWidth >= 1080;
                  final rows = asJsonMapList(preview['rows']);
                  final previewPanel = SurfacePanel(
                    dark: true,
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        Row(
                          children: <Widget>[
                            const Expanded(
                              child: SectionHeading(
                                eyebrow: 'Normalized preview',
                                title: 'First valid rows after parsing and normalization.',
                                dark: true,
                              ),
                            ),
                            FilledButton(
                              onPressed: _isImporting || readInt(preview, 'successfulCount') == 0 ? null : _commitImport,
                              child: Text(_isImporting ? 'Importing...' : 'Import valid rows'),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        if (rows.isEmpty)
                          const Text(
                            'No valid rows parsed yet.',
                            style: TextStyle(color: _mutedColor),
                          )
                        else
                          ...rows.take(5).map(
                            (row) {
                              final product = asJsonMap(row['product']);
                              final variant = asJsonMap(row['variant']);
                              final owner = asJsonMap(row['owner']);
                              final process = asJsonMap(owner['process']);

                              return Padding(
                                padding: const EdgeInsets.only(bottom: 12),
                                child: SurfacePanel(
                                  dark: true,
                                  padding: const EdgeInsets.all(18),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: <Widget>[
                                      Row(
                                        children: <Widget>[
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: <Widget>[
                                                Text(
                                                  readString(row, 'slug'),
                                                  style: TextStyle(color: Colors.white.withOpacity(0.46), fontWeight: FontWeight.w800),
                                                ),
                                                const SizedBox(height: 8),
                                                Text(
                                                  readString(product, 'name'),
                                                  style: const TextStyle(color: _inkInverse, fontWeight: FontWeight.w800),
                                                ),
                                                const SizedBox(height: 8),
                                                Text(
                                                  readString(product, 'summary'),
                                                  style: TextStyle(color: Colors.white.withOpacity(0.72), height: 1.5),
                                                ),
                                              ],
                                            ),
                                          ),
                                          PillChip(label: readString(variant, 'code'), dark: true),
                                        ],
                                      ),
                                      const SizedBox(height: 14),
                                      ResponsiveWrap(
                                        phone: 1,
                                        tablet: 3,
                                        desktop: 3,
                                        wide: 3,
                                        children: <Widget>[
                                          SurfacePanel(
                                            dark: true,
                                            padding: const EdgeInsets.all(14),
                                            child: Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: <Widget>[
                                                const Text('Dimensions', style: TextStyle(color: _inkInverse, fontWeight: FontWeight.w800)),
                                                const SizedBox(height: 8),
                                                ...asJsonMapList(variant['dimensions']).map(
                                                  (dimension) => Padding(
                                                    padding: const EdgeInsets.only(bottom: 6),
                                                    child: Text(
                                                      '${readString(dimension, 'label')}: ${readString(dimension, 'value')}',
                                                      style: TextStyle(color: Colors.white.withOpacity(0.72)),
                                                    ),
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                          SurfacePanel(
                                            dark: true,
                                            padding: const EdgeInsets.all(14),
                                            child: Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: <Widget>[
                                                const Text('Owner sourcing', style: TextStyle(color: _inkInverse, fontWeight: FontWeight.w800)),
                                                const SizedBox(height: 8),
                                                Text(
                                                  '${asJsonMapList(owner['rawMaterials']).length} raw material lines',
                                                  style: TextStyle(color: Colors.white.withOpacity(0.72)),
                                                ),
                                                const SizedBox(height: 6),
                                                Text(
                                                  '${asJsonMapList(owner['competitorBenchmarks']).length} competitor entries',
                                                  style: TextStyle(color: Colors.white.withOpacity(0.72)),
                                                ),
                                              ],
                                            ),
                                          ),
                                          SurfacePanel(
                                            dark: true,
                                            padding: const EdgeInsets.all(14),
                                            child: Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: <Widget>[
                                                const Text('Process', style: TextStyle(color: _inkInverse, fontWeight: FontWeight.w800)),
                                                const SizedBox(height: 8),
                                                Text(readString(process, 'compoundCode'), style: TextStyle(color: Colors.white.withOpacity(0.72))),
                                                const SizedBox(height: 6),
                                                Text(readString(process, 'cureSystem'), style: TextStyle(color: Colors.white.withOpacity(0.72))),
                                              ],
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                              );
                            },
                          ),
                      ],
                    ),
                  );
                  final issues = asStringList(preview['errors']);
                  final issuesPanel = SurfacePanel(
                    dark: true,
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        const SectionHeading(
                          eyebrow: 'Validation issues',
                          title: 'Current CSV health report.',
                          dark: true,
                        ),
                        const SizedBox(height: 16),
                        if (issues.isEmpty)
                          SurfacePanel(
                            dark: true,
                            padding: const EdgeInsets.all(16),
                            child: Text(
                              'No validation issues detected in the current preview.',
                              style: TextStyle(color: Colors.white.withOpacity(0.82), height: 1.5),
                            ),
                          )
                        else
                          ...issues.map(
                            (issue) => Padding(
                              padding: const EdgeInsets.only(bottom: 10),
                              child: Container(
                                padding: const EdgeInsets.all(16),
                                decoration: BoxDecoration(
                                  color: _accentBerry.withOpacity(0.24),
                                  borderRadius: BorderRadius.circular(18),
                                  border: Border.all(color: _accentWarm.withOpacity(0.28)),
                                ),
                                child: Text(issue, style: const TextStyle(color: _inkInverse, height: 1.5)),
                              ),
                            ),
                          ),
                        if (asStringList(preview['missingHeaders']).isNotEmpty)
                          Padding(
                            padding: const EdgeInsets.only(top: 10),
                            child: Text(
                              'Required public headers must always be present. Owner-only headers can be added gradually.',
                              style: TextStyle(color: Colors.white.withOpacity(0.58), height: 1.5),
                            ),
                          ),
                      ],
                    ),
                  );

                  if (wide) {
                    return Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        Expanded(flex: 11, child: previewPanel),
                        const SizedBox(width: 18),
                        Expanded(flex: 9, child: issuesPanel),
                      ],
                    );
                  }

                  return Column(
                    children: <Widget>[
                      previewPanel,
                      const SizedBox(height: 18),
                      issuesPanel,
                    ],
                  );
                },
              ),
            ],
          ],
        );
      },
    );
  }
}

class NotFoundScreen extends StatelessWidget {
  const NotFoundScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return MessageCard(
      title: 'Page not found',
      message: 'The requested Flutter route does not exist in the migrated frontend.',
      actionLabel: 'Back to home',
      onAction: () => _replaceRoute(context, '/'),
    );
  }
}

extension<T> on Iterable<T> {
  T? get firstOrNull {
    if (isEmpty) {
      return null;
    }

    return first;
  }
}