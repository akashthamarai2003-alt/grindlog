package com.grindlog.app;

import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.Toast;

import androidx.core.splashscreen.SplashScreen;
import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebViewClient;

public class MainActivity extends BridgeActivity {

    private long splashStartTime = 0;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        splashStartTime = System.currentTimeMillis();
        // 1. Install AndroidX Splash Screen and keep on screen for 2.5 seconds
        SplashScreen splashScreen = SplashScreen.installSplashScreen(this);
        splashScreen.setKeepOnScreenCondition(() -> {
            return (System.currentTimeMillis() - splashStartTime) < 2500;
        });

        super.onCreate(savedInstanceState);

        Bridge bridge = this.getBridge();
        if (bridge == null) return;

        WebView webView = bridge.getWebView();
        if (webView != null) {
            // Ensure cookie persistence across app closures and restarts
            android.webkit.CookieManager cookieManager = android.webkit.CookieManager.getInstance();
            cookieManager.setAcceptCookie(true);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                cookieManager.setAcceptThirdPartyCookies(webView, true);
            }

            WebSettings settings = webView.getSettings();

            // 1. Sanitize User-Agent: Remove '; wv' and 'Version/4.0 '
            // In Android WebView, Razorpay checkout.js checks the User-Agent string.
            // If it detects '; wv', it assumes WebView cannot launch UPI intent apps
            // and hides UPI apps (GPay, PhonePe, Paytm).
            // Removing '; wv' causes Razorpay to treat the WebView as standard mobile Chrome.
            // Append 'GrindLogApp' so the server can detect native app requests.
            String ua = settings.getUserAgentString();
            if (ua != null) {
                String sanitizedUa = ua.replace("; wv", "").replace("Version/4.0 ", "");
                settings.setUserAgentString(sanitizedUa + " GrindLogApp");
            }

            // 2. Lock text zoom to 100% to prevent phone's system font / display size from inflating UI
            settings.setTextZoom(100);

            // 3. Disable accidental pinch-to-zoom and double-tap zoom
            settings.setSupportZoom(false);
            settings.setBuiltInZoomControls(false);
            settings.setDisplayZoomControls(false);

            // 4. Ensure viewport matches standard mobile device dimensions
            settings.setUseWideViewPort(true);
            settings.setLoadWithOverviewMode(true);

            // 5. Native APK check: if user is not authenticated, load Sign In page immediately while splash screen is showing
            android.webkit.CookieManager cm = android.webkit.CookieManager.getInstance();
            String cookies = cm.getCookie("https://www.grindlog.in");
            boolean hasAuth = cookies != null && (cookies.contains("sb-") || cookies.contains("supabase-auth-token"));
            if (!hasAuth) {
                webView.loadUrl("https://www.grindlog.in/auth/signin");
            }

            // 6. Attach specialized BridgeWebViewClient to intercept UPI, OAuth, and Landing Page bypass
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
                    if (uri != null && isUnauthenticatedLanding(uri.toString())) {
                        view.loadUrl("https://www.grindlog.in/auth/signin");
                        return true;
                    }
                    if (handlePaymentUri(view, uri)) {
                        return true;
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

                    // Direct UPI and known payment schemes
                    if (schemeLower.equals("upi") ||
                        schemeLower.equals("tez") ||
                        schemeLower.equals("phonepe") ||
                        schemeLower.equals("paytmmp") ||
                        schemeLower.equals("cred") ||
                        schemeLower.equals("bhim")) {
                        try {
                            Intent intent = new Intent(Intent.ACTION_VIEW, uri);
                            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                            MainActivity.this.startActivity(intent);
                            return true;
                        } catch (ActivityNotFoundException e) {
                            Toast.makeText(MainActivity.this, "No UPI app found to process this payment", Toast.LENGTH_SHORT).show();
                            return true;
                        }
                    }

                    // OAuth callback custom schemes
                    if (schemeLower.equals("com.grindlog.app") || schemeLower.equals("grindlog")) {
                        try {
                            Intent intent = new Intent(Intent.ACTION_VIEW, uri);
                            MainActivity.this.onNewIntent(intent);
                            return true;
                        } catch (Exception e) {
                            return true;
                        }
                    }


                    // Android intent:// scheme URLs
                    if (schemeLower.equals("intent")) {
                        try {
                            Intent intent = Intent.parseUri(uri.toString(), Intent.URI_INTENT_SCHEME);
                            if (intent != null) {
                                intent.addCategory(Intent.CATEGORY_BROWSABLE);
                                intent.setComponent(null);
                                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.ICE_CREAM_SANDWICH_MR1) {
                                    Intent selector = intent.getSelector();
                                    if (selector != null) {
                                        selector.addCategory(Intent.CATEGORY_BROWSABLE);
                                        selector.setComponent(null);
                                    }
                                }
                                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

                                try {
                                    MainActivity.this.startActivity(intent);
                                    return true;
                                } catch (ActivityNotFoundException notFound) {
                                    // Fallback: check if browser_fallback_url exists in intent
                                    String fallbackUrl = intent.getStringExtra("browser_fallback_url");
                                    if (fallbackUrl != null && !fallbackUrl.isEmpty()) {
                                        view.loadUrl(fallbackUrl);
                                        return true;
                                    }
                                    // Check package name to open Play Store
                                    String pkg = intent.getPackage();
                                    if (pkg != null && !pkg.isEmpty()) {
                                        try {
                                            Intent marketIntent = new Intent(Intent.ACTION_VIEW, Uri.parse("market://details?id=" + pkg));
                                            marketIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                                            MainActivity.this.startActivity(marketIntent);
                                            return true;
                                        } catch (ActivityNotFoundException ignored) {}
                                    }
                                    Toast.makeText(MainActivity.this, "App not installed for this payment method", Toast.LENGTH_SHORT).show();
                                    return true;
                                }
                            }
                        } catch (Exception ex) {
                            android.util.Log.e("GrindLog", "Error parsing intent URI: " + uri, ex);
                        }
                    }

                    // Market scheme (e.g. app store link)
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
        // Immediately persist in-memory session cookies to disk
        // ensuring user sessions survive app kills and restarts
        try {
            android.webkit.CookieManager.getInstance().flush();
        } catch (Exception ignored) {}
    }
}


