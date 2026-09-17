// Fast, mostly-no-auth smoke test: checks public route availability, that route protection
// (proxy.js) is doing its job, and that plan/tier gating (lib/plan.js) matches what's
// expected for the target deployment. Doesn't exercise CRUD, cart/checkout, or member/admin
// auth flows via real HTTP/session — those need a real session and are best driven by hand or
// a browser-automation tool. Run with: npm run smoke-test
//
// BASE_URL — point at a deployed environment instead of localhost.
// TEST_PLAN — which tier the target server is expected to be running (basic|plus|premium,
//   default premium). Must match that server's own PLAN env var, or the gated-route checks
//   below will fail for the wrong reason (testing expectations, not the server, being wrong).
//
// One exception to the "no CRUD" rule: the data-integrity section near the bottom calls real
// lib/*.js functions directly against DATABASE_URL (skipped if that's not set — e.g. testing a
// remote BASE_URL with no local DB access). Server Actions have no stable, scriptable HTTP
// contract to drive from outside a real Next.js client (the action reference id is a
// build-specific hash, not a REST endpoint), so this is the only practical way to regression-test
// what a Server Action's own save logic does, short of a full browser-automation run.

const { register } = require("node:module");
const { pathToFileURL } = require("node:url");
register("./smoke-test-alias-loader.mjs", pathToFileURL(__filename));

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const TEST_PLAN = (process.env.TEST_PLAN || "premium").toLowerCase();

// Mirrors lib/plan.js's tier structure — kept as a small, deliberately duplicated copy rather
// than imported, since this script runs as plain Node outside the Next.js build (no "@/" alias
// resolution) and is meant to test a possibly-remote deployment, not reflect this process's
// own env.
const PLUS_MODULES = [
  "blog",
  "newsEvents",
  "gallery",
  "reviews",
  "partners",
  "team",
  "certifications",
  "booking",
  "ai",
];
const PREMIUM_MODULES = [...PLUS_MODULES, "cart", "members"];
const TIER_MODULES = { basic: [], plus: PLUS_MODULES, premium: PREMIUM_MODULES };

function moduleEnabled(moduleName) {
  return (TIER_MODULES[TEST_PLAN] ?? TIER_MODULES.premium).includes(moduleName);
}

// path -> module it belongs to. Routes not listed here are always reachable regardless of tier
// (home, enquiry, contact, admin login/dashboard/account/contact/enquiries/analytics). Products,
// Portfolio, Stats, How It Works, and About are also tier-unrestricted (present on every plan,
// including Basic — see CORE_MODULES in lib/plan.js) but individually switchable from Settings
// → Feature Config; that's a database-backed override this static script can't see, so those
// five are covered under CORE_ADMIN_ROUTES below instead — checking only their default-enabled
// state, not the toggle itself.
const GATED_ROUTES = {
  "/blog": "blog",
  "/gallery": "gallery",
  "/news-events": "newsEvents",
  "/team": "team",
  "/cart": "cart",
  "/checkout": "cart",
  "/member/login": "members",
  "/member/signup": "members",
  "/member/forgot-password": "members",
  "/membership": "members",
  "/admin/blog": "blog",
  "/admin/gallery": "gallery",
  "/admin/news-events": "newsEvents",
  "/admin/reviews": "reviews",
  "/admin/partners": "partners",
  "/admin/team": "team",
  "/admin/certifications": "certifications",
  "/admin/member-resets": "members",
  "/admin/account-closures": "members",
  "/admin/booking-waitlist": "booking",
  "/admin/ai-settings": "ai",
  "/admin/orders": "cart",
  "/admin/members": "members",
  "/booking": "booking",
  "/admin/booking-services": "booking",
  "/admin/availability": "booking",
  "/admin/bookings": "booking",
  "/admin/discount-codes": "cart",
  "/leave-a-review": "reviews",
  "/admin/testimonials": "reviews",
};

const CORE_PUBLIC_ROUTES = [
  "/",
  "/products/1",
  "/admin/login",
  "/privacy-policy",
  "/terms-of-service",
];
const CORE_ADMIN_ROUTES = [
  "/admin",
  "/admin/hero",
  "/admin/section-text",
  "/admin/nav",
  "/admin/site-text",
  "/admin/root-alert",
  "/admin/admin-text",
  "/admin/admin-nav",
  "/admin/products",
  "/admin/portfolio",
  "/admin/stats",
  "/admin/how-it-works",
  "/admin/about",
  "/admin/subscription",
  "/admin/social",
  "/admin/business",
  "/admin/logo",
  "/admin/legal",
];
const UNKNOWN_ROUTES_EXPECT_401 = ["/this-route-does-not-exist", "/foo/bar/baz"];

let pass = 0;
let fail = 0;

