<?php
/**
 * Plugin Name:  Seguru Debug Toolbar
 * Plugin URI:   https://github.com/seguru-digital/seguru-debug-toolbar
 * Description:  Visual overlay for data-ref element labels. Shows section references on the front end for admins — useful for QA, revision feedback, and bug reporting.
 * Version:      1.1.1
 * Author:       Seguru Digital
 * Author URI:   https://seguru.digital
 * License:      MIT
 * License URI:  https://opensource.org/licenses/MIT
 * Requires PHP: 8.1
 * Requires at least: 5.8
 * Tested up to: 6.7
 *
 * Install: Upload via wp-admin → Plugins → Add New → Upload.
 * Then configure under Settings → Debug Toolbar.
 */

if ( ! defined( 'ABSPATH' ) ) exit;

// ── Constants ─────────────────────────────────────────────────
define( 'SDT_VERSION', '1.1.1' );
define( 'SDT_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'SDT_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'SDT_OPTION_GROUP', 'sdt_settings' );

// ── Default values ────────────────────────────────────────────
function sdt_defaults() {
    return [
        'sdt_enabled'         => '0',
        'sdt_default_mode'    => '0',
        'sdt_position'        => 'bottom-right',
        'sdt_min_role'        => 'administrator',
        'sdt_class_converter' => '0',
        'sdt_auto_ref'        => '0',
    ];
}

function sdt_get( $key ) {
    $defaults = sdt_defaults();
    return get_option( $key, $defaults[ $key ] ?? '' );
}

// ── Allowed values for sanitisation ───────────────────────────
function sdt_allowed_modes()     { return [ '0', '1', '2' ]; }
function sdt_allowed_positions() { return [ 'bottom-right', 'bottom-left', 'top-right', 'top-left' ]; }
function sdt_allowed_roles()     { return [ 'administrator', 'editor', 'author' ]; }

// Map role slug → WP capability for the access check
function sdt_role_capability( $role ) {
    $map = [
        'administrator' => 'manage_options',
        'editor'        => 'edit_others_posts',
        'author'        => 'publish_posts',
    ];
    return $map[ $role ] ?? 'manage_options';
}

// ── Register settings ─────────────────────────────────────────
add_action( 'admin_init', function () {

    register_setting( SDT_OPTION_GROUP, 'sdt_enabled', [
        'type'              => 'string',
        'sanitize_callback' => function ( $v ) { return $v === '1' ? '1' : '0'; },
        'default'           => '0',
    ] );

    register_setting( SDT_OPTION_GROUP, 'sdt_default_mode', [
        'type'              => 'string',
        'sanitize_callback' => function ( $v ) { return in_array( $v, sdt_allowed_modes(), true ) ? $v : '0'; },
        'default'           => '0',
    ] );

    register_setting( SDT_OPTION_GROUP, 'sdt_position', [
        'type'              => 'string',
        'sanitize_callback' => function ( $v ) { return in_array( $v, sdt_allowed_positions(), true ) ? $v : 'bottom-right'; },
        'default'           => 'bottom-right',
    ] );

    register_setting( SDT_OPTION_GROUP, 'sdt_min_role', [
        'type'              => 'string',
        'sanitize_callback' => function ( $v ) { return in_array( $v, sdt_allowed_roles(), true ) ? $v : 'administrator'; },
        'default'           => 'administrator',
    ] );

    register_setting( SDT_OPTION_GROUP, 'sdt_class_converter', [
        'type'              => 'string',
        'sanitize_callback' => function ( $v ) { return $v === '1' ? '1' : '0'; },
        'default'           => '0',
    ] );

    register_setting( SDT_OPTION_GROUP, 'sdt_auto_ref', [
        'type'              => 'string',
        'sanitize_callback' => function ( $v ) { return $v === '1' ? '1' : '0'; },
        'default'           => '0',
    ] );
} );

// ── Settings page menu item ───────────────────────────────────
add_action( 'admin_menu', function () {
    add_options_page(
        'Debug Toolbar',                    // page title
        'Debug Toolbar',                    // menu title
        'manage_options',                   // capability
        'seguru-debug-toolbar',             // menu slug
        'sdt_render_settings_page'          // callback
    );
} );

// ── Add Settings link on Plugins list ─────────────────────────
add_filter( 'plugin_action_links_' . plugin_basename( __FILE__ ), function ( $links ) {
    $url = admin_url( 'options-general.php?page=seguru-debug-toolbar' );
    array_unshift( $links, '<a href="' . esc_url( $url ) . '">Settings</a>' );
    return $links;
} );

