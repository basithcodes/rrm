# Flutter Frontend Starter

This directory is a Flutter frontend starter for the RRM catalog and owner workspace.

It is designed to consume the Next backend through JSON endpoints:

- `/api/public/bootstrap`
- `/api/catalog`
- `/api/catalog/[slug]`
- `/api/owner/session`
- `/api/owner/dashboard`

## Run Flow

1. Start the backend in the repository root:

```bash
python start.py
```

2. Install the Flutter SDK locally if it is not already available.

3. From this directory, fetch packages and run the Flutter web app:

```bash
flutter pub get
flutter run -d chrome --dart-define=API_BASE_URL=http://localhost:3000
```

## Important Note

This environment did not have the Flutter SDK installed, so this starter was added without running `flutter create` or `flutter pub get` here.

If your local Flutter install expects generated web/platform files, run:

```bash
flutter create --platforms=web .
```

and then restore `lib/main.dart` if Flutter overwrites it.