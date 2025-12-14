<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8" />
    <title inertia>{{ config('app.name') }}</title>
    @viteReactRefresh
    @vite('resources/js/app.jsx')
    @inertiaHead
</head>
<body>
    @inertia
</body>
</html>