// ── Activation notice ─────────────────────────────────────────
register_activation_hook( __FILE__, function () {
    set_transient( 'sdt_activation_notice', true, 60 );
} );

add_action( 'admin_notices', function () {
    if ( ! get_transient( 'sdt_activation_notice' ) ) return;
    delete_transient( 'sdt_activation_notice' );
    $url = admin_url( 'options-general.php?page=seguru-debug-toolbar' );
    echo '<div class="notice notice-info is-dismissible">';
    echo '<p><strong>Seguru Debug Toolbar</strong> is ready. ';
    echo '<a href="' . esc_url( $url ) . '">Configure it under Settings &rarr; Debug Toolbar.</a></p>';
    echo '</div>';
} );

// ── Front-end enqueue ─────────────────────────────────────────
add_action( 'wp_enqueue_scripts', function () {

    if ( sdt_get( 'sdt_enabled' ) !== '1' ) return;

    $min_role = sdt_get( 'sdt_min_role' );
    $cap      = sdt_role_capability( $min_role );
    if ( ! current_user_can( $cap ) ) return;

    $file = SDT_PLUGIN_DIR . 'assets/seguru-debug-toolbar.min.js';
    if ( ! file_exists( $file ) ) return;

    wp_enqueue_script(
        'seguru-debug-toolbar',
        SDT_PLUGIN_URL . 'assets/seguru-debug-toolbar.min.js',
        [],
        SDT_VERSION,
        true
    );

    // Pass config to the JS
    wp_localize_script( 'seguru-debug-toolbar', 'sdtConfig', [
        'defaultMode'    => sdt_get( 'sdt_default_mode' ),
        'position'       => sdt_get( 'sdt_position' ),
        'classConverter' => sdt_get( 'sdt_class_converter' ),
        'autoRef'        => sdt_get( 'sdt_auto_ref' ),
    ] );
} );

// ── Render settings page ──────────────────────────────────────
function sdt_render_settings_page() {
    if ( ! current_user_can( 'manage_options' ) ) return;

    $enabled         = sdt_get( 'sdt_enabled' );
    $default_mode    = sdt_get( 'sdt_default_mode' );
    $position        = sdt_get( 'sdt_position' );
    $min_role        = sdt_get( 'sdt_min_role' );
    $class_converter = sdt_get( 'sdt_class_converter' );
    $auto_ref        = sdt_get( 'sdt_auto_ref' );

    ?>
    <div class="wrap">
        <h1>Debug Toolbar</h1>

        <form method="post" action="options.php">
            <?php settings_fields( SDT_OPTION_GROUP ); ?>

            <style>
                .sdt-card { background: #fff; border: 1px solid #C3C4C7; border-radius: 4px; margin-bottom: 12px; overflow: hidden; }
                .sdt-card__header { padding: 12px 16px; border-bottom: 1px solid #F0F0F1; }
                .sdt-card__header h2 { font-size: 14px; font-weight: 600; margin: 0; padding: 0; }
                .sdt-card__body { padding: 16px; }
                .sdt-desc { font-size: 12px; color: #646970; margin-top: 6px; line-height: 1.5; }
                .sdt-field { margin-bottom: 16px; }
                .sdt-field:last-child { margin-bottom: 0; }
                .sdt-field__label { display: block; font-size: 13px; font-weight: 600; color: #1D2327; margin-bottom: 8px; }
                .sdt-radios { display: flex; flex-direction: column; gap: 6px; }
                .sdt-radios label { display: flex; align-items: center; gap: 6px; font-size: 13px; cursor: pointer; }
                .sdt-radios .desc { color: #646970; font-size: 12px; }
                .sdt-help-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
                @media (max-width: 782px) { .sdt-help-grid { grid-template-columns: 1fr; } }
                .sdt-help-item h3 { font-size: 13px; font-weight: 600; margin: 0 0 4px; }
                .sdt-help-item p { font-size: 12px; color: #646970; margin: 0; line-height: 1.6; }
                .sdt-modes-table { width: 100%; border-collapse: collapse; margin-top: 12px; }
                .sdt-modes-table th, .sdt-modes-table td { padding: 8px 10px; text-align: left; font-size: 12px; border-bottom: 1px solid #F0F0F1; }
                .sdt-modes-table th { font-weight: 600; color: #646970; text-transform: uppercase; font-size: 11px; letter-spacing: 0.3px; }
                .sdt-modes-table .mode-name { font-weight: 600; white-space: nowrap; }
                .sdt-modes-table tr:last-child td { border-bottom: none; }
                .sdt-footer { display: flex; align-items: center; gap: 8px; padding-top: 16px; margin-top: 8px; border-top: 1px solid #E5E7EB; }
                .sdt-footer a { display: flex; align-items: center; gap: 6px; text-decoration: none; color: #6C6E71; font-size: 12px; }
                .sdt-footer a:hover { color: #1D2327; }
                .sdt-footer .version { font-size: 11px; color: #A7AAB0; margin-left: auto; }
            </style>

            <!-- Status -->
            <div class="sdt-card">
                <div class="sdt-card__header"><h2>Status</h2></div>
                <div class="sdt-card__body">
                    <label>
                        <input type="checkbox" name="sdt_enabled" value="1" <?php checked( $enabled, '1' ); ?>>
                        Enable debug toolbar on the front end
                    </label>
                    <p class="sdt-desc">
                        When enabled, the toolbar loads for logged-in users who meet the access requirement below.
                        Regular visitors never see it. The <code>data-ref</code> attributes stay in your markup either way — they're invisible and have zero performance impact.
                    </p>
                </div>
            </div>

            <!-- Display -->
            <div class="sdt-card">
                <div class="sdt-card__header"><h2>Display</h2></div>
                <div class="sdt-card__body">
                    <div class="sdt-field">
                        <span class="sdt-field__label">Default mode</span>
                        <div class="sdt-radios">
                            <label>
                                <input type="radio" name="sdt_default_mode" value="0" <?php checked( $default_mode, '0' ); ?>>
                                Icons <span class="desc">— small dot on each section, hover to see the label</span>
                            </label>
                            <label>
                                <input type="radio" name="sdt_default_mode" value="1" <?php checked( $default_mode, '1' ); ?>>
                                Off <span class="desc">— toolbar loads but labels start hidden</span>
                            </label>
                            <label>
                                <input type="radio" name="sdt_default_mode" value="2" <?php checked( $default_mode, '2' ); ?>>
                                Full <span class="desc">— all labels visible immediately</span>
                            </label>
                        </div>
                        <p class="sdt-desc">
                            You can always cycle between modes by pressing <kbd>L</kbd> on the front end.
                        </p>
                    </div>

                    <div class="sdt-field" style="margin-top: 16px;">
                        <span class="sdt-field__label">Toolbar position</span>
                        <div class="sdt-radios">
                            <?php
                            $positions = [
                                'bottom-right' => 'Bottom right',
                                'bottom-left'  => 'Bottom left',
                                'top-right'    => 'Top right',
                                'top-left'     => 'Top left',
                            ];
                            foreach ( $positions as $val => $label ) :
                            ?>
                                <label>
                                    <input type="radio" name="sdt_position" value="<?php echo esc_attr( $val ); ?>" <?php checked( $position, $val ); ?>>
                                    <?php echo esc_html( $label ); ?>
                                </label>
                            <?php endforeach; ?>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Access -->
            <div class="sdt-card">
                <div class="sdt-card__header"><h2>Access</h2></div>
                <div class="sdt-card__body">
                    <div class="sdt-field">
                        <label class="sdt-field__label" for="sdt_min_role">Minimum role</label>
                        <select name="sdt_min_role" id="sdt_min_role">
                            <?php
                            $roles = [
                                'administrator' => 'Administrator',
                                'editor'        => 'Editor',
                                'author'        => 'Author',
                            ];
                            foreach ( $roles as $val => $label ) :
                            ?>
                                <option value="<?php echo esc_attr( $val ); ?>" <?php selected( $min_role, $val ); ?>>
                                    <?php echo esc_html( $label ); ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <p class="sdt-desc">
                        Users with this role or higher will see the toolbar when they're logged in and viewing the front end.
                        Visitors who aren't logged in will never see the toolbar, regardless of this setting.
                    </p>
                </div>
            </div>

            <!-- Page Builders -->
            <div class="sdt-card">
                <div class="sdt-card__header"><h2>Page Builders</h2></div>
                <div class="sdt-card__body">
                    <div class="sdt-field">
                        <label>
                            <input type="checkbox" name="sdt_class_converter" value="1" <?php checked( $class_converter, '1' ); ?>>
                            Enable class-to-ref converter
                        </label>
                        <p class="sdt-desc">
                            Converts CSS classes prefixed with <code>dataref-</code> into <code>data-ref</code> attributes automatically.
                            Add a class like <code>dataref-home-01-hero</code> in any page builder and the toolbar picks it up.
                            Works with every builder, including free tiers that don't support custom HTML attributes.
                        </p>
                    </div>

                    <div class="sdt-field" style="margin-top: 16px;">
                        <label>
                            <input type="checkbox" name="sdt_auto_ref" value="1" <?php checked( $auto_ref, '1' ); ?>>
                            Enable auto-ref
                        </label>
                        <p class="sdt-desc">
                            Automatically generates <code>data-ref</code> values for major page sections based on the page slug and section position.
                            Detects Elementor, Bricks, Oxygen, Breakdance, and standard <code>&lt;section&gt;</code> elements.
                            Sections that already have a <code>data-ref</code> (manual or from the class converter) keep their value.
                            Auto-generated refs follow the format <code>{slug}-01</code>, <code>{slug}-02</code>, etc.
                        </p>
                    </div>
                </div>
            </div>

            <!-- How It Works -->
            <div class="sdt-card">
                <div class="sdt-card__header"><h2>How It Works</h2></div>
                <div class="sdt-card__body">
                    <div class="sdt-help-grid">
                        <div class="sdt-help-item">
                            <h3>Switch modes</h3>
                            <p>Press <kbd>L</kbd> on your keyboard to cycle between Icons, Off, and Full modes. Or click the mode buttons on the toolbar bar in the corner of the page.</p>
                        </div>
                        <div class="sdt-help-item">
                            <h3>Copy a section reference</h3>
                            <p>Click any label (the dot, the tooltip, or the full-text label) to copy the section code to your clipboard. A green toast confirms the copy.</p>
                        </div>
                        <div class="sdt-help-item">
                            <h3>Report an issue</h3>
                            <p>Turn on labels, find the section with the issue, click the label to copy it, and paste the code into your email or support ticket. Your developer can search the codebase for that exact code.</p>
                        </div>
                        <div class="sdt-help-item">
                            <h3>What are data-ref codes?</h3>
                            <p>Every tagged section on your site has a short code like <code>home-01-hero</code> that identifies it. These codes connect your wireframes, copy documents, and live site sections together. The toolbar makes them visible.</p>
                        </div>
                    </div>

                    <table class="sdt-modes-table">
                        <thead>
                            <tr>
                                <th>Mode</th>
                                <th>What you see</th>
                                <th>Best for</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class="mode-name">Icons</td>
                                <td>Small dot on each section. Hover to reveal the full code.</td>
                                <td>Browsing normally while having labels available on hover</td>
                            </tr>
                            <tr>
                                <td class="mode-name">Off</td>
                                <td>Nothing visible. Clean view.</td>
                                <td>Screenshots, presentations, checking the page as visitors see it</td>
                            </tr>
                            <tr>
                                <td class="mode-name">Full</td>
                                <td>Code label visible on every section at all times.</td>
                                <td>QA passes, revision rounds, cross-referencing copy documents</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <?php submit_button(); ?>
        </form>

        <!-- Footer badge -->
        <div class="sdt-footer">
            <a href="https://seguru.digital" target="_blank" rel="noopener">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="16" height="16" style="flex-shrink:0">
                    <circle cx="256" cy="256" r="256" fill="#00C0F3"/>
                    <path fill="#fff" d="M328.35,158.25c0,39.96-32.39,72.35-72.35,72.35s-72.35-32.39-72.35-72.35,32.39-72.35,72.35-72.35,72.35,32.39,72.35,72.35M141.19,624.36h0v520.12c0,69.87,30.78,120.8,92.17,128.41v63.09h44.33v-63.09c61.39-7.61,92.17-58.54,92.17-128.41V480.38c0-50.17-16.33-91-46.67-112,14-17.5,29.17-31.49,29.17-57.78,0-17.25-4.37-38.67-26.63-58.37,28.72-21.35,47.41-55.43,47.41-93.97,0-64.7-52.45-117.15-117.15-117.15s-117.15,52.45-117.15,117.15,52.45,117.15,117.15,117.15c8.86,0,17.46-1.07,25.75-2.93,12.7,9.57,20.26,21.05,21.32,31.55,2.55,25.37-19.72,42.73-59.21,83.02-59.5,61.84-77,81.67-87.5,109.67-11.67,28-15.17,65.33-15.17,112v15.65h0Z M185.52,1105.92h0v-513.54c0-77,23.33-102.67,88.67-171.51,4.67-5.83,10.5-11.67,17.5-18.67,25.67,15.17,33.83,50.17,33.83,110.84v598.76c0,81.67-14,117.84-70,117.84s-70-36.17-70-117.84v-5.88h0Z"/>
                </svg>
                Powered by Seguru Digital
            </a>
            <span class="version">v<?php echo esc_html( SDT_VERSION ); ?></span>
        </div>

    </div>
    <?php
}
