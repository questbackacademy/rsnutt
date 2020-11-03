var questback = questback || {};
questback.popup = new function () {
    var FScreenXS = 767;
    var FScreenSM = 991;
    var FScreenMD = 1199;
    var FCssGlobalScope = "questback";
    var FListenerPageHash = "questback_listener";
    var FDomainChangeCheckWait = 1000;
    var FConfigs = new Array();
    var FStyles = new Array();
    var FTheme = null;
    // Dictionary to store the css attributes used when building style sheet
    var FCssClasses = new Object();

    function addToCssClassList(cssAttribute, selector) {
        if (!FCssClasses[cssAttribute]) {
            FCssClasses[cssAttribute] = selector;
        }
    }
    function isListenerMode() {
        if (document.location.hash) {
            if (document.location.hash.toLowerCase().indexOf(FListenerPageHash) != -1) {
                return true;
            }
        }
        return false;
    }
    function pushStyle(config, classes, css, cssAttribute, sameElement) {
        var spacing = sameElement ? "" : " ";
        var customCss = "";
        if (cssAttribute) {
            customCss = getAttribute(config, "theme", cssAttribute);
        }
        if (customCss == null || typeof customCss === "undefined") {
            customCss = "";
        }
        var selector = "." + FCssGlobalScope + ".qb-popup-" + config.index + spacing + classes.replace(/\./g, "." + config.cssPrefix);
        if (cssAttribute) {
            addToCssClassList(cssAttribute, selector);

        }
        FStyles.push(selector + "{" + css + customCss + "}");
    }
    function buildMediaQueryCustomCss(config, suffix) {
        var customCss = "", selector = "";
        for (var cssAttribute in FCssClasses) {
            // Check for custom css with specified suffix
            customCss = getAttribute(config, "theme", cssAttribute + suffix);
            if (!stringIsNullOrEmpty(customCss)) {
                selector = FCssClasses[cssAttribute];
                FStyles.push(selector + "{" + customCss + "}");
            }
        }
    }
    function pushKeyFrame(config, name, css) {
        var definitions = ["@-webkit-keyframes", "@-moz-keyframes", "@-o-keyframes", "@keyframes"];
        for (var i = 0; i < definitions.length; i++) {
            var definition = definitions[i];
            FStyles.push(definition + " " + FCssGlobalScope + "-" + config.index + "-" + config.cssPrefix + name + " {" + css + "}");
        }
    }
    function pushAnimationStyle(config, className, animationName, duration) {
        var attributes = ["-webkit-animation-name", "-moz-animation-name", "-o-animation-name", "animation-name"];
        var css = new Array();
        for (var i = 0; i < attributes.length; i++) {
            var attr = attributes[i];
            css.push(attr + ": " + FCssGlobalScope + "-" + config.index + "-" + config.cssPrefix + animationName + ";");
        }
        css.push("-webkit-animation-fill-mode: both;" +
        "-moz-animation-fill-mode: both;" +
        "-ms-animation-fill-mode: both;" +
        "-o-animation-fill-mode: both;" +
        "animation-fill-mode: both;" +
        "-webkit-animation-duration:" + duration + "ms;" +
        "-moz-animation-duration:" + duration + "ms;" +
        "-ms-animation-duration:" + duration + "ms;" +
        "-o-animation-duration:" + duration + "ms;" +
        "animation-duration: " + duration + "ms;")
        pushStyle(config, className, css.join("") + getAttribute(config, "theme", "stateDisplayed"));
    }
    function getAttribute(instance) {
        var val = "";
        var isUndefined = false;
        val = instance;
        for (var i = 1; i < arguments.length; i++) {
            var arg = arguments[i];
            val = val[arg];
            if (typeof val === "undefined") {
                isUndefined = true;
                break;
            }
        }
        if (isUndefined) {
            return "";
        }
        else {
            return val;
        }
    }
    function getAnimationDuration(config, name) {
        var setting = getAttribute(config, "theme", name);
        var duration = 500;
        if (setting) {
            duration = getAttribute(config, "theme", name, "duration");
            if (duration == null) {
                if (setting.type == "none") {
                    duration = 0;
                }
                else {
                    duration = 500;
                }
            }
        }
        return duration;
    }
    function launchPendingSurvey() {
        // Try to focus the tab
        window.focus();
        window.moveBy(0, 0);
        // Get survey url from hash and redirect
        if (document.location.hash) {
            document.location.href = unescape(document.location.hash.split(FListenerPageHash + "_")[1]);
        }
    }
    function startCheckDomainChange() {
        window.blur();
        if (window.opener) {
            if (window.opener.closed == false) {
                window.setTimeout(checkDomainChange, FDomainChangeCheckWait);
            }
        }
    }
    function checkDomainChange() {
        // Checks for domain to change for onleave scenarios
        try {
            if (window.opener) {
                if (window.opener.closed == true) {
                    launchPendingSurvey();
                }
                else {
                    if (window.opener.location.href && window.opener.document.body) {
                        window.setTimeout(checkDomainChange, FDomainChangeCheckWait);
                    }
                    else {
                        launchPendingSurvey();
                    }
                }
            }
            else {
                launchPendingSurvey();
            }
        }
        catch (ex) { launchPendingSurvey(); }
    }
    function renderPendingSurveyListenerPage(config) {
        var logoUrl = "https://web2.questback.com/Style/images/logo.png";
        if (config.display.onleaveLogoUrl) {
            logoUrl = config.display.onleaveLogoUrl;
        }
        var message = "Survey will open here when you leave the site.";
        if (config.display.onleaveMessage) {
            message = config.display.onleaveMessage;
        }
        var title = "QuestBack Survey";
        if (config.display.onleaveTitle) {
            title = config.display.onleaveTitle;
        }
        document.title = title;
        document.body.innerHTML = '<div class="questback qb-popup-' + config.index + '">' +
            '<div class="' + getClassName("onleave-container", config.index) + '">' +
            '<div class="' + getClassName("onleave-content", config.index) + '">' +
            '<img class="' + getClassName("onleave-image", config.index) + '" src=' + logoUrl + ' />' +
            '<p class="' + getClassName("onleave-message", config.index) + '">' + message + '</p>' +
            '</div>' +
            '</div>' +
            '</div>';
    }
    function getDocumentHeight() {
        var body = document.body;
        var html = document.documentElement;

        return Math.max(body.scrollHeight, body.offsetHeight,
                       html.clientHeight, html.scrollHeight, html.offsetHeight);
    }
    function getDocumentWidth() {
        var body = document.body;
        var html = document.documentElement;
        return Math.max(body.scrollWidth, body.offsetWidth,
                       html.clientWidth, html.scrollWidth, html.offsetWidth);
    }
    function getScrollTop() {
        if (typeof window.pageYOffset === "undefined") {
            return Math.max(document.documentElement.scrollTop, document.body.scrollTop);
        }
        else {
            return window.pageYOffset;
        }
    }
    function getScrollLeft() {
        if (typeof window.pageXOffset === "undefined") {
            return Math.max(document.documentElement.scrollLeft, document.body.scrollLeft);
        }
        else {
            return window.pageXOffset;
        }
    }

    function getAnimationCss(config, name) {
        var setting = getAttribute(config, "theme", name);
        if (setting) {
            if (setting.type == "none") {
                return "";
            }
            else if (setting.type == "fade-in") {
                return "0% {opacity: 0;} 100% {opacity: 1;}";
            }
            else if (setting.type == "fade-out") {
                return "0% {opacity: 1;} 100% {opacity: 0;}";
            }
            else if (setting.type == "rotate-in") {
                return "0% {opacity: 0;transform: rotate(360deg) scale(0);} 100% {opacity: 1;transform: rotate(0deg) scale(1);}";
            }
            else if (setting.type == "slide-from-left") {
                return "0% {opacity: 0;transform: translateX(-50%);} 50%{opacity: 1;} 100% {opacity: 1;transform: translateX(0);}";
            }
            else if (setting.type == "slide-from-right") {
                return "0% {opacity: 0;transform: translateX(50%);} 50%{opacity: 1;} 100% {opacity: 1;transform: translateX(0);}";
            }
            else if (setting.type == "slide-from-top") {
                return "0% {opacity: 0;transform: translateY(-50%);} 50%{opacity: 1;} 100% {opacity: 1;transform: translateY(0);}";
            }
            else if (setting.type == "slide-from-bottom") {
                return "0% {opacity: 0;transform: translateY(50%);} 50%{opacity: 1;} 100% {opacity: 1;transform: translateY(0);}";
            }
            else if (setting.type == "scale-in") {
                return "0% {opacity: 0;transform: scale(0);} 100% {opacity: 1;transform: scale(1);}";
            }
            else if (setting.type == "rotate-out") {
                return "0% {opacity: 1;transform: rotate(0deg) scale(1);} 100% {opacity: 0;transform: rotate(360deg) scale(0);}";
            }
            else if (setting.type == "scale-out") {
                return "0% {opacity: 1;transform:scale(1);} 100% {opacity: 0;transform: scale(0);}";
            }
            else if (setting.type == "slide-to-left") {
                return "0% {opacity: 1;transform: translateX(0);} 50% {opacity: 0;} 100% {opacity: 0;transform: translateX(-50%);}";
            }
            else if (setting.type == "slide-to-right") {
                return "0% {opacity: 1;transform: translateX(0);} 50% {opacity: 0;} 100% {opacity: 0;transform: translateX(50%);}";
            }
            else if (setting.type == "slide-to-top") {
                return "0% {opacity: 1;transform: translateY(0);} 50% {opacity: 0;} 100% {opacity: 0;transform: translateY(-50%);}";
            }
            else if (setting.type == "slide-to-bottom") {
                return "0% {opacity: 1;transform: translateY(0);} 50% {opacity: 0;} 100% {opacity: 0;transform: translateY(50%);}";
            }
            else if (setting.type == "custom") {
                return getAttribute(config, "theme", name, "css");
            }
        }
        // Default
        return "0% {opacity: 0;} 100% {opacity: 1;}";
    }
    function buildStyleSheet(config) {
        FStyles = new Array();
        FStyles.push(".questback *{box-sizing:border-box;}");

        if (config.theme.backdrop) {
            pushStyle(config, ".backdrop",
            "background-color:#404040;" +
            "background:rgba(0,0,0,0.3);" +
            "position:absolute;" +
            "top:0;" +
            "left:0;" +
            "bottom:0;" +
            "right:0;" +
            "display:none;" +
            "z-index:100000;",
            "backdrop");
        }

        // Onleave
        pushStyle(config, ".onleave-container", "position:absolute;left:0;top:0;width:100%;height:100%;bottom:0;right:0;background:#FFFFFF;z-index:100000;", "onleaveContainer");
        pushStyle(config, ".onleave-content", "margin-top:40px;margin-left:auto;margin-right:auto;width:400px;max-width:90%;text-align:center;", "onleaveContent");
        pushStyle(config, ".onleave-image", "margin-bottom:10px;", "onleaveContainer");
        pushStyle(config, ".onleave-message", "font-family:Helvetica,​Arial,​sans-serif;font-size:18px;", "onleaveContainer");

        pushStyle(config, ".content",
        "padding:30px 50px;" +
        "margin:0;" +
        "width:auto;" +
        "height:auto;" +
        "border:none;" +
        "background:#f5f5f5;",
        "content");

        pushStyle(config, ".content-embedded",
        "margin:0;" +
        "border:none;" +
        "margin-left:auto;" +
        "margin-right:auto;" +
        "contentEmbedded");

        var shadow = config.theme.shadow ? "box-shadow:5px 5px 20px rgba(0,0,0,0.2);" : "";
        pushStyle(config, ".wrapper",
        "z-index:100001;" +
        "font-size:14px;" +
        "display:none;" +
        "border:none;" +
        shadow +
        "font-family:Helvetica,​Arial,​sans-serif;" +
        "background:#ffffff;" +
        "position:absolute;" +
        "max-width:100%;" +
        "left:-10000px;" +
        "top:-10000px;" +
        "padding:10px;" +
        "position:absolute;",
        "wrapper");

        pushStyle(config, ".state-embedded-display",
        "-webkit-transition: all 0.5s;" +
        "transition: all 0.5s;");

        pushStyle(config, ".wrapper-bar",
        "text-align:right;" +
        "font-size:1.75em;" +
        "padding:0 5px 5px 0;",
        "wrapperBar");


        pushStyle(config, ".survey-frame",
        "border:none;" +
        "width:100%;" +
        "height:100%;",
        "surveyFrame");

        pushStyle(config, ".close-button",
        "cursor:pointer;" +
        "line-height:1em;" +
        "text-decoration:none;background:none;",
        "closeButton");

        pushStyle(config, ".close-button:hover",
        "cursor:pointer;" +
        "line-height:1em;" +
        "text-decoration:none;" +
        "background:none;",
        "closeButtonHover");

        pushStyle(config, ".heading",
        "font-size:4em;" +
        "word-wrap: break-word;" +
        "font-weight:normal;" +
        "margin:0 0 0.5em 0;",
        "heading");

        var alignmentCSS = "";
        if (config.theme.logo.vAlign == "middle") {
            if (config.theme.logo.align == "left") {
                alignmentCSS = "float:left;margin-right:1em;";
            }
            else {
                alignmentCSS = "float:right;margin-left:1em;";
            }
        }
        else {
            alignmentCSS = "text-align:" + config.theme.logo.align + ";";
        }

        pushStyle(config, ".logo-container",
        alignmentCSS,
        "logoContainer");

        pushStyle(config, ".logo",
        "max-width:100%;",
        "logo");

        pushStyle(config, ".text",
        "font-size:1em;" +
        "font-weight:normal;",
        "text");

        pushStyle(config, ".buttons",
        "margin-top:20px;" +
        "text-align:" + config.theme.buttonAlignment + ";",
        "buttons");

        pushStyle(config, ".button",
        "transition: all 0.25s;" +
        "font-family:inherit;" +
        "text-align:center;" +
        "font-size:14px;" +
        "min-width:150px;" +
        "background:#e0e0e0;" +
        "margin:5px;" +
        "padding:0px 10px;" +
        "line-height:48px;" +
        "border:none;" +
        "cursor:pointer;",
        "button");

        pushStyle(config, ".button:hover",
        "filter: brightness(105%);",
        "buttonHover");

        pushStyle(config, ".participate",
        "background:#1acd72;" +
        "transition: all 0.25s;" +
        "color:#000000;",
        "participate");

        pushStyle(config, ".participate:hover", "", "participateHover");

        pushStyle(config, ".decline", "", "decline");

        pushStyle(config, ".decline:hover", "", "declineHover");

        pushStyle(config, ".other", "", "other");

        pushStyle(config, ".other:hover", "", "otherHover");

        pushKeyFrame(config, "show-animation", getAnimationCss(config, "showAnimation"));
        pushKeyFrame(config, "hide-animation", getAnimationCss(config, "hideAnimation"));

        var showAnimationType = getAttribute(config, "theme", "showAnimation", "type");
        var showAnimationDuration = getAnimationDuration(config, "showAnimation");
        if (showAnimationType != "none") {
            pushAnimationStyle(config, ".state-displayed", "show-animation", showAnimationDuration);
        }

        var hideAnimationType = getAttribute(config, "theme", "hideAnimation", "type");
        var hideAnimationDuration = getAnimationDuration(config, "hideAnimation");
        if (hideAnimationType != "none") {
            pushAnimationStyle(config, ".state-hidden", "hide-animation", hideAnimationDuration);
        }

        // Add media queries
        FStyles.push("@media (max-width: " + FScreenMD + "px) { ");
        buildMediaQueryCustomCss(config, "MD");
        FStyles.push("}");

        FStyles.push("@media (max-width: " + FScreenSM + "px) { ");
        buildMediaQueryCustomCss(config, "SM");
        FStyles.push("}");

        buildMediaQueryCustomCss(config, "XS");
        FStyles.push("@media (max-width: " + FScreenXS + "px) { ");
        pushStyle(config, ".content", "padding:10px 10px;");
        pushStyle(config, ".heading",
        "font-size:2.5em;");
        buildMediaQueryCustomCss(config, "XS");
        FStyles.push("}");


        // Check for imports
        var imports = "";
        if (typeof config.theme.imports === "string") {
            imports = "@import url('" + config.theme.imports + "');";
        }
        else if (config.theme.imports instanceof Array) {
            var len = config.theme.imports.length;
            for (var i = 0; i < len; i++) {
                imports += "@import url('" + config.theme.imports[i] + "');";
            }
        }
        // Append with imports and custom css
        var cssText = imports + FStyles.join("\n") + getAttribute(config, "theme", "customCSS");
        if (typeof document.createStyleSheet === "undefined") {
            var styleElement = document.createElement("style");
            styleElement.type = "text/css";
            styleElement.appendChild(document.createTextNode(cssText));
            try {
                // Add to head
                var head = document.head || document.getElementsByTagName('head')[0];
                head.appendChild(styleElement);
            }
            catch (ex) {
                // Add to top of body
                if (document.body.childNodes.length == 0) {
                    document.body.appendChild(styleElement);
                }
                else {
                    document.body.insertBefore(styleElement, document.body.childNodes[0]);
                }
            }
        }
        else {
            // IE 
            var styleSheet = document.createStyleSheet("");
            styleSheet.cssText = cssText;
        }
    }
    function cloneObject(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }

        var temp = obj.constructor();
        for (var key in obj) {
            temp[key] = cloneObject(obj[key]);
        }

        return temp;
    }
    function stringIsNullOrEmpty(value) {
        return !(typeof value === "string" && value.length > 0);
    }
    function attachEvent(element, eventName, handler) {
        if (element.addEventListener) {
            element.addEventListener(eventName, handler, false);
        }
        else if (element.attachEvent) {
            element.attachEvent("on" + eventName, handler);
        }
    }

    function setDefaults(config) {
        if (typeof config.identifier === "undefined") {
            // Find the participate url
            var participateUrl = null;
            if (config.buttons) {
                for (var i = 0; i < config.buttons.length; i++) {
                    var button = config.buttons[i];
                    if (button.type == "participate" && button.url) {
                        participateUrl = button.url;
                        break;
                    }
                }
            }
            var identifierSufffix = config.index;
            // Create identifier suffix from url
            if (participateUrl) {
                var strippedUrl = participateUrl.replace(/[^\w]/g, "");
                if (strippedUrl) {
                    identifierSufffix = strippedUrl;
                }
                else {
                    console.log("Warning: Unable to create identifier from url. Please explicitly set identifier to a unique identifier (string) for the survey in the config.")
                }
            }
            config.identifier = "qb" + identifierSufffix;
        }
        if (config.cssPrefix == null) {
            config.cssPrefix = "qb-";
        }
        if (typeof config.display === "undefined") {
            config.display = {
                type: "tab"
            }
        }
        if (config.display.type == "window" || config.display.type == "embedded") {
            if (typeof config.display.width === "undefined") {
                config.display.width = 800;
            }
            if (typeof config.display.height === "undefined") {
                config.display.height = 600;
            }
        }
        if (typeof config.redisplayAfterDays === "undefined") {
            config.redisplayAfterDays = 365;
        }
        if (typeof config.cookieName === "undefined") {
            config.cookieName = "questback.popup." + config.identifier;
        }
        if (typeof config.displayFraction === "undefined") {
            config.displayFraction = 1;
        }

        if (config.display.type == "embedded") {
            if (!config.closeButton) {
                config.closeButton = true;
            }
        }
        else if (config.display.type == "window") {
            if (typeof config.display.width === "undefined") {
                width = Math.min(800, screen.width);
            }
            if (typeof config.display.height === "undefined") {
                config.type.height = Math.min(600, screen.height);
            }
        }
        if (typeof config.width === "undefined") {
            config.width = 500;
        }
        if (typeof config.left === "undefined") {
            config.left = "50%";
        }
        if (typeof config.top === "undefined") {
            config.top = "50%";
        }
        if (FTheme != null && typeof config.theme != "undefined") {
            // Then use the default theme and tranfer the top level attributes from the supplied theme
            var themeCopy = cloneObject(config.theme);
            config.theme = cloneObject(FTheme);
            for (var attr in themeCopy) {
                config.theme[attr] = themeCopy[attr];
            }
        }
        if (typeof config.theme === "undefined") {
            if (FTheme != null) {
                config.theme = cloneObject(FTheme); // Use the default theme if set
            }
            else {
                config.theme = {}; // Use new empty theme
            }
        }
        if (typeof config.theme.shadow === "undefined") {
            config.theme.shadow = true;
        }

        if (typeof config.theme.showAnimation === "undefined") {
            config.theme.showAnimation = {};
        }
        if (typeof config.theme.showAnimation.type === "undefined") {
            config.theme.showAnimation.type = "fade-in";
        }
        if (typeof config.theme.showAnimation.duration === "undefined") {
            config.theme.showAnimation.duration = config.theme.showAnimation.type == "none" ? 0 : 500;
        }

        if (typeof config.theme.hideAnimation === "undefined") {
            config.theme.hideAnimation = {};
        }
        if (typeof config.theme.hideAnimation.type === "undefined") {
            config.theme.hideAnimation.type = "fade-out";
        }
        if (typeof config.theme.hideAnimation.duration === "undefined") {
            config.theme.hideAnimation.duration = config.theme.hideAnimation.type == "none" ? 0 : 500;
        }

        if (typeof config.theme.buttonAlignment === "undefined") {
            config.theme.buttonAlignment = "center";
        }

        if (typeof config.theme.logo === "undefined") {
            config.theme.logo = {};
        }
        if (typeof config.theme.logo.align === "undefined") {
            config.theme.logo.align = "left";
        }
        if (typeof config.theme.logo.vAlign === "undefined") {
            config.theme.logo.vAlign = "top";
        }

    }
    function getClassName(className, index) {
        return getConfig(index).cssPrefix + className;
    }
    function isRetina() {
        return (window.devicePixelRatio > 1 || (window.matchMedia && window.matchMedia("(-webkit-min-device-pixel-ratio: 1.5),(-moz-min-device-pixel-ratio: 1.5),(min-device-pixel-ratio: 1.5)").matches));
    }
    function build(config) {
        // Container
        var containerElement = document.createElement("div");
        containerElement.className = "questback qb-popup-" + config.index + " " + getClassName("container", config.index);

        // Backdrop element
        if (config.theme.backdrop) {
            var backdropElement = document.createElement("div");
            backdropElement.className = getClassName("backdrop", config.index);
            containerElement.appendChild(backdropElement);
        }

        // Wrapper element
        var wrapperElement = document.createElement("div");
        wrapperElement.className = getClassName("wrapper", config.index);
        containerElement.appendChild(wrapperElement);



        if (config.closeButton) {
            var closeButtonContainer = document.createElement("div");
            closeButtonContainer.className = getClassName("wrapper-bar", config.index);
            var closeButton = document.createElement("a");
            closeButton.className = getClassName("close-button", config.index);
            if (config.closeButton.text) {
                closeButton.innerHTML = config.closeButton.text;
            }
            else {
                closeButton.innerHTML = "&times";
            }
            attachEvent(closeButton, "click", function () { questback.popup.hide(config.index); return false; });
            closeButtonContainer.appendChild(closeButton);
            wrapperElement.appendChild(closeButtonContainer);
        }

        // Content
        var contentElement = document.createElement("div");
        contentElement.className = getClassName("content", config.index);
        wrapperElement.appendChild(contentElement);

        // Logo
        var logoContainerElement = null;
        if (config.theme.logo.url) {
            logoContainerElement = document.createElement("div");
            logoContainerElement.className = getClassName("logo-container", config.index);
            var logoElement = document.createElement("img");
            logoElement.className = getClassName("logo", config.index);
            logoElement.src = config.theme.logo.url;
            logoContainerElement.appendChild(logoElement);
        }
        if (logoContainerElement != null && (config.theme.logo.vAlign == "top" || config.theme.logo.vAlign == "middle")) {
            contentElement.appendChild(logoContainerElement);
        }

        // Heading
        var headingElement = document.createElement("div");
        headingElement.className = getClassName("heading", config.index);
        headingElement.innerHTML = config.title;
        contentElement.appendChild(headingElement);

        if (logoContainerElement != null && config.theme.logo.vAlign == "bottom") {
            contentElement.appendChild(logoContainerElement);
        }
        // Text
        var textElement = document.createElement("div");
        textElement.className = getClassName("text", config.index);
        textElement.innerHTML = config.text;
        contentElement.appendChild(textElement);

        // Buttons
        var buttonsElement = document.createElement("div");
        buttonsElement.className = getClassName("buttons", config.index);
        var buttonHTML = new Array();
        if (config.buttons) {
            for (var i = 0; i < config.buttons.length; i++) {
                var buttonConfig = config.buttons[i];
                buttonHTML.push("<button class='" + getClassName("button", config.index) + " " + getClassName(buttonConfig.type, config.index) + "' onclick='return questback.popup.handleButtonClick(event," + config.index + "," + i + ");'>" + buttonConfig.text + "</button>");
            }
        }
        buttonsElement.innerHTML = buttonHTML.join("");
        contentElement.appendChild(buttonsElement);

        return containerElement;
    }
    function getConfig(index) {
        if (typeof index === "undefined") {
            index = 0;
        }
        if (index < 0 || index >= FConfigs.length) {
            console.log("Error: Could not find index " + index + ", default to last entry.");
            index = FConfigs.length - 1;
        }
        return FConfigs[index];
    }
    function getContainer(index) {
        return getConfig(index).container;
    }
    function getWrapper(index) {
        var config = getConfig(index);
        if (config.theme.backdrop) {
            return config.container.childNodes[1];
        }
        else {
            return config.container.childNodes[0];
        }
    }
    function getBackdrop(index) {
        var config = getConfig(index);
        if (config.theme.backdrop) {
            return config.container.childNodes[0];
        }
        return null;
    }
    function getContent(index) {
        var lNodes = getWrapper(index).childNodes;
        for (var i = 0; i < lNodes.length; i++) {
            var lClassName = lNodes[i].className + "";
            if (lClassName.indexOf("content") != -1) {
                return lNodes[i];
            }
        }
    }

    function showPopup(config, url) {
        var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : screen.left;
        var dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top;

        width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
        height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

        var windowWidth = config.display.width ? config.display.width : width;
        var windowHeight = config.display.height ? config.display.height : height;
        if (typeof windowWidth == "string") {
            if (windowWidth.indexOf("%") != -1) {
                windowWidth = width * parseFloat(windowWidth.replace("%", "")) / 100.0;
            }
            else {
                windowWidth = parseInt(windowWidth.replace("px", ""));
            }
        }
        if (typeof windowHeight == "string") {
            if (windowHeight.indexOf("%") != -1) {
                windowHeight = height * parseFloat(windowHeight.replace("%", "")) / 100.0;
            }
            else {
                windowHeight = parseInt(windowHeight.replace("px", ""));
            }
        }
        windowWidth = Math.min(width, windowWidth);
        windowHeight = Math.min(height, windowHeight);

        var left = ((width / 2) - (windowWidth / 2)) + dualScreenLeft;
        var top = ((height / 2) - (windowHeight / 2)) + dualScreenTop;
        var win = window.open(url, "_blank", 'menubar=0, resizable=1, scrollbars=1, toolbar=0, width=' + windowWidth + ', height=' + windowHeight + ', top=' + top + ', left=' + left);

        if (window.focus) {
            win.focus();
        }
    }
    function createCookie(name, value, days) {
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            var expires = "; expires=" + date.toGMTString();
        }
        else var expires = "";
        document.cookie = name + "=" + value + expires + "; path=/";
    }

    function readCookie(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }
    function cookiesSet(config) {
        if (config.disableCookies) {
            return false;
        }
        else {
            return readCookie(config.cookieName + ".s") == "displayed" || readCookie(config.cookieName + ".p") == "displayed";
        }
    }
    function listenForReturnFromSurvey(config) {
        if (config.frame) {
            try {
                if (config.frame.contentWindow.location.href) {
                    var url = config.frame.contentWindow.location.href;
                    // If accessible, we are back and can close
                    if (url != "about:blank" && url != "") {
                        questback.popup.hide(config.index);
                        return;
                    }
                }
                setTimeout(function () { listenForReturnFromSurvey(config); }, 100);
            } catch (e) {
                setTimeout(function () { listenForReturnFromSurvey(config); }, 100);
            }
        }
    }
    function setCookies(config) {
        if (!config.disableCookies) {
            // Session cookie
            createCookie(config.cookieName + ".s", "displayed");
            // Persistent cookie
            if (config.redisplayAfterDays > 0) {
                createCookie(config.cookieName + ".p", "displayed", config.redisplayAfterDays);
            }
        }
    }
    function showEmbedded(config, url) {
        var wrapper = getWrapper(config.index);
        var content = getContent(config.index);
        var currentContentWidth = content.clientWidth;
        var currentContentHeight = content.clientHeight;
        var currentWrapperWidth = wrapper.clientWidth;
        var currentWrapperHeight = wrapper.clientHeight;
        // Explicitly set the height of the wrapper to support transitioning to a different size
        wrapper.style.height = currentWrapperHeight + "px";
        wrapper.className += " " + getClassName("state-embedded-display", config.index);
        // Clear content and replace with iframe
        content.innerHTML = "";
        config.frame = document.createElement("iframe");
        config.frame.className = getClassName("survey-frame", config.index);

        // Check available space
        var availableWidth = document.documentElement.clientWidth || document.body.clientWidth;
        var availableHeight = document.documentElement.clientHeight || document.body.clientHeight;

        var width = config.display.width ? config.display.width : currentWrapperWidth;
        var height = config.display.height ? config.display.height : currentWrapperHeight;
        if (typeof height == "string") {
            if (height.indexOf("%") != -1) {
                height = availableHeight * parseFloat(height.replace("%", "")) / 100.0;
            }
            else {
                height = parseInt(height.replace("px", ""));
            }
        }
        if (typeof width == "string") {
            if (width.indexOf("%") != -1) {
                width = availableWidth * parseFloat(width.replace("%", "")) / 100.0;
            }
            else {
                width = parseInt(width.replace("px", ""));
            }
        }
        // Maximize for small screens
        if (isRetina()) {
            if (availableWidth < availableHeight && availableWidth <= 640 || availableWidth > availableHeight && availableWidth <= 960) {
                width = availableWidth;
                height = availableHeight;
            }
        }
        else {
            if (availableWidth < availableHeight && availableWidth <= 320 || availableWidth > availableHeight && availableWidth <= 480) {
                width = availableWidth;
                height = availableHeight;
            }
        }


        // Compute the new width of wrapper
        var wrapperWidth = currentWrapperWidth + width - currentContentWidth;
        var wrapperHeight = currentWrapperHeight + height - currentContentHeight;

        if (wrapperWidth > availableWidth) {
            width = width - (wrapperWidth - availableWidth);
            wrapperWidth = availableWidth;
        }
        if (wrapperHeight > availableHeight) {
            height = height - (wrapperHeight - availableHeight);
            wrapperHeight = availableHeight;
        }

        // Make sure it fits in the window
        var x = config.position.x;
        var y = config.position.y;
        if (wrapperWidth > currentWrapperWidth) {
            x -= Math.round(wrapperWidth - currentWrapperWidth) / 2.0;
        }
        if (wrapperHeight > currentWrapperHeight) {
            y -= Math.round(wrapperHeight - currentWrapperHeight) / 2.0;
        }
        x = getScrollLeft() + Math.max(Math.min(x, availableWidth - wrapperWidth), 0);
        y = getScrollTop() + Math.max(Math.min(y, availableHeight - wrapperHeight), 0);
        wrapper.style.left = x + "px";
        wrapper.style.top = y + "px";
        // Update the stored position
        config.position.x = x;
        config.position.y = y;

        // Remove styling from content
        content.className = getClassName("content-embedded", config.index);
        content.style.width = width + "px";
        content.style.height = height + "px";
        content.appendChild(config.frame);

        wrapper.style.width = wrapperWidth + "px";
        wrapper.style.height = wrapperHeight + "px";

        // Let animation play first
        setTimeout(function () {
            config.frame.src = url;
            setTimeout(function () { listenForReturnFromSurvey(config); }, 1000);
        }, 500);
    }
    function destroy(config) {
        if (config.containerAdded) {
            document.body.removeChild(config.container);
            config.containerAdded = false;
            config.container = null;
        }
        config.state = null;
    }
    return {
        init: function (config) {
            if (!config.initiated) {
                setDefaults(config);
                buildStyleSheet(config);
                var container = build(config);
                config.container = container;
                config.initiated = true;
            }
            return config.container;
        },
        setTheme: function (theme) {
            FTheme = theme;
        },
        participate: function (index) {
            if (typeof index === "undefined") {
                index = 0;
            }
            var config = getConfig(index);
            destroy(config);
            var container = build(config);
            config.container = container;
            if (config.state) {
                // Return if already in participate state
                if (config.state === "participate") return;
            }
            var participateButtonIndex = -1;
            for (var i = 0; i < config.buttons.length; i++) {
                var buttonConfig = config.buttons[i];
                if (buttonConfig.type === "participate") {
                    participateButtonIndex = i;
                    break;
                }
            }
            if (config.display.type == "embedded") {
                // Then invitation must first be displayed and then go directly to embedded mode
                questback.popup.show(index, true, function () {
                    if (participateButtonIndex >= 0) {
                        questback.popup.handleButtonClick(null, index, participateButtonIndex);
                    }
                });
            }
            else {
                // Otherwise just trigger participate
                if (participateButtonIndex >= 0) {
                    questback.popup.handleButtonClick(null, index, participateButtonIndex);
                }
            }
        },
        invite: function (index) {
            if (typeof index === "undefined") {
                index = 0;
            }
            var config = getConfig(index);
            destroy(config);
            if (config.state) {
                // Return if already in participate state
                if (config.state === "invite") return;
            }
            questback.popup.show(index, true);
        },
        handleButtonClick: function (e, configIndex, buttonIndex) {
            var config = getConfig(configIndex);
            if (config.buttons) {
                var buttonConfig = config.buttons[buttonIndex];
                if (buttonConfig.type === "decline") {
                    questback.popup.hide(config.index);
                }
                else if (buttonConfig.type === "participate") {
                    config.state = "participate";
                    // Check if survey is to be displayed embedded
                    if (config.display) {
                        if (config.display.type == "embedded") {
                            showEmbedded(config, buttonConfig.url);
                            return;
                        }
                        else if (config.display.type == "window") {
                            showPopup(config, buttonConfig.url);
                            questback.popup.hide(config.index);
                            return;
                        }
                        else if (config.display.type == "tab") {
                            window.open(buttonConfig.url, "_blank");
                            questback.popup.hide(config.index);
                            return;
                        }
                        else if (config.display.type == "onleave") {
                            // Get listener page url
                            var listenerPageUrl = document.location.href + "#" + FListenerPageHash + "_" + escape(buttonConfig.url);
                            var win = window.open(listenerPageUrl, "_blank");
                            win.blur();
                            questback.popup.hide(config.index);
                            return;
                        }
                    }
                }
                if (!stringIsNullOrEmpty(buttonConfig.url)) {
                    window.open(buttonConfig.url);
                }
                // Call the callback if present and pass the event and root container as argument
                if (buttonConfig.callback) {
                    // Decorate the config with the event
                    if (e) e.config = buttonConfig;
                    buttonConfig.callback(e, getContainer(config.index));
                }
            }
        },
        hide: function (index) {
            var config = getConfig(index);
            var container = config.container;
            var content = getContent(index);
            var wrapper = getWrapper(index);
            wrapper.className = wrapper.className.replace(getClassName("state-displayed", index), "");
            wrapper.className += " " + getClassName("state-hidden", index);
            var duration = getAnimationDuration(getConfig(index), "hideAnimation");

            if (container) {
                if (duration == 0) {
                    destroy(config);
                }
                else {
                    setTimeout(function () { destroy(config); }, duration);
                }
            }
        },
        hideAll: function (index) {
            for (var i = 0; i < FConfigs.length; i++) {
                destroy(FConfigs[i]);
            }
        },
        show: function (index, forceDisplay, callback) {
            var config = getConfig(index);
            if (config.state) {
                if (config.state === "invite") return;
            }
            var isDisplayed = false;
            if (Math.random() <= 1.0 * config.displayFraction) {
                isDisplayed = true;
                // Check active period
                var today = new Date();
                if (typeof config.activePeriodStart != "undefined") {
                    isDisplayed = today >= config.activePeriodStart;
                }
                if (typeof config.activePeriodEnd != "undefined") {
                    var activePeriodEnd = new Date(config.activePeriodEnd);
                    activePeriodEnd.setDate(activePeriodEnd.getDate() + 1);
                    isDisplayed = today < activePeriodEnd;
                }
                // Check if cookies has been set
                isDisplayed = !cookiesSet(config);
            }
            // Handle display frequency
            if (isDisplayed || forceDisplay) {
                if (!config.containerAdded) {
                    if (!config.container) {
                        config.container = build(config);
                    }
                    document.body.appendChild(config.container);
                    config.containerAdded = true;
                }
                if (!forceDisplay) setCookies(config);
                var container = getContainer(index);
                var wrapper = getWrapper(index);
                var backdrop = getBackdrop(index);
                if (container) {
                    container.style.display = "block";
                }
                if (backdrop) {
                    backdrop.style.display = "block";
                    backdrop.style.width = getDocumentWidth() + "px";
                    backdrop.style.height = getDocumentHeight() + "px";
                }

                if (wrapper) {
                    // Display
                    wrapper.style.display = "block";
                    config.state = "invite";
                    var x, y;
                    var availableWidth = document.documentElement.clientWidth || document.body.clientWidth;
                    var availableHeight = document.documentElement.clientHeight || document.body.clientHeight;
                    var width = config.width;
                    if (typeof width == "string") {
                        wrapper.style.width = width;
                    }
                    else {
                        wrapper.style.width = width + "px";
                    }
                    if (typeof config.height != "undefined") {
                        if (typeof config.height == "string") {
                            wrapper.style.height = config.height;
                        }
                        else {
                            wrapper.style.height = config.height + "px";
                        }
                    }

                    var placementFunction = function () {
                        wrapper.className = wrapper.className.replace(getClassName("state-hidden", index), "");
                        wrapper.className += " " + getClassName("state-displayed", index);
                        if (typeof config.top == "string") {
                            if (config.top.indexOf("%") != -1) {
                                y = availableHeight * parseFloat(config.top.replace("%", "")) / 100.0;
                            }
                            else {
                                y = parseInt(config.top.replace("px", ""));
                            }
                        }
                        else {
                            y = config.top;
                        }
                        if (typeof config.left == "string") {
                            if (config.left.indexOf("%") != -1) {
                                x = availableWidth * parseFloat(config.left.replace("%", "")) / 100.0;
                            }
                            else {
                                x = parseInt(config.left.replace("px", ""));
                            }
                        }
                        else {
                            x = config.left;
                        }
                        x = getScrollLeft() + Math.max(Math.min(x - Math.round(wrapper.clientWidth / 2.0), availableWidth - wrapper.clientWidth), 0);
                        y = getScrollTop() + Math.max(Math.min(y - Math.round(wrapper.clientHeight / 2.0), availableHeight - wrapper.clientHeight), 0);
                        wrapper.style.top = y + "px";
                        wrapper.style.left = x + "px";
                        // Store position
                        config.position = {};
                        config.position.x = x;
                        config.position.y = y;
                        if (callback) {
                            callback();
                        }
                    };
                    if (config.theme.showAnimation.type == "none") {
                        placementFunction(); // Then we can call directly
                    }
                    else {
                        // Use timeout to allow element to be rendered due to animation (Safari etc)
                        setTimeout(placementFunction, config.theme.showAnimation.duration + 100);
                    }
                }
            }
        },
        standardConfig: function (pTitle, pText, pUrl, pParticipateButtonText, pDeclineButtonText) {
            return {
                title: pTitle,
                text: pText,
                buttons: [{ type: "participate", text: pParticipateButtonText, url: pUrl }, { type: "decline", text: pDeclineButtonText }]
            }
        },
        create: function (url, config, theme) {
            var lConfig, lUrl, lTheme;
            // Backward compat handling
            if (typeof url === "string") {
                // Then assume url passed as first parameter
                lUrl = url;
                lConfig = config;
                lTheme = theme;
            }
            else {
                // Then assume only config (and theme passed)
                lConfig = url;
                lTheme = config;
            }
            if (typeof lTheme != "undefined") {
                // Allow passing theme as a separate parameter
                config.theme = lTheme;
            }
            // Set the url of participate buttons if not already set
            if (lUrl) {
                if (lConfig.buttons) {
                    for (var i = 0; i < lConfig.buttons.length; i++) {
                        var button = lConfig.buttons[i];
                        if (button.type == "participate") {
                            if (!button.url) {
                                button.url = lUrl;
                            }
                        }
                    }
                }
            }
            lConfig.index = FConfigs.length;
            FConfigs.push(lConfig);
            questback.popup.init(lConfig);
            if (isListenerMode()) {
                // Render listener mode
                renderPendingSurveyListenerPage(config);
                // Try to focus the opener tab
                window.opener.focus();
                // Start checking domain change
                startCheckDomainChange();
            }
            else {
                if (lConfig.autoDisplay !== false) {
                    var delay = lConfig.delay > 0 ? lConfig.delay * 1000 : 500; // min 500
                    setTimeout(function () { questback.popup.show(lConfig.index); }, delay);
                }
            }
        }
    }
}();
