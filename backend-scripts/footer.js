import * as analytics from "./analytics";
import * as constants from "./constants";

function attachCCPAFormListener() {
    const ccpaSubmitBtn = document.getElementById('wpforms-submit-custom');
    const wpformsForm= document.getElementById('wpforms-form-459');
    if(wpformsForm){
        wpformsForm.addEventListener('submit', function (e) {
            e.preventDefault();
        });
    }

    function validateEmail(email){
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }


    if (ccpaSubmitBtn) {
        ccpaSubmitBtn.addEventListener('click', function (e) {
            // e.preventDefault();
            console.log('ccpaSubmitBtn clicked');
            const firstname = document.querySelector('.firstname')?.value.trim() || '';
            const lastname = document.querySelector('.lastname')?.value.trim() || '';
            const email = document.querySelector('.email')?.value.trim() || '';
            const requestType = document.querySelector('.request-type')?.value.trim() || '';
            const requestDetails = document.querySelector('.request-details')?.value.trim() || '';
            const agreeCheckBox = document.querySelector("#wpforms-459-field_9_1").checked;
            
            if(!(agreeCheckBox && firstname && lastname && email && requestType && requestDetails)){
                showErrorPopup("Please fill all the fields.");
                return;
            }
            if(!validateEmail(email)){
                showErrorPopup("Please enter a valid email address.");
                return;
            }
            const eventData = {
                [constants.eventDimensions.elac]: requestType,
                [constants.eventDimensions.eltg]: requestDetails
            };
            analytics.fireEvent(constants.eventNames.ccpaSubmit, eventData);
            console.log('eventData', firstname, lastname, email, requestType, requestDetails);

            const formData = new FormData();
            
            formData.append('fname', firstname);
            formData.append('lname', lastname);
            formData.append('email', email);
            formData.append('requesttype', requestType);
            formData.append('description', requestDetails);
            const host = LANDER_DOMAIN;
            fetch(`https://${host}/backend/api/ccpa/`, {
                method: 'POST',
                body: formData
            }).then(response=>{
                console.log("response", response);
                if(response.ok){
                    document.querySelector('.firstname').value = '';
                    document.querySelector('.lastname').value = '';
                    document.querySelector('.email').value = '';
                    document.querySelector('.request-type').value = '';
                    document.querySelector('.request-details').value = '';
                    document.querySelector('#wpforms-459-field_9_1').checked = false;
                    showSuccessPopup();
                }else{
                    console.log('error occurred while submitting ccpa form');
                    showErrorPopup();
                }
            });
        });
    }
}

function showSuccessPopup(){
    
    const successPopup = document.getElementById('successPopup');
    successPopup.classList.remove('popShow');
                    setTimeout(()=>{
                        successPopup.classList.add('popShow');
                    }, 4000);
                }

function showErrorPopup(text){
    const errorPopup = document.getElementById('errorPopup');
    if(text){
        const errorText = errorPopup.querySelector('.error-text');
        errorText.textContent = text;
    }
    errorPopup.classList.remove('popShow');
    setTimeout(()=>{
        errorPopup.classList.add('popShow');
    }, 4000);
}


function init() {
    document.addEventListener("DOMContentLoaded", () => {
        analytics.attachDynamicEeventListener();
        attachCCPAFormListener();
    });
}

init();