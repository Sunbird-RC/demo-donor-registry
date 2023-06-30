<#macro registrationLayout bodyClass="" displayInfo=false displayMessage=true>
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
            "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">

    <head>
        <meta charset="utf-8">
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <meta name="robots" content="noindex, nofollow">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css"
                integrity="sha384-GLhlTQ8iRABdZLl6O3oVMWSktQOp6b7In1Zl3/Jr59b6EGGoI1aFkw7cmDA6j6gD"
                crossorigin="anonymous">
        <link rel="stylesheet" href=""/>
        <link href="${url.resourcesPath}/img/favicon.ico" rel="shortcut icon"/>
        <script src="https://code.jquery.com/jquery-3.6.3.slim.min.js"
                integrity="sha256-ZwqZIVdD3iXNyGHbSYdsmWP//UBokj2FHAxKuSBKDSo="
                crossorigin="anonymous"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js"
                integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q"
                crossorigin="anonymous"></script>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js" integrity="sha384-w76AqPfDkMBDXo30jS1Sgez6pr3x5MlQ1ZAGC+nuZB+EYdgRZgiwxhTBTkF7CXvN" crossorigin="anonymous"></script>
        <title><#nested "title"></title>
        <#if properties.styles?has_content>
            <#list properties.styles?split(' ') as style>
                <link href="${url.resourcesPath}/${style}" rel="stylesheet"/>
            </#list>
        </#if>
    </head>

    <body>
    <#if properties.showBanner = "true">
    <div class="banner">
        <span></span>
        <span>This is a demo of the ${properties.portalTitle!} Portal. Check documentation <a href="https://docs.sunbirdrc.dev/">here</a></span>
        <img src="${url.resourcesPath}/img/theme-icon.svg" alt="">
    </div>
    </#if>
    <nav class="navbar navbar-expand-lg navbar-light">
        <a class="navbar-brand" href="${properties.homepageUrl!}">
            <#if properties.keycloakLogo = "NA">
                <img src="${url.resourcesPath}/img/ndearLogo.svg" alt="" width="88%" height="auto">
            <#else>
                <img src="${properties.keycloakLogo!}" alt="" width="88%" height="auto">
            </#if>


        </a>

    </nav>
    <#nested "header">
    <div class="container-fluid ndear-wrapper">
        <div class="form-wrapper">
            <div class="ndear-login-wrapper container-wrapper">
                <#nested "form">
            </div>
        </div>
    </div>
    <#if properties.showFooter = "true">
    <footer class="footer">
        <span>Sunbird RC</span>
        <div>
            <a href=""><img src="${url.resourcesPath}/img/twitter.svg" alt=""></a>
            <a href=""><img src="${url.resourcesPath}/img/facebook.svg" alt=""></a>
            <a href=""><img src="${url.resourcesPath}/img/youtube.svg" alt=""></a>
        </div>
    </footer>
    </#if>
    </body>
    </html>
</#macro>
