<?php
if ( !defined( 'ABSPATH' ) ) exit;


add_action('wp_ajax_mp4togif_get_attachment_url', function(){
    $id = intval($_GET['id'] ?? 0);
    $url = $id ? wp_get_attachment_url($id) : '';
    wp_send_json(['url'=>$url]);
});