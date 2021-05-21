'use strict';


customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">document-maps documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="overview.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>README
                            </a>
                        </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-toggle="collapse" ${ isNormalMode ?
                                'data-target="#modules-links"' : 'data-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/AppModule.html" data-type="entity-link">AppModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-AppModule-cee3fd12a65dab1cdd98b730c154559d"' : 'data-target="#xs-components-links-module-AppModule-cee3fd12a65dab1cdd98b730c154559d"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-AppModule-cee3fd12a65dab1cdd98b730c154559d"' :
                                            'id="xs-components-links-module-AppModule-cee3fd12a65dab1cdd98b730c154559d"' }>
                                            <li class="link">
                                                <a href="components/AppComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">AppComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/AppRouter.html" data-type="entity-link">AppRouter</a>
                            </li>
                            <li class="link">
                                <a href="modules/HomeModule.html" data-type="entity-link">HomeModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-HomeModule-6b27e9a5949ad27879aee860c1ce11a6"' : 'data-target="#xs-components-links-module-HomeModule-6b27e9a5949ad27879aee860c1ce11a6"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-HomeModule-6b27e9a5949ad27879aee860c1ce11a6"' :
                                            'id="xs-components-links-module-HomeModule-6b27e9a5949ad27879aee860c1ce11a6"' }>
                                            <li class="link">
                                                <a href="components/ComparisonComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ComparisonComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ComparisonEntryComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ComparisonEntryComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DocumentComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DocumentComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DocumentContentComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DocumentContentComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/GraphComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">GraphComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/HomeComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">HomeComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SettingsComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">SettingsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SidenavComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">SidenavComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/UserInterfaceComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">UserInterfaceComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/HomeRoutes.html" data-type="entity-link">HomeRoutes</a>
                            </li>
                            <li class="link">
                                <a href="modules/InitModule.html" data-type="entity-link">InitModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-InitModule-9568f896f74ea09dadbbfcbfaebc8741"' : 'data-target="#xs-components-links-module-InitModule-9568f896f74ea09dadbbfcbfaebc8741"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-InitModule-9568f896f74ea09dadbbfcbfaebc8741"' :
                                            'id="xs-components-links-module-InitModule-9568f896f74ea09dadbbfcbfaebc8741"' }>
                                            <li class="link">
                                                <a href="components/InitComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">InitComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/InitRoutes.html" data-type="entity-link">InitRoutes</a>
                            </li>
                            <li class="link">
                                <a href="modules/MaterialModule.html" data-type="entity-link">MaterialModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/PipesModule.html" data-type="entity-link">PipesModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#pipes-links-module-PipesModule-0b75584c84662c21c420e4e2dc8673d9"' : 'data-target="#xs-pipes-links-module-PipesModule-0b75584c84662c21c420e4e2dc8673d9"' }>
                                            <span class="icon ion-md-add"></span>
                                            <span>Pipes</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="pipes-links-module-PipesModule-0b75584c84662c21c420e4e2dc8673d9"' :
                                            'id="xs-pipes-links-module-PipesModule-0b75584c84662c21c420e4e2dc8673d9"' }>
                                            <li class="link">
                                                <a href="pipes/EscapeHtmlPipe.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">EscapeHtmlPipe</a>
                                            </li>
                                            <li class="link">
                                                <a href="pipes/PairSplitFirstPipe.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">PairSplitFirstPipe</a>
                                            </li>
                                            <li class="link">
                                                <a href="pipes/PairSplitSecondPipe.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">PairSplitSecondPipe</a>
                                            </li>
                                            <li class="link">
                                                <a href="pipes/PairUpPipe.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">PairUpPipe</a>
                                            </li>
                                            <li class="link">
                                                <a href="pipes/SplitUpPipe.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">SplitUpPipe</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#classes-links"' :
                            'data-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/Color.html" data-type="entity-link">Color</a>
                            </li>
                            <li class="link">
                                <a href="classes/DefaultColors.html" data-type="entity-link">DefaultColors</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#injectables-links"' :
                                'data-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/JsonValidateService.html" data-type="entity-link">JsonValidateService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/LoadingService.html" data-type="entity-link">LoadingService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/QueryService.html" data-type="entity-link">QueryService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#guards-links"' :
                            'data-target="#xs-guards-links"' }>
                            <span class="icon ion-ios-lock"></span>
                            <span>Guards</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="guards-links"' : 'id="xs-guards-links"' }>
                            <li class="link">
                                <a href="guards/CorpusLoadedGuard.html" data-type="entity-link">CorpusLoadedGuard</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#interfaces-links"' :
                            'data-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/AppSettings.html" data-type="entity-link">AppSettings</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Corpus.html" data-type="entity-link">Corpus</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GraphData.html" data-type="entity-link">GraphData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GraphLink.html" data-type="entity-link">GraphLink</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GraphNode.html" data-type="entity-link">GraphNode</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SelectedDocument.html" data-type="entity-link">SelectedDocument</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#miscellaneous-links"'
                            : 'data-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/enumerations.html" data-type="entity-link">Enums</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/typealiases.html" data-type="entity-link">Type aliases</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <a data-type="chapter-link" href="routes.html"><span class="icon ion-ios-git-branch"></span>Routes</a>
                        </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});