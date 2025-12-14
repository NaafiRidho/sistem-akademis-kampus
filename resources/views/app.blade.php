<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title inertia>{{ config('app.name', 'Sistem Akademis Kampus') }}</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    @viteReactRefresh
    @vite('resources/js/app.jsx')
    @inertiaHead
</head>

<body class="antialiased">
    @inertia
</body>

</html>
