// necessary declaration
let invoiceDetails = {}
let orderObject= {}
const generateInvoiceButton = document.querySelector("#generate-invoice")



// Boilerplate to show Toast messages
const showToastMessage=(type,message)=>{
if(type==='success'){
    $('#push-message').toast('show')
    $("#push-message .toast-header").css("color","black")
        $("#push-message .toast-header strong #msg-head").text(" Success")
        $("#push-message .toast-body #msg-body").text(message)
        $("#push-message .toast-header").css("background-color","green")
}
else{
    $('#push-message').toast('show')
    $("#push-message .toast-header").css("color","black")
        $("#push-message .toast-header strong #msg-head").text(" Error")
        $("#push-message .toast-body #msg-body").text(message)
        $("#push-message .toast-header").css("background-color","#FF7F7F")
}
}

//Prevent the Invoice from Submitting
const preventInvoiceGeneration=()=>{
generateInvoiceButton.setAttribute("disabled","")
}
// Check if QBO is authenticated. if 
$.ajax({
    method: "get",
    url: "/check-qbo-connection",
    async: true,
    success: function (data) {
        console.log(data.success)
        if (data.success === false) {
            window.location = '/connect-qbo'
        }
    }
    
})

