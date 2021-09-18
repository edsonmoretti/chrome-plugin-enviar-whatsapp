let debug = true;
let running = false;
let exibiuInfos = false;
console.log('run');
const pageHeaderInterval = setInterval(() => {
    const header = document.querySelector("header");
    if (header) {
        clearInterval(pageHeaderInterval);
        let wasend_api_url = "";
        let wasend_api_token = "";
        let wasend_telephone = "";
        let wasend_checkemail = false;
        let browser = chrome || browser;
        browser.storage.sync.get({
            wasend_api_url: '',
            wasend_api_token: '',
            wasend_telephone: '',
            wasend_checkemail: false
        }, function (items) {
            if (debug) {
                console.log('Function Itens');
                console.log(items);
            }
            wasend_api_url = items.wasend_api_url;
            wasend_api_token = items.wasend_api_token;
            wasend_telephone = items.wasend_telephone;
            wasend_checkemail = items.wasend_checkemail;
        });

        const requestToApiInterval = setInterval(() => {
                let METHOD = 'POST';//'GET';
                if (debug) {
                    if (!exibiuInfos) {
                        exibiuInfos = true;
                        console.log('browser:')
                        console.log(browser)
                        console.log('API URL: ' + wasend_api_url);
                        console.log('API Token: ' + wasend_api_token);
                        console.log('API Tel: ' + wasend_telephone);
                        console.log('API checkEmail: ' + wasend_checkemail);
                    }
                    console.log(running);
                }
                if (!running) {
                    running = true;
                    if (debug) {
                        console.log('Checar e-mail = ' + wasend_checkemail);
                    }
                    let apiURL = wasend_api_url + (wasend_api_url.endsWith('/') ? '' : '/') + wasend_api_token + '/' + wasend_telephone;
                    if (wasend_checkemail) {
                        let apiURLCheckEmail = wasend_api_url + (wasend_api_url.endsWith('/') ? '' : '/') + wasend_api_token + '/' + wasend_telephone + "/checkemail";
                        if (debug) {
                            console.log(apiURLCheckEmail);
                        }
                        let request = new XMLHttpRequest();
                        request.open(METHOD, apiURLCheckEmail);
                        request.responseType = 'json';
                        try {
                            request.send();
                        } catch (e) {
                            if (debug) {
                                console.log('Error');
                                console.log(e);
                            }
                        }
                        request.onload = function () {
                            if (debug) {
                                if (request.response.error) {
                                    console.log('Error: ' + request.response.error.message);
                                } else {
                                    console.log('E-mail checked');
                                }
                            }
                        }
                    }
                    let request = new XMLHttpRequest();
                    request.open(METHOD, apiURL);
                    request.responseType = 'json';
                    try {
                        if (debug) {
                            console.log('Checando mensagens... ' + METHOD + ': ' + apiURL)
                        }
                        running = false;
                        if (debug) {
                            console.log('Running = false')
                        }
                        request.send();
                        running = true;
                        if (debug) {
                            console.log('Running = true')
                        }
                        console.log('OK! request.send();');
                    } catch (e) {
                        if (debug) {
                            console.log('Error');
                            console.log(e);
                        }
                        running = false;
                        return;
                    }
                    //Aqui acho que fica melhor recarregar a página, geraldo devido a erro no request.open()
                    if(!running){
                        window.location.reload();
                    }
                    if (running) {
                        request.onload = function () {
                            try {
                                if (debug) {
                                    console.log('OnLoad function...')
                                }
                                if (request.response.error) {
                                    if (debug) {
                                        console.log('Error: ' + request.response.error.message);
                                    }
                                    running = false;
                                    return;
                                }

                                let messages = request.response.messages;
                                let indexActualMessage = 0;
                                let contErrorActualMessage = 0;
                                if (debug) {
                                    console.log('Total de mensagens: ' + messages.length);
                                }
                                if (messages.length > 0) {
                                    sendMessage(indexActualMessage);
                                }

                                async function nextMessage() {
                                    indexActualMessage++;
                                    if (indexActualMessage < messages.length) {
                                        sendMessage(indexActualMessage);
                                    }
                                }

                                async function sendMessage(indexActualMessage) {
                                    let messageObj = messages[indexActualMessage];
                                    if (debug) {
                                        console.log('Mensagem atual: ');
                                        console.log(messageObj);
                                    }
                                    if (!messageObj) {
                                        running = false;
                                        return;
                                    }
                                    let dataMessage = new Date(messageObj.created_at);
                                    dataMessage.setHours(0, 0, 0, 0)
                                    let hoje = new Date();
                                    hoje.setHours(0, 0, 0, 0);
                                    if (dataMessage.toDateString() == hoje.toDateString()) {
                                        let telephone = messageObj.to;
                                        let uuid = messageObj.uuid;
                                        // message = uuid + '\n' + message;
                                        let linkToWANumber = document.createElement("a");
                                        telephone = telephone.replace(/[^0-9]/g, '');
                                        if (!telephone.startsWith('55')) {
                                            telephone = '55' + telephone;
                                        }
                                        if (telephone.length != 13) {
                                            if (debug) {
                                                console.log('Número inválido (tamanho): ' + telephone);
                                                console.log('Indo para próxima mensagem');
                                            }
                                            nextMessage();
                                            return;
                                        }
                                        linkToWANumber.href = 'whatsapp://send?phone=' + telephone;
                                        linkToWANumber.id = 'whatsapp' + telephone;
                                        header.appendChild(linkToWANumber);
                                        linkToWANumber.click();
                                        // console.log('clicou no link');
                                        await setTimeout(await async function () {
                                            if (debug) {
                                                console.log('Entrou no número. Checando se é WA Válido')
                                            }
                                            if (!await isWANumberValidAfterNumberLinkClick()) {
                                                let apiURLInv = wasend_api_url + (wasend_api_url.endsWith('/') ? '' : '/') + wasend_api_token + '/' + wasend_telephone + '/setinvalidnumber/' + uuid;
                                                let requestInv = new XMLHttpRequest();
                                                requestInv.open(METHOD, apiURLInv);
                                                requestInv.responseType = 'json';
                                                requestInv.send();
                                                nextMessage();
                                                return;
                                            }
                                            let messageBox = document.querySelectorAll("[contenteditable='true']")[1];
                                            if (!messageBox && contErrorActualMessage < 5) {
                                                contErrorActualMessage++;
                                                sendMessage(indexActualMessage);
                                                return;
                                            } else {
                                                contErrorActualMessage = 0;
                                            }

                                            event = document.createEvent("UIEvents");
                                            messageBox.innerHTML = messageObj.message.replace(/ /gm, ' '); // test it
                                            event.initUIEvent("input", true, true, window, 1);
                                            messageBox.dispatchEvent(event);
                                            eventFire(document.querySelector('span[data-icon="send"]'), 'click');


                                            await checkReceivedImmediatelyAndUpdateStatus(messageObj);

                                            let checkReceivedImmediatelyAndUpdateStatusAgain = false

                                            async function checkReceivedImmediatelyAndUpdateStatus(messageObj) {
                                                if (debug) {
                                                    console.log('Atualizar status');
                                                }
                                                await setTimeout(await function () {

                                                    let querySelectorResult = document.querySelectorAll('span[data-icon="msg-check"],span[data-icon="msg-dblcheck"],span[data-icon="msg-time"]');
                                                    let lastCheckSendElement = querySelectorResult[querySelectorResult.length - 1];
                                                    if (lastCheckSendElement) {
                                                        setTimeout(function () {
                                                            let status = lastCheckSendElement.getAttribute("aria-label").trim().toUpperCase();
                                                            let lastMessage = lastCheckSendElement.parentElement.parentElement.parentElement.parentElement.innerText.trim();
                                                            let updateStatus = false;
                                                            if (lastMessage
                                                                &&
                                                                lastMessage.toLowerCase().includes(messageObj.message.toLowerCase())) {
                                                                switch (status) {
                                                                    case 'ENTREGUE':
                                                                        status = 'DELIVERED';
                                                                        updateStatus = true;
                                                                        break;
                                                                    case 'ENVIADA':
                                                                        status = 'SENT';
                                                                        updateStatus = true;
                                                                        break;
                                                                    case 'LIDA':
                                                                        status = 'READ';
                                                                        updateStatus = true;
                                                                        break;
                                                                    case 'PEDENTE':
                                                                        status = 'PENDING';
                                                                        updateStatus = true;
                                                                        if (checkReceivedImmediatelyAndUpdateStatusAgain) {
                                                                            if (debug) {
                                                                                console.log('checando de novo');
                                                                            }
                                                                            checkReceivedImmediatelyAndUpdateStatusAgain = false;
                                                                            checkReceivedImmediatelyAndUpdateStatus();
                                                                        }
                                                                        break;
                                                                    default:
                                                                        status = 'SENT';
                                                                        updateStatus = true;
                                                                }
                                                            } else {
                                                                status = 'SENT_NOT_CHECKED';
                                                                updateStatus = true;
                                                                if (debug) {
                                                                    console.log('------------');
                                                                    console.log('else');
                                                                    console.log(querySelectorResult);
                                                                    console.log(lastCheckSendElement);
                                                                    console.log(lastMessage);
                                                                    console.log(lastMessage.toLowerCase());
                                                                    console.log(messageObj.message.toLowerCase());
                                                                    console.log(lastMessage.toLowerCase().includes(messageObj.message.toLowerCase()));
                                                                    console.log(lastMessage && lastMessage.toLowerCase().includes(messageObj.message.toLowerCase()))
                                                                    console.log('------------');
                                                                }
                                                            }

                                                            //UPDATE STATUS
                                                            if (updateStatus) {
                                                                if (debug) {
                                                                    console.log('Atualizando status: ' + status);
                                                                }
                                                                let apiURLUpdate = wasend_api_url + (wasend_api_url.endsWith('/') ? '' : '/')
                                                                    + wasend_api_token + '/' + wasend_telephone + '/updatestatus/'
                                                                    + uuid + '/'
                                                                    + status;
                                                                let requestUp = new XMLHttpRequest();
                                                                requestUp.open(METHOD, apiURLUpdate);
                                                                requestUp.responseType = 'json';
                                                                requestUp.send();
                                                            }
                                                        }, 5000);
                                                    }
                                                }, 1000);
                                            }

                                            linkToWANumber.remove();
                                            nextMessage();
                                        }, 3000);
                                    } else {
                                        if (debug) {
                                            console.log('Data da Mesagem não é igual a de hoje. Pular...');
                                            console.log('Hoje: ' + hoje);
                                            console.log('Data Mensagem: ' + dataMessage);
                                        }
                                    }
                                }

                                function eventFire(element, elementType) {
                                    let MyEvent = document.createEvent("MouseEvents");
                                    MyEvent.initMouseEvent
                                    (elementType, true,
                                        true, window,
                                        0,
                                        0,
                                        0,
                                        0,
                                        0,
                                        false,
                                        false,
                                        false,
                                        false,
                                        0,
                                        null);
                                    element.dispatchEvent(MyEvent);
                                }

                                async function isWANumberValidAfterNumberLinkClick() {
                                    // console.log('Checando se eh valido.')
                                    res = []
                                    elems = [...document.getElementsByTagName('div')];
                                    elems.forEach((elem) => {
                                        if (elem.innerHTML.includes('url é inválido')) {
                                            if (elem.querySelector('[role="button"]')) {
                                                elem.querySelector('[role="button"]').click();
                                            }
                                            res.push(elem)
                                        }
                                    })
                                    //Se nao achou o texto a cima, é true, se achou eh false.
                                    return res.length <= 0;
                                }
                            } finally {
                                running = false;
                            }
                        }
                    }
                }
            },
            10000
        );
    }
}, 5000);


