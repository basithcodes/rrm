import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

// =====================================================================
// Scanner Screen
// ---------------------------------------------------------------------
// Industrial barcode capture surface for warehouse operators.
//   * Full-bleed live camera preview.
//   * A fixed center "target frame" with emerald-700 corner brackets
//     so the worker knows exactly where to align the barcode.
//   * Single-shot: as soon as a barcode is decoded, pop the route
//     with the raw value so the catalog screen can filter on it.
// =====================================================================

const _slate900 = Color(0xFF0F172A);
const _slate200 = Color(0xFFE2E8F0);
const _emerald700 = Color(0xFF047857);

class ScannerScreen extends StatefulWidget {
  const ScannerScreen({super.key});

  @override
  State<ScannerScreen> createState() => _ScannerScreenState();
}

class _ScannerScreenState extends State<ScannerScreen> {
  final MobileScannerController _controller = MobileScannerController(
    detectionSpeed: DetectionSpeed.normal,
    facing: CameraFacing.back,
    torchEnabled: false,
  );

  // Latch so we only return the first decoded barcode per session.
  bool _handled = false;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _handleDetection(BarcodeCapture capture) {
    if (_handled) return;
    for (final barcode in capture.barcodes) {
      final value = barcode.rawValue;
      if (value == null || value.isEmpty) continue;
      _handled = true;
      // Stop the camera before popping so the next frame can't fire
      // a second detection while the route transitions.
      _controller.stop();
      Navigator.of(context).pop(value);
      return;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.white,
        foregroundColor: _slate900,
        elevation: 0,
        scrolledUnderElevation: 0,
        shape: const Border(bottom: BorderSide(color: _slate200, width: 1)),
        title: const Text(
          'SCAN BARCODE',
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
            tooltip: 'Toggle torch',
            icon: const Icon(Icons.flash_on, color: _slate900),
            onPressed: () => _controller.toggleTorch(),
          ),
          IconButton(
            tooltip: 'Switch camera',
            icon: const Icon(Icons.cameraswitch, color: _slate900),
            onPressed: () => _controller.switchCamera(),
          ),
        ],
      ),
      body: Stack(
        fit: StackFit.expand,
        children: [
          MobileScanner(
            controller: _controller,
            onDetect: _handleDetection,
          ),
          // Dimmed overlay + center target frame.
          const _ScannerOverlay(),
          // Bottom hint strip.
          const Align(
            alignment: Alignment.bottomCenter,
            child: SafeArea(
              child: Padding(
                padding: EdgeInsets.fromLTRB(16, 0, 16, 16),
                child: Text(
                  'ALIGN BARCODE WITHIN BRACKETS',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontFamily: 'monospace',
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 1.6,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------
// _ScannerOverlay
// Paints a translucent black mask over the camera preview with a
// 260x260 square cut-out in the middle, then draws sharp emerald-700
// corner brackets at the four corners of that square.
// ---------------------------------------------------------------------
class _ScannerOverlay extends StatelessWidget {
  const _ScannerOverlay();

  @override
  Widget build(BuildContext context) {
    return IgnorePointer(
      child: CustomPaint(
        painter: _ScannerOverlayPainter(),
        child: const SizedBox.expand(),
      ),
    );
  }
}

class _ScannerOverlayPainter extends CustomPainter {
  static const double _frameSize = 260;
  static const double _bracketLength = 28;
  static const double _bracketStroke = 3;

  @override
  void paint(Canvas canvas, Size size) {
    final rect = Rect.fromCenter(
      center: size.center(Offset.zero),
      width: _frameSize,
      height: _frameSize,
    );

    // Dim everything except the target frame.
    final mask = Path()
      ..addRect(Rect.fromLTWH(0, 0, size.width, size.height))
      ..addRect(rect)
      ..fillType = PathFillType.evenOdd;
    canvas.drawPath(
      mask,
      Paint()..color = Colors.black.withValues(alpha: 0.55),
    );

    // Thin slate hairline around the cut-out.
    canvas.drawRect(
      rect,
      Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = 1
        ..color = const Color(0xFFE2E8F0),
    );

    // Emerald-700 corner brackets.
    final bracketPaint = Paint()
      ..color = _emerald700
      ..style = PaintingStyle.stroke
      ..strokeWidth = _bracketStroke
      ..strokeCap = StrokeCap.square;

    // Top-left
    canvas.drawLine(
      rect.topLeft,
      rect.topLeft.translate(_bracketLength, 0),
      bracketPaint,
    );
    canvas.drawLine(
      rect.topLeft,
      rect.topLeft.translate(0, _bracketLength),
      bracketPaint,
    );
    // Top-right
    canvas.drawLine(
      rect.topRight,
      rect.topRight.translate(-_bracketLength, 0),
      bracketPaint,
    );
    canvas.drawLine(
      rect.topRight,
      rect.topRight.translate(0, _bracketLength),
      bracketPaint,
    );
    // Bottom-left
    canvas.drawLine(
      rect.bottomLeft,
      rect.bottomLeft.translate(_bracketLength, 0),
      bracketPaint,
    );
    canvas.drawLine(
      rect.bottomLeft,
      rect.bottomLeft.translate(0, -_bracketLength),
      bracketPaint,
    );
    // Bottom-right
    canvas.drawLine(
      rect.bottomRight,
      rect.bottomRight.translate(-_bracketLength, 0),
      bracketPaint,
    );
    canvas.drawLine(
      rect.bottomRight,
      rect.bottomRight.translate(0, -_bracketLength),
      bracketPaint,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