async function check(label, fn) {
  try {
    await fn();
    console.log(`  ok   ${label}`);
    pass += 1;
  } catch (err) {
    console.log(`  FAIL ${label} — ${err.message}`);
    fail += 1;
  }
}

async function statusOf(path, { redirect = "manual" } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, { redirect });
  return res.status;
}

// Regression test for a real bug: updateProduct() used to always write `image` (a denormalized
// pointer to whichever product_photos row is the cover), and since its only caller —
// components/ProductForm.js's basic-info save, which has no image field — never provided one,
// every single name/price/category save silently nulled the product's cover photo. The product
// detail page was unaffected (it reads product_photos directly), so the only visible symptom
// was the homepage grid's thumbnail randomly going blank after an unrelated edit. See
// lib/products.js's createProduct/updateProduct comments for the fix and the ownership rule
// (that column belongs exclusively to lib/productPhotos.js from here on).
async function checkProductCoverSurvivesBasicInfoSave() {
  const { createProduct, updateProduct, deleteProduct, getProduct } = await import(
    "../lib/products.js"
  );
  const { addProductPhoto } = await import("../lib/productPhotos.js");

  const product = await createProduct({
    name: "__smoke_test_product__",
    description: "temporary — created and deleted by npm run smoke-test",
    price: "£1",
    priceAmount: 1,
    category: "smoke-test",
    displayOrder: 0,
  });

  try {
    const photo = await addProductPhoto(product.id, "https://example.com/smoke-test-cover.jpg");
    const beforeSave = await getProduct(product.id);
    if (beforeSave.image !== photo.image) {
      throw new Error("addProductPhoto did not set products.image to the new (first) photo");
    }

    // The exact shape components/ProductForm.js's save action passes — no `image` key at all.
    await updateProduct(product.id, {
      name: "__smoke_test_product__ (edited)",
      description: beforeSave.description,
      price: beforeSave.price,
      priceAmount: beforeSave.price_amount,
      category: beforeSave.category,
      displayOrder: beforeSave.display_order,
    });

    const afterSave = await getProduct(product.id);
    if (afterSave.image !== photo.image) {
      throw new Error(
        `updateProduct wiped products.image — was "${photo.image}", now "${afterSave.image}"`
      );
    }
  } finally {
    await deleteProduct(product.id); // cascades to product_photos
  }
}

async function main() {
  console.log(`Smoke testing ${BASE_URL} (expecting plan: ${TEST_PLAN})\n`);

  console.log("Core public routes (always 200, any plan):");
  for (const path of CORE_PUBLIC_ROUTES) {
    await check(path, async () => {
      const status = await statusOf(path, { redirect: "follow" });
      if (status !== 200) throw new Error(`got ${status}`);
    });
  }

  console.log("\nCore admin routes with no session (always redirect to login, any plan):");
  for (const path of CORE_ADMIN_ROUTES) {
    await check(path, async () => {
      const status = await statusOf(path);
      if (![301, 302, 307, 308].includes(status)) {
        throw new Error(`got ${status}, expected a redirect`);
      }
    });
  }

  console.log("\nPlan-gated routes (expect 200/redirect if included, 401 if not):");
  for (const [path, moduleName] of Object.entries(GATED_ROUTES)) {
    const isAdminRoute = path.startsWith("/admin");
    await check(`${path}  [${moduleName}]`, async () => {
      const status = await statusOf(path, { redirect: isAdminRoute ? "manual" : "follow" });
      if (moduleEnabled(moduleName)) {
        const ok = isAdminRoute ? [301, 302, 307, 308].includes(status) : status === 200;
        if (!ok) {
          throw new Error(
            `got ${status}, expected ${isAdminRoute ? "a redirect (module enabled)" : "200 (module enabled)"}`
          );
        }
      } else if (status !== 401) {
        throw new Error(`got ${status}, expected 401 (module not in "${TEST_PLAN}" plan)`);
      }
    });
  }

  console.log("\nUnrecognized routes (expect 401 Site Unavailable):");
  for (const path of UNKNOWN_ROUTES_EXPECT_401) {
    await check(path, async () => {
      const status = await statusOf(path, { redirect: "follow" });
      if (status !== 401) throw new Error(`got ${status}`);
    });
  }

  if (process.env.DATABASE_URL) {
    console.log("\nData integrity (direct DB, requires DATABASE_URL):");
    await check("product cover photo survives a basic-info save", checkProductCoverSurvivesBasicInfoSave);
  } else {
    console.log("\nData integrity checks skipped (no DATABASE_URL — remote BASE_URL run?)");
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  // Explicit exit rather than letting the event loop drain naturally: the data-integrity
  // section above opens lib/db.js's pg.Pool singleton when it runs, which otherwise keeps the
  // process alive indefinitely.
  process.exit(fail > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Smoke test crashed:", err);
  process.exit(1);
});
