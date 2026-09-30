<?php
/**
 * Plugin Name: Ideas de manicura - Importador de inspiración
 * Description: Clasifica imágenes importadas y las incluye en el catálogo de inspiración de la app.
 * Version: 0.3.0
 * Requires PHP: 7.4
 */

if (!defined('ABSPATH')) {
    exit;
}

const INSPIRATION_IMPORTER_APP = 'diseno-de-unas';
const INSPIRATION_IMPORTER_CATEGORIES = array(
    'efecto-espejo', 'efecto-metal', 'cat-eye', 'verano', 'flores', 'animal-print',
    'coquette', 'primavera', 'francesas', 'sencillas', 'marmoladas',
    'aesthetic', 'oscuras', 'baby-boomer', 'halloween', 'navidad',
    'san-valentin', '3d', 'efecto-aura', 'feria', 'tono-mate',
);

add_action('rest_api_init', function () {
    register_rest_route('inspiration-importer/v1', '/status', array(
        'methods' => WP_REST_Server::READABLE,
        'permission_callback' => function () { return current_user_can('upload_files'); },
        'callback' => function () {
            return array('ready' => true, 'app' => INSPIRATION_IMPORTER_APP, 'version' => '0.3.0', 'categories' => INSPIRATION_IMPORTER_CATEGORIES);
        },
    ));

    // Public, like the galleries: aggregate every upload in this content update,
    // not just the latest 100 images returned by the home feed.
    register_rest_route('inspiration-importer/v1', '/category-updates', array(
        'methods' => WP_REST_Server::READABLE,
        'permission_callback' => '__return_true',
        'args' => array(
            'since' => array(
                'required' => true,
                'type' => 'string',
                'validate_callback' => function ($value) {
                    return is_string($value)
                        && preg_match('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/', $value)
                        && rest_parse_date($value) !== false;
                },
            ),
        ),
        'callback' => function ($request) {
            $ids = get_posts(array(
                'post_type' => 'attachment',
                'post_status' => 'inherit',
                'post_mime_type' => 'image',
                'posts_per_page' => -1,
                'fields' => 'ids',
                'meta_key' => '_inspiration_importer_app',
                'meta_value' => INSPIRATION_IMPORTER_APP,
                'date_query' => array(array(
                    'column' => 'post_date_gmt',
                    'after' => gmdate('Y-m-d H:i:s', rest_parse_date($request['since'])),
                    'inclusive' => true,
                )),
            ));
            update_meta_cache('post', $ids);
            $categories = array();
            foreach ($ids as $id) {
                $category = get_post_meta($id, '_inspiration_importer_category', true);
                if (!in_array($category, INSPIRATION_IMPORTER_CATEGORIES, true)) {
                    continue;
                }
                if (!isset($categories[$category])) {
                    $categories[$category] = array('category' => $category, 'count' => 0);
                }
                $categories[$category]['count']++;
            }
            $response = new WP_REST_Response(array('since' => $request['since'], 'categories' => array_values($categories)));
            $response->header('Cache-Control', 'no-store');
            return $response;
        },
    ));

    register_rest_route('inspiration-importer/v1', '/exists/(?P<media_id>\d+)', array(
        'methods' => WP_REST_Server::READABLE,
        'permission_callback' => function () { return current_user_can('upload_files'); },
        'callback' => function ($request) {
            $ids = get_posts(array(
                'post_type' => 'attachment',
                'post_status' => 'inherit',
                'posts_per_page' => 1,
                'fields' => 'ids',
                'meta_key' => '_inspiration_importer_media_id',
                'meta_value' => (string) $request['media_id'],
            ));
            if (!$ids) {
                return array('exists' => false);
            }
            $id = (int) $ids[0];
            return array(
                'exists' => true,
                'id' => $id,
                'categoria' => get_post_meta($id, '_inspiration_importer_category', true),
                'url' => wp_get_attachment_url($id),
            );
        },
    ));

    register_rest_route('inspiration-importer/v1', '/exists-hash/(?P<hash>[a-f0-9]{64})', array(
        'methods' => WP_REST_Server::READABLE,
        'permission_callback' => function () { return current_user_can('upload_files'); },
        'callback' => function ($request) {
            $ids = get_posts(array(
                'post_type' => 'attachment',
                'post_status' => 'inherit',
                'posts_per_page' => 1,
                'fields' => 'ids',
                'meta_key' => '_inspiration_importer_hash',
                'meta_value' => (string) $request['hash'],
            ));
            if (!$ids) {
                return array('exists' => false);
            }
            $id = (int) $ids[0];
            return array(
                'exists' => true,
                'id' => $id,
                'categoria' => get_post_meta($id, '_inspiration_importer_category', true),
                'url' => wp_get_attachment_url($id),
            );
        },
    ));

    register_rest_route('inspiration-importer/v1', '/classify/(?P<id>\d+)', array(
        'methods' => WP_REST_Server::CREATABLE,
        'permission_callback' => function ($request) {
            return current_user_can('upload_files') && current_user_can('edit_post', (int) $request['id']);
        },
        'args' => array(
            'categoria' => array('required' => true, 'type' => 'string'),
            'source_permalink' => array('required' => false, 'type' => 'string'),
            'source_media_id' => array('required' => false, 'type' => 'string'),
            'source_hash' => array('required' => true, 'type' => 'string'),
        ),
        'callback' => function ($request) {
            $id = (int) $request['id'];
            $post = get_post($id);
            $category = sanitize_title($request['categoria']);
            if (!$post || $post->post_type !== 'attachment' || strpos((string) get_post_mime_type($id), 'image/') !== 0) {
                return new WP_Error('invalid_media', 'El ID no corresponde a una imagen.', array('status' => 400));
            }
            if (!in_array($category, INSPIRATION_IMPORTER_CATEGORIES, true)) {
                return new WP_Error('invalid_category', 'Categoría de inspiración no permitida.', array('status' => 400));
            }
            $hash = strtolower((string) $request['source_hash']);
            $media_id = (string) $request['source_media_id'];
            if (!preg_match('/^[a-f0-9]{64}$/', $hash) || ($media_id !== '' && !preg_match('/^\d+$/', $media_id))) {
                return new WP_Error('invalid_source', 'Identificador de origen no válido.', array('status' => 400));
            }

            update_post_meta($id, '_inspiration_importer_app', INSPIRATION_IMPORTER_APP);
            update_post_meta($id, '_inspiration_importer_category', $category);
            update_post_meta($id, '_inspiration_importer_hash', $hash);
            if ($media_id !== '') {
                update_post_meta($id, '_inspiration_importer_media_id', $media_id);
            }
            // These values also let the existing custom endpoint find the image
            // if it reads ordinary attachment metadata.
            update_post_meta($id, 'app', INSPIRATION_IMPORTER_APP);
            update_post_meta($id, 'categoria', $category);
            $source = esc_url_raw((string) $request['source_permalink']);
            if ($source && preg_match('#^https://(www\.)?instagram\.com/#i', $source)) {
                update_post_meta($id, '_inspiration_importer_source', $source);
            }
            return array('classified' => true, 'id' => $id, 'app' => INSPIRATION_IMPORTER_APP, 'categoria' => $category);
        },
    ));
});

