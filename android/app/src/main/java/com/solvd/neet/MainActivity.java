package com.solvd.neet;

import android.os.Bundle;
import android.webkit.CookieManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        try {
            // Enable persistent cookies and third-party cookies across auth domains
            CookieManager cookieManager = CookieManager.getInstance();
            cookieManager.setAcceptCookie(true);

            WebView webView = getBridge() != null ? getBridge().getWebView() : null;
            if (webView != null) {
                cookieManager.setAcceptThirdPartyCookies(webView, true);

                WebSettings settings = webView.getSettings();
                settings.setJavaScriptEnabled(true);
                settings.setDomStorageEnabled(true);
                settings.setDatabaseEnabled(true);
                settings.setSupportMultipleWindows(false);
                settings.setJavaScriptCanOpenWindowsAutomatically(true);

                // Strip standard WebView signature ('; wv' and 'Version/X.X') so Google OAuth
                // and Clerk recognize the WebView as a standard Chrome Mobile browser instead
                // of blocking with disallowed_useragent or forcing an external Chrome redirect.
                String defaultUserAgent = settings.getUserAgentString();
                if (defaultUserAgent != null) {
                    String customUserAgent = defaultUserAgent
                        .replaceAll(";\\s*wv", "")
                        .replaceAll("Version\\/[0-9.]+\\s*", "");
                    settings.setUserAgentString(customUserAgent);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        try {
            CookieManager.getInstance().flush();
        } catch (Exception ignored) {}
    }

    @Override
    public void onPause() {
        super.onPause();
        try {
            CookieManager.getInstance().flush();
        } catch (Exception ignored) {}
    }
}

