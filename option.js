function saveOptions(e) {
    e.preventDefault();
    let browser = chrome || browser;

    browser.storage.sync.set({
        wasend_api_url: document.querySelector("#api_url").value,
        wasend_api_token: document.querySelector("#api_token").value,
        wasend_telephone: document.querySelector("#telephone").value,
        wasend_checkemail: document.querySelector("#checkemail").checked
    }, function() {
        // Update status to let user know options were saved.
        var status = document.getElementById('status');
        status.textContent = 'Configuracão Salva. Atualize a página do WhatsApp Web';
        setTimeout(function() {
            status.textContent = '';
        }, 750);
    });

    browser.storage.sync.set({
        wasend_api_url: document.querySelector("#api_url").value,
        wasend_api_token: document.querySelector("#api_token").value,
        wasend_telephone: document.querySelector("#telephone").value,
        wasend_checkemail: document.querySelector("#checkemail").checked
    });
}

function restoreOptions() {

    function setCurrentChoice(result) {
        document.querySelector("#api_url").value = result.color || "";
        document.querySelector("#api_token").value = result.color || "";
        document.querySelector("#telephone").value = result.color || "";
        document.querySelector("#checkemail").checked = result.color || true;
    }

    function onError(error) {
        console.log(`Error: ${error}`);
    }
    let browser = chrome || browser;

    browser.storage.sync.get({
        wasend_api_url: '',
        wasend_api_token: '',
        wasend_telephone: '',
        wasend_checkemail: false
    }, function(items) {
        document.getElementById('api_url').value = items.wasend_api_url;
        document.getElementById('api_token').value = items.wasend_api_token;
        document.getElementById('telephone').value = items.wasend_telephone;
        document.getElementById('checkemail').checked = items.wasend_checkemail;
    });

    let api_url = browser.storage.sync.get("api_url");
    let api_token = browser.storage.sync.get("api_token");
    let telephone = browser.storage.sync.get("telephone");
    let checkemail = browser.storage.sync.get("checkemail");

    api_url.then(setCurrentChoice, onError);
    api_token.then(setCurrentChoice, onError);
    telephone.then(setCurrentChoice, onError);
    checkemail.then(setCurrentChoice, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);