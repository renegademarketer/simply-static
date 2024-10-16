import GeneralSettings from "../pages/GeneralSettings";
import Diagnostics from "../pages/Diagnostics";
import Utilities from "../pages/Utilities";
import {useState, useEffect, useContext} from "@wordpress/element";
import {
    Flex,
    FlexItem,
    // eslint-disable-next-line @wordpress/no-unsafe-wp-apis
    __experimentalNavigatorProvider as NavigatorProvider,
    // eslint-disable-next-line @wordpress/no-unsafe-wp-apis
    __experimentalNavigatorScreen as NavigatorScreen,
    // eslint-disable-next-line @wordpress/no-unsafe-wp-apis
    __experimentalNavigatorButton as NavigatorButton,
    Button,
    Dashicon,
    Card,
    CardBody,
    Notice,
    Animate, __experimentalSpacer as Spacer, SelectControl
} from '@wordpress/components';
import DeploymentSettings from "../pages/DeploymentSettings";
import FormSettings from "../pages/FormSettings";
import SearchSettings from "../pages/SearchSettings";
import DebugSettings from "../pages/DebugSettings";
import IntegrationsSettings from "../pages/IntegrationsSettings";
import Generate from "../pages/Generate";
import Optimize from "../pages/Optimize";
import {SettingsContext} from "../context/SettingsContext";
import apiFetch from "@wordpress/api-fetch";
import EnvironmentSidebar from "./EnvironmentSidebar";

const {__} = wp.i18n;

