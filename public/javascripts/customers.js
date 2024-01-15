/*

THIS PAGE PROCESSES ALL NECESSARY DATA WHICH CORRESPONDS TO CUSTOMER.

*/



const customerSelectField = document.querySelector("#select-customer")
const customerSelectCustom = document.querySelector("#search_customer_field")


const createSelectChild=(value,ID)=>{
let child = document.createElement("option")
child.innerText=value
child.setAttribute("value",ID)
return child
}
const loadCustomerList = () => {
    
    $.ajax({
        url:"/get-customer-list",
        method: "post",
        async:true,
        data: {
            start:0
        },
        
        success: function (data) {             
                customerList = data
                customerList.forEach((customer) => {
                    customerSelectField.appendChild(createSelectChild(customer.DisplayName, customer.Id))

                })
                $('#select-customer').selectpicker('refresh');

                // Intialize the Select Picker for searching 
            
        },
        error:function(error){
            console.log(error)
           
        }
    })
    
}




const searchFunctionAutocomplete = () => {
    const selectInputCustomer = document.querySelector("#search_customer_field .bootstrap-select .bs-searchbox input")
    // selectInputCustomer.addEventListener("keyup", function () {
    //     console.log(selectInputCustomer.value)
    // })
}
customerSelectCustom.addEventListener("click", searchFunctionAutocomplete)

// Load Customers
loadCustomerList();