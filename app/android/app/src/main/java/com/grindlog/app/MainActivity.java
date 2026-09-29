package com.grindlog.app;

import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.ViewGroup;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.Toast;

import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebViewClient;

public class MainActivity extends BridgeActivity {

    private ImageView splashOverlayView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Do NOT call SplashScreen.installSplashScreen() here.
        // It conflicts with Capacitor's internal SplashScreen plugin.
        // Instead we use a simple native ImageView overlay approach below.

        super.onCreate(savedInstanceState);

        // ── NATIVE SPLASH OVERLAY ──
        // Add an ImageView showing R.drawable.splash on top of everything.
        // This is 100% reliable on all Android devices.
        try {
            FrameLayout root = (FrameLayout) findViewById(android.R.id.content);
            if (root != null) {
                ImageView splashView = new ImageView(this);
                splashView.setLayoutParams(new FrameLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT
                ));
                splashView.setBackgroundColor(Color.parseColor("#0A1108"));
                splashView.setScaleType(ImageView.ScaleType.CENTER_INSIDE);
                boolean hasSplashDrawable = true;
                try {
                    splashView.setImageResource(R.drawable.splash);
                } catch (Exception e) {
                    android.util.Log.w("GrindLog", "splash drawable not found");
                    hasSplashDrawable = false;
                }

                if (hasSplashDrawable) {
                    // Ensure it's on top of the WebView
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                        splashView.setElevation(10f);
                    }
                    root.addView(splashView);
                    splashView.bringToFront();
                    this.splashOverlayView = splashView;

                    // Auto-dismiss after 2.5 seconds with smooth fade
                    new android.os.Handler(android.os.Looper.getMainLooper()).postDelayed(() -> {
                        if (splashOverlayView != null && splashOverlayView.getParent() != null) {
                            splashOverlayView.animate()
                                .alpha(0f)
                                .setDuration(400)
                                .withEndAction(() -> {
                                    try {
                                        if (root != null && splashOverlayView != null && splashOverlayView.getParent() != null) {
                                            root.removeView(splashOverlayView);
                                        }
                                    } catch (Exception ignored) {}
                                    splashOverlayView = null;
                                })
                                .start();
                        }
                    }, 2500);
                }
            }
        } catch (Exception e) {
            android.util.Log.e("GrindLog", "Error creating native splash overlay", e);
        }

        // ── BRIDGE & WEBVIEW SETUP ──
        Bridge bridge = this.getBridge();
        if (bridge == null) return;

        WebView webView = bridge.getWebView();
        if (webView != null) {
            // Cookie persistence
            android.webkit.CookieManager cookieManager = android.webkit.CookieManager.getInstance();
            cookieManager.setAcceptCookie(true);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                cookieManager.setAcceptThirdPartyCookies(webView, true);
            }

            WebSettings settings = webView.getSettings();

            // Sanitize User-Agent: Remove '; wv' for Razorpay UPI compatibility
            // Append 'GrindLogApp' so the server can detect native app requests
            String ua = settings.getUserAgentString();
            if (ua != null) {
                String sanitizedUa = ua.replace("; wv", "").replace("Version/4.0 ", "");
                settings.setUserAgentString(sanitizedUa + " GrindLogApp");
            }

            // Lock text zoom to 100%
            settings.setTextZoom(100);

            // Disable pinch-to-zoom
            settings.setSupportZoom(false);
            settings.setBuiltInZoomControls(false);
            settings.setDisplayZoomControls(false);

            // Viewport settings
            settings.setUseWideViewPort(true);
            settings.setLoadWithOverviewMode(true);

            // ── SIGN-IN REDIRECT ──
            // If user has no auth cookies, load sign-in page immediately
            // This works alongside server.url being set to /auth/signin in capacitor.config
            android.webkit.CookieManager cm = android.webkit.CookieManager.getInstance();
            String cookies = cm.getCookie("https://www.grindlog.in");
            boolean hasAuth = cookies != null && (cookies.contains("sb-") || cookies.contains("supabase-auth-token"));
            if (!hasAuth) {
                webView.loadUrl("https://www.grindlog.in/auth/signin");
            }

            // ── WEBVIEW CLIENT ──
            bridge.setWebViewClient(new BridgeWebViewClient(bridge) {
                @Override
                public void onPageStarted(WebView view, String url, android.graphics.Bitmap favicon) {
                    if (url != null && isUnauthenticatedLanding(url)) {
                        view.stopLoading();
                        view.loadUrl("https://www.grindlog.in/auth/signin");
                        return;
                    }
                    super.onPageStarted(view, url, favicon);
                }

                @Override
                public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                    Uri uri = request.getUrl();
                    if (uri == null) return super.shouldOverrideUrlLoading(view, request);

                    String urlStr = uri.toString();

                    // Redirect unauthenticated landing page
                    if (isUnauthenticatedLanding(urlStr)) {
                        view.loadUrl("https://www.grindlog.in/auth/signin");
                        return true;
                    }

                    // Handle payment URIs
                    if (handlePaymentUri(view, uri)) {
                        return true;
                    }

                    // Handle OAuth callback custom schemes
                    String scheme = uri.getScheme();
                    if (scheme != null) {
                        String schemeLower = scheme.toLowerCase();
                        if (schemeLower.equals("com.grindlog.app") || schemeLower.equals("grindlog")) {
                            // This is an OAuth deep link - forward to onNewIntent
                            try {
                                Intent intent = new Intent(Intent.ACTION_VIEW, uri);
                                MainActivity.this.onNewIntent(intent);
                            } catch (Exception e) {
                                android.util.Log.e("GrindLog", "Deep link error: " + e.getMessage());
                            }
                            return true;
                        }
                    }

                    return super.shouldOverrideUrlLoading(view, request);
                }

                @SuppressWarnings("deprecation")
                @Override
                public boolean shouldOverrideUrlLoading(WebView view, String url) {
                    if (url != null && isUnauthenticatedLanding(url)) {
                        view.loadUrl("https://www.grindlog.in/auth/signin");
                        return true;
                    }
                    if (url != null && handlePaymentUri(view, Uri.parse(url))) {
                        return true;
                    }
                    return super.shouldOverrideUrlLoading(view, url);
                }

                private boolean isUnauthenticatedLanding(String url) {
                    if (url == null) return false;
                    String clean = url.split("\\?")[0].split("#")[0];
                    if (clean.equals("https://www.grindlog.in") || clean.equals("https://www.grindlog.in/") ||
                        clean.equals("https://grindlog.in") || clean.equals("https://grindlog.in/")) {
                        String c = android.webkit.CookieManager.getInstance().getCookie("https://www.grindlog.in");
                        return c == null || (!c.contains("sb-") && !c.contains("supabase-auth-token"));
                    }
                    return false;
                }

                private boolean handlePaymentUri(WebView view, Uri uri) {
                    if (uri == null) return false;
                    String scheme = uri.getScheme();
                    if (scheme == null) return false;

                    String schemeLower = scheme.toLowerCase();

                    // UPI and payment schemes
                    if (schemeLower.equals("upi") || schemeLower.equals("tez") ||
                        schemeLower.equals("phonepe") || schemeLower.equals("paytmmp") ||
                        schemeLower.equals("cred") || schemeLower.equals("bhim")) {
                        try {
                            Intent intent = new Intent(Intent.ACTION_VIEW, uri);
                            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                            MainActivity.this.startActivity(intent);
                            return true;
                        } catch (ActivityNotFoundException e) {
                            Toast.makeText(MainActivity.this, "No UPI app found", Toast.LENGTH_SHORT).show();
                            return true;
                        }
                    }

                    // Android intent:// scheme
                    if (schemeLower.equals("intent")) {
                        try {
                            Intent intent = Intent.parseUri(uri.toString(), Intent.URI_INTENT_SCHEME);
                            if (intent != null) {
                                intent.addCategory(Intent.CATEGORY_BROWSABLE);
                                intent.setComponent(null);
                                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                                try {
                                    MainActivity.this.startActivity(intent);
                                    return true;
                                } catch (ActivityNotFoundException notFound) {
                                    String fallbackUrl = intent.getStringExtra("browser_fallback_url");
                                    if (fallbackUrl != null && !fallbackUrl.isEmpty()) {
                                        view.loadUrl(fallbackUrl);
                                        return true;
                                    }
                                    String pkg = intent.getPackage();
                                    if (pkg != null && !pkg.isEmpty()) {
                                        try {
                                            Intent marketIntent = new Intent(Intent.ACTION_VIEW, Uri.parse("market://details?id=" + pkg));
                                            marketIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                                            MainActivity.this.startActivity(marketIntent);
                                            return true;
                                        } catch (ActivityNotFoundException ignored) {}
                                    }
                                    Toast.makeText(MainActivity.this, "App not installed", Toast.LENGTH_SHORT).show();
                                    return true;
                                }
                            }
                        } catch (Exception ex) {
                            android.util.Log.e("GrindLog", "Error parsing intent URI", ex);
                        }
                    }

                    // Market scheme
                    if (schemeLower.equals("market")) {
                        try {
                            Intent marketIntent = new Intent(Intent.ACTION_VIEW, uri);
                            marketIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                            MainActivity.this.startActivity(marketIntent);
                            return true;
                        } catch (ActivityNotFoundException e) {
                            return true;
                        }
                    }

                    return false;
                }
            });
        }
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        Bridge bridge = getBridge();
        if (bridge != null) {
            bridge.onNewIntent(intent);
        }
    }

    @Override
    public void onPause() {
        super.onPause();
        try {
            android.webkit.CookieManager.getInstance().flush();
        } catch (Exception ignored) {}
    }
}
