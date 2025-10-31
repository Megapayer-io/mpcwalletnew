// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

pub fn main() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
