<?php

if (!defined('ABSPATH')) exit;

add_filter('bulk_actions-upload', function($actions){
    $actions['mp4togif_bulk_convert'] = 'Convertir en GIF';
    return $actions;
});