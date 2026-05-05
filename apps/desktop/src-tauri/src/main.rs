// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{Manager, tray::{TrayIconBuilder, TrayIconEvent, MouseButton}};
use std::sync::mpsc;

// Learn more about Tauri commands at https://tauri.app/v2/guides/features/command
#[tauri::command]
fn get_app_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

#[tauri::command]
async fn show_save_dialog(
    window: tauri::Window,
    options: serde_json::Value,
) -> Result<serde_json::Value, String> {
    use tauri_plugin_dialog::DialogExt;
    
    let title = options.get("title").and_then(|v| v.as_str()).unwrap_or("Save File").to_string();
    
    let (tx, rx) = mpsc::channel();
    
    let dialog = window.dialog();
    dialog.file()
        .add_filter("All Files", &["*"])
        .set_title(&title)
        .save_file(move |path| {
            let _ = tx.send(path.map(|p| p.to_string()));
        });
    
    let result = rx.recv().map_err(|e| format!("Dialog error: {}", e))?;
    
    Ok(serde_json::json!({
        "canceled": result.is_none(),
        "filePath": result.unwrap_or_default()
    }))
}

#[tauri::command]
async fn show_open_dialog(
    window: tauri::Window,
    options: serde_json::Value,
) -> Result<serde_json::Value, String> {
    use tauri_plugin_dialog::DialogExt;
    
    let title = options.get("title").and_then(|v| v.as_str()).unwrap_or("Open File").to_string();
    
    let (tx, rx) = mpsc::channel();
    
    let dialog = window.dialog();
    dialog.file()
        .add_filter("All Files", &["*"])
        .set_title(&title)
        .pick_file(move |path| {
            let _ = tx.send(path.map(|p| p.to_string()));
        });
    
    let result = rx.recv().map_err(|e| format!("Dialog error: {}", e))?;
    
    Ok(serde_json::json!({
        "canceled": result.is_none(),
        "filePaths": result.map(|p| vec![p]).unwrap_or_default()
    }))
}

#[tauri::command]
async fn show_message_box(
    window: tauri::Window,
    options: serde_json::Value,
) -> Result<serde_json::Value, String> {
    use tauri_plugin_dialog::DialogExt;
    
    let title = options.get("title").and_then(|v| v.as_str()).unwrap_or("Message").to_string();
    let message = options.get("message").and_then(|v| v.as_str()).unwrap_or("").to_string();
    // Note: detail is not available in tauri-plugin-dialog v2 API
    // The detail text can be included in the message itself if needed
    
    let (tx, rx) = mpsc::channel();
    
    let dialog = window.dialog();
    let mut msg = dialog.message(&message);
    msg = msg.title(&title);
    
    msg.show(move |result| {
        let _ = tx.send(result);
    });
    
    let result = rx.recv().map_err(|e| format!("Dialog error: {}", e))?;
    
    Ok(serde_json::json!({
        "response": if result { 0 } else { 1 }
    }))
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            // Create system tray with icon
            let icon = app.default_window_icon().cloned();
            
            let mut builder = TrayIconBuilder::new()
                .tooltip("Ettios Desktop");
            
            if let Some(icon) = icon {
                builder = builder.icon(icon);
            }
            
            let _tray = builder
                .on_tray_icon_event(|tray, event| {
                    match event {
                        TrayIconEvent::Click {
                            button: MouseButton::Left,
                            ..
                        } => {
                            if let Some(window) = tray.app_handle().get_webview_window("main") {
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        }
                        _ => {}
                    }
                })
                .build(app)
                .map_err(|e| {
                    eprintln!("Failed to create tray icon: {}", e);
                    e
                })?;
            
            Ok(())
        })
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            get_app_version,
            show_save_dialog,
            show_open_dialog,
            show_message_box
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
