const customFieldLabel = document.querySelector("#load_type")
const fetchOrderDetails = (order_id) => {
    let payload = {
        "order_id": order_id
    }
    $.ajax({
        url: "/fetch-order",
        method: "POST",
        data: payload,
        success: function (data) {
            body = data.data
            if (!body.success) {
                showToastMessage("error", "Server Error, Please contact the administration.")
            }
            else {
                let order_details = body.orders[0].data
                additionOrderObject = order_details
                console.log(order_details)
                document.querySelector("#price").value = order_details.customField5
                document.querySelector("#display_order_id").innerText = order_details.orderNo
                if(order_details.customField1 !== ""){
                    document.querySelector("#quantity").value = order_details.customField1
                    customFieldLabel.innerText = "( "+ CustomFieldValue.customfield1 + " )"
                    

                }
                else if(order_details.customField2 !== ""){
                    document.querySelector("#quantity").value = order_details.customField2
                    customFieldLabel.innerText =  "( "+CustomFieldValue.customfield2  + " )"

                }
                else if(order_details.customField3 !== ""){
                    document.querySelector("#quantity").value = order_details.customField3
                    customFieldLabel.innerText =  "( "+CustomFieldValue.customfield3  + " )"

                }else if(order_details.customField4 !== ""){
                    document.querySelector("#quantity").value = order_details.customField4
                    customFieldLabel.innerText = "( "+CustomFieldValue.customfield4  + " )"

                }
            }


        },
        error: function (err) {
            showToastMessage("error", "Server Error, Please contact the administration.")
        }
    })

}
const checkOrderStatus = (event) => {
    event.preventDefault()
    let order_id = document.querySelector("#order_id").value
    if (!order_id) {
        // show toast
        showToastMessage("error", "Order Field cannot be empty")
    }
    let payload = {
        "order_id": order_id
    }
    $.ajax({
        url: '/check-order-status',
        method: 'POST',
        data: payload,
        success: function (response) {
            // Get order completion details 
            order = response.data.orders[0]

            if (!order.success) {
                //show toast
                showToastMessage("errror", order.message)
            }
            else {
                // Order Found, now checking its status
                orderDeliveredStatus = order.data.status

                if (orderDeliveredStatus === 'success') {
                    console.log(order.data)
                    document.querySelector("#delivery_note").value = order.data.form.note
                    //Order is Delivered 
                    showToastMessage("success", "Order has been loaded")
                    generateInvoiceButton.removeAttribute('disabled')
                    //Fetch ActualOrder Details
                    fetchOrderDetails(order.orderNo)
                    orderObject = order.data

                }
                else {
                    showToastMessage("error", "Order not yet completed")

                }
                // Store its details into local varaiable

            }
        }
    })

}



const fetchOrderButton = document.querySelector("#fetch_order")
fetchOrderButton.addEventListener("click", checkOrderStatus)