function SettingsPage() {
    const {
        isRunning,
        setIsRunning,
        blogId,
        settings,
        updateFromNetwork,
        getSettings,
        passedChecks,
        isPro,
        isIntegrationActive,
        canRunIntegration
    } = useContext(SettingsContext);
    const [activeItem, setActiveItem] = useState({activeItem: "/"});
    const [initialPage, setInitialPage] = useState(localStorage.getItem('ss-initial-page') ? localStorage.getItem('ss-initial-page') : options.initial);
    const [initialSet, setInitialSet] = useState(false);
    const [disabledButton, setDisabledButton] = useState(false);
    const [selectedCopySite, setSelectedCopySite] = useState('current');
    const [selectablesSites, setSelectableSites] = useState([]);
    const [isUpdatingFromNetwork, setIsUpdatingFromNetwork] = useState(false);
    const [selectedExportType, setSelectedExportType] = useState('export');

    const runUpdateFromNetwork = (blogId) => {
        // Update settings from selected blog_id.
        updateFromNetwork(blogId);

        setIsUpdatingFromNetwork(true);

        setTimeout(function () {
            setIsUpdatingFromNetwork(false);
            window.location.reload();
        }, 2000);
    }

    useEffect(() => {
        setDisabledButton(isRunning);

        // Change initial page.
        let initialPageRedirect = localStorage.getItem('ss-initial-page');

        if (!initialSet) {
            setInitialSet(true);

            if (initialPageRedirect) {
                setActiveItem(initialPageRedirect);
                setInitialPage(initialPageRedirect);
                localStorage.removeItem('ss-initial-page');
            } else {
                setActiveItem(options.initial);
                setInitialPage(options.initial);
            }
        }

        if (options.selectable_sites && !options.is_network && options.is_multisite) {
            let sites = options.selectable_sites.map(function (site) {
                return {label: `${site.name}`, value: site.blog_id}
            });

            sites.unshift({label: __('Use current settings', 'simply-static'), value: 'current'});
            setSelectableSites(sites);
        }

    }, [options, isRunning]);

    const startExport = () => {
        setDisabledButton(true);

        apiFetch({
            path: '/simplystatic/v1/start-export',
            method: 'POST',
            data: {
                'blog_id': blogId,
                'type': selectedExportType
            }
        }).then(resp => {
            setIsRunning(true);
        });
    }

    const cancelExport = () => {
        apiFetch({
            path: '/simplystatic/v1/cancel-export',
            method: 'POST',
            data: {
                'blog_id': blogId,
            }
        }).then(resp => {
            setIsRunning(false);
        });
    }

    let buildOptions = '';
    if (Object.keys(options.builds).length) {
        const builds = Object.keys(options.builds).map((id) => <option value={id}>{options.builds[id]}</option>);
        buildOptions = <optgroup label="Builds">
            {builds}
        </optgroup>
    }

    return (
        <div className={"plugin-settings-container"}>
            <NavigatorProvider initialPath={initialPage}>
                <Flex>
                    <FlexItem>
                        {options.is_network ?
                            <Card className={"plugin-nav"}>
                                <div className={"plugin-logo"}>
                                    <img alt="Logo"
                                         src={options.logo}/>
                                </div>
                                {'pro' === options.plan && isPro() ?
                                    <p>
                                        Free: <b>{options.version}</b><br></br>
                                        Pro: <b>{options.version_pro}</b>
                                    </p>
                                    :
                                    <p>Version: <b>{options.version}</b></p>
                                }
                                <div className={"generate-container"}>
                                    <Button onClick={() => {
                                        setSelectedExportType('export');
                                        startExport();
                                    }}
                                            disabled={disabledButton}
                                            className={activeItem === '/' ? 'is-active-item generate' : 'generate'}
                                    >
                                        {!disabledButton && [<Dashicon icon="update"/>,
                                            __('Generate Static Files', 'simply-static')
                                        ]}
                                        {disabledButton && [<Dashicon icon="update spin"/>,
                                            __('Generating...', 'simply-static'),
                                        ]}
                                    </Button>
                                    {disabledButton &&
                                        <span onClick={() => {
                                            cancelExport();
                                        }} className={"cancel-button"}>
                                            {__('Cancel Export', 'simply-static')}
                                        </span>
                                    }
                                </div>
                                <Spacer margin={5}/>
                                <Button href="https://simplystatic.com/changelogs/" target="_blank">
                                    <Dashicon icon="editor-ul"/> {__('Changelog', 'simply-static')}
                                </Button>
                                <Button href="https://docs.simplystatic.com" target="_blank">
                                    <Dashicon icon="admin-links"/> {__('Documentation', 'simply-static')}
                                </Button>
                                {'free' === options.plan &&
                                    <Button href="https://simplystatic.com" target="_blank">
                                        <Dashicon
                                            icon="admin-site-alt3"/>Simply Static Pro
                                    </Button>
                                }
                            </Card>
                            :
                            <Card className={"plugin-nav"}>
                                <div className={"plugin-logo"}>
                                    <img alt="Logo"
                                         src={options.logo}/>
                                </div>
                                {'pro' === options.plan && isPro() ?
                                    <p>
                                        Free: <b>{options.version}</b><br></br>
                                        Pro: <b>{options.version_pro}</b>
                                    </p>
                                    :
                                    <p>Version: <b>{options.version}</b></p>
                                }
                                <div className={"generate-container"}>
                                    <SelectControl
                                        className={'generate-type'}
                                        value={selectedExportType}

                                        onChange={(value) => {
                                            setSelectedExportType(value);
                                        }}
                                    >
                                        <option value="export">{__('Export', 'simply-static')}</option>
                                        {'zip' !== settings.delivery_method && 'tiiny' !== settings.delivery_method &&
                                            <>
                                                {'pro' === options.plan && isPro() ?
                                                    <option value="update">{__('Update', 'simply-static')}</option>
                                                    :
                                                    <option disabled
                                                            value="update">{__('Update (Requires Simply Static Pro)', 'simply-static')}</option>
                                                }
                                            </>
                                        }
                                        {buildOptions}
                                    </SelectControl>
                                    <Button onClick={() => {
                                        startExport();
                                    }}
                                            disabled={disabledButton}
                                            className={activeItem === '/' ? 'is-active-item generate' : 'generate'}
                                    >
                                        {!disabledButton && [<Dashicon icon="update"/>,
                                            __('Generate Static Files', 'simply-static')
                                        ]}
                                        {disabledButton && [<Dashicon icon="update spin"/>,
                                            __('Generating...', 'simply-static'),
                                        ]}
                                    </Button>
                                    {disabledButton &&
                                        <span onClick={() => {
                                            cancelExport();
                                        }} className={"cancel-button"}>
                                            {__('Cancel Export', 'simply-static')}
                                        </span>
                                    }
                                </div>
                                <CardBody>
                                    {(!options.is_network && canRunIntegration('environments') ) &&
                                        <EnvironmentSidebar isRunning={isRunning} getSettings={getSettings} />
                                    }
                                    {!options.is_network && options.is_multisite &&
                                        <>
                                            <h4 className={"settings-headline"}> {__('Import', 'simply-static')}</h4>
                                            <SelectControl
                                                value={selectedCopySite}
                                                options={selectablesSites}
                                                help={__('Choose a subsite to import settings from.', 'simply-static')}
                                                onChange={(blog_id) => {
                                                    setSelectedCopySite(blog_id);
                                                }}
                                            />
                                            {selectedCopySite !== 'current' &&
                                                <Button isPrimary onClick={() => {
                                                    runUpdateFromNetwork(selectedCopySite);
                                                }}>{__('Import Settings', 'simply-static')}</Button>
                                            }
                                            {isUpdatingFromNetwork ?
                                                <Animate type="slide-in" options={{origin: 'top'}}>
                                                    {() => (
                                                        <Notice status="success" isDismissible={false}
                                                                className={"upgrade-network-notice"}>
                                                            <p>
                                                                {__('Settings successfully imported.', 'simply-static')}
                                                            </p>
                                                        </Notice>
                                                    )}
                                                </Animate>
                                                :
                                                ''
                                            }
                                        </>
                                    }
                                    <h4 className={"settings-headline"}> {__('Tools', 'simply-static')}</h4>
                                    <NavigatorButton onClick={() => setActiveItem('/')}
                                                     className={activeItem === '/' ? 'is-active-item generate' : 'generate'}
                                                     path="/">
                                        <Dashicon icon="update"/> {__('Activity Log', 'simply-static')}
                                    </NavigatorButton>
                                    <NavigatorButton onClick={() => setActiveItem('/diagnostics')}
                                                     className={activeItem === '/diagnostics' ? 'is-active-item' : ''}
                                                     path="/diagnostics">
                                        <Dashicon icon="bell"/> {__('Diagnostics', 'simply-static')}
                                    </NavigatorButton>
                                </CardBody>
                                <CardBody>
                                    <h4 className={"settings-headline"}> {__('Settings', 'simply-static')}</h4>
                                    <NavigatorButton onClick={() => setActiveItem('/general')}
                                                     className={activeItem === '/general' ? 'is-active-item' : ''}
                                                     path="/general">
                                        <Dashicon icon="admin-generic"/> {__('General', 'simply-static')}
                                    </NavigatorButton>
                                    {!options.is_network &&
                                        <NavigatorButton onClick={() => setActiveItem('/deployment')}
                                                         className={activeItem === '/deployment' ? 'is-active-item' : ''}
                                                         path="/deployment">
                                            <Dashicon icon="migrate"/> {__('Deploy', 'simply-static')}
                                        </NavigatorButton>
                                    }
                                    {!options.is_network &&
                                        <>
                                            <NavigatorButton onClick={() => setActiveItem('/forms')}
                                                             className={activeItem === '/forms' ? 'is-active-item' : ''}
                                                             path="/forms">
                                                <Dashicon icon="align-center"/> {__('Forms', 'simply-static')}
                                            </NavigatorButton>
                                            <NavigatorButton onClick={() => setActiveItem('/search')}
                                                             className={activeItem === '/search' ? 'is-active-item' : ''}
                                                             path="/search">
                                                <Dashicon icon="search"/> {__('Search', 'simply-static')}
                                            </NavigatorButton>
                                            <NavigatorButton onClick={() => setActiveItem('/optimize')}
                                                             className={activeItem === '/optimize' ? 'is-active-item' : ''}
                                                             path="/optimize">
                                                <Dashicon icon="dashboard"/> {__('Optimize', 'simply-static')}
                                            </NavigatorButton>
                                        </>
                                    }
                                </CardBody>
                                <CardBody>
                                    <h4 className={"settings-headline"}> {__('Advanced', 'simply-static')}</h4>
                                    <NavigatorButton onClick={() => setActiveItem('/integrations')}
                                                     className={activeItem === '/integrations' ? 'is-active-item' : ''}
                                                     path="/integrations">
                                        <Dashicon icon="block-default"/> {__('Integrations', 'simply-static')}
                                    </NavigatorButton>
                                    <NavigatorButton onClick={() => setActiveItem('/utilities')}
                                                     className={activeItem === '/utilities' ? 'is-active-item' : ''}
                                                     path="/utilities">
                                        <Dashicon icon="admin-tools"/> {__('Utilities', 'simply-static')}
                                    </NavigatorButton>
                                    <NavigatorButton onClick={() => setActiveItem('/debug')}
                                                     className={activeItem === '/debug' ? 'is-active-item' : ''}
                                                     path="/debug">
                                        <Dashicon icon="editor-help"/> {__('Debug', 'simply-static')}
                                    </NavigatorButton>
                                </CardBody>
                                <CardBody>
                                    <h4 className={"settings-headline"}>Learn</h4>
                                    <Button href="https://docs.simplystatic.com" target="_blank">
                                        <Dashicon icon="admin-links"/> {__('Documentation', 'simply-static')}
                                    </Button>
                                    <Button
                                        href="https://www.youtube.com/playlist?list=PLcpe8_rNg8U5g1gCOa0Ge6T17f50nSvmg"
                                        target="_blank">
                                        <Dashicon icon="format-video"/> {__('Video Course', 'simply-static')}
                                    </Button>
                                    <Button href="https://simplystatic.com/tutorials/" target="_blank">
                                        <Dashicon icon="edit"/> {__('Tutorials', 'simply-static')}
                                    </Button>
                                    {'free' === options.plan &&
                                        <Button className={"ss-get-pro"} isPrimary
                                                href="https://simplystatic.com/pricing/" target="_blank">
                                            Get Simply Static Pro
                                        </Button>
                                    }
                                </CardBody>
                            </Card>
                        }
                    </FlexItem>
                    <FlexItem isBlock={true}>
                        <div class={"plugin-settings"}>
                            {'no' === passedChecks && ! options.is_network ?
                                <Animate type="slide-in" options={{origin: 'top'}}>
                                    {() => (

                                        <Notice status="notice" isDismissible={false}
                                                className={activeItem == '/' ? 'diagnostics-notice diagnostics-notice-generate' : 'diagnostics-notice'}>
                                            <p>
                                                {__('There are errors in diagnostics that may negatively affect your static export.', 'simply-static')}<br></br>
                                                {__('Please review them and get them fixed to avoid problems.', 'simply-static')}
                                            </p>
                                            <NavigatorButton isSecondary onClick={() => setActiveItem('/diagnostics')}
                                                             className={activeItem === '/diagnostics' ? 'is-active-item' : ''}
                                                             path="/diagnostics">
                                                <Dashicon
                                                    icon="editor-help"/> {__('Visit Diagnostics', 'simply-static')}
                                            </NavigatorButton>
                                        </Notice>
                                    )}
                                </Animate>
                                :
                                ''
                            }
                            {'pro' === options.plan && ! isPro() ?
                                <Animate type="slide-in" options={{origin: 'top'}}>
                                    {() => (
                                        <>
                                            <Notice status="error" isDismissible={false}  className={activeItem == '/' ? 'diagnostics-notice diagnostics-notice-generate' : 'diagnostics-notice'}>
                                                <p>
                                                    {__('You are using the pro version without a valid license.', 'simply-static')}<br></br>
                                                    {__('We have temporarily disabled all the pro features now. Please contact our support to have the problem solved.', 'simply-static')}
                                                </p>
                                                <Button isPrimary href={"https://simplystatic.com/support/"} target="_blank">Contact Support</Button>
                                            </Notice>
                                            <Spacer margin={"5px"}/>
                                        </>
                                    )}
                                </Animate>
                                :
                                ''
                            }
                            {activeItem === '/' &&
                                <NavigatorScreen path="/">
                                    <Generate/>
                                </NavigatorScreen>
                            }
                            {activeItem === '/diagnostics' &&
                                <NavigatorScreen path="/diagnostics">
                                    <Diagnostics/>
                                </NavigatorScreen>
                            }
                            {activeItem === '/general' &&
                                <NavigatorScreen path="/general">
                                    <GeneralSettings/>
                                </NavigatorScreen>
                            }
                            {activeItem === '/deployment' &&
                                <NavigatorScreen path="/deployment">
                                    <DeploymentSettings/>
                                </NavigatorScreen>
                            }
                            {activeItem === '/forms' &&
                                <NavigatorScreen path="/forms">
                                    <FormSettings/>
                                </NavigatorScreen>
                            }
                            {activeItem === '/search' &&
                                <NavigatorScreen path="/search">
                                    <SearchSettings/>
                                </NavigatorScreen>
                            }
                            {activeItem === '/optimize' &&
                                <NavigatorScreen path="/optimize">
                                    <Optimize/>
                                </NavigatorScreen>
                            }
                            {activeItem === '/utilities' &&
                                <NavigatorScreen path="/utilities">
                                    <Utilities/>
                                </NavigatorScreen>
                            }
                            {activeItem === '/debug' &&
                                <NavigatorScreen path="/debug">
                                    <DebugSettings/>
                                </NavigatorScreen>
                            }
                            {activeItem === '/integrations' &&
                                <NavigatorScreen path="/integrations">
                                    <IntegrationsSettings/>
                                </NavigatorScreen>
                            }
                        </div>
                    </FlexItem>
                </Flex>
            </NavigatorProvider>
        </div>
    )
}

export default SettingsPage;