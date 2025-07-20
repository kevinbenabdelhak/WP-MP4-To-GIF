<?php 

/**
 * Plugin Name: WP MP4 To GIF
 * Plugin URI: https://kevin-benabdelhak.fr/plugins/wp-mp4-to-gif/
 * Description: WP MP4 To GIF permet de convertir facilement des fichiers vidéo MP4 en images GIF animées directement depuis votre navigateur, sans traitement serveur. Les GIF générés peuvent être sauvegardés dans la bibliothèque de médias WordPress en un clic, ou vous pouvez les générer en masse dans les actions groupées.
 * Version: 1.0
 * Author: Kevin Benabdelhak
 * Author URI: https://kevin-benabdelhak.fr/
 * Contributors: kevinbenabdelhak
 */



if ( ! defined( 'ABSPATH' ) ) exit;


if ( !class_exists( 'YahnisElsts\\PluginUpdateChecker\\v5\\PucFactory' ) ) {
    require_once __DIR__ . '/plugin-update-checker/plugin-update-checker.php';
}
use YahnisElsts\PluginUpdateChecker\v5\PucFactory;

$monUpdateChecker = PucFactory::buildUpdateChecker(
    'https://github.com/kevinbenabdelhak/WP-MP4-To-GIF/', 
    __FILE__,
    'wp-mp4-to-gif' 
);
$monUpdateChecker->setBranch('main');





define('WP_MP4TOGIF_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('WP_MP4TOGIF_PLUGIN_URL', plugin_dir_url(__FILE__));




require_once WP_MP4TOGIF_PLUGIN_DIR . 'inc/util.php';
require_once WP_MP4TOGIF_PLUGIN_DIR . 'inc/ajax-upload.php';
require_once WP_MP4TOGIF_PLUGIN_DIR . 'inc/bulk-actions.php';
require_once WP_MP4TOGIF_PLUGIN_DIR . 'inc/enqueue-scripts.php';
require_once WP_MP4TOGIF_PLUGIN_DIR . 'admin/admin-settings.php';