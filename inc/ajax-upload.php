<?php

if (!defined('ABSPATH')) exit;


// AJAX upload du GIF
add_action('wp_ajax_mp4togif_upload_ajax', function() {
    check_ajax_referer('mp4togif_upload_nonce', 'nonce');
    if(empty($_FILES['gif_file']['tmp_name'])) wp_send_json_error('Aucun fichier reçu.');
    $file = [
        'name' => $_FILES['gif_file']['name'],
        'type' => $_FILES['gif_file']['type'],
        'tmp_name' => $_FILES['gif_file']['tmp_name'],
        'error' => $_FILES['gif_file']['error'],
        'size' => $_FILES['gif_file']['size']
    ];

    require_once(ABSPATH . 'wp-admin/includes/file.php');
    require_once(ABSPATH . 'wp-admin/includes/media.php');
    require_once(ABSPATH . 'wp-admin/includes/image.php');

    $id = media_handle_sideload($file, 0);

    // Hériter du titre du MP4 source si 'source_id' présent (pour bulk)

    if (is_int($id) && !empty($_POST['source_id'])) {
        $src_id = intval($_POST['source_id']);
        $src_post = get_post($src_id);
        if ($src_post && $src_post->post_type === 'attachment') {
            $new_title = $src_post->post_title ?: get_the_title($id);
            $postarr = [
                'ID' => $id,
                'post_title' => $new_title,
                'post_name' => sanitize_title($new_title),
            ];
            wp_update_post($postarr);
        }
    }

    if (is_wp_error($id)) wp_send_json_error($id->get_error_message());
    $url = wp_get_attachment_url($id);
    wp_send_json_success(['id'=>$id,'url'=>$url]);

});