
// Invoice Generation flow.
const InvoiceGenerationController = (event) => {

    event.preventDefault();
    // Getting  All Details to post to server. 
    product_name = document.querySelector("#select-product").options[document.querySelector("#select-product").selectedIndex].text;
    let product_value = document.querySelector("#select-product").value;
    let Customer = document.querySelector("#select-customer").value
    let Product = {
        "name": product_name,
        "value": product_value
    }
    let orderField = document.querySelector('#order_id').value
    let Quantity = document.querySelector("#quantity").value;
    let Price = document.querySelector("#price").value;
    let Order = orderObject;
    if (orderField === "") {
        showToastMessage("error", "Order is not Fetched.");

        return false
    }
    if (Customer === "Select Customer") {
        showToastMessage("error", "Please Select a Customer.")

        return false
    }
    if (Product.name === "Select Product") {
        showToastMessage("error", "Please Select a Product.")
        return false
    }
    if (Quantity === "") {
        showToastMessage("error", "Please add Quantity.");
        return false
    }
    if (Price === "") {
        showToastMessage("error", "Please add a Price.");
        return false
    }


    //Creating Invoice Body 
    let invoiceBody = {
        Order,
        Customer,
        Product,
        Quantity,
        Price,
        additionOrderObject

    }

    $("body").append(
        '<div id="loading_screen" style="position:absolute;top:50%;left:50%;height:100%;width:100%;z-index:999;transform:translate(-50px,-50px);"><img src ="//upload.wikimedia.org/wikipedia/commons/4/4c/Android_style_loader.gif" style="width:100px; margin :0px auto"></div>'
    );

    $.ajax({
        url: "/generate-invoice",
        method: "POST",
        data: invoiceBody,
        success: function (data) {

            console.log(data)
            if (data.successMessage) {
                showToastMessage("success", data.successMessage)
                document.querySelector("#invoice-form").reset()
                $('#select-customer').selectpicker("refresh");
                $('#select-product').selectpicker("refresh");
                document.querySelector("#display_order_id").innerText = ""
                document.querySelector("#delivery_note").innerText = ""
                preventInvoiceGeneration();

            }
        },
        error: function (err, textStatus, errorThrown) {
            if (err.responseJSON.error !== undefined) {
                showToastMessage("error", err.responseJSON.error)
            }
            else {
                showToastMessage("error", "Server Error, Please contact the administration.")
            }


        }
    })




}


generateInvoiceButton.addEventListener("click", InvoiceGenerationController)

