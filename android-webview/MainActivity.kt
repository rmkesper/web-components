/*
 * ...MyWebviewApplication\app\src\main\java\com\example\mywebviewapplication
 *
 * basics
 * https://developer.chrome.com/docs/multidevice/webview/gettingstarted/
 * https://developer.android.com/studio/run/managing-avds?utm_source=android-studio
 * https://stackoverflow.com/questions/42816127/waiting-for-target-device-to-come-online
 * mails:
 * https://stackoverflow.com/questions/11217021/read-mails-in-my-own-android-app
 * https://stackoverflow.com/questions/25660166/how-to-add-a-jar-in-external-libraries-in-android-studio
 * cryptography
 * https://gist.github.com/awesometic/f1f52acf5904189f687724e42c461413
 * database
 * https://www.tutorialspoint.com/how-to-use-a-simple-sqlite-database-in-kotlin-android
 * https://developer.android.com/training/data-storage/sqlite#kotlin
 * https://www.geeksforgeeks.org/how-to-view-and-locate-sqlite-database-in-android-studio/
 * https://dzone.com/articles/create-a-database-android-application-in-android-s
 */

package com.example.mywebviewapplication

import android.annotation.SuppressLint
import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper
import android.os.Build
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.webkit.WebSettings
import java.util.*
import android.webkit.ConsoleMessage
import android.webkit.WebChromeClient
import androidx.annotation.RequiresApi
import java.io.*
import android.content.ContentValues
import java.time.*

class MainActivity : AppCompatActivity() {

    private lateinit var mWebView: WebView

    @RequiresApi(Build.VERSION_CODES.O)
    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        mWebView = findViewById(R.id.activity_main_webview);
        mWebView.loadUrl("file:///android_asset/index.html");
        val webSettings: WebSettings = mWebView.getSettings()
        webSettings.javaScriptEnabled = true

        mWebView.addJavascriptInterface(BackendInterface(this), "Backend")

        // init database
        val DB = DataBaseHandler(this).writableDatabase

        // JS console log in kotlin
        mWebView.setWebChromeClient(object : WebChromeClient() {
            override fun onConsoleMessage(consoleMessage: ConsoleMessage): Boolean {
                Log.d("WebView", consoleMessage.message())
                return true
            }
        })
    }
}

@RequiresApi(Build.VERSION_CODES.O)
class BackendInterface(private val context: Context) {
  
    @JavascriptInterface
    fun getRandomString(length: Int) : String {
        val charset = ('a'..'z') + ('A'..'Z') + ('0'..'9')

        return List(length) { charset.random() }
            .joinToString("")
    } 
    
    // ...
}

class DataBaseHandler(context: Context):
    SQLiteOpenHelper(context, DATABASE.name, null, 1) {

    val _context: Context = context

    override fun onCreate(db: SQLiteDatabase) {
        var sql: String = ""
        // ...
        db.execSQL(sql)
    }
    
    override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {
        val sql = ""
        // ...
        db.execSQL(sql)
        onCreate(db)
    }
    
    override fun onDowngrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {
        onUpgrade(db, oldVersion, newVersion)
    }
}
    
object DATABASE {
    val name: String = "db_name"
    object TABLE {
      // ...
    }
}
