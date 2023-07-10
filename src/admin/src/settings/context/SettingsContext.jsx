import {useState, createContext, useEffect} from "@wordpress/element";
import apiFetch from '@wordpress/api-fetch';

const {__} = wp.i18n;

export const SettingsContext = createContext();

function SettingsContextProvider(props) {

    const defaultSettings = {
        'destination_scheme': 'https://',
        'destination_host': '',
        'temp_files_dir': options.temp_files_dir,
        'additional_urls': '',
        'additional_files': '',
        'urls_to_exclude': 'wp-json.php\nwp-login.php',
        'delivery_method': 'zip',
        'local_dir': '',
        'relative_path': '',
        'destination_url_type': 'relative',
        'debugging_mode': true,
        'http_basic_auth_username': '',
        'http_basic_auth_password': '',
        'version': options.version,
        'allow_subsites' : false,
        'force_replace_url': false,
        'clear_directory_before_export': false,
        'deployment-provider': 'zip',
        'tiiny_email': options.admin_email,
        'tiiny_subdomain': '',
        'tiiny_domain_suffix': 'tiiny.site',
        'tiiny_password': '',
        'cdn_api_key': '',
        'cdn_storage_host': 'storage.bunnycdn.com',
        'cdn_access_key': '',
        'cdn_pull_zone': '',
        'cdn_storage_zone': '',
        'cdn_directory': '',
        'cdn_404': '',
        'github_account_type': 'personal',
        'github_user': '',
        'github_email': '',
        'github_personal_access_token': '',
        'github_repository': '',
        'github_existing_repository': 'no',
        'github_repository_visibility': 'public',
        'github_branch': 'main',
        'github_repository_reset': 'no',
        'github_webhook_url': '',
        'aws_region': 'us-east-2',
        'aws_access_key': '',
        'aws_access_secret': '',
        'aws_bucket': '',
        'aws_empty': false,
        'digitalocean_key': '',
        'digitalocean_secret': '',
        'digitalocean_bucket': '',
        'digitalocean_region': '',
        'fix_cors': 'allowed_http_origins',
        'static_url': '',
        'use_forms': false,
        'use_comments': false,
        'comment_redirect': '',
        'use_search': false,
        'search_type': 'fuse',
        'search_index_title': 'title',
        'search_index_content': 'body',
        'search_index_excerpt': '.entry-content',
        'search_excludable': '',
        'algolia_app_id': '',
        'algolia_admin_api_key': '',
        'algolia_search_api_key': '',
        'algolia_index': 'simply_static',
        'algolia_selector': '.search-field',
        'use_minify': false,
        'minify_html': false,
        'minify_css': false,
        'minify_inline_css': false,
        'minify_js': false,
        'minify_inline_js': false,
    }

    const [settingsSaved, setSettingsSaved] = useState(false);
    const [settings, setSettings] = useState(defaultSettings);
    const [configs, setConfigs] = useState({});

    const getSettings = () => {
        apiFetch({path: '/simplystatic/v1/settings'}).then((options) => {
            setSettings(options);
        });
    }

    const saveSettings = () => {
        apiFetch({
            path: '/simplystatic/v1/settings',
            method: 'POST',
            data: settings,
        });
    }

    const resetSettings = () => {
        setSettings(defaultSettings);

        apiFetch({
            path: '/simplystatic/v1/settings',
            method: 'POST',
            data: defaultSettings,
        });
    }

    const importSettings = (newSettings) => {
        setSettings(newSettings);

        apiFetch({
            path: '/simplystatic/v1/settings',
            method: 'POST',
            data: newSettings,
        });
    }

    const updateSetting = (key, value) => {
        setSettings({...settings, [key]: value});
    };

    const getStatus = () => {
        apiFetch({path: '/simplystatic/v1/system-status'}).then((configs) => {
            setConfigs(configs);
        });
    }

    useEffect(() => {
        getSettings();
        getStatus();
    }, []);

    return (
        <SettingsContext.Provider
            value={{
                settings,
                configs,
                settingsSaved,
                setSettingsSaved,
                updateSetting,
                setSettings,
                saveSettings,
                resetSettings,
                importSettings,
            }}
        >
            {props.children}
        </SettingsContext.Provider>
    );
}

export default SettingsContextProvider;
