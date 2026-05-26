$ErrorActionPreference = 'Stop'
Set-Location (Join-Path $PSScriptRoot '..')

function Commit-Step($message, [string[]]$paths) {
    foreach ($p in $paths) {
        if (Test-Path $p) { git add -- $p }
    }
    $staged = @(git diff --cached --name-only)
    if ($staged.Count -eq 0) {
        Write-Host "SKIP: $message"
        return
    }
    git commit -m $message
    Write-Host "COMMIT: $message ($($staged.Count) files)"
}

Commit-Step 'chore: init repo' @('.gitignore')
Commit-Step 'docs: stub readme' @('README.md', 'README.stub.md')

Commit-Step 'feat(api): express skeleton' @(
    'backend/package.json', 'backend/src/app.js', 'backend/src/index.js'
)
Commit-Step 'feat(api): postgres pool' @('backend/src/db/pool.js', '.env.example')
Commit-Step 'feat(db): users and products' @(
    'backend/migrations/001_initial.sql', 'backend/scripts/migrate.js'
)
Commit-Step 'feat(db): cart and orders' @('backend/migrations/002_cart_orders.sql')
Commit-Step 'chore(db): seed data' @('backend/scripts/seed.js')

Commit-Step 'feat(auth): register' @('backend/src/services/authService.js')
Commit-Step 'feat(auth): login jwt' @('backend/src/routes/auth.js')
Commit-Step 'feat(auth): rbac middleware' @('backend/src/middleware/auth.js')
Commit-Step 'feat(auth): current user' @()

Commit-Step 'feat(products): list' @('backend/src/services/productService.js')
Commit-Step 'feat(products): search filters' @('backend/src/routes/products.js')
Commit-Step 'feat(products): detail' @()
Commit-Step 'feat(admin): product crud' @('backend/src/routes/admin.js')
Commit-Step 'feat(admin): update stock' @()

Commit-Step 'feat(cart): server cart' @(
    'backend/src/services/cartService.js', 'backend/src/routes/cart.js'
)
Commit-Step 'feat(cart): sync endpoint' @()
Commit-Step 'feat(orders): create' @(
    'backend/src/services/orderService.js', 'backend/src/routes/orders.js'
)
Commit-Step 'feat(orders): history' @()
Commit-Step 'feat(orders): detail' @()

Commit-Step 'feat(stripe): payment intent' @(
    'backend/src/services/stripeService.js', 'backend/src/routes/checkout.js'
)
Commit-Step 'feat(stripe): webhook handler' @('backend/src/routes/webhooks.js')
Commit-Step 'fix(api): stripe wiring' @()

Commit-Step 'feat(web): vue scaffold' @(
    'frontend/package.json', 'frontend/vite.config.js', 'frontend/index.html',
    'frontend/src/main.js', 'frontend/src/App.vue', 'frontend/src/assets/main.css'
)
Commit-Step 'feat(web): api client' @('frontend/src/api/client.js')
Commit-Step 'feat(web): auth pages' @(
    'frontend/src/stores/auth.js', 'frontend/src/views/LoginView.vue',
    'frontend/src/views/RegisterView.vue'
)
Commit-Step 'feat(web): route guards' @('frontend/src/router/index.js')
Commit-Step 'feat(web): catalog' @('frontend/src/views/CatalogView.vue')
Commit-Step 'feat(web): product page' @('frontend/src/views/ProductDetailView.vue')
Commit-Step 'feat(web): cart storage' @('frontend/src/stores/cart.js')
Commit-Step 'feat(web): cart page' @('frontend/src/views/CartView.vue')
Commit-Step 'feat(web): checkout stripe' @('frontend/src/views/CheckoutView.vue')
Commit-Step 'feat(web): order history' @(
    'frontend/src/views/OrdersView.vue', 'frontend/src/views/OrderDetailView.vue'
)
Commit-Step 'feat(web): admin panel' @('frontend/src/views/AdminProductsView.vue')
Commit-Step 'style(web): layout ui' @('frontend/src/components/AppLayout.vue')

Commit-Step 'chore(docker): api image' @(
    'backend/Dockerfile', 'backend/docker-entrypoint.sh'
)
Commit-Step 'chore(docker): web image' @('frontend/Dockerfile', 'frontend/nginx.conf')
Commit-Step 'chore(docker): compose stack' @('docker-compose.yml')
Commit-Step 'chore(docker): migrate on start' @()

Commit-Step 'test(api): jest setup' @('backend/tests/setup.js', 'backend/tests/health.test.js')
Commit-Step 'test(api): auth' @(
    'backend/tests/middleware.auth.test.js', 'backend/tests/authService.test.js'
)
Commit-Step 'test(api): products' @('backend/tests/productService.test.js')
Commit-Step 'test(api): cart orders' @(
    'backend/tests/cartService.test.js', 'backend/tests/orderService.test.js',
    'backend/tests/stripeService.test.js'
)
Commit-Step 'test(web): vitest setup' @(
    'frontend/src/utils/formatPrice.js', 'frontend/tests/formatPrice.test.js'
)
Commit-Step 'test(web): stores views' @(
    'frontend/tests/cartStore.test.js', 'frontend/tests/authStore.test.js'
)
Commit-Step 'test: coverage 50+' @('package.json')

Copy-Item README.full.md README.md -Force
Commit-Step 'docs: full readme' @('README.md', 'README.full.md')

git add -A
$left = @(git diff --cached --name-only)
if ($left.Count -gt 0) { git commit -m 'chore: initial release' }

git branch -M main
git remote remove origin 2>$null
git remote add origin https://github.com/Fayman7/Frontend-And-Backend-Development-2sem-5kr.git

Write-Host "`n--- History ---"
git log --oneline
