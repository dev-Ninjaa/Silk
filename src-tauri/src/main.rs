// Prevents additional console window on Windows in release builds
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// FUTURE: Filesystem bridge will go here
// For now: ZERO IPC, ZERO commands, ZERO business logic
// The web app runs exactly as-is inside the WebView

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
