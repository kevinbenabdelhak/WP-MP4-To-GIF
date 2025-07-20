<?php
if ( !defined( 'ABSPATH' ) ) exit;


add_action('admin_init', function() {
    register_setting('mp4togif_options', 'mp4togif_resolution', [
        'type' => 'integer',
        'default' => 400,
        'sanitize_callback' => 'absint'
    ]);
    register_setting('mp4togif_options', 'mp4togif_fps', [
        'type' => 'integer',
        'default' => 6,
        'sanitize_callback' => function($v){ return max(1, min(30, intval($v))); }
    ]);
});




// Page de menu
add_action('admin_menu', function() {
    add_media_page('WP MP4 To GIF', 'WP MP4 To GIF', 'upload_files', 'mp4-to-gif-converter', 'wp_mp4togif_admin_page');
});




// Page de conversion + réglages
function wp_mp4togif_admin_page() {
    $option_reso = intval(get_option('mp4togif_resolution', 400));
    $option_fps  = intval(get_option('mp4togif_fps', 6));
    ?>
    <div class="wrap">
        <h1>WP MP4 To GIF</h1>
        <nav class="mp4togif-tab-nav">
            <a href="#mp4togif-convert" class="active" id="mp4togif-tab-convert">Convertir</a>
            <a href="#mp4togif-settings" id="mp4togif-tab-settings">Réglages</a>
        </nav>
        <div id="mp4togif-convert" class="mp4togif-tab-panel active">
            <input type="file" id="mp4input" accept="video/mp4" />
            <br /><br />
            <button id="convertBtn" class="button button-primary">Convertir en GIF</button>
            <div style="margin:14px 0 8px;max-width:470px;">
                <progress id="gifFrameProgress" max="100" value="0" style="display:none;width:100%;height:22px;"></progress>
                <div id="gifGenerationLoader" style="display:none;text-align:center;margin:18px 0;">
                    <span style="font-weight:bold;color:#2271b1">Génération du GIF…</span><br>
                    <span class="mp4togif-spinner" style="margin:10px auto;"></span>
                </div>
            </div>
            <div id="progress" style="margin:10px 0;color:#2271b1; font-weight:bold"></div>
            <div id="loadingIndicator" style="display:none;">Chargement en cours...</div>
            <a id="downloadGif" class="button" style="display:none; margin-bottom:10px;">Télécharger le GIF</a>
            <div id="upload-section" style="display:none;">
                <button id="uploadGif" class="button">Enregistrer dans la Médiathèque</button>
                <span id="uploadResult"></span>
            </div>
            <img id="gifPreview" style="max-width:470px;max-height:340px;display:none;box-shadow:2px 2px 20px #aaa;" />
        </div>
        <div id="mp4togif-settings" class="mp4togif-tab-panel">
            <form method="post" action="options.php">
                <?php settings_fields('mp4togif_options'); ?>
                <table class="form-table">
                    <tr>
                        <th><label for="mp4togif_resolution">Largeur du GIF :</label></th>
                        <td>
                            <input name="mp4togif_resolution" type="range" min="100" max="2000"
                                value="<?php echo esc_attr($option_reso); ?>"
                                style="width:300px;"
                                oninput="document.getElementById('mp4togif_reso_val').textContent=this.value">
                            <span id="mp4togif_reso_val"><?php echo esc_html($option_reso); ?></span> px
                        </td>
                    </tr>
                    <tr>
                        <th><label for="mp4togif_fps">Images par seconde</label></th>
                        <td>
                            <input name="mp4togif_fps" type="range" min="1" max="20"
                                value="<?php echo esc_attr($option_fps); ?>"
                                style="width:300px;"
                                oninput="document.getElementById('mp4togif_fps_val').textContent=this.value">
                            <span id="mp4togif_fps_val"><?php echo esc_html($option_fps); ?></span> ips
                            <br><small>(plus il y a d’images/seconde, plus le GIF est fluide mais gros)</small>
                        </td>
                    </tr>
                </table>
                <p><input type="submit" class="button button-secondary" value="Enregistrer"></p>
            </form>
        </div>
    </div>
    <?php
}