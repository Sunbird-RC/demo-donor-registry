<#import "template.ftl" as layout>
<@layout.registrationLayout displayInfo=social.displayInfo; section>
    <#if section = "title">
        ${msg("loginTitle",(realm.displayName!''))}
    <#elseif section = "header">
        <link href="https://fonts.googleapis.com/css?family=Muli" rel="stylesheet"/>
        <link href="${url.resourcesPath}/img/favicon.png" rel="icon"/>
        <script>
            window.onload = function (e) {
                document.getElementById("mobile_number").addEventListener("change", function (evt) {
                    console.log(evt.target.value)
                    sessionStorage.setItem("mobile_number", evt.target.value)
                })
                if(window.location.protocol === "https:") {
                    let formField = document.getElementById("kc-form-login");
                    if (formField) {
                        formField.action = formField.action.replace("http:","https:");
                    }
                }
            }
        </script>
    <#elseif section = "form">
        <div class="ndear-login-card-wrapper">
            <h3>Pledger Login</h3>
            <br/>
            <b>Enter ABHA number/mobile number</b>
            <div class="box-container">
                <#if realm.password>
                    <div>
                        <form id="kc-form-login" class="form" onsubmit="login.disabled = true; return true;"
                              action="${url.loginAction}" method="post">
                            <div class="input-wrapper">
                                <div class="input-field mobile">
                                    <input id="mobile_number" class="login-field" placeholder="XXXXXXXXXX"
                                           type="text"
                                           name="mobile_number"
                                           pattern="[0-9]+"
                                           onchange="try{setCustomValidity('')}catch(e){}"
                                           oninput="try{setCustomValidity('')}catch(e){}"
                                           oninvalid="try{setCustomValidity('Please enter valid ABHA/Mobile number')}catch(e){}"
                                           tabindex="1"/>
                                </div>

                            </div>
                            <#if message?? && (message.summary)??>
                                <div id="kc-error-message">
                                    <p class="instruction">${message.summary}</p>
                                </div>
                            <#else>
                                <div></div>
                            </#if>
                            <input type="hidden" id="type-hidden-input" name="form_type" value="login" />
                            <button id="submit-btn" class="submit" type="submit" tabindex="3">
                                <span>Continue</span>
                            </button>
                        </form>
                    </div>
                    <div class="text-center mt-3">
                        <a href="${properties.registerUrl}">Not Registered as Pledger? Register here</a>
                    </div>
                    <div class="text-center mt-3">
                        <span>Forgot your ABHA? Click <a href="${properties.forgotAbha}" target="_blank">here</a> to know your ABHA</span>
                    </div>
                </#if>
            </div>
        </div>
    </#if>
</@layout.registrationLayout>
