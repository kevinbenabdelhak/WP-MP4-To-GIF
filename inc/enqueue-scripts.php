<?php
if (!defined('ABSPATH')) exit;

add_action('admin_enqueue_scripts', function($hook) {
    if ($hook === 'media_page_mp4-to-gif-converter') {
        wp_enqueue_style('wpmp4togif-admin', WP_MP4TOGIF_PLUGIN_URL . 'assets/admin.css');
        wp_enqueue_script('wpmp4togif-gif', WP_MP4TOGIF_PLUGIN_URL . 'assets/gif.js', [], '0.2.0');
        wp_enqueue_script('wpmp4togif-worker', WP_MP4TOGIF_PLUGIN_URL . 'assets/gif.worker.js', [], '0.2.0');
        wp_enqueue_script('wpmp4togif-admin-js', WP_MP4TOGIF_PLUGIN_URL . 'assets/admin-main.js', ['wpmp4togif-gif'], '2.3', true);
wp_localize_script('wpmp4togif-admin-js', 'WPMP4TogifSettings', [
    'ajaxurl'    => admin_url('admin-ajax.php'),
    'nonce'      => wp_create_nonce('mp4togif_upload_nonce'),
    'worker_url' => WP_MP4TOGIF_PLUGIN_URL . 'assets/gif.worker.js', // <-- Correction ici !
    'resolution' => intval(get_option('mp4togif_resolution', 400)),
    'fps'        => intval(get_option('mp4togif_fps', 6)),
]);
    }
    if ($hook === 'upload.php') {
        wp_enqueue_style('wpmp4togif-admin', WP_MP4TOGIF_PLUGIN_URL . 'assets/admin.css');
        wp_enqueue_script('wpmp4togif-gif', WP_MP4TOGIF_PLUGIN_URL . 'assets/gif.js', [], '0.2.0');
        wp_enqueue_script('wpmp4togif-worker', WP_MP4TOGIF_PLUGIN_URL . 'assets/gif.worker.js', [], '0.2.0');
        wp_enqueue_script('wpmp4togif-bulk-js', WP_MP4TOGIF_PLUGIN_URL . 'assets/bulk-main.js', ['jquery','wpmp4togif-gif'], '2.3', true);
wp_localize_script('wpmp4togif-bulk-js', 'WPMP4TogifSettings', [
    'ajaxurl'    => admin_url('admin-ajax.php'),
    'nonce'      => wp_create_nonce('mp4togif_upload_nonce'),
    'worker_url' => WP_MP4TOGIF_PLUGIN_URL . 'assets/gif.worker.js', // <-- Correction ici !
    'resolution' => intval(get_option('mp4togif_resolution', 400)),
    'fps'        => intval(get_option('mp4togif_fps', 6)),
]);
    }
});