// The site's existing /custom/v1/media-filtered endpoint is read-only and its
// metadata implementation is not exposed. Merge this plugin's uploads into its
// response, so the mobile app sees them without needing another release.
add_filter('rest_request_after_callbacks', function ($response, $handler, $request) {
    if ($request->get_route() !== '/custom/v1/media-filtered' || is_wp_error($response)) {
        return $response;
    }
    $app = sanitize_text_field((string) $request->get_param('app'));
    if ($app !== INSPIRATION_IMPORTER_APP) {
        return $response;
    }
    $category = sanitize_title((string) $request->get_param('categoria'));
    $meta_query = array(
        array('key' => '_inspiration_importer_app', 'value' => INSPIRATION_IMPORTER_APP),
    );
    if ($category !== '') {
        $meta_query[] = array('key' => '_inspiration_importer_category', 'value' => $category);
    }
    $ids = get_posts(array(
        'post_type' => 'attachment',
        'post_status' => 'inherit',
        'posts_per_page' => $category === '' ? 100 : -1,
        'orderby' => 'date',
        'order' => 'DESC',
        'fields' => 'ids',
        'meta_query' => $meta_query,
    ));
    $imported = array();
    foreach ($ids as $id) {
        $source_url = wp_get_attachment_url($id);
        if (!$source_url) {
            continue;
        }
        $imported[] = array(
            'id' => (int) $id,
            'title' => get_the_title($id),
            'url' => $source_url,
            'app' => INSPIRATION_IMPORTER_APP,
            'categoria' => get_post_meta($id, '_inspiration_importer_category', true),
        );
    }
    $rest_response = rest_ensure_response($response);
    $existing = $rest_response->get_data();
    if (!is_array($existing)) {
        return $response;
    }
    $seen = array();
    $combined = array();
    foreach (array_merge($imported, $existing) as $item) {
        if (!is_array($item) || empty($item['id'])) {
            continue;
        }
        $id = (int) $item['id'];
        if (isset($seen[$id])) {
            continue;
        }
        $seen[$id] = true;
        $combined[] = $item;
    }
    if ($category === '') {
        $combined = array_slice($combined, 0, 100);
    }
    $rest_response->set_data($combined);
    return $rest_response;
}, 10, 3);
