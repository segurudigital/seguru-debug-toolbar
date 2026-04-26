<?php
/**
 * Plugin Name: Seguru Debug Toolbar (mu-plugin)
 * Description: Visual overlay for data-ref element labels. Lightweight mu-plugin drop-in.
 * Version:     2.3.0
 * Author:      Seguru Digital
 * Author URI:  https://seguru.digital
 *
 * Drop this file into wp-content/mu-plugins/ (create the folder if it doesn't exist).
 * Then copy seguru-debug-toolbar.min.js into wp-content/mu-plugins/seguru-debug-toolbar/
 *
 * This mu-plugin reads the same options as the installable plugin version,
 * so both share the same Settings → Debug Toolbar page if present.
 * If no settings exist yet, it defaults to: enabled=off, mode=full,
 * start_hidden=on (press D to reveal — visibility hotkey is configurable),
 * position=bottom-right, role=administrator.
 *
 * Enable via WP-CLI:  wp option update sdt_enabled 1
 */

if ( ! defined( 'ABSPATH' ) ) exit;

add_action( 'wp_enqueue_scripts', function () {

    if ( get_option( 'sdt_enabled', '0' ) !== '1' ) return;

    // Role → capability mapping
    $role_caps = [
        'administrator' => 'manage_options',
        'editor'        => 'edit_others_posts',
        'author'        => 'publish_posts',
    ];
    $min_role = get_option( 'sdt_min_role', 'administrator' );
    $cap      = $role_caps[ $min_role ] ?? 'manage_options';
    if ( ! current_user_can( $cap ) ) return;

    // Look for the JS file next to this plugin file
    $dir  = __DIR__ . '/seguru-debug-toolbar';
    $file = $dir . '/seguru-debug-toolbar.min.js';
    $url  = plugin_dir_url( __FILE__ ) . 'seguru-debug-toolbar/seguru-debug-toolbar.min.js';

    // Fallback: check npm in the active theme.
    // Checks the scoped path first (canonical since v2.2.2) then the legacy
    // unscoped path for themes installed before the rename to @segurudigital/.
    if ( ! file_exists( $file ) ) {
        $candidates = [
            '/node_modules/@segurudigital/seguru-debug-toolbar/dist/seguru-debug-toolbar.min.js',
            '/node_modules/seguru-debug-toolbar/dist/seguru-debug-toolbar.min.js',
        ];
        foreach ( $candidates as $rel ) {
            $theme_path = get_stylesheet_directory() . $rel;
            $theme_url  = get_stylesheet_directory_uri() . $rel;
            if ( file_exists( $theme_path ) ) {
                $file = $theme_path;
                $url  = $theme_url;
                break;
            }
        }
    }

    if ( ! file_exists( $file ) ) return;

    wp_enqueue_script(
        'seguru-debug-toolbar',
        $url,
        [],
        filemtime( $file ),
        true
    );

    wp_localize_script( 'seguru-debug-toolbar', 'sdtConfig', [
        'defaultMode'    => get_option( 'sdt_default_mode', '2' ),
        'startHidden'    => get_option( 'sdt_start_hidden', '1' ),
        'position'       => get_option( 'sdt_position', 'bottom-right' ),
        'classConverter' => get_option( 'sdt_class_converter', '0' ),
        'autoRef'        => get_option( 'sdt_auto_ref', '0' ),
    ] );
} );